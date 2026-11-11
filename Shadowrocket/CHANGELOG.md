# Shadowrocket 更新日志

## 2026-11-11 18:00 UTC+8：两台 VPS 可独立手选

- cy.conf v5.34、cy-simple.conf v1.28：邮件、AI、Google 均为 select，名称筛选统一为 NovixLink / Webshare（忽略大小写、排除信息节点）。精简版邮件/AI 原本可选所有节点，本次收紧为两种 VPS 名称。
- 各组可直接选具体 VPS 节点，或选共用的「♻️ VPS 自动」url-test 组（300 秒检查）；三个组均选自动时共用同一自动出口。手选具体节点可固定出口。
- 先在客户端首页导入两份订阅。Webshare-Private 是原订阅策略组，不是第三个节点；实际 Webshare 节点为两条。仓库不写订阅 URL。
- 名称筛选和选项结构测试通过；iPhone 实机连通性与配置导入仍待验证。

## 2026-11-11 17:00 UTC+8：RackNerd VPS 直连

- `cy.conf v5.33`、`cy-simple.conf v1.27`：新增 `IP-CIDR,192.3.153.152/32,DIRECT,no-resolve`（含 SSH），位于自建 VPS 直连之后、大航海面板之前；经机场节点连接其 SSH 会被断开。分组与 DNS 设置不变。

## 2026-11-11 10:00 UTC+8：补充 ambersearch.de

- `cy.conf v5.32`、`cy-simple.conf v1.26`：新增 `DOMAIN-SUFFIX,ambersearch.de,🤖 AI`，覆盖主域名及全部子域名，位于远程 AI 列表与通用代理规则之前；分组与 DNS 设置不变。

## 2026-11-10 23:48 UTC+8：补充 amber.de 与 exaone.ai 本地 AI 后缀规则

- `cy.conf v5.31`、`cy-simple.conf v1.25`：MetaCubeX `category-ai-!cn.list` 暂未收录 `amber.de` 与 `exaone.ai`，已在两份配置的本地 AI 规则区补充 `DOMAIN-SUFFIX,amber.de,🤖 AI` 与 `DOMAIN-SUFFIX,exaone.ai,🤖 AI`，位于远程 AI 列表与通用代理规则之前。

## 2026-11-10 00:57 UTC+8：显式补齐 Gemini 移动端与共享登录接口

- `cy.conf v5.30`、`cy-simple.conf v1.24`：补齐 Bard、移动端语音、Play/API、共享账号鉴权与图片/静态资源显式规则，统一走原 `🌐 Google`，置于宽泛 AI 分类与可选广告规则之前。
- 用户清单中的域名原本已被 Google 后缀规则覆盖，新增精确条目用于清晰维护与优先级保护，不能据此确认手机故障原因。
- 保留 Google 独立 NovixLink VPS 分组，并标注首页台湾节点不会改变此组出口。保持 WeatherKit 路由/重写、MITM、IPv6 与 block-quic 设置；不添加 no-resolve 域名参数、宽泛关键字或新模块。
- 本地校验配置中的规则顺序与分组；实际 Gemini/Live 仍需手机核对新连接记录。

## 2026-11-09 15:41 UTC+8：Google 改为单层独立 VPS 分组

- `cy.conf v5.29`：Google 与邮件、AI 并列，使用相同的 NovixLink 筛选与 URL 测试参数，独立自动选择 VPS 协议节点。
- `cy-simple.conf v1.23`：Google 保留单层手选，只纳入 NovixLink VPS 节点；原 AI/邮件手选组保持。
- 删除 `🌐 Google 节点` 子组及 Google 到 AI/PROXY/节点池的嵌套选择；需要其他地区出口时使用其他配置文件。
- Google / YouTube / Gemini 继续共用 Google 组；规则、DNS、邮件、其他 AI 和公司/国内直连均未改动，不嵌入私密订阅。

## 2026-11-09 15:27 UTC+8：Google 公司出口可手动切换

- Google / YouTube / Gemini 共用新增 `🌐 Google` 选择组，初始首选原 `🤖 AI`；本机已配置 VPS 时默认走 VPS，仓库的 `VPS_URL` 保持为空。
- 可在公司组选择主代理或其他节点，切换 Google 出口时其他 AI 与邮件仍使用原组。Gemini 主程序和辅助进程统一进入 Google 组。
- MetaCubeX google / google-deepmind / youtube 分类与本地兜底配合，Google AI 分类先于宽泛 AI 分类；完整脚本的普通 Google 兜底保留原广告拦截优先级。
- 其他 AI（含 Grok）、邮件、公司/国内明确直连、DNS 和 WebRTC/QUIC 设计保持。邮件、明确直连与其他独立进程仍是优先例外；纯 IP、未收录域名和已建立连接需在客户端另行验证。

## 2026-11-09：Google 全域名统一固定 VPS 出口（客户端待实测）

- 版本：`cy.conf v5.27`、`cy-simple.conf v1.21`；头部与 `#!name` 一致，最后更新时间统一为 `2026-11-09 12:21 UTC+8`。
- 补齐已合并 Google 分流改动遗漏的版本元数据及说明；本次不再修改配置项或规则，不嵌入私密订阅。
- `cy.conf`、`cy-simple.conf`：在 AI 规则后增加 Google 常用域名本地兜底及 MetaCubeX `classical/google.list`，统一发送到现有 `🤖 AI` 分组。
- `cy.conf`：原 Loyalsoldier `google.txt` 子集的策略由 `PROXY` 调整为 `🤖 AI`，避免旧规则从常规代理组访问 Google。
- 保留邮件独立组、其他海外网站主代理组、中国/公司直连及既有 DNS/QUIC 设置。简约版仍需手动选择 NovixLink VPS 节点。
- 远程规则仅覆盖规则集已收录的 Google 域名；不保证 IP 直连或所有第三方嵌入服务统一出口。需要客户端实测。

本文件记录本目录配置的历史变更，按来源文件分节。历史记录描述当时的修改，当前行为以对应配置为准。后续更新在这里补充，不再累积到配置注释中。

## 2026-11-05 日志整理

- 将三份配置中的头部历史及行内版本、日期记录迁移到本文件；保留用途、使用方法和当前逻辑说明。
- 本次只整理注释，配置内容和功能版本号保持不变。

## cy.conf

### 2026-11-09 15:41 UTC+8 v5.29

- Google 简化为与邮件、AI 并列的独立 VPS 分组；移除节点池与嵌套选择，规则和其他分组保持。

### 2026-11-09 15:27 UTC+8 v5.28

- 新增 Google 公司选择组及独立节点池，Google/YouTube/Gemini 共用出口；默认首选原 AI，其他 AI 与邮件原组保持；不嵌入私密订阅。

### 2026-11-09 12:21 UTC+8 v5.27

- Google 常用域名兜底及完整 `google.list` 统一走 `🤖 AI`；补齐上次合并遗漏的头部版本、`#!name` 和最后更新时间，客户端待实测。

### 2026-11-06 v5.26

- 新增 `DOMAIN,http-intake.logs.us5.datadoghq.com,🤖 AI`，让指定 Claude 日志入口与 Claude 共用 AI 出口；只匹配此完整域名。
- 核对 `api.anthropic.com`、`bridge.claudeusercontent.com`、`downloads.claude.ai`、`platform.claude.com`：已分别被现有 `anthropic.com`、`claudeusercontent.com`、`claude.ai`、`claude.com` 后缀规则覆盖，继续走「🤖 AI」。

### 2026-11-06 v5.25

- 删除 MEXC / Bybit（含欧盟站及相关 API / CDN）共 43 条专用域名规则；交易所按通用分流处理，未命中其他规则时由 `FINAL,PROXY` 兜底。
- 更新配置说明和章节编号；PayPal 仍保留原有支付服务规则。
- 补充 Mistral 拦截排查：去广告模块规则优先于配置文件；模块中的 `ad*` 拦截需要在模块内删除或停用，单改 `cy.conf` 不能覆盖。

### 2026-11-06 v5.24

- 排查 `admin.mistral.ai`：配置没有 `ad*` 通配符拦截，`mistral.ai` 已优先匹配到「🤖 AI」；可选广告规则集继续默认关闭。
- 删除 `weixin`、`wechat`、`qpic` 三条宽泛关键词直连规则，保留现有明确域名后缀，避免无关域名仅因包含这些字符而提前直连。
- 删除 `mexc`、`bytick`、`bybit` 三条宽泛关键词代理规则，保留现有交易所域名后缀和精确域名。
- 补充广告规则维护说明：避免使用 `ad*` 等前缀一刀切拦截，启用广告列表时保持业务域名优先。

### 原头部更新记录

- 最新改动 2026-11-05 v5.23：邮件与 AI 改为自动测速组，只纳入名称含 NovixLink 的自建 VPS 节点（排除信息节点），每 300 秒测试并选择延迟最低的节点。
- 2026-11-05 v5.22：Google 账号登录域名 accounts.google.com 精确匹配并走 AI 组。
- 2026-11-05 v5.21：新增手选组「🤖 AI」（与「📧 邮件」一致，排除信息节点，手动选自建 VPS 节点）；# 4) AI 服务静态域名改走「🤖 AI」，并挂载 MetaCubeX 每日自动更新的 category-ai-!cn.list 纯域名规则集（无 IP 规则，不触发本地 DNS）。
- 2026-11-05 v5.20：新增手选组「📧 邮件」（排除信息节点，手动选自建 VPS 节点）；imap / smtp / pop.gmail.com → 📧 邮件，放在 VPS / 腾讯 ASN 规则之后、其余规则之前。
- 2026-11-05 v5.19：删除交易所专用手选组；MEXC / Bybit / PayPal 共 49 条规则改走 PROXY（跟随首页手选节点）。
- 2026-11-05 v5.18：交易所专用组的信息节点排除再加 更新|提醒|订阅|訂閱。
- 2026-11-05 v5.17：精简——删除 99 条与 Loyalsoldier direct.txt 重复的国内直连域名（保留微信/支付宝/淘宝等后备）；MEXC/Bybit/PayPal 改走新的交易所专用手选组（排除中国与美国节点），删除菲律宾/欧盟/台湾/英国/Bybit 旧组；[Host] 补微信/支付宝/淘宝系统 DNS。
- 2026-11-05 v5.16：GEOIP,CN 去掉 no-resolve→`GEOIP,CN,DIRECT`（v5.15 用 no-resolve 实测仍让微信纯 IP 连接落 FINAL；去掉后直连，实测无 DNS / WebRTC 泄漏）；IP-ASN 不变。
- 2026-11-04 v5.15：微信慢修复——加腾讯 IP-ASN 45090/132203 直连（no-resolve），FINAL 前加回 GEOIP,CN,DIRECT,no-resolve（只对纯 IP 连接生效，不触发 DNS）。
- 2026-11-04 v5.14：修正过时注释（DNS 说明、仓库地址）；头部加最后更新时间。规则不变。
- 2026-11-04 v5.13：DNS 防泄漏——删除 GEOIP,CN（会触发本地解析）；DoH 列表去空格按文档写法。
- 2026-11-04 v5.12：DNS 防泄漏——删除 IP 列表规则集（cncidr/telegramcidr），避免规则匹配时本地解析域名；中国 IP 仍由 GEOIP,CN 直连。
- 2026-11-04 v5.11：DNS 防泄漏——bypass-tun/规则去掉 198.18.0.0/15（Fake-IP 与 TUN DNS 网段），dns-direct-system 关闭。
- 2026-11-04 v5.10：DNS 防泄漏——海外 DoH 经代理(#proxy)查询，备用也经代理，禁止回退系统 DNS。
- 2026-11-04 v5.9：DNS 防泄漏——IP 规则全加 no-resolve，外网 DoH 改 1.1.1.1/8.8.8.8，去掉国内 DoH。
- 2026-11-04 v5.8：VPS 的 SSH（22 端口）走 PROXY，其余仍直连。
- 2026-11-04 v5.7：大航海机场订阅 IP 直连。
- 2026-11-03 v5.6：DNS 恢复 system 优先，修复节点全部超时；规则集改 Loyalsoldier、VPS IP 直连置顶、外网 DoH。历史版本见私有仓库 git 记录。

### 原行内版本与日期说明

- [v5.23] 只按节点名称中的 NovixLink 筛选自建 VPS（忽略大小写），并排除信息节点；节点须已导入 Shadowrocket 首页。
- [2026-11-03] 自建 VPS IP 直连（必须放在第 1 条，no-resolve），使用任何机场订阅时都能直连 VPS
- [2026-11-04] VPS SSH(22) 例外：国内直连被阻断，走 PROXY（须在 VPS 直连之前）
- [2026-11-04] 大航海机场订阅面板 IP 直连（拒绝代理连接）
- [2026-11-04] 腾讯（微信）IP 直连：微信常用 IP 直连（无域名），否则落 FINAL 走代理导致「收取中」慢；no-resolve，域名请求跳过、不触发 DNS
- [v5.20] Gmail 收发信服务器 → 📧 邮件（部分机场节点封邮件端口）；须在 google / proxy 规则集之前
- [v5.21] MetaCubeX 每日自动更新的海外 AI 域名规则集（纯域名 classical 列表，无 IP 规则，不触发本地 DNS 解析）
- [2026-11-03] 改用 Loyalsoldier（L大）surge-rules，GitHub raw release 分支，每日自动更新
- [2026-11-03] 替换原 blackmatrix7 Apple/ChinaMax/Global 列表，顺序同 Loyalsoldier README 白名单模式。
- [2026-11-03] 中国 .cn 域名用系统 DNS
- [v5.17] 国内常用 App 后备域名：系统 DNS（与 [Rule] 后备直连一致）

## cy-simple.conf

### 2026-11-09 15:41 UTC+8 v1.23

- Google 简化为与邮件、AI 并列的独立 VPS 分组；移除节点池与嵌套选择，规则和其他分组保持。

### 2026-11-09 15:27 UTC+8 v1.22

- 新增 Google 公司选择组及独立节点池，Google/YouTube/Gemini 共用出口；默认首选原 AI，其他 AI 与邮件原组保持；不嵌入私密订阅。

### 2026-11-09 12:21 UTC+8 v1.21

- Google 常用域名兜底及完整 `google.list` 统一走 `🤖 AI`；补齐上次合并遗漏的头部版本、`#!name` 和最后更新时间，客户端待实测。

### 2026-11-06 v1.20

- 与完整版一致，补充指定日志域名 `http-intake.logs.us5.datadoghq.com` 的 AI 精确分流。
- 核对 Claude API、Bridge、下载和平台域名均由现有本地后缀规则匹配到「🤖 AI」，无需依赖远程 AI 列表。

### 2026-11-06 v1.19

- 为 Mistral、ChatGPT、Claude、Gemini / AI Studio / NotebookLM、Grok、Copilot、Perplexity、OpenRouter 的常用域名补充本地 AI 分流规则，置于远程规则集之前。
- 远程 AI 列表下载失败时，已列出的服务域名仍匹配「🤖 AI」，避免落入常规代理或后续直连规则；远程列表继续补充其他域名。
- 使用精确域名或带域名边界的后缀匹配，避免 `ad*` 前缀误杀与关键词误匹配。

### 原头部更新记录

- 最新改动 2026-11-05 v1.18：Google 账号登录域名 accounts.google.com 精确匹配并走 AI 组。
- 2026-11-05 v1.17：新增手选组「🤖 AI」（与 cy.conf v5.21 相同）；挂载 MetaCubeX 每日更新的 category-ai-!cn.list 规则集走「🤖 AI」。
- 2026-11-05 v1.16：新增手选组「📧 邮件」（与 cy.conf v5.20 相同）；imap / smtp / pop.gmail.com → 📧 邮件，放在 VPS / 腾讯 ASN 规则之后、其余规则之前。
- 2026-11-05 v1.15：加微信/支付宝/淘宝等后备直连域名与对应 [Host] 系统 DNS（与 cy.conf v5.17 一致）；其余不变。
- 2026-11-05 v1.14：GEOIP,CN 去掉 no-resolve→`GEOIP,CN,DIRECT`（v5.15 用 no-resolve 实测仍让微信纯 IP 连接落 FINAL；去掉后直连，实测无 DNS / WebRTC 泄漏）；IP-ASN 不变。
- 2026-11-04 v1.13：微信慢修复——加腾讯 IP-ASN 45090/132203 直连（no-resolve），FINAL 前加回 GEOIP,CN,DIRECT,no-resolve（只对纯 IP 连接生效，不触发 DNS）。
- 2026-11-04 v1.12：修正过时注释（DNS 说明、仓库地址）；头部加最后更新时间。规则不变。
- 2026-11-04 v1.11：DNS 防泄漏——删除 GEOIP,CN（会触发本地解析）；DoH 列表去空格按文档写法。
- 2026-11-04 v1.10：DNS 防泄漏——删除 IP 列表规则集（cncidr），避免规则匹配时本地解析域名；中国 IP 仍由 GEOIP,CN 直连。
- 2026-11-04 v1.9：DNS 防泄漏——dns-direct-system 关闭。
- 2026-11-04 v1.8：DNS 防泄漏——海外 DoH 经代理(#proxy)查询，备用也经代理，禁止回退系统 DNS。
- 2026-11-04 v1.7：DNS 防泄漏——IP 规则全加 no-resolve，外网 DoH 改 1.1.1.1/8.8.8.8，去掉国内 DoH。
- 2026-11-04 v1.6：VPS 的 SSH（22 端口）走 PROXY，其余仍直连。
- 2026-11-04 v1.5：大航海机场订阅 IP 直连。
- 2026-11-03 v1.4：DNS 恢复 system 优先，修复节点全部超时；VPS IP 直连置顶、外网 DoH、block-quic。历史版本见私有仓库 git 记录。

### 原行内版本与日期说明

- [2026-11-03] 走代理的连接屏蔽 QUIC（UDP 443），强制回落 TCP，防止 UDP 绕行
- [v1.16] 邮件专用手选组：订阅全部节点（排除信息节点），在 App 里手动选一次自建 VPS 节点；iPhone 邮件 App 收 Gmail 用
- [v1.17] AI 专用手选组：订阅全部节点（排除信息节点），在 App 里手动选一次自建 VPS 节点；海外 AI 服务专用
- [2026-11-03] 自建 VPS IP 直连（必须放在第 1 条，no-resolve），使用任何机场订阅时都能直连 VPS
- [2026-11-04] VPS SSH(22) 例外：国内直连被阻断，走 PROXY（须在 VPS 直连之前）
- [2026-11-04] 大航海机场订阅面板 IP 直连（拒绝代理连接）
- [2026-11-04] 腾讯（微信）IP 直连：微信常用 IP 直连（无域名），否则落 FINAL 走代理导致「收取中」慢；no-resolve，域名请求跳过、不触发 DNS
- [v1.16] Gmail 收发信服务器 → 📧 邮件（部分机场节点封邮件端口）；须在其余规则之前
- [v1.15] 国内常用 App 后备直连（direct.txt 下载失败时仍直连；与 cy.conf v5.17 一致）
- 2.5) [v1.17] 海外 AI 服务 → 🤖 AI（MetaCubeX 每日自动更新纯域名规则集，不触发本地 DNS）
- [2026-11-03] 改为 GitHub raw（release 分支）拉取：不再用 jsDelivr @release 缓存，避免规则停更
- [2026-11-03] 中国 .cn 域名用系统 DNS
- [v1.15] 国内常用 App 后备域名：系统 DNS

## cy.conf.bak-20261014-udp

### 原头部更新记录

- v5.3.1: 直连 DNS 和备用 DNS 都锁定 system，避免直连域名回落到公网 DNS 并发。
- v5.3: 公司域名由 [Host] 锁定系统 DNS，允许私网地址，解析失败不回落代理 DNS。
- v5.2: Bybit 欧盟拆开，国内 App 提前直连，地区组回落 PROXY，UDP 不支持改直连。

