<script setup>
import { ref, onMounted } from 'vue'
import Header from './components/Header.vue'

const isDark = ref(false)

onMounted(() => {
  isDark.value = document.documentElement.classList.contains('dark')
})

const toggleDarkMode = () => {
  isDark.value = !isDark.value

  if (isDark.value) {
    document.documentElement.classList.add('dark')
    localStorage.setItem('theme', 'dark')
  } else {
    document.documentElement.classList.remove('dark')
    localStorage.setItem('theme', 'light')
  }
}
</script>

<template>
  <div class="min-h-screen bg-white dark:bg-slate-950 transition-colors">
    <Header :is-dark="isDark" @toggle-dark-mode="toggleDarkMode" />
    <router-view />
  </div>
</template>

<style>
:root {
  --color-text: 15 23 42; /* slate-900 */
  --color-bg: 255 255 255; /* white */
  --color-accent: 59 130 246; /* blue-600 */
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --color-text: 241 245 250; /* slate-100 */
    --color-bg: 15 23 42; /* slate-950 */
    --color-accent: 93 171 255; /* blue-400 */
  }
}

:root[data-theme="dark"] {
  --color-text: 241 245 250; /* slate-100 */
  --color-bg: 15 23 42; /* slate-950 */
  --color-accent: 93 171 255; /* blue-400 */
}

body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
}

* {
  box-sizing: border-box;
}
</style>
