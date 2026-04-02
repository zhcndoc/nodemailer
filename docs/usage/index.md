---
title: 用法
sidebar_position: 2
description: 快速入门 Nodemailer——安装、创建传输器以及发送邮件。
---

# 用法

本页将演示如何快速启动 Nodemailer。您将学习如何创建一个**传输器**（用于发送邮件的对象）以及如何通过它发送邮件。

## 安装

通过 npm 安装 Nodemailer：

```bash
npm install nodemailer
```

## 创建传输器

**传输器** 是一个处理与邮件服务连接并代表您发送邮件的对象。您只需创建一个传输器，并在所有邮件中重复使用。

```javascript
const nodemailer = require("nodemailer");

// 使用 SMTP 创建传输器
const transporter = nodemailer.createTransport({
  host: "smtp.example.com",
  port: 587,
  secure: false, // 使用 STARTTLS（连接后升级到 TLS）
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});
```

`createTransport(transport[, defaults])` 函数返回一个可复用的传输器实例。

| 参数          | 类型 / 描述                                                                                                                                            |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| **transport** | **对象、字符串或插件**。传入配置对象（如上所示）、连接 URL（例如 `"smtp://user:pass@smtp.example.com:587"`）或已配置好的传输插件。                  |
| **defaults**  | _对象（可选）_。默认值，自动合并到通过此传输器发送的每封邮件中。适用于设置统一的 `from` 地址或自定义头部。                                       |

:::tip 复用您的传输器
在应用启动时**只创建一次**传输器，并在所有邮件中复用。为每封邮件创建新的传输器将浪费资源，因为每个传输器都会打开网络连接并可能进行身份验证。
:::

### 其他传输类型

- **SMTP** - 详见 [SMTP 指南](../smtp/) 获取完整配置选项列表。
- **插件** - Nodemailer 可通过实现了 `send(mail, callback)` 接口的任意传输发送邮件。可参考 [传输插件文档](../transports/) 获取可用选项。

## 验证连接（可选）

发送邮件前，您可以验证 Nodemailer 是否能连接到您的 SMTP 服务器。这有助于提前捕捉配置错误。

```javascript
await transporter.verify();
console.log("服务器已准备好接收邮件");
```

## 发送邮件 {#quick-example}

获得传输器后，调用 `transporter.sendMail(message[, callback])` 发送邮件。

```javascript
(async () => {
  try {
    const info = await transporter.sendMail({
      from: '"Example Team" <team@example.com>', // 发件人地址
      to: "alice@example.com, bob@example.com", // 收件人列表
      subject: "你好", // 邮件主题
      text: "你好，世界？", // 纯文本正文
      html: "<b>你好，世界？</b>", // HTML 正文
    });

    console.log("邮件已发送: %s", info.messageId);
    // 预览 URL 仅在使用 Ethereal 测试账户时可用
    console.log("预览 URL: %s", nodemailer.getTestMessageUrl(info));
  } catch (err) {
    console.error("发送邮件时出错", err);
  }
})();
```

### 参数

| 参数         | 描述                                                                                               |
| ------------ | -------------------------------------------------------------------------------------------------- |
| **message**  | 包含邮件内容和头部的对象。详情请见 [邮件配置](../message/)。                                       |
| **callback** | _(可选)_ 签名为 `(err, info) => {}` 的函数。如果省略，`sendMail` 返回一个 Promise。                  |

大多数传输返回的 `info` 对象包含：

| 属性         | 描述                                                     |
| ------------ | -------------------------------------------------------- |
| `messageId`  | 邮件的 **Message-ID** 头部值。                          |
| `envelope`   | 一个对象，包含 [SMTP 信封](../smtp/envelope) 地址（`from` 和 `to`）。 |
| `accepted`   | 服务器接受的收件人地址数组。                              |
| `rejected`   | 服务器拒绝的收件人地址数组。                              |
| `pending`    | 对于 _direct_ 传输：收到临时错误的地址。                 |
| `response`   | 从 SMTP 服务器接收到的最终响应字符串。                    |

:::info 部分成功
当邮件有多个收件人时，只要**至少一个**收件人地址被服务器接受，该邮件即被视为**已发送**。请检查 `rejected` 数组以查看被拒收的地址。
:::
