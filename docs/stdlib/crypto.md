# 密码学

Perry 原生实现了密码哈希、JWT 令牌以及以太坊密码学相关功能。

## bcrypt

```typescript
import bcrypt from "bcrypt";

const hash = await bcrypt.hash("mypassword", 10);
const match = await bcrypt.compare("mypassword", hash);
console.log(match); // true
```

## Argon2

```typescript
import argon2 from "argon2";

const hash = await argon2.hash("mypassword");
const valid = await argon2.verify(hash, "mypassword");
console.log(valid); // true
```

## JSON Web 令牌

```typescript
import jwt from "jsonwebtoken";

const secret = "my-secret-key";

// 签发令牌
const token = jwt.sign({ userId: 123, role: "admin" }, secret, {
  expiresIn: "1h",
});

// 验证令牌
const decoded = jwt.verify(token, secret);
console.log(decoded.userId); // 123
```

## Node.js 加密模块

```typescript
import crypto from "crypto";

// 哈希运算
const hash = crypto.createHash("sha256").update("data").digest("hex");

// HMAC 运算
const hmac = crypto.createHmac("sha256", "secret").update("data").digest("hex");

// 生成随机字节
const bytes = crypto.randomBytes(32);
```

## Ethers 库

```typescript
import { ethers } from "ethers";

// 创建钱包
const wallet = ethers.Wallet.createRandom();
console.log(wallet.address);

// 对消息进行签名
const signature = await wallet.signMessage("Hello, Ethereum!");
```

## 后续参考

- [Utilities](utilities)
- [标准库概述](overview) — 所有标准库模块