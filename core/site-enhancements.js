(function (global) {
  "use strict";

  const renderers = global.VDM_SITE_RENDERERS;
  if (!renderers || renderers.__caseSiteEnhancementsLoaded) return;

  const escapeHtml = (value) => {
    const node = document.createElement("span");
    node.textContent = String(value == null ? "" : value);
    return node.innerHTML;
  };
  const list = (value) => Array.isArray(value) ? value : [];

  const enhancementStyles = [
    "<style>",
    ".site-enhancement-hero{margin:0 0:clamp(1.25rem,3vw,2.25rem);overflow:hidden;border:1px solid color-mix(in srgb,currentColor 14%,transparent);border-radius:clamp(14px,2vw,24px);background:rgba(255,255,255,.72);box-shadow:0 18px 44px rgba(18,24,36,.12)}",
    ".site-enhancement-hero img{display:block;width:100%;max-height:min(58vh,620px);aspect-ratio:16/9;object-fit:cover;background:#dfe4e8}",
    ".site-enhancement-hero figcaption{display:flex;flex-wrap:wrap;gap:.35rem .8rem;align-items:baseline;padding:.85rem 1rem;color:#4f5965;font-size:.82rem;line-height:1.6}",
    ".site-enhancement-hero figcaption strong{color:#18212b;font-size:.9rem}",
    ".site-enhancement-hero figcaption small{margin-left:auto;color:#6f7882}",
    ".site-enhancement-sections{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,250px),1fr));gap:1rem;margin:clamp(1.5rem,4vw,3rem) 0}",
    ".site-enhancement-section{min-width:0;padding:clamp(1rem,2.5vw,1.4rem);border:1px solid rgba(38,49,61,.14);border-radius:16px;background:rgba(255,255,255,.68);box-shadow:0 10px 28px rgba(25,34,45,.07)}",
    ".site-enhancement-section h2{margin:0 0 .55rem;font-size:clamp(1.05rem,2vw,1.3rem);line-height:1.35}",
    ".site-enhancement-section p{margin:.35rem 0 .8rem;line-height:1.75}",
    ".site-enhancement-section ul{display:grid;gap:.48rem;margin:.65rem 0 0;padding-left:1.25rem}",
    ".site-enhancement-section li{line-height:1.6}",
    ".site-enhancement-section a{font-weight:700;text-underline-offset:.2em}",
    ".site-enhancement-table-wrap{overflow-x:auto;margin-top:.8rem}",
    ".site-enhancement-section table{width:100%;border-collapse:collapse;font-size:.88rem}",
    ".site-enhancement-section th,.site-enhancement-section td{padding:.65rem .72rem;border-bottom:1px solid rgba(38,49,61,.14);text-align:left;vertical-align:top}",
    ".site-enhancement-actions{display:flex;flex-wrap:wrap;gap:.7rem;margin:1.25rem 0}",
    ".site-enhancement-actions a{display:inline-flex;align-items:center;min-height:42px;padding:.65rem .95rem;border:1px solid currentColor;border-radius:999px;font-weight:700;text-decoration:none}",
    "@media(max-width:640px){.site-enhancement-hero figcaption{display:block}.site-enhancement-hero figcaption small{display:block;margin-top:.3rem}.site-enhancement-sections{grid-template-columns:1fr}}",
    "</style>"
  ].join("");

  function routeLink(item) {
    if (!item || typeof item !== "object" || !item.route) return "";
    return '<a href="#" data-route="' + escapeHtml(item.route) + '">' +
      escapeHtml(item.label || item.title || "詳しく見る") + "</a>";
  }

  function renderItem(item) {
    if (item == null) return "";
    if (typeof item !== "object") return "<li>" + escapeHtml(item) + "</li>";
    const label = item.title || item.label || item.name || item.value || item.text || "項目";
    const detail = item.summary || item.description || item.text || "";
    return "<li><strong>" + escapeHtml(label) + "</strong>" +
      (detail && detail !== label ? "<span> — " + escapeHtml(detail) + "</span>" : "") +
      (item.route ? " " + routeLink(item) : "") + "</li>";
  }

  function renderTable(table) {
    if (!table || typeof table !== "object") return "";
    const columns = list(table.columns || table.headers);
    const rows = list(table.rows);
    if (!columns.length && !rows.length) return "";
    return '<div class="site-enhancement-table-wrap"><table>' +
      (columns.length ? "<thead><tr>" + columns.map((column) => "<th>" + escapeHtml(column) + "</th>").join("") + "</tr></thead>" : "") +
      "<tbody>" + rows.map((row) => "<tr>" + list(row.cells || row).map((cell) => "<td>" + escapeHtml(cell) + "</td>").join("") + "</tr>").join("") +
      "</tbody></table></div>";
  }

  function renderSection(section) {
    if (!section || typeof section !== "object") return "";
    const items = list(section.items);
    const links = list(section.links).map(routeLink).filter(Boolean);
    return '<article class="site-enhancement-section">' +
      (section.kicker ? "<small>" + escapeHtml(section.kicker) + "</small>" : "") +
      (section.title ? "<h2>" + escapeHtml(section.title) + "</h2>" : "") +
      (section.text ? "<p>" + escapeHtml(section.text) + "</p>" : "") +
      (items.length ? "<ul>" + items.map(renderItem).join("") + "</ul>" : "") +
      renderTable(section.table) +
      (links.length ? '<div class="site-enhancement-actions">' + links.join("") + "</div>" : "") +
      "</article>";
  }

  function renderHero(page) {
    const media = page && page.heroMedia;
    if (!media || !media.src) return "";
    const caption = media.caption || page.photoAlt || page.title || "掲載写真";
    return '<figure class="site-enhancement-hero"' +
      (media.id ? ' data-production-media="' + escapeHtml(media.id) + '"' : "") + ">" +
      '<img src="' + escapeHtml(media.src) + '" alt="' + escapeHtml(media.alt || caption) + '" loading="lazy" decoding="async">' +
      "<figcaption><strong>" + escapeHtml(caption) + "</strong>" +
      (media.credit ? "<small>写真：" + escapeHtml(media.credit) + "</small>" : "") +
      "</figcaption></figure>";
  }

  function renderActions(page) {
    const actions = list(page && page.pageActions).map(routeLink).filter(Boolean);
    return actions.length ? '<nav class="site-enhancement-actions" aria-label="関連ページ">' + actions.join("") + "</nav>" : "";
  }

  function siteId(site, context) {
    const route = context && context.route;
    if (route) {
      try { return new URL(route).host; } catch (_) { /* vdm URLs are handled below */ }
      const match = String(route).match(/^vdm:\/\/([^/]+)/i);
      if (match) return match[1];
    }
    const sites = global.VDM_CONTENT_DATA && global.VDM_CONTENT_DATA.sites;
    if (!sites) return "unknown";
    const found = Object.keys(sites).find((key) => sites[key] && sites[key].name === site.name);
    return found || "unknown";
  }

  function removeEmptyRouteForms(html) {
    return html.replace(/<form\b(?=[^>]*\bdata-route-form=(?:""|''))[^>]*>[\s\S]*?<\/form>/gi, "");
  }

  function addBeforeClosingMain(html, markup) {
    if (!markup) return html;
    const closingIndex = html.toLowerCase().lastIndexOf("</main>");
    if (closingIndex < 0) return html + markup;
    return html.slice(0, closingIndex) + markup + html.slice(closingIndex);
  }

  Object.keys(renderers).forEach((name) => {
    if (typeof renderers[name] !== "function") return;
    const baseRenderer = renderers[name];
    renderers[name] = function (site, page, context) {
      const safePage = page || {};
      let html = String(baseRenderer.apply(this, arguments));
      html = removeEmptyRouteForms(html);

      const hero = renderHero(safePage);
      if (hero) {
        if (name === "news") html = html.replace(/<div class="news-photo"[^>]*><\/div>/i, "");
        html = html.replace(/<main\b[^>]*>/i, (opening) => opening + hero);
      }

      const sections = list(safePage.sections).map(renderSection).filter(Boolean);
      const additions = (sections.length ? '<section class="site-enhancement-sections" aria-label="追加情報">' + sections.join("") + "</section>" : "") + renderActions(safePage);
      html = addBeforeClosingMain(html, additions);

      return enhancementStyles + html.replace(/<article\b/, '<article data-site-id="' + escapeHtml(siteId(site || {}, context || {})) + '"');
    };
  });

  Object.defineProperty(renderers, "__caseSiteEnhancementsLoaded", { value: true });
})(window);
