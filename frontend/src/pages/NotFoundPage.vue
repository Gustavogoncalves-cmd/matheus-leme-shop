<template>
  <main class="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center">
    <div class="text-center">
      <h1 class="text-6xl font-bold text-slate-900 dark:text-white mb-4">
        404
      </h1>
      <p class="text-2xl text-slate-600 dark:text-slate-400 mb-8">
        Página não encontrada
      </p>
      <p class="text-slate-600 dark:text-slate-400 mb-8">
        Desculpe, a página que você procura não existe.
      </p>
      <router-link
        to="/"
        class="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
      >
        Voltar à Loja
      </router-link>
    </div>
  </main>
</template>

<script setup>
// 404 Not Found Page
</script>
