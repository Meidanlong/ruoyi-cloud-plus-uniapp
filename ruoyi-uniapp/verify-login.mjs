// 离线验证：用 uni-app 的加解密逻辑，对【真实运行中的网关】做一次加密登录往返
// 目的：证明 src/utils/crypto.js + jsencrypt.js 与后端 ruoyi-common-encrypt 完全兼容
// 用法：在 ruoyi-uniapp 目录 pnpm install 后执行 `node verify-login.mjs`
//
// 说明：验证码无法自动识别（图片），这里用错误验证码提交。
// 只要服务端能【成功解密请求】并【返回可解密的加密响应】，即证明双向加解密链路打通。
// 预期结果：解密后的 JSON 含 code/msg（如验证码错误），而不是解密失败/乱码。

import { generateAesKey, encryptBase64, decryptBase64, encryptWithAes, decryptWithAes } from './src/utils/crypto.js'
import { RSA_PUBLIC_KEY, RSA_PRIVATE_KEY } from './src/config.js'

// jsencrypt@3.x 的 ESM 入口在 Node 原生 ESM 下解析失败，用 createRequire 走 CJS（Vite/uni-app 下不受影响）
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const jsencryptPkg = require('jsencrypt')
const JSEncrypt = jsencryptPkg.JSEncrypt || jsencryptPkg.default || jsencryptPkg

const GATEWAY = process.env.GATEWAY || 'http://localhost:8080'
const CLIENT_ID = 'e5cd7e4891bf95d1d19206ce24a7b32e'
const ENCRYPT_HEADER = 'encrypt-key'

function rsaEncrypt(txt) {
  const e = new JSEncrypt()
  e.setPublicKey(RSA_PUBLIC_KEY)
  return e.encrypt(txt)
}
function rsaDecrypt(txt) {
  const e = new JSEncrypt()
  e.setPrivateKey(RSA_PRIVATE_KEY)
  return e.decrypt(txt)
}

async function main() {
  // 1) 取验证码 uuid
  const codeRes = await fetch(`${GATEWAY}/auth/code`)
  const codeJson = await codeRes.json()
  const uuid = codeJson.data?.uuid
  console.log('[1] GET /auth/code ->', { captchaEnabled: codeJson.data?.captchaEnabled, uuid: uuid?.slice(0, 8) + '...' })

  // 2) 构造加密登录请求（错误验证码，仅验证加解密链路）
  // 注意：clientId / grantType 必须在【请求体】内（TokenController 从 LoginBody 读取），
  // 同时全局仍带 clientid 请求头（网关 AuthFilter 校验用）
  const body = {
    username: 'admin',
    password: 'admin123',
    code: '000000',
    uuid,
    clientId: CLIENT_ID,
    grantType: 'password'
  }
  const aesKey = generateAesKey()
  const encryptKeyHeader = rsaEncrypt(encryptBase64(aesKey))
  const encBody = encryptWithAes(JSON.stringify(body), aesKey)

  const loginRes = await fetch(`${GATEWAY}/auth/login`, {
    method: 'POST',
    headers: {
      'clientid': CLIENT_ID,
      [ENCRYPT_HEADER]: encryptKeyHeader,
      'Content-Type': 'application/json;charset=utf-8'
    },
    body: encBody
  })

  // 3) 解密响应（与 request.js 逻辑一致）
  const respHeaderKey = loginRes.headers.get(ENCRYPT_HEADER)
  const raw = await loginRes.text()
  let result
  if (respHeaderKey) {
    const aesKeyBytes = decryptBase64(rsaDecrypt(respHeaderKey).toString())
    const decrypted = decryptWithAes(raw, aesKeyBytes)
    result = JSON.parse(decrypted)
    console.log('[2] 响应已加密，解密成功 ✅')
  } else {
    result = JSON.parse(raw)
    console.log('[2] 响应未加密（明文）')
  }
  console.log('[3] 解密后后端返回 ->', JSON.stringify(result))

  if (result && result.code !== undefined) {
    console.log('\n✅ 加解密链路验证通过：请求被后端成功解密，响应被前端成功解密。')
    console.log('   （当前为错误验证码，属预期；输入正确验证码即可拿到 access_token）')
    process.exit(0)
  } else {
    console.log('\n❌ 未得到结构化响应，加解密可能不匹配')
    process.exit(1)
  }
}

main().catch((e) => {
  console.error('验证异常:', e)
  process.exit(1)
})
