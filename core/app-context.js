(function (global) {
  "use strict";
  const parent = global.parent !== global ? global.parent : global;
  const state = parent.CASE_STATE || global.CASE_STATE;
  const data = global.VDM_CONTENT_DATA || parent.VDM_CONTENT_DATA || {};
  const esc = (value) => String(value == null ? "" : value).replace(/[&<>"']/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[c]);
  const appId = document.body && document.body.dataset.app || "app";
  const brand = (data.branding && data.branding[appId]) || { name: appId, description: "Local application" };
  const read = (path, fallback) => path.split(".").reduce((v, key) => v && v[key], data) ?? fallback;
  const appState = (fallback) => {
    const root = state && state.get ? state.get() : {};
    root.apps = root.apps || {};
    root.apps[appId] = Object.assign({}, fallback || {}, root.apps[appId] || {});
    return root.apps[appId];
  };
  const saveAppState = (next) => {
    if (!state || !state.transact) return;
    state.transact((draft) => {
      draft.apps = draft.apps || {};
      draft.apps[appId] = Object.assign({}, draft.apps[appId] || {}, next || {});
    }, "app-state:" + appId);
  };
  const emit = (name, detail) => {
    const bus = parent.VDM_BUS || global.VDM_BUS;
    if (bus && bus.emit) bus.emit(name, Object.assign({ appId }, detail || {}));
  };
  const openApp = (id, payload) => {
    if (parent.VDM_DESKTOP && parent.VDM_DESKTOP.openApp) parent.VDM_DESKTOP.openApp(id, payload);
    emit("app:open-request", { targetAppId: id, payload: payload || null });
  };
  const frame = (title, subtitle) => {
    document.title = title || brand.name;
    const header = document.querySelector("[data-app-brand]");
    if (header) header.textContent = title || brand.name;
    const sub = document.querySelector("[data-app-description]");
    if (sub) sub.textContent = subtitle || brand.description || "";
  };
  global.VDMApp = { appId, brand, data, state, esc, read, appState, saveAppState, emit, openApp, frame };

  const endingCopy = {
    A: {
      search: "公開索引を再構築しました｜人物名と関係資料が再び照合可能になりました。",
      browser: "公開版を閲覧中｜保存版と現行版が同じ人物名で結び直されています。",
      social: "再投稿が増えています｜削除されていた引用と返信が公開資料へのリンク付きで戻り始めました。",
      line: "公開後の着信｜連絡先から、公開範囲を問い直す未読通知が届いています。",
      mail: "配信完了｜実名を含む資料束は公開領域へ移され、取り消し要求も受信しています。",
      photos: "人物タグを復元｜欠けていた名前は戻りました。写真に写る全員が検索対象です。",
      audio: "音声索引を公開｜氏名と関係先から録音を検索できる状態です。",
      files: "公開フォルダーへ移動済み｜ローカルコピーは残っています。公開先からの回収はできません。",
      notes: "追記｜存在を証明する記録は戻った。ただし、消えたかった理由まで公開された。",
      settings: "公開状態｜選択結果は確定済みです。"
    },
    B: {
      search: "匿名索引へ切り替えました｜出来事は検索できますが、人物名と私的な関係は索引から外れました。",
      browser: "匿名版を閲覧中｜学校・市・報道は復元されましたが、個人を横断するリンクはありません。",
      social: "引用を匿名化｜投稿のつながりは残り、名前と顔だけが置き換えられています。",
      line: "連絡先を分離｜会話は端末内に残り、公開先には話者名が送られていません。",
      mail: "三つの保管先へ分散｜制度資料、運用記録、検証ログを別々の匿名資料として保存しました。",
      photos: "人物タグを削除｜写真は出来事の資料として残り、誰が写っているかは公開されません。",
      audio: "話者情報を分離｜全文は残っていますが、氏名からは検索できません。",
      files: "匿名資料を分散済み｜元の対応表はこの端末だけに残っています。",
      notes: "追記｜制度の誤りは残せた。彼女がいたことは、また説明できなくなった。",
      settings: "匿名公開状態｜三つの公開操作は完了しています。"
    },
    C: {
      search: "ローカル索引は空です｜検索履歴の語句だけが残り、対応する結果はありません。",
      browser: "保存版を削除｜現在のページだけを表示しています。調査中に確保した版はありません。",
      social: "保存投稿なし｜引用、返信、通知プレビューを含むローカルコピーは削除されました。",
      line: "復元データなし｜連絡先名は残っていますが、調査用の会話コピーは開けません。",
      mail: "調査フォルダーを削除｜送受信箱の通常メールだけが残っています。",
      photos: "調査アルバムなし｜比較用に確保した画像と人物タグは削除されました。",
      audio: "復元録音なし｜調査用の音声、字幕、文字起こしは削除されました。",
      files: "削除処理完了｜ファイル名の索引だけが残り、内容は復元できません。",
      notes: "空白の追記｜これで正しかった、と書くための記録も消した。",
      settings: "削除済み｜選択結果は保存されています。"
    }
  };

  function applySettings(settings) {
    const value = settings || {}, root = document.documentElement;
    root.style.fontSize = `${Number(value.textScale || 1) * 100}%`;
    root.dataset.contrast = value.contrast || "normal";
    root.classList.toggle("reduce-motion", Boolean(value.reducedMotion));
    document.querySelectorAll("audio, video").forEach((media) => {
      media.volume = Math.max(0, Math.min(1, Number(value.volume == null ? 1 : value.volume)));
      media.muted = value.sound === false;
    });
  }

  function endingEffect(current) {
    const text = current?.ending && endingCopy[current.ending]?.[appId];
    if (!text || document.querySelector("[data-ending-app-effect]")) return;
    const [title, detail] = text.split("｜"), panel = document.createElement("aside");
    panel.className = `ending-app-effect ending-${current.ending.toLowerCase()}`;
    panel.dataset.endingAppEffect = current.ending;
    panel.setAttribute("role", "status");
    panel.innerHTML = `<strong>${esc(title)}</strong><span>${esc(detail)}</span>`;
    (document.getElementById("app-body") || document.body).prepend(panel);
  }

  function currentState() { return parent.CASE_STATE?.get?.() || {}; }
  const boot = () => {
    const current = currentState();
    applySettings(current.apps?.settings || current.settings);
    endingEffect(current);
  };
  parent.addEventListener("vdm-settings-change", (event) => applySettings(event.detail));
  parent.addEventListener("case-state-change", (event) => {
    const current = event.detail || currentState();
    if (current.reason === "ending") { endingEffect(current); global.setTimeout(() => global.location.reload(), 100); }
    else if (current.reason === "claim") global.setTimeout(() => global.location.reload(), 60);
  });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
  else boot();
})(window);
