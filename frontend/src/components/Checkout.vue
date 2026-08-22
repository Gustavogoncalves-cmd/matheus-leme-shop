<template>
  <div class="w-full">
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Form Section -->
      <div class="lg:col-span-2">
        <div class="bg-white dark:bg-slate-900 rounded-lg shadow-lg p-6 md:p-8">
          <h2 class="text-2xl md:text-3xl font-bold mb-8 text-slate-900 dark:text-white">
            Finalizar Compra
          </h2>

          <form @submit.prevent="handleSubmit" class="space-y-8">
            <!-- Contact Section -->
            <div class="border-b border-slate-200 dark:border-slate-800 pb-8">
              <h3 class="text-lg font-semibold mb-4 text-slate-900 dark:text-white">
                Informações de Contato
              </h3>

              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
                    Nome Completo *
                  </label>
                  <input
                    v-model="form.name"
                    type="text"
                    required
                    class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
                    :class="{
                      'bg-white border-slate-300 text-slate-900': !darkMode,
                      'bg-slate-800 border-slate-700 text-white': darkMode,
                      'border-red-500': errors.name
                    }"
                  />
                  <span v-if="errors.name" class="text-red-500 text-sm mt-1">{{ errors.name }}</span>
                </div>

                <div>
                  <label class="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
                    Email *
                  </label>
                  <input
                    v-model="form.email"
                    type="email"
                    required
                    class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
                    :class="{
                      'bg-white border-slate-300 text-slate-900': !darkMode,
                      'bg-slate-800 border-slate-700 text-white': darkMode,
                      'border-red-500': errors.email
                    }"
                    @blur="validateEmail"
                  />
                  <span v-if="errors.email" class="text-red-500 text-sm mt-1">{{ errors.email }}</span>
                </div>

                <div>
                  <label class="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
                    Telefone *
                  </label>
                  <input
                    v-model="form.phone"
                    type="tel"
                    required
                    placeholder="(XX) 9XXXX-XXXX"
                    class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
                    :class="{
                      'bg-white border-slate-300 text-slate-900': !darkMode,
                      'bg-slate-800 border-slate-700 text-white': darkMode,
                      'border-red-500': errors.phone
                    }"
                    @input="maskPhone"
                    @blur="validatePhone"
                  />
                  <span v-if="errors.phone" class="text-red-500 text-sm mt-1">{{ errors.phone }}</span>
                </div>
              </div>
            </div>

            <!-- Address Section -->
            <div class="border-b border-slate-200 dark:border-slate-800 pb-8">
              <h3 class="text-lg font-semibold mb-4 text-slate-900 dark:text-white">
                Endereço de Entrega
              </h3>

              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
                    Rua *
                  </label>
                  <input
                    v-model="form.street"
                    type="text"
                    required
                    class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
                    :class="{
                      'bg-white border-slate-300 text-slate-900': !darkMode,
                      'bg-slate-800 border-slate-700 text-white': darkMode,
                      'border-red-500': errors.street
                    }"
                  />
                  <span v-if="errors.street" class="text-red-500 text-sm mt-1">{{ errors.street }}</span>
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
                      Número *
                    </label>
                    <input
                      v-model="form.number"
                      type="text"
                      required
                      class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
                      :class="{
                        'bg-white border-slate-300 text-slate-900': !darkMode,
                        'bg-slate-800 border-slate-700 text-white': darkMode
                      }"
                    />
                  </div>

                  <div>
                    <label class="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
                      Complemento
                    </label>
                    <input
                      v-model="form.complement"
                      type="text"
                      class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
                      :class="{
                        'bg-white border-slate-300 text-slate-900': !darkMode,
                        'bg-slate-800 border-slate-700 text-white': darkMode
                      }"
                    />
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
                      Cidade *
                    </label>
                    <input
                      v-model="form.city"
                      type="text"
                      required
                      class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
                      :class="{
                        'bg-white border-slate-300 text-slate-900': !darkMode,
                        'bg-slate-800 border-slate-700 text-white': darkMode,
                        'border-red-500': errors.city
                      }"
                    />
                    <span v-if="errors.city" class="text-red-500 text-sm mt-1">{{ errors.city }}</span>
                  </div>

                  <div>
                    <label class="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
                      Estado *
                    </label>
                    <input
                      v-model="form.state"
                      type="text"
                      required
                      maxlength="2"
                      placeholder="SP"
                      class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 transition uppercase"
                      :class="{
                        'bg-white border-slate-300 text-slate-900': !darkMode,
                        'bg-slate-800 border-slate-700 text-white': darkMode,
                        'border-red-500': errors.state
                      }"
                      @input="form.state = $event.target.value.toUpperCase()"
                    />
                    <span v-if="errors.state" class="text-red-500 text-sm mt-1">{{ errors.state }}</span>
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
                    CEP *
                  </label>
                  <input
                    v-model="form.zipCode"
                    type="text"
                    required
                    placeholder="XXXXX-XXX"
                    class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
                    :class="{
                      'bg-white border-slate-300 text-slate-900': !darkMode,
                      'bg-slate-800 border-slate-700 text-white': darkMode,
                      'border-red-500': errors.zipCode
                    }"
                    @input="maskZip"
                    @blur="validateZip"
                  />
                  <span v-if="errors.zipCode" class="text-red-500 text-sm mt-1">{{ errors.zipCode }}</span>
                </div>
              </div>
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              :disabled="isLoading"
              class="w-full py-3 px-4 rounded-lg text-white font-bold transition-all duration-200 text-lg"
              :class="{
                'bg-brand-600 hover:bg-brand-700 active:scale-95': !isLoading,
                'bg-slate-400 cursor-not-allowed opacity-75': isLoading
              }"
            >
              <span v-if="!isLoading">Ir para Pagamento</span>
              <span v-else class="flex items-center justify-center">
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processando...
              </span>
            </button>
          </form>
        </div>
      </div>

      <!-- Cart Summary Section -->
      <div class="lg:col-span-1">
        <div class="bg-white dark:bg-slate-900 rounded-lg shadow-lg p-6 sticky top-4 max-h-fit">
          <h3 class="text-xl font-bold mb-6 text-slate-900 dark:text-white">
            Resumo do Pedido
          </h3>

          <!-- Cart Items -->
          <div class="space-y-4 mb-6 pb-6 border-b border-slate-200 dark:border-slate-800 max-h-96 overflow-y-auto">
            <div v-if="cartItems.length === 0" class="text-center py-8 text-slate-500 dark:text-slate-400">
              <p>Seu carrinho está vazio</p>
            </div>

            <div
              v-for="item in cartItems"
              :key="item.id"
              class="flex justify-between items-start gap-4 pb-4 border-b border-slate-100 dark:border-slate-800 last:border-b-0 last:pb-0"
            >
              <div class="flex-1 min-w-0">
                <p class="font-medium text-slate-900 dark:text-white truncate">
                  {{ item.title }}
                </p>
                <p class="text-sm text-slate-500 dark:text-slate-400">
                  Qtd: {{ item.quantity }}
                </p>
              </div>
              <div class="text-right">
                <p class="font-semibold text-slate-900 dark:text-white">
                  {{ formatPrice(item.price * (1 - (item.discount || 0) / 100) * item.quantity) }}
                </p>
                <p v-if="item.discount" class="text-xs text-green-600 dark:text-green-400">
                  -{{ item.discount }}%
                </p>
              </div>
            </div>
          </div>

          <!-- Price Summary -->
          <div class="space-y-3 mb-6 text-slate-700 dark:text-slate-300">
            <div class="flex justify-between">
              <span>Subtotal:</span>
              <span class="font-medium text-slate-900 dark:text-white">
                {{ formatPrice(subtotal) }}
              </span>
            </div>

            <div class="flex justify-between">
              <span>Desconto:</span>
              <span class="font-medium text-green-600 dark:text-green-400">
                -{{ formatPrice(discount) }}
              </span>
            </div>

            <div class="flex justify-between text-sm">
              <span>Frete:</span>
              <span class="font-medium text-slate-900 dark:text-white">
                A calcular
              </span>
            </div>
          </div>

          <!-- Total -->
          <div class="bg-slate-100 dark:bg-slate-800 rounded-lg p-4 mb-6">
            <div class="flex justify-between items-center">
              <span class="font-bold text-slate-900 dark:text-white text-lg">Total:</span>
              <span class="font-bold text-brand-600 dark:text-brand-400 text-2xl">
                {{ formatPrice(cartTotal) }}
              </span>
            </div>
          </div>

          <!-- Security Badge -->
          <div class="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <svg class="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
            </svg>
            <span>Pagamento seguro com MercadoPago</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useCartStore } from '../stores/cart';

const props = defineProps({
  darkMode: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['submit']);

const cartStore = useCartStore();

const form = reactive({
  name: '',
  email: '',
  phone: '',
  street: '',
  number: '',
  complement: '',
  city: '',
  state: '',
  zipCode: '',
});

const errors = reactive({
  name: '',
  email: '',
  phone: '',
  street: '',
  city: '',
  state: '',
  zipCode: '',
});

const isLoading = ref(false);

const cartItems = computed(() => cartStore.items);
const cartTotal = computed(() => cartStore.total);

const subtotal = computed(() => {
  return cartItems.value.reduce((sum, item) => {
    return sum + item.price * item.quantity;
  }, 0);
});

const discount = computed(() => {
  return cartItems.value.reduce((sum, item) => {
    const discountAmount = (item.price * (item.discount || 0) / 100) * item.quantity;
    return sum + discountAmount;
  }, 0);
});

const formatPrice = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

const maskPhone = (event) => {
  let value = event.target.value.replace(/\D/g, '');
  if (value.length > 11) value = value.slice(0, 11);

  if (value.length <= 2) {
    form.phone = value;
  } else if (value.length <= 6) {
    form.phone = `(${value.slice(0, 2)}) ${value.slice(2)}`;
  } else {
    form.phone = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
  }
};

const maskZip = (event) => {
  let value = event.target.value.replace(/\D/g, '');
  if (value.length > 8) value = value.slice(0, 8);

  if (value.length <= 5) {
    form.zipCode = value;
  } else {
    form.zipCode = `${value.slice(0, 5)}-${value.slice(5)}`;
  }
};

const validateEmail = () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!form.email) {
    errors.email = 'Email é obrigatório';
  } else if (!emailRegex.test(form.email)) {
    errors.email = 'Email inválido';
  } else {
    errors.email = '';
  }
};

const validatePhone = () => {
  const cleaned = form.phone.replace(/\D/g, '');
  if (!form.phone) {
    errors.phone = 'Telefone é obrigatório';
  } else if (cleaned.length < 10) {
    errors.phone = 'Telefone deve ter pelo menos 10 dígitos';
  } else {
    errors.phone = '';
  }
};

const validateZip = () => {
  const cleaned = form.zipCode.replace(/\D/g, '');
  if (!form.zipCode) {
    errors.zipCode = 'CEP é obrigatório';
  } else if (cleaned.length !== 8) {
    errors.zipCode = 'CEP deve ter 8 dígitos';
  } else {
    errors.zipCode = '';
  }
};

const validateForm = () => {
  let isValid = true;

  if (!form.name || form.name.trim().length < 3) {
    errors.name = 'Nome deve ter pelo menos 3 caracteres';
    isValid = false;
  } else {
    errors.name = '';
  }

  validateEmail();
  if (errors.email) isValid = false;

  validatePhone();
  if (errors.phone) isValid = false;

  if (!form.street || form.street.trim().length === 0) {
    errors.street = 'Rua é obrigatória';
    isValid = false;
  } else {
    errors.street = '';
  }

  if (!form.city || form.city.trim().length === 0) {
    errors.city = 'Cidade é obrigatória';
    isValid = false;
  } else {
    errors.city = '';
  }

  if (!form.state || form.state.length !== 2) {
    errors.state = 'Estado deve ter 2 caracteres';
    isValid = false;
  } else {
    errors.state = '';
  }

  validateZip();
  if (errors.zipCode) isValid = false;

  return isValid;
};

const handleSubmit = async () => {
  if (!validateForm()) {
    return;
  }

  if (cartItems.value.length === 0) {
    alert('Seu carrinho está vazio');
    return;
  }

  isLoading.value = true;

  try {
    emit('submit', {
      ...form,
      items: cartItems.value,
      total: cartTotal.value,
    });
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  cartStore.initCart();
});
</script>
