---
title: SMTP 服务器
sidebar_position: 1
description: 通过身份验证和消息处理，创建自定义 SMTP 和 LMTP 服务器实例。
---

动态创建 SMTP 和 LMTP 服务器实例。_smtp-server_ 模块 **不** 是像 [Haraka](https://haraka.github.io/) 这样功能完整的邮件服务器应用程序。它只是为您的 Node.js 应用提供添加自定义 SMTP 或 LMTP 监听器的便捷方式。它是现已弃用的 [simplesmtp](https://www.npmjs.com/package/simplesmtp) 模块服务器部分的继任者。要使用匹配的 SMTP 客户端，请参见 [SMTP Connection](./smtp-connection)。该模块在开发环境中也非常适用于[测试邮件功能](../smtp/testing)。

## 使用方法

### 1. 安装

```bash
npm install smtp-server --save
```

### 2. 在脚本中引入

```javascript
const { SMTPServer } = require("smtp-server");
```

### 3. 创建服务器实例

```javascript
const server = new SMTPServer(options);
```

### 4. 开始监听

```javascript
server.listen(port[, host][, callback]);
```

### 5. 关闭服务器

```javascript
server.close(callback);
```

## 配置选项参考

| 选项                                                                       | 类型                | 默认值               | 说明                                                                                                                           |
| ---------------------------------------------------------------------------- | ------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| **secure**                                                                   | `Boolean`           | `false`              | 以 TLS 模式启动服务器。如果为 `false`，仍可通过 `STARTTLS` 升级非 TLS 连接。                                                     |
| **name**                                                                     | `String`            | `os.hostname()`      | 服务器主机名，会在问候横幅中声明。                                                                                             |
| **banner**                                                                   | `String`            | -                    | 自定义问候信息，附加到客户端首次连接时发送的标准 ESMTP 横幅后面。                                                               |
| **heloResponse**                                                             | `String`            | `'%s Nice to meet you, %s'` | HELO/EHLO 响应的格式字符串。使用 `%s` 占位符：第一个为服务器名，第二个为客户端主机名。                                        |
| **size**                                                                     | `Number`            | `0`                  | 最大允许消息大小（字节）。`0` 表示无限制。                                                                                      |
| **hideSize**                                                                 | `Boolean`           | `false`              | 在 EHLO 响应中隐藏 SIZE 限制，但仍会内部跟踪 `stream.sizeExceeded`。                                                           |
| **authMethods**                                                              | `String[]`          | `['PLAIN', 'LOGIN']` | 提供的认证机制。根据需要添加 `'XOAUTH2'` 和/或 `'CRAM-MD5'`。                                                                   |
| **authOptional**                                                             | `Boolean`           | `false`              | 允许客户端不经过认证直接进行操作。为 `false` 时，发送邮件前必须通过认证。                                                     |
| **disabledCommands**                                                         | `String[]`          | -                    | 要禁用的 SMTP 命令，例如 `['AUTH']` 可完全禁用认证。                                                                           |
| **hideSTARTTLS / hidePIPELINING / hide8BITMIME / hideSMTPUTF8**              | `Boolean`           | `false`              | 在 EHLO 响应中隐藏指定的能力。                                                                                                   |
| **hideENHANCEDSTATUSCODES**                                                  | `Boolean`           | `true`               | 为 `true`（默认）时响应中不包含增强状态码 (RFC 2034/3463)，设置为 `false` 可启用。                                              |
| **hideDSN**                                                                  | `Boolean`           | `true`               | 为 `true`（默认）时隐藏 DSN（传递状态通知）能力，设置为 `false` 可启用 DSN 支持。                                                |
| **hideREQUIRETLS**                                                           | `Boolean`           | `true`               | 为 `true`（默认）时隐藏 REQUIRETLS 能力 (RFC 8689)，设置为 `false` 则广告 REQUIRETLS 支持。                                     |
| **allowInsecureAuth**                                                        | `Boolean`           | `false`              | 允许在未加密连接上进行认证。生产环境不推荐。                                                                                     |
| **disableReverseLookup**                                                     | `Boolean`           | `false`              | 跳过客户端 IP 地址的反向 DNS 查找。                                                                                             |
| **sniOptions**                                                               | `Map \| Object`     | -                    | 按 SNI 主机名键入的 TLS 选项，用于根据请求的主机名提供不同证书。                                                                 |
| **logger**                                                                   | `Boolean \| Object` | `false`              | 设置为 `true` 则记录到控制台，或提供一个兼容 Bunyan 的 logger 实例。                                                             |
| **maxClients**                                                               | `Number`            | `Infinity`           | 最大并发客户端连接数。                                                                                                           |
| **useProxy**                                                                 | `Boolean`           | `false`              | 在 SMTP 会话开始前，期望接收 HAProxy [PROXY 协议](http://www.haproxy.org/download/1.5/doc/proxy-protocol.txt) 头部。              |
| **useXClient / useXForward**                                                 | `Boolean`           | `false`              | 启用 Postfix 的 [XCLIENT](http://www.postfix.org/XCLIENT_README.html) 或 [XFORWARD](http://www.postfix.org/XFORWARD_README.html) 扩展。 |
| **lmtp**                                                                     | `Boolean`           | `false`              | 使用 LMTP（本地邮件传输协议）而非 SMTP。                                                                                         |
| **socketTimeout**                                                            | `Number`            | `60_000`             | 在断开空闲客户端连接前的毫秒数超时。                                                                                             |
| **closeTimeout**                                                             | `Number`            | `30_000`             | 调用 `close()` 时等待挂起连接完成的时间（毫秒）。                                                                                 |
| **onAuth / onConnect / onSecure / onMailFrom / onRcptTo / onData / onClose** | `Function`          | -                    | 生命周期回调处理函数（详见下文章节）。                                                                                            |
| **resolver**                                                                 | `Object`            | -                    | 具有 `.reverse()` 方法的自定义 DNS 解析器对象。默认为 Node.js 内置的 `dns` 模块。                                                |

您也可以传入 [`net.createServer`](https://nodejs.org/api/net.html#net_net_createserver_options_connectionlistener) 接受的任何选项。当 `secure` 为 `true` 时，还可以额外传入 [`tls.createServer`](https://nodejs.org/api/tls.html#tls_tls_createserver_options_secureconnectionlistener) 的选项。

---

## 自定义问候

### 初始连接横幅

`banner` 选项向初始连接响应（220 问候）添加自定义消息：

```javascript
const server = new SMTPServer({
  banner: "欢迎使用我们的邮件服务",
});
// 客户端看到: "220 hostname ESMTP 欢迎使用我们的邮件服务"
```

### HELO/EHLO 响应

`heloResponse` 选项自定义客户端发送 HELO 或 EHLO 后返回的问候。使用 `%s` 占位符填充动态值：

```javascript
const server = new SMTPServer({
  heloResponse: "%s 向 %s 打招呼",
});
// 客户端看到: "250 hostname 向 client.example.com 打招呼"
```

**占位符说明：**
- 第一个 `%s` 替换为服务器名（由 `name` 选项或 `os.hostname()` 提供）
- 第二个 `%s` 替换为客户端主机名（反向 DNS 查询结果或括号中的 IP 地址）

**示例：**

```javascript
// 默认行为（无需配置）
// "250 hostname Nice to meet you, client.example.com"

// 自定义正式问候
heloResponse: "欢迎访问 %s 邮件服务器"
// "250 欢迎访问 hostname 邮件服务器"

// 简单问候，无占位符
heloResponse: "你好"
// "250 你好"

// 使用两个占位符
heloResponse: "%s 向 %s 问好"
// "250 hostname 向 client.example.com 问好"
```

---

## TLS 与 STARTTLS

如果您启用了 TLS（`secure: true`）或希望保留 `STARTTLS` 的可用性（默认），应使用 `key`、`cert`，可选地加上 `ca` 选项提供有效证书。若无合适证书，_smtp-server_ 会为 `localhost` 使用自签名证书，大多数邮件客户端将拒绝该证书。

```javascript
const fs = require("fs");
const server = new SMTPServer({
  secure: true,
  key: fs.readFileSync("private.key"),
  cert: fs.readFileSync("server.crt"),
});
server.listen(465);
```

---

## 错误处理

监听 `error` 事件处理服务器级错误：

```javascript
server.on("error", (err) => {
  console.error("SMTP 服务器错误:", err.message);
});
```

---

## 处理身份验证（`onAuth`）

当客户端尝试认证时会调用 `onAuth` 回调。您可以在这里验证凭证，决定接受或拒绝登录。

```javascript
const server = new SMTPServer({
  onAuth(auth, session, callback) {
    // auth.method 包含认证方式： 'PLAIN', 'LOGIN', 'XOAUTH2', 或 'CRAM-MD5'
    // 调用 callback(err) 拒绝，或 callback(null, { user: ... }) 接受
  },
});
```

### 基于密码的认证（PLAIN / LOGIN）

```javascript
onAuth(auth, session, callback) {
  if (auth.username !== "alice" || auth.password !== "s3cr3t") {
    return callback(new Error("用户名或密码错误"));
  }
  callback(null, { user: auth.username });
}
```

### OAuth 2 认证（`XOAUTH2`）

```javascript
const server = new SMTPServer({
  authMethods: ["XOAUTH2"],
  onAuth(auth, session, callback) {
    if (auth.accessToken !== "ya29.a0Af...") {
      // 根据 RFC 6750 第 3 节返回 OAuth 错误响应
      return callback(null, {
        data: { status: "401", schemes: "bearer" },
      });
    }
    callback(null, { user: auth.username });
  },
});
```

---

## 验证客户端连接（`onConnect` / `onClose`）

使用 `onConnect` 在处理任何 SMTP 命令之前接受或拒绝连接。用 `onClose` 在连接结束时执行清理工作。

```javascript
const server = new SMTPServer({
  onConnect(session, callback) {
    if (session.remoteAddress === "127.0.0.1") {
      return callback(new Error("拒绝本地连接"));
    }
    callback(); // 接受连接
  },
  onClose(session) {
    console.log(`来自 ${session.remoteAddress} 的连接已关闭`);
  },
});
```

---

## 验证 TLS 信息（`onSecure`）

`onSecure` 回调在 TLS 握手完成后调用（无论是初始安全连接还是 STARTTLS）。您可以用它来验证 TLS 特定信息，如 SNI 主机名。

```javascript
onSecure(socket, session, callback) {
  if (session.servername !== "mail.example.com") {
    return callback(new Error("SNI 不匹配"));
  }
  callback();
}
```

---

## 验证发件人（`onMailFrom`）

当客户端发出 `MAIL FROM` 命令时调用 `onMailFrom`。您可据此验证或拒绝发件人地址。

```javascript
onMailFrom(address, session, callback) {
  if (!address.address.endsWith("@example.com")) {
    // 通过给错误对象设置 responseCode，自定义响应码
    return callback(Object.assign(new Error("中继被拒绝"), { responseCode: 553 }));
  }
  callback();
}
```

---

## 验证收件人（`onRcptTo`）

`onRcptTo` 在每个 `RCPT TO` 命令时调用，用以验证或拒绝收件人地址。

```javascript
onRcptTo(address, session, callback) {
  if (address.address === "blackhole@example.com") {
    return callback(new Error("用户未知"));
  }
  callback();
}
```

---

## 处理来信内容（`onData`）

`onData` 回调接收包含邮件消息数据的可读流。消息会按客户端发送的原样流式传输。若要解析收到的消息，可使用 [MailParser](./mailparser)。

```javascript
onData(stream, session, callback) {
  const fs = require("fs");
  const writeStream = fs.createWriteStream("/tmp/message.eml");
  stream.pipe(writeStream);
  stream.on("end", () => callback(null, "消息已排队"));
}
```

:::note
_smtp-server_ 不会向消息添加 `Received:` 头。如果需要符合 RFC 5321，您必须自己添加此头。
:::

---

## 使用 SIZE 扩展

设置 `size` 选项向客户端声明最大允许消息大小。在 `onData` 处理器中检查 `stream.sizeExceeded` 来检测超额消息：

```javascript
const server = new SMTPServer({
  size: 1024 * 1024, // 1 MiB 限制
  onData(stream, session, callback) {
    stream.on("end", () => {
      if (stream.sizeExceeded) {
        const err = new Error("消息过大");
        err.responseCode = 552;
        return callback(err);
      }
      callback(null, "OK");
    });
    stream.resume(); // 消费流
  },
});
```

---

## 使用 LMTP

LMTP（本地邮件传输协议）要求对每个收件人单独回复。在 `onData` 回调中请返回与收件人数量对应的回复数组：

```javascript
const server = new SMTPServer({
  lmtp: true,
  onData(stream, session, callback) {
    stream.on("end", () => {
      // 按 session.envelope.rcptTo 顺序为每个收件人返回响应
      const replies = session.envelope.rcptTo.map((rcpt, index) =>
        index % 2 === 0
          ? `<${rcpt.address}> 接受`
          : new Error(`<${rcpt.address}> 拒绝`)
      );
      callback(null, replies);
    });
    stream.resume();
  },
});
```

---

## Session 对象

Session 对象包含当前连接信息，会传入所有回调处理函数。

| 属性              | 类型                              | 说明                                                                |
| ----------------- | --------------------------------- | ------------------------------------------------------------------- |
| **id**            | `String`                          | 此连接的唯一标识符（随机生成）                                      |
| **remoteAddress**  | `String`                          | 客户端 IP 地址                                                      |
| **clientHostname** | `String`                          | 客户端反向 DNS 主机名（除非设置了 `disableReverseLookup`）          |
| **openingCommand** | `"HELO" \| "EHLO" \| "LHLO"`      | 客户端发送的问候命令                                                |
| **hostNameAppearsAs** | `String`                       | 客户端 HELO/EHLO/LHLO 中提供的主机名                                |
| **envelope**      | `Object`                          | 包含 `mailFrom`、`rcptTo` 及相关事务数据                            |
| **user**          | `any`                             | 通过 `onAuth` 回调成功验证后返回的用户信息                         |
| **transaction**   | `Number`                          | 事务计数器：第 1 条消息为 1，第 2 条为 2，依此类推                  |
| **transmissionType** | `"SMTP" \| "ESMTP" \| "ESMTPA" ...` | 适用于 `Received:` 头的传输类型字符串                              |

---

## Envelope 对象

`session.envelope` 对象包含当前邮件事务的特定数据：

```jsonc
{
  "mailFrom": {
    "address": "sender@example.com",
    "args": { "SIZE": "12345", "RET": "HDRS", "BODY": "8BITMIME", "SMTPUTF8": true, "REQUIRETLS": true },
    "dsn": { "ret": "HDRS", "envid": "abc123" }
  },
  "rcptTo": [
    {
      "address": "user1@example.com",
      "args": { "NOTIFY": "SUCCESS,FAILURE" },
      "dsn": { "notify": ["SUCCESS", "FAILURE"], "orcpt": "rfc822;user1@example.com" }
    }
  ],
  "bodyType": "8bitmime",
  "smtpUtf8": true,
  "requireTLS": true,
  "dsn": {
    "ret": "HDRS",
    "envid": "abc123"
  }
}
```

| 属性         | 类型       | 说明                                                             |
| ------------ | ---------- | ---------------------------------------------------------------- |
| **mailFrom** | `Object`   | 发件人地址对象（详见下方地址对象）。                              |
| **rcptTo**   | `Object[]` | 收件人地址对象数组。                                             |
| **bodyType** | `String`   | 消息体编码： `'7bit'`（默认）或 `'8bitmime'`（RFC 6152）。       |
| **smtpUtf8** | `Boolean`  | 如果客户端请求 UTF-8 支持（RFC 6531）则为 `true`。              |
| **requireTLS** | `Boolean` | 如果要求整个传输链必须使用 TLS（RFC 8689）则为 `true`。         |
| **dsn**      | `Object`   | MAIL FROM 命令的 DSN 参数（启用 DSN 时存在）。                   |

---

## 地址对象

`mailFrom` 和 `rcptTo` 中的每个条目都是如下结构的地址对象：

```jsonc
{
  "address": "sender@example.com",
  "args": {
    "SIZE": "12345",
    "RET": "HDRS"
  },
  "dsn": {
    "ret": "HDRS",
    "envid": "abc123",
    "notify": ["SUCCESS", "FAILURE"],
    "orcpt": "rfc822;original@example.com"
  }
}
```

| 字段        | 说明                                                            |
| ----------- | --------------------------------------------------------------- |
| **address** | 来自 `MAIL FROM:` 或 `RCPT TO:` 命令的邮件地址                  |
| **args**    | 其他 SMTP 参数（键均为大写）                                   |
| **dsn**     | DSN 特定参数（启用 DSN 时存在）                                 |

### DSN 对象属性

| 属性       | 类型       | 说明                                          |
| ---------- | ---------- | --------------------------------------------- |
| **ret**    | `String`   | 返回类型：`'FULL'` 或 `'HDRS'` （来自 MAIL FROM）|
| **envid**  | `String`   | 信封标识符（来自 MAIL FROM）                   |
| **notify** | `String[]` | 通知条件（来自 RCPT TO）                       |
| **orcpt**  | `String`   | 原始收件人地址（来自 RCPT TO）                 |

---

## 增强状态代码 (RFC 2034/3463)

_smtp-server_ 支持 RFC 2034 和 RFC 3463 定义的增强状态代码。启用时，SMTP 响应会包含格式为 `X.Y.Z` 的三部分状态码：

```
250 2.1.0 已接受         <- 增强状态码：2.1.0
550 5.1.1 邮箱不可用    <- 增强状态码：5.1.1
```

### 启用增强状态代码

增强状态代码**默认禁用**。启用方式如下：

```javascript
const server = new SMTPServer({
  hideENHANCEDSTATUSCODES: false, // 启用增强状态代码
  onMailFrom(address, session, callback) {
    callback(); // 响应将包含增强码: "250 2.1.0 已接受"
  },
});
```

### 禁用增强状态代码

默认即禁用，您也可以显式禁用：

```javascript
const server = new SMTPServer({
  hideENHANCEDSTATUSCODES: true, // 显式禁用（默认）
  onMailFrom(address, session, callback) {
    callback(); // 响应: "250 已接受"（无增强码）
  },
});
```

### 增强状态代码参考

| 响应码 | 增强码  | 说明              |
| ------ | ------- | ----------------- |
| `250`  | `2.0.0` | 普通成功          |
| `250`  | `2.1.0` | MAIL FROM 接受    |
| `250`  | `2.1.5` | RCPT TO 接受      |
| `250`  | `2.6.0` | 消息已接受        |
| `501`  | `5.5.4` | 参数语法错误      |
| `550`  | `5.1.1` | 邮箱不可用        |
| `552`  | `5.2.2` | 存储空间超限      |

---

## DSN（传递状态通知）支持

_smtp-server_ 支持 RFC 3461 定义的 DSN 参数，允许客户端请求传递状态通知。

**重要：** DSN 默认禁用。必须将 `hideDSN: false` 以启用 DSN 功能。

### DSN 参数

#### MAIL FROM 参数

- **`RET=FULL`** 或 **`RET=HDRS`** - 指定 DSN 报告返回完整消息还是仅返回头部
- **`ENVID=<envelope-id>`** - 用于跟踪的信封标识符

```javascript
// 客户端发送: MAIL FROM:<sender@example.com> RET=FULL ENVID=abc123
```

#### RCPT TO 参数

- **`NOTIFY=SUCCESS,FAILURE,DELAY,NEVER`** - 指定何时发送 DSN 通知
- **`ORCPT=<original-recipient>`** - 记录原始收件人地址用于跟踪

```javascript
// 客户端发送: RCPT TO:<user@example.com> NOTIFY=SUCCESS,FAILURE ORCPT=rfc822;user@example.com
```

### 访问 DSN 参数

DSN 参数可通过 session 和地址对象在回调处理函数中访问：

```javascript
const server = new SMTPServer({
  hideDSN: false, // 必须启用 DSN
  onMailFrom(address, session, callback) {
    // 访问 MAIL FROM 的 DSN 参数
    const ret = session.envelope.dsn.ret; // 'FULL' 或 'HDRS'
    const envid = session.envelope.dsn.envid; // 信封 ID

    console.log(`RET: ${ret}, ENVID: ${envid}`);
    callback();
  },

  onRcptTo(address, session, callback) {
    // 访问 RCPT TO 的 DSN 参数
    const notify = address.dsn.notify; // ['SUCCESS', 'FAILURE', 'DELAY']
    const orcpt = address.dsn.orcpt; // 原始收件人

    console.log(`NOTIFY: ${notify.join(",")}, ORCPT: ${orcpt}`);
    callback();
  },
});
```

### DSN 参数验证

_smtp-server_ 会自动验证 DSN 参数：

- **`RET`** 必须是 `FULL` 或 `HDRS`
- **`NOTIFY`** 只能包含有效值：`SUCCESS`，`FAILURE`，`DELAY` 或 `NEVER`
- **`NOTIFY=NEVER`** 不能与其他值混用
- 无效参数会返回相应错误响应

### 完整 DSN 示例

```javascript
const server = new SMTPServer({
  hideDSN: false, // 必须启用 DSN
  onMailFrom(address, session, callback) {
    const { ret, envid } = session.envelope.dsn;
    console.log(`发件人 ${address.address}, RET=${ret}, ENVID=${envid}`);
    callback();
  },

  onRcptTo(address, session, callback) {
    const { notify, orcpt } = address.dsn;
    console.log(`收件人 ${address.address}, NOTIFY=${notify.join(",")}, ORCPT=${orcpt}`);
    callback();
  },

  onData(stream, session, callback) {
    // 处理带有 DSN 上下文的消息
    const { dsn } = session.envelope;
    console.log(`处理消息，DSN 信息：${JSON.stringify(dsn)}`);

    stream.on("end", () => {
      callback(null, "消息已接受，用于投递");
    });
    stream.resume();
  },
});
```

### 生产环境 DSN 实现示例

以下为一个完整示例，演示如何使用 Nodemailer 实现 DSN 通知功能：

```javascript
const { SMTPServer } = require("smtp-server");
const nodemailer = require("nodemailer");

// 创建 Nodemailer 传输器用于发送 DSN 通知
const dsnTransporter = nodemailer.createTransport({
  host: "smtp.example.com",
  port: 587,
  secure: false,
  auth: {
    user: "dsn-sender@example.com",
    pass: "your-password",
  },
});

// DSN 通知生成器
class DSNNotifier {
  constructor(transporter) {
    this.transporter = transporter;
  }

  async sendSuccessNotification(envelope, messageId, deliveryTime) {
    // 仅当请求 SUCCESS 通知时发送
    const needsSuccessNotification = envelope.rcptTo.some((rcpt) => rcpt.dsn.notify && rcpt.dsn.notify.includes("SUCCESS"));

    if (!needsSuccessNotification || !envelope.mailFrom.address) {
      return;
    }

    const dsnMessage = this.generateDSNMessage({
      action: "delivered",
      status: "2.0.0",
      envelope,
      messageId,
      deliveryTime,
      diagnosticCode: "smtp; 250 2.0.0 Message accepted for delivery",
    });

    await this.transporter.sendMail({
      from: "postmaster@example.com",
      to: envelope.mailFrom.address,
      subject: "传递状态通知（成功）",
      text: dsnMessage.text,
      headers: {
        "Auto-Submitted": "auto-replied",
        "Content-Type": "multipart/report; report-type=delivery-status",
      },
    });
  }

  generateDSNMessage({ action, status, envelope, messageId, deliveryTime, diagnosticCode }) {
    const { dsn } = envelope;
    const timestamp = deliveryTime || new Date().toISOString();

    // 生成符合 RFC 3464 的传递状态通知
    const text = `这是自动生成的传递状态通知。

原始邮件详情：
- 消息 ID: ${messageId}
- 信封 ID: ${dsn.envid || "未提供"}
- 发件人: ${envelope.mailFrom.address}
- 收件人: ${envelope.rcptTo.map((r) => r.address).join(", ")}
- 动作: ${action}
- 状态: ${status}
- 时间: ${timestamp}

${action === "delivered" ? "您的邮件已成功传递给所有收件人。" : "传递到一个或多个收件人失败。"}`;

    return { text };
  }
}

// 创建 DSN 通知实例
const dsnNotifier = new DSNNotifier(dsnTransporter);

// 启用 DSN 支持的 SMTP 服务器
const server = new SMTPServer({
  hideDSN: false, // 启用 DSN
  name: "mail.example.com",

  onMailFrom(address, session, callback) {
    const { dsn } = session.envelope;
    console.log(`MAIL FROM: ${address.address}, RET=${dsn.ret}, ENVID=${dsn.envid}`);
    callback();
  },

  onRcptTo(address, session, callback) {
    const { notify, orcpt } = address.dsn;
    console.log(`RCPT TO: ${address.address}, NOTIFY=${notify?.join(",")}, ORCPT=${orcpt}`);
    callback();
  },

  async onData(stream, session, callback) {
    const messageId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    stream.on("end", async () => {
      try {
        // 模拟消息投递
        const deliveryTime = new Date();

        // 如果请求，发送 DSN 成功通知
        await dsnNotifier.sendSuccessNotification(session.envelope, messageId, deliveryTime);

        callback(null, `消息 ${messageId} 已接受用于投递`);
      } catch (error) {
        callback(error);
      }
    });

    stream.resume();
  },
});

server.listen(2525, () => {
  console.log("启用了 DSN 的 SMTP 服务器监听 2525 端口");
});
```

此示例演示了：

- **完整 DSN 工作流程**：从参数解析到通知发送
- **符合 RFC 的 DSN 消息**，包含合适的头部和内容
- **基于 NOTIFY 参数的条件通知**
- **与 Nodemailer 集成** 以发送 DSN 通知
- **生产环境结构**，包含错误处理

---

## MAIL FROM 参数（BODY、SMTPUTF8、REQUIRETLS）

_smtp-server_ 支持几个符合 RFC 的 MAIL FROM 参数，允许客户端指定消息属性和传递要求。

### BODY 参数 (RFC 6152)

`BODY` 参数指定消息体编码类型：

- **`BODY=7BIT`** - 7 位 ASCII 编码（默认）
- **`BODY=8BITMIME`** - 支持包含非 ASCII 字符的 8 位 MIME 编码消息

```javascript
// 客户端发送: MAIL FROM:<sender@example.com> BODY=8BITMIME
```

所选体类型可通过 `session.envelope.bodyType` 访问：

```javascript
const server = new SMTPServer({
  onMailFrom(address, session, callback) {
    console.log(`消息体类型: ${session.envelope.bodyType}`); // '7bit' 或 '8bitmime'
    callback();
  },
});
```

**注意：** 未支持 `BINARYMIME`，因为它需要 `BDAT` 命令（RFC 3030），此命令未实现。

### SMTPUTF8 参数 (RFC 6531)

`SMTPUTF8` 参数表示客户端希望地址和头部使用 UTF-8 编码：

```javascript
// 客户端发送: MAIL FROM:<sender@example.com> SMTPUTF8
```

UTF-8 标志可通过 `session.envelope.smtpUtf8` 访问：

```javascript
const server = new SMTPServer({
  onMailFrom(address, session, callback) {
    if (session.envelope.smtpUtf8) {
      console.log("请求 UTF-8 支持");
    }
    callback();
  },
});
```

### REQUIRETLS 参数 (RFC 8689)

`REQUIRETLS` 参数表示客户端要求整个传输链使用 TLS 加密，而不仅仅是客户端到服务器的连接。这在传输敏感消息且禁止未加密传播时非常有用。

**重要：** REQUIRETLS 默认关闭，必须显式启用：

```javascript
const server = new SMTPServer({
  hideREQUIRETLS: false, // 启用 REQUIRETLS 支持
  onMailFrom(address, session, callback) {
    if (session.envelope.requireTLS) {
      console.log("要求全链路 TLS");
      // 确保下游传递也使用 TLS
    }
    callback();
  },
});
```

**要求：**
- 只有当连接本身为 TLS（STARTTLS 后或初始化安全连接）时才广告 REQUIRETLS
- 客户端仅能在 TLS 连接上使用 REQUIRETLS
- 如果客户端未使用 TLS 仍请求 REQUIRETLS，服务器返回错误码 530

```javascript
// 客户端发送: MAIL FROM:<sender@example.com> REQUIRETLS
// 服务器设置: session.envelope.requireTLS === true
```

### 组合参数示例

所有 MAIL FROM 参数可在同一命令中一起使用：

```javascript
const server = new SMTPServer({
  hideREQUIRETLS: false, // 启用 REQUIRETLS
  onMailFrom(address, session, callback) {
    const { bodyType, smtpUtf8, requireTLS } = session.envelope;

    console.log(`
      消息体类型: ${bodyType}
      UTF-8: ${smtpUtf8}
      要求 TLS: ${requireTLS}
    `);

    // 验证要求
    if (requireTLS && !session.secure) {
      return callback(new Error("需要 TLS 但未建立"));
    }

    callback();
  },
});
```

```javascript
// 客户端发送: MAIL FROM:<sender@example.com> BODY=8BITMIME SMTPUTF8 REQUIRETLS
```

### 参数验证

_smtp-server_ 自动验证所有 MAIL FROM 参数：

- **BODY** 必须为 `7BIT` 或 `8BITMIME`（不区分大小写）
- **SMTPUTF8** 是标志型参数，不能带值
- **REQUIRETLS** 是标志型参数，不能带值
- **REQUIRETLS** 只能在 TLS 连接上使用

无效参数返回相应的错误码（501 参数语法错误，530 TLS 需求未满足）。

---

## 支持的命令和扩展

### 命令

- `EHLO` / `HELO` - 会话初始化
- `AUTH` - 认证（`LOGIN`，`PLAIN`，`XOAUTH2`*，`CRAM-MD5`*）
- `MAIL` / `RCPT` / `DATA` - 邮件事务命令
- `RSET` / `NOOP` / `QUIT` / `VRFY` - 会话管理
- `HELP` - 返回 RFC 5321 参考
- `STARTTLS` - 升级到 TLS 连接

\* `XOAUTH2` 和 `CRAM-MD5` 必须通过 `authMethods` 选项显式启用。

### 扩展

- `PIPELINING` - 允许命令流水线，提高性能
- `8BITMIME` (RFC 6152) - 支持 8 位 MIME 消息
- `SMTPUTF8` (RFC 6531) - 支持邮件地址和头部的 UTF-8
- `SIZE` - 声明消息大小和限制执行
- `DSN` (RFC 3461) - 传递状态通知（通过 `hideDSN: false` 启用）
- `ENHANCEDSTATUSCODES` (RFC 2034/3463) - 增强状态码（通过 `hideENHANCEDSTATUSCODES: false` 启用）
- `REQUIRETLS` (RFC 8689) - 要求链路 TLS（通过 `hideREQUIRETLS: false` 启用）

:::note
`CHUNKING` 扩展（BDAT 命令）**未实现**。
:::

---

## 许可证

[MIT](https://github.com/nodemailer/nodemailer/blob/master/LICENSE)
