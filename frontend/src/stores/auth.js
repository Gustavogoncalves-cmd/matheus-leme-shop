import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

const AUTH_TOKEN_KEY = 'matheus_leme_token';

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null);
  const token = ref(null);
  const isLoading = ref(false);
  const error = ref(null);

  /**
   * Initialize auth from localStorage
   */
  function initAuth() {
    const savedToken = localStorage.getItem(AUTH_TOKEN_KEY);
    if (savedToken) {
      token.value = savedToken;
      // In a real app, you'd verify the token and fetch user data here
    }
  }

  /**
   * Check if user is authenticated
   */
  const isAuthenticated = computed(() => !!token.value);

  /**
   * Check if user is admin
   */
  const isAdmin = computed(() => user.value?.role === 'admin');

  /**
   * Login user (placeholder - integrate with API)
   */
  async function login(email, password) {
    isLoading.value = true;
    error.value = null;

    try {
      // TODO: Call API endpoint /api/auth/login
      // For now, just save a mock token
      token.value = 'mock-token-' + Date.now();
      localStorage.setItem(AUTH_TOKEN_KEY, token.value);

      user.value = {
        id: 1,
        email,
        name: email.split('@')[0],
        role: 'customer',
      };
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Logout user
   */
  function logout() {
    user.value = null;
    token.value = null;
    localStorage.removeItem(AUTH_TOKEN_KEY);
  }

  /**
   * Register user (placeholder - integrate with API)
   */
  async function register(name, email, password) {
    isLoading.value = true;
    error.value = null;

    try {
      // TODO: Call API endpoint /api/auth/register
      await login(email, password);
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  // Initialize on store creation
  initAuth();

  return {
    user,
    token,
    isLoading,
    error,
    isAuthenticated,
    isAdmin,
    login,
    logout,
    register,
    initAuth,
  };
});
