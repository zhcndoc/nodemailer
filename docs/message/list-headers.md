---
title: 列表头部
sidebar_position: 16
description: 为邮件列表功能添加 RFC 2369 的 List-* 头部，例如退订链接。
---

邮件列表使用特殊的 [RFC 2369](https://www.rfc-editor.org/rfc/rfc2369) **`List-*` 头部**（如 `List-Help`、`List-Unsubscribe` 等）来帮助邮件客户端显示“退订”按钮等有用操作。你可以使用 Nodemailer 的 **`list`** 选项以简单声明式的方式定义这些头部，而不必手动通过 [自定义头部](./custom-headers) 选项构造它们。

## 工作原理

在 `transporter.sendMail()` 调用中添加一个 `list` 对象。该对象中的每个属性名对应一个 `List-*` 头部。属性名不区分大小写，例如 `help` 会生成 `List-Help` 头部，`unsubscribe` 会生成 `List-Unsubscribe`，等等。

### 值的格式

| 值类型                            | 结果                                                                                                     |
| --------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `string`                          | 单个 URL。Nodemailer 会自动用尖括号（`<...>`）包裹，并在必要时加上 `mailto:` 前缀。                     |
| `{ url, comment }`                | 带有可选人类可读注释的 URL，注释会显示在 URL 后面。                                                    |
| `Array< string \| { url, comment } >` | 针对同一种 `List-*` 类型生成多条独立的头部行。                                                        |
| 嵌套数组 (`Array<Array<...>>`)  | 多个 URL 合并在同一条头部行内，用逗号分隔。                                                          |

:::tip URL 处理
Nodemailer 会自动格式化 URL：
- 像 `admin@example.com` 这样的邮箱地址会变成 `<mailto:admin@example.com>`
- 以 `http`、`https`、`mailto` 或 `ftp` 开头的 URL 会按原样用尖括号包裹
- 其他字符串按域名处理，前缀加 `http://`

含有非 ASCII 字符的注释会自动编码以保证邮箱兼容性。
:::

## 完整示例

```javascript
const nodemailer = require("nodemailer");

// 1. 创建传输器（请替换为你的配置）
const transporter = nodemailer.createTransport({
  host: "smtp.example.com",
  port: 587,
  auth: {
    user: "username",
    pass: "password",
  },
});

// 2. 发送包含各种 List-* 头部的邮件
async function sendListMessage() {
  await transporter.sendMail({
    from: "sender@example.com",
    to: "recipient@example.com",
    subject: "List Message",
    text: "我希望没人会退订这个列表！",
    list: {
      // List-Help: <mailto:admin@example.com?subject=help>
      help: "admin@example.com?subject=help",

      // List-Unsubscribe: <http://example.com> (Comment)
      unsubscribe: {
        url: "http://example.com",
        comment: "Comment",
      },

      // 两条独立的 List-Subscribe 头部行：
      // List-Subscribe: <mailto:admin@example.com?subject=subscribe>
      // List-Subscribe: <http://example.com> (Subscribe)
      subscribe: [
        "admin@example.com?subject=subscribe",
        {
          url: "http://example.com",
          comment: "Subscribe",
        },
      ],

      // 单条 List-Post 头部行内多个 URL：
      // List-Post: <http://example.com/post>, <mailto:admin@example.com?subject=post> (Post)
      post: [
        [
          "http://example.com/post",
          {
            url: "admin@example.com?subject=post",
            comment: "Post",
          },
        ],
      ],
    },
  });

  console.log("列表邮件已发送");
}

sendListMessage().catch(console.error);
```

### 生成的头部

上述示例生成的邮件头部如下：

```txt
List-Help: <mailto:admin@example.com?subject=help>
List-Unsubscribe: <http://example.com> (Comment)
List-Subscribe: <mailto:admin@example.com?subject=subscribe>
List-Subscribe: <http://example.com> (Subscribe)
List-Post: <http://example.com/post>, <mailto:admin@example.com?subject=post> (Post)
```
