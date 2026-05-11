// Future Self — Popup Dashboard

(async function () {
  // Mode toggle
  var activeTab = (await chrome.storage.local.get("futureself_active_tab")).futureself_active_tab || "night";
  var btnNight = document.getElementById("btn-mode-night");
  var btnDay = document.getElementById("btn-mode-day");
  var nightPanel = document.getElementById("night-panel");
  var dayPanel = document.getElementById("day-panel");

  function applyMode(mode) {
    if (mode === "day") {
      btnNight.className = "fs-mode-btn";
      btnDay.className = "fs-mode-btn active-day";
      nightPanel.classList.add("fs-hidden");
      dayPanel.classList.remove("fs-hidden");
    } else {
      btnNight.className = "fs-mode-btn active-night";
      btnDay.className = "fs-mode-btn";
      nightPanel.classList.remove("fs-hidden");
      dayPanel.classList.add("fs-hidden");
    }
  }

  applyMode(activeTab);

  btnNight.addEventListener("click", async function () {
    await chrome.storage.local.set({ futureself_active_tab: "night" });
    applyMode("night");
  });

  btnDay.addEventListener("click", async function () {
    await chrome.storage.local.set({ futureself_active_tab: "day" });
    applyMode("day");
  });

  // Day Mode auth gate
  var tokenData = await chrome.storage.local.get("futureself_access_token");
  if (!tokenData.futureself_access_token) {
    document.getElementById("day-logged-out").classList.remove("fs-hidden");
    document.getElementById("day-main-content").classList.add("fs-hidden");
    document.getElementById("btn-day-signin").addEventListener("click", function () {
      chrome.tabs.create({ url: chrome.runtime.getURL("login.html") });
    });
  }

  // ── Day Mode UI ──────────────────────────────────────────────

  // Sub-mode toggle
  var btnPomodoro = document.getElementById("btn-submode-pomodoro");
  var btnSchedule = document.getElementById("btn-submode-schedule");
  var dayPomodoroPanel = document.getElementById("day-pomodoro-panel");
  var daySchedulePanel = document.getElementById("day-schedule-panel");

  function applySubmode(submode) {
    if (submode === "schedule") {
      btnPomodoro.className = "fs-submode-btn";
      btnSchedule.className = "fs-submode-btn active-submode";
      dayPomodoroPanel.classList.add("fs-hidden");
      daySchedulePanel.classList.remove("fs-hidden");
    } else {
      btnPomodoro.className = "fs-submode-btn active-submode";
      btnSchedule.className = "fs-submode-btn";
      dayPomodoroPanel.classList.remove("fs-hidden");
      daySchedulePanel.classList.add("fs-hidden");
    }
  }

  var storedSubmode = (await chrome.storage.local.get("futureself_day_submode")).futureself_day_submode || "pomodoro";
  applySubmode(storedSubmode);

  btnPomodoro.addEventListener("click", async function () {
    await chrome.storage.local.set({ futureself_day_submode: "pomodoro" });
    applySubmode("pomodoro");
  });
  btnSchedule.addEventListener("click", async function () {
    await chrome.storage.local.set({ futureself_day_submode: "schedule" });
    applySubmode("schedule");
  });

  // Duration pills
  var durationBtns = document.querySelectorAll(".fs-duration-btn");
  var storedDuration = (await chrome.storage.local.get("futureself_pomodoro_duration")).futureself_pomodoro_duration || 45;
  durationBtns.forEach(function (btn) {
    if (parseInt(btn.dataset.duration) === storedDuration) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
    btn.addEventListener("click", async function () {
      durationBtns.forEach(function (b) { b.classList.remove("active"); });
      btn.classList.add("active");
      await chrome.storage.local.set({ futureself_pomodoro_duration: parseInt(btn.dataset.duration) });
    });
  });

  // Restore break input
  var breakInput = document.getElementById("input-break-duration");
  var storedBreak = (await chrome.storage.local.get("futureself_pomodoro_break")).futureself_pomodoro_break || 10;
  breakInput.value = storedBreak;

  // Restore task input
  var taskInput = document.getElementById("input-task");
  var storedTask = (await chrome.storage.local.get("futureself_pomodoro_task")).futureself_pomodoro_task || "";
  taskInput.value = storedTask;

  // Session timer
  function msToMMSS(ms) {
    if (ms <= 0) return "00:00";
    var total = Math.ceil(ms / 1000);
    return String(Math.floor(total / 60)).padStart(2, "0") + ":" + String(total % 60).padStart(2, "0");
  }
  var sessionTimerInterval = null;
  function startSessionTimer(endTs) {
    if (sessionTimerInterval) clearInterval(sessionTimerInterval);
    document.getElementById("popup-session-timer").textContent = msToMMSS(endTs - Date.now());
    sessionTimerInterval = setInterval(function () {
      document.getElementById("popup-session-timer").textContent = msToMMSS(endTs - Date.now());
    }, 1000);
  }

  // Active session state on load
  var pomData = await chrome.storage.local.get([
    "futureself_pomodoro_active", "futureself_pomodoro_task", "futureself_pomodoro_end_ts"
  ]);
  if (pomData.futureself_pomodoro_active) {
    document.getElementById("day-pomodoro-form").classList.add("fs-hidden");
    document.getElementById("day-active-session").classList.remove("fs-hidden");
    document.getElementById("active-task-label").textContent = pomData.futureself_pomodoro_task || "";
    if (pomData.futureself_pomodoro_end_ts) startSessionTimer(pomData.futureself_pomodoro_end_ts);
  }

  // Start Session
  document.getElementById("btn-start-session").addEventListener("click", async function () {
    var duration = parseInt(document.querySelector(".fs-duration-btn.active").dataset.duration);
    var brk = parseInt(breakInput.value) || 10;
    var task = taskInput.value.trim();
    var now = Date.now();
    await chrome.storage.local.set({
      futureself_pomodoro_active: true,
      futureself_pomodoro_start_ts: now,
      futureself_pomodoro_end_ts: now + duration * 60 * 1000,
      futureself_pomodoro_task: task,
      futureself_pomodoro_break: brk
    });
    document.getElementById("day-pomodoro-form").classList.add("fs-hidden");
    document.getElementById("day-active-session").classList.remove("fs-hidden");
    document.getElementById("active-task-label").textContent = task;
    startSessionTimer(now + duration * 60 * 1000);
  });

  // End Session
  document.getElementById("btn-end-session").addEventListener("click", async function () {
    if (sessionTimerInterval) clearInterval(sessionTimerInterval);
    await chrome.storage.local.set({ futureself_pomodoro_active: false });
    document.getElementById("day-active-session").classList.add("fs-hidden");
    document.getElementById("day-pomodoro-form").classList.remove("fs-hidden");
  });

  // Schedule inputs
  var schedStart = document.getElementById("input-schedule-start");
  var schedEnd = document.getElementById("input-schedule-end");
  var schedEnabled = document.getElementById("toggle-schedule-enabled");
  var schedStatus = document.getElementById("schedule-status-text");

  var schedData = await chrome.storage.local.get([
    "futureself_schedule_start", "futureself_schedule_end",
    "futureself_schedule_days", "futureself_schedule_enabled"
  ]);
  schedStart.value = schedData.futureself_schedule_start || "10:00";
  schedEnd.value = schedData.futureself_schedule_end || "13:00";
  schedEnabled.checked = schedData.futureself_schedule_enabled || false;
  var savedDays = schedData.futureself_schedule_days || ["mon", "tue", "wed", "thu", "fri"];
  document.querySelectorAll(".day-schedule-row input[type=checkbox]").forEach(function (cb) {
    cb.checked = savedDays.includes(cb.value);
  });

  function updateScheduleStatus() {
    schedStatus.textContent = schedEnabled.checked
      ? "Schedule block is ON — " + schedStart.value + " to " + schedEnd.value
      : "Schedule block is off.";
  }
  updateScheduleStatus();

  schedStart.addEventListener("change", async function () {
    await chrome.storage.local.set({ futureself_schedule_start: schedStart.value });
    updateScheduleStatus();
  });
  schedEnd.addEventListener("change", async function () {
    await chrome.storage.local.set({ futureself_schedule_end: schedEnd.value });
    updateScheduleStatus();
  });
  schedEnabled.addEventListener("change", async function () {
    await chrome.storage.local.set({ futureself_schedule_enabled: schedEnabled.checked });
    updateScheduleStatus();
  });
  document.querySelectorAll(".day-schedule-row input[type=checkbox]").forEach(function (cb) {
    cb.addEventListener("change", async function () {
      var days = Array.from(document.querySelectorAll(".day-schedule-row input[type=checkbox]"))
        .filter(function (c) { return c.checked; })
        .map(function (c) { return c.value; });
      await chrome.storage.local.set({ futureself_schedule_days: days });
    });
  });

  // ── Day Block List ────────────────────────────────────────────

  var DAY_DEFAULT_DOMAINS = [
    "whatsapp.com", "instagram.com", "facebook.com", "twitter.com", "threads.net", "linkedin.com",
    "youtube.com", "twitch.tv", "netflix.com", "primevideo.com",
    "reddit.com", "news.ycombinator.com", "bbc.com", "cnn.com",
    "amazon.com", "flipkart.com", "ebay.com", "myntra.com"
  ];

  var dayBlocklistData = await chrome.storage.local.get("futureself_day_blocklist");
  var dayBlocklist = dayBlocklistData.futureself_day_blocklist;
  if (!dayBlocklist || dayBlocklist.length === 0) {
    dayBlocklist = DAY_DEFAULT_DOMAINS.slice();
    await chrome.storage.local.set({ futureself_day_blocklist: dayBlocklist });
  }

  async function saveDayBlocklist() {
    var checked = Array.from(
      document.querySelectorAll("#day-blocklist-content input[type=checkbox][data-domain]")
    ).filter(function (cb) { return cb.checked; }).map(function (cb) { return cb.value; });
    dayBlocklist = checked;
    await chrome.storage.local.set({ futureself_day_blocklist: checked });
  }

  function updateCheckToggleBtn(cat) {
    var checkboxes = Array.from(document.querySelectorAll(".fs-blocklist-items[data-cat=" + cat + "] input[type=checkbox]"));
    var allChecked = checkboxes.every(function (cb) { return cb.checked; });
    var btn = document.querySelector(".fs-check-toggle-btn[data-cat=" + cat + "]");
    if (btn) btn.textContent = allChecked ? "Uncheck all" : "Check all";
  }

  // Restore checkbox state and wire change handlers
  document.querySelectorAll("#day-blocklist-content .fs-blocklist-items input[type=checkbox]").forEach(function (cb) {
    cb.dataset.domain = "1";
    cb.checked = dayBlocklist.includes(cb.value);
    cb.addEventListener("change", saveDayBlocklist);
  });
  ["social", "video", "news", "shopping"].forEach(updateCheckToggleBtn);

  // Check all / Uncheck all per category
  document.querySelectorAll(".fs-check-toggle-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var cat = btn.dataset.cat;
      var checkboxes = Array.from(document.querySelectorAll(".fs-blocklist-items[data-cat=" + cat + "] input[type=checkbox]"));
      var allChecked = checkboxes.every(function (cb) { return cb.checked; });
      checkboxes.forEach(function (cb) { cb.checked = !allChecked; });
      btn.textContent = allChecked ? "Check all" : "Uncheck all";
      saveDayBlocklist();
    });
  });

  // Collapsible toggle
  document.getElementById("day-blocklist-toggle").addEventListener("click", function () {
    var content = document.getElementById("day-blocklist-content");
    var arrow = document.getElementById("day-blocklist-arrow");
    var isHidden = content.classList.toggle("fs-hidden");
    arrow.textContent = isHidden ? "▶" : "▼";
  });

  // Render any existing custom domains (not in default list)
  var customList = document.getElementById("day-custom-domains-list");
  var customDomains = dayBlocklist.filter(function (d) { return !DAY_DEFAULT_DOMAINS.includes(d); });

  function renderCustomDomain(domain) {
    var label = document.createElement("label");
    label.className = "fs-blocklist-item";
    var cb = document.createElement("input");
    cb.type = "checkbox";
    cb.value = domain;
    cb.dataset.domain = "1";
    cb.checked = true;
    cb.addEventListener("change", saveDayBlocklist);
    label.appendChild(cb);
    label.appendChild(document.createTextNode(" " + domain));
    customList.appendChild(label);
  }

  customDomains.forEach(renderCustomDomain);

  // Add custom domain
  var customDomainInput = document.getElementById("input-day-custom-domain");
  document.getElementById("btn-add-day-domain").addEventListener("click", async function () {
    var domain = customDomainInput.value.trim().toLowerCase()
      .replace(/^https?:\/\//, "").replace(/\/.*$/, "");
    if (!domain || dayBlocklist.includes(domain)) return;
    dayBlocklist.push(domain);
    await chrome.storage.local.set({ futureself_day_blocklist: dayBlocklist });
    renderCustomDomain(domain);
    customDomainInput.value = "";
  });
  customDomainInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") document.getElementById("btn-add-day-domain").click();
  });

  // ─────────────────────────────────────────────────────────────

  // Step 1: Check trial status and is_paid from Supabase (single profile fetch)
  var authStatus = await SupabaseAuth.checkAuthStatus();
  // authStatus.isPaid  — true if profile.is_paid === true in Supabase
  // authStatus.isTrialActive — true if trial window hasn't elapsed
  // authStatus.trialHoursLeft — hours left in trial

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

  // Step 2: Apply paid / trial gate
  // is_paid = true  → show dashboard (ignore trial entirely)
  // is_paid = false AND trial expired → show upgrade screen
  // is_paid = false AND trial active  → show dashboard with trial countdown
  if (!authStatus.isPaid && !authStatus.isTrialActive) {
    document.getElementById("trial-expired").classList.remove("fs-hidden");
    document.getElementById("trial-nights").textContent = config.futureself_streak || 0;
    document.getElementById("trial-blocks").textContent = config.futureself_blockedTonight || 0;
    return;
  }

  // Show dashboard (paid users or active-trial users reach here)
  document.getElementById("dashboard").classList.remove("fs-hidden");

  // Show paid badge if lifetime access
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
    var trialLabel = authStatus.trialHoursLeft > 24
      ? Math.ceil(authStatus.trialHoursLeft / 24) + " days remaining in trial"
      : authStatus.trialHoursLeft + " hours remaining in trial";
    document.getElementById("trial-text").textContent = trialLabel;
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
