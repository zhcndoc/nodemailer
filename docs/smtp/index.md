---
title: SMTP 传输
sidebar_position: 4
description: Nodemailer 中通过 SMTP 协议发送邮件的主要传输方式。
---

SMTP 是 Nodemailer 中发送邮件的主要传输方式。SMTP（简单邮件传输协议）也是电子邮件服务器之间通信的标准协议，因此它具有真正的通用性。几乎所有的电子邮件发送服务提供商都支持基于 SMTP 的发送，即使它们主要推广基于 API 的发送。虽然 API 可能提供更多额外功能，但也会造成供应商锁定。通过 SMTP，您只需更改配置对象或连接 URL 即可切换供应商。

## 创建传输对象

要通过 SMTP 发送邮件，请调用 `nodemailer.createTransport()` 创建一个传输对象：

```javascript
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport(options[, defaults]);
```

- **`options`** - 定义 SMTP 连接设置的对象（详见下文各节）。
- **`defaults`** - 可选对象，其属性会合并到您发送的每条 [消息](/message/) 中。适用于设置统一的 **from** 地址或其他重复使用的值。

您也可以传入连接 URL，使用 **smtp:** 协议表示普通连接，使用 **smtps:** 协议表示从连接开始即使用 TLS（通常是端口 465）。

```javascript
const poolConfig = "smtps://username:password@smtp.example.com/?pool=true";
const transporter = nodemailer.createTransport(poolConfig);
```

### 通用选项

| 名称           | 类型        | 默认值                              | 说明                                                                                                                                                                      |
| -------------- | ----------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `host`         | `string`    | `"localhost"`                     | SMTP 服务器的主机名或 IP 地址。                                                                                                                                             |
| `port`         | `number`    | `587`（`secure: true` 时为 `465`） | 连接的端口号。                                                                                                                                                              |
| `secure`       | `boolean`   | `false`                          | 如果为 `true`，连接建立时立刻使用 TLS。连接端口为 465 时应设为 `true`。端口为 587 或 25 时，留为 `false` 并通过 STARTTLS 升级连接。                                             |
| `service`      | `string`    | --                              | 快速配置知名邮件服务，如 `"gmail"` 或 `"outlook"`。设置时，会用预定义的值覆盖 `host`、`port` 和 `secure`。详见 [知名服务列表](/smtp/well-known-services)。                   |
| `auth`         | `object`    | --                              | 身份认证凭据（见下面[认证](#authentication)部分）。                                                                                                                      |
| `authMethod`   | `string`    | `"PLAIN"`                       | 优选的 SASL 认证方法。常用值包括 `"PLAIN"`、`"LOGIN"` 和 `"CRAM-MD5"`。                                                                                                   |

:::info
当您指定主机名时，Nodemailer 会先通过 DNS 解析该主机名后再进行连接。如果您直接使用 IP 地址（或只存在于 **/etc/hosts** 文件中而非 DNS 中的主机名），应同时设置 `tls.servername` 为实际主机名。这样即使跳过 DNS 查询，TLS 证书验证也能正常工作。
:::

### TLS 选项

| 名称               | 类型      | 默认值 | 说明                                                                                                             |
| ------------------ | --------- | ------ | ---------------------------------------------------------------------------------------------------------------- |
| `secure`           | `boolean` | `false` | 详见上文 **通用选项**。                                                                                              |
| `tls`              | `object`  | --     | 直接传入给 [Node.js 的 `TLSSocket`](https://nodejs.org/api/tls.html#class-tlstlssocket) 的额外选项。例如：`{ rejectUnauthorized: false }`，用于接受自签名证书。 |
| `tls.servername`   | `string`  | --     | 用于 TLS 证书验证的主机名。当 `host` 设置为 IP 地址时必需。也可以作为顶级选项 `servername` 设置（不在 `tls` 对象内）。                     |
| `ignoreTLS`        | `boolean` | `false` | 如果为 `true`，即使服务器支持 STARTTLS，Nodemailer 也不会使用，连接保持未加密状态。                                                  |
| `requireTLS`       | `boolean` | `false` | 如果为 `true`，Nodemailer 要求 STARTTLS 升级连接。如果服务器不支持，将发送失败并返回错误。                                            |

:::info
设置 **`secure: false`** 并不意味着邮件以明文发送。大多数现代 SMTP 服务器支持 [STARTTLS](https://datatracker.ietf.org/doc/html/rfc3207)，即连接建立后升级为加密连接。Nodemailer 会自动使用 STARTTLS，除非你明确设置了 `ignoreTLS: true` 禁用它。
:::

### 连接选项

| 名称                      | 默认值              | 说明                                                                                                  |
| ------------------------- | ------------------- | --------------------------------------------------------------------------------------------------- |
| `name`                    | 本地主机名          | 发送给服务器的 `EHLO`（或 `HELO`）问候中的主机名，用于服务器识别客户端。默认为您机器的主机名。        |
| `localAddress`            | --                  | 建立连接时绑定的本地网络接口，适用于具有多个网络接口的机器。                                          |
| `connectionTimeout`       | 120000 毫秒         | 建立 TCP 连接的最长等待时间（毫秒），超时则放弃。                                                    |
| `greetingTimeout`         | 30000 毫秒          | 连接建立后，等待服务器初始问候消息的最长时间（毫秒）。                                               |
| `socketTimeout`           | 600000 毫秒         | 连接允许空闲的最长时间（毫秒），超时 Nodemailer 会关闭连接，默认 10 分钟。                           |
| `dnsTimeout`              | 30000 毫秒          | DNS 查询的最大等待时间（毫秒）。                                                                     |
| `lmtp`                    | `false`             | 如果为 `true`，使用 LMTP（本地邮件传输协议）代替 SMTP，通常用于本地邮件递送。                          |
| `opportunisticTLS`        | `false`             | 如果为 `true`，当 STARTTLS 升级失败时，Nodemailer 会继续使用未加密连接，而不是中止连接。              |
| `forceAuth`               | `false`             | 如果为 `true`，即使服务器未声明支持 AUTH，仍然尝试认证。部分配置错误的服务器需要此项。                 |
| `allowInternalNetworkInterfaces` | `false`       | 如果为 `true`，允许 DNS 解析时连接内部/私有网络接口。默认情况下 Nodemailer 解析主机名时跳过私有 IP 地址。 |

### 调试选项

| 名称             | 类型                | 说明                                                                                                                          |
| ---------------- | ------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `logger`         | `object` / `boolean` | 设置为 `true` 启用控制台日志，或传入兼容 [Bunyan](https://github.com/trentm/node-bunyan) 的日志实例以自定义日志。设置为 `false` 或不设置禁用日志。 |
| `debug`          | `boolean`           | 如果为 `true`，记录 SMTP 协议原始通信（命令和响应）。为 `false` 时只记录高级事务事件。                                           |
| `transactionLog` | `boolean`           | 如果为 `true`，在事务层面记录 SMTP 命令和响应。类似 `debug`，但可以独立使用，生成更轻量的日志而不输出完整协议跟踪。                  |
| `component`      | `string`            | 用于日志输出的组件名（例如 `'smtp-transport'`、`'smtp-pool'`），可以在多传输实例时区分日志来源。                               |

**自定义日志器**

如果想使用诸如 [Pino](https://github.com/pinojs/pino) 等日志库，或其它自定义日志器，可以将其封装为兼容 Nodemailer 的日志对象。该日志器应实现如下日志等级方法：`trace`、`debug`、`info`、`warn`、`error`、`fatal`。

```js
const smtpLogger = {};

// 为每个日志等级封装 Logger 方法
for (let level of ['trace', 'debug', 'info', 'warn', 'error', 'fatal']) {
    smtpLogger[level] = (data, message, ...args) => {
        if (args && args.length) {
            message = util.format(message, ...args);
        }
        data.msg = message;
        data.src = 'nodemailer';
        if (typeof pinoLogger[level] === 'function') {
            pinoLogger[level](data);
        } else {
            pinoLogger.debug(data);
        }
    };
}

nodemailer.createTransport({
    // ... 其它选项
    logger: smtpLogger
})
```

### 安全选项

这些选项限制 Nodemailer 处理附件和内容来源的方式：

| 名称                 | 类型      | 说明                                                                                      |
| -------------------- | --------- | ----------------------------------------------------------------------------------------- |
| `disableFileAccess`  | `boolean` | 如果为 `true`，阻止 Nodemailer 从文件系统读取附件内容（例如路径 `/path/to/file.pdf`）。         |
| `disableUrlAccess`   | `boolean` | 如果为 `true`，阻止 Nodemailer 从 URL（如 `https://example.com/file.pdf`）获取附件内容。       |

### 连接池选项

连接池允许同时保持多个 SMTP 连接，用于更快地发送多个邮件。完整的连接池选项请见 [连接池 SMTP](/smtp/pooled)。最重要的选项是：

| 名称   | 类型      | 说明                                          |
| ------ | --------- | --------------------------------------------- |
| `pool` | `boolean` | 如果为 `true`，启用连接池，多个邮件共享连接。 |

### 代理选项

您可以通过 HTTP 或 SOCKS 代理路由 SMTP 连接，详情见 [使用代理](/smtp/proxies)。

## 示例 {#examples}

### 1. 单连接

这是最简单的配置。每发送一封邮件都会建立一个新的 SMTP 连接。连接开始时为明文，如果服务器支持则自动通过 STARTTLS 升级为加密连接。

```javascript
const transporter = nodemailer.createTransport({
  host: "smtp.example.com",
  port: 587,
  secure: false, // 明文启动，通过 STARTTLS 升级
  auth: {
    user: "username",
    pass: "password",
  },
});
```

### 2. 连接池模式

发送多封邮件时，为获得更好性能，使用连接池。连接被保持打开并复用，避免为每条邮件重新建立连接的开销。

```javascript
const transporter = nodemailer.createTransport({
  pool: true,
  host: "smtp.example.com",
  port: 465,
  secure: true, // 端口 465 需要从一开始使用 TLS
  auth: {
    user: "username",
    pass: "password",
  },
});
```

### 3. 允许自签名证书

在开发环境或内部网络中，可能需要连接使用自签名证书的服务器。通过 `rejectUnauthorized: false` 禁用证书验证。注意这会降低安全性，不应在生产环境使用。

```javascript
const transporter = nodemailer.createTransport({
  host: "my.smtp.host",
  port: 465,
  secure: true,
  auth: {
    user: "username",
    pass: "password",
  },
  tls: {
    // 允许自签名或无效证书
    rejectUnauthorized: false,
  },
});
```

## 认证 {#authentication}

大多数 SMTP 服务器在接受邮件之前需要身份认证。Nodemailer 支持多种认证方式。

如果完全省略 **auth** 对象，Nodemailer 会尝试不认证直接发送。这仅适用于允许匿名发送的服务器（通常是内部中继服务器）。

```javascript
const transporter = nodemailer.createTransport({
  host: "smtp.example.com",
  port: 587,
});
```

### 登录认证

最常用的身份认证方式是用户名和密码。Nodemailer 会根据服务器支持自动选择最佳机制（PLAIN、LOGIN 或 CRAM-MD5）。

```javascript
auth: {
  type: "login", // 可选，默认即为此
  user: "username",
  pass: "password",
}
```

### OAuth 2.0

对于支持 OAuth 2.0 的服务（如 Gmail 或 Outlook），您可以使用访问令牌替代密码认证，这更安全，因为无需存储密码。

```javascript
auth: {
  type: "oauth2",
  user: "user@example.com",
  accessToken: "generated_access_token",
  expires: 1484314697598, // 访问令牌过期时间（毫秒时间戳）
}
```

详见专门的 [OAuth 2.0 指南](/smtp/oauth2)，包含完整的设置步骤及自动刷新令牌的说明。如果需要使用 Nodemailer 原生不支持的认证协议，您也可以实现 [自定义认证处理器](/smtp/customauth)（参考 [NTLM 处理器示例](https://github.com/nodemailer/nodemailer-ntlm-auth)）。

## 验证配置

在发送第一封邮件之前，可以使用 **`transporter.verify()`** 方法测试 SMTP 配置是否正确。该方法尝试连接服务器并认证，但不会发送邮件。

```javascript
// 使用 async/await 语法
try {
  await transporter.verify();
  console.log("服务器已准备好接收邮件");
} catch (err) {
  console.error("验证失败", err);
}

// 使用回调方式
transporter.verify((error, success) => {
  if (error) {
    console.error(error);
  } else {
    console.log("服务器已准备好接收邮件");
  }
});
```

`verify()` 方法会测试 DNS 解析、TCP 连接、TLS 升级（如适用）和认证流程。但它**不**会验证服务器是否允许特定发件人地址发送邮件——这只能在实际发送邮件时根据服务器策略确定。
