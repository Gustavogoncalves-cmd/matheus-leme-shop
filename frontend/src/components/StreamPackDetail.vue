<script setup>
import { X, ArrowLeft, Send, Minus, Plus, Zap, Sliders, Check, Info, Video, Bell } from 'lucide-vue-next'
import { ref, computed, watch } from 'vue'

const props = defineProps({
  pack: { type: Object, default: null },
  isOpen: Boolean,
  darkMode: Boolean
})

const emit = defineEmits(['close'])

const previewTab = ref(0)
const quantity = ref(1)
const setupSupport = ref(false)

watch(() => props.pack, () => {
  previewTab.value = 0
  quantity.value = 1
  setupSupport.value = false
})

const totalPrice = computed(() => {
  if (!props.pack) return 0
  return (props.pack.priceCurrent * quantity.value) + (setupSupport.value ? 69 : 0)
})

const originalTotal = computed(() => {
  if (!props.pack) return 0
  return props.pack.priceOriginal * quantity.value
})

const currentPreview = computed(() => props.pack?.previews?.[previewTab.value] ?? null)

const buyUrl = computed(() => {
  if (!props.pack) return '#'
  const kind = props.pack.category === 'pacote' ? 'Combo' : 'Peça Individual'
  const addon = setupSupport.value ? 'COM o adicional de suporte de setup no OBS (+R$69,00)' : 'SEM suporte de setup'
  const msg = `Olá Matheus! Gostaria de comprar o item (${kind}) ${props.pack.title} (${quantity.value}x unidade/s) ${addon} por R$ ${totalPrice.value.toFixed(2)} no total.`
  return `https://wa.me/5511951865795?text=${encodeURIComponent(msg)}`
})

const customizeUrl = computed(() => {
  if (!props.pack) return '#'
  const msg = `Olá Matheus! Me interessei pelo ${props.pack.title} e gostava de personalizar detalhes da arte antes de fechar.`
  return `https://wa.me/5511951865795?text=${encodeURIComponent(msg)}`
})
</script>

<template>
  <Teleport to="body">
    <div v-if="isOpen && pack" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="fixed inset-0 bg-slate-950/70 backdrop-blur-sm" @click="emit('close')"></div>

      <div class="relative min-h-screen flex items-start justify-center px-4 py-10">
        <div class="relative w-full max-w-6xl rounded-3xl shadow-2xl"
             :class="darkMode ? 'bg-slate-950' : 'bg-slate-50'">

          <!-- Top bar -->
          <div class="flex flex-wrap items-center justify-between gap-4 px-6 sm:px-8 py-4 border-b sticky top-0 z-10 rounded-t-3xl"
               :class="darkMode ? 'border-slate-800 bg-slate-950' : 'border-slate-200/60 bg-slate-50'">
            <div class="flex items-center gap-2 text-xs font-medium" :class="darkMode ? 'text-slate-400' : 'text-slate-400'">
              <span>Streampacks</span>
              <span>/</span>
              <span class="font-semibold" :class="darkMode ? 'text-white' : 'text-slate-800'">{{ pack.title }}</span>
            </div>
            <button @click="emit('close')"
                    class="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-colors"
                    :class="darkMode ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-slate-100 hover:bg-slate-200 text-slate-800'">
              <ArrowLeft class="w-4 h-4" /> Voltar ao catálogo
            </button>
          </div>

          <div class="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <!-- Left: preview -->
            <div class="lg:col-span-7 space-y-4">
              <div class="flex flex-col md:flex-row gap-4">
                <div class="flex md:flex-col gap-2.5 order-2 md:order-1 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0">
                  <button v-for="(preview, index) in pack.previews" :key="index"
                          @click="previewTab = index"
                          class="w-16 h-16 rounded-xl overflow-hidden border-2 transition-all relative flex-shrink-0 bg-slate-950 flex items-center justify-center text-[8px] font-bold text-white uppercase text-center px-1"
                          :class="previewTab === index
                            ? (darkMode ? 'border-white scale-105' : 'border-brand-500 scale-105')
                            : 'border-transparent opacity-70 hover:opacity-100'">
                    {{ preview.tabName }}
                  </button>
                </div>

                <div class="flex-grow aspect-video bg-slate-950 rounded-2xl overflow-hidden border relative shadow-2xl order-1 md:order-2 border-slate-800">
                  <div class="absolute top-0 inset-x-0 bg-slate-900/85 backdrop-blur-md px-4 py-2 flex items-center justify-between text-white text-[10px] z-20 border-b border-white/5">
                    <div class="flex items-center gap-2">
                      <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span class="font-bold tracking-wider">PREVIEW: {{ currentPreview?.tabName }}</span>
                    </div>
                    <span class="bg-brand-600 px-2 py-0.5 rounded text-[8px] font-extrabold uppercase">1080P 60FPS</span>
                  </div>

                  <div class="w-full h-full flex flex-col justify-center items-center text-center p-6 relative">
                    <div class="absolute inset-0" :style="{ background: pack.themeColor, opacity: 0.35 }"></div>

                    <div class="relative z-10 w-full h-full flex flex-col justify-center items-center">
                      <template v-if="currentPreview?.type === 'avatar'">
                        <div class="space-y-4">
                          <div class="w-28 h-28 rounded-full border-4 border-brand-500 overflow-hidden mx-auto shadow-2xl relative flex items-center justify-center font-bold text-white text-2xl font-display"
                               :style="{ background: pack.themeColor }">
                            {{ pack.headerTitle }}
                          </div>
                          <span class="text-xs font-semibold bg-white/10 px-3 py-1 rounded-full border border-white/5 text-white">Avatar Gamer Premium</span>
                        </div>
                      </template>

                      <template v-else-if="currentPreview?.type === 'banner'">
                        <div class="w-full max-w-md bg-slate-900/90 rounded-xl p-4 border border-white/10 shadow-2xl">
                          <div class="h-20 rounded-lg flex items-center justify-between px-6" :style="{ background: pack.themeColor }">
                            <span class="text-xs font-black tracking-widest font-display text-white">{{ pack.headerTitle }}</span>
                            <div class="flex gap-2">
                              <span class="w-4 h-4 rounded-full bg-white/20"></span>
                              <span class="w-4 h-4 rounded-full bg-white/20"></span>
                            </div>
                          </div>
                          <span class="text-[9px] text-slate-400 mt-3 block">Banner de Redes Sociais</span>
                        </div>
                      </template>

                      <template v-else-if="currentPreview?.type === 'scenes'">
                        <div class="w-full h-full flex flex-col justify-between pt-6">
                          <div class="grid grid-cols-12 gap-3 h-full items-center">
                            <div class="col-span-4 border-2 border-brand-500 bg-slate-900/95 rounded-lg overflow-hidden aspect-video flex flex-col items-center justify-center relative shadow-lg">
                              <div class="absolute top-1.5 left-1.5 bg-brand-600 text-[7px] font-bold px-1.5 py-0.5 rounded text-white">WEBCAM</div>
                              <Video class="w-6 h-6 text-brand-400" />
                            </div>
                            <div class="col-span-8 h-full bg-slate-800/40 border border-white/10 rounded-lg flex items-center justify-center">
                              <div class="text-center p-2">
                                <span class="text-xs font-bold text-slate-300 block mb-1">Cenas OBS</span>
                                <span class="text-[9px] bg-slate-900/60 px-2 py-0.5 rounded text-brand-300">Overlays e Alertas inclusos</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </template>

                      <template v-else-if="currentPreview?.type === 'panels'">
                        <div class="grid grid-cols-2 gap-3 max-w-md w-full">
                          <div v-for="panel in ['SOBRE MIM', 'DISCORD', 'PC SPECS', 'DONATE']" :key="panel"
                               class="bg-gradient-to-r from-slate-900 to-slate-950 border-l-4 border-brand-500 p-3 rounded-lg text-left shadow-lg">
                            <span class="text-xs font-black tracking-wider font-display text-brand-400">{{ panel }}</span>
                            <div class="h-1 w-8 bg-white/20 mt-1 rounded-full"></div>
                          </div>
                        </div>
                      </template>

                      <template v-else-if="currentPreview?.type === 'alerts'">
                        <div class="w-full max-w-xs bg-slate-900/95 border border-brand-500/40 p-4 rounded-2xl shadow-xl text-center">
                          <div class="w-10 h-10 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center mx-auto mb-2">
                            <Bell class="w-5 h-5" />
                          </div>
                          <span class="text-[10px] text-brand-400 font-bold uppercase tracking-widest block">Novo Seguidor!</span>
                          <span class="text-sm font-black font-display text-white">{{ pack.headerTitle }}</span>
                        </div>
                      </template>
                    </div>
                  </div>

                  <div class="absolute bottom-0 inset-x-0 bg-slate-900/90 py-1.5 px-4 flex items-center justify-between text-slate-400 text-[8px] z-10 border-t border-white/5">
                    <span class="flex items-center gap-1"><Info class="w-3 h-3 text-brand-400" /> Visualização real da aplicação de overlays</span>
                    <span>Matheus Leme Design</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right: purchase panel -->
            <div class="lg:col-span-5 space-y-6">
              <div class="rounded-3xl p-6 sm:p-8 border shadow-lg"
                   :class="darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/80'">

                <div class="flex items-center justify-between mb-2">
                  <span class="bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full inline-flex items-center gap-1">
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Estoque Disponível
                  </span>
                  <span class="text-xs font-medium" :class="darkMode ? 'text-slate-400' : 'text-slate-400'">{{ pack.sold }}+ vendidos</span>
                </div>

                <span class="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded inline-block mb-2"
                      :class="pack.category === 'pacote' ? 'bg-brand-100 text-brand-700' : 'bg-amber-100 text-amber-800'">
                  {{ pack.category === 'pacote' ? '💎 Combo Completo' : '⚡ Peça Individual' }}
                </span>

                <h2 class="text-3xl font-extrabold mb-4 font-display" :class="darkMode ? 'text-white' : 'text-slate-900'">
                  {{ pack.title }}
                </h2>

                <div class="rounded-2xl p-4 border mb-6" :class="darkMode ? 'bg-slate-950 border-slate-850' : 'bg-slate-50 border-slate-100'">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="text-sm line-through" :class="darkMode ? 'text-slate-500' : 'text-slate-400'">R$ {{ originalTotal.toFixed(2) }}</span>
                    <span class="text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md" :class="darkMode ? 'bg-slate-800 border border-slate-700' : 'bg-brand-500'">
                      -{{ pack.discount }}% de desconto
                    </span>
                  </div>
                  <div class="flex items-end gap-2">
                    <span class="text-4xl font-black font-display" :class="darkMode ? 'text-white' : 'text-slate-900'">R$ {{ totalPrice.toFixed(2) }}</span>
                    <span class="text-xs font-semibold mb-1" :class="darkMode ? 'text-slate-400' : 'text-slate-400'">no PIX</span>
                  </div>
                </div>

                <div class="flex items-center gap-3 p-3 rounded-xl mb-4 border" :class="darkMode ? 'bg-slate-950/60 border-slate-850' : 'bg-brand-50/50 border-brand-100'">
                  <div class="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" :class="darkMode ? 'bg-slate-800 text-white' : 'bg-brand-100 text-brand-600'">
                    <Send class="w-5 h-5" />
                  </div>
                  <div>
                    <span class="text-xs font-bold block" :class="darkMode ? 'text-white' : 'text-brand-900'">
                      {{ pack.category === 'pacote' ? 'Entrega Manual de Arquivos' : 'Envio Rápido & Customização' }}
                    </span>
                    <span class="text-[10px] block" :class="darkMode ? 'text-slate-400' : 'text-brand-600'">
                      {{ pack.category === 'pacote' ? 'Envio imediato de arquivos editáveis organizados.' : 'Customizado com suas cores e redes sociais em até 24 horas.' }}
                    </span>
                  </div>
                </div>

                <div v-if="pack.category === 'pacote'"
                     class="p-4 rounded-xl mb-6 border" :class="darkMode ? 'bg-slate-950 border-slate-850' : 'bg-violet-50/80 border-brand-100'">
                  <label class="flex items-start gap-3 cursor-pointer select-none">
                    <input type="checkbox" v-model="setupSupport" class="mt-1 rounded border-slate-300 text-brand-600 focus:ring-brand-500 w-4 h-4">
                    <div>
                      <span class="text-xs font-extrabold block flex items-center gap-1.5" :class="darkMode ? 'text-white' : 'text-brand-950'">
                        <span class="text-white text-[9px] font-black uppercase px-1.5 py-0.5 rounded" :class="darkMode ? 'bg-slate-850 border border-slate-700' : 'bg-brand-500'">Adicional</span>
                        Ajuda para configurar no OBS (+R$ 69,00)
                      </span>
                      <span class="text-[10px] block mt-0.5" :class="darkMode ? 'text-slate-400' : 'text-brand-600'">
                        Te auxilio a configurar as suas cenas, webcams e alertas diretamente no seu OBS Studio ou Streamlabs.
                      </span>
                    </div>
                  </label>
                </div>

                <div class="space-y-3 mb-6">
                  <label class="text-xs font-bold uppercase tracking-wider" :class="darkMode ? 'text-slate-300' : 'text-slate-700'">Quantidade</label>
                  <div class="flex items-center gap-3">
                    <div class="flex items-center border rounded-xl overflow-hidden" :class="darkMode ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-slate-50'">
                      <button @click="quantity = Math.max(1, quantity - 1)" class="p-3 text-slate-600 transition-colors" :class="darkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-200'">
                        <Minus class="w-4 h-4" />
                      </button>
                      <span class="px-5 font-bold text-sm" :class="darkMode ? 'text-white' : 'text-slate-800'">{{ quantity }}</span>
                      <button @click="quantity++" class="p-3 text-slate-600 transition-colors" :class="darkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-200'">
                        <Plus class="w-4 h-4" />
                      </button>
                    </div>
                    <span class="text-xs font-medium" :class="darkMode ? 'text-slate-500' : 'text-slate-400'">{{ pack.stock }} unidades disponíveis</span>
                  </div>
                </div>

                <div class="space-y-3">
                  <a :href="buyUrl" target="_blank"
                     class="w-full py-4 font-bold text-sm rounded-xl text-center shadow-lg transition-all flex items-center justify-center gap-2"
                     :class="darkMode ? 'bg-white text-black hover:bg-slate-200' : 'bg-brand-600 hover:bg-brand-700 text-white shadow-brand-500/20'">
                    <Zap class="w-4 h-4" /> Adquirir Agora
                  </a>
                  <a :href="customizeUrl" target="_blank"
                     class="w-full py-3.5 font-bold text-xs rounded-xl text-center transition-all flex items-center justify-center gap-2 border"
                     :class="darkMode ? 'bg-slate-900 hover:bg-slate-800 text-white border-slate-800' : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'">
                    <Sliders class="w-4 h-4" /> Customizar Cores / Detalhes
                  </a>
                </div>
              </div>
            </div>
          </div>

          <!-- Description + features -->
          <div class="px-6 sm:px-8 pb-8">
            <div class="rounded-3xl p-6 sm:p-10 border" :class="darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'">
              <h3 class="text-2xl font-black mb-6 font-display border-b pb-4" :class="darkMode ? 'text-white border-slate-800' : 'text-slate-900 border-slate-100'">
                {{ pack.category === 'pacote' ? 'O que vem neste Combo Completo?' : 'Sobre esta Peça Individual' }}
              </h3>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div class="space-y-4 text-sm leading-relaxed" :class="darkMode ? 'text-slate-300' : 'text-slate-600'">
                  <p class="font-semibold text-base" :class="darkMode ? 'text-white' : 'text-slate-900'">
                    O design do {{ pack.title }} foi desenvolvido com os maiores padrões de pós-produção e eSports.
                  </p>
                  <p>{{ pack.longDescription }}</p>
                  <p>Cada detalhe foi estruturado com foco em altíssima conversão de cliques e visual limpo para OBS/Streamlabs.</p>
                </div>

                <div class="rounded-2xl p-6 border space-y-4" :class="darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-100'">
                  <span class="text-xs font-bold uppercase tracking-wider block" :class="darkMode ? 'text-slate-300' : 'text-slate-800'">
                    Arquivos e Formatos inclusos
                  </span>
                  <ul class="space-y-3">
                    <li v-for="item in pack.features" :key="item" class="flex items-center gap-2 text-xs" :class="darkMode ? 'text-slate-300' : 'text-slate-700'">
                      <span class="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" :class="darkMode ? 'bg-slate-900 text-white border border-slate-800' : 'bg-brand-100 text-brand-600'">
                        <Check class="w-3 h-3" />
                      </span>
                      <span class="font-semibold uppercase">{{ item }}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
