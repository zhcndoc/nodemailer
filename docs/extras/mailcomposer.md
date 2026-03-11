---
title: Mailcomposer
sidebar_position: 4
description: 生成符合 RFC 822 格式的电子邮件消息，可以直接流式传输或保存到磁盘。
---

生成符合 RFC 822 格式的电子邮件消息，你可以将其直接流式传输到 SMTP 连接或保存到磁盘以备后用。这是 [MailParser](./mailparser) 的逆过程，MailParser 是将原始消息解析回结构化对象。

:::info
Mailcomposer 随 Nodemailer 一起提供，无需单独安装。
:::

## 使用方法

### 1. 安装 Nodemailer

```bash
npm install nodemailer
```

### 2. 在代码中导入 MailComposer

```js
const MailComposer = require("nodemailer/lib/mail-composer");
```

### 3. 创建 MailComposer 实例

```js
const mail = new MailComposer(mailOptions);
```

`mailOptions` 参数是一个定义电子邮件消息的对象。可用选项的完整列表见下方的 [消息字段](#消息字段) 部分。

---

## API

### `createReadStream()`

返回一个可读流，发出原始 RFC 822 消息。当你想直接将消息通过管道传输到另一个流，而无需将整个消息加载到内存时，此方法非常有用。

```js
const mail = new MailComposer({ from: "you@example.com" /* ... */ });

const stream = mail.compile().createReadStream();
stream.pipe(process.stdout);
```

### `build(callback)`

生成完整消息，通过回调函数以 `Buffer` 形式返回。当你需要整个消息加载到内存中时使用，例如保存到文件或通过 API 发送。

```js
const mail = new MailComposer({ from: "you@example.com" /* ... */ });

mail.compile().build((err, message) => {
  if (err) throw err;
  process.stdout.write(message);
});
```

---

## 消息字段

MailComposer 接受与 Nodemailer [消息配置](/message/) 相同的消息选项。下表总结了最常用的字段。

| 字段                   | 描述                                                                                                                                                                                                                        |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **from**               | 发件人电子邮件地址。可以是纯地址（`'sender@server.com'`）或包含显示名称（`'Sender Name <sender@server.com>'`）。详见 [地址格式](#地址格式)。                                                                             |
| **sender**             | 出现在 _Sender:_ 头部的电子邮件地址。当发送消息的人与 _From:_ 所列作者不同，使用此字段。                                                                                                                                      |
| **to**                 | 主要收件人。可用逗号分隔字符串或地址数组。                                                                                                                                                                                |
| **cc**                 | 抄送收件人。这些地址会收到消息副本，且对所有收件人可见。                                                                                                                                                                  |
| **bcc**                | 密送收件人。该地址会收到副本，但对其他收件人隐藏。有关头部可见性，请参见 [BCC](#bcc) 。                                                                                                                                      |
| **replyTo**            | 回复应发送的地址，设置 _Reply-To:_ 头部。                                                                                                                                                                                  |
| **inReplyTo**          | 该邮件回复的电子邮件的 `Message-ID`，邮件客户端用来对话线程排序。                                                                                                                                                           |
| **references**         | 对话线程的相关 `Message-ID` 列表。支持空格分隔字符串或数组。                                                                                                                                                               |
| **subject**            | 邮件主题。                                                                                                                                                                                                                 |
| **text**               | 邮件正文的纯文本版本。支持 `string`、`Buffer`、`Stream` 或 `{ path: '/path/to/file.txt' }` 等对象。                                                                                                                        |
| **html**               | 邮件正文的 HTML 版本。支持与 **text** 相同的输入格式。                                                                                                                                                                    |
| **watchHtml**          | 专为 Apple Watch 设计的 HTML 内容。现代智能手表一般支持标准 `text/html`，所以此字段用得较少。                                                                                                                             |
| **amp**                | AMP4EMAIL 交互邮件内容，必须是完整且有效的 AMP 文档。不支持 AMP 的客户端将显示 **html** 内容。具体见[了解更多 AMP 邮件](https://blog.nodemailer.com/2019/12/30/testing-amp4email-with-nodemailer/)。                          |
| **icalEvent**          | 包含的 iCalendar 事件。输入格式可同 **text**/**html**。设置日历方法格式为 `{ method: 'REQUEST', content: icsString }` 对象形式，默认方法为 `PUBLISH`。内容须为 UTF-8 编码。                                              |
| **headers**            | 额外的邮件头。可接受对象格式（`{ 'X-Custom-Header': 'value' }`）或数组格式（`[{ key: 'X-Custom-Header', value: 'value' }]`）。                                                                                             |
| **attachments**        | 附加文件数组。详见下文的 [附件](#附件) 或主文档中 [attachments documentation](/message/attachments) 以获取更多示例。                                                                                                     |
| **alternatives**       | 包含在 `multipart/alternative` 部分的替代内容版本数组，详见 [替代内容](#替代内容) 。                                                                                                                                         |
| **envelope**           | 自定义的 SMTP 信封，覆盖从头部推断出的地址。详见 [SMTP 信封](#smtp-envelope) 。                                                                                                                                             |
| **messageId**          | 自定义 `Message-ID`，未指定时自动生成。                                                                                                                                                                                    |
| **date**               | 自定义 `Date` 头部时间，默认为当前 UTC 时间。                                                                                                                                                                              |
| **encoding**           | 文本部分使用的传输编码（例如 `quoted-printable` 或 `base64`）。                                                                                                                                                            |
| **raw**                | 提供预构建的原始消息，替代 MailComposer 生成。当使用此选项时，必须手动设置头部和信封。具体见 [自定义源](/message/custom-source) 。                                                                                     |
| **textEncoding**       | 强制文本部分使用的编码：`quoted-printable` 或 `base64`。若省略，则根据内容自动检测。                                                                                                                                       |
| **disableUrlAccess**   | 设置为 `true` 时，如果消息部分尝试从 URL 拉取内容，MailComposer 会抛出错误。                                                                                                                                               |
| **disableFileAccess**  | 设置为 `true` 时，如果消息部分尝试读取文件系统内容，MailComposer 会抛出错误。                                                                                                                                               |
| **newline**            | 生成消息使用的换行符样式。有效值为 `\r\n`（CRLF）、`\n`（LF），若不设置则保留输入中的换行格式。                                                                                                                           |

所有文本内容均视为 UTF-8 编码。附件以二进制流方式传输。

---

## 附件

每个附件通过对象定义，属性如下：

| 属性                       | 描述                                                                                                                                                                                                                       |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **filename**               | 显示给收件人的文件名，支持 Unicode 字符。设为 `false` 可完全省略文件名。                                                                                                                                                     |
| **cid**                    | 用于内嵌附件的 Content-ID（HTML 中用 `cid:` URL 引用）。设置后，附件自动使用 `contentDisposition: 'inline'` 并归入 `multipart/related` 部分。                                                                                |
| **content**                | 附件内容，可为 `string`、`Buffer` 或可读流 `Stream`。                                                                                                                                                                     |
| **encoding**               | 用于将字符串内容转为 Buffer 的编码方式，常用如 `base64`、`hex`。                                                                                                                                                           |
| **path**                   | 以文件路径或 URL 流式读取内容，替代直接传入内容。支持本地文件路径、HTTP/HTTPS URL 和数据 URI，适合大型文件。                                                                                                              |
| **contentType**            | 附件的 MIME 类型。未指定时会从文件名或路径自动检测。                                                                                                                                                                      |
| **contentTransferEncoding**| 此附件的传输编码（如 `quoted-printable`、`base64` 等）。未指定时自动检测。                                                                                                                                                 |
| **contentDisposition**     | 附件的呈现方式：`attachment`（默认，作为可下载文件）或 `inline`（内嵌于邮件正文中）。                                                                                                                                      |
| **headers**                | 此 MIME 部分的附加头部，例如 `{ 'X-Custom-Header': 'value' }`。                                                                                                                                                           |
| **raw**                    | 提供预构建的原始 MIME 内容，设置后忽略其他附件选项。可用 `string`、`Buffer`、`Stream` 或类似附件的对象。                                                                                                                |

### 示例

```js
const fs = require("fs");

const mailOptions = {
  // ...其他字段...
  attachments: [
    // 文本字符串作为附件内容
    { filename: "hello.txt", content: "hello world!" },

    // 二进制 Buffer 作为附件内容
    { filename: "buffer.txt", content: Buffer.from("hello world!", "utf-8") },

    // 从磁盘文件流读取内容
    { filename: "file.txt", path: "/path/to/file.txt" },

    // 让文件名和 MIME 类型从路径推断
    { path: "/path/to/logo.png" },

    // 使用可读取流作为内容源
    { filename: "stream.txt", content: fs.createReadStream("file.txt") },

    // 显式设置内容类型
    { filename: "data.bin", content: "hello world!", contentType: "application/octet-stream" },

    // 从远程 URL 获取附件内容
    { filename: "license.txt", path: "https://raw.githubusercontent.com/nodemailer/nodemailer/master/LICENSE" },

    // 解码 base64 字符串为附件内容
    { filename: "base64.txt", content: "aGVsbG8gd29ybGQh", encoding: "base64" },

    // 使用 data URI 作为内容源
    { path: "data:text/plain;base64,aGVsbG8gd29ybGQ=" },
  ],
};
```

---

## 替代内容

除了 **text** 和 **html**，你还可以将其他版本的消息内容作为 _alternatives_（替代版本）包含。例如，你可能包含同一内容的 Markdown 或 OpenDocument 版本。邮件客户端会根据情况选择合适版本显示。

替代内容对象使用与[附件](#附件)相同的属性，但放在消息的 `multipart/alternative` 部分，而非 `multipart/mixed` 或 `multipart/related`。

```js
const mailOptions = {
  html: "<b>Hello world!</b>",
  alternatives: [
    {
      contentType: "text/x-web-markdown",
      content: "**Hello world!**",
    },
  ],
};
```

---

## 地址格式

电子邮件地址可通过多种格式指定：

**字符串形式：**

```
recipient@example.com
"Display Name" <recipient@example.com>
```

**对象形式**（当显示名称含特殊字符时更适用）：

```js
{
  name: 'Display Name',
  address: 'recipient@example.com'
}
```

所有地址字段（包括 **from**）均支持一个或多个地址，且可以自由混合格式：

```js
{
  to: 'user1@example.com, "User Two" <user2@example.com>',
  cc: [
    'user3@example.com',
    '"User Four" <user4@example.com>',
    { name: 'User Five', address: 'user5@example.com' }
  ]
}
```

国际化域名（IDN）会自动转换为 ASCII 兼容编码（punycode）：

```
"Андрис" <андрис@уайлддак.орг>
// 域名转换为 punycode：андрис@xn--80aalaxjd5d.xn--c1avg
```

注意，非 ASCII 用户名部分（@ 前）需要接收服务器支持 SMTPUTF8 扩展。

---

## SMTP 信封

默认情况下，SMTP 信封（邮件服务器实际使用的路由信息）从邮件头地址中推断得出。如果需要不同的信封地址，比如实现 VERP（Variable Envelope Return Path）或使用空返回路径，则可以显式指定：

```js
const mailOptions = {
  from: "mailer@example.com",
  to: "daemon@example.com",
  envelope: {
    from: "Daemon <daemon@example.com>",
    to: 'mailer@example.com, "Mailer Two" <mailer2@example.com>',
  },
};
```

:::note
部分传输插件（如 AWS SES）会忽略 `envelope` 选项，改用头部地址。
:::

---

## 使用嵌入图片

要在 HTML 内容中直接嵌入图片，给附件设置唯一 `cid`（Content-ID），并在 HTML 中通过 `cid:` 协议引用：

```js
const mailOptions = {
  html: 'Embedded image: <img src="cid:unique@nodemailer" />',
  attachments: [
    {
      filename: "image.png",
      path: "/path/to/image.png",
      cid: "unique@nodemailer", // 必须与 src 属性值匹配
    },
  ],
};
```

---

## BCC

为了保护隐私，MailComposer 默认会从生成的消息中移除 _Bcc:_ 头部，确保密送收件人对其他收件人不可见。

如果需要在生成的消息中保留 _Bcc:_ 头部（例如归档消息时），可以在编译后的消息对象上启用 `keepBcc`：

```js
const mail = new MailComposer({
  // ...消息选项...
  bcc: "bcc@example.com",
}).compile();

mail.keepBcc = true;

mail.build((err, message) => {
  if (err) throw err;
  process.stdout.write(message);
});
```

---

## 许可证

[MIT](https://github.com/nodemailer/nodemailer/blob/master/LICENSE)
