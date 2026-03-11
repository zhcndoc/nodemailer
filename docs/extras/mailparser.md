---
title: MailParser
sidebar_position: 3
description: 流式邮件解析器，将 RFC 822 消息转换为结构化的 JavaScript 对象。
---

MailParser 是一个适用于 Node.js 的流式邮件解析器，能够处理非常大的邮件（100MB+），且内存开销极小。它是 [Mailcomposer](./mailcomposer) 的对应工具，后者用于生成 RFC 822 格式的邮件。MailParser 常与 [SMTP Server](./smtp-server) 搭配使用，用来处理接收的邮件。

MailParser 提供两种解析邮件消息的方式：

- **`simpleParser`** - 一个便捷函数，将整个邮件（包括附件）缓存在内存中，返回一个单一的 **mail 对象**。适合内存使用不敏感的简单场景和测试。
- **`MailParser` 类** - 一个更底层的 `Transform` 流，随着消息各部分和附件 _流_ 的可用，逐个发出它们。适用于需要处理大邮件且不希望全部加载到内存的情况。

---

## 安装

```bash
npm install mailparser
```

---

## `simpleParser()`

```javascript
const { simpleParser } = require("mailparser");

// 回调方式
simpleParser(source, options, (err, mail) => {
  if (err) throw err;
  console.log(mail.subject);
});

// Promise 方式
simpleParser(source, options)
  .then((mail) => console.log(mail.subject))
  .catch(console.error);

// async/await
const mail = await simpleParser(source, options);
```

### 参数

- **`source`** - 要解析的邮件消息。可以是包含原始 RFC 822 消息的 `Buffer`、`String` 或 **可读流**。例如，可以解析由 [Stream 传输](../transports/stream) 生成的消息。
- **`options`** - 可选配置对象（可查看 [Options](#options) 获取可用设置）。

### 返回的 **mail 对象**

解析成功后返回的 `mail` 对象包含邮件的所有解析部分：

| 属性           | 类型/说明                                                       |
| -------------- | -------------------------------------------------------------- |
| `headers`      | 小写键的 `Map`，对应解析后的邮件头的值                          |
| `headerLines`  | 原始邮件头行对象的 `Array`                                     |
| `subject`      | `String` - 邮件主题（是对 `headers.get('subject')` 的简写）    |
| `from`         | **地址对象** - 发件人（详情见下文）                             |
| `to`           | **地址对象** - 主收件人                                         |
| `cc`           | **地址对象** - 抄送收件人                                       |
| `bcc`          | **地址对象** - 密送收件人                                       |
| `replyTo`      | **地址对象** - 回复地址                                         |
| `date`         | 表示邮件发送时间的 `Date` 对象                                 |
| `messageId`    | 唯一邮件标识符的 `String`                                      |
| `inReplyTo`    | 当前邮件回复的邮件 ID 的 `String`                               |
| `references`   | 线程中相关邮件 ID 的 `String` 或 `String[]`                    |
| `html`         | 包含嵌入图片转为 **data URI** 的 HTML 正文                     |
| `text`         | 纯文本正文                                                    |
| `textAsHtml`   | 将纯文本正文转换成基础 HTML                                    |
| `attachments`  | `Attachment[]` - 附件对象数组（缓存在内存中）                   |

:::warning 安全提示
MailParser 不会对 HTML 内容进行消毒。如果你要将 `html` 属性显示在网页中，必须先通过可信的 HTML 消毒工具处理，以防止 XSS 攻击。
:::

#### 地址对象

地址字段（`from`、`to`、`cc`、`bcc`、`replyTo`）返回的是带有三种格式的地址对象：

```json
{
  "value": [
    {
      "name": "Jane Doe",
      "address": "jane@example.com"
    }
  ],
  "html": "<span class=\"mp_address_name\">Jane Doe</span> &lt;<a href=\"mailto:jane@example.com\" class=\"mp_address_email\">jane@example.com</a>&gt;",
  "text": "Jane Doe <jane@example.com>"
}
```

- **`value`** - 由单个地址对象组成的数组，每个地址对象含有 `name` 和 `address` 属性。群组地址会使用 `group` 数组替代 `address`。
- **`text`** - 适合纯文本环境下的人类可读字符串。
- **`html`** - 带 mailto 链接的 HTML 格式字符串，适合网页显示。

更多关于地址对象的细节，请参阅 [Message - Addresses](../message/addresses) 部分。

#### `headers` Map

`headers` Map 包含所有邮件头，键为小写邮件头名称。多数邮件头会解析成 **字符串**（单次出现）或 **字符串数组**（多次出现同一邮件头）。

以下邮件头会自动解析成更丰富的结构：

- **地址类邮件头** (`from`、`to`、`cc`、`bcc`、`sender`、`reply-to`、`delivered-to`、`return-path`、`disposition-notification-to`) - 解析成以上描述的地址对象。
- **优先级邮件头** (`x-priority`、`x-msmail-priority`、`importance`) - 统一归一为单一 `priority` 键，值为 `"high"`, `"normal"` 或 `"low"`。
- **`references`** - 解析成 `String` 或 `String[]` 形式的邮件 ID。
- **`date`** - 解析为 JavaScript `Date` 对象。
- **结构化邮件头** (`content-type`、`content-disposition`、`dkim-signature`) - 解析为 `{ value: String, params: Object }` 结构。

---

### 附件对象（simpleParser）

`attachments` 数组中每个附件对象具有以下属性。关于发送邮件时附件选项的比较，请参见 [Message - Attachments](../message/attachments)。

| 属性                 | 说明                                                                  |
| -------------------- | --------------------------------------------------------------------- |
| `filename`           | 附件文件名（若未提供，则可能为 `undefined`）                         |
| `contentType`        | MIME 类型（例如 `"application/pdf"`、`"image/png"`）                  |
| `contentDisposition` | 通常为 `"attachment"` 或 `"inline"`                                  |
| `checksum`           | 附件内容的 MD5 校验和（可通过 `checksumAlgo` 配置）                   |
| `size`               | 附件字节大小                                                        |
| `headers`            | 该附件部分的 MIME 头的 `Map`                                          |
| `content`            | 包含完整附件数据的 `Buffer`                                           |
| `contentId`          | Content-ID 头的值（含尖括号）                                         |
| `cid`                | 无尖括号的 Content-ID，用于匹配 `cid:` URL                           |
| `related`            | 若附件作为嵌入内容（例如 HTML 中引用的内嵌图片），则为 `true`         |

---

## `MailParser`（流式 API）

如需处理大邮件且不希望全部加载到内存，可直接使用 `MailParser` 类：

```javascript
const { MailParser } = require("mailparser");

const parser = new MailParser(options);
sourceStream.pipe(parser);
```

`MailParser` 是一个 **对象模式** 的 `Transform` 流，通过 `'data'` 事件发出两种类型的对象：

1. **`{ type: 'attachment', ... }`** - 为每个附件发出。其 `content` 属性是一个必须被消费的 **可读流**。
2. **`{ type: 'text', html, text, textAsHtml }`** - 在所有部分处理完后发出一次，包含邮件正文内容。

### 邮件头事件

`MailParser` 也会发出两个事件以访问邮件头：

1. **`'headers'`** - 发出一个 `Map`，包含解析好的邮件头键值。邮件头完全解析后触发一次。
2. **`'headerLines'`** - 发出一个包含原始邮件头数据的对象数组，每个对象含 `key` 和 `line` 属性。

```javascript
parser.on("headers", (headers) => {
  console.log("主题:", headers.get("subject"));
  console.log("发件人:", headers.get("from"));
});
```

### 流配置选项 {#options}

以下选项可传给 `simpleParser()` 和 `new MailParser()`：

| 选项                 | 默认值       | 说明                                                               |
| -------------------- | ------------ | ------------------------------------------------------------------ |
| `skipHtmlToText`     | `false`      | 如果无纯文本内容，不从 HTML 生成纯文本                            |
| `maxHtmlLengthToParse` | `Infinity`   | 解析用于文本转换的 HTML 最大字节数                                 |
| `formatDateString`   | `undefined`  | 自定义函数，将 `Date` 对象格式化为字符串                          |
| `skipImageLinks`     | `false`      | 保留 `cid:` 图片 URL，避免转换为 data URI                         |
| `skipTextToHtml`     | `false`      | 不从纯文本内容生成 `textAsHtml`                                   |
| `skipTextLinks`      | `false`      | 不自动检测并链接纯文本中的 URL                                    |
| `keepDeliveryStatus` | `false`      | 将 `message/delivery-status` 部分视为附件，非文本                |
| `checksumAlgo`       | `'md5'`      | 附件校验和的哈希算法（如 `'sha256'`、`'sha512'`）                |
| `Iconv`              | `iconv-lite` | 用于字符集转换的替代 iconv 实现                                  |
| `keepCidLinks`       | `false`      | **仅限 simpleParser** - 保留 `cid:` URL，不转换为 data URI（等同于 `skipImageLinks: true`） |

### 附件流对象（`type === 'attachment'`）

使用 `MailParser` 流式 API 时，附件对象属性与上述相同，但有重要区别：

- **`content`** 是一个 **可读流**，不是 Buffer。必须消费该流以获取附件数据。
- **处理完成后必须调用 `attachment.release()`**。解析在所有附件全部释放之前暂停，防止内存无限增长。
- **`related`** 属性仅在解析完成后（`'end'` 事件时）可用，附件首次发出时不可用。

```javascript
const fs = require("fs");

parser.on("data", (part) => {
  if (part.type === "attachment") {
    console.log("保存附件:", part.filename);

    // 将附件流写入文件
    const output = fs.createWriteStream(part.filename);
    part.content.pipe(output);

    // 文件写入完成后释放附件
    output.on("finish", () => {
      part.release();
    });
  }
});

parser.on("end", () => {
  console.log("解析完成");
});
```

---

## 字符集解码

MailParser 使用 [iconv-lite](https://www.npmjs.com/package/iconv-lite) 将字符编码转换为 UTF-8。以下例外：

**ISO-2022-JP** 和 **EUC-JP** 编码由 [encoding-japanese](https://www.npmjs.com/package/encoding-japanese) 处理，以保证更高精度。

如果你希望使用 [`node-iconv`](https://www.npmjs.com/package/iconv)（例如支持更多编码），可以通过 `Iconv` 选项注入：

```javascript
const { Iconv } = require("iconv");
const { simpleParser } = require("mailparser");

simpleParser(rfc822Message, { Iconv })
  .then((mail) => {
    console.log(mail.subject);
  });
```

---

## 许可证

MailParser 采用 **MIT 许可证** 或 **EUPL v1.1+**（欧盟公共许可证）双重许可。你可根据项目需要选择合适的许可证。
