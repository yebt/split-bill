import 'virtual:uno.css'
import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createHead } from '@unhead/vue/client'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(createHead())
app.use(router)

app.mount('#app')

// Remove splash screen after the router is ready and first navigation is complete
router.isReady().then(() => {
  const splashScreen = document.getElementById('splash-screen')
  if (splashScreen) {
    splashScreen.classList.add('fade-out')
    setTimeout(() => {
      splashScreen.remove()
    }, 300)
  }
})
