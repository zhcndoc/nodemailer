---
title: 消息配置
sidebar_position: 3
description: 配置电子邮件消息字段，包括发件人、收件人、主题、文本、HTML 和附件。
---

本页面描述了使用 Nodemailer 编写电子邮件时可用的所有字段。大多数电子邮件只需几个基本字段，但当你需要更多控制时，也提供了高级选项。

### 常用字段

发送电子邮件时你最常使用的字段有：

- **from** - 发件人的电子邮件地址。你可以使用简单地址，如 `'sender@server.com'`，也可以包含显示名称，如 `'"Sender Name" <sender@server.com>'`。更多格式选项见[地址对象](/message/addresses)。
- **to** - 显示在 _收件人（To）_ 字段中的收件人。接受逗号分隔的字符串或地址数组。
- **cc** - 显示在 _抄送（Cc）_ 字段中的收件人。接受逗号分隔的字符串或地址数组。
- **bcc** - 显示在 _密送（Bcc）_ 字段中的收件人。密送的收件人会收到邮件，但其他收件人看不到他们。接受逗号分隔的字符串或地址数组。
- **subject** - 邮件主题行。
- **text** - 邮件正文的纯文本版本。可以是字符串、Buffer、流或类似附件的对象（例如 `{path: '/var/data/message.txt'}`）。
- **html** - 邮件正文的 HTML 版本。可以是字符串、Buffer、流或类似附件的对象（例如 `{path: 'http://example.com/email.html'}`）。
- **attachments** - 附件对象的数组。详见[使用附件](/message/attachments)。你也可以用附件实现[嵌入图像](/message/embedded-images)于 HTML 内容中。

以下示例展示了仅使用基础字段的典型邮件：

```javascript
const message = {
  from: "sender@server.com",
  to: "receiver@example.com",
  subject: "Hello World",
  text: "This is the plaintext version of the email.",
  html: "<p>This is the <strong>HTML version</strong> of the email.</p>",
};
```

### 更多高级字段

以下章节涵盖了微调邮件的附加选项。

##### 路由选项

这些选项控制邮件的地址及回复处理方式：

- **sender** - 出现在 _发件人（Sender）_ 字段的电子邮件地址。通常用于实际发件人与 _From:_ 字段不同的情况（例如代表他人发送时）。大多数情况下，应使用 **from**。
- **replyTo** - 出现在 _回复至（Reply-To）_ 字段的电子邮件地址。收件人回复你的邮件时，回复会发送到此地址而非 _From:_。
- **inReplyTo** - 此邮件所回复邮件的 Message-ID，帮助邮件客户端建立会话线程。
- **references** - 此邮件引用的 Message-ID 列表。可为字符串数组或空格分隔的字符串。用于将相关邮件线程组织在一起。
- **envelope** - 自定义 SMTP 信封，若自动生成的信封不满足需求。详见[SMTP 信封](/smtp/envelope)。
- **requireTLSExtensionEnabled** - 设置为 `true` 时，SMTP 的 `REQUIRETLS` 扩展（RFC 8689）会生效。确保整个传输链路都使用 TLS 加密，而不仅是第一跳。连接必须已经使用 TLS，且服务器需支持 REQUIRETLS。也可以在 [envelope](/smtp/envelope) 对象内设置。

##### 内容选项

这些选项为控制邮件内容提供附加方式：

- **attachDataUrls** - 设置为 `true` 时，Nodemailer 会自动将 HTML 内容中的 `data:` URI 图片转为嵌入附件。当 HTML 含有内联编码的 data URI 图片时很有用。
- **watchHtml** - Apple Watch 专用的 HTML 内容版本。现代 Apple Watch 已可良好渲染标准的 `text/html`，因此此字段较少使用。
- **amp** - AMP4EMAIL 专用的 HTML 邮件版本。用法与 `text` 和 `html` 类似。见下方的[AMP 示例](#amp-example)或阅读[本博客文章](https://blog.nodemailer.com/2019/12/30/testing-amp4email-with-nodemailer/)了解 AMP 邮件的发送和渲染。
- **icalEvent** - 作为替代内容类型包含的 iCalendar 事件。用于发送日历邀请。详见[日历事件](/message/calendar-events)。
- **alternatives** - 备选内容表示的数组（除了文本和 HTML 部分）。详见[使用替代内容](/message/alternatives)。
- **encoding** - 设置文本和 HTML 部分的 `Content-Transfer-Encoding` 头。指定时，直接使用该转码方式（例如 `'base64'`、`'quoted-printable'`、`'7bit'`、`'8bit'`）。此项不同于 `textEncoding`，后者控制文本内容如何自动编码。
- **raw** - 发送预先构造好的完整 MIME 消息，而非自动生成。适用于已有完整邮件消息时。详见[自定义源](/message/custom-source)。
- **textEncoding** - 强制文本内容采用特定的内容传输编码。有效值为 `'quoted-printable'` 或 `'base64'`。默认情况下，Nodemailer 会自动选取最佳方案：大部分为 ASCII 时用 `quoted-printable`，否则用 `base64`。

##### 头部选项

这些选项让你定制邮件头：

- **priority** - 设定邮件优先级。可用值为 `'high'`、`'normal'`（默认）或 `'low'`。会自动添加对应的 `X-Priority`、`X-MSMail-Priority` 和 `Importance` 头。
- **headers** - 自定义邮件头字段。可为对象如 `{ "X-Key-Name": "key value" }`，或数组用于同一键的多值：`[{key: "X-Key-Name", value: "val1"}, {key: "X-Key-Name", value: "val2"}]`。详见[自定义头部](/message/custom-headers)。
- **messageId** - 邮件的自定义 Message-ID。未指定则 Nodemailer 自动生成唯一标识。
- **date** - 邮件 `Date` 头使用的日期。未指定则使用当前日期（UTC）。可以传入 Date 对象或日期字符串。
- **list** - 设置 List-* 邮件头的辅助对象，通常用于邮件列表。详见[List 头部](/message/list-headers)。

##### 安全选项

这些选项帮助保护应用在处理不受信任邮件数据时的安全：

- **disableFileAccess** - 设置为 `true` 时，禁止 Nodemailer 从文件系统读取文件。构造不可信 JSON 数据邮件时应启用，以防攻击者读取任意文件。若附件或消息节点尝试读取文件路径，发送操作会返回错误。注意：若传输配置中同样设置了此项，以传输级别设置为准。
- **disableUrlAccess** - 设置为 `true` 时，禁止 Nodemailer 从 URL 获取内容。防止服务器端请求伪造（SSRF）攻击。注意：若传输配置中也设置了此项，以传输级别设置为准。

##### 高级选项

这些选项较少用，但可实现对生成 MIME 消息的精细控制：

- **normalizeHeaderKey** - 自定义头部键名大小写的函数。接收头部键名和值为参数，返回规范化后的键名。适用于需要特定邮件系统兼容性的头部大小写处理。
- **boundaryPrefix** - MIME 边界字符串的自定义前缀。默认 `'--_NmP'`。边界用于分隔多部分消息。
- **baseBoundary** - 生成唯一 MIME 边界时使用的共享基础字符串。默认一个随机十六进制字符串。消息中所有边界都会从此派生。
- **newline** - 控制生成邮件的换行符风格。设置为 `'windows'`（或 `'dos'`、`'win'`、`'\r\n'`）采用 Windows 风格 CRLF，或 `'unix'`（或 `'linux'`、`'\n'`）采用 Unix 风格 LF。
- **xMailer** - 自定义 `X-Mailer` 头的值，通常用于标识发送邮件的软件。设置为 `false` 则不添加此头。
- **dkim** - 每个邮件的 DKIM 签名配置，覆盖传输级别设置。详见[DKIM 签名](/dkim/)。

以下示例演示设置自定义头部和指定日期：

```javascript
const message = {
  from: "sender@example.com",
  to: "recipient@example.com",
  subject: "Custom Headers Example",
  text: "Hello!",
  headers: {
    "X-Custom-Header": "my custom value",
  },
  date: new Date("2000-01-01 00:00:00"),
};
```

你也可以使用可读流作为 HTML 内容。使用流时请确保正确处理错误并清理资源：

```javascript
const htmlStream = fs.createReadStream("content.html");
transporter.sendMail({ html: htmlStream }, function (err) {
  if (err) {
    // 发生错误时，检查流是否仍打开，若是则关闭
    if (!htmlStream.closed) {
      htmlStream.destroy();
    }
  }
});
```

##### AMP 示例

AMP4EMAIL 让你打造交互式、动态邮件。以下示例展示如何在标准文本和 HTML 版本旁添加 AMP 版本。支持 AMP 的邮件客户端会显示 AMP 内容，其他客户端会显示 HTML 或纯文本版本：

```javascript
const message = {
  from: "Nodemailer <example@nodemailer.com>",
  to: "Nodemailer <example@nodemailer.com>",
  subject: "AMP4EMAIL message",
  text: "For clients with plaintext support only",
  html: "<p>For clients that do not support AMP4EMAIL or when AMP content is invalid</p>",
  amp: `<!doctype html>
    <html ⚡4email>
      <head>
        <meta charset="utf-8">
        <style amp4email-boilerplate>body{visibility:hidden}</style>
        <script async src="https://cdn.ampproject.org/v0.js"></script>
        <script async custom-element="amp-anim" src="https://cdn.ampproject.org/v0/amp-anim-0.1.js"></script>
      </head>
      <body>
        <p>Image: <amp-img src="https://cldup.com/P0b1bUmEet.png" width="16" height="16"/></p>
        <p>GIF (requires "amp-anim" script in header):<br/>
          <amp-anim src="https://cldup.com/D72zpdwI-i.gif" width="500" height="350"/></p>
      </body>
    </html>`,
};
```
