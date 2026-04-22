# 密码学

Perry 原生实现了密码哈希、JWT 令牌和以太坊密码学。

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

## JSON Web Tokens

```typescript
import jwt from "jsonwebtoken";

const secret = "my-secret-key";

// 签名令牌
const token = jwt.sign({ userId: 123, role: "admin" }, secret, {
  expiresIn: "1h",
});

// 验证令牌
const decoded = jwt.verify(token, secret);
console.log(decoded.userId); // 123
```

## Node.js Crypto

```typescript
import crypto from "crypto";

// 哈希
const hash = crypto.createHash("sha256").update("data").digest("hex");

// HMAC
const hmac = crypto.createHmac("sha256", "secret").update("data").digest("hex");

// 随机字节
const bytes = crypto.randomBytes(32);
```

## Ethers

```typescript
import { ethers } from "ethers";

// 创建钱包
const wallet = ethers.Wallet.createRandom();
console.log(wallet.address);

// 签名消息
const signature = await wallet.signMessage("Hello, Ethereum!");
```

## 下一步

- [Utilities](utilities.md)
- [Overview](overview.md) — All stdlib modules