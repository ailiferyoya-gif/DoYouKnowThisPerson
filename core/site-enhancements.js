(function (global) {
  "use strict";
  // Host-specific renderers now own hierarchy, media placement and related content.
  // Keep this marker for older Browser bundles that still load the enhancement module.
  if (global.VDM_SITE_RENDERERS) {
    Object.defineProperty(global.VDM_SITE_RENDERERS, "__caseSiteEnhancementsLoaded", { value: true });
  }
})(window);
