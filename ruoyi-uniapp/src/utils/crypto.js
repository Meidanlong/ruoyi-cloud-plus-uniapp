// 接口加解密工具（与后端 ruoyi-common-encrypt 的 hutool AES/ECB/PKCS7 + RSA 完全一致）
// 移植自 plus-ui src/utils/crypto.ts
import { ecb } from '@noble/ciphers/aes.js'

// 生成 32 位十六进制随机字符串（UTF-8 编码后恰为 32 字节 = AES-256 密钥，与后端长度校验一致）
const generateRandomString = () => {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, (b) => b.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 32)
}

const encoder = new TextEncoder()
const decoder = new TextDecoder()

const bytesToBase64 = (bytes) => {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary)
}

const base64ToBytes = (str) => {
  const binary = atob(str)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

// 随机生成 AES 密钥（32 字节 Uint8Array）
export const generateAesKey = () => encoder.encode(generateRandomString())

export const encryptBase64 = (bytes) => bytesToBase64(bytes)
export const decryptBase64 = (str) => base64ToBytes(str)

// 使用密钥对数据加密（AES/ECB/PKCS7Padding，与后端保持兼容）
export const encryptWithAes = (message, aesKey) => {
  const encrypted = ecb(aesKey).encrypt(encoder.encode(message))
  return bytesToBase64(encrypted)
}

// 使用密钥对数据解密
export const decryptWithAes = (message, aesKey) => {
  const decrypted = ecb(aesKey).decrypt(base64ToBytes(message))
  return decoder.decode(decrypted)
}
