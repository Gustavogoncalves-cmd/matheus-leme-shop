const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const Order = require('../models/Order');
const { authenticate } = require('../middleware/auth');
const { getClient, validateWebhookSignature, getPaymentStatus, createPreference } = require('../config/payment');

/**
 * @swagger
 * /api/payments/create-preference:
 *   post:
 *     summary: Create MercadoPago payment preference
 *     description: Create a payment preference for MercadoPago checkout
 *     tags:
 *       - Payments
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *               - cartItems
 *               - customerInfo
 *             properties:
 *               orderId:
 *                 type: integer
 *               cartItems:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     product_id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     description:
 *                       type: string
 *                     image_url:
 *                       type: string
 *                     quantity:
 *                       type: integer
 *                     price:
 *                       type: number
 *               customerInfo:
 *                 type: object
 *                 properties:
 *                   firstName:
 *                     type: string
 *                   email:
 *                     type: string
 *                   phone:
 *                     type: string
 *                   street:
 *                     type: string
 *                   streetNumber:
 *                     type: string
 *                   zipCode:
 *                     type: string
 *     responses:
 *       201:
 *         description: Payment preference created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     preference_id:
 *                       type: string
 *                     init_point:
 *                       type: string
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Cannot create preference for other user's order
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 */
router.post('/create-preference', authenticate, async (req, res) => {
  try {
    const { orderId, cartItems, customerInfo } = req.body;

    // Validation
    if (!orderId) {
      return res.status(400).json({
        success: false,
        error: 'orderId is required',
      });
    }

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'cartItems is required',
      });
    }

    if (!customerInfo) {
      return res.status(400).json({
        success: false,
        error: 'customerInfo is required',
      });
    }

    // Verify order exists and belongs to user
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found',
      });
    }

    if (order.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized to create preference for this order',
      });
    }

    // Build preference items
    const preferenceItems = cartItems.map(item => ({
      id: item.product_id,
      title: item.name,
      description: item.description,
      picture_url: item.image_url,
      category_id: 'products',
      quantity: item.quantity,
      unit_price: parseFloat(item.price),
    }));

    // Create preference object
    const preference = {
      items: preferenceItems,
      payer: {
        name: customerInfo.firstName || customerInfo.name || 'Customer',
        email: customerInfo.email || req.user.email,
        phone: {
          area_code: customerInfo.areaCode || '11',
          number: customerInfo.phone || '',
        },
        address: {
          street_name: customerInfo.street || '',
          street_number: customerInfo.streetNumber || '',
          zip_code: customerInfo.zipCode || '',
        },
      },
      back_urls: {
        success: `${process.env.FRONTEND_URL}/checkout/success`,
        failure: `${process.env.FRONTEND_URL}/checkout/failure`,
        pending: `${process.env.FRONTEND_URL}/checkout/pending`,
      },
      auto_return: 'approved',
      external_reference: `ORDER_${orderId}`,
      notification_url: `${process.env.WEBHOOK_URL}`,
      metadata: {
        orderId: orderId,
        userId: req.user.id,
      },
    };

    // Create preference in MercadoPago
    const createdPreference = await createPreference(preference);

    // Store preference ID in database
    await pool.query(
      `UPDATE orders SET mercadopago_preference_id = $1 WHERE id = $2`,
      [createdPreference.id, orderId]
    );

    res.status(201).json({
      success: true,
      data: {
        preference_id: createdPreference.id,
        init_point: createdPreference.init_point,
      },
    });
  } catch (error) {
    console.error('Error creating payment preference:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create payment preference',
      message: error.message,
    });
  }
});

/**
 * @swagger
 * /api/payments/webhook:
 *   post:
 *     summary: MercadoPago webhook handler
 *     description: Handle payment notifications from MercadoPago (no auth required)
 *     tags:
 *       - Payments
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [payment, plan, subscription, invoice]
 *               data:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *     responses:
 *       200:
 *         description: Webhook processed
 *       401:
 *         description: Invalid webhook signature
 */
router.post('/webhook', async (req, res) => {
  try {
    const xSignature = req.headers['x-signature'];
    const xRequestId = req.headers['x-request-id'];
    const requestBody = JSON.stringify(req.body);

    // Validate webhook signature
    if (!validateWebhookSignature(xSignature, req.body, xRequestId)) {
      console.warn('Invalid webhook signature received');
      return res.status(401).json({
        success: false,
        error: 'Invalid webhook signature',
      });
    }

    const { type, data } = req.body;

    // Only process payment notifications
    if (type !== 'payment') {
      return res.status(200).json({ success: true });
    }

    const paymentId = data.id;

    // Get payment details from MercadoPago
    const payment = await getPaymentStatus(paymentId);

    // Extract order ID from external reference
    const externalReference = payment.external_reference;
    const orderId = externalReference ? externalReference.replace('ORDER_', '') : null;

    if (!orderId) {
      console.warn(`No order ID found in external reference: ${externalReference}`);
      return res.status(200).json({ success: true });
    }

    // Get order
    const order = await Order.findById(orderId);
    if (!order) {
      console.warn(`Order not found: ${orderId}`);
      return res.status(200).json({ success: true });
    }

    // Handle payment status
    switch (payment.status) {
      case 'approved':
        // Payment approved - update order status
        await Order.updateStatus(orderId, 'paid');
        await pool.query(
          `UPDATE orders SET mercadopago_payment_id = $1, payment_method = $2 WHERE id = $3`,
          [paymentId, 'mercadopago', orderId]
        );

        // Clear user's cart
        await pool.query(
          'DELETE FROM cart WHERE user_id = $1',
          [order.user_id]
        );

        console.log(`Payment approved for order ${orderId}, payment ID: ${paymentId}`);
        break;

      case 'pending':
        await Order.updateStatus(orderId, 'pending_payment');
        console.log(`Payment pending for order ${orderId}, payment ID: ${paymentId}`);
        break;

      case 'rejected':
      case 'cancelled':
      case 'refunded':
      case 'charged_back':
        await Order.updateStatus(orderId, 'payment_failed');
        console.log(`Payment failed for order ${orderId}, payment ID: ${paymentId}, status: ${payment.status}`);
        break;

      default:
        console.log(`Unknown payment status for order ${orderId}: ${payment.status}`);
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    // Return 200 to prevent MercadoPago retry
    res.status(200).json({
      success: false,
      error: 'Webhook processing error',
      message: error.message,
    });
  }
});

/**
 * @swagger
 * /api/payments/status/{payment_id}:
 *   get:
 *     summary: Get payment status
 *     description: Get the status of a specific payment from MercadoPago
 *     tags:
 *       - Payments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: payment_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: MercadoPago payment ID
 *     responses:
 *       200:
 *         description: Payment status details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     status:
 *                       type: string
 *                     status_detail:
 *                       type: string
 *                     transaction_amount:
 *                       type: number
 *       400:
 *         description: Missing payment_id
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/status/:payment_id', authenticate, async (req, res) => {
  try {
    const { payment_id } = req.params;

    if (!payment_id) {
      return res.status(400).json({
        success: false,
        error: 'payment_id is required',
      });
    }

    const payment = await getPaymentStatus(payment_id);

    res.json({
      success: true,
      data: {
        id: payment.id,
        status: payment.status,
        status_detail: payment.status_detail,
        external_reference: payment.external_reference,
        transaction_amount: payment.transaction_amount,
        installments: payment.installments,
        payment_method_id: payment.payment_method_id,
        created_at: payment.date_created,
      },
    });
  } catch (error) {
    console.error('Error fetching payment status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch payment status',
      message: error.message,
    });
  }
});

module.exports = router;
