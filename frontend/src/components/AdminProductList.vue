<template>
  <div class="w-full">
    <!-- Import AdminImageUploader component -->
    <div class="bg-white dark:bg-slate-900 rounded-lg shadow-lg p-6"
         :class="darkMode ? 'bg-slate-900' : 'bg-white'">

      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-bold" :class="darkMode ? 'text-white' : 'text-slate-900'">
          Produtos
        </h2>
        <button @click="$emit('new-product')"
                class="px-4 py-2 rounded-lg text-white font-bold transition-colors"
                :class="darkMode ? 'bg-brand-600 hover:bg-brand-700' : 'bg-brand-600 hover:bg-brand-700'">
          + Novo Produto
        </button>
      </div>

      <!-- Search and Filters -->
      <div class="flex gap-4 mb-6 flex-wrap items-end">
        <div class="flex-1 min-w-[250px]">
          <label class="block text-sm font-medium mb-2" :class="darkMode ? 'text-slate-300' : 'text-slate-700'">
            Buscar por nome
          </label>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Digite o nome do produto..."
            class="w-full px-4 py-2 border rounded-lg"
            :class="darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300'"
          />
        </div>

        <div>
          <label class="block text-sm font-medium mb-2" :class="darkMode ? 'text-slate-300' : 'text-slate-700'">
            Categoria
          </label>
          <select
            v-model="categoryFilter"
            class="px-4 py-2 border rounded-lg"
            :class="darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300'"
          >
            <option value="">Todas</option>
            <option value="individual">Individual</option>
            <option value="pacote">Pacote</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium mb-2" :class="darkMode ? 'text-slate-300' : 'text-slate-700'">
            Status
          </label>
          <select
            v-model="statusFilter"
            class="px-4 py-2 border rounded-lg"
            :class="darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300'"
          >
            <option value="">Todos</option>
            <option value="available">Disponível</option>
            <option value="unavailable">Indisponível</option>
          </select>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="space-y-4">
        <div v-for="i in 5" :key="i" class="h-20 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredProducts.length === 0" class="text-center py-12">
        <p :class="darkMode ? 'text-slate-400' : 'text-slate-500'">
          Nenhum produto encontrado
        </p>
      </div>

      <!-- Table -->
      <div v-else class="overflow-x-auto">
        <table class="w-full border-collapse">
          <thead>
            <tr class="border-b" :class="darkMode ? 'border-slate-800 bg-slate-800/50' : 'border-slate-200 bg-slate-50'">
              <th class="text-left py-4 px-4 font-semibold" :class="darkMode ? 'text-slate-300' : 'text-slate-700'">
                Nome
              </th>
              <th class="text-left py-4 px-4 font-semibold" :class="darkMode ? 'text-slate-300' : 'text-slate-700'">
                Preço
              </th>
              <th class="text-left py-4 px-4 font-semibold" :class="darkMode ? 'text-slate-300' : 'text-slate-700'">
                Categoria
              </th>
              <th class="text-left py-4 px-4 font-semibold" :class="darkMode ? 'text-slate-300' : 'text-slate-700'">
                Status
              </th>
              <th class="text-left py-4 px-4 font-semibold" :class="darkMode ? 'text-slate-300' : 'text-slate-700'">
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="product in paginatedProducts" :key="product.id"
                class="border-b hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                :class="darkMode ? 'border-slate-800' : 'border-slate-200'">
              <td class="py-4 px-4" :class="darkMode ? 'text-slate-300' : 'text-slate-700'">
                <div>
                  <p class="font-semibold" :class="darkMode ? 'text-white' : 'text-slate-900'">
                    {{ product.title }}
                  </p>
                  <p class="text-sm mt-1" :class="darkMode ? 'text-slate-400' : 'text-slate-500'">
                    {{ product.shortDescription || '—' }}
                  </p>
                </div>
              </td>
              <td class="py-4 px-4 font-semibold whitespace-nowrap" :class="darkMode ? 'text-white' : 'text-slate-900'">
                R$ {{ typeof product.price === 'number' ? product.price.toFixed(2) : '0.00' }}
                <span v-if="product.discount && product.discount > 0" class="text-red-600 text-sm ml-2">
                  -{{ product.discount }}%
                </span>
              </td>
              <td class="py-4 px-4 text-sm" :class="darkMode ? 'text-slate-400' : 'text-slate-600'">
                {{ getCategoryLabel(product.category) }}
              </td>
              <td class="py-4 px-4">
                <span class="inline-flex px-3 py-1 rounded-full text-xs font-semibold"
                      :class="product.available ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'">
                  {{ product.available ? 'Disponível' : 'Indisponível' }}
                </span>
              </td>
              <td class="py-4 px-4">
                <div class="flex gap-2 items-center flex-wrap">
                  <button @click="$emit('edit', product.id)"
                          class="text-xs font-semibold px-3 py-1 rounded transition-colors whitespace-nowrap"
                          :class="darkMode ? 'text-brand-400 hover:text-brand-300 hover:bg-brand-400/10' : 'text-brand-600 hover:text-brand-700 hover:bg-brand-50'">
                    ✏ Editar
                  </button>
                  <button @click="openImageUploadModal(product.id, product.title)"
                          class="text-xs font-semibold px-3 py-1 rounded transition-colors whitespace-nowrap"
                          :class="darkMode ? 'text-cyan-400 hover:text-cyan-300 hover:bg-cyan-400/10' : 'text-cyan-600 hover:text-cyan-700 hover:bg-cyan-50'">
                    🖼 Imagem
                  </button>
                  <button @click="confirmDelete(product.id, product.title)"
                          class="text-xs font-semibold px-3 py-1 rounded transition-colors whitespace-nowrap"
                          :class="darkMode ? 'text-red-400 hover:text-red-300 hover:bg-red-400/10' : 'text-red-600 hover:text-red-700 hover:bg-red-50'">
                    🗑 Deletar
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="filteredProducts.length > 0" class="flex items-center justify-between mt-6">
        <p class="text-sm" :class="darkMode ? 'text-slate-400' : 'text-slate-600'">
          Mostrando {{ startIdx + 1 }} a {{ Math.min(endIdx, filteredProducts.length) }} de {{ filteredProducts.length }}
        </p>
        <div class="flex gap-2">
          <button @click="previousPage"
                  :disabled="currentPage === 1"
                  class="px-4 py-2 rounded-lg border transition-colors"
                  :class="currentPage === 1
                    ? 'opacity-50 cursor-not-allowed'
                    : darkMode ? 'border-slate-700 text-white hover:bg-slate-800' : 'border-slate-300 hover:bg-slate-50'">
            Anterior
          </button>
          <button v-for="page in totalPages" :key="page"
                  @click="goToPage(page)"
                  :class="page === currentPage
                    ? darkMode ? 'bg-brand-600 text-white' : 'bg-brand-600 text-white'
                    : darkMode ? 'border border-slate-700 text-white hover:bg-slate-800' : 'border border-slate-300 hover:bg-slate-50'"
                  class="px-3 py-2 rounded-lg transition-colors">
            {{ page }}
          </button>
          <button @click="nextPage"
                  :disabled="currentPage === totalPages"
                  class="px-4 py-2 rounded-lg border transition-colors"
                  :class="currentPage === totalPages
                    ? 'opacity-50 cursor-not-allowed'
                    : darkMode ? 'border-slate-700 text-white hover:bg-slate-800' : 'border-slate-300 hover:bg-slate-50'">
            Próxima
          </button>
        </div>
      </div>
    </div>

    <!-- Image Upload Modal -->
    <div v-if="showImageUploadModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto p-4">
      <div class="my-8 bg-white dark:bg-slate-900 rounded-lg shadow-xl p-6 max-w-md"
           :class="darkMode ? 'bg-slate-900' : 'bg-white'">
        <h3 class="text-lg font-bold mb-4" :class="darkMode ? 'text-white' : 'text-slate-900'">
          Upload de Imagem - {{ uploadingProductTitle }}
        </h3>
        <div class="mb-6">
          <AdminImageUploader
            :dark-mode="darkMode"
            @uploaded="handleImageUploaded"
          />
        </div>
        <div class="flex gap-4">
          <button @click="closeImageUploadModal"
                  class="flex-1 px-4 py-2 rounded-lg font-bold transition-colors"
                  :class="darkMode ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-slate-200 text-slate-900 hover:bg-slate-300'">
            Fechar
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-slate-900 rounded-lg shadow-xl p-6 max-w-sm mx-4"
           :class="darkMode ? 'bg-slate-900' : 'bg-white'">
        <h3 class="text-lg font-bold mb-4" :class="darkMode ? 'text-white' : 'text-slate-900'">
          Confirmar Exclusão
        </h3>
        <p class="mb-6" :class="darkMode ? 'text-slate-300' : 'text-slate-700'">
          Tem certeza que deseja deletar o produto <strong>{{ deleteProductName }}</strong>?
          Esta ação não pode ser desfeita.
        </p>
        <div class="flex gap-4">
          <button @click="cancelDelete"
                  class="flex-1 px-4 py-2 rounded-lg font-bold transition-colors"
                  :class="darkMode ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-slate-200 text-slate-900 hover:bg-slate-300'">
            Cancelar
          </button>
          <button @click="confirmDeleteAction"
                  :disabled="isDeleting"
                  class="flex-1 px-4 py-2 rounded-lg text-white font-bold transition-colors"
                  :class="isDeleting ? 'bg-red-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'">
            {{ isDeleting ? 'Deletando...' : 'Deletar' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useAdminStore } from '../stores/admin';
import AdminImageUploader from './AdminImageUploader.vue';

const props = defineProps({
  darkMode: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['edit', 'new-product', 'deleted']);

const adminStore = useAdminStore();
const isLoading = computed(() => adminStore.productsLoading);

const searchQuery = ref('');
const categoryFilter = ref('');
const statusFilter = ref('');
const currentPage = ref(1);
const itemsPerPage = 10;

const showDeleteModal = ref(false);
const deleteProductId = ref(null);
const deleteProductName = ref('');
const isDeleting = ref(false);

const showImageUploadModal = ref(false);
const uploadingProductId = ref(null);
const uploadingProductTitle = ref('');

const filteredProducts = computed(() => {
  // Ensure products is always an array and valid
  const products = Array.isArray(adminStore.products) ? adminStore.products : [];

  return products
    .filter(product => {
      // Validate product object
      if (!product || typeof product !== 'object') return false;

      // Search filter
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        const title = (product.title || '').toLowerCase();
        const desc = (product.shortDescription || '').toLowerCase();
        if (!title.includes(query) && !desc.includes(query)) {
          return false;
        }
      }

      // Category filter
      if (categoryFilter.value && product.category !== categoryFilter.value) {
        return false;
      }

      // Status filter
      if (statusFilter.value === 'available' && !product.available) {
        return false;
      }
      if (statusFilter.value === 'unavailable' && product.available) {
        return false;
      }

      return true;
    })
    .sort((a, b) => (b.id || 0) - (a.id || 0));
});

const totalPages = computed(() => {
  return Math.ceil(filteredProducts.value.length / itemsPerPage);
});

const startIdx = computed(() => (currentPage.value - 1) * itemsPerPage);
const endIdx = computed(() => startIdx.value + itemsPerPage);

const paginatedProducts = computed(() => {
  return filteredProducts.value.slice(startIdx.value, endIdx.value);
});

const getCategoryLabel = (category) => {
  const labels = {
    individual: 'Individual',
    pacote: 'Pacote',
  };
  return labels[category] || category;
};

const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

const goToPage = (page) => {
  currentPage.value = page;
};

const confirmDelete = (productId, productName) => {
  deleteProductId.value = productId;
  deleteProductName.value = productName;
  showDeleteModal.value = true;
};

const cancelDelete = () => {
  showDeleteModal.value = false;
  deleteProductId.value = null;
  deleteProductName.value = '';
};

const confirmDeleteAction = async () => {
  if (!deleteProductId.value) return;

  isDeleting.value = true;
  try {
    await adminStore.deleteProduct(deleteProductId.value);
    showDeleteModal.value = false;
    deleteProductId.value = null;
    deleteProductName.value = '';
    emit('deleted', deleteProductId.value);
  } catch (err) {
    console.error('Error deleting product:', err);
    alert('Erro ao deletar produto: ' + err.message);
  } finally {
    isDeleting.value = false;
  }
};

const openImageUploadModal = (productId, productTitle) => {
  uploadingProductId.value = productId;
  uploadingProductTitle.value = productTitle;
  showImageUploadModal.value = true;
};

const closeImageUploadModal = () => {
  showImageUploadModal.value = false;
  uploadingProductId.value = null;
  uploadingProductTitle.value = '';
};

const handleImageUploaded = async (imageUrl) => {
  try {
    if (!uploadingProductId.value) return;

    const product = adminStore.getProductById(uploadingProductId.value);
    if (!product) return;

    // The products table stores images in `thumbnail` (the cover the shop
    // renders) and `images` (the gallery). Product.update() drops any key
    // outside its allow-list, so writing an `imageUrl` field looked like it
    // succeeded while saving nothing - which is why the storefront never
    // picked the upload up.
    const gallery = Array.isArray(product.images) ? product.images : [];

    await adminStore.updateProduct(uploadingProductId.value, {
      thumbnail: imageUrl,
      images: gallery.includes(imageUrl) ? gallery : [...gallery, imageUrl],
    });

    closeImageUploadModal();
    alert('Imagem salva com sucesso.');
  } catch (err) {
    console.error('Error updating product image:', err);
    alert('Erro ao salvar imagem: ' + err.message);
  }
};
</script>
