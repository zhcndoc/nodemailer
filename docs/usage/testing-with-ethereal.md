---
title: 使用 Ethereal 进行测试
sidebar_position: 3
description: 使用 Ethereal.email 测试发送邮件而不发送给真实收件人。
---

# 使用 Ethereal 进行测试

[Ethereal](https://ethereal.email/) 是一个免费的假 SMTP 服务，专为测试 Nodemailer 和其他发送邮件应用设计。发送到 Ethereal 的邮件会被捕获并显示在网页界面中，但**永远不会发送**给真实收件人。这使得 Ethereal 非常适合开发、测试和调试。

## 为什么选择 Ethereal？

- **不发送真实邮件**——可以自由测试，无需担心误发给客户或同事
- **即时预览**——发送后即可在基于网页的收件箱中查看邮件
- **无需麻烦配置**——Nodemailer 可自动生成凭据
- **免费使用**——无需注册，开发使用的限速合理

## 自动测试账户

Nodemailer 内置支持动态创建 Ethereal 测试账户。调用 `nodemailer.createTestAccount()` 即可生成临时凭据：

```javascript
const nodemailer = require("nodemailer");

// 自动创建测试账户
const testAccount = await nodemailer.createTestAccount();

// 使用测试账户创建传输器
const transporter = nodemailer.createTransport({
  host: testAccount.smtp.host,
  port: testAccount.smtp.port,
  secure: testAccount.smtp.secure,
  auth: {
    user: testAccount.user,
    pass: testAccount.pass,
  },
});
```

返回的 `testAccount` 对象包含：

| 属性         | 说明                             |
| ------------ | ------------------------------- |
| `user`       | 生成的邮箱地址                   |
| `pass`       | SMTP 认证密码                   |
| `smtp.host`  | SMTP 服务器主机名               |
| `smtp.port`  | SMTP 服务器端口                 |
| `smtp.secure`| 是否从一开始使用 TLS            |
| `web`        | Ethereal 网页接口的 URL         |

:::tip 复用凭据
每次调用 `createTestAccount()` 都会生成一个新账户。如果想在一个收件箱查看所有测试邮件，请保存凭据并跨测试运行复用。
:::

## 预览已发送邮件

通过 Ethereal 发送邮件后，使用 `nodemailer.getTestMessageUrl(info)` 获取直接链接，在浏览器中查看邮件内容：

```javascript
const info = await transporter.sendMail({
  from: '"Test Sender" <test@example.com>',
  to: "recipient@example.com",
  subject: "测试邮件",
  text: "这是一封通过 Ethereal 发送的测试邮件！",
  html: "<p>这是一封通过 <b>Ethereal</b> 发送的测试邮件！</p>",
});

console.log("邮件已发送: %s", info.messageId);

// 获取 Ethereal 的预览链接
const previewUrl = nodemailer.getTestMessageUrl(info);
console.log("预览链接: %s", previewUrl);
// 输出示例：https://ethereal.email/message/...
```

在浏览器打开预览链接，可以查看邮件的完整内容，包括：

- 头部信息（发件人、收件人、主题、日期等）
- 纯文本和 HTML 邮件正文
- 附件
- 原始邮件源代码

## 完整示例

下面是一个完整示例，创建测试账户，发送邮件，并输出预览链接：

```javascript
const nodemailer = require("nodemailer");

async function sendTestEmail() {
  // 创建测试账户
  const testAccount = await nodemailer.createTestAccount();

  console.log("测试账户创建成功：");
  console.log("  用户名: %s", testAccount.user);
  console.log("  密码: %s", testAccount.pass);

  // 创建传输器
  const transporter = nodemailer.createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  // 发送测试邮件
  const info = await transporter.sendMail({
    from: `"测试应用" <${testAccount.user}>`,
    to: "recipient@example.com",
    subject: "来自 Ethereal 的问候！",
    text: "这封邮件是通过 Ethereal 发送的。",
    html: "<p>这封邮件是通过 <b>Ethereal</b> 发送的。</p>",
  });

  console.log("邮件已发送: %s", info.messageId);
  console.log("预览链接: %s", nodemailer.getTestMessageUrl(info));
}

sendTestEmail().catch(console.error);
```

运行该脚本会输出类似内容：

```
测试账户创建成功：
  用户名: abc123@ethereal.email
  密码: XyZ789AbCdEf
邮件已发送: <abc123@ethereal.email>
预览链接: https://ethereal.email/message/AbCdEfGhIjKl
```

## 使用服务快捷方式

如果你已有 Ethereal 凭据，也可以跳过 `createTestAccount()`，直接使用 `service: "Ethereal"` 作为快捷方式：

```javascript
const transporter = nodemailer.createTransport({
  service: "Ethereal",
  auth: {
    user: "existing-user@ethereal.email",
    pass: "existing-password",
  },
});
```

## 与测试框架集成

Ethereal 可与 Jest、Mocha 等测试框架很好地结合。可以在测试初始化时创建一次测试账户并复用：

```javascript
const nodemailer = require("nodemailer");

let transporter;
let testAccount;

beforeAll(async () => {
  testAccount = await nodemailer.createTestAccount();
  transporter = nodemailer.createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
});

test("发送欢迎邮件", async () => {
  const info = await transporter.sendMail({
    from: "app@example.com",
    to: "newuser@example.com",
    subject: "欢迎！",
    text: "感谢注册。",
  });

  expect(info.messageId).toBeDefined();
  expect(info.accepted).toContain("newuser@example.com");

  // 可选：打印预览链接以便人工查看
  console.log("预览链接:", nodemailer.getTestMessageUrl(info));
});
```

## 与其它测试选项比较

| 选项           | 是否真实发送 | 收件箱预览   | 需不需要配置   |
| -------------- | ------------ | ------------ | -------------- |
| **Ethereal**   | 否           | 是           | 无（自动生成） |
| [Mailtrap](https://mailtrap.io/) | 否  | 是           | 需要注册       |
| [Mailhog](https://github.com/mailhog/MailHog) | 否 | 是 | 需本地安装     |
| 真实 SMTP      | 是           | 不适用       | 需提供商账号   |

Ethereal 非常适合快速开发和测试。若需要团队协作或 CI/CD 流程，推荐使用 Mailtrap 或自托管方案如 Mailhog。
