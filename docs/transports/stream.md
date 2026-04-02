---
title: 流传输
sidebar_position: 28
description: 以流、Buffer 或 JSON 对象的形式生成 RFC 822 消息，用于测试或自定义投递流程。
---

流传输 **不是** 一个真正的 SMTP 传输。它不是将你的邮件发送到远程邮件服务器，而是 _生成_ 完整的 RFC 822 格式的邮件内容并返回给你。这使其非常适合：

- **[测试](../smtp/testing)** - 检查将要通过网络发送的精确字节，创建快照测试，或者将输出转发给其他系统进行验证。
- **自定义投递流程** - 对邮件应用 Nodemailer 插件（例如 DKIM 签名或列表头），然后通过内部 API 自行处理投递，归档邮件以供审计记录，或者以任何自定义方式处理。

有关所有可用传输的概述，请参见 [传输文档](./index.md)。

---

## 启用流传输

要使用流传输，请在选项对象中设置 `streamTransport: true` 来创建一个 transporter：

```javascript
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  streamTransport: true,
  // 参见下文的更多选项
});
```

### 选项

| 选项               | 类型                   | 默认值       | 描述                                                                                             |
| ------------------ | ---------------------- | ------------ | ------------------------------------------------------------------------------------------------ |
| `streamTransport`  | `boolean`              | **必填**     | 设置为 `true` 以启用流传输。                                                                      |
| `buffer`           | `boolean`              | `false`      | 设置为 `true` 时，生成的邮件将作为 `Buffer` 返回，而不是作为可读流（`Readable`）。                    |
| `newline`          | `'windows' \| 'unix'`  | `'unix'`     | 生成邮件的换行符样式。使用 `'windows'` 表示 CRLF (`\r\n`)，使用 `'unix'` 表示 LF (`\n`)。           |

:::note JSON 传输
还有一个独立的 **JSON 传输** 可用。通过设置 `jsonTransport: true`（而不是 `streamTransport`）启用它。JSON 传输返回消息的序列化 JSON 表示，而非原始的 RFC 822 格式。详情请参阅下面的 [JSON 传输部分](#json-transport)。
:::

### `sendMail()` 回调函数签名

`sendMail()` 的回调函数接收两个参数：`(err, info)`。成功时，`info` 对象包含：

- **`envelope`** - SMTP 信封对象，包含 `from`（字符串）和 `to`（字符串数组）属性。
- **`messageId`** - 生成的邮件 _Message-ID_ 头字段值。
- **`message`** - 生成的邮件内容。默认是 Node.js 的 `Readable` 流。如果设置了 `buffer: true`，则为 `Buffer`。对于 JSON 传输，则为 JSON 字符串（如果设置了 `skipEncoding: true`，则为普通对象）。

有关配置传递给 `sendMail()` 的邮件对象的详细信息，请参见 [邮件配置](../message/) 文档。要解析生成的 RFC 822 流输出，可以使用 [MailParser](../extras/mailparser)。

---

## 示例

### 1. 使用 Windows 样式换行符流式传输邮件

该示例生成一个可读流邮件，使用 Windows 样式 CRLF 换行符。可将此流管道（pipe）转发到任何可写目标。

```javascript
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  streamTransport: true,
  newline: "windows", // 使用 CRLF (\r\n) 换行
});

transporter.sendMail(
  {
    from: "sender@example.com",
    to: "recipient@example.com",
    subject: "流式消息",
    text: "此消息使用 CRLF 换行符进行流式传输。",
  },
  (err, info) => {
    if (err) throw err;
    console.log(info.envelope);   // { from: '...', to: ['...'] }
    console.log(info.messageId);  // '<unique-id@example.com>'
    // 将原始 RFC 822 消息输出到标准输出
    info.message.pipe(process.stdout);
  }
);
```

### 2. 返回带 Unix 样式换行符的 Buffer

当你需要一次性将整个邮件存储到内存中时，设置 `buffer: true`。此示例显式使用 Unix 样式 LF 换行符（默认值）。

```javascript
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  streamTransport: true,
  buffer: true,    // 返回 Buffer 而非流
  newline: "unix", // 使用 LF (\n) 换行（默认）
});

transporter.sendMail(
  {
    from: "sender@example.com",
    to: "recipient@example.com",
    subject: "缓存消息",
    text: "此消息使用 LF 换行符缓存。",
  },
  (err, info) => {
    if (err) throw err;
    console.log(info.envelope);
    console.log(info.messageId);
    // 整封邮件作为 Buffer 可用
    console.log(info.message.toString());
  }
);
```

### 3. 生成 JSON 编码的邮件对象（>= v3.1.0） {#json-transport}

**JSON 传输** 是一种独立的传输类型，而不是流传输的选项。使用时，请设置 `jsonTransport: true` 代替 `streamTransport`。生成的 `info.message` 是表示邮件结构的 JSON 字符串。这种格式适合存储邮件、测试时检查邮件内容或传递给其他系统。邮件中的二进制数据（如附件）会自动进行 base64 编码。

如果你更愿意处理 JavaScript 对象而非 JSON 字符串，可设置 `skipEncoding: true` 来直接获取原始数据对象。

```javascript
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  jsonTransport: true,
});

transporter.sendMail(
  {
    from: "sender@example.com",
    to: "recipient@example.com",
    subject: "JSON 消息",
    text: "希望这封邮件能被转换成 JSON！",
  },
  (err, info) => {
    if (err) throw err;
    console.log(info.envelope);
    console.log(info.messageId);
    console.log(info.message); // JSON 字符串
  }
);
```

以下是 JSON 输出的示例：

```json
{
  "from": { "address": "sender@example.com", "name": "" },
  "to": [{ "address": "recipient@example.com", "name": "" }],
  "subject": "JSON 消息",
  "text": "希望这封邮件能被转换成 JSON！",
  "headers": {},
  "messageId": "<77a3458f-8070-339d-095f-85bb73f3db8e@example.com>"
}
```

---

## 何时选择流传输或 JSON 传输

以下表格帮助你决定哪种传输方式更适合你的需求：

| 使用场景                                           | 推荐的传输方式                         |
| ------------------------------------------------- | ----------------------------------- |
| 检查或管道传输原始 RFC 822 SMTP 内容              | `streamTransport`（流或 Buffer）     |
| 存储结构化的邮件数据以供后续重放                   | `jsonTransport`                     |
| 应用 Nodemailer 插件（如 DKIM、邮件头等）          | 两者皆可（插件在输出前运行）          |
| 需要访问 `_raw` 属性（参见 [自定义源](../message/custom-source)） | **仅限流传输**                     />
