---
title: 错误参考
sidebar_position: 11
---

本页面记录了 Nodemailer 及相关包可能产生的所有错误代码和错误类型。理解这些错误将帮助您诊断问题并在应用中实现恰当的错误处理。

## 错误对象结构

当 Nodemailer 遇到错误时，会创建一个带有附加属性的 Error 对象，以提供错误发生的上下文信息。

| 属性           | 类型       | 描述                                                                                              |
| -------------- | ---------- | ------------------------------------------------------------------------------------------------- |
| `message`      | `string`   | 人类可读的错误描述。                                                                                 |
| `code`         | `string`   | 用于标识错误类型的错误代码（比如 `ECONNECTION` 或 `EAUTH`）。                                      |
| `command`      | `string`   | 出错时执行的 SMTP 命令（如 `CONN`、`AUTH LOGIN`）。                                                |
| `response`     | `string`   | SMTP 服务器返回的原始响应字符串（如果可用）。                                                        |
| `responseCode` | `number`   | SMTP 服务器返回的数字响应码（如认证失败时的 `535`）。                                              |

示例错误对象：

```javascript
{
  message: 'Invalid login: 535 5.7.8 Authentication failed',
  code: 'EAUTH',
  command: 'AUTH PLAIN',
  response: '535 5.7.8 Authentication failed',
  responseCode: 535
}
```

## 错误代码

Nodemailer 使用特定错误代码来分类不同类型的失败。这些代码设置在 `error.code` 属性上。

### 快速参考

| 代码          | 分类          | 描述                               |
| ------------- | ------------- | ---------------------------------- |
| `ECONNECTION` | 连接          | 连接意外关闭                       |
| `ETIMEDOUT`   | 连接          | 连接或操作超时                     |
| `EDNS`        | 连接          | DNS 解析失败                      |
| `ESOCKET`     | 连接          | 套接字级别错误                    |
| `ETLS`        | TLS/安全       | TLS 握手或 STARTTLS 失败           |
| `EREQUIRETLS` | TLS/安全       | 不支持 REQUIRETLS（RFC 8689）     |
| `EAUTH`       | 认证          | 认证失败                         |
| `ENOAUTH`     | 认证          | 未提供认证                       |
| `EOAUTH2`     | 认证          | OAuth2 令牌错误                  |
| `EENVELOPE`   | 邮件信封       | 无效的邮件信封                   |
| `EMESSAGE`    | 消息          | 消息投递错误                    |
| `ESTREAM`     | 流            | 流处理错误                      |
| `EPROTOCOL`   | 协议          | SMTP 服务器响应无效             |
| `EMAXLIMIT`   | 连接池         | 连接池资源限制达到               |
| `ECONFIG`     | 配置          | 无效配置                      |
| `EPROXY`      | 代理          | 代理连接错误                   |
| `EFILEACCESS` | 内容          | 文件访问被拒绝                 |
| `EURLACCESS`  | 内容          | URL 访问被拒绝                 |
| `EFETCH`      | 内容          | HTTP 获取错误                  |
| `ESENDMAIL`   | 传输          | sendmail 命令错误              |
| `ESES`        | 传输          | AWS SES 错误                  |

### 连接错误

#### ECONNECTION

发生了一般的连接错误。通常发生在：

- 无法建立与 SMTP 服务器的连接
- 连接在事务期间意外关闭
- 服务器终止了连接（响应码 421）
- 套接字出现错误

**常见原因：**
- 主机名或端口配置错误
- 防火墙阻止连接
- 服务器宕机或无法访问
- 网络连接问题

**排查建议：**
- 验证传输配置中的 `host` 和 `port` 设置
- 检查网络是否允许指定端口的出站连接
- 使用 `telnet 主机名 端口` 测试基础连接
- 确保 SMTP 服务器正在运行并接受连接

#### ETIMEDOUT

操作超时。可能出现的场景有：

- 连接超时：未在允许时间内建立 TCP 连接
- 问候超时：连接建立后服务器未发送欢迎问候
- 套接字超时：连接长时间无活动

**默认超时值：**
- 连接超时：2 分钟（120000 毫秒）
- 问候超时：30 秒（30000 毫秒）
- 套接字超时：10 分钟（600000 毫秒）

**排查建议：**
- 如果网络缓慢，增加传输配置中的超时参数
- 检查服务器与 SMTP 服务器之间的网络延迟
- 验证 SMTP 服务器是否响应正常

```javascript
const transporter = nodemailer.createTransport({
  host: "smtp.example.com",
  port: 587,
  connectionTimeout: 60000, // 1 分钟
  greetingTimeout: 30000,   // 30 秒
  socketTimeout: 300000,    // 5 分钟
});
```

#### EDNS

DNS 解析失败。主机名无法解析为 IP 地址。

**常见原因：**
- 主机名错误（域名拼写错误）
- DNS 服务器无法访问
- 域名不存在

**排查建议：**
- 确认主机名正确
- 测试 DNS 解析：`nslookup smtp.example.com`
- 检查 DNS 服务器配置

#### ESOCKET

发生低级别套接字错误。通常是 Node.js net 或 tls 模块传递的错误。

**常见原因：**
- 通信过程中网络中断
- 连接被对端重置（ECONNRESET）
- 管道断裂（EPIPE）

### TLS/SSL 错误

#### ETLS

发生 TLS 相关错误，可能是在：

- 建立 TLS 连接（用 `secure: true` 和端口 465）
- STARTTLS 升级（从未加密连接升级）
- TLS 证书验证

**常见原因：**
- TLS 证书无效或自签名
- 证书主机名不匹配
- TLS 版本不兼容
- STARTTLS 命令失败

**排查建议：**
- 在开发环境下对自签名证书使用 `tls: { rejectUnauthorized: false }`
- 确保服务器证书有效且未过期
- 使用 IP 连接时设置 `tls.servername`
- 检查服务器是否支持所用 TLS 版本

```javascript
const transporter = nodemailer.createTransport({
  host: "smtp.example.com",
  port: 465,
  secure: true,
  tls: {
    // 不因无效证书失败（仅限开发环境！）
    rejectUnauthorized: false,
    // 指定 SNI 的服务器名
    servername: "smtp.example.com",
  },
});
```

### 认证错误

#### EAUTH

认证失败。服务器拒绝了提供的凭据或认证方式。

**常见原因：**
- 用户名或密码错误
- 账户被锁定或禁用
- 服务器不支持的认证方式
- OAuth2 令牌无效或过期
- 启用了两步验证但未使用应用专用密码

**`command` 属性指出失败的认证步骤：**
- `AUTH LOGIN` - LOGIN 认证方式
- `AUTH PLAIN` - PLAIN 认证方式
- `AUTH CRAM-MD5` - CRAM-MD5 认证方式
- `AUTH XOAUTH2` - OAuth2 认证

**排查建议：**
- 检查用户名密码是否正确
- 对 Gmail，启用 2FA 时使用应用专用密码
- OAuth2 时确保访问令牌有效未过期
- 检查服务器是否支持所选认证方法

```javascript
// Gmail 使用应用专用密码示例
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "your.email@gmail.com",
    pass: "your-16-char-app-password", // 非普通密码！
  },
});
```

#### ENOAUTH

服务器要求认证（且 `forceAuth` 选项开启），但未提供认证凭据。

**排查建议：**
- 在传输配置中添加 `auth` 对象
- 确保同时设置了 `user` 和 `pass` 属性

#### EOAUTH2

OAuth2 令牌生成或刷新时发生错误。

**常见原因：**
- 缺少必需配置（如服务账号需 `privateKey` 和 `user`）
- 刷新令牌无效或被撤销
- JWT 签名失败
- OAuth 服务器返回错误响应
- 服务器响应中无访问令牌

**排查建议：**
- 核实 OAuth2 凭据正确
- 检查刷新令牌是否有效
- 服务账号确保私钥格式正确
- 查看错误信息中的具体 OAuth 服务器错误详情

```javascript
// OAuth2 配置示例
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: "your.email@gmail.com",
    clientId: "your-client-id",
    clientSecret: "your-client-secret",
    refreshToken: "your-refresh-token",
  },
});
```

### 信封错误

#### EENVELOPE

邮件信封无效。涉及 MAIL FROM 和 RCPT TO 命令。

**常见原因：**
- 无收件人（`to`、`cc` 和 `bcc` 都为空）
- 发件人地址格式无效
- 收件人地址格式无效
- 服务器拒绝所有收件人
- 服务器拒绝发件人地址
- 服务器不支持 SMTPUTF8，使用了国际化邮箱地址

**错误场景：**
- `No recipients defined` - 信封无有效收件人
- `Invalid sender` - 发件人地址含非法字符
- `Invalid recipient` - 收件人地址含非法字符
- `Can't send mail - all recipients were rejected` - 所有收件人被服务器拒绝
- `Mail command failed` - 服务器拒绝发件人地址
- `Recipient command failed` - 服务器拒绝某个收件人地址
- `Data command failed` - 服务器拒绝 DATA 命令
- `Internationalized mailbox name not allowed` - 未支持 SMTPUTF8 而使用了 Unicode 地址

**排查建议：**
- 确保至少指定一个收件人
- 验证邮件地址中不包含 `<`、`>` 和换行等非法字符
- 查看服务器日志了解地址为何被拒绝
- 对被拒绝的收件人，检查错误对象中的 `rejected` 和 `rejectedErrors` 数组

```javascript
try {
  await transporter.sendMail(message);
} catch (err) {
  if (err.code === 'EENVELOPE') {
    console.log('被拒绝的收件人:', err.rejected);
    console.log('拒绝详情:', err.rejectedErrors);
  }
}
```

### 消息错误

#### EMESSAGE

消息内容无效或被服务器拒绝。

**常见原因：**
- 消息正文为空
- 消息大小超出服务器限制
- 服务器在 DATA 命令后拒绝消息
- 消息内容违规（如被垃圾邮件过滤）

**排查建议：**
- 确保消息有内容（text 或 html）
- 检查消息大小是否超出服务器 SIZE 限制
- 审查消息内容是否符合服务器策略

### 流错误

#### ESTREAM

读取消息流时发生错误。常见于用流传递消息内容或附件。

**常见原因：**
- 源流发生了错误
- 使用文件路径附件时文件不存在
- 获取 URL 内容时网络错误

**排查建议：**
- 确认文件路径存在且可读
- 在传递给 Nodemailer 前处理流错误
- 检查访问 URL 内容时的网络连接

### 协议错误

#### EPROTOCOL

服务器响应不符合预期 SMTP 协议格式。

**常见原因：**
- 无效的问候响应（未以 220 开头）
- 无效的 EHLO/HELO 响应
- 命令响应异常
- 目标非 SMTP 服务器

**排查建议：**
- 确认连接的是 SMTP 服务器（非 HTTP、IMAP 等）
- 检查端口号是否为 SMTP 端口
- 查看服务器日志排查协议问题

### 连接池专属错误

#### EMAXLIMIT

连接池已达到最大连接数或发送重试限制。

**常见原因：**
- 所有连接池连接均处于繁忙
- 连接失败后达到最大重试数
- 连接池耗尽

**排查建议：**
- 提高连接池配置中 `maxConnections`
- 降低发送消息速率
- 检查连接泄漏（连接未及时释放）

### 配置错误

#### ECONFIG

传输配置无效或使用了弃用格式。

**常见原因：**
- 使用旧版 SES 配置格式（v7.0.0 之前）
- 传输参数错误

**排查建议：**
- 更新配置为当前 API 格式
- SES 使用 `@aws-sdk/client-sesv2` 取代旧版 SDK
- 查阅 Nodemailer 文档确认最新选项

### 代理错误

#### EPROXY

通过代理服务器连接时出错。

**常见原因：**
- 代理 URL 或配置错误
- 代理服务器返回错误响应
- SOCKS 代理未加载 `socks` 模块
- 代理协议未知

**排查建议：**
- 确认代理 URL 格式正确（例如 `http://proxy.example.com:3128`）
- SOCKS 代理需安装 `socks` 模块
- 检查代理服务器日志

```javascript
const transporter = nodemailer.createTransport({
  host: "smtp.example.com",
  port: 587,
  proxy: "http://proxy.example.com:3128",
});
```

### 内容访问错误

#### EFILEACCESS

因为启用了 `disableFileAccess`，文件访问被拒绝。

**发生情况：**
- 当尝试使用文件路径作为附件内容时且 `disableFileAccess: true`
- 这是防止读取本地文件的安全特性

**排查建议：**
- 需要附件文件时，设置 `disableFileAccess: false`（默认值）
- 使用 Buffer 或流传递内容，避免用文件路径

```javascript
// 如果 disableFileAccess 为 true 会抛出 EFILEACCESS
const message = {
  attachments: [{ path: "/path/to/file.pdf" }],
};

// 安全的替代方案：直接使用内容
const message = {
  attachments: [{ content: fs.readFileSync("/path/to/file.pdf") }],
};
```

#### EURLACCESS

因为启用了 `disableUrlAccess`，URL 访问被拒绝。

**发生情况：**
- 尝试使用 URL 作为附件内容且 `disableUrlAccess: true`
- 这是防止获取远程内容的安全特性

**排查建议：**
- 需要基于 URL 的附件时，设置 `disableUrlAccess: false`（默认）
- 自行获取内容后以 Buffer 形式传入

```javascript
// 如果 disableUrlAccess 为 true 会抛出 EURLACCESS
const message = {
  attachments: [{ href: "https://example.com/file.pdf" }],
};
```

#### EFETCH

获取远程内容时 HTTP 请求失败。

**常见原因：**
- 请求 URL 时网络错误
- HTTP 请求超时
- 服务器返回无效状态码
- 重定向次数超过限制

**排查建议：**
- 确认 URL 可访问
- 检查网络连接情况
- 确保服务器返回成功状态码

### TLS 扩展错误

#### EREQUIRETLS

请求了 REQUIRETLS 扩展（RFC 8689），但服务器不支持。

**发生情况：**
- 消息选项中设置了 `requireTLSExtensionEnabled: true`
- SMTP 服务器未广播 REQUIRETLS 功能

**排查建议：**
- 检查 SMTP 服务器是否支持 RFC 8689 REQUIRETLS
- 服务器不支持时移除 `requireTLSExtensionEnabled` 选项
- 需高安全交付时使用支持 REQUIRETLS 的服务器

```javascript
const message = {
  from: "sender@example.com",
  to: "recipient@example.com",
  subject: "Secure message",
  text: "This requires TLS throughout delivery",
  requireTLSExtensionEnabled: true, // 服务器支持时启用
};
```

### 传输特定错误

#### ESENDMAIL

sendmail 传输过程发生错误。

**常见原因：**
- 找不到 sendmail 可执行文件（退出码 127）
- sendmail 进程异常退出
- 信封地址无效（以 `-` 开头，存在安全风险）
- 无法启动 sendmail 进程

**排查建议：**
- 确认 sendmail 已安装且在系统 PATH 中
- 检查 sendmail 路径配置
- 确保信封地址有效

```javascript
const transporter = nodemailer.createTransport({
  sendmail: true,
  path: "/usr/sbin/sendmail", // 如需，指定显式路径
});
```

#### ESES

AWS SES 传输发生错误。通常是 AWS SDK 返回的错误。

## SMTP 响应代码

与 SMTP 服务器通信时，可能收到数字响应码。错误对象的 `responseCode` 属性包含该值。

### 成功码（2xx）

| 代码  | 含义                            |
| ----- | ------------------------------- |
| 220   | 服务就绪                       |
| 221   | 服务关闭传输通道               |
| 235   | 认证成功                      |
| 250   | 请求的邮件操作完成            |
| 251   | 用户非本地区域，将转发邮件    |
| 252   | 无法验证用户，但将接受消息    |
| 354   | 开始邮件输入                   |

### 临时失败码（4xx）

表示临时失败，稍后重试可能成功。

| 代码  | 含义                                          |
| ----- | --------------------------------------------- |
| 421   | 服务不可用，关闭传输通道                      |
| 450   | 请求的邮件操作未完成：邮箱不可用            |
| 451   | 请求操作中止：本地处理错误                    |
| 452   | 请求的操作未完成：存储空间不足                |
| 454   | 临时认证失败                                  |

### 永久失败码（5xx）

表示永久失败，必须做出更改才能成功。

| 代码  | 含义                                                             |
| ----- | ---------------------------------------------------------------- |
| 500   | 语法错误，命令无法识别                                           |
| 501   | 参数或参数格式语法错误                                           |
| 502   | 命令未实现                                                     |
| 503   | 命令序列错误                                                    |
| 504   | 命令参数未实现                                                 |
| 530   | 需要认证                                                      |
| 535   | 认证凭据无效                                                  |
| 538   | 请求认证机制需要加密                                           |
| 550   | 请求的操作未完成：邮箱不可用（不存在或无权限）               |
| 551   | 用户非本地；请尝试转发                                         |
| 552   | 请求的邮件操作中止：超出存储配额                              |
| 553   | 请求操作未完成：邮箱名称不允许（语法无效）                   |
| 554   | 事务失败（或无 SMTP 服务）                                   |
| 555   | MAIL FROM/RCPT TO 参数不被识别                                |

## SES 传输错误

使用 Amazon SES 传输时，错误代码为 `ESES`，包含 AWS SDK 返回的底层错误。常见 SES 错误代码：

| 代码                   | 含义                               |
| ---------------------- | ---------------------------------- |
| `InvalidParameterValue`| API 请求参数无效                   |
| `MessageRejected`      | SES 拒绝消息（内容政策违规）      |

## Sendmail 传输错误

使用 sendmail 传输时，错误代码为 `ESENDMAIL`，错误由 sendmail 进程退出码生成：

| 退出码  | 错误信息                                           |
| ------- | -------------------------------------------------- |
| 127     | 找不到 sendmail 命令，进程退出码为 127            |
| 其他    | sendmail 进程以代码 X 退出                         |

其它 sendmail 错误：
- `Can not send mail. Invalid envelope addresses.` - 地址以 `-` 开头（安全风险）
- `sendmail was not found` - 无法启动 sendmail 二进制文件

## OAuth2 错误

使用 OAuth2 认证时报错，代码为 `EOAUTH2`。常见错误信息：

| 错误信息                                               | 原因                                                          |
| ------------------------------------------------------ | ------------------------------------------------------------- |
| `Can't create new access token for user`               | 无刷新机制可用且令牌已过期                                     |
| `Can't generate token. Check your auth options`        | JWT 签名失败（服务账号）                                        |
| `Invalid authentication response`                      | OAuth 服务器返回无效响应                                        |
| `No access token`                                      | OAuth 服务器响应中无访问令牌                                    |
| `Options "privateKey" and "user" are required...`      | 服务账号缺少必需选项                                            |

服务器返回的 OAuth 错误响应符合 RFC 6749 格式，包含在错误消息中：
```
error: error_description (error_uri)
```

## 错误处理最佳实践

### 基本错误处理

```javascript
try {
  const info = await transporter.sendMail(message);
  console.log('消息已发送:', info.messageId);
} catch (err) {
  console.error('发送失败:', err.message);
  console.error('错误代码:', err.code);

  if (err.responseCode) {
    console.error('SMTP 响应:', err.responseCode, err.response);
  }
}
```

### 处理特定错误类型

```javascript
try {
  await transporter.sendMail(message);
} catch (err) {
  switch (err.code) {
    case 'ECONNECTION':
    case 'ETIMEDOUT':
    case 'EDNS':
    case 'ESOCKET':
      console.error('网络错误 - 稍后将重试');
      // 安排重试
      break;

    case 'EAUTH':
    case 'ENOAUTH':
      console.error('认证失败 - 请检查凭据');
      // 未解决凭据问题前不重试
      break;

    case 'EOAUTH2':
      console.error('OAuth2 错误 - 请检查令牌配置');
      // 刷新令牌或重新认证
      break;

    case 'EENVELOPE':
      console.error('收件人无效:', err.rejected);
      // 移除无效收件人并重试
      break;

    case 'EMESSAGE':
      console.error('消息被服务器拒绝');
      // 检查消息内容
      break;

    case 'ETLS':
    case 'EREQUIRETLS':
      console.error('TLS/安全错误');
      // 检查 TLS 配置
      break;

    case 'ECONFIG':
      console.error('配置错误');
      // 审查传输配置
      break;

    case 'ESENDMAIL':
      console.error('sendmail 错误');
      // 检查 sendmail 安装与配置
      break;

    default:
      console.error('意外错误:', err);
  }
}
```

### 发送前验证配置

使用 `transporter.verify()` 测试配置：

```javascript
try {
  await transporter.verify();
  console.log('服务器准备好接收邮件');
} catch (err) {
  console.error('配置错误:', err.message);
}
```

### 处理局部失败

当部分收件人被接受，部分被拒绝时：

```javascript
const info = await transporter.sendMail(message);

if (info.rejected && info.rejected.length > 0) {
  console.log('邮件已发送，但部分收件人被拒绝：');
  console.log('接受的收件人:', info.accepted);
  console.log('被拒绝的收件人:', info.rejected);

  if (info.rejectedErrors) {
    info.rejectedErrors.forEach(err => {
      console.log(`  ${err.recipient}: ${err.message}`);
    });
  }
}
```
