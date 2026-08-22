<script setup>
import { ShoppingCart, Heart, Star } from 'lucide-vue-next'
import { ref } from 'vue'

const isFavorite = ref(false)

const product = {
  id: 1,
  name: 'Produto Premium',
  price: 199.90,
  originalPrice: 249.90,
  rating: 4.5,
  reviews: 128,
  image: 'https://via.placeholder.com/300x300?text=Produto',
  badge: 'Em Destaque',
  inStock: true
}

const toggleFavorite = () => {
  isFavorite.value = !isFavorite.value
}
</script>

<template>
  <div class="card bg-base-100 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group">
    <!-- Imagem com Badge e Favorite -->
    <figure class="relative overflow-hidden h-80 bg-gray-200">
      <img
        :src="product.image"
        :alt="product.name"
        class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
      />

      <!-- Badge de Destaque -->
      <div class="badge badge-primary absolute top-4 left-4 animate__animated animate__fadeInDown">
        {{ product.badge }}
      </div>

      <!-- Botão Favorito -->
      <button
        @click="toggleFavorite"
        class="absolute top-4 right-4 btn btn-circle btn-ghost hover:bg-white transition-all"
        :class="{ 'text-red-500': isFavorite }"
      >
        <Heart :fill="isFavorite ? 'currentColor' : 'none'" size="24" />
      </button>

      <!-- Overlay com CTA ao Hover -->
      <div class="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100">
        <button class="btn btn-sm btn-primary gap-2 animate__animated animate__slideInUp">
          <ShoppingCart size="18" />
          Ver Detalhes
        </button>
      </div>
    </figure>

    <!-- Conteúdo -->
    <div class="card-body gap-2 animate__animated animate__fadeInUp">
      <!-- Rating -->
      <div class="flex items-center gap-1">
        <div class="flex text-yellow-400">
          <Star v-for="i in 5" :key="i" size="16" :fill="i <= Math.floor(product.rating) ? 'currentColor' : 'none'" />
        </div>
        <span class="text-sm text-gray-500">({{ product.reviews }} avaliações)</span>
      </div>

      <!-- Título -->
      <h2 class="card-title text-lg line-clamp-2 hover:text-primary transition-colors">
        {{ product.name }}
      </h2>

      <!-- Preço -->
      <div class="flex items-center gap-2">
        <span class="text-2xl font-bold text-primary">R$ {{ product.price.toFixed(2) }}</span>
        <span class="text-sm line-through text-gray-400">R$ {{ product.originalPrice.toFixed(2) }}</span>
        <span class="badge badge-success text-white">
          -{{ Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) }}%
        </span>
      </div>

      <!-- Stock Status -->
      <div class="text-sm" :class="product.inStock ? 'text-success' : 'text-error'">
        {{ product.inStock ? '✓ Em Estoque' : '✗ Fora de Estoque' }}
      </div>

      <!-- Botões de Ação -->
      <div class="card-actions justify-between mt-4 gap-2">
        <button class="btn btn-outline btn-sm flex-1 hover:bg-primary hover:text-white transition-all">
          Adicionar ao Carrinho
        </button>
        <button class="btn btn-primary btn-sm flex-1">
          Comprar Agora
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Animações customizadas */
@import 'animate.css';

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Efeito brilho no hover */
.group:hover .card-title {
  animation: textGlow 0.3s ease-in-out;
}

@keyframes textGlow {
  0% {
    text-shadow: 0 0 0px rgba(59, 130, 246, 0);
  }
  50% {
    text-shadow: 0 0 8px rgba(59, 130, 246, 0.5);
  }
  100% {
    text-shadow: 0 0 0px rgba(59, 130, 246, 0);
  }
}
</style>
