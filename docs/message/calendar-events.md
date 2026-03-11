---
title: 日历事件
sidebar_position: 14
description: 在邮件中嵌入 iCalendar 文件，实现带有接受/拒绝控件的日历集成。
---

Nodemailer 可以直接在邮件中嵌入 iCalendar（`.ics`）文件。当收件人在支持日历的邮件客户端（如 Gmail、Outlook 或 Apple Mail）中打开邮件时，他们将看到诸如 **添加到日历** 或 **接受 / 拒绝** 按钮等交互控件。

:::info
Nodemailer 负责将日历文件附加到您的邮件中，但**不**负责生成 iCalendar 内容本身。您需要使用类似 **[ical-generator](https://www.npmjs.com/package/ical-generator)** 或 **[ics](https://www.npmjs.com/package/ics)** 的库创建有效的 `.ics` 数据，然后将该输出传递给 Nodemailer。
:::

## `icalEvent` 消息选项

要附加日历事件，请在调用 `transporter.sendMail()` 时向消息中添加一个 `icalEvent` 对象：

```javascript
let message = {
  /* ...from, to, subject, etc. */
  icalEvent: {
    /* options */
  },
};
```

| 属性       | 类型                         | 默认值          | 描述                                                                                                                                                |
| ---------- | ---------------------------- | -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `method`   | `string`                     | `'PUBLISH'`    | iCalendar 的 [**METHOD**](https://www.rfc-editor.org/rfc/rfc5546#section-1.4) 属性。此属性不区分大小写。常见值有 `'REQUEST'`（会议邀请），`'REPLY'`（回复），和 `'CANCEL'`（取消）。 |
| `filename` | `string`                     | `'invite.ics'` | 在邮件客户端显示的附加日历文件名。                                                                                                                 |
| `content`  | `string \| Buffer \| Stream` | -              | 作为字符串、Buffer 或可读流的原始 iCalendar 数据。                                                                                                |
| `path`     | `string`                     | -              | 本地磁盘上 `.ics` 文件的绝对或相对路径。                                                                                                            |
| `href`     | `string`                     | -              | Nodemailer 将从中获取日历数据的 URL（HTTP 或 HTTPS）。                                                                                            |
| `encoding` | `string`                     | -              | `content` 字符串的编码（如适用），例如 `'base64'` 或 `'hex'`。                                                                                      |

您必须且只能提供 `content`、`path` 或 `href` 其中之一来指定日历数据源。

:::note 最佳实践
日历邀请对邮件结构比较敏感。添加额外的文件[附件](./attachments)或复杂的替代消息体经常会导致邮件客户端错误显示日历内容甚至完全不显示。为了在不同邮件客户端间获得最佳兼容性，请保持消息简单：只包含 **text**、**html** 以及单个 **icalEvent**。避免在日历邀请邮件中添加其他附件。
:::

## 示例

### 1. 从字符串发送会议邀请（REQUEST）

当您希望收件人接受或拒绝邀请时，使用 `method: 'REQUEST'`：

```javascript
const appointment = `BEGIN:VCALENDAR\r
PRODID:-//ACME/DesktopCalendar//EN\r
VERSION:2.0\r
METHOD:REQUEST\r
BEGIN:VEVENT\r
DTSTART:20240115T100000Z\r
DTEND:20240115T110000Z\r
SUMMARY:团队会议\r
UID:unique-event-id@example.com\r
END:VEVENT\r
END:VCALENDAR`;

let message = {
  from: "sender@example.com",
  to: "recipient@example.com",
  subject: "会议邀请",
  text: "请查看附带的会议邀请",
  icalEvent: {
    filename: "invitation.ics",
    method: "REQUEST",
    content: appointment,
  },
};
```

### 2. 从文件发送日历事件（PUBLISH）

当您只想共享事件且不需要回复时，使用 `method: 'PUBLISH'`：

```javascript
let message = {
  from: "sender@example.com",
  to: "recipient@example.com",
  subject: "日程安排",
  text: "请查看附带的日程",
  icalEvent: {
    method: "PUBLISH",
    path: "/absolute/path/to/invite.ics",
  },
};
```

### 3. 从 URL 发送取消通知（CANCEL）

当您希望通知收件人之前安排的活动被取消时，使用 `method: 'CANCEL'`：

```javascript
let message = {
  from: "sender@example.com",
  to: "recipient@example.com",
  subject: "会议取消通知",
  text: "该会议已取消。详见附带的日历更新。",
  icalEvent: {
    method: "CANCEL",
    href: "https://www.example.com/events/123/cancel.ics",
  },
};
```

---

完整的工作示例请将上述 `message` 对象与 [`nodemailer.createTransport()`](../usage/index.md#quick-example) 结合使用，然后调用 `transporter.sendMail()`。
