const Stripe = require('stripe');

const SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const isConfigured = Boolean(SECRET_KEY);

/** Lazily-initialized Stripe client. Only created when first used. */
let _stripe = null;
function getClient() {
  if (!isConfigured) {
    throw new Error('Stripe is not configured — set STRIPE_SECRET_KEY in .env');
  }
  if (!_stripe) {
    _stripe = new Stripe(SECRET_KEY, { apiVersion: '2025-01-27.acacia' });
  }
  return _stripe;
}

/**
 * Create a Stripe payment intent
 * @param {Object} orderData - Order data
 * @param {number} amount - Amount in cents
 * @param {string} currency - Currency code
 * @returns {Promise<Object>} - Payment intent
 */
const createPaymentIntent = async (orderData, amount, currency = 'brl') => {
  try {
    const stripe = getClient();
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      metadata: {
        orderId: orderData.orderId,
        userId: orderData.userId,
        customerName: orderData.customerName,
        customerEmail: orderData.customerEmail,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return paymentIntent;
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
};

/**
 * Confirm a payment intent
 * @param {string} paymentIntentId - Payment intent ID
 * @returns {Promise<Object>} - Confirmed payment intent
 */
const confirmPaymentIntent = async (paymentIntentId) => {
  try {
    const stripe = getClient();
    const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId);
    return paymentIntent;
  } catch (error) {
    console.error('Error confirming payment intent:', error);
    throw error;
  }
};

/**
 * Retrieve a payment intent
 * @param {string} paymentIntentId - Payment intent ID
 * @returns {Promise<Object>} - Payment intent details
 */
const getPaymentIntent = async (paymentIntentId) => {
  try {
    const stripe = getClient();
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return paymentIntent;
  } catch (error) {
    console.error('Error retrieving payment intent:', error);
    throw error;
  }
};

/**
 * Create a checkout session
 * @param {Object} orderData - Order data
 * @param {Array} lineItems - Line items for checkout
 * @returns {Promise<Object>} - Checkout session
 */
const createCheckoutSession = async (orderData, lineItems) => {
  try {
    const stripe = getClient();
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/payment-cancel`,
      customer_email: orderData.customerEmail,
      metadata: {
        orderId: orderData.orderId,
        userId: orderData.userId,
      },
    });

    return session;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
};

/**
 * Verify webhook signature
 * @param {string} signature - Webhook signature
 * @param {Buffer} payload - Request payload
 * @returns {Object} - Webhook event
 */
const verifyWebhookSignature = (signature, payload) => {
  const stripe = getClient();
  try {
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    return event;
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    throw error;
  }
};

/**
 * Retrieve a checkout session
 * @param {string} sessionId - Stripe checkout session ID
 * @returns {Promise<Object>} - Checkout session details
 */
const getCheckoutSession = async (sessionId) => {
  try {
    const stripe = getClient();
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent'],
    });
    return session;
  } catch (error) {
    console.error('Error retrieving checkout session:', error);
    throw error;
  }
};

module.exports = {
  isConfigured,
  createPaymentIntent,
  confirmPaymentIntent,
  getPaymentIntent,
  getCheckoutSession,
  createCheckoutSession,
  verifyWebhookSignature,
};