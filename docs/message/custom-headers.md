---
title: 自定义头部
sidebar_position: 17
description: 在邮件级别或单个附件级别添加或覆盖邮件头。
---

Nodemailer 会自动生成所有必需的邮件头，因此通常不需要手动设置它们。但当你需要添加自定义头部或覆盖默认值时，可以使用 **`headers`** 属性。该属性既可以作用于邮件级别，也可以作用于单个[附件](./attachments)或替代内容。

- **`headers`** - 一个对象，其中的每个键值对都会变成一条邮件头。

  - 键会自动转换为标准的大写形式（例如 `x-my-key` 会变成 `X-My-Key`）。
  - 值会自动使用 MIME 字符编码对非 ASCII 字符编码，且长行会被折行以符合 78 字符的行长限制。你可以通过使用 `prepared` 选项禁用这个自动处理。

:::warning
不要通过 `headers` 属性设置受保护的邮件头，如 `From`、`Sender`、`To`、`Cc`、`Bcc`、`Reply-To`、`In-Reply-To`、`References`、`Subject`、`Message-ID` 或 `Date`。Nodemailer 会内部管理这些头部，并将覆盖你设置的任何值。请改用专门的[邮件属性](./)（例如 `from`、`to`、`subject`）来设置这些值。
:::

---

## 示例

### 1. 添加简单的自定义头部

传入一个对象，以自定义的头部名称作为键，头部值作为字符串。Nodemailer 会正确格式化头部名称并将其包含在发送的邮件中。

```javascript
const message = {
  // 其他字段...
  headers: {
    "x-my-key": "header value",
    "x-another-key": "another value",
  },
};

/*
结果会在邮件中添加如下头部：
X-My-Key: header value
X-Another-Key: another value
*/
```

### 2. 重复相同的头部键

某些头部可以在邮件中出现多次（如 `Received` 或自定义跟踪头）。要添加多个同名头部，可以提供一个值数组，而不是单个字符串。

```javascript
const message = {
  // 其他字段...
  headers: {
    "x-my-key": ["value for row 1", "value for row 2", "value for row 3"],
  },
};

/*
结果会生成三个同名头部：
X-My-Key: value for row 1
X-My-Key: value for row 2
X-My-Key: value for row 3
*/
```

### 3. 跳过 Nodemailer 的编码和折行处理

默认情况下，Nodemailer 会对非 ASCII 字符进行编码，并对长行折行以符合邮件标准。如果你已经自行编码头部值，或者需要精确使用原始值，可以设置 `prepared: true`，阻止任何处理行为。

```javascript
const message = {
  // 其他字段...
  headers: {
    "x-processed": "a really long header or value with non-ascii characters",
    "x-unprocessed": {
      prepared: true,
      value: "a really long header or value with non-ascii characters",
    },
  },
};

/*
X-Processed: 如果需要，头部值会自动编码和折行
X-Unprocessed: 头部值将被原样使用，不会被修改
*/
```

### 4. 在附件上添加头部

你也可以为单个[附件](./attachments)添加自定义头部。这对于向邮件中的特定文件添加元数据或跟踪信息非常有用。只需在附件定义中包含 `headers` 对象即可。

```javascript
const message = {
  // 其他字段...
  attachments: [
    {
      filename: "report.csv",
      content: csvBuffer,
      headers: {
        "x-report-id": "2025-Q1",
      },
    },
  ],
};
```
