<template>
  <div :class="darkMode ? 'bg-slate-950 text-white' : 'bg-white text-slate-900'" class="min-h-screen">
    <!-- Header -->
    <header class="sticky top-0 z-40 border-b backdrop-blur-md" :class="darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-slate-200'">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <h1 class="text-2xl font-black font-display" :class="darkMode ? 'text-white' : 'text-slate-900'">
          Matheus Leme Shop
        </h1>
        <button @click="darkMode = !darkMode"
                class="p-2 rounded-lg transition-colors"
                :class="darkMode ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'">
          <Moon v-if="!darkMode" class="w-5 h-5" />
          <Sun v-else class="w-5 h-5" />
        </button>
      </div>
    </header>

    <!-- Hero Section -->
    <section class="relative overflow-hidden py-20 md:py-32 px-4 sm:px-6 lg:px-8"
             :class="darkMode ? 'bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900' : 'bg-gradient-to-br from-slate-50 via-white to-slate-50'">
      <!-- Background Grid -->
      <div class="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]"
           :class="darkMode ? '' : 'opacity-30'"></div>

      <!-- Radial Gradient Blobs -->
      <div class="absolute top-0 right-1/4 w-96 h-96 rounded-full"
           :class="darkMode ? 'bg-brand-500/10 blur-3xl' : 'bg-brand-200/30 blur-3xl'"></div>
      <div class="absolute bottom-0 left-1/4 w-96 h-96 rounded-full"
           :class="darkMode ? 'bg-indigo-500/10 blur-3xl' : 'bg-indigo-200/30 blur-3xl'"></div>

      <!-- Content -->
      <div class="relative max-w-4xl mx-auto text-center">
        <div class="inline-block mb-6">
          <span class="px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider"
                :class="darkMode ? 'bg-brand-900/40 text-brand-300 border border-brand-500/30' : 'bg-brand-100 text-brand-700 border border-brand-300'">
            ✨ Bem-vindo ao melhor shop de streaming
          </span>
        </div>

        <h1 class="text-5xl md:text-7xl font-black mb-6 font-display leading-tight tracking-tighter">
          <span class="bg-clip-text text-transparent bg-gradient-to-r from-brand-500 via-pink-500 to-indigo-500">
            Eleve suas Transmissões
          </span>
        </h1>

        <p class="text-lg md:text-xl mb-8 leading-relaxed"
           :class="darkMode ? 'text-slate-300' : 'text-slate-600'">
          Acesso a pacotes completos, assets profissionais e designs de qualidade estúdio.
          Tudo pronto para usar e personalizar conforme necessário.
        </p>

        <div class="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <button @click="scrollToProducts"
                  class="px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-lg"
                  :class="darkMode ? 'bg-brand-600 text-white hover:bg-brand-500 shadow-brand-500/25' : 'bg-brand-600 text-white hover:bg-brand-700 shadow-brand-500/30'">
            <ShoppingCart class="w-5 h-5" />
            Ver Catálogo Completo
          </button>
          <a href="#testimonials"
             class="px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-2"
             :class="darkMode ? 'bg-slate-800 text-white hover:bg-slate-700 border border-slate-700' : 'bg-slate-100 text-slate-900 hover:bg-slate-200 border border-slate-300'">
            <Star class="w-5 h-5" />
            Ver Avaliações
          </a>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-2 md:grid-cols-3 gap-6">
          <div class="p-6 rounded-xl" :class="darkMode ? 'bg-slate-800/50 backdrop-blur' : 'bg-white/50 backdrop-blur'">
            <p class="text-3xl font-black font-display text-brand-500 mb-1">1000+</p>
            <p class="text-sm" :class="darkMode ? 'text-slate-400' : 'text-slate-600'">
              Clientes Felizes
            </p>
          </div>
          <div class="p-6 rounded-xl" :class="darkMode ? 'bg-slate-800/50 backdrop-blur' : 'bg-white/50 backdrop-blur'">
            <p class="text-3xl font-black font-display text-brand-500 mb-1">4.9★</p>
            <p class="text-sm" :class="darkMode ? 'text-slate-400' : 'text-slate-600'">
              Avaliação Média
            </p>
          </div>
          <div class="p-6 rounded-xl col-span-2 md:col-span-1" :class="darkMode ? 'bg-slate-800/50 backdrop-blur' : 'bg-white/50 backdrop-blur'">
            <p class="text-3xl font-black font-display text-brand-500 mb-1">24/7</p>
            <p class="text-sm" :class="darkMode ? 'text-slate-400' : 'text-slate-600'">
              Suporte
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Product Grid Section -->
    <section ref="productsSection" class="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <ProductGrid :dark-mode="darkMode" @product-selected="openProductDetail" />
    </section>

    <!-- Portfolio / Streaming Examples Section -->
    <section class="py-20 px-4 sm:px-6 lg:px-8" :class="darkMode ? 'bg-slate-900' : 'bg-slate-50'">
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-16">
          <h2 class="text-4xl md:text-5xl font-black mb-4 font-display">
            Exemplos de Streamers
          </h2>
          <p class="text-lg" :class="darkMode ? 'text-slate-300' : 'text-slate-600'">
            Veja como nossos produtos estão transformando transmissões
          </p>
        </div>

        <!-- Portfolio Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div v-for="example in streamingExamples"
               :key="example.id"
               class="group overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300"
               :class="darkMode ? 'bg-slate-800 hover:bg-slate-750' : 'bg-white hover:shadow-xl'">
            <!-- Image -->
            <div class="relative h-48 overflow-hidden bg-gradient-to-br"
                 :style="{ background: example.color }">
              <div class="absolute inset-0 flex items-center justify-center">
                <Play class="w-16 h-16 text-white opacity-40 group-hover:opacity-100 transition-opacity" />
              </div>
              <div class="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
            </div>

            <!-- Content -->
            <div class="p-6">
              <div class="flex items-center gap-2 mb-3">
                <TrendingUp class="w-5 h-5 text-emerald-500" />
                <span class="text-sm font-bold text-emerald-500">STREAMER VERIFICADO</span>
              </div>
              <h3 class="text-xl font-bold mb-2" :class="darkMode ? 'text-white' : 'text-slate-900'">
                {{ example.name }}
              </h3>
              <p class="text-sm mb-4" :class="darkMode ? 'text-slate-400' : 'text-slate-600'">
                {{ example.description }}
              </p>

              <!-- Stats -->
              <div class="flex gap-4 pt-4 border-t" :class="darkMode ? 'border-slate-700' : 'border-slate-200'">
                <div class="flex-1">
                  <p class="text-xs" :class="darkMode ? 'text-slate-500' : 'text-slate-500'">
                    Produtos
                  </p>
                  <p class="text-lg font-bold" :class="darkMode ? 'text-white' : 'text-slate-900'">
                    {{ example.productsCount }}
                  </p>
                </div>
                <div class="flex-1">
                  <p class="text-xs" :class="darkMode ? 'text-slate-500' : 'text-slate-500'">
                    Melhoria
                  </p>
                  <p class="text-lg font-bold text-brand-500">
                    {{ example.improvement }}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Testimonials Section -->
    <section id="testimonials" class="py-20 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-16">
          <h2 class="text-4xl md:text-5xl font-black mb-4 font-display">
            O que nossos clientes dizem
          </h2>
          <p class="text-lg" :class="darkMode ? 'text-slate-300' : 'text-slate-600'">
            Histórias reais de streamers que transformaram suas transmissões
          </p>
        </div>

        <!-- Testimonials Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div v-for="testimonial in testimonials"
               :key="testimonial.id"
               class="p-8 rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
               :class="darkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-100'">
            <!-- Rating -->
            <div class="flex gap-1 mb-4">
              <Star v-for="i in 5" :key="i" class="w-5 h-5 fill-amber-500 text-amber-500" />
            </div>

            <!-- Testimonial Text -->
            <p class="mb-6 text-sm leading-relaxed"
               :class="darkMode ? 'text-slate-300' : 'text-slate-600'">
              "{{ testimonial.text }}"
            </p>

            <!-- Author -->
            <div class="flex items-center gap-3 pt-4 border-t"
                 :class="darkMode ? 'border-slate-700' : 'border-slate-100'">
              <div class="w-10 h-10 rounded-full bg-gradient-to-br flex items-center justify-center text-white font-bold text-sm"
                   :style="{ background: testimonial.color }">
                {{ testimonial.author.charAt(0) }}
              </div>
              <div>
                <p class="text-sm font-bold" :class="darkMode ? 'text-white' : 'text-slate-900'">
                  {{ testimonial.author }}
                </p>
                <p class="text-xs" :class="darkMode ? 'text-slate-400' : 'text-slate-500'">
                  {{ testimonial.role }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-20 px-4 sm:px-6 lg:px-8" :class="darkMode ? 'bg-gradient-to-r from-brand-900 to-indigo-900' : 'bg-gradient-to-r from-brand-600 to-indigo-600'">
      <div class="max-w-4xl mx-auto text-center">
        <h2 class="text-4xl md:text-5xl font-black mb-6 font-display text-white">
          Pronto para elevar suas transmissões?
        </h2>
        <p class="text-lg text-white/90 mb-8">
          Comece hoje mesmo com nossos pacotes especiais e designs exclusivos
        </p>
        <button @click="scrollToProducts"
                class="px-8 py-4 rounded-xl font-bold text-lg bg-white text-brand-600 hover:bg-slate-100 transition-all duration-300 shadow-lg inline-flex items-center gap-2">
          <Zap class="w-5 h-5" />
          Explorar Catálogo
        </button>
      </div>
    </section>

    <!-- Footer -->
    <footer class="py-12 px-4 sm:px-6 lg:px-8 border-t"
            :class="darkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'">
      <div class="max-w-7xl mx-auto text-center">
        <p class="text-sm" :class="darkMode ? 'text-slate-400' : 'text-slate-600'">
          © 2024 Matheus Leme Shop. Todos os direitos reservados.
        </p>
        <p class="text-xs mt-2" :class="darkMode ? 'text-slate-500' : 'text-slate-500'">
          Suporte: suporte@matheusleme.com.br | WhatsApp: +55 11 95186-5795
        </p>
      </div>
    </footer>

    <!-- Product Detail Modal -->
    <ProductDetail :product="selectedProduct"
                   :is-open="showProductDetail"
                   :dark-mode="darkMode"
                   @close="showProductDetail = false"
                   @add-to-cart="handleAddToCart" />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import {
  ShoppingCart,
  Star,
  Moon,
  Sun,
  Play,
  TrendingUp,
  Zap,
} from 'lucide-vue-next';
import { useProductsStore } from '../stores/products';
import ProductGrid from '../components/ProductGrid.vue';
import ProductDetail from '../components/ProductDetail.vue';

const darkMode = ref(false);
const showProductDetail = ref(false);
const selectedProduct = ref(null);
const productsSection = ref(null);

const productsStore = useProductsStore();

// Streaming Examples Data
const streamingExamples = ref([
  {
    id: 1,
    name: 'Luna Stream',
    description: 'Streamer de RPG que aumentou engagement em 240% com nossos overlays',
    color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    productsCount: 4,
    improvement: 240,
  },
  {
    id: 2,
    name: 'Nexus Gaming',
    description: 'Competidor de FPS com transições 4K e alertas profissionais',
    color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    productsCount: 6,
    improvement: 185,
  },
  {
    id: 3,
    name: 'Crystal Content',
    description: 'Criadora de conteúdo que triplicou visualizações com mídia kit',
    color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    productsCount: 3,
    improvement: 320,
  },
  {
    id: 4,
    name: 'Phoenix Streams',
    description: 'Streamer de variedade com pacote completo de assets',
    color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    productsCount: 5,
    improvement: 215,
  },
  {
    id: 5,
    name: 'Void Gaming',
    description: 'Competidor hardcore com customizações totais de overlays',
    color: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
    productsCount: 7,
    improvement: 290,
  },
  {
    id: 6,
    name: 'Aurora Studios',
    description: 'Estúdio profissional com pacote white-label exclusivo',
    color: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    productsCount: 8,
    improvement: 400,
  },
]);

// Testimonials Data
const testimonials = ref([
  {
    id: 1,
    text: 'Os produtos do Matheus transformaram completamente minha transmissão. Os overlays são profissionais e as transições deixaram meu stream muito mais limpo.',
    author: 'Marina Silva',
    role: 'Streamer de Just Chatting',
    color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  {
    id: 2,
    text: 'Excelente qualidade e muito suporte. Consegui fazer ajustes no avatar customizado conforme minhas necessidades. Recomendo!',
    author: 'Carlos Oliveira',
    role: 'Gamer FPS',
    color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  },
  {
    id: 3,
    text: 'O pacote completo Nitro é sensacional. Vale cada centavo. Meu chat virou muito mais engajado após usar os badges customizados.',
    author: 'Beatriz Santos',
    role: 'Streamer de Comédia',
    color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  },
  {
    id: 4,
    text: 'Suporte impecável. Tirei todas as minhas dúvidas sobre como implementar os assets no OBS. Muito profissional!',
    author: 'Rafael Costa',
    role: 'Content Creator',
    color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  },
  {
    id: 5,
    text: 'Fechei 3 patrocínios diretos depois que comecei a usar a mídia kit. Ferramenta essencial para quem quer crescer.',
    author: 'Isabela Rocha',
    role: 'Streamgirl Profissional',
    color: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
  },
  {
    id: 6,
    text: 'Os emotes animados da minha comunidade ficaram incríveis. Nosso viewer count subiu 50% no mês seguinte.',
    author: 'Thiago Mendes',
    role: 'Esporcelista',
    color: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
  },
]);

// Methods
const openProductDetail = (product) => {
  selectedProduct.value = product;
  showProductDetail.value = true;
};

const handleAddToCart = (data) => {
  console.log('Product added to cart:', data);
  // Optional: show toast notification here
};

const scrollToProducts = () => {
  if (productsSection.value) {
    productsSection.value.scrollIntoView({ behavior: 'smooth' });
  }
};

// Lifecycle
onMounted(() => {
  productsStore.fetchProducts();
  // Load dark mode from localStorage
  const savedDarkMode = localStorage.getItem('darkMode');
  if (savedDarkMode !== null) {
    darkMode.value = JSON.parse(savedDarkMode);
  }
});

// Watch dark mode changes
watch(darkMode, (newVal) => {
  localStorage.setItem('darkMode', JSON.stringify(newVal));
});
</script>

<style scoped>
/* Custom animations */
@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}
</style>
