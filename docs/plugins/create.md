---
title: 创建插件
sidebar_position: 30
description: 编写自定义插件以进行消息预处理、流转换或传输处理。
---

Nodemailer 在邮件发送流程中提供了三个扩展点，你可以在这些点附加[插件](./index.md)来定制行为：

1. **`compile`** - 在调用 `sendMail()` 后立即运行，之前 Nodemailer 会构建 MIME 树。此阶段可用来修改 `mail.data`（例如转换 HTML 内容、添加自定义头部，或设置默认值）。
2. **`stream`** - 在 MIME 树完全构建后但在消息字节流传输之前运行。此阶段可直接修改 `mail.message` 对象，或插入转换流来处理原始消息数据。
3. **传输（Transport）** - 最终阶段，原始消息流被发送到目的地。自定义[传输](/transports/)通过实现此阶段决定消息的实际发送方式。

---

## 附加 `compile` 和 `stream` 插件

要注册插件，调用传输器的 `use()` 方法：

```javascript
transporter.use(step, pluginFn);
```

| 参数         | 类型                    | 说明                                                              |
| ------------ | ----------------------- | ----------------------------------------------------------------- |
| `transporter` | `Object`                | 使用 `nodemailer.createTransport()` 创建的传输器实例             |
| `step`       | `String`                | 管道阶段： `'compile'` 或 `'stream'`                             |
| `pluginFn`   | `Function(mail, done)`  | 你的插件函数（见下文插件 API 部分）                              |

同一阶段可以注册多个插件，它们会按照添加顺序依次执行。

---

## 插件 API

所有插件函数，包括自定义传输的 `send` 方法，都接收两个参数：

1. **`mail`** - 一个包含当前处理消息信息的对象（详见下表）。
2. **`done`** - 回调函数，签名为 `function(err)`。插件完成时**必须**调用它。传入 `Error` 对象可中止发送操作，不传参数则继续后续处理。

### `mail` 对象

| 属性              | 可用阶段                       | 说明                                                                                                                        |
| ----------------- | ------------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| `data`            | `compile`，`stream`，**传输**  | 原始的传递给 `sendMail()` 的选项对象                                                                                         |
| `message`         | `stream`，**传输**             | 一个 [`MimeNode`](https://github.com/nodemailer/nodemailer/blob/master/lib/mime-node/index.js) 实例，代表已构建的消息（参见[MailComposer](/extras/mailcomposer/)） |
| `resolveContent`  | `compile`，`stream`，**传输**  | 辅助方法，将 Nodemailer 内容对象（流、文件路径、URL 等）转换为 `String` 或 `Buffer`                                         |

### `mail.resolveContent(obj, key, callback)`

使用此方法将任意 [Nodemailer 内容类型](https://nodemailer.com/message/attachments/#possible-content-types)（文件路径、URL、流、Buffer 等）转换为纯 `String` 或 `Buffer`。当你需要读取和处理来自多种来源的内容时非常有用。

```javascript
mail.resolveContent(sourceObject, propertyName, (err, value) => {
  if (err) return done(err);
  // value 根据输入类型是 String 或 Buffer
});
```

#### 示例：记录最终的 HTML 字符串

```javascript
function plugin(mail, done) {
  mail.resolveContent(mail.data, "html", (err, html) => {
    if (err) return done(err);
    console.log("HTML 内容: %s", html.toString());
    done();
  });
}
```

---

## `compile` 插件

在 `compile` 阶段，仅 `mail.data` 可用。`mail.message` 属性尚不存在，因为 MIME 树尚未构建。你可以自由修改 `mail.data`，完成后调用 `done()`。传入错误 `done(err)` 将中止 `sendMail()` 操作。

#### 示例：若缺少纯文本则从 HTML 生成

```javascript
transporter.use("compile", (mail, done) => {
  if (!mail.data.text && mail.data.html) {
    mail.data.text = mail.data.html.replace(/<[^>]*>/g, " ");
  }
  done();
});
```

---

## `stream` 插件

`stream` 插件在 MIME 树完全构建后但在任何字节发送给传输之前执行。此阶段你可以：

- 直接修改 `mail.message`（比如添加或修改头部）
- 使用 `mail.message.transform()` 将输出通过附加的转换流

:::note
此阶段修改 `mail.data` 通常**无效**，因为 MIME 树已用它构建完成。如自定义传输显式读取 `mail.data` 属性除外。
:::

### 示例：将发送流中所有制表符替换为空格

```javascript
const { Transform } = require("stream");

const tabToSpace = new Transform();

tabToSpace._transform = function (chunk, _enc, cb) {
  for (let i = 0; i < chunk.length; ++i) {
    if (chunk[i] === 0x09) chunk[i] = 0x20; // 0x09 = 制表符 TAB，0x20 = 空格
  }
  this.push(chunk);
  cb();
};

transporter.use("stream", (mail, done) => {
  mail.message.transform(tabToSpace);
  done();
});
```

### 示例：记录所有地址字段

```javascript
transporter.use("stream", (mail, done) => {
  const a = mail.message.getAddresses();
  console.log("From :", JSON.stringify(a.from));
  console.log("To   :", JSON.stringify(a.to));
  console.log("Cc   :", JSON.stringify(a.cc));
  console.log("Bcc  :", JSON.stringify(a.bcc));
  done();
});
```

---

### `mail.message.transform(transformStream)`

添加一个 [`stream.Transform`](https://nodejs.org/api/stream.html#class-streamtransform) 流，经过它后原始消息才会传递给传输器。你也可以传入返回 Transform 流的函数。

### `mail.message.getAddresses()`

返回一个对象，包含解析后的 **From**、**Sender**、**Reply-To**、**To**、**Cc** 和 **Bcc** 头部邮件地址。每个属性是一个包含 `{ name, address }` 对象的**数组**。若消息中无该头部，则属性会被省略。

---

## 编写自定义传输 {#transports}

传输是定义消息实际发送方式的对象。内置选项请参阅 [SMTP 传输](/smtp/) 和 [其他传输](/transports/)。要创建自定义传输，实现一个包含三个属性的对象：**`name`**、**`version`** 和一个 **`send(mail, done)`** 方法。将此对象传入 `nodemailer.createTransport()` 创建一个工作传输器。

```javascript
const nodemailer = require("nodemailer");

const transport = {
  name: require("./package.json").name, // 例如 "SMTP"
  version: require("./package.json").version, // 例如 "1.0.0"

  /**
   * 发送消息。
   * @param {Object} mail - 与插件接收的 `mail` 对象相同
   * @param {Function} done - 回调，签名为 `(err, info)`
   */
  send(mail, done) {
    const input = mail.message.createReadStream();
    const envelope = mail.message.getEnvelope();
    const messageId = mail.message.messageId();

    // 示例：将消息流写到标准输出
    input.pipe(process.stdout);
    input.on("end", () => {
      done(null, {
        envelope,
        messageId,
      });
    });
  },

  /**
   * 可选：关闭传输器时清理资源。
   * 用于关闭长连接（例如 SMTP 连接池）。
   */
  close() {
    // 释放资源
  },

  /**
   * 可选：报告传输器是否空闲。
   * 用于连接池。当传输器有能力立即发送更多消息时返回 `true`。
   */
  isIdle() {
    return true;
  },
};

const transporter = nodemailer.createTransport(transport);

transporter.sendMail(
  {
    from: "sender@example.com",
    to: "receiver@example.com",
    subject: "你好",
    text: "你好，世界！",
  },
  console.log
);
```

---

## 总结

1. 选择最适合你需求的阶段（`compile`，`stream` 或自定义 **传输**）。
2. 编写接受 **`(mail, done)`** 参数的插件函数，并用 `transporter.use()` 注册，或者为自定义传输实现 `transport.send()`。
3. 插件执行完毕后**必须**调用 `done()`，传入 `Error` 则中止发送操作。
