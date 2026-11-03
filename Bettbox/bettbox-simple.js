// ===== 精简全局覆写脚本 v1.0-simple (Bettbox / Mihomo, Windows TUN) =====
// 基于 bettbox-tun.js v7.9 精简：
//   1. 公司/内网域名直连，DNS 用 system（当前网络 DHCP 下发的 DNS，公司/家里自动切换，不写死 IP）。
//      局域网 / 私网 IP 直连。
//   2. 去掉 WhatsApp 分组与规则。
//   3. Foxmail 只走自建 VPS（节点名含 VM-7CF6BpQtoc）；当前订阅没有该节点时直接 REJECT，绝不走机场节点。
//   4. 中国域名 / IP 直连（MetaCubeX geosite/cn、geoip/cn .mrs），其余走「⚡ 节点选择」。
//   保留 WebRTC/STUN 防泄漏两条规则。
// Bettbox 设置：开启 TUN；关闭「覆写 DNS」（否则下方 dns 段会被 GUI DNS 替换）。
// 订阅需为内联节点（proxies）；自建 VPS 节点须在当前订阅中。

const PROXY = "⚡ 节点选择"
const MAIL = "📧 Foxmail"

// 机场信息类伪节点（剩余流量/到期等）不进主组
const NODE_FILTER =
    "(?i)(到期|剩余|过期|有效期|官网|官方|订阅|套餐|重置|流量|距离|网址|客服|expire|traffic|reset)"

// 自建 VPS 节点名关键字（只写名字，不含服务器/密钥）
const VPS_NODE_RE = /VM-7CF6BpQtoc/i

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
    const filterRe = new RegExp(NODE_FILTER.replace("(?i)", ""), "i")
    const names = (Array.isArray(config.proxies) ? config.proxies : [])
        .map((p) => p && p.name)
        .filter((n) => typeof n === "string" && !filterRe.test(n))
    const vpsNodes = names.filter((n) => VPS_NODE_RE.test(n))

    config["proxy-groups"] = [
        {
            name: PROXY,
            type: "select",
            "include-all": true,
            "exclude-filter": NODE_FILTER,
        },
        vpsNodes.length
            ? {
                  // 只含自建 VPS 节点，按顺序取第一个可用的
                  name: MAIL,
                  type: "fallback",
                  proxies: vpsNodes,
                  url: "https://www.gstatic.com/generate_204",
                  interval: 300,
                  timeout: 5000,
              }
            : {
                  // 当前订阅没有自建 VPS 节点：Foxmail 流量直接拒绝，不走机场
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
        ...COMPANY_DOMAINS.map((d) => "DOMAIN-SUFFIX," + d + ",DIRECT"),
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
    for (const d of COMPANY_DOMAINS) policy["+." + d] = "system"
    for (const d of lanDomains) policy[d] = "system"
    policy["rule-set:cn"] = "system"

    config.dns = {
        enable: true, // Bettbox 要求 true，否则用 GUI DNS 覆盖
        ipv6: false,
        "enhanced-mode": "fake-ip",
        "fake-ip-range": "198.18.0.1/16",
        "fake-ip-filter": [...COMPANY_DOMAINS.map((d) => "+." + d), ...lanDomains, "localhost"],
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
