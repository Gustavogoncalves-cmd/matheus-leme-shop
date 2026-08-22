<script setup>
import { Star, Quote, Swords, Sparkles, Gamepad2 } from 'lucide-vue-next'
import { motion } from 'motion-v'
import { ref } from 'vue'
import { fadeInUp, scaleGlow, staggerContainer, staggerItem } from '../composables/useAnimations'
import { useContentStore } from '../stores/content'

defineProps({
  darkMode: Boolean
})

// Section headings are owner-editable; the hardcoded copy stays as fallback.
// The testimonials themselves are quotes from real customers, so they are not
// exposed as editable text fields.
const content = useContentStore()

const testimonials = ref([
  {
    id: 1,
    name: 'Matzz Skins',
    role: '@matzz_skins',
    avatar: 'MS',
    color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    icon: Sparkles,
    rating: 5,
    testimonial: 'Matheus, os criativos ficaram absurdos! Muito bem elaborados, ficaram exatamente do jeito que eu queria.',
    date: 'Março 2026',
  },
  {
    id: 2,
    name: 'Blitz Skins',
    role: '@blitz.skins',
    avatar: 'BS',
    color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    icon: Gamepad2,
    rating: 5,
    testimonial: 'C#r4lho irmão! Os criativos ficaram insanos, estou sem palavras kkkk parabéns, você é f#d4',
    date: 'Março 2026',
  },
  {
    id: 3,
    name: 'Kael',
    role: '@kael_',
    avatar: 'K',
    color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    icon: Swords,
    rating: 5,
    testimonial: 'Profissionalismo impecável! O Matheus editou meus vídeos longos exatamente como eu queria, com narrativa fluida.',
    date: 'Fevereiro 2026',
  },
])

const hoveredId = ref(null)
</script>

<template>
  <!-- Testimonials Section -->
  <section class="py-14 sm:py-20 px-4 sm:px-6 lg:px-8" :class="darkMode ? 'bg-slate-900' : 'bg-white'">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <motion.div v-bind="fadeInUp()" class="text-center mb-12 sm:mb-16">
        <h2 class="text-3xl sm:text-4xl md:text-5xl font-black mb-4 font-display">
          {{ content.text('testimonials_title', 'Opinião de Quem Comprou') }}
        </h2>
        <p class="text-base sm:text-lg max-w-2xl mx-auto mb-6"
           :class="darkMode ? 'text-slate-300' : 'text-slate-600'">
          {{ content.text('testimonials_subtitle', 'Avaliações reais de quem já fechou trabalho com o Matheus') }}
        </p>

        <!-- Rating summary -->
        <div class="inline-flex items-center gap-3 px-5 py-2.5 rounded-full border"
             :class="darkMode ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200'">
          <div class="flex gap-0.5">
            <Star v-for="s in 5" :key="s" size="16" class="text-amber-400 fill-amber-400" />
          </div>
          <span class="font-black text-sm" :class="darkMode ? 'text-white' : 'text-slate-900'">5.0</span>
          <span class="text-xs" :class="darkMode ? 'text-slate-400' : 'text-slate-500'">
            5 avaliações verificadas
          </span>
        </div>
      </motion.div>

      <!-- Testimonials Grid -->
      <motion.div v-bind="staggerContainer(0.12)" class="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
        <motion.div v-for="testimonial in testimonials"
             :key="testimonial.id"
             v-bind="{ ...staggerItem(), ...scaleGlow() }"
             class="group relative overflow-hidden rounded-2xl shadow-lg transition-shadow duration-300"
             :class="darkMode ? 'bg-slate-800 hover:shadow-neon-magenta' : 'bg-white hover:shadow-xl'"
             @mouseenter="hoveredId = testimonial.id"
             @mouseleave="hoveredId = null">

          <!-- Quote Mark Background -->
          <div class="absolute -top-8 -left-8 opacity-10 pointer-events-none">
            <Quote :size="120" :class="darkMode ? 'text-brand-400' : 'text-brand-300'" />
          </div>

          <!-- Gradient Border Top -->
          <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-500 via-pink-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

          <!-- Content -->
          <div class="relative z-10 p-6 sm:p-8">
            <!-- Stars -->
            <div class="flex gap-1 mb-4">
              <Star v-for="star in testimonial.rating"
                    :key="star"
                    size="18"
                    class="text-amber-400 fill-amber-400 transition-transform duration-300 group-hover:scale-110" />
              <Star v-for="star in (5 - testimonial.rating)"
                    :key="`empty-${star}`"
                    size="18"
                    class="text-slate-300"
                    :class="darkMode ? 'text-slate-600' : 'text-slate-300'" />
            </div>

            <!-- Testimonial Text -->
            <p class="text-sm sm:text-base mb-6 leading-relaxed"
               :class="darkMode ? 'text-slate-300' : 'text-slate-700'">
              "{{ testimonial.testimonial }}"
            </p>

            <!-- Divider -->
            <div class="border-t mb-4" :class="darkMode ? 'border-slate-700' : 'border-slate-200'"></div>

            <!-- Author Info -->
            <div class="flex items-center gap-3 sm:gap-4">
              <!-- Avatar -->
              <div class="relative flex-shrink-0">
                <div class="relative w-14 h-14 rounded-full flex items-center justify-center overflow-hidden shadow-lg ring-2 group-hover:scale-110 transition-transform duration-300"
                     :class="darkMode ? 'ring-slate-700' : 'ring-white'"
                     :style="{ background: testimonial.color }">
                  <!-- Icon watermark -->
                  <component :is="testimonial.icon" class="absolute w-8 h-8 text-white/25" stroke-width="1.5" />
                  <!-- Initials -->
                  <span class="relative font-black text-white text-sm tracking-wide">{{ testimonial.avatar }}</span>
                </div>
                <!-- Online Status Indicator -->
                <div class="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2"
                     :class="darkMode ? 'border-slate-800' : 'border-white'"></div>
              </div>

              <!-- Author Details -->
              <div class="flex-grow">
                <h4 class="font-bold text-sm"
                    :class="darkMode ? 'text-white' : 'text-slate-900'">
                  {{ testimonial.name }}
                </h4>
                <p class="text-xs"
                   :class="darkMode ? 'text-slate-400' : 'text-slate-500'">
                  {{ testimonial.role }}
                </p>
              </div>

              <!-- Date -->
              <span class="text-[10px] font-semibold flex-shrink-0"
                    :class="darkMode ? 'text-slate-500' : 'text-slate-400'">
                {{ testimonial.date }}
              </span>
            </div>
          </div>

          <!-- Hover Glow Effect -->
          <div class="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none"
               style="background: linear-gradient(135deg, rgb(59, 130, 246), rgb(168, 85, 247)); filter: blur(20px)"></div>
        </motion.div>
      </motion.div>

      <!-- CTA Section -->
      <motion.div v-bind="fadeInUp()" class="mt-12 sm:mt-16 p-6 sm:p-8 md:p-12 rounded-2xl text-center"
           :class="darkMode ? 'bg-gradient-to-r from-brand-900/30 to-pink-900/30 border border-brand-500/20' : 'bg-gradient-to-r from-brand-50 to-pink-50 border border-brand-200'">
        <h3 class="text-2xl md:text-3xl font-bold mb-4 font-display"
            :class="darkMode ? 'text-white' : 'text-slate-900'">
          {{ content.text('testimonials_cta_title', 'Pronto para Transformar seu Stream?') }}
        </h3>
        <p class="mb-6 max-w-2xl mx-auto"
           :class="darkMode ? 'text-slate-300' : 'text-slate-600'">
          {{ content.text('testimonials_cta_text', 'Junte-se aos streamers que já estão elevando seu setup com nossos streampacks') }}
        </p>
        <button class="px-8 py-4 rounded-xl font-bold transition-all duration-300 hover:scale-105 transform shadow-lg hover:shadow-2xl"
                :class="darkMode ? 'bg-brand-600 text-white hover:bg-brand-500' : 'bg-brand-600 text-white hover:bg-brand-700'">
          Começar Agora →
        </button>
      </motion.div>
    </div>
  </section>
</template>
