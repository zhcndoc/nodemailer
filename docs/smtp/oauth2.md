---
title: OAuth2
sidebar_position: 24
description: 使用 OAuth2 访问令牌代替密码进行安全的 SMTP 身份验证。
---

OAuth2 允许您的应用使用短期有效的访问令牌，而不是存储密码，与邮件服务器进行身份验证。这种方法更加安全，因为令牌具有特定权限范围，可以随时撤销，并且在泄露时可以重新生成。如果令牌泄露，潜在的损害是有限且受控的，而泄露的密码则可能允许更广泛的访问权限。

1. [与提供商无关的 OAuth2 身份验证](#oauth-token)
2. [Gmail 专用助手](#oauth-gmail)

:::tip

管理 OAuth2 凭据可能复杂且容易出错。考虑使用 **EmailEngine** 来为您处理凭据管理。注册 EmailEngine 账户后，您可以配置 Nodemailer 通过 EmailEngine 发送邮件，无需任何身份验证配置。了解更多请点击 [这里](https://emailengine.app/sending-emails?utm_source=nodemailer&utm_campaign=nodemailer&utm_medium=tip-link)。

:::

### 与提供商无关的 OAuth2 身份验证 {#oauth-token}

当您的 SMTP 服务器接受标准的用户名和访问令牌对进行身份验证时，请使用此方法。这是最简单的 OAuth2 方式，因为您直接向 Nodemailer 提供预生成的令牌，无需涉及客户端密钥或刷新令牌。

- **auth** - 身份验证对象

  - **type** - 必须设置为 `'OAuth2'`
  - **user** - 要认证的电子邮件地址（必填）
  - **accessToken** - 有效的 OAuth2 访问令牌（必填）
  - **expires** - 以毫秒为单位的 UNIX 时间戳，表示访问令牌的过期时间（可选）

> **令牌权限范围**
> 不同的邮件提供商要求不同的 OAuth 权限才能允许 SMTP 访问：
>
> - **Gmail** - 您的令牌必须包含 `https://mail.google.com/` 权限范围（完整设置说明见[使用 Gmail](../usage/using-gmail)）
> - **Outlook** - 您的令牌必须包含 `https://outlook.office.com/SMTP.Send` 权限范围

```js
let transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    type: "OAuth2",
    user: "user@example.com",
    accessToken: "ya29.Xx_XX0xxxxx-xX0X0XxXXxXxXXXxX0x",
  },
});
```

:::tip

当使用非连接池方式的传输（默认方式）时，可以在每条邮件中覆盖身份验证凭据。这意味着您可以创建一个传输器，并针对每条邮件在 `sendMail` 选项中传递不同的令牌。有关连接池与非连接池传输的详细信息，请参见[连接池 SMTP 连接](./pooled)。

:::

### Gmail 专用助手 {#oauth-gmail}

Nodemailer 内置了专门针对 Gmail 的 OAuth2 令牌管理助手。这些助手能够自动刷新过期令牌、使用服务账户生成新令牌，或者集成您自己的令牌提供器。有关 Gmail 的通用设置指南，包括使用应用密码作为替代身份验证方法，请参见[使用 Gmail](../usage/using-gmail)。

#### 三方授权的 OAuth2 身份验证 {#oauth-3lo}

三方授权 OAuth2（也称为“3LO”）中，您的应用通过交互式授权流程请求用户授权。用户授权后，您的应用会获得一个 _刷新令牌_。Nodemailer 会存储此刷新令牌，并在当前访问令牌过期时自动生成新的访问令牌，因此您无需自己处理令牌刷新逻辑。

- **auth** - 身份验证对象

  - **type** - 必须设置为 `'OAuth2'`
  - **user** - 发送邮件的邮箱地址（必填）
  - **clientId** - 从 Google Cloud 控制台获得的 OAuth2 客户端 ID（必填）
  - **clientSecret** - 从 Google Cloud 控制台获得的 OAuth2 客户端密钥（必填）
  - **refreshToken** - 用户授权流程中获得的刷新令牌（必填）
  - **accessToken** - 当前访问令牌（可选；如未提供或已过期，Nodemailer 会自动生成）
  - **expires** - 以毫秒为单位的 UNIX 时间戳，表示访问令牌的过期时间（可选）
  - **accessUrl** - 自定义令牌端点 URL（可选；默认使用 Gmail 令牌端点）
  - **timeout** - 访问令牌有效期（秒）（可选；当知道令牌有效时长但不确切知道过期时间戳时使用）
  - **customHeaders** - 令牌刷新请求中附加的 HTTP 头（可选）
  - **customParams** - 令牌刷新请求中附加的参数（可选）

#### 两方认证（服务账户） {#oauth-2lo}

两方认证 OAuth2（也称为“2LO”）利用 Google 服务账户来模拟用户，无需交互式授权。此方法适用于服务器到服务器通信或无法进行用户交互的自动化系统。服务账户必须在 Google Workspace 中启用域范围委派，才能模拟用户。

- **auth** - 身份验证对象

  - **type** - 必须设置为 `'OAuth2'`
  - **user** - 要模拟并发送身份的邮箱地址（必填）
  - **serviceClient** - 来自服务账户 JSON 密钥文件的 `client_id`（必填）
  - **privateKey** - 服务账户私钥（PEM 格式，来自服务账户 JSON 密钥文件）（必填）
  - **scope** - 请求的 OAuth 权限范围（可选；默认 `'https://mail.google.com/'`）
  - **serviceRequestTimeout** - 生成令牌的有效时长（秒）（可选；默认 300 秒，最大 3600 秒）

#### 使用自定义令牌处理 {#custom-handling}

如果您有自己的令牌管理系统，可以注册一个回调函数，Nodemailer 在需要访问令牌时会调用此函数。您可以完全控制令牌的获取和管理。

使用 `transporter.set('oauth2_provision_cb', callback)` 注册回调。您的回调函数有三个参数：

- `user` - 需要令牌的电子邮件地址
- `renew` - 布尔值，表示之前的令牌是否失效，需要刷新
- `cb` - 回调函数，调用格式为 `cb(error, accessToken, expires)`

```js
transporter.set("oauth2_provision_cb", (user, renew, cb) => {
  const token = userTokens[user];
  if (!token) return cb(new Error("未知用户"));
  cb(null, token);
});
```

#### 令牌更新通知 {#update-notification}

当 Nodemailer 生成新的访问令牌（无论是通过刷新令牌还是服务账户）时，会触发 `token` 事件。您可以监听此事件以保存新令牌，减少令牌刷新请求次数。

```js
transporter.on("token", (t) => {
  console.log("用户:", t.user);
  console.log("新访问令牌:", t.accessToken);
  console.log("过期时间:", new Date(t.expires));
});
```

#### 示例 {#examples}

:::tip
以下示例都使用了明确的 `host`、`port` 和 `secure` 设置。对于 Gmail 和其他常用提供商，您可以使用 `service: "gmail"` 来简化配置。完整支持的服务列表请见[知名服务](./well-known-services)。
:::

1. **使用已有令牌进行身份验证**

当您已有有效访问令牌时，使用此方法简单地用该令牌进行身份验证。

```js
let transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    type: "OAuth2",
    user: "user@example.com",
    accessToken: "ya29.Xx_XX0xxxxx-xX0X0XxXXxXxXXXxX0x",
  },
});
```

2. **自定义处理器** - 令牌由自己服务返回

当您有单独的令牌管理服务或数据库按需提供令牌时，使用此方法。

```js
let transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: { type: "OAuth2", user: "user@example.com" },
});

transporter.set("oauth2_provision_cb", (user, renew, cb) => {
  cb(null, userTokens[user]);
});
```

3. **完整三方授权设置** - Nodemailer 自动刷新令牌

当您从 Google Cloud 控制台获得 OAuth2 凭据，并通过用户授权流程取得刷新令牌时，采用此方式。Nodemailer 会自动刷新访问令牌。

```js
let transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    type: "OAuth2",
    user: "user@example.com",
    clientId: "000000000000-xxx.apps.googleusercontent.com",
    clientSecret: "XxxxxXXxX0xxxxxxxx0XXxX0",
    refreshToken: "1/XXxXxsss-xxxXXXXXxXxx0XXXxxXXx0x00xxx",
    accessToken: "ya29.Xx_XX0xxxxx-xX0X0XxXXxXxXXXxX0x",
    expires: 1484314697598,
  },
});
```

4. **服务账户** - 通过两方认证重新生成令牌

用于无用户交互的服务器间身份验证。服务账户模拟指定用户，自动生成令牌。

```js
let transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    type: "OAuth2",
    user: "user@example.com",
    serviceClient: "113600000000000000000",
    privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBg...",
    accessToken: "ya29.Xx_XX0xxxxx-xX0X0XxXXxXxXXXxX0x",
    expires: 1484314697598,
  },
});
```

5. **每条邮件单独认证** - 单个传输器，多用户发送

当您需要通过一个传输器代表多个用户发送邮件时，采用此方法。在传输器配置中定义一次客户端凭据，然后在每条邮件中传递特定用户的令牌。

```js
let transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    type: "OAuth2",
    clientId: "000000000000-xxx.apps.googleusercontent.com",
    clientSecret: "XxxxxXXxX0xxxxxxxx0XXxX0",
  },
});

transporter.sendMail({
  from: "sender@example.com",
  to: "recipient@example.com",
  subject: "消息",
  text: "希望这封邮件能成功送达！",
  auth: {
    user: "user@example.com",
    refreshToken: "1/XXxXxsss-xxxXXXXXxXxx0XXXxxXXx0x00xxx",
    accessToken: "ya29.Xx_XX0xxxxx-xX0X0XxXXxXxXXXxX0x",
    expires: 1484314697598,
  },
});
```

:::info

每条邮件身份验证仅适用于非连接池传输。如果您使用的是[连接池传输](./pooled)（`pool: true` 创建），则无法在每条邮件覆盖身份验证。

:::

---

#### 故障排查 {#troubleshooting}

- **Gmail 返回“Invalid grant”或身份验证错误**：确保您的访问令牌是带有 `https://mail.google.com/` 权限范围请求的。使用其他权限的令牌无法用于 SMTP 访问。
- **“Access Not Configured” 错误**：请确认在 Google Cloud 控制台的 API 与服务中已启用 Gmail API。
- **令牌迅速过期**：访问令牌通常一小时后过期。如果您使用刷新令牌，Nodemailer 会自动续期。如果您直接提供令牌，请确保在过期前刷新令牌。
