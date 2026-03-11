---
title: SMTP 连接
sidebar_position: 2
description: 用于建立与邮件服务器的外发连接的低级别 SMTP 客户端。
---

一个用于建立外发 SMTP 连接的低级别 SMTP 客户端。该模块是 Nodemailer 内部驱动其 [SMTP 传输](/smtp/) 的基础。当你需要对 SMTP 会话生命周期进行直接且细粒度的控制时，使用此模块。

:::info
SMTPConnection 随 Nodemailer 一起提供，无需安装额外包。
:::

## 使用方法

### 1. 导入模块

```javascript
const SMTPConnection = require("nodemailer/lib/smtp-connection");
```

### 2. 创建连接实例

```javascript
const connection = new SMTPConnection(options);
```

### 3. 连接到服务器

```javascript
connection.connect(callback);
```

### 4. 认证（如果需要）

```javascript
connection.login(auth, callback);
```

### 5. 发送邮件

```javascript
connection.send(envelope, message, callback);
```

### 6. 关闭连接

```javascript
connection.quit(); // 或 connection.close()
```

---

## 选项参考

| 选项                             | 类型                | 默认值                 | 描述                                                                                           |
| ------------------------------ | ------------------- | --------------------- | ---------------------------------------------------------------------------------------------- |
| **host**                       | `String`            | `'localhost'`         | 要连接的 SMTP 服务器的主机名或 IP 地址。                                                        |
| **port**                       | `Number`            | `587` 或 `465`        | 连接端口号。当 `secure` 为 true 时默认是 465，否则为 587。如果指定端口为 465，`secure` 默认设置为 true。 |
| **secure**                     | `Boolean`           | `false`               | 如果为 true，立即建立 TLS 连接（隐式 TLS）。如果为 false，连接开始时不加密，但可以通过 STARTTLS 升级为 TLS。 |
| **servername**                 | `String`            | 主机名                 | TLS 的服务器名称用于 SNI（服务器名称指示）。如果 `host` 是 IP 地址，会自动设置为 `host` 的值。          |
| **name**                       | `String`            | `os.hostname()`       | 发送 EHLO/HELO 命令时用于身份标识的主机名。如果系统主机名不是有效的 FQDN，则回退为 `[127.0.0.1]`。        |
| **localAddress**               | `String`            | -                     | 用于绑定外发连接的本地网络接口。                                                                |
| **connectionTimeout**          | `Number`            | `120000`              | 建立连接的最长等待时间，单位毫秒（2 分钟）。                                                    |
| **greetingTimeout**            | `Number`            | `30000`               | 连接建立后等待服务器问候最长时间，单位毫秒（30 秒）。                                          |
| **socketTimeout**              | `Number`            | `600000`              | 在无操作状态下，连接被自动关闭前的最长时间，单位毫秒（10 分钟）。                                |
| **dnsTimeout**                 | `Number`            | `30000`               | DNS 解析的最长等待时间，单位毫秒（30 秒）。                                                     |
| **logger**                     | `Boolean \| Object` | `false`               | 设置为 `true` 以启用控制台日志，或提供一个兼容 Bunyan 的 logger 实例以进行自定义日志记录。          |
| **debug**                      | `Boolean`           | `false`               | 如果为 true，将向日志记录所有 SMTP 的命令与响应流量。                                           |
| **lmtp**                       | `Boolean`           | `false`               | 如果为 true，使用 LMTP（本地邮件传输协议）代替 SMTP。                                           |
| **ignoreTLS**                  | `Boolean`           | `false`               | 如果为 true，即使服务器支持也不会尝试 STARTTLS。                                                |
| **requireTLS**                 | `Boolean`           | `false`               | 如果为 true，要求 STARTTLS 并在升级失败时返回失败。                                            |
| **opportunisticTLS**           | `Boolean`           | `false`               | 如果为 true，尝试 STARTTLS，但升级失败时继续使用不加密连接。                                    |
| **tls**                        | `Object`            | -                     | 直接传递给 Node.js `tls.connect()` 和 `tls.createSecureContext()` 的附加选项，用于配置证书、加密算法等。 |
| **socket**                     | `net.Socket`        | -                     | 用于替代新建套接字的预创建套接字，但套接字尚未连接。                                           |
| **connection**                 | `net.Socket`        | -                     | 一个已连接的套接字，适用于连接池或 [代理](/smtp/proxies/) 场景。                               |
| **secured**                    | `Boolean`           | `false`               | 当通过 `connection` 选项提供已升级为 TLS 的套接字时设置为 true。                               |
| **allowInternalNetworkInterfaces** | `Boolean`        | `false`               | 如果为 true，允许连接到内部或私有网络接口。                                                    |
| **customAuth**                 | `Object`            | -                     | 非标准认证方式的自定义认证处理程序（参见 [自定义认证](/smtp/customauth/)）。                   |

---

## 事件

SMTPConnection 继承自 Node.js 的 EventEmitter，并触发以下事件：

| 事件          | 参数              | 描述                                                               |
| ------------ | ----------------- | ------------------------------------------------------------------ |
| **connect**  | -                 | 连接建立并完成 SMTP 握手时触发。                                    |
| **error**    | `Error`           | 连接或 SMTP 会话期间出现错误时触发。                                |
| **end**      | -                 | 连接关闭时触发。                                                    |

---

## 方法

### `connect(callback)`

建立与 SMTP 服务器的连接。回调在连接准备就绪可接收命令时（初始问候和 EHLO/HELO 握手后）调用。

```javascript
connection.connect((err) => {
  if (err) {
    console.error("连接失败:", err);
    return;
  }
  console.log("已连接!");
});
```

### `login(auth, callback)`

与 SMTP 服务器进行认证。仅当服务器需要认证时调用此方法。`auth` 对象支持以下属性：

- `user` - 认证用户名
- `pass` - 认证密码
- `method` - 使用的认证方式（可选）。未指定时由客户端自动选择服务器支持的最佳方式
- `oauth2` - 供 XOAUTH2 认证使用的 [OAuth2](/smtp/oauth2/) 令牌提供者对象

```javascript
connection.login(
  {
    user: "username",
    pass: "password",
  },
  (err) => {
    if (err) {
      console.error("认证失败:", err);
      return;
    }
    console.log("认证成功!");
  }
);
```

### `send(envelope, message, callback)`

发送邮件。`envelope` 定义 SMTP 事务的发件人与收件人地址，`message` 包含符合 RFC 5322 格式的邮件内容。

`message` 参数可以是字符串、Buffer 或可读流。

```javascript
const envelope = {
  from: "sender@example.com",
  to: ["recipient@example.com"],
};

const message = "From: sender@example.com\r\nTo: recipient@example.com\r\nSubject: Test\r\n\r\nHello!";

connection.send(envelope, message, (err, info) => {
  if (err) {
    console.error("发送失败:", err);
    return;
  }
  console.log("邮件已发送:", info);
});
```

回调接收一个 `info` 对象，包含以下属性：

- `accepted` - 被服务器接受的收件人地址数组
- `rejected` - 被服务器拒绝的收件人地址数组
- `rejectedErrors` - 与每个拒绝收件人相关的错误对象数组
- `response` - 服务器的最终响应字符串
- `envelopeTime` - 发送信封（MAIL FROM 和 RCPT TO 命令）耗时，单位毫秒
- `messageTime` - 发送邮件数据耗时，单位毫秒
- `messageSize` - 发送邮件的字节大小

### `reset(callback)`

发送 SMTP RSET 命令以重置当前会话状态。用于在不关闭连接的情况下放弃当前邮件事务。

```javascript
connection.reset((err, success) => {
  if (err) {
    console.error("重置失败:", err);
    return;
  }
  console.log("会话已重置");
});
```

### `quit()`

发送 SMTP QUIT 命令并优雅地关闭连接。服务器收到会话结束通知。

```javascript
connection.quit();
```

### `close()`

立即关闭连接，不发送 QUIT 命令。用于强制断开场景。

```javascript
connection.close();
```

---

## 信封选项

信封对象定义 SMTP 事务参数，支持以下属性：

| 属性          | 类型       | 描述                                                       |
| ------------ | ---------- | ---------------------------------------------------------- |
| **from**     | `String`   | MAIL FROM 命令中使用的发件人地址。                         |
| **to**       | `String[]` | RCPT TO 命令中使用的收件人地址数组。                       |
| **size**     | `Number`   | 邮件大小（字节）。用于 SIZE 扩展，发送前检查服务器是否接受。|
| **use8BitMime** | `Boolean` | 如果为 true，当服务器支持时请求 8BITMIME 编码。             |
| **dsn**      | `Object`   | 投递状态通知选项（见下文）。                               |

### DSN 选项

投递状态通知允许您获得邮件投递状态的报告。DSN 对象支持以下属性：

```javascript
const envelope = {
  from: "sender@example.com",
  to: ["recipient@example.com"],
  dsn: {
    ret: "HDRS", // DSN 返回内容： 'HDRS' 表示仅返回头部，'FULL' 表示返回完整消息
    envid: "unique-id-123", // 用于跟踪的唯一信封标识符
    notify: "SUCCESS,FAILURE", // 何时发送 DSN：'NEVER', 'SUCCESS', 'FAILURE', 'DELAY'（逗号分隔）
    orcpt: "rfc822;original@example.com", // 原始收件人地址（格式为地址类型;地址）
  },
};
```

---

## 完整示例

此示例演示完整工作流程：连接、认证、发送邮件和关闭连接。

```javascript
const SMTPConnection = require("nodemailer/lib/smtp-connection");

const connection = new SMTPConnection({
  host: "smtp.example.com",
  port: 587,
  secure: false,
  debug: true,
  logger: true,
});

connection.on("error", (err) => {
  console.error("连接错误:", err);
});

connection.connect((err) => {
  if (err) {
    console.error("连接失败:", err);
    return;
  }

  connection.login(
    {
      user: "username",
      pass: "password",
    },
    (err) => {
      if (err) {
        console.error("认证失败:", err);
        connection.close();
        return;
      }

      const envelope = {
        from: "sender@example.com",
        to: ["recipient@example.com"],
      };

      const message = `From: sender@example.com
To: recipient@example.com
Subject: 测试邮件
Content-Type: text/plain; charset=utf-8

来自 SMTPConnection 的问候！`;

      connection.send(envelope, message, (err, info) => {
        if (err) {
          console.error("发送失败:", err);
        } else {
          console.log("邮件已发送！");
          console.log("接受地址:", info.accepted);
          console.log("拒绝地址:", info.rejected);
          console.log("服务器响应:", info.response);
        }

        connection.quit();
      });
    }
  );
});
```

---

## 属性

连接建立后，可以访问连接实例上的以下属性：

| 属性                   | 类型       | 描述                                               |
| ---------------------- | ---------- | -------------------------------------------------- |
| **id**                 | `String`   | 该连接实例的唯一标识符。                            |
| **secure**             | `Boolean`  | 连接是否使用 TLS 加密。                             |
| **authenticated**      | `Boolean`  | 用户是否已成功认证。                               |
| **lastServerResponse** | `String`   | 最近收到的来自服务器的响应。                        |
| **allowsAuth**         | `Boolean`  | 服务器是否在其 EHLO 响应中支持认证。               |

---

## 支持的认证方法

SMTPConnection 支持以下认证方法：

- `PLAIN` - 使用 Base64 编码发送凭据
- `LOGIN` - 旧方法，分别发送用户名和密码
- `CRAM-MD5` - 使用 MD5 哈希的质询响应认证
- `XOAUTH2` - 适用于 Gmail 等服务的 [OAuth 2.0](/smtp/oauth2/) 认证
- 通过 `customAuth` 选项实现自定义方法

客户端会自动选择最安全且被服务器支持的认证方法，除非你明确指定。

---

## 许可证

[MIT](https://github.com/nodemailer/nodemailer/blob/master/LICENSE)
