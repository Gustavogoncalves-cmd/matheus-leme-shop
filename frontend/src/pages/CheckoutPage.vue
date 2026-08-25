<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 py-8 px-4">
    <!-- Header -->
    <div class="max-w-7xl mx-auto mb-8">
      <router-link
        to="/cart"
        class="inline-flex items-center gap-2 text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition font-medium"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        Voltar ao Carrinho
      </router-link>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto">
      <!-- Error Alert -->
      <div
        v-if="error"
        class="mb-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
      >
        <div class="flex gap-3">
          <svg class="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
          <div>
            <h3 class="font-semibold text-red-800 dark:text-red-400">Erro</h3>
            <p class="text-red-700 dark:text-red-300 text-sm mt-1">{{ error }}</p>
          </div>
          <button
            @click="error = ''"
            class="ml-auto text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center min-h-96">
        <div class="text-center">
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-100 dark:bg-brand-900/30 mb-4">
            <svg class="animate-spin w-8 h-8 text-brand-600 dark:text-brand-400" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <p class="text-slate-600 dark:text-slate-400 font-medium">Carregando...</p>
        </div>
      </div>

      <!-- Checkout Component -->
      <div v-else>
        <Checkout
          :dark-mode="isDarkMode"
          @submit="handleCheckoutSubmit"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCartStore } from '../stores/cart';
import Checkout from '../components/Checkout.vue';
import { paymentService } from '../services/payment';

const router = useRouter();
const cartStore = useCartStore();

const loading = ref(false);
const error = ref('');
const isDarkMode = ref(false);

const handleCheckoutSubmit = async (checkoutData) => {
  loading.value = true;
  error.value = '';

  try {
    // Validate cart
    if (cartStore.items.length === 0) {
      error.value = 'Seu carrinho está vazio';
      loading.value = false;
      return;
    }

    const payment = await paymentService.initiatePayment(checkoutData);

    localStorage.setItem('lastOrderId', String(payment.orderId));
    if (payment.init_point) {
      window.location.href = payment.init_point;
    } else {
      error.value = 'Falha ao obter o link do Mercado Pago';
    }
  } catch (err) {
    console.error('Checkout error:', err);
    error.value = err.message || 'Falha ao processar checkout. Tente novamente.';
  } finally {
    loading.value = false;
  }
};

const detectDarkMode = () => {
  isDarkMode.value = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
};

onMounted(() => {
  detectDarkMode();

  // Listen for dark mode changes
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      isDarkMode.value = e.matches;
    });
  }

  // Validate cart
  cartStore.initCart();
  if (cartStore.items.length === 0) {
    router.push('/cart');
  }
});
</script>
