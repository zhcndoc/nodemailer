---
title: 代理支持
sidebar_position: 25
description: 在 Nodemailer SMTP 传输中使用 HTTP、SOCKS 或自定义代理处理程序。
---

Nodemailer 可以通过**出站代理服务器**路由 [SMTP](./index.md) 连接。当您的应用程序运行在企业防火墙后面或者需要通过特定网络路径路由流量时，这非常有用。代理支持同时兼容单连接和[连接池](./pooled.md)。

Nodemailer 内置支持 **HTTP CONNECT** 代理。对于 **SOCKS4/4a/5** 代理或其他协议，有两个选择：

1. 安装 [`socks`](https://www.npmjs.com/package/socks) 包，Nodemailer 会自动使用它。
2. 编写自定义代理处理函数以满足特殊需求。

## 快速开始

使用代理时，在创建传输器时将 `proxy` 选项设置为 URL 字符串。Nodemailer 解析该 URL 并自动确定如何建立隧道。

```javascript
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.example.com",
  port: 465,
  secure: true,
  proxy: "http://proxy.example.test:3128", // HTTP 代理 URL
});
```

## HTTP CONNECT 代理

HTTP CONNECT 代理开箱即用，且**无需额外依赖**。Nodemailer 支持 `http://` 和 `https://` 代理 URL。如果代理需要认证，请在 URL 中包含凭据（例如 `http://user:pass@proxy.example.com:3128`）。

```javascript
const transporter = nodemailer.createTransport({
  host: "smtp.example.com",
  port: 465,
  secure: true,
  proxy: process.env.HTTP_PROXY, // 也可以使用 HTTPS_PROXY
});
```

## SOCKS 代理

为了保持包体轻量，Nodemailer **未内置** SOCKS 代理支持。要使用 SOCKS 代理，需要单独安装 `socks` 包并注册到传输器。

首先，安装该包：

```bash
npm install socks --save
```

然后配置传输器并注册 SOCKS 模块：

```javascript
const transporter = nodemailer.createTransport({
  host: "smtp.example.com",
  port: 465,
  secure: true,
  proxy: "socks5://127.0.0.1:1080",
});

// 注册 socks 模块，以便 Nodemailer 能使用它
transporter.set("proxy_socks_module", require("socks"));
```

### 支持的 URL 协议

根据代理类型使用以下 URL 方案之一：

| 协议       | 代理类型 | 描述                                             |
| ---------- | -------- | ------------------------------------------------ |
| `socks4:`  | SOCKS4   | 基础 SOCKS4 协议                                 |
| `socks4a:` | SOCKS4a  | 支持远程 DNS 解析的 SOCKS4                        |
| `socks5:`  | SOCKS5   | 支持认证和 IPv6 的 SOCKS5                         |
| `socks:`   | SOCKS5   | `socks5:` 的别名                                  |

### 使用 SSH 进行本地测试

您可以通过 SSH 动态端口转发快速创建 SOCKS5 代理。这会将所有流量通过 SSH 连接隧道传输至远程服务器。

运行以下命令启动代理：

```bash
ssh -N -D 0.0.0.0:1080 user@remote.host
```

`-N` 表示 SSH 不执行远程命令（只转发端口），`-D 0.0.0.0:1080` 创建一个监听 1080 端口的 SOCKS 代理。

然后配置 Nodemailer 使用此代理：

```javascript
proxy: "socks5://localhost:1080"
```

## 自定义代理处理程序

如果需要特殊认证、自定义协议或其他自定义代理逻辑，可以编写自己的处理函数，从而完全控制套接字连接的建立过程。

注册自定义处理程序时，使用 `transporter.set()`，键名格式为 `proxy_handler_<protocol>`，其中 `<protocol>` 对应 `proxy` 选项中 URL 的协议。

```javascript
const transporter = nodemailer.createTransport({
  host: "smtp.example.com",
  port: 465,
  secure: true,
  proxy: "myproxy://127.0.0.1:9999",
});

// 注册 "myproxy:" URL 协议的处理程序
transporter.set("proxy_handler_myproxy", (proxy, options, done) => {
  const net = require("net");

  console.log("正在连接代理 %s:%s", proxy.hostname, proxy.port);

  const socket = net.connect(proxy.port, proxy.hostname, () => {
    // 在这里执行任何自定义的代理握手...

    // 将建立的套接字返回给 Nodemailer
    done(null, { connection: socket });
  });
});
```

处理函数接收三个参数：
- `proxy` - 解析后的 URL 对象，包含代理地址详情
- `options` - 连接选项，包括目标的 `host` 和 `port`
- `done` - 连接准备好时调用的回调，格式为 `(error, result)`

### 预加密连接

如果您的代理连接**已加密**（例如，使用了 `tls.connect()` 而非 `net.connect()`），则必须在结果对象中设置 `secured: true`。这样 Nodemailer 知道连接已经是安全的，不会尝试执行 STARTTLS 升级。

```javascript
const tls = require("tls");

transporter.set("proxy_handler_myproxys", (proxy, options, done) => {
  const socket = tls.connect(proxy.port, proxy.hostname, () => {
    // secured 标记表明连接已经是 TLS 加密
    done(null, { connection: socket, secured: true });
  });
});
```
