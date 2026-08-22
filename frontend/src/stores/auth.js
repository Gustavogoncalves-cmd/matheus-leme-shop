import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authApi } from '../services/api';

const AUTH_TOKEN_KEY = 'matheus_leme_token';
const AUTH_USER_KEY = 'matheus_leme_user';

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null);
  const token = ref(null);
  const isLoading = ref(false);
  const error = ref(null);

  /**
   * Restore session from localStorage. The cached user is a UI convenience
   * only - the backend re-verifies the JWT on every protected request, so a
   * tampered localStorage role grants nothing server-side.
   */
  function initAuth() {
    const savedToken = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!savedToken) return;

    token.value = savedToken;
    try {
      const savedUser = localStorage.getItem(AUTH_USER_KEY);
      if (savedUser) user.value = JSON.parse(savedUser);
    } catch {
      localStorage.removeItem(AUTH_USER_KEY);
    }
  }

  const isAuthenticated = computed(() => !!token.value);
  const isAdmin = computed(() => user.value?.role === 'admin');

  function persist(nextUser, nextToken) {
    user.value = nextUser;
    token.value = nextToken;
    localStorage.setItem(AUTH_TOKEN_KEY, nextToken);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(nextUser));
  }

  /**
   * Re-fetch the profile from the API to confirm the stored token is still
   * valid and the role is current. Clears the session on failure.
   */
  async function verifySession() {
    if (!token.value) return false;
    try {
      const res = await authApi.getProfile();
      const profile = res?.data?.user ?? res?.data;
      if (!profile) throw new Error('Perfil indisponivel');
      user.value = profile;
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(profile));
      return true;
    } catch {
      clearSession();
      return false;
    }
  }

  async function login(email, password) {
    isLoading.value = true;
    error.value = null;

    try {
      const res = await authApi.login(email, password);
      const data = res?.data;
      if (!data?.token || !data?.user) {
        throw new Error('Resposta de login invalida');
      }
      persist(data.user, data.token);
      return data.user;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function register(name, email, password) {
    isLoading.value = true;
    error.value = null;

    try {
      const res = await authApi.register(name, email, password);
      const data = res?.data;
      if (!data?.token || !data?.user) {
        throw new Error('Resposta de cadastro invalida');
      }
      persist(data.user, data.token);
      return data.user;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  function clearSession() {
    user.value = null;
    token.value = null;
    error.value = null;
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
  }

  async function logout() {
    try {
      if (token.value) await authApi.logout();
    } catch {
      // Logout is client-side authoritative; a failed server call still clears.
    } finally {
      clearSession();
    }
  }

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
    verifySession,
    clearSession,
  };
});
