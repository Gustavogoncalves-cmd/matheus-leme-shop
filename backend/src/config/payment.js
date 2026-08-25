const { MercadoPagoConfig, Preference, Payment } = require('mercadopago');
const crypto = require('crypto');

/**
 * Initialize MercadoPago client
 * @returns {Object|null} - MercadoPago client instance or null if not configured
 */
const initializeMercadoPago = () => {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

  if (!accessToken || accessToken === 'seu_token_aqui') {
    console.warn('⚠️  MERCADOPAGO_ACCESS_TOKEN not configured - payments will be disabled');
    return null;
  }

  const client = new MercadoPagoConfig({
    accessToken: accessToken,
  });

  return client;
};

// Lazy-loaded client to avoid crash on startup if not configured
let mpClient = null;

/**
 * Get or initialize MercadoPago client
 */
const getClient = () => {
  if (!mpClient) {
    mpClient = initializeMercadoPago();
  }
  return mpClient;
};

/**
 * Validate webhook signature from MercadoPago
 * @param {string} xSignature - x-signature header from request
 * @param {Object} requestBody - Parsed request body object
 * @param {string} requestId - x-request-id header from request
 * @returns {boolean} - True if signature is valid
 */
const validateWebhookSignature = (xSignature, requestBody, requestId) => {
  const webhookSecret = process.env.MERCADOPAGO_WEBHOOK_SECRET;

  if (!webhookSecret || !xSignature) {
    return false;
  }

  // Split the signature header
  const parts = xSignature.split(',');
  let receivedTs = null;
  let receivedHash = null;

  for (const part of parts) {
    const [key, value] = part.trim().split('=');
    if (key === 'ts') receivedTs = value;
    if (key === 'v1') receivedHash = value;
  }

  if (!/^\d+$/.test(receivedTs || '') || !/^[a-f0-9]{64}$/i.test(receivedHash || '')) {
    return false;
  }

  const timestamp = Number(receivedTs);
  if (Math.abs(Date.now() - timestamp) > 5 * 60 * 1000) {
    return false;
  }

  const dataId = requestBody?.data?.id;
  if (!dataId || !requestId) {
    return false;
  }

  // Mercado Pago signs this exact manifest for Webhooks notifications.
  const manifest = `id:${String(dataId).toLowerCase()};request-id:${requestId};ts:${receivedTs};`;
  const hash = crypto
    .createHmac('sha256', webhookSecret)
    .update(manifest)
    .digest('hex');

  const expected = Buffer.from(hash, 'hex');
  const received = Buffer.from(receivedHash, 'hex');
  return expected.length === received.length && crypto.timingSafeEqual(expected, received);
};

/**
 * Get payment status
 * @param {string|number} paymentId - MercadoPago payment ID
 * @returns {Promise<Object>} - Payment details
 */
const getPaymentStatus = async (paymentId) => {
  const client = getClient();
  if (!client) {
    throw new Error('MercadoPago not configured');
  }

  try {
    const payment = new Payment(client);
    const result = await payment.get({ id: paymentId });
    return result;
  } catch (error) {
    console.error('Error fetching payment status:', error);
    throw error;
  }
};

/**
 * Create a payment preference
 * @param {Object} preferenceData - Preference configuration
 * @returns {Promise<Object>} - Created preference
 */
const createPreference = async (preferenceData) => {
  const client = getClient();
  if (!client) {
    throw new Error('MercadoPago not configured');
  }

  try {
    const preference = new Preference(client);
    const result = await preference.create({ body: preferenceData });
    return result;
  } catch (error) {
    console.error('Error creating preference:', error);
    throw error;
  }
};

module.exports = {
  initializeMercadoPago,
  getClient,
  validateWebhookSignature,
  getPaymentStatus,
  createPreference,
  // Backward-compatible export
  MercadoPago: { MercadoPagoConfig, Preference, Payment },
};
