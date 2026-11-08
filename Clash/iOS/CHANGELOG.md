# iOS 更新日志

## 2026-11-08 — cy-clash-ios.yaml v1.5

- 基于远端最新 Shadowrocket cy.conf v5.26 同步静态规则顺序；补腾讯 ASN、完整 AI / Google 登录及 Claude 指定日志域名；删除地区分组、交易所专用清单与 weixin / wechat / qpic 关键词规则，PayPal 走 PROXY，交易所按通用规则分流。
- 新增 📧 邮件 / 🤖 AI 自动测速组：仅节点名含 NovixLink 的非信息节点，300 秒 / 5 秒超时 / tolerance 0。Gmail IMAP、SMTP、POP 走邮件组；Google 登录和海外 AI 走 AI 组；GitHub 主站、raw 仍走 PROXY。
- default-nameserver、proxy-server-nameserver、direct-nameserver 均为 system；Host、静态直连域名及国内 MRS 集合使用系统 DNS。四个海外 DoH 全部经 PROXY，没有系统 fallback；移除额外 DNS 监听。
- 改用 7 个 MetaCubeX MRS 域名集合（ai / private / icloud@cn / apple@cn / google@cn / geolocation-!cn / cn），减少 iOS 文本规则加载开销；分类对应小火箭，但与 Loyalsoldier 收录有差异。补 ASN 数据库 URL；Clash IP 规则保留 no-resolve。
- 代理目的地的 UDP 443 经子规则拒绝；先命中直连的连接不受此限制。每个子规则调用后加同条件 REJECT，避免所选节点不支持 UDP 时继续落到 DIRECT。保留 STUN/TURN 端口代理与拒绝后备。
- 三个组均增加 REJECT 空组兜底。首次须在 PROXY 手选节点；无 NovixLink 节点时邮件/AI 拒绝。多订阅增加来源前缀，移除强制覆盖所有节点 UDP 能力的设置。
- 说明迁移边界：不支持 STUN IP 伪装；WeatherKit 仅迁移路由，重写/MITM 需另导入模块。真实订阅仅在手机本地填写。
- 目标为截图中的 ProjectClash iOS 1.0.15 (171)；桌面内核校验不代替 iPhone 实机的连接、DNS 与 WebRTC 测试。

- 校验通过：严格 YAML（无重复键）、145 条源规则的顺序及策略、DNS 与分组引用、真实 MRS/GeoIP/ASN 文件、mihomo v1.19.13 配置检查；本地模拟运行验证了健康 NovixLink 自动选择、信息节点排除及无匹配节点时 REJECT。真实订阅与 iPhone 实机未测试。

## 2026-11-05

- 将本目录脚本和配置中的更新历史迁移到本文件；源文件仅保留当前说明与日志入口。
- 本次只整理注释和文档，原有功能版本、最后更新时间及执行逻辑保持不变。

以下条目直接取自原文件注释，按来源文件及原注释顺序保留；没有注明日期的条目不补写日期。

## `cy-clash-ios.yaml`

```text
最新改动 2026-11-04 v1.4：GEOIP,CN 与 Apple/ChinaMax/Global 规则集加 no-resolve；头部加最后更新时间。

2026-11-04 v1.3：VPS 的 SSH（22 端口）走 PROXY，其余仍直连。

2026-11-04 v1.2：大航海机场订阅 IP 直连。

2026-11-03：VPS IP 直连置顶、外网 DoH、规则集改 GitHub raw。历史版本见私有仓库 git 记录。

[2026-11-03] 外网域名 / IP 规则解析：Google、Cloudflare 加密 DoH，经 PROXY 发出（防 DNS 泄漏）
旧版这里是 system + 223.5.5.5 明文，会把外网域名查询暴露给本地网络

[2026-11-03] 机场节点域名：加密 DoH（阿里/腾讯，按 IP 写）；节点必须直连解析，不能走代理

[2026-11-03] 中国域名 → 系统 DNS

[2026-11-03] GitHub raw 国内直连常失败，改经 PROXY 下载

[2026-11-03] GitHub raw 国内直连常失败，改经 PROXY 下载

[2026-11-03] GitHub raw 国内直连常失败，改经 PROXY 下载

[2026-11-04] VPS SSH(22) 例外：国内直连被阻断，走 PROXY（须在 VPS 直连之前）

[2026-11-03] 自建 VPS IP 直连（必须第一条，no-resolve）

[2026-11-04] 大航海机场订阅面板 IP 直连（拒绝代理连接）

[2026-11-03] WebRTC/STUN 防泄漏：先走代理，节点不支持 UDP 则拒绝，不回落 DIRECT
```
