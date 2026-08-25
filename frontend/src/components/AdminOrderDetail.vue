<template>
  <section class="w-full max-w-4xl rounded-lg bg-white p-8 shadow-lg dark:bg-slate-900 dark:text-white">
    <div class="mb-6 flex items-center justify-between">
      <h2 class="text-3xl font-bold">Pedido #{{ order?.id }}</h2>
      <button class="font-bold text-brand-600" @click="$emit('back')">← Voltar</button>
    </div>
    <p v-if="loading">Carregando...</p>
    <div v-else-if="order" class="space-y-6">
      <div class="grid gap-4 rounded-lg bg-slate-50 p-4 dark:bg-slate-800 md:grid-cols-3">
        <div><small>Status</small><p class="font-semibold">{{ label(order.status) }}</p></div>
        <div><small>Total</small><p class="font-semibold">{{ money(order.total_price) }}</p></div>
        <div><small>Data</small><p class="font-semibold">{{ date(order.created_at) }}</p></div>
      </div>
      <div>
        <h3 class="mb-3 text-lg font-semibold">Itens digitais</h3>
        <div v-for="item in order.items" :key="item.id" class="flex justify-between border-b py-3 dark:border-slate-800">
          <span>{{ item.product_title || `Produto #${item.product_id}` }} × {{ item.quantity }}</span>
          <strong>{{ money(Number(item.price) * item.quantity) }}</strong>
        </div>
      </div>
      <div class="flex flex-wrap items-center gap-3">
        <label for="order-status" class="font-semibold">Atualizar status:</label>
        <select id="order-status" v-model="newStatus" class="rounded border px-3 py-2 dark:border-slate-700 dark:bg-slate-800">
          <option value="pending_payment">Aguardando pagamento</option>
          <option value="paid">Pago</option>
          <option value="payment_failed">Pagamento recusado</option>
          <option value="refunded">Reembolsado</option>
          <option value="cancelled">Cancelado</option>
        </select>
        <button :disabled="updating || newStatus === order.status" class="rounded bg-brand-600 px-4 py-2 font-bold text-white disabled:opacity-50" @click="updateStatus">
          {{ updating ? 'Atualizando...' : 'Atualizar' }}
        </button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useAdminStore } from '../stores/admin';
const props = defineProps({ orderId: { type: [String, Number], required: true } });
const emit = defineEmits(['back', 'status-updated']);
const store = useAdminStore();
const order = ref(null); const loading = ref(true); const updating = ref(false); const newStatus = ref('');
const labels = { pending_payment: 'Aguardando pagamento', paid: 'Pago', payment_failed: 'Pagamento recusado', refunded: 'Reembolsado', cancelled: 'Cancelado' };
const label = value => labels[value] || value;
const money = value => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value || 0));
const date = value => new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
const updateStatus = async () => { updating.value = true; try { order.value = await store.updateOrderStatus(order.value.id, newStatus.value); emit('status-updated'); } finally { updating.value = false; } };
onMounted(async () => { try { order.value = await store.getOrderById(props.orderId); newStatus.value = order.value.status; } finally { loading.value = false; } });
</script>
