<script>
import { markRaw } from 'vue'
import login from './pages/login/login.vue'
import index from './pages/index/index.vue'

const pages = {
  '/pages/login/login': markRaw(login),
  '/pages/index/index': markRaw(index)
}

export default {
  data() {
    return {
      current: pages['/pages/login/login']
    }
  },
  mounted() {
    // 供 uni-shim 的页面切换调用（纯 H5 回退）
    globalThis.__setPage = (url) => {
      if (pages[url]) this.current = pages[url]
    }
    const start = (globalThis.uni && globalThis.uni.__current) || '/pages/login/login'
    if (pages[start]) this.current = pages[start]
  }
}
</script>

<template>
  <component :is="current" />
</template>

<style>
page,
body {
  background: #f5f6fa;
  font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, sans-serif;
}
</style>
