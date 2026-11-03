// ===== 精简全局覆写脚本 v1.2-simple (Bettbox / Mihomo, Windows TUN) =====
// 基于 bettbox-tun.js v7.9 精简：
//   1. 公司/内网域名直连，DNS 用 system（当前网络 DHCP 下发的 DNS，公司/家里自动切换，不写死 IP）。
//      局域网 / 私网 IP 直连。
//   2. 去掉 WhatsApp 分组与规则。
//   3. Foxmail 只走自建 VPS：在下方 VPS_URL 填自建 VPS 的订阅链接，脚本据此生成「📧 Foxmail」组；
//      不填则 Foxmail 流量直接 REJECT，绝不走机场节点。
//   4. 中国域名 / IP 直连（MetaCubeX geosite/cn、geoip/cn .mrs），其余走「⚡ 节点选择」。
//   保留 WebRTC/STUN 防泄漏两条规则。
// Bettbox 设置：开启 TUN；关闭「覆写 DNS」（否则下方 dns 段会被 GUI DNS 替换）。

// ==================== 仅在本机填写 ====================
// 把自建 VPS 的订阅链接（Clash/mihomo 格式）粘贴到下面引号里。
// - Foxmail 只会使用这个订阅里的全部节点（不按名字筛选，VPS 改名、换机器、换地址都不用改脚本）。
// - 留空：Foxmail 流量直接拒绝（REJECT），不会走机场节点。
// - 只在本机 Bettbox 的脚本里填写，切勿提交到 GitHub（公开仓库会泄露订阅）！
//   每次从链接更新本脚本后需要重新粘贴。
const VPS_URL = ""
// ======================================================

// ==================== 自定义内网域名（可自行添加）====================
// 在下面数组里加入你自己的内网/公司域名后缀（不要写 http:// 和路径），例如：
//   const CUSTOM_DIRECT_DOMAINS = ["mycorp.com", "intranet.example.cn", "corp"]
// 写 "mycorp.com" 会同时匹配 mycorp.com 和所有 *.mycorp.com。
// 加入后自动：直连 DIRECT + 用系统 DNS 解析（公司/家里自动切换）+ 不分配 fake-ip（返回真实地址）。
const CUSTOM_DIRECT_DOMAINS = []
// =================================================================

const PROXY = "⚡ 节点选择"
const MAIL = "📧 Foxmail"
const VPS_PROVIDER = "my-vps"

// 机场信息类伪节点（剩余流量/到期等）不进主组
const NODE_FILTER =
    "(?i)(到期|剩余|过期|有效期|官网|官方|订阅|套餐|重置|流量|距离|网址|客服|expire|traffic|reset)"


// Foxmail 进程与 Gmail 收发信服务器
const MAIL_PROCESSES = ["Foxmail.exe"]
const MAIL_EXACT_DOMAINS = ["imap.gmail.com", "smtp.gmail.com", "pop.gmail.com"]
const MAIL_SUFFIX_DOMAINS = ["googlemail.com"]

// 公司/内网域名：直连 + system DNS
const COMPANY_DOMAINS = [
    "huinor.com",
    "huitone.com",
    "kunyi-gzzc.com",
    "kunyi-gz.com",
    "kunqi-dev.com",
    "kunqi-demo.com",
    "kunqi-test.com",
    "kunyi-pro",
    "kunqi-gz",
    "jiandui.online",
    "ooioo.work",
]
// 默认公司域名 + 自定义内网域名（去重）
const INTRANET_DOMAINS = [...new Set([...COMPANY_DOMAINS, ...CUSTOM_DIRECT_DOMAINS]
    .map((d) => String(d).trim().replace(/^\+?\.|^\*\./, "").toLowerCase())
    .filter(Boolean))]

// 直连但走普通 DNS（Synology DDNS 是公网域名）
const DIRECT_PUBLIC_DNS_DOMAINS = ["synology.me"]

const LAN_CIDRS = [
    "127.0.0.0/8",
    "10.0.0.0/8",
    "172.16.0.0/12",
    "192.168.0.0/16",
    "100.64.0.0/10",
    "169.254.0.0/16",
]

// 标准 STUN/TURN 端口 + Google STUN 端口
const STUN_PORTS = "OR,((DST-PORT,3478-3481),(DST-PORT,5349),(DST-PORT,19302-19309))"

const MRS_BASE = "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo"

function main(config) {
    if (!config || typeof config !== "object") config = {}

    config["tcp-concurrent"] = true
    // PROCESS-NAME 需要进程匹配
    if (!config["find-process-mode"] || config["find-process-mode"] === "off") {
        config["find-process-mode"] = "strict"
    }

    // ---- 1. 分组 ----
    const vpsOn = typeof VPS_URL === "string" && VPS_URL.trim() !== ""
    if (vpsOn) {
        const pp = config["proxy-providers"]
        if (!pp || typeof pp !== "object" || Array.isArray(pp)) config["proxy-providers"] = {}
        config["proxy-providers"][VPS_PROVIDER] = {
            type: "http",
            url: VPS_URL.trim(),
            path: "./providers/my-vps.yaml",
            interval: 86400,
            "health-check": {
                enable: true,
                url: "https://www.gstatic.com/generate_204",
                interval: 300,
                timeout: 5000,
            },
        }
    }
    // 主组：机场节点；启用 my-vps 时不把 VPS 节点放进主组（订阅自带的其他 provider 仍保留）
    const otherProviders = Object.keys(config["proxy-providers"] || {}).filter((n) => n !== VPS_PROVIDER)
    const mainGroup = vpsOn
        ? {
              name: PROXY,
              type: "select",
              "include-all-proxies": true,
              ...(otherProviders.length ? { use: otherProviders } : {}),
              "exclude-filter": NODE_FILTER,
          }
        : { name: PROXY, type: "select", "include-all": true, "exclude-filter": NODE_FILTER }

    config["proxy-groups"] = [
        mainGroup,
        vpsOn
            ? {
                  // 只用 my-vps 订阅里的节点，按顺序取第一个可用的
                  name: MAIL,
                  type: "fallback",
                  use: [VPS_PROVIDER],
                  url: "https://www.gstatic.com/generate_204",
                  interval: 300,
                  timeout: 5000,
              }
            : {
                  // 未填 VPS_URL：Foxmail 流量直接拒绝，不走机场
                  name: MAIL,
                  type: "select",
                  proxies: ["REJECT"],
              },
    ]

    // ---- 2. 规则集 (MetaCubeX .mrs) ----
    const mrs = (behavior, kind, name) => ({
        type: "http",
        behavior,
        format: "mrs",
        url: MRS_BASE + "/" + kind + "/" + name + ".mrs",
        path: "./ruleset/meta/" + kind + "-" + name + ".mrs",
        interval: 86400,
        proxy: PROXY,
    })
    config["rule-providers"] = {
        cn: mrs("domain", "geosite", "cn"),
        cncidr: mrs("ipcidr", "geoip", "cn"),
    }

    // ---- 3. 规则 ----
    config.rules = [
        // 局域网 / 私网 IP 直连
        ...LAN_CIDRS.map((c) => "IP-CIDR," + c + ",DIRECT,no-resolve"),
        // WebRTC/STUN 防泄漏：先走节点，节点不支持 UDP 则拒绝，不落到 DIRECT
        STUN_PORTS + "," + PROXY,
        STUN_PORTS + ",REJECT",
        // Foxmail 只走自建 VPS
        ...MAIL_PROCESSES.map((p) => "PROCESS-NAME," + p + "," + MAIL),
        ...MAIL_EXACT_DOMAINS.map((d) => "DOMAIN," + d + "," + MAIL),
        ...MAIL_SUFFIX_DOMAINS.map((d) => "DOMAIN-SUFFIX," + d + "," + MAIL),
        // 公司/内网域名直连
        ...INTRANET_DOMAINS.map((d) => "DOMAIN-SUFFIX," + d + ",DIRECT"),
        ...DIRECT_PUBLIC_DNS_DOMAINS.map((d) => "DOMAIN-SUFFIX," + d + ",DIRECT"),
        // 中国域名 / IP 直连
        "RULE-SET,cn,DIRECT",
        "RULE-SET,cncidr,DIRECT",
        // 其余全部走代理
        "MATCH," + PROXY,
    ]

    // ---- 4. DNS ----
    const lanDomains = ["+.lan", "+.local", "+.home.arpa"]
    const policy = {}
    for (const d of INTRANET_DOMAINS) policy["+." + d] = "system"
    for (const d of lanDomains) policy[d] = "system"
    policy["rule-set:cn"] = "system"

    config.dns = {
        enable: true, // Bettbox 要求 true，否则用 GUI DNS 覆盖
        ipv6: false,
        "enhanced-mode": "fake-ip",
        "fake-ip-range": "198.18.0.1/16",
        "fake-ip-filter": [...INTRANET_DOMAINS.map((d) => "+." + d), ...lanDomains, "localhost"],
        "default-nameserver": ["223.5.5.5", "119.29.29.29"],
        nameserver: ["https://8.8.8.8/dns-query#" + PROXY, "https://8.8.4.4/dns-query#" + PROXY],
        "proxy-server-nameserver": ["223.5.5.5", "119.29.29.29"],
        "direct-nameserver": ["system"],
        "direct-nameserver-follow-policy": false,
        "nameserver-policy": policy,
        "use-system-hosts": true,
    }
    return config
}
