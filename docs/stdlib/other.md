# 其他模块

Perry 支持的其他 npm 包和 Node.js API。

## sharp (图像处理)

```typescript
import sharp from "sharp";

await sharp("input.jpg")
  .resize(300, 200)
  .toFile("output.png");
```

## cheerio (HTML 解析)

```typescript
import cheerio from "cheerio";

const html = "<html><body><h1>Hello</h1><p>World</p></body></html>";
const $ = cheerio.load(html);
console.log($("h1").text()); // "Hello"
```

## nodemailer (电子邮件)

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

## zlib (压缩)

```typescript
import zlib from "zlib";

const compressed = zlib.gzipSync("Hello, World!");
const decompressed = zlib.gunzipSync(compressed);