<template>
  <div class="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 dark:from-slate-950 dark:to-slate-900 py-8 px-4 flex items-center justify-center">
    <div class="w-full max-w-2xl">
      <!-- Success Card -->
      <div class="bg-white dark:bg-slate-900 rounded-lg shadow-2xl overflow-hidden">
        <!-- Header with Success Animation -->
        <div class="bg-gradient-to-r from-green-500 to-emerald-500 dark:from-green-600 dark:to-emerald-600 px-6 md:px-8 py-12 md:py-16 text-center">
          <!-- Checkmark Animation -->
          <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white dark:bg-slate-800 mb-6 mx-auto">
            <svg
              class="w-12 h-12 text-green-500 animate-bounce"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="3"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h1 class="text-3xl md:text-4xl font-bold text-white mb-2">
            Pagamento Confirmado!
          </h1>
          <p class="text-green-100">Sua compra foi realizada com sucesso</p>
        </div>

        <!-- Content -->
        <div class="px-6 md:px-8 py-8 md:py-12">
          <!-- Loading State -->
          <div v-if="loading" class="text-center py-8">
            <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
              <svg class="animate-spin w-6 h-6 text-brand-600 dark:text-brand-400" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <p class="text-slate-600 dark:text-slate-400 font-medium">Carregando detalhes do pedido...</p>
          </div>

          <!-- Error State -->
          <div v-else-if="error" class="text-center py-8">
            <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
              <svg class="w-6 h-6 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </div>
            <p class="text-red-600 dark:text-red-400 font-medium">{{ error }}</p>
          </div>

          <!-- Order Details -->
          <div v-else class="space-y-8">
            <!-- Order ID -->
            <div class="bg-slate-50 dark:bg-slate-800 rounded-lg p-6">
              <p class="text-sm text-slate-600 dark:text-slate-400 mb-2">Número do Pedido</p>
              <p class="text-2xl font-bold text-slate-900 dark:text-white font-mono">
                #{{ orderData?.id }}
              </p>
            </div>

            <!-- Order Items -->
            <div v-if="orderData?.items && orderData.items.length > 0">
              <h2 class="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Itens do Pedido
              </h2>
              <div class="space-y-3 border-b border-slate-200 dark:border-slate-800 pb-6">
                <div
                  v-for="item in orderData.items"
                  :key="item.id"
                  class="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg"
                >
                  <div>
                    <p class="font-medium text-slate-900 dark:text-white">
                      {{ item.title }}
                    </p>
                    <p class="text-sm text-slate-500 dark:text-slate-400">
                      Qtd: {{ item.quantity }}
                    </p>
                  </div>
                  <p class="font-semibold text-slate-900 dark:text-white">
                    {{ formatPrice(item.price * item.quantity) }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Order Total -->
            <div class="space-y-3">
              <div class="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Subtotal:</span>
                <span class="font-medium text-slate-900 dark:text-white">
                  {{ formatPrice(orderData?.subtotal || 0) }}
                </span>
              </div>

              <div class="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Frete:</span>
                <span class="font-medium text-slate-900 dark:text-white">
                  {{ formatPrice(orderData?.shipping || 0) }}
                </span>
              </div>

              <div class="flex justify-between text-lg font-bold bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-green-700 dark:text-green-400">
                <span>Total Pago:</span>
                <span>{{ formatPrice(orderData?.total || 0) }}</span>
              </div>
            </div>

            <!-- Delivery Info -->
            <div v-if="orderData?.shipping" class="bg-slate-50 dark:bg-slate-800 rounded-lg p-6">
              <h3 class="font-semibold text-slate-900 dark:text-white mb-3">
                Endereço de Entrega
              </h3>
              <p class="text-slate-700 dark:text-slate-300">
                {{ orderData.shipping.street }}, {{ orderData.shipping.number }}
                <span v-if="orderData.shipping.complement">
                  - {{ orderData.shipping.complement }}
                </span>
              </p>
              <p class="text-slate-700 dark:text-slate-300">
                {{ orderData.shipping.city }}, {{ orderData.shipping.state }} {{ orderData.shipping.zipCode }}
              </p>
            </div>

            <!-- Confirmation Message -->
            <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
              <div class="flex gap-3">
                <svg class="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zm-11-1a1 1 0 11-2 0 1 1 0 012 0z" clip-rule="evenodd" />
                </svg>
                <div>
                  <p class="font-semibold text-blue-900 dark:text-blue-400 mb-1">Confirmação enviada</p>
                  <p class="text-sm text-blue-800 dark:text-blue-300">
                    Um email de confirmação foi enviado para {{ orderData?.customer?.email }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <router-link
              to="/"
              class="flex items-center justify-center gap-2 px-6 py-3 bg-brand-600 dark:bg-brand-500 text-white font-semibold rounded-lg hover:bg-brand-700 dark:hover:bg-brand-600 transition"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-3m0 0l7-4 7 4M5 7v10a1 1 0 001 1h12a1 1 0 001-1V7M9 9h6m-6 4h6m6-7v10a2 2 0 01-2 2H5a2 2 0 01-2-2V9.413a2 2 0 011.447-1.897l6-2c.712-.237 1.495-.237 2.207 0l6 2A2 2 0 0121 9.413V19a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2z" />
              </svg>
              Continuar Comprando
            </router-link>

            <router-link
              to="/orders"
              class="flex items-center justify-center gap-2 px-6 py-3 bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-700 transition"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Ver Meus Pedidos
            </router-link>
          </div>
        </div>
      </div>

      <!-- Thank You Message -->
      <div class="mt-8 text-center">
        <p class="text-slate-600 dark:text-slate-400">
          Obrigado por sua compra! Você receberá atualizações sobre seu pedido por email.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { paymentService } from '../services/payment';
import { useCartStore } from '../stores/cart';

const route = useRoute();
const cartStore = useCartStore();

const loading = ref(true);
const error = ref('');
const orderData = ref(null);

const formatPrice = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

const loadOrderDetails = async () => {
  try {
    loading.value = true;

    // Try to get order ID from query params or localStorage
    let orderId = route.query.external_reference || localStorage.getItem('lastOrderId');

    if (!orderId) {
      error.value = 'ID do pedido não encontrado';
      return;
    }

    // Fetch order details
    const order = await paymentService.getOrderDetails(orderId);
    orderData.value = order;

    // Clear cart on successful payment
    cartStore.clearCart();
    localStorage.removeItem('lastOrderId');
  } catch (err) {
    console.error('Error loading order:', err);
    error.value = 'Falha ao carregar detalhes do pedido. Tente novamente mais tarde.';
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  // Add confetti animation if available
  if (typeof window !== 'undefined' && window.confetti) {
    window.confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  }

  loadOrderDetails();
});
</script>
