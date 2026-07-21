import './assets/main.css'
import Aura from '@primeuix/themes/aura'
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { ConfirmationService, ToastService } from 'primevue'
import PrimeVue from 'primevue/config'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

const queryClient = new QueryClient()

const app = createApp(App)
app.use(router)
app.use(VueQueryPlugin, { queryClient })
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      darkModeSelector: false,
    },
  },
  license: import.meta.env.VITE_PRIMEUI_LICENSE,
})

app.use(ToastService)
app.use(ConfirmationService)

app.mount('#app')
