# APP 更新日志

## 2026-11-05

- 将本目录脚本和配置中的更新历史迁移到本文件；源文件仅保留当前说明与日志入口。
- 本次只整理注释和文档，原有功能版本、最后更新时间及执行逻辑保持不变。

以下条目直接取自原文件注释，按来源文件及原注释顺序保留；没有注明日期的条目不补写日期。

## `cy-rules.js`

```text
最新改动 2026-11-04 v2.14：Foxmail 进程规则改为 AND,((PROCESS-NAME,Foxmail.exe),(NOT,((GEOIP,CN,no-resolve)))) ：只有目标非中国 IP 才走「📧 Foxmail」，中国 IP 落到后面的 GEOIP,CN 直连。（iPhone 无 Foxmail 进程，主要影响 Clash Verge Rev 桌面端）历史版本见私有仓库 git 记录。

2026-11-04：大航海机场订阅 IP 直连（面板拒绝代理连接），紧随 VPS 规则。

2026-11-04：VPS 的 SSH（22 端口）走节点选择（国内直连被阻断），VPS 其余流量仍直连。

2026-11-04：统一 no-resolve（GEOIP,CN 及含 IP 的规则集全部加 no-resolve，不再为判断 IP 而解析域名）；头部加最后更新时间。

[2026-11-03] 原 Sydney-Moses/Network-Profiles 的 .mrs 链接已 404，改用 MetaCubeX meta-rules-dat（GitHub raw，每日更新），
并经 PROXY 组下载（国内直连 raw.githubusercontent.com 常失败）。规则集名称不变。

[2026-11-03] 统一加固（所有 mihomo 脚本共用同一段，放在 main() 最后执行，覆盖前面的设置）
1) 自建 VPS IP 直连：IP-CIDR,216.36.82.250/32,DIRECT,no-resolve 放在第 1 条规则，
使用任何机场订阅时都能直接访问自己的 VPS（不经机场节点）。
2) WebRTC 防泄漏：STUN/TURN 端口（3478-3481、5349、19302-19309）先走代理，
节点不支持 UDP 时立即 REJECT，绝不回落 DIRECT（防止暴露真实公网 IP）。
3) DNS 防泄漏，统一规则：
- 中国域名 + 公司/内网域名 + .lan/.local → system（当前网络的系统 DNS，公司/家里自动切换，不写死 IP）
- 其余外网域名、以及 IP 规则需要的解析 → 外网加密 DoH（Google 8.8.8.8 / Cloudflare 1.1.1.1），经代理发出
- 删除 fallback（避免回落到明文/国内 DNS），fake-ip 模式，关闭 IPv6 解析
- 机场节点域名用加密 DoH（阿里 / 腾讯，按 IP 写），节点必须直连才能解析，所以不走代理
4) Foxmail（仅桌面脚本，脚本顶部有 VPS_URL 时生效）：只走 VPS_URL 里的自建 VPS 节点；VPS_URL 留空则跟随主选择组。

[2026-11-04] 大航海机场订阅面板 IP 直连（拒绝代理连接），紧随 VPS 规则

[2026-11-04] VPS SSH(22) 例外：走主选择组，置于 VPS 直连规则之前

[2026-11-04] 订阅经主选择组（机场节点）下载，防国内直连 VPS 时 EOF

---- [2026-11-04] 原则：中国/公司流量永远优先直连；Foxmail 组只接剩下的海外邮件 ----
```
