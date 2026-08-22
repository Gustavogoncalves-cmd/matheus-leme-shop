import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { apiClient } from '../services/api';
// Products fetched from API - fallback data not needed in frontend

export const useProductsStore = defineStore('products', () => {
  const products = ref([]);
  const loading = ref(false);
  const error = ref(null);
  const categoryFilter = ref('todos');
  const searchQuery = ref('');

  /**
   * Fetch all products from API
   */
  async function fetchProducts() {
    loading.value = true;
    error.value = null;

    try {
      // Fetch from API - baseURL is http://localhost:3000, endpoint includes /api
      const response = await apiClient.get('/api/products');

      // Handle API response structure: { success: true, data: [...] }
      if (response.success && response.data) {
        products.value = Array.isArray(response.data) ? response.data : [];
      } else {
        error.value = 'No products available';
        products.value = [];
      }
    } catch (err) {
      error.value = err.message;
      console.error('Error fetching products:', err);
      products.value = [];
    } finally {
      loading.value = false;
    }
  }

  /**
   * Get filtered products based on category and search
   */
  const filteredProducts = computed(() => {
    return products.value.filter(pack => {
      // Category filter
      if (categoryFilter.value !== 'todos' && pack.category !== categoryFilter.value) {
        return false;
      }

      // Search filter
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        return (
          pack.title.toLowerCase().includes(query) ||
          pack.shortDescription?.toLowerCase().includes(query) ||
          pack.description?.toLowerCase().includes(query)
        );
      }

      return true;
    });
  });

  /**
   * Get a single product by ID
   */
  function getProductById(id) {
    return products.value.find(p => p.id === Number(id));
  }

  /**
   * Set category filter
   */
  function setCategoryFilter(category) {
    categoryFilter.value = category;
  }

  /**
   * Set search query
   */
  function setSearchQuery(query) {
    searchQuery.value = query;
  }

  return {
    products,
    loading,
    error,
    categoryFilter,
    searchQuery,
    filteredProducts,
    fetchProducts,
    getProductById,
    setCategoryFilter,
    setSearchQuery,
  };
});
