<script setup>
import { ArrowRight, Sparkles } from 'lucide-vue-next'
</script>

<template>
  <!-- Hero Section com Gradient -->
  <div class="relative min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 overflow-hidden flex items-center justify-center">
    <!-- Efeito de fundo animado -->
    <div class="absolute inset-0 opacity-20">
      <div class="absolute top-10 left-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
      <div class="absolute -bottom-32 -right-32 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl animate-pulse animation-delay-2000"></div>
      <div class="absolute top-1/2 left-1/2 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl animate-pulse animation-delay-4000"></div>
    </div>

    <!-- Conteúdo Principal -->
    <div class="relative z-10 container mx-auto px-4 py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center animate__animated animate__fadeIn">
      <!-- Texto Esquerdo -->
      <div class="space-y-8">
        <!-- Badge -->
        <div class="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full border border-white/30 animate__animated animate__slideInLeft animation-delay-100">
          <Sparkles size="18" class="text-yellow-300" />
          <span class="text-white text-sm font-semibold">Novo Lançamento 2025</span>
        </div>

        <!-- Título Principal -->
        <h1 class="text-5xl lg:text-6xl font-bold text-white leading-tight animate__animated animate__fadeInUp animation-delay-200">
          Produtos que
          <span class="bg-gradient-to-r from-yellow-300 via-white to-pink-300 bg-clip-text text-transparent">
            transformam
          </span>
          seu estilo
        </h1>

        <!-- Subtítulo -->
        <p class="text-lg text-white/80 max-w-xl leading-relaxed animate__animated animate__fadeInUp animation-delay-300">
          Descubra nossa coleção exclusiva de produtos premium, selecionados com cuidado para garantir qualidade e estilo em cada detalhe.
        </p>

        <!-- CTA Buttons -->
        <div class="flex flex-col sm:flex-row gap-4 animate__animated animate__fadeInUp animation-delay-400">
          <button class="btn btn-lg btn-primary gap-2 hover:scale-105 transition-transform shadow-lg hover:shadow-2xl">
            Explorar Produtos
            <ArrowRight size="20" />
          </button>
          <button class="btn btn-lg btn-outline text-white border-white hover:bg-white hover:text-purple-600 transition-all">
            Saber Mais
          </button>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-3 gap-6 pt-8 border-t border-white/20">
          <div class="animate__animated animate__fadeInUp animation-delay-500">
            <div class="text-3xl font-bold text-white">5K+</div>
            <div class="text-white/70 text-sm">Produtos</div>
          </div>
          <div class="animate__animated animate__fadeInUp animation-delay-600">
            <div class="text-3xl font-bold text-white">50K+</div>
            <div class="text-white/70 text-sm">Clientes Felizes</div>
          </div>
          <div class="animate__animated animate__fadeInUp animation-delay-700">
            <div class="text-3xl font-bold text-white">4.9★</div>
            <div class="text-white/70 text-sm">Avaliação</div>
          </div>
        </div>
      </div>

      <!-- Imagem Direita -->
      <div class="relative h-96 lg:h-full min-h-96 flex items-center justify-center animate__animated animate__slideInRight animation-delay-300">
        <!-- Container da Imagem com Efeito -->
        <div class="relative w-full h-full">
          <!-- Glow Effect -->
          <div class="absolute inset-0 bg-gradient-to-br from-blue-400/50 via-purple-400/30 to-pink-400/50 rounded-2xl blur-3xl opacity-60 group-hover:opacity-100 transition-opacity"></div>

          <!-- Imagem -->
          <img
            src="https://via.placeholder.com/500x600?text=Produto+Premium"
            alt="Produto Premium"
            class="relative w-full h-full object-cover rounded-2xl shadow-2xl hover:scale-105 transition-transform duration-500"
          />

          <!-- Card Flutuante -->
          <div class="absolute -bottom-8 -left-8 bg-white rounded-2xl p-6 shadow-2xl max-w-xs animate__animated animate__slideInUp animation-delay-500">
            <div class="flex items-center gap-4">
              <div class="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg"></div>
              <div>
                <div class="font-bold text-gray-900">Top Seller</div>
                <div class="text-sm text-gray-600">Mais de 2.5k vendidas</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import 'animate.css';

.animation-delay-100 {
  animation-delay: 0.1s;
}

.animation-delay-200 {
  animation-delay: 0.2s;
}

.animation-delay-300 {
  animation-delay: 0.3s;
}

.animation-delay-400 {
  animation-delay: 0.4s;
}

.animation-delay-500 {
  animation-delay: 0.5s;
}

.animation-delay-600 {
  animation-delay: 0.6s;
}

.animation-delay-700 {
  animation-delay: 0.7s;
}

.animation-delay-2000 {
  animation-delay: 2s;
}

.animation-delay-4000 {
  animation-delay: 4s;
}
</style>
