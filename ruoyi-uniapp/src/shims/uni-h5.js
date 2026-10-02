// 非 uni-app 环境（纯 Vite H5 回退 dev:web / build:web）的 uni.* 兼容层。
// 真机/小程序/App 由 uni-app 框架注入全局 uni，本文件不会覆盖。
// 仅实现本工程用到的 API：request / getStorageSync / setStorageSync /
// removeStorageSync / showToast / navigateTo / reLaunch。

const storage = {}

function setPage(url) {
  // 通知 App.vue 切换页面（见 src/App.vue）
  if (typeof globalThis !== 'undefined' && globalThis.__setPage) {
    globalThis.__setPage(url)
  }
  globalThis.uni.__current = url
}

export const uniShim = {
  __current: '/pages/login/login',
  request({ url, method = 'GET', data, header = {}, success, fail }) {
    const full = url.startsWith('http')
      ? url
      : url.startsWith('/dev-api')
        ? url
        : '/dev-api' + url
    const isBody = method !== 'GET' && method !== 'HEAD'
    fetch(full, {
      method,
      headers: header,
      body: isBody ? (typeof data === 'string' ? data : JSON.stringify(data)) : undefined
    })
      .then(async (res) => {
        const text = await res.text()
        let parsed
        try {
          parsed = JSON.parse(text)
        } catch {
          parsed = text
        }
        const headers = {}
        res.headers.forEach((v, k) => (headers[k] = v))
        success && success({ statusCode: res.status, header: headers, data: parsed })
      })
      .catch((e) => fail && fail(e))
  },
  getStorageSync(k) {
    return storage[k]
  },
  setStorageSync(k, v) {
    storage[k] = v
  },
  removeStorageSync(k) {
    delete storage[k]
  },
  showToast({ title } = {}) {
    // 简单提示：控制台 + 临时浮层
    console.log('[toast]', title)
    let el = document.getElementById('__toast')
    if (!el) {
      el = document.createElement('div')
      el.id = '__toast'
      el.style.cssText =
        'position:fixed;left:50%;top:20%;transform:translateX(-50%);background:rgba(0,0,0,.75);color:#fff;padding:12px 20px;border-radius:8px;z-index:9999;font-size:14px;max-width:80%'
      document.body.appendChild(el)
    }
    el.textContent = title
    el.style.display = 'block'
    clearTimeout(el.__t)
    el.__t = setTimeout(() => (el.style.display = 'none'), 2000)
  },
  navigateTo({ url }) {
    setPage(url.split('?')[0])
  },
  reLaunch({ url }) {
    setPage(url.split('?')[0])
  }
}

if (typeof globalThis !== 'undefined' && !globalThis.uni) {
  globalThis.uni = uniShim
}
