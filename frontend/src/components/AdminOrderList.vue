<template>
  <section class="w-full rounded-lg bg-white p-6 shadow-lg dark:bg-slate-900">
    <h2 class="mb-6 text-2xl font-bold text-slate-900 dark:text-white">Pedidos</h2>
    <select v-model="status" class="mb-6 rounded-lg border px-4 py-2 dark:border-slate-700 dark:bg-slate-800 dark:text-white">
      <option value="">Todos os status</option>
      <option value="pending_payment">Aguardando pagamento</option>
      <option value="paid">Pago</option>
      <option value="payment_failed">Pagamento recusado</option>
      <option value="refunded">Reembolsado</option>
      <option value="cancelled">Cancelado</option>
    </select>

    <div class="overflow-x-auto">
      <table class="w-full">
        <thead><tr class="border-b text-left dark:border-slate-800 dark:text-slate-300">
          <th class="p-3">ID</th><th class="p-3">Cliente</th><th class="p-3">Total</th>
          <th class="p-3">Status</th><th class="p-3">Data</th><th class="p-3">Ações</th>
        </tr></thead>
        <tbody>
          <tr v-for="order in filteredOrders" :key="order.id" class="border-b dark:border-slate-800 dark:text-slate-300">
            <td class="p-3">#{{ order.id }}</td>
            <td class="p-3"><strong>{{ order.customer_name || `Usuário #${order.user_id}` }}</strong><br><small>{{ order.customer_email }}</small></td>
            <td class="p-3 font-semibold">{{ money(order.total_price) }}</td>
            <td class="p-3"><span class="rounded-full px-3 py-1 text-xs font-semibold" :class="badge(order.status)">{{ label(order.status) }}</span></td>
            <td class="p-3">{{ date(order.created_at) }}</td>
            <td class="p-3"><button class="font-semibold text-brand-600" @click="$emit('view', order.id)">Ver</button></td>
          </tr>
        </tbody>
      </table>
    </div>
    <p v-if="!filteredOrders.length" class="py-12 text-center text-slate-500">Nenhum pedido encontrado</p>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue';
const props = defineProps({ orders: { type: Array, default: () => [] } });
defineEmits(['view']);
const status = ref('');
const filteredOrders = computed(() => props.orders.filter(order => !status.value || order.status === status.value));
const labels = { pending_payment: 'Aguardando pagamento', paid: 'Pago', payment_failed: 'Recusado', refunded: 'Reembolsado', cancelled: 'Cancelado' };
const classes = { pending_payment: 'bg-yellow-100 text-yellow-800', paid: 'bg-green-100 text-green-800', payment_failed: 'bg-red-100 text-red-800', refunded: 'bg-purple-100 text-purple-800', cancelled: 'bg-slate-200 text-slate-700' };
const label = value => labels[value] || value;
const badge = value => classes[value] || classes.cancelled;
const money = value => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value || 0));
const date = value => new Intl.DateTimeFormat('pt-BR').format(new Date(value));
</script>
