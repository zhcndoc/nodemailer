---
title: 嵌入式图片
sidebar_position: 15
description: 使用 Content-ID (cid:) URL 方案直接将图片嵌入 HTML 正文中。
---

嵌入式图片是直接显示在电子邮件正文中的图片，而不是作为可下载的附件出现。你可以通过将图片包含在[附件](./attachments)数组中，并使用 `cid:`（Content-ID）URL 方案引用它们，来在你的 HTML 邮件中嵌入图片。

以下是嵌入图片的三个步骤：

1. 将图片添加到消息选项中的[附件](./attachments)数组里。
2. 给附件分配一个唯一的 [`cid`](./attachments)（Content-ID）值。
3. 在 HTML 中使用 `src="cid:your-cid-value"` 来引用图片。

:::info 为什么使用嵌入图片？
许多邮件客户端默认会因为隐私和安全原因屏蔽外部图片。嵌入式图片可以绕过这个限制，因为图片数据是随着邮件内容一起传输的，接收者无需点击“加载图片”就能立即看到图片。
:::

:::note 选择唯一的 cid
**cid** 值必须在邮件中唯一。推荐的格式是使用你控制的域名的类似邮箱的格式，例如 `logo@example.com` 或 `header-image@mycompany.com`。这种格式有助于确保唯一性，并遵循电子邮件标准。
:::

#### 基本示例

此示例展示了如何从文件路径嵌入一张图片。附件中的 `cid` 值必须与 HTML `src` 属性中使用的值（不含 `cid:` 前缀）匹配。

```javascript
const message = {
  from: "Alice <alice@example.com>",
  to: "Bob <bob@example.com>",
  subject: "Inline image test",
  html: 'Embedded image: <img src="cid:logo@example.com" alt="Company logo"/>',
  attachments: [
    {
      filename: "logo.png",
      path: "/path/to/logo.png",
      cid: "logo@example.com", // 与 img src 属性中的 cid 匹配
    },
  ],
};
```

#### 使用 Buffer 代替文件

你也可以不指定文件路径，而是直接提供包含图片数据的 Buffer。当图片是动态生成或已加载到内存中时，这很有用。

```javascript
const fs = require("fs");

const message = {
  from: "Alice <alice@example.com>",
  to: "Bob <bob@example.com>",
  subject: "Screenshot attached",
  html: '<img src="cid:screenshot@example.com" alt="Screenshot"/>',
  attachments: [
    {
      filename: "screenshot.png",
      content: fs.readFileSync("/tmp/screenshot.png"), // 包含图片数据的 Buffer
      cid: "screenshot@example.com",
    },
  ],
};
```

#### 嵌入多张图片

你可以在同一封邮件中嵌入多张图片。每张图片都需要自己唯一的 `cid` 值，并且必须作为 `attachments` 数组中的单独条目列出。

```javascript
const message = {
  from: "Reports <reports@example.com>",
  to: "Team <team@example.com>",
  subject: "Monthly report",
  html: `
    <h1>Monthly Report</h1>
    <p>Here are this month's results:</p>
    <img src="cid:chart@example.com" alt="Sales chart"/>
    <img src="cid:badge@example.com" alt="Achievement badge"/>
  `,
  attachments: [
    { filename: "chart.png", path: "./chart.png", cid: "chart@example.com" },
    { filename: "badge.png", path: "./badge.png", cid: "badge@example.com" },
  ],
};
```
