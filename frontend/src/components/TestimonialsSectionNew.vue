<script setup>
import { Star, Quote } from 'lucide-vue-next'
import { ref } from 'vue'

defineProps({
  darkMode: Boolean
})

const testimonials = ref([
  {
    id: 1,
    name: 'Luna Streams',
    role: 'Streamer de RPG',
    avatar: 'LS',
    rating: 5,
    testimonial: 'Os overlays transformaram completamente meu stream! A qualidade é profissional e o suporte é excepcional.',
    improvement: '+240%'
  },
  {
    id: 2,
    name: 'Nexus Gaming',
    role: 'Competidor FPS',
    avatar: 'NG',
    rating: 5,
    testimonial: 'Melhor investimento que fiz. Os assets são incríveis e o tempo de implementação foi mínimo.',
    improvement: '+185%'
  },
  {
    id: 3,
    name: 'Crystal Content',
    role: 'Criadora de Conteúdo',
    avatar: 'CC',
    rating: 5,
    testimonial: 'Recomendo para todos os criadores! Design profissional sem complicações técnicas.',
    improvement: '+320%'
  },
  {
    id: 4,
    name: 'Phoenix Streams',
    role: 'Streamer de Variedade',
    avatar: 'PS',
    rating: 4,
    testimonial: 'Excelente qualidade e preço justo. As customizações disponíveis atendem perfeitamente minha marca.',
    improvement: '+215%'
  },
  {
    id: 5,
    name: 'Void Gaming',
    role: 'Streamer Hardcore',
    avatar: 'VG',
    rating: 5,
    testimonial: 'O suporte 24/7 faz toda diferença. Qualquer dúvida é resolvida rapidamente.',
    improvement: '+290%'
  },
  {
    id: 6,
    name: 'Aurora Studios',
    role: 'Estúdio Profissional',
    avatar: 'AS',
    rating: 5,
    testimonial: 'Somos parceiros exclusivos. A plataforma permite customizações que nos diferenciam do mercado.',
    improvement: '+400%'
  },
])

const hoveredId = ref(null)
</script>

<template>
  <!-- Testimonials Section -->
  <section class="py-20 px-4 sm:px-6 lg:px-8" :class="darkMode ? 'bg-slate-900' : 'bg-white'">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-16">
        <h2 class="text-4xl md:text-5xl font-black mb-4 font-display">
          O que Nossos Clientes Dizem
        </h2>
        <p class="text-lg max-w-2xl mx-auto"
           :class="darkMode ? 'text-slate-300' : 'text-slate-600'">
          Histórias reais de streamers que transformaram seus canais com nossos produtos
        </p>
      </div>

      <!-- Testimonials Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div v-for="(testimonial, idx) in testimonials"
             :key="testimonial.id"
             class="group relative overflow-hidden rounded-2xl shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-105 transform"
             :class="darkMode ? 'bg-slate-800 hover:bg-slate-750' : 'bg-white hover:shadow-xl'"
             @mouseenter="hoveredId = testimonial.id"
             @mouseleave="hoveredId = null"
             style="animation: slideUp 0.6s ease-out forwards"
             :style="{ animationDelay: `${idx * 0.1}s` }">

          <!-- Quote Mark Background -->
          <div class="absolute -top-8 -left-8 opacity-10 pointer-events-none">
            <Quote :size="120" :class="darkMode ? 'text-brand-400' : 'text-brand-300'" />
          </div>

          <!-- Gradient Border Top -->
          <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-500 via-pink-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

          <!-- Content -->
          <div class="relative z-10 p-8">
            <!-- Stars -->
            <div class="flex gap-1 mb-4">
              <Star v-for="star in testimonial.rating"
                    :key="star"
                    size="18"
                    class="text-amber-400 fill-amber-400"
                    style="animation: starPop 0.4s ease-out forwards"
                    :style="{ animationDelay: `${idx * 0.1 + star * 0.05}s` }" />
              <Star v-for="star in (5 - testimonial.rating)"
                    :key="`empty-${star}`"
                    size="18"
                    class="text-slate-300"
                    :class="darkMode ? 'text-slate-600' : 'text-slate-300'" />
            </div>

            <!-- Testimonial Text -->
            <p class="text-base mb-6 leading-relaxed"
               :class="darkMode ? 'text-slate-300' : 'text-slate-700'"
               style="animation: fadeInUp 0.6s ease-out forwards"
               :style="{ animationDelay: `${idx * 0.1 + 0.15}s` }">
              "{{ testimonial.testimonial }}"
            </p>

            <!-- Divider -->
            <div class="border-t mb-4" :class="darkMode ? 'border-slate-700' : 'border-slate-200'"></div>

            <!-- Author Info -->
            <div class="flex items-center gap-4"
                 style="animation: slideInUp 0.6s ease-out forwards"
                 :style="{ animationDelay: `${idx * 0.1 + 0.2}s` }">
              <!-- Avatar -->
              <div class="relative flex-shrink-0">
                <div class="w-12 h-12 rounded-full bg-gradient-to-br from-brand-400 to-pink-500 flex items-center justify-center font-bold text-white text-sm shadow-lg group-hover:scale-110 transition-transform duration-300">
                  {{ testimonial.avatar }}
                </div>
                <!-- Online Status Indicator -->
                <div class="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2"
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

              <!-- Improvement Badge -->
              <div class="text-right">
                <p class="text-xs font-bold text-emerald-500 mb-1">Crescimento</p>
                <p class="text-lg font-black text-brand-500">
                  {{ testimonial.improvement }}
                </p>
              </div>
            </div>
          </div>

          <!-- Hover Glow Effect -->
          <div class="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none"
               style="background: linear-gradient(135deg, rgb(59, 130, 246), rgb(168, 85, 247)); filter: blur(20px)"></div>
        </div>
      </div>

      <!-- Stats Section -->
      <div class="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div class="p-8 rounded-2xl text-center backdrop-blur"
             :class="darkMode ? 'bg-slate-800/50 border border-slate-700' : 'bg-slate-50 border border-slate-200'"
             :style="{ animation: 'fadeInUp 0.8s ease-out forwards', animationDelay: '0.6s' }">
          <p class="text-4xl font-black text-brand-500 mb-2">98%</p>
          <p class="font-semibold" :class="darkMode ? 'text-slate-300' : 'text-slate-700'">
            Taxa de Satisfação
          </p>
        </div>
        <div class="p-8 rounded-2xl text-center backdrop-blur"
             :class="darkMode ? 'bg-slate-800/50 border border-slate-700' : 'bg-slate-50 border border-slate-200'"
             :style="{ animation: 'fadeInUp 0.8s ease-out forwards', animationDelay: '0.7s' }">
          <p class="text-4xl font-black text-brand-500 mb-2">1000+</p>
          <p class="font-semibold" :class="darkMode ? 'text-slate-300' : 'text-slate-700'">
            Clientes Ativos
          </p>
        </div>
        <div class="p-8 rounded-2xl text-center backdrop-blur"
             :class="darkMode ? 'bg-slate-800/50 border border-slate-700' : 'bg-slate-50 border border-slate-200'"
             :style="{ animation: 'fadeInUp 0.8s ease-out forwards', animationDelay: '0.8s' }">
          <p class="text-4xl font-black text-brand-500 mb-2">5★</p>
          <p class="font-semibold" :class="darkMode ? 'text-slate-300' : 'text-slate-700'">
            Avaliação Média
          </p>
        </div>
      </div>

      <!-- CTA Section -->
      <div class="mt-16 p-8 md:p-12 rounded-2xl text-center"
           :class="darkMode ? 'bg-gradient-to-r from-brand-900/30 to-pink-900/30 border border-brand-500/20' : 'bg-gradient-to-r from-brand-50 to-pink-50 border border-brand-200'">
        <h3 class="text-2xl md:text-3xl font-bold mb-4 font-display"
            :class="darkMode ? 'text-white' : 'text-slate-900'">
          Pronto para Transformar seu Stream?
        </h3>
        <p class="mb-6 max-w-2xl mx-auto"
           :class="darkMode ? 'text-slate-300' : 'text-slate-600'">
          Junte-se a mais de 1000 streamers que já estão vendo resultados incríveis com nossos produtos
        </p>
        <button class="px-8 py-4 rounded-xl font-bold transition-all duration-300 hover:scale-105 transform shadow-lg hover:shadow-2xl"
                :class="darkMode ? 'bg-brand-600 text-white hover:bg-brand-500' : 'bg-brand-600 text-white hover:bg-brand-700'">
          Começar Agora →
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
@keyframes slideUp {
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes fadeInUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes slideInUp {
  from {
    transform: translateY(15px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes starPop {
  0% {
    transform: scale(0) rotate(-180deg);
    opacity: 0;
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
}
</style>
