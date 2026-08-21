import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

const CART_STORAGE_KEY = 'matheus_leme_cart';

export const useCartStore = defineStore('cart', () => {
  const items = ref([]);

  /**
   * Initialize cart from localStorage
   */
  function initCart() {
    const saved = localStorage.getItem(CART_STORAGE_KEY);
    if (saved) {
      try {
        items.value = JSON.parse(saved);
      } catch {
        items.value = [];
      }
    }
  }

  /**
   * Save cart to localStorage
   */
  function saveCart() {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items.value));
  }

  /**
   * Add item to cart or increment quantity if already exists
   */
  function addItem(product) {
    const existing = items.value.find(item => item.id === product.id);

    if (existing) {
      existing.quantity += 1;
    } else {
      items.value.push({
        id: product.id,
        title: product.title,
        price: product.price,
        discount: product.discount,
        thumbnail: product.thumbnail,
        quantity: 1,
      });
    }

    saveCart();
  }

  /**
   * Remove item from cart
   */
  function removeItem(productId) {
    items.value = items.value.filter(item => item.id !== productId);
    saveCart();
  }

  /**
   * Update item quantity
   */
  function updateQuantity(productId, quantity) {
    const item = items.value.find(i => i.id === productId);
    if (item) {
      if (quantity <= 0) {
        removeItem(productId);
      } else {
        item.quantity = quantity;
        saveCart();
      }
    }
  }

  /**
   * Clear entire cart
   */
  function clearCart() {
    items.value = [];
    saveCart();
  }

  /**
   * Calculate total price
   */
  const total = computed(() => {
    return items.value.reduce((sum, item) => {
      const itemPrice = item.price * (1 - (item.discount || 0) / 100);
      return sum + itemPrice * item.quantity;
    }, 0);
  });

  /**
   * Get item count
   */
  const count = computed(() => {
    return items.value.reduce((sum, item) => sum + item.quantity, 0);
  });

  // Initialize on store creation
  initCart();

  return {
    items,
    total,
    count,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    initCart,
  };
});
