---
title: 连接池 SMTP 连接
sidebar_position: 21
description: 保持 TCP/TLS 连接打开并复用它们以实现大批量发送邮件。
---

**连接池 SMTP** 维护与您的 SMTP 服务器之间固定数量的持久 TCP/TLS 连接，并在多条消息间复用它们。它不再为每封邮件打开新的连接（每次都需要完整的 TLS 握手），而是保持连接打开，随时准备发送下一个邮件。这是标准的 [SMTP 传输](./index.md) 的一个扩展。

此方法适用于：

- 需要快速发送**大量批量邮件**，因为连接复用消除了重复的 TLS 握手开销。
- 您的 SMTP 提供商**限制了可以打开的同时连接数**，需要在这些限制内高效排队消息。

:::tip
对于极大批量的邮件发送，可以考虑使用 [SES 传输](/transports/ses/)，它集成了 Amazon Simple Email Service，支持限速及大规模的投递能力。
:::

---

## 快速示例

```javascript
const nodemailer = require("nodemailer");

// 创建单个 transporter 实例，并在整个应用中复用。
// 该 transporter 内部管理最多 `maxConnections` 个持久连接。
const transporter = nodemailer.createTransport({
  host: "smtp.example.com",
  port: 465,
  secure: true,
  pool: true, // 启用连接池
  maxConnections: 5, // 最大同时连接数（默认：5）
  maxMessages: 100, // 每个连接发送的邮件数，达到后重连（默认：100）
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// 使用共享 transporter 发送邮件。
// 不要为每封邮件创建新的 transporter，破坏了连接池的意义。
await transporter.sendMail({
  from: "新闻通讯 <noreply@example.com>",
  to: "alice@example.com",
  subject: "你好，连接池世界",
  text: "Hi Alice!",
});
```

:::info
连接池兼容所有身份验证方式，包括 [OAuth2](./oauth2.md)。这对通过支持 OAuth2 的 Gmail 或 Outlook 等服务发送邮件特别有用。
:::

---

## 传输选项

| 选项              | 类型       | 默认值  | 描述                                                                                                                                            |
| ----------------- | ---------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `pool`            | `boolean`  | `false` | 设为 `true` 以启用连接池。                                                                                                                       |
| `maxConnections`  | `number`   | `5`     | 同时打开的最大 SMTP 连接数。所有连接都忙碌时，消息将排队。                                                                                       |
| `maxMessages`     | `number`   | `100`   | 单个连接最多发送多少封邮件后关闭并重连。避免连接长时间保持导致变得陈旧。                                                                          |
| `maxRequeues`     | `number`   | `-1`    | 当连接意外关闭导致发送中断时，消息可重入队列的次数。设置为 `-1`（或忽略）表示无限重试，设为 `0` 则完全禁止重入队列。                            |

:::warning 已废弃
以下选项已**废弃**，将在未来的大版本中移除：

- `rateDelta` - 用于限速的时间窗口，单位毫秒（默认：`1000`）。
- `rateLimit` - 在一个 `rateDelta` 窗口内允许发送的最大消息数。该限制适用于所有连接池连接的总和，而非单个连接。
:::

---

## 运行时辅助函数

### `transporter.isIdle()` -> `boolean`

当 transporter 有能力接收更多消息时返回 `true`。意味着内部队列有空位，或至少有一个连接可立即发送。

### `transporter.close()`

关闭所有活跃连接并清空任何待发送消息。闲置连接会在 `socketTimeout` 后自动关闭，因此通常只在应用退出时才需手动调用 `close()`。

```javascript
// 优雅关闭示例
process.on("SIGTERM", () => {
  transporter.close();
  process.exit(0);
});
```

---

## 事件：`idle`

当 transporter 可接收更多消息（队列有空位或连接可用）时，会触发 `idle` 事件。该机制支持“拉取”式处理，即仅在 Nodemailer 准备好处理时才从外部队列请求消息，而不是一次性全部加载到内存：

```javascript
const { getNextMessage } = require("./messageQueue");

transporter.on("idle", async () => {
  // transporter 可接收更多邮件时持续发送
  while (transporter.isIdle()) {
    const message = await getNextMessage();
    if (!message) return; // 外部队列为空

    try {
      await transporter.sendMail(message);
    } catch (err) {
      console.error("发送失败:", err);
    }
  }
});
```

---

### 最佳实践

- **创建一个 transporter 并在整个应用中复用。** 每次调用 `createTransport()` 都会创建独立的连接池和连接，多个 transporter 会失去连接池优势。
- **根据 SMTP 提供商限制调整 `maxConnections` 和 `maxMessages`。** 许多提供商限制同时连接数或单个连接发送邮件数。请查看提供商文档或常见服务列表（[well-known services](./well-known-services.md)）。
- **高容量发送时使用 `idle` 事件。** 代替在内存中排队成千上万的邮件，使用上述拉取模式仅在 transporter 准备好时请求邮件。
- **应用关闭时关闭连接池。** 在关闭处理程序中调用 `transporter.close()`，确保连接正确关闭，进程能干净退出。
