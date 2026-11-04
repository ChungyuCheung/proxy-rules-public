// ===== mihomo/lite-metacubex.js v1.13 | 简约版 + MetaCubeX 规则（mihomo 覆写脚本，TUN / 系统代理均可）=====
// 最后更新：2026-11-04 22:54 UTC+8
// 用途：内网/公司直连 + 系统 DNS；中国直连；其余走「⚡ 节点选择」；Foxmail 走自建 VPS（未填则走节点选择）。
// 通用：VPS 216.36.82.250 直连置顶；中国+内网=系统 DNS，外网=DoH 经代理；STUN 不回落直连；无 WhatsApp。
// 用法：Bettbox / Clash Verge Rev / FlClash 的「覆写/脚本」里用 raw 链接导入并挂到订阅；关闭「覆写 DNS」（FlClash 还要关「追加系统 DNS」）。
// 需填：VPS_URL（自建 VPS 订阅，仅本机填写，留空则 Foxmail 走「⚡ 节点选择」）；CUSTOM_DIRECT_DOMAINS（自己的内网域名）。
// 2026-11-04 v1.13：Foxmail 进程规则改为 AND,((PROCESS-NAME,Foxmail.exe),(NOT,((GEOIP,CN,no-resolve)))) ：只有目标非中国 IP 才走「📧 Foxmail」，中国 IP 落到后面的 cncidr/GEOIP,CN 直连。
// 2026-11-04 v1.12：synology.me 并入 COMPANY_DOMAINS（随公司块直连、走 system DNS），排在 Foxmail 规则之前，与其他脚本一致。
// 2026-11-04 v1.11：公司域名直连与国内邮箱直连合并为一块，置于 Foxmail 规则之前（原则：中国/公司流量永远优先直连，Foxmail 只接海外邮件）。
// 2026-11-04：my-vps 订阅经「⚡ 节点选择」下载；VPS_URL 留空时 Foxmail 跟随「⚡ 节点选择」；国内邮箱（88.com/qq/163 等）直连，置于 Foxmail 规则前。
// 2026-11-04：大航海机场订阅 IP 直连（面板拒绝代理连接），紧随 VPS 规则。
// 2026-11-04：VPS 的 SSH（22 端口）走节点选择（国内直连被阻断），VPS 其余流量仍直连。
// 2026-11-04：统一 no-resolve（GEOIP,CN 及含 IP 的规则集全部加 no-resolve，不再为判断 IP 而解析域名）；头部加最后更新时间。

// ==================== 仅在本机填写 ====================
// 把自建 VPS 的订阅链接（Clash/mihomo 格式）粘贴到下面引号里。
// - Foxmail 只会使用这个订阅里的全部节点（不按名字筛选，VPS 改名、换机器、换地址都不用改脚本）。
// - 留空：Foxmail 跟随「⚡ 节点选择」（机场节点）。
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
    "synology.me",
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
const DIRECT_PUBLIC_DNS_DOMAINS = [] // [v1.12] synology.me 已并入 COMPANY_DOMAINS，与其他脚本一致

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
            // [2026-11-04] 订阅经「⚡ 节点选择」（机场节点）下载：国内直连海外 VPS 的明文 http 常被重置（EOF）
            proxy: PROXY,
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
                  // 未填 VPS_URL：Foxmail 跟随「⚡ 节点选择」
                  name: MAIL,
                  type: "select",
                  proxies: [PROXY],
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
        ...MAIL_PROCESSES.map((p) => "AND,((PROCESS-NAME," + p + "),(NOT,((GEOIP,CN,no-resolve))))," + MAIL),
        ...MAIL_EXACT_DOMAINS.map((d) => "DOMAIN," + d + "," + MAIL),
        ...MAIL_SUFFIX_DOMAINS.map((d) => "DOMAIN-SUFFIX," + d + "," + MAIL),
        // 公司/内网域名直连
        ...INTRANET_DOMAINS.map((d) => "DOMAIN-SUFFIX," + d + ",DIRECT"),
        ...DIRECT_PUBLIC_DNS_DOMAINS.map((d) => "DOMAIN-SUFFIX," + d + ",DIRECT"),
        // 中国域名 / IP 直连
        "RULE-SET,cn,DIRECT",
        "RULE-SET,cncidr,DIRECT,no-resolve",
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
    return cyHarden20261103(config)
}

// =====================================================================
// [2026-11-03] 统一加固（所有 mihomo 脚本共用同一段，放在 main() 最后执行，覆盖前面的设置）
//   1) 自建 VPS IP 直连：IP-CIDR,216.36.82.250/32,DIRECT,no-resolve 放在第 1 条规则，
//      使用任何机场订阅时都能直接访问自己的 VPS（不经机场节点）。
//   2) WebRTC 防泄漏：STUN/TURN 端口（3478-3481、5349、19302-19309）先走代理，
//      节点不支持 UDP 时立即 REJECT，绝不回落 DIRECT（防止暴露真实公网 IP）。
//   3) DNS 防泄漏，统一规则：
//      - 中国域名 + 公司/内网域名 + .lan/.local → system（当前网络的系统 DNS，公司/家里自动切换，不写死 IP）
//      - 其余外网域名、以及 IP 规则需要的解析 → 外网加密 DoH（Google 8.8.8.8 / Cloudflare 1.1.1.1），经代理发出
//      - 删除 fallback（避免回落到明文/国内 DNS），fake-ip 模式，关闭 IPv6 解析
//      - 机场节点域名用加密 DoH（阿里 / 腾讯，按 IP 写），节点必须直连才能解析，所以不走代理
//   4) Foxmail（仅桌面脚本，脚本顶部有 VPS_URL 时生效）：只走 VPS_URL 里的自建 VPS 节点；VPS_URL 留空则跟随主选择组。
// =====================================================================
const CY_VPS_IP_RULE = "IP-CIDR,216.36.82.250/32,DIRECT,no-resolve"
// [2026-11-04] 大航海机场订阅面板 IP 直连（拒绝代理连接），紧随 VPS 规则
// [2026-11-04] VPS SSH(22) 例外：走主选择组，置于 VPS 直连规则之前
const CY_VPS_SSH_MATCH = "AND,((IP-CIDR,216.36.82.250/32,no-resolve),(DST-PORT,22))"
const CY_AIRPORT_IP_RULES = ["IP-CIDR,47.242.128.61/32,DIRECT,no-resolve"]
const CY_STUN_PORTS = "OR,((DST-PORT,3478-3481),(DST-PORT,5349),(DST-PORT,19302-19309))"
const CY_FOREIGN_DOH = ["https://8.8.8.8/dns-query", "https://1.1.1.1/dns-query"]
const CY_NODE_DOH = ["https://223.5.5.5/dns-query", "https://1.12.12.12/dns-query"]
const CY_MAIL = "📧 Foxmail"
// [2026-11-04] 国内邮箱服务器直连（置于 Foxmail 进程规则之前，修 88.com 等国内邮箱添加失败）；Gmail 仍走 Foxmail 组
const CY_CN_MAIL_DOMAINS = ["88.com", "email.cn", "qq.com", "foxmail.com", "exmail.qq.com", "163.com", "126.com", "yeah.net", "188.com", "netease.com", "qiye.163.com", "sina.com", "sina.cn", "sohu.com", "139.com", "189.cn", "wo.cn", "aliyun.com", "mxhichina.com", "qiye.aliyun.com", "263.net", "21cn.com", "tom.com"]

function cyHarden20261103(config) {
    let rules = Array.isArray(config.rules) ? config.rules.slice() : []
    // 去掉旧的 VPS IP 规则（可能没有 no-resolve 或位置靠后）
    rules = rules.filter((r) => !(typeof r === "string" && (/^IP-CIDR,(216\.36\.82\.250|47\.242\.128\.61)\/32,/.test(r) || /^AND,\(\(IP-CIDR,216\.36\.82\.250\//.test(r))))
    const matchRule = rules.find((r) => typeof r === "string" && /^MATCH,/.test(r))
    const groups = Array.isArray(config["proxy-groups"]) ? config["proxy-groups"] : []
    let proxy = matchRule ? matchRule.split(",")[1].trim() : ""
    if (!proxy || proxy === "DIRECT" || proxy === "REJECT") proxy = groups.length ? groups[0].name : "DIRECT"

    const head = [...(proxy && proxy !== "DIRECT" ? [CY_VPS_SSH_MATCH + "," + proxy] : []), CY_VPS_IP_RULE, ...CY_AIRPORT_IP_RULES]

    // ---- Foxmail 只走自建 VPS（仅当脚本定义了 VPS_URL 且还没有 Foxmail 组时由这里补上）----
    if (typeof VPS_URL !== "undefined" && !groups.some((g) => g && g.name === CY_MAIL)) {
        const vpsOn = typeof VPS_URL === "string" && VPS_URL.trim() !== ""
        if (vpsOn) {
            if (!config["proxy-providers"] || typeof config["proxy-providers"] !== "object" || Array.isArray(config["proxy-providers"])) {
                config["proxy-providers"] = {}
            }
            config["proxy-providers"]["my-vps"] = {
                type: "http",
                url: VPS_URL.trim(),
                // [2026-11-04] 订阅经主选择组（机场节点）下载，防国内直连 VPS 时 EOF
                ...(proxy && proxy !== "DIRECT" && proxy !== "REJECT" ? { proxy } : {}),
                interval: 86400,
                path: "./providers/my-vps.yaml",
                "health-check": { enable: true, url: "https://www.gstatic.com/generate_204", interval: 300 },
            }
            groups.push({ name: CY_MAIL, type: "fallback", use: ["my-vps"], url: "https://www.gstatic.com/generate_204", interval: 300, timeout: 5000 })
        } else {
            groups.push({ name: CY_MAIL, type: "select", proxies: [proxy && proxy !== "REJECT" ? proxy : "DIRECT"] })
        }
        config["proxy-groups"] = groups
        rules = rules.filter((r) => !(typeof r === "string" && /(Foxmail\.exe|imap\.gmail\.com|smtp\.gmail\.com|pop\.gmail\.com|googlemail\.com)/.test(r)))
        head.push(
            "AND,((PROCESS-NAME,Foxmail.exe),(NOT,((GEOIP,CN,no-resolve))))," + CY_MAIL,
            "DOMAIN,imap.gmail.com," + CY_MAIL,
            "DOMAIN,smtp.gmail.com," + CY_MAIL,
            "DOMAIN,pop.gmail.com," + CY_MAIL,
            "DOMAIN-SUFFIX,googlemail.com," + CY_MAIL
        )
        if (!config["find-process-mode"] || config["find-process-mode"] === "off") config["find-process-mode"] = "strict"
    }

    // ---- WebRTC/STUN（已有则不重复添加）----
    if (!rules.some((r) => typeof r === "string" && r.indexOf("3478") >= 0)) {
        head.push(CY_STUN_PORTS + "," + proxy, CY_STUN_PORTS + ",REJECT")
    }
    // ---- [2026-11-04] 原则：中国/公司流量永远优先直连；Foxmail 组只接剩下的海外邮件 ----
    // 公司域名（COMPANY_DOMAINS/INTRANET_DOMAINS/CUSTOM_DIRECT_DOMAINS）+ 国内邮箱合并为一个 DIRECT 区块，
    // 固定插在 SSH 例外、VPS IP、大航海 IP 之后，Foxmail/Gmail 规则之前；后面的重复规则删除。
    {
        const cyCo = []
        for (const list of [
            typeof COMPANY_DOMAINS !== "undefined" ? COMPANY_DOMAINS : [],
            typeof INTRANET_DOMAINS !== "undefined" ? INTRANET_DOMAINS : [],
            typeof CUSTOM_DIRECT_DOMAINS !== "undefined" ? CUSTOM_DIRECT_DOMAINS : [],
        ]) {
            if (Array.isArray(list)) for (const d of list) {
                const x = String(d).trim().replace(/^\+?\.|^\*\./, "").toLowerCase()
                if (x && cyCo.indexOf(x) < 0) cyCo.push(x)
            }
        }
        const hasFox = head.concat(rules).some((r) => typeof r === "string" && /PROCESS-NAME,Foxmail\.exe/.test(r))
        const block = [...cyCo, ...(hasFox ? CY_CN_MAIL_DOMAINS : [])].map((d) => "DOMAIN-SUFFIX," + d + ",DIRECT")
        const uniq = block.filter((r, i) => block.indexOf(r) === i)
        rules = rules.filter((r) => uniq.indexOf(r) < 0)
        head.splice(head.indexOf(CY_VPS_IP_RULE) + 1 + CY_AIRPORT_IP_RULES.length, 0, ...uniq)
    }
    config.rules = head.concat(rules)

    // ---- DNS ----
    const dns = Object.assign({}, config.dns || {})
    dns.enable = true
    dns.ipv6 = false
    dns["enhanced-mode"] = "fake-ip"
    if (!dns["fake-ip-range"]) dns["fake-ip-range"] = "198.18.0.1/16"
    dns["respect-rules"] = false
    const tag = proxy !== "DIRECT" ? "#" + proxy : ""
    dns.nameserver = CY_FOREIGN_DOH.map((u) => u + tag)
    delete dns.fallback
    delete dns["fallback-filter"]
    dns["direct-nameserver"] = ["system"]
    dns["direct-nameserver-follow-policy"] = false
    dns["default-nameserver"] = ["223.5.5.5", "119.29.29.29"] // 只用来解析 DoH 主机名；上面的 DoH 都按 IP 写，实际不会用到
    dns["proxy-server-nameserver"] = CY_NODE_DOH.slice()
    dns["use-system-hosts"] = true

    const intranet = []
    const lists = [
        typeof COMPANY_DOMAINS !== "undefined" ? COMPANY_DOMAINS : [],
        typeof INTRANET_DOMAINS !== "undefined" ? INTRANET_DOMAINS : [],
        typeof CUSTOM_DIRECT_DOMAINS !== "undefined" ? CUSTOM_DIRECT_DOMAINS : [],
    ]
    for (const list of lists) {
        if (Array.isArray(list)) for (const d of list) intranet.push(String(d).trim().replace(/^\+?\.|^\*\./, "").toLowerCase())
    }
    const policy = Object.assign({}, dns["nameserver-policy"] || {})
    for (const d of intranet) if (d) policy["+." + d] = "system"
    for (const d of ["+.lan", "+.local", "+.home.arpa", "+.internal", "+.cn"]) policy[d] = "system"
    // 中国域名用 system：脚本有 cn 规则集就用规则集，否则用 geosite:cn
    const providers = config["rule-providers"] || {}
    const cnSet = ["cn", "direct", "CY-ChinaMax_Domain", "ChinaMax"].find((k) => providers[k] && providers[k].behavior !== "ipcidr")
    if (cnSet) policy["rule-set:" + cnSet] = "system"
    else policy["geosite:cn"] = "system"
    for (const d of CY_CN_MAIL_DOMAINS) policy["+." + d] = "system"
    dns["nameserver-policy"] = policy

    const filter = Array.isArray(dns["fake-ip-filter"]) ? dns["fake-ip-filter"].slice() : []
    for (const item of [...intranet.filter(Boolean).map((d) => "+." + d), "+.lan", "+.local", "+.home.arpa", "localhost"]) {
        if (!filter.includes(item)) filter.push(item)
    }
    dns["fake-ip-filter"] = filter
    config.dns = dns
    config.ipv6 = false
    return config
}
