// ===== cy-rules.js v2.12 | iPhone「Clash」App / Clash Verge Rev 订阅覆写脚本（mihomo）=====
// 最后更新：2026-11-04 15:56 UTC+8
// 用途：与 Shadowrocket cy.conf 同一套分流（国内直连、海外代理、AI/交易所分地区），自建 VPS 216.36.82.250 直连；
//       DNS / WebRTC 防泄漏（中国+内网=system，外网=DoH 经代理；STUN 不回落直连）。手机用 Gmail App，无 Foxmail 规则。
// 用法：配置详情 → 覆写脚本 → 用 raw 链接导入，保存并选中；每个订阅都选上。公司域名在 COMPANY_DOMAINS。
// 最新改动 2026-11-04：my-vps 订阅经代理组下载；VPS_URL 留空时 Foxmail 跟随主组。历史版本见私有仓库 git 记录。
// 2026-11-04：大航海机场订阅 IP 直连（面板拒绝代理连接），紧随 VPS 规则。
// 2026-11-04：VPS 的 SSH（22 端口）走节点选择（国内直连被阻断），VPS 其余流量仍直连。
// 2026-11-04：统一 no-resolve（GEOIP,CN 及含 IP 的规则集全部加 no-resolve，不再为判断 IP 而解析域名）；头部加最后更新时间。
const INFO_FILTER = "(?i)(剩余|剩餘|流量|到期|官网|官網|套餐|重置|公告|客服|traffic|expire|remaining|reset)";
const TEST_URL = "https://www.gstatic.com/generate_204";

const G_SELECT = "CY 节点选择";
const G_STABLE = "CY 稳定自动";
const G_PROXY = "PROXY";
const G_PH = "CY 🇵🇭 菲律宾最快";
const G_TW = "CY 🇹🇼 台湾最快";
const G_UK = "CY 🇬🇧 英国最快";
const G_EU = "CY 🇪🇺 欧盟最快";
const G_BYBIT = "CY Bybit";

const F_PH = "(?i)^.*(🇵🇭|菲律宾|菲律賓|马尼拉|馬尼拉|宿务|宿霧|\\b((PH|PHL|MNL|CEB|Philippines|Manila|Cebu)([-_ ]?[0-9]+)?)\\b).*$";
const F_TW = "(?i)^.*(🇹🇼|台湾|台灣|臺灣|台北|臺北|台中|臺中|高雄|新北|桃园|桃園|\\b((TW|TWN|TPE|TSA|KHH|Taiwan|Taipei|Taichung|Kaohsiung)([-_ ]?[0-9]+)?)\\b).*$";
const F_UK = "(?i)^.*(🇬🇧|英国|英國|伦敦|倫敦|曼彻斯特|曼徹斯特|\\b((UK|GB|GBR|LHR|LGW|MAN|London|Manchester)([-_ ]?[0-9]+)?|United Kingdom|Britain)\\b).*$";
const F_EU = "(?i)^.*(🇪🇺|欧盟|歐盟|欧洲|歐洲|荷兰|荷蘭|德国|德國|法国|法國|爱尔兰|愛爾蘭|奥地利|奧地利|比利时|比利時|西班牙|意大利|義大利|法兰克福|法蘭克福|阿姆斯特丹|巴黎|都柏林|维也纳|維也納|\\b((EU|EUR|NL|NLD|DE|DEU|FR|FRA|IE|IRL|AT|AUT|BE|BEL|ES|ESP|IT|ITA|AMS|CDG|DUB|VIE|MAD|BCN)([-_ ]?[0-9]+)?)\\b|Netherlands|Germany|France|Ireland|Austria|Belgium|Amsterdam|Frankfurt|Paris|Dublin).*$";
const F_STABLE = "(?i)^.*(🇹🇼|🇭🇰|🇸🇬|🇯🇵|台湾|台灣|臺灣|台北|臺北|台中|臺中|高雄|新北|桃园|桃園|香港|新加坡|狮城|獅城|日本|东京|東京|大阪|名古屋|Taiwan|Taipei|Hong Kong|HongKong|Singapore|Japan|Tokyo|Osaka|\\b((TW|TWN|HK|HKG|SG|SGP|JP|JPN|TPE|TSA|KHH|SIN|NRT|HND|KIX|NGO)([-_ ]?[0-9]+)?)\\b).*$";

const COMPANY_DOMAINS = [
  "huitone.com", "huinor.com", "synology.me",
  "kunyi-gzzc.com", "kunyi-gz.com", "kunqi-dev.com", "kunqi-demo.com", "kunqi-test.com",
  "kunyi-pro", "kunqi-gz", "jiandui.online", "ooioo.work"
];

const CN_DIRECT_SUFFIX = [
  "cn", "中国",
  "qq.com", "weixin.qq.com", "weixin.com", "wechat.com", "weixinbridge.com",
  "servicewechat.com", "wx.qq.com", "qpic.cn", "qlogo.cn", "gtimg.cn", "gtimg.com",
  "idqqimg.com", "myapp.com", "tencent.com", "tenpay.com", "qcloud.com", "myqcloud.com",
  "cdn-go.cn", "weiyun.com", "tencent-cloud.net",
  "alipay.com", "alipayobjects.com", "taobao.com", "tmall.com", "alicdn.com",
  "aliyun.com", "aliyuncs.com", "alibaba.com", "aliapp.org", "mmstat.com",
  "baidu.com", "bdstatic.com", "bdimg.com",
  "weibo.com", "sina.com", "sinaimg.cn", "sinajs.cn",
  "jd.com", "360buyimg.com", "jd.hk",
  "meituan.com", "meituan.net", "dianping.com", "dpfile.com",
  "pinduoduo.com", "yangkeduo.com",
  "douyin.com", "iesdouyin.com", "snssdk.com", "toutiao.com", "bytedance.com", "byteimg.com",
  "bilibili.com", "biliapi.net", "biliapi.com", "hdslb.com", "b23.tv",
  "iqiyi.com", "iqiyipic.com", "youku.com", "ykimg.com", "mgtv.com",
  "163.com", "126.com", "127.net", "netease.com", "yeah.net",
  "xiaomi.com", "mi.com", "miui.com", "xiaomi.net",
  "huawei.com", "hicloud.com", "honor.com",
  "xiaohongshu.com", "xhscdn.com", "xhslink.com",
  "zhihu.com", "zhimg.com",
  "kuaishou.com", "yximgs.com",
  "douyu.com", "huya.com",
  "ctrip.com", "qunar.com", "ly.com",
  "12306.cn", "rails.com.cn",
  "unionpay.com", "unionpaysecure.com", "chinapay.com",
  "dingtalk.com", "laiwang.com",
  "feishu.cn", "larksuite.cn",
  "wework.com",
  "wps.cn", "ksosoft.com",
  "suning.com", "vip.com", "kaola.com",
  "sohu.com", "sohucs.com", "ifeng.com", "cctv.com",
  "360.cn", "360.com", "qhimg.com",
  "sm.cn", "uc.cn", "ucweb.com",
  "amap.com", "autonavi.com", "gaode.com"
];

const CN_DIRECT_KEYWORD = [
  "weixin", "wechat", "qpic", "tencent",
  "alipay", "alicdn", "aliyun", "taobao", "tmall",
  "baidu", "weibo", "bilibili", "qiyi",
  "douyin", "toutiao", "xiaohongshu",
  "pinduoduo", "meituan", "dianping",
  "officecdn", "beplay", "hnagroup"
];

const MEXC_SUFFIX = [
  "mexc.com", "mexc.link", "mexc.app", "mexc.live", "mexc.zone",
  "mxc.com", "mxc.ai", "mexc-api.com", "mexcapi.com", "mexccdn.com", "mxcapi.com"
];

const BYBIT_EU_SUFFIX = ["bybit.eu", "bybit.nl"];
const BYBIT_EU_EXACT = ["api.bybit.eu", "testnet.bybit.eu", "www.bybit.eu"];
const BYBIT_GLOBAL_SUFFIX = [
  "bybit.com", "bybit.global", "bybit.biz", "bybit.cloud",
  "bybit-global.com", "bybitglobal.com", "bytick.com",
  "bybit.tr", "bybit-tr.com", "bybit.kz", "bybitgeorgia.ge",
  "bybit.ae", "bybit.id", "byhkbit.com"
];
const BYBIT_GLOBAL_EXACT = ["bybit-exchange.github.io", "bybit.ada.support"];
const BYBIT_SHARED_SUFFIX = [
  "byapis.com", "bycsi.com", "bycbe.com", "bymj.io", "byffbb.com",
  "bybit-aws.com", "bybdc6.com", "byabcde.com", "byapps.net",
  "byd3c3.com", "bybits.org"
];
const PAYPAL_SUFFIX = ["paypal.com", "paypalobjects.com", "paypal.me"];
const AI_SUFFIX = [
  "chatgpt.com", "openai.com", "openaiapi.com", "oaiusercontent.com", "oaistatic.com",
  "sora.com", "ai.com", "anthropic.com", "claude.ai", "claudeusercontent.com",
  "gemini.google.com", "aistudio.google.com", "makersuite.google.com", "notebooklm.google.com",
  "generativelanguage.googleapis.com", "proactivebackend-pa.googleapis.com",
  "x.ai", "grok.com", "githubcopilot.com", "github.com", "githubusercontent.com",
  "perplexity.ai", "poe.com", "quora.com", "cursor.com", "cursor.sh", "cursorapi.com",
  "huggingface.co", "hf.co", "hf.space", "cdn-lfs.huggingface.co",
  "mistral.ai", "meta.ai", "you.com", "phind.com", "character.ai",
  "replicate.com", "together.ai", "cohere.com", "groq.com", "fireworks.ai"
];
const AI_EXACT = ["copilot.microsoft.com", "alkalimena-pa.clients6.google.com"];
const GOOGLE_QUIC = [
  "google.com", "googleapis.com", "gstatic.com", "googleusercontent.com",
  "ggpht.com", "googlevideo.com", "youtube.com", "youtu.be", "ytimg.com",
  "youtubei.googleapis.com", "youtube-nocookie.com", "googleadservices.com"
];

function urlTestGroup(name, filter, interval, tolerance) {
  return {
    name: name,
    type: "url-test",
    url: TEST_URL,
    interval: interval || 600,
    timeout: 5000,
    tolerance: tolerance == null ? 50 : tolerance,
    filter: filter,
    "exclude-filter": INFO_FILTER,
    "include-all": true
  };
}

function clashToJsRegExp(filter) {
  var src = String(filter || "");
  var flags = "";
  if (src.indexOf("(?i)") === 0) {
    src = src.slice(4);
    flags = "i";
  }
  src = src.split("(?i)").join("");
  try {
    return new RegExp(src, flags);
  } catch (e) {
    return null;
  }
}

function usableNodeNames(config) {
  const reInfo = clashToJsRegExp(INFO_FILTER);
  const list = Array.isArray(config.proxies) ? config.proxies : [];
  const out = [];
  for (let i = 0; i < list.length; i++) {
    const n = list[i] && list[i].name;
    if (n && (!reInfo || !reInfo.test(n))) out.push(n);
  }
  return out;
}

function filterHasNodes(names, filter) {
  const re = clashToJsRegExp(filter);
  if (!re) return false;
  for (let i = 0; i < names.length; i++) {
    if (re.test(names[i])) return true;
  }
  return false;
}

function blockQuicThen(matcher, policy) {
  return [
    "AND,((NETWORK,udp),(DST-PORT,443),(" + matcher + ")),REJECT",
    matcher + "," + policy
  ];
}

function suffixRules(list, policy) {
  const out = [];
  for (let i = 0; i < list.length; i++) {
    Array.prototype.push.apply(out, blockQuicThen("DOMAIN-SUFFIX," + list[i], policy));
  }
  return out;
}

function exactRules(list, policy) {
  const out = [];
  for (let i = 0; i < list.length; i++) {
    Array.prototype.push.apply(out, blockQuicThen("DOMAIN," + list[i], policy));
  }
  return out;
}

function keywordRules(list, policy) {
  const out = [];
  for (let i = 0; i < list.length; i++) {
    Array.prototype.push.apply(out, blockQuicThen("DOMAIN-KEYWORD," + list[i], policy));
  }
  return out;
}

function directSuffix(list) {
  const out = [];
  for (let i = 0; i < list.length; i++) out.push("DOMAIN-SUFFIX," + list[i] + ",DIRECT");
  return out;
}

function directKeyword(list) {
  const out = [];
  for (let i = 0; i < list.length; i++) out.push("DOMAIN-KEYWORD," + list[i] + ",DIRECT");
  return out;
}

function main(config) {
  if (!config || typeof config !== "object" || Array.isArray(config)) {
    throw new Error("CY: 配置无效");
  }
  const nodes = Array.isArray(config.proxies) ? config.proxies : [];
  if (!nodes.length && !Object.keys(config["proxy-providers"] || {}).length) {
    throw new Error("CY: 请在已有节点的配置中使用");
  }

  config["tcp-concurrent"] = true;

  const available = usableNodeNames(config);
  const hasPH = filterHasNodes(available, F_PH);
  const hasTW = filterHasNodes(available, F_TW);
  const hasUK = filterHasNodes(available, F_UK);
  const hasEU = filterHasNodes(available, F_EU);

  const phPolicy = hasPH ? G_PH : G_STABLE;
  const twPolicy = hasTW ? G_TW : G_STABLE;
  const ukPolicy = hasUK ? G_UK : G_STABLE;
  const euPolicy = hasEU ? G_EU : G_STABLE;

  const groups = [];
  if (hasPH) groups.push(urlTestGroup(G_PH, F_PH));
  if (hasTW) groups.push(urlTestGroup(G_TW, F_TW));
  if (hasUK) groups.push(urlTestGroup(G_UK, F_UK));
  if (hasEU) groups.push(urlTestGroup(G_EU, F_EU));
  groups.push(urlTestGroup(G_STABLE, F_STABLE, 1800, 150));

  const selectProxies = [G_STABLE];
  if (hasTW) selectProxies.push(G_TW);
  if (hasPH) selectProxies.push(G_PH);
  if (hasUK) selectProxies.push(G_UK);
  if (hasEU) selectProxies.push(G_EU);
  groups.push({
    name: G_SELECT,
    type: "select",
    proxies: selectProxies,
    "exclude-filter": INFO_FILTER,
    "include-all": true
  });
  groups.push({
    name: G_PROXY,
    type: "select",
    proxies: [G_STABLE, G_SELECT]
  });

  const bybitProxies = [];
  if (hasEU) bybitProxies.push(G_EU);
  if (hasTW) bybitProxies.push(G_TW);
  bybitProxies.push(G_STABLE, G_SELECT);
  groups.push({
    name: G_BYBIT,
    type: "select",
    proxies: bybitProxies
  });

  // [2026-11-03] 原 Sydney-Moses/Network-Profiles 的 .mrs 链接已 404，改用 MetaCubeX meta-rules-dat（GitHub raw，每日更新），
  //              并经 PROXY 组下载（国内直连 raw.githubusercontent.com 常失败）。规则集名称不变。
  const providers = {
    "CY-Apple_Domain": {
      type: "http",
      behavior: "domain",
      format: "mrs",
      interval: 86400,
      url: "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/apple.mrs",
      path: "./rules/cy-meta-apple.mrs",
      proxy: G_PROXY
    },
    "CY-ChinaMax_Domain": {
      type: "http",
      behavior: "domain",
      format: "mrs",
      interval: 86400,
      url: "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/cn.mrs",
      path: "./rules/cy-meta-geosite-cn.mrs",
      proxy: G_PROXY
    },
    "CY-ChinaMax_IP": {
      type: "http",
      behavior: "ipcidr",
      format: "mrs",
      interval: 86400,
      url: "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geoip/cn.mrs",
      path: "./rules/cy-meta-geoip-cn.mrs",
      proxy: G_PROXY
    }
  };

  const googleQuicOr = GOOGLE_QUIC.map(function (d) {
    return "(DOMAIN-SUFFIX," + d + ")";
  }).join(",");

  const rules = [].concat(
    [
      "DOMAIN,localhost,DIRECT",
      "DOMAIN-SUFFIX,local,DIRECT",
      "DOMAIN-SUFFIX,lan,DIRECT",
      "DOMAIN-SUFFIX,internal,DIRECT",
      "DOMAIN-SUFFIX,ls.apple.com,DIRECT",
      "DOMAIN,sequoia.apple.com,DIRECT",
      "DOMAIN,seed-sequoia.siri.apple.com,DIRECT",
      "DOMAIN,register.appattest.apple.com,DIRECT",
      "DOMAIN,captive.apple.com,DIRECT",
      "DOMAIN-SUFFIX,mesu.apple.com,DIRECT",
      "DOMAIN-SUFFIX,swscan.apple.com,DIRECT",
      "DOMAIN-SUFFIX,gdmf.apple.com,DIRECT",
      "DOMAIN-SUFFIX,ocsp.apple.com,DIRECT",
      "DOMAIN-SUFFIX,ess.apple.com,DIRECT"
    ],
    COMPANY_DOMAINS.map(function (d) { return "DOMAIN-SUFFIX," + d + ",DIRECT"; }),
    directSuffix(CN_DIRECT_SUFFIX),
    directKeyword(CN_DIRECT_KEYWORD),
    [
      "DOMAIN-SUFFIX,brightdata.com," + G_STABLE
    ],
    suffixRules(MEXC_SUFFIX, phPolicy),
    keywordRules(["mexc"], phPolicy),
    exactRules(BYBIT_EU_EXACT, euPolicy),
    suffixRules(BYBIT_EU_SUFFIX, euPolicy),
    suffixRules(BYBIT_SHARED_SUFFIX, G_BYBIT),
    exactRules(BYBIT_GLOBAL_EXACT, twPolicy),
    suffixRules(BYBIT_GLOBAL_SUFFIX, twPolicy),
    keywordRules(["bytick"], twPolicy),
    keywordRules(["bybit"], G_BYBIT),
    suffixRules(PAYPAL_SUFFIX, ukPolicy),
    suffixRules(AI_SUFFIX, G_STABLE),
    exactRules(AI_EXACT, G_STABLE),
    [
      "IP-CIDR,0.0.0.0/8,DIRECT,no-resolve",
      "IP-CIDR,10.0.0.0/8,DIRECT,no-resolve",
      "IP-CIDR,100.64.0.0/10,DIRECT,no-resolve",
      "IP-CIDR,127.0.0.0/8,DIRECT,no-resolve",
      "IP-CIDR,169.254.0.0/16,DIRECT,no-resolve",
      "IP-CIDR,172.16.0.0/12,DIRECT,no-resolve",
      "IP-CIDR,192.0.0.0/24,DIRECT,no-resolve",
      "IP-CIDR,192.0.2.0/24,DIRECT,no-resolve",
      "IP-CIDR,192.88.99.0/24,DIRECT,no-resolve",
      "IP-CIDR,192.168.0.0/16,DIRECT,no-resolve",
      "IP-CIDR,198.51.100.0/24,DIRECT,no-resolve",
      "IP-CIDR,203.0.113.0/24,DIRECT,no-resolve",
      "IP-CIDR,216.36.82.250/32,DIRECT,no-resolve",
      "IP-CIDR,224.0.0.0/4,DIRECT,no-resolve",
      "IP-CIDR,255.255.255.255/32,DIRECT,no-resolve",
      "IP-CIDR6,::1/128,DIRECT,no-resolve",
      "IP-CIDR6,fc00::/7,DIRECT,no-resolve",
      "IP-CIDR6,fe80::/10,DIRECT,no-resolve",
      "DOMAIN-KEYWORD,apple-support.akadns.net,DIRECT",
      "DOMAIN-KEYWORD,apple.com.akadns.net,DIRECT",
      "DOMAIN-KEYWORD,apple.com.edgekey.net,DIRECT",
      "DOMAIN-KEYWORD,buy.itunes.apple.com,DIRECT",
      "DOMAIN-KEYWORD,smp-device,DIRECT",
      "DOMAIN-KEYWORD,testflight,DIRECT",
      "DOMAIN-KEYWORD,icloud.com.akadns.net,DIRECT",
      "IP-CIDR,139.178.128.0/18,DIRECT,no-resolve",
      "IP-CIDR,144.178.0.0/19,DIRECT,no-resolve",
      "IP-CIDR,144.178.36.0/22,DIRECT,no-resolve",
      "IP-CIDR,144.178.48.0/20,DIRECT,no-resolve",
      "IP-CIDR,17.0.0.0/8,DIRECT,no-resolve",
      "IP-CIDR,192.35.50.0/24,DIRECT,no-resolve",
      "IP-CIDR,198.183.17.0/24,DIRECT,no-resolve",
      "IP-CIDR,205.180.175.0/24,DIRECT,no-resolve",
      "IP-CIDR,63.92.224.0/19,DIRECT,no-resolve",
      "IP-CIDR,65.199.22.0/23,DIRECT,no-resolve",
      "IP-CIDR6,2403:300::/32,DIRECT,no-resolve",
      "IP-CIDR6,2620:149::/32,DIRECT,no-resolve",
      "IP-CIDR6,2a01:b740::/32,DIRECT,no-resolve",
      "RULE-SET,CY-Apple_Domain,DIRECT",
      "DOMAIN-KEYWORD,stripe,DIRECT",
      "RULE-SET,CY-ChinaMax_Domain,DIRECT",
      "RULE-SET,CY-ChinaMax_IP,DIRECT,no-resolve",
      "GEOIP,CN,DIRECT,no-resolve",
      "AND,((NETWORK,udp),(DST-PORT,443),(OR,(" + googleQuicOr + "))),REJECT",
      "MATCH," + G_STABLE
    ]
  );

  const names = groups.map(function (g) { return g.name; });
  nodes.forEach(function (n) {
    if (names.indexOf(n.name) >= 0) throw new Error("CY: 节点与策略组重名: " + n.name);
  });
  config["proxy-groups"] = groups;

  const other = {};
  Object.keys(config).forEach(function (k) {
    if (k !== "rules" && k !== "rule-providers") other[k] = config[k];
  });
  const references = JSON.stringify(other);
  const kept = {};
  Object.keys(config["rule-providers"] || {}).forEach(function (k) {
    if (references.indexOf(k) >= 0) kept[k] = config["rule-providers"][k];
  });
  config["rule-providers"] = Object.assign(kept, providers);
  config.rules = rules;
  config.mode = "rule";
  return cyHarden20261103(config);
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

function cyHarden20261103(config) {
    let rules = Array.isArray(config.rules) ? config.rules.slice() : []
    // 去掉旧的 VPS IP 规则（可能没有 no-resolve 或位置靠后）
    rules = rules.filter((r) => !(typeof r === "string" && (/^IP-CIDR,(216\.36\.82\.250|47\.242\.128\.61)\/32,/.test(r) || /^AND,\(\(IP-CIDR,216\.36\.82\.250\//.test(r))))
    const matchRule = rules.find((r) => typeof r === "string" && /^MATCH,/.test(r))
    const groups = Array.isArray(config["proxy-groups"]) ? config["proxy-groups"] : []
    let proxy = matchRule ? matchRule.split(",")[1].trim() : ""
    if (!proxy || proxy === "DIRECT" || proxy === "REJECT") proxy = groups.length ? groups[0].name : "DIRECT"

    const head = [...(proxy && proxy !== "DIRECT" ? [CY_VPS_SSH_MATCH + "," + (groups.some((g) => g && g.name === G_SELECT) ? G_SELECT : proxy)] : []), CY_VPS_IP_RULE, ...CY_AIRPORT_IP_RULES]

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
