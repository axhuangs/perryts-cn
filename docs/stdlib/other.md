# 其他模块

Perry 支持的额外 npm 包及 Node.js API。

## sharp（图像处理）

```typescript
import sharp from "sharp";

await sharp("input.jpg")
  .resize(300, 200)
  .toFile("output.png");
```

## cheerio（HTML 解析）

```typescript
import cheerio from "cheerio";

const html = "<html><body><h1>Hello</h1><p>World</p></body></html>";
const $ = cheerio.load(html);
console.log($("h1").text()); // "Hello"
```

## nodemailer（邮件发送）

```typescript
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.example.com",
  port: 587,
  auth: { user: "user", pass: "pass" },
});

await transporter.sendMail({
  from: "sender@example.com",
  to: "recipient@example.com",
  subject: "Hello from Perry",
  text: "This email was sent from a compiled TypeScript binary!",
});
```

## zlib（数据压缩）

```typescript
import zlib from "zlib";

const compressed = zlib.gzipSync("Hello, World!");
const decompressed = zlib.gunzipSync(compressed);
```

## cron（任务调度）

```typescript
import { CronJob } from "cron";

const job = new CronJob("*/5 * * * *", () => {
  console.log("Runs every 5 minutes");
});
job.start();
```

## worker_threads（工作线程）

```typescript
import { Worker, parentPort, workerData } from "worker_threads";

if (parentPort) {
  // 工作线程
  const data = workerData;
  parentPort.postMessage({ result: data.value * 2 });
} else {
  // 主线程
  const worker = new Worker("./worker.ts", {
    workerData: { value: 21 },
  });
  worker.on("message", (msg) => {
    console.log(msg.result); // 42
  });
}
```

## commander（CLI 解析）

```typescript
import { Command } from "commander";

const program = new Command();
program.name("my-cli").version("1.0.0").description("My CLI tool");

program
  .command("serve")
  .option("-p, --port <number>", "Port number")
  .option("--verbose", "Verbose output")
  .action((options) => {
    console.log(`Starting server on port ${options.port}`);
  });

program.parse(process.argv);
```

## decimal.js（高精度计算）

```typescript
import Decimal from "decimal.js";

const a = new Decimal("0.1");
const b = new Decimal("0.2");
const sum = a.plus(b); // 精确等于 0.3（无浮点运算误差）

sum.toFixed(2);      // "0.30"
sum.toNumber();      // 0.3
a.times(b);          // 0.02
a.div(b);            // 0.5
a.pow(10);           // 1e-10
a.sqrt();            // 0.316...
```

## lru-cache

```typescript
import LRUCache from "lru-cache";

const cache = new LRUCache(100); // 最大 100 个条目

cache.set("key", "value");
cache.get("key");       // "value"
cache.has("key");       // true
cache.delete("key");
cache.clear();
```

## child_process（子进程）

```typescript
import { spawnBackground, getProcessStatus, killProcess } from "child_process";

// 启动后台进程
const { pid, handleId } = spawnBackground("sleep", ["10"], "/tmp/log.txt");

// 检查进程是否仍在运行
const status = getProcessStatus(handleId);
console.log(status.alive); // true

// 终止进程
killProcess(handleId);
```

## 后续参考

- [标准库概述](overview) — 所有标准库模块
- [文件系统](fs) — fs 及 path API