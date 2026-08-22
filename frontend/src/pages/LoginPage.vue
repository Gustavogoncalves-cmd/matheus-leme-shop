<template>
  <main class="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center px-4">
    <div class="w-full max-w-md">
      <form
        class="bg-slate-50 dark:bg-slate-900 p-8 rounded-lg shadow-lg"
        @submit.prevent="handleLogin"
      >
        <h1 class="text-3xl font-bold text-slate-900 dark:text-white mb-6 text-center">
          Login
        </h1>

        <div class="space-y-6">
          <div>
            <label
              for="login-email"
              class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
            >
              Email
            </label>
            <input
              id="login-email"
              v-model.trim="form.email"
              type="email"
              autocomplete="email"
              required
              class="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label
              for="login-password"
              class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
            >
              Senha
            </label>
            <input
              id="login-password"
              v-model="form.password"
              type="password"
              autocomplete="current-password"
              required
              class="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
              placeholder="********"
            />
          </div>

          <p
            v-if="errorMessage"
            role="alert"
            class="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg px-4 py-2"
          >
            {{ errorMessage }}
          </p>

          <button
            type="submit"
            :disabled="authStore.isLoading"
            class="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
          >
            {{ authStore.isLoading ? 'Entrando...' : 'Entrar' }}
          </button>
        </div>
      </form>
    </div>
  </main>
</template>

<script setup>
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const form = ref({
  email: '',
  password: '',
});

const errorMessage = ref('');

async function handleLogin() {
  errorMessage.value = '';

  try {
    const user = await authStore.login(form.value.email, form.value.password);
    form.value.password = '';

    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : null;
    if (redirect) {
      await router.replace(redirect);
    } else {
      await router.replace(user?.role === 'admin' ? '/admin' : '/');
    }
  } catch (err) {
    // Keep the message generic so the form never confirms whether an email exists.
    errorMessage.value = err?.message || 'Nao foi possivel entrar. Verifique email e senha.';
  }
}
</script>
