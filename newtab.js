// Future Self — New Tab
(async function () {

  function msToMMSS(ms) {
    if (ms <= 0) return "00:00";
    var total = Math.ceil(ms / 1000);
    var m = Math.floor(total / 60);
    var s = total % 60;
    return String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
  }

  function timeToMinutes(t) {
    var parts = t.split(":").map(Number);
    return parts[0] * 60 + parts[1];
  }

  function isInNightWindow(now, start, wake) {
    if (start <= wake) return now >= start && now < wake;
    return now >= start || now < wake;
  }

  function formatTime12h(t) {
    var p = t.split(":").map(Number);
    var suffix = p[0] >= 12 ? "PM" : "AM";
    var h = p[0] % 12 || 12;
    return h + ":" + String(p[1]).padStart(2, "0") + " " + suffix;
  }

  function showState(id) {
    document.querySelectorAll(".nt-state").forEach(function (el) {
      el.classList.remove("active");
    });
    document.getElementById(id).classList.add("active");
  }

  var data = await chrome.storage.local.get([
    "futureself_active_tab",
    "futureself_pomodoro_active",
    "futureself_pomodoro_end_ts",
    "futureself_pomodoro_on_break",
    "futureself_pomodoro_break_end_ts",
    "futureself_pomodoro_task",
    "futureself_pomodoro_duration",
    "futureself_pomodoro_session_count",
    "futureself_pomodoro_long_break_after",
    "futureself_pomodoro_break",
    "futureself_schedule_enabled",
    "futureself_wakeTime",
    "futureself_blockStartTime",
    "futureself_setupComplete"
  ]);

  var now = Date.now();
  var nowDate = new Date(now);
  var nowMinutes = nowDate.getHours() * 60 + nowDate.getMinutes();

  // ── STATE 5: Night mode active ────────────────────────────────
  var activeTab = data.futureself_active_tab || "night";
  if (
    activeTab === "night" &&
    data.futureself_setupComplete &&
    data.futureself_wakeTime &&
    data.futureself_blockStartTime
  ) {
    var blockStart = timeToMinutes(data.futureself_blockStartTime);
    var wakeMin = timeToMinutes(data.futureself_wakeTime);
    if (isInNightWindow(nowMinutes, blockStart, wakeMin)) {
      showState("state-night");
      document.getElementById("night-wake-text").textContent =
        "Screens off until " + formatTime12h(data.futureself_wakeTime);
      return;
    }
  }

  // ── STATE 2: Pomodoro session active ──────────────────────────
  if (data.futureself_pomodoro_active && data.futureself_pomodoro_end_ts) {
    var endTs = data.futureself_pomodoro_end_ts;
    var duration = data.futureself_pomodoro_duration || 45;
    var task = data.futureself_pomodoro_task || "";
    var sessionCount = data.futureself_pomodoro_session_count || 0;
    var longBreakAfter = data.futureself_pomodoro_long_break_after || 3;

    showState("state-session");
    document.getElementById("session-label").textContent = "Focus Session — " + duration + " min";
    if (task) {
      document.getElementById("session-task").textContent = "Working on: " + task;
    }

    // Session dots (progress within current round)
    var dotsEl = document.getElementById("session-dots");
    var completedInRound = sessionCount % longBreakAfter;
    for (var i = 0; i < longBreakAfter; i++) {
      var dot = document.createElement("span");
      dot.className = "nt-dot" + (i < completedInRound ? " done" : "");
      dotsEl.appendChild(dot);
    }

    // Live countdown
    document.getElementById("session-timer").textContent = msToMMSS(endTs - now);
    var interval = setInterval(function () {
      var rem = endTs - Date.now();
      document.getElementById("session-timer").textContent = msToMMSS(rem);
      if (rem <= 0) clearInterval(interval);
    }, 1000);

    document.getElementById("btn-end-session").addEventListener("click", async function () {
      await chrome.storage.local.set({ futureself_pomodoro_active: false });
      window.location.reload();
    });
    return;
  }

  // ── STATES 3 & 4: Break active ────────────────────────────────
  if (data.futureself_pomodoro_on_break && data.futureself_pomodoro_break_end_ts) {
    var breakEndTs = data.futureself_pomodoro_break_end_ts;
    var sessionCount = data.futureself_pomodoro_session_count || 0;
    var longBreakAfter = data.futureself_pomodoro_long_break_after || 3;

    // Long break when (sessionCount + 1) is a multiple of longBreakAfter
    // session_count is incremented when break expires, so +1 represents this session
    var isLongBreak = longBreakAfter > 0 && (sessionCount + 1) % longBreakAfter === 0;
    var stateId   = isLongBreak ? "state-long-break"      : "state-break";
    var timerId   = isLongBreak ? "long-break-timer"       : "break-timer";
    var inputId   = isLongBreak ? "input-long-break-mins"  : "input-break-mins";
    var skipBtnId = isLongBreak ? "btn-skip-long-break"    : "btn-skip-break";

    showState(stateId);

    // Seed input with remaining minutes
    var remMs = breakEndTs - now;
    document.getElementById(inputId).value = Math.max(1, Math.ceil(remMs / 60000));

    // Live countdown
    document.getElementById(timerId).textContent = msToMMSS(remMs);
    var breakInterval = setInterval(function () {
      var rem = data.futureself_pomodoro_break_end_ts - Date.now();
      document.getElementById(timerId).textContent = msToMMSS(rem);
      if (rem <= 0) clearInterval(breakInterval);
    }, 1000);

    // Editable break duration — recalculates end_ts from now
    document.getElementById(inputId).addEventListener("change", async function () {
      var mins = Math.max(1, parseInt(this.value) || 5);
      var newEnd = Date.now() + mins * 60 * 1000;
      data.futureself_pomodoro_break_end_ts = newEnd;
      await chrome.storage.local.set({ futureself_pomodoro_break_end_ts: newEnd });
    });

    // Skip break
    document.getElementById(skipBtnId).addEventListener("click", async function () {
      await chrome.storage.local.set({ futureself_pomodoro_on_break: false });
      window.location.reload();
    });
    return;
  }

  // ── STATE 1: Idle ─────────────────────────────────────────────
  showState("state-idle");

  function showPopupHint() {
    document.getElementById("popup-hint").textContent =
      "Click the FutureSelf icon in the toolbar to start.";
  }

  document.getElementById("btn-start-pomodoro").addEventListener("click", function () {
    if (chrome.action && chrome.action.openPopup) {
      chrome.action.openPopup().catch(showPopupHint);
    } else {
      showPopupHint();
    }
  });

  document.getElementById("btn-enable-schedule").addEventListener("click", function () {
    if (chrome.action && chrome.action.openPopup) {
      chrome.action.openPopup().catch(showPopupHint);
    } else {
      showPopupHint();
    }
  });

})();
