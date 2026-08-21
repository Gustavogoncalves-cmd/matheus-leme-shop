import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { apiClient } from '../services/api';
import productsData from '../../../shared/products-data.json';

export const useProductsStore = defineStore('products', () => {
  const products = ref([]);
  const loading = ref(false);
  const error = ref(null);
  const categoryFilter = ref('todos');
  const searchQuery = ref('');

  /**
   * Fetch all products from API, with fallback to local data
   */
  async function fetchProducts() {
    loading.value = true;
    error.value = null;

    try {
      try {
        // Try to fetch from API first
        const response = await apiClient.get('/products');
        products.value = response.data.data || [];
      } catch (apiError) {
        // Fallback to local data if API fails
        console.warn('API unavailable, using local data:', apiError);
        products.value = productsData;
      }
    } catch (err) {
      error.value = err.message;
      products.value = productsData; // Fallback to local data
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
