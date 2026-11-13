// ===== mihomo/sysproxy-loyalsoldier-v2.js v10.0 | 系统代理模式 + Loyalsoldier 规则（mihomo 覆写脚本·第二代）=====
// 最后更新：2026-11-13
// 第二代：与旧版 sysproxy-loyalsoldier.js（v9.x，VPS_URL 常量填写）并存；本版改用 VPS_URLS 数组，支持任意台数。
// 用途：同 tun-loyalsoldier-v2.js 的分流（Google 选择组（默认 AI/VPS，可手选）），但不开 TUN。系统代理管不到浏览器 UDP，WebRTC 需装浏览器防泄漏扩展或改用 TUN 版。
// 通用：VPS 216.36.82.250、RackNerd 192.3.153.152 直连置顶；中国+内网=系统 DNS，外网=DoH 经代理；STUN 不回落直连；无 WhatsApp。
// 用法：Bettbox / Clash Verge Rev / FlClash 的「覆写/脚本」里用 raw 链接导入并挂到订阅；关闭「覆写 DNS」（FlClash 还要关「追加系统 DNS」）。
// 分组：邮件 / AI / Google 均为纯手动选择组（select）；支持 NovixLink / Webshare、XUI-Direct 和 RackNerd Reality/Hy2 节点。
// 只在本机脚本副本填写 VPS_URLS 数组，仓库保持为空；公司域名改 COMPANY_DOMAINS。
// 更新日志：CHANGELOG.md
const PROXY = "⚡ 节点选择"
const MAIL = "📧 Foxmail"
const AI = "🤖 AI"

// ==================== 自建 VPS（仅在本机填写）====================
// 所有自建 VPS 的订阅链接（Clash/mihomo 格式）逐行粘贴到下面数组，一行一条，行尾保留英文逗号。
// 想要几台填几台（10 台也支持）；留空 [] 则不加载 VPS 订阅，Foxmail / AI / Google 跟随「⚡ 节点选择」。
// 填了之后，在 Bettbox 切任何机场订阅时，业务组都能直接手动点选这些 VPS 的节点（不自动切换）。
// 只在本机脚本副本里填写，切勿提交到仓库（会泄露订阅）！仓库保持为空。
// 通过链接更新脚本会覆盖这里填写的地址；建议把这份清单另存到本地私密文件，更新后一次粘贴回来。
const VPS_URLS = [
    // "https://example.com/vps-first",
    // "https://example.com/vps-second",
]
// 可选：默认候选之外额外匹配的节点名称（正则片段，与默认候选合并；一般留空）。
// 例：填 "MyVPS|美国VPS-" 后，名称含 MyVPS 或 美国VPS- 的节点也会进入邮件/AI/Google 组。
const VPS_EXTRA_FILTER = ""
// =====================================================================================


// jsDelivr（testingcf / cdn）在这台网络上会 tls bad record MAC 或 EOF。GitHub raw 直连更稳。
const RULE_CDN = "https://raw.githubusercontent.com/Loyalsoldier/clash-rules/release"
const META_YAML_BASE = "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo"

const NODE_FILTER =
    "(?i)(到期|剩余|过期|有效期|官网|官方|订阅|套餐|重置|流量|距离|网址|客服|expire|traffic|reset)"

// ---- 自定义高优先级规则 ----
// 用于修正规则集误判；按 Clash 规则格式逐行添加，越靠前优先级越高。
// 示例: 'DOMAIN-SUFFIX,example.com,' + PROXY,
// 示例: 'DOMAIN-SUFFIX,example.cn,DIRECT',
const CUSTOM_RULES = [
    'DOMAIN-SUFFIX,brightdata.com,' + PROXY,
]

// AI desktop processes: route application traffic through the AI group.
// Keep generic runtimes (browser, WebView and node) out of this list.
const AI_PROCESSES = [
    "ChatGPT.exe",
    "Claude.exe",
    "codex.exe",
]

// 海外 AI 高频静态域名兜底（配合每日自动更新的 category-ai-!cn 规则集，固定走 AI 组）
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

// 公司/内网域名: 一律直连，解析交给 DHCP / 系统 DNS。更多域名可加到这里。
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
    if (!config || typeof config !== "object") config = {}
    // ---- 0. 多 IP 并发建连，减少首连卡顿 ----
    config["tcp-concurrent"] = true
    if (!config["find-process-mode"] || config["find-process-mode"] === "off") config["find-process-mode"] = "strict"
    // ---- 1. 手动选择组 + Foxmail 组 + AI 组 ----
    // 自建 VPS provider（仅当 VPS_URLS 已在本机填写；按填写顺序自动编号 my-vps-1…N）
    const vpsUrls = Array.isArray(VPS_URLS) ? VPS_URLS.filter(u => typeof u === "string" && u.trim() !== "").map(u => u.trim()) : []
    const vpsProviderNames = vpsUrls.map((_, i) => "my-vps-" + (i + 1))
    const vpsOn = vpsUrls.length > 0
    if (vpsOn) {
        if (!config["proxy-providers"] || typeof config["proxy-providers"] !== "object" || Array.isArray(config["proxy-providers"])) {
            config["proxy-providers"] = {}
        }
        vpsUrls.forEach((url, i) => {
            config["proxy-providers"][vpsProviderNames[i]] = {
                type: "http",
                url,
                proxy: PROXY,
                interval: 86400,
                path: "./providers/" + vpsProviderNames[i] + ".yaml",
                "health-check": {
                    enable: true,
                    url: "https://www.gstatic.com/generate_204",
                    interval: 300,
                },
            }
        })
    }
    const otherProviders = Object.keys(config["proxy-providers"] || {}).filter(n => !vpsProviderNames.includes(n))

    config["proxy-groups"] = [
        {
            name: PROXY,
            type: "select",
            ...(vpsOn
                ? { "include-all-proxies": true, ...(otherProviders.length ? { use: otherProviders } : {}) }
                : { "include-all": true }),
            "exclude-filter": NODE_FILTER,
        },
        vpsOn
            ? {
                name: MAIL,
                type: "fallback",
                use: vpsProviderNames,
                url: "https://www.gstatic.com/generate_204",
                interval: 300,
                timeout: 5000,
                lazy: false,
            }
            : { name: MAIL, type: "select", proxies: [PROXY] },
        vpsOn
            ? {
                name: AI,
                type: "fallback",
                use: vpsProviderNames,
                url: "https://www.gstatic.com/generate_204",
                interval: 300,
                timeout: 5000,
                lazy: false,
            }
            : { name: AI, type: "select", proxies: [PROXY] },
        ...companyProxyGroups(vpsOn, otherProviders),
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

    const companyProvider = (name) => ({
        type: "http",
        behavior: "domain",
        format: "yaml",
        url: META_YAML_BASE + "/geosite/" + name + ".yaml",
        path: "./ruleset/loyalsoldier/company-" + name + ".yaml",
        interval: 86400,
        proxy: PROXY,
    })
    config["rule-providers"] = {
        reject: rp("domain", "reject"),
        icloud: rp("domain", "icloud"),
        apple: rp("domain", "apple"),
        // Loyalsoldier 无 AI 规则集，采用同源（v2fly domain-list-community）的 MetaCubeX 每日自动构建 YAML 版
        ai: {
            type: "http",
            behavior: "domain",
            url: META_YAML_BASE + "/geosite/category-ai-!cn.yaml",
            path: "./ruleset/loyalsoldier/ai.yaml",
            interval: 86400,
            proxy: PROXY,
        },
        google: companyProvider("google"),
        google_ai: companyProvider("google-deepmind"),
        youtube: companyProvider("youtube"),
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
        googleQuicRule(),
        // AI app traffic precedes generic STUN, domain and application rules.
        ...GOOGLE_PROCESSES.map(p => `PROCESS-NAME,${p},${GOOGLE}`),
        ...AI_PROCESSES.map(p => `PROCESS-NAME,${p},${AI}`),

        CY_STUN_PORTS + "," + PROXY,
        CY_STUN_PORTS + ",REJECT",

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
        // Google 先进入独立选择组，其余 AI 继续使用原 AI 分组。
        ...companyAiRules(),
        ...toExactRules(AI_EXACT_DOMAINS, AI),
        ...toSuffixRules(AI_SUFFIX_DOMAINS, AI),
        "RULE-SET,ai," + AI,
        // Discord 强制走节点，避免被 applications 规则误判直连。
        "DOMAIN-SUFFIX,discord.com," + PROXY,
        "DOMAIN-SUFFIX,discordapp.com," + PROXY,
        "DOMAIN-SUFFIX,discordapp.net," + PROXY,
        "DOMAIN-SUFFIX,discord.gg," + PROXY,
        "DOMAIN-SUFFIX,discord.media," + PROXY,
        "DOMAIN-SUFFIX,discordstatus.com," + PROXY,
        "DOMAIN-SUFFIX,discordcdn.com," + PROXY,
        // Loyalsoldier 标准顺序: direct/cncidr 在 gfw/tld-not-cn 之前。
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
        // GEOIP / 最终兜底。
        "GEOIP,LAN,DIRECT,no-resolve",

        // no-resolve：只按已知 IP 判断，不为匹配而解析域名（未命中域名规则的走 MATCH）。
        "GEOIP,CN,DIRECT,no-resolve",

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

    return cyVpsSelectors(cyHarden20261103(config))
}

// Separate client profiles are not merged; paste their subscription URLs into the local VPS_URLS array.
function cyVpsSelectors(config) {
    const extra = typeof VPS_EXTRA_FILTER === "string" && VPS_EXTRA_FILTER.trim() !== "" ? "|" + VPS_EXTRA_FILTER.trim() : ""
    const pattern = "NovixLink|Webshare|^XUI-Direct$|^(WARP|VPNGate|Direct)-(Reality|Hy2)$" + extra
    const filter = "(?i)(" + pattern + ")"
    const excluded = new RegExp(NODE_FILTER.replace("(?i)", ""), "i")
    const names = [...new Set((config.proxies || []).filter(p => p && new RegExp(pattern, "i").test(p.name) && !excluded.test(p.name)).map(p => p.name))]
    // Providers my-vps-1…N were created in main() from VPS_URLS; discover them by name here.
    const vpsProviderNames = Object.keys(config["proxy-providers"] || {}).filter(k => /^my-vps(-\d+)?$/.test(k))
    const allProviders = Object.keys(config["proxy-providers"] || {})
    const vpsProviders = allProviders.filter(k => vpsProviderNames.includes(k))
    const otherProviders = allProviders.filter(k => !vpsProviderNames.includes(k))
    if (vpsProviders.length) {
        config["proxy-groups"] = (config["proxy-groups"] || []).map(g => {
            if (!g || g.name !== PROXY) return g
            const next = Object.assign({}, g, { "include-all-proxies": true })
            delete next["include-all"]
            if (otherProviders.length) next.use = otherProviders
            else delete next.use
            return next
        })
    }
    const use = allProviders
    const pool = { ...(use.length ? { use, filter } : {}), "exclude-filter": NODE_FILTER, "empty-fallback": "REJECT" }
    config["proxy-groups"] = config["proxy-groups"].filter(g => ![MAIL, AI, GOOGLE].includes(g.name)).concat([
        { name: MAIL, type: "select", ...pool, proxies: [...names, PROXY] },
        { name: AI, type: "select", ...pool, proxies: [...names, PROXY] },
        { name: GOOGLE, type: "select", ...pool, proxies: [AI, ...names, PROXY] },
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
//   4) Foxmail 与 AI：业务分组由 cyVpsSelectors 重建为纯手选组；自建 VPS 订阅经顶部 VPS_URLS 数组加载。
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
    rules = rules.filter((r) => !(typeof r === "string" && (/^IP-CIDR,(216\.36\.82\.250|192\.3\.153\.152|47\.242\.128\.61)\/32,/.test(r) || /^AND,\(\(IP-CIDR,216\.36\.82\.250\//.test(r))))
    const matchRule = rules.find((r) => typeof r === "string" && /^MATCH,/.test(r))
    const groups = Array.isArray(config["proxy-groups"]) ? config["proxy-groups"] : []
    let proxy = matchRule ? matchRule.split(",")[1].trim() : ""
    if (!proxy || proxy === "DIRECT" || proxy === "REJECT") proxy = groups.length ? groups[0].name : "DIRECT"

    const head = [...(proxy && proxy !== "DIRECT" ? [CY_VPS_SSH_MATCH + "," + proxy] : []), CY_VPS_IP_RULE, ...CY_RACKNERD_IP_RULES, ...CY_AIRPORT_IP_RULES]

    // ---- Foxmail / Gmail 邮件规则（本脚本 main 不生成，还没有时由这里补上）----
    if (!rules.some((r) => typeof r === "string" && /PROCESS-NAME,Foxmail\.exe/.test(r))) {
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
