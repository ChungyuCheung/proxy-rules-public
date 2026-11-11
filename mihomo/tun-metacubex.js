// ===== mihomo/tun-metacubex.js v9.10 | TUN 模式 + MetaCubeX .mrs 规则（mihomo 覆写脚本）=====
// 最后更新：2026-11-11 13:49 UTC+8
// 用途：完整分流（公司/微软认证直连、Google 选择组（默认 AI/VPS，可手选）、广告拦截、Apple 直连等）；Foxmail 与 AI 服务走自建 VPS（未填则走节点选择）。需开启 TUN。
// 通用：VPS 216.36.82.250 直连置顶；中国+内网=系统 DNS，外网=DoH 经代理；STUN 不回落直连；无 WhatsApp。
// 用法：Bettbox / Clash Verge Rev / FlClash 的「覆写/脚本」里用 raw 链接导入并挂到订阅；关闭「覆写 DNS」（FlClash 还要关「追加系统 DNS」）。
// 需填：VPS_URL（自建 VPS 订阅，仅本机填写，留空则 Foxmail / AI 走「⚡ 节点选择」）；公司域名改 COMPANY_DOMAINS。
// 更新日志：CHANGELOG.md
const PROXY = "⚡ 节点选择"
const MAIL = "📧 Foxmail"
const AI = "🤖 AI"
// ==================== 仅在本机填写 ====================
// 在下方引号内粘贴你自建 VPS 的订阅链接（Clash/mihomo 格式）。Foxmail 与 AI 只会走这里的节点。
// 不写死节点名/服务器地址：机器改名、换 VPS、换地址，只要改这个链接即可。
// 只在本地 Bettbox / Clash Verge Rev / FlClash 的脚本副本里填写，切勿提交到仓库（会泄露订阅）！
// 每次从仓库更新本脚本后需要重新粘贴。留空则 Foxmail 与 AI 跟随「⚡ 节点选择」。
const VPS_URL = ""
const VPS_PROVIDER = "my-vps"
// ============================================================

const RULE_CDN = "https://raw.githubusercontent.com/Loyalsoldier/clash-rules/release"
const MRS_BASE = "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo"

const NODE_FILTER =
    "(?i)(到期|剩余|过期|有效期|官网|官方|订阅|套餐|重置|流量|距离|网址|客服|expire|traffic|reset)"

// ---- 自定义高优先级规则 ----
const CUSTOM_RULES = [
    'DOMAIN-SUFFIX,brightdata.com,' + PROXY,
]

// Foxmail 进程与 Gmail 收发信服务器，固定走 MAIL 组
const MAIL_PROCESSES = ["Foxmail.exe"]
const MAIL_EXACT_DOMAINS = ["imap.gmail.com", "smtp.gmail.com", "pop.gmail.com"]
const MAIL_SUFFIX_DOMAINS = ["googlemail.com"]

// AI desktop processes: route application traffic through the AI group.
// Keep generic runtimes (browser, WebView and node) out of this list.
const AI_PROCESSES = [
    "ChatGPT.exe",
    "Claude.exe",
    "codex.exe",
]

// 海外 AI 高频静态域名兜底（配合每日自动更新的 MetaCubeX category-ai-!cn.mrs 规则集，固定走 AI 组）
const AI_EXACT_DOMAINS = [
    "http-intake.logs.us5.datadoghq.com",
    "copilot.microsoft.com",
    "copilot-proxy.githubusercontent.com",
]

const AI_SUFFIX_DOMAINS = [
    "chatgpt.com",
    "openai.com",
    "openaiapi.com",
    "oaiusercontent.com",
    "oaistatic.com",
    "sora.com",
    "ai.com",
    "chat.com",
    "anthropic.com",
    "claude.ai",
    "claude.com",
    "claudeusercontent.com",
    "x.ai",
    "grok.com",
    "grok.x.com",
    "copilot.cloud.microsoft",
    "githubcopilot.com",
    "cursor.com",
    "cursor.sh",
    "cursorapi.com",
    "windsurf.com",
    "codeium.com",
    "perplexity.ai",
    "poe.com",
    "quora.com",
    "huggingface.co",
    "hf.co",
    "hf.space",
    "cdn-lfs.huggingface.co",
    "openrouter.ai",
    "mistral.ai",
    "meta.ai",
    "dify.ai",
    "you.com",
    "phind.com",
    "character.ai",
    "replicate.com",
    "together.ai",
    "cohere.com",
    "groq.com",
    "fireworks.ai",
    "amber.de",
    "ambersearch.de",
    "exaone.ai",
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

const WEBRTC_STUN_TURN_PORTS =
    'OR,((DST-PORT,3478-3481),(DST-PORT,5349),(DST-PORT,19302-19309))'

// 同公司服务共用选择组；默认跟随 AI/VPS，可在客户端手选其他节点。
const GOOGLE = "🌐 Google"
const GOOGLE_PROCESSES = [
    "Gemini.exe",
    "GeminiAppLauncher.exe",
    "GeminiCrashpadHandler.exe",
]
// Gemini 移动端及共享登录/资源接口：在广告规则和宽泛 AI 分类之前匹配。
const GOOGLE_AI_EXACT_DOMAINS = [
    "assistant-s3-pa.googleapis.com",
    "speechs3proto2-pa.googleapis.com",
    "play.googleapis.com",
    "www.googleapis.com",
    "apis.google.com",
    "ogs.google.com",
    "myaccount.google.com",
    "www.google.com",
    "oauth2.googleapis.com",
    "lh3.googleusercontent.com",
    "www.gstatic.com",
    "ssl.gstatic.com",
    "accounts.gstatic.com",
    "content-autofill.googleapis.com",
    "accounts.google.com",
    "ai.google.dev",
    "alkalicore-pa.clients6.google.com",
    "alkalimakersuite-pa.clients6.google.com",
    "alkalimena-pa.clients6.google.com",
    "webchannel-alkalimakersuite-pa.clients6.google.com",
    "geminiweb-pa.clients.google.com",
    "geminiweb-pa.clients6.google.com",
    "appsgenaiserver-pa.clients.google.com",
    "appsgenaiserver-pa.clients6.google.com",
    "appsgenaiserver-pa.googleapis.com",
    "cloudaicompanion.googleapis.com",
    "cloudcode-pa.googleapis.com",
    "daily-cloudcode-pa.googleapis.com",
    "notebooklm-pa.googleapis.com",
    "notebooklm.googleapis.com",
    "antigravity-pa.googleapis.com",
    "antigravity.googleapis.com",
]
const GOOGLE_AI_SUFFIX_DOMAINS = [
    "bard.google.com",
    "gemini.google.com",
    "gemini.google",
    "aistudio.google.com",
    "makersuite.google.com",
    "notebooklm.google.com",
    "notebooklm.google",
    "deepmind.google",
    "deepmind.com",
    "antigravity.google",
    "antigravity-unleash.goog",
    "generativelanguage.googleapis.com",
    "proactivebackend-pa.googleapis.com",
    "aisandbox-pa.googleapis.com",
    "aida.googleapis.com",
    "jules.google.com",
    "labs.google.com",
]
const GOOGLE_SUFFIX_DOMAINS = [
    "google.com",
    "googleapis.com",
    "gstatic.com",
    "googleusercontent.com",
    "ggpht.com",
    "googlevideo.com",
    "youtube.com",
    "youtu.be",
    "ytimg.com",
    "youtube-nocookie.com",
    "googleadservices.com",
    "google.dev",
    "gmail.com",
    "gemini.google",
    "notebooklm.google",
    "deepmind.google",
    "deepmind.com",
    "antigravity.google",
    "antigravity-unleash.goog",
]

function companyProxyGroups(vpsOn, otherProviders) {
    return [
        { name: GOOGLE, proxies: [AI, PROXY] },
    ].map((group) => ({
        ...group,
        type: "select",
        ...(vpsOn
            ? { "include-all-proxies": true, ...(otherProviders.length ? { use: otherProviders } : {}) }
            : { "include-all": true }),
        "exclude-filter": NODE_FILTER,
    }))
}

// 仅对常用 Google 域名的 UDP 443 回退 TCP；必须先于进程/域名代理规则。
function googleQuicRule() {
    const domains = GOOGLE_SUFFIX_DOMAINS.map((d) => `(DOMAIN-SUFFIX,${d})`).join(",")
    return "AND,((NETWORK,udp),(DST-PORT,443),(OR,(" + domains + "))),REJECT"
}

// 从 AI 分类中先分出 Google，避免宽泛 AI 规则抢先匹配。
function companyAiRules() {
    return [
        ...GOOGLE_AI_EXACT_DOMAINS.map((d) => "DOMAIN," + d + "," + GOOGLE),
        ...GOOGLE_AI_SUFFIX_DOMAINS.map((d) => "DOMAIN-SUFFIX," + d + "," + GOOGLE),
        "RULE-SET,google_ai," + GOOGLE,
    ]
}

// 常见域名本地兜底；完整版仍在既有广告拦截之后匹配。
function companyDomainRules() {
    return [
        ...GOOGLE_SUFFIX_DOMAINS.map((d) => "DOMAIN-SUFFIX," + d + "," + GOOGLE),
    ]
}

function companyRemoteRules() {
    return [
        "RULE-SET,youtube," + GOOGLE,
        "RULE-SET,google," + GOOGLE,
    ]
}

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

    // ---- 0. 多 IP 并发建连 + TCP 保活 ----
    config["tcp-concurrent"] = true
    config["keep-alive-interval"] = 15
    config["keep-alive-idle"] = 15
    config["disable-keep-alive"] = false
    // PROCESS-NAME 规则依赖进程匹配
    if (!config["find-process-mode"] || config["find-process-mode"] === "off") {
        config["find-process-mode"] = "strict"
    }

    // ---- 1. 手动选择组 + Foxmail 组 + AI 组 ----
    // 自建 VPS provider（仅当 VPS_URL 已在本机填写）
    const vpsOn = typeof VPS_URL === "string" && VPS_URL.trim() !== ""
    if (vpsOn) {
        if (!config["proxy-providers"] || typeof config["proxy-providers"] !== "object" || Array.isArray(config["proxy-providers"])) {
            config["proxy-providers"] = {}
        }
        config["proxy-providers"][VPS_PROVIDER] = {
            type: "http",
            url: VPS_URL.trim(),
            // 订阅经「⚡ 节点选择」（机场节点）下载：国内直连海外 VPS 的明文 http 常被重置（EOF）
            proxy: PROXY,
            interval: 86400,
            path: "./providers/my-vps.yaml",
            "health-check": {
                enable: true,
                url: "https://www.gstatic.com/generate_204",
                interval: 300,
            },
        }
    }

    const otherProviders = Object.keys(config["proxy-providers"] || {}).filter(n => n !== VPS_PROVIDER)

    config["proxy-groups"] = [
        {
            name: PROXY,
            type: "select",
            // 启用 my-vps 时，主组不纳入该 provider（订阅自带的 provider 仍保留）
            ...(vpsOn
                ? { "include-all-proxies": true, ...(otherProviders.length ? { use: otherProviders } : {}) }
                : { "include-all": true }),
            "exclude-filter": NODE_FILTER,
        },
        // Foxmail 只走自建 VPS：填了 VPS_URL 就只用 my-vps provider（不做名字过滤）；
        //        留空则跟随「⚡ 节点选择」
        vpsOn
            ? {
                name: MAIL,
                type: "fallback",
                use: [VPS_PROVIDER],
                url: "https://www.gstatic.com/generate_204",
                interval: 300,
                timeout: 5000,
                lazy: false,
            }
            : { name: MAIL, type: "select", proxies: [PROXY] },
        // AI 服务只走自建 VPS：填了 VPS_URL 就只用 my-vps provider；留空则跟随「⚡ 节点选择」
        vpsOn
            ? {
                name: AI,
                type: "fallback",
                use: [VPS_PROVIDER],
                url: "https://www.gstatic.com/generate_204",
                interval: 300,
                timeout: 5000,
                lazy: false,
            }
            : { name: AI, type: "select", proxies: [PROXY] },
        ...companyProxyGroups(vpsOn, otherProviders),
    ]

    // ---- 2. MetaCubeX meta-rules-dat (.mrs) 规则集 ----
    // Loyalsoldier → MetaCubeX 对应关系与 Loyalsoldier README 中的 geosite/geoip 一致。
    const mrs = (behavior, kind, name, key) => ({
        type: "http",
        behavior,
        format: "mrs",
        url: MRS_BASE + "/" + kind + "/" + name + ".mrs",
        path: "./ruleset/meta/" + kind + "-" + key + ".mrs",
        interval: 86400,
        proxy: PROXY,
    })

    config["rule-providers"] = {
        reject: mrs("domain", "geosite", "category-ads-all", "reject"),
        icloud: mrs("domain", "geosite", "icloud@cn", "icloud"),
        apple: mrs("domain", "geosite", "apple@cn", "apple"),
        ai: mrs("domain", "geosite", "category-ai-!cn", "ai"),
        google: mrs("domain", "geosite", "google", "company-google"),
        google_ai: mrs("domain", "geosite", "google-deepmind", "company-google-deepmind"),
        youtube: mrs("domain", "geosite", "youtube", "company-youtube"),
        proxy: mrs("domain", "geosite", "geolocation-!cn", "proxy"),
        direct: mrs("domain", "geosite", "cn", "direct"),
        private: mrs("domain", "geosite", "private", "private"),
        gfw: mrs("domain", "geosite", "gfw", "gfw"),
        "tld-not-cn": mrs("domain", "geosite", "tld-!cn", "tld-not-cn"),
        telegramcidr: mrs("ipcidr", "geoip", "telegram", "telegramcidr"),
        cncidr: mrs("ipcidr", "geoip", "cn", "cncidr"),
        lancidr: mrs("ipcidr", "geoip", "private", "lancidr"),
        // 进程名规则 (PROCESS-NAME)，MetaCubeX 无 mrs 等价（mrs 只支持 domain/ipcidr），保留 Loyalsoldier。
        applications: {
            type: "http",
            behavior: "classical",
            format: "yaml",
            url: RULE_CDN + "/applications.txt",
            path: "./ruleset/loyalsoldier/applications.yaml",
            interval: 86400,
            proxy: PROXY,
        },
    }
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

        googleQuicRule(),
        // AI app traffic precedes generic STUN, domain and application rules.
        ...GOOGLE_PROCESSES.map(p => `PROCESS-NAME,${p},${GOOGLE}`),
        ...AI_PROCESSES.map(p => `PROCESS-NAME,${p},${AI}`),

        // Foxmail 与 Gmail 收发信服务器走 MAIL 组（置于其他规则之前）
        ...MAIL_PROCESSES.map(p => `AND,((PROCESS-NAME,${p}),(NOT,((GEOIP,CN,no-resolve)))),${MAIL}`),
        ...toExactRules(MAIL_EXACT_DOMAINS, MAIL),
        ...toSuffixRules(MAIL_SUFFIX_DOMAINS, MAIL),

        WEBRTC_STUN_TURN_PORTS + ',' + PROXY,
        WEBRTC_STUN_TURN_PORTS + ',REJECT',

        ...CUSTOM_RULES,

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

        // Google 先进入独立选择组，其余 AI 继续使用原 AI 分组。
        ...companyAiRules(),
        ...toExactRules(AI_EXACT_DOMAINS, AI),
        ...toSuffixRules(AI_SUFFIX_DOMAINS, AI),
        "RULE-SET,ai," + AI,
        "DOMAIN-SUFFIX,discord.com," + PROXY,
        "DOMAIN-SUFFIX,discordapp.com," + PROXY,
        "DOMAIN-SUFFIX,discordapp.net," + PROXY,
        "DOMAIN-SUFFIX,discord.gg," + PROXY,
        "DOMAIN-SUFFIX,discord.media," + PROXY,
        "DOMAIN-SUFFIX,discordstatus.com," + PROXY,
        "DOMAIN-SUFFIX,discordcdn.com," + PROXY,

        "RULE-SET,applications,DIRECT,no-resolve",
        "RULE-SET,private,DIRECT",
        "RULE-SET,reject,REJECT",
        // 保留广告拦截优先级，常用公司域名在此兜底。
        ...companyDomainRules(),
        "RULE-SET,icloud,DIRECT",
        "RULE-SET,apple,DIRECT",
        ...companyRemoteRules(),
        "RULE-SET,proxy," + PROXY,
        "RULE-SET,direct,DIRECT",
        "RULE-SET,lancidr,DIRECT,no-resolve",
        "RULE-SET,cncidr,DIRECT,no-resolve",
        "RULE-SET,gfw," + PROXY,
        "RULE-SET,tld-not-cn," + PROXY,
        "RULE-SET,telegramcidr," + PROXY + ",no-resolve",

        "GEOIP,LAN,DIRECT,no-resolve",
        "GEOIP,CN,DIRECT,no-resolve",
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
    return cyHarden20261103(config)
}

// =====================================================================
// 统一加固（所有 mihomo 脚本共用同一段，放在 main() 最后执行，覆盖前面的设置）
//   1) 自建 VPS IP 直连：IP-CIDR,216.36.82.250/32,DIRECT,no-resolve 放在第 1 条规则，
//      使用任何机场订阅时都能直接访问自己的 VPS（不经机场节点）。
//   2) WebRTC 防泄漏：STUN/TURN 端口（3478-3481、5349、19302-19309）先走代理，
//      节点不支持 UDP 时立即 REJECT，绝不回落 DIRECT（防止暴露真实公网 IP）。
//   3) DNS 防泄漏，统一规则：
//      - 中国域名 + 公司/内网域名 + .lan/.local → system（当前网络的系统 DNS，公司/家里自动切换，不写死 IP）
//      - 其余外网域名、以及 IP 规则需要的解析 → 外网加密 DoH（Google 8.8.8.8 / Cloudflare 1.1.1.1），经代理发出
//      - 不使用 fallback（避免回落到明文/国内 DNS），fake-ip 模式，关闭 IPv6 解析
//      - 机场节点域名用加密 DoH（阿里 / 腾讯，按 IP 写），节点必须直连才能解析，所以不走代理
//   4) Foxmail 与 AI（仅桌面脚本，脚本顶部有 VPS_URL 时生效）：只走 VPS_URL 里的自建 VPS 节点；VPS_URL 留空则跟随主选择组。
// =====================================================================
const CY_VPS_IP_RULE = "IP-CIDR,216.36.82.250/32,DIRECT,no-resolve"
// 大航海机场订阅面板 IP 直连（拒绝代理连接），紧随 VPS 规则
// VPS SSH(22) 例外：走主选择组，置于 VPS 直连规则之前
const CY_VPS_SSH_MATCH = "AND,((IP-CIDR,216.36.82.250/32,no-resolve),(DST-PORT,22))"
const CY_AIRPORT_IP_RULES = ["IP-CIDR,47.242.128.61/32,DIRECT,no-resolve"]
const CY_STUN_PORTS = "OR,((DST-PORT,3478-3481),(DST-PORT,5349),(DST-PORT,19302-19309))"
const CY_FOREIGN_DOH = ["https://8.8.8.8/dns-query", "https://1.1.1.1/dns-query"]
const CY_NODE_DOH = ["https://223.5.5.5/dns-query", "https://1.12.12.12/dns-query"]
const CY_MAIL = "📧 Foxmail"
const CY_AI = "🤖 AI"
// 国内邮箱服务器直连（置于 Foxmail 进程规则之前，保证 88.com 等国内邮箱直接连接）；Gmail 仍走 Foxmail 组
const CY_CN_MAIL_DOMAINS = ["88.com", "email.cn", "qq.com", "foxmail.com", "exmail.qq.com", "163.com", "126.com", "yeah.net", "188.com", "netease.com", "qiye.163.com", "sina.com", "sina.cn", "sohu.com", "139.com", "189.cn", "wo.cn", "aliyun.com", "mxhichina.com", "qiye.aliyun.com", "263.net", "21cn.com", "tom.com"]

// 在原代理规则的位置阻断 QUIC，并拒绝因节点不支持 UDP 而跳过的连接。
// 不前置全局 UDP 拒绝：先命中的公司/国内/内网 DIRECT 仍保持直连。
function cyProtectProxyRules(rules) {
    const policies = [PROXY, CY_MAIL, CY_AI, GOOGLE]
    const guarded = []
    for (const rule of rules) {
        const parts = rule.split(",")
        const noResolve = parts[parts.length - 1] === "no-resolve"
        if (noResolve) parts.pop()
        const policy = parts.pop()
        if (!policies.includes(policy)) {
            guarded.push(rule)
            continue
        }
        const isMatch = parts[0] === "MATCH"
        // 逻辑子条件没有策略参数；IP/RULE-SET 的 no-resolve 必须保留在条件内。
        const condition = parts.join(",") + (noResolve ? ",no-resolve" : "")
        guarded.push(
            isMatch
                ? "AND,((NETWORK,udp),(DST-PORT,443)),REJECT"
                : "AND,((NETWORK,udp),(DST-PORT,443),(" + condition + ")),REJECT",
            rule,
            isMatch
                ? "NETWORK,udp,REJECT"
                : "AND,((NETWORK,udp),(" + condition + ")),REJECT"
        )
    }
    return guarded
}

function cyHarden20261103(config) {
    let rules = Array.isArray(config.rules) ? config.rules.slice() : []
    // 过滤已有的 VPS IP 规则（可能没有 no-resolve 或位置靠后）
    rules = rules.filter((r) => !(typeof r === "string" && (/^IP-CIDR,(216\.36\.82\.250|47\.242\.128\.61)\/32,/.test(r) || /^AND,\(\(IP-CIDR,216\.36\.82\.250\//.test(r))))
    const matchRule = rules.find((r) => typeof r === "string" && /^MATCH,/.test(r))
    const groups = Array.isArray(config["proxy-groups"]) ? config["proxy-groups"] : []
    let proxy = matchRule ? matchRule.split(",")[1].trim() : ""
    if (!proxy || proxy === "DIRECT" || proxy === "REJECT") proxy = groups.length ? groups[0].name : "DIRECT"

    const head = [...(proxy && proxy !== "DIRECT" ? [CY_VPS_SSH_MATCH + "," + proxy] : []), CY_VPS_IP_RULE, ...CY_AIRPORT_IP_RULES]

    // ---- Foxmail / AI 只走自建 VPS（仅当脚本定义了 VPS_URL 且还没有对应组时由这里补上）----
    if (typeof VPS_URL !== "undefined") {
        const vpsOn = typeof VPS_URL === "string" && VPS_URL.trim() !== ""
        if (vpsOn) {
            if (!config["proxy-providers"] || typeof config["proxy-providers"] !== "object" || Array.isArray(config["proxy-providers"])) {
                config["proxy-providers"] = {}
            }
            if (!config["proxy-providers"]["my-vps"]) {
                config["proxy-providers"]["my-vps"] = {
                    type: "http",
                    url: VPS_URL.trim(),
                    // 订阅经主选择组（机场节点）下载，防国内直连 VPS 时 EOF
                    ...(proxy && proxy !== "DIRECT" && proxy !== "REJECT" ? { proxy } : {}),
                    interval: 86400,
                    path: "./providers/my-vps.yaml",
                    "health-check": { enable: true, url: "https://www.gstatic.com/generate_204", interval: 300 },
                }
            }
        }
        if (!groups.some((g) => g && g.name === CY_MAIL)) {
            if (vpsOn) {
                groups.push({ name: CY_MAIL, type: "fallback", use: ["my-vps"], url: "https://www.gstatic.com/generate_204", interval: 300, timeout: 5000 })
            } else {
                groups.push({ name: CY_MAIL, type: "select", proxies: [proxy && proxy !== "REJECT" ? proxy : "DIRECT"] })
            }
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
        if (!groups.some((g) => g && g.name === CY_AI)) {
            if (vpsOn) {
                groups.push({ name: CY_AI, type: "fallback", use: ["my-vps"], url: "https://www.gstatic.com/generate_204", interval: 300, timeout: 5000 })
            } else {
                groups.push({ name: CY_AI, type: "select", proxies: [proxy && proxy !== "REJECT" ? proxy : "DIRECT"] })
            }
        }
        config["proxy-groups"] = groups
    }

    // ---- WebRTC/STUN（已有则不重复添加）----
    if (!rules.some((r) => typeof r === "string" && r.indexOf("3478") >= 0)) {
        head.push(CY_STUN_PORTS + "," + proxy, CY_STUN_PORTS + ",REJECT")
    }
    // ---- 原则：中国/公司流量永远优先直连；Foxmail 组只接剩下的海外邮件 ----
    // 公司域名（COMPANY_DOMAINS/INTRANET_DOMAINS/CUSTOM_DIRECT_DOMAINS）+ 国内邮箱合并为一个 DIRECT 区块，
    // 固定插在 SSH 例外、VPS IP、大航海 IP 之后，Foxmail/Gmail 规则之前；后面的重复规则去重。
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
    config.rules = cyProtectProxyRules(head.concat(rules))

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
