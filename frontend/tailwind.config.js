/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#cdd5fe',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },
        dark: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          700: '#1e293b',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        // Cocktail bar neon palette (Matheus Leme redesign)
        neon: {
          lime: '#c6ff00',
          cyan: '#00f0ff',
          magenta: '#ff00c8',
          bg: '#0a0a0a',
          card: '#141414',
          card2: '#1e1e1e',
          line: '#2a2a2a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'marquee': 'marquee 22s linear infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      boxShadow: {
        'neon-lime': '0 0 20px rgba(198,255,0,0.35), 0 0 60px rgba(198,255,0,0.12)',
        'neon-cyan': '0 0 20px rgba(0,240,255,0.35), 0 0 60px rgba(0,240,255,0.12)',
        'neon-magenta': '0 0 20px rgba(255,0,200,0.35), 0 0 60px rgba(255,0,200,0.12)',
      },
    },
  },
}
