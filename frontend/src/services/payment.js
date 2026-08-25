import { apiClient } from './api';

export const paymentService = {
  async createPreference(orderId) {
    const response = await apiClient.post('/api/payments/create-preference', { orderId });
    return response.data;
  },

  async validatePayment(paymentId) {
    const response = await apiClient.get(`/api/payments/status/${paymentId}`);
    return response.data;
  },

  async initiatePayment(checkoutData) {
    const orderResponse = await apiClient.post('/api/orders', {
      items: checkoutData.items.map(item => ({
        product_id: item.id,
        quantity: item.quantity,
      })),
    });
    const order = orderResponse.data;
    const preference = await this.createPreference(order.id);
    return { orderId: order.id, ...preference };
  },

  async getOrderDetails(orderId) {
    const response = await apiClient.get(`/api/orders/${orderId}`);
    return response.data;
  },
};
