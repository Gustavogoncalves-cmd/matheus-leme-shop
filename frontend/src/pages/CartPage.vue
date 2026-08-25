<template>
  <main class="min-h-screen bg-neon-bg">
    <div class="container mx-auto px-4 py-8 max-w-4xl">
      <h1 class="text-4xl font-black text-white font-display uppercase tracking-tight mb-8">
        Carrinho de Compras
      </h1>
      <Cart :dark-mode="true" />
    </div>
  </main>
</template>

<script setup>
import Cart from '../components/Cart.vue'
</script>
