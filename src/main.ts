import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import VueFeather from 'vue-feather'

import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'
import '@/styles/common.scss'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

const app = createApp(App)

app.component('VueFeather', VueFeather)

app.use(pinia)
app.use(router)

app.mount('#app')
