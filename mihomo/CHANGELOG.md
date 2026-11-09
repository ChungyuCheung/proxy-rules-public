# mihomo 更新日志

## 2026-11-09：Google 全域名统一固定 VPS 出口（待验证）

- `tun-metacubex.js`、`sysproxy-metacubex.js`、`lite-metacubex.js`：引入 MetaCubeX 完整 `geosite/google.mrs`，独立 `google-vps` 缓存，Google 流量统一走现有 `🤖 AI` 组（已设置 `VPS_URL` 时走自建 VPS）。
- `tun-loyalsoldier.js`、`sysproxy-loyalsoldier.js`：以 MetaCubeX `geosite/google.yaml` 代替仅覆盖 Google 中国子集的 Loyalsoldier `google.txt`，同样转发到 `🤖 AI`。
- 完整版脚本将本地 Google/YouTube 常见域名兜底改为 `🤖 AI`，并放到原有 `reject` 广告规则后，尽量保留广告拦截优先级。
- Foxmail IMAP/SMTP 独立组、公司/国内邮箱直连、DNS、WebRTC/QUIC、其他网站手动选择组保持原有设计。
- 尚需客户端实机验证：主代理切换后核查 `accounts.google.com`、`mail.google.com`、`clients4.google.com`、`imap.gmail.com` 和 `smtp.gmail.com` 的实际策略与出口；不同协议须确保同一公网 IP。

本目录的更新历史统一记录于此。脚本内仅保留当前版本、最后更新时间、用途、用法及必要的行为说明。新增变更请按对应文件记录于本文件，避免再次在脚本中累积历史注释。

## 2026-11-05：更新日志迁移

- 将五个脚本的头部更新历史及代码旁原有版本／日期标记收录于本文件。
- 脚本仅整理注释，当前版本号、原最后更新时间与执行逻辑保持不变。
- 下方历史内容按原文件保留；仅有版本标记而无日期的旧记录不补造日期。历史说明不代表当前完整行为，使用时以对应脚本及仓库规则说明为准。

## lite-metacubex.js

### 版本更新记录

- 2026-11-06 v1.17：在 `AI_EXACT_DOMAINS` 中补充 `http-intake.logs.us5.datadoghq.com`，生成的精确 AI 规则优先于广告拦截及通用规则集；Claude API / Bridge / 下载 / 平台域名继续由现有后缀规则覆盖。
- 2026-11-05 v1.16: Route accounts.google.com to the AI group.
- 2026-11-05 v1.15: AI desktop process rules use the AI group before generic routing.
- 2026-11-05 v1.14：新增「🤖 AI」组（与 Foxmail 同样绑定 my-vps 订阅，留空跟随「⚡ 节点选择」）；引入 MetaCubeX 每日更新的 category-ai-!cn.mrs 规则集 + 高频 AI 静态域名。
- 2026-11-04 v1.13：Foxmail 进程规则改为 AND,((PROCESS-NAME,Foxmail.exe),(NOT,((GEOIP,CN,no-resolve)))) ：只有目标非中国 IP 才走「📧 Foxmail」，中国 IP 落到后面的 cncidr/GEOIP,CN 直连。
- 2026-11-04 v1.12：synology.me 并入 COMPANY_DOMAINS（随公司块直连、走 system DNS），排在 Foxmail 规则之前，与其他脚本一致。
- 2026-11-04 v1.11：公司域名直连与国内邮箱直连合并为一块，置于 Foxmail 规则之前（原则：中国/公司流量永远优先直连，Foxmail 只接海外邮件）。
- 2026-11-04：my-vps 订阅经「⚡ 节点选择」下载；VPS_URL 留空时 Foxmail 跟随「⚡ 节点选择」；国内邮箱（88.com/qq/163 等）直连，置于 Foxmail 规则前。
- 2026-11-04：大航海机场订阅 IP 直连（面板拒绝代理连接），紧随 VPS 规则。
- 2026-11-04：VPS 的 SSH（22 端口）走节点选择（国内直连被阻断），VPS 其余流量仍直连。
- 2026-11-04：统一 no-resolve（GEOIP,CN 及含 IP 的规则集全部加 no-resolve，不再为判断 IP 而解析域名）；头部加最后更新时间。

### 原版本／日期标记补充

保留原代码旁的版本归属及说明；相同日期的条目是同一次更新在不同实现位置的记录。

- [v1.14] 海外 AI 高频静态域名兜底（配合每日自动更新的 MetaCubeX category-ai-!cn.mrs 规则集，固定走 AI 组）
- [2026-11-04] 订阅经「⚡ 节点选择」（机场节点）下载：国内直连海外 VPS 的明文 http 常被重置（EOF）
- [v1.14] AI 服务只走自建 VPS
- [v1.14] AI 服务与 MetaCubeX category-ai-!cn 规则集走 🤖 AI
- [2026-11-03] 统一加固（所有 mihomo 脚本共用同一段，放在 main() 最后执行，覆盖前面的设置）
    1) 自建 VPS IP 直连：IP-CIDR,216.36.82.250/32,DIRECT,no-resolve 放在第 1 条规则，
       使用任何机场订阅时都能直接访问自己的 VPS（不经机场节点）。
    2) WebRTC 防泄漏：STUN/TURN 端口（3478-3481、5349、19302-19309）先走代理，
       节点不支持 UDP 时立即 REJECT，绝不回落 DIRECT（防止暴露真实公网 IP）。
    3) DNS 防泄漏，统一规则：
       - 中国域名 + 公司/内网域名 + .lan/.local → system（当前网络的系统 DNS，公司/家里自动切换，不写死 IP）
       - 其余外网域名、以及 IP 规则需要的解析 → 外网加密 DoH（Google 8.8.8.8 / Cloudflare 1.1.1.1），经代理发出
       - 删除 fallback（避免回落到明文/国内 DNS），fake-ip 模式，关闭 IPv6 解析
       - 机场节点域名用加密 DoH（阿里 / 腾讯，按 IP 写），节点必须直连才能解析，所以不走代理
    4) Foxmail 与 AI（仅桌面脚本，脚本顶部有 VPS_URL 时生效）：只走 VPS_URL 里的自建 VPS 节点；VPS_URL 留空则跟随主选择组。
- [2026-11-04] 大航海机场订阅面板 IP 直连（拒绝代理连接），紧随 VPS 规则
- [2026-11-04] VPS SSH(22) 例外：走主选择组，置于 VPS 直连规则之前
- [2026-11-04] 国内邮箱服务器直连（置于 Foxmail 进程规则之前，修 88.com 等国内邮箱添加失败）；Gmail 仍走 Foxmail 组
- [2026-11-04] 订阅经主选择组（机场节点）下载，防国内直连 VPS 时 EOF
- ---- [2026-11-04] 原则：中国/公司流量永远优先直连；Foxmail 组只接剩下的海外邮件 ----
  公司域名（COMPANY_DOMAINS/INTRANET_DOMAINS/CUSTOM_DIRECT_DOMAINS）+ 国内邮箱合并为一个 DIRECT 区块，
  固定插在 SSH 例外、VPS IP、大航海 IP 之后，Foxmail/Gmail 规则之前；后面的重复规则删除。

## sysproxy-loyalsoldier.js

### 版本更新记录

- 2026-11-06 v9.4：在 `AI_EXACT_DOMAINS` 中补充 `http-intake.logs.us5.datadoghq.com`，生成的精确 AI 规则优先于广告拦截及通用规则集；Claude API / Bridge / 下载 / 平台域名继续由现有后缀规则覆盖。
- 2026-11-05 v9.3: Route accounts.google.com to the AI group.
- 2026-11-05 v9.2: AI desktop process rules use the AI group before generic routing.
- 2026-11-05 v9.1：新增「🤖 AI」组（与 Foxmail 同样绑定 my-vps 订阅，留空跟随「⚡ 节点选择」）；引入 MetaCubeX 每日更新的 category-ai-!cn.yaml 规则集 + 高频 AI 静态域名，置于 Google 代理规则之前。
- 2026-11-04 v9.0：Foxmail 进程规则改为 AND,((PROCESS-NAME,Foxmail.exe),(NOT,((GEOIP,CN,no-resolve)))) ：只有目标非中国 IP 才走「📧 Foxmail」，中国 IP 落到后面的 cncidr/GEOIP,CN 直连。
- 2026-11-04 v8.9：公司域名直连与国内邮箱直连合并为一块，置于 Foxmail 规则之前（原则：中国/公司流量永远优先直连，Foxmail 只接海外邮件）。
- 2026-11-04：my-vps 订阅经「⚡ 节点选择」下载；VPS_URL 留空时 Foxmail 跟随「⚡ 节点选择」；国内邮箱（88.com/qq/163 等）直连，置于 Foxmail 规则前。
- 2026-11-04：大航海机场订阅 IP 直连（面板拒绝代理连接），紧随 VPS 规则。
- 2026-11-04：VPS 的 SSH（22 端口）走节点选择（国内直连被阻断），VPS 其余流量仍直连。
- 2026-11-04：统一 no-resolve（GEOIP,CN 及含 IP 的规则集全部加 no-resolve，不再为判断 IP 而解析域名）；头部加最后更新时间。

### 原版本／日期标记补充

保留原代码旁的版本归属及说明；相同日期的条目是同一次更新在不同实现位置的记录。

- ==================== [2026-11-03] 自建 VPS（仅在本机填写）====================
  在下方引号内粘贴自建 VPS 的订阅链接（Clash/mihomo 格式）。Foxmail 与 AI 只走这里的节点，
  不写死节点名/服务器地址：机器改名、换 VPS、换地址，只改这个链接即可。
  只在本机脚本副本里填写，切勿提交到仓库（会泄露订阅）！留空则 Foxmail 与 AI 跟随「⚡ 节点选择」。
- [v9.1] 海外 AI 高频静态域名兜底（配合每日自动更新的 category-ai-!cn 规则集，固定走 AI 组）
- [v9.1] AI 服务与 category-ai-!cn 规则集走 🤖 AI（须在 googleDomainRules 与 google/proxy 规则集之前，防 gemini/googleapis 等被抢先匹配到节点选择）
- [2026-11-04] 加 no-resolve：只按已知 IP 判断，不为匹配而解析域名（未命中域名规则的走 MATCH）。
- [2026-11-03] 统一加固（所有 mihomo 脚本共用同一段，放在 main() 最后执行，覆盖前面的设置）
    1) 自建 VPS IP 直连：IP-CIDR,216.36.82.250/32,DIRECT,no-resolve 放在第 1 条规则，
       使用任何机场订阅时都能直接访问自己的 VPS（不经机场节点）。
    2) WebRTC 防泄漏：STUN/TURN 端口（3478-3481、5349、19302-19309）先走代理，
       节点不支持 UDP 时立即 REJECT，绝不回落 DIRECT（防止暴露真实公网 IP）。
    3) DNS 防泄漏，统一规则：
       - 中国域名 + 公司/内网域名 + .lan/.local → system（当前网络的系统 DNS，公司/家里自动切换，不写死 IP）
       - 其余外网域名、以及 IP 规则需要的解析 → 外网加密 DoH（Google 8.8.8.8 / Cloudflare 1.1.1.1），经代理发出
       - 删除 fallback（避免回落到明文/国内 DNS），fake-ip 模式，关闭 IPv6 解析
       - 机场节点域名用加密 DoH（阿里 / 腾讯，按 IP 写），节点必须直连才能解析，所以不走代理
    4) Foxmail 与 AI（仅桌面脚本，脚本顶部有 VPS_URL 时生效）：只走 VPS_URL 里的自建 VPS 节点；VPS_URL 留空则跟随主选择组。
- [2026-11-04] 大航海机场订阅面板 IP 直连（拒绝代理连接），紧随 VPS 规则
- [2026-11-04] VPS SSH(22) 例外：走主选择组，置于 VPS 直连规则之前
- [2026-11-04] 国内邮箱服务器直连（置于 Foxmail 进程规则之前，修 88.com 等国内邮箱添加失败）；Gmail 仍走 Foxmail 组
- [2026-11-04] 订阅经主选择组（机场节点）下载，防国内直连 VPS 时 EOF
- ---- [2026-11-04] 原则：中国/公司流量永远优先直连；Foxmail 组只接剩下的海外邮件 ----
  公司域名（COMPANY_DOMAINS/INTRANET_DOMAINS/CUSTOM_DIRECT_DOMAINS）+ 国内邮箱合并为一个 DIRECT 区块，
  固定插在 SSH 例外、VPS IP、大航海 IP 之后，Foxmail/Gmail 规则之前；后面的重复规则删除。

## sysproxy-metacubex.js

### 版本更新记录

- 2026-11-06 v9.4：在 `AI_EXACT_DOMAINS` 中补充 `http-intake.logs.us5.datadoghq.com`，生成的精确 AI 规则优先于广告拦截及通用规则集；Claude API / Bridge / 下载 / 平台域名继续由现有后缀规则覆盖。
- 2026-11-05 v9.3: Route accounts.google.com to the AI group.
- 2026-11-05 v9.2: AI desktop process rules use the AI group before generic routing.
- 2026-11-05 v9.1：新增「🤖 AI」组（与 Foxmail 同样绑定 my-vps 订阅，留空跟随「⚡ 节点选择」）；引入 MetaCubeX 每日更新的 category-ai-!cn.mrs 规则集 + 高频 AI 静态域名，置于 Google 代理规则之前。
- 2026-11-04 v9.0：Foxmail 进程规则改为 AND,((PROCESS-NAME,Foxmail.exe),(NOT,((GEOIP,CN,no-resolve)))) ：只有目标非中国 IP 才走「📧 Foxmail」，中国 IP 落到后面的 cncidr/GEOIP,CN 直连。
- 2026-11-04 v8.9：公司域名直连与国内邮箱直连合并为一块，置于 Foxmail 规则之前（原则：中国/公司流量永远优先直连，Foxmail 只接海外邮件）。
- 2026-11-04：my-vps 订阅经「⚡ 节点选择」下载；VPS_URL 留空时 Foxmail 跟随「⚡ 节点选择」；国内邮箱（88.com/qq/163 等）直连，置于 Foxmail 规则前。
- 2026-11-04：大航海机场订阅 IP 直连（面板拒绝代理连接），紧随 VPS 规则。
- 2026-11-04：VPS 的 SSH（22 端口）走节点选择（国内直连被阻断），VPS 其余流量仍直连。
- 2026-11-04：统一 no-resolve（GEOIP,CN 及含 IP 的规则集全部加 no-resolve，不再为判断 IP 而解析域名）；头部加最后更新时间。

### 原版本／日期标记补充

保留原代码旁的版本归属及说明；相同日期的条目是同一次更新在不同实现位置的记录。

- ==================== [v8.0] 仅在本机填写 ====================
  在下方引号内粘贴你自建 VPS 的订阅链接（Clash/mihomo 格式）。Foxmail 与 AI 只会走这里的节点。
  不写死节点名/服务器地址：机器改名、换 VPS、换地址，只要改这个链接即可。
  只在本地 Bettbox / Clash Verge Rev / FlClash 的脚本副本里填写，切勿提交到仓库（会泄露订阅）！
  每次从仓库更新本脚本后需要重新粘贴。留空则 Foxmail 与 AI 跟随「⚡ 节点选择」。
- [v7.7] Foxmail 进程与 Gmail 收发信服务器，固定走 MAIL 组
- [v9.1] 海外 AI 高频静态域名兜底（配合每日自动更新的 MetaCubeX category-ai-!cn.mrs 规则集，固定走 AI 组）
- ---- 0. 多 IP 并发建连 + [v7.4] TCP 保活 ----
- [v7.7] PROCESS-NAME 规则依赖进程匹配
- [v8.0] 自建 VPS provider（仅当 VPS_URL 已在本机填写）
- [2026-11-04] 订阅经「⚡ 节点选择」（机场节点）下载：国内直连海外 VPS 的明文 http 常被重置（EOF）
- [v8.0] 启用 my-vps 时，主组不纳入该 provider（订阅自带的 provider 仍保留）
- [v8.0] Foxmail 只走自建 VPS：填了 VPS_URL 就只用 my-vps provider（不做名字过滤）；
-        [2026-11-04] 留空则跟随「⚡ 节点选择」
- [v9.1] AI 服务只走自建 VPS：填了 VPS_URL 就只用 my-vps provider；留空则跟随「⚡ 节点选择」
- [v7.7] Foxmail 与 Gmail 收发信服务器走 MAIL 组（置于其他规则之前）
- [v9.1] AI 服务与 MetaCubeX category-ai-!cn 规则集走 🤖 AI（须在 googleDomainRules 与 google/proxy 规则集之前，防 gemini/googleapis 等被抢先匹配到节点选择）
- [2026-11-03] 统一加固（所有 mihomo 脚本共用同一段，放在 main() 最后执行，覆盖前面的设置）
    1) 自建 VPS IP 直连：IP-CIDR,216.36.82.250/32,DIRECT,no-resolve 放在第 1 条规则，
       使用任何机场订阅时都能直接访问自己的 VPS（不经机场节点）。
    2) WebRTC 防泄漏：STUN/TURN 端口（3478-3481、5349、19302-19309）先走代理，
       节点不支持 UDP 时立即 REJECT，绝不回落 DIRECT（防止暴露真实公网 IP）。
    3) DNS 防泄漏，统一规则：
       - 中国域名 + 公司/内网域名 + .lan/.local → system（当前网络的系统 DNS，公司/家里自动切换，不写死 IP）
       - 其余外网域名、以及 IP 规则需要的解析 → 外网加密 DoH（Google 8.8.8.8 / Cloudflare 1.1.1.1），经代理发出
       - 删除 fallback（避免回落到明文/国内 DNS），fake-ip 模式，关闭 IPv6 解析
       - 机场节点域名用加密 DoH（阿里 / 腾讯，按 IP 写），节点必须直连才能解析，所以不走代理
    4) Foxmail 与 AI（仅桌面脚本，脚本顶部有 VPS_URL 时生效）：只走 VPS_URL 里的自建 VPS 节点；VPS_URL 留空则跟随主选择组。
- [2026-11-04] 大航海机场订阅面板 IP 直连（拒绝代理连接），紧随 VPS 规则
- [2026-11-04] VPS SSH(22) 例外：走主选择组，置于 VPS 直连规则之前
- [2026-11-04] 国内邮箱服务器直连（置于 Foxmail 进程规则之前，修 88.com 等国内邮箱添加失败）；Gmail 仍走 Foxmail 组
- [2026-11-04] 订阅经主选择组（机场节点）下载，防国内直连 VPS 时 EOF
- ---- [2026-11-04] 原则：中国/公司流量永远优先直连；Foxmail 组只接剩下的海外邮件 ----
  公司域名（COMPANY_DOMAINS/INTRANET_DOMAINS/CUSTOM_DIRECT_DOMAINS）+ 国内邮箱合并为一个 DIRECT 区块，
  固定插在 SSH 例外、VPS IP、大航海 IP 之后，Foxmail/Gmail 规则之前；后面的重复规则删除。

## tun-loyalsoldier.js

### 版本更新记录

- 2026-11-06 v9.4：在 `AI_EXACT_DOMAINS` 中补充 `http-intake.logs.us5.datadoghq.com`，生成的精确 AI 规则优先于广告拦截及通用规则集；Claude API / Bridge / 下载 / 平台域名继续由现有后缀规则覆盖。
- 2026-11-05 v9.3: Route accounts.google.com to the AI group.
- 2026-11-05 v9.2: AI desktop process rules use the AI group before generic routing.
- 2026-11-05 v9.1：新增「🤖 AI」组（与 Foxmail 同样绑定 my-vps 订阅，留空跟随「⚡ 节点选择」）；引入 MetaCubeX 每日更新的 category-ai-!cn.yaml 规则集 + 高频 AI 静态域名，置于 Google 代理规则之前。
- 2026-11-04 v9.0：Foxmail 进程规则改为 AND,((PROCESS-NAME,Foxmail.exe),(NOT,((GEOIP,CN,no-resolve)))) ：只有目标非中国 IP 才走「📧 Foxmail」，中国 IP 落到后面的 cncidr/GEOIP,CN 直连。
- 2026-11-04 v8.9：公司域名直连与国内邮箱直连合并为一块，置于 Foxmail 规则之前（原则：中国/公司流量永远优先直连，Foxmail 只接海外邮件）。
- 2026-11-04：my-vps 订阅经「⚡ 节点选择」下载；VPS_URL 留空时 Foxmail 跟随「⚡ 节点选择」；国内邮箱（88.com/qq/163 等）直连，置于 Foxmail 规则前。
- 2026-11-04：大航海机场订阅 IP 直连（面板拒绝代理连接），紧随 VPS 规则。
- 2026-11-04：VPS 的 SSH（22 端口）走节点选择（国内直连被阻断），VPS 其余流量仍直连。
- 2026-11-04：统一 no-resolve（GEOIP,CN 及含 IP 的规则集全部加 no-resolve，不再为判断 IP 而解析域名）；头部加最后更新时间。

### 原版本／日期标记补充

保留原代码旁的版本归属及说明；相同日期的条目是同一次更新在不同实现位置的记录。

- ==================== [v8.0] 仅在本机填写 ====================
  在下方引号内粘贴你自建 VPS 的订阅链接（Clash/mihomo 格式）。Foxmail 与 AI 只会走这里的节点。
  不写死节点名/服务器地址：机器改名、换 VPS、换地址，只要改这个链接即可。
  只在本地 Bettbox / Clash Verge Rev / FlClash 的脚本副本里填写，切勿提交到仓库（会泄露订阅）！
  每次从仓库更新本脚本后需要重新粘贴。留空则 Foxmail 与 AI 跟随「⚡ 节点选择」。
- [v7.7] Foxmail 进程与 Gmail 收发信服务器，固定走 MAIL 组
- [v9.1] 海外 AI 高频静态域名兜底（配合每日自动更新的 category-ai-!cn 规则集，固定走 AI 组）
- ---- 0. 多 IP 并发建连 + [v7.4] TCP 保活 ----
- [v7.7] PROCESS-NAME 规则依赖进程匹配
- [v8.0] 自建 VPS provider（仅当 VPS_URL 已在本机填写）
- [2026-11-04] 订阅经「⚡ 节点选择」（机场节点）下载：国内直连海外 VPS 的明文 http 常被重置（EOF）
- [v8.0] 启用 my-vps 时，主组不纳入该 provider（订阅自带的 provider 仍保留）
- [v8.0] Foxmail 只走自建 VPS：填了 VPS_URL 就只用 my-vps provider（不做名字过滤）；
-        [2026-11-04] 留空则跟随「⚡ 节点选择」
- [v9.1] AI 服务只走自建 VPS：填了 VPS_URL 就只用 my-vps provider；留空则跟随「⚡ 节点选择」
- [v7.7] Foxmail 与 Gmail 收发信服务器走 MAIL 组（置于其他规则之前）
- [v9.1] AI 服务与 category-ai-!cn 规则集走 🤖 AI（须在 googleDomainRules 与 google/proxy 规则集之前，防 gemini/googleapis 等被抢先匹配到节点选择）
- [2026-11-03] 统一加固（所有 mihomo 脚本共用同一段，放在 main() 最后执行，覆盖前面的设置）
    1) 自建 VPS IP 直连：IP-CIDR,216.36.82.250/32,DIRECT,no-resolve 放在第 1 条规则，
       使用任何机场订阅时都能直接访问自己的 VPS（不经机场节点）。
    2) WebRTC 防泄漏：STUN/TURN 端口（3478-3481、5349、19302-19309）先走代理，
       节点不支持 UDP 时立即 REJECT，绝不回落 DIRECT（防止暴露真实公网 IP）。
    3) DNS 防泄漏，统一规则：
       - 中国域名 + 公司/内网域名 + .lan/.local → system（当前网络的系统 DNS，公司/家里自动切换，不写死 IP）
       - 其余外网域名、以及 IP 规则需要的解析 → 外网加密 DoH（Google 8.8.8.8 / Cloudflare 1.1.1.1），经代理发出
       - 删除 fallback（避免回落到明文/国内 DNS），fake-ip 模式，关闭 IPv6 解析
       - 机场节点域名用加密 DoH（阿里 / 腾讯，按 IP 写），节点必须直连才能解析，所以不走代理
    4) Foxmail 与 AI（仅桌面脚本，脚本顶部有 VPS_URL 时生效）：只走 VPS_URL 里的自建 VPS 节点；VPS_URL 留空则跟随主选择组。
- [2026-11-04] 大航海机场订阅面板 IP 直连（拒绝代理连接），紧随 VPS 规则
- [2026-11-04] VPS SSH(22) 例外：走主选择组，置于 VPS 直连规则之前
- [2026-11-04] 国内邮箱服务器直连（置于 Foxmail 进程规则之前，修 88.com 等国内邮箱添加失败）；Gmail 仍走 Foxmail 组
- [2026-11-04] 订阅经主选择组（机场节点）下载，防国内直连 VPS 时 EOF
- ---- [2026-11-04] 原则：中国/公司流量永远优先直连；Foxmail 组只接剩下的海外邮件 ----
  公司域名（COMPANY_DOMAINS/INTRANET_DOMAINS/CUSTOM_DIRECT_DOMAINS）+ 国内邮箱合并为一个 DIRECT 区块，
  固定插在 SSH 例外、VPS IP、大航海 IP 之后，Foxmail/Gmail 规则之前；后面的重复规则删除。

## tun-metacubex.js

### 版本更新记录

- 2026-11-06 v9.4：在 `AI_EXACT_DOMAINS` 中补充 `http-intake.logs.us5.datadoghq.com`，生成的精确 AI 规则优先于广告拦截及通用规则集；Claude API / Bridge / 下载 / 平台域名继续由现有后缀规则覆盖。
- 2026-11-05 v9.3: Route accounts.google.com to the AI group.
- 2026-11-05 v9.2: AI desktop process rules use the AI group before generic routing.
- 2026-11-05 v9.1：新增「🤖 AI」组（与 Foxmail 同样绑定 my-vps 订阅，留空跟随「⚡ 节点选择」）；引入 MetaCubeX 每日更新的 category-ai-!cn.mrs 规则集 + 高频 AI 静态域名，置于 Google 代理规则之前。
- 2026-11-04 v9.0：Foxmail 进程规则改为 AND,((PROCESS-NAME,Foxmail.exe),(NOT,((GEOIP,CN,no-resolve)))) ：只有目标非中国 IP 才走「📧 Foxmail」，中国 IP 落到后面的 cncidr/GEOIP,CN 直连。
- 2026-11-04 v8.9：公司域名直连与国内邮箱直连合并为一块，置于 Foxmail 规则之前（原则：中国/公司流量永远优先直连，Foxmail 只接海外邮件）。
- 2026-11-04：my-vps 订阅经「⚡ 节点选择」下载；VPS_URL 留空时 Foxmail 跟随「⚡ 节点选择」；国内邮箱（88.com/qq/163 等）直连，置于 Foxmail 规则前。
- 2026-11-04：大航海机场订阅 IP 直连（面板拒绝代理连接），紧随 VPS 规则。
- 2026-11-04：VPS 的 SSH（22 端口）走节点选择（国内直连被阻断），VPS 其余流量仍直连。
- 2026-11-04：统一 no-resolve（GEOIP,CN 及含 IP 的规则集全部加 no-resolve，不再为判断 IP 而解析域名）；头部加最后更新时间。

### 原版本／日期标记补充

保留原代码旁的版本归属及说明；相同日期的条目是同一次更新在不同实现位置的记录。

- ==================== [v8.0] 仅在本机填写 ====================
  在下方引号内粘贴你自建 VPS 的订阅链接（Clash/mihomo 格式）。Foxmail 与 AI 只会走这里的节点。
  不写死节点名/服务器地址：机器改名、换 VPS、换地址，只要改这个链接即可。
  只在本地 Bettbox / Clash Verge Rev / FlClash 的脚本副本里填写，切勿提交到仓库（会泄露订阅）！
  每次从仓库更新本脚本后需要重新粘贴。留空则 Foxmail 与 AI 跟随「⚡ 节点选择」。
- [v7.7] Foxmail 进程与 Gmail 收发信服务器，固定走 MAIL 组
- [v9.1] 海外 AI 高频静态域名兜底（配合每日自动更新的 MetaCubeX category-ai-!cn.mrs 规则集，固定走 AI 组）
- ---- 0. 多 IP 并发建连 + [v7.4] TCP 保活 ----
- [v7.7] PROCESS-NAME 规则依赖进程匹配
- [v8.0] 自建 VPS provider（仅当 VPS_URL 已在本机填写）
- [2026-11-04] 订阅经「⚡ 节点选择」（机场节点）下载：国内直连海外 VPS 的明文 http 常被重置（EOF）
- [v8.0] 启用 my-vps 时，主组不纳入该 provider（订阅自带的 provider 仍保留）
- [v8.0] Foxmail 只走自建 VPS：填了 VPS_URL 就只用 my-vps provider（不做名字过滤）；
-        [2026-11-04] 留空则跟随「⚡ 节点选择」
- [v9.1] AI 服务只走自建 VPS：填了 VPS_URL 就只用 my-vps provider；留空则跟随「⚡ 节点选择」
- [v7.7] Foxmail 与 Gmail 收发信服务器走 MAIL 组（置于其他规则之前）
- [v9.1] AI 服务与 MetaCubeX category-ai-!cn 规则集走 🤖 AI（须在 googleDomainRules 与 google/proxy 规则集之前，防 gemini/googleapis 等被抢先匹配到节点选择）
- [2026-11-03] 统一加固（所有 mihomo 脚本共用同一段，放在 main() 最后执行，覆盖前面的设置）
    1) 自建 VPS IP 直连：IP-CIDR,216.36.82.250/32,DIRECT,no-resolve 放在第 1 条规则，
       使用任何机场订阅时都能直接访问自己的 VPS（不经机场节点）。
    2) WebRTC 防泄漏：STUN/TURN 端口（3478-3481、5349、19302-19309）先走代理，
       节点不支持 UDP 时立即 REJECT，绝不回落 DIRECT（防止暴露真实公网 IP）。
    3) DNS 防泄漏，统一规则：
       - 中国域名 + 公司/内网域名 + .lan/.local → system（当前网络的系统 DNS，公司/家里自动切换，不写死 IP）
       - 其余外网域名、以及 IP 规则需要的解析 → 外网加密 DoH（Google 8.8.8.8 / Cloudflare 1.1.1.1），经代理发出
       - 删除 fallback（避免回落到明文/国内 DNS），fake-ip 模式，关闭 IPv6 解析
       - 机场节点域名用加密 DoH（阿里 / 腾讯，按 IP 写），节点必须直连才能解析，所以不走代理
    4) Foxmail 与 AI（仅桌面脚本，脚本顶部有 VPS_URL 时生效）：只走 VPS_URL 里的自建 VPS 节点；VPS_URL 留空则跟随主选择组。
- [2026-11-04] 大航海机场订阅面板 IP 直连（拒绝代理连接），紧随 VPS 规则
- [2026-11-04] VPS SSH(22) 例外：走主选择组，置于 VPS 直连规则之前
- [2026-11-04] 国内邮箱服务器直连（置于 Foxmail 进程规则之前，修 88.com 等国内邮箱添加失败）；Gmail 仍走 Foxmail 组
- [2026-11-04] 订阅经主选择组（机场节点）下载，防国内直连 VPS 时 EOF
- ---- [2026-11-04] 原则：中国/公司流量永远优先直连；Foxmail 组只接剩下的海外邮件 ----
  公司域名（COMPANY_DOMAINS/INTRANET_DOMAINS/CUSTOM_DIRECT_DOMAINS）+ 国内邮箱合并为一个 DIRECT 区块，
  固定插在 SSH 例外、VPS IP、大航海 IP 之后，Foxmail/Gmail 规则之前；后面的重复规则删除。
