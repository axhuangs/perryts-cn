# HTTP & 网络

Perry 原生实现了 HTTP 服务器、客户端以及 WebSocket 支持。

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

Perry 的 Fastify 实现与 npm 包的 API 兼容。路由、request/reply 对象、参数、查询字符串以及 JSON 体解析均能正常工作。

## Fetch API

```typescript
// GET request
const response = await fetch("https://jsonplaceholder.typicode.com/posts/1");
const data = await response.json();

// POST request
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

## 后续参考

- [Databases](database)
- [Overview](overview) — 所有标准库模块