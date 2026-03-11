---
title: 使用 Gmail
sidebar_position: 8
description: 通过 Gmail 使用 OAuth2 或应用密码发送邮件，并附带重要注意事项。
---

> **简要说明** 对于新项目，使用 **OAuth 2.0**（如果已有 Google 双重验证开启，可以使用应用密码）。Google 已于 **2022 年 5 月 30 日** 永久禁用“低安全应用访问”。

Gmail 通常是用 Nodemailer 发送测试邮件最快捷的方式，但 _不_建议用于生产环境。Gmail 设计给个人用户而非自动化服务，Google 的安全系统会主动监控可疑登录行为。当 Google 发现类似账号劫持的行为（例如你的生产服务器从与你平常位置不同的国家连接），会阻止 SMTP 连接并阻止邮件发送。

本指南涵盖支持的认证方式、Gmail 的发送限制以及开发者常见问题。

---

## 1. 选择认证方式

| 方式                       | 适用场景                                                                                                         | 状态                           |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| **OAuth 2.0**              | 推荐用于所有新集成。兼容个人 Gmail 账户**及**Google Workspace。                                                  | 支持                           |
| **应用密码**               | 仅在账户启用**双重验证**时可用。相比 OAuth 2.0，适用于小型内部工具更简单。                                         | 支持                           |
| “低安全应用”密码           | 一种已废弃的机制，支持基本认证登录。                                                                             | 自 2022 年 5 月 30 日起禁用    |

### OAuth 2.0（推荐）

OAuth 2.0 是最安全可靠的 Gmail 认证方式。无需存储密码，完成一次授权流程后存储 `refreshToken`，Nodemailer 会根据需要自动刷新访问令牌。

```js
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail", // Gmail SMTP 设置的快捷方式 - 详见知名服务（Well-Known Services）
  auth: {
    type: "OAuth2",
    user: "me@gmail.com",
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
  },
});
```

`service: "gmail"` 选项是方便快捷的配置，会自动设置 Gmail 的 SMTP 服务器参数。详见 [知名服务](../smtp/well-known-services) 获取更多信息和完整支持列表。

:::info Google Workspace SMTP 中继
如果你使用 **Google Workspace**，且需要使用自定义地址发送邮件且不被 Gmail 改写 `From:` 头，建议使用专用的 `"GmailWorkspace"` 服务。它连接到 `smtp-relay.gmail.com`，支持以 Workspace 域中的任意地址发送邮件。设置说明请参考 Google 的 [SMTP relay service 文档](https://support.google.com/a/answer/176600)。

```js
const transporter = nodemailer.createTransport({
  service: "GmailWorkspace",
  auth: {
    user: "me@mydomain.com",
    pass: process.env.GOOGLE_APP_PASSWORD,
  },
});
```
:::

关于如何设置 OAuth 2.0 凭据（含如何获取 Client ID、Client Secret 和 Refresh Token）的完整教程，请参见专门指南：[SMTP / OAuth 2.0](../smtp/oauth2)。

### 应用密码（需要启用双重验证）

若 Google 账户启用了双重验证，可以为 Nodemailer 生成一个 16 位的应用密码。此密码和一般 SMTP 密码效果相似，但与主账号密码分开。

创建应用密码步骤：

1. 访问你的 [Google 账户安全设置](https://myaccount.google.com/security)
2. 在“登录 Google”部分选择 **应用密码**（必须启用双重验证才能看到该选项）
3. 为“邮件”生成新的应用密码
4. 复制这16位密码，配置使用

```js
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "me@gmail.com",
    pass: process.env.GOOGLE_APP_PASSWORD, // 你的16位应用密码
  },
});
```

应用密码绕过了 Google 大部分额外的安全检查，但 Google 仍可能阻止来自异常地区或可疑 IP 段的连接。

---

## 2. Gmail 注意事项

### Gmail 会重写 From: 头

Gmail _总是_ 用认证账户的邮箱地址替换发送者地址。如果你以 `foo@example.com` 认证，但 `from` 字段设置了 `bar@example.com`，Gmail 会悄悄将其替换为 `foo@example.com`。

如果需要使用不同的发件地址，有两种方式：

- 在 Gmail 设置中添加 **别名**
- 在 Google Workspace 中配置 **代表发送** 地址

### 每日发送限制

Gmail 对 24 小时内可发送的收件人数严格限制：

- **个人 Gmail 账户：** 24 小时内最多 **500** 个收件人
- **Google Workspace 账户：** 24 小时内最多 **2000** 个收件人

每个收件人都单独计数，不论你发了多少邮件。例如，一封邮件的一个收件人和一个抄送，计作**2个收件人**。

超过限制时 Gmail 会返回 SMTP 错误 **454 4.7.0**（“Too many recipients”）。必须等待配额重置后，再继续发送。

---

## 3. 生产环境替代方案

若需更高量级可靠投递，建议更换专用邮件服务商，如 SendGrid、Postmark、[Amazon SES](../transports/ses) 或 Mailgun。这些服务针对自动化发送设计，优势包括：

- 不会用严格登录安全阻止合法服务器连接
- 更高发送额度（多数免费额度每日 100-300 封邮件）
- 不自动重写发件人地址
- 更完善的投递监控与分析功能

---

## 故障排查清单

邮件发送失败时，请逐项排查：

1. **查看 Google 安全提醒。** 访问 [Google 账户“安全 > 最近活动”页面](https://myaccount.google.com/security) 确认是否有 Google 阻止你服务器登录尝试。

2. **确认 OAuth 2.0 配置正确。** 使用 OAuth 2.0 时，确保：
   - `refreshToken` 未过期或未被撤销
   - OAuth 授权同意屏幕状态为“生产”（而非“测试”）
   - Google Cloud 项目未被删除或暂停

3. **确认应用密码有效。** 使用应用密码时，检查：
   - 双重验证仍处于开启状态
   - 应用密码未被撤销
   - 若问题持续，可尝试创建新的应用密码

4. **校准服务器时间。** OAuth 令牌对时间敏感，确保服务器系统时钟准确（推荐使用 NTP 自动同步）。

5. **手动测试 SMTP 连接。** 试着直接连接 Gmail SMTP 服务器，确定问题是出在 Nodemailer 还是网络或认证：

   ```bash
   openssl s_client -connect smtp.gmail.com:465
   ```

   如果连接失败，很可能是网络配置问题或 Google 阻止了你的 IP 地址。
