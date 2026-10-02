// 系统模块接口（演示登录后鉴权链路）
import request from '@/utils/request.js'

// 角色列表（GET /system/role/list）
export function roleList(params) {
  return request({ url: '/system/role/list', method: 'GET', data: params })
}

// 菜单列表（GET /system/menu/list）
export function menuList(params) {
  return request({ url: '/system/menu/list', method: 'GET', data: params })
}
