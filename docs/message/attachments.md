---
title: 附件
sidebar_position: 11
description: 使用多种内容来源附加文件——字符串、缓冲区、流、文件或 URL。
---

要向电子邮件添加附件，请使用[消息对象](../)的 `attachments` 选项。`attachments` 选项接受一个附件对象数组，您可以包含**任意数量的文件**。

每个附件对象支持以下属性：

| 属性                   | 类型                          | 说明                                                                                                                             |
| ---------------------- | ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `filename`             | `string`                      | 显示给收件人的文件名。支持 Unicode 字符。                                                                                        |
| `content`              | `string \| Buffer \| Stream`  | 附件内容。可以是字符串、缓冲区或可读流。                                                                                        |
| `path`                 | `string`                      | 文件路径、URL 或数据 URI。Nodemailer 会直接流式传输文件，而不是将其全部加载到内存中，因此对于大文件推荐使用此方式。                 |
| `href`                 | `string`                      | HTTP 或 HTTPS URL。Nodemailer 会从该 URL 获取内容并作为附件包含。                                                              |
| `httpHeaders`          | `object`                      | 从 `href` 获取内容时发送的自定义 HTTP 头。例如：`{ authorization: 'Bearer token123' }`。                                         |
| `contentType`          | `string`                      | 附件的[MIME 类型](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types)。如果未指定，Nodemailer 会尝试根据 `filename` 或 `path` 自动检测。 |
| `contentDisposition`   | `string`                      | Content-Disposition 头部值。默认为 `'attachment'`。对于嵌入内容（如 HTML 中引用的图片），使用 `'inline'`。                     |
| `cid`                  | `string`                      | Content-ID 值，用于在 HTML 内容中引用附件。可配合 `<img src="cid:your-cid-value"/>` 使用，实现[内嵌图片](./embedded-images)。    |
| `encoding`             | `string`                      | 指定如何解码 `content` 字符串。常见值包括 `'base64'`、`'hex'` 和 `'utf8'`。                                                    |
| `contentTransferEncoding` | `string`                   | Content-Transfer-Encoding 头部值。支持的值为 `'base64'`、`'quoted-printable'`、`'7bit'` 和 `'8bit'`。大多数附件默认使用 `'base64'`。 |
| `headers`              | `object`                      | 为该特定附件的 MIME 节点添加额外[自定义头](./custom-headers)。                                                                  |
| `raw`                  | `string`                      | **高级用法**：包含所有头部的完整预构建 MIME 节点。指定时会覆盖其他所有附件属性。                                                 |

:::tip 流式传输 vs 内存加载
对于大文件，优先在 `content` 属性中使用 `path`、`href` 或可读流。这样 Nodemailer 可增量流式传输数据，而不是一次性将整个文件加载到内存。
:::

## 示例

以下示例展示了向邮件消息添加附件的不同方式。

```javascript
const fs = require("fs");

// attachments 数组写在消息对象中
attachments: [
  // 1. 纯文本字符串
  // 从字符串创建附件的最简单方式
  {
    filename: "hello.txt",
    content: "你好，世界！",
  },

  // 2. 缓冲区内容
  // 当内存中已有二进制数据时使用
  {
    filename: "buffer.txt",
    content: Buffer.from("你好，世界！", "utf8"),
  },

  // 3. 文件系统中的文件
  // 使用流式传输，对于大文件内存友好
  {
    filename: "report.pdf",
    path: "/absolute/path/to/report.pdf",
  },

  // 4. 仅文件路径
  // 不指定 filename 时，Nodemailer 会从路径中派生文件名
  // 内容类型也会自动根据文件扩展名检测
  {
    path: "/absolute/path/to/image.png",
  },

  // 5. 可读流
  // 提供对内容读取的完全控制
  {
    filename: "notes.txt",
    content: fs.createReadStream("./notes.txt"),
  },

  // 6. 明确指定内容类型
  // 需要时覆盖自动的 MIME 类型检测
  {
    filename: "data.bin",
    content: Buffer.from("deadbeef", "hex"),
    contentType: "application/octet-stream",
  },

  // 7. 远程 URL
  // Nodemailer 在发送时从 URL 获取内容
  {
    filename: "license.txt",
    href: "https://raw.githubusercontent.com/nodemailer/nodemailer/master/LICENSE",
  },

  // 8. Base64 编码字符串
  // 当内容字符串不是纯文本时指定编码
  {
    filename: "photo.jpg",
    content: "/9j/4AAQSkZJRgABAQAAAQABAAD...", // base64 图片数据（截断）
    encoding: "base64",
  },

  // 9. 数据 URI
  // 适合内联数据或来自画布元素的内容
  {
    path: "data:text/plain;base64,SGVsbG8gd29ybGQ=",
  },

  // 10. 预构建 MIME 节点（高级）
  // 完全控制附件的 MIME 结构
  {
    raw: [
      "Content-Type: text/plain; charset=utf-8",
      'Content-Disposition: attachment; filename="greeting.txt"',
      "",
      "你好，世界！"
    ].join("\r\n"),
  },
];
```

## 内嵌图片

您可以将图片直接嵌入电子邮件的 HTML 正文中，而不是作为可下载附件显示。方法是为附件指定一个 Content-ID (`cid`)，并在 HTML 中通过 `cid:` URL 方案引用它。更多详情及示例，请参阅[内嵌图片](./embedded-images) 页面。

`cid` 值可以是任意唯一字符串。常见习惯是使用类似电子邮件格式的字符串（例如 `logo@nodemailer`），但这并非必须。

```javascript
{
  attachments: [
    {
      filename: 'logo.png',
      path: './assets/logo.png',
      cid: 'logo@nodemailer' // 此附件的唯一标识符
    }
  ],
  html: '<p><img src="cid:logo@nodemailer" alt="Nodemailer logo"></p>'
}
```

当附件带有 `cid` 且内容类型为图片时，Nodemailer 会自动将 Content-Disposition 设置为 `inline` 而非 `attachment`，这样图片就会显示在邮件正文中，而不是以可下载文件的形式出现。
