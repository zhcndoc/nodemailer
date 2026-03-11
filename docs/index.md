---
title: Nodemailer
sidebar_position: 1
description: 使用 Node.JS 发送电子邮件 —— 简单如蛋糕，无需运行时依赖。
---

# Nodemailer

**从 Node.js 发送电子邮件 —— 简单如蛋糕！✉️**

Nodemailer 是 Node.js 中最流行的电子邮件发送库。它使发送电子邮件变得简单且安全，无需管理任何运行时依赖。

```bash title="使用 npm 安装"
npm install nodemailer
```

:::tip 寻找完整的邮箱网关解决方案？
[**EmailEngine**](https://emailengine.app/?utm_source=nodemailer&utm_campaign=nodemailer&utm_medium=tip-link) 是一款自托管的邮箱网关，提供对 IMAP 和 SMTP 账户的 REST API 访问，邮箱变更的 webhook 以及 OAuth2、延迟投递、打开和点击跟踪、退信检测等高级功能。
:::

## 为什么选择 Nodemailer？

- **零运行时依赖** - 所有所需功能都包含在一个维护良好的单一包中。
- **安全为重** - 设计避免了影响其他 Node.js 邮件库的远程代码执行漏洞。
- **完整的 Unicode 支持** - 可发送包含任何字符的邮件，包括表情符号 💪。
- **跨平台支持** - 在 Linux、macOS 和 Windows 上表现一致，无需本地插件（适合 Azure 等云环境）。
- **HTML 与纯文本邮件** - 发送富 HTML 邮件，并自动生成纯文本备用内容。
- **[附件](./message/attachments/)** 与 **[嵌入图片](./message/embedded-images/)** - 轻松将文件和内联图片加入邮件中。
- **内建 TLS/STARTTLS 加密** - 自动处理安全连接。
- **多种 [传输方式](./transports/)** - 通过 [SMTP](./smtp/)、[Sendmail](./transports/sendmail/)、[Amazon SES](./transports/ses/)、[流传输](./transports/stream/) 等多种方式发送。
- **[DKIM 签名](./dkim/)** 与 **[OAuth2 认证](./smtp/oauth2/)** - 企业级邮件认证。
- **[代理支持](./smtp/proxies/)** - 通过代理路由邮件，适用于受限网络环境。
- **[插件 API](./plugins/)** - 通过 [自定义插件](./plugins/create/) 扩展功能，实现高级邮件处理。
- **集成 [Ethereal.email](https://ethereal.email)** - 即刻生成测试账户，便于 [本地开发和测试](./smtp/testing/)。

## 要求

- **Node.js v6.0.0 或更高版本**（使用 async/await 的示例需要 Node.js v8.0.0 或更高版本）。

无需额外的系统库、服务或构建工具。

## 快速开始

使用 Nodemailer 发送邮件只需三个简单步骤：

1. **创建传输器** —— 配置你的 [SMTP 服务器](./smtp/)或其他支持的[传输方式](./transports/)。
2. **编写邮件** —— 定义发件人、收件人、主题及[内容](./message/)。
3. **发送邮件** —— 调用 `transporter.sendMail()` 并传入邮件选项。

### 示例：使用 Ethereal 发送邮件

[Ethereal](https://ethereal.email) 是一款免费服务，捕获发送的邮件用于[测试](./smtp/testing/)。邮件不会真正送达，非常适合开发使用。

```javascript
const nodemailer = require("nodemailer");

// 使用 Ethereal 测试凭证创建传输器。
// 生产环境请替换为实际 SMTP 服务器信息。
const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  secure: false, // 端口 465 使用 true，端口 587 使用 false
  auth: {
    user: "maddison53@ethereal.email",
    pass: "jn7jnAPss4f63QBp6D",
  },
});

// 使用 async/await 发送邮件
(async () => {
  const info = await transporter.sendMail({
    from: '"Maddison Foo Koch" <maddison53@ethereal.email>',
    to: "bar@example.com, baz@example.com",
    subject: "Hello ✔",
    text: "Hello world?", // 邮件纯文本版本
    html: "<b>Hello world?</b>", // 邮件 HTML 版本
  });

  console.log("邮件已发送:", info.messageId);
})();
```

:::tip
Ethereal 会为每封发送的邮件提供预览 URL，允许你在浏览器中查看邮件渲染效果。这对于开发期间测试邮件布局和内容非常有价值。
:::

## 源代码与许可证

Nodemailer 是开源软件，采用 [MIT 无归属许可证 (MIT-0)](./license) 授权。这意味着你可以自由在任何项目中使用，无需注明出处。在 [GitHub](https://github.com/nodemailer/nodemailer) 浏览源代码。

---

由 [Andris Reinman](https://github.com/andris9) 用 ❤️ 制作。Logo 由 [Sven Kristjansen](https://www.behance.net/kristjansen) 设计。
