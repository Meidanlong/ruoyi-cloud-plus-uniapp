// 认证相关接口
import request from '@/utils/request.js'

// 获取验证码（captchaEnabled / uuid / img）
export function getCode() {
  return request({ url: '/auth/code', method: 'GET' })
}

// 登录（@ApiEncrypt 接口，必须加密请求体；isEncrypt=true）
export function login(data) {
  return request({ url: '/auth/login', method: 'POST', data, isEncrypt: true })
}

// 退出登录
export function logout() {
  return request({ url: '/auth/logout', method: 'POST' })
}

// 获取用户信息
export function getInfo() {
  return request({ url: '/system/user/getInfo', method: 'GET' })
}

// 获取动态路由
export function getRouters() {
  return request({ url: '/system/menu/getRouters', method: 'GET' })
}
