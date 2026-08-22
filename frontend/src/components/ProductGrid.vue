<template>
  <div class="w-full">
    <!-- Filter Buttons -->
    <div class="flex justify-center items-center gap-3 mb-12 flex-wrap">
      <button v-for="cat in categories" :key="cat"
              @click="productsStore.setCategoryFilter(cat)"
              :class="productsStore.categoryFilter === cat
                ? (darkMode ? 'bg-white text-black shadow-lg shadow-white/5 border-white' : 'bg-brand-600 text-white shadow-lg shadow-brand-500/20 border-brand-500')
                : (darkMode ? 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-850' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50')"
              class="px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 border flex items-center gap-2">
        <component :is="getCategoryIcon(cat)" class="w-4 h-4" />
        {{ getCategoryLabel(cat) }}
      </button>
    </div>

    <!-- Products Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
      <template v-if="productsStore.filteredProducts.length > 0">
        <ProductCard v-for="product in productsStore.filteredProducts"
                     :key="product.id"
                     :product="product"
                     :dark-mode="darkMode"
                     @view="selectProduct(product)" />
      </template>
      <template v-else>
        <div class="col-span-full text-center py-12">
          <p :class="darkMode ? 'text-slate-400' : 'text-slate-500'" class="text-sm">
            Nenhum produto encontrado
          </p>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useProductsStore } from '../stores/products';
import ProductCard from './ProductCard.vue';
import { Grid3X3, Package, Layers } from 'lucide-vue-next';

const props = defineProps({
  darkMode: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['product-selected']);

const productsStore = useProductsStore();

const categories = ['todos', 'pacote', 'avulso'];

const getCategoryLabel = (cat) => {
  const labels = {
    todos: 'Ver Tudo',
    pacote: 'Combos Completos',
    avulso: 'Peças Individuais',
  };
  return labels[cat] || cat;
};

const getCategoryIcon = (cat) => {
  const icons = {
    todos: Grid3X3,
    pacote: Package,
    avulso: Layers,
  };
  return icons[cat] || null;
};

const selectProduct = (product) => {
  emit('product-selected', product);
};
</script>
