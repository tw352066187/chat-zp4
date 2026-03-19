import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ArcoVue from '@arco-design/web-vue'
import '@arco-design/web-vue/dist/arco.css'
import App from './App.vue'
import router from './router'
import './style.css'
import '@/assets/style/globals.css'
import '@/assets/style/markdown-stream.css'
// 导入 vue-stream-markdown 的主题样式
import 'vue-stream-markdown/theme.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(ArcoVue)

app.mount('#app')
