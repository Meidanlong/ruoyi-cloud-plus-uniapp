// Token 本地存储（uni-app 多端统一 API）
const TOKEN_KEY = 'Admin-Token'

export const getToken = () => uni.getStorageSync(TOKEN_KEY) || ''
export const setToken = (token) => uni.setStorageSync(TOKEN_KEY, token)
export const removeToken = () => uni.removeStorageSync(TOKEN_KEY)
