<template>
  <div class="w-full">
    <div class="bg-white dark:bg-slate-900 rounded-lg shadow-lg p-6"
         :class="darkMode ? 'bg-slate-900' : 'bg-white'">

      <h2 class="text-2xl font-bold mb-6" :class="darkMode ? 'text-white' : 'text-slate-900'">
        Pedidos
      </h2>

      <!-- Filters -->
      <div class="flex gap-4 mb-6 flex-wrap">
        <div>
          <label class="block text-sm font-medium mb-2" :class="darkMode ? 'text-slate-300' : 'text-slate-700'">
            Status
          </label>
          <select
            v-model="filters.status"
            class="px-4 py-2 border rounded-lg"
            :class="darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300'"
          >
            <option value="">Todos</option>
            <option value="pending">Pendente</option>
            <option value="processing">Processando</option>
            <option value="shipped">Enviado</option>
            <option value="delivered">Entregue</option>
            <option value="cancelled">Cancelado</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium mb-2" :class="darkMode ? 'text-slate-300' : 'text-slate-700'">
            Data
          </label>
          <input
            v-model="filters.date"
            type="date"
            class="px-4 py-2 border rounded-lg"
            :class="darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300'"
          />
        </div>
      </div>

      <!-- Table -->
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b" :class="darkMode ? 'border-slate-800' : 'border-slate-200'">
              <th class="text-left py-3 px-4 font-semibold" :class="darkMode ? 'text-slate-300' : 'text-slate-700'">
                ID
              </th>
              <th class="text-left py-3 px-4 font-semibold" :class="darkMode ? 'text-slate-300' : 'text-slate-700'">
                Cliente
              </th>
              <th class="text-left py-3 px-4 font-semibold" :class="darkMode ? 'text-slate-300' : 'text-slate-700'">
                Total
              </th>
              <th class="text-left py-3 px-4 font-semibold" :class="darkMode ? 'text-slate-300' : 'text-slate-700'">
                Status
              </th>
              <th class="text-left py-3 px-4 font-semibold" :class="darkMode ? 'text-slate-300' : 'text-slate-700'">
                Data
              </th>
              <th class="text-left py-3 px-4 font-semibold" :class="darkMode ? 'text-slate-300' : 'text-slate-700'">
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in filteredOrders" :key="order.id"
                class="border-b" :class="darkMode ? 'border-slate-800' : 'border-slate-200'">
              <td class="py-3 px-4" :class="darkMode ? 'text-slate-300' : 'text-slate-700'">
                #{{ order.id }}
              </td>
              <td class="py-3 px-4" :class="darkMode ? 'text-slate-300' : 'text-slate-700'">
                {{ order.customerName }}
              </td>
              <td class="py-3 px-4 font-semibold" :class="darkMode ? 'text-white' : 'text-slate-900'">
                R$ {{ order.total.toFixed(2) }}
              </td>
              <td class="py-3 px-4">
                <span class="px-3 py-1 rounded-full text-xs font-semibold"
                      :class="getStatusBadgeClass(order.status)">
                  {{ getStatusLabel(order.status) }}
                </span>
              </td>
              <td class="py-3 px-4 text-sm" :class="darkMode ? 'text-slate-400' : 'text-slate-500'">
                {{ formatDate(order.date) }}
              </td>
              <td class="py-3 px-4">
                <button @click="$emit('view', order.id)"
                        class="text-xs font-semibold px-3 py-1 rounded transition-colors"
                        :class="darkMode ? 'text-brand-400 hover:text-brand-300' : 'text-brand-600 hover:text-brand-700'">
                  Ver
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty State -->
      <div v-if="filteredOrders.length === 0" class="text-center py-12">
        <p :class="darkMode ? 'text-slate-400' : 'text-slate-500'">
          Nenhum pedido encontrado
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';

const props = defineProps({
  orders: {
    type: Array,
    default: () => [],
  },
  darkMode: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['view']);

const filters = reactive({
  status: '',
  date: '',
});

const filteredOrders = computed(() => {
  return props.orders.filter(order => {
    if (filters.status && order.status !== filters.status) {
      return false;
    }
    if (filters.date) {
      const orderDate = new Date(order.date).toISOString().split('T')[0];
      if (orderDate !== filters.date) {
        return false;
      }
    }
    return true;
  });
});

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

const formatDate = (date) => {
  const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
  return new Date(date).toLocaleDateString('pt-BR', options);
};
</script>
