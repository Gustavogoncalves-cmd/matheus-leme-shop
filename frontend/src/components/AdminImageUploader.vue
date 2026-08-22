<template>
  <div>
    <div
      class="rounded-lg border-2 border-dashed p-6 text-center transition-colors"
      :class="[
        isDragging
          ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
          : darkMode
            ? 'border-slate-700 hover:border-slate-600'
            : 'border-slate-300 hover:border-slate-400',
      ]"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="handleDrop"
    >
      <div v-if="previewUrl" class="mb-4">
        <img
          :src="previewUrl"
          alt="Pre-visualizacao da imagem enviada"
          class="mx-auto max-h-40 rounded-lg object-contain"
        />
      </div>

      <p class="text-sm mb-3" :class="darkMode ? 'text-slate-400' : 'text-slate-600'">
        Arraste uma imagem aqui ou
      </p>

      <label
        class="inline-block px-4 py-2 rounded-lg font-medium text-sm cursor-pointer transition-colors"
        :class="isUploading
          ? 'bg-slate-400 cursor-not-allowed text-white'
          : 'bg-brand-600 hover:bg-brand-700 text-white'"
      >
        {{ isUploading ? 'Enviando...' : 'Escolher arquivo' }}
        <input
          ref="fileInput"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          class="hidden"
          :disabled="isUploading"
          @change="handleFileInput"
        />
      </label>

      <p class="text-xs mt-3" :class="darkMode ? 'text-slate-500' : 'text-slate-500'">
        JPG, PNG, WebP ou GIF. Maximo 5MB.
      </p>
    </div>

    <p
      v-if="errorMessage"
      role="alert"
      class="mt-3 text-sm text-red-600 dark:text-red-400"
    >
      {{ errorMessage }}
    </p>

    <div
      v-if="uploadedUrl"
      class="mt-3 flex items-center gap-2 text-sm"
      :class="darkMode ? 'text-slate-300' : 'text-slate-700'"
    >
      <span class="text-green-600 dark:text-green-400">OK</span>
      <code class="truncate">{{ uploadedUrl }}</code>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { uploadApi } from '../services/api';

const props = defineProps({
  darkMode: { type: Boolean, default: false },
});

const emit = defineEmits(['uploaded']);

// Mirrors the server whitelist in backend/src/middleware/upload.js. This is a
// UX shortcut only - the server re-validates every upload regardless.
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE = 5 * 1024 * 1024;

const fileInput = ref(null);
const isDragging = ref(false);
const isUploading = ref(false);
const errorMessage = ref('');
const previewUrl = ref('');
const uploadedUrl = ref('');

function handleFileInput(event) {
  const file = event.target.files?.[0];
  if (file) uploadFile(file);
  // Reset so re-picking the same file fires change again.
  event.target.value = '';
}

function handleDrop(event) {
  isDragging.value = false;
  const file = event.dataTransfer?.files?.[0];
  if (file) uploadFile(file);
}

async function uploadFile(file) {
  errorMessage.value = '';
  uploadedUrl.value = '';

  if (!ALLOWED_TYPES.includes(file.type)) {
    errorMessage.value = 'Formato nao suportado. Use JPG, PNG, WebP ou GIF.';
    return;
  }

  if (file.size > MAX_SIZE) {
    errorMessage.value = 'A imagem precisa ter no maximo 5MB.';
    return;
  }

  isUploading.value = true;

  try {
    const res = await uploadApi.upload(file);
    const url = res?.data?.url;
    if (!url) throw new Error('Resposta de upload invalida');

    uploadedUrl.value = url;
    previewUrl.value = resolveUrl(url);
    emit('uploaded', url);
  } catch (err) {
    errorMessage.value = err.message || 'Falha no upload.';
  } finally {
    isUploading.value = false;
  }
}

// Uploaded files are served by the API host, which differs from the frontend
// origin in development, so the relative path needs the API base prepended.
function resolveUrl(url) {
  const base = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  return url.startsWith('http') ? url : `${base}${url}`;
}

defineExpose({ resolveUrl });
</script>
