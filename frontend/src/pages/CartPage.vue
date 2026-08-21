<template>
  <main class="min-h-screen bg-white dark:bg-slate-950">
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-4xl font-bold text-slate-900 dark:text-white mb-8">
        Carrinho de Compras
      </h1>
      <Cart />
    </div>
  </main>
</template>

<script setup>
import Cart from '../components/Cart.vue'
</script>
