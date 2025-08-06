import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { Quasar, Notify } from 'quasar'
import { Neo4jApi } from '@/plugins/Neo4jApi'
import { GlobalVariables } from '@/plugins/GlobalVariables'

import '@quasar/extras/roboto-font/roboto-font.css'
import '@quasar/extras/material-icons/material-icons.css'

import 'quasar/dist/quasar.css'

const app = createApp(App)

app.use(router)
app.use(Quasar, {
  plugins: {
    Notify
  }
})
app.use(Neo4jApi)
app.use(GlobalVariables)

app.mount('#app')
