<script setup>
import { motion } from 'motion-v'
import { Eye, ShoppingBag } from 'lucide-vue-next'
import { computed } from 'vue'
import { useCartStore } from '../stores/cart'
import { useCartFly } from '../composables/useCartFly'
import { scaleGlow } from '../composables/useAnimations'

const props = defineProps({
  pack: { type: Object, required: true }
})

const emit = defineEmits(['view-details'])

const cartStore = useCartStore()
const { flyToCart } = useCartFly()

const categoryLabel = computed(() => {
  return props.pack.category === 'pacote' ? 'Combo Completo' : 'Peça Individual'
})

const glowClass = computed(() => {
  return props.pack.category === 'pacote' ? 'hover:shadow-neon-magenta' : 'hover:shadow-neon-cyan'
})

async function handleAdd(event) {
  cartStore.addItem(props.pack)
  await flyToCart(event)
}
</script>

<template>
  <motion.div v-bind="scaleGlow()"
              class="group rounded-2xl overflow-hidden border border-neon-line bg-neon-card flex flex-col transition-shadow duration-300"
              :class="glowClass">
    <!-- Visual header -->
    <div class="relative h-44 w-full overflow-hidden flex items-center justify-center"
         :style="{ background: pack.themeColor }">
      <div class="absolute inset-0 bg-black/30"></div>
      <div class="absolute inset-0 opacity-[0.06]"
           style="background-image: linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px); background-size: 20px 20px;"></div>

      <span v-if="!pack.available"
            class="absolute inset-0 z-20 bg-black/80 backdrop-blur-sm flex items-center justify-center font-bold uppercase tracking-widest text-white text-sm font-display">
        Esgotado
      </span>

      <span v-if="pack.discount > 0"
            class="absolute top-3 left-3 z-10 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-black/60 border border-white/20 text-neon-lime">
        -{{ pack.discount }}%
      </span>

      <span class="absolute bottom-3 left-3 z-10 text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-md text-white/90 bg-black/40 border border-white/10">
        {{ pack.category === 'pacote' ? 'STREAMPACK COMBO' : 'ASSET INDIVIDUAL' }}
      </span>

      <span v-if="pack.featured"
            class="absolute top-3 right-3 z-10 text-[9px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-neon-lime text-black animate-pulse">
        Popular
      </span>

      <h3 class="relative z-10 text-xl sm:text-2xl font-black uppercase font-display text-white text-center px-4 drop-shadow-lg">
        {{ pack.headerTitle }}
      </h3>
    </div>

    <!-- Body -->
    <div class="p-5 flex-grow flex flex-col justify-between">
      <div>
        <span class="text-[10px] font-bold uppercase tracking-widest text-neon-lime">{{ categoryLabel }}</span>
        <h4 class="text-base font-bold text-white mt-1">{{ pack.title }}</h4>
        <p class="text-sm text-slate-400 mt-1 mb-3 line-clamp-2">{{ pack.shortDescription }}</p>

        <div class="flex flex-wrap gap-1.5 mb-4">
          <span v-for="tag in pack.features.slice(0, 3)" :key="tag"
                class="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-neon-card2 border border-neon-line text-slate-400">
            {{ tag }}
          </span>
          <span v-if="pack.features.length > 3"
                class="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-neon-lime/10 text-neon-lime">
            + {{ pack.features.length - 3 }} itens
          </span>
        </div>
      </div>

      <div class="pt-3 border-t border-neon-line">
        <div class="flex justify-between items-end mb-4">
          <div>
            <span v-if="pack.discount > 0" class="text-xs line-through text-slate-600 block">
              R$ {{ pack.priceOriginal.toFixed(2) }}
            </span>
            <span class="text-xl font-black font-display text-white">
              R$ {{ pack.priceCurrent.toFixed(2) }}
            </span>
          </div>
        </div>

        <div class="flex gap-2">
          <button @click="emit('view-details', pack)"
                  class="flex-grow py-2.5 px-3 rounded-xl text-center font-bold text-xs uppercase tracking-wide transition-all duration-300 flex items-center justify-center gap-1.5 bg-white/10 text-white hover:bg-neon-lime hover:text-black">
            <Eye class="w-4 h-4" />
            Ver Detalhes
          </button>
          <button @click="handleAdd($event)" :disabled="!pack.available"
                  class="p-2.5 rounded-xl transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed bg-neon-card2 text-white hover:bg-neon-lime hover:text-black">
            <ShoppingBag class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  </motion.div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
