// RSA 加解密（移植自 plus-ui src/utils/jsencrypt.ts）
// 依赖 jsencrypt；密钥取自 src/config.js，前后端共用一套密钥对
import { JSEncrypt } from 'jsencrypt'
import { RSA_PUBLIC_KEY, RSA_PRIVATE_KEY } from '../config.js'

// 前端不建议存放私钥、不建议解密数据（都是透明的意义不大），此处为实现响应解密必需
export const encrypt = (txt) => {
  const encryptor = new JSEncrypt()
  encryptor.setPublicKey(RSA_PUBLIC_KEY) // 设置公钥（请求加密）
  return encryptor.encrypt(txt) // 对数据进行加密
}

export const decrypt = (txt) => {
  const encryptor = new JSEncrypt()
  encryptor.setPrivateKey(RSA_PRIVATE_KEY) // 设置私钥（响应解密）
  return encryptor.decrypt(txt) // 对数据进行解密
}
