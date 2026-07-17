(function () {
  "use strict";

  const app = window.VDMApp;
  const defaults = app.read("settings", {});
  const root = document.getElementById("app-body");
  const parentWindow = window.parent;
  app.frame(app.brand.name, app.brand.description);
  const state = Object.assign({}, defaults, app.appState(defaults));

  function apply() {
    const documentRoot = parentWindow.document.documentElement;
    documentRoot.style.fontSize = `${Number(state.textScale || 1) * 100}%`;
    documentRoot.dataset.contrast = state.contrast || "normal";
    documentRoot.classList.toggle("reduce-motion", Boolean(state.reducedMotion));
    parentWindow.dispatchEvent(new CustomEvent("vdm-settings-change", { detail: state }));
  }

  function save() {
    app.saveAppState(state);
    apply();
  }

  function resetDialog() {
    const dialog = document.createElement("dialog");
    dialog.innerHTML = `<section class="reset-dialog"><h2>進行状況を初期化しますか</h2><p>保存した資料、照合、メモを削除します。この操作は取り消せません。</p><div class="modal-actions"><button type="button" class="ghost" data-cancel>キャンセル</button><button type="button" class="primary" data-confirm>押し続けて初期化</button></div><div class="reset-hold-meter" aria-hidden="true"><i></i></div><p data-reset-status role="status">1.2秒押し続けてください</p></section>`;
    root.appendChild(dialog);
    dialog.showModal();
    const confirmButton = dialog.querySelector("[data-confirm]");
    const status = dialog.querySelector("[data-reset-status]");
    const meter = dialog.querySelector(".reset-hold-meter i");
    let timer = 0;
    let frame = 0;
    let startedAt = 0;
    const cancel = () => {
      window.clearTimeout(timer);
      window.cancelAnimationFrame(frame);
      timer = 0;
      frame = 0;
      meter.style.width = "0%";
      status.textContent = "初期化は中断されました。";
    };
    const update = () => {
      meter.style.width = `${Math.min(100, ((performance.now() - startedAt) / 1200) * 100)}%`;
      if (timer) frame = window.requestAnimationFrame(update);
    };
    const start = () => {
      if (timer) return;
      startedAt = performance.now();
      status.textContent = "そのまま押し続けてください…";
      update();
      timer = window.setTimeout(() => {
        timer = 0;
        parentWindow.CASE_STATE.reset();
        parentWindow.location.reload();
      }, 1200);
    };
    confirmButton.addEventListener("pointerdown", start);
    confirmButton.addEventListener("pointerup", cancel);
    confirmButton.addEventListener("pointerleave", cancel);
    confirmButton.addEventListener("pointercancel", cancel);
    confirmButton.addEventListener("keydown", (event) => {
      if ((event.key === "Enter" || event.key === " ") && !event.repeat) {
        event.preventDefault();
        start();
      }
    });
    confirmButton.addEventListener("keyup", (event) => {
      if (event.key === "Enter" || event.key === " ") cancel();
    });
    dialog.querySelector("[data-cancel]").addEventListener("click", () => dialog.close());
    dialog.addEventListener("close", () => { cancel(); dialog.remove(); });
  }

  function bind() {
    root.querySelectorAll("[data-key]").forEach((element) => {
      if (element.tagName === "SELECT") element.value = state[element.dataset.key];
      element.addEventListener("input", () => {
        state[element.dataset.key] = element.type === "checkbox" ? element.checked : element.type === "range" ? Number(element.value) : element.value;
        save();
      });
    });
    root.querySelectorAll("[data-section]").forEach((button) => button.addEventListener("click", () => {
      root.querySelector(`#${button.dataset.section}`)?.scrollIntoView({ behavior: state.reducedMotion ? "auto" : "smooth", block: "start" });
    }));
    root.querySelector("[data-export]").addEventListener("click", () => parentWindow.SaveAdapter?.exportSave());
    root.querySelector("[data-import]").addEventListener("click", () => root.querySelector("[data-file]").click());
    root.querySelector("[data-file]").addEventListener("change", async (event) => {
      if (!event.target.files?.[0]) return;
      await parentWindow.SaveAdapter.importSave(event.target.files[0]);
      parentWindow.location.reload();
    });
    root.querySelector("[data-reset]").addEventListener("click", resetDialog);
  }

  function render() {
    const diagnostics = parentWindow.SaveAdapter?.diagnostics?.() || {};
    root.innerHTML = `<section class="settings-layout"><nav class="rail" aria-label="設定の項目"><button class="nav-button" data-section="accessibility">アクセシビリティ</button><button class="nav-button" data-section="save">セーブ</button><button class="nav-button" data-section="about">作品情報</button></nav><main class="settings-page"><h1>設定</h1><section id="accessibility" tabindex="-1"><h2>表示と再生</h2><div class="setting-row"><span><strong>音声</strong><small>効果音と音声再生</small></span><input class="switch" type="checkbox" data-key="sound" ${state.sound ? "checked" : ""}></div><div class="setting-row"><label for="volume"><strong>音量</strong></label><input id="volume" type="range" min="0" max="1" step=".05" value="${Number(state.volume ?? .8)}" data-key="volume"></div><div class="setting-row"><span><strong>動きを減らす</strong><small>アニメーションを抑制</small></span><input class="switch" type="checkbox" data-key="reducedMotion" ${state.reducedMotion ? "checked" : ""}></div><div class="setting-row"><label for="scale"><strong>文字サイズ</strong></label><input id="scale" type="range" min=".85" max="1.35" step=".05" value="${Number(state.textScale || 1)}" data-key="textScale"></div><div class="setting-row"><label for="contrast"><strong>コントラスト</strong></label><select id="contrast" class="field" data-key="contrast"><option value="normal">標準</option><option value="high">高</option></select></div><div class="setting-row"><span><strong>ヒント</strong><small>作品内ヒント表示を許可</small></span><input class="switch" type="checkbox" data-key="hints" ${state.hints ? "checked" : ""}></div></section><section class="card knowledge" id="save" tabindex="-1"><h2>セーブ管理</h2><p>保存状態: ${diagnostics.saveAvailable ? "保存あり" : "新規"}</p><div class="save-tools"><button class="ghost" type="button" data-export>書き出す</button><button class="ghost" type="button" data-import>読み込む</button><input type="file" accept="application/json" data-file hidden></div></section><section class="card knowledge" id="about" tabindex="-1"><h2>作品情報</h2><dl class="info-grid"><dt>作品</dt><dd>${app.esc(parentWindow.CASE_MANIFEST?.projectName || "Virtual Desktop Mystery")}</dd><dt>バージョン</dt><dd>${app.esc(parentWindow.CASE_MANIFEST?.version || "2.1.0")}</dd><dt>通信</dt><dd>外部通信なし</dd></dl></section><section class="danger-zone"><h2>初期化</h2><p>進行状況とアプリ内の書き込みを削除します。</p><button class="ghost" type="button" data-reset>リセット手順を開く</button></section></main></section>`;
    bind();
  }

  apply();
  render();
})();
