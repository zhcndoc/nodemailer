---
title: 知名服务
sidebar_position: 23
description: 针对 60 多个流行 SMTP 提供商（如 Gmail、SendGrid 和 AWS SES）的连接预设。
---

Nodemailer 内置了许多流行邮箱提供商的连接预设。您无需手动查找每个提供商的 SMTP 服务器主机名、端口号和安全设置，只需在创建传输时指定 **`service`** 名称即可。Nodemailer 会自动为您配置所有连接细节。

```js
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "Gmail", // 使用下面表格中任意服务 ID（大小写不敏感）
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});
```

`service` 选项只是一个方便的快捷方式。如果您愿意，也可以手动指定 `host`、`port`、`secure` 及其他连接选项。如果您的提供商未列出或者连接设置有变，您有两种选择：提交一个拉取请求更新 [services.json](https://github.com/nodemailer/nodemailer/blob/master/lib/well-known/services.json) 文件，或完全绕过预设，自己配置连接细节。

:::info
目前大多数主流邮箱提供商都需要使用 [OAuth 2.0 认证](./oauth2) 或特定应用密码以保障安全。服务预设仅配置服务器连接设置。您仍需负责为您的提供商设置正确的认证方式。关于 Gmail 特定设置说明，见 [使用 Gmail](/usage/using-gmail)。
:::

:::tip AWS SES 用户
尽管下方 SES 服务预设使用 SMTP 凭证，Nodemailer 还提供了一个专门的 [SES 传输](/transports/ses)，可直接集成 AWS SDK。如果您的应用已使用 AWS 凭证，SES 传输配置通常更简单。
:::

## 内置服务列表

| 服务 ID            | 提供商                           | SMTP 主机                               | 端口 |
| ------------------ | -------------------------------- | --------------------------------------- | ---- |
| 1und1              | 1&1 IONOS                        | smtp.1und1.de                           | 465  |
| 126                | 126 邮箱                        | smtp.126.com                            | 465  |
| 163                | 163 邮箱                        | smtp.163.com                            | 465  |
| Aliyun             | 阿里云 (Aliyun)                  | smtp.aliyun.com                         | 465  |
| AliyunQiye         | 阿里云企业版                    | smtp.qiye.aliyun.com                    | 465  |
| AOL                | AOL 邮箱                       | smtp.aol.com                            | 587  |
| Aruba              | 意大利 Aruba PEC                | smtps.aruba.it                          | 465  |
| Bluewin            | Swisscom Bluewin               | smtpauths.bluewin.ch                    | 465  |
| BOL                | 巴西 BOL 邮箱                  | smtp.bol.com.br                         | 587  |
| DebugMail          | DebugMail.io                   | debugmail.io                            | 25   |
| Disroot            | Disroot（注重隐私）             | disroot.org                             | 587  |
| DynectEmail        | Oracle Dynect 邮箱             | smtp.dynect.net                         | 25   |
| ElasticEmail       | Elastic Email                  | smtp.elasticemail.com                   | 465  |
| Ethereal           | Ethereal 邮箱（测试用）         | smtp.ethereal.email                     | 587  |
| FastMail           | FastMail                      | smtp.fastmail.com                       | 465  |
| Feishu Mail        | 飞书邮箱                       | smtp.feishu.cn                          | 465  |
| Forward Email      | Forward Email                 | smtp.forwardemail.net                   | 465  |
| GandiMail          | Gandi 邮箱                    | mail.gandi.net                          | 587  |
| Gmail              | Gmail / Google Workspace       | smtp.gmail.com                          | 465  |
| GmailWorkspace     | Gmail Workspace (SMTP 中继)    | smtp-relay.gmail.com                    | 465  |
| GMX                | GMX 邮箱                      | mail.gmx.com                            | 587  |
| Godaddy            | GoDaddy（美国）               | smtpout.secureserver.net                | 25   |
| GodaddyAsia        | GoDaddy（亚洲）               | smtp.asia.secureserver.net              | 25   |
| GodaddyEurope      | GoDaddy（欧洲）               | smtp.europe.secureserver.net            | 25   |
| hot.ee             | Hot.ee                        | mail.hot.ee                             | 25   |
| Hotmail            | 微软 Outlook / Hotmail         | smtp-mail.outlook.com                   | 587  |
| iCloud             | 苹果 iCloud 邮箱               | smtp.mail.me.com                        | 587  |
| Infomaniak         | Infomaniak 邮箱               | mail.infomaniak.com                     | 587  |
| KolabNow           | KolabNow（安全邮箱）           | smtp.kolabnow.com                       | 465  |
| Loopia             | Loopia                       | mailcluster.loopia.se                   | 465  |
| Loops              | Loops                        | smtp.loops.so                           | 587  |
| mail.ee            | Mail.ee                      | smtp.mail.ee                            | 25   |
| Mail.ru            | Mail.ru                      | smtp.mail.ru                            | 465  |
| Mailcatch.app      | Mailcatch.app（沙箱环境）       | sandbox-smtp.mailcatch.app              | 2525 |
| Maildev            | Maildev（本地）                | localhost                               | 1025 |
| MailerSend         | MailerSend                   | smtp.mailersend.net                     | 587  |
| Mailgun            | Mailgun                      | smtp.mailgun.org                        | 465  |
| Mailjet            | Mailjet                      | in.mailjet.com                          | 587  |
| Mailosaur          | Mailosaur                    | mailosaur.io                            | 25   |
| Mailtrap           | Mailtrap                     | live.smtp.mailtrap.io                   | 587  |
| Mandrill           | Mandrill                     | smtp.mandrillapp.com                    | 587  |
| Naver              | Naver                        | smtp.naver.com                          | 587  |
| OhMySMTP           | OhMySMTP                     | smtp.ohmysmtp.com                       | 587  |
| One                | one.com                      | send.one.com                            | 465  |
| OpenMailBox        | OpenMailBox                  | smtp.openmailbox.org                    | 465  |
| Outlook365         | Microsoft 365 / Outlook 365   | smtp.office365.com                      | 587  |
| Postmark           | Postmark                     | smtp.postmarkapp.com                    | 2525 |
| Proton             | Proton Mail                  | smtp.protonmail.ch                      | 587  |
| qiye.aliyun        | 阿里云企业版 (mxhichina)       | smtp.mxhichina.com                      | 465  |
| QQ                 | QQ 邮箱                     | smtp.qq.com                             | 465  |
| QQex               | QQ 企业邮箱                 | smtp.exmail.qq.com                      | 465  |
| Resend             | Resend                      | smtp.resend.com                         | 465  |
| Runbox             | Runbox（挪威）               | smtp.runbox.com                         | 465  |
| SendCloud          | SendCloud                   | smtp.sendcloud.net                      | 2525 |
| SendGrid           | SendGrid                    | smtp.sendgrid.net                       | 587  |
| SendinBlue         | Brevo（前 Sendinblue）         | smtp-relay.brevo.com                    | 587  |
| SendPulse          | SendPulse                   | smtp-pulse.com                          | 465  |
| SES                | AWS SES（通用）               | email-smtp.us-east-1.amazonaws.com      | 465  |
| SES-US-EAST-1      | AWS SES 美国东部（弗吉尼亚）     | email-smtp.us-east-1.amazonaws.com      | 465  |
| SES-US-EAST-2      | AWS SES 美国东部（俄亥俄）       | email-smtp.us-east-2.amazonaws.com      | 465  |
| SES-US-WEST-1      | AWS SES 美国西部（北加州）       | email-smtp.us-west-1.amazonaws.com      | 465  |
| SES-US-WEST-2      | AWS SES 美国西部（俄勒冈）       | email-smtp.us-west-2.amazonaws.com      | 465  |
| SES-EU-WEST-1      | AWS SES 欧洲西部（爱尔兰）       | email-smtp.eu-west-1.amazonaws.com      | 465  |
| SES-EU-WEST-2      | AWS SES 欧洲西部（伦敦）         | email-smtp.eu-west-2.amazonaws.com      | 465  |
| SES-EU-WEST-3      | AWS SES 欧洲西部（巴黎）         | email-smtp.eu-west-3.amazonaws.com      | 465  |
| SES-EU-CENTRAL-1   | AWS SES 欧洲中部（法兰克福）     | email-smtp.eu-central-1.amazonaws.com   | 465  |
| SES-EU-NORTH-1     | AWS SES 欧洲北部（斯德哥尔摩）   | email-smtp.eu-north-1.amazonaws.com     | 465  |
| SES-AP-SOUTH-1     | AWS SES 亚太区（孟买）          | email-smtp.ap-south-1.amazonaws.com     | 465  |
| SES-AP-NORTHEAST-1 | AWS SES 亚太区（东京）          | email-smtp.ap-northeast-1.amazonaws.com | 465  |
| SES-AP-NORTHEAST-2 | AWS SES 亚太区（首尔）          | email-smtp.ap-northeast-2.amazonaws.com | 465  |
| SES-AP-NORTHEAST-3 | AWS SES 亚太区（大阪）          | email-smtp.ap-northeast-3.amazonaws.com | 465  |
| SES-AP-SOUTHEAST-1 | AWS SES 亚太区（新加坡）        | email-smtp.ap-southeast-1.amazonaws.com | 465  |
| SES-AP-SOUTHEAST-2 | AWS SES 亚太区（悉尼）          | email-smtp.ap-southeast-2.amazonaws.com | 465  |
| SES-CA-CENTRAL-1   | AWS SES 加拿大（中部）           | email-smtp.ca-central-1.amazonaws.com   | 465  |
| SES-SA-EAST-1      | AWS SES 南美（圣保罗）           | email-smtp.sa-east-1.amazonaws.com      | 465  |
| SES-US-GOV-EAST-1  | AWS SES 政府云（美国东部）       | email-smtp.us-gov-east-1.amazonaws.com  | 465  |
| SES-US-GOV-WEST-1  | AWS SES 政府云（美国西部）       | email-smtp.us-gov-west-1.amazonaws.com  | 465  |
| Seznam             | Seznam.cz 邮箱                 | smtp.seznam.cz                          | 465  |
| SMTP2GO            | SMTP2GO                      | mail.smtp2go.com                        | 2525 |
| Sparkpost          | SparkPost                    | smtp.sparkpostmail.com                  | 587  |
| Tipimail           | Tipimail                     | smtp.tipimail.com                       | 587  |
| Tutanota           | Tutanota                     | smtp.tutanota.com                       | 465  |
| Yahoo              | Yahoo 邮箱                   | smtp.mail.yahoo.com                     | 465  |
| Yandex             | Yandex 邮箱                  | smtp.yandex.ru                          | 465  |
| Zimbra             | Zimbra 邮件服务器              | smtp.zimbra.com                         | 587  |
| Zoho               | Zoho 邮箱                    | smtp.zoho.com                           | 465  |
