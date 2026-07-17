(function () {
  "use strict";

  const registry = window.VDM_CASE_REGISTRY || { evidence: {}, claims: {}, endings: {} };
  const claimEntries = Object.entries(registry.claims || {});
  const escapeHtml = (value) => String(value == null ? "" : value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[character]);

  const style = document.createElement("style");
  style.textContent = `
    .case-console-task{height:34px;align-self:center;border:1px solid #ffffff24;border-radius:8px;background:#171b23;color:#e8ebf2;padding:0 14px;font-weight:700;flex:0 0 auto}
    .case-console-task[data-alert="true"]{box-shadow:0 0 0 2px #a8c9ff66 inset}
    .case-layer{position:fixed;inset:0;z-index:9998;background:#070910c7;backdrop-filter:blur(12px);display:grid;place-items:center;padding:20px}
    .case-panel{width:min(1080px,96vw);max-height:min(840px,92dvh);min-height:0;overflow-y:auto;overscroll-behavior:contain;color:#e9ebf3;background:linear-gradient(145deg,#171b25,#0e1118);border:1px solid #ffffff20;border-radius:18px;box-shadow:0 26px 90px #000a;padding:24px;scrollbar-gutter:stable}
    .case-panel h1,.case-panel h2,.case-panel h3{margin:.25em 0}.case-panel p{line-height:1.75;color:#b9c0ce}.case-panel button,.case-panel input{font:inherit}
    .case-close{float:right;border:0;background:#ffffff12;color:white;border-radius:8px;padding:9px 13px}.setup-mark{font-size:12px;letter-spacing:.2em;color:#96a9c9}
    .setup-form{display:grid;gap:14px;margin-top:22px}.setup-form input[type=text]{min-height:48px;border:1px solid #ffffff2b;border-radius:10px;background:#090c12;color:white;padding:0 14px}.setup-form button,.case-commit{min-height:48px;border:0;border-radius:10px;background:#dce7ff;color:#10131a;font-weight:800}.setup-note{font-size:13px;color:#929bab!important}
    .recovery-grid{display:grid;grid-template-columns:minmax(250px,.72fr) minmax(0,1.8fr);gap:18px;min-height:0}.recovery-sidebar{display:grid;align-content:start;gap:12px}.recovery-section{border:1px solid #ffffff18;border-radius:13px;background:#ffffff05;padding:14px}.recovery-section h2{font-size:15px}.recovery-records{display:grid;gap:7px;min-height:0;padding-right:4px}.recovery-record{border-left:2px solid #7890b6;padding:5px 0 5px 10px}.recovery-record strong{display:block;font-size:13px}.recovery-record small{color:#8fa3c4}.recovery-empty{font-size:13px;color:#8e98a9!important}.recovery-console{display:flex;flex-direction:column;overflow:hidden}.recovery-console>.case-close{align-self:flex-end;flex:0 0 auto}.recovery-purpose{margin:14px 0 5px;padding:13px 15px;border-left:3px solid #9db5dc;background:#9db5dc12;color:#edf2fb}.recovery-purpose span{display:block;margin-bottom:3px;color:#94a8c7;font-size:11px;letter-spacing:.12em}.recovery-panels{flex:1 1 auto;min-height:0;overflow:hidden}.recovery-panel{height:100%;min-height:0;overflow-y:auto;overscroll-behavior:contain;scrollbar-gutter:stable;padding-right:4px}.recovery-panel[hidden]{display:none}.observation-direction{margin:8px 0 12px;padding:10px 12px;border-radius:9px;background:#0b0f17;color:#c4cedd!important}.observation-direction strong{display:block;margin-bottom:3px;color:#8fa3c4;font-size:11px;letter-spacing:.08em}
    .relationship-map{display:flex;gap:6px;flex-wrap:wrap}.relationship-map span{border:1px solid #ffffff20;border-radius:99px;padding:5px 9px;font-size:12px}.relationship-map span::after{content:" ·";color:#75849e}.relationship-map span:last-child::after{content:""}
    .claim-workspace{display:grid;gap:12px}.claim-card{border:1px solid #ffffff18;border-radius:14px;padding:17px;background:#ffffff06}.claim-card.is-current{border-color:#8aa6d966;box-shadow:0 0 0 1px #8aa6d922 inset}.claim-card.is-locked{opacity:.65}.claim-card header{display:flex;gap:12px;align-items:baseline;justify-content:space-between}.claim-card header small{color:#8fa3c4}.claim-result{color:#b8e6cc!important}.claim-question{font-size:17px;color:#eef1f7!important}.interpretation-options{display:grid;gap:8px;margin:12px 0}.interpretation-options label,.evidence-picks label{display:flex;gap:9px;align-items:flex-start;border:1px solid #ffffff18;border-radius:9px;padding:10px;background:#0b0e14}.interpretation-options input,.evidence-picks input{margin-top:4px}.evidence-picks{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:8px;margin:12px 0}.evidence-picks small{display:block;color:#8fa3c4}.claim-submit{border:1px solid #ffffff2b;border-radius:9px;background:#e7ecf7;color:#11151c;padding:10px 14px;font-weight:750}.claim-status{min-height:24px;color:#e8c58b!important}.recovery-tabs{display:flex;gap:6px;flex-wrap:wrap;margin:14px 0}.recovery-tabs button{border:1px solid #ffffff20;background:#ffffff08;color:white;border-radius:9px;padding:8px 11px}.recovery-tabs button[aria-selected=true]{background:#dce7ff;color:#10131a}.snapshot-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:6px 12px;align-items:center;border-top:1px solid #ffffff12;padding:12px 0}.snapshot-row strong{overflow-wrap:anywhere}.snapshot-row p{grid-column:1;margin:0}.snapshot-open{grid-column:2;grid-row:1/3;min-height:40px;border:1px solid #ffffff2b;border-radius:8px;background:#ffffff0b;color:white;padding:0 12px}.hint-stack{display:grid;gap:8px}.hint-stack button{border:1px solid #ffffff20;border-radius:8px;background:#ffffff09;color:white;padding:8px;text-align:left}.hint-answer{border-left:2px solid #9db5dc;padding-left:10px;color:#c6cfde!important}
    .ending-review{display:grid;grid-template-columns:1fr 1fr;gap:10px}.ending-review article{border:1px solid #ffffff1b;border-radius:11px;padding:12px}.ending-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-top:14px}.ending-card{border:1px solid #ffffff22;border-radius:12px;padding:14px;background:#ffffff06}.ending-card button{width:100%;min-height:44px}.ending-workspace{border-top:1px solid #ffffff1b;margin-top:18px;padding-top:18px}.ending-bundle{border:1px dashed #9bb2d7;border-radius:10px;padding:14px;background:#151b26;cursor:grab}.ending-drop{border:1px dashed #ffffff40;border-radius:10px;min-height:76px;display:grid;place-items:center;padding:12px;margin:10px 0}.ending-drop.is-ready{background:#9bb2d722;border-color:#b6c9e7}.ending-steps{display:grid;gap:8px}.ending-steps button{min-height:44px;border:1px solid #ffffff24;border-radius:8px;background:#ffffff08;color:white}.ending-steps button.done{background:#b8e6cc;color:#10131a}.ending-confirm input[type=text]{width:100%;min-height:46px;border:1px solid #ffffff2b;border-radius:9px;background:#090c12;color:white;padding:0 12px}.case-commit:disabled{opacity:.45}.hold-meter{height:5px;background:#ffffff12;border-radius:99px;overflow:hidden;margin-top:8px}.hold-meter i{display:block;height:100%;width:var(--hold,0%);background:#b8e6cc}.ending-screen{position:fixed;inset:0;z-index:10000;background:radial-gradient(circle at 50% 25%,#182035,#07080b 65%);color:#e9eaf0;display:grid;place-items:center;padding:24px}.ending-screen article{max-width:720px;border:1px solid #ffffff1c;border-radius:18px;padding:28px;background:#0d1119e8}.ending-screen p{line-height:1.85;color:#b8bbc4}.ending-screen .actions{display:flex;gap:9px;flex-wrap:wrap}.ending-screen button{min-height:44px;border:1px solid #ffffff24;border-radius:9px;background:#e5ebf8;color:#11151c;padding:0 14px;font-weight:700}.ending-screen button.secondary{background:#ffffff08;color:white}.case-toast{position:fixed;right:18px;bottom:62px;z-index:10001;background:#171b24;color:white;border:1px solid #ffffff24;border-radius:10px;padding:12px 16px;box-shadow:0 14px 40px #0008}
    html[data-ending="A"] body::after,html[data-ending="B"] body::after,html[data-ending="C"] body::after{content:attr(data-ending-label);position:fixed;right:18px;top:18px;z-index:9000;border:1px solid #ffffff22;border-radius:99px;padding:7px 11px;background:#0b0e15cc;color:#dce5f6;font-size:12px;pointer-events:none}
    @media(max-width:760px){.case-layer{padding:0}.case-panel{border-radius:0;width:100%;height:100%;max-height:none}.case-console-task{padding:0 8px}.recovery-grid{grid-template-columns:1fr}.recovery-sidebar{order:2}.ending-grid,.ending-review{grid-template-columns:1fr}.evidence-picks{grid-template-columns:1fr}}
  `;
  document.head.appendChild(style);

  const state = () => window.CASE_STATE.get();

  function toast(message) {
    document.querySelector(".case-toast")?.remove();
    const element = document.createElement("div");
    element.className = "case-toast";
    element.textContent = message;
    document.body.appendChild(element);
    window.setTimeout(() => element.remove(), 3600);
  }

  function applyEndingToDesktop(ending) {
    if (!ending) return;
    const labels = { A: "参照関係: 統合済み", B: "公開記録: 匿名分散", C: "ローカル領域: 初期化済み" };
    document.documentElement.dataset.ending = ending;
    document.documentElement.dataset.endingLabel = labels[ending];
    const title = document.getElementById("start-title");
    if (title) title.textContent = ending === "A" ? "藤崎千尋" : ending === "B" ? "公開記録端末" : "中古PC / 初期化済み";
  }

  function setup() {
    const current = state();
    if (current.ending) {
      applyEndingToDesktop(current.ending);
      renderEndingResult(current.ending);
      return;
    }
    if (current.setupComplete) return;
    const layer = document.createElement("section");
    layer.className = "case-layer";
    layer.innerHTML = `
      <article class="case-panel">
        <p class="setup-mark">LOCAL RECOVERY SESSION</p>
        <h1>このPCを使用する人</h1>
        <p>中古PCの初期設定です。入力した名前は、この作品のローカル保存にだけ使われます。実端末のアカウント名や位置情報は取得しません。</p>
        <p class="setup-note">フィクション作品です。失踪、ストーカー被害、社会的孤立、記憶への不安を扱います。流血表現とジャンプスケアはありません。音声なしでも最後まで進められます。作中音声はAIで生成されており、実在人物の声を模倣していません。</p>
        <form class="setup-form">
          <label>この端末での表示名<input name="name" type="text" maxlength="24" required autocomplete="off" placeholder="表示名"></label>
          <label><input type="checkbox" name="fiction" required> 内容がフィクションであることを確認しました</label>
          <button>ローカルセッションを開始</button>
        </form>
      </article>`;
    document.body.appendChild(layer);
    layer.querySelector("form").addEventListener("submit", (event) => {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);
      const name = String(formData.get("name") || "").trim();
      if (!name) return;
      window.CASE_STATE.transact((draft) => {
        draft.player.displayName = name;
        draft.setupComplete = true;
        draft.worldVersion = 1;
        draft.discoveredTerms = ["藤崎千尋"];
      }, "setup");
      layer.remove();
      window.setTimeout(() => window.VDM_DESKTOP?.openApp("search"), 120);
    });
  }

  function completeEvidenceIds(current) {
    return Object.keys(current.evidence || {}).filter((id) => window.CASE_STATE.isEvidenceComplete(id));
  }

  function observedFor(claim, current) {
    return claim.evidenceIds.filter((id) => current.evidence[id] && window.CASE_STATE.isEvidenceComplete(id));
  }

  function distinctMedia(ids, current) {
    return new Set(ids.map((id) => current.evidence[id]?.medium).filter(Boolean)).size;
  }

  function relationshipNodes(current) {
    const nodes = ["藤崎千尋"];
    if (current.claims.I1) nodes.push("東雲遥", "河合美緒", "霧川市資料室");
    if (current.claims.I3) nodes.push("きりかわ暮らし支援室", "東浜情報ソリューションズ");
    if (current.claims.I4) nodes.push("水原聡", "新堂里緒");
    if (current.claims.I7) nodes.push("過去所有者", "現在の利用者");
    return nodes;
  }

  function recordsMarkup(current) {
    const ids = completeEvidenceIds(current);
    if (!ids.length) return '<p class="recovery-empty">詳細まで確認した資料はまだありません。</p>';
    return ids.map((id) => {
      const item = registry.evidence[id] || {};
      const entry = current.evidence[id] || {};
      const source = entry.observations && entry.observations.at(-1);
      return `<article class="recovery-record" data-evidence-record="${escapeHtml(id)}"><strong>${escapeHtml(item.label || "保存資料")}</strong><small>${escapeHtml(entry.medium || item.medium || "記録")} · ${escapeHtml(source?.action || "詳細確認")}</small></article>`;
    }).join("");
  }

  function snapshotsMarkup(current) {
    if (current.ending === "C") return '<p class="recovery-empty">保存版は削除されました。現在のページ以外に、調査中に確保した版は残っていません。</p>';
    const snapshots = Object.entries(current.snapshots || {});
    if (!snapshots.length) return '<p class="recovery-empty">保存版は、初版を確認したページから順に追加されます。</p>';
    return snapshots.map(([key, item]) => `<article class="snapshot-row"><strong>${escapeHtml(item.url)}</strong><p>保存版 ${escapeHtml(item.version)} · ${escapeHtml(item.capturedAt)}</p><button class="snapshot-open" type="button" data-open-snapshot="${escapeHtml(key)}">保存内容を開く</button></article>`).join("");
  }

  function nextClaim(current) {
    return claimEntries.find(([id, claim]) => !current.claims[id] && (!claim.dependency || current.claims[claim.dependency]));
  }

  const objectiveFallbacks = {
    I1: "藤崎千尋が実在したことを、別の運営主体の記録で確認する。",
    I2: "同じ人物を扱う初版と現行版を比べ、変わった範囲を確かめる。",
    I3: "保護制度が本人へ約束した範囲を、別の資料で確認する。",
    I4: "本人の同意と、周囲の人の発言が同じ扱いか確かめる。",
    I5: "本文の外に残る返信・通知・連絡経路のつながりを整理する。",
    I6: "保存された応答と現在の応答を、運用記録と合わせて比べる。",
    I7: "この端末が偶然残ったのか、以前の利用記録から判断する。",
    I8: "過去の利用者と現在の利用者が、同じ処理へ結ばれているか確かめる。"
  };

  const directionFallbacks = {
    I1: "同じ人物を、異なる組織が残した記録で確認してください。",
    I2: "同じ資料の保存版と現在の表示で、変わった範囲を比べてください。",
    I3: "制度の説明と、実際に交わされた同意の範囲を比べてください。",
    I4: "申請者本人の情報と、周囲の人の発言が同じ扱いか確認してください。",
    I5: "本文が消えていても残る引用、返信、通知の関係を確認してください。",
    I6: "過去の応答と現在の応答を、別の運用記録と合わせてください。",
    I7: "端末に残る所有記録と、保存方針の記録を別媒体で確認してください。",
    I8: "過去の参照者と現在の参照者を、異なる種類の記録で確かめてください。"
  };

  function claimObjective(id, claim) {
    return claim.currentObjective || objectiveFallbacks[id] || "集めた資料の出典と内容を整理する。";
  }

  function observationDirection(id, claim) {
    return claim.observationDirection || directionFallbacks[id] || "同じ出来事を扱う、出典の異なる記録を確認してください。";
  }

  function currentPurpose(current) {
    const pending = nextClaim(current);
    if (!pending) return "保存資料を公開範囲ごとに分け、残すものと伏せるものを確認する。";
    return claimObjective(pending[0], pending[1]);
  }

  function claimEligibility(id, claim, current) {
    const dependencyReady = !claim.dependency || current.claims[claim.dependency];
    const observed = observedFor(claim, current);
    return { dependencyReady, observed, eligible: dependencyReady && observed.length >= claim.min && distinctMedia(observed, current) >= 2 };
  }

  function hasEligibleClaim(current) {
    return claimEntries.some(([id, claim]) => !current.claims[id] && claimEligibility(id, claim, current).eligible);
  }

  function claimMarkup(id, claim, current) {
    const done = current.claims[id];
    const { dependencyReady, observed, eligible } = claimEligibility(id, claim, current);
    const direction = observationDirection(id, claim);

    if (done) {
      const selected = done.evidenceIds.map((evidenceId) => registry.evidence[evidenceId]?.label || "保存資料").join("／");
      return `<article class="claim-card" data-claim="${id}"><header><small>照合済み</small><h2>${escapeHtml(claim.stage)}</h2></header><p class="claim-result">${escapeHtml(claim.result)}</p><p>${escapeHtml(selected)}</p></article>`;
    }
    if (!dependencyReady) {
      return `<article class="claim-card is-locked" data-claim="${id}"><header><small>保留</small><h2>未整理の照合枠</h2></header><p>前の関連付けがまとまると、ここへ資料を置けます。</p></article>`;
    }
    if (!eligible) {
      return `<article class="claim-card is-current" data-claim="${id}"><header><small>整理中</small><h2>${escapeHtml(claim.stage)}</h2></header><p class="observation-direction"><strong>観察の方向</strong>${escapeHtml(direction)}</p><p>記録の関連付けに必要な資料が不足しています。</p></article>`;
    }

    const options = claim.options.map((option) => `<label><input type="radio" name="interpretation-${id}" value="${escapeHtml(option.id)}"> <span>${escapeHtml(option.label)}</span></label>`).join("");
    const picks = observed.map((evidenceId) => {
      const item = registry.evidence[evidenceId];
      return `<label><input type="checkbox" value="${escapeHtml(evidenceId)}"> <span><strong>${escapeHtml(item?.label || "保存資料")}</strong><small>${escapeHtml(current.evidence[evidenceId]?.medium || item?.medium || "記録")}</small></span></label>`;
    }).join("");
    return `<article class="claim-card is-current" data-claim="${id}"><header><small>照合可能</small><h2>${escapeHtml(claim.stage)}</h2></header><p class="observation-direction"><strong>観察の方向</strong>${escapeHtml(direction)}</p><p class="claim-question">${escapeHtml(claim.question)}</p><div class="interpretation-options">${options}</div><h3>根拠に使う資料</h3><div class="evidence-picks">${picks}</div><button class="claim-submit" type="button" data-accept-claim="${id}">選んだ関係を保存</button><p class="claim-status" role="status"></p></article>`;
  }

  function hintMarkup(current) {
    const pending = nextClaim(current);
    if (!pending) return '<p class="recovery-empty">現在利用できるヒントはありません。</p>';
    const [id, claim] = pending;
    const used = Number(current.settings?.hintLevels?.[id] || 0);
    return `<div class="hint-stack" data-hint-claim="${id}">${claim.hints.map((hint, index) => `<button type="button" data-hint-level="${index + 1}">${index === 0 ? "観察対象" : index === 1 ? "比較方法" : "具体的な場所"}</button>${used >= index + 1 ? `<p class="hint-answer">${escapeHtml(hint)}</p>` : ""}`).join("")}</div>`;
  }

  function renderConsole() {
    document.querySelector(".case-layer")?.remove();
    document.querySelector(".ending-screen")?.remove();
    const current = state();
    const layer = document.createElement("section");
    layer.className = "case-layer";
    layer.innerHTML = `
      <article class="case-panel recovery-console">
        <button class="case-close" type="button">閉じる</button>
        <p class="setup-mark">LOCAL RECOVERY / REFERENCE REVIEW</p>
        <h1>復旧管理</h1>
        <p>詳細まで確認した資料を、出典の異なる記録どうしで関連付けます。選択肢は判断できる材料がそろうまで表示されません。</p>
        <p class="recovery-purpose"><span>現在の整理</span>${escapeHtml(currentPurpose(current))}</p>
        <div class="recovery-tabs" role="tablist">
          <button type="button" role="tab" data-recovery-tab="records" aria-selected="false">保存資料</button>
          <button type="button" role="tab" data-recovery-tab="claims" aria-selected="true">照合</button>
          <button type="button" role="tab" data-recovery-tab="relationships" aria-selected="false">人物関係</button>
          <button type="button" role="tab" data-recovery-tab="copies" aria-selected="false">保存版</button>
          <button type="button" role="tab" data-recovery-tab="hints" aria-selected="false">ヒント</button>
          <button type="button" role="tab" data-recovery-tab="publish" aria-selected="false">公開準備</button>
        </div>
        <main class="recovery-panels">
          <section data-recovery-panel="records" class="recovery-panel" hidden><h2>確認した資料</h2><div class="recovery-records">${recordsMarkup(current)}</div></section>
          <section data-recovery-panel="claims" class="recovery-panel claim-workspace">${claimEntries.map(([id, claim]) => claimMarkup(id, claim, current)).join("")}</section>
          <section data-recovery-panel="relationships" class="recovery-panel" hidden><h2>人物関係</h2><p>照合が成立した関係だけを表示します。</p><div class="relationship-map">${relationshipNodes(current).map((node) => `<span>${escapeHtml(node)}</span>`).join("")}</div></section>
          <section data-recovery-panel="copies" class="recovery-panel" hidden><h2>ページ保存版</h2><p>開いたページはその時点の表示を保持します。再読込や新規検索は現行版を解決します。</p>${snapshotsMarkup(current)}</section>
          <section data-recovery-panel="hints" class="recovery-panel" hidden><h2>任意ヒント</h2><p>答えではなく、いま比較できる観察対象から順に開きます。</p>${hintMarkup(current)}</section>
          <section data-recovery-panel="publish" class="recovery-panel" data-ending-host hidden></section>
        </main>
      </article>`;
    document.body.appendChild(layer);

    layer.querySelector(".case-close").addEventListener("click", () => layer.remove());
    layer.querySelectorAll("[data-recovery-tab]").forEach((button) => button.addEventListener("click", () => {
      layer.querySelectorAll("[data-recovery-tab]").forEach((item) => item.setAttribute("aria-selected", String(item === button)));
      layer.querySelectorAll("[data-recovery-panel]").forEach((panel) => { panel.hidden = panel.dataset.recoveryPanel !== button.dataset.recoveryTab; });
    }));
    layer.querySelectorAll("[data-open-snapshot]").forEach((button) => button.addEventListener("click", () => {
      if (state().ending === "C") return;
      const archiveKey = button.dataset.openSnapshot;
      layer.remove();
      window.VDM_DESKTOP?.openApp("browser", { archiveKey });
    }));
    layer.querySelectorAll("[data-accept-claim]").forEach((button) => button.addEventListener("click", () => {
      const id = button.dataset.acceptClaim;
      const card = button.closest("[data-claim]");
      const interpretation = card.querySelector("input[type=radio]:checked")?.value;
      const selected = Array.from(card.querySelectorAll("input[type=checkbox]:checked"), (input) => input.value);
      const status = card.querySelector(".claim-status");
      if (!interpretation) { status.textContent = "資料から導ける解釈を一つ選んでください。"; return; }
      if (!window.CASE_STATE.acceptClaim(id, selected, interpretation)) { status.textContent = "この関連付けでは記録が収束しません。出典と解釈を見直してください。"; return; }
      toast("関連付けを保存しました。開いている資料の版は変わりません。");
      layer.remove();
      renderConsole();
    }));
    layer.querySelectorAll("[data-hint-level]").forEach((button) => button.addEventListener("click", () => {
      const id = button.closest("[data-hint-claim]").dataset.hintClaim;
      const level = Number(button.dataset.hintLevel);
      window.CASE_STATE.transact((draft) => {
        draft.settings = draft.settings || {};
        draft.settings.hintLevels = draft.settings.hintLevels || {};
        draft.settings.hintLevels[id] = Math.max(Number(draft.settings.hintLevels[id] || 0), level);
      }, "hint");
      layer.remove();
      renderConsole();
      const hintsTab = document.querySelector('[data-recovery-tab="hints"]');
      hintsTab?.click();
    }));
    renderEndings(layer.querySelector("[data-ending-host]"), current);
  }

  function renderEndings(host, current) {
    if (!current.claims.I8) { host.innerHTML = '<h2>公開準備</h2><p>公開範囲を決めるための分類は、必要な照合がそろうまで表示されません。</p>'; return; }
    host.innerHTML = `
      <hr>
      <p class="setup-mark">FINAL DISTRIBUTION DECISION</p>
      <h2>公開範囲を決める</h2>
      <p>制度の責任を示す資料と、個人を危険にさらす情報は同じ束にしません。下の影響を読んでから処理を準備します。</p>
      <div class="ending-review">
        <article><h3>制度責任として残せるもの</h3><p>契約範囲、訂正履歴、中継ログ、事業の運用記録。</p></article>
        <article><h3>個人を危険にさらすもの</h3><p>現在地、家族名、私的写真、元の連絡経路、本人の実名復帰。</p></article>
      </div>
      <label><input type="checkbox" data-impact-review> 公開責任と個人情報の違いを確認しました</label>
      <div class="ending-grid">${Object.entries(registry.endings).map(([id, ending]) => `<article class="ending-card"><h3>${escapeHtml(ending.title)}</h3><p>${escapeHtml(ending.summary)}</p><button type="button" data-prepare-ending="${id}">この処理を準備</button></article>`).join("")}</div>
      <section class="ending-workspace" data-ending-workspace hidden></section>`;

    host.querySelectorAll("[data-prepare-ending]").forEach((button) => button.addEventListener("click", () => {
      if (!host.querySelector("[data-impact-review]").checked) { toast("先に影響レビューを確認してください。"); return; }
      prepareEnding(host.querySelector("[data-ending-workspace]"), button.dataset.prepareEnding);
    }));
  }

  function holdControl(choice, milliseconds, enabled) {
    return `<button class="case-commit" type="button" data-hold-ending="${choice}" data-hold-ms="${milliseconds}" ${enabled ? "" : "disabled"}>押し続けて不可逆処理を実行</button><div class="hold-meter" aria-hidden="true"><i></i></div><p data-hold-status role="status"></p>`;
  }

  function prepareEnding(workspace, choice) {
    workspace.hidden = false;
    workspace.dataset.choice = choice;
    if (choice === "A") {
      workspace.innerHTML = `<h3>実名公開を準備</h3><p>全資料の束を公開領域へ移します。マウスではドラッグ、キーボードでは「移動」ボタンを使えます。</p><div class="ending-bundle" draggable="true" tabindex="0" data-ending-bundle>全資料・個人情報を含む</div><button type="button" data-keyboard-move>選択中の束を公開領域へ移動</button><div class="ending-drop" data-ending-drop>公開領域</div>${holdControl("A", 3000, false)}`;
      const bundle = workspace.querySelector("[data-ending-bundle]");
      const drop = workspace.querySelector("[data-ending-drop]");
      const move = () => { drop.classList.add("is-ready"); drop.textContent = "全資料を受け取りました"; workspace.querySelector("[data-hold-ending]").disabled = false; };
      bundle.addEventListener("dragstart", (event) => event.dataTransfer?.setData("text/plain", "all-records"));
      drop.addEventListener("dragover", (event) => event.preventDefault());
      drop.addEventListener("drop", (event) => { event.preventDefault(); move(); });
      workspace.querySelector("[data-keyboard-move]").addEventListener("click", move);
    } else if (choice === "B") {
      workspace.innerHTML = `<h3>匿名分散を準備</h3><p>個人情報を除いた資料を、順番に三つの公開先へ移します。</p><div class="ending-steps">${["議会記録", "地域報道", "支援団体報告"].map((label, index) => `<button type="button" data-distribute-step="${index}">${index + 1}. ${label}へ移す</button>`).join("")}</div>${holdControl("B", 2000, false)}`;
      let completed = 0;
      workspace.querySelectorAll("[data-distribute-step]").forEach((button) => button.addEventListener("click", () => {
        const expected = Number(button.dataset.distributeStep);
        if (expected !== completed) { toast("上から順に公開先を確定してください。"); return; }
        button.classList.add("done"); button.disabled = true; completed += 1;
        if (completed === 3) workspace.querySelector("[data-hold-ending]").disabled = false;
      }));
    } else {
      const phrase = "記録の外へ";
      workspace.innerHTML = `<h3>全削除を準備</h3><p>削除領域へ移す前に、画面の文言を入力します。</p><p><strong>${phrase}</strong></p><label>確認文言<input type="text" data-delete-phrase autocomplete="off"></label>${holdControl("C", 2000, false)}`;
      workspace.querySelector("[data-delete-phrase]").addEventListener("input", (event) => {
        const normalized = String(event.target.value || "").normalize("NFKC").trim();
        workspace.querySelector("[data-hold-ending]").disabled = normalized !== phrase;
      });
    }
    bindHold(workspace);
    workspace.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
  }

  function bindHold(workspace) {
    const button = workspace.querySelector("[data-hold-ending]");
    const status = workspace.querySelector("[data-hold-status]");
    const meter = workspace.querySelector(".hold-meter i");
    let timer = null;
    let frame = null;
    let startedAt = 0;
    const cancel = () => {
      clearTimeout(timer); cancelAnimationFrame(frame); timer = null; frame = null; meter.style.setProperty("--hold", "0%");
      if (!button.disabled) status.textContent = "確定は中断されました。";
    };
    const update = () => {
      const duration = Number(button.dataset.holdMs);
      const progress = Math.min(100, ((performance.now() - startedAt) / duration) * 100);
      meter.style.setProperty("--hold", `${progress}%`);
      if (progress < 100) frame = requestAnimationFrame(update);
    };
    const start = () => {
      if (button.disabled || timer) return;
      startedAt = performance.now(); status.textContent = "そのまま押し続けてください…"; update();
      timer = window.setTimeout(() => finish(button.dataset.holdEnding), Number(button.dataset.holdMs));
    };
    button.addEventListener("pointerdown", start);
    button.addEventListener("pointerup", cancel);
    button.addEventListener("pointerleave", cancel);
    button.addEventListener("keydown", (event) => { if ((event.key === " " || event.key === "Enter") && !event.repeat) { event.preventDefault(); start(); } });
    button.addEventListener("keyup", (event) => { if (event.key === " " || event.key === "Enter") cancel(); });
  }

  function finish(choice) {
    const playerName = state().player.displayName || "あなた";
    const effects = {
      A: { desktop: "identity-merged", search: `${playerName}: 0件`, ripple: "プロフィール統合", link: "連絡先名を置換" },
      B: { desktop: "public-records", search: "制度記録のみ公開", ripple: "引用だけを保持", link: "未登録着信を保持" },
      C: { desktop: "initialized", search: `${playerName}: 履歴1件`, ripple: "ローカル投稿を消去", link: "履歴を消去" }
    }[choice];
    if (!window.CASE_STATE.setEnding(choice, effects)) return;
    document.querySelector(".case-layer")?.remove();
    applyEndingToDesktop(choice);
    renderEndingResult(choice);
  }

  function renderEndingResult(choice) {
    document.querySelector(".ending-screen")?.remove();
    const current = state();
    const playerName = current.player.displayName || "あなた";
    const copy = {
      A: ["参照関係を統合しました。", `市、企業、記事、写真は戻りました。デスクトップの表示名は藤崎千尋へ置き換わっています。「${playerName}」の検索結果は0件です。誰が戻ったのかは確認できません。`],
      B: ["出来事は検索可能です。人物は照合できません。", "制度と改稿履歴は分散されました。千尋の名前は戻りません。未登録連絡先から一度だけ着信があり、応答する前に切れました。"],
      C: ["ローカル領域を初期化しました。", `藤崎千尋の検索結果は0件です。検索履歴には「${playerName}」が一件だけ残り、中古出品の説明には「初期化済みです」とあります。`]
    }[choice];
    const screen = document.createElement("section");
    screen.className = "ending-screen";
    screen.innerHTML = `<article><p class="setup-mark">ENDING / ${choice}</p><h1>${escapeHtml(copy[0])}</h1><p>${escapeHtml(copy[1])}</p><p>この結末に正解表示はありません。余波はMira Search、Ripple、Link、デスクトップで別々に残ります。</p><div class="actions"><button type="button" data-close-ending>余波を確認</button><button class="secondary" type="button" data-review-records>照合記録を見る</button><button class="secondary" type="button" data-new-game>新規ゲームを準備</button></div><div data-new-game-confirm hidden><p>現在の保存と結末を消します。もう一度押すまで実行されません。</p><button type="button" data-confirm-new-game>保存を消して最初から</button></div></article>`;
    document.body.appendChild(screen);
    screen.querySelector("[data-close-ending]").addEventListener("click", () => screen.remove());
    screen.querySelector("[data-review-records]").addEventListener("click", () => { screen.remove(); renderConsole(); });
    screen.querySelector("[data-new-game]").addEventListener("click", () => { screen.querySelector("[data-new-game-confirm]").hidden = false; });
    screen.querySelector("[data-confirm-new-game]").addEventListener("click", () => { window.CASE_STATE.reset(); location.reload(); });
  }

  document.getElementById("case-console-button")?.addEventListener("click", () => state().ending ? renderEndingResult(state().ending) : renderConsole());
  window.addEventListener("case-state-change", (event) => {
    const button = document.getElementById("case-console-button");
    if (button) button.dataset.alert = String(hasEligibleClaim(event.detail || state()));
    if (event.detail?.ending) applyEndingToDesktop(event.detail.ending);
  });

  window.VDM_CASE_UI = { open: renderConsole, showEnding: renderEndingResult };
  const consoleButton = document.getElementById("case-console-button");
  if (consoleButton) consoleButton.dataset.alert = String(hasEligibleClaim(state()));
  setup();
})();
