const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const Order = require('../models/Order');
const { authenticate } = require('../middleware/auth');
const {
  isConfigured,
  createCheckoutSession,
  verifyWebhookSignature,
  getCheckoutSession,
} = require('../config/stripe');

// Guard: return 501 if Stripe is not configured
router.use((req, res, next) => {
  if (!isConfigured) {
    return res.status(501).json({
      success: false,
      error: 'Stripe is not configured',
      message: 'Set STRIPE_SECRET_KEY in .env to enable Stripe payments',
    });
  }
  next();
});

/**
 * @swagger
 * /api/payments/create-checkout-session:
 *   post:
 *     summary: Create Stripe checkout session
 *     description: Create a Stripe checkout session for payment
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
 *               - items
 *               - customer
 *             properties:
 *               orderId:
 *                 type: integer
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     description:
 *                       type: string
 *                     price:
 *                       type: number
 *                     quantity:
 *                       type: integer
 *               customer:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   email:
 *                     type: string
 *                   phone:
 *                     type: string
 *               total:
 *                 type: number
 *     responses:
 *       201:
 *         description: Checkout session created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 sessionId:
 *                   type: string
 *                 url:
 *                   type: string
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/create-checkout-session', authenticate, async (req, res) => {
  try {
    const { orderId, items, customer, total } = req.body;

    // Validation
    if (!orderId) {
      return res.status(400).json({
        success: false,
        error: 'orderId is required',
      });
    }

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'items is required',
      });
    }

    if (!customer) {
      return res.status(400).json({
        success: false,
        error: 'customer is required',
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
        error: 'Unauthorized to create checkout for this order',
      });
    }

    // Build line items for Stripe
    const lineItems = items.map(item => ({
      price_data: {
        currency: 'brl',
        product_data: {
          name: item.name,
          description: item.description,
          images: item.image_url ? [item.image_url] : [],
        },
        unit_amount: Math.round(item.price * 100), // Convert to cents
      },
      quantity: item.quantity,
    }));

    // Create checkout session data
    const sessionData = {
      orderId,
      userId: req.user.id,
      customerName: customer.name,
      customerEmail: customer.email,
    };

    // Create Stripe checkout session
    const session = await createCheckoutSession(sessionData, lineItems);

    // Store session ID in database
    await pool.query(
      `UPDATE orders SET stripe_session_id = $1 WHERE id = $2`,
      [session.id, orderId]
    );

    res.status(201).json({
      success: true,
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create checkout session',
      message: error.message,
    });
  }
});

/**
 * @swagger
 * /api/payments/session-status/{session_id}:
 *   get:
 *     summary: Get checkout session status
 *     description: Get the status of a Stripe checkout session
 *     tags:
 *       - Payments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: session_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Stripe checkout session ID
 *     responses:
 *       200:
 *         description: Session status details
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
 *                       type: string
 *                     status:
 *                       type: string
 *                     payment_status:
 *                       type: string
 *                     customer_email:
 *                       type: string
 *                     amount_total:
 *                       type: number
 *       400:
 *         description: Missing session_id
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/session-status/:session_id', authenticate, async (req, res) => {
  try {
    const { session_id } = req.params;

    if (!session_id) {
      return res.status(400).json({
        success: false,
        error: 'session_id is required',
      });
    }

    // Get session from Stripe
    const session = await getCheckoutSession(session_id);

    res.json({
      success: true,
      data: {
        id: session.id,
        status: session.status,
        payment_status: session.payment_status,
        customer_email: session.customer_email,
        amount_total: session.amount_total / 100, // Convert from cents
        orderId: session.metadata.orderId,
      },
    });
  } catch (error) {
    console.error('Error fetching session status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch session status',
      message: error.message,
    });
  }
});

/**
 * @swagger
 * /api/payments/webhook:
 *   post:
 *     summary: Stripe webhook handler
 *     description: Handle payment notifications from Stripe (no auth required)
 *     tags:
 *       - Payments
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Webhook processed
 *       400:
 *         description: Invalid webhook signature
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const signature = req.headers['stripe-signature'];

    // Verify webhook signature
    const event = verifyWebhookSignature(signature, req.body);

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const orderId = session.metadata.orderId;

        if (!orderId) {
          console.warn('No order ID in session metadata');
          break;
        }

        // Update order status to paid
        await Order.updateStatus(orderId, 'paid');
        await pool.query(
          `UPDATE orders SET
            stripe_payment_intent_id = $1,
            payment_method = 'stripe',
            payment_status = $2
           WHERE id = $3`,
          [session.payment_intent, session.payment_status, orderId]
        );

        // Clear user's cart
        const order = await Order.findById(orderId);
        if (order && order.user_id) {
          await pool.query(
            'DELETE FROM cart WHERE user_id = $1',
            [order.user_id]
          );
        }

        console.log(`Payment completed for order ${orderId}, session: ${session.id}`);
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        // Payment succeeded but checkout session might not be completed yet
        console.log(`Payment intent succeeded: ${paymentIntent.id}`);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;

        // Try to find order by payment intent ID
        const result = await pool.query(
          'SELECT id FROM orders WHERE stripe_payment_intent_id = $1',
          [paymentIntent.id]
        );

        if (result.rows.length > 0) {
          const orderId = result.rows[0].id;
          await Order.updateStatus(orderId, 'payment_failed');
          console.log(`Payment failed for order ${orderId}`);
        }

        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
});

module.exports = router;