# proxy-rules-public

代理规则 / 配置的公开镜像，由私有仓库自动同步（只放去敏后的最新版），请勿直接修改。下面都是 raw 直链，可直接填进客户端。

通用：中国和内网域名走系统 DNS，外网用加密 DNS；已做 DNS / WebRTC 防泄漏；规则集在线更新。

## Shadowrocket（iPhone）

「配置」→ 右上角 + → 粘贴链接下载，然后选用。

- **cy.conf** — 完整版（L大 规则，在线更新）
  `https://raw.githubusercontent.com/ChungyuCheung/proxy-rules-public/main/Shadowrocket/cy.conf`
- **cy-simple.conf** — 简约版：内网直连、中国直连、其余代理
  `https://raw.githubusercontent.com/ChungyuCheung/proxy-rules-public/main/Shadowrocket/cy-simple.conf`

## Bettbox / Clash Verge Rev / FlClash（Windows / macOS / Android）

这几个 `.js` 是 mihomo 覆写脚本，三个客户端通用，选一个即可：

- **bettbox-tun.js** — 完整版（L大 规则），TUN 模式
  `https://raw.githubusercontent.com/ChungyuCheung/proxy-rules-public/main/Bettbox/bettbox-tun.js`
- **bettbox-system-proxy.js** — 完整版（L大 规则），系统代理模式（不开 TUN；浏览器 WebRTC 需另装防泄漏扩展）
  `https://raw.githubusercontent.com/ChungyuCheung/proxy-rules-public/main/Bettbox/bettbox-system-proxy.js`
- **bettbox-mrs.js** — 完整版（MetaCubeX .mrs 规则），TUN 模式，推荐
  `https://raw.githubusercontent.com/ChungyuCheung/proxy-rules-public/main/Bettbox/bettbox-mrs.js`
- **bettbox-simple.js** — 简约版：内网直连、中国直连、其余代理
  `https://raw.githubusercontent.com/ChungyuCheung/proxy-rules-public/main/Bettbox/bettbox-simple.js`

用法：
- **Bettbox**：订阅卡片「⋮」→ 覆写 / 脚本 → 用链接添加，挂到每个订阅；关闭「覆写 DNS」。不要用「配置 → 从 URL 导入」（那里只认 YAML）。
- **Clash Verge Rev**：订阅右键「编辑扩展脚本」或「全局扩展脚本」，粘贴脚本内容保存。
- **FlClash**：也用上面的 `.js` 脚本 —— 「工具 → 覆写 / 脚本」添加并在订阅上启用；关闭「覆写 DNS」和「追加系统 DNS」。
- 需要本机填写（不要提交）：脚本开头的 `VPS_URL`（自建 VPS 订阅，Foxmail 只走它，留空则拦截）；公司域名改 `COMPANY_DOMAINS`。

## Clash Verge Rev（其他）

- **cy-rules.js** — Clash Verge Rev 订阅覆写脚本（旧版通用脚本，新装建议用上面的 Bettbox 脚本）
  `https://raw.githubusercontent.com/ChungyuCheung/proxy-rules-public/main/Clash/APP/cy-rules.js`

## iPhone「Clash」App（mihomo 内核）

- **cy-clash-ios.yaml** — 完整配置，把 `https://your-subscription-url-1/2/3` 换成自己的订阅，用不到的删掉
  `https://raw.githubusercontent.com/ChungyuCheung/proxy-rules-public/main/Clash/iOS/cy-clash-ios.yaml`

## v2RayN

- **v6.2-20260901-v2rayN-Mixin.yaml** — v2RayN（mihomo 内核）Mixin 配置，文件名随版本更新
  `https://raw.githubusercontent.com/ChungyuCheung/proxy-rules-public/main/v2RayN/v6.2-20260901-v2rayN-Mixin.yaml`
