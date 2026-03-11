---
title: SMTP 信封
sidebar_position: 20
description: 独立控制 MAIL FROM 和 RCPT TO 命令，与可见的邮件头信息分开。
---

当 Nodemailer 通过 SMTP 发送邮件时，它发送 **两层不同的信息**：

1. **邮件头** —— 收件人邮件客户端显示的可见元数据（`From:`，`To:`，`Subject:` 等）。
2. **SMTP 信封** —— 邮件服务器用来投递邮件和处理退信的路由指令（`MAIL FROM`，`RCPT TO`）。这些指令与邮件头分离，收件人不可见。

默认情况下，Nodemailer **会自动构建信封**，通过提取你提供的 `from`、`to`、`cc` 和 `bcc` 字段中的邮箱地址来生成。对于大多数用例，这种自动行为正是你所需要的。

但是，如果你需要对信封进行精确控制，可以通过 `envelope` 属性来覆盖默认值。常见的使用场景包括：

- 实现 [VERP](https://en.wikipedia.org/wiki/Variable_envelope_return_path)（可变信封返回路径）以实现对每个收件人的退信跟踪
- 设置一个专门用于退信的地址，区别于可见的 `From:` 邮件头
- 发送邮件给不应该出现在可见邮件头中的收件人

## `envelope` 属性

```js
{
  envelope: {
    from: 'bounce+12345@example.com',          // 变为 MAIL FROM:
    to:   [                                    // 变为 RCPT TO:
      'alice@example.com',
      'Bob <bob@example.net>'
    ],
    requireTLSExtensionEnabled: true
  }
}
```

| 字段                         | 类型                      | 描述                                                                    |
| ---------------------------- | ------------------------- | ----------------------------------------------------------------------- |
| `from`                       | `string`                  | 用于 **`MAIL FROM`** 命令的地址（退信发送的返回路径）。                |
| `to`                         | `string \| string[]`      | 添加到 **`RCPT TO`** 列表中的地址（实际投递的目标地址）。              |
| `cc`                         | `string \| string[]`      | _可选_。这些地址在生成信封时会合并进 `to` 列表。                        |
| `bcc`                        | `string \| string[]`      | _可选_。这些地址在生成信封时会合并进 `to` 列表。                        |
| `requireTLSExtensionEnabled` | `boolean`                 | _可选_。如果为 `true`，则使用 `REQUIRETLS` 扩展（RFC 8689），要求 TLS 连接。 |

Nodemailer 支持任何 [地址格式](../message/addresses)：纯邮箱地址如 `user@example.com`，姓名加地址格式如 `Name <address>`，以及带有 UTF-8 域名的国际化邮箱地址。

### 完整示例

```js
const nodemailer = require("nodemailer");

async function main() {
  // 创建传输方式（请替换为你自己的传输选项）
  const transport = nodemailer.createTransport({
    sendmail: true,
  });

  const info = await transport.sendMail({
    from: "Mailer <mailer@example.com>", // 可见的 From: 邮件头
    to: "Daemon <daemon@example.com>",   // 可见的 To: 邮件头
    envelope: {
      from: "bounce+12345@example.com",  // 实际的 MAIL FROM（用于退信）
      to: [
        // 实际的 RCPT TO 收件人（真正接收邮件的地址）
        "daemon@example.com",
        "mailer@example.com",
      ],
    },
    subject: "Custom SMTP envelope",
    text: "Hello!",
  });

  console.log("Envelope used:", info.envelope);
  // => { from: 'bounce+12345@example.com', to: [ 'daemon@example.com', 'mailer@example.com' ] }
}

main().catch(console.error);
```

:::tip
`sendMail()` 返回的对象总是包含一个 `envelope` 属性，显示实际发送的信封内容。它包含 `from`（发送者地址字符串）和 `to`（收件人地址数组）。生成信封时，Nodemailer 会将 `to`、`cc` 和 `bcc` 中的 **所有** 收件人合并到一个 `to` 数组中。
:::

---

### 什么时候应该覆盖信封？

- **VERP 或退信管理** — 将退信路由到针对每封邮件或每个收件人的唯一地址，以追踪具体哪封邮件退信。自动退信通知可参考 [投递状态通知（DSN）](./dsn)。
- **邮件列表** — 将同一封邮件发送给多个收件人，同时隐藏他们的地址（不显示在邮件头中）。
- **不同的返回路径** — 邮件头显示一个地址（`From:`），但退信转发到另一个地址，以实现集中退信处理。

如果没有特定理由自定义信封，建议让 Nodemailer 从邮件头自动生成信封。
