import { useAuthStore } from '../stores/auth';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '');

/**
 * Pull the most useful message out of an error response.
 *
 * The backend answers with { success: false, error, details? }, and validation
 * failures put the actionable text in details[].message. A previous version
 * read `.message` (which the API never sends) inside a try/catch that also
 * swallowed the thrown Error itself, so every failure surfaced as a bare
 * "HTTP 400" with the real reason discarded.
 */
async function extractErrorMessage(response) {
  const fallback = `HTTP ${response.status}: ${response.statusText}`;

  let payload;
  try {
    payload = await response.json();
  } catch {
    return fallback;
  }

  const detail = payload?.details?.[0]?.message;
  return detail || payload?.error || payload?.message || fallback;
}

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
        throw new Error(await extractErrorMessage(response));
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

  async download(endpoint) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      headers: this.getHeaders(),
      credentials: 'include',
    });
    if (!response.ok) {
      throw new Error(await extractErrorMessage(response));
    }
    return response.blob();
  }

  /**
   * Multipart upload. Deliberately does not reuse request(): the browser must
   * set Content-Type itself so the multipart boundary is generated correctly,
   * so the JSON headers are skipped and only Authorization is carried over.
   */
  async upload(endpoint, formData) {
    const authStore = useAuthStore();
    const headers = {};
    if (authStore.token) {
      headers.Authorization = `Bearer ${authStore.token}`;
    }

    const url = `${this.baseURL}${endpoint}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(await extractErrorMessage(response));
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error [POST ${endpoint}]:`, error);
      throw error;
    }
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
    return apiClient.post('/api/cart/add', { product_id: productId, quantity });
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
    return apiClient.patch(`/api/orders/${id}/status`, { status });
  },

  downloadItem(orderId, itemId) {
    return apiClient.download(`/api/orders/${orderId}/items/${itemId}/download`);
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

  getProfile() {
    return apiClient.get('/api/auth/profile');
  },
};

/**
 * Site content (CMS) API methods.
 * Reads are public; writes require an admin token.
 */
export const contentApi = {
  /** Flat { key: value } map used by the public site. */
  getMap() {
    return apiClient.get('/api/content');
  },

  /** Full rows with type/section/label metadata, for the admin editor. */
  getAll() {
    return apiClient.get('/api/content?full=true');
  },

  getBySection(section) {
    return apiClient.get(`/api/content/section/${section}`);
  },

  update(key, value) {
    return apiClient.put(`/api/content/${key}`, { value });
  },

  create(field) {
    return apiClient.post('/api/content', field);
  },

  remove(key) {
    return apiClient.delete(`/api/content/${key}`);
  },
};

/**
 * Image upload API methods (admin only).
 */
export const uploadApi = {
  upload(file) {
    const formData = new FormData();
    formData.append('image', file);
    return apiClient.upload('/api/upload', formData);
  },

  list() {
    return apiClient.get('/api/upload');
  },

  remove(filename) {
    return apiClient.delete(`/api/upload/${filename}`);
  },
};
