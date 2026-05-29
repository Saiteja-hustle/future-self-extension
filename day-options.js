// Future Self — Day Options Page

// Storage keys
var K = {
  submode:       'futureself_day_submode',
  pomoDuration:  'futureself_pomodoro_duration',
  pomoBreak:     'futureself_pomodoro_break',
  pomoLongBreak: 'futureself_pomodoro_longbreak_after',
  pomoTask:      'futureself_pomodoro_task',
  schedStart:    'futureself_schedule_start',
  schedEnd:      'futureself_schedule_end',
  schedDays:     'futureself_schedule_days',
  dayBlocklist:  'futureself_day_blocklist',
  customSites:   'futureself_day_custom_sites',
  bellEnabled:   'futureself_bell_enabled',
  sessionsDone:  'futureself_sessions_done',
  focusTimeMin:  'futureself_focus_time_min',
  endedEarly:    'futureself_ended_early',
  historyToday:  'futureself_pomodoro_history_today',
  activeSession: 'futureself_session_active',
};

var DAY_CATEGORIES = {
  'Social media': [
    'facebook.com', 'twitter.com', 'x.com', 'instagram.com',
    'tiktok.com', 'snapchat.com', 'threads.net', 'linkedin.com'
  ],
  'Video': [
    'youtube.com', 'netflix.com', 'twitch.tv', 'primevideo.com',
    'hulu.com', 'disneyplus.com'
  ],
  'News & Forums': [
    'reddit.com', 'news.google.com', 'cnn.com', 'bbc.com',
    'nytimes.com', 'medium.com', 'substack.com', 'quora.com'
  ],
  'Shopping': [
    'amazon.com', 'ebay.com', 'flipkart.com', 'myntra.com'
  ]
};

// Page state
var s = {
  submode:        'pomodoro',
  pomoDuration:   45,
  pomoBreak:      5,
  pomoLongBreak:  4,
  pomoTask:       '',
  schedStart:     '10:00',
  schedEnd:       '13:00',
  schedDays:      [1, 2, 3, 4, 5],
  dayBlocklist:   [],
  customSites:    [],
  bellEnabled:    true,
  sessionsDone:   0,
  focusTimeMin:   0,
  endedEarly:     0,
  historyToday:   [],
  activeSession:  null,
};

var liveInterval = null;

// DOM refs
var btnPomo       = document.getElementById('btn-pomo');
var btnSched      = document.getElementById('btn-sched');
var pomoView      = document.getElementById('pomo-view');
var schedView     = document.getElementById('sched-view');
var durPills      = document.querySelectorAll('.d-dur-pill');
var breakDurIn    = document.getElementById('break-dur');
var longBreakIn   = document.getElementById('long-break-after');
var taskInput     = document.getElementById('task-input');
var btnStart      = document.getElementById('btn-start-session');
var schedStartIn  = document.getElementById('sched-start');
var schedEndIn    = document.getElementById('sched-end');
var dayBtns       = document.querySelectorAll('.d-day-btn');
var schedBanner   = document.getElementById('sched-active-banner');
var btnEditSched  = document.getElementById('btn-edit-sched');
var btnSaveSched  = document.getElementById('btn-save-sched');
var dayCategDiv   = document.getElementById('day-categories');
var customSiteIn  = document.getElementById('custom-site-input');
var btnAddSite    = document.getElementById('btn-add-site');
var statDone      = document.getElementById('stat-done');
var statTime      = document.getElementById('stat-time');
var statEarly     = document.getElementById('stat-early');
var sessionList   = document.getElementById('session-list');
var bellToggle    = document.getElementById('bell-toggle');
var tabNight      = document.getElementById('tab-night');

// ---- Bootstrap ----

init();

async function init() {
  var keys = Object.values(K);
  var saved = await chrome.storage.local.get(keys);

  s.submode       = saved[K.submode]       || 'pomodoro';
  s.pomoDuration  = saved[K.pomoDuration]  || 45;
  s.pomoBreak     = saved[K.pomoBreak]     || 5;
  s.pomoLongBreak = saved[K.pomoLongBreak] || 4;
  s.pomoTask      = saved[K.pomoTask]      || '';
  s.schedStart    = saved[K.schedStart]    || '10:00';
  s.schedEnd      = saved[K.schedEnd]      || '13:00';
  s.schedDays     = saved[K.schedDays]     || [1, 2, 3, 4, 5];
  s.dayBlocklist  = saved[K.dayBlocklist]  || defaultBlocklist();
  s.customSites   = saved[K.customSites]   || [];
  s.bellEnabled   = saved[K.bellEnabled] !== false;
  s.sessionsDone  = saved[K.sessionsDone]  || 0;
  s.focusTimeMin  = saved[K.focusTimeMin]  || 0;
  s.endedEarly    = saved[K.endedEarly]    || 0;
  s.historyToday  = saved[K.historyToday]  || [];
  s.activeSession = saved[K.activeSession] || null;

  applyModeToggle();
  applyDurationPills();
  applyPomoInputs();
  applyScheduleInputs();
  checkScheduleActive();
  renderBlocklist();
  renderStats();
  renderHistory();
  applyBell();
  bindAll();

  if (s.activeSession && s.activeSession.status === 'running') {
    startLiveTimer();
  }
}

function defaultBlocklist() {
  var all = [];
  Object.keys(DAY_CATEGORIES).forEach(function(cat) {
    DAY_CATEGORIES[cat].forEach(function(d) { all.push(d); });
  });
  return all;
}

// ---- Mode toggle ----

function applyModeToggle() {
  var isPomo = (s.submode === 'pomodoro');
  btnPomo.classList.toggle('d-pill--active', isPomo);
  btnSched.classList.toggle('d-pill--active', !isPomo);
  pomoView.classList.toggle('d-hidden', !isPomo);
  schedView.classList.toggle('d-hidden', isPomo);
}

function setSubmode(mode) {
  s.submode = mode;
  applyModeToggle();
  saveKey(K.submode, mode);
  if (mode === 'schedule') checkScheduleActive();
}

// ---- Duration pills ----

function applyDurationPills() {
  durPills.forEach(function(p) {
    p.classList.toggle('d-dur-pill--active', parseInt(p.dataset.min, 10) === s.pomoDuration);
  });
}

// ---- Pomodoro inputs ----

function applyPomoInputs() {
  breakDurIn.value  = s.pomoBreak;
  longBreakIn.value = s.pomoLongBreak;
  taskInput.value   = s.pomoTask;
}

// ---- Schedule inputs ----

function applyScheduleInputs() {
  schedStartIn.value = s.schedStart;
  schedEndIn.value   = s.schedEnd;
  dayBtns.forEach(function(btn) {
    var d = parseInt(btn.dataset.day, 10);
    btn.classList.toggle('d-day-btn--active', s.schedDays.indexOf(d) !== -1);
  });
}

function checkScheduleActive() {
  var now      = new Date();
  var todayDay = now.getDay();

  if (s.schedDays.indexOf(todayDay) === -1) {
    schedBanner.classList.add('d-hidden');
    return;
  }

  var nowMin   = now.getHours() * 60 + now.getMinutes();
  var sp       = s.schedStart.split(':');
  var ep       = s.schedEnd.split(':');
  var startMin = parseInt(sp[0], 10) * 60 + parseInt(sp[1], 10);
  var endMin   = parseInt(ep[0], 10) * 60 + parseInt(ep[1], 10);

  if (nowMin >= startMin && nowMin < endMin) {
    var endH   = parseInt(ep[0], 10);
    var endM   = parseInt(ep[1], 10);
    var suffix = endH >= 12 ? 'PM' : 'AM';
    var h12    = endH % 12 || 12;
    schedBanner.textContent = 'Active now · ends ' + h12 + ':' + padZ(endM) + ' ' + suffix;
    schedBanner.classList.remove('d-hidden');
  } else {
    schedBanner.classList.add('d-hidden');
  }
}

function saveSchedule() {
  s.schedStart = schedStartIn.value;
  s.schedEnd   = schedEndIn.value;
  chrome.storage.local.set({
    [K.schedStart]: s.schedStart,
    [K.schedEnd]:   s.schedEnd,
    [K.schedDays]:  s.schedDays,
  });
  checkScheduleActive();
  var orig = btnSaveSched.textContent;
  btnSaveSched.textContent = 'Saved ✓';
  setTimeout(function() { btnSaveSched.textContent = orig; }, 1800);
}

// ---- Pomodoro session ----

function startSession() {
  if (s.activeSession) return;
  var now  = Date.now();
  var task = taskInput.value.trim() || 'Focus session';
  var session = {
    task:        task,
    durationMin: s.pomoDuration,
    startedAt:   now,
    status:      'running',
  };
  s.activeSession = session;
  chrome.storage.local.set({ [K.activeSession]: session });
  chrome.storage.local.set({
    futureself_pomodoro_active:   true,
    futureself_pomodoro_start_ts: now,
    futureself_pomodoro_end_ts:   now + s.pomoDuration * 60 * 1000,
    futureself_pomodoro_duration: s.pomoDuration,
    futureself_pomodoro_task:     taskInput.value.trim(),
    futureself_pomodoro_on_break: false,
    futureself_active_tab:        'day',
  });
  btnStart.disabled = true;
  startLiveTimer();
}

function endSession(early) {
  if (!s.activeSession) return;

  var sess    = s.activeSession;
  var elapsed = Math.max(1, Math.round((Date.now() - sess.startedAt) / 60000));
  var done    = !early;

  s.historyToday.push({
    task:      sess.task,
    planned:   sess.durationMin,
    actual:    done ? sess.durationMin : elapsed,
    startTime: fmtTime(new Date(sess.startedAt)),
    completed: done,
  });

  s.activeSession = null;

  if (done) {
    s.sessionsDone++;
    s.focusTimeMin += sess.durationMin;
  } else {
    s.endedEarly++;
    s.focusTimeMin += elapsed;
  }

  chrome.storage.local.set({
    [K.activeSession]:              null,
    [K.historyToday]:               s.historyToday,
    [K.sessionsDone]:               s.sessionsDone,
    [K.focusTimeMin]:               s.focusTimeMin,
    [K.endedEarly]:                 s.endedEarly,
    futureself_pomodoro_active:     false,
    futureself_pomodoro_on_break:   false,
  });

  if (liveInterval) { clearInterval(liveInterval); liveInterval = null; }

  btnStart.disabled = false;
  renderStats();
  renderHistory();
}

// ---- Live timer ----

function startLiveTimer() {
  renderHistory();
  if (liveInterval) clearInterval(liveInterval);
  liveInterval = setInterval(function() {
    if (!s.activeSession) { clearInterval(liveInterval); return; }

    var elapsedMin = (Date.now() - s.activeSession.startedAt) / 60000;
    var remaining  = s.activeSession.durationMin - elapsedMin;

    if (remaining <= 0) {
      endSession(false);
      return;
    }

    var timeEl = document.querySelector('#live-session-card .d-live-time');
    if (timeEl) timeEl.textContent = fmtRemaining(remaining);
  }, 1000);
}

function fmtRemaining(minFloat) {
  var totalSec = Math.max(0, Math.round(minFloat * 60));
  var m = Math.floor(totalSec / 60);
  var sc = totalSec % 60;
  return m + ':' + padZ(sc) + ' remaining';
}

// ---- Blocklist rendering ----

function renderBlocklist() {
  dayCategDiv.innerHTML = '';

  Object.keys(DAY_CATEGORIES).forEach(function(catName) {
    var sites = DAY_CATEGORIES[catName];
    dayCategDiv.appendChild(makeCategoryBlock(catName, sites, false));
  });

  if (s.customSites.length > 0) {
    dayCategDiv.appendChild(makeCategoryBlock('Custom', s.customSites, true));
  }
}

function makeCategoryBlock(catName, sites, removable) {
  var wrap = document.createElement('div');
  wrap.className = 'd-category';

  var hdr = document.createElement('div');
  hdr.className = 'd-cat-header';

  var nameEl = document.createElement('span');
  nameEl.className = 'd-cat-name';
  nameEl.textContent = catName;
  hdr.appendChild(nameEl);

  if (!removable) {
    var uncheckBtn = document.createElement('button');
    uncheckBtn.className = 'd-uncheck-btn';
    uncheckBtn.textContent = 'Uncheck all';
    uncheckBtn.addEventListener('click', function() { uncheckCategory(sites); });
    hdr.appendChild(uncheckBtn);
  }

  wrap.appendChild(hdr);

  var chipList = document.createElement('div');
  chipList.className = 'd-chip-list';
  sites.forEach(function(domain) {
    chipList.appendChild(makeChip(domain, removable));
  });
  wrap.appendChild(chipList);

  return wrap;
}

function makeChip(domain, removable) {
  var label = document.createElement('label');
  label.className = 'd-chip' + (s.dayBlocklist.indexOf(domain) !== -1 ? ' d-checked' : '');

  var cb = document.createElement('input');
  cb.type    = 'checkbox';
  cb.checked = s.dayBlocklist.indexOf(domain) !== -1;
  cb.addEventListener('change', function() {
    toggleDomain(domain, cb.checked);
    label.classList.toggle('d-checked', cb.checked);
  });

  var text = document.createElement('span');
  text.textContent = domain;

  label.appendChild(cb);
  label.appendChild(text);

  if (removable) {
    var rmBtn = document.createElement('button');
    rmBtn.className   = 'd-chip-remove';
    rmBtn.textContent = '×';
    rmBtn.addEventListener('click', function(e) {
      e.preventDefault();
      removeCustomSite(domain);
    });
    label.appendChild(rmBtn);
  }

  return label;
}

function toggleDomain(domain, checked) {
  var idx = s.dayBlocklist.indexOf(domain);
  if (checked && idx === -1)  s.dayBlocklist.push(domain);
  if (!checked && idx !== -1) s.dayBlocklist.splice(idx, 1);
  saveKey(K.dayBlocklist, s.dayBlocklist);
}

function uncheckCategory(sites) {
  sites.forEach(function(domain) {
    var idx = s.dayBlocklist.indexOf(domain);
    if (idx !== -1) s.dayBlocklist.splice(idx, 1);
  });
  saveKey(K.dayBlocklist, s.dayBlocklist);
  renderBlocklist();
}

function addCustomSite() {
  var raw = customSiteIn.value.trim()
    .toLowerCase()
    .replace(/^https?:\/\//i, '')
    .replace(/\/.*$/, '');
  if (!raw) return;
  if (s.customSites.indexOf(raw) !== -1) { customSiteIn.value = ''; return; }
  s.customSites.push(raw);
  if (s.dayBlocklist.indexOf(raw) === -1) s.dayBlocklist.push(raw);
  chrome.storage.local.set({ [K.customSites]: s.customSites, [K.dayBlocklist]: s.dayBlocklist });
  customSiteIn.value = '';
  renderBlocklist();
}

function removeCustomSite(domain) {
  s.customSites  = s.customSites.filter(function(d)  { return d !== domain; });
  s.dayBlocklist = s.dayBlocklist.filter(function(d) { return d !== domain; });
  chrome.storage.local.set({ [K.customSites]: s.customSites, [K.dayBlocklist]: s.dayBlocklist });
  renderBlocklist();
}

// ---- Stats ----

function renderStats() {
  statDone.textContent  = s.sessionsDone;
  statEarly.textContent = s.endedEarly;
  statTime.textContent  = fmtFocusTime(s.focusTimeMin);
}

function fmtFocusTime(min) {
  if (min < 60) return min + 'm';
  var h = Math.floor(min / 60);
  var m = min % 60;
  return m > 0 ? h + 'h ' + m + 'm' : h + 'h';
}

// ---- Session history ----

function renderHistory() {
  sessionList.innerHTML = '';

  var hasHistory = s.historyToday.length > 0;
  var hasActive  = s.activeSession && s.activeSession.status === 'running';

  if (!hasHistory && !hasActive) {
    var empty = document.createElement('div');
    empty.className   = 'd-empty-sessions';
    empty.textContent = 'No sessions yet today.';
    sessionList.appendChild(empty);
    return;
  }

  s.historyToday.forEach(function(session) {
    sessionList.appendChild(makeSessionItem(session));
  });

  if (hasActive) {
    sessionList.appendChild(makeLiveCard());
  }
}

function makeSessionItem(session) {
  var item = document.createElement('div');
  item.className = 'd-session-item';

  var dot = document.createElement('div');
  dot.className = 'd-dot ' + (session.completed ? 'd-dot--amber' : 'd-dot--gray');
  item.appendChild(dot);

  var info = document.createElement('div');
  info.className = 'd-session-info';

  var taskEl = document.createElement('div');
  taskEl.className = 'd-session-task' + (session.completed ? ' d-session-task--done' : '');
  taskEl.textContent = session.task;
  info.appendChild(taskEl);

  var meta = document.createElement('div');
  meta.className   = 'd-session-meta';
  meta.textContent = session.actual + 'min · ' + session.startTime;
  info.appendChild(meta);

  item.appendChild(info);

  var badge = document.createElement('span');
  badge.className   = 'd-badge ' + (session.completed ? 'd-badge--done' : 'd-badge--early');
  badge.textContent = session.completed ? 'Completed' : 'Ended early';
  item.appendChild(badge);

  return item;
}

function makeLiveCard() {
  var elapsed   = (Date.now() - s.activeSession.startedAt) / 60000;
  var remaining = s.activeSession.durationMin - elapsed;

  var card = document.createElement('div');
  card.className = 'd-live-card';
  card.id        = 'live-session-card';

  var dot = document.createElement('div');
  dot.className = 'd-dot d-dot--live';
  card.appendChild(dot);

  var info = document.createElement('div');
  info.className = 'd-live-info';

  var taskEl = document.createElement('div');
  taskEl.className   = 'd-live-task';
  taskEl.textContent = s.activeSession.task;
  info.appendChild(taskEl);

  var timeEl = document.createElement('div');
  timeEl.className   = 'd-live-time';
  timeEl.textContent = fmtRemaining(remaining);
  info.appendChild(timeEl);

  card.appendChild(info);

  var endBtn = document.createElement('button');
  endBtn.className   = 'd-btn-muted';
  endBtn.style.cssText = 'font-size:11.5px;padding:5px 10px';
  endBtn.textContent = 'End session';
  endBtn.addEventListener('click', function() { endSession(true); });
  card.appendChild(endBtn);

  return card;
}

// ---- Bell ----

function applyBell() {
  bellToggle.checked = s.bellEnabled;
}

// ---- Helpers ----

function fmtTime(date) {
  var h      = date.getHours();
  var m      = date.getMinutes();
  var suffix = h >= 12 ? 'PM' : 'AM';
  var h12    = h % 12 || 12;
  return h12 + ':' + padZ(m) + ' ' + suffix;
}

function padZ(n) {
  return n < 10 ? '0' + n : '' + n;
}

function saveKey(key, val) {
  var obj = {};
  obj[key] = val;
  chrome.storage.local.set(obj);
}

// ---- Event binding ----

function bindAll() {
  tabNight.addEventListener('click', function() {
    window.location.href = 'options.html';
  });

  btnPomo.addEventListener('click',  function() { setSubmode('pomodoro'); });
  btnSched.addEventListener('click', function() { setSubmode('schedule'); });

  durPills.forEach(function(pill) {
    pill.addEventListener('click', function() {
      s.pomoDuration = parseInt(pill.dataset.min, 10);
      applyDurationPills();
      saveKey(K.pomoDuration, s.pomoDuration);
    });
  });

  breakDurIn.addEventListener('change', function() {
    s.pomoBreak = Math.max(1, parseInt(breakDurIn.value, 10) || 5);
    saveKey(K.pomoBreak, s.pomoBreak);
  });

  longBreakIn.addEventListener('change', function() {
    s.pomoLongBreak = Math.max(1, parseInt(longBreakIn.value, 10) || 4);
    saveKey(K.pomoLongBreak, s.pomoLongBreak);
  });

  taskInput.addEventListener('input', function() {
    s.pomoTask = taskInput.value;
    saveKey(K.pomoTask, s.pomoTask);
  });

  btnStart.addEventListener('click', startSession);

  dayBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      var d   = parseInt(btn.dataset.day, 10);
      var idx = s.schedDays.indexOf(d);
      if (idx !== -1) { s.schedDays.splice(idx, 1); }
      else            { s.schedDays.push(d); }
      btn.classList.toggle('d-day-btn--active', s.schedDays.indexOf(d) !== -1);
      saveKey(K.schedDays, s.schedDays);
    });
  });

  btnEditSched.addEventListener('click', function() { schedStartIn.focus(); });
  btnSaveSched.addEventListener('click', saveSchedule);

  schedStartIn.addEventListener('change', checkScheduleActive);
  schedEndIn.addEventListener('change',   checkScheduleActive);

  btnAddSite.addEventListener('click', addCustomSite);
  customSiteIn.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') addCustomSite();
  });

  bellToggle.addEventListener('change', function() {
    s.bellEnabled = bellToggle.checked;
    saveKey(K.bellEnabled, s.bellEnabled);
  });
}
