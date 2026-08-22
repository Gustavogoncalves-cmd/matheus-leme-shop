<script setup>
import { Play, TrendingUp, Eye, Heart } from 'lucide-vue-next'
import { ref } from 'vue'

defineProps({
  darkMode: Boolean
})

const streamingExamples = ref([
  {
    id: 1,
    name: 'Luna Stream',
    description: 'Streamer de RPG que aumentou engagement em 240% com nossos overlays',
    color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    productsCount: 4,
    improvement: 240,
    views: '12.5K',
    likes: '1.2K'
  },
  {
    id: 2,
    name: 'Nexus Gaming',
    description: 'Competidor de FPS com transições 4K e alertas profissionais',
    color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    productsCount: 6,
    improvement: 185,
    views: '8.3K',
    likes: '890'
  },
  {
    id: 3,
    name: 'Crystal Content',
    description: 'Criadora de conteúdo que triplicou visualizações com mídia kit',
    color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    productsCount: 3,
    improvement: 320,
    views: '15.7K',
    likes: '1.8K'
  },
  {
    id: 4,
    name: 'Phoenix Streams',
    description: 'Streamer de variedade com pacote completo de assets',
    color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    productsCount: 5,
    improvement: 215,
    views: '9.1K',
    likes: '1.1K'
  },
  {
    id: 5,
    name: 'Void Gaming',
    description: 'Competidor hardcore com customizações totais de overlays',
    color: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
    productsCount: 7,
    improvement: 290,
    views: '11.2K',
    likes: '1.4K'
  },
  {
    id: 6,
    name: 'Aurora Studios',
    description: 'Estúdio profissional com pacote white-label exclusivo',
    color: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    productsCount: 8,
    improvement: 400,
    views: '18.9K',
    likes: '2.3K'
  },
])

const hoveredId = ref(null)
</script>

<template>
  <!-- Portfolio Section -->
  <section class="py-20 px-4 sm:px-6 lg:px-8" :class="darkMode ? 'bg-slate-900' : 'bg-slate-50'">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-16">
        <h2 class="text-4xl md:text-5xl font-black mb-4 font-display">
          Exemplos de Streamers
        </h2>
        <p class="text-lg max-w-2xl mx-auto"
           :class="darkMode ? 'text-slate-300' : 'text-slate-600'">
          Veja como nossos produtos estão transformando transmissões e gerando resultados incríveis
        </p>
      </div>

      <!-- Portfolio Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div v-for="(example, idx) in streamingExamples"
             :key="example.id"
             class="group overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer"
             :class="darkMode ? 'bg-slate-800 hover:bg-slate-750' : 'bg-white hover:shadow-xl'"
             @mouseenter="hoveredId = example.id"
             @mouseleave="hoveredId = null"
             style="animation: fadeInUp 0.6s ease-out forwards"
             :style="{ animationDelay: `${idx * 0.1}s` }">

          <!-- Image Container -->
          <div class="relative h-48 overflow-hidden bg-gradient-to-br"
               :style="{ background: example.color }">
            <!-- Play Button -->
            <div class="absolute inset-0 flex items-center justify-center">
              <div class="p-4 rounded-full transition-all duration-300"
                   :class="hoveredId === example.id ? 'bg-white/30 scale-110' : 'bg-white/20'">
                <Play class="w-12 h-12 text-white" :fill="hoveredId === example.id ? 'currentColor' : 'none'" />
              </div>
            </div>

            <!-- Overlay -->
            <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            <!-- Badge -->
            <div class="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold text-white backdrop-blur-md"
                 :class="hoveredId === example.id ? 'bg-emerald-500/90 scale-110' : 'bg-emerald-500/70'">
              ✓ VERIFICADO
            </div>

            <!-- Stats Hover -->
            <div class="absolute inset-0 flex items-end justify-between p-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0">
              <div class="flex items-center gap-2 text-white text-sm">
                <Eye size="16" />
                {{ example.views }}
              </div>
              <div class="flex items-center gap-2 text-red-300 text-sm">
                <Heart size="16" />
                {{ example.likes }}
              </div>
            </div>
          </div>

          <!-- Content -->
          <div class="p-6">
            <!-- Icon + Label -->
            <div class="flex items-center gap-2 mb-3">
              <TrendingUp class="w-5 h-5 text-emerald-500" />
              <span class="text-sm font-bold text-emerald-500 uppercase tracking-wider">Streamer Profissional</span>
            </div>

            <!-- Title -->
            <h3 class="text-xl font-bold mb-2 group-hover:text-brand-500 transition-colors"
                :class="darkMode ? 'text-white' : 'text-slate-900'">
              {{ example.name }}
            </h3>

            <!-- Description -->
            <p class="text-sm mb-4 line-clamp-2"
               :class="darkMode ? 'text-slate-400' : 'text-slate-600'">
              {{ example.description }}
            </p>

            <!-- Divider -->
            <div class="border-t mb-4" :class="darkMode ? 'border-slate-700' : 'border-slate-200'"></div>

            <!-- Stats -->
            <div class="grid grid-cols-2 gap-4 mb-4">
              <div class="p-3 rounded-lg" :class="darkMode ? 'bg-slate-700/50' : 'bg-slate-50'">
                <p class="text-xs" :class="darkMode ? 'text-slate-400' : 'text-slate-500'">
                  Produtos
                </p>
                <p class="text-lg font-bold" :class="darkMode ? 'text-white' : 'text-slate-900'">
                  {{ example.productsCount }}
                </p>
              </div>
              <div class="p-3 rounded-lg" :class="darkMode ? 'bg-slate-700/50' : 'bg-slate-50'">
                <p class="text-xs" :class="darkMode ? 'text-slate-400' : 'text-slate-500'">
                  Melhoria
                </p>
                <p class="text-lg font-bold text-brand-500">
                  +{{ example.improvement }}%
                </p>
              </div>
            </div>

            <!-- CTA -->
            <button class="w-full py-2 px-4 rounded-lg font-semibold text-sm transition-all duration-300 transform hover:scale-105"
                    :class="darkMode
                      ? 'bg-brand-600/20 text-brand-400 hover:bg-brand-600/40'
                      : 'bg-brand-50 text-brand-600 hover:bg-brand-100'"
                    @click.stop>
              Ver Detalhes →
            </button>
          </div>
        </div>
      </div>

      <!-- CTA Section -->
      <div class="mt-16 p-8 rounded-2xl text-center"
           :class="darkMode ? 'bg-gradient-to-r from-brand-900/30 to-pink-900/30 border border-brand-500/20' : 'bg-gradient-to-r from-brand-50 to-pink-50 border border-brand-200'">
        <h3 class="text-2xl font-bold mb-2 font-display"
            :class="darkMode ? 'text-white' : 'text-slate-900'">
          Quer ser o próximo case de sucesso?
        </h3>
        <p class="mb-4" :class="darkMode ? 'text-slate-300' : 'text-slate-600'">
          Escolha seu pacote agora e comece a transformar seu stream
        </p>
        <button class="px-8 py-3 rounded-lg font-bold transition-all duration-300 hover:scale-105 transform"
                :class="darkMode ? 'bg-brand-600 text-white hover:bg-brand-500 shadow-lg' : 'bg-brand-600 text-white hover:bg-brand-700 shadow-lg'">
          Começar Agora
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
@keyframes fadeInUp {
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
