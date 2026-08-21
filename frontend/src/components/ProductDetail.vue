<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4" @click.self="closeModal">
    <!-- Backdrop -->
    <div class="absolute inset-0" :class="darkMode ? 'bg-black/80 backdrop-blur-sm' : 'bg-black/50 backdrop-blur-sm'" @click="closeModal"></div>

    <!-- Modal Container -->
    <div class="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl"
         :class="darkMode ? 'bg-slate-900' : 'bg-white'">

      <!-- Close Button -->
      <button @click="closeModal"
              class="absolute top-4 right-4 z-20 p-2 rounded-lg transition-colors"
              :class="darkMode ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-slate-100 text-slate-900 hover:bg-slate-200'">
        <X class="w-5 h-5" />
      </button>

      <!-- Modal Content -->
      <div class="p-6 md:p-10">
        <!-- Header with Image Gallery -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <!-- Image Carousel -->
          <div class="flex flex-col gap-4">
            <!-- Main Image -->
            <div class="relative h-96 rounded-xl overflow-hidden bg-gradient-to-br flex items-center justify-center"
                 :style="{ background: product?.themeColor || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }">
              <div v-if="product?.images?.[currentImageIndex]" class="relative w-full h-full">
                <img :src="product.images[currentImageIndex]"
                     :alt="`${product.title} - Image ${currentImageIndex + 1}`"
                     class="w-full h-full object-cover"
                     @error="handleImageError" />
              </div>
              <div v-else class="text-white text-center">
                <ImageOff class="w-16 h-16 mx-auto mb-2 opacity-50" />
                <p class="text-sm opacity-75">Imagem não disponível</p>
              </div>

              <!-- Image Navigation Arrows -->
              <button v-if="product?.images && product.images.length > 1"
                      @click="previousImage"
                      class="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors">
                <ChevronLeft class="w-5 h-5" />
              </button>
              <button v-if="product?.images && product.images.length > 1"
                      @click="nextImage"
                      class="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors">
                <ChevronRight class="w-5 h-5" />
              </button>

              <!-- Image Counter -->
              <div v-if="product?.images && product.images.length > 1"
                   class="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-3 py-1 rounded-full bg-black/50 text-white text-xs font-semibold">
                {{ currentImageIndex + 1 }}/{{ product.images.length }}
              </div>
            </div>

            <!-- Thumbnail Strip -->
            <div v-if="product?.images && product.images.length > 1" class="flex gap-2 overflow-x-auto pb-2">
              <button v-for="(img, idx) in product.images"
                      :key="idx"
                      @click="currentImageIndex = idx"
                      class="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all"
                      :class="currentImageIndex === idx
                        ? 'border-brand-500 shadow-lg shadow-brand-500/50'
                        : (darkMode ? 'border-slate-700 hover:border-slate-600' : 'border-slate-200 hover:border-slate-300')">
                <img :src="img" :alt="`Thumbnail ${idx + 1}`" class="w-full h-full object-cover" @error="handleImageError" />
              </button>
            </div>
          </div>

          <!-- Product Info -->
          <div class="flex flex-col justify-between">
            <!-- Badges -->
            <div class="flex flex-wrap gap-2 mb-4">
              <span v-if="product?.discount"
                    class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
                    :class="darkMode ? 'bg-red-900/40 text-red-300' : 'bg-red-100 text-red-700'">
                -{{ product.discount }}% OFF
              </span>
              <span class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
                    :class="product?.category === 'pacote'
                      ? (darkMode ? 'bg-amber-900/40 text-amber-300' : 'bg-amber-100 text-amber-700')
                      : (darkMode ? 'bg-blue-900/40 text-blue-300' : 'bg-blue-100 text-blue-700')">
                {{ product?.category === 'pacote' ? '💎 Combo' : '⚡ Individual' }}
              </span>
              <span v-if="product?.sold"
                    class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
                    :class="darkMode ? 'bg-emerald-900/40 text-emerald-300' : 'bg-emerald-100 text-emerald-700'">
                {{ product.sold }} vendidos
              </span>
            </div>

            <!-- Title & Description -->
            <div class="mb-6">
              <h1 class="text-3xl font-black mb-2 font-display" :class="darkMode ? 'text-white' : 'text-slate-900'">
                {{ product?.title }}
              </h1>
              <p class="text-sm leading-relaxed" :class="darkMode ? 'text-slate-300' : 'text-slate-600'">
                {{ product?.description }}
              </p>
            </div>

            <!-- Rating -->
            <div class="flex items-center gap-4 mb-6 pb-6" :class="darkMode ? 'border-b border-slate-800' : 'border-b border-slate-200'">
              <div class="flex items-center gap-2">
                <div class="flex">
                  <Star class="w-5 h-5 fill-amber-500 text-amber-500" />
                  <Star class="w-5 h-5 fill-amber-500 text-amber-500" />
                  <Star class="w-5 h-5 fill-amber-500 text-amber-500" />
                  <Star class="w-5 h-5 fill-amber-500 text-amber-500" />
                  <Star class="w-5 h-5 fill-amber-500 text-amber-500" />
                </div>
                <span class="text-sm font-semibold" :class="darkMode ? 'text-slate-300' : 'text-slate-600'">
                  5.0 ({{ product?.sold || 0 }} reviews)
                </span>
              </div>
            </div>

            <!-- Price Section -->
            <div class="mb-6">
              <div class="flex items-baseline gap-3 mb-3">
                <div class="text-xs line-through" :class="darkMode ? 'text-slate-500' : 'text-slate-400'">
                  R$ {{ (product?.priceOriginal || product?.price)?.toFixed(2) }}
                </div>
                <div class="text-4xl font-black font-display" :class="darkMode ? 'text-white' : 'text-slate-900'">
                  R$ {{ product?.price?.toFixed(2) }}
                </div>
              </div>
              <p class="text-xs font-semibold px-2 py-1 inline-block rounded-md"
                 :class="darkMode ? 'bg-emerald-900/30 text-emerald-300' : 'bg-emerald-50 text-emerald-700'">
                Economize R$ {{ ((product?.priceOriginal || product?.price) - product?.price).toFixed(2) }}
              </p>
              <p class="text-xs mt-2" :class="darkMode ? 'text-slate-400' : 'text-slate-500'">
                À vista via PIX ou parcelado no cartão
              </p>
            </div>

            <!-- Quantity Selector -->
            <div class="flex items-center gap-4 mb-6">
              <span class="text-sm font-semibold" :class="darkMode ? 'text-slate-300' : 'text-slate-700'">
                Quantidade:
              </span>
              <div class="flex items-center gap-3 px-4 py-2 rounded-lg border"
                   :class="darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'">
                <button @click="decreaseQuantity"
                        class="p-1 hover:opacity-70 transition-opacity"
                        :disabled="quantity <= 1">
                  <Minus class="w-4 h-4" :class="darkMode ? 'text-white' : 'text-slate-900'" />
                </button>
                <input v-model.number="quantity"
                       type="number"
                       min="1"
                       class="w-12 text-center font-semibold border-0 bg-transparent outline-none"
                       :class="darkMode ? 'text-white' : 'text-slate-900'" />
                <button @click="increaseQuantity"
                        class="p-1 hover:opacity-70 transition-opacity">
                  <Plus class="w-4 h-4" :class="darkMode ? 'text-white' : 'text-slate-900'" />
                </button>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex gap-3">
              <button @click="addToCart"
                      class="flex-1 py-3 px-4 rounded-xl font-bold text-white transition-all duration-300 flex items-center justify-center gap-2"
                      :class="darkMode ? 'bg-brand-600 hover:bg-brand-500 shadow-lg shadow-brand-500/25' : 'bg-brand-600 hover:bg-brand-700 shadow-lg shadow-brand-500/30'">
                <ShoppingCart class="w-5 h-5" />
                Adicionar ao Carrinho
              </button>
              <a :href="whatsappLink"
                 target="_blank"
                 class="py-3 px-6 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2"
                 :class="darkMode ? 'bg-slate-800 text-white hover:bg-slate-700 border border-slate-700' : 'bg-slate-900 text-white hover:bg-slate-800'">
                <MessageCircle class="w-5 h-5" />
                WhatsApp
              </a>
            </div>
          </div>
        </div>

        <!-- Features Section -->
        <div class="mb-8 pb-8" :class="darkMode ? 'border-b border-slate-800' : 'border-b border-slate-200'">
          <h2 class="text-2xl font-bold mb-4 font-display" :class="darkMode ? 'text-white' : 'text-slate-900'">
            O que está incluído
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div v-for="(feature, idx) in product?.features || []"
                 :key="idx"
                 class="flex items-start gap-3 p-4 rounded-lg"
                 :class="darkMode ? 'bg-slate-800' : 'bg-slate-50'">
              <Check class="w-5 h-5 flex-shrink-0 text-emerald-500 mt-0.5" />
              <span class="text-sm" :class="darkMode ? 'text-slate-200' : 'text-slate-700'">
                {{ feature }}
              </span>
            </div>
          </div>
        </div>

        <!-- Preview Tabs Section -->
        <div v-if="product?.previews && product.previews.length > 0" class="mb-8">
          <h2 class="text-2xl font-bold mb-4 font-display" :class="darkMode ? 'text-white' : 'text-slate-900'">
            Visualizações
          </h2>

          <!-- Tab Buttons -->
          <div class="flex gap-2 mb-4 overflow-x-auto pb-2 border-b" :class="darkMode ? 'border-slate-800' : 'border-slate-200'">
            <button v-for="(preview, idx) in product.previews"
                    :key="idx"
                    @click="currentPreviewIndex = idx"
                    class="px-4 py-2 text-sm font-semibold rounded-t-lg transition-all whitespace-nowrap border-b-2"
                    :class="currentPreviewIndex === idx
                      ? (darkMode ? 'border-brand-500 text-brand-400' : 'border-brand-600 text-brand-600')
                      : (darkMode ? 'border-transparent text-slate-400 hover:text-slate-300' : 'border-transparent text-slate-600 hover:text-slate-900')">
              {{ preview.tabName }}
            </button>
          </div>

          <!-- Preview Content -->
          <div class="rounded-lg overflow-hidden bg-gradient-to-br flex items-center justify-center min-h-96"
               :style="{ background: product?.themeColor || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }">
            <img v-if="product?.previews[currentPreviewIndex]?.img"
                 :src="product.previews[currentPreviewIndex].img"
                 :alt="product.previews[currentPreviewIndex].tabName"
                 class="w-full h-full object-cover"
                 @error="handleImageError" />
          </div>
        </div>

        <!-- Additional Info -->
        <div class="pt-8" :class="darkMode ? 'border-t border-slate-800' : 'border-t border-slate-200'">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="p-4 rounded-lg text-center" :class="darkMode ? 'bg-slate-800' : 'bg-slate-50'">
              <Zap class="w-6 h-6 mx-auto mb-2" :class="darkMode ? 'text-blue-400' : 'text-blue-600'" />
              <p class="text-sm font-semibold mb-1" :class="darkMode ? 'text-slate-200' : 'text-slate-900'">
                Entrega Rápida
              </p>
              <p class="text-xs" :class="darkMode ? 'text-slate-400' : 'text-slate-600'">
                Acesso imediato após compra
              </p>
            </div>
            <div class="p-4 rounded-lg text-center" :class="darkMode ? 'bg-slate-800' : 'bg-slate-50'">
              <Shield class="w-6 h-6 mx-auto mb-2" :class="darkMode ? 'text-green-400' : 'text-green-600'" />
              <p class="text-sm font-semibold mb-1" :class="darkMode ? 'text-slate-200' : 'text-slate-900'">
                Garantia
              </p>
              <p class="text-xs" :class="darkMode ? 'text-slate-400' : 'text-slate-600'">
                Satisfação garantida 100%
              </p>
            </div>
            <div class="p-4 rounded-lg text-center" :class="darkMode ? 'bg-slate-800' : 'bg-slate-50'">
              <Headphones class="w-6 h-6 mx-auto mb-2" :class="darkMode ? 'text-purple-400' : 'text-purple-600'" />
              <p class="text-sm font-semibold mb-1" :class="darkMode ? 'text-slate-200' : 'text-slate-900'">
                Suporte Técnico
              </p>
              <p class="text-xs" :class="darkMode ? 'text-slate-400' : 'text-slate-600'">
                Suporte profissional 24/7
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Star,
  Minus,
  Plus,
  ShoppingCart,
  MessageCircle,
  Check,
  ImageOff,
  Zap,
  Shield,
  Headphones,
} from 'lucide-vue-next';
import { useCartStore } from '../stores/cart';

const props = defineProps({
  product: {
    type: Object,
    default: null,
  },
  isOpen: {
    type: Boolean,
    default: false,
  },
  darkMode: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['close', 'add-to-cart']);

const cartStore = useCartStore();
const quantity = ref(1);
const currentImageIndex = ref(0);
const currentPreviewIndex = ref(0);

const whatsappLink = computed(() => {
  if (!props.product) return '#';
  const message = `Olá Matheus, gostei do ${props.product.title} e gostaria de adquiri-lo!`;
  return `https://wa.me/5511951865795?text=${encodeURIComponent(message)}`;
});

const closeModal = () => {
  quantity.value = 1;
  currentImageIndex.value = 0;
  currentPreviewIndex.value = 0;
  emit('close');
};

const nextImage = () => {
  if (props.product?.images) {
    currentImageIndex.value = (currentImageIndex.value + 1) % props.product.images.length;
  }
};

const previousImage = () => {
  if (props.product?.images) {
    currentImageIndex.value = (currentImageIndex.value - 1 + props.product.images.length) % props.product.images.length;
  }
};

const increaseQuantity = () => {
  quantity.value += 1;
};

const decreaseQuantity = () => {
  if (quantity.value > 1) {
    quantity.value -= 1;
  }
};

const addToCart = () => {
  if (props.product) {
    for (let i = 0; i < quantity.value; i++) {
      cartStore.addItem(props.product);
    }
    emit('add-to-cart', {
      product: props.product,
      quantity: quantity.value,
    });
    closeModal();
  }
};

const handleImageError = (e) => {
  e.target.style.display = 'none';
};

// Reset state when modal closes or product changes
watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    quantity.value = 1;
    currentImageIndex.value = 0;
    currentPreviewIndex.value = 0;
  }
});

watch(() => props.product, () => {
  quantity.value = 1;
  currentImageIndex.value = 0;
  currentPreviewIndex.value = 0;
});
</script>

<style scoped>
/* Custom scrollbar for preview tabs */
::-webkit-scrollbar {
  height: 4px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 2px;
}

::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
