<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ShoppingBag, Menu, X, User, LogIn, LogOut, Settings, ChevronDown, Package } from 'lucide-vue-next'
import { useCartStore } from '../stores/cart'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const cartStore = useCartStore()
const authStore = useAuthStore()

const cartCount = computed(() => cartStore.items?.length || 0)
const isAuthenticated = computed(() => authStore.isAuthenticated)
const isAdmin = computed(() => authStore.isAdmin)
const userName = computed(() => authStore.user?.name || authStore.user?.email || 'Usuário')

const mobileOpen = ref(false)
const userMenuOpen = ref(false)

const navLinks = [
  { label: 'Catálogo', href: '#menu' },
  { label: 'Portfólio', href: '#portfolio' },
  { label: 'Depoimentos', href: '#depoimentos' },
  { label: 'Contato', href: '#contato' },
]

const closeMobile = () => { mobileOpen.value = false }

const handleLogout = async () => {
  userMenuOpen.value = false
  await authStore.logout()
  router.push('/')
}
</script>

<template>
  <header class="sticky top-0 z-40 w-full border-b border-neon-line bg-neon-bg/90 backdrop-blur-md">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      <!-- Logo -->
      <router-link to="/" class="flex items-center gap-2.5 group" @click="closeMobile">
        <div class="w-9 h-9 rounded-lg overflow-hidden flex items-center justify-center border border-neon-line group-hover:shadow-neon-lime transition-shadow duration-300">
          <img src="/assets/logos/logo.png" alt="Matheus Leme" class="w-full h-full object-cover">
        </div>
        <span class="font-black tracking-tight text-lg font-display text-white uppercase group-hover:text-neon-lime transition-colors duration-300">
          Matheus Leme
        </span>
      </router-link>

      <!-- Desktop nav -->
      <nav class="hidden md:flex items-center gap-8">
        <a v-for="link in navLinks" :key="link.href" :href="link.href"
           class="text-sm font-bold uppercase tracking-wide text-slate-300 hover:text-neon-lime transition-colors duration-300">
          {{ link.label }}
        </a>
      </nav>

      <!-- Right controls -->
      <div class="flex items-center gap-2">
        <router-link to="/cart"
                     data-testid="cart-link"
                     class="relative p-2 rounded-lg text-slate-300 hover:text-neon-lime transition-colors">
          <!-- Invisível: target da animação "voo pro carrinho". Não afeta o layout. -->
          <span data-testid="cart-rocket-target" class="absolute -inset-2 pointer-events-none" />
          <ShoppingBag class="w-5 h-5" />
          <span v-if="cartCount > 0"
                data-testid="cart-badge"
                class="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full text-[11px] font-bold flex items-center justify-center bg-neon-lime text-black">
            {{ cartCount }}
          </span>
        </router-link>

        <!-- Auth: Logged In -->
        <div v-if="isAuthenticated" class="relative hidden md:block">
          <button
            @click="userMenuOpen = !userMenuOpen"
            class="flex items-center gap-1.5 p-2 rounded-lg text-slate-300 hover:text-neon-lime hover:bg-slate-800/50 transition-colors"
          >
            <User class="w-5 h-5" />
            <span class="text-sm font-medium max-w-[100px] truncate">{{ userName }}</span>
            <ChevronDown class="w-4 h-4" :class="userMenuOpen ? 'rotate-180' : ''" />
          </button>

          <!-- Dropdown -->
          <div v-if="userMenuOpen" class="absolute right-0 mt-2 w-52 bg-slate-900 border border-neon-line rounded-lg shadow-xl z-50 overflow-hidden">
            <div class="py-1">
              <router-link
                to="/orders"
                class="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-300 hover:text-neon-lime hover:bg-slate-800 transition-colors"
                @click="userMenuOpen = false"
              >
                <Package class="w-4 h-4" />
                Meus Pedidos
              </router-link>
              <router-link
                to="/perfil"
                class="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-300 hover:text-neon-lime hover:bg-slate-800 transition-colors"
                @click="userMenuOpen = false"
              >
                <User class="w-4 h-4" />
                Meu Perfil
              </router-link>
              <router-link
                v-if="isAdmin"
                to="/admin"
                class="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-300 hover:text-neon-lime hover:bg-slate-800 transition-colors"
                @click="userMenuOpen = false"
              >
                <Settings class="w-4 h-4" />
                Painel Admin
              </router-link>
              <div class="border-t border-neon-line my-1"></div>
              <button
                @click="handleLogout"
                class="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-colors text-left"
              >
                <LogOut class="w-4 h-4" />
                Sair
              </button>
            </div>
          </div>
        </div>

        <!-- Auth: Logged Out -->
        <router-link
          v-else
          to="/login"
          class="hidden md:flex items-center gap-1.5 p-2 rounded-lg text-slate-300 hover:text-neon-lime hover:bg-slate-800/50 transition-colors"
        >
          <LogIn class="w-5 h-5" />
          <span class="text-sm font-medium">Entrar</span>
        </router-link>

        <button class="md:hidden p-2 text-slate-300 hover:text-neon-lime transition-colors"
                @click="mobileOpen = !mobileOpen">
          <component :is="mobileOpen ? X : Menu" class="w-6 h-6" />
        </button>
      </div>
    </div>

    <!-- Mobile nav -->
    <transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2">
      <nav v-if="mobileOpen" class="md:hidden border-t border-neon-line bg-neon-bg px-4 pb-4 pt-2 flex flex-col gap-1">
        <a v-for="link in navLinks" :key="link.href" :href="link.href"
           class="py-3 text-sm font-bold uppercase tracking-wide text-slate-300 hover:text-neon-lime transition-colors border-b border-neon-line/50"
           @click="closeMobile">
          {{ link.label }}
        </a>

        <!-- Mobile auth section -->
        <div class="border-t border-neon-line/50 mt-2 pt-2">
          <template v-if="isAuthenticated">
            <p class="py-2 text-xs font-bold uppercase tracking-wide text-slate-500">Conta</p>
            <router-link
              to="/orders"
              class="flex items-center gap-2 py-3 text-sm font-medium text-slate-300 hover:text-neon-lime transition-colors"
              @click="closeMobile"
            >
              <Package class="w-4 h-4" />
              Meus Pedidos
            </router-link>
            <router-link
              v-if="isAdmin"
              to="/admin"
              class="flex items-center gap-2 py-3 text-sm font-medium text-slate-300 hover:text-neon-lime transition-colors"
              @click="closeMobile"
            >
              <Settings class="w-4 h-4" />
              Painel Admin
            </router-link>
            <button
              @click="() => { closeMobile(); handleLogout(); }"
              class="flex items-center gap-2 py-3 text-sm font-medium text-red-400 hover:text-red-300 transition-colors w-full text-left"
            >
              <LogOut class="w-4 h-4" />
              Sair
            </button>
          </template>
          <router-link
            v-else
            to="/login"
            class="flex items-center gap-2 py-3 text-sm font-medium text-slate-300 hover:text-neon-lime transition-colors"
            @click="closeMobile"
          >
            <LogIn class="w-4 h-4" />
            Entrar
          </router-link>
        </div>
      </nav>
    </transition>
  </header>
</template>
