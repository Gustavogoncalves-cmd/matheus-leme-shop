<script setup>
import { Sparkles, LayoutGrid, Package, Zap } from 'lucide-vue-next'
import { ref, computed, onMounted } from 'vue'
import StreamPackCard from './StreamPackCard.vue'
import StreamPackDetail from './StreamPackDetail.vue'
import { useProductsStore } from '../stores/products'

defineProps({
  darkMode: Boolean
})

// --- Data: fetched from the live API (Phase 3). The store maps the API's
// snake_case rows into the camelCase shape StreamPackCard/StreamPackDetail
// expect, so this component only ever reads camelCase. ---

const productsStore = useProductsStore()

onMounted(() => {
  if (productsStore.products.length === 0) {
    productsStore.fetchProducts()
  }
})

// --- UI State ---

const activeCategory = ref('all')
const selectedPack = ref(null)
const showDetail = ref(false)

const categories = [
  { key: 'all', label: 'Ver Tudo', icon: LayoutGrid },
  { key: 'pacote', label: 'Combos', icon: Package },
  { key: 'avulso', label: 'Peças Avulsas', icon: Zap }
]

const filteredPacks = computed(() => {
  if (activeCategory.value === 'all') return productsStore.products
  return productsStore.products.filter(p => p.category === activeCategory.value)
})

const openDetail = (pack) => {
  selectedPack.value = pack
  showDetail.value = true
}

const closeDetail = () => {
  showDetail.value = false
}
</script>

<template>
  <section id="streampacks" class="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
    <!-- Intro -->
    <div class="text-center max-w-3xl mx-auto pt-16 pb-10">
      <span class="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-4"
            :class="darkMode ? 'bg-brand-900/50 text-brand-300 border border-brand-800' : 'bg-brand-50 text-brand-700 border border-brand-100'">
        <Sparkles class="w-3.5 h-3.5" /> Streampacks
      </span>
      <h2 class="text-3xl sm:text-4xl md:text-5xl font-black mb-4 font-display" :class="darkMode ? 'text-white' : 'text-slate-900'">
        Identidade visual pronta para o seu canal
      </h2>
      <p class="text-base sm:text-lg" :class="darkMode ? 'text-slate-400' : 'text-slate-600'">
        Combos completos ou peças avulsas: avatares, banners, cenas OBS, painéis e alertas animados, entregues via WhatsApp.
      </p>
    </div>

    <!-- Category filters -->
    <div class="flex flex-wrap items-center justify-center gap-3 mb-10">
      <button v-for="cat in categories" :key="cat.key"
              @click="activeCategory = cat.key"
              class="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all"
              :class="activeCategory === cat.key
                ? (darkMode ? 'bg-white text-black' : 'bg-brand-600 text-white shadow-md shadow-brand-500/20')
                : (darkMode ? 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')">
        <component :is="cat.icon" class="w-4 h-4" />
        {{ cat.label }}
      </button>
    </div>

    <!-- Loading state -->
    <div v-if="productsStore.loading && filteredPacks.length === 0" class="text-center pb-20">
      <p :class="darkMode ? 'text-slate-400' : 'text-slate-500'">Carregando produtos...</p>
    </div>

    <!-- Error state -->
    <div v-else-if="productsStore.error && filteredPacks.length === 0" class="text-center pb-20">
      <p class="text-red-500">Não foi possível carregar os produtos. Tente recarregar a página.</p>
    </div>

    <!-- Grid -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
      <StreamPackCard v-for="pack in filteredPacks" :key="pack.id"
                       :pack="pack"
                       :dark-mode="darkMode"
                       @select-detail="openDetail" />
    </div>

    <!-- Detail modal -->
    <StreamPackDetail :pack="selectedPack"
                       :is-open="showDetail"
                       :dark-mode="darkMode"
                       @close="closeDetail" />
  </section>
</template>
