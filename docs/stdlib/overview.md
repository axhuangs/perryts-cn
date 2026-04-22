# 标准库概述

Perry 原生实现了许多流行的 npm 包和 Node.js API。当您导入受支持的包时，Perry 会将其编译为原生代码 — 不涉及 JavaScript 运行时。

## 工作原理

```typescript
import fastify from "fastify";
import mysql from "mysql2/promise";
```

Perry 在编译时识别这些导入，并将它们路由到 `perry-stdlib` crate 中的原生 Rust 实现。API 表面与原始 npm 包匹配，因此现有代码通常无需更改即可工作。

## 支持的包

### 网络与 HTTP
- **fastify** — HTTP 服务器框架
- **axios** — HTTP 客户端
- **node-fetch** / **fetch** — HTTP fetch API
- **ws** — WebSocket 客户端/服务器

### 数据库
- **mysql2** — MySQL 客户端
- **pg** — PostgreSQL 客户端
- **better-sqlite3** — SQLite
- **mongodb** — MongoDB 客户端
- **ioredis** / **redis** — Redis 客户端

### 密码学
- **bcrypt** — 密码哈希
- **argon2** — 密码哈希 (Argon2)
- **jsonwebtoken** — JWT 签名/验证
- **crypto** — Node.js crypto 模块
- **ethers** — 以太坊库

### 工具
- **lodash** — 工具函数
- **dayjs** / **moment** — 日期操作
- **uuid** — UUID 生成
- **nanoid** — ID 生成
- **slugify** — 字符串 slugification
- **validator** — 字符串验证

### CLI 与数据
- **commander** — CLI 参数解析
- **decimal.js** — 任意精度小数
- **bignumber.js** — 大数数学
- **lru-cache** — LRU 缓存

### 其他
- **sharp** — 图像处理
- **cheerio** — HTML 解析
- **nodemailer** — 邮件发送
- **zlib** — 压缩
- **cron** — 作业调度
- **worker_threads** — 后台工作者
- **exponential-backoff** — 重试逻辑
- **async_hooks** — AsyncLocalStorage

### Node.js 内置
- **fs** — 文件系统
- **path** — 路径操作
- **child_process** — 进程生成
- **crypto** — 密码函数

## 二进制大小

Perry 自动检测您的代码使用的 stdlib 功能：

| 使用情况 | 二进制大小 |
|-------|-------------|
| 无 stdlib 导入 | ~300KB |
| 仅 fs + path | ~3MB |
| 完整 stdlib | ~48MB |

编译器仅链接所需的运行时组件。

## compilePackages

对于未原生支持的 npm 包，您可以原生编译纯 TypeScript/JavaScript 包：

```json
{
  "perry": {
    "compilePackages": ["@noble/curves", "@noble/hashes"]
  }
}
```

请参阅 [项目配置](../getting-started/project-config.md) 了解详情。

## JavaScript 运行时回退

对于无法原生编译的包（原生插件、动态代码等），Perry 包含基于 QuickJS 的 JavaScript 运行时作为回退：

```typescript
import { jsEval } from "perry/jsruntime";
```

## 下一步