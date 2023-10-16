import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { createPinia } from 'pinia'
import { router } from './router'
import { autoAnimatePlugin } from '@formkit/auto-animate/vue'
import { Chart, registerables } from 'chart.js'
import { polyfill } from 'mobile-drag-drop'

Chart.register(...registerables)

const pinia = createPinia()

createApp(App).use(autoAnimatePlugin).use(pinia).use(router).mount('#app')

// Empty service worker to enable PWA
navigator.serviceWorker.register('sw.js')

// mobile-drag-drop
polyfill()
