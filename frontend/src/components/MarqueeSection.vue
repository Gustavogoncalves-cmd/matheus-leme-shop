<script setup>
defineProps({
  text: { type: String, default: 'ABERTO AGORA' },
})
</script>

<template>
  <div class="marquee-mask group relative overflow-hidden border-y border-neon-line bg-neon-card py-2.5 sm:py-3">
    <div class="marquee-track flex whitespace-nowrap animate-marquee">
      <span v-for="n in 8" :key="`a-${n}`"
            class="mx-4 sm:mx-6 text-xs sm:text-sm font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] text-neon-lime">
        {{ text }} <span class="text-slate-600 mx-4">/</span>
      </span>
      <!-- Duplicated set so the 50%-translate loop is seamless -->
      <span v-for="n in 8" :key="`b-${n}`"
            class="mx-4 sm:mx-6 text-xs sm:text-sm font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] text-neon-lime">
        {{ text }} <span class="text-slate-600 mx-4">/</span>
      </span>
    </div>
  </div>
</template>

<style scoped>
/* Fade the edges so the loop seam never reads as a hard cut */
.marquee-mask {
  -webkit-mask-image: linear-gradient(to right, transparent, black 6%, black 94%, transparent);
  mask-image: linear-gradient(to right, transparent, black 6%, black 94%, transparent);
}

/* GPU-composited + steady: avoids the sub-pixel jitter of layout-driven scroll */
.marquee-track {
  will-change: transform;
  backface-visibility: hidden;
}

.marquee-mask:hover .marquee-track {
  animation-play-state: paused;
}

@media (prefers-reduced-motion: reduce) {
  .marquee-track {
    animation: none;
  }
}
</style>
