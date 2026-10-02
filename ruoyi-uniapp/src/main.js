import { createSSRApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
// 非 uni 环境注入 uni.* 兼容层；uni 运行时 globalThis.uni 已存在，不会覆盖
import './shims/uni-h5.js'

export function createApp() {
  const app = createSSRApp(App)
  app.use(createPinia())
  return { app }
}
