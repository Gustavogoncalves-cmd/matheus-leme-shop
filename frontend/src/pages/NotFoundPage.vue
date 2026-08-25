<template>
  <main class="min-h-screen bg-neon-bg flex items-center justify-center px-4">
    <div class="text-center max-w-md">
      <h1 class="text-8xl font-black font-display text-neon-lime mb-4">
        404
      </h1>
      <p class="text-2xl text-white font-bold font-display mb-4">
        Página não encontrada
      </p>
      <p class="text-slate-400 mb-8">
        Desculpe, a página que você procura não existe.
      </p>
      <router-link
        to="/"
        class="inline-block px-6 py-3 bg-neon-lime text-black font-bold rounded-full transition-all hover:brightness-110"
      >
        Voltar à Loja
      </router-link>
    </div>
  </main>
</template>

<script setup>
// 404 Not Found Page
</script>
