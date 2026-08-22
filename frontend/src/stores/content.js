import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { contentApi } from '../services/api';

/**
 * Site content (CMS) store.
 *
 * Backs both the public site (flat key/value map) and the admin editor (full
 * rows with section/label metadata). Components read through `text()`, which
 * falls back to the hardcoded copy passed by the caller, so the site still
 * renders correctly if the API is unreachable or a key has not been seeded.
 */
export const useContentStore = defineStore('content', () => {
  const map = ref({});
  const fields = ref([]);
  const isLoading = ref(false);
  const isSaving = ref(false);
  const error = ref(null);
  const loaded = ref(false);

  /**
   * Read a content value, falling back to the component's own default.
   * An empty string in the DB is treated as "not set" so a field cleared by
   * accident in the admin panel does not blank out the live site.
   */
  function text(key, fallback = '') {
    const value = map.value[key];
    return value === undefined || value === '' ? fallback : value;
  }

  /** Editor rows grouped by section, for rendering the admin panel. */
  const bySection = computed(() => {
    return fields.value.reduce((groups, field) => {
      (groups[field.section] ||= []).push(field);
      return groups;
    }, {});
  });

  /**
   * Load the public key/value map. Safe to call on every page load; pass
   * force=true to bypass the already-loaded short circuit.
   */
  async function fetchContent(force = false) {
    if (loaded.value && !force) return map.value;

    isLoading.value = true;
    error.value = null;

    try {
      const res = await contentApi.getMap();
      map.value = res?.data ?? {};
      loaded.value = true;
      return map.value;
    } catch (err) {
      // A CMS outage must not take the storefront down - components keep
      // their fallbacks and the page renders as before.
      error.value = err.message;
      return map.value;
    } finally {
      isLoading.value = false;
    }
  }

  /** Load full rows for the admin editor. Requires no auth (GET is public). */
  async function fetchFields() {
    isLoading.value = true;
    error.value = null;

    try {
      const res = await contentApi.getAll();
      fields.value = res?.data ?? [];
      // Keep the public map in sync so the editor and site agree.
      map.value = fields.value.reduce((acc, field) => {
        acc[field.key] = field.value;
        return acc;
      }, {});
      loaded.value = true;
      return fields.value;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /** Persist one field. Admin only - the API rejects other roles. */
  async function updateField(key, value) {
    isSaving.value = true;
    error.value = null;

    try {
      const res = await contentApi.update(key, value);
      const updated = res?.data;
      if (!updated) throw new Error('Resposta invalida do servidor');

      map.value[key] = updated.value;
      const index = fields.value.findIndex((f) => f.key === key);
      if (index !== -1) fields.value[index] = updated;

      return updated;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      isSaving.value = false;
    }
  }

  return {
    map,
    fields,
    isLoading,
    isSaving,
    error,
    loaded,
    bySection,
    text,
    fetchContent,
    fetchFields,
    updateField,
  };
});
