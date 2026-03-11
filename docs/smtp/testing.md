---
title: 测试 SMTP
sidebar_position: 22
description: 使用 Ethereal Email 邮件捕获服务测试邮件发送，避免真实收件箱收到垃圾邮件。
---

在开发或持续集成环境中测试邮件功能时，需要避免意外将邮件发送到真实收件箱。与其将所有邮件重定向到单个测试地址，推荐的做法是使用 _邮件捕获器_ 服务。邮件捕获器像生产邮件服务一样通过 SMTP 接收邮件，但它**从不将邮件投递给实际收件人**。相反，它会存储邮件，方便你之后查看或下载。

作为替代测试方案，你还可以使用 [stream transport](../transports/stream) 来捕获生成的邮件，而无需任何网络连接，或者使用 [smtp-server](../extras/smtp-server) 运行自己的本地邮件服务器。

Nodemailer 内置支持 [Ethereal Email](https://ethereal.email/)，这是一个专为测试设计的免费邮件捕获服务。你有两个选项：

- 使用 `nodemailer.createTestAccount()` **以编程方式创建临时账户**，或
- 通过 Ethereal 的网页控制台 **创建持久化测试邮箱**。

如果你偏好完全离线工作，可以使用 [forwardemail/email-templates](https://github.com/forwardemail/email-templates) 在本地预览邮件，它会通过 [preview-email](https://github.com/forwardemail/preview-email) 在浏览器或 iOS 模拟器中渲染每封邮件。

## 快速开始

如果尚未安装 Nodemailer，请先安装：

```bash
npm install nodemailer
```

### 1. 创建临时 Ethereal 账户

以下示例展示了如何创建测试账户、配置传输器并发送邮件：

```javascript
// ./mail.js
const nodemailer = require("nodemailer");

nodemailer.createTestAccount((err, account) => {
  if (err) {
    console.error("创建测试账户失败。 " + err.message);
    return;
  }

  // 使用 Ethereal 测试账户凭据创建传输器
  const transporter = nodemailer.createTransport({
    host: account.smtp.host,
    port: account.smtp.port,
    secure: account.smtp.secure,
    auth: {
      user: account.user,
      pass: account.pass,
    },
  });

  // 发送测试邮件
  transporter
    .sendMail({
      from: "示例应用 <no-reply@example.com>",
      to: "user@example.com",
      subject: "来自测试的问候",
      text: "这封邮件来自 Node.js 集成测试。",
    })
    .then((info) => {
      console.log("邮件已发送: %s", info.messageId);
      // 获取邮件在 Ethereal 网页界面中的预览链接
      console.log("预览链接: %s", nodemailer.getTestMessageUrl(info));
    })
    .catch(console.error);
});
```

:::tip
Ethereal 会在账户 **48 小时未使用** 后自动删除账户。如果你需要后续查看邮件，请保存生成的凭据，或通过 Ethereal 控制台创建持久账户。
:::

### 2. 根据环境切换传输方式

一个常见模式是在一个地方集中管理传输配置。这样可以在开发和测试时使用 Ethereal，而在生产环境使用真实邮件服务。关于 SMTP 配置选项的更多细节，请参见 [SMTP transport](./index.md) 文档。

```javascript
// ./mail-transport.js
const nodemailer = require("nodemailer");

function createTransport() {
  if (process.env.NODE_ENV === "production") {
    // 生产环境：发送真实邮件
    return nodemailer.createTransport({
      host: "smtp.sendgrid.net",
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  // 开发/测试环境：使用 Ethereal 捕获邮件
  return nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: process.env.ETHEREAL_USERNAME,
      pass: process.env.ETHEREAL_PASSWORD,
    },
  });
}

module.exports = createTransport;
```

你的应用代码随后即可直接使用传输器，而无需关心所使用的服务：

```javascript
const createTransport = require('./mail-transport');
const transporter = createTransport();

await transporter.sendMail({...});
```

### 3. 查看邮件内容

`sendMail` 成功完成后，返回的 `info` 对象包含定位 Ethereal 邮件所需的所有信息：

```javascript
const info = await transporter.sendMail(message);

console.log("预览链接: %s", nodemailer.getTestMessageUrl(info));
// 示例输出: https://ethereal.email/message/WaQKMgKddxQDoou
```

你也可以直接在 Ethereal 控制台的 **Messages** 页面浏览邮件。

---

下面是 Ethereal 网页界面中捕获邮件的示例截图。

![Ethereal 邮件预览截图](https://cldup.com/D5Cj_C1Vw3.png)
