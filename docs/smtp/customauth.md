---
title: 自定义认证
sidebar_position: 25
description: 使用自定义认证机制（如 NTLM 或 CRAM-MD5）扩展 SMTP 传输。
---

Nodemailer 的 [SMTP 传输](./index.md) 默认支持常见的认证机制，如 LOGIN、PLAIN 和 [XOAUTH2](./oauth2)。但是，一些 SMTP 服务器使用 Nodemailer 无法识别的专有或不常见的认证方法。针对这些情况，你可以创建自定义认证处理器。

## 何时需要自定义处理器？

连接到 SMTP 服务器时，服务器会声明它支持哪些认证方法。例如，服务器可能返回：

```
250-AUTH LOGIN PLAIN MY-CUSTOM-METHOD
```

在这个响应中，服务器列出了三种可用的认证方法。Nodemailer 已经知道如何处理 **LOGIN** 和 **PLAIN**，但无法识别 **MY-CUSTOM-METHOD**。如果没有自定义处理器，Nodemailer 无法使用此方法进行认证。

通过提供一个与方法名称完全匹配的处理器，你可让 Nodemailer 完成认证过程。

如果服务器支持多种认证方法，Nodemailer 会自动选择其中一种。若想覆盖此行为并强制 Nodemailer 使用你的自定义方法，请将 `auth.method` 设置为与你的处理器名称相同。

---

## 定义处理器

要创建自定义认证处理器，请在你的 transporter 选项中添加一个 `customAuth` 对象。该对象的每个键是认证方法名称（不区分大小写，但通常使用大写），对应的值是一个执行认证流程的函数。

```javascript
const nodemailer = require("nodemailer");

// 定义自定义认证处理器
async function myCustomMethod(ctx) {
  // 构造并发送包含自定义数据的 AUTH 命令
  // 此示例发送 base64 编码的密码（根据你的服务器要求调整）
  const response = await ctx.sendCommand(
    "AUTH MY-CUSTOM-METHOD " + Buffer.from(ctx.auth.credentials.pass).toString("base64")
  );

  // 检查服务器是否接受了认证
  // SMTP 成功状态码为 2xx（通常 235 表示认证成功）
  if (response.status < 200 || response.status >= 300) {
    throw new Error("认证失败: " + response.text);
  }
}

const transporter = nodemailer.createTransport({
  host: "smtp.example.com",
  port: 465,
  secure: true,
  auth: {
    type: "custom",                // 告诉 Nodemailer 使用自定义处理器
    method: "MY-CUSTOM-METHOD",    // 指定使用哪个处理器
    user: "username",
    pass: "verysecret",
  },
  customAuth: {
    "MY-CUSTOM-METHOD": myCustomMethod,
  },
});
```

### 处理器函数签名

```ts
(ctx: HandlerContext) => Promise<void> | void
```

你的处理器函数接收一个上下文对象 (`ctx`)，并可以通过两种方式表示完成状态：

1. **使用 Promise（推荐）**：返回一个 Promise，成功时 resolve，失败时 reject。你也可以用 async 函数，其本身返回 Promise。

2. **使用回调方式**：调用 `ctx.resolve()` 表示成功，调用 `ctx.reject(err)` 表示失败。适用于回调驱动的代码场景。

### 上下文对象属性

上下文对象 (`ctx`) 提供了完成认证所需的所有信息：

#### `ctx.auth`

你传入 `createTransport()` 的完整 `auth` 对象，包括你添加的自定义属性。

#### `ctx.auth.credentials`

身份验证凭据的便捷别名：

| 属性       | 描述                                  |
| ---------- | ------------------------------------- |
| `user`     | 来自 `auth.user` 的用户名             |
| `pass`     | 来自 `auth.pass` 的密码               |
| `options`  | 来自 `auth.options` 的其他附加选项    |

#### `ctx.method`

使用的认证方法名（与 `auth.method` 值相同）。

#### `ctx.extensions`

服务器支持的 SMTP 扩展数组（如 `SIZE`、`STARTTLS`、`PIPELINING`）。若你的认证依赖服务器某些功能，此信息非常有用。

#### `ctx.authMethods`

服务器声明支持的认证方法数组（如 `LOGIN`、`PLAIN`、[`XOAUTH2`](./oauth2)）。你可以检查期望的方法是否可用。

#### `ctx.maxAllowedSize`

服务器接受的最大消息大小（字节为单位），若服务器未声明限制，则为 `false`。

### `ctx.sendCommand(command)`

向服务器发送原始 SMTP 命令，返回一个 Promise，resolve 时带服务端响应。这是你实现认证协议的主要手段。

**响应对象属性：**

| 属性        | 示例                                | 描述                                  |
| ----------- | --------------------------------- | ------------------------------------- |
| `status`    | `235`                             | SMTP 状态码（数字类型）               |
| `code`      | `2.7.0`                           | 增强状态码（如果有）                  |
| `text`      | `Authentication successful`       | 服务器的人类可读消息                  |
| `response`  | `235 2.7.0 Authentication successful` | 服务器完整响应行                     |
| `command`   | `AUTH MY-CUSTOM-METHOD ...`       | 发送的命令                           |

**回调风格：**

若你偏好回调，可以为 `sendCommand` 提供一个可选回调：

```javascript
ctx.sendCommand(command, (err, response) => {
  if (err) {
    return ctx.reject(err);
  }
  // 处理响应...
  ctx.resolve();
});
```

### `ctx.resolve()` 和 `ctx.reject(err)`

不使用 Promise 时，用这两个方法标示认证结果：

- **`ctx.resolve()`**：认证成功时调用。
- **`ctx.reject(err)`**：认证失败时调用，参数为 Error 对象或错误消息。

如果你使用 async 函数或 Promise，一般不需要直接调用它们。

---

## 传递额外参数

如果认证方法需要不仅仅是用户名和密码，还可在 `auth` 配置中包含一个 `options` 对象。这些额外参数可通过 `ctx.auth.credentials.options` 访问。

```javascript
const transporter = nodemailer.createTransport({
  host: "smtp.example.com",
  port: 465,
  secure: true,
  auth: {
    type: "custom",
    method: "MY-CUSTOM-METHOD",
    user: "username",
    pass: "verysecret",
    options: {
      clientId: "my-client-id",
      applicationId: "my-app",
    },
  },
  customAuth: {
    "MY-CUSTOM-METHOD": async (ctx) => {
      // 通过 ctx.auth.credentials.options 访问额外参数
      const { clientId, applicationId } = ctx.auth.credentials.options;

      // 使用自定义逻辑生成令牌
      const token = await generateSecretToken(clientId, applicationId);

      // 发送认证命令
      const response = await ctx.sendCommand("AUTH MY-CUSTOM-METHOD " + token);

      if (response.status < 200 || response.status >= 300) {
        throw new Error("认证失败: " + response.text);
      }
    },
  },
});
```

---

## 社区提供的处理器

以下包提供了针对特定认证方法的现成处理器：

| 机制      | 包名                                                                        | 备注                             |
| --------- | ---------------------------------------------------------------------------- | -------------------------------- |
| NTLM      | [`nodemailer-ntlm-auth`](https://github.com/nodemailer/nodemailer-ntlm-auth) | Windows 集成认证 (NTLM)          |
| CRAM-MD5  | [`nodemailer-cram-md5`](https://github.com/nodemailer/nodemailer-cram-md5)   | 挑战-响应认证                   |
