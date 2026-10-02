// 后端对接契约（与 plus-ui PC 端完全一致，已对照后端源码验证）
// 网关地址：http://localhost:8080（容器内 ruoyi-gateway:8080）
export const config = {
  // H5 开发走 vite 代理 /dev-api -> localhost:8080
  // 真机/微信小程序/App 部署时改为可达网关地址，例如 'http://192.168.1.10:8080'
  BASE_API: '/dev-api',
  // 客户端ID（与后端 sys_client 表 pc 端一致）
  CLIENT_ID: 'e5cd7e4891bf95d1d19206ce24a7b32e',
  // 接口加密开关（必须与后端 application-common.yml 的 api-decrypt.enabled 保持一致）
  ENCRYPT: true
}

// 请求加密 RSA 公钥：与后端 api-decrypt.privateKey 成对的公钥（前端用其加密请求体 AES 密钥）
export const RSA_PUBLIC_KEY =
  'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDvEDuRIOM3oZPWj9Ukoc5pQklR4PFH6/clnjeFqjDLIgDyQvjxhgqAZQA+E9eD6qu6FsXPmK8djcL+nh3cFHz4pX473jDvO3Sve+8yL3VRQ0n2pRgQ2a01MJsy+WwTZCBYWf0VnLRIvANUoWQgy9vz94q7Va44dg7A1/3ICf+xAwIDAQAB'

// 响应解密 RSA 私钥：与后端 api-decrypt.publicKey 成对的私钥（后端用公钥加密响应，前端用此私钥解密）
export const RSA_PRIVATE_KEY =
  'MIICdgIBADANBgkqhkiG9w0BAQEFAASCAmAwggJcAgEAAoGBAObq7yrxfvyieZtTjAYyrdvi59tYTXxjO5ajmPCRSXBY9M9wQ1tli297JN6mnY53UJMNyOFNSZVi8WSFoIXjpR87FmvChJlzeN/dZdd3SEs48Ee66XKeSePYqxa8oO5GKDsnajgpsOHKXSeeVSIysiIPS2/WsEqk0In9P4w3RsRFAgMBAAECgYBiMEWwce24SPICnRzuScBpvmsudrbEDIH7BOd0a6LZlcnLJwZNJ7mJlshPsHNQb+WgEf135+BBGEhioPtn0yuTdEuKP4kB9UdYUKiayWCoWhJpesv7sAD4RDClV7dhuV+gcd1AXD+YzyRIPbGm0VC2U+4q8/+UPRpVjqskbLVTgQJBAPRpou7g3S8n4XB527kq0D8I3+ZYwMxZhszwhrCDpJU319+ucmpLVwYIzDmZVeID2QQdUaDfIEViFHu95xDrGiUCQQDx3YOKn3yaEctk/ERVn7hDAyAXUbd8/pv2b24/M/l1ZevlsFem8U4Jk5Mu64t3z3YGJoymEjQmbucwT01iKhehAkEAxlnccsRmfFh/KkqauKE4M4++NTAd9zlInpUsmZ+cN8UEGnF2RTEzRKBrLOt1uWCqBB7PGiE6DVTVjr7FAQPrSQJAT5yeY87DcONSk9cFlzmPqV8p/QME5rvYEnHzVBKDlkUKNPyqnWToTvaoh9U4fyNmsfeWbEOprszqhFhWHG3GgQJAK8+ynmyFhaw63+Hx2KU5zR4hVuQso2IzrEurGxCxybV6mR7VBerb4502+EPx3PmOgxQL+niUFhcMWxcvBFP9+A=='

// 管理员默认账号（注意不是 123456，已哈希比对确认）
export const DEFAULT_ADMIN = { username: 'admin', password: 'admin123' }
