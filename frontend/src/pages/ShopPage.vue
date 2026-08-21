<template>
  <main class="min-h-screen bg-white dark:bg-slate-950">
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-4xl font-bold text-slate-900 dark:text-white mb-2">
        Loja de Streampacks
      </h1>
      <p class="text-slate-600 dark:text-slate-400 mb-8">
        Pacotes premium para suas lives
      </p>
      <ProductGrid />
    </div>
  </main>
</template>

<script setup>
import ProductGrid from '../components/ProductGrid.vue'
</script>
