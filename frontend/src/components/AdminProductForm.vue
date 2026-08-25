<template>
  <div class="w-full max-w-4xl mx-auto">
    <div class="bg-white dark:bg-slate-900 rounded-lg shadow-lg p-8"
         :class="darkMode ? 'bg-slate-900' : 'bg-white'">

      <h2 class="text-3xl font-bold mb-6" :class="darkMode ? 'text-white' : 'text-slate-900'">
        {{ isEditing ? 'Editar Produto' : 'Novo Produto' }}
      </h2>

      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Basic Info -->
        <div class="border-b pb-6" :class="darkMode ? 'border-slate-800' : 'border-slate-200'">
          <h3 class="text-lg font-semibold mb-4" :class="darkMode ? 'text-white' : 'text-slate-900'">
            Informações Básicas
          </h3>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-2" :class="darkMode ? 'text-slate-300' : 'text-slate-700'">
                Título
              </label>
              <input
                v-model="form.title"
                type="text"
                required
                class="w-full px-4 py-2 border rounded-lg"
                :class="darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300'"
              />
              <span v-if="errors.title" class="text-red-500 text-sm mt-1">{{ errors.title }}</span>
            </div>

            <div>
              <label class="block text-sm font-medium mb-2" :class="darkMode ? 'text-slate-300' : 'text-slate-700'">
                Descrição Curta
              </label>
              <textarea
                v-model="form.shortDescription"
                required
                rows="3"
                class="w-full px-4 py-2 border rounded-lg"
                :class="darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300'"
              />
            </div>

            <div>
              <label class="block text-sm font-medium mb-2" :class="darkMode ? 'text-slate-300' : 'text-slate-700'">
                Descrição Completa
              </label>
              <textarea
                v-model="form.description"
                required
                rows="5"
                class="w-full px-4 py-2 border rounded-lg"
                :class="darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300'"
              />
            </div>
          </div>
        </div>

        <!-- Pricing -->
        <div class="border-b pb-6" :class="darkMode ? 'border-slate-800' : 'border-slate-200'">
          <h3 class="text-lg font-semibold mb-4" :class="darkMode ? 'text-white' : 'text-slate-900'">
            Precificação
          </h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-2" :class="darkMode ? 'text-slate-300' : 'text-slate-700'">
                Preço (R$)
              </label>
              <input
                v-model.number="form.price"
                type="number"
                step="0.01"
                required
                class="w-full px-4 py-2 border rounded-lg"
                :class="darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300'"
              />
              <span v-if="errors.price" class="text-red-500 text-sm mt-1">{{ errors.price }}</span>
            </div>

            <div>
              <label class="block text-sm font-medium mb-2" :class="darkMode ? 'text-slate-300' : 'text-slate-700'">
                Desconto (%)
              </label>
              <input
                v-model.number="form.discount"
                type="number"
                min="0"
                max="100"
                class="w-full px-4 py-2 border rounded-lg"
                :class="darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300'"
              />
            </div>
          </div>
        </div>

        <!-- Product Details -->
        <div class="border-b pb-6" :class="darkMode ? 'border-slate-800' : 'border-slate-200'">
          <h3 class="text-lg font-semibold mb-4" :class="darkMode ? 'text-white' : 'text-slate-900'">
            Detalhes do Produto
          </h3>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-2" :class="darkMode ? 'text-slate-300' : 'text-slate-700'">
                Categoria
              </label>
              <select
                v-model="form.category"
                required
                class="w-full px-4 py-2 border rounded-lg"
                :class="darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300'"
              >
                <option value="">Selecione uma categoria</option>
                <option value="individual">Individual</option>
                <option value="pacote">Pacote</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium mb-2" :class="darkMode ? 'text-slate-300' : 'text-slate-700'">
                Arquivo digital (caminho em private/downloads)
              </label>
              <input
                v-model="form.downloadPath"
                type="text"
                placeholder="produto.zip"
                class="w-full px-4 py-2 border rounded-lg"
                :class="darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300'"
              />
            </div>

            <div class="flex items-center gap-4">
              <label class="flex items-center">
                <input
                  v-model="form.featured"
                  type="checkbox"
                  class="mr-2"
                />
                <span :class="darkMode ? 'text-slate-300' : 'text-slate-700'">
                  Produto em Destaque
                </span>
              </label>

              <label class="flex items-center">
                <input
                  v-model="form.available"
                  type="checkbox"
                  class="mr-2"
                />
                <span :class="darkMode ? 'text-slate-300' : 'text-slate-700'">
                  Disponível
                </span>
              </label>
            </div>
          </div>
        </div>

        <!-- Submit Buttons -->
        <div class="flex gap-4">
          <button
            type="submit"
            :disabled="isLoading"
            class="flex-1 py-3 px-4 rounded-lg text-white font-bold transition-colors"
            :class="isLoading ? 'bg-slate-400 cursor-not-allowed' : 'bg-brand-600 hover:bg-brand-700'"
          >
            {{ isLoading ? 'Salvando...' : (isEditing ? 'Atualizar' : 'Criar') }}
          </button>

          <button
            type="button"
            @click="$emit('cancel')"
            class="flex-1 py-3 px-4 rounded-lg font-bold transition-colors"
            :class="darkMode ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-slate-200 text-slate-900 hover:bg-slate-300'"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';

const props = defineProps({
  darkMode: {
    type: Boolean,
    default: false,
  },
  product: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(['submit', 'cancel']);

const isEditing = !!props.product;

const form = reactive({
  title: props.product?.title || '',
  shortDescription: props.product?.shortDescription || '',
  description: props.product?.description || '',
  price: props.product?.price || 0,
  discount: props.product?.discount || 0,
  category: props.product?.category || '',
  downloadPath: props.product?.downloadPath || '',
  featured: props.product?.featured || false,
  available: props.product?.available || true,
});

const errors = reactive({
  title: '',
  price: '',
});

const isLoading = ref(false);

const validateForm = () => {
  let isValid = true;

  if (!form.title || form.title.length < 3) {
    errors.title = 'Título deve ter pelo menos 3 caracteres';
    isValid = false;
  } else {
    errors.title = '';
  }

  if (form.price <= 0) {
    errors.price = 'Preço deve ser maior que zero';
    isValid = false;
  } else {
    errors.price = '';
  }

  return isValid;
};

const handleSubmit = async () => {
  if (!validateForm()) {
    return;
  }

  isLoading.value = true;

  try {
    emit('submit', form);
  } finally {
    isLoading.value = false;
  }
};
</script>
