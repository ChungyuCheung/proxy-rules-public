# proxy-rules-public

本仓库提供 mihomo 订阅覆写脚本和 Shadowrocket 分流配置。使用前请在对应客户端导入自己的节点或订阅。

| 配置 | 适用客户端 | 版本 | 下载与更新日志 |
| --- | --- | --- | --- |
| mihomo V3 TUN | Bettbox、Clash Verge Rev、FlClash | **v3.3.2** | [下载脚本](https://raw.githubusercontent.com/ChungyuCheung/proxy-rules-public/main/mihomo/tun-metacubex-v3.js) · [更新日志](mihomo/CHANGELOG.md) |
| Shadowrocket 完整版 | Shadowrocket（iOS） | **v6.15** | [下载配置](https://raw.githubusercontent.com/ChungyuCheung/proxy-rules-public/main/Shadowrocket/cy.conf) · [更新日志](Shadowrocket/CHANGELOG.md) |

## mihomo V3 TUN

### 导入并启用

1. 导入 Clash / mihomo 格式的节点订阅，并将它设为当前配置。
2. 把 `tun-metacubex-v3.js` 添加为该订阅的 JavaScript 覆写。

   | 客户端 | 操作 |
   | --- | --- |
   | Bettbox | 在「脚本」中用下载链接添加脚本，再到订阅卡片关联该脚本。关闭「覆写 DNS」。 |
   | Clash Verge Rev | 在「订阅」页右键目标订阅，打开「编辑扩展脚本」，粘贴下载链接指向的 JS 文件内容并保存。 [客户端文档](https://www.clashverge.dev/guide/extend.html) |
   | FlClash | 在「覆写」中新建脚本，可从下载链接导入。到目标订阅的覆写设置选中该脚本，关闭「覆写 DNS」和「追加系统 DNS」（如有）。 |

3. 启用 **TUN** 和**规则模式**，重新应用当前订阅。在「代理」页的 `⚡ Proxy` 选一个可用节点，确认客户端能下载 MetaCubeX MRS 规则集。

脚本会用自己的策略组和分流规则替换订阅中的对应内容。仅使用普通节点时，脚本顶部的三个数组可保持为空。

### 可选配置

在客户端的本地脚本副本中修改顶部同名变量。订阅地址和代理账号密码仅保存在本机，更新或重新导入脚本前先备份这些自定义项。

| 变量 | 填写内容 |
| --- | --- |
| `VPS_URLS` | 自建 VPS 的 Clash / mihomo 订阅，每条 URL 单独一项。节点可在 AI、邮件、Google 和住宅等业务组中选择。 |
| `IP_PROXIES` | 静态住宅或 ISP 代理。字符串格式为 `名称\|服务器:端口:用户名:密码`，默认 HTTP。用对象并填写 `type: "socks5"` 可指定 SOCKS5。脚本会添加 `🏠` 前缀，并默认绑定 `🔗 Relay` 为前置跳板。 |
| `RELAY_URLS` | 可选的备用机场订阅。新增订阅中的节点仅供 `🔗 Relay` 使用。留空时从当前订阅取候选。 |
| `RELAY_EXTRA_EXCLUDE` | 可选的跳板节点排除正则。用 `\|` 分隔多个节点名称片段，例如 `台湾C\|日本C`。 |

```js
const VPS_URLS = ["https://example.com/vps-subscription"]

const IP_PROXIES = [
    "US ISP|proxy.example.com:8080:username:password",
    { name: "JP ISP", type: "socks5", server: "jp.example.com", port: 1080, username: "username", password: "password" },
]

const RELAY_URLS = ["https://example.com/backup-subscription"]
const RELAY_EXTRA_EXCLUDE = ""
```

保存后重新应用订阅。如果在 Bettbox 只使用一份 VPS 订阅，可在该订阅卡片启用「托管模式」，取消关联本脚本。使用本脚本时，可把普通节点订阅设为当前配置，再通过 `VPS_URLS` 引入独立的 VPS 订阅。

## Shadowrocket 完整版

1. 在「配置」页点右上角「+」，粘贴 `cy.conf` 下载链接。下载后选中该配置。
2. 在首页导入自己的节点或订阅，选一个可用节点，将「全局路由」设为「配置」，然后连接。
3. 在首页导入或更新 VPS 订阅，确认节点已加载。静态 IP 可通过 **HTTP** 或 **SOCKS5** 添加，备注以 `🏠` 开头。需要前置跳板时，在节点的「代理链」选择 `🔗 Relay`。
4. 在 `🏠 Residential` 直接选择具体节点。让需要共用此出口的 AI、Google 或邮件组选择 `🏠 Residential`。从 v6.14 升级后重选一次出口。

更新时在「配置」页更新这份配置。自行编辑过 `cy.conf` 时，先备份本地修改。

## 策略组怎么选

| 策略组 | 用法 |
| --- | --- |
| `⚡ Proxy` | 日常外网出口。mihomo 在组内选节点，Shadowrocket 跟随首页当前节点。 |
| `🤖 AI` | ChatGPT、Claude 等 AI 服务。需要住宅出口时选 `🏠 Residential`，也可使用组内其他可用出口。 |
| `🌐 Google` | Google、YouTube、Gemini 等服务。如需与 AI 共用出口，手动选 `🤖 AI`。 |
| `📧 Foxmail` / `📧 Mail` | mihomo 的邮件组为 `📧 Foxmail`，Shadowrocket 为 `📧 Mail`。可选 `⚡ Proxy` 或 `🏠 Residential`。 |
| `🏠 Residential` | 在组内直接选择 VPS、静态 IP 或家宽节点。 |
| `🔗 Relay` | 为静态住宅代理提供第一跳，按节点名筛选候选并自动测速。走住宅链时，第二跳的住宅节点决定访问站点所用的出口。 |

## 验证与排查

- **看不到策略组**。先确认已激活目标订阅或配置。mihomo 客户端还要确认 JavaScript 已关联到当前订阅，再重新应用。
- **节点能测速，实际访问失败**。先检查 `⚡ Proxy` 和规则集下载状态。住宅链路还要检查 `🔗 Relay` 有没有符合筛选条件、支持二次转发的节点，以及住宅代理的地址和凭据是否正确。第一跳的测速结果只反映第一跳。
- **验证分流和出口**。用新连接访问目标服务，在客户端的连接记录里查实际命中的规则、策略组和节点。需要确认住宅出口时，通过同一策略组打开 IP 查询站点核对实际出口。
- **需要回退**。mihomo 客户端取消关联覆写脚本并重新应用订阅。Shadowrocket 切回先前使用的配置。

其他已发布配置可在 [mihomo](mihomo/)、[Shadowrocket](Shadowrocket/)、[Clash](Clash/) 和 [v2RayN](v2RayN/) 目录找到。日常更新集中在表中的两份配置。
