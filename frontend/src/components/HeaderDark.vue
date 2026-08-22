<script setup>
import { ref, computed } from 'vue'
import { ShoppingBag, Menu, X } from 'lucide-vue-next'
import { useCartStore } from '../stores/cart'

const cartStore = useCartStore()
const cartCount = computed(() => cartStore.items?.length || 0)

const mobileOpen = ref(false)

const navLinks = [
  { label: 'Catálogo', href: '#menu' },
  { label: 'Portfólio', href: '#portfolio' },
  { label: 'Depoimentos', href: '#depoimentos' },
  { label: 'Contato', href: '#contato' },
]

const closeMobile = () => { mobileOpen.value = false }
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
          <ShoppingBag class="w-5 h-5" />
          <span v-if="cartCount > 0"
                data-testid="cart-badge"
                class="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full text-[11px] font-bold flex items-center justify-center bg-neon-lime text-black">
            {{ cartCount }}
          </span>
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
           class="py-3 text-sm font-bold uppercase tracking-wide text-slate-300 hover:text-neon-lime transition-colors border-b border-neon-line/50 last:border-0"
           @click="closeMobile">
          {{ link.label }}
        </a>
      </nav>
    </transition>
  </header>
</template>
