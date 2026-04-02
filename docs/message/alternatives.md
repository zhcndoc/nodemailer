---
title: 替代方案
sidebar_position: 12
description: 在 multipart/alternative 中包含内容的替代表示形式，如 Markdown。
---

除了纯文本和 HTML，您还可以包含电子邮件内容的**替代表示形式**。这些是相同消息的不同格式，例如 Markdown 或日历邀请。当收件人打开您的邮件时，邮件客户端会自动选择并显示它支持的最佳格式。

替代方案的常见用例包括：

- 日历事件邀请（但请参见下面的提示）
- HTML 内容的 Markdown 版本
- 其他某些邮件客户端可以处理的机器可读格式

:::tip 推荐使用 `icalEvent` 进行日历邀请
针对日历事件，建议使用专用的 **`icalEvent`** 选项，而不是替代方案。它提供了更简单的 API 和更好的兼容性。详情请参阅 [日历事件](./calendar-events)。
:::

## 替代方案与附件的区别

替代对象使用与[附件对象](./attachments)相同的字段，包括 `content`、`path`、`contentType`、`encoding` 和 `headers`。主要区别在于它们在邮件结构中的呈现方式：

- **附件** 是收件人下载的单独文件，置于 `multipart/mixed` 或 `multipart/related` 容器中。
- **替代方案** 是邮件正文的不同版本，置于 `multipart/alternative` 容器中，邮件客户端会选择其中之一进行显示。

| 目的           | MIME 容器                             | 收件人所见                           |
| -------------- | ------------------------------------ | ----------------------------------- |
| 附件           | `multipart/mixed` 或 `multipart/related` | 可随邮件下载的文件                   |
| **替代方案**   | `multipart/alternative`              | 多种正文格式中的一种                  |

## 用法

向消息对象添加一个 `alternatives` 数组。每个替代方案至少需要 `contentType` 和 `content` 或 `path` 之一：

```javascript
const message = {
  from: "sender@example.com",
  to: "recipient@example.com",
  subject: "Hello",
  html: "<b>你好，世界！</b>",
  alternatives: [
    {
      contentType: "text/x-web-markdown",
      content: "**你好，世界！**",
    },
  ],
};
```

在此示例中，邮件包含 HTML 正文和 Markdown 替代方案。支持 Markdown 的邮件客户端可以选择渲染它而非 HTML。

### 顺序很重要

您可以根据需要包含任意多个替代方案。根据 MIME 标准（RFC 2046），您应将首选格式放在列表最后。邮件客户端从上到下读取替代方案，通常显示它能理解的最后一个格式。

例如，如果您按顺序包含纯文本、Markdown 和 HTML，大多数邮件客户端会显示 HTML 版本，因为它位于最后且广泛支持。
