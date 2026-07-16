(function (global) {
  "use strict";
  const parent = global.parent !== global ? global.parent : global;
  const observe = (item, action) => {
    if (!item || !item.evidenceId || !(item.evidenceOn || []).includes(action)) return false;
    if (parent.CASE_STATE && parent.CASE_STATE.observeEvidence) {
      parent.CASE_STATE.observeEvidence(item.evidenceId, {
        medium: item.medium || global.VDMApp?.appId,
        action,
        appId: global.VDMApp?.appId || "",
        sourceId: item.sourceId || item.id || item.name || item.title || `${global.VDMApp?.appId || "app"}:${action}`,
        itemId: item.id || "",
        route: item.route || ""
      });
    }
    if (parent.VDM_BUS) parent.VDM_BUS.emit("evidence:observed", { evidenceId: item.evidenceId, action, appId: global.VDMApp?.appId });
    return true;
  };
  global.VDMEvidence = { observe };
})(window);
