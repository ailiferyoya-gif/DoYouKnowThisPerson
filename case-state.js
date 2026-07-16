(function (global) {
  "use strict";

  const manifest = global.CASE_MANIFEST || {};
  const registry = global.VDM_CASE_REGISTRY || { evidence: {}, claims: {}, endings: {} };
  const key = manifest.storageKey;
  if (!key) throw new Error("CASE_MANIFEST.storageKey is required");

  const blank = () => ({
    schemaVersion: 3,
    setupComplete: false,
    worldVersion: 0,
    pageVersion: 0,
    evidence: {},
    claims: {},
    interpretations: {},
    snapshots: {},
    cachedPages: {},
    pageStates: {},
    discoveredTerms: ["藤崎千尋"],
    apps: {},
    appState: {},
    search: { history: [], sessions: [] },
    messages: {},
    mail: { drafts: [], sent: [] },
    social: { posts: [], likes: [], bookmarks: [], following: [] },
    browser: { history: [], cursor: -1, sessionId: null },
    desktop: { windows: {} },
    settings: {},
    player: { displayName: "" },
    ending: null,
    endingAt: null,
    endingEffects: {},
    behavioralFlags: {},
    updatedAt: null
  });

  const objectKeys = [
    "evidence", "claims", "interpretations", "snapshots", "cachedPages", "pageStates",
    "apps", "appState", "search", "messages", "mail", "social", "browser", "desktop",
    "settings", "player", "endingEffects", "behavioralFlags"
  ];

  function hydrate(input) {
    const base = blank();
    const source = input && typeof input === "object" ? input : {};
    const out = Object.assign(base, source);
    objectKeys.forEach((name) => {
      out[name] = Object.assign({}, base[name] || {}, source[name] || {});
    });
    out.schemaVersion = 3;
    out.discoveredTerms = Array.from(new Set(Array.isArray(source.discoveredTerms) ? source.discoveredTerms : base.discoveredTerms));
    Object.entries(out.evidence).forEach(([id, entry]) => {
      if (!entry || typeof entry !== "object") return;
      if (!Array.isArray(entry.observations) || !entry.observations.length) {
        entry.observations = [{
          sourceId: entry.payload && (entry.payload.sourceId || entry.payload.itemId) || "legacy-observation",
          medium: entry.medium || "unknown",
          action: entry.payload && entry.payload.action || "legacy",
          observedAt: entry.observedAt || new Date(0).toISOString()
        }];
      }
    });
    return out;
  }

  function read() {
    try {
      const saved = global.SaveAdapter && global.SaveAdapter.load();
      return hydrate(saved || JSON.parse(localStorage.getItem(key) || "{}"));
    } catch (_) {
      return blank();
    }
  }

  let state = read();
  const clone = () => JSON.parse(JSON.stringify(state));

  function save(reason) {
    state.updatedAt = new Date().toISOString();
    if (global.SaveAdapter) global.SaveAdapter.save(state);
    else {
      try { localStorage.setItem(key, JSON.stringify(state)); } catch (_) {}
    }
    const detail = clone();
    detail.reason = reason || "update";
    global.dispatchEvent(new CustomEvent("case-state-change", { detail }));
    if (global.VDM_BUS) global.VDM_BUS.emit("state:changed", { reason: detail.reason, state: clone() });
  }

  function observationKey(observation) {
    return [observation.sourceId, observation.action, observation.medium].join("|");
  }

  function effectiveMedium(entry) {
    const media = new Set((entry && entry.observations || []).map((item) => item.medium).filter(Boolean));
    if (media.size > 1) return "mixed";
    return media.values().next().value || entry && entry.medium || "unknown";
  }

  function isEvidenceComplete(id, sourceState) {
    const targetState = sourceState || state;
    const entry = targetState.evidence && targetState.evidence[id];
    if (!entry) return false;
    const rule = registry.evidence && registry.evidence[id] || {};
    const observations = Array.isArray(entry.observations) ? entry.observations : [];
    if (observations.length < Number(rule.requiredComponents || 1)) return false;
    if (rule.requiredComponentMedia) {
      const media = new Set(observations.map((item) => item.medium).filter(Boolean));
      if (media.size < Number(rule.requiredComponentMedia)) return false;
    }
    return true;
  }

  function observe(id, medium, payload) {
    if (!id || !registry.evidence || !registry.evidence[id]) return false;
    const meta = payload && typeof payload === "object" ? payload : {};
    const observation = {
      sourceId: String(meta.sourceId || meta.itemId || meta.id || meta.name || meta.title || `${medium || "unknown"}:${meta.action || "observe"}`),
      medium: String(typeof medium === "string" ? medium : medium && medium.medium || meta.medium || "unknown"),
      action: String(meta.action || "observe"),
      route: meta.route || "",
      appId: meta.appId || "",
      observedAt: new Date().toISOString()
    };
    const entry = state.evidence[id] || {
      observations: [],
      payload: {},
      observedAt: observation.observedAt
    };
    entry.observations = Array.isArray(entry.observations) ? entry.observations : [];
    const keyValue = observationKey(observation);
    if (entry.observations.some((item) => observationKey(item) === keyValue)) return false;
    entry.observations.push(observation);
    entry.medium = effectiveMedium(entry);
    entry.payload = Object.assign({}, entry.payload || {}, meta);
    entry.completed = isEvidenceComplete(id, { evidence: Object.assign({}, state.evidence, { [id]: entry }) });
    state.evidence[id] = entry;
    save(entry.completed ? "evidence-complete" : "evidence-component");
    if (global.VDM_BUS) {
      global.VDM_BUS.emit("evidence:observed", {
        evidenceId: id,
        medium: observation.medium,
        sourceId: observation.sourceId,
        completed: entry.completed
      });
    }
    return true;
  }

  function addDiscoveredTerms(terms) {
    const next = Array.from(new Set([...(state.discoveredTerms || []), ...(terms || []).filter(Boolean)]));
    if (next.length === state.discoveredTerms.length) return false;
    state.discoveredTerms = next;
    return true;
  }

  const discoveryByClaim = {
    I1: ["霧川市", "北辰女子大学", "東雲遥", "河合美緒"],
    I2: ["生活情報保護連携実証事業", "きりかわ暮らし支援室"],
    I3: ["関係参照補正", "東浜情報ソリューションズ"],
    I4: ["新堂里緒", "水原聡", "cache-note"],
    I5: ["中継応答", "保存通話"],
    I6: ["廃棄予定PC", "過去所有者"],
    I7: ["current_referrer", "現在セッション"],
    I8: ["公開範囲", "参照関係"]
  };

  function acceptClaim(id, evidenceIds, interpretationId) {
    const rule = registry.claims && registry.claims[id];
    if (!rule) return false;
    if (state.claims[id]) return true;
    if (rule.dependency && !state.claims[rule.dependency]) return false;
    if ((interpretationId || "supported") !== "supported") return false;
    const selected = Array.from(new Set(Array.isArray(evidenceIds) ? evidenceIds : []));
    if (selected.length < Number(rule.min || 2)) return false;
    if (selected.some((evidenceId) => !rule.evidenceIds.includes(evidenceId) || !isEvidenceComplete(evidenceId))) return false;
    const media = new Set(selected.map((evidenceId) => effectiveMedium(state.evidence[evidenceId])).filter(Boolean));
    if (media.size < 2) return false;
    state.claims[id] = {
      evidenceIds: selected,
      interpretationId: "supported",
      acceptedAt: new Date().toISOString()
    };
    state.interpretations[id] = state.claims[id];
    state.worldVersion = Math.max(state.worldVersion || 0, Number(rule.world || 0));
    state.pageVersion = (state.pageVersion || 0) + 1;
    addDiscoveredTerms(discoveryByClaim[id]);
    save("claim");
    return true;
  }

  function setEnding(choice, effects) {
    if (!state.claims.I8 || !registry.endings || !registry.endings[choice]) return false;
    if (state.ending) return state.ending === choice;
    state.ending = choice;
    state.endingAt = new Date().toISOString();
    state.endingEffects = Object.assign({}, effects || {});
    state.worldVersion = Math.max(9, state.worldVersion || 0);
    state.pageVersion = (state.pageVersion || 0) + 1;
    save("ending");
    return true;
  }

  global.CASE_STATE = {
    get: clone,
    getRegistry: () => registry,
    transact(fn, reason) {
      const draft = clone();
      fn(draft);
      state = hydrate(draft);
      save(reason || "transaction");
      return clone();
    },
    update(section, value, reason) {
      state[section] = Object.assign({}, state[section] || {}, value || {});
      save(reason || "update");
      return clone();
    },
    setPlayer(name) {
      state.player.displayName = String(name || "").trim().slice(0, 32);
      save("player");
    },
    touchApp(id) {
      state.appState[id] = Object.assign({}, state.appState[id], { lastOpenedAt: new Date().toISOString() });
      save("app-open");
    },
    observe,
    observeEvidence(id, meta) { return observe(id, meta && meta.medium, meta); },
    isEvidenceComplete,
    hasEvidence(ids) {
      return (Array.isArray(ids) ? ids : [ids]).every((id) => {
        if (/^END_[ABC]$/.test(String(id))) return state.ending === String(id).slice(-1);
        return Boolean(state.claims[id]) || isEvidenceComplete(id);
      });
    },
    hasClaim(id) { return Boolean(state.claims[id]); },
    acceptClaim,
    addDiscoveredTerms(terms) {
      if (addDiscoveredTerms(terms)) save("discovered-terms");
      return clone().discoveredTerms;
    },
    archive(url, version, content) {
      const archiveKey = `${url}@${version}`;
      if (state.snapshots[archiveKey]) return false;
      state.snapshots[archiveKey] = { url, version, content, capturedAt: new Date().toISOString() };
      save("archive");
      return true;
    },
    setEnding,
    reset() {
      if (global.SaveAdapter) global.SaveAdapter.reset();
      try { localStorage.removeItem(key); } catch (_) {}
      state = blank();
      global.dispatchEvent(new CustomEvent("case-state-change", { detail: clone() }));
    }
  };
})(window);
