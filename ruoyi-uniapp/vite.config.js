import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'

// 纯 Vite 运行配置（dev:web / build:web 回退）：
//  - @vitejs/plugin-vue 编译 .vue 单文件组件
//  - @ 别名指向 src（与 uni-app 一致）
//  - /dev-api 代理到网关 localhost:8080（同源，规避 CORS，encrypt-key 响应头可读）
// uni-app 正式构建请使用 HBuilderX 或 npx @dcloudio/uvm（提供 @dcloudio/vite-plugin-uni）
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) }
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/dev-api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/dev-api/, '')
      }
    }
  }
})
