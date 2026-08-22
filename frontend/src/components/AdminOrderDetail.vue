<template>
  <div class="w-full max-w-4xl">
    <div class="bg-white dark:bg-slate-900 rounded-lg shadow-lg p-8"
         :class="darkMode ? 'bg-slate-900' : 'bg-white'">

      <div class="flex items-center justify-between mb-6">
        <h2 class="text-3xl font-bold" :class="darkMode ? 'text-white' : 'text-slate-900'">
          Pedido #{{ order?.id }}
        </h2>
        <button @click="$emit('back')"
                class="px-4 py-2 rounded-lg font-bold transition-colors"
                :class="darkMode ? 'text-brand-400 hover:text-brand-300' : 'text-brand-600 hover:text-brand-700'">
          ← Voltar
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="space-y-6">
        <div v-for="i in 4" :key="i" class="h-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
      </div>

      <!-- Order Details -->
      <div v-else class="space-y-6">
        <!-- Status Section -->
        <div class="border-b pb-6" :class="darkMode ? 'border-slate-800' : 'border-slate-200'">
          <h3 class="text-lg font-semibold mb-4" :class="darkMode ? 'text-white' : 'text-slate-900'">
            Status do Pedido
          </h3>
          <div class="flex items-center justify-between">
            <span class="px-4 py-2 rounded-full text-sm font-semibold"
                  :class="getStatusBadgeClass(order?.status)">
              {{ getStatusLabel(order?.status) }}
            </span>
            <div class="flex gap-2">
              <select v-model="newStatus"
                      class="px-4 py-2 border rounded-lg text-sm"
                      :class="darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300'">
                <option value="pending">Pendente</option>
                <option value="processing">Processando</option>
                <option value="shipped">Enviado</option>
                <option value="delivered">Entregue</option>
                <option value="cancelled">Cancelado</option>
              </select>
              <button @click="updateOrderStatus"
                      :disabled="isUpdating || newStatus === order?.status"
                      class="px-4 py-2 rounded-lg text-white font-bold transition-colors"
                      :class="isUpdating || newStatus === order?.status
                        ? 'bg-slate-400 cursor-not-allowed'
                        : 'bg-brand-600 hover:bg-brand-700'">
                {{ isUpdating ? 'Atualizando...' : 'Atualizar' }}
              </button>
            </div>
          </div>
          <p class="text-sm mt-4" :class="darkMode ? 'text-slate-400' : 'text-slate-600'">
            Data do pedido: {{ formatDate(order?.date) }}
          </p>
        </div>

        <!-- Customer Info -->
        <div class="border-b pb-6" :class="darkMode ? 'border-slate-800' : 'border-slate-200'">
          <h3 class="text-lg font-semibold mb-4" :class="darkMode ? 'text-white' : 'text-slate-900'">
            Informações do Cliente
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p class="text-sm" :class="darkMode ? 'text-slate-400' : 'text-slate-600'">
                Nome
              </p>
              <p class="font-semibold" :class="darkMode ? 'text-white' : 'text-slate-900'">
                {{ order?.customerName }}
              </p>
            </div>
            <div>
              <p class="text-sm" :class="darkMode ? 'text-slate-400' : 'text-slate-600'">
                Email
              </p>
              <p class="font-semibold" :class="darkMode ? 'text-white' : 'text-slate-900'">
                {{ order?.customerEmail }}
              </p>
            </div>
            <div>
              <p class="text-sm" :class="darkMode ? 'text-slate-400' : 'text-slate-600'">
                Telefone
              </p>
              <p class="font-semibold" :class="darkMode ? 'text-white' : 'text-slate-900'">
                {{ order?.customerPhone }}
              </p>
            </div>
            <div>
              <p class="text-sm" :class="darkMode ? 'text-slate-400' : 'text-slate-600'">
                Endereço
              </p>
              <p class="font-semibold" :class="darkMode ? 'text-white' : 'text-slate-900'">
                {{ order?.shippingAddress }}
              </p>
            </div>
          </div>
        </div>

        <!-- Order Items -->
        <div class="border-b pb-6" :class="darkMode ? 'border-slate-800' : 'border-slate-200'">
          <h3 class="text-lg font-semibold mb-4" :class="darkMode ? 'text-white' : 'text-slate-900'">
            Itens do Pedido
          </h3>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="border-b" :class="darkMode ? 'border-slate-800' : 'border-slate-200'">
                  <th class="text-left py-3 px-4 font-semibold" :class="darkMode ? 'text-slate-300' : 'text-slate-700'">
                    Produto
                  </th>
                  <th class="text-left py-3 px-4 font-semibold" :class="darkMode ? 'text-slate-300' : 'text-slate-700'">
                    Quantidade
                  </th>
                  <th class="text-left py-3 px-4 font-semibold" :class="darkMode ? 'text-slate-300' : 'text-slate-700'">
                    Preço Unit.
                  </th>
                  <th class="text-left py-3 px-4 font-semibold" :class="darkMode ? 'text-slate-300' : 'text-slate-700'">
                    Subtotal
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in order?.items" :key="item.id"
                    class="border-b" :class="darkMode ? 'border-slate-800' : 'border-slate-200'">
                  <td class="py-3 px-4" :class="darkMode ? 'text-slate-300' : 'text-slate-700'">
                    {{ item.productName }}
                  </td>
                  <td class="py-3 px-4" :class="darkMode ? 'text-slate-300' : 'text-slate-700'">
                    {{ item.quantity }}
                  </td>
                  <td class="py-3 px-4 font-semibold" :class="darkMode ? 'text-white' : 'text-slate-900'">
                    R$ {{ item.price.toFixed(2) }}
                  </td>
                  <td class="py-3 px-4 font-semibold" :class="darkMode ? 'text-white' : 'text-slate-900'">
                    R$ {{ (item.quantity * item.price).toFixed(2) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Order Summary -->
        <div class="border-b pb-6" :class="darkMode ? 'border-slate-800' : 'border-slate-200'">
          <h3 class="text-lg font-semibold mb-4" :class="darkMode ? 'text-white' : 'text-slate-900'">
            Resumo do Pedido
          </h3>
          <div class="space-y-2">
            <div class="flex justify-between">
              <p :class="darkMode ? 'text-slate-400' : 'text-slate-600'">Subtotal</p>
              <p class="font-semibold" :class="darkMode ? 'text-white' : 'text-slate-900'">
                R$ {{ order?.subtotal?.toFixed(2) }}
              </p>
            </div>
            <div v-if="order?.shippingCost > 0" class="flex justify-between">
              <p :class="darkMode ? 'text-slate-400' : 'text-slate-600'">Frete</p>
              <p class="font-semibold" :class="darkMode ? 'text-white' : 'text-slate-900'">
                R$ {{ order?.shippingCost?.toFixed(2) }}
              </p>
            </div>
            <div v-if="order?.tax > 0" class="flex justify-between">
              <p :class="darkMode ? 'text-slate-400' : 'text-slate-600'">Impostos</p>
              <p class="font-semibold" :class="darkMode ? 'text-white' : 'text-slate-900'">
                R$ {{ order?.tax?.toFixed(2) }}
              </p>
            </div>
            <div class="border-t pt-2" :class="darkMode ? 'border-slate-800' : 'border-slate-200'">
              <div class="flex justify-between">
                <p class="font-bold" :class="darkMode ? 'text-white' : 'text-slate-900'">Total</p>
                <p class="text-2xl font-bold text-brand-600">
                  R$ {{ order?.total?.toFixed(2) }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Status History -->
        <div v-if="order?.statusHistory && order.statusHistory.length > 0">
          <h3 class="text-lg font-semibold mb-4" :class="darkMode ? 'text-white' : 'text-slate-900'">
            Histórico de Status
          </h3>
          <div class="space-y-3">
            <div v-for="entry in order.statusHistory" :key="entry.id"
                 class="p-4 rounded-lg"
                 :class="darkMode ? 'bg-slate-800' : 'bg-slate-50'">
              <div class="flex justify-between items-start">
                <div>
                  <p class="font-semibold" :class="darkMode ? 'text-white' : 'text-slate-900'">
                    {{ getStatusLabel(entry.status) }}
                  </p>
                  <p class="text-sm" :class="darkMode ? 'text-slate-400' : 'text-slate-600'">
                    {{ formatDate(entry.date) }} às {{ formatTime(entry.date) }}
                  </p>
                </div>
                <span class="px-3 py-1 rounded-full text-xs font-semibold"
                      :class="getStatusBadgeClass(entry.status)">
                  {{ getStatusLabel(entry.status) }}
                </span>
              </div>
              <p v-if="entry.note" class="text-sm mt-2" :class="darkMode ? 'text-slate-300' : 'text-slate-700'">
                {{ entry.note }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAdminStore } from '../stores/admin';

const props = defineProps({
  orderId: {
    type: [String, Number],
    required: true,
  },
  darkMode: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['back', 'status-updated']);

const adminStore = useAdminStore();
const isLoading = ref(false);
const isUpdating = ref(false);
const order = ref(null);
const newStatus = ref('');

const formatDate = (date) => {
  const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
  return new Date(date).toLocaleDateString('pt-BR', options);
};

const formatTime = (date) => {
  const options = { hour: '2-digit', minute: '2-digit' };
  return new Date(date).toLocaleTimeString('pt-BR', options);
};

const getStatusLabel = (status) => {
  const labels = {
    pending: 'Pendente',
    processing: 'Processando',
    shipped: 'Enviado',
    delivered: 'Entregue',
    cancelled: 'Cancelado',
  };
  return labels[status] || status;
};

const getStatusBadgeClass = (status) => {
  const classes = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    shipped: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    delivered: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  };
  return classes[status] || 'bg-gray-100 text-gray-800';
};

const updateOrderStatus = async () => {
  if (!newStatus.value || newStatus.value === order.value?.status) {
    return;
  }

  isUpdating.value = true;
  try {
    await adminStore.updateOrderStatus(props.orderId, newStatus.value);
    order.value.status = newStatus.value;
    emit('status-updated', newStatus.value);
  } catch (err) {
    console.error('Error updating order status:', err);
    alert('Erro ao atualizar status: ' + err.message);
  } finally {
    isUpdating.value = false;
  }
};

onMounted(async () => {
  isLoading.value = true;
  try {
    order.value = await adminStore.getOrderById(props.orderId);
    if (order.value) {
      newStatus.value = order.value.status;
    }
  } catch (err) {
    console.error('Failed to fetch order:', err);
    alert('Erro ao carregar pedido: ' + err.message);
  } finally {
    isLoading.value = false;
  }
});
</script>
