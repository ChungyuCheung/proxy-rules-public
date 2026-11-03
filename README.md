# proxy-rules-public

代理工具规则 / 配置文件的公开镜像，由私有仓库自动同步，请勿直接修改本仓库。

下载链接均为 raw 直链，可直接填入对应客户端。

所有文件统一：自建 VPS 216.36.82.250 直连；中国+内网域名用系统 DNS，外网用 DoH（mihomo 经代理）；WebRTC/STUN 不回落直连。

含 VPS_URL / 订阅占位的文件只在本机填写，切勿提交。

## Shadowrocket

- **Shadowrocket/cy-simple.conf** — Shadowrocket 精简配置：局域网/内网域名直连+系统 DNS、中国直连、其余代理（与 bettbox-simple.js 同逻辑，不含 Foxmail）

  https://raw.githubusercontent.com/ChungyuCheung/proxy-rules-public/main/Shadowrocket/cy-simple.conf

- **Shadowrocket/cy.conf** — Shadowrocket 完整版（Loyalsoldier L大 规则集远程拉取 + 自定义分流 + DNS），在 Shadowrocket「配置」里用此链接下载

  https://raw.githubusercontent.com/ChungyuCheung/proxy-rules-public/main/Shadowrocket/cy.conf

## Clash iOS (mihomo)

- **Clash/iOS/cy-clash-ios.yaml** — iPhone「Clash」App（mihomo 内核）完整配置，支持多个机场订阅（airport1~3），使用前把 https://your-subscription-url-1/2/3 换成自己的订阅链接，不用的删掉（固定链接）

  https://raw.githubusercontent.com/ChungyuCheung/proxy-rules-public/main/Clash/iOS/cy-clash-ios.yaml

## Clash Verge 覆写 / 脚本

- **Clash/APP/cy-rules.js** — iPhone「Clash」App / Clash Verge Rev 订阅覆写脚本（与 Shadowrocket cy.conf 同分流，固定链接）

  https://raw.githubusercontent.com/ChungyuCheung/proxy-rules-public/main/Clash/APP/cy-rules.js

## v2RayN

- **v2RayN/v6.2-20260901-v2rayN-Mixin.yaml** — v2RayN（mihomo 内核）Mixin 配置（最新版本，文件名随版本更新）

  https://raw.githubusercontent.com/ChungyuCheung/proxy-rules-public/main/v2RayN/v6.2-20260901-v2rayN-Mixin.yaml

## Bettbox

- **Bettbox/bettbox-mrs.js** — Bettbox / Clash Verge Rev / FlClash 完整版覆写脚本（TUN，MetaCubeX .mrs 规则集，Foxmail 只走自建 VPS：本机在 VPS_URL 填订阅，固定链接，推荐）

  https://raw.githubusercontent.com/ChungyuCheung/proxy-rules-public/main/Bettbox/bettbox-mrs.js

- **Bettbox/bettbox-simple.js** — Bettbox 精简覆写脚本：内网域名直连+系统 DNS、Foxmail 只走自建 VPS（本机在 VPS_URL 填订阅）、中国直连其余代理（.mrs 规则集，固定链接）

  https://raw.githubusercontent.com/ChungyuCheung/proxy-rules-public/main/Bettbox/bettbox-simple.js

- **Bettbox/bettbox-tun.js** — Bettbox / Clash Verge Rev / FlClash 完整版覆写脚本（TUN，Loyalsoldier L大 规则集，Foxmail 只走自建 VPS：本机在 VPS_URL 填订阅，固定链接）

  https://raw.githubusercontent.com/ChungyuCheung/proxy-rules-public/main/Bettbox/bettbox-tun.js
