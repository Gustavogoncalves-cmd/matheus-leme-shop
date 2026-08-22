<script setup>
import { motion } from 'motion-v'
import { ArrowDown } from 'lucide-vue-next'
import { useTypewriter, fadeInUp } from '../composables/useAnimations'
import { useContentStore } from '../stores/content'

const emit = defineEmits(['scroll-to-menu'])

// Copy is owner-editable via the admin panel. Every read passes the original
// hardcoded string as the fallback, so the section renders identically when the
// content API is unreachable or a key has not been seeded yet.
const content = useContentStore()

const { display: headline } = useTypewriter(() => content.text('hero_title', 'Matheus Leme'), {
  speed: 90,
  startDelay: 150,
})
</script>

<template>
  <section class="relative min-h-[85vh] flex flex-col items-center justify-center overflow-hidden bg-neon-bg px-4 text-center">
    <!-- Neon glow backdrop -->
    <div class="pointer-events-none absolute inset-0">
      <div class="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-neon-lime/10 blur-[100px]"></div>
      <div class="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-neon-magenta/10 blur-[100px]"></div>
      <div class="absolute inset-0 opacity-[0.05]"
           style="background-image: linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px); background-size: 32px 32px;"></div>
    </div>

    <motion.span
      :initial="{ opacity: 0, y: -10 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{ duration: 0.5 }"
      class="relative z-10 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] px-4 py-2 rounded-full border border-neon-lime/40 text-neon-lime mb-6">
      <span class="w-2 h-2 rounded-full bg-neon-lime animate-pulse"></span>
      {{ content.text('hero_badge', 'Exclusivo para Streamers') }}
    </motion.span>

    <h1 class="relative z-10 font-display font-black uppercase text-white text-5xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight leading-none min-h-[1.2em]">
      {{ headline }}<span class="inline-block w-[3px] h-[0.9em] bg-neon-lime ml-1 align-middle animate-pulse"></span>
    </h1>

    <motion.p v-bind="fadeInUp(0.7)"
              class="relative z-10 mt-6 max-w-xl text-base sm:text-lg text-slate-400">
      {{ content.text('hero_subtitle', 'Eleve as suas transmissões: combos completos ou peças avulsas de identidade visual, cenas OBS, painéis e alertas animados. Entrega rápida via WhatsApp.') }}
    </motion.p>

    <motion.div v-bind="fadeInUp(0.9)" class="relative z-10 mt-10 flex flex-col sm:flex-row items-center gap-4">
      <motion.button
        :while-hover="{ scale: 1.05 }"
        :while-tap="{ scale: 0.97 }"
        class="px-8 py-4 rounded-full bg-neon-lime text-black font-black uppercase tracking-wide text-sm shadow-neon-lime hover:shadow-neon-lime transition-shadow"
        @click="emit('scroll-to-menu')">
        {{ content.text('hero_cta_primary', 'Ver Catálogo') }}
      </motion.button>
      <a href="#portfolio"
         class="px-8 py-4 rounded-full border border-slate-700 text-white font-bold uppercase tracking-wide text-sm hover:border-neon-cyan hover:text-neon-cyan transition-colors">
        {{ content.text('hero_cta_secondary', 'Ver Portfólio') }}
      </a>
    </motion.div>

    <button class="relative z-10 mt-16 text-slate-500 hover:text-neon-lime transition-colors animate-bounce"
            @click="emit('scroll-to-menu')" aria-label="Rolar para o catálogo">
      <ArrowDown class="w-6 h-6" />
    </button>
  </section>
</template>
