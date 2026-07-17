(function (global) {
  "use strict";

  function settingsFromState(state) {
    return state && state.apps && state.apps.settings || state && state.settings || {};
  }

  function applyToDocument(doc, settings) {
    if (!doc || !doc.documentElement) return;
    const root = doc.documentElement;
    root.style.fontSize = `${Number(settings.textScale || 1) * 100}%`;
    root.dataset.contrast = settings.contrast || "normal";
    root.classList.toggle("reduce-motion", Boolean(settings.reducedMotion));
  }

  function applySettings(settings) {
    const value = settings || {};
    applyToDocument(document, value);
    document.querySelectorAll(".app-window iframe").forEach((frame) => {
      try { applyToDocument(frame.contentDocument, value); } catch (_) {}
    });
  }

  function bindFrame(frame) {
    if (!frame || frame.dataset.polishBound) return;
    frame.dataset.polishBound = "true";
    frame.addEventListener("load", () => {
      const state = global.CASE_STATE && global.CASE_STATE.get ? global.CASE_STATE.get() : {};
      try { applyToDocument(frame.contentDocument, settingsFromState(state)); } catch (_) {}
    });
  }

  function applyWorldState(state) {
    const current = state || {};
    const world = Number(current.worldVersion || 0);
    const band = current.ending ? "ending" : world >= 7 ? "late" : world >= 3 ? "mid" : "early";
    document.documentElement.dataset.worldBand = band;
    const desktop = document.getElementById("desktop");
    if (desktop) desktop.dataset.worldBand = band;
    if (current.ending) {
      document.body.dataset.ending = current.ending;
      document.documentElement.dataset.ending = current.ending;
    }
    const echo = document.getElementById("desktop-identity-echo");
    if (echo) echo.textContent = (band === "late" || band === "ending") ? String(current.player?.displayName || "") : "";
  }

  const observer = new MutationObserver((records) => {
    records.forEach((record) => record.addedNodes.forEach((node) => {
      if (!(node instanceof Element)) return;
      if (node.matches("iframe")) bindFrame(node);
      node.querySelectorAll && node.querySelectorAll("iframe").forEach(bindFrame);
    }));
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
  document.querySelectorAll("iframe").forEach(bindFrame);

  global.addEventListener("vdm-settings-change", (event) => applySettings(event.detail || {}));
  global.addEventListener("case-state-change", (event) => {
    const state = event.detail || {};
    applySettings(settingsFromState(state));
    applyWorldState(state);
  });

  const state = global.CASE_STATE && global.CASE_STATE.get ? global.CASE_STATE.get() : {};
  applySettings(settingsFromState(state));
  applyWorldState(state);
})(window);
