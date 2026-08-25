<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-8 px-4">
    <div class="w-full max-w-4xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl md:text-4xl font-bold text-white font-display uppercase tracking-tight">
          Meus Pedidos
        </h1>
        <p class="mt-2 text-slate-400">
          Acompanhe o status de todas as suas compras
        </p>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="text-center py-16">
        <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-800 mb-4">
          <svg class="animate-spin w-6 h-6 text-neon-lime" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <p class="text-slate-400 font-medium">Carregando pedidos...</p>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="text-center py-16">
        <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-900/30 mb-4">
          <svg class="w-6 h-6 text-red-400" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </div>
        <p class="text-red-400 font-medium">{{ error }}</p>
        <button
          @click="loadOrders"
          class="mt-4 px-4 py-2 bg-neon-lime text-black font-semibold rounded-lg hover:brightness-110 transition"
        >
          Tentar Novamente
        </button>
      </div>

      <!-- Empty State -->
      <div v-else-if="orders.length === 0" class="text-center py-16 bg-slate-900/50 rounded-xl border border-neon-line">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-800 mb-4">
          <Package class="w-8 h-8 text-slate-500" />
        </div>
        <h2 class="text-xl font-bold text-white mb-2">Nenhum pedido ainda</h2>
        <p class="text-slate-400 mb-6">Voce ainda nao fez nenhuma compra.</p>
        <router-link
          to="/"
          class="inline-flex items-center gap-2 px-6 py-3 bg-neon-lime text-black font-semibold rounded-lg hover:brightness-110 transition"
        >
          <ShoppingBag class="w-5 h-5" />
          Explorar Produtos
        </router-link>
      </div>

      <!-- Orders List -->
      <div v-else class="space-y-4">
        <div
          v-for="order in orders"
          :key="order.id"
          class="bg-slate-900/80 rounded-xl border border-neon-line overflow-hidden hover:border-neon-lime/40 transition-colors"
        >
          <!-- Order Header -->
          <div class="p-4 md:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0">
                <Package class="w-6 h-6 text-neon-lime" />
              </div>
              <div>
                <p class="text-sm text-slate-400">Pedido #{{ order.id }}</p>
                <p class="text-white font-semibold">{{ formatDate(order.created_at) }}</p>
              </div>
            </div>

            <div class="flex items-center gap-4">
              <span
                class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide"
                :class="statusClasses[order.status] || statusClasses.pending"
              >
                {{ statusLabels[order.status] || order.status }}
              </span>
              <span class="text-white font-bold text-lg">
                {{ formatPrice(order.total_price) }}
              </span>
            </div>
          </div>

          <!-- Order Details (Expandable) -->
          <div class="border-t border-neon-line">
            <button
              @click="toggleExpand(order.id)"
              class="w-full px-4 md:px-6 py-3 flex items-center justify-between text-sm text-slate-400 hover:text-neon-lime transition-colors"
            >
              <span>{{ expanded[order.id] ? 'Ocultar detalhes' : 'Ver detalhes' }}</span>
              <ChevronDown
                class="w-4 h-4 transition-transform"
                :class="expanded[order.id] ? 'rotate-180' : ''"
              />
            </button>

            <div v-if="expanded[order.id]" class="px-4 md:px-6 pb-6">
              <!-- Order Items -->
              <div v-if="orderDetails[order.id]?.items?.length" class="mb-4">
                <h3 class="text-sm font-semibold text-slate-300 mb-2 uppercase tracking-wide">Itens</h3>
                <div class="space-y-2">
                  <div
                    v-for="item in orderDetails[order.id].items"
                    :key="item.id"
                    class="flex justify-between items-center py-2 border-b border-neon-line/50 last:border-0"
                  >
                    <div>
                      <p class="text-white font-medium">{{ item.product_title || `Produto #${item.product_id}` }}</p>
                      <p class="text-sm text-slate-400">Qtd: {{ item.quantity }}</p>
                    </div>
                    <div class="flex items-center gap-3">
                      <span class="text-white font-semibold">{{ formatPrice(item.price * item.quantity) }}</span>
                      <button
                        v-if="order.status === 'paid'"
                        class="text-sm font-semibold text-neon-lime hover:underline"
                        @click="downloadItem(order.id, item.id)"
                      >
                        Baixar
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Payment Method -->
              <div class="flex items-center justify-between text-sm">
                <span class="text-slate-400">Metodo de pagamento:</span>
                <span class="text-white font-medium capitalize">{{ order.payment_method || 'MercadoPago' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Package, ShoppingBag, ChevronDown } from 'lucide-vue-next';
import { ordersApi } from '../services/api';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const loading = ref(true);
const error = ref('');
const orders = ref([]);
const expanded = reactive({});
const orderDetails = reactive({});

const statusLabels = {
  pending_payment: 'Aguardando pagamento',
  paid: 'Pago',
  payment_failed: 'Pagamento recusado',
  refunded: 'Reembolsado',
  cancelled: 'Cancelado',
};

const statusClasses = {
  pending_payment: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
  paid: 'bg-green-500/20 text-green-400 border border-green-500/30',
  payment_failed: 'bg-red-500/20 text-red-400 border border-red-500/30',
  refunded: 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
  cancelled: 'bg-slate-500/20 text-slate-300 border border-slate-500/30',
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
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const toggleExpand = async (orderId) => {
  if (expanded[orderId]) {
    expanded[orderId] = false;
    return;
  }

  expanded[orderId] = true;

  // Fetch order details if not already loaded
  if (!orderDetails[orderId]) {
    try {
      const response = await ordersApi.getById(orderId);
      orderDetails[orderId] = response.data || response;
    } catch (err) {
      console.error('Error loading order details:', err);
    }
  }
};

const downloadItem = async (orderId, itemId) => {
  try {
    const blob = await ordersApi.downloadItem(orderId, itemId);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pedido-${orderId}-item-${itemId}`;
    link.click();
    URL.revokeObjectURL(url);
  } catch (err) {
    error.value = err.message || 'Falha ao baixar o produto.';
  }
};

const loadOrders = async () => {
  try {
    loading.value = true;
    error.value = '';

    // Ensure auth is initialized
    if (!authStore.isAuthenticated) {
      router.push({ name: 'login', query: { redirect: '/orders' } });
      return;
    }

    const response = await ordersApi.getAll();
    orders.value = response.data?.orders || response.data || [];
  } catch (err) {
    console.error('Error loading orders:', err);
    error.value = 'Falha ao carregar pedidos. Tente novamente mais tarde.';
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadOrders();
});
</script>
