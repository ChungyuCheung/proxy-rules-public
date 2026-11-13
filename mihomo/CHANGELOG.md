# mihomo 更新日志

## 2026-11-13：RackNerd 直出与多协议节点加入手选组

- 四份完整版 v9.14、lite v1.27：新增 VPS_URL_3 / VPS_URL_4，最多加载四份 Clash/mihomo 订阅，所有真实地址仅在客户端本地填写。
- Foxmail、AI、Google 新增匹配 XUI-Direct，以及 WARP / VPNGate / Direct 的 Reality、Hy2 六个节点；保留 NovixLink / Webshare 候选。名称精确匹配新增节点，不引入 XUI-WARP 或无关机场节点。
- 四份专用 provider 均与主机场组隔离，业务组保持 select；健康检查不自动切换选择，WARP / VPNGate 上游出口可能变化。
- RackNerd 的 base64 `/sub` 在 mihomo 中使用同目录对应的 `clash.yaml`；只取 provider 节点，不导入订阅中的自动回退组。
- 验证：25 项测试通过，包括五份脚本的四订阅共 16 种填写组合，以及 mihomo v1.19.13 对 30 份生成配置的原生语法检查；订阅实际节点名称已核对，连通性与客户端加载结果另行验证。

## 2026-11-11 20:10 UTC+8：双 VPS 订阅与纯手动选择

- 四份完整版 v9.13、lite v1.26：移除 VPS 自动回退组；邮件、AI 纯 select，Google 可手选具体节点或跟随 AI。节点不可用时不自动回退到其他 VPS。
- 新增 VPS_URL_2 / my-vps-2；两条订阅只在客户端本地填写，仓库均为空。主组排除两个专用 provider，业务组可筛选两份 provider 的 NovixLink / Webshare 节点；仅填第二条也支持。
- 业务组保留手动跟随主组选项。provider 健康检查仅记录状态，不会改变手动选择；实际出口地址由节点上游决定。
- 回归测试更新为四组纯手选、双 provider、机场 provider 隔离与 Google 跟随 AI；保留 UDP 保护与 VPS SSH 直连检查。
- 验证：25 项测试全部通过，原生 mihomo v1.19.13 覆盖五份脚本 × 两个订阅各自留空/已填共 20 份配置；第二条独立填写与双订阅均已覆盖。测试 provider 使用本地 inline 数据，不代表真实服务可用。

## 2026-11-11 18:00 UTC+8：NovixLink / Webshare 手选与自动回退

- 四份完整版 v9.12、lite v1.25：最终邮件、AI、Google 均为独立 select 组，展示当前配置内名称含 NovixLink / Webshare 的节点（忽略大小写、排除信息节点）、共用的 VPS 自动回退组，以及主组。
- 当前配置的 proxy-providers 通过 use + filter 动态引入；自动组空候选用 REJECT，避免隐式 DIRECT。无本地匹配且无 provider 时保持跟随主组。有 provider 但筛选为空时可手选主组。
- 独立订阅卡片不会自动合并；同时使用两台 VPS 需要在客户端本机合并订阅或配置两个 provider。原 VPS_URL 保留兼容且仓库保持为空，不保存真实订阅。
- 25 项测试全部通过，包含五份脚本与 VPS_URL 留空/已填共十份配置的 mihomo v1.19.13 原生检查；新增节点名称、信息节点排除、手选独立性、空配置与 provider 筛选断言。连通性仍需客户端实测。

## 2026-11-11 17:00 UTC+8：RackNerd VPS 直连

- 四份完整脚本 `v9.11`、简约版 `v1.24`：统一加固段新增 `IP-CIDR,192.3.153.152/32,DIRECT,no-resolve`，位于自建 VPS 直连之后、大航海面板之前，包含 SSH(22)。旧规则过滤正则同步加入该 IP，避免订阅自带的同 IP 规则重复。
- 原因：TUN 模式下该 IP 落入 MATCH 走机场节点，TCP 建立后立即被关闭、收不到 SSH banner；绕过 TUN 直连可收到 `SSH-2.0-OpenSSH_9.9`。
- 216.36.82.250 的 SSH 例外保持不变：其 22 端口经节点失败的原因是该 VPS 流量已用完，不属规则问题。
- 回归测试新增 RackNerd TCP 22 / UDP 直连与规则顺序断言，并覆盖 Shadowrocket 与 iPhone Clash 静态配置。

## 2026-11-11 13:49 UTC+8：代理 UDP 防直连回落与 QUIC 保护

- 四份完整脚本 `v9.10`、简约版 `v1.23`：最终规则生成后统一为主代理、邮件、AI、Google 四种代理策略添加保护，原规则顺序、分组、DNS、订阅参数及仓库中留空的 `VPS_URL` 保持。
- 在每条代理规则前以相同匹配条件拒绝 UDP 443，覆盖 OpenAI 等非 Google 目的地，促使支持回退的应用使用 TCP；不对全部流量前置 UDP 443 拦截，先命中的公司/内网/国内 DIRECT 保持。
- 每条代理规则后添加同条件 UDP REJECT，防止节点不支持 UDP 时被内核跳过，继而命中后续 DIRECT 或其他代理出口；最终 MATCH 后同样有 UDP REJECT。其他端口的 UDP 在所选节点支持时保持代理，不支持时拒绝。
- IP 与规则集逻辑子条件保留 `no-resolve`。原 Google QUIC 前置拒绝、STUN 代理/拒绝后备保留。系统代理版仍不能保护没有进入内核的 UDP；全局直连与主动选择 DIRECT 不在此保护范围。
- 核对 Shadowrocket `cy.conf v5.32` 与 `cy-simple.conf v1.26`，两者已有 `block-quic = all-proxy` 和 `udp-policy-not-supported-behaviour = REJECT`，无需修改或升版。
- 新增无依赖回归测试：`node --test mihomo/tests/udp-guard.test.cjs`，覆盖五份脚本、VPS 已填/留空、TCP/QUIC/其他 UDP、规则级拒绝、明确直连优先、SSH 例外、STUN 与 no-resolve。客户端实际出口与浏览器回退耗时仍需实机确认。
- 验证：18 项测试通过；包含 mihomo v1.19.13 对五份脚本、VPS 已填/留空共 10 份生成配置的原生语法检查（远程 provider 换为本地 inline 测试数据，DNS/TUN 关闭，不代表订阅及实机连通性验证）。另与 Git 修改前版本对比，原规则相对顺序、DNS、策略组和 provider 参数未变。
- 行为依据：[mihomo tunnel/tunnel.go](https://github.com/MetaCubeX/mihomo/blob/Meta/tunnel/tunnel.go) 中的 UDP `SupportUDP()` 检查与无命中默认 DIRECT；截图本身不能证明节点能力或请求已到达目标服务。

## 2026-11-11 10:00 UTC+8：补充 ambersearch.de

- 四份完整脚本 `v9.9`、简约版 `v1.22`：将 `ambersearch.de` 加入本地 AI 后缀列表，主域名及全部子域名走原 `🤖 AI` 分组；保留 `amber.de`、`exaone.ai` 及其他分流设置。

## 2026-11-10 23:48 UTC+8：补充 amber.de 与 exaone.ai 本地 AI 后缀规则

- 四份完整脚本 `v9.8`、简约版 `v1.21`：MetaCubeX `category-ai-!cn` 暂未收录 `amber.de` 与 `exaone.ai`，已在 `AI_SUFFIX_DOMAINS` 中补充这两个域名后缀，统一走 `🤖 AI` 分组（优先于通用外网与广告拦截规则）。

## 2026-11-10 00:57 UTC+8：Gemini 移动端规则与 Google QUIC 优先级

- 四份完整脚本 `v9.7`、简约版 `v1.20`：补齐 Bard、移动端语音、Play/API、共享账号鉴权与图片/静态资源显式规则，统一走 `🌐 Google`。新增共享 OAuth Token 与登录静态资源接口；不使用宽泛关键字或为域名追加 no-resolve。
- 完整版中上述关键共享接口前移到广告拦截之前；普通 Google 域名仍保留原广告优先级。原有 Google 后缀已经覆盖用户清单，本次加固显式优先级，不将无法使用归因于已证实的域名漏配。
- Google 常用后缀的 UDP 443 限制前置至独立进程规则之前，并补入 lite；仅拒绝匹配的 QUIC 流量，TCP/HTTP2/gRPC、其他域名 UDP 与 STUN 规则保持。Google 分组、VPS 订阅和 DNS 设置不变。
- 本地验证生成配置及规则优先级；iOS/Android 的实际出口、账号可用性和 Live 通话仍待实机验证。

## 2026-11-09 15:27 UTC+8：Google 公司出口可手动切换

- Google / YouTube / Gemini 共用新增 `🌐 Google` 选择组，初始首选原 `🤖 AI`；本机已配置 VPS 时默认走 VPS，仓库的 `VPS_URL` 保持为空。
- 可在公司组选择主代理或其他节点，切换 Google 出口时其他 AI 与邮件仍使用原组。Gemini 主程序和辅助进程统一进入 Google 组。
- MetaCubeX google / google-deepmind / youtube 分类与本地兜底配合，Google AI 分类先于宽泛 AI 分类；完整脚本的普通 Google 兜底保留原广告拦截优先级。
- 其他 AI（含 Grok）、邮件、公司/国内明确直连、DNS 和 WebRTC/QUIC 设计保持。邮件、明确直连与其他独立进程仍是优先例外；纯 IP、未收录域名和已建立连接需在客户端另行验证。

## 2026-11-09：Google 全域名统一固定 VPS 出口（客户端待实测）

- 版本：四份完整脚本 `v9.5`；`lite-metacubex.js v1.18`。头部最后更新时间统一为 `2026-11-09 12:21 UTC+8`。
- 补齐已合并 Google 分流改动遗漏的版本号、时间与 README 说明；本次不再修改运行逻辑，仓库中的五处 `VPS_URL` 均为空。
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

- 2026-11-09 15:27 UTC+8 v1.19：新增 Google/YouTube/Gemini 共用选择组，默认引用原 AI/VPS，可手动换区；其他 AI、邮件、直连和 DNS/防泄漏策略保持，`VPS_URL` 为空。
- 2026-11-09 12:21 UTC+8 v1.18：Google 完整域名规则及现有本地兜底统一走 `🤖 AI`；补齐上次合并遗漏的版本元数据。仅本机填写 `VPS_URL` 后使用自建 VPS，仓库保持为空；客户端待实测。
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

- 2026-11-09 15:27 UTC+8 v9.6：新增 Google/YouTube/Gemini 共用选择组，默认引用原 AI/VPS，可手动换区；其他 AI、邮件、直连和 DNS/防泄漏策略保持，`VPS_URL` 为空。
- 2026-11-09 12:21 UTC+8 v9.5：Google 完整域名规则及现有本地兜底统一走 `🤖 AI`；补齐上次合并遗漏的版本元数据。仅本机填写 `VPS_URL` 后使用自建 VPS，仓库保持为空；客户端待实测。
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

- 2026-11-09 15:27 UTC+8 v9.6：新增 Google/YouTube/Gemini 共用选择组，默认引用原 AI/VPS，可手动换区；其他 AI、邮件、直连和 DNS/防泄漏策略保持，`VPS_URL` 为空。
- 2026-11-09 12:21 UTC+8 v9.5：Google 完整域名规则及现有本地兜底统一走 `🤖 AI`；补齐上次合并遗漏的版本元数据。仅本机填写 `VPS_URL` 后使用自建 VPS，仓库保持为空；客户端待实测。
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

- 2026-11-09 15:27 UTC+8 v9.6：新增 Google/YouTube/Gemini 共用选择组，默认引用原 AI/VPS，可手动换区；其他 AI、邮件、直连和 DNS/防泄漏策略保持，`VPS_URL` 为空。
- 2026-11-09 12:21 UTC+8 v9.5：Google 完整域名规则及现有本地兜底统一走 `🤖 AI`；补齐上次合并遗漏的版本元数据。仅本机填写 `VPS_URL` 后使用自建 VPS，仓库保持为空；客户端待实测。
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

- 2026-11-09 15:27 UTC+8 v9.6：新增 Google/YouTube/Gemini 共用选择组，默认引用原 AI/VPS，可手动换区；其他 AI、邮件、直连和 DNS/防泄漏策略保持，`VPS_URL` 为空。
- 2026-11-09 12:21 UTC+8 v9.5：Google 完整域名规则及现有本地兜底统一走 `🤖 AI`；补齐上次合并遗漏的版本元数据。仅本机填写 `VPS_URL` 后使用自建 VPS，仓库保持为空；客户端待实测。
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
