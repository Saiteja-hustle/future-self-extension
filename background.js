// Future Self — Background Service Worker
// Intercepts navigation and redirects blocked sites during the sleep window.

// Default blocklist with categories
const DEFAULT_BLOCKLIST = {
  "Social Media": [
    "facebook.com", "twitter.com", "x.com", "instagram.com",
    "reddit.com", "tiktok.com", "linkedin.com", "snapchat.com", "threads.net"
  ],
  "Entertainment": [
    "youtube.com", "netflix.com", "twitch.tv", "primevideo.com",
    "hotstar.com", "disneyplus.com", "hulu.com", "spotify.com"
  ],
  "Work & Productivity": [
    "docs.google.com", "sheets.google.com", "slides.google.com",
    "notion.so", "slack.com", "trello.com", "asana.com",
    "monday.com", "figma.com", "canva.com", "github.com", "gitlab.com"
  ],
  "AI & Research Tools": [
    "chatgpt.com", "chat.openai.com", "claude.ai",
    "gemini.google.com", "perplexity.ai", "copilot.microsoft.com", "bard.google.com"
  ],
  "News & Rabbit Holes": [
    "news.google.com", "cnn.com", "bbc.com", "nytimes.com",
    "medium.com", "substack.com", "quora.com", "wikipedia.org"
  ],
  "Shopping": [
    "amazon.com", "flipkart.com", "ebay.com", "myntra.com"
  ],
  "Email": [
    "mail.google.com", "outlook.live.com", "mail.yahoo.com"
  ]
};

const WORK_AI_CATEGORIES = ["Work & Productivity", "AI & Research Tools"];

function timeToMinutes(timeStr) {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
}

function isInBlockWindow(nowMinutes, blockStartMinutes, wakeMinutes) {
  if (blockStartMinutes <= wakeMinutes) {
    return nowMinutes >= blockStartMinutes && nowMinutes < wakeMinutes;
  }
  return nowMinutes >= blockStartMinutes || nowMinutes < wakeMinutes;
}

function extractDomain(urlStr) {
  try {
    const url = new URL(urlStr);
    return url.hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

function checkBlocklist(domain, blocklist) {
  for (const [category, domains] of Object.entries(blocklist)) {
    for (const blockedDomain of domains) {
      if (domain === blockedDomain || domain.endsWith("." + blockedDomain)) {
        return { blocked: true, domain: blockedDomain, category };
      }
    }
  }
  return { blocked: false };
}

async function hasActiveOverride(domain) {
  const { futureself_overrides: overrides = [] } = await chrome.storage.local.get("futureself_overrides");
  const now = Date.now();
  return overrides.some(
    (o) => o.domain === domain && o.expiresAt > now
  );
}

async function incrementBlockCount() {
  const { futureself_blockedTonight: blockedTonight = 0 } = await chrome.storage.local.get("futureself_blockedTonight");
  await chrome.storage.local.set({ futureself_blockedTonight: blockedTonight + 1 });
}

chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
  if (details.frameId !== 0) return;
  if (details.url.startsWith("chrome-extension://")) return;

  const config = await chrome.storage.local.get([
    "futureself_wakeTime", "futureself_blockStartTime",
    "futureself_blocklist", "futureself_setupComplete"
  ]);

  if (!config.futureself_setupComplete) return;

  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const blockStartMinutes = timeToMinutes(config.futureself_blockStartTime);
  const wakeMinutes = timeToMinutes(config.futureself_wakeTime);

  if (!isInBlockWindow(nowMinutes, blockStartMinutes, wakeMinutes)) return;

  const domain = extractDomain(details.url);
  if (!domain) return;

  const result = checkBlocklist(domain, config.futureself_blocklist);
  if (!result.blocked) return;

  const overridden = await hasActiveOverride(result.domain);
  if (overridden) return;

  await incrementBlockCount();

  const redirectUrl = chrome.runtime.getURL(
    `blocked.html?site=${encodeURIComponent(result.domain)}&category=${encodeURIComponent(result.category)}`
  );

  chrome.tabs.update(details.tabId, { url: redirectUrl });
});

// Reset nightly counters at wake time
chrome.alarms.create("nightlyReset", { periodInMinutes: 1 });

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name !== "nightlyReset") return;

  const config = await chrome.storage.local.get([
    "futureself_wakeTime", "futureself_setupComplete", "futureself_lastResetDate"
  ]);
  if (!config.futureself_setupComplete) return;

  const now = new Date();
  const todayStr = now.toDateString();

  if (config.futureself_lastResetDate === todayStr) return;

  const wakeMinutes = timeToMinutes(config.futureself_wakeTime);
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  if (nowMinutes >= wakeMinutes && nowMinutes < wakeMinutes + 5) {
    const { futureself_overrides: overrides = [], futureself_streak: streak = 0 } =
      await chrome.storage.local.get(["futureself_overrides", "futureself_streak"]);

    const blockStart = new Date();
    blockStart.setDate(blockStart.getDate() - 1);
    const lastNightOverrides = overrides.filter((o) => {
      const overrideTime = new Date(o.createdAt);
      return overrideTime >= blockStart;
    });

    const streakBroken = lastNightOverrides.length > 0;
    const newStreak = streakBroken ? 0 : streak + 1;

    await chrome.storage.local.set({
      futureself_streak: newStreak,
      futureself_blockedTonight: 0,
      futureself_overrides: [],
      futureself_lastResetDate: todayStr,
      futureself_shownQuestions: [],
      futureself_shownGamesTonight: []
    });
  }
});

// Open options page on install
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    chrome.tabs.create({ url: chrome.runtime.getURL("options.html") });
  }
});
