<template>
  <div class="w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
    <div class="lg:col-span-2 bg-white dark:bg-slate-900 rounded-lg shadow-lg p-6 md:p-8">
      <h2 class="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">Finalizar compra</h2>
      <p class="mt-3 text-slate-600 dark:text-slate-300">
        Você será direcionado ao Mercado Pago. Após a confirmação, o download ficará disponível em Meus Pedidos.
      </p>
      <button
        type="button"
        :disabled="isLoading || cartItems.length === 0"
        class="mt-8 w-full py-3 px-4 rounded-lg text-white font-bold text-lg transition-colors"
        :class="isLoading || cartItems.length === 0 ? 'bg-slate-400 cursor-not-allowed' : 'bg-brand-600 hover:bg-brand-700'"
        @click="handleSubmit"
      >
        {{ isLoading ? 'Processando...' : 'Pagar com Mercado Pago' }}
      </button>
    </div>

    <aside class="bg-white dark:bg-slate-900 rounded-lg shadow-lg p-6">
      <h3 class="text-xl font-bold mb-6 text-slate-900 dark:text-white">Resumo do pedido</h3>
      <div class="space-y-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div v-for="item in cartItems" :key="item.id" class="flex justify-between gap-4">
          <div>
            <p class="font-medium text-slate-900 dark:text-white">{{ item.title }}</p>
            <p class="text-sm text-slate-500">Qtd: {{ item.quantity }}</p>
          </div>
          <span class="font-semibold text-slate-900 dark:text-white">
            {{ formatPrice(unitPrice(item) * item.quantity) }}
          </span>
        </div>
      </div>
      <div class="mt-6 flex justify-between text-lg font-bold text-slate-900 dark:text-white">
        <span>Total estimado</span>
        <span>{{ formatPrice(cartTotal) }}</span>
      </div>
      <p class="mt-2 text-xs text-slate-500">O valor final é recalculado pelo servidor.</p>
    </aside>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useCartStore } from '../stores/cart';

const emit = defineEmits(['submit']);
const cartStore = useCartStore();
const isLoading = ref(false);
const cartItems = computed(() => cartStore.items);
const cartTotal = computed(() => cartStore.total);

const unitPrice = item => Number(item.price) * (1 - Number(item.discount || 0) / 100);
const formatPrice = value => new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
}).format(value);

const handleSubmit = () => {
  if (!cartItems.value.length) return;
  isLoading.value = true;
  emit('submit', { items: cartItems.value });
};

onMounted(() => cartStore.initCart());
</script>
