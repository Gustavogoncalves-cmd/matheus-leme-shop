<template>
  <div class="w-full space-y-6">
    <!-- Metrics Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Total Sales Card -->
      <div class="bg-white dark:bg-slate-900 rounded-lg shadow-lg p-6"
           :class="darkMode ? 'bg-slate-900' : 'bg-white'">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium" :class="darkMode ? 'text-slate-400' : 'text-slate-600'">
              Total de Vendas
            </p>
            <p v-if="!isLoading" class="text-3xl font-bold mt-2" :class="darkMode ? 'text-white' : 'text-slate-900'">
              R$ {{ formatCurrency(metrics?.totalSales || 0) }}
            </p>
            <div v-else class="mt-2 h-8 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
          </div>
          <div class="text-brand-500 text-4xl">💰</div>
        </div>
      </div>

      <!-- Total Orders Card -->
      <div class="bg-white dark:bg-slate-900 rounded-lg shadow-lg p-6"
           :class="darkMode ? 'bg-slate-900' : 'bg-white'">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium" :class="darkMode ? 'text-slate-400' : 'text-slate-600'">
              Total de Pedidos
            </p>
            <p v-if="!isLoading" class="text-3xl font-bold mt-2" :class="darkMode ? 'text-white' : 'text-slate-900'">
              {{ metrics?.totalOrders || 0 }}
            </p>
            <div v-else class="mt-2 h-8 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
          </div>
          <div class="text-blue-500 text-4xl">📦</div>
        </div>
      </div>

      <!-- Total Customers Card -->
      <div class="bg-white dark:bg-slate-900 rounded-lg shadow-lg p-6"
           :class="darkMode ? 'bg-slate-900' : 'bg-white'">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium" :class="darkMode ? 'text-slate-400' : 'text-slate-600'">
              Total de Clientes
            </p>
            <p v-if="!isLoading" class="text-3xl font-bold mt-2" :class="darkMode ? 'text-white' : 'text-slate-900'">
              {{ metrics?.totalCustomers || 0 }}
            </p>
            <div v-else class="mt-2 h-8 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
          </div>
          <div class="text-emerald-500 text-4xl">👥</div>
        </div>
      </div>
    </div>

    <!-- Recent Orders Section -->
    <div class="bg-white dark:bg-slate-900 rounded-lg shadow-lg p-6"
         :class="darkMode ? 'bg-slate-900' : 'bg-white'">
      <h3 class="text-xl font-bold mb-4" :class="darkMode ? 'text-white' : 'text-slate-900'">
        Últimos Pedidos
      </h3>

      <div v-if="isLoading" class="space-y-4">
        <div v-for="i in 3" :key="i" class="h-16 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
      </div>

      <div v-else-if="recentOrders.length === 0" class="text-center py-8">
        <p :class="darkMode ? 'text-slate-400' : 'text-slate-500'">
          Nenhum pedido encontrado
        </p>
      </div>

      <div v-else class="overflow-x-auto">
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
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in recentOrders" :key="order.id"
                class="border-b" :class="darkMode ? 'border-slate-800' : 'border-slate-200'">
              <td class="py-3 px-4" :class="darkMode ? 'text-slate-300' : 'text-slate-700'">
                #{{ order.id }}
              </td>
              <td class="py-3 px-4" :class="darkMode ? 'text-slate-300' : 'text-slate-700'">
                {{ order.customerName }}
              </td>
              <td class="py-3 px-4 font-semibold" :class="darkMode ? 'text-white' : 'text-slate-900'">
                R$ {{ formatCurrency(order.total) }}
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
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Top Products Section -->
    <div class="bg-white dark:bg-slate-900 rounded-lg shadow-lg p-6"
         :class="darkMode ? 'bg-slate-900' : 'bg-white'">
      <h3 class="text-xl font-bold mb-4" :class="darkMode ? 'text-white' : 'text-slate-900'">
        Produtos Mais Vendidos
      </h3>

      <div v-if="isLoading" class="space-y-4">
        <div v-for="i in 3" :key="i" class="h-16 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
      </div>

      <div v-else-if="topProducts.length === 0" class="text-center py-8">
        <p :class="darkMode ? 'text-slate-400' : 'text-slate-500'">
          Nenhum produto vendido ainda
        </p>
      </div>

      <div v-else class="space-y-4">
        <div v-for="(product, idx) in topProducts" :key="product.id"
             class="flex items-center justify-between p-4 rounded-lg"
             :class="darkMode ? 'bg-slate-800' : 'bg-slate-50'">
          <div class="flex items-center gap-4">
            <div class="flex items-center justify-center w-10 h-10 rounded-full font-bold"
                 :class="darkMode ? 'bg-slate-700' : 'bg-slate-200'">
              {{ idx + 1 }}
            </div>
            <div>
              <p class="font-semibold" :class="darkMode ? 'text-white' : 'text-slate-900'">
                {{ product.title }}
              </p>
              <p class="text-sm" :class="darkMode ? 'text-slate-400' : 'text-slate-600'">
                {{ product.sales }} vendas
              </p>
            </div>
          </div>
          <p class="font-semibold" :class="darkMode ? 'text-white' : 'text-slate-900'">
            R$ {{ formatCurrency(product.revenue) }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAdminStore } from '../stores/admin';

const props = defineProps({
  darkMode: {
    type: Boolean,
    default: false,
  },
});

const adminStore = useAdminStore();
const isLoading = ref(false);

const metrics = computed(() => adminStore.dashboardMetrics);

const recentOrders = computed(() => {
  return (metrics.value?.recentOrders || []).slice(0, 5);
});

const topProducts = computed(() => {
  return (metrics.value?.topProducts || []).slice(0, 5);
});

const formatCurrency = (value) => {
  return typeof value === 'number' ? value.toFixed(2) : '0.00';
};

const formatDate = (date) => {
  const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
  return new Date(date).toLocaleDateString('pt-BR', options);
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

onMounted(async () => {
  isLoading.value = true;
  try {
    await adminStore.fetchDashboardMetrics();
  } catch (err) {
    console.error('Failed to fetch metrics:', err);
  } finally {
    isLoading.value = false;
  }
});
</script>
