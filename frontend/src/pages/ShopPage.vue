<template>
  <div class="min-h-screen bg-neon-bg text-white">
    <!-- Header is rendered globally by App.vue -->

    <!-- Hero + Catalog grid (with category filters + marquee) -->
    <CatalogShop />

    <!-- Portfolio: real streamers using our overlays, live embeds -->
    <PortfolioGridSection id="portfolio" :dark-mode="true" />

    <!-- Testimonials -->
    <TestimonialsSectionNew id="depoimentos" :dark-mode="true" />

    <!-- CTA -->
    <section class="py-14 sm:py-20 px-4 sm:px-6 lg:px-8 border-t border-neon-line">
      <motion.div v-bind="fadeInUp()" class="max-w-4xl mx-auto text-center">
        <h2 class="text-3xl sm:text-4xl md:text-5xl font-black mb-6 font-display uppercase">
          <template v-for="(part, i) in ctaTitleParts" :key="i"><span
            v-if="part.accent" class="text-neon-lime">{{ part.text }}</span><template
            v-else>{{ part.text }}</template></template>
        </h2>
        <p class="text-base sm:text-lg text-slate-400 mb-8">
          {{ content.text('cta_subtitle', 'Escolha seu combo ou monte seu setup com peças avulsas') }}
        </p>
        <motion.button @click="scrollToMenu"
                v-bind="scaleGlow()"
                class="px-6 sm:px-8 py-3.5 sm:py-4 rounded-full font-black uppercase tracking-wide text-xs sm:text-sm bg-neon-lime text-black hover:shadow-neon-lime transition-shadow inline-flex items-center gap-2">
          <Zap class="w-5 h-5" />
          Ver Catálogo
        </motion.button>
      </motion.div>
    </section>

    <!-- Footer -->
    <footer id="contato" class="py-12 px-4 sm:px-6 lg:px-8 border-t border-neon-line bg-neon-card">
      <motion.div v-bind="fadeIn()" class="max-w-7xl mx-auto text-center">
        <p class="font-black uppercase tracking-widest text-white mb-2">
          {{ content.text('footer_brand', 'Matheus Leme') }}
        </p>
        <p class="text-sm text-slate-400">
          {{ content.text('footer_tagline', 'Loja de Streampacks Premium — Design e Motion para Streamers') }}
        </p>
        <p class="text-xs text-slate-500 mt-2">
          {{ content.text('footer_contact', 'Pedidos e dúvidas: contato@matheusleme.com.br | WhatsApp: +55 11 95186-5795') }}
        </p>
        <p class="text-xs text-slate-600 mt-4">
          {{ content.text('footer_copyright', '© 2026 Matheus Leme. Todos os direitos reservados.') }}
        </p>
      </motion.div>
    </footer>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { Zap } from 'lucide-vue-next';
import { motion } from 'motion-v';
import { fadeIn, fadeInUp, scaleGlow } from '../composables/useAnimations';
import { useContentStore } from '../stores/content';
import { accentText } from '../utils/accentText';
import CatalogShop from '../components/CatalogShop.vue';
import PortfolioGridSection from '../components/PortfolioGridSection.vue';
import TestimonialsSectionNew from '../components/TestimonialsSectionNew.vue';

const content = useContentStore();

// The CTA headline highlights one word in neon. The stored value marks it with
// *asterisks* instead of HTML so owner-supplied copy is never rendered as
// markup - see utils/accentText.js.
const ctaTitleParts = computed(() =>
  accentText(content.text('cta_title', 'Pronto para elevar sua *live*?'))
);

const scrollToMenu = () => {
  document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' });
};

// The whole page (hero, portfolio, testimonials, CTA, footer) reads from this
// one store, so a single fetch here covers every child. fetchContent swallows
// its own errors - a CMS outage leaves the hardcoded fallbacks in place.
onMounted(() => {
  content.fetchContent();
});
</script>
