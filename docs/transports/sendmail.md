---
title: Sendmail 传输
sidebar_position: 27
description: 将生成的 RFC 822 消息通过管道传递给本地 sendmail 或兼容二进制文件。
---

**Sendmail 传输**通过将生成的 RFC 822 邮件消息传递给本地的 **sendmail** 命令（或类似的邮件传输代理，如 Postfix 或 Exim）来发送邮件。消息会直接通过管道传入该程序的标准输入。这与 PHP 的 `mail()` 函数所使用的机制相同。

## 用法

```javascript
// CommonJS
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  sendmail: true, // 启用 Sendmail 传输
});
```

设置 `sendmail: true` 即激活 Sendmail 传输。Nodemailer 默认会在系统的 `PATH` 中查找 `sendmail` 可执行文件。如果你的 sendmail 二进制文件位于其它位置，可以使用下面介绍的 `path` 选项指定完整路径。

### 传输选项

| 选项       | 类型                    | 默认值        | 说明                                                                                                                                                                                                                  |
| ---------- | ----------------------- | ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `path`     | `String`                | `'sendmail'`  | **sendmail** 二进制文件的路径。可以是绝对路径（例如 `/usr/sbin/sendmail`），或者如果该可执行文件在你的 `PATH` 中，则仅需写文件名。                                                                                        |
| `newline`  | `'unix'` / `'windows'`  | `'unix'`      | 生成消息的换行风格。`'unix'` 表示使用 `\n`（换行符，LF），`'windows'` 表示使用 `\r\n`（回车换行符，CRLF）。大多数系统使用默认的 `'unix'` 即可正常工作。                                                                  |
| `args`     | `String[]`              | _无_          | 用于 sendmail 二进制文件的自定义命令行参数。当你提供此数组时，它会替代 Nodemailer 默认的参数，**除了** `-i`（始终包含）和收件人地址（始终追加）。常见用法请参考下方示例。                                                   |

如果没有提供自定义的 `args` 数组，Nodemailer 会执行如下命令：

```sh
sendmail -i -f <from> <to...>
```

当提供自定义的 `args` 数组时，命令将变为：

```sh
sendmail -i <args...> <to...>
```

请注意，`-i` 参数（防止单独一行中只出现一个点时被识别为邮件结束）以及收件人列表总是会自动包含。

### 返回结果

发送成功后，`transporter.sendMail()` 会返回一个 `info` 对象，包含以下属性：

- `envelope` - 一个对象，含有 `from`（字符串）和 `to`（字符串数组）属性，表示邮件的[信封信息](../smtp/envelope)
- `messageId` - 发送的邮件所生成的 Message-ID 头部值
- `response` - 字符串 `'Messages queued for delivery'`

请注意，sendmail 命令本身不产生输出，因此 `response` 是来自 Nodemailer 的固定确认信息。

### 故障排查

如果 Nodemailer 找不到 sendmail 二进制文件，则会返回退出码 127 的错误。解决方法：

1. 确认系统中已安装 sendmail（或兼容的 MTA，如 Postfix）
2. 检查二进制文件是否在你的 `PATH` 中，或者通过 `path` 选项指定完整路径
3. 常见位置包括 `/usr/sbin/sendmail` 和 `/usr/lib/sendmail`

安装说明请参考你的操作系统文档或 [Computer Hope sendmail 参考](https://www.computerhope.com/unix/usendmai.htm)。

### 示例

#### 指定自定义二进制路径

如果 sendmail 不在你的 `PATH` 中，或者想使用特定路径，可以使用 `path` 选项：

```javascript
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  sendmail: true,
  newline: "unix",
  path: "/usr/sbin/sendmail",
});

transporter.sendMail(
  {
    from: "sender@example.com",
    to: "recipient@example.com",
    subject: "测试邮件",
    text: "希望这条消息能够成功发送！",
  },
  (err, info) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log(info.envelope);
    console.log(info.messageId);
  }
);
```

#### 传递自定义命令行参数

使用 `args` 选项为 sendmail 二进制传递额外标志。例如，覆盖[信封](../smtp/envelope)发件人地址（通常用于设置自定义退信地址）：

```javascript
const transporter = nodemailer.createTransport({
  sendmail: true,
  args: ["-f", "bounce@example.com"],
});
```

使用 `args` 时请记住，你是替换了 Nodemailer 的默认参数。如果你需要 `-f` 标志指定信封发件人，必须显式包含它，如上所示。
