<template>
  <div>
    <div class="mb-6">
      <h2 class="text-3xl font-bold" :class="darkMode ? 'text-white' : 'text-slate-900'">
        Conteudo do Site
      </h2>
      <p class="text-sm mt-2" :class="darkMode ? 'text-slate-400' : 'text-slate-600'">
        Edite os textos e imagens que aparecem no site. As alteracoes valem para todos os visitantes.
      </p>
    </div>

    <div v-if="contentStore.isLoading && !contentStore.fields.length"
         class="text-sm" :class="darkMode ? 'text-slate-400' : 'text-slate-600'">
      Carregando conteudo...
    </div>

    <div v-else-if="loadError"
         role="alert"
         class="rounded-lg border border-red-300 dark:border-red-900 bg-red-50 dark:bg-red-950/40 px-4 py-3 text-sm text-red-700 dark:text-red-300">
      {{ loadError }}
      <button class="ml-2 underline font-medium" @click="load">Tentar novamente</button>
    </div>

    <div v-else class="space-y-8">
      <section
        v-for="(fields, section) in contentStore.bySection"
        :key="section"
        class="rounded-lg border p-6"
        :class="darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'"
      >
        <h3 class="text-lg font-bold mb-4 capitalize"
            :class="darkMode ? 'text-white' : 'text-slate-900'">
          {{ SECTION_LABELS[section] || section }}
        </h3>

        <div class="space-y-5">
          <div v-for="field in fields" :key="field.key">
            <label
              :for="`content-${field.key}`"
              class="block text-sm font-medium mb-2"
              :class="darkMode ? 'text-slate-300' : 'text-slate-700'"
            >
              {{ field.label || field.key }}
              <code class="ml-2 text-xs font-normal"
                    :class="darkMode ? 'text-slate-500' : 'text-slate-400'">{{ field.key }}</code>
            </label>

            <textarea
              v-if="isLongText(field)"
              :id="`content-${field.key}`"
              v-model="drafts[field.key]"
              rows="3"
              class="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-brand-500"
              :class="darkMode
                ? 'bg-slate-800 border-slate-700 text-white'
                : 'bg-white border-slate-300 text-slate-900'"
            ></textarea>

            <input
              v-else
              :id="`content-${field.key}`"
              v-model="drafts[field.key]"
              type="text"
              class="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-brand-500"
              :class="darkMode
                ? 'bg-slate-800 border-slate-700 text-white'
                : 'bg-white border-slate-300 text-slate-900'"
            />

            <div class="mt-2 flex items-center gap-3">
              <button
                type="button"
                :disabled="!isDirty(field.key) || savingKey === field.key"
                class="px-4 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed bg-brand-600 hover:bg-brand-700 text-white"
                @click="save(field.key)"
              >
                {{ savingKey === field.key ? 'Salvando...' : 'Salvar' }}
              </button>

              <button
                v-if="isDirty(field.key)"
                type="button"
                class="text-sm underline"
                :class="darkMode ? 'text-slate-400' : 'text-slate-600'"
                @click="reset(field.key)"
              >
                Desfazer
              </button>

              <span v-if="savedKeys.has(field.key) && !isDirty(field.key)"
                    class="text-sm text-green-600 dark:text-green-400">
                Salvo
              </span>

              <span v-if="fieldErrors[field.key]"
                    role="alert"
                    class="text-sm text-red-600 dark:text-red-400">
                {{ fieldErrors[field.key] }}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section
        class="rounded-lg border p-6"
        :class="darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'"
      >
        <h3 class="text-lg font-bold mb-2" :class="darkMode ? 'text-white' : 'text-slate-900'">
          Imagens
        </h3>
        <p class="text-sm mb-4" :class="darkMode ? 'text-slate-400' : 'text-slate-600'">
          Envie uma imagem e copie o endereco gerado para colar em um campo acima.
        </p>
        <AdminImageUploader :dark-mode="darkMode" @uploaded="onUploaded" />
      </section>
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue';
import { useContentStore } from '../stores/content';
import AdminImageUploader from './AdminImageUploader.vue';

defineProps({
  darkMode: { type: Boolean, default: false },
});

const SECTION_LABELS = {
  hero: 'Topo da pagina (Hero)',
  portfolio: 'Portfolio',
  testimonials: 'Depoimentos',
  cta: 'Chamada para acao',
  footer: 'Rodape',
  general: 'Geral',
};

const contentStore = useContentStore();

// Drafts are edited locally and only pushed on Save, so a half-typed value is
// never written to the live site.
const drafts = reactive({});
const fieldErrors = reactive({});
const savedKeys = ref(new Set());
const savingKey = ref(null);
const loadError = ref('');

function isLongText(field) {
  return (field.value?.length ?? 0) > 60;
}

function isDirty(key) {
  const field = contentStore.fields.find((f) => f.key === key);
  return field ? drafts[key] !== field.value : false;
}

function reset(key) {
  const field = contentStore.fields.find((f) => f.key === key);
  if (field) drafts[key] = field.value;
  delete fieldErrors[key];
}

async function load() {
  loadError.value = '';
  try {
    const fields = await contentStore.fetchFields();
    fields.forEach((field) => {
      drafts[field.key] = field.value;
    });
  } catch (err) {
    loadError.value = err.message || 'Nao foi possivel carregar o conteudo.';
  }
}

async function save(key) {
  delete fieldErrors[key];
  savingKey.value = key;

  try {
    await contentStore.updateField(key, drafts[key]);
    savedKeys.value = new Set(savedKeys.value).add(key);
  } catch (err) {
    fieldErrors[key] = err.message || 'Falha ao salvar.';
  } finally {
    savingKey.value = null;
  }
}

function onUploaded(url) {
  // Surface the path so the admin can paste it into an image field. Copying is
  // best-effort: the clipboard API needs a secure context and can be denied.
  navigator.clipboard?.writeText(url).catch(() => {});
}

onMounted(load);
</script>
