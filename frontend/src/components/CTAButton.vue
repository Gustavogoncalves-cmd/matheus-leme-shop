<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (v) => ['primary', 'secondary', 'outline', 'ghost'].includes(v)
  },
  size: {
    type: String,
    default: 'md',
    validator: (v) => ['sm', 'md', 'lg'].includes(v)
  },
  label: String,
  icon: [Object, Function],
  darkMode: Boolean,
  loading: Boolean,
  disabled: Boolean
})

const emit = defineEmits(['click'])
const isPressed = ref(false)

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'px-4 py-2 text-sm'
    case 'lg':
      return 'px-8 py-4 text-lg'
    default:
      return 'px-6 py-3 text-base'
  }
})

const variantClasses = computed(() => {
  switch (props.variant) {
    case 'primary':
      return props.darkMode
        ? 'bg-gradient-to-r from-brand-600 to-pink-600 text-white hover:from-brand-500 hover:to-pink-500 shadow-lg hover:shadow-brand-500/50'
        : 'bg-gradient-to-r from-brand-600 to-pink-600 text-white hover:from-brand-700 hover:to-pink-700 shadow-lg hover:shadow-brand-600/50'
    case 'secondary':
      return props.darkMode
        ? 'bg-slate-700 text-white hover:bg-slate-600 shadow-lg'
        : 'bg-slate-200 text-slate-900 hover:bg-slate-300 shadow-lg'
    case 'outline':
      return props.darkMode
        ? 'border-2 border-brand-500 text-brand-400 hover:bg-brand-500/10'
        : 'border-2 border-brand-600 text-brand-600 hover:bg-brand-50'
    case 'ghost':
      return props.darkMode
        ? 'text-brand-400 hover:bg-slate-800/50'
        : 'text-brand-600 hover:bg-slate-100'
    default:
      return ''
  }
})

const handleClick = (e) => {
  if (!props.disabled && !props.loading) {
    isPressed.value = true
    setTimeout(() => isPressed.value = false, 600)
    emit('click', e)
  }
}
</script>

<template>
  <button
    :class="[
      'relative inline-flex items-center justify-center gap-2 font-bold rounded-lg',
      'transition-all duration-300 transform',
      'hover:scale-105 active:scale-95',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      sizeClasses,
      variantClasses,
      {
        'opacity-50 cursor-not-allowed': disabled,
        'cursor-wait': loading
      }
    ]"
    :disabled="disabled || loading"
    @click="handleClick">

    <!-- Ripple Effect -->
    <div v-if="isPressed"
         class="absolute inset-0 rounded-lg pointer-events-none"
         :class="variant === 'primary' ? 'bg-white/20' : 'bg-white/10'"
         style="animation: ripple 0.6s ease-out"></div>

    <!-- Icon -->
    <component v-if="icon" :is="icon" :size="20" class="flex-shrink-0" />

    <!-- Loading Spinner -->
    <svg v-if="loading"
         class="animate-spin -ml-1 mr-3 h-4 w-4"
         xmlns="http://www.w3.org/2000/svg"
         fill="none"
         viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>

    <!-- Label -->
    <span>{{ label }}</span>

    <!-- Glow Effect (Primary Variant) -->
    <div v-if="variant === 'primary'"
         class="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none"
         style="background: linear-gradient(135deg, rgb(59, 130, 246), rgb(236, 72, 153)); filter: blur(10px)"></div>
  </button>
</template>

<style scoped>
@keyframes ripple {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(4);
    opacity: 0;
  }
}

button:focus-visible {
  outline: 2px solid rgb(59, 130, 246);
  outline-offset: 2px;
}
</style>
