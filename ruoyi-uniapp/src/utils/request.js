// 统一请求封装（移植自 plus-ui src/utils/request.ts 的拦截逻辑，适配 uni.request）
// 负责：clientid 头、Bearer Token、请求/响应加解密（api-decrypt）、状态码处理
import { config } from '../config.js'
import { encrypt, decrypt } from './jsencrypt.js'
import {
  generateAesKey,
  encryptBase64,
  decryptBase64,
  encryptWithAes,
  decryptWithAes
} from './crypto.js'
import { getToken, removeToken } from './auth.js'

const ENCRYPT_HEADER = 'encrypt-key'

function buildHeaders(token, extra) {
  const headers = {
    'clientid': config.CLIENT_ID,
    'Content-Type': 'application/json;charset=utf-8',
    ...extra
  }
  if (token) headers['Authorization'] = 'Bearer ' + token
  return headers
}

function decryptResponse(res) {
  let data = res.data
  if (!config.ENCRYPT) return data
  // 响应头 key 在不同端可能被小写化，统一兼容
  const header = res.header || {}
  const keyStr = header[ENCRYPT_HEADER] || header[ENCRYPT_HEADER.toLowerCase()]
  if (keyStr) {
    try {
      const base64Str = decrypt(keyStr)
      const aesKey = decryptBase64(base64Str.toString())
      const decrypted = decryptWithAes(data, aesKey)
      data = JSON.parse(decrypted)
    } catch (e) {
      // 解密失败时不阻断，原样返回（通常此时已是明文错误或异常结构）
      console.warn('响应解密失败', e)
    }
  }
  return data
}

// options: { url, method='GET', data, header, isEncrypt=false }
export default function request(options) {
  const { url, method = 'GET', data, header = {}, isEncrypt = false } = options
  const token = getToken()
  const headers = buildHeaders(token, header)

  let body = data
  if (config.ENCRYPT && isEncrypt && (method === 'POST' || method === 'PUT')) {
    const aesKey = generateAesKey()
    headers[ENCRYPT_HEADER] = encrypt(encryptBase64(aesKey))
    body =
      typeof data === 'object' ? encryptWithAes(JSON.stringify(data), aesKey) : encryptWithAes(data, aesKey)
  }

  return new Promise((resolve, reject) => {
    uni.request({
      url: config.BASE_API + url,
      method,
      data: body,
      header: headers,
      success: (res) => {
        const data = decryptResponse(res)
        if (res.statusCode === 200) {
          const code = data && data.code
          if (code === 401) {
            removeToken()
            uni.reLaunch({ url: '/pages/login/login' })
            reject(new Error(data.msg || '登录状态已过期，请重新登录'))
          } else if (code !== 200 && code !== undefined) {
            uni.showToast({ title: data.msg || '请求失败', icon: 'none' })
            reject(new Error(data.msg || '请求失败'))
          } else {
            resolve(data)
          }
        } else if (res.statusCode === 401) {
          removeToken()
          uni.reLaunch({ url: '/pages/login/login' })
          reject(new Error('未授权'))
        } else {
          reject(new Error('HTTP ' + res.statusCode))
        }
      },
      fail: (err) => reject(err)
    })
  })
}
