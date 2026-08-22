<script setup>
import { Sparkles, LayoutGrid, Package, Zap } from 'lucide-vue-next'
import { ref, computed } from 'vue'
import StreamPackCard from './StreamPackCard.vue'
import StreamPackDetail from './StreamPackDetail.vue'

defineProps({
  darkMode: Boolean
})

// --- Data: 6 Combos + 18 Peças Avulsas (hardcoded, Phase 1) ---

function mkPreview(tabName, type) {
  return { tabName, type }
}

const combos = [
  {
    id: 201,
    title: 'Pacote Start',
    headerTitle: 'PACK START',
    category: 'pacote',
    themeColor: 'linear-gradient(135deg, #1e1b4b 0%, #311042 100%)',
    priceOriginal: 110.00,
    priceCurrent: 79.00,
    discount: 28,
    stock: 12,
    sold: 34,
    available: true,
    featured: false,
    shortDescription: 'Combo essencial para quem está começando no streaming: avatar, banner e webcam.',
    longDescription: 'Um pacote enxuto e direto ao ponto, pensado para quem quer profissionalizar o canal rapidamente sem gastar muito. Inclui as peças fundamentais para deixar seu Twitch ou YouTube com cara de streamer sério.',
    features: ['Perfil', 'Banner Twitch', 'Webcam Frame', 'Painel Sobre Mim'],
    previews: [mkPreview('Perfil', 'avatar'), mkPreview('Banner', 'banner'), mkPreview('Painéis', 'panels')]
  },
  {
    id: 202,
    title: 'Pacote Pro',
    headerTitle: 'PACK PRO',
    category: 'pacote',
    themeColor: 'linear-gradient(135deg, #4c1d95 0%, #7c3aed 100%)',
    priceOriginal: 189.00,
    priceCurrent: 139.00,
    discount: 26,
    stock: 20,
    sold: 87,
    available: true,
    featured: true,
    shortDescription: 'O mais pedido. Identidade visual completa com cenas OBS e alertas animados.',
    longDescription: 'O combo mais vendido da loja. Traz identidade visual completa para o canal, incluindo cenas prontas para OBS/Streamlabs, alertas de novo seguidor/sub e painéis informativos com o mesmo tema visual, garantindo consistência em todas as plataformas.',
    features: ['Perfil', 'Banner Twitch', 'Cenas OBS (5x)', 'Alertas Animados', 'Painéis (4x)'],
    previews: [mkPreview('Perfil', 'avatar'), mkPreview('Banner', 'banner'), mkPreview('Cenas', 'scenes'), mkPreview('Alertas', 'alerts'), mkPreview('Painéis', 'panels')]
  },
  {
    id: 203,
    title: 'Pacote Elite',
    headerTitle: 'PACK ELITE',
    category: 'pacote',
    themeColor: 'linear-gradient(135deg, #0f172a 0%, #6d28d9 100%)',
    priceOriginal: 349.00,
    priceCurrent: 249.00,
    discount: 29,
    stock: 8,
    sold: 52,
    available: true,
    featured: true,
    shortDescription: 'Pacote completo com tudo: identidade full, animações e suporte prioritário.',
    longDescription: 'A experiência premium completa. Todo o pacote Pro, mais animações exclusivas de transição entre cenas, emotes personalizados e prioridade no suporte via WhatsApp. Indicado para streamers que já têm audiência e querem se destacar.',
    features: ['Perfil', 'Banner Twitch', 'Cenas OBS (8x)', 'Alertas Animados', 'Painéis (6x)', 'Emotes (5x)', 'Transições Animadas'],
    previews: [mkPreview('Perfil', 'avatar'), mkPreview('Banner', 'banner'), mkPreview('Cenas', 'scenes'), mkPreview('Alertas', 'alerts'), mkPreview('Painéis', 'panels')]
  },
  {
    id: 204,
    title: 'Pacote Warrior',
    headerTitle: 'PACK WARRIOR',
    category: 'pacote',
    themeColor: 'linear-gradient(135deg, #7f1d1d 0%, #4c1d95 100%)',
    priceOriginal: 159.00,
    priceCurrent: 109.00,
    discount: 31,
    stock: 15,
    sold: 41,
    available: true,
    featured: false,
    shortDescription: 'Tema agressivo focado em FPS e jogos competitivos.',
    longDescription: 'Identidade visual pensada para quem transmite jogos de tiro e competitivos: contraste alto, tipografia impactante e cenas otimizadas para gameplay intenso, mantendo a webcam sempre em destaque.',
    features: ['Perfil', 'Banner Twitch', 'Cenas OBS (5x)', 'Alertas Animados'],
    previews: [mkPreview('Perfil', 'avatar'), mkPreview('Banner', 'banner'), mkPreview('Cenas', 'scenes'), mkPreview('Alertas', 'alerts')]
  },
  {
    id: 205,
    title: 'Pacote Neon',
    headerTitle: 'PACK NEON',
    category: 'pacote',
    themeColor: 'linear-gradient(135deg, #0e7490 0%, #7c3aed 100%)',
    priceOriginal: 175.00,
    priceCurrent: 129.00,
    discount: 26,
    stock: 10,
    sold: 29,
    available: true,
    featured: false,
    shortDescription: 'Visual vibrante com tons neon cyan/roxo, ideal para Just Chatting.',
    longDescription: 'Um pacote colorido e chamativo, com gradientes neon que se destacam em miniaturas e thumbnails. Perfeito para quem faz conteúdo de Just Chatting, IRL e variedades.',
    features: ['Perfil', 'Banner Twitch', 'Cenas OBS (5x)', 'Painéis (4x)'],
    previews: [mkPreview('Perfil', 'avatar'), mkPreview('Banner', 'banner'), mkPreview('Cenas', 'scenes'), mkPreview('Painéis', 'panels')]
  },
  {
    id: 206,
    title: 'Pacote Galaxy',
    headerTitle: 'PACK GALAXY',
    category: 'pacote',
    themeColor: 'linear-gradient(135deg, #1e1b4b 0%, #4c1d95 50%, #db2777 100%)',
    priceOriginal: 0,
    priceCurrent: 0,
    discount: 0,
    stock: 0,
    sold: 63,
    available: false,
    featured: false,
    shortDescription: 'Edição especial esgotada. Aguarde reposição.',
    longDescription: 'Edição limitada com tema espacial e efeitos de partículas. Todas as unidades foram vendidas nesta rodada, mas o pacote pode voltar ao catálogo em uma futura reedição.',
    features: ['Perfil', 'Banner Twitch', 'Cenas OBS (6x)', 'Alertas Animados', 'Painéis (5x)'],
    previews: [mkPreview('Perfil', 'avatar'), mkPreview('Banner', 'banner'), mkPreview('Cenas', 'scenes'), mkPreview('Alertas', 'alerts')]
  }
]

const pieces = [
  { id: 301, name: 'Avatar Cyber Punk', type: 'avatar', color: 'linear-gradient(135deg, #0f172a 0%, #7c3aed 100%)', price: 39, orig: 59 },
  { id: 302, name: 'Avatar Neon Wolf', type: 'avatar', color: 'linear-gradient(135deg, #0e7490 0%, #4c1d95 100%)', price: 35, orig: 49 },
  { id: 303, name: 'Avatar Galaxy Queen', type: 'avatar', color: 'linear-gradient(135deg, #4c1d95 0%, #db2777 100%)', price: 42, orig: 62 },
  { id: 304, name: 'Avatar Warrior King', type: 'avatar', color: 'linear-gradient(135deg, #7f1d1d 0%, #4c1d95 100%)', price: 39, orig: 59 },
  { id: 305, name: 'Banner Twitch Cyber', type: 'banner', color: 'linear-gradient(135deg, #1e1b4b 0%, #7c3aed 100%)', price: 45, orig: 65 },
  { id: 306, name: 'Banner Redes Sociais Neon', type: 'banner', color: 'linear-gradient(135deg, #0e7490 0%, #7c3aed 100%)', price: 39, orig: 55 },
  { id: 307, name: 'Banner Youtube Elite', type: 'banner', color: 'linear-gradient(135deg, #4c1d95 0%, #6d28d9 100%)', price: 49, orig: 69 },
  { id: 308, name: 'Banner Discord Server', type: 'banner', color: 'linear-gradient(135deg, #312e81 0%, #7c3aed 100%)', price: 35, orig: 49 },
  { id: 309, name: 'Painéis Twitch Completo', type: 'panels', color: 'linear-gradient(135deg, #0f172a 0%, #6d28d9 100%)', price: 55, orig: 79 },
  { id: 310, name: 'Painéis Info Pack', type: 'panels', color: 'linear-gradient(135deg, #1e1b4b 0%, #4c1d95 100%)', price: 45, orig: 65 },
  { id: 311, name: 'Painéis Redes Sociais', type: 'panels', color: 'linear-gradient(135deg, #4c1d95 0%, #db2777 100%)', price: 35, orig: 49 },
  { id: 312, name: 'Painéis Doação', type: 'panels', color: 'linear-gradient(135deg, #7c2d12 0%, #4c1d95 100%)', price: 29, orig: 42 },
  { id: 313, name: 'Cenas OBS Gamer Setup', type: 'scenes', color: 'linear-gradient(135deg, #0f172a 0%, #7c3aed 100%)', price: 89, orig: 129 },
  { id: 314, name: 'Cenas Just Chatting', type: 'scenes', color: 'linear-gradient(135deg, #0e7490 0%, #4c1d95 100%)', price: 79, orig: 115 },
  { id: 315, name: 'Cenas Multiplataforma', type: 'scenes', color: 'linear-gradient(135deg, #4c1d95 0%, #7c3aed 100%)', price: 99, orig: 149 },
  { id: 316, name: 'Alertas Follow/Sub Pack', type: 'alerts', color: 'linear-gradient(135deg, #1e1b4b 0%, #db2777 100%)', price: 45, orig: 65 },
  { id: 317, name: 'Alertas Donation Pack', type: 'alerts', color: 'linear-gradient(135deg, #7c2d12 0%, #7c3aed 100%)', price: 49, orig: 69 },
  { id: 318, name: 'Alertas Raid/Host Pack', type: 'alerts', color: 'linear-gradient(135deg, #312e81 0%, #db2777 100%)', price: 39, orig: 55 }
]

const typeLabel = {
  avatar: { header: 'AVATAR', tab: 'Perfil', desc: 'Foto de perfil profissional com moldura personalizada, pronta para Twitch, YouTube e redes sociais.' },
  banner: { header: 'BANNER', tab: 'Banner', desc: 'Banner de destaque para cabeçalho de canal e redes sociais, com identidade visual marcante.' },
  panels: { header: 'PAINÉIS', tab: 'Painéis', desc: 'Conjunto de painéis informativos para a página do canal (sobre mim, discord, specs, doação).' },
  scenes: { header: 'CENAS', tab: 'Cenas', desc: 'Cenas prontas para OBS/Streamlabs com layout de webcam, jogo e overlays integrados.' },
  alerts: { header: 'ALERTAS', tab: 'Alertas', desc: 'Alertas animados de novo seguidor, sub, doação e raid, sincronizados com o tema visual.' }
}

const avulsos = pieces.map((p, i) => {
  const label = typeLabel[p.type]
  const discount = Math.round(((p.orig - p.price) / p.orig) * 100)
  return {
    id: p.id,
    title: p.name,
    headerTitle: label.header,
    category: 'avulso',
    themeColor: p.color,
    priceOriginal: p.orig,
    priceCurrent: p.price,
    discount,
    stock: 6 + (i % 10),
    sold: 8 + (i * 3) % 40,
    available: true,
    featured: i === 2 || i === 12,
    shortDescription: label.desc,
    longDescription: `${label.desc} Peça avulsa, entregue já customizada com o nome e cores do seu canal em até 24 horas após a confirmação da compra.`,
    features: [label.tab, 'Arquivo em alta resolução', 'Customização de cor incluída'],
    previews: [mkPreview(label.tab, p.type)]
  }
})

const allPacks = [...combos, ...avulsos]

// --- UI State ---

const activeCategory = ref('all')
const selectedPack = ref(null)
const showDetail = ref(false)

const categories = [
  { key: 'all', label: 'Ver Tudo', icon: LayoutGrid },
  { key: 'pacote', label: 'Combos', icon: Package },
  { key: 'avulso', label: 'Peças Avulsas', icon: Zap }
]

const filteredPacks = computed(() => {
  if (activeCategory.value === 'all') return allPacks
  return allPacks.filter(p => p.category === activeCategory.value)
})

const openDetail = (pack) => {
  selectedPack.value = pack
  showDetail.value = true
}

const closeDetail = () => {
  showDetail.value = false
}
</script>

<template>
  <section id="streampacks" class="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
    <!-- Intro -->
    <div class="text-center max-w-3xl mx-auto pt-16 pb-10">
      <span class="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-4"
            :class="darkMode ? 'bg-brand-900/50 text-brand-300 border border-brand-800' : 'bg-brand-50 text-brand-700 border border-brand-100'">
        <Sparkles class="w-3.5 h-3.5" /> Streampacks
      </span>
      <h2 class="text-3xl sm:text-4xl md:text-5xl font-black mb-4 font-display" :class="darkMode ? 'text-white' : 'text-slate-900'">
        Identidade visual pronta para o seu canal
      </h2>
      <p class="text-base sm:text-lg" :class="darkMode ? 'text-slate-400' : 'text-slate-600'">
        Combos completos ou peças avulsas: avatares, banners, cenas OBS, painéis e alertas animados, entregues via WhatsApp.
      </p>
    </div>

    <!-- Category filters -->
    <div class="flex flex-wrap items-center justify-center gap-3 mb-10">
      <button v-for="cat in categories" :key="cat.key"
              @click="activeCategory = cat.key"
              class="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all"
              :class="activeCategory === cat.key
                ? (darkMode ? 'bg-white text-black' : 'bg-brand-600 text-white shadow-md shadow-brand-500/20')
                : (darkMode ? 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')">
        <component :is="cat.icon" class="w-4 h-4" />
        {{ cat.label }}
      </button>
    </div>

    <!-- Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
      <StreamPackCard v-for="pack in filteredPacks" :key="pack.id"
                       :pack="pack"
                       :dark-mode="darkMode"
                       @select-detail="openDetail" />
    </div>

    <!-- Detail modal -->
    <StreamPackDetail :pack="selectedPack"
                       :is-open="showDetail"
                       :dark-mode="darkMode"
                       @close="closeDetail" />
  </section>
</template>
