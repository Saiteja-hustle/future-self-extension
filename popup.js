// Future Self — Popup (Navigation only)

(function () {
  document.getElementById("btn-open-day").addEventListener("click", function () {
    chrome.storage.local.set({ futureself_active_tab: "day" });
    chrome.tabs.create({ url: chrome.runtime.getURL("day-options.html") });
  });

  document.getElementById("btn-open-night").addEventListener("click", function () {
    chrome.storage.local.set({ futureself_active_tab: "night" });
    chrome.tabs.create({ url: chrome.runtime.getURL("options.html") });
  });
})();
