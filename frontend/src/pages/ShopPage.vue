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

    <!-- StreamPack Shop: hero + category filters + product grid + detail modal -->
    <div ref="productsSection">
      <StreamPackShop :dark-mode="darkMode" />
    </div>

    <!-- Portfolio / Streaming Examples Section (New Improved Version) -->
    <PortfolioGridSection :dark-mode="darkMode" />

    <!-- Testimonials Section (New Improved Version) -->
    <section id="testimonials">
      <TestimonialsSectionNew :dark-mode="darkMode" />
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
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { Moon, Sun, Zap } from 'lucide-vue-next';
import { useProductsStore } from '../stores/products';
import StreamPackShop from '../components/StreamPackShop.vue';
import PortfolioGridSection from '../components/PortfolioGridSection.vue';
import TestimonialsSectionNew from '../components/TestimonialsSectionNew.vue';

const darkMode = ref(false);
const productsSection = ref(null);

const productsStore = useProductsStore();

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
