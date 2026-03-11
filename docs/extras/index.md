---
title: 额外模块
sidebar_position: 8
description: 用于接收、构建、解析和预览电子邮件的辅助库。
---

除了 Nodemailer 本身之外，还有几个辅助库扩展了你在 Node.js 中处理电子邮件的能力。这些工具帮助你接收来信，程序化地构建邮件，解析原始邮件内容，以及在开发过程中预览邮件。

## 官方辅助库

这些包由 Nodemailer 团队维护，设计上与 Nodemailer 无缝协作。

1. [smtp-server](/extras/smtp-server) - 构建你自己的 SMTP 服务器以接受传入的邮件连接。适用于创建自定义邮件服务器、测试邮件流程或构建邮件接收应用。
2. [smtp-connection](/extras/smtp-connection) - 一款底层的 SMTP 客户端，用于与邮件服务器建立连接。这是 Nodemailer 的 [SMTP 传输](/smtp/) 的基础组件，单独暴露用于高级用例，即需要直接控制 SMTP 协议时使用。
3. [mailparser](/extras/mailparser) - 将原始邮件消息（RFC 822 格式）解析为结构化的 JavaScript 对象。流式解析器高效处理大型邮件，提取头部、正文内容和附件，转换为易于使用的格式。
4. [mailcomposer](/extras/mailcomposer) - 从 JavaScript 对象生成符合 RFC 822 的邮件消息。当你需要创建格式正确的 [MIME 消息](/message/)，但不立即发送时，例如存储草稿或传递给其他系统，该工具非常有用。

## 相关项目

这些是独立的开源项目，补充 Nodemailer 的功能，根据你的使用场景可能会很有用。

5. [EmailEngine](https://emailengine.app/?utm_source=nodemailer&utm_campaign=nodemailer&utm_medium=module-link) - 一个自托管应用，提供针对任意 IMAP 邮箱的 REST API。它通过 SMTP 处理邮件发送，并通过 Webhook 推送实时更新，使得集成电子邮件功能更加容易。
6. [ImapFlow](https://imapflow.com/) - 一款基于 Promise 的现代 Node.js IMAP 客户端。最初为 EmailEngine 构建，作为独立库用于读取和管理任何 IMAP 服务器的邮件。
7. [mailauth](https://github.com/andris9/mailauth) - 一款完整的邮件认证库。它验证和生成 SPF、DKIM、DMARC、ARC 和 BIMI 记录，帮助你验证邮件真实性并提升送达率。
8. [email-templates](https://github.com/forwardemail/email-templates) - 一个完整的邮件模板管理框架。支持模板渲染、浏览器及 iOS 模拟器预览，并直接集成 Nodemailer 进行发送。
9. [preview-email](https://github.com/forwardemail/preview-email) - 一个开发工具，能自动在浏览器中打开邮件进行预览。它与 Nodemailer 配合使用，帮助你在发送给真实收件人前检查和调试邮件内容。

---

:::note
前四个包（smtp-server、smtp-connection、mailparser 和 mailcomposer）由 Nodemailer GitHub 组织维护，发布周期与 Nodemailer 保持一致。其余项目由更广泛的开源社区维护。
:::
