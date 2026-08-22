<template>
  <div class="w-full">
    <div v-if="cartStore.items.length === 0" class="text-center py-12">
      <ShoppingBag class="w-12 h-12 mx-auto mb-4 opacity-50" :class="darkMode ? 'text-slate-500' : 'text-slate-300'" />
      <p :class="darkMode ? 'text-slate-400' : 'text-slate-500'" class="mb-4">
        Seu carrinho está vazio
      </p>
      <router-link to="/" class="inline-block px-6 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors">
        Voltar ao Catálogo
      </router-link>
    </div>

    <div v-else class="space-y-6">
      <!-- Cart Items -->
      <div class="space-y-4">
        <div v-for="item in cartStore.items" :key="item.id"
             class="flex gap-4 p-4 rounded-lg border"
             :class="darkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'">

          <!-- Item Thumbnail -->
          <img v-if="item.thumbnail" :src="item.thumbnail" :alt="item.title"
               class="w-20 h-20 rounded-lg object-cover" />
          <div v-else class="w-20 h-20 rounded-lg bg-slate-300 flex items-center justify-center">
            <Package class="w-8 h-8 text-slate-500" />
          </div>

          <!-- Item Details -->
          <div class="flex-1">
            <h3 class="font-bold" :class="darkMode ? 'text-white' : 'text-slate-900'">
              {{ item.title }}
            </h3>
            <p class="text-sm" :class="darkMode ? 'text-slate-400' : 'text-slate-500'">
              R$ {{ item.price.toFixed(2) }}
            </p>
            <div v-if="item.discount" class="text-xs text-emerald-500 font-semibold">
              -{{ item.discount }}% desconto
            </div>
          </div>

          <!-- Quantity Controls -->
          <div class="flex items-center gap-2">
            <button @click="cartStore.updateQuantity(item.id, item.quantity - 1)"
                    class="p-1 rounded hover:bg-slate-300 transition-colors"
                    :class="darkMode ? 'hover:bg-slate-800' : ''">
              <Minus class="w-4 h-4" />
            </button>
            <input type="number" v-model.number="item.quantity" min="1" max="99"
                   @change="cartStore.updateQuantity(item.id, item.quantity)"
                   class="w-12 text-center rounded border py-1 px-2 text-sm"
                   :class="darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300'" />
            <button @click="cartStore.updateQuantity(item.id, item.quantity + 1)"
                    class="p-1 rounded hover:bg-slate-300 transition-colors"
                    :class="darkMode ? 'hover:bg-slate-800' : ''">
              <Plus class="w-4 h-4" />
            </button>
          </div>

          <!-- Item Total -->
          <div class="text-right">
            <p class="font-bold text-lg" :class="darkMode ? 'text-white' : 'text-slate-900'">
              R$ {{ (itemTotal(item)).toFixed(2) }}
            </p>
            <button @click="cartStore.removeItem(item.id)"
                    class="text-xs text-red-500 hover:text-red-700 font-semibold mt-2">
              Remover
            </button>
          </div>
        </div>
      </div>

      <!-- Summary -->
      <div class="border-t pt-6" :class="darkMode ? 'border-slate-800' : 'border-slate-200'">
        <div class="flex justify-between mb-4 text-lg font-bold"
             :class="darkMode ? 'text-white' : 'text-slate-900'">
          <span>Total:</span>
          <span>R$ {{ cartStore.total.toFixed(2) }}</span>
        </div>

        <div class="flex gap-3">
          <router-link to="/"
                       class="flex-1 px-4 py-3 rounded-lg text-center font-semibold transition-colors"
                       :class="darkMode ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-slate-100 text-slate-900 hover:bg-slate-200'">
            Continuar Comprando
          </router-link>
          <button @click="checkout"
                  class="flex-1 px-4 py-3 rounded-lg text-center font-semibold text-white transition-colors bg-brand-600 hover:bg-brand-700">
            Ir para Checkout
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useCartStore } from '../stores/cart';
import { ShoppingBag, Minus, Plus, Package } from 'lucide-vue-next';

const router = useRouter();

const props = defineProps({
  darkMode: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['checkout']);

const cartStore = useCartStore();

const itemTotal = (item) => {
  const discountedPrice = item.price * (1 - (item.discount || 0) / 100);
  return discountedPrice * item.quantity;
};

const checkout = () => {
  emit('checkout');
  router.push('/checkout');
};
</script>
