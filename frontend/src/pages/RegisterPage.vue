<template>
  <main class="min-h-screen bg-neon-bg flex items-center justify-center px-4">
    <div class="w-full max-w-md">
      <form
        class="bg-neon-card p-8 rounded-2xl shadow-lg border border-neon-line"
        @submit.prevent="handleRegister"
      >
        <h1 class="text-3xl font-black font-display text-white mb-2 text-center uppercase tracking-tight">
          Criar Conta
        </h1>
        <p class="text-sm text-slate-400 text-center mb-6">
          Crie sua conta para comprar e acompanhar seus pedidos
        </p>

        <div class="space-y-5">
          <div>
            <label for="reg-name" class="block text-sm font-medium text-slate-300 mb-1.5">
              Nome
            </label>
            <input
              id="reg-name"
              v-model.trim="form.name"
              type="text"
              autocomplete="name"
              required
              class="w-full px-4 py-2.5 bg-neon-card2 border border-neon-line rounded-xl focus:outline-none focus:ring-2 focus:ring-neon-lime text-white placeholder-slate-500"
              placeholder="Seu nome"
            />
          </div>

          <div>
            <label for="reg-email" class="block text-sm font-medium text-slate-300 mb-1.5">
              Email
            </label>
            <input
              id="reg-email"
              v-model.trim="form.email"
              type="email"
              autocomplete="email"
              required
              class="w-full px-4 py-2.5 bg-neon-card2 border border-neon-line rounded-xl focus:outline-none focus:ring-2 focus:ring-neon-lime text-white placeholder-slate-500"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label for="reg-password" class="block text-sm font-medium text-slate-300 mb-1.5">
              Senha
            </label>
            <input
              id="reg-password"
              v-model="form.password"
              type="password"
              autocomplete="new-password"
              required
              minlength="6"
              class="w-full px-4 py-2.5 bg-neon-card2 border border-neon-line rounded-xl focus:outline-none focus:ring-2 focus:ring-neon-lime text-white placeholder-slate-500"
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          <div>
            <label for="reg-confirm" class="block text-sm font-medium text-slate-300 mb-1.5">
              Confirmar Senha
            </label>
            <input
              id="reg-confirm"
              v-model="form.confirmPassword"
              type="password"
              autocomplete="new-password"
              required
              minlength="6"
              class="w-full px-4 py-2.5 bg-neon-card2 border border-neon-line rounded-xl focus:outline-none focus:ring-2 focus:ring-neon-lime text-white placeholder-slate-500"
              placeholder="Repita a senha"
            />
          </div>

          <p
            v-if="errorMessage"
            role="alert"
            class="text-sm text-red-400 bg-red-950/40 border border-red-900 rounded-xl px-4 py-2.5"
          >
            {{ errorMessage }}
          </p>

          <button
            type="submit"
            :disabled="authStore.isLoading"
            class="w-full py-3 bg-neon-lime hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed text-black font-bold rounded-xl transition-all"
          >
            {{ authStore.isLoading ? 'Criando conta...' : 'Criar Conta' }}
          </button>
        </div>

        <p class="mt-6 text-center text-sm text-slate-400">
          Já tem uma conta?
          <router-link to="/login" class="text-neon-lime hover:underline font-semibold">
            Fazer Login
          </router-link>
        </p>
      </form>
    </div>
  </main>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const form = ref({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
});

const errorMessage = ref('');

async function handleRegister() {
  errorMessage.value = '';

  // Client-side validation
  if (form.value.password.length < 6) {
    errorMessage.value = 'A senha deve ter no mínimo 6 caracteres.';
    return;
  }

  if (form.value.password !== form.value.confirmPassword) {
    errorMessage.value = 'As senhas não conferem.';
    return;
  }

  try {
    const user = await authStore.register(form.value.name, form.value.email, form.value.password);
    form.value.password = '';
    form.value.confirmPassword = '';

    const redirect = typeof router.currentRoute.value.query.redirect === 'string'
      ? router.currentRoute.value.query.redirect
      : null;
    await router.replace(redirect || (user?.role === 'admin' ? '/admin' : '/'));
  } catch (err) {
    errorMessage.value = err?.message || 'Não foi possível criar a conta. Tente novamente.';
  }
}
</script>