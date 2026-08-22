<template>
  <header class="sticky top-0 z-40 w-full transition-all duration-300 border-b"
          :class="darkMode ? 'bg-slate-900/95 border-slate-800 shadow-lg' : 'bg-white/80 border-slate-200 shadow-sm backdrop-blur-sm'">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
      <!-- Logo -->
      <router-link to="/" class="flex items-center gap-2.5 group">
        <div class="w-10 h-10 rounded-xl overflow-hidden shadow-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-105"
             :class="darkMode ? 'bg-slate-800' : 'bg-brand-600'">
          <img src="/assets/logos/logo.png" alt="Matheus Leme" class="w-full h-full object-cover">
        </div>
        <div class="flex flex-col">
          <span class="font-bold tracking-tight text-lg font-display transition-colors duration-300"
                :class="darkMode ? 'text-white group-hover:text-slate-400' : 'text-slate-900 group-hover:text-brand-600'">
            Matheus Leme
          </span>
          <span class="text-[10px] uppercase tracking-wider font-semibold -mt-1"
                :class="darkMode ? 'text-slate-400' : 'text-brand-600'">
            Design e Motion
          </span>
        </div>
      </router-link>

      <!-- Controls -->
      <div class="flex items-center gap-4">
        <!-- Theme Toggle -->
        <button @click="handleToggleDarkMode"
                class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-300 border shadow-sm"
                :class="darkMode ? 'bg-slate-800 border-slate-700 text-white hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'">
          <span v-if="!darkMode" class="flex items-center gap-1">
            <Moon class="w-3.5 h-3.5" /> Escuro
          </span>
          <span v-else class="flex items-center gap-1">
            <Sun class="w-3.5 h-3.5 text-amber-400" /> Claro
          </span>
        </button>

        <!-- Support Badge -->
        <span class="hidden sm:inline-flex items-center gap-1.5 text-[9px] font-bold uppercase px-3.5 py-1.5 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-100">
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Suporte Online
        </span>

        <!-- Back to Portfolio -->
        <router-link to="/" class="hidden md:flex items-center gap-1 font-bold text-xs"
                     :class="darkMode ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'">
          <ArrowLeft class="w-4 h-4" /> Voltar ao Portfólio
        </router-link>

        <!-- Cart Badge -->
        <router-link to="/cart"
                     data-testid="cart-link"
                     class="relative p-2 rounded-lg transition-colors"
                     :class="darkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'">
          <ShoppingBag class="w-5 h-5" />
          <span v-if="cartCount > 0"
                data-testid="cart-badge"
                class="absolute -top-2 -right-2 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center"
                :class="darkMode ? 'bg-brand-600 text-white' : 'bg-brand-500 text-white'">
            {{ cartCount }}
          </span>
        </router-link>

        <!-- Auth or User Menu -->
        <div v-if="isAuthenticated" class="flex items-center gap-3">
          <span class="text-xs font-medium" :class="darkMode ? 'text-slate-300' : 'text-slate-600'">
            {{ user?.name }}
          </span>
          <button @click="logout" class="text-xs font-semibold px-3 py-1 rounded-lg transition-colors"
                  :class="darkMode ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'">
            Sair
          </button>
        </div>
        <router-link v-else to="/login"
                     class="text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
                     :class="darkMode ? 'bg-brand-600 text-white hover:bg-brand-700' : 'bg-brand-600 text-white hover:bg-brand-700'">
          Entrar
        </router-link>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed, watch } from 'vue'
import { useCartStore } from '../stores/cart'
import { Moon, Sun, ShoppingBag, ArrowLeft } from 'lucide-vue-next'

const props = defineProps({
  isDark: Boolean
})

const emit = defineEmits(['toggleDarkMode'])

const cartStore = useCartStore()

const cartCount = computed(() => cartStore.items?.length || 0)
const isAuthenticated = computed(() => false) // TODO: Implement auth
const user = computed(() => null) // TODO: Implement auth

const handleToggleDarkMode = () => {
  emit('toggleDarkMode')
}

const logout = () => {
  // TODO: Implement logout
}

const darkMode = computed(() => props.isDark)
</script>
