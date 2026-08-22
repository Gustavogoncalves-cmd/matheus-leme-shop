import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import router from './router'

// Dark mode initialization: defaults to light unless the user explicitly
// chose dark before (system prefers-color-scheme is intentionally ignored
// so first-time visitors always land on the light theme).
if (localStorage.getItem('theme') === 'dark') {
  document.documentElement.classList.add('dark')
}

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.mount('#app')
