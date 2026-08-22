import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { apiClient } from '../services/api';
// Products fetched from API - fallback data not needed in frontend

/**
 * The API returns raw DB rows (snake_case: header_title, short_description,
 * price_original, theme_color). Components (StreamPackCard/StreamPackDetail)
 * expect the camelCase shape used in the original Phase 1 hardcoded data
 * (headerTitle, shortDescription, longDescription, priceCurrent, priceOriginal,
 * themeColor, stock). This maps the boundary once, here, instead of teaching
 * every consumer both shapes.
 */
function mapProductRow(row) {
  return {
    id: row.id,
    title: row.title,
    headerTitle: row.header_title,
    category: row.category,
    type: row.type,
    shortDescription: row.short_description,
    longDescription: row.description,
    priceCurrent: Number(row.price),
    priceOriginal: Number(row.price_original ?? row.price),
    discount: row.discount,
    stock: row.stock ?? 0,
    sold: row.sold ?? 0,
    featured: row.featured,
    available: row.available,
    themeColor: row.theme_color,
    thumbnail: row.thumbnail,
    images: row.images || [],
    features: row.features || [],
    previews: row.previews || [],
  };
}

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
      // limit=100: default page size is 12, and the full catalog is 24 items.
      const response = await apiClient.get('/api/products?limit=100');

      // Handle API response structure: { success: true, data: [...] }
      if (response.success && response.data) {
        products.value = Array.isArray(response.data) ? response.data.map(mapProductRow) : [];
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
