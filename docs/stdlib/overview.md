# 标准库概述

Perry 原生实现了众多主流 npm 包及 Node.js API。当你导入受支持的包时，Perry 会将其编译为原生代码——无需涉及 JavaScript 运行时。

## 工作原理

```typescript
import fastify from "fastify";
import mysql from "mysql2/promise";
```

Perry 在编译阶段识别这些导入语句，并将其路由至 `perry-stdlib`  crate 中的原生 Rust 实现。其 API 接口与原 npm 包完全一致，因此现有代码通常无需修改即可运行。

## 支持的包

### 网络与 HTTP
- **fastify** — HTTP 服务器框架
- **axios** — HTTP 客户端
- **node-fetch** / **fetch** — HTTP fetch API
- **ws** — WebSocket 客户端/服务器

### 数据库
- **mysql2** — MySQL 客户端
- **pg** — PostgreSQL 客户端
- **better-sqlite3** — SQLite 数据库
- **mongodb** — MongoDB 客户端
- **ioredis** / **redis** — Redis 客户端

### 密码学
- **bcrypt** — 密码哈希处理
- **argon2** — 密码哈希处理（Argon2 算法）
- **jsonwebtoken** — JWT 签名/验证
- **crypto** — Node.js 加密模块
- **ethers** — 以太坊开发库

### 工具类
- **lodash** — 实用工具函数
- **dayjs** / **moment** — 日期处理
- **uuid** — UUID 生成
- **nanoid** — ID 生成
- **slugify** — 字符串转 slug 格式
- **validator** — 字符串验证

### 命令行与数据
- **commander** — 命令行参数解析
- **decimal.js** — 高精度小数运算
- **bignumber.js** — 大数字数学运算
- **lru-cache** — LRU 缓存

### 其他
- **sharp** — 图像处理
- **cheerio** — HTML 解析
- **nodemailer** — 邮件发送
- **zlib** — 数据压缩
- **cron** — 任务调度
- **worker_threads** — 后台工作线程
- **exponential-backoff** — 重试逻辑
- **async_hooks** — 异步本地存储（AsyncLocalStorage）

### Node.js 内置模块
- **fs** — 文件系统
- **path** — 路径处理
- **child_process** — 进程生成
- **crypto** — 加密函数

## 二进制文件大小

Perry 会自动检测代码中使用的标准库功能：

| 使用场景 | 二进制文件大小 |
|----------|----------------|
| 无标准库导入 | ~300KB |
| 仅使用 fs + path | ~3MB |
| 完整标准库 | ~48MB |

编译器仅链接所需的运行时组件。

## compilePackages

对于非原生支持的 npm 包，你可将纯 TypeScript/JavaScript 包编译为原生代码：

```json
{
  "perry": {
    "compilePackages": ["@noble/curves", "@noble/hashes"]
  }
}
```

详情请参见[项目配置](../getting-started/project-config)。

## JavaScript 运行时回退

对于无法原生编译的包（原生扩展、动态代码等），Perry 内置了基于 QuickJS 的 JavaScript 运行时作为回退方案：

```typescript
import { jsEval } from "perry/jsruntime";
```

## 后续参考

- [文件系统](fs)
- [HTTP & 网络](http)
- [数据库](database)
- [加密](crypto)
- [实用工具](utilities)
- [其他模块](other)