// Future Self — Popup Dashboard

(async function () {
  const config = await chrome.storage.local.get([
    "futureself_setupComplete", "futureself_wakeTime", "futureself_blockStartTime",
    "futureself_streak", "futureself_blockedTonight"
  ]);

  if (!config.futureself_setupComplete) {
    document.getElementById("setup-prompt").classList.remove("hidden");
    document.getElementById("btn-setup").addEventListener("click", () => {
      chrome.runtime.openOptionsPage();
    });
    return;
  }

  // Show dashboard
  document.getElementById("dashboard").classList.remove("hidden");

  const wakeTime = config.futureself_wakeTime || "06:00";
  const blockStart = config.futureself_blockStartTime || "22:00";
  const streak = config.futureself_streak || 0;
  const blockedTonight = config.futureself_blockedTonight || 0;

  // Determine if blocking is currently active
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const blockMinutes = timeToMinutes(blockStart);
  const wakeMinutes = timeToMinutes(wakeTime);
  const isActive = isInBlockWindow(nowMinutes, blockMinutes, wakeMinutes);

  // Status badge
  const badge = document.getElementById("status-badge");
  const text = document.getElementById("status-text");

  if (isActive) {
    badge.className = "fs-status-badge active";
    text.textContent = "Your future self is protected";
  } else {
    badge.className = "fs-status-badge inactive";
    text.textContent = "Daytime. Browse freely.";
  }

  // Schedule info
  const info = document.getElementById("schedule-info");
  if (isActive) {
    info.textContent = "Blocking until " + formatTime12h(wakeTime);
  } else {
    info.textContent = "Screens off at " + formatTime12h(blockStart);
  }

  // Stats
  document.getElementById("streak-count").textContent = streak;
  document.getElementById("streak-label").textContent =
    streak === 1 ? "night protected" : "nights protected";
  document.getElementById("blocked-count").textContent = blockedTonight;

  // Settings link
  document.getElementById("settings-link").addEventListener("click", () => {
    chrome.runtime.openOptionsPage();
  });

  function timeToMinutes(t) {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  }

  function isInBlockWindow(now, start, wake) {
    if (start <= wake) {
      return now >= start && now < wake;
    }
    return now >= start || now < wake;
  }

  function formatTime12h(time24) {
    const [h, m] = time24.split(":").map(Number);
    const suffix = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 || 12;
    return h12 + ":" + String(m).padStart(2, "0") + " " + suffix;
  }
})();
