import './assets/main.css'

import { VueQueryPlugin, type VueQueryPluginOptions } from '@tanstack/vue-query'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { ApiError } from './shared/api/errors'

const MAX_RETRIES = 3

// A 4xx answer, such as a rate limit, does not change by asking again right away.
const queryOptions: VueQueryPluginOptions = {
  queryClientConfig: {
    defaultOptions: {
      queries: {
        retry: (failures, error) =>
          failures < MAX_RETRIES && !(error instanceof ApiError && error.status < 500),
      },
    },
  },
}

const app = createApp(App)

app.use(router)
app.use(VueQueryPlugin, queryOptions)

app.mount('#app')
