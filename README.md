<img src="https://foruda.gitee.com/images/1679673780944866919/d908a86f_1766278.png" width="56%" height="56%">
<div style="height: 10px; clear: both;"></div>

- - -
## 平台简介

[![码云Gitee](https://gitee.com/dromara/RuoYi-Cloud-Plus/badge/star.svg?theme=blue)](https://gitee.com/dromara/RuoYi-Cloud-Plus)
[![GitHub](https://img.shields.io/github/stars/dromara/RuoYi-Cloud-Plus?style=social&label=Github%20Stars)](https://github.com/dromara/RuoYi-Cloud-Plus)
[![Star](https://gitcode.com/dromara/RuoYi-Cloud-Plus/star/badge.svg)](https://gitcode.com/dromara/RuoYi-Cloud-Plus)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](https://gitee.com/dromara/RuoYi-Cloud-Plus/blob/6.X/LICENSE)
<br>
[![RuoYi-Cloud-Plus](https://img.shields.io/badge/RuoYi_Cloud_Plus-6.0.0-success.svg)](https://gitee.com/dromara/RuoYi-Cloud-Plus)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.1-blue.svg)]()
[![JDK-21](https://img.shields.io/badge/JDK-21-green.svg)]()
[![JDK-25](https://img.shields.io/badge/JDK-25-green.svg)]()

> Dromara RuoYi-Cloud-Plus `微服务通用权限管理系统` 重写 RuoYi-Cloud 全方位升级(不兼容原框架)

> 项目代码、文档 均开源免费可商用 遵循开源协议在项目中保留开源协议文件即可<br>
活到老写到老 为兴趣而开源 为学习而开源 为让大家真正可以学到技术而开源

> 系统演示: [传送门](https://plus-doc.dromara.org/#/common/demo_system)

> 官方前端项目地址: 基于 Vue + ElementPlus 版本前端项目 [gitee](https://gitee.com/JavaLionLi/plus-ui) - [github](https://github.com/CrazyLionCat/plus-ui) - [gitcode](https://gitcode.com/dromara/plus-ui)<br>
> 官方前端项目地址: 基于 React + Ant Design 版本前端项目 [plus-ui-react](https://gitee.com/JavaLionLi/plus-ui/tree/6.X-React/)
> 成员前端项目地址: 基于vben5 [ruoyi-plus-vben5](https://gitee.com/dapppp/ruoyi-plus-vben5)<br>
> 成员前端项目地址: 基于soybean [ruoyi-plus-soybean](https://gitee.com/xlsea/ruoyi-plus-soybean)<br>
> 成员项目地址: 删除多租户与工作流 [RuoYi-Vue-Plus-Single](https://gitee.com/ColorDreams/RuoYi-Vue-Plus-Single)<br>

> 文档地址: [plus-doc](https://plus-doc.dromara.org) 国内加速: [plus-doc.top](https://plus-doc.top)

---

# 本仓库本地化部署指南（Docker）

> 本仓库 = **Dromara RuoYi-Cloud-Plus `6.0.0`** 的本地化 Fork：在官方单体后端之上，补齐了
> **Docker 全栈编排**、**PC 前端（plus-ui）**、**移动端（uni-app 加密登录）** 与
> **AI 中台（Snail AI）** 的接入。下方是本地快速使用、架构与能力的完整说明。
> 官方功能/业务差异对照表见文末，仍适用。

## 1. 技术栈与版本

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

## 2. 架构总览

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

## 3. 目录结构（关键路径）

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

## 4. 环境要求

- **Docker / Docker Compose v2**：本地全栈编排基于 Compose v2（编排文件见 `script/docker/`）。
- **Java 21 + Maven 3.8+**：用于本地 `mvn` 构建后端 jar（镜像构建需要 `target/*.jar`）。
- **Node 22 + pnpm 10**：用于前端/移动端依赖安装与运行。
- **资源建议**：宿主机内存 ≥16G（Nacos/Seata 较吃内存）；确保磁盘充足，中间件数据持久化于卷。

## 5. 快速开始

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
| PC 前端 plus-ui | http://localhost:80 | 需另起 dev server（见第 7 节） |
| 移动端 uni-app | http://localhost:5173 | `pnpm dev:web`（见第 7 节） |
| MinIO 控制台 | http://localhost:9001 | 文件存储（bucket: `snail-ai`） |

## 6. 默认账号与鉴权要点

- **管理员账号**：`admin` / **`admin123`**（非 123456，已 bcrypt 比对确认）。
- **PC 端 clientId**：`e5cd7e4891bf95d1d19206ce24a7b32e`（登录请求体需带 `clientId` + `grantType`，`TokenController` 从 `LoginBody` 读取）。
- **登录鉴权链**：`POST /auth/login`（网关 `/auth/**`）→ 返回 `access_token`；后续请求需
  `Authorization: Bearer <token>` + `clientid` 请求头，否则 401。
- **请求加密**：`/auth/login` 标注 `@ApiEncrypt`，前端必须 RSA+AES 加密请求体；响应默认明文（仅请求加密）。
  前端 RSA 公钥、clientId 与后端（`ruoyi-common-encrypt` + Nacos）完全一致。
- 验证码默认开启（`captcha.enabled=true`）。

## 7. 前端与移动端

### 7.1 PC 前端（plus-ui，Vue3 + ElementPlus）
- 仓库：`../ruoyi-cloud-plus-uniapp-ui`（官方 `JavaLionLi/plus-ui` 6.X-Vue 分支）。
- 运行：`pnpm install && pnpm dev`（dev server 默认 `:80`）。
- 代理：`vite.config` 中 `/dev-api` → `http://localhost:8080`（gateway），RSA/clientId 已与后端对齐，开箱兼容。

### 7.2 移动端（ruoyi-uniapp，Vue3 + Vite + Pinia）
- 仓库：本仓库 `ruoyi-uniapp/`（原生 uni-app 工程，跨端编译用 HBuilderX / `@dcloudio/uvm`）。
- 运行（纯 Vite H5 回退，可浏览器实跑）：
  ```bash
  cd ruoyi-uniapp && pnpm install
  pnpm dev:web        # http://localhost:5173，登录页显示验证码，输入即登录
  pnpm verify         # 离线加密登录往返验证（对照后端 ruoyi-common-encrypt 源码）
  ```
- 加解密、clientId、网关路由 100% 对照后端源码实现；`src/config.js` 的 `BASE_API` 改可达网关地址即可真机/小程序/App 接入。
- 说明：官方 `RuoYi-Plus-Uniapp` 仓库当前匿名不可拉取且面向单体版，故自建原生 uni-app 工程对齐 Cloud-Plus 鉴权模型。

## 8. 能力说明

### 8.1 通用后台能力（官方框架，文末有对照表）
用户/部门/角色/菜单/字典/参数/日志/文件/代码生成/定时任务/服务监控等标准权限管理全套；
RPC（Dubbo）、分布式事务（Seata）、多数据源、数据权限/脱敏/加解密/翻译、WebSocket/SSE 等。

### 8.2 AI 中台（Snail AI）— 本仓库重点
- **定位**：企业级 AI Agent 平台（aizuda，Apache 2.0），构建于 Spring AI 2.0 之上；
  **不是 Spring AI Alibaba**（全仓库无 `spring-ai-alibaba` 依赖）。
- **组成**：`ruoyi-common-ai`（客户端 starter：`snail-ai-agent-chat/-executor/-openapi`）+
  `ruoyi-ai`（SnailAiController，OpenAPI 用户注册）+ `ruoyi-snailai-server`（gRPC Server 端）。
- **能力**：多模型接入（GPT/Claude/Ollama/通义等）、Agent 编排与多 Agent 协作、RAG 知识库
  （Milvus/ES/PgVector）、长期记忆、Skill 体系、MCP 工具接入；支持业务内嵌 Starter（数据不出域）。
- **路由**：网关 `Path=/snail-ai/**` → `ruoyi-ai`；Agent 的模型/知识库/工具/编排在 Snail AI Admin 后台配置。
- **想用通义千问**：在 Snail AI 后台把模型 provider 切到阿里系即可，后端零改动。

### 8.3 其他扩展
- **MCP**：`ruoyi-common-mcp` 引入 Spring AI 的 `spring-ai-starter-mcp-server-webmvc` + `mcp-client`。
- **工作流**：WarmFlow（网关 `/warm-flow/**`）。
- **任务调度**：SnailJob（`ruoyi-snailjob-server`）。
- **消息**：Kafka（满足 `ruoyi-test-mq` 消息队列依赖）。

## 9. 网关路由表（入口 :8080）

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

## 10. 已知事项与排坑

- **`ruoyi-test-mq` 启动崩溃**：Spring Boot 4.1.1 下 `KafkaTemplate` bean 未自动装配（demo 代码级问题），
  基础设施无法解；其余 12 个应用均正常注册 healthy。
- **镜像选择（已固化于 compose）**：Kafka 用 `apache/kafka:3.7.1`（KRaft 单节点），MinIO 用本地 `minio.Dockerfile` 自建，
  均已在 `script/docker/` 编排文件中定稿，直接 `up` 即可。
- **Nacos 就绪端点**：2.4.3 为 `/nacos/v1/console/health/readiness`（旧端点已移除）。
- **资源**：建议宿主机内存 ≥16G，否则中间件（尤其 Nacos/Seata）起不来或极慢。

## 11. Git 状态

- 当前分支 `6.X`，**本地领先 `origin/6.X` 共 5 个 commit**：
  `5cce9f7`（完善根 README）、`e42cac8`（uni-app 接入）、`b2e7c22`（后端全栈 + Kafka）、`be2e4dd`（Docker 基础设施）、`917d3b1`（工程坐标统一 + 移除 fastjson 1.x）。
- `origin` 指向官方 `dromara/RuoYi-Cloud-Plus`（**只读**），`git push` 会被 403 拒绝。
- **推远程需先 fork 到可写地址**，再 `git remote set-url origin <你的fork>` 后推送。

---

## 赞助商

MaxKey 业界领先单点登录产品 - https://gitee.com/dromara/MaxKey <br>
CCFlow 驰聘低代码-流程-表单 - https://gitee.com/opencc/RuoYi-JFlow <br>
数舵科技 软件定制开发APP小程序等 - https://www.shuduokeji.com/ <br>
Mall4J 高质量Java商城系统 - https://www.mall4j.com/cn/?statId=11 <br>
aizuda flowlong 工作流 - https://gitee.com/aizuda/flowlong <br>
Ruoyi-Plus-Uniapp - https://ruoyi.plus <br>
Topiam IAM/IDaaS身份管理平台 - https://www.topiam.cn/ <br>
稳定低价的大模型中转站 - https://aicodelink.top/register?aff=pHeG <br>

[如何成为赞助商 加群联系作者详谈 每日PV2500-3000 IP1700-2500](https://plus-doc.dromara.org/#/common/add_group)

# 本框架与RuoYi的功能差异

| 功能          | 本框架                                                                                                               | RuoYi                                                                              |
|-------------|-------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------|
| 前端项目        | 采用 Vue3 + TS + ElementPlus 重写                                                                                     | 基于Vue2/Vue3 + JS                                                                   | 
| 后端项目结构      | 采用插件化 + 扩展包形式 结构解耦 易于扩展                                                                                           | 模块相互注入耦合严重难以扩展                                                                     | 
| 后端代码风格      | 参考 Alibaba 规范与项目统一配置的代码格式化                                                                                        | 代码书写与常规结构不同阅读障碍大                                                                   |
| 分布式注册中心     | 采用 Alibaba Nacos                                                                                                  | 采用 Alibaba Nacos                                                                   | 
| 分布式配置中心     | 采用 Alibaba Nacos                                                                                                  | 采用 Alibaba Nacos                                                                   | 
| 服务网关        | 采用 SpringCloud Gateway 框架扩展了多种功能<br/>例如:内网鉴权、请求体缓存、跨域配置、请求响应日志等                                                   | 采用 SpringCloud Gateway                                                             | 
| 负载均衡        | 采用 SpringCloud Loadbalancer 扩展支持了开发团队路由 便于多团队开发调试                                                                 | 采用 SpringCloud Loadbalancer                                                        |
| RPC远程调用     | 采用 全新 Apache Dubbo 3.X 历史悠远不用多说                                                                                   | 采用 feign 功能有限编写方式 网络波动大 不稳定                                                        | 
| 分布式事务       | 采用 Apache Seata                                                                                                   | 采用 Apache Seata                                                                    |
| Web容器       | 采用 Jetty 基于 Netty 的高性能容器                                                                                          | 采用 Tomcat                                                                          |
| 权限认证        | 采用 Sa-Token、Jwt 静态使用功能齐全 低耦合 高扩展                                                                                  | Spring Security 配置繁琐扩展性极差                                                          |
| 权限注解        | 采用 Sa-Token 支持注解 登录校验、角色校验、权限校验、二级认证校验、HttpBasic校验、忽略校验<br/>角色与权限校验支持多种条件 如 `AND` `OR` 或 `权限 OR 角色` 等复杂表达式        | 只支持是否存在匹配                                                                          |
| 关系数据库支持     | 原生支持 MySQL、Oracle、PostgreSQL、SQLServer<br/>可同时使用异构切换(支持其他 mybatis-plus 支持的所有数据库 只需要增加jdbc依赖即可使用 达梦金仓等均有成功案例)      | 支持 Mysql、Oracle 不支持同时使用、不支持异构切换                                                    |
| 缓存数据库       | 支持 Redis >= 6 支持大部分新功能特性 如 分布式限流、分布式队列                                                                            | Redis 简单 get set 支持                                                                |
| Redis客户端    | 采用 Redisson Redis官方推荐 基于Netty的客户端工具<br/>支持Redis 90%以上的命令 底层优化规避很多不正确的用法 例如: keys被转换为scan<br/>支持单机、哨兵、单主集群、多主集群等模式 | Lettuce + RedisTemplate 支持模式少 工具使用繁琐<br/>连接池采用 common-pool Bug多经常性出问题              |
| 缓存注解        | 采用 Spring-Cache 注解 对其扩展了实现支持了更多功能<br/>例如 过期时间 最大空闲时间 组最大长度等 只需一个注解即可完成数据自动缓存                                      | 需手动编写Redis代码逻辑                                                                     |
| ORM框架       | 采用 Mybatis-Plus 基于对象几乎不用写SQL全java操作 功能强大插件众多<br/>例如多租户插件 分页插件 乐观锁插件等等                                             | 采用 Mybatis 基于XML需要手写SQL                                                            |
| SQL监控       | 内置 MyBatis 完整 SQL 输出工具，可输出完整SQL、Mapper ID与执行时间监控                                                                  | log输出 需手动拼接sql与参数无法快速查看调试问题                                                        |
| 数据分页        | 采用 Mybatis-Plus 分页插件<br/>框架对其进行了扩展 对象化分页对象 支持多种方式传参 支持前端多排序 复杂排序                                                  | 采用 PageHelper 仅支持单查询分页 参数只能从param传 只能单排序 功能扩展性差 体验不好                               |
| 数据权限        | 采用 Mybatis-Plus 插件 自行分析拼接SQL 无感式过滤<br/>只需为Mapper设置好注解条件 支持多种自定义 不限于部门角色                                           | 采用 注解+aop 实现 基于部门角色 生成的sql兼容性差 不支持其他业务扩展<br/>生成sql后需手动拼接到具体业务sql上 对于多个Mapper查询不起作用 |
| 数据脱敏        | 采用 注解 + jackson 序列化期间脱敏 支持不同模块不同的脱敏条件<br/>支持多种策略 如身份证、手机号、地址、邮箱、银行卡等 可自行扩展                                        | 无                                                                                  |
| 数据加解密       | 采用 注解 + mybatis 拦截器 对存取数据期间自动加解密<br/>支持多种策略 如BASE64、AES、RSA、SM2、SM4等                                              | 无                                                                                  |
| 数据翻译        | 采用 注解 + jackson 序列化期间动态修改数据 数据进行翻译<br/>支持多种模式: `映射翻译` `直接翻译` `其他扩展条件翻译` 接口化两步即可完成自定义扩展 内置多种翻译实现                   | 无                                                                                  |
| 多数据源框架      | 采用 dynamic-datasource 支持市面大部分数据库<br/>通过yml配置即可动态管理异构不同种类的数据库 也可通过前端页面添加数据源<br/>支持spel表达式从请求头参数等条件切换数据源            | 基于 druid 手动编写代码配置数据源 配置繁琐 支持性差                                                     |
| 多数据源事务      | 采用 dynamic-datasource 支持多数据源不同种类的数据库事务回滚                                                                          | 不支持                                                                                |
| 数据库连接池      | 采用 HikariCP Spring官方内置连接池 配置简单 以性能与稳定性闻名天下                                                                        | 采用 druid bug众多 社区维护差 活跃度低 配置众多繁琐性能一般                                               |
| 数据库主键       | 采用 雪花ID 基于时间戳的 有序增长 唯一ID 再也不用为分库分表 数据合并主键冲突重复而发愁                                                                  | 采用 数据库自增ID 支持数据量有限 不支持多数据源主键唯一                                                     |
| WebSocket协议 | 基于 Spring 封装的 WebSocket 协议 扩展了Token鉴权与分布式会话同步 不再只是基于单机的废物                                                         | 无                                                                                  |
| SSE推送       | 采用 Spring SSE 实现 扩展了Token鉴权与分布式会话同步                                                                               | 无                                                                                  |
| 序列化         | 采用 Jackson Spring官方内置序列化 靠谱!!!                                                                                    | 采用 fastjson bugjson 远近闻名                                                           | 
| 分布式幂等       | 参考美团GTIS防重系统简化实现(细节可看文档)                                                                                          | 手动编写注解基于aop实现                                                                      |
| 分布式任务调度     | 采用 SnailJob 天生支持分布式 统一的管理中心 支持多种数据库 支持分片重试DAG任务流等                                                                 | 采用 Quartz 基于数据库锁性能差 集群需要做很多配置与改造                                                   | 
| 分布式日志中心     | 采用 ELK 业界成熟解决方案 实时收集所有服务的运行日志 快速发现定位问题                                                                            | 无                                                                                  | 
| 分布式搜索引擎     | 采用 ElasticSearch、Easy-Es 以 Mybatis-Plus 方式操作 ElasticSearch                                                        | 无                                                                                  | 
| 分布式消息队列     | 采用 支持 Kafka、RocketMQ、RabbitMQ 各种 延迟消息 事务消息 流消息                                                                    | 无                                                                                  | 
| 分布式消息总线     | 采用 SpringCloud Bus 实现事件总线 跨服务通知 支持 Kafka、RocketMQ、RabbitMQ                                                        | 无                                                                                  |
| 分库分表功能      | 采用 Apache Sharding-Proxy 代理服务无入侵支持分库分表 只需编写分库分表规则即可                                                               | 无                                                                                  |
| 文件存储        | 采用 Minio、RustFS 等分布式文件存储 天生支持多机、多硬盘、多分片、多副本存储<br/>支持权限管理 安全可靠 文件可加密存储                                             | 采用 本机文件存储 文件裸漏 易丢失泄漏 不支持集群有单点效应                                                    |
| 云存储         | 采用 AWS S3 协议客户端 支持 七牛、阿里、腾讯 等一切支持S3协议的厂家                                                                          | 不支持                                                                                |
| 短信          | 支持 阿里、腾讯 只需在yml配置好厂家密钥即可使用 接口化支持扩展其他厂家                                                                            | 不支持                                                                                |
| 邮件          | 采用 mail-api 通用协议支持大部分邮件厂商                                                                                         | 不支持                                                                                |
| 接口文档        | 采用 SpringDoc、javadoc 无注解零入侵基于java注释<br/>只需把注释写好 无需再写一大堆的文档注解了                                                     | 采用 Springfox 已停止维护 需要编写大量的注解来支持文档生成                                                | 
| 校验框架        | 采用 Validation 支持注解与工具类校验 注解支持国际化                                                                                  | 仅支持注解 且注解不支持国际化                                                                    |
| Excel框架     | 采用 Apache Fesod(原Alibaba EasyExcel) 基于插件化<br/>框架对其增加了很多功能 例如 自动合并相同内容 自动排列布局 字典翻译等                                | 基于 POI 手写实现 功能有限 复杂 扩展性差                                                           |
| 工作流支持       | 采用 WarmFlow 支持各种复杂审批 转办 委派 加减签 会签 或签 票签 等功能                                                                       | 无                                                                                  |
| 工具类框架       | 采用 Hutool、Lombok 上百种工具覆盖90%的使用需求 基于注解自动生成 get set 等简化框架大量代码                                                       | 手写工具稳定性差易出问题 工具数量有限 代码臃肿需自己手写 get set 等                                            | 
| 服务监控框架      | 采用 SpringBoot-Admin 基于SpringBoot官方 actuator 探针机制<br/>实时监控服务状态 框架还为其扩展了在线日志查看监控                                    | 无                                                                                  | 
| 全方位监控报警     | 采用 Prometheus、Grafana 多样化采集 多模板大屏展示 实时报警监控 提供详细的搭建文档                                                              | 无                                                                                  | 
| 链路追踪        | 采用 Apache SkyWalking 还在为请求不知道去哪了 到哪出了问题而烦恼吗<br/>用了它即可实时查看请求经过的每一处每一个节点                                            | 无                                                                                  |
| 代码生成器       | 只需设计好表结构 一键生成所有crud代码与页面<br/>降低80%的开发量 把精力都投入到业务设计上<br/>框架为其适配MP、SpringDoc规范化代码 同时支持动态多数据源代码生成                    | 代码生成原生结构 只支持单数据源生成                                                                 |
| 部署方式        | 支持 Docker 编排 一键搭建所有环境 让开发人员从此不再为搭建环境而烦恼                                                                           | 原生jar部署 其他环境需手动下载安装 自行搭建                                                           | 
| 项目路径修改      | 提供详细的修改方案文档 并为其做了一些改动 非常简单即可修改成自己想要的                                                                              | 需要做很多改造 文档说明有限                                                                     |
| 国际化         | 基于请求头动态返回不同语种的文本内容 开发难度低 有对应的工具类 支持大部分注解内容国际化                                                                     | 只提供基础功能 其他需自行编写扩展                                                                  |
| 代码单例测试      | 提供单例测试 使用方式编写方法与maven多环境单测插件                                                                                      | 只提供基础功能 其他需自行编写扩展                                                                  |
| Demo案例      | 提供框架功能的实际使用案例 单独一个模块提供了很多很全                                                                                       | 无                                                                                  |

## 本框架与RuoYi的业务差异

| 业务     | 功能说明                                                                 | 本框架 | RuoYi            |
|--------|----------------------------------------------------------------------|-----|------------------|
| 客户端管理  | 系统内对接的所有客户端管理 如: pc端、小程序端等<br>支持动态授权登录方式 如: 短信登录、密码登录等 支持动态控制token时效 | 支持  | 无                |
| 用户管理   | 用户的管理配置 如:新增用户、分配用户所属部门、角色、岗位等                                       | 支持  | 支持               |
| 部门管理   | 配置系统组织机构（公司、部门、小组） 树结构展现支持数据权限                                       | 支持  | 支持               |
| 岗位管理   | 配置系统用户所属担任职务                                                         | 支持  | 支持               |
| 菜单管理   | 配置系统菜单、操作权限、按钮权限标识等                                                  | 支持  | 支持               |
| 角色管理   | 角色菜单权限分配、设置角色按机构进行数据范围权限划分                                           | 支持  | 支持               |
| 字典管理   | 对系统中经常使用的一些较为固定的数据进行维护                                               | 支持  | 支持               |
| 参数管理   | 对系统动态配置常用参数                                                          | 支持  | 支持               |
| 通知公告   | 系统通知公告信息发布维护                                                         | 支持  | 支持               |
| 操作日志   | 系统正常操作日志记录和查询 系统异常信息日志记录和查询                                          | 支持  | 支持               |
| 登录日志   | 系统登录日志记录查询包含登录异常                                                     | 支持  | 支持               |
| 文件管理   | 系统文件展示、上传、下载、删除等管理                                                   | 支持  | 无                |
| 文件配置管理 | 系统文件上传、下载所需要的配置信息动态添加、修改、删除等管理                                       | 支持  | 无                |
| 在线用户管理 | 已登录系统的在线用户信息监控与强制踢出操作                                                | 支持  | 支持               |
| 定时任务   | 运行报表、任务管理(添加、修改、删除)、日志管理、执行器管理等                                      | 支持  | 仅支持任务与日志管理       |
| 代码生成   | 多数据源前后端代码的生成（java、html、xml、sql）支持CRUD下载                              | 支持  | 仅支持单数据源          |
| 系统接口   | 根据业务代码自动生成相关的api接口文档                                                 | 支持  | 支持               |
| 服务监控   | 监视集群系统CPU、内存、磁盘、堆栈、在线日志、Spring相关配置等                                  | 支持  | 仅支持单机CPU、内存、磁盘监控 |
| 缓存监控   | 对系统的缓存信息查询，命令统计等。                                                    | 支持  | 支持               |
| 使用案例   | 系统的一些功能案例                                                            | 支持  | 不支持              |

## 参考文档

使用框架前请仔细阅读文档重点注意事项
<br>
>[初始化项目 必看](https://plus-doc.dromara.org/#/ruoyi-cloud-plus/quickstart/init)
>>[https://plus-doc.dromara.org/#/ruoyi-cloud-plus/quickstart/init](https://plus-doc.dromara.org/#/ruoyi-cloud-plus/quickstart/init)
>
>[专栏与视频 入门必看](https://plus-doc.dromara.org/#/common/column)
>>[https://plus-doc.dromara.org/#/common/column](https://plus-doc.dromara.org/#/common/column)
>
>[部署项目 必看](https://plus-doc.dromara.org/#/ruoyi-cloud-plus/quickstart/deploy)
>>[https://plus-doc.dromara.org/#/ruoyi-cloud-plus/quickstart/deploy](https://plus-doc.dromara.org/#/ruoyi-cloud-plus/quickstart/deploy)
>
>[如何加群](https://plus-doc.dromara.org/#/common/add_group)
>>[https://plus-doc.dromara.org/#/common/add_group](https://plus-doc.dromara.org/#/common/add_group)
>
>[参考文档 Wiki](https://plus-doc.dromara.org)
>>[https://plus-doc.dromara.org](https://plus-doc.dromara.org)


## 软件架构图

![Plus部署架构图](https://foruda.gitee.com/images/1678980131147747524/5c2d5a5c_1766278.png "Plus部署架构图.png")

## 贡献代码

[参与贡献的方式 https://plus-doc.dromara.org/#/common/contribution](https://plus-doc.dromara.org/#/common/contribution)

## 捐献作者

作者为兼职做开源,平时还需要工作,如果帮到了您可以请作者吃个盒饭  
<img src="https://foruda.gitee.com/images/1678975784848381069/d8661ed9_1766278.png" width="300px" height="450px" />
<img src="https://foruda.gitee.com/images/1678975801230205215/6f96229d_1766278.png" width="300px" height="450px" />

## 演示图例

|                                                                                            |                                                                                            |
|--------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------|
| ![输入图片说明](https://foruda.gitee.com/images/1780299033689126697/868ef1ea_1766278.png "屏幕截图") | ![输入图片说明](https://foruda.gitee.com/images/1780299052163404649/8d94165d_1766278.png "屏幕截图") |
| ![输入图片说明](https://foruda.gitee.com/images/1780299074949590692/27f5bfb5_1766278.png "屏幕截图") | ![输入图片说明](https://foruda.gitee.com/images/1780299108816841231/619a7c57_1766278.png "屏幕截图") |
| ![输入图片说明](https://foruda.gitee.com/images/1780299089818500856/862ba805_1766278.png "屏幕截图") | ![输入图片说明](https://foruda.gitee.com/images/1780299173744267947/95cb0cd3_1766278.png "屏幕截图") |
| ![输入图片说明](https://foruda.gitee.com/images/1780299193694706123/28257dc1_1766278.png "屏幕截图") | ![输入图片说明](https://foruda.gitee.com/images/1780299147525013883/ebcd9dfe_1766278.png "屏幕截图") |
| ![输入图片说明](https://foruda.gitee.com/images/1780299220007761523/dc7e27c9_1766278.png "屏幕截图") | ![输入图片说明](https://foruda.gitee.com/images/1780299235966983519/35b047e1_1766278.png "屏幕截图") |
| ![输入图片说明](https://foruda.gitee.com/images/1780299250884681522/e5731314_1766278.png "屏幕截图") | ![输入图片说明](https://foruda.gitee.com/images/1780299267028602229/230d5428_1766278.png "屏幕截图") |
| ![输入图片说明](https://foruda.gitee.com/images/1780299293149732467/19abcf6c_1766278.png "屏幕截图") | ![输入图片说明](https://foruda.gitee.com/images/1780299311267192779/e665c668_1766278.png "屏幕截图") |
| ![输入图片说明](https://foruda.gitee.com/images/1780299327888096947/283a177f_1766278.png "屏幕截图") | ![输入图片说明](https://foruda.gitee.com/images/1780299348897579356/caac864e_1766278.png "屏幕截图") |
| ![输入图片说明](https://foruda.gitee.com/images/1780299376680669014/452585fb_1766278.png "屏幕截图") | ![输入图片说明](https://foruda.gitee.com/images/1780299843158459866/ceebbb63_1766278.png "屏幕截图") |
| ![输入图片说明](https://foruda.gitee.com/images/1780299432356918392/07abdf6a_1766278.png "屏幕截图") | ![输入图片说明](https://foruda.gitee.com/images/1780299465584172180/a2b2be12_1766278.png "屏幕截图") |
| ![输入图片说明](https://foruda.gitee.com/images/1780299491233431530/d88bfa35_1766278.png "屏幕截图") | ![输入图片说明](https://foruda.gitee.com/images/1780299513358913413/f2f90032_1766278.png "屏幕截图") |
| ![输入图片说明](https://foruda.gitee.com/images/1780299527419238776/549cb852_1766278.png "屏幕截图") | ![输入图片说明](https://foruda.gitee.com/images/1780299553918371792/43bd3bff_1766278.png "屏幕截图") |
| ![输入图片说明](https://foruda.gitee.com/images/1780299586662735625/1107a3ee_1766278.png "屏幕截图") | ![输入图片说明](https://foruda.gitee.com/images/1780299613342135530/526d7859_1766278.png "屏幕截图") |

