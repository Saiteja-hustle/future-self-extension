// Future Self — Popup Dashboard

(async function () {
  // Check auth status from Supabase
  var authStatus = await SupabaseAuth.checkAuthStatus();

  var config = await chrome.storage.local.get([
    "futureself_setupComplete", "futureself_wakeTime", "futureself_blockStartTime",
    "futureself_streak", "futureself_blockedTonight"
  ]);

  // Not logged in
  if (!authStatus.isLoggedIn) {
    document.getElementById("not-logged-in").classList.remove("fs-hidden");
    document.getElementById("btn-login").addEventListener("click", function () {
      chrome.tabs.create({ url: chrome.runtime.getURL("login.html") });
    });
    return;
  }

  // Logged in but setup not complete
  if (!config.futureself_setupComplete) {
    document.getElementById("setup-prompt").classList.remove("fs-hidden");
    document.getElementById("btn-setup").addEventListener("click", function () {
      chrome.runtime.openOptionsPage();
    });
    return;
  }

  // Trial expired and not paid
  if (!authStatus.isTrialActive && !authStatus.isPaid) {
    document.getElementById("trial-expired").classList.remove("fs-hidden");
    document.getElementById("trial-nights").textContent = config.futureself_streak || 0;
    document.getElementById("trial-blocks").textContent = config.futureself_blockedTonight || 0;
    return;
  }

  // Show dashboard
  document.getElementById("dashboard").classList.remove("fs-hidden");

  // Show paid badge if lifetime
  if (authStatus.isPaid) {
    document.getElementById("paid-badge").classList.remove("fs-hidden");
  }

  var wakeTime = config.futureself_wakeTime || "06:00";
  var blockStart = config.futureself_blockStartTime || "22:00";
  var streak = config.futureself_streak || 0;
  var blockedTonight = config.futureself_blockedTonight || 0;

  // Determine if blocking is currently active
  var now = new Date();
  var nowMinutes = now.getHours() * 60 + now.getMinutes();
  var blockMinutes = timeToMinutes(blockStart);
  var wakeMinutes = timeToMinutes(wakeTime);
  var isActive = isInBlockWindow(nowMinutes, blockMinutes, wakeMinutes);

  // Status badge
  var badge = document.getElementById("status-badge");
  var text = document.getElementById("status-text");
  var microcopy = document.getElementById("microcopy");

  if (isActive) {
    badge.className = "fs-status-badge fs-active";
    text.textContent = "Protected";
    microcopy.textContent = "Your future self is protected.";
  } else {
    badge.className = "fs-status-badge fs-inactive";
    text.textContent = "Daytime";
    microcopy.textContent = "Daytime. Browse freely.";
  }

  // Schedule info
  var info = document.getElementById("schedule-info");
  if (isActive) {
    info.textContent = "Blocking until " + formatTime12h(wakeTime);
  } else {
    info.textContent = "Screens off at " + formatTime12h(blockStart);
  }

  // Stats
  var streakEl = document.getElementById("streak-count");
  streakEl.textContent = streak;
  if (streak > 0) {
    streakEl.closest(".fs-stat").classList.add("fs-streak-active");
  }
  document.getElementById("streak-label").textContent =
    streak === 1 ? "night. Tomorrow-you approves." : "nights. Tomorrow-you approves.";
  document.getElementById("blocked-count").textContent = blockedTonight;

  // Trial banner (only show for non-paid trial users)
  if (!authStatus.isPaid && authStatus.isTrialActive) {
    document.getElementById("trial-banner").classList.remove("fs-hidden");
    document.getElementById("trial-text").textContent = "Free trial: " + authStatus.trialHoursLeft + " hours remaining";
  }

  // Settings link
  document.getElementById("settings-link").addEventListener("click", function () {
    chrome.runtime.openOptionsPage();
  });

  // Logout link
  document.getElementById("logout-link").addEventListener("click", async function () {
    await SupabaseAuth.signOut();
    window.location.reload();
  });

  function timeToMinutes(t) {
    var parts = t.split(":").map(Number);
    return parts[0] * 60 + parts[1];
  }

  function isInBlockWindow(now, start, wake) {
    if (start <= wake) {
      return now >= start && now < wake;
    }
    return now >= start || now < wake;
  }

  function formatTime12h(time24) {
    var parts = time24.split(":").map(Number);
    var suffix = parts[0] >= 12 ? "PM" : "AM";
    var h12 = parts[0] % 12 || 12;
    return h12 + ":" + String(parts[1]).padStart(2, "0") + " " + suffix;
  }
})();
