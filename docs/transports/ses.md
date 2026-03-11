---
title: SES 传输
sidebar_position: 29
description: 使用官方 AWS SDK v3 通过 Amazon SES 发送邮件。
---

Nodemailer 的 **SES 传输** 允许你通过官方的 AWS SDK v3 包 [@aws-sdk/client-sesv2](https://www.npmjs.com/package/@aws-sdk/client-sesv2) 使用 **Amazon 简单邮件服务（SES）** 发送邮件。  
它作为 [`SendEmailCommand`](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/sesv2/) 的包装器，同时让你继续使用 Nodemailer 中熟悉的 `transporter.sendMail()` API。

有关所有可用传输的概述，请参阅[传输文档](./)。

AWS SES SDK 不包括在 Nodemailer 中，因此你需要单独安装：

```bash
npm install @aws-sdk/client-sesv2
```

## 快速开始

```javascript
const nodemailer = require("nodemailer");
const { SESv2Client, SendEmailCommand } = require("@aws-sdk/client-sesv2");

// 1. 创建 AWS SES 客户端
//    如果省略凭据，SDK 将使用默认凭据链
//    （环境变量，共享凭据文件，IAM 角色等）
const sesClient = new SESv2Client({ region: "us-east-1" });

// 2. 创建一个配置为使用 SES 的 Nodemailer 传输器
const transporter = nodemailer.createTransport({
  SES: { sesClient, SendEmailCommand },
});

// 3. 发送邮件
const info = await transporter.sendMail({
  from: "sender@example.com",
  to: "recipient@example.com",
  subject: "来自 Nodemailer + SES 的问候",
  text: "希望这条消息成功发送！",
  // 你可以在 `ses` 键下传递额外的 SES 特定选项：
  ses: {
    ConfigurationSetName: "my-config-set",
    EmailTags: [{ Name: "tag_name", Value: "tag_value" }],
  },
});

console.log(info.envelope); // { from: "sender@example.com", to: ["recipient@example.com"] }
console.log(info.messageId); // SES 消息 ID
```

:::tip
如果你喜欢，也可以使用回调风格：`transporter.sendMail(mailOptions, callback)`。
:::

## 传输选项

调用 `createTransport()` 时，传入一个带有 `SES` 属性的对象。该 `SES` 对象必须包含以下 **必填** 键：

| 键                  | 类型                 | 描述                                                           |
| ------------------- | -------------------- | -------------------------------------------------------------- |
| `sesClient`         | `SESv2Client`        | 一个已初始化的 AWS SDK v3 SES 客户端实例                        |
| `SendEmailCommand`  | `SendEmailCommand`   | 来自 **@aws-sdk/client-sesv2** 的 `SendEmailCommand` 类        |

:::warning 属性名很重要
该属性 **必须** 命名为 `sesClient` （不能是 `client`、`ses` 或其他名称）。如果你在变量中用不同名字保存客户端，请使用显式属性语法重命名：

```javascript
const myClient = new SESv2Client({ region: "us-east-1" });
const transporter = nodemailer.createTransport({
  SES: { sesClient: myClient, SendEmailCommand }, // 将 myClient 重命名为 sesClient
});
```
:::

## 消息级别选项

调用 `sendMail()` 时，你可以在邮件选项对象中包含一个可选的 **ses** 属性。  
你添加到该对象的任何属性都会直接传递给 AWS `SendEmailCommand`，允许你使用 SES 特定功能，如 `EmailTags`、`ConfigurationSetName`、`FeedbackForwardingEmailAddress` 等。  
详细可用选项请参阅 [AWS SES 文档](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/sesv2/command/SendEmailCommand/)。

## 响应对象

邮件发送成功时，Promise 会解析（或回调会收到）一个包含以下属性的对象：

| 属性         | 描述                                                                                      |
| ------------ | ----------------------------------------------------------------------------------------- |
| `envelope`   | 一个对象，包含表示邮件信封的 `from`（字符串）和 `to`（字符串数组）                        |
| `messageId`  | SES 返回的消息 ID，格式为标准的 Message-ID 头部值                                         |
| `response`   | SES 返回的原始消息 ID 字符串（不含尖括号或域名后缀）                                     |
| `raw`        | 一个 `Buffer`，包含完整原始的 RFC 822 格式消息，发送给 SES                                |

:::note 内存使用
完整的消息（包括附件）会先缓冲在内存中，再发送给 SES。对于带有非常大附件的邮件，确保你的应用有足够的内存可用。
:::

## 速率限制

SES 传输器**不**包含内置的速率限制、排队或并发控制。每次调用 `sendMail()` 都会立即向 AWS 发起发送操作。

如果需要批量发送邮件，必须自行实现速率限制，以遵守 [SES 发送限制](https://docs.aws.amazon.com/ses/latest/dg/manage-sending-quotas.html)。  
AWS SDK v3 会对临时错误自动重试，并采用指数退避策略。

:::tip
对于高发送量，建议使用作业队列（如 Bull、Bee-Queue 或 AWS SQS）来管理发送操作，并遵守 SES 速率限制。
:::

## DKIM 签名

使用 SES 传输结合 [DKIM 签名](../dkim/) 时，Nodemailer 会自动从 DKIM 签名中排除 `Date` 和 `Message-ID` 头部。这是因为 SES 可能会修改这些头部，否则会使签名失效。

```javascript
const transporter = nodemailer.createTransport({
  SES: { sesClient, SendEmailCommand },
  dkim: {
    domainName: "example.com",
    keySelector: "mail",
    privateKey: fs.readFileSync("dkim-private.pem", "utf8"),
  },
});
```

## 故障排除

### “User is not authorized to perform: ses:SendRawEmail”

此错误表示你的 AWS 凭据缺少所需权限。请按以下方法解决：

1. 确认与你凭据相关联的 IAM 用户或角色拥有 **ses:SendRawEmail** 权限。请参阅下面的[最小 IAM 策略示例](#example-2)。
2. 确保你的 **From** 地址（或整个域）已在 [SES 控制台](https://console.aws.amazon.com/ses/) 中完成验证。SES 要求发件人必须先验证。
3. 如果你的 SES 账户仍处于沙箱模式，还必须验证每个收件人地址。申请生产访问可以移除此限制。
4. 极少数情况下，包含特殊字符的 AWS 访问密钥会导致认证失败。如其他均正常，请尝试重新生成访问密钥。

### “Cannot find module '@aws-sdk/client-sesv2'”

AWS SES SDK 未与 Nodemailer 捆绑。你需要单独安装：

```bash
npm install @aws-sdk/client-sesv2
```

### 在 SES 中使用 verify() 方法

SES 传输支持 `transporter.verify()` 方法来验证配置。与[SMTP 传输器](../smtp/) 测试实际连接不同，SES 的 verify 方法会尝试发送一条无效测试消息。如果 SES 返回 `InvalidParameterValue` 或 `MessageRejected` 错误，则视为验证成功，表示配置和凭据有效。

```javascript
// 验证 SES 配置
const isValid = await transporter.verify();
console.log("SES 配置有效:", isValid);
```

## 示例

### 1. 发送邮件 {#example-1}

此示例展示如何使用回调风格发送邮件，适合不使用 async/await 的场景：

```javascript
const nodemailer = require("nodemailer");
const { SESv2Client, SendEmailCommand } = require("@aws-sdk/client-sesv2");

// 使用环境变量 AWS_REGION 创建 SES 客户端
const sesClient = new SESv2Client({ region: process.env.AWS_REGION });

// 创建 Nodemailer 传输器
const transporter = nodemailer.createTransport({
  SES: { sesClient, SendEmailCommand },
});

// 发送邮件
transporter.sendMail(
  {
    from: "sender@example.com",
    to: ["recipient@example.com"],
    subject: "通过 SES 传输发送的邮件",
    text: "希望这条消息成功发送！",
    ses: {
      // 添加标签用于追踪和分析
      EmailTags: [{ Name: "tag_name", Value: "tag_value" }],
    },
  },
  (err, info) => {
    if (err) {
      console.error("发送邮件失败:", err);
      return;
    }
    console.log("邮件发送成功！");
    console.log("信封信息:", info.envelope);
    console.log("消息 ID:", info.messageId);
  }
);
```

### 2. 最小 IAM 策略 {#example-2}

你的 AWS IAM 用户或角色需要调用 `ses:SendRawEmail` 的权限。以下是所需的最小 IAM 策略示例：

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "ses:SendRawEmail",
      "Resource": "*"
    }
  ]
}
```

对于生产环境，建议将 `Resource` 限制为特定已验证身份，而非使用通配符 `"*"`。
