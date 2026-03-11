---
title: 地址对象
sidebar_position: 13
description: 电子邮件地址格式 - 纯字符串、带显示名称的格式化地址，或对象表示法。
---

Nodemailer 支持 **三种可互换的地址格式**。你可以在任意地址字段中使用这些格式中的任意一种（或混合使用），包括 `from`、`to`、`cc`、`bcc`、`replyTo` 和 `sender`。有关消息字段的完整列表，请参见 [消息配置](./index.md)。

## 1. 纯电子邮件地址

最简单的格式就是直接使用电子邮件地址字符串：

```javascript
"foobar@example.com"
```

---

## 2. 格式化地址（显示名称 + 邮箱）

要同时包含显示名称和电子邮件地址，可使用标准的邮箱格式，带尖括号。Nodemailer 完全支持显示名称中的 Unicode 字符：

```javascript
"Ноде Майлер <foobar@example.com>"
```

:::tip 处理逗号及特殊字符
由于地址字段用逗号分隔多个收件人，显示名称中包含逗号（或其他特殊字符如分号）时，必须用双引号将其括起来：

```javascript
'"Майлер, Ноде" <foobar@example.com>'
```

如果不加双引号，Nodemailer 会错误地将逗号识别为两个地址间的分隔符。
:::

---

## 3. 地址对象

最可靠的方式是传递一个包含 `name` 和 `address` 属性的纯 JavaScript 对象。这样可以让 Nodemailer 自动处理所有转义和格式化，无需你担心特殊字符：

```javascript
{
  name: "Майлер, Ноде",
  address: "foobar@example.com"
}
```

这两个属性都是可选的。如果省略 `name`，则只使用电子邮件地址。如果省略 `address`，该条目会被忽略。

---

## 混合格式及使用数组

每个地址字段都支持以下任意输入类型：

- **单个地址**（以上三种格式中的任意一种）
- **以逗号分隔的字符串**，包含多个地址
- **地址数组**（数组中的每个元素可以是任意格式）
- **混合数组**，同时包含逗号分隔的字符串和地址对象

这种灵活性使你能根据应用需求，自由组织地址数据。

```javascript
const message = {
  // 单个格式化的地址字符串
  from: '"Example Sender" <sender@example.com>',

  // 多个收件人的逗号分隔字符串
  to: 'foobar@example.com, "Ноде Майлер" <bar@example.com>, "Name, User" <baz@example.com>',

  // 地址字符串数组
  cc: [
    "first@example.com",
    '"Ноде Майлер" <second@example.com>',
    '"Name, User" <third@example.com>'
  ],

  // 混合数组：字符串和地址对象混合
  bcc: [
    "hidden@example.com",
    {
      name: "Майлер, Ноде",
      address: "another@example.com"
    }
  ]
};
```

---

## 国际化电子邮件地址

Nodemailer 支持包含非 ASCII 字符的国际化域名 (IDN)。当你提供 Unicode 域名时，Nodemailer 会自动将其转换为符合邮件协议要求的 ASCII 兼容的 [Punycode](https://en.wikipedia.org/wiki/Punycode) 编码：

```javascript
"андрис@уайлддак.орг"
// Nodemailer 会将域名转换为 punycode：андрис@xn--80aalaxjd5d.xn--c1avg
```

### Unicode 用户名（EAI/SMTPUTF8）

如果电子邮件地址的本地部分（@ 符号前的用户名）包含非 ASCII 字符，收件服务器必须支持 SMTPUTF8 扩展。Nodemailer 会自动检测是否使用了国际化用户名，并在 `MAIL FROM` 命令中发送 `SMTPUTF8` 参数。有关 SMTP 信封处理的更多信息，请参见 [SMTP 信封](../smtp/envelope.md)。

如果服务器未声明支持 SMTPUTF8，则消息会以 `EENVELOPE` 错误被拒绝，以防投递失败。

---

## 完整示例

下面的示例演示如何同时使用多种地址格式发送电子邮件。有关配置 SMTP 传输选项的更多信息，请参见 [SMTP 传输](../smtp/index.md)。

```javascript
const nodemailer = require("nodemailer");

async function sendEmail() {
  // 创建一个包含 SMTP 服务器设置的传输
  const transport = nodemailer.createTransport({
    host: "smtp.example.com",
    port: 587,
    auth: {
      user: "smtp-user",
      pass: "smtp-pass"
    }
  });

  // 使用混合地址格式发送邮件
  await transport.sendMail({
    from: '"Example Sender" <sender@example.com>',
    to: [
      "recipient@example.com",                              // 纯地址
      { name: "Nodemailer User", address: "user@example.com" }  // 地址对象
    ],
    subject: "Hello from Nodemailer",
    text: "This demonstrates the different address formats."
  });
}

sendEmail().catch(console.error);
```
