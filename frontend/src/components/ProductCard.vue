<template>
  <div :class="product.featured ? 'p-[2px] bg-gradient-to-r from-brand-500 via-pink-500 to-indigo-500 rounded-3xl shadow-xl' : ''" class="flex flex-col h-full">
    <div class="rounded-3xl overflow-hidden shadow-sm hover:shadow-xl border transition-all duration-300 flex flex-col justify-between group h-full relative"
         :class="[darkMode ? 'bg-slate-900 border-slate-800 shadow-slate-950/50' : 'bg-white border-slate-100',
                 !product.available ? 'opacity-85' : '']">

      <!-- Header Visual -->
      <div class="relative h-48 w-full overflow-hidden flex items-center justify-center text-white"
           :style="{ background: product.theme_color || product.themeColor }">
        <div class="absolute inset-0 bg-slate-950/25"></div>

        <!-- Grid pattern -->
        <div class="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px]"></div>

        <!-- Discount Badge -->
        <span v-if="product.discount" class="absolute top-4 left-4 z-20 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-lg"
              :class="darkMode ? 'bg-slate-800 border border-slate-700 text-white' : 'bg-brand-600 text-white'">
          -{{ product.discount }}% OFF
        </span>

        <!-- Category Tag -->
        <span class="absolute bottom-4 left-4 z-20 text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-md text-white/95 bg-slate-900/40 border border-white/10">
          {{ product.category === 'pacote' ? '💎 Combo' : '⚡ Individual' }}
        </span>

        <!-- Out of Stock -->
        <template v-if="!product.available">
          <span class="absolute inset-0 z-30 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center font-bold uppercase tracking-widest text-white text-lg font-display">
            ESGOTADO
          </span>
        </template>

        <!-- Popular Badge -->
        <template v-if="product.available && product.featured">
          <span class="absolute top-4 right-4 z-20 bg-amber-500 text-white text-[9px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1 animate-pulse">
            ⭐ POPULAR
          </span>
        </template>

        <!-- Title -->
        <div class="relative z-10 text-center scale-95 group-hover:scale-105 transition-transform duration-300">
          <span class="text-[9px] font-bold tracking-widest uppercase opacity-75 block mb-1">
            {{ product.category === 'pacote' ? 'STREAMPACK COMBO' : 'ASSET INDIVIDUAL' }}
          </span>
          <h3 class="text-xl sm:text-2xl font-black tracking-tighter uppercase font-display drop-shadow-md">
            {{ product.header_title || product.headerTitle }}
          </h3>
          <div class="w-8 h-1 bg-white/40 mx-auto mt-1.5 rounded-full"></div>
        </div>
      </div>

      <!-- Content -->
      <div class="p-6 flex-grow flex flex-col justify-between" :class="darkMode ? 'bg-slate-900' : 'bg-white'">
        <div>
          <h3 class="text-lg font-bold mb-2 font-display" :class="darkMode ? 'text-white' : 'text-slate-900'">
            {{ product.title }}
          </h3>
          <p class="text-xs mb-4" :class="darkMode ? 'text-slate-400' : 'text-slate-500'">
            {{ product.short_description || product.shortDescription }}
          </p>

          <!-- Features Tags -->
          <div class="flex flex-wrap gap-1.5 mb-6">
            <template v-for="(feature, i) in product.features.slice(0, 3)" :key="i">
              <span class="border text-[10px] font-semibold px-2 py-0.5 rounded-md"
                    :class="darkMode ? 'bg-slate-950 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-100 text-slate-500'">
                {{ feature }}
              </span>
            </template>
            <span v-if="product.features.length > 3"
                  class="text-[10px] font-extrabold px-2 py-0.5 rounded-md"
                  :class="darkMode ? 'bg-brand-900/50 text-brand-300' : 'bg-brand-50 text-brand-700'">
              +{{ product.features.length - 3 }} itens
            </span>
          </div>
        </div>

        <!-- Price and Actions -->
        <div class="pt-4 border-t" :class="darkMode ? 'border-slate-800' : 'border-slate-100'">
          <div class="flex justify-between items-end mb-4">
            <div class="flex flex-col">
              <span class="text-xs line-through" :class="darkMode ? 'text-slate-500' : 'text-slate-400'">
                R$ {{ priceOriginal.toFixed(2) }}
              </span>
              <div class="flex items-center gap-1.5">
                <span class="text-2xl font-black font-display" :class="darkMode ? 'text-white' : 'text-slate-900'">
                  R$ {{ price.toFixed(2) }}
                </span>
                <span class="text-[10px] font-semibold px-1.5 py-0.5 rounded-md"
                      :class="darkMode ? 'bg-slate-800 text-emerald-400 border border-slate-700' : 'bg-emerald-50 text-emerald-700'">
                  PIX
                </span>
              </div>
              <span class="text-[10px]" :class="darkMode ? 'text-slate-500' : 'text-slate-400'">
                À vista ou cartão
              </span>
            </div>
            <div class="flex items-center gap-1 text-amber-500 text-xs font-semibold">
              <Star class="w-3.5 h-3.5 fill-amber-500" />
              <span>5.0</span>
            </div>
          </div>

          <!-- Buttons -->
          <div class="flex gap-2.5">
            <button @click="$emit('view')"
                    class="flex-grow py-3 px-4 rounded-xl text-center font-bold text-xs transition-all duration-300 flex items-center justify-center gap-2"
                    :class="darkMode ? 'bg-brand-600 hover:bg-brand-500 text-white' : 'bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-500/10'">
              <Eye class="w-4 h-4" />
              Ver Detalhes
            </button>
            <button v-if="product.available"
                    @click="addToCart"
                    data-testid="add-to-cart"
                    class="p-3 rounded-xl transition-colors"
                    :class="darkMode ? 'bg-slate-800 text-white hover:bg-slate-700 border border-slate-700' : 'bg-slate-900 hover:bg-slate-800 text-white'">
              <ShoppingBag class="w-4 h-4" />
            </button>
            <button v-else disabled
                    class="p-3 rounded-xl cursor-not-allowed opacity-50"
                    :class="darkMode ? 'bg-slate-800 text-slate-600' : 'bg-slate-200 text-slate-400'">
              <ShoppingBag class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { Eye, ShoppingBag, Star } from 'lucide-vue-next';
import { useCartStore } from '../stores/cart';

const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
  darkMode: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['view']);
const cartStore = useCartStore();

const price = computed(() => parseFloat(props.product.price));

const priceOriginal = computed(() => {
  const originalPrice = props.product.price_original || props.product.priceOriginal;
  return originalPrice ? parseFloat(originalPrice) : price.value;
});

const whatsappLink = computed(() => {
  const message = `Olá Matheus, gostei do ${props.product.title} e gostaria de adquiri-lo!`;
  return `https://wa.me/5511951865795?text=${encodeURIComponent(message)}`;
});

const addToCart = () => {
  cartStore.addItem({
    id: props.product.id,
    title: props.product.title,
    price: props.product.price,
    discount: props.product.discount,
    thumbnail: props.product.thumbnail,
  });
};
</script>
