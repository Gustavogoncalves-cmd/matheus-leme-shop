import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { apiClient } from '../services/api';

export const useAdminStore = defineStore('admin', () => {
  // Products
  const products = ref([]);
  const productsLoading = ref(false);
  const productsError = ref(null);

  // Orders
  const orders = ref([]);
  const ordersLoading = ref(false);
  const ordersError = ref(null);

  // Dashboard
  const dashboardMetrics = ref(null);
  const dashboardLoading = ref(false);
  const dashboardError = ref(null);

  /**
   * Fetch all products with optional filters
   */
  async function fetchProducts(filters = {}) {
    productsLoading.value = true;
    productsError.value = null;

    try {
      const query = new URLSearchParams(filters).toString();
      const response = await apiClient.get(`/api/products?${query}`);
      products.value = response.data || [];
    } catch (err) {
      productsError.value = err.message;
      console.error('Error fetching products:', err);
      throw err;
    } finally {
      productsLoading.value = false;
    }
  }

  /**
   * Create a new product
   */
  async function createProduct(data) {
    productsLoading.value = true;
    productsError.value = null;

    try {
      const response = await apiClient.post('/api/products', data);
      products.value.push(response.data);
      return response.data;
    } catch (err) {
      productsError.value = err.message;
      console.error('Error creating product:', err);
      throw err;
    } finally {
      productsLoading.value = false;
    }
  }

  /**
   * Update an existing product
   */
  async function updateProduct(id, data) {
    productsLoading.value = true;
    productsError.value = null;

    try {
      const response = await apiClient.patch(`/api/products/${id}`, data);
      const index = products.value.findIndex(p => p.id === id);
      if (index > -1) {
        products.value[index] = response.data;
      }
      return response.data;
    } catch (err) {
      productsError.value = err.message;
      console.error('Error updating product:', err);
      throw err;
    } finally {
      productsLoading.value = false;
    }
  }

  /**
   * Delete a product
   */
  async function deleteProduct(id) {
    productsLoading.value = true;
    productsError.value = null;

    try {
      await apiClient.delete(`/api/products/${id}`);
      products.value = products.value.filter(p => p.id !== id);
    } catch (err) {
      productsError.value = err.message;
      console.error('Error deleting product:', err);
      throw err;
    } finally {
      productsLoading.value = false;
    }
  }

  /**
   * Fetch all orders with optional filters
   */
  async function fetchOrders(filters = {}) {
    ordersLoading.value = true;
    ordersError.value = null;

    try {
      const query = new URLSearchParams(filters).toString();
      const response = await apiClient.get(`/api/orders?${query}`);
      orders.value = response.data || [];
    } catch (err) {
      ordersError.value = err.message;
      console.error('Error fetching orders:', err);
      throw err;
    } finally {
      ordersLoading.value = false;
    }
  }

  /**
   * Get a single order by ID
   */
  async function getOrderById(id) {
    ordersLoading.value = true;
    ordersError.value = null;

    try {
      const response = await apiClient.get(`/api/orders/${id}`);
      return response.data;
    } catch (err) {
      ordersError.value = err.message;
      console.error('Error fetching order:', err);
      throw err;
    } finally {
      ordersLoading.value = false;
    }
  }

  /**
   * Update order status
   */
  async function updateOrderStatus(orderId, newStatus) {
    ordersLoading.value = true;
    ordersError.value = null;

    try {
      const response = await apiClient.patch(`/api/orders/${orderId}`, {
        status: newStatus,
      });
      const index = orders.value.findIndex(o => o.id === orderId);
      if (index > -1) {
        orders.value[index] = response.data;
      }
      return response.data;
    } catch (err) {
      ordersError.value = err.message;
      console.error('Error updating order status:', err);
      throw err;
    } finally {
      ordersLoading.value = false;
    }
  }

  /**
   * Fetch dashboard metrics
   */
  async function fetchDashboardMetrics() {
    dashboardLoading.value = true;
    dashboardError.value = null;

    try {
      const response = await apiClient.get('/api/admin/metrics');
      dashboardMetrics.value = response.data;
      return response.data;
    } catch (err) {
      dashboardError.value = err.message;
      console.error('Error fetching dashboard metrics:', err);
      // Provide mock data as fallback for demo
      dashboardMetrics.value = {
        totalSales: 0,
        totalOrders: 0,
        totalCustomers: 0,
        monthlySalesData: [],
        recentOrders: [],
        topProducts: [],
      };
    } finally {
      dashboardLoading.value = false;
    }
  }

  /**
   * Get a product by ID
   */
  function getProductById(id) {
    return products.value.find(p => p.id === Number(id));
  }

  /**
   * Computed: Total products count
   */
  const totalProducts = computed(() => products.value.length);

  /**
   * Computed: Total orders count
   */
  const totalOrders = computed(() => orders.value.length);

  return {
    // State
    products,
    productsLoading,
    productsError,
    orders,
    ordersLoading,
    ordersError,
    dashboardMetrics,
    dashboardLoading,
    dashboardError,

    // Computed
    totalProducts,
    totalOrders,

    // Methods
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    fetchOrders,
    getOrderById,
    updateOrderStatus,
    fetchDashboardMetrics,
    getProductById,
  };
});
