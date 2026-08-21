<template>
  <main class="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center">
    <div class="w-full max-w-md">
      <div class="bg-slate-50 dark:bg-slate-900 p-8 rounded-lg shadow-lg">
        <h1 class="text-3xl font-bold text-slate-900 dark:text-white mb-6 text-center">
          Login
        </h1>

        <div class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Email
            </label>
            <input
              v-model="form.email"
              type="email"
              class="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Senha
            </label>
            <input
              v-model="form.password"
              type="password"
              class="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
              placeholder="••••••••"
            />
          </div>

          <button
            @click="handleLogin"
            class="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          >
            Entrar
          </button>
        </div>

        <p class="text-sm text-slate-600 dark:text-slate-400 text-center mt-4">
          [Placeholder - Em desenvolvimento]
        </p>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref } from 'vue'

const form = ref({
  email: '',
  password: ''
})

const handleLogin = () => {
  console.log('Login attempt with:', form.value)
  // TODO: Implement login logic
}
</script>
