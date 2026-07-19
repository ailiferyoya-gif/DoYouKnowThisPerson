(function () {
  "use strict";

  const manifest = window.CASE_MANIFEST || { selectedApps: [], appCatalog: {} };
  const catalog = manifest.appCatalog || {};
  const selected = (manifest.selectedApps || []).filter((id) => catalog[id]);
  const selectedSet = new Set(selected);
  const iconApi = window.VDMIcons || { icon: () => "", appIcon: () => "" };
  const desktopIcons = document.getElementById("desktop-icons");
  const icons = desktopIcons;
  const windowLayer = document.getElementById("window-layer");
  const taskList = document.getElementById("task-list");
  const startApps = document.getElementById("start-apps");
  const startMenu = document.getElementById("start-menu");
  const startButton = document.getElementById("start-button");
  const recentApps = document.getElementById("recent-apps");
  const notificationCenter = document.getElementById("notification-center");
  const notificationList = document.getElementById("notification-list");
  const notificationButton = document.getElementById("notification-button");
  const notificationBadge = document.getElementById("notification-badge");
  const notificationSummary = document.getElementById("notification-summary");
  const toastHost = document.getElementById("desktop-toasts");
  const windows = new Map();
  let zIndex = 2;

  const systemShortcuts = [
    { id: "recovery", label: "復旧管理", icon: "app-recovery", action: () => window.VDM_CASE_UI?.open() },
    { id: "purchase", label: "購入記録", icon: "system-purchase", action: () => openFilesAt("root", "f10") },
    { id: "temp", label: "一時保存", icon: "system-temp", action: () => openFilesAt("temp", null) },
    { id: "trash", label: "ごみ箱", icon: "system-trash", action: () => openFilesAt("trash", null) }
  ];

  const claimNotifications = {
    I1: { id: "claim-i1", appId: "social", title: "Ripple", body: "保存していた返信が1件増えました。" },
    I2: { id: "claim-i2", appId: "search", title: "Mira Search", body: "保存索引の件数が更新されました。" },
    I3: { id: "claim-i3", appId: "mail", title: "Postbox", body: "保管箱の受信記録を更新しました。" },
    I4: { id: "claim-i4", appId: "social", title: "Ripple", body: "通知プレビューが1件戻りました。", payload: { view: "notifications" } },
    I5: { id: "claim-i5", appId: "line", title: "Link", body: "未登録連絡先から不在着信があります。", payload: { tab: "calls" } },
    I6: { id: "claim-i6", appId: "files", title: "Files", body: "一時保存フォルダーを更新しました。" },
    I7: { id: "claim-i7", appId: "search", title: "Mira Search", body: "保存索引の表示が更新されました。" },
    I8: { id: "claim-i8", appId: "recovery", title: "復旧管理", body: "公開範囲の確認が可能です。" }
  };

  function metadata(id) {
    return Object.assign({ label: id, entry: `apps/${id}/index.html` }, catalog[id] || {});
  }

  function localAppUrl(value) {
    if (typeof value !== "string" || !/^apps\/[a-z0-9_-]+\/index\.html$/.test(value)) throw new Error("Invalid local app route");
    return value === "apps/photos/index.html" ? value + "?v=photos-zoom-1" : value;
  }

  function persistWindow(id, win) {
    const rectangle = win.getBoundingClientRect();
    window.CASE_STATE.transact((draft) => {
      draft.desktop = draft.desktop || { windows: {} };
      draft.desktop.windows = draft.desktop.windows || {};
      draft.desktop.windows[id] = {
        left: rectangle.left,
        top: rectangle.top,
        width: rectangle.width,
        height: rectangle.height,
        maximized: win.classList.contains("maximized"),
        minimized: win.hidden,
        z: Number(win.style.zIndex) || 1
      };
    }, "desktop-window");
  }

  function focusApp(id) {
    const record = windows.get(id);
    if (!record) return;
    record.win.hidden = false;
    record.task.setAttribute("aria-pressed", "true");
    record.win.style.zIndex = String(++zIndex);
    record.frame.focus();
  }

  function isFront(id) {
    const record = windows.get(id);
    if (!record || record.win.hidden) return false;
    const visible = [...windows.values()].filter((item) => !item.win.hidden);
    if (!visible.length) return false;
    return visible.reduce((front, item) => (Number(item.win.style.zIndex) || 0) > (Number(front.win.style.zIndex) || 0) ? item : front, visible[0]) === record;
  }

  function bindDrag(win, id, bar) {
    bar.addEventListener("pointerdown", (event) => {
      if (event.button !== 0 || win.classList.contains("maximized") || matchMedia("(max-width:720px)").matches || event.target.closest("button")) return;
      const rectangle = win.getBoundingClientRect();
      const startX = event.clientX;
      const startY = event.clientY;
      bar.setPointerCapture(event.pointerId);
      const move = (next) => {
        const maxX = innerWidth - Math.min(160, rectangle.width);
        const maxY = innerHeight - 94;
        const left = Math.max(Math.min(next.clientX - startX + rectangle.left, maxX), Math.min(0, innerWidth - rectangle.width));
        const top = Math.max(0, Math.min(next.clientY - startY + rectangle.top, maxY));
        Object.assign(win.style, { inset: "auto", left: `${left}px`, top: `${top}px`, width: `${rectangle.width}px`, height: `${rectangle.height}px` });
      };
      const up = () => {
        bar.removeEventListener("pointermove", move);
        bar.removeEventListener("pointerup", up);
        bar.removeEventListener("pointercancel", up);
        persistWindow(id, win);
      };
      bar.addEventListener("pointermove", move);
      bar.addEventListener("pointerup", up);
      bar.addEventListener("pointercancel", up);
    });
    bar.addEventListener("dblclick", (event) => { if (!event.target.closest("button")) toggleMaximize(id); });
  }

  function toggleMaximize(id) {
    const record = windows.get(id);
    if (!record) return;
    record.win.classList.toggle("maximized");
    persistWindow(id, record.win);
    focusApp(id);
  }

  function sendPayload(record, payload) {
    if (!payload || !record) return;
    const dispatch = () => record.frame.contentWindow.dispatchEvent(new CustomEvent("vdm-open-payload", { detail: payload }));
    try { dispatch(); } catch (_) {}
    record.frame.addEventListener("load", dispatch, { once: true });
    // srcdoc apps can finish mounting between iframe creation and their payload listener.
    // A few short, idempotent retries make a notification deep-link reliable on first open.
    [40, 140, 320].forEach((delay) => window.setTimeout(() => {
      try { dispatch(); } catch (_) {}
    }, delay));
  }

  function openApp(id, payload) {
    if (!selectedSet.has(id)) return null;
    startMenu.hidden = true;
    startButton.setAttribute("aria-expanded", "false");
    if (windows.has(id)) {
      focusApp(id);
      sendPayload(windows.get(id), payload);
      return windows.get(id);
    }
    const meta = metadata(id);
    const win = document.createElement("section");
    win.className = "app-window";
    win.dataset.app = id;
    win.innerHTML = `<header class="window-bar"><span class="window-title"></span><div class="window-controls"><button type="button" data-window-action="minimize" aria-label="最小化">—</button><button type="button" data-window-action="maximize" aria-label="最大化">□</button><button type="button" data-window-action="close" aria-label="閉じる">×</button></div></header><iframe></iframe>`;
    win.querySelector(".window-title").textContent = meta.label;
    const frame = win.querySelector("iframe");
    frame.title = meta.label;
    if (window.VDMRuntime && typeof window.VDMRuntime.mount === "function") window.VDMRuntime.mount(frame, localAppUrl(meta.entry));
    else frame.src = localAppUrl(meta.entry);
    windowLayer.appendChild(win);

    const stored = window.CASE_STATE.get().desktop?.windows?.[id];
    const mobile = matchMedia("(max-width:720px)").matches;
    if (!mobile) {
      if (stored) {
        Object.assign(win.style, {
          inset: "auto",
          left: `${Math.max(0, Math.min(stored.left, innerWidth - 180))}px`,
          top: `${Math.max(0, stored.top)}px`,
          width: `${Math.min(stored.width, innerWidth)}px`,
          height: `${Math.min(stored.height, innerHeight - 52)}px`
        });
        win.classList.toggle("maximized", Boolean(stored.maximized));
      } else {
        const preset = meta.window || ({ line: { width: 1040, height: 710, minWidth: 760 }, social: { width: 1190, height: 740, minWidth: 780 } }[id]);
        if (preset) {
          const width = Math.min(Number(preset.width) || 1000, innerWidth - 32);
          const height = Math.min(Number(preset.height) || 700, innerHeight - 72);
          Object.assign(win.style, { inset: "auto", width: `${width}px`, height: `${height}px`, left: `${Math.max(0, Math.round((innerWidth - width) / 2))}px`, top: `${Math.max(8, Math.round((innerHeight - 52 - height) / 2))}px` });
          if (innerWidth >= Number(preset.minWidth || 0) + 20) win.style.minWidth = `${Number(preset.minWidth)}px`;
        }
      }
    }

    const task = document.createElement("button");
    task.type = "button";
    task.dataset.task=id;
    task.setAttribute("aria-pressed", "true");
    task.innerHTML = `<span class="task-icon">${iconApi.appIcon(id)}</span><span class="task-label"></span><b class="task-badge" hidden>0</b>`;
    task.querySelector(".task-label").textContent = meta.label;
    taskList.appendChild(task);
    const record = { win, task, frame };
    windows.set(id, record);
    let payloadDelivered = false;
    const deliverPayload = () => {
      if (payloadDelivered || !payload) return;
      payloadDelivered = true;
      sendPayload(record, payload);
    };
    frame.addEventListener("load", deliverPayload, { once: true });
    window.setTimeout(() => {
      try { if (frame.contentDocument?.readyState === "complete") deliverPayload(); } catch (_) {}
    }, 0);

    win.querySelector('[data-window-action="minimize"]').addEventListener("click", () => {
      win.hidden = true;
      task.setAttribute("aria-pressed", "false");
      persistWindow(id, win);
    });
    win.querySelector('[data-window-action="maximize"]').addEventListener("click", () => toggleMaximize(id));
    win.querySelector('[data-window-action="close"]').addEventListener("click", () => {
      task.remove();
      win.remove();
      windows.delete(id);
      window.CASE_STATE.transact((draft) => { if (draft.desktop?.windows) delete draft.desktop.windows[id]; }, "desktop-close");
    });
    task.addEventListener("click", () => {
      if (win.hidden) focusApp(id);
      else if (isFront(id)) {
        win.hidden = true;
        task.setAttribute("aria-pressed", "false");
        persistWindow(id, win);
      } else focusApp(id);
    });
    win.addEventListener("pointerdown", () => focusApp(id));
    bindDrag(win, id, win.querySelector(".window-bar"));
    window.CASE_STATE.touchApp(id);
    window.VDM_BUS?.emit("app:opened", { appId: id });
    focusApp(id);
    renderRecents();
    renderNotifications();
    return record;
  }

  function openFilesAt(folder, active) {
    if (!selectedSet.has("files")) return;
    window.CASE_STATE.transact((draft) => {
      draft.apps = draft.apps || {};
      draft.apps.files = Object.assign({}, draft.apps.files || {}, { folder, active, query: "", mobile: active ? "detail" : "list" });
    }, "desktop-file-shortcut");
    openApp("files", { folder, active });
  }

  function launcher(id, destination, compact) {
    if (compact == null) compact = destination === startApps || destination === recentApps;
    const app = metadata(id);
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.openApp = id;
    button.className = compact ? "start-app" : "app-icon";
    button.setAttribute("aria-label", `${app.label}を開く`);
    button.innerHTML = `<span class="app-icon-mark">${iconApi.appIcon(id)}</span><small></small><b class="launcher-badge" hidden>0</b>`;
    button.querySelector("small").textContent = app.label;
    button.addEventListener("click", (event) => { event.preventDefault(); openApp(id); });
    destination.appendChild(button);
    return button;
  }

  function createSystemLauncher(shortcut, destination, compact) {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.systemShortcut = shortcut.id;
    button.className = compact ? "start-app system-shortcut" : "app-icon system-shortcut";
    button.setAttribute("aria-label", `${shortcut.label}を開く`);
    button.innerHTML = `<span class="app-icon-mark">${iconApi.icon(shortcut.icon)}</span><small></small>`;
    button.querySelector("small").textContent = shortcut.label;
    button.addEventListener("click", (event) => { event.preventDefault(); startMenu.hidden = true; shortcut.action(); });
    destination.appendChild(button);
  }

  function renderRecents() {
    if (!recentApps) return;
    const appState = window.CASE_STATE.get().appState || {};
    const recent = selected
      .filter((id) => appState[id]?.lastOpenedAt)
      .sort((a, b) => String(appState[b].lastOpenedAt).localeCompare(String(appState[a].lastOpenedAt)))
      .slice(0, 4);
    recentApps.innerHTML = "";
    if (!recent.length) {
      const empty = document.createElement("p");
      empty.textContent = "まだありません";
      recentApps.appendChild(empty);
      return;
    }
    recent.forEach((id) => launcher(id, recentApps, true));
  }

  function notifications(current) {
    return Array.isArray(current?.desktop?.notifications) ? current.desktop.notifications : [];
  }

  function addNotification(specification, showToast) {
    const current = window.CASE_STATE.get();
    if (notifications(current).some((item) => item.id === specification.id)) return false;
    const item = Object.assign({ at: new Date().toISOString(), read: false }, specification);
    window.CASE_STATE.transact((draft) => {
      draft.desktop = draft.desktop || { windows: {} };
      draft.desktop.notifications = Array.isArray(draft.desktop.notifications) ? draft.desktop.notifications : [];
      draft.desktop.notifications.unshift(item);
    }, "desktop-notification");
    if (showToast) showNotificationToast(item);
    return true;
  }

  function ensureInitialNotification(current, showToast) {
    if (!current.setupComplete) return;
    addNotification({
      id: "link-initial-contact",
      appId: "line",
      title: "Link・未登録連絡先",
      body: "見たことを、なかったことにしない人が必要です。",
      payload: { conversationId: "unknown" }
    }, Boolean(showToast));
  }

  function markNotification(id, options) {
    const settings = options || {};
    window.CASE_STATE.transact((draft) => {
      draft.desktop = draft.desktop || { windows: {} };
      draft.desktop.notifications = (draft.desktop.notifications || []).map((item) => item.id === id ? Object.assign({}, item, { read: true, dismissed: Boolean(settings.dismissed || item.dismissed) }) : item);
    }, settings.dismissed ? "desktop-notification-dismiss" : "desktop-notification-read");
  }

  function activateNotification(item) {
    markNotification(item.id);
    notificationCenter.hidden = true;
    notificationButton.setAttribute("aria-expanded", "false");
    if (item.appId === "recovery") window.VDM_CASE_UI?.open();
    else if (selectedSet.has(item.appId)) openApp(item.appId, item.payload || null);
  }

  function showNotificationToast(item) {
    if (!toastHost) return;
    const toast = document.createElement("button");
    toast.type = "button";
    toast.className = "desktop-toast";
    toast.innerHTML = `<span class="toast-icon">${item.appId === "recovery" ? iconApi.icon("app-recovery") : iconApi.appIcon(item.appId)}</span><span><strong></strong><small></small></span>`;
    toast.querySelector("strong").textContent = item.title;
    toast.querySelector("small").textContent = item.body;
    toast.addEventListener("click", () => { toast.remove(); activateNotification(item); });
    toastHost.appendChild(toast);
    window.setTimeout(() => toast.remove(), 5500);
  }

  function renderNotifications() {
    const current = window.CASE_STATE.get();
    const items = notifications(current).filter((item) => !item.dismissed);
    const unread = items.filter((item) => !item.read);
    notificationBadge.hidden = unread.length === 0;
    notificationBadge.textContent = String(unread.length);
    notificationSummary.textContent = unread.length ? `未読 ${unread.length}件` : "新着はありません";
    notificationList.innerHTML = "";
    if (!items.length) {
      const empty = document.createElement("p");
      empty.className = "notification-empty";
      empty.textContent = "通知はありません";
      notificationList.appendChild(empty);
    } else {
      items.forEach((item) => {
        const article = document.createElement("article");
        article.className = `notification-item${item.read ? " is-read" : ""}`;
        article.innerHTML = `<button type="button" class="notification-open"><span class="notification-app-icon">${item.appId === "recovery" ? iconApi.icon("app-recovery") : iconApi.appIcon(item.appId)}</span><span><strong></strong><small></small></span></button><button type="button" class="notification-dismiss" aria-label="通知を閉じる">×</button>`;
        article.querySelector("strong").textContent = item.title;
        article.querySelector("small").textContent = item.body;
        article.querySelector(".notification-open").addEventListener("click", () => activateNotification(item));
        article.querySelector(".notification-dismiss").addEventListener("click", () => markNotification(item.id, { dismissed: true }));
        notificationList.appendChild(article);
      });
    }

    selected.forEach((id) => {
      const count = unread.filter((item) => item.appId === id).length;
      const callActive = id === "line" && Boolean(current.apps?.line?.activeCall);
      document.querySelectorAll(`[data-open-app="${id}"]`).forEach((launcher) => {
        launcher.toggleAttribute("data-call-active", callActive);
        const badge = launcher.querySelector(".launcher-badge");
        if (badge) { badge.hidden = count === 0; badge.textContent = String(count); }
      });
      const task = windows.get(id)?.task;
      task?.toggleAttribute("data-call-active", callActive);
      const taskBadge = task?.querySelector(".task-badge");
      if (taskBadge) { taskBadge.hidden = count === 0; taskBadge.textContent = String(count); }
    });
    const recoveryCount = unread.filter((item) => item.appId === "recovery").length;
    document.getElementById("case-console-button")?.toggleAttribute("data-notification", recoveryCount > 0);
  }

  selected.forEach((id) => {
    launcher(id,icons);
    launcher(id,startApps);
  });
  systemShortcuts.forEach((shortcut) => createSystemLauncher(shortcut, desktopIcons, false));
  createSystemLauncher(systemShortcuts[0], startApps, true);
  const recoveryTaskIcon = document.querySelector("#case-console-button > span:first-child");
  if (recoveryTaskIcon) recoveryTaskIcon.innerHTML = iconApi.icon("app-recovery");

  startButton.addEventListener("click", () => {
    startMenu.hidden = !startMenu.hidden;
    notificationCenter.hidden = true;
    notificationButton.setAttribute("aria-expanded", "false");
    startButton.setAttribute("aria-expanded", String(!startMenu.hidden));
    if (!startMenu.hidden) { renderRecents(); renderNotifications(); }
  });
  document.getElementById("start-filter").addEventListener("input", (event) => {
    const query = event.target.value.toLocaleLowerCase("ja");
    startApps.querySelectorAll("button").forEach((button) => { button.hidden = !button.textContent.toLocaleLowerCase("ja").includes(query); });
  });
  notificationButton.addEventListener("click", () => {
    notificationCenter.hidden = !notificationCenter.hidden;
    startMenu.hidden = true;
    startButton.setAttribute("aria-expanded", "false");
    notificationButton.setAttribute("aria-expanded", String(!notificationCenter.hidden));
    renderNotifications();
  });
  document.getElementById("notification-read-all").addEventListener("click", () => {
    window.CASE_STATE.transact((draft) => {
      draft.desktop = draft.desktop || { windows: {} };
      draft.desktop.notifications = (draft.desktop.notifications || []).map((item) => Object.assign({}, item, { read: true }));
    }, "desktop-notifications-read-all");
  });

  const dialog = document.getElementById("fiction-dialog");
  const saveStatus = document.getElementById("save-status");
  const importFile = document.getElementById("import-save-file");
  function reset() {
    if (confirm("この作品のローカル保存データを初期化します。元には戻せません。続けますか？")) {
      window.SaveAdapter.reset();
      window.CASE_STATE.reset();
      location.reload();
    }
  }
  document.getElementById("fiction-button").addEventListener("click", () => {
    const diagnostics = window.SaveAdapter.diagnostics();
    document.getElementById("info-project").textContent = manifest.projectName || "Virtual Desktop";
    document.getElementById("info-version").textContent = manifest.version || diagnostics.gameVersion;
    document.getElementById("info-save-state").textContent = diagnostics.saveAvailable ? "保存あり" : "新規";
    dialog.showModal();
  });
  document.getElementById("reset-button").addEventListener("click", reset);
  document.getElementById("dialog-reset-button").addEventListener("click", reset);
  document.getElementById("export-save-button").addEventListener("click", () => { window.SaveAdapter.exportSave(); saveStatus.textContent = "保存ファイルを書き出しました。"; });
  document.getElementById("import-save-button").addEventListener("click", () => importFile.click());
  importFile.addEventListener("change", async () => {
    if (!importFile.files?.[0]) return;
    try { await window.SaveAdapter.importSave(importFile.files[0]); location.reload(); }
    catch (error) { saveStatus.textContent = `読み込めませんでした: ${error.message}`; }
  });

  document.getElementById("start-title").textContent = manifest.projectName || "Virtual Desktop";
  const clock = document.getElementById("clock");
  const date = document.getElementById("date");
  const sessionStart = new Date("2025-06-21T02:16:00+09:00").getTime();
  const bootAt = Date.now();
  function updateClock() {
    const now = new Date(sessionStart + (Date.now() - bootAt));
    clock.textContent = new Intl.DateTimeFormat("ja-JP", { hour: "2-digit", minute: "2-digit", hour12: false }).format(now);
    date.textContent = new Intl.DateTimeFormat("ja-JP", { month: "numeric", day: "numeric" }).format(now);
  }
  updateClock();
  setInterval(updateClock, 30000);

  window.VDM_DESKTOP = { openApp, focusApp, notify: (specification) => addNotification(specification, true), refreshNotifications: renderNotifications };
  window.addEventListener("resize", () => windows.forEach((record, id) => persistWindow(id, record.win)));
  window.addEventListener("case-state-change", (event) => {
    const current = event.detail || window.CASE_STATE.get();
    if (current.reason === "setup") ensureInitialNotification(current, true);
    if (current.reason === "claim") {
      const latest = Object.entries(current.claims || {}).sort((a, b) => String(a[1]?.acceptedAt || "").localeCompare(String(b[1]?.acceptedAt || ""))).at(-1)?.[0];
      const specification = claimNotifications[latest];
      if (specification) addNotification(specification, true);
    }
    renderRecents();
    renderNotifications();
  });

  const initialState = window.CASE_STATE.get();
  renderRecents();
  renderNotifications();
  ensureInitialNotification(initialState, false);
})();
