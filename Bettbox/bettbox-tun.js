// ===== Loyalsoldier 全局覆写脚本 v7.4-tun-webrtc-wa (Bettbox / Mihomo) =====
// [v7.4] WhatsApp 掉线修复：新增独立手动组「💬 WhatsApp」，WhatsApp/Meta 域名、
//        IP-ASN 32934 及 WhatsApp.Root.exe 进程全部固定走该组；开启 TCP 保活
//        (keep-alive 15s)，防止空闲长连接被节点/TUN 回收导致"计算机未连接至网络"。
// [tun] 适用于 Windows TUN 模式。请开启 TUN；严格路由若引起变慢或节点超时，请保持关闭。
// [v7.3] 取消固定绑定 WLAN，改由 Mihomo 自动检测当前默认出口。
// [v7.0] WebRTC/STUN 防泄漏：常见 STUN/TURN 端口先强制走所选节点；
//        节点不支持 UDP 时立即拒绝同一流量，避免继续匹配到 DIRECT。
// [bettbox] Bettbox 1.19.3 以 main(config) 调用 (QuickJS)。
// [bettbox] 使用本脚本时请关闭 Bettbox「覆写 DNS」，否则下方 dns 段会被 GUI DNS 整体替换。
// [bettbox] dns.enable 强制 true；公司域名写入 nameserver-policy=system。
//           direct-nameserver-follow-policy=false：直连解析使用 system。
// [v6.9] 完整重建 DNS，移除订阅遗留策略/fallback；直连使用当前系统 DNS。
// [v6.7] 启用 use-system-hosts。
// [v6.6] 规则集改经节点下载。
// [v6.2] 高优先级 CUSTOM_RULES 区域。
// [v6.1] IPPure 与其出口 IP 探测域名强制走所选节点。
// [v5.9] 精确 Microsoft 登录域强制 DIRECT，修复 0x80190001。
// 核心: 手动节点组 + WhatsApp 独立组 + Loyalsoldier rulesets + 公司/MS-auth/Windows 优先 DIRECT +
//       Google/YouTube/Discord 强制代理 + 仅Google QUIC阻断 + fake-ip + system直连DNS
const PROXY = "⚡ 节点选择"
const WA = "💬 WhatsApp"

const RULE_CDN = "https://raw.githubusercontent.com/Loyalsoldier/clash-rules/release"

const NODE_FILTER =
    "(?i)(到期|剩余|过期|有效期|官网|官方|订阅|套餐|重置|流量|距离|网址|客服|expire|traffic|reset)"

// ---- 自定义高优先级规则 ----
const CUSTOM_RULES = [
    'DOMAIN-SUFFIX,brightdata.com,' + PROXY,
]

// [v7.4] WhatsApp / Meta 域名，固定走 WA 组
const WHATSAPP_DOMAINS = [
    "whatsapp.com",
    "whatsapp.net",
    "wa.me",
    "whatsapp.biz",
    "facebook.com",
    "fbcdn.net",
    "fbsbx.com",
]

// 公司/内网域名: 一律直连
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

const IP_CHECK_DOMAINS = [
    'icanhazip.com',
    'ippure.com',
]

const MICROSOFT_AUTH_DOMAINS = [
    "login.live.com",
    "account.live.com",
    "login.microsoftonline.com",
    "login.windows.net",
    "sts.windows.net",
    "clientconfig.passport.net",
]

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

const WEBRTC_STUN_TURN_PORTS =
    'OR,((DST-PORT,3478-3481),(DST-PORT,5349),(DST-PORT,19302-19309))'

function main(config) {
    if (!config || typeof config !== 'object') config = {}
    delete config['interface-name']
    if (Array.isArray(config.proxies)) {
        for (const proxy of config.proxies) {
            if (proxy && typeof proxy === 'object') {
                delete proxy['interface-name']
            }
        }
    }
    if (!config.tun || typeof config.tun !== 'object' || Array.isArray(config.tun)) {
        config.tun = {}
    }
    config.tun['auto-detect-interface'] = true

    // ---- 0. 多 IP 并发建连 + [v7.4] TCP 保活 ----
    config["tcp-concurrent"] = true
    config["keep-alive-interval"] = 15
    config["keep-alive-idle"] = 15
    config["disable-keep-alive"] = false

    // ---- 1. 手动选择组 + WhatsApp 独立组 ----
    config["proxy-groups"] = [
        {
            name: PROXY,
            type: "select",
            "include-all": true,
            "exclude-filter": NODE_FILTER,
        },
        {
            // 默认跟随主节点；建议手动固定一个低延迟、支持 UDP 的节点
            name: WA,
            type: "select",
            proxies: [PROXY],
            "include-all": true,
            "exclude-filter": NODE_FILTER,
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
        "IP-CIDR,127.0.0.0/8,DIRECT,no-resolve",
        "IP-CIDR,10.0.0.0/8,DIRECT,no-resolve",
        "IP-CIDR,172.16.0.0/12,DIRECT,no-resolve",
        "IP-CIDR,192.168.0.0/16,DIRECT,no-resolve",
        "IP-CIDR,100.64.0.0/10,DIRECT,no-resolve",
        "IP-CIDR,169.254.0.0/16,DIRECT,no-resolve",

        "IP-CIDR6,::1/128,DIRECT,no-resolve",
        "IP-CIDR6,fc00::/7,DIRECT,no-resolve",
        "IP-CIDR6,fe80::/10,DIRECT,no-resolve",

        WEBRTC_STUN_TURN_PORTS + ',' + PROXY,
        WEBRTC_STUN_TURN_PORTS + ',REJECT',

        ...CUSTOM_RULES,

        // [v7.4] WhatsApp 全部流量（域名、Meta IP 段、桌面进程）走 WA 组
        ...toSuffixRules(WHATSAPP_DOMAINS, WA),
        "PROCESS-NAME,WhatsApp.Root.exe," + WA,
        "IP-ASN,32934," + WA + ",no-resolve",

        ...toSuffixRules(IP_CHECK_DOMAINS, PROXY),
        ...toSuffixRules(COMPANY_DOMAINS, "DIRECT"),
        ...microsoftAuthDomainRules,
        ...microsoftAuthSuffixRules,

        "DOMAIN-SUFFIX,windows.com,DIRECT",
        "DOMAIN-SUFFIX,windowsupdate.com,DIRECT",
        "DOMAIN-SUFFIX,msftconnecttest.com,DIRECT",
        "DOMAIN-SUFFIX,msftncsi.com,DIRECT",
        "DOMAIN-SUFFIX,microsoftapp.net,DIRECT",
        "DOMAIN-SUFFIX,s-microsoft.com,DIRECT",
        "DOMAIN-SUFFIX,msedge.net,DIRECT",
        "DOMAIN-SUFFIX,msocdn.com,DIRECT",

        "AND,((NETWORK,udp),(DST-PORT,443),(OR,(" + googleQuicDomainRules + "))),REJECT",
        ...googleDomainRules,

        "DOMAIN-SUFFIX,discord.com," + PROXY,
        "DOMAIN-SUFFIX,discordapp.com," + PROXY,
        "DOMAIN-SUFFIX,discordapp.net," + PROXY,
        "DOMAIN-SUFFIX,discord.gg," + PROXY,
        "DOMAIN-SUFFIX,discord.media," + PROXY,
        "DOMAIN-SUFFIX,discordstatus.com," + PROXY,
        "DOMAIN-SUFFIX,discordcdn.com," + PROXY,

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

        "GEOIP,LAN,DIRECT,no-resolve",
        "GEOIP,CN,DIRECT",
        "MATCH," + PROXY,
    ]

    // ---- 4. DNS ----
    const dns = {}
    dns.enable = true
    dns["enhanced-mode"] = "fake-ip"
    dns["fake-ip-range"] = "198.18.0.1/16"
    dns.nameserver = ["https://8.8.8.8/dns-query#" + PROXY, "https://8.8.4.4/dns-query#" + PROXY]
    dns["direct-nameserver"] = ["system"]
    dns["direct-nameserver-follow-policy"] = false
    dns["default-nameserver"] = ["223.5.5.5", "119.29.29.29"]
    dns["proxy-server-nameserver"] = ["223.5.5.5", "119.29.29.29"]
    dns["cache-algorithm"] = "arc"
    dns["use-system-hosts"] = true

    const filter = []
    for (const d of COMPANY_DOMAINS) {
        const item = "+." + d
        if (!filter.includes(item)) filter.push(item)
    }
    for (const item of ["+.lan", "localhost", "+.local", "+.home.arpa"]) {
        if (!filter.includes(item)) filter.push(item)
    }
    dns["fake-ip-filter"] = filter

    const policy = {}
    const LAN_DNS = "system"
    for (const d of COMPANY_DOMAINS) policy["+." + d] = LAN_DNS
    for (const item of ["+.lan", "+.local", "+.home.arpa", "+.cn"]) policy[item] = LAN_DNS
    policy["geosite:cn"] = LAN_DNS
    dns["nameserver-policy"] = policy

    config.dns = dns
    return config
}
