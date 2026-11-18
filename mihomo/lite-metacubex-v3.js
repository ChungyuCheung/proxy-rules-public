// ===== mihomo/lite-metacubex-v3.js v3.0.2 | 简约版 + MetaCubeX 规则 + Homeport 住宅链式代理（mihomo 覆写脚本·第三代，TUN / 系统代理均可）=====
// 最后更新：2026-11-18 12:20 UTC+8
// 第三代（V3）：在第二代（VPS_URLS 数组）基础上，融合 0xkaka/homeport 静态住宅 IP 链式代理方案（Webshare 等）。
// 核心解决痛点：当自建 VPS 故障、失联或流量耗尽时，业务组（AI / Foxmail / Google / 住宅出口）仍可通过
//   「本机 → HP_Relay（机场节点中转）→ Webshare 静态住宅代理 → 目标站点」正常访问，不再因单点 VPS 故障导致住宅 IP 失效。
// 链路说明：
//   1) 机场中转链路：本机 → HP_Relay（手选组，默认跟随「⚡ 节点选择」，也可单独指定台/日/新/美/韩机场节点或 DIRECT）→ 🏠 Webshare-N → 目标服务
//   2) 自建 VPS 链路：本机 → VPS_URLS 中的自建 VPS / VPS 绑定的 Webshare 节点 → 目标服务
// 分组说明（共 6 个纯手选 select 组）：
//   - ⚡ 节点选择：日常上网主组（仅含机场节点，隔离自建 VPS 与 🏠 住宅节点）
//   - 📧 Foxmail：邮件组（含机场中转 🏠 Webshare 节点、自建 VPS 节点、🏠 住宅出口、⚡ 节点选择）
//   - 🤖 AI：AI 业务组（同上；补充 Claude/MCP 专属域名、Anthropic AS399358 IPv4 段及移动端进程）
//   - 🌐 Google：Google/YouTube/Gemini 组（默认跟随 🤖 AI，可切 🏠 住宅出口、各 Webshare/VPS 节点或 ⚡ 节点选择）
//   - 🏠 住宅出口：专为风控/支付/人机验证（Stripe、Cloudflare 验证、hCaptcha、reCAPTCHA、Sentry、Datadog、Persona、IPInfo、Webshare 等）设立的住宅出口组
//   - HP_Relay：Webshare 静态住宅代理的前置中转组（type: select，默认首选「⚡ 节点选择」，也可手选台/日/新/美/韩机场节点或 DIRECT）
// 用途：内网/公司直连 + 系统 DNS；中国直连；Foxmail/AI/Google/住宅出口支持 Webshare 链式住宅代理与自建 VPS；其余走「⚡ 节点选择」。
// 隐私与同步安全：VPS_URLS 与 WEBSHARE_PROXIES 只在本机客户端脚本副本填写，仓库中保持为空 []（防同步到公开仓库泄露账密）。
// 更新日志：CHANGELOG.md

// ==================== 仅在本机填写（切勿提交到仓库）====================
// 1) 自建 VPS 订阅链接（Clash/mihomo 格式），逐行粘贴到下面数组，一行一条，行尾保留英文逗号。
//    想要几台填几台（10 台也支持）；留空 [] 则不加载 VPS 订阅。
const VPS_URLS = [
    // "https://example.com/vps-first",
    // "https://example.com/vps-second",
]
// 可选：当前订阅自带节点中额外匹配的名称（正则片段；VPS_URLS 订阅的节点不受名称筛选，全部显示）。
const VPS_EXTRA_FILTER = ""

// 2) Webshare 静态住宅 IP 代理清单（Homeport 链式代理：经 HP_Relay 机场节点中转，VPS 故障时依然可用）
//    支持格式：
//      - "IP:端口:用户名:密码"（自动命名为 "🏠 Webshare-序号 (IP)"，默认 socks5）
//      - "自定义名称|IP:端口:用户名:密码"（自定义节点名，自动补 🏠 前缀）
//      - 对象格式：{ name: "🏠 Webshare-1", type: "socks5", server: "x.x.x.x", port: 1234, username: "u", password: "p" }
//    只在本机 Bettbox / Clash Verge Rev / FlClash 脚本副本里填写，切勿提交到仓库（会泄露代理账密）！
const WEBSHARE_PROXIES = [
    // "198.51.100.10:6321:your_user:your_pass",
    // "198.51.100.11:7359:your_user:your_pass",
]
// =====================================================================

// ==================== 自定义内网域名（可自行添加）====================
const CUSTOM_DIRECT_DOMAINS = []
// =================================================================

const PROXY = "⚡ 节点选择"
const MAIL = "📧 Foxmail"
const AI = "🤖 AI"
const GOOGLE = "🌐 Google"
const HOMEPORT = "🏠 住宅出口"
const RELAY = "HP_Relay"

// HP_Relay 机场前置中转节点筛选规则（筛选台/日/新/美/韩优质节点，排除香港、倍率、IPv6、信息节点与 🏠 住宅节点自身）
const RELAY_FILTER = "(?i)(台湾|台灣|日本|新加坡|美国|美國|韩国|韓國|\\b(TW|JP|SG|US|KR)\\b)"
const RELAY_EXCLUDE =
    "(?i)(^🏠|倍率|IPv6|到期|剩余|过期|有效期|官网|官方|订阅|套餐|重置|流量|距离|网址|客服|失联|故障|香港|\\bHK\\b|expire|traffic|reset)"

// 机场信息类伪节点（剩余流量/到期等）不进主组
const NODE_FILTER =
    "(?i)(到期|剩余|过期|有效期|官网|官方|订阅|套餐|重置|流量|距离|网址|客服|expire|traffic|reset)"

// Anthropic IPv6 拒绝（防 IPv6 绕过住宅出口触发 Claude 风控封号）
const ANTHROPIC_IPV6_REJECT_RULES = [
    "IP-CIDR6,2607:6bc0::/48,REJECT,no-resolve",
    "IP-CIDR6,2607:6bc0:11::/48,REJECT,no-resolve",
]

// Foxmail 进程与 Gmail 收发信服务器
const MAIL_PROCESSES = ["Foxmail.exe"]
const MAIL_EXACT_DOMAINS = ["imap.gmail.com", "smtp.gmail.com", "pop.gmail.com"]
const MAIL_SUFFIX_DOMAINS = ["googlemail.com"]

// AI 桌面与移动端独立进程：走 AI 组（不含通用浏览器/WebView/node）
const AI_PROCESSES = [
    "ChatGPT.exe",
    "Claude.exe",
    "codex.exe",
    "com.anthropic.claude",
    "com.openai.chatgpt",
]

// 住宅出口专属进程（Google 钱包风控）
const HOMEPORT_PROCESSES = [
    "com.google.android.apps.walletnfcrel",
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
    "ant.dev",
    "anthropic.com",
    "anthropic.team",
    "antspace.dev",
    "chatbotclaude.com",
    "clau.de",
    "claude.ai",
    "claude.app",
    "claude.com",
    "claude.dev",
    "claude.new",
    "claude.site",
    "claudeacademy.com",
    "claudemcpclient.com",
    "claudemcpcontent.com",
    "claudepages.dev",
    "claudestudio.com",
    "claudeusercontent.com",
    "modelcontextprotocol.io",
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

// Anthropic AS399358 专属 IPv4 段（无需客户端额外安装 GeoASN 库即可覆盖 AS399358）
const AI_IP_CIDRS = [
    "160.79.104.0/21",
]

// 风控、支付、人机验证、客服与指纹检测域名：统一走「🏠 住宅出口」
const HOMEPORT_SUFFIX_DOMAINS = [
    "stripe.com",
    "stripe.network",
    "stripecdn.com",
    "withpersona.com",
    "hcaptcha.com",
    "challenges.cloudflare.com",
    "recaptcha.net",
    "siftscience.com",
    "intercom.io",
    "intercomcdn.com",
    "webshare.io",
    "ipinfo.io",
]

// 纯遥测/统计域名：被大量外网网站嵌入，走两跳住宅链会明显拖慢页面加载（v3.0.2 起改走主代理「⚡ 节点选择」）
const TELEMETRY_SUFFIX_DOMAINS = [
    "sentry.io",
    "datadoghq.com",
    "browser-intake-datadoghq.com",
    "growthbook.io",
    "usefathom.com",
    "segment.io",
]

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

const DIRECT_PUBLIC_DNS_DOMAINS = []

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

// 同公司服务共用选择组；默认跟随 AI/VPS，可在客户端手选其他节点。
const GOOGLE_PROCESSES = [
    "Gemini.exe",
    "GeminiAppLauncher.exe",
    "GeminiCrashpadHandler.exe",
    "com.android.vending",
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
    if (!config || typeof config !== "object") config = {}

    config["tcp-concurrent"] = true
    // PROCESS-NAME 需要进程匹配
    if (!config["find-process-mode"] || config["find-process-mode"] === "off") {
        config["find-process-mode"] = "strict"
    }

    // ---- 1. 分组 ----
    // 自建 VPS provider（仅当 VPS_URLS 已在本机填写；按填写顺序自动编号 my-vps-1…N）
    const vpsUrls = Array.isArray(VPS_URLS) ? VPS_URLS.filter(u => typeof u === "string" && u.trim() !== "").map(u => u.trim()) : []
    const vpsProviderNames = vpsUrls.map((_, i) => "my-vps-" + (i + 1))
    const vpsOn = vpsUrls.length > 0
    if (vpsOn) {
        const pp = config["proxy-providers"]
        if (!pp || typeof pp !== "object" || Array.isArray(pp)) config["proxy-providers"] = {}
        vpsUrls.forEach((url, i) => {
            config["proxy-providers"][vpsProviderNames[i]] = {
                type: "http",
                url,
                // 订阅经「⚡ 节点选择」（机场节点）下载：国内直连海外 VPS 的明文 http 常被重置（EOF）
                proxy: PROXY,
                path: "./providers/" + vpsProviderNames[i] + ".yaml",
                interval: 86400,
                "health-check": {
                    enable: true,
                    url: "https://www.gstatic.com/generate_204",
                    interval: 300,
                    timeout: 5000,
                },
            }
        })
    }
    // 主组：机场节点；启用 VPS 订阅时不把 VPS 节点放进主组（订阅自带的其他 provider 仍保留）
    const otherProviders = Object.keys(config["proxy-providers"] || {}).filter((n) => !vpsProviderNames.includes(n))
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
        { name: MAIL, type: "select", proxies: [PROXY] },
        { name: AI, type: "select", proxies: [PROXY] },
        ...companyProxyGroups(vpsOn, otherProviders),
    ]

    // ---- 2. 规则集 (MetaCubeX .mrs) ----
    const mrs = (behavior, kind, name, key) => ({
        type: "http",
        behavior,
        format: "mrs",
        url: MRS_BASE + "/" + kind + "/" + name + ".mrs",
        path: "./ruleset/meta/" + kind + "-" + (key || name) + ".mrs",
        interval: 86400,
        proxy: PROXY,
    })
    config["rule-providers"] = {
        ai: mrs("domain", "geosite", "category-ai-!cn", "ai"),
        google: mrs("domain", "geosite", "google", "company-google"),
        google_ai: mrs("domain", "geosite", "google-deepmind", "company-google-deepmind"),
        youtube: mrs("domain", "geosite", "youtube", "company-youtube"),
        cn: mrs("domain", "geosite", "cn"),
        cncidr: mrs("ipcidr", "geoip", "cn"),
    }

    // ---- 3. 规则 ----
    config.rules = [
        // 局域网 / 私网 IP 直连
        ...LAN_CIDRS.map((c) => "IP-CIDR," + c + ",DIRECT,no-resolve"),
        ...ANTHROPIC_IPV6_REJECT_RULES,
        googleQuicRule(),
        // 独立应用进程优先匹配（Google / AI / 住宅出口）
        ...GOOGLE_PROCESSES.map(p => `PROCESS-NAME,${p},${GOOGLE}`),
        ...AI_PROCESSES.map(p => `PROCESS-NAME,${p},${AI}`),
        ...HOMEPORT_PROCESSES.map(p => `PROCESS-NAME,${p},${HOMEPORT}`),

        // WebRTC/STUN 防泄漏：先走节点，节点不支持 UDP 则拒绝，不落到 DIRECT
        STUN_PORTS + "," + PROXY,
        STUN_PORTS + ",REJECT",
        // Foxmail 只走 MAIL 组
        ...MAIL_PROCESSES.map((p) => "AND,((PROCESS-NAME," + p + "),(NOT,((GEOIP,CN,no-resolve))))," + MAIL),
        ...MAIL_EXACT_DOMAINS.map((d) => "DOMAIN," + d + "," + MAIL),
        ...MAIL_SUFFIX_DOMAINS.map((d) => "DOMAIN-SUFFIX," + d + "," + MAIL),
        // 公司/内网域名直连
        ...INTRANET_DOMAINS.map((d) => "DOMAIN-SUFFIX," + d + ",DIRECT"),
        ...DIRECT_PUBLIC_DNS_DOMAINS.map((d) => "DOMAIN-SUFFIX," + d + ",DIRECT"),
        // Google / AI / 住宅出口分流
        ...companyAiRules(),
        ...companyDomainRules(),
        ...companyRemoteRules(),
        ...AI_EXACT_DOMAINS.map((d) => "DOMAIN," + d + "," + AI),
        ...AI_SUFFIX_DOMAINS.map((d) => "DOMAIN-SUFFIX," + d + "," + AI),
        "RULE-SET,ai," + AI,
        ...AI_IP_CIDRS.map((c) => "IP-CIDR," + c + "," + AI + ",no-resolve"),
        ...HOMEPORT_SUFFIX_DOMAINS.map((d) => "DOMAIN-SUFFIX," + d + "," + HOMEPORT),
        ...TELEMETRY_SUFFIX_DOMAINS.map((d) => "DOMAIN-SUFFIX," + d + "," + PROXY),
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
    return cyVpsSelectors(cyHarden20261103(config))
}

// 解析 WEBSHARE_PROXIES，生成绑定 dialer-proxy: HP_Relay 的 socks5/http 静态住宅代理节点
function cyParseWebshareProxies(list) {
    if (!Array.isArray(list)) return []
    const out = []
    list.forEach((raw) => {
        if (!raw) return
        if (typeof raw === "object") {
            const server = String(raw.server || "").trim()
            const port = Number(raw.port)
            if (!server || !Number.isFinite(port) || port <= 0) return
            const baseName = raw.name ? String(raw.name).trim() : `🏠 Webshare-${out.length + 1} (${server})`
            const name = baseName.startsWith("🏠") ? baseName : `🏠 ${baseName}`
            const node = {
                name,
                type: raw.type ? String(raw.type).trim() : "socks5",
                server,
                port,
                "dialer-proxy": raw["dialer-proxy"] || RELAY,
            }
            if (raw.username !== undefined && raw.username !== "") node.username = String(raw.username)
            if (raw.password !== undefined && raw.password !== "") node.password = String(raw.password)
            out.push(node)
            return
        }
        if (typeof raw !== "string") return
        let text = raw.trim()
        if (!text) return
        let customName = ""
        if (text.includes("|")) {
            const splitIndex = text.indexOf("|")
            customName = text.slice(0, splitIndex).trim()
            text = text.slice(splitIndex + 1).trim()
        }
        const parts = text.split(":")
        if (parts.length < 2) return
        const server = parts[0].trim()
        const port = Number(parts[1].trim())
        const username = parts[2] !== undefined ? parts[2].trim() : ""
        const password = parts.slice(3).join(":").trim()
        if (!server || !Number.isFinite(port) || port <= 0) return
        const baseName = customName || `🏠 Webshare-${out.length + 1} (${server})`
        const name = baseName.startsWith("🏠") ? baseName : `🏠 ${baseName}`
        const node = {
            name,
            type: "socks5",
            server,
            port,
            "dialer-proxy": RELAY,
        }
        if (username) node.username = username
        if (password) node.password = password
        out.push(node)
    })
    return out
}

// 重建业务选择组与 Homeport 链式住宅代理组（MAIL / AI / GOOGLE / 🏠 住宅出口 / HP_Relay）
function cyVpsSelectors(config) {
    const homeportProxies = cyParseWebshareProxies(typeof WEBSHARE_PROXIES !== "undefined" ? WEBSHARE_PROXIES : [])
    const homeportNames = homeportProxies.map(p => p.name)
    if (homeportProxies.length) {
        if (!Array.isArray(config.proxies)) config.proxies = []
        config.proxies = config.proxies.filter(p => p && !homeportNames.includes(p.name)).concat(homeportProxies)
    }

    const extra = typeof VPS_EXTRA_FILTER === "string" && VPS_EXTRA_FILTER.trim() !== "" ? "|" + VPS_EXTRA_FILTER.trim() : ""
    const pattern = "NovixLink|Webshare|^XUI-Direct$|^(WARP|VPNGate|Direct)-(Reality|Hy2)$" + extra
    const excluded = new RegExp(NODE_FILTER.replace("(?i)", ""), "i")
    const names = [...new Set((config.proxies || []).filter(p => p && !homeportNames.includes(p.name) && new RegExp(pattern, "i").test(p.name) && !excluded.test(p.name)).map(p => p.name))]

    const vpsProviderNames = Object.keys(config["proxy-providers"] || {}).filter(k => /^my-vps(-\d+)?$/.test(k))
    const allProviders = Object.keys(config["proxy-providers"] || {})
    const vpsProviders = allProviders.filter(k => vpsProviderNames.includes(k))
    const otherProviders = allProviders.filter(k => !vpsProviderNames.includes(k))
    const mainExclude = homeportNames.length ? NODE_FILTER.replace("(?i)(", "(?i)(^🏠|") : NODE_FILTER

    config["proxy-groups"] = (config["proxy-groups"] || []).map(g => {
        if (!g || g.name !== PROXY) return g
        const next = Object.assign({}, g, { "exclude-filter": mainExclude })
        if (vpsProviders.length) {
            next["include-all-proxies"] = true
            delete next["include-all"]
            if (otherProviders.length) next.use = otherProviders
            else delete next.use
        }
        return next
    })

    const pool = { ...(vpsProviderNames.length ? { use: vpsProviderNames } : {}), "exclude-filter": NODE_FILTER, "empty-fallback": "REJECT" }
    const relayPool = vpsProviders.length
        ? { "include-all-proxies": true, ...(otherProviders.length ? { use: otherProviders } : {}) }
        : { "include-all": true }

    config["proxy-groups"] = config["proxy-groups"].filter(g => ![MAIL, AI, GOOGLE, HOMEPORT, RELAY].includes(g.name)).concat([
        { name: MAIL, type: "select", ...pool, proxies: [...homeportNames, ...names, HOMEPORT, PROXY] },
        { name: AI, type: "select", ...pool, proxies: [...homeportNames, ...names, HOMEPORT, PROXY] },
        { name: GOOGLE, type: "select", ...pool, proxies: [AI, HOMEPORT, ...homeportNames, ...names, PROXY] },
        { name: HOMEPORT, type: "select", ...pool, proxies: [...homeportNames, ...names, PROXY] },
        {
            name: RELAY,
            type: "select",
            proxies: [PROXY, "DIRECT"],
            ...relayPool,
            filter: RELAY_FILTER,
            "exclude-filter": RELAY_EXCLUDE,
        },
    ])
    return config
}

// =====================================================================
// 统一加固（所有 mihomo 脚本共用同一段，放在 main() 最后执行，覆盖前面的设置）
//   1) 自建 VPS IP 直连：IP-CIDR,216.36.82.250/32,DIRECT,no-resolve 放在第 1 条规则，
//      使用任何机场订阅时都能直接访问自己的 VPS（不经机场节点）。
//      RackNerd VPS（192.3.153.152）紧随其后同样直连，含 SSH(22)。
//   2) WebRTC 防泄漏：STUN/TURN 端口（3478-3481、5349、19302-19309）先走代理，
//      节点不支持 UDP 时立即 REJECT，绝不回落 DIRECT（防止暴露真实公网 IP）。
//   3) DNS 防泄漏，统一规则：
//      - 中国域名 + 公司/内网域名 + .lan/.local → system（当前网络的系统 DNS，公司/家里自动切换，不写死 IP）
//      - 其余外网域名、以及 IP 规则需要的解析 → 外网加密 DoH（Google 8.8.8.8 / Cloudflare 1.1.1.1），经代理发出
//      - 不使用 fallback（避免回落到明文/国内 DNS），fake-ip 模式，关闭 IPv6 解析
//      - 机场节点域名用加密 DoH（阿里 / 腾讯，按 IP 写），节点必须直连才能解析，所以不走代理
//   4) 业务分组与住宅代理：由 cyVpsSelectors 重建为纯手选组；支持 VPS_URLS 与 WEBSHARE_PROXIES 双轨并行。
// =====================================================================
const CY_VPS_IP_RULE = "IP-CIDR,216.36.82.250/32,DIRECT,no-resolve"
// RackNerd VPS 直连（含 SSH；经机场节点连接会被断开），紧随 VPS 规则
const CY_RACKNERD_IP_RULES = ["IP-CIDR,192.3.153.152/32,DIRECT,no-resolve"]
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
    const policies = [PROXY, CY_MAIL, CY_AI, GOOGLE, HOMEPORT]
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
    rules = rules.filter((r) => !(typeof r === "string" && (/^IP-CIDR,(216\.36\.82\.250|192\.3\.153\.152|47\.242\.128\.61)\/32,/.test(r) || /^AND,\(\(IP-CIDR,216\.36\.82\.250\//.test(r))))
    const matchRule = rules.find((r) => typeof r === "string" && /^MATCH,/.test(r))
    const groups = Array.isArray(config["proxy-groups"]) ? config["proxy-groups"] : []
    let proxy = matchRule ? matchRule.split(",")[1].trim() : ""
    if (!proxy || proxy === "DIRECT" || proxy === "REJECT") proxy = groups.length ? groups[0].name : "DIRECT"

    const head = [...(proxy && proxy !== "DIRECT" ? [CY_VPS_SSH_MATCH + "," + proxy] : []), CY_VPS_IP_RULE, ...CY_RACKNERD_IP_RULES, ...CY_AIRPORT_IP_RULES]

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
        head.splice(head.indexOf(CY_VPS_IP_RULE) + 1 + CY_RACKNERD_IP_RULES.length + CY_AIRPORT_IP_RULES.length, 0, ...uniq)
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
