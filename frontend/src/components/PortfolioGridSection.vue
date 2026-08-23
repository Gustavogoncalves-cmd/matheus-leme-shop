<script setup>
import { Play, Palette, LayoutGrid, Video, CheckCircle2 } from 'lucide-vue-next'
import { motion } from 'motion-v'
import { ref, computed } from 'vue'
import { fadeInUp, scaleGlow, staggerContainer, staggerItem } from '../composables/useAnimations'
import { useContentStore } from '../stores/content'

defineProps({
  darkMode: Boolean
})

// Section headings are owner-editable; the hardcoded copy stays as fallback.
const content = useContentStore()

const portfolioItems = ref([
  // Edição de vídeo
  {
    id: 1,
    name: 'Canal do Biskela',
    cover: '/assets/portfolio/biskela.jpg',
    description: 'Editor oficial do canal de Biskela. Produção de vídeos longos, shorts e criação de thumbnails chamativas.',
    color: 'linear-gradient(135deg, #4c1d95 0%, #7c3aed 50%, #1e1b4b 100%)',
    category: 'video',
    type: 'Vídeo',
    frames: 3,
    status: 'Concluído',
    tags: ['Vídeos Longos', 'Shorts', 'Thumbnails'],
  },
  {
    id: 2,
    name: 'Canal do Spinelli',
    cover: '/assets/portfolio/spinelli.jpg',
    description: 'Pré-produção completa para o canal do Spinelli. Edição de shorts dinâmicos, vídeos longos fluidos e thumbnails exclusivas.',
    color: 'linear-gradient(135deg, #1e3a8a 0%, #7c3aed 50%, #db2777 100%)',
    category: 'video',
    type: 'Vídeo',
    frames: 3,
    status: 'Concluído',
    tags: ['Vídeos Longos', 'Shorts', 'Thumbnails'],
  },
  {
    id: 3,
    name: 'Cavani',
    cover: '/assets/portfolio/cavani.jpg',
    description: 'Responsável pela edição de vídeos longos e curtos, e pela criação das thumbnails da conversão do Cavani.',
    color: 'linear-gradient(135deg, #7c2d12 0%, #b45309 50%, #1e1b4b 100%)',
    category: 'video',
    type: 'Vídeo',
    frames: 3,
    status: 'Concluído',
    tags: ['Vídeos Longos', 'Thumbnails'],
  },
  {
    id: 4,
    name: 'Uri Riffo',
    cover: '/assets/portfolio/riffo.jpg',
    description: 'Edição de vídeos de formato longo e design de thumbnails profissionais para o canal Uri Riffo.',
    color: 'linear-gradient(135deg, #1e1b4b 0%, #4338ca 50%, #0891b2 100%)',
    category: 'video',
    type: 'Vídeo',
    frames: 3,
    status: 'Concluído',
    tags: ['Vídeos Longos', 'Thumbnails'],
  },
  {
    id: 5,
    name: 'Xoão',
    cover: '/assets/portfolio/xoao.jpg',
    description: 'Edição rítmica e criação de cortes de alta retenção para o canal.',
    color: 'linear-gradient(135deg, #581c87 0%, #db2777 100%)',
    category: 'video',
    type: 'Vídeo',
    frames: 2,
    status: 'Concluído',
    tags: ['Shorts'],
  },
  {
    id: 6,
    name: 'Ninogod',
    cover: '/assets/portfolio/ninogod.jpg',
    description: 'Edição técnica detalhada de vídeos para Ninogod, com alta fidelidade visual e de áudio.',
    color: 'linear-gradient(135deg, #312e81 0%, #6d28d9 50%, #9333ea 100%)',
    category: 'video',
    type: 'Vídeo',
    frames: 3,
    status: 'Concluído',
    tags: ['Vídeos Longos'],
  },
  // Identidade visual / branding
  {
    id: 7,
    name: 'Fire Skins',
    cover: '/assets/portfolio/fireskins.jpg',
    description: 'Desenvolvimento de identidade visual e logo gamer para a Fire Skins.',
    color: 'linear-gradient(135deg, #7c2d12 0%, #dc2626 50%, #1c1917 100%)',
    category: 'design',
    type: 'Imagem',
    frames: 3,
    status: 'Concluído',
    tags: ['Identidade Visual', 'Branding'],
  },
  {
    id: 8,
    name: 'Wealth Skins',
    cover: '/assets/portfolio/wealth.jpg',
    description: 'Conceito criativo de branding e marca exclusiva para Wealth Skins.',
    color: 'linear-gradient(135deg, #713f12 0%, #ca8a04 50%, #1c1917 100%)',
    category: 'design',
    type: 'Imagem',
    frames: 3,
    status: 'Concluído',
    tags: ['Identidade Visual', 'Branding'],
  },
  {
    id: 9,
    name: 'Click Skins',
    cover: '/assets/portfolio/clickskins.jpg',
    description: 'Identidade visual completa e presença digital moderna criada para Click Skins.',
    color: 'linear-gradient(135deg, #0c4a6e 0%, #0891b2 50%, #1e1b4b 100%)',
    category: 'design',
    type: 'Imagem',
    frames: 3,
    status: 'Concluído',
    tags: ['Identidade Visual', 'Social Media'],
  },
  {
    id: 10,
    name: 'Blitz Skins',
    cover: '/assets/portfolio/blitz.jpg',
    description: 'Marca enérgica e logotipo marcante desenvolvidos para a Blitz Skins.',
    color: 'linear-gradient(135deg, #1e1b4b 0%, #4338ca 50%, #7c3aed 100%)',
    category: 'design',
    type: 'Imagem',
    frames: 3,
    status: 'Concluído',
    tags: ['Identidade Visual', 'Branding'],
  },
  {
    id: 11,
    name: 'Chairman Skins',
    cover: '/assets/portfolio/chairman.jpg',
    description: 'Feed conceitual e criativos desenvolvidos para Chairman Skins.',
    color: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #7c3aed 100%)',
    category: 'design',
    type: 'Imagem',
    frames: 3,
    status: 'Concluído',
    tags: ['Social Media', 'Territory'],
  },
  {
    id: 12,
    name: 'Floripa Stars',
    cover: '/assets/portfolio/floripastars.jpg',
    description: 'Artes gráficas e criativos desenvolvidos para Floripa Stars, organização competitiva de CS2.',
    color: 'linear-gradient(135deg, #713f12 0%, #b45309 50%, #1c1917 100%)',
    category: 'design',
    type: 'Imagem',
    frames: 3,
    status: 'Concluído',
    tags: ['Social Media'],
  },
])

const hoveredId = ref(null)
const activeCategory = ref('all')

const categories = [
  { key: 'all', label: 'Todos', icon: LayoutGrid },
  { key: 'video', label: 'Edição de Vídeo', icon: Video },
  { key: 'design', label: 'Identidade Visual', icon: Palette },
]

const filteredItems = computed(() => {
  if (activeCategory.value === 'all') return portfolioItems.value
  return portfolioItems.value.filter(e => e.category === activeCategory.value)
})
</script>

<template>
  <!-- Portfolio Section -->
  <section class="py-14 sm:py-20 px-4 sm:px-6 lg:px-8" :class="darkMode ? 'bg-slate-900' : 'bg-slate-50'">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <motion.div v-bind="fadeInUp()" class="text-center mb-12 sm:mb-16">
        <h2 class="text-3xl sm:text-4xl md:text-5xl font-black mb-4 font-display">
          {{ content.text('portfolio_title', 'Nosso Portfólio') }}
        </h2>
        <p class="text-base sm:text-lg max-w-2xl mx-auto"
           :class="darkMode ? 'text-slate-300' : 'text-slate-600'">
          {{ content.text('portfolio_subtitle', 'Trabalhos reais de edição de vídeo e identidade visual entregues para canais, marcas e organizações.') }}
        </p>
      </motion.div>

      <!-- Category filters -->
      <motion.div v-bind="fadeInUp(0.1)" class="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-10 sm:mb-12">
        <button v-for="cat in categories" :key="cat.key"
                @click="activeCategory = cat.key"
                class="flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all"
                :class="activeCategory === cat.key
                  ? (darkMode ? 'bg-white text-black' : 'bg-brand-600 text-white shadow-md shadow-brand-500/20')
                  : (darkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200')">
          <component :is="cat.icon" class="w-4 h-4" />
          {{ cat.label }}
        </button>
      </motion.div>

      <!-- Portfolio Grid -->
      <motion.div v-bind="staggerContainer()"
                  :key="activeCategory"
                  class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        <motion.div v-for="item in filteredItems"
             :key="item.id"
             v-bind="{ ...staggerItem(), ...scaleGlow() }"
             class="group overflow-hidden rounded-xl shadow-lg transition-shadow duration-300 cursor-pointer"
             :class="darkMode ? 'bg-slate-800 hover:shadow-neon-cyan' : 'bg-white hover:shadow-xl'"
             @mouseenter="hoveredId = item.id"
             @mouseleave="hoveredId = null">

          <!-- Image Container -->
          <div class="relative h-48 overflow-hidden bg-gradient-to-br"
               :style="{ background: item.color }">
            <!-- Real cover art for the client's work. The gradient above stays
                 as the backdrop, so a card whose image is missing or still
                 loading degrades to the previous look instead of a blank box. -->
            <img v-if="item.cover"
                 :src="item.cover"
                 :alt="`Capa do trabalho: ${item.name}`"
                 loading="lazy"
                 decoding="async"
                 class="absolute inset-0 w-full h-full object-cover transition-transform duration-500"
                 :class="hoveredId === item.id ? 'scale-105' : 'scale-100'" />

            <!-- Category icon watermark -->
            <component :is="item.category === 'video' ? Video : Palette"
                       class="absolute -right-4 -bottom-4 w-28 h-28 text-white/10" stroke-width="1.5" />

            <!-- Scrim: keeps the play glyph readable over a photo cover,
                 which a translucent white pill alone cannot guarantee. -->
            <div v-if="item.cover" class="absolute inset-0 bg-black/25"></div>

            <!-- Center icon -->
            <div class="absolute inset-0 flex items-center justify-center">
              <div class="p-4 rounded-full backdrop-blur-sm transition-all duration-300"
                   :class="hoveredId === item.id ? 'bg-black/45 scale-110' : 'bg-black/35'">
                <component :is="item.category === 'video' ? Play : Palette"
                           class="w-12 h-12 text-white" :fill="item.category === 'video' && hoveredId === item.id ? 'currentColor' : 'none'" />
              </div>
            </div>

            <!-- Overlay -->
            <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            <!-- Frames + type badges -->
            <div class="absolute top-4 left-4 flex items-center gap-2">
              <span class="px-2.5 py-1 rounded-full text-[10px] font-bold text-white bg-black/40 backdrop-blur-md">
                {{ item.frames }} Frames
              </span>
              <span class="px-2.5 py-1 rounded-full text-[10px] font-bold text-white bg-black/40 backdrop-blur-md uppercase">
                {{ item.type }}
              </span>
            </div>

            <!-- Status badge -->
            <div class="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold text-white backdrop-blur-md flex items-center gap-1"
                 :class="hoveredId === item.id ? 'bg-emerald-500/90 scale-110' : 'bg-emerald-500/70'">
              <CheckCircle2 class="w-3.5 h-3.5" />
              {{ item.status }}
            </div>
          </div>

          <!-- Content -->
          <div class="p-6">
            <!-- Icon + Label -->
            <div class="flex items-center gap-2 mb-3">
              <component :is="item.category === 'video' ? Video : Palette" class="w-5 h-5 text-emerald-500" />
              <span class="text-sm font-bold text-emerald-500 uppercase tracking-wider">
                {{ categories.find(c => c.key === item.category)?.label }}
              </span>
            </div>

            <!-- Title -->
            <h3 class="text-xl font-bold mb-2 group-hover:text-brand-500 transition-colors"
                :class="darkMode ? 'text-white' : 'text-slate-900'">
              {{ item.name }}
            </h3>

            <!-- Description -->
            <p class="text-sm mb-4 line-clamp-2"
               :class="darkMode ? 'text-slate-400' : 'text-slate-600'">
              {{ item.description }}
            </p>

            <!-- Divider -->
            <div class="border-t mb-4" :class="darkMode ? 'border-slate-700' : 'border-slate-200'"></div>

            <!-- Tags -->
            <div class="flex flex-wrap gap-1.5 mb-4">
              <span v-for="tag in item.tags" :key="tag"
                    class="text-[11px] font-semibold px-2 py-1 rounded-md"
                    :class="darkMode ? 'bg-slate-700/50 text-slate-300' : 'bg-slate-100 text-slate-600'">
                {{ tag }}
              </span>
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
        </motion.div>
      </motion.div>

      <!-- CTA Section -->
      <motion.div v-bind="fadeInUp()" class="mt-12 sm:mt-16 p-6 sm:p-8 rounded-2xl text-center"
           :class="darkMode ? 'bg-gradient-to-r from-brand-900/30 to-pink-900/30 border border-brand-500/20' : 'bg-gradient-to-r from-brand-50 to-pink-50 border border-brand-200'">
        <h3 class="text-2xl font-bold mb-2 font-display"
            :class="darkMode ? 'text-white' : 'text-slate-900'">
          Quer seu canal ou marca no nosso portfólio?
        </h3>
        <p class="mb-4" :class="darkMode ? 'text-slate-300' : 'text-slate-600'">
          {{ content.text('portfolio_cta_text', 'Fale com a gente e leve sua identidade visual ou edição de vídeo para o próximo nível') }}
        </p>
        <button class="px-8 py-3 rounded-lg font-bold transition-all duration-300 hover:scale-105 transform"
                :class="darkMode ? 'bg-brand-600 text-white hover:bg-brand-500 shadow-lg' : 'bg-brand-600 text-white hover:bg-brand-700 shadow-lg'">
          Fazer Orçamento
        </button>
      </motion.div>
    </div>
  </section>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
