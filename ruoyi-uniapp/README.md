# ruoyi-uniapp（移动端集成骨架）

> 本目录是 RuoYi-Cloud-Plus 微服务后端的 **uni-app 移动端**集成起点。
> 官方仓库 `RuoYi-Plus-Uniapp`（gitee/dromara）当前匿名不可克隆（404）且原生面向单体版
> `RuoYi-Plus`（Spring Boot 3）。本工程后端是**微服务版** `RuoYi-Cloud-Plus`（Spring Boot 4.1.1），
> 故需将 uni-app 单体版源码**融入本项目并按业务做微服务拆分**。

## 一、后端对接契约（已实测验证）

网关地址：`http://localhost:8080`（容器内服务名 `ruoyi-gateway:8080`）

| 项 | 值 | 说明 |
|---|---|---|
| API baseUrl | `http://localhost:8080` | 所有 `/auth/**`、`/system/**`、`/tool/**` 等经网关转发 |
| 登录接口 | `POST /auth/login` | 网关 `StripPrefix=1` → auth 服务 `/login` |
| 客户端ID | `e5cd7e4891bf95d1d19206ce24a7b32e` | 与后端 `sys_client` 表 pc 端一致 |
| 授权类型 | `password` | |
| 默认管理员 | `admin` / `admin123` | 注意不是 123456（哈希已比对确认） |
| Token 头 | `Authorization: Bearer <access_token>` | sa-token `token-name: Authorization` |
| clientId 头 | 请求需带 `clientid: e5cd7e4891bf95d1d19206ce24a7b32e` | 网关 AuthFilter 校验 token 与 clientId 匹配，否则 401 |
| 接口加密 | RSA（前端公钥 ↔ 后端私钥） | 前端 `VITE_APP_RSA_PUBLIC_KEY` 与后端 `application-common.yml` 的 `api-decrypt.privateKey` 对应公钥**完全一致**，开箱兼容 |
| 验证码 | 默认开启（math） | 登录需先 `GET /auth/code` 取 uuid+img，前端识别后随登录提交 |

### 实测通过的端到端链路（2026-10-01）
```
POST /auth/login (admin/admin123, clientId=pc)  → 200, 返回 access_token(JWT)
GET  /system/role/list  (Authorization: Bearer <token>, clientid: <pc>) → 200, 返回 3 个角色
无 token → 401「未能读取到有效 token」
错 token → 401「token 无效」
缺 clientid → 401「客户端ID与Token不匹配」
```

## 二、微服务拆分方案（单体版 → 本工程）

官方 uni-app 单体版按本地 `request` 直连单体后端。融入本工程后改为**统一走网关**，并按业务域拆分：

| 业务域 | 网关路由 | 对应微服务 |
|---|---|---|
| 认证/登录 | `/auth/**` | ruoyi-auth |
| 系统/用户/角色/部门/菜单/字典 | `/system/**`、`/monitor/**` | ruoyi-system |
| 代码生成 | `/tool/**` | ruoyi-gen |
| 资源/短信/消息 | `/resource/**` | ruoyi-resource |
| AI 对话 | `/snail-ai/**` | ruoyi-ai |
| 工作流 | `/workflow/**`、`/warm-flow/**` | ruoyi-workflow |
| 定时任务 | snailjob 控制台（独立） | ruoyi-snailjob-server |

拆分动作：
1. 将单体版 `api/` 模块按上表映射到网关路由前缀（去掉本地 baseUrl 硬编码）。
2. 登录/鉴权复用本工程 `ruoyi-auth`（SaToken），前端 `clientid` 头与 token 一起携带。
3. 字典、部门、菜单等原本单体直连的接口统一改为 `/system/**` 经网关。

## 三、待办（需官方源码）

- [ ] 用户提供 `RuoYi-Plus-Uniapp` 可用仓库地址 / gitee 凭证
- [ ] 克隆源码入本目录，按上表替换 baseUrl 为网关地址
- [ ] `pnpm install && pnpm dev:h5` 验证登录→菜单闭环
- [ ] 按业务域拆分 api 层，提交到本工程 git
