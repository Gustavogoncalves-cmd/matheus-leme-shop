<template>
  <main class="min-h-screen bg-neon-bg px-4 py-16 text-white">
    <section class="mx-auto max-w-2xl rounded-xl border border-green-500/30 bg-slate-900 p-8 text-center">
      <div class="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-500 text-3xl">✓</div>
      <h1 class="text-3xl font-bold">Pagamento recebido</h1>
      <p class="mt-3 text-slate-300">A confirmação do Mercado Pago pode levar alguns instantes.</p>
      <p v-if="loading" class="mt-8 text-slate-400">Consultando pedido...</p>
      <p v-else-if="error" class="mt-8 text-yellow-300">{{ error }}</p>
      <div v-else-if="order" class="mt-8 rounded-lg bg-slate-800 p-5 text-left">
        <div class="flex justify-between"><span>Pedido #{{ order.id }}</span><strong>{{ statusLabel }}</strong></div>
        <div class="mt-3 flex justify-between"><span>Total</span><strong>{{ money(order.total_price) }}</strong></div>
        <p class="mt-4 text-sm text-slate-400">Quando o status estiver Pago, os arquivos estarão em Meus Pedidos.</p>
      </div>
      <div class="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <router-link to="/orders" class="rounded-lg bg-green-500 px-6 py-3 font-bold text-slate-950">Meus Pedidos</router-link>
        <router-link to="/" class="rounded-lg bg-slate-700 px-6 py-3 font-bold">Voltar à loja</router-link>
      </div>
    </section>
  </main>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { paymentService } from '../services/payment';
import { useCartStore } from '../stores/cart';
const route = useRoute(); const cart = useCartStore();
const order = ref(null); const loading = ref(true); const error = ref('');
const labels = { pending_payment: 'Aguardando confirmação', paid: 'Pago', payment_failed: 'Pagamento recusado', refunded: 'Reembolsado' };
const statusLabel = computed(() => labels[order.value?.status] || order.value?.status);
const money = value => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value || 0));
onMounted(async () => {
  try {
    const reference = String(route.query.external_reference || '');
    const orderId = reference.startsWith('ORDER_') ? reference.slice(6) : localStorage.getItem('lastOrderId');
    if (!orderId) throw new Error('Pedido não identificado. Consulte Meus Pedidos.');
    order.value = await paymentService.getOrderDetails(orderId);
    if (order.value.status === 'paid') cart.clearCart();
  } catch (err) { error.value = err.message; } finally { loading.value = false; }
});
</script>
