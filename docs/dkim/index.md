---
title: DKIM
sidebar_position: 7
description: 为发出的邮件添加加密的 DKIM 签名以验证域名。
---

# DKIM 签名

DomainKeys Identified Mail（DKIM）会为每封发出的邮件添加一个加密签名。该签名允许接收邮件服务器验证邮件确实来自**您的**域名，并且在传输过程中未被篡改。

Nodemailer 可以使用一个或多个 DKIM 密钥为邮件签名，**无需**任何额外依赖。在大多数情况下，签名过程快速且完全在内存中处理。对于非常大的邮件，您可以选择启用磁盘缓存，这样只有前 _cacheTreshold_ 字节数据存储在内存中。

---

## 配置

您可以用两种方式配置 DKIM 签名：

- **全局传输配置** —— 通过传输器发送的每封邮件都会自动用相同的密钥签名，**或者**
- **单独邮件配置** —— 在[邮件配置](../message/)中传入 `dkim` 对象以覆盖或替代传输级别的设置。

如果在两个级别都指定了 DKIM 设置，**邮件级别设置优先**。

### DKIM 选项

| 选项               | 类型                                               | 默认值             | 描述                                                                                                                                                       |
| ------------------ | ------------------------------------------------- | ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `domainName`       | `string`（必填）                                  | -                  | 要签名的域名。此值显示在 DKIM 签名头部的 `d=` 标签中。                                                                                                   |
| `keySelector`      | `string`（必填）                                  | -                  | 您的 DKIM 密钥的 DNS 选择器。用于 DNS TXT 记录查询路径的一部分：`<selector>._domainkey.<domain>`。                                                       |
| `privateKey`       | `string \| Buffer`（必填）                        | -                  | 您的 PEM 格式私钥。必须与 DNS TXT 记录中发布的公钥对应。                                                                                                 |
| `keys`             | `Array< {domainName, keySelector, privateKey} >` | -                  | 用于多密钥签名的密钥对象数组（适用于密钥轮换或为多个子域签名）。设置该项时，上面单密钥的字段会被忽略。                                                  |
| `hashAlgo`         | `'sha256' \| 'sha1'`                             | `'sha256'`         | 用于正文哈希的哈希算法。除非有特定需求，一般使用 `sha256`。                                                                                            |
| `headerFieldNames` | `string`                                         | RFC 4871 默认值    | 以冒号分隔的需包含在签名中的邮件头字段列表（例如 `from:to:subject`）。默认情况下，Nodemailer 签名 RFC 4871 推荐的标准邮件头。                           |
| `skipFields`       | `string`                                         | -                  | 以冒号分隔的需**排除**在签名之外的邮件头字段列表。当您的邮件服务提供商在签名后修改某些头部字段时使用（例如 `message-id:date`）。                       |
| `cacheDir`         | `string \| false`                                | `false`            | 处理大邮件时用于临时文件的目录路径。设置为 `false` 可完全禁用磁盘缓存。                                                                                |
| `cacheTreshold`    | `number`                                         | `2097152`（2 MB） | 在切换至磁盘缓存前，内存中保留的字节数。仅当 `cacheDir` 设置为有效路径时生效。                                                                         |

:::warning
选项 `cacheTreshold` 的拼写故意写为“treshold”（带有 "o" 而非 "e"），以保证与旧版本 Nodemailer 的向后兼容性。
:::

---

## 使用示例

以下示例使用 CommonJS 语法，需 **Node.js v6** 或更高版本：

```javascript
const nodemailer = require("nodemailer");
const fs = require("fs");
```

### 1. 对每封邮件签名

此示例在传输器级别配置 DKIM 签名，因此通过此传输器发送的所有邮件都会自动被签名：

```javascript
const transporter = nodemailer.createTransport({
  host: "smtp.example.com",
  port: 465,
  secure: true,
  dkim: {
    domainName: "example.com",
    keySelector: "2017",
    privateKey: fs.readFileSync("./dkim-private.pem", "utf8"),
  },
});
```

要验证您的 DNS 记录配置是否正确，请运行：

```bash
dig TXT 2017._domainkey.example.com
```

### 2. 使用多个密钥签名

当轮换 DKIM 密钥或代表不同子域发送邮件时，可以使用多个密钥：

```javascript
const transporter = nodemailer.createTransport({
  host: "smtp.example.com",
  port: 465,
  secure: true,
  dkim: {
    keys: [
      {
        domainName: "example.com",
        keySelector: "2017",
        privateKey: fs.readFileSync("./dkim-2017.pem", "utf8"),
      },
      {
        domainName: "example.com",
        keySelector: "2016",
        privateKey: fs.readFileSync("./dkim-2016.pem", "utf8"),
      },
    ],
    cacheDir: false, // 禁用磁盘缓存
  },
});
```

### 3. 仅为特定邮件签名

如果不希望对所有邮件签名，可以在单独邮件中配置 DKIM：

```javascript
const transporter = nodemailer.createTransport({
  host: "smtp.example.com",
  port: 465,
  secure: true,
  // 此处无 DKIM 配置
});

const info = await transporter.sendMail({
  from: "sender@example.com",
  to: "recipient@example.com",
  subject: "Hello with DKIM",
  text: "I hope this message gets read!",
  dkim: {
    domainName: "example.com",
    keySelector: "2017",
    privateKey: fs.readFileSync("./dkim-private.pem", "utf8"),
  },
});
```

### 4. 对大邮件启用磁盘缓存

发送带大附件的邮件时，可以启用磁盘缓存以减少内存使用。Nodemailer 会将超出阈值的邮件内容存储到临时文件中：

```javascript
const transporter = nodemailer.createTransport({
  host: "smtp.example.com",
  port: 465,
  secure: true,
  dkim: {
    domainName: "example.com",
    keySelector: "2017",
    privateKey: fs.readFileSync("./dkim.pem", "utf8"),
    cacheDir: "/tmp",
    cacheTreshold: 100 * 1024, // 100 KB
  },
});
```

### 5. 跳过可变的邮件头

一些邮件服务商，例如 **[Amazon SES](../transports/ses)**，会在您提交邮件后替换诸如 `Message-ID` 和 `Date` 的邮件头。如果这些头部包含在 DKIM 签名中，则验证会失败。使用 `skipFields` 排除它们。

:::tip
使用 [SES 传输器](../transports/ses) 时，Nodemailer 会自动将 `date:message-id` 添加到 `skipFields`。
:::

```javascript
const transporter = nodemailer.createTransport({
  host: "smtp.example.com",
  port: 465,
  secure: true,
  dkim: {
    domainName: "example.com",
    keySelector: "2017",
    privateKey: fs.readFileSync("./dkim.pem", "utf8"),
    skipFields: "message-id:date",
  },
});
```

---

## 故障排查

- **签名验证失败** —— 确认您的公钥已正确发布于 DNS 的 `<keySelector>._domainkey.<domainName>` 处。还要检查 TXT 记录**每条字符串不超过 255 个字符**（部分 DNS 服务商会错误地拆分或截断过长记录）。
- **邮件头不匹配错误** —— 如果接收服务器报告签名头部不匹配，可将出错的头部添加到 `skipFields`，或确保发送基础设施在签名后不修改邮件头。
- **需要更多帮助？** 使用在线工具测试您的 DKIM 配置，例如 [dkimvalidator.com](https://dkimvalidator.com) 或 [mail-tester.com](https://www.mail-tester.com)。这些服务会发送测试邮件并提供您 DKIM 设置的详细反馈。
