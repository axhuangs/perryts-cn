# HTTP & Networking

Perry 原生实现了 HTTP 服务器、客户端和 WebSocket 支持。

## Fastify 服务器

```typescript
import fastify from "fastify";

const app = fastify();

app.get("/", async (request, reply) => {
  return { hello: "world" };
});

app.get("/users/:id", async (request, reply) => {
  const { id } = request.params;
  return { id, name: "User " + id };
});

app.post("/data", async (request, reply) => {
  const body = request.body;
  reply.code(201);
  return { received: body };
});

app.listen({ port: 3000 }, () => {
  console.log("Server running on port 3000");
});
```

Perry 的 Fastify 实现与 npm 包 API 兼容。路由、请求/回复对象、参数、查询字符串和 JSON 正文解析都有效。

## Fetch API

```typescript
// GET 请求
const response = await fetch("https://jsonplaceholder.typicode.com/posts/1");
const data = await response.json();

// POST 请求
const result = await fetch("https://jsonplaceholder.typicode.com/posts", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ title: "hello", body: "world", userId: 1 }),
});
```

## Axios

```typescript
import axios from "axios";

const { data } = await axios.get("https://jsonplaceholder.typicode.com/users/1");

const response = await axios.post("https://jsonplaceholder.typicode.com/users", {
  name: "Perry",
  email: "perry@example.com",
});
```

## WebSocket

```typescript
import { WebSocket } from "ws";

const ws = new WebSocket("ws://localhost:8080");

ws.on("open", () => {
  ws.send("Hello, server!");
});

ws.on("message", (data) => {
  console.log(`Received: ${data}`);
});

ws.on("close", () => {
  console.log("Connection closed");
});
```

## 下一步

- [Databases](database.md)
- [Overview](overview.md) — All stdlib modules