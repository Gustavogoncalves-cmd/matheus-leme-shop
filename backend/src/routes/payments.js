const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const Order = require('../models/Order');
const { authenticate } = require('../middleware/auth');
const {
  validateWebhookSignature,
  getPaymentStatus,
  createPreference,
} = require('../config/payment');

const PAYMENT_STATUS_TO_ORDER_STATUS = {
  approved: 'paid',
  pending: 'pending_payment',
  in_process: 'pending_payment',
  rejected: 'payment_failed',
  cancelled: 'payment_failed',
  refunded: 'refunded',
  charged_back: 'refunded',
};

const getOrderId = (externalReference) => {
  const match = /^ORDER_(\d+)$/.exec(String(externalReference || ''));
  return match ? Number(match[1]) : null;
};

router.post('/create-preference', authenticate, async (req, res) => {
  try {
    const orderId = Number(req.body.orderId);
    if (!Number.isInteger(orderId) || orderId <= 0) {
      return res.status(400).json({ success: false, error: 'A valid orderId is required' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    if (order.user_id !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Unauthorized to create preference for this order' });
    }
    if (order.status !== 'pending_payment') {
      return res.status(409).json({ success: false, error: 'Order is not awaiting payment' });
    }
    if (!order.items?.length) {
      return res.status(400).json({ success: false, error: 'Order has no items' });
    }

    const preference = {
      items: order.items.map(item => ({
        id: String(item.product_id),
        title: item.product_title || `Produto ${item.product_id}`,
        picture_url: item.thumbnail || undefined,
        category_id: 'digital_goods',
        quantity: Number(item.quantity),
        unit_price: Number(item.price),
        currency_id: 'BRL',
      })),
      payer: { email: req.user.email },
      back_urls: {
        success: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment-success`,
        failure: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment-cancel`,
        pending: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/orders`,
      },
      auto_return: 'approved',
      external_reference: `ORDER_${order.id}`,
      metadata: { order_id: order.id, user_id: req.user.id },
    };

    if (process.env.WEBHOOK_URL) {
      preference.notification_url = process.env.WEBHOOK_URL;
    }

    const createdPreference = await createPreference(preference);
    await pool.query(
      `UPDATE orders
       SET mercadopago_preference_id = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [createdPreference.id, order.id]
    );

    return res.status(201).json({
      success: true,
      data: {
        preference_id: createdPreference.id,
        init_point: createdPreference.init_point,
        sandbox_init_point: createdPreference.sandbox_init_point,
      },
    });
  } catch (error) {
    console.error('Error creating payment preference:', error);
    return res.status(500).json({ success: false, error: 'Failed to create payment preference' });
  }
});

router.post('/webhook', async (req, res) => {
  const xSignature = req.headers['x-signature'];
  const xRequestId = req.headers['x-request-id'];

  if (!validateWebhookSignature(xSignature, req.body, xRequestId)) {
    return res.status(401).json({ success: false, error: 'Invalid webhook signature' });
  }

  if (req.body?.type !== 'payment') {
    return res.status(200).json({ success: true, ignored: true });
  }

  try {
    const paymentId = String(req.body?.data?.id || '');
    const payment = await getPaymentStatus(paymentId);
    const orderId = getOrderId(payment.external_reference);
    const nextStatus = PAYMENT_STATUS_TO_ORDER_STATUS[payment.status];

    if (!orderId || !nextStatus) {
      return res.status(200).json({ success: true, ignored: true });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(200).json({ success: true, ignored: true });
    }

    const paymentAmount = Number(payment.transaction_amount);
    const orderAmount = Number(order.total_price);
    const currency = payment.currency_id || 'BRL';
    if (!Number.isFinite(paymentAmount) || Math.abs(paymentAmount - orderAmount) > 0.009 || currency !== 'BRL') {
      console.warn(`Payment ${paymentId} does not match order ${orderId}`);
      return res.status(422).json({ success: false, error: 'Payment does not match order' });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const eventResult = await client.query(
        `INSERT INTO payment_webhook_events (payment_id, status, order_id)
         VALUES ($1, $2, $3)
         ON CONFLICT (payment_id, status) DO NOTHING
         RETURNING payment_id`,
        [paymentId, payment.status, orderId]
      );

      if (!eventResult.rows.length) {
        await client.query('COMMIT');
        return res.status(200).json({ success: true, duplicate: true });
      }

      await client.query(
        `UPDATE orders
         SET status = CASE
               WHEN status = 'paid' AND $1 IN ('pending_payment', 'payment_failed') THEN status
               ELSE $1
             END,
             mercadopago_payment_id = $2,
             payment_method = 'mercadopago',
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $3`,
        [nextStatus, paymentId, orderId]
      );
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error processing Mercado Pago webhook:', error);
    return res.status(500).json({ success: false, error: 'Webhook processing error' });
  }
});

router.get('/status/:payment_id', authenticate, async (req, res) => {
  try {
    const payment = await getPaymentStatus(req.params.payment_id);
    const orderId = getOrderId(payment.external_reference);
    const order = orderId ? await Order.findById(orderId) : null;

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found for payment' });
    }
    if (order.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Unauthorized to view this payment' });
    }

    return res.json({
      success: true,
      data: {
        id: payment.id,
        order_id: order.id,
        status: payment.status,
        status_detail: payment.status_detail,
        transaction_amount: payment.transaction_amount,
        currency_id: payment.currency_id,
      },
    });
  } catch (error) {
    console.error('Error fetching payment status:', error);
    return res.status(502).json({ success: false, error: 'Failed to fetch payment status' });
  }
});

module.exports = router;
