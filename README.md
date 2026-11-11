# proxy-rules-public

代理规则 / 配置的公开镜像，由私有仓库按白名单原样同步（不自动脱敏，源文件不得填写私密订阅），请勿直接修改。下面都是 raw 直链，可直接填进客户端。

通用：中国和内网域名走系统 DNS，外网用加密 DNS；已做 DNS / WebRTC 防泄漏；规则集在线更新。

## Shadowrocket（iPhone）

「配置」→ 右上角 + → 粘贴链接下载，然后选用。

- **cy.conf** — 完整版（L大 + MetaCubeX，邮件/AI/Google 纯手选 NovixLink / Webshare，无自动切换）
  `https://raw.githubusercontent.com/ChungyuCheung/proxy-rules-public/main/Shadowrocket/cy.conf`
- **cy-simple.conf** — 简约版：内网/中国直连，邮件/AI/Google 独立手选 VPS，无自动组
  `https://raw.githubusercontent.com/ChungyuCheung/proxy-rules-public/main/Shadowrocket/cy-simple.conf`

## mihomo 覆写脚本：Bettbox / Clash Verge Rev / FlClash（Windows / macOS / Android）

同为 mihomo 内核，三个客户端通用，直接用 raw 链接导入。文件名 = 代理模式-规则集，选一个即可：

- **tun-metacubex.js** — TUN 模式 + MetaCubeX .mrs 规则（推荐）
  `https://raw.githubusercontent.com/ChungyuCheung/proxy-rules-public/main/mihomo/tun-metacubex.js`
- **tun-loyalsoldier.js** — TUN 模式 + Loyalsoldier（L大）规则
  `https://raw.githubusercontent.com/ChungyuCheung/proxy-rules-public/main/mihomo/tun-loyalsoldier.js`
- **sysproxy-metacubex.js** — 系统代理模式 + MetaCubeX .mrs 规则（不开 TUN；浏览器 WebRTC 需另装防泄漏扩展）
  `https://raw.githubusercontent.com/ChungyuCheung/proxy-rules-public/main/mihomo/sysproxy-metacubex.js`
- **sysproxy-loyalsoldier.js** — 系统代理模式 + Loyalsoldier（L大）规则（不开 TUN；浏览器 WebRTC 需另装防泄漏扩展）
  `https://raw.githubusercontent.com/ChungyuCheung/proxy-rules-public/main/mihomo/sysproxy-loyalsoldier.js`
- **lite-metacubex.js** — 简约版：内网直连、中国直连、其余代理（TUN / 系统代理均可）
  `https://raw.githubusercontent.com/ChungyuCheung/proxy-rules-public/main/mihomo/lite-metacubex.js`

用法：
- **Bettbox**：订阅卡片「⋮」→ 覆写 / 脚本 → 用链接添加，挂到每个订阅；关闭「覆写 DNS」。不要用「配置 → 从 URL 导入」（那里只认 YAML）。
- **Clash Verge Rev**：订阅右键「编辑扩展脚本」或「全局扩展脚本」，粘贴脚本内容保存。
- **FlClash**：同样用上面 `mihomo/` 里的 `.js` 脚本 ——「工具 → 覆写 / 脚本」添加并在订阅上启用；关闭「覆写 DNS」和「追加系统 DNS」。
- 邮件 / AI / Google 均为纯手选 select，选择具体 NovixLink / Webshare 节点；没有 VPS 自动回退或自动测速组。节点故障不会自动换节点，实际出口 IP 仍取决于上游。
- Bettbox 使用机场订阅时，仅在本机脚本副本填写 VPS_URL / VPS_URL_2 两台 VPS 的 Clash/mihomo 订阅；仓库保持为空。直接使用 VPS 订阅卡片时可留空。独立卡片不会自动合并，点击从链接更新脚本会覆盖本地填写值。Shadowrocket 先在首页导入两份订阅，再手选节点。
- Google/YouTube/Gemini 共用「🌐 Google」；Mihomo 的 Google 可手动跟随 AI。业务组选「⚡ 节点选择」会跟随日常主组，想保持 VPS 出口请选具体节点。切换后检查新连接的实际出口；provider 健康检查不会替手选组切换节点。
- Shadowrocket 的「⚡ 节点选择」仅含 PROXY，始终跟随首页节点，不再列出其他候选；更换普通节点请在首页选择。邮件 / AI / Google 可手动跟随节点选择，也可直接选 VPS。没有故障自动回退。
- 旧链接 `Bettbox/bettbox-*.js` 已停用，请改用上面 `mihomo/` 的新地址重新导入（tun→tun-loyalsoldier，mrs→tun-metacubex，system-proxy→sysproxy-loyalsoldier，simple→lite-metacubex）。

## Clash Verge Rev（其他）

- **cy-rules.js** — Clash Verge Rev 订阅覆写脚本（旧版通用脚本，新装建议用上面的 mihomo 脚本）
  `https://raw.githubusercontent.com/ChungyuCheung/proxy-rules-public/main/Clash/APP/cy-rules.js`

## iPhone「Clash」App（mihomo 内核）

- **cy-clash-ios.yaml** — 完整配置，把 `https://your-subscription-url-1/2/3` 换成自己的订阅，用不到的删掉
  `https://raw.githubusercontent.com/ChungyuCheung/proxy-rules-public/main/Clash/iOS/cy-clash-ios.yaml`

## v2RayN

- **v6.2-20260901-v2rayN-Mixin.yaml** — v2RayN（mihomo 内核）Mixin 配置，文件名随版本更新
  `https://raw.githubusercontent.com/ChungyuCheung/proxy-rules-public/main/v2RayN/v6.2-20260901-v2rayN-Mixin.yaml`

## 更新日志

历史更新记录集中在各目录的 CHANGELOG.md，脚本中只保留当前说明。

- [Shadowrocket 更新日志](Shadowrocket/CHANGELOG.md)
- [mihomo 更新日志](mihomo/CHANGELOG.md)
- [Clash App 更新日志](Clash/APP/CHANGELOG.md)
- [Clash iOS 更新日志](Clash/iOS/CHANGELOG.md)
- [v2RayN 更新日志](v2RayN/CHANGELOG.md)
