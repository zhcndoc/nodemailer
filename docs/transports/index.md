---
title: 其他传输方式
sidebar_position: 5
description: 替代的邮件发送机制 - sendmail、SES、流和社区传输方式。
---

# 其他传输方式

Nodemailer 内置了一个功能完善的 [SMTP 传输](../smtp/)，默认启用，但你并不局限于 SMTP。_传输方式_ 是 Nodemailer 用来发送构建完成的邮件消息的机制。这可以是将消息通过管道传递给本地的 `sendmail` 二进制程序，或者通过 HTTPS API（如 Amazon SES）发送，亦或是你选择的任何其他发送方式。

本页列出了 Nodemailer 内置的传输方式以及受欢迎的社区维护的传输方式。如果这些都不符合你的需求，你可以按照 [传输接口文档](../plugins/create/#transports) 创建你自己的传输方式。

---

## 示例：Amazon SES 传输

以下示例展示了如何使用内置的 SES 传输通过 [Amazon SES](https://aws.amazon.com/ses/) 发送邮件。这个传输使用官方 **AWS SDK v3** 客户端来与 SES API 通信。

```bash title="安装依赖"
npm install nodemailer @aws-sdk/client-sesv2
```

```javascript title="send-with-ses.js"
const nodemailer = require("nodemailer");
const { SESv2Client, SendEmailCommand } = require("@aws-sdk/client-sesv2");

// 创建 SES 客户端。使用环境变量、共享凭据文件或 IAM 角色配置你的 AWS 凭据和区域。
const sesClient = new SESv2Client({});

// 创建一个使用 SES 客户端的 Nodemailer 传输方式。
// 属性必须命名为 "SES"（区分大小写），且必须包含 sesClient 实例和 SendEmailCommand 类。
const transporter = nodemailer.createTransport({
  SES: { sesClient, SendEmailCommand },
});

// 使用标准的 Nodemailer sendMail 接口发送邮件
(async () => {
  await transporter.sendMail({
    from: "you@example.com",
    to: "friend@example.net",
    subject: "来自 SES 的问候",
    text: "此消息由 Nodemailer 和 Amazon SES 发送！",
  });
})();
```

---

## 可用传输方式

### 内置（默认）传输方式

这些传输方式随 Nodemailer 一起包含，无需额外安装包。

| 传输方式       | 作用                                                                                  | 参考文档                     |
| -------------- | ------------------------------------------------------------------------------------- | ---------------------------- |
| **SMTP**       | 默认传输方式。连接到 SMTP 服务器发送邮件。                                           | [文档](/smtp/)               |
| **sendmail**   | 将生成的邮件消息通过管道传递给服务器上的本地 `sendmail` 兼容二进制程序。              | [文档](/transports/sendmail) |
| **SES**        | 使用 AWS SDK v3 通过 Amazon SES API 发送邮件。                                       | [文档](/transports/ses)      |
| **stream**     | 返回生成的 RFC 5322 格式邮件消息的流，而非发送邮件。适用于测试或自定义处理。           | [文档](/transports/stream)   |
| **JSON**       | 返回邮件消息的 JSON 表示，而不发送邮件。适用于调试、存储邮件或转发给其他系统。       | [文档](/transports/stream#json-transport) |

### 社区传输方式

这些传输方式由社区维护，作为独立的 npm 包发布。使用 `npm install` 安装后，将它们导出的函数传给 `nodemailer.createTransport()` 使用。

- **Mailtrap** - 将邮件投递到你的 Mailtrap 收件箱，实现安全的邮件测试且不发送给真实收件人 ([npm](https://github.com/railsware/mailtrap-nodejs#nodemailer-transport))
- **Mailgun** - 通过 Mailgun 的 HTTP API 发送邮件 ([npm](https://www.npmjs.com/package/nodemailer-mailgun-transport))
- **Custom** - 构建你自己的传输方式以实现特定业务逻辑。参见 [创建自定义传输](../plugins/create/#transports)。

:::note
第三方传输方式并非由 Nodemailer 团队维护。请阅读各项目的 README 了解安装说明和使用细节。
:::

---

## 通用传输选项

虽然每种传输方式有各自的配置选项，下面的选项适用于**所有**传输方式。将这些选项设置在传入 `createTransport()` 的配置对象中。

| 选项                     | 类型       | 描述                                                                                                                                                                                                                         |
| ------------------------ | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `attachDataUrls`          | `Boolean`  | 设置为 `true` 时，Nodemailer 会自动将 HTML 内容中发现的内嵌 `data:` URI 转换成嵌入式附件。当你的 HTML 中含有 base64 编码的图片时，这非常有用。                                                                            |
| `disableFileAccess`       | `Boolean`  | 设置为 `true` 时，禁止 Nodemailer 在解析附件或 HTML 图片时访问文件系统。处理不可信消息内容时可启用此选项以增强安全性。                                                                                                       |
| `disableUrlAccess`        | `Boolean`  | 设置为 `true` 时，禁止 Nodemailer 在解析附件或 HTML 图片时发起 HTTP/HTTPS 请求。处理不可信消息内容时可启用此选项以增强安全性。                                                                                               |
| `normalizeHeaderKey(key)` | `Function` | 在将每个邮件头添加到生成的 RFC 5322 消息前调用的回调函数。用于自定义邮件头的格式。 [示例](https://github.com/nodemailer/nodemailer/blob/3e3ba4f30ad5a73f037f45d3e36a9361ca43a318/examples/custom-headers.js#L13-L14) |
