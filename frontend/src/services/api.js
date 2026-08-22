import { useAuthStore } from '../stores/auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * HTTP client for API communication
 */
class ApiClient {
  constructor(baseURL = API_URL) {
    this.baseURL = baseURL;
  }

  /**
   * Get authorization header
   */
  getHeaders() {
    const authStore = useAuthStore();
    const headers = {
      'Content-Type': 'application/json',
    };

    if (authStore.token) {
      headers.Authorization = `Bearer ${authStore.token}`;
    }

    return headers;
  }

  /**
   * Make a request
   */
  async request(method, endpoint, data = null) {
    const url = `${this.baseURL}${endpoint}`;
    const options = {
      method,
      headers: this.getHeaders(),
      credentials: 'include', // Include cookies in requests
    };

    if (data && (method === 'POST' || method === 'PATCH' || method === 'PUT')) {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, options);

      if (!response.ok) {
        try {
          const errorData = await response.json();
          throw new Error(errorData.message || `HTTP ${response.status}`);
        } catch (parseError) {
          // If response is not JSON, use status text
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error [${method} ${endpoint}]:`, error);
      throw error;
    }
  }

  /**
   * GET request
   */
  async get(endpoint) {
    return this.request('GET', endpoint);
  }

  /**
   * POST request
   */
  async post(endpoint, data) {
    return this.request('POST', endpoint, data);
  }

  /**
   * PATCH request
   */
  async patch(endpoint, data) {
    return this.request('PATCH', endpoint, data);
  }

  /**
   * DELETE request
   */
  async delete(endpoint) {
    return this.request('DELETE', endpoint);
  }

  /**
   * PUT request
   */
  async put(endpoint, data) {
    return this.request('PUT', endpoint, data);
  }
}

export const apiClient = new ApiClient();

/**
 * Product API methods
 */
export const productsApi = {
  getAll(params = {}) {
    const query = new URLSearchParams(params).toString();
    return apiClient.get(`/api/products?${query}`);
  },

  getById(id) {
    return apiClient.get(`/api/products/${id}`);
  },

  create(data) {
    return apiClient.post('/api/products', data);
  },

  update(id, data) {
    return apiClient.patch(`/api/products/${id}`, data);
  },

  delete(id) {
    return apiClient.delete(`/api/products/${id}`);
  },
};

/**
 * Cart API methods
 */
export const cartApi = {
  getCart() {
    return apiClient.get('/api/cart');
  },

  addItem(productId, quantity = 1) {
    return apiClient.post('/api/cart/add', { productId, quantity });
  },

  removeItem(itemId) {
    return apiClient.delete(`/api/cart/${itemId}`);
  },

  updateQuantity(itemId, quantity) {
    return apiClient.patch(`/api/cart/${itemId}`, { quantity });
  },

  clearCart() {
    return apiClient.delete('/api/cart');
  },
};

/**
 * Order API methods
 */
export const ordersApi = {
  create(data) {
    return apiClient.post('/api/orders', data);
  },

  getAll(params = {}) {
    const query = new URLSearchParams(params).toString();
    return apiClient.get(`/api/orders?${query}`);
  },

  getById(id) {
    return apiClient.get(`/api/orders/${id}`);
  },

  updateStatus(id, status) {
    return apiClient.patch(`/api/orders/${id}`, { status });
  },
};

/**
 * Auth API methods
 */
export const authApi = {
  login(email, password) {
    return apiClient.post('/api/auth/login', { email, password });
  },

  register(name, email, password) {
    return apiClient.post('/api/auth/register', { name, email, password });
  },

  logout() {
    return apiClient.post('/api/auth/logout', {});
  },
};
