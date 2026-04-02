---
title: 送达状态通知（DSN）
description: 使用 SMTP DSN 扩展请求外发邮件的送达、延迟或失败状态通知。
sidebar_position: 26
---

:::info
SMTP **送达状态通知**（DSN）扩展（定义于 [RFC 3461](https://datatracker.ietf.org/doc/html/rfc3461)）是**可选的**。您的 SMTP 服务器必须在其 `EHLO` 响应中声明支持 DSN，相关选项才能生效。
:::

送达状态通知允许您自动接收关于邮件离开您的服务器后发生的情况的邮件报告。您可以请求在邮件成功送达、投递延迟或永久失败（退信）时收到通知。

要为某条消息请求 DSN，请在调用 `transporter.sendMail()` 时，在[消息配置](/message/)中添加一个 **`dsn`** 对象。

## `dsn` 对象字段

| 属性       | 类型                   | 描述                                                                                                                                                                             | 对应的 SMTP 关键字          |
| ---------- | ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- |
| `id`       | `string`               | 此消息的唯一标识符，将包含在您收到的任何 DSN 报告中。它帮助您将通知与原始消息匹配。                                                                                              | **ENVID**                   |
| `return`   | `'headers' \| 'full'`  | 控制在 DSN 中包含多少原始邮件内容。使用 `'headers'` 仅包含邮件头，使用 `'full'` 包含完整的原始邮件内容。                                                                          | **RET**                     |
| `notify`   | `string \| string[]`   | 指定哪些事件应触发通知。有效值为 `'success'`、`'failure'`、`'delay'` 或 `'never'`。您可以合并多个值（除了 `'never'`，它必须单独使用）。                                               | **NOTIFY**                  |
| `recipient`| `string`               | 在 DSN 中包含的原始收件人地址。如果未提供，Nodemailer 会自动按照要求添加 `rfc822;` 前缀进行格式化。                                                                             | **ORCPT**                   |

> Nodemailer 会根据 RFC 3461 中定义的 [xtext](https://datatracker.ietf.org/doc/html/rfc3461#section-4) 编码规则自动转义 DSN 值中的特殊字符。

## 示例

### 1. 请求当邮件成功送达时通知

此示例请求成功通知，您将在收件方邮件服务器接受邮件进行最终投递时收到邮件确认。

```javascript
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.example.com",
  port: 587,
  secure: false,
  auth: {
    user: "smtp-user",
    pass: "smtp-pass",
  },
});

await transporter.sendMail({
  from: "sender@example.com",
  to: "recipient@example.com",
  subject: "消息",
  text: "希望这封邮件能被阅读！",
  dsn: {
    id: "msg-123",
    return: "headers",
    notify: "success",
    recipient: "sender@example.com",
  },
});
```

### 2. 请求失败和延迟通知

此示例请求永久失败（退信）和临时延迟的通知。当您希望在出现问题时获得提醒，但不需要成功投递确认时，此方式很有用。

```javascript
await transporter.sendMail({
  from: "sender@example.com",
  to: "recipient@example.com",
  subject: "消息",
  text: "希望这封邮件能被阅读！",
  dsn: {
    id: "msg-124",
    return: "headers",
    notify: ["failure", "delay"],
    recipient: "sender@example.com",
  },
});
```

### 3. 完全禁用 DSN 报告

如果您明确**不希望**为某条消息接收任何 DSN 报告，请将 `notify` 设置为 `'never'`。这会告诉接收服务器无论如何都不发送通知。

```javascript
await transporter.sendMail({
  /* ... 其他邮件选项 ... */
  dsn: {
    notify: "never",
  },
});
```

## 故障排除

- **未收到 DSN 报告？** 请确认您的[SMTP 服务器](./index.md)支持 DSN 扩展，检查其 `EHLO` 响应中是否列出了 `DSN` 支持。并确保未强制降级到不支持扩展的传统 `HELO` 命令。
- **报告中信息不完整或缺失？** 某些邮件服务商只支持部分 DSN 选项，或可能修改某些值。请查看服务商文档，了解其限制或特定行为。
