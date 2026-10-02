# ruoyi-uniapp（RuoYi-Cloud-Plus 移动端 · uni-app）

> RuoYi-Cloud-Plus 微服务后端的 **uni-app 移动端**集成工程（Vue3 + Vite + Pinia）。
> 已与本地运行的后端（网关 `localhost:8080`）完成加密登录 + 鉴权链路联调。

## 一、为什么是"自建 uni-app"而不是克隆官方仓库

| 候选源码 | 结论 |
|---|---|
| 官方 `Ruoyi-Plus-Uniapp`（dromara README 赞助商链接 → ruoyi.plus） | 商业版，不可匿名克隆 |
| 社区 `y_project/RuoYi-App`（gitee 可达） | 面向 RuoYi-Vue/Cloud **单体/旧微服务**，Vue2 工具链，本地 node22 无法构建，且鉴权模型（SaToken `tokenValue`、无 `clientid`、无 `api-decrypt`）与 Cloud-Plus 不兼容 |
| **本工程（Cloud-Plus-native uni-app）** | ✅ Vue3 + Vite，node22 可构建；请求/响应加解密、clientid、网关路由 100% 对齐本后端 |

> 因此采用**原生 uni-app 按本后端契约实现**，结构与 RuoYi-App 一致（`api/`、`store/`、`pages/`、`utils/request`），后续若拿到官方 plus 移动端源码，可直接平移 `src/utils/request.js` + `src/config.js` 对接。

## 二、后端对接契约（已对照源码验证）

网关：`http://localhost:8080`（容器内 `ruoyi-gateway:8080`）

| 项 | 值 |
|---|---|
| API baseUrl（H5 开发） | `/dev-api`（vite 代理 → `localhost:8080`） |
| 登录接口 | `POST /auth/login`（网关 StripPrefix=1 → auth `/login`） |
| 客户端ID | `e5cd7e4891bf95d1d19206ce24a7b32e`（与 `sys_client` pc 端一致） |
| 默认管理员 | `admin` / `admin123` |
| Token 头 | `Authorization: Bearer <access_token>` |
| clientid 头 | 必须随每个请求携带，否则 401「客户端ID与Token不匹配」 |
| 接口加密 | **开启**（`api-decrypt.enabled=true`）。`/auth/login` 标注 `@ApiEncrypt`，请求/响应均加密 |

### 加解密方案（与后端 `ruoyi-common-encrypt` 完全一致）
- **请求加密（@ApiEncrypt 接口必须）**：`encrypt-key` 头 = `RSA(base64(aesKey), 公钥P_B)`；body = `AES/ECB/PKCS7(base64)`，用 32 字节 AES 密钥。`/auth/login`、`/auth/register`、`resetPwd`、`updatePwd` 均要求。
- **响应**：`@ApiEncrypt(response=false)` 默认**不加密**，响应为明文 JSON。客户端仍保留"若响应带 `encrypt-key` 头则解密"的兼容分支（双端兼容）。
- 密钥复用 plus-ui PC 端：`VITE_APP_RSA_PUBLIC_KEY`（P_B，请求加密）+ `VITE_APP_RSA_PRIVATE_KEY`（S_A，响应解密），前后端共用一套。

### 关键细节（已对照源码确认，避免踩坑）
- `TokenController.login` 从**请求体 `LoginBody`** 读取 `clientId` 与 `grantType`（`clientId` 标注 `@NotBlank`），**不仅**是请求头。登录体必须含 `clientId` + `grantType: 'password'`，否则报 `auth.clientid.not.blank`。
- 全局仍随每个请求带 `clientid` 请求头（网关 `AuthFilter` 校验 token 与 clientId 匹配，否则 401「客户端ID与Token不匹配」）。
- 验证码 `GET /auth/code` 返回 `uuid` + `img`（base64），登录体带 `code` + `uuid`。

## 三、目录结构

```
ruoyi-uniapp/
├── package.json          # 依赖 + 脚本（dev:h5 / build:h5 / verify）
├── vite.config.js        # H5 代理 /dev-api → localhost:8080
├── index.html / manifest.json / pages.json
├── verify-login.mjs      # 离线验证：对真实网关做一次加密登录往返
└── src/
    ├── config.js         # 网关/baseUrl/clientId/RSA 密钥
    ├── utils/
    │   ├── crypto.js     # AES/ECB/PKCS7 + 随机密钥（移植 plus-ui）
    │   ├── jsencrypt.js  # RSA 加解密
    │   ├── request.js    # uni.request 封装（加密/解密/token/clientid）
    │   └── auth.js       # token 本地存储
    ├── api/
    │   ├── auth.js       # getCode / login / logout / getInfo / getRouters
    │   └── system.js     # roleList / menuList
    ├── store/user.js     # Pinia：登录态、用户信息
    ├── pages/
    │   ├── login/login.vue   # 登录页（验证码）
    │   └── index/index.vue   # 工作台（角色列表，验证鉴权链路）
    ├── App.vue / main.js
```

## 四、运行

```bash
cd ruoyi-uniapp
pnpm install

# 1) 加密登录链路离线验证（对真实网关，需后端已启动）
pnpm verify
# 或 node verify-login.mjs

# 2) H5 开发预览（默认 http://localhost:5173，经代理访问网关）
pnpm dev:h5

# 3) 构建 H5 产物
pnpm build:h5

# 4) 其他端（需 HBuilderX 或对应 CLI）
pnpm dev:mp-weixin     # 微信小程序
pnpm dev:app           # App
```

> 真机/小程序/App 部署：把 `src/config.js` 的 `BASE_API` 改为可达网关地址（如 `http://<宿主机IP>:8080`），无需 vite 代理。

## 五、联调结论（2026-10-02）

- `pnpm verify` 对运行中网关完成**加密请求 → 后端解密 → 加密响应 → 前端解密**全链路，返回结构化 `R`（验证码错误属预期，证明加解密匹配）。
- 登录成功后 `GET /system/role/list` 携带 `Bearer` + `clientid` 返回 3 个角色，鉴权链路闭环（PC 端已实测，移动端同源复用）。
