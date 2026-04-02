---
title: 自定义源
sidebar_position: 18
description: 提供您自己的预构建 RFC 822/EML 源，而不是让 Nodemailer 生成它。
---

有时您已经有一个格式完整的 RFC 822/EML 消息准备发送。这种情况可能出现在消息由其他系统创建、从存储中检索、使用 [MailParser](../extras/mailparser) 从 EML 文件解析，或使用 [Mailcomposer](../extras/mailcomposer) 生成。在这些情况下，您可以使用 **raw** 选项直接将预构建内容传递给 Nodemailer，Nodemailer 将发送它而不修改结构。

**raw** 选项可以在三个不同层级使用：

1. **整封消息** - 提供包含所有头部和正文内容的完整 RFC 822 文档。
2. **每个替代内容** - 提供预构建的 MIME 部分，如 `text/plain`、`text/html` 或其他替代内容类型。
3. **每个附件** - 提供完整的附件，包括其 MIME 头部和正文。

:::tip 始终设置信封
当您对整封消息使用 **raw** 时，必须明确提供 `envelope.from` 和 `envelope.to`。Nodemailer 不会从原始消息内容中解析这些值。信封告诉 [SMTP](../smtp/) 服务器在邮件传输过程中的发件人与收件人信息。
:::

## 示例

### 1. 字符串作为整封消息

```javascript
const message = {
  envelope: {
    from: "sender@example.com",
    to: ["recipient@example.com"],
  },
  raw: `From: sender@example.com
To: recipient@example.com
Subject: 你好，世界

你好，世界！`,
};
```

> 使用字符串时，换行符会按原样传递。如果您的邮件服务器要求使用 `\r\n` 换行符（如 RFC 5321 所规定），请确保您的 raw 内容使用了它们。

### 2. EML 文件作为整封消息

您可以通过提供 `path` 属性（而非字符串）从磁盘文件中读取消息内容。

```javascript
const message = {
  envelope: {
    from: "sender@example.com",
    to: ["recipient@example.com"],
  },
  raw: {
    path: "/path/to/message.eml",
  },
};
```

路径可以是绝对路径，也可以是相对于当前工作目录（`process.cwd()`）的相对路径。

### 3. 字符串作为附件

当在 `attachments` 数组内使用 **raw** 时，您必须自行包含所有 MIME 头部。Nodemailer 不会自动添加 `Content-Type`、`Content-Disposition` 或其他任何头部。

```javascript
const message = {
  from: "sender@example.com",
  to: "recipient@example.com",
  subject: "自定义附件",
  attachments: [
    {
      raw: `Content-Type: text/plain
Content-Disposition: attachment; filename="notes.txt"

附加文本文件`,
    },
  ],
};
```
