<template>
  <main class="min-h-screen bg-slate-50 dark:bg-slate-950">
    <!-- Navigation Bar -->
    <nav class="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40">
      <div class="px-6 py-4 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <button @click="sidebarOpen = !sidebarOpen"
                  class="lg:hidden p-2 rounded-lg"
                  :class="darkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-100'">
            ☰
          </button>
          <h1 class="text-2xl font-bold" :class="darkMode ? 'text-white' : 'text-slate-900'">
            Admin Panel
          </h1>
        </div>
        <button @click="toggleDarkMode"
                class="p-2 rounded-lg"
                :class="darkMode ? 'bg-slate-800 text-yellow-400' : 'bg-slate-100 text-slate-600'">
          {{ darkMode ? '☀️' : '🌙' }}
        </button>
      </div>
    </nav>

    <div class="flex">
      <!-- Sidebar -->
      <aside class="fixed left-0 top-16 h-[calc(100vh-64px)] w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 overflow-y-auto transition-transform z-30"
             :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'">
        <nav class="p-6 space-y-2">
          <button @click="selectTab('dashboard')"
                  class="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors"
                  :class="activeTab === 'dashboard'
                    ? 'bg-brand-600 text-white'
                    : darkMode ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-100'">
            <span class="text-xl">📊</span>
            Dashboard
          </button>

          <button @click="selectTab('products')"
                  class="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors"
                  :class="activeTab === 'products'
                    ? 'bg-brand-600 text-white'
                    : darkMode ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-100'">
            <span class="text-xl">📦</span>
            Produtos
          </button>

          <button @click="selectTab('content')"
                  class="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors"
                  :class="activeTab === 'content'
                    ? 'bg-brand-600 text-white'
                    : darkMode ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-100'">
            <span class="text-xl">📝</span>
            Conteúdo
          </button>

          <button @click="selectTab('orders')"
                  class="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors"
                  :class="activeTab === 'orders'
                    ? 'bg-brand-600 text-white'
                    : darkMode ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-100'">
            <span class="text-xl">🛒</span>
            Pedidos
          </button>

          <div class="border-t pt-4" :class="darkMode ? 'border-slate-800' : 'border-slate-200'">
            <button @click="handleLogout"
                    class="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
              <span class="text-xl">🚪</span>
              Logout
            </button>
          </div>
        </nav>
      </aside>

      <!-- Overlay for mobile -->
      <div v-if="sidebarOpen" class="fixed inset-0 bg-black/50 lg:hidden z-20"
           @click="sidebarOpen = false"></div>

      <!-- Main Content -->
      <main class="flex-1 lg:ml-64 p-6">
        <!-- Dashboard Tab -->
        <div v-if="activeTab === 'dashboard'">
          <div class="mb-6">
            <h2 class="text-3xl font-bold" :class="darkMode ? 'text-white' : 'text-slate-900'">
              Dashboard
            </h2>
            <p class="text-sm mt-2" :class="darkMode ? 'text-slate-400' : 'text-slate-600'">
              Bem-vindo ao painel de administração
            </p>
          </div>
          <AdminDashboard :dark-mode="darkMode" />
        </div>

        <!-- Products Tab -->
        <div v-if="activeTab === 'products'">
          <AdminProductList
            :dark-mode="darkMode"
            @edit="editProduct"
            @new-product="newProduct"
            @deleted="refreshProducts"
          />

          <!-- Product Form Modal -->
          <div v-if="showProductForm" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto p-4">
            <div class="my-8">
              <AdminProductForm
                :dark-mode="darkMode"
                :product="editingProduct"
                @submit="handleProductSubmit"
                @cancel="closeProductForm"
              />
            </div>
          </div>
        </div>

        <!-- Content Tab -->
        <div v-if="activeTab === 'content'">
          <AdminContentEditor :dark-mode="darkMode" />
        </div>

        <!-- Orders Tab -->
        <div v-if="activeTab === 'orders'">
          <div v-if="!selectedOrder">
            <AdminOrderList
              :orders="adminStore.orders"
              :dark-mode="darkMode"
              @view="viewOrder"
            />
          </div>
          <div v-else>
            <AdminOrderDetail
              :order-id="selectedOrder"
              :dark-mode="darkMode"
              @back="selectedOrder = null"
              @status-updated="refreshOrders"
            />
          </div>
        </div>
      </main>
    </div>
  </main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useAdminStore } from '../stores/admin';
import AdminDashboard from '../components/AdminDashboard.vue';
import AdminProductList from '../components/AdminProductList.vue';
import AdminProductForm from '../components/AdminProductForm.vue';
import AdminOrderList from '../components/AdminOrderList.vue';
import AdminOrderDetail from '../components/AdminOrderDetail.vue';
import AdminContentEditor from '../components/AdminContentEditor.vue';

const router = useRouter();
const authStore = useAuthStore();
const adminStore = useAdminStore();

const activeTab = ref('dashboard');
const sidebarOpen = ref(false);
const darkMode = ref(false);
const showProductForm = ref(false);
const editingProduct = ref(null);
const selectedOrder = ref(null);

/**
 * Select a tab and close sidebar on mobile
 */
const selectTab = (tab) => {
  activeTab.value = tab;
  sidebarOpen.value = false;
};

/**
 * Toggle dark mode
 */
const toggleDarkMode = () => {
  darkMode.value = !darkMode.value;
  if (darkMode.value) {
    document.documentElement.classList.add('dark');
    localStorage.setItem('darkMode', 'true');
  } else {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('darkMode', 'false');
  }
};

/**
 * Handle logout
 */
const handleLogout = async () => {
  await authStore.logout();
  router.push({ name: 'login' });
};

/**
 * Open new product form
 */
const newProduct = () => {
  editingProduct.value = null;
  showProductForm.value = true;
};

/**
 * Edit a product
 */
const editProduct = (productId) => {
  editingProduct.value = adminStore.getProductById(productId);
  showProductForm.value = true;
};

/**
 * Close product form
 */
const closeProductForm = () => {
  showProductForm.value = false;
  editingProduct.value = null;
};

/**
 * Handle product form submission
 */
const handleProductSubmit = async (formData) => {
  try {
    if (editingProduct.value) {
      await adminStore.updateProduct(editingProduct.value.id, formData);
    } else {
      await adminStore.createProduct(formData);
    }
    closeProductForm();
    await refreshProducts();
  } catch (err) {
    console.error('Error saving product:', err);
    alert('Erro ao salvar produto: ' + err.message);
  }
};

/**
 * Refresh products list
 */
const refreshProducts = async () => {
  try {
    await adminStore.fetchProducts();
  } catch (err) {
    console.error('Error fetching products:', err);
  }
};

/**
 * Refresh orders list
 */
const refreshOrders = async () => {
  try {
    await adminStore.fetchOrders();
  } catch (err) {
    console.error('Error fetching orders:', err);
  }
};

/**
 * View order details
 */
const viewOrder = (orderId) => {
  selectedOrder.value = orderId;
};

/**
 * Initialize on mount
 */
onMounted(async () => {
  // The router guard already verified the session against the API before this
  // component rendered; this is a cheap defensive re-check for direct mounts.
  if (!authStore.isAuthenticated || !authStore.isAdmin) {
    router.push({ name: 'login' });
    return;
  }

  // Load dark mode preference
  const savedDarkMode = localStorage.getItem('darkMode') === 'true';
  darkMode.value = savedDarkMode;
  if (savedDarkMode) {
    document.documentElement.classList.add('dark');
  }

  // Load initial data
  try {
    await Promise.all([
      adminStore.fetchProducts(),
      adminStore.fetchOrders(),
    ]);
  } catch (err) {
    console.error('Error loading admin data:', err);
  }
});
</script>
