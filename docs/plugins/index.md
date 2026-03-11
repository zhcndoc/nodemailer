---
title: 插件
sidebar_position: 6
description: 在编译、流处理或传输阶段通过自定义逻辑扩展 Nodemailer。
---

Nodemailer 设计为**可扩展**的。你可以在邮件生命周期的三个明确定义的阶段注入自定义逻辑：

| 阶段                | 关键词       | 运行时机                                                                     | 典型用途                                                        |
| ------------------ | ----------- | ------------------------------------------------------------------------------ | --------------------------------------------------------------- |
| **预处理**         | `compile`   | 在创建邮件对象之后，但在生成 MIME 源之前                                         | 模板渲染，自动生成纯文本版本，地址验证                           |
| **处理**           | `stream`    | 编译 MIME 之后，准备发送邮件数据流时                                           | 内联图片，转换 HTML 内容                                        |
| **发送**           | `transport` | 邮件准备发送时                                                               | [SMTP](/smtp/)、[SES](/transports/ses)、SparkPost、自定义 HTTP API |

:::tip
当你希望插件适用于任何传输方式时，使用 _compile_ 和 _stream_ 插件。Transport 插件仅在你想定义完全自定义的发送机制时才需要使用。
:::

## 编写插件

插件是一个接收 mail 对象和回调函数的函数。下面是一个示例，当只提供了 HTML 内容时，自动生成纯文本版本的邮件：

```js
// CommonJS 模块格式
module.exports = function myCompilePlugin(mail, callback) {
  // mail 对象包含一个 `data` 属性，里边是你的邮件选项
  // 你可以读取并修改这些属性，在邮件编译前进行处理

  if (!mail.data.text && mail.data.html) {
    // 使用 html-to-text 包从 HTML 生成纯文本
    mail.data.text = require("html-to-text").htmlToText(mail.data.html);
  }

  // 完成后一定要调用回调
  // 成功时不传参数，出错时传入 Error 对象以终止发送
  callback();
};
```

要使用该插件，请通过 `use()` 方法注册到传输实例上：

```js
const nodemailer = require("nodemailer");
const transport = nodemailer.createTransport({ sendmail: true });

// 注册一个 compile 插件 — 它会在 MIME 生成之前运行
transport.use("compile", require("./myCompilePlugin"));
```

### 错误处理

如果插件遇到问题，应阻止邮件发送，请传入一个 `Error` 对象给回调：

```js
callback(new Error("模板未找到"));
```

传入错误后，邮件将**不会**发送。该错误会通过 `sendMail()` 的回调或被拒绝的 Promise 返回给调用者。

## 公共插件

以下是一些常用的社区维护插件，可供使用：

- **express-handlebars** - 使用 Express 应用的视图目录渲染 Handlebars 模板。  
  [https://github.com/yads/nodemailer-express-handlebars](https://github.com/yads/nodemailer-express-handlebars)
- **inline-base64** - 自动将 HTML 中内联的 base64 图片转换为正确的 CID 附件。  
  [https://github.com/mixmaxhq/nodemailer-plugin-inline-base64](https://github.com/mixmaxhq/nodemailer-plugin-inline-base64)
- **html-to-text** - 仅提供 HTML 内容时，自动生成纯文本版本的邮件。  
  [https://github.com/andris9/nodemailer-html-to-text](https://github.com/andris9/nodemailer-html-to-text)

还想找其他插件？试试 [在 npm 搜索 "nodemailer plugin"](https://www.npmjs.com/search?q=keywords:nodemailer%20plugin)。

---

需要更多控制？参见 **[创建插件](/plugins/create)**，了解插件 API 的详细指南。
