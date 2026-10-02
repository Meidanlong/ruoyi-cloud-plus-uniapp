// 用户状态（Pinia）
import { defineStore } from 'pinia'
import { login as apiLogin, logout as apiLogout, getInfo } from '@/api/auth.js'
import { setToken, getToken, removeToken } from '@/utils/auth.js'
import { config } from '@/config.js'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: getToken(),
    userInfo: {},
    roles: [],
    permissions: []
  }),
  actions: {
    // 登录：加密提交，拿到 access_token 存本地
    // clientId / grantType 必须放在请求体内（TokenController 从 LoginBody 读取）
    async login(loginForm) {
      const res = await apiLogin({
        username: loginForm.username,
        password: loginForm.password,
        code: loginForm.code,
        uuid: loginForm.uuid,
        clientId: config.CLIENT_ID,
        grantType: 'password'
      })
      const token = res.data && res.data.access_token
      if (!token) throw new Error('登录失败：未返回 token')
      setToken(token)
      this.token = token
      return token
    },
    // 拉取用户信息
    async fetchInfo() {
      const res = await getInfo()
      this.userInfo = res.data || {}
      this.roles = (res.data && res.data.roles) || []
      this.permissions = (res.data && res.data.permissions) || []
      return this.userInfo
    },
    // 退出
    async logout() {
      try {
        await apiLogout()
      } catch (e) {
        // 忽略退出接口异常
      }
      removeToken()
      this.token = ''
      this.userInfo = {}
      this.roles = []
      this.permissions = []
    }
  }
})
