// Future Self — Background Service Worker
// Intercepts navigation and redirects blocked sites during the sleep window.
// Uses Supabase for authentication and trial tracking.

importScripts("supabase-client.js");

// Default blocklist with categories
var DEFAULT_BLOCKLIST = {
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

var WORK_AI_CATEGORIES = ["Work & Productivity", "AI & Research Tools"];

function timeToMinutes(timeStr) {
  var parts = timeStr.split(":").map(Number);
  return parts[0] * 60 + parts[1];
}

function isInBlockWindow(nowMinutes, blockStartMinutes, wakeMinutes) {
  if (blockStartMinutes <= wakeMinutes) {
    return nowMinutes >= blockStartMinutes && nowMinutes < wakeMinutes;
  }
  return nowMinutes >= blockStartMinutes || nowMinutes < wakeMinutes;
}

function extractDomain(urlStr) {
  try {
    var url = new URL(urlStr);
    return url.hostname.replace(/^www\./, "");
  } catch (e) {
    return null;
  }
}

function checkBlocklist(domain, blocklist) {
  for (var category in blocklist) {
    var domains = blocklist[category];
    for (var i = 0; i < domains.length; i++) {
      if (domain === domains[i] || domain.endsWith("." + domains[i])) {
        return { blocked: true, domain: domains[i], category: category };
      }
    }
  }
  return { blocked: false };
}

function checkDayBlocklist(domain, blocklist) {
  for (var i = 0; i < blocklist.length; i++) {
    if (domain === blocklist[i] || domain.endsWith("." + blocklist[i])) {
      return blocklist[i];
    }
  }
  return null;
}

async function hasActiveOverride(domain) {
  var data = await chrome.storage.local.get("futureself_overrides");
  var overrides = data.futureself_overrides || [];
  var now = Date.now();
  return overrides.some(function (o) {
    return o.domain === domain && o.expiresAt > now;
  });
}

async function incrementBlockCount() {
  var data = await chrome.storage.local.get("futureself_blockedTonight");
  var count = data.futureself_blockedTonight || 0;
  await chrome.storage.local.set({ futureself_blockedTonight: count + 1 });
}

// Check auth status — uses Supabase with local cache fallback
async function getAuthStatus() {
  try {
    return await SupabaseAuth.checkAuthStatus();
  } catch (e) {
    var cached = await chrome.storage.local.get("futureself_auth_status");
    return cached.futureself_auth_status || {
      isLoggedIn: false,
      isTrialActive: false,
      isPaid: false,
      trialHoursLeft: 0,
      email: null
    };
  }
}

function updateBadge() {
  chrome.storage.local.get([
    "futureself_pomodoro_active",
    "futureself_pomodoro_end_ts",
    "futureself_pomodoro_on_break"
  ], function (data) {
    if (data.futureself_pomodoro_active && !data.futureself_pomodoro_on_break) {
      var minutesRemaining = Math.ceil((data.futureself_pomodoro_end_ts - Date.now()) / 60000);
      chrome.action.setBadgeText({ text: String(minutesRemaining) });
      chrome.action.setBadgeBackgroundColor({ color: '#FBBF24' });
      chrome.action.setBadgeTextColor({ color: '#412402' });
    } else {
      chrome.action.setBadgeText({ text: '' });
    }
  });
}

chrome.storage.onChanged.addListener(function (changes) {
  var watched = ["futureself_pomodoro_active", "futureself_pomodoro_on_break", "futureself_pomodoro_end_ts"];
  if (watched.some(function (k) { return k in changes; })) {
    updateBadge();
  }
});

// Day Mode navigation handler
async function handleDayModeNavigation(details) {
  var domain = extractDomain(details.url);
  if (!domain) return;

  var now = Date.now();
  var nowDate = new Date(now);

  var dayData = await chrome.storage.local.get([
    "futureself_pomodoro_active",
    "futureself_pomodoro_end_ts",
    "futureself_pomodoro_on_break",
    "futureself_pomodoro_break_end_ts",
    "futureself_pomodoro_break",
    "futureself_pomodoro_session_count",
    "futureself_schedule_enabled",
    "futureself_schedule_start",
    "futureself_schedule_end",
    "futureself_schedule_days",
    "futureself_day_blocklist"
  ]);

  var dayBlocklist = dayData.futureself_day_blocklist || [];

  // ── POMODORO ──────────────────────────────────────────────────
  if (dayData.futureself_pomodoro_active) {
    var endTs = dayData.futureself_pomodoro_end_ts || 0;

    if (now >= endTs) {
      // Session timer expired — auto-end, start break
      var breakMs = (dayData.futureself_pomodoro_break || 10) * 60 * 1000;
      console.log("[FutureSelf Day] Pomodoro session expired, starting break");
      await chrome.storage.local.set({
        futureself_pomodoro_active: false,
        futureself_pomodoro_on_break: true,
        futureself_pomodoro_break_end_ts: now + breakMs
      });
      return; // break has started, allow navigation
    }

    // Session still active — check domain against day blocklist
    var matched = checkDayBlocklist(domain, dayBlocklist);
    if (matched) {
      console.log("[FutureSelf Day] Pomodoro blocking:", domain);
      chrome.tabs.update(details.tabId, {
        url: chrome.runtime.getURL(
          "blocked.html?site=" + encodeURIComponent(matched) + "&mode=day&reason=pomodoro"
        )
      });
    } else {
      console.log("[FutureSelf Day] Pomodoro active — domain not blocked:", domain);
    }
    return; // pomodoro is authoritative, never fall through to schedule
  }

  // ── BREAK ─────────────────────────────────────────────────────
  if (dayData.futureself_pomodoro_on_break) {
    var breakEndTs = dayData.futureself_pomodoro_break_end_ts || 0;
    if (now < breakEndTs) {
      console.log("[FutureSelf Day] On break — allowing navigation");
      return;
    }
    // Break has expired — clean up, do NOT auto-start next session
    var newCount = (dayData.futureself_pomodoro_session_count || 0) + 1;
    console.log("[FutureSelf Day] Break expired, session count:", newCount);
    await chrome.storage.local.set({
      futureself_pomodoro_on_break: false,
      futureself_pomodoro_break_end_ts: null,
      futureself_pomodoro_session_count: newCount
    });
    // Fall through to schedule check
  }

  // ── SCHEDULE ──────────────────────────────────────────────────
  if (!dayData.futureself_schedule_enabled) {
    console.log("[FutureSelf Day] Schedule disabled — allowing navigation");
    return;
  }

  var dayNames = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  var todayName = dayNames[nowDate.getDay()];
  var schedDays = dayData.futureself_schedule_days || ["mon", "tue", "wed", "thu", "fri"];
  if (!schedDays.includes(todayName)) {
    console.log("[FutureSelf Day] Schedule not active today:", todayName);
    return;
  }

  var nowMinutes = nowDate.getHours() * 60 + nowDate.getMinutes();
  var startMinutes = timeToMinutes(dayData.futureself_schedule_start || "10:00");
  var endMinutes = timeToMinutes(dayData.futureself_schedule_end || "13:00");
  if (nowMinutes < startMinutes || nowMinutes >= endMinutes) {
    console.log("[FutureSelf Day] Outside schedule window:", nowMinutes, "vs", startMinutes, "-", endMinutes);
    return;
  }

  var matched = checkDayBlocklist(domain, dayBlocklist);
  if (matched) {
    console.log("[FutureSelf Day] Schedule blocking:", domain);
    chrome.tabs.update(details.tabId, {
      url: chrome.runtime.getURL(
        "blocked.html?site=" + encodeURIComponent(matched) + "&mode=day&reason=schedule"
      )
    });
  } else {
    console.log("[FutureSelf Day] Schedule active — domain not blocked:", domain);
  }
}

// Main navigation handler
chrome.webNavigation.onBeforeNavigate.addListener(async function (details) {
  if (details.frameId !== 0) return;
  if (details.url.startsWith("chrome-extension://")) return;

  // If no access token, user is logged out — allow all navigation
  var tokenData = await chrome.storage.local.get("futureself_access_token");
  var token = tokenData.futureself_access_token;
  if (!token) return;

  var tabData = await chrome.storage.local.get("futureself_active_tab");
  var activeTab = tabData.futureself_active_tab || "night";

  // ── NIGHT MODE ────────────────────────────────────────────────
  if (activeTab === "night") {
    var config = await chrome.storage.local.get([
      "futureself_wakeTime", "futureself_blockStartTime",
      "futureself_blocklist", "futureself_setupComplete"
    ]);

    if (!config.futureself_setupComplete) return;

    var now = new Date();
    var nowMinutes = now.getHours() * 60 + now.getMinutes();
    var blockStartMinutes = timeToMinutes(config.futureself_blockStartTime);
    var wakeMinutes = timeToMinutes(config.futureself_wakeTime);

    if (!isInBlockWindow(nowMinutes, blockStartMinutes, wakeMinutes)) return;

    var domain = extractDomain(details.url);
    if (!domain) return;

    var result = checkBlocklist(domain, config.futureself_blocklist);
    if (!result.blocked) return;

    // Check auth status
    var authStatus = await getAuthStatus();

    if (!authStatus.isLoggedIn) {
      // Not logged in — redirect to login
      chrome.tabs.update(details.tabId, { url: chrome.runtime.getURL("login.html") });
      return;
    }

    if (!authStatus.isTrialActive && !authStatus.isPaid) {
      // Trial expired and not paid — show upgrade page
      var upgradeUrl = chrome.runtime.getURL(
        "upgrade.html?site=" + encodeURIComponent(result.domain)
      );
      chrome.tabs.update(details.tabId, { url: upgradeUrl });
      return;
    }

    // Trial active or paid — normal blocking
    var overridden = await hasActiveOverride(result.domain);
    if (overridden) return;

    await incrementBlockCount();

    var redirectUrl = chrome.runtime.getURL(
      "blocked.html?site=" + encodeURIComponent(result.domain) + "&category=" + encodeURIComponent(result.category)
    );

    chrome.tabs.update(details.tabId, { url: redirectUrl });
    return;
  }

  // ── DAY MODE ──────────────────────────────────────────────────
  await handleDayModeNavigation(details);
});

// Reset nightly counters at wake time
chrome.alarms.create("nightlyReset", { periodInMinutes: 1 });

// Periodic auth check every 30 minutes
chrome.alarms.create("authCheck", { periodInMinutes: 30 });

// Keep Pomodoro badge countdown live
chrome.alarms.create("futureself_badge_update", { periodInMinutes: 1 });

chrome.alarms.onAlarm.addListener(async function (alarm) {
  if (alarm.name === "authCheck") {
    await getAuthStatus();
    return;
  }

  if (alarm.name === "futureself_badge_update") {
    updateBadge();
    return;
  }

  if (alarm.name !== "nightlyReset") return;

  var config = await chrome.storage.local.get([
    "futureself_wakeTime", "futureself_setupComplete", "futureself_lastResetDate"
  ]);
  if (!config.futureself_setupComplete) return;

  var now = new Date();
  var todayStr = now.toDateString();

  if (config.futureself_lastResetDate === todayStr) return;

  var wakeMinutes = timeToMinutes(config.futureself_wakeTime);
  var nowMinutes = now.getHours() * 60 + now.getMinutes();

  if (nowMinutes >= wakeMinutes && nowMinutes < wakeMinutes + 5) {
    var streakData = await chrome.storage.local.get([
      "futureself_overrides", "futureself_streak"
    ]);
    var overrides = streakData.futureself_overrides || [];
    var streak = streakData.futureself_streak || 0;

    var blockStart = new Date();
    blockStart.setDate(blockStart.getDate() - 1);
    var lastNightOverrides = overrides.filter(function (o) {
      return new Date(o.createdAt) >= blockStart;
    });

    var streakBroken = lastNightOverrides.length > 0;
    var newStreak = streakBroken ? 0 : streak + 1;

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

// On install: open login page (user needs to authenticate first)
chrome.runtime.onInstalled.addListener(function (details) {
  if (details.reason === "install") {
    chrome.tabs.create({ url: chrome.runtime.getURL("login.html") });
  }

  var dayModeDefaults = {
    futureself_active_tab: "night",
    futureself_day_blocklist: [],
    futureself_schedule_enabled: false,
    futureself_schedule_start: "10:00",
    futureself_schedule_end: "13:00",
    futureself_schedule_days: ["mon", "tue", "wed", "thu", "fri"],
    futureself_pomodoro_active: false,
    futureself_pomodoro_duration: 45,
    futureself_pomodoro_break: 10,
    futureself_pomodoro_long_break: 15,
    futureself_pomodoro_long_break_after: 3,
    futureself_pomodoro_task: "",
    futureself_pomodoro_start_ts: null,
    futureself_pomodoro_end_ts: null,
    futureself_pomodoro_on_break: false,
    futureself_pomodoro_break_end_ts: null,
    futureself_pomodoro_session_count: 0,
    futureself_pomodoro_total_today: 0
  };

  chrome.storage.local.get(Object.keys(dayModeDefaults), function (existing) {
    var toSet = {};
    for (var key in dayModeDefaults) {
      if (existing[key] === undefined) {
        toSet[key] = dayModeDefaults[key];
      }
    }
    if (Object.keys(toSet).length > 0) {
      chrome.storage.local.set(toSet);
    }
  });
});

// Receive auth tokens from futureself.joinhustleclub.com web app
chrome.runtime.onMessageExternal.addListener(function (message, sender, sendResponse) {
  if (!message || message.type !== "FUTURESELF_AUTH_TOKENS") return;

  var toStore = {};
  if (message.access_token) {
    toStore.futureself_access_token = message.access_token;
  }
  if (message.refresh_token) {
    toStore.futureself_refresh_token = message.refresh_token;
  }
  if (message.expires_in) {
    toStore.futureself_token_expires_at = Date.now() + (message.expires_in * 1000);
  }
  if (message.user && message.user.email) {
    toStore.futureself_user_email = message.user.email;
  }

  chrome.storage.local.set(toStore).then(function () {
    sendResponse({ ok: true });
  }).catch(function (err) {
    sendResponse({ ok: false, error: err && err.message });
  });

  return true; // keep message channel open for async sendResponse
});

chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
  if (message.type === 'SUPABASE_SESSION') {
    chrome.storage.local.set({ supabase_session: message.session }, () => {
      sendResponse({ success: true });
    });
    return true;
  }
});

// Sync badge on service worker startup (after Chrome restarts the service worker)
updateBadge();
