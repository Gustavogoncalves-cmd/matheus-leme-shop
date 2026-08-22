<script setup>
import { LayoutGrid, Package, Zap } from 'lucide-vue-next'
import { ref, computed, onMounted } from 'vue'
import { motion } from 'motion-v'
import HeroBar from './HeroBar.vue'
import MarqueeSection from './MarqueeSection.vue'
import PackCard from './PackCard.vue'
import StreamPackDetail from './StreamPackDetail.vue'
import { useProductsStore } from '../stores/products'
import { staggerContainer, staggerItem } from '../composables/useAnimations'

const productsStore = useProductsStore()

onMounted(() => {
  if (productsStore.products.length === 0) {
    productsStore.fetchProducts()
  }
})

const activeCategory = ref('all')
const selectedPack = ref(null)
const showDetail = ref(false)

const categories = [
  { key: 'all', label: 'Ver Tudo', icon: LayoutGrid },
  { key: 'pacote', label: 'Combos', icon: Package },
  { key: 'avulso', label: 'Peças Avulsas', icon: Zap },
]

const filteredPacks = computed(() => {
  if (activeCategory.value === 'all') return productsStore.products
  return productsStore.products.filter(p => p.category === activeCategory.value)
})

function scrollToMenu() {
  document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' })
}

function openDetail(pack) {
  selectedPack.value = pack
  showDetail.value = true
}

function closeDetail() {
  showDetail.value = false
}
</script>

<template>
  <div>
    <HeroBar @scroll-to-menu="scrollToMenu" />
    <MarqueeSection text="Exclusivo para Streamers — Entrega Rápida via WhatsApp" />

    <section id="menu" class="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <!-- Intro -->
      <div class="text-center max-w-3xl mx-auto pt-16 pb-10">
        <span class="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-4 border border-neon-lime/40 text-neon-lime">
          <Zap class="w-3.5 h-3.5" /> Streampacks
        </span>
        <h2 class="text-3xl sm:text-4xl md:text-5xl font-black mb-4 font-display uppercase text-white">
          Identidade Visual para o seu Canal
        </h2>
        <p class="text-base sm:text-lg text-slate-400">
          Combos completos ou peças avulsas: avatares, banners, cenas OBS, painéis e alertas animados.
        </p>
      </div>

      <!-- Category filters -->
      <div class="flex flex-wrap items-center justify-center gap-3 mb-10">
        <button v-for="cat in categories" :key="cat.key"
                @click="activeCategory = cat.key"
                class="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all border"
                :class="activeCategory === cat.key
                  ? 'bg-neon-lime text-black border-neon-lime'
                  : 'bg-neon-card text-slate-300 hover:bg-neon-card2 border-neon-line'">
          <component :is="cat.icon" class="w-4 h-4" />
          {{ cat.label }}
        </button>
      </div>

      <!-- Loading state -->
      <div v-if="productsStore.loading && filteredPacks.length === 0" class="text-center pb-20">
        <p class="text-slate-400">Carregando catálogo...</p>
      </div>

      <!-- Error state -->
      <div v-else-if="productsStore.error && filteredPacks.length === 0" class="text-center pb-20">
        <p class="text-red-400">Não foi possível carregar o catálogo. Tente recarregar a página.</p>
      </div>

      <!-- Grid -->
      <motion.div v-else v-bind="staggerContainer()"
                  class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
        <motion.div v-for="pack in filteredPacks" :key="pack.id" v-bind="staggerItem()">
          <PackCard :pack="pack" @view-details="openDetail" />
        </motion.div>
      </motion.div>
    </section>

    <!-- Detail modal (reused: functional WhatsApp checkout flow, dark-capable) -->
    <StreamPackDetail :pack="selectedPack" :is-open="showDetail" :dark-mode="true" @close="closeDetail" />
  </div>
</template>
