<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-8 px-4">
    <div class="w-full max-w-4xl mx-auto space-y-6">
      <!-- Profile Card -->
      <div class="bg-slate-900/80 rounded-xl border border-neon-line p-6 md:p-8">
        <div class="flex items-center gap-4 mb-6">
          <div class="w-16 h-16 rounded-full bg-neon-lime/10 border border-neon-lime/30 flex items-center justify-center flex-shrink-0">
            <User class="w-8 h-8 text-neon-lime" />
          </div>
          <div>
            <h1 class="text-2xl md:text-3xl font-bold text-white font-display">
              {{ user?.name || 'Meu Perfil' }}
            </h1>
            <p class="text-slate-400">{{ user?.email }}</p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="bg-slate-800/50 rounded-lg p-4">
            <p class="text-xs text-slate-500 uppercase tracking-wide mb-1">Nome</p>
            <p class="text-white font-medium">{{ user?.name || '-' }}</p>
          </div>
          <div class="bg-slate-800/50 rounded-lg p-4">
            <p class="text-xs text-slate-500 uppercase tracking-wide mb-1">Email</p>
            <p class="text-white font-medium">{{ user?.email || '-' }}</p>
          </div>
          <div class="bg-slate-800/50 rounded-lg p-4">
            <p class="text-xs text-slate-500 uppercase tracking-wide mb-1">Conta</p>
            <p class="text-white font-medium capitalize">{{ user?.role === 'admin' ? 'Administrador' : 'Cliente' }}</p>
          </div>
          <div class="bg-slate-800/50 rounded-lg p-4">
            <p class="text-xs text-slate-500 uppercase tracking-wide mb-1">Pedidos</p>
            <p class="text-white font-medium">{{ orders.length }} pedido{{ orders.length === 1 ? '' : 's' }}</p>
          </div>
        </div>
      </div>

      <!-- Orders Section -->
      <div>
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-bold text-white font-display">Meus Pedidos</h2>
          <router-link
            to="/orders"
            class="text-sm text-neon-lime hover:underline flex items-center gap-1"
          >
            Ver todos
            <ArrowRight class="w-4 h-4" />
          </router-link>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="text-center py-12 bg-slate-900/50 rounded-xl border border-neon-line">
          <div class="inline-flex items-center justify-center w-10 h-10 rounded-full bg-slate-800 mb-3">
            <svg class="animate-spin w-5 h-5 text-neon-lime" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <p class="text-slate-400 text-sm">Carregando pedidos...</p>
        </div>

        <!-- Error -->
        <div v-else-if="error" class="text-center py-12 bg-slate-900/50 rounded-xl border border-neon-line">
          <p class="text-red-400 text-sm">{{ error }}</p>
        </div>

        <!-- Empty -->
        <div v-else-if="orders.length === 0" class="text-center py-12 bg-slate-900/50 rounded-xl border border-neon-line">
          <Package class="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p class="text-slate-400 text-sm">Nenhum pedido ainda</p>
          <router-link
            to="/"
            class="mt-3 inline-block text-sm text-neon-lime hover:underline"
          >
            Ir as compras
          </router-link>
        </div>

        <!-- Orders List (last 5) -->
        <div v-else class="space-y-3">
          <div
            v-for="order in orders.slice(0, 5)"
            :key="order.id"
            class="bg-slate-900/80 rounded-xl border border-neon-line p-4 md:p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
          >
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0">
                <Package class="w-5 h-5 text-neon-lime" />
              </div>
              <div>
                <p class="text-sm text-slate-400">Pedido #{{ order.id }}</p>
                <p class="text-white font-medium">{{ formatDate(order.created_at) }}</p>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <span
                class="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide"
                :class="statusClasses[order.status] || statusClasses.pending"
              >
                {{ statusLabels[order.status] || order.status }}
              </span>
              <span class="text-white font-bold">{{ formatPrice(order.total_price) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { User, Package, ArrowRight } from 'lucide-vue-next';
import { ordersApi } from '../services/api';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const loading = ref(true);
const error = ref('');
const orders = ref([]);

const user = computed(() => authStore.user);

const statusLabels = {
  pending: 'Pendente',
  processing: 'Em Processamento',
  shipped: 'Enviado',
  delivered: 'Entregue',
  cancelled: 'Cancelado',
};

const statusClasses = {
  pending: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
  processing: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
  shipped: 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
  delivered: 'bg-green-500/20 text-green-400 border border-green-500/30',
  cancelled: 'bg-red-500/20 text-red-400 border border-red-500/30',
};

const formatPrice = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value || 0);
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

onMounted(async () => {
  if (!authStore.isAuthenticated) {
    router.push({ name: 'login', query: { redirect: '/perfil' } });
    return;
  }

  try {
    loading.value = true;
    const response = await ordersApi.getAll();
    orders.value = response.data?.orders || response.data || [];
  } catch (err) {
    console.error('Error loading orders:', err);
    error.value = 'Falha ao carregar pedidos.';
  } finally {
    loading.value = false;
  }
});
</script>
