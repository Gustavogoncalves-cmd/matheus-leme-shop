<script setup>
import { Eye, ShoppingBag, Star } from 'lucide-vue-next'
import { computed } from 'vue'

const props = defineProps({
  pack: { type: Object, required: true },
  darkMode: Boolean
})

const emit = defineEmits(['select-detail'])

const whatsappUrl = computed(() => {
  const msg = `Olá Matheus, gostei do ${props.pack.title} e gostava de adquiri-lo!`
  return `https://wa.me/5511951865795?text=${encodeURIComponent(msg)}`
})

const categoryLabel = computed(() =>
  props.pack.category === 'pacote' ? 'Combo Completo' : 'Peça Individual'
)
</script>

<template>
  <div :class="pack.featured
        ? 'p-[3px] bg-gradient-to-r from-brand-500 via-pink-500 to-indigo-500 rounded-[27px] shadow-xl shadow-brand-500/10'
        : 'h-full'"
       class="flex flex-col">
    <div class="rounded-3xl overflow-hidden border transition-all duration-300 flex flex-col justify-between group h-full relative shadow-sm hover:shadow-xl"
         :class="[
           darkMode ? 'bg-slate-900 border-slate-800/80' : 'bg-white border-slate-100',
           !pack.available ? 'opacity-80' : ''
         ]">

      <!-- Header visual -->
      <div class="relative h-48 w-full overflow-hidden flex items-center justify-center text-white"
           :style="{ background: pack.themeColor }">
        <div class="absolute inset-0 bg-slate-950/25"></div>
        <div class="absolute inset-0 opacity-[0.06]"
             style="background-image: linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px); background-size: 20px 20px;"></div>

        <span class="absolute top-4 left-4 z-20 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-lg"
              :class="darkMode ? 'bg-slate-800 border border-slate-700 text-white' : 'bg-brand-600 text-white'">
          -{{ pack.discount }}% OFF
        </span>

        <span class="absolute bottom-4 left-4 z-20 text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-md text-white/95 bg-slate-900/40 border border-white/10">
          {{ pack.category === 'pacote' ? '💎 Combo Completo' : '⚡ Peça Individual' }}
        </span>

        <span v-if="!pack.available"
              class="absolute inset-0 z-30 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center font-bold uppercase tracking-widest text-white text-lg font-display">
          ESGOTADO
        </span>

        <span v-if="pack.available && pack.featured"
              class="absolute top-4 right-4 z-20 bg-amber-500 text-white text-[9px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1 animate-pulse">
          ⭐ POPULAR
        </span>

        <div class="relative z-10 text-center scale-95 group-hover:scale-105 transition-transform duration-300">
          <span class="text-[9px] font-bold tracking-widest uppercase opacity-75 block mb-1">
            {{ pack.category === 'pacote' ? 'STREAMPACK COMBO' : 'ASSET INDIVIDUAL' }}
          </span>
          <h3 class="text-xl sm:text-2xl font-black tracking-tighter uppercase font-display drop-shadow-md">
            {{ pack.headerTitle }}
          </h3>
          <div class="w-8 h-1 bg-white/40 mx-auto mt-1.5 rounded-full"></div>
        </div>
      </div>

      <!-- Body -->
      <div class="p-6 flex-grow flex flex-col justify-between">
        <div>
          <h3 class="text-xl font-bold mb-1 font-display" :class="darkMode ? 'text-white' : 'text-slate-900'">
            {{ pack.title }}
          </h3>
          <p class="text-xs mb-4" :class="darkMode ? 'text-slate-400' : 'text-slate-400'">
            {{ pack.shortDescription }}
          </p>

          <div class="flex flex-wrap gap-1.5 mb-6">
            <span v-for="item in pack.features.slice(0, 3)" :key="item"
                  class="border text-[10px] font-semibold px-2 py-0.5 rounded-md"
                  :class="darkMode ? 'bg-slate-950 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-100 text-slate-500'">
              {{ item }}
            </span>
            <span v-if="pack.features.length > 3"
                  class="text-[10px] font-extrabold px-2 py-0.5 rounded-md"
                  :class="darkMode ? 'bg-brand-900/50 text-brand-300' : 'bg-brand-50 text-brand-700'">
              + {{ pack.features.length - 3 }} itens
            </span>
          </div>
        </div>

        <!-- Price + actions -->
        <div class="pt-4 border-t" :class="darkMode ? 'border-slate-800' : 'border-slate-50'">
          <div class="flex justify-between items-end mb-4">
            <div class="flex flex-col">
              <span class="text-xs line-through" :class="darkMode ? 'text-slate-500' : 'text-slate-400'">
                R$ {{ pack.priceOriginal.toFixed(2) }}
              </span>
              <div class="flex items-center gap-1.5">
                <span class="text-2xl font-black font-display" :class="darkMode ? 'text-white' : 'text-slate-900'">
                  R$ {{ pack.priceCurrent.toFixed(2) }}
                </span>
                <span class="text-[10px] font-semibold px-1.5 py-0.5 rounded-md"
                      :class="darkMode ? 'bg-slate-800 text-emerald-400 border border-slate-700' : 'bg-emerald-50 text-emerald-700'">
                  PIX
                </span>
              </div>
              <span class="text-[10px]" :class="darkMode ? 'text-slate-500' : 'text-slate-400'">À vista ou cartão</span>
            </div>
            <div class="flex items-center gap-1 text-amber-500 text-xs font-semibold">
              <Star class="w-3.5 h-3.5 fill-amber-500" />
              <span>5.0</span>
            </div>
          </div>

          <div class="flex gap-2.5">
            <button @click="emit('select-detail', pack)"
                    class="flex-grow py-3 px-4 rounded-xl text-center font-bold text-xs transition-all duration-300 flex items-center justify-center gap-2"
                    :class="darkMode ? 'bg-brand-600 hover:bg-brand-500 text-white' : 'bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-500/10'">
              <Eye class="w-4 h-4" />
              Ver Detalhes
            </button>
            <a :href="!pack.available ? '#' : whatsappUrl" target="_blank"
               class="p-3 rounded-xl transition-colors duration-300"
               :class="[
                 darkMode ? 'bg-slate-800 text-white hover:bg-slate-700 border border-slate-700' : 'bg-slate-900 hover:bg-slate-800 text-white',
                 !pack.available ? 'pointer-events-none opacity-50' : ''
               ]">
              <ShoppingBag class="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
