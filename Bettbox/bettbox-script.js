// ===== Loyalsoldier 全局覆写脚本 v7.1-bettbox (Clash Verge / Mihomo / Bettbox) =====
// [2026-11-03] 统一加固（见文件末尾 cyHarden20261103）：216.36.82.250 自建 VPS 直连置顶；
//        WebRTC/STUN 先代理后 REJECT；DNS：中国+内网=system，外网=Google/Cloudflare DoH 经代理，删除 fallback；
//        新增 VPS_URL：Foxmail 只走自建 VPS，留空则 REJECT；规则集改 GitHub raw 拉取。
// [bettbox] Bettbox 1.19.3 以 main(config) 调用 (QuickJS)，原脚本无需改签名。
// [bettbox] 使用本脚本时请关闭 Bettbox「覆写 DNS」，否则下方 dns 段会被 GUI DNS 整体替换。
// [bettbox] 改动: dns.enable 强制 true (避免订阅 enable:false 触发 Bettbox 替换 DNS);
//           公司域名写入 nameserver-policy=system (替代 GUI 里的 +.huitone.com=system)。
//           direct-nameserver-follow-policy=false：直连解析使用 system，不受其他 DNS 策略改道。
// [v6.9] 完整重建 DNS，移除订阅遗留策略/fallback；直连使用当前系统 DNS。
//        删除 v6.8 无效的 dns.hosts 固定地址补丁，适应公司/家庭网络切换。
// [v6.8] 918.huinor.com 系统解析失败，直接使用 ping 得到的内网地址。
// [v6.7] 启用 use-system-hosts，允许读取系统 hosts 文件。
// [v6.6] 规则集改经节点下载。直连 GitHub / jsDelivr 都会 EOF。
// [v6.5] 直连、内网和国内域名改用 DHCP DNS（dhcp://），不再依赖 system 解析。
// [v6.4] 规则集改走 GitHub raw，并强制 DIRECT 下载，避开 jsDelivr 的 EOF / bad record MAC。
// [v6.3] 规则集 CDN 从 testingcf.jsdelivr.net 改为 cdn.jsdelivr.net，避开 tls: bad record MAC。
// [v6.2] 增加高优先级 CUSTOM_RULES 区域，集中维护被远程规则集误伤的自定义规则。
// [v6.1] IPPure 与其出口 IP 探测域名强制走所选节点，避免探测失败后显示占位 IP 8.8.8.8。
// [v5.9] 精确 Microsoft 登录域 (login.live.com 等 + msauth* 后缀) 强制 DIRECT，修复 0x80190001。
//        移除宽泛 windows.net 规则。
// 核心: 单手动节点组 + Loyalsoldier rulesets + 公司/MS-auth/Windows 优先 DIRECT +
//       Google/YouTube/Discord 强制代理 + 仅Google QUIC阻断 + fake-ip + system直连DNS
// 备注: Store 问题通常是 UWP loopback，与规则无关 (见 README)。
const PROXY = "⚡ 节点选择"

// ==================== [2026-11-03] Foxmail 自建 VPS（仅在本机填写）====================
// 在下方引号内粘贴自建 VPS 的订阅链接（Clash/mihomo 格式）。Foxmail 只走这里的节点，
// 不写死节点名/服务器地址：机器改名、换 VPS、换地址，只改这个链接即可。
// 只在本机脚本副本里填写，切勿提交到仓库（会泄露订阅）！留空则 Foxmail 流量被拦截（REJECT）。
const VPS_URL = ""
// =====================================================================================


// jsDelivr（testingcf / cdn）在这台网络上会 tls bad record MAC 或 EOF。GitHub raw 直连更稳。
const RULE_CDN = "https://raw.githubusercontent.com/Loyalsoldier/clash-rules/release"

// ---- 自定义高优先级规则 ----
// 用于修正规则集误判；按 Clash 规则格式逐行添加，越靠前优先级越高。
// 示例: 'DOMAIN-SUFFIX,example.com,' + PROXY,
// 示例: 'DOMAIN-SUFFIX,example.cn,DIRECT',
const CUSTOM_RULES = [
    'DOMAIN-SUFFIX,brightdata.com,' + PROXY,
]

// 公司/内网域名: 一律直连，解析交给 DHCP / 系统 DNS。新增直接加到这里。
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

// IPPure 页面及其当前 IP 探测端点必须使用同一代理出口。
// IPPure 在 icanhazip 请求全部失败时会回退显示占位值 8.8.8.8。
const IP_CHECK_DOMAINS = [
    'icanhazip.com',
    'ippure.com',
]
// Microsoft 身份认证域名: 保持同一 DIRECT 出口，不扩大到整个微软生态。
// 必须精确匹配的认证主机
const MICROSOFT_AUTH_DOMAINS = [
    "login.live.com",
    "account.live.com",
    "login.microsoftonline.com",
    "login.windows.net",
    "sts.windows.net",
    "clientconfig.passport.net",
]

// 整个后缀均属于或高度关联 Microsoft 身份认证
const MICROSOFT_AUTH_SUFFIXES = [
    "msauth.net",
    "msftauth.net",
    "msauthimages.net",
    "msftauthimages.net",
    "microsoftonline-p.com",
]

function toSuffixRules(list, policy) {
    return list.map(d => `DOMAIN-SUFFIX,${d},${policy}`)
}
function toExactRules(list, policy) {
    return list.map(d => `DOMAIN,${d},${policy}`)
}

// Google / YouTube / Google AI: 明确走代理，并用于定向阻断 QUIC。
const GOOGLE_PROXY_DOMAINS = [
    "google.com",
    "googleapis.com",
    "gstatic.com",
    "googleusercontent.com",
    "ggpht.com",
    "googlevideo.com",
    "youtube.com",
    "youtu.be",
    "ytimg.com",
    "youtubei.googleapis.com",
    "youtube-nocookie.com",
    "googleadservices.com",
]

function main(config) {
    if (!config || typeof config !== "object") config = {}
    // ---- 0. 多 IP 并发建连，减少首连卡顿 ----
    config["tcp-concurrent"] = true
    // ---- 1. 单组手动选择，选定后不自动切换 ----
    config["proxy-groups"] = [
        {
            name: PROXY,
            type: "select",
            "include-all": true,
            "exclude-filter":
                "(?i)(到期|剩余|过期|有效期|官网|官方|订阅|套餐|重置|流量|距离|网址|客服|expire|traffic|reset)",
        },
    ]
    // ---- 2. Loyalsoldier 规则集 ----
    const rp = (behavior, name) => ({
        type: "http",
        behavior,
        url: RULE_CDN + "/" + name + ".txt",
        path: "./ruleset/loyalsoldier/" + name + ".yaml",
        interval: 86400,
        proxy: PROXY,
    })

    config["rule-providers"] = {
        reject: rp("domain", "reject"),
        icloud: rp("domain", "icloud"),
        apple: rp("domain", "apple"),
        google: rp("domain", "google"),
        proxy: rp("domain", "proxy"),
        direct: rp("domain", "direct"),
        private: rp("domain", "private"),
        gfw: rp("domain", "gfw"),
        "tld-not-cn": rp("domain", "tld-not-cn"),
        telegramcidr: rp("ipcidr", "telegramcidr"),
        cncidr: rp("ipcidr", "cncidr"),
        lancidr: rp("ipcidr", "lancidr"),
        applications: rp("classical", "applications"),
    }
    const googleDomainRules = toSuffixRules(GOOGLE_PROXY_DOMAINS, PROXY)
    const googleQuicDomainRules = GOOGLE_PROXY_DOMAINS.map((d) => `(DOMAIN-SUFFIX,${d})`).join(",")
    const microsoftAuthDomainRules = toExactRules(MICROSOFT_AUTH_DOMAINS, "DIRECT")
    const microsoftAuthSuffixRules = toSuffixRules(MICROSOFT_AUTH_SUFFIXES, "DIRECT")

    // ---- 3. 主规则，丢弃订阅自带 rules ----
    config.rules = [
        // 私网网段置顶直连，防止 ruleset 异步加载期间泄漏。
        "IP-CIDR,127.0.0.0/8,DIRECT,no-resolve",
        "IP-CIDR,10.0.0.0/8,DIRECT,no-resolve",
        "IP-CIDR,172.16.0.0/12,DIRECT,no-resolve",
        "IP-CIDR,192.168.0.0/16,DIRECT,no-resolve",
        "IP-CIDR,100.64.0.0/10,DIRECT,no-resolve",
        "IP-CIDR,169.254.0.0/16,DIRECT,no-resolve",

        "IP-CIDR6,::1/128,DIRECT,no-resolve",
        "IP-CIDR6,fc00::/7,DIRECT,no-resolve",
        "IP-CIDR6,fe80::/10,DIRECT,no-resolve",
        // 自定义纠错规则优先于内置域名规则及所有远程规则集。
        ...CUSTOM_RULES,
        // IPPure 页面与 IP 探测端点强制走当前所选节点，优先于所有远程规则集。
        ...toSuffixRules(IP_CHECK_DOMAINS, PROXY),
        // 公司/内网域名直连。
        ...toSuffixRules(COMPANY_DOMAINS, "DIRECT"),
        // Microsoft 身份认证须位于 proxy / gfw 之前，以保持 DIRECT 出口一致。
        ...microsoftAuthDomainRules,
        ...microsoftAuthSuffixRules,
        // Windows 基础服务直连；不含范围过大的 windows.net。
        "DOMAIN-SUFFIX,windows.com,DIRECT",
        "DOMAIN-SUFFIX,windowsupdate.com,DIRECT",
        "DOMAIN-SUFFIX,msftconnecttest.com,DIRECT",
        "DOMAIN-SUFFIX,msftncsi.com,DIRECT",
        "DOMAIN-SUFFIX,microsoftapp.net,DIRECT",
        "DOMAIN-SUFFIX,s-microsoft.com,DIRECT",

        // Edge 基础服务/CDN 保持直连，以账号稳定性优先。
        "DOMAIN-SUFFIX,msedge.net,DIRECT",

        // Office CDN 保持原 v5.8 行为
        "DOMAIN-SUFFIX,msocdn.com,DIRECT",
        // 仅阻断 Google/YouTube 的 QUIC，强制回退 TCP；须放在其代理规则之前。
        "AND,((NETWORK,udp),(DST-PORT,443),(OR,(" + googleQuicDomainRules + "))),REJECT",
        // Google / YouTube / Google AI 强制走节点。
        ...googleDomainRules,
        // Discord 强制走节点，避免被 applications 规则误判直连。
        "DOMAIN-SUFFIX,discord.com," + PROXY,
        "DOMAIN-SUFFIX,discordapp.com," + PROXY,
        "DOMAIN-SUFFIX,discordapp.net," + PROXY,
        "DOMAIN-SUFFIX,discord.gg," + PROXY,
        "DOMAIN-SUFFIX,discord.media," + PROXY,
        "DOMAIN-SUFFIX,discordstatus.com," + PROXY,
        "DOMAIN-SUFFIX,discordcdn.com," + PROXY,
        // Loyalsoldier 标准顺序: direct/cncidr 在 gfw/tld-not-cn 之前。
        "RULE-SET,applications,DIRECT",
        "RULE-SET,private,DIRECT",

        "RULE-SET,reject,REJECT",

        "RULE-SET,icloud,DIRECT",
        "RULE-SET,apple,DIRECT",

        "RULE-SET,google," + PROXY,
        "RULE-SET,proxy," + PROXY,

        "RULE-SET,direct,DIRECT",

        "RULE-SET,lancidr,DIRECT,no-resolve",
        "RULE-SET,cncidr,DIRECT,no-resolve",

        "RULE-SET,gfw," + PROXY,
        "RULE-SET,tld-not-cn," + PROXY,

        "RULE-SET,telegramcidr," + PROXY + ",no-resolve",
        // GEOIP / 最终兜底。
        "GEOIP,LAN,DIRECT,no-resolve",

        // 不加 no-resolve，使未命中域名规则的请求可按 CN IP 判断。
        "GEOIP,CN,DIRECT",

        // 其余全部走手动选择的节点
        "MATCH," + PROXY,
    ]
    // ---- 4. DNS ----
    // 完整重建 DNS，避免订阅遗留的精确域名策略及 fallback 将内网查询发往公共 DNS。
    const dns = {}

    // [bettbox] 强制启用: Bettbox 在 dns.enable !== true 时会用 GUI DNS 覆盖整个 dns 段。
    dns.enable = true

    if (!dns["enhanced-mode"]) {
        dns["enhanced-mode"] = "fake-ip"
    }

    if (!dns["fake-ip-range"]) {
        dns["fake-ip-range"] = "198.18.0.1/16"
    }
    // 境外 DNS 经代理，避免污染和国内直连 Google DNS。
    dns.nameserver = ["https://8.8.8.8/dns-query#" + PROXY, "https://8.8.4.4/dns-query#" + PROXY]
    // 直连使用当前系统配置的 DNS；网卡自动获取 DNS 时包含 DHCP 下发的服务器。
    dns["direct-nameserver"] = ["system"]

    // 不让 nameserver-policy 改写直连出口的 DNS 选择。
    dns["direct-nameserver-follow-policy"] = false
    // 代理节点域名及 DoH 引导使用国内 DNS，避免循环依赖。
    dns["default-nameserver"] = ["223.5.5.5", "119.29.29.29"]

    dns["proxy-server-nameserver"] = ["223.5.5.5", "119.29.29.29"]

    if (!dns["cache-algorithm"]) dns["cache-algorithm"] = "arc"
    dns["use-system-hosts"] = true

    // 公司/内网域名排除 fake-ip；微软认证仍由域名规则识别，不扩大排除范围。
    const filter = dns["fake-ip-filter"] || []

    for (const d of COMPANY_DOMAINS) {
        const item = "+." + d

        if (!filter.includes(item)) {
            filter.push(item)
        }
    }
    // 额外常见私有域名（与 private rule-set 互补）
    for (const item of ["+.lan", "localhost", "+.local", "+.home.arpa"]) {
        if (!filter.includes(item)) filter.push(item)
    }

    dns["fake-ip-filter"] = filter

    // 内网和国内域名的 DNS 查询使用 system，随当前网络的 DNS 配置变化。
    const policy = dns["nameserver-policy"] || {}
    const LAN_DNS = "system"
    for (const d of COMPANY_DOMAINS) policy["+." + d] = LAN_DNS
    for (const item of ["+.lan", "+.local", "+.home.arpa", "+.cn"]) policy[item] = LAN_DNS
    policy["geosite:cn"] = LAN_DNS
    dns["nameserver-policy"] = policy

    config.dns = dns
    // webrtc: false  -- legacy (pre-mihomo); modern leak prevention via tun/client/browser. Removed to avoid unknown key.

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
//   4) Foxmail（仅桌面脚本，脚本顶部有 VPS_URL 时生效）：只走 VPS_URL 里的自建 VPS 节点；VPS_URL 留空则 REJECT。
// =====================================================================
const CY_VPS_IP_RULE = "IP-CIDR,216.36.82.250/32,DIRECT,no-resolve"
const CY_STUN_PORTS = "OR,((DST-PORT,3478-3481),(DST-PORT,5349),(DST-PORT,19302-19309))"
const CY_FOREIGN_DOH = ["https://8.8.8.8/dns-query", "https://1.1.1.1/dns-query"]
const CY_NODE_DOH = ["https://223.5.5.5/dns-query", "https://1.12.12.12/dns-query"]
const CY_MAIL = "📧 Foxmail"

function cyHarden20261103(config) {
    let rules = Array.isArray(config.rules) ? config.rules.slice() : []
    // 去掉旧的 VPS IP 规则（可能没有 no-resolve 或位置靠后）
    rules = rules.filter((r) => !(typeof r === "string" && /^IP-CIDR,216\.36\.82\.250\/32,/.test(r)))
    const matchRule = rules.find((r) => typeof r === "string" && /^MATCH,/.test(r))
    const groups = Array.isArray(config["proxy-groups"]) ? config["proxy-groups"] : []
    let proxy = matchRule ? matchRule.split(",")[1].trim() : ""
    if (!proxy || proxy === "DIRECT" || proxy === "REJECT") proxy = groups.length ? groups[0].name : "DIRECT"

    const head = [CY_VPS_IP_RULE]

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
                interval: 86400,
                path: "./providers/my-vps.yaml",
                "health-check": { enable: true, url: "https://www.gstatic.com/generate_204", interval: 300 },
            }
            groups.push({ name: CY_MAIL, type: "fallback", use: ["my-vps"], url: "https://www.gstatic.com/generate_204", interval: 300, timeout: 5000 })
        } else {
            groups.push({ name: CY_MAIL, type: "select", proxies: ["REJECT"] })
        }
        config["proxy-groups"] = groups
        rules = rules.filter((r) => !(typeof r === "string" && /(Foxmail\.exe|imap\.gmail\.com|smtp\.gmail\.com|pop\.gmail\.com|googlemail\.com)/.test(r)))
        head.push(
            "PROCESS-NAME,Foxmail.exe," + CY_MAIL,
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
