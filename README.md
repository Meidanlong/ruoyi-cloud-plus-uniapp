# ruoyi-cloud-plus-uniapp

> 基于 Dromara **RuoYi-Cloud-Plus `6.0.0`** 微服务权限框架整合而成的全栈项目：在官方后端之上补齐 **PC 前端（plus-ui）、移动端（ruoyi-uniapp）、AI 中台（Snail AI）与 Docker 全栈编排**，形成可直接本地一键拉起的企业级应用基座。
>
> 本项目为派生 / 整合工程，并非官方仓库。官方营销内容与功能差异对照表已从本文档移除，仅保留[官方文档链接](#参考)供查阅。

---

## 1. 项目定位与整合内容

| 维度 | 整合内容 |
|------|----------|
| 基座 | RuoYi-Cloud-Plus 6.0.0（Spring Boot 4.1.1 / Java 21 微服务权限框架） |
| PC 前端 | plus-ui（Vue3 + ElementPlus，6.X-Vue 分支），Vite 代理直连网关 |
| 移动端 | ruoyi-uniapp（自建 Vue3 + Vite + Pinia，RSA+AES 加密登录，对齐 Cloud-Plus 鉴权模型） |
| AI 中台 | Snail AI（gRPC Server 端 + 客户端 starter，支持多模型 / Agent 编排 / RAG） |
| 部署 | Docker Compose 全栈编排：6 中间件 + 13 应用服务 |
| 代码生成 | 官方 ruoyi-gen 模块（保留） |

> 与官方仓库的核心区别：官方仅提供后端单体 + 文档；本项目额外交付了**前端、移动端、AI 接入与完整容器化编排**，并已本地端到端验证（登录鉴权、加密链路、服务注册全绿）。

## 2. 技术栈与版本

| 类别 | 选型 |
|------|------|
| 后端 | Spring Boot **4.1.1** / Java **21**（兼容 JDK 25）/ SaToken + JWT |
| 注册/配置中心 | Nacos **2.4.3**（standalone） |
| 缓存 | Redis 7（Redisson） |
| 数据库 | MySQL 8.0（ry-cloud） |
| 分布式事务 | Seata 2.4.0 |
| 文件存储 | MinIO（自建镜像） |
| 消息队列 | Kafka 3.7.1（KRaft 单节点，免 ZooKeeper） |
| RPC | Apache Dubbo 3.x |
| 前端 | plus-ui（Vue3 + ElementPlus，6.X-Vue 分支）/ ruoyi-uniapp（Vue3 + Vite + Pinia） |
| AI | Snail AI（`com.aizuda` 系列 starter，非 Spring AI Alibaba） |
| 容器运行时 | Docker ≥ 24 / Docker Compose v2 |

## 3. 架构总览

```mermaid
flowchart TB
  subgraph Client["客户端"]
    PC["plus-ui (Vue3) :80"]
    APP["ruoyi-uniapp (Vue3+Vite) :5173"]
  end
  GW["ruoyi-gateway :8080"]
  subgraph Core["核心链路 (docker-compose.app.yml)"]
    AUTH["ruoyi-auth"]
    SYS["ruoyi-system"]
  end
  subgraph Modules["扩展模块 (docker-compose.modules.yml)"]
    GEN["ruoyi-gen"] JOBS["ruoyi-job"] RES["ruoyi-resource"]
    WF["ruoyi-workflow"] AI["ruoyi-ai"] DEMO["ruoyi-demo"]
    TMQ["ruoyi-test-mq"] MON["ruoyi-monitor"]
    SJ["ruoyi-snailjob-server"] SAI["ruoyi-snailai-server (gRPC)"]
  end
  subgraph MW["中间件 (docker_ruoyi-net)"]
    NAC["Nacos :18848"] MY["MySQL :3307"] RD["Redis :6379"]
    MN["MinIO :9000"] SEA["Seata :7091"] KF["Kafka :9092"]
  end
  Client -->|/dev-api| GW
  GW --> Core
  GW --> Modules
  Core --> MW
  Modules --> MW
```

- 网络：所有容器接入 `docker_ruoyi-net`（bridge），业务服务通过容器名（如 `ruoyi-mysql:3306`、`ruoyi-nacos:8848`）互访。
- 编排文件：`script/docker/docker-compose.ruoyi.yml`（中间件）、`docker-compose.app.yml`（核心链路）、`docker-compose.modules.yml`（扩展模块）。
- 应用镜像：`script/docker/app.Dockerfile`（基于 `eclipse-temurin:21-jre`，构建参数 `JAR_PATH` 指定 jar 路径）。

## 4. 目录结构（关键路径）

```
ruoyi-cloud-plus-uniapp/
├── script/docker/                # 本地 Docker 编排与配置
│   ├── docker-compose.ruoyi.yml   # 中间件栈（mysql/nacos/redis/minio/seata/kafka）
│   ├── docker-compose.app.yml     # 核心链路（gateway/auth/system）
│   ├── docker-compose.modules.yml # 扩展模块（10 个 service）
│   ├── app.Dockerfile             # 应用镜像
│   ├── minio.Dockerfile           # MinIO 自建镜像
│   └── nacos-config/              # Nacos 配置（application-common / ruoyi-gateway / ruoyi-ai ...）
├── ruoyi-modules/ruoyi-ai/        # AI 模块（SnailAiController）
├── ruoyi-visual/ruoyi-snailai-server/  # Snail AI gRPC Server 端
├── ruoyi-common/ruoyi-common-ai/ # Snail AI 客户端 starter 封装
├── ruoyi-common/ruoyi-common-mcp/ # Spring AI MCP server/client
├── ruoyi-uniapp/                  # 移动端工程（Vue3 + Vite，加密登录）
└── script/sql/                    # 初始化 SQL（ry-cloud / ry-ai 等）
../ruoyi-cloud-plus-uniapp-ui/     # PC 前端（plus-ui，6.X-Vue，与后端同级）
```

## 5. 环境要求

- **Docker / Docker Compose v2**：本地全栈编排基于 Compose v2（编排文件见 `script/docker/`）。
- **Java 21 + Maven 3.8+**：用于本地 `mvn` 构建后端 jar（镜像构建需要 `target/*.jar`）。
- **Node 22 + pnpm 10**：用于前端/移动端依赖安装与运行。
- **资源建议**：宿主机内存 ≥16G（Nacos/Seata 较吃内存）；确保磁盘充足，中间件数据持久化于卷。

## 6. 快速开始

```bash
# 1) 启动中间件（mysql/nacos/redis/minio/seata/kafka）
docker compose -f script/docker/docker-compose.ruoyi.yml up -d

# 2) 初始化：导入 Nacos 配置（script/docker/nacos-config/）+ 执行 script/sql 初始化 SQL
#    Nacos 控制台: http://localhost:18848/nacos  (默认 nacos/nacos)

# 3) 构建后端 jar（需要 Java21+Maven）
mvn clean package -DskipTests

# 4) 启动核心链路（gateway :8080 / auth / system）
docker compose -f script/docker/docker-compose.app.yml up -d

# 5) 启动扩展模块（gen/job/resource/workflow/ai/demo/test-mq/monitor/snailjob-server/snailai-server）
docker compose -f script/docker/docker-compose.modules.yml up -d

# 6) 查看健康状态
docker ps --format '{{.Names}}\t{{.Status}}'
```

启动后访问：

| 服务 | 地址 | 说明 |
|------|------|------|
| 网关（API 入口） | http://localhost:8080 | 所有后端接口统一入口 |
| Nacos 控制台 | http://localhost:18848/nacos | 配置/服务治理 |
| PC 前端 plus-ui | http://localhost:80 | 需另起 dev server（见第 8 节） |
| 移动端 uni-app | http://localhost:5173 | `pnpm dev:web`（见第 8 节） |
| MinIO 控制台 | http://localhost:9001 | 文件存储（bucket: `snail-ai`） |

## 7. 默认账号与鉴权要点

- **管理员账号**：`admin` / **`admin123`**（非 123456，已 bcrypt 比对确认）。
- **PC 端 clientId**：`e5cd7e4891bf95d1d19206ce24a7b32e`（登录请求体需带 `clientId` + `grantType`，`TokenController` 从 `LoginBody` 读取）。
- **登录鉴权链**：`POST /auth/login`（网关 `/auth/**`）→ 返回 `access_token`；后续请求需
  `Authorization: Bearer <token>` + `clientid` 请求头，否则 401。
- **请求加密**：`/auth/login` 标注 `@ApiEncrypt`，前端必须 RSA+AES 加密请求体；响应默认明文（仅请求加密）。
  前端 RSA 公钥、clientId 与后端（`ruoyi-common-encrypt` + Nacos）完全一致。
- 验证码默认开启（`captcha.enabled=true`）。

## 8. 前端与移动端

### 8.1 PC 前端（plus-ui，Vue3 + ElementPlus）
- 仓库：`../ruoyi-cloud-plus-uniapp-ui`（官方 `JavaLionLi/plus-ui` 6.X-Vue 分支）。
- 运行：`pnpm install && pnpm dev`（dev server 默认 `:80`）。
- 代理：`vite.config` 中 `/dev-api` → `http://localhost:8080`（gateway），RSA/clientId 已与后端对齐，开箱兼容。

### 8.2 移动端（ruoyi-uniapp，Vue3 + Vite + Pinia）
- 仓库：本仓库 `ruoyi-uniapp/`（原生 uni-app 工程，跨端编译用 HBuilderX / `@dcloudio/uvm`）。
- 运行（纯 Vite H5 回退，可浏览器实跑）：
  ```bash
  cd ruoyi-uniapp && pnpm install
  pnpm dev:web        # http://localhost:5173，登录页显示验证码，输入即登录
  pnpm verify         # 离线加密登录往返验证（对照后端 ruoyi-common-encrypt 源码）
  ```
- 加解密、clientId、网关路由 100% 对照后端源码实现；`src/config.js` 的 `BASE_API` 改可达网关地址即可真机/小程序/App 接入。
- 说明：官方 `RuoYi-Plus-Uniapp` 仓库当前匿名不可拉取且面向单体版，故自建原生 uni-app 工程对齐 Cloud-Plus 鉴权模型。

## 9. 能力说明

### 9.1 通用后台能力（官方框架）
用户/部门/角色/菜单/字典/参数/日志/文件/代码生成/定时任务/服务监控等标准权限管理全套；
RPC（Dubbo）、分布式事务（Seata）、多数据源、数据权限/脱敏/加解密/翻译、WebSocket/SSE 等。

### 9.2 AI 中台（Snail AI）— 本仓库重点
- **定位**：企业级 AI Agent 平台（aizuda，Apache 2.0），构建于 Spring AI 2.0 之上；
  **不是 Spring AI Alibaba**（全仓库无 `spring-ai-alibaba` 依赖）。
- **组成**：`ruoyi-common-ai`（客户端 starter：`snail-ai-agent-chat/-executor/-openapi`）+
  `ruoyi-ai`（SnailAiController，OpenAPI 用户注册）+ `ruoyi-snailai-server`（gRPC Server 端）。
- **能力**：多模型接入（GPT/Claude/Ollama/通义等）、Agent 编排与多 Agent 协作、RAG 知识库
  （Milvus/ES/PgVector）、长期记忆、Skill 体系、MCP 工具接入；支持业务内嵌 Starter（数据不出域）。
- **路由**：网关 `Path=/snail-ai/**` → `ruoyi-ai`；Agent 的模型/知识库/工具/编排在 Snail AI Admin 后台配置。
- **想用通义千问**：在 Snail AI 后台把模型 provider 切到阿里系即可，后端零改动。

### 9.3 其他扩展
- **MCP**：`ruoyi-common-mcp` 引入 Spring AI 的 `spring-ai-starter-mcp-server-webmvc` + `mcp-client`。
- **工作流**：WarmFlow（网关 `/warm-flow/**`）。
- **任务调度**：SnailJob（`ruoyi-snailjob-server`）。
- **消息**：Kafka（满足 `ruoyi-test-mq` 消息队列依赖）。

## 10. 网关路由表（入口 :8080）

| 路径前缀 | 目标服务 | 说明 |
|----------|----------|------|
| `/auth/**` | ruoyi-auth | 认证（登录/登出/验证码） |
| `/tool/**` | ruoyi-gen | 代码生成 |
| `/system/**`、`/monitor/**` | ruoyi-system | 系统模块 + 监控 |
| `/resource/**` | ruoyi-resource | 资源（短信/文件） |
| `/snail-ai/**` | ruoyi-ai | AI 中台 |
| `/workflow/**`、`/warm-flow/**` | ruoyi-workflow | 工作流 |
| `/demo/**` | ruoyi-demo | 演示 |
| `/test-mq/**` | ruoyi-test-mq | MQ 演示 |

## 11. 已知事项与排坑

- **`ruoyi-test-mq` 启动崩溃**：Spring Boot 4.1.1 下 `KafkaTemplate` bean 未自动装配（demo 代码级问题），
  基础设施无法解；其余 12 个应用均正常注册 healthy。
- **镜像选择（已固化于 compose）**：Kafka 用 `apache/kafka:3.7.1`（KRaft 单节点），MinIO 用本地 `minio.Dockerfile` 自建，
  均已在 `script/docker/` 编排文件中定稿，直接 `up` 即可。
- **Nacos 就绪端点**：2.4.3 为 `/nacos/v1/console/health/readiness`（旧端点已移除）。
- **资源**：建议宿主机内存 ≥16G，否则中间件（尤其 Nacos/Seata）起不来或极慢。

## 12. Git 状态

- 当前分支 `6.X`，派生自官方 `dromara/RuoYi-Cloud-Plus`（只读上游）。
- **本地领先 `origin/6.X` 共 10 个 commit**：
  `d7c7ea4`（docs: README 标题与开篇立起项目名 ruoyi-cloud-plus-uniapp）、`ba41b11`（docs: README Git 状态段 commit 计数补正为 7）、`033d371`（docs: README 重写为整合项目定位，去除与官方 ruoyi-cloud-plus 高度相似内容）、`9959ab4`（docs: README Git 状态段领先计数补正为 6 commit）、`6556c8e`（docs: README 去除本机环境特殊性，统一为通用 Docker 部署描述）、`5cce9f7`（docs: 完善根 README，新增本地化部署指南）、`e42cac8`（feat(uniapp): 接入 RuoYi-Cloud-Plus 移动端实现加密登录与鉴权链路）、`b2e7c22`（chore(docker): 扩展后端全栈 + 补 Kafka 中间件）、`be2e4dd`（chore(docker): 提交 Docker 化运行基础设施）、`917d3b1`（rebase: 统一工程坐标 + 移除 fastjson 1.x）。
- `origin` 为官方 dromara 只读，`git push` 会被 403 拒绝；**推远程需先 fork 到可写地址**，再 `git remote set-url origin <你的fork>` 后推送。

---

## 参考

- 官方文档：[plus-doc.dromara.org](https://plus-doc.dromara.org)
- 官方仓库（派生上游，只读）：[dromara/RuoYi-Cloud-Plus](https://gitee.com/dromara/RuoYi-Cloud-Plus)
