(function () {
  "use strict";

  const app = window.VDMApp;
  const data = app.read("notes", {});
  const root = document.getElementById("app-body");
  app.frame(app.brand.name, app.brand.description);
  const state = app.appState({ active: null, query: "", local: [], deleted: [], mobile: "list" });
  let debounce = 0;

  function save() { app.saveAppState(state); }
  function allNotes() { return [...state.local, ...(data.items || [])].filter((item) => !state.deleted.includes(item.id)); }

  function update(item, patch) {
    if (!state.local.some((note) => note.id === item.id)) state.local.unshift(Object.assign({}, item));
    const local = state.local.find((note) => note.id === item.id);
    Object.assign(local, patch, { updatedAt: new Date().toISOString() });
    window.clearTimeout(debounce);
    const status = root.querySelector("[data-status]");
    if (status) status.textContent = "保存中…";
    debounce = window.setTimeout(() => {
      save();
      const nextStatus = root.querySelector("[data-status]");
      if (nextStatus) nextStatus.textContent = "保存済み";
    }, 350);
  }

  function bind(active) {
    root.querySelector("[data-new]").addEventListener("click", () => {
      const note = { id: `note-${Date.now()}`, title: "無題", body: "", createdAt: new Date().toISOString(), maxLength: 5000 };
      state.local.unshift(note);
      state.active = note.id;
      state.mobile = "editor";
      save();
      render();
    });
    root.querySelector("[data-search]").addEventListener("input", (event) => {
      state.query = event.target.value;
      save();
      render();
      const search = root.querySelector("[data-search]");
      search?.focus();
      search?.setSelectionRange(search.value.length, search.value.length);
    });
    root.querySelectorAll("[data-note]").forEach((button) => button.addEventListener("click", () => {
      state.active = button.dataset.note;
      state.mobile = "editor";
      save();
      render();
    }));
    root.querySelector("[data-back]")?.addEventListener("click", () => { state.mobile = "list"; save(); render(); });
    root.querySelector("[data-delete]")?.addEventListener("click", () => {
      if (!active) return;
      if (!state.deleted.includes(active.id)) state.deleted.push(active.id);
      state.active = null;
      state.mobile = "list";
      save();
      render();
    });
    root.querySelector("[data-title]")?.addEventListener("input", (event) => update(active, { title: event.target.value }));
    root.querySelector("[data-body]")?.addEventListener("input", (event) => {
      update(active, { body: event.target.value });
      const counter = root.querySelector("[data-count]");
      if (counter) counter.textContent = `${event.target.value.length} / ${active.maxLength || 5000}`;
    });
  }

  function render() {
    const notes = allNotes();
    const visible = notes.filter((item) => window.VDMText.includesAll([item.title, item.body].join(" "), state.query));
    const active = notes.find((item) => item.id === state.active);
    root.innerHTML = `<section class="notes-layout"><aside class="note-list ${state.mobile === "list" ? "mobile-active" : ""}"><div class="toolbar"><button class="primary" type="button" data-new>新規メモ</button><input class="field" data-search value="${app.esc(state.query)}" placeholder="メモを検索" aria-label="メモを検索"></div>${visible.map((note) => `<button class="note-row" type="button" data-note="${app.esc(note.id)}"><strong>${app.esc(note.title || "無題")}</strong><small>${app.esc(String(note.body || "").slice(0, 48))}</small></button>`).join("")}</aside><main class="note-editor ${state.mobile === "editor" ? "mobile-active" : ""}">${active ? `<div class="toolbar"><button class="ghost mobile-only" type="button" data-back>←</button><button class="ghost" type="button" data-delete>削除</button><span data-count>${String(active.body || "").length} / ${active.maxLength || 5000}</span></div><input class="note-title" data-title value="${app.esc(active.title || "")}" maxlength="100" aria-label="メモの題名"><textarea class="note-text" data-body maxlength="${active.maxLength || 5000}" aria-label="メモ本文">${app.esc(active.body || "")}</textarea><div class="note-status" data-status role="status">保存済み</div>` : '<div class="empty">メモを選択してください</div>'}</main></section>`;
    bind(active);
  }

  render();
})();
