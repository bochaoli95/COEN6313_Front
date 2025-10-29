import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css'

// Create Vue application instance
const app = createApp(App)

// Install plugins
app.use(createPinia()) // State management
app.use(router) // Routing

// Mount application to DOM
app.mount('#app')

