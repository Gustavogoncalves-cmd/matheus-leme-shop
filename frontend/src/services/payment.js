import { apiClient } from './api';

/**
 * Payment service for MercadoPago integration
 */
export const paymentService = {
  /**
   * Create a MercadoPago preference from order data
   * @param {Object} orderData - Order data with items and customer info
   * @returns {Promise<Object>} - Preference data with init_point
   */
  async createPreference(orderData) {
    try {
      const response = await apiClient.post('/api/payments/create-preference', orderData);
      return response;
    } catch (error) {
      console.error('Error creating preference:', error);
      throw new Error('Falha ao criar preferência de pagamento');
    }
  },

  /**
   * Get payment status
   * @param {string} paymentId - MercadoPago payment ID
   * @returns {Promise<Object>} - Payment status data
   */
  async validatePayment(paymentId) {
    try {
      const response = await apiClient.get(`/api/payments/status/${paymentId}`);
      return response;
    } catch (error) {
      console.error('Error validating payment:', error);
      throw new Error('Falha ao validar pagamento');
    }
  },

  /**
   * Handle webhook return from MercadoPago
   * @param {Object} params - Query parameters from MercadoPago redirect
   * @returns {Promise<Object>} - Processed payment data
   */
  async handleWebhookReturn(params) {
    try {
      // Extract payment ID from MercadoPago response
      const paymentId = params.payment_id || params.external_reference;

      if (!paymentId) {
        throw new Error('Payment ID não encontrado na resposta');
      }

      // Validate payment status
      const paymentData = await this.validatePayment(paymentId);

      return {
        success: paymentData.status === 'approved',
        paymentId,
        status: paymentData.status,
        data: paymentData,
      };
    } catch (error) {
      console.error('Error handling webhook return:', error);
      throw error;
    }
  },

  /**
   * Create order and initiate payment flow
   * @param {Object} checkoutData - Data from checkout form
   * @returns {Promise<Object>} - Order and preference data
   */
  async initiatePayment(checkoutData) {
    try {
      // Create order in backend
      const orderResponse = await apiClient.post('/api/orders', {
        customer: {
          name: checkoutData.name,
          email: checkoutData.email,
          phone: checkoutData.phone,
        },
        shipping: {
          street: checkoutData.street,
          number: checkoutData.number,
          complement: checkoutData.complement,
          city: checkoutData.city,
          state: checkoutData.state,
          zipCode: checkoutData.zipCode,
        },
        items: checkoutData.items,
        total: checkoutData.total,
      });

      const orderId = orderResponse.id;

      // Create payment preference
      const preferenceData = await this.createPreference({
        orderId,
        customer: {
          name: checkoutData.name,
          email: checkoutData.email,
          phone: checkoutData.phone,
        },
        items: checkoutData.items.map(item => ({
          id: item.id,
          title: item.title,
          quantity: item.quantity,
          unit_price: item.price * (1 - (item.discount || 0) / 100),
        })),
        total: checkoutData.total,
      });

      return {
        orderId,
        ...preferenceData,
      };
    } catch (error) {
      console.error('Error initiating payment:', error);
      throw new Error('Falha ao iniciar pagamento');
    }
  },

  /**
   * Get order details for confirmation
   * @param {string} orderId - Order ID
   * @returns {Promise<Object>} - Order data
   */
  async getOrderDetails(orderId) {
    try {
      const response = await apiClient.get(`/api/orders/${orderId}`);
      return response;
    } catch (error) {
      console.error('Error fetching order details:', error);
      throw new Error('Falha ao buscar detalhes do pedido');
    }
  },

  /**
   * Cancel order
   * @param {string} orderId - Order ID
   * @returns {Promise<void>}
   */
  async cancelOrder(orderId) {
    try {
      await apiClient.patch(`/api/orders/${orderId}`, { status: 'cancelled' });
    } catch (error) {
      console.error('Error cancelling order:', error);
      throw new Error('Falha ao cancelar pedido');
    }
  },
};
