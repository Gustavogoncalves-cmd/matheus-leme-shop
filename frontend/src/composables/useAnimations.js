/**
 * Reusable motion-v animation presets for the Matheus Leme dark/neon redesign.
 * motion-v mirrors Framer Motion's API (initial/animate/whileHover/whileInView),
 * so these are plain prop objects meant to be spread onto <motion.*> elements:
 *
 *   <motion.div v-bind="fadeInUp()"> ... </motion.div>
 *   <motion.div v-bind="fadeInUp(0.15)"> ... </motion.div>  // staggered delay
 */

/** Fade + rise into place, triggered once when scrolled into view. */
export function fadeInUp(delay = 0, distance = 24) {
  return {
    initial: { opacity: 0, y: distance },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.2 },
    transition: { duration: 0.6, delay, ease: 'easeOut' },
  }
}

/** Simple opacity fade, no movement. */
export function fadeIn(delay = 0) {
  return {
    initial: { opacity: 0 },
    whileInView: { opacity: 1 },
    viewport: { once: true, amount: 0.2 },
    transition: { duration: 0.6, delay, ease: 'easeOut' },
  }
}

/** Card hover: subtle scale + lift. Pair with a `hover:shadow-neon-*` class
 *  for the glow, since box-shadow color is easier to theme in CSS than JS. */
export function scaleGlow() {
  return {
    whileHover: { scale: 1.03, y: -4 },
    whileTap: { scale: 0.98 },
    transition: { duration: 0.25, ease: 'easeOut' },
  }
}

/** Stagger children fade-up in a list/grid container. */
export function staggerContainer(stagger = 0.08) {
  return {
    initial: 'hidden',
    whileInView: 'show',
    viewport: { once: true, amount: 0.1 },
    variants: {
      hidden: {},
      show: { transition: { staggerChildren: stagger } },
    },
  }
}

export function staggerItem(distance = 20) {
  return {
    variants: {
      hidden: { opacity: 0, y: distance },
      show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
    },
  }
}

/**
 * Typewriter effect: reveals `text` one character at a time.
 * Not a motion-v preset (motion-v doesn't animate text content) - a tiny
 * composable used directly in components, e.g.:
 *   const { display } = useTypewriter('Bem-vindo ao Matheus Leme')
 *   <span>{{ display }}</span>
 *
 * `text` may be a plain string, a ref, or a getter. The reactive forms matter
 * now that headline copy is loaded from the content API after mount: the
 * animation restarts from scratch when the source changes, so the hardcoded
 * fallback types out first and the stored value replaces it on arrival rather
 * than the two interleaving mid-word.
 */
import { ref, isRef, watch, onUnmounted } from 'vue'

export function useTypewriter(text, { speed = 45, startDelay = 200 } = {}) {
  const display = ref('')
  const done = ref(false)
  let timers = []

  const read = () => {
    const raw = typeof text === 'function' ? text() : isRef(text) ? text.value : text
    return String(raw ?? '')
  }

  const stop = () => {
    timers.forEach(clearTimeout)
    timers = []
  }

  const start = (value) => {
    stop()
    display.value = ''
    done.value = false

    timers.push(
      setTimeout(() => {
        let i = 0
        const tick = () => {
          if (i <= value.length) {
            display.value = value.slice(0, i)
            i++
            timers.push(setTimeout(tick, speed))
          } else {
            done.value = true
          }
        }
        tick()
      }, startDelay)
    )
  }

  watch(read, start, { immediate: true })

  onUnmounted(stop)

  return { display, done }
}
