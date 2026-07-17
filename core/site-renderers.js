(function (global) {
  "use strict";

  const e = (value) => {
    const node = document.createElement("span");
    node.textContent = String(value == null ? "" : value);
    return node.innerHTML;
  };
  const list = (value) => Array.isArray(value) ? value : [];
  const css = '<link rel="stylesheet" href="../../styles/sites/case-sites.css">';

  function route(item, fallbackLabel) {
    if (!item || !item.route) return "";
    return '<a href="#" data-route="' + e(item.route) + '">' + e(item.label || item.title || fallbackLabel || "開く") + "</a>";
  }

  function pathOf(context) {
    const value = String(context && context.route || "");
    const match = value.match(/^vdm:\/\/[^/]+(\/[^?#]*)?/i);
    return match && match[1] || "/";
  }

  function queryOf(context) {
    try { return String(context && context.query && context.query.get("q") || ""); }
    catch (_) { return ""; }
  }

  function firstPage(raw) {
    if (!raw) return {};
    if (raw.title) return raw;
    return list(raw.versions)[0] || raw;
  }

  function pageDirectory(site, host, context, label, forceOpen) {
    const query = queryOf(context);
    const pages = Object.entries(site.pages || {}).map(([pagePath, raw]) => ({ pagePath, page: firstPage(raw) }))
      .filter((entry) => Number(entry.page.status || 200) !== 404 && entry.page.title);
    const visible = Boolean(forceOpen || query);
    return '<section class="site-directory" data-site-directory>' +
      '<form data-site-directory-search><label><span>' + e(label || "サイト内検索") + '</span><input name="q" value="' + e(query) + '" autocomplete="off"><button type="submit">検索</button></label></form>' +
      '<div class="site-directory-results" data-site-search-results' + (visible ? "" : " hidden") + ' aria-live="polite">' +
      pages.map((entry) => '<a href="#" data-route="vdm://' + e(host + entry.pagePath) + '" data-site-filter-item data-filter-text="' + e(entry.page.title + " " + entry.pagePath) + '"><strong>' + e(entry.page.title) + '</strong><small>' + e(entry.pagePath) + "</small></a>").join("") +
      '<p class="site-directory-empty" data-site-filter-empty hidden>一致するページはありません。</p></div></section>';
  }

  function mobileMenu(label) {
    return '<button class="site-mobile-menu" type="button" data-site-menu aria-expanded="false">' + e(label || "メニュー") + "</button>";
  }

  function nav(items, className) {
    return '<nav class="site-nav ' + e(className || "") + '" data-site-nav aria-label="サイト内メニュー">' +
      list(items).map((item) => route(item, item.label)).join("") + "</nav>";
  }

  function hero(page, className) {
    const media = page && page.heroMedia;
    if (!media || !media.src) return "";
    const caption = media.caption || page.photoAlt || page.title || "掲載写真";
    return '<figure class="site-photo ' + e(className || "") + '"' + (media.id ? ' data-production-media="' + e(media.id) + '"' : "") + '><img src="' + e(media.src) + '" alt="' + e(media.alt || caption) + '" loading="lazy" decoding="async"><figcaption><span>' + e(caption) + "</span>" + (media.credit ? "<small>" + e(media.credit) + "</small>" : "") + "</figcaption></figure>";
  }

  function evidence(item, label) {
    if (!item || !item.evidenceId) return "";
    return '<button type="button" class="site-evidence" data-evidence-id="' + e(item.evidenceId) + '" data-evidence-medium="' + e(item.medium || "browser") + '" data-evidence-detail="' + e(item.detail || item.summary || item.description || item.text || "") + '">' + e(label || "資料の詳細を確認") + '</button><p class="evidence-detail" hidden></p>';
  }

  function itemText(item) {
    return String(item && (item.title || item.label || item.name || item.id || "") || "") + " " + String(item && (item.summary || item.description || item.text || item.value || "") || "");
  }

  function itemCards(items, className, actionLabel) {
    return list(items).map((item) => {
      if (typeof item !== "object") return '<article class="' + e(className) + '" data-site-filter-item data-filter-text="' + e(item) + '"><p>' + e(item) + "</p></article>";
      const title = item.title || item.label || item.name || item.id || "項目";
      const summary = item.summary || item.description || item.text || item.value || "";
      return '<article class="' + e(className) + '" data-site-filter-item data-filter-text="' + e(itemText(item)) + '">' +
        hero(item, "site-card-photo") +
        (item.kicker || item.date || item.status ? "<small>" + e(item.kicker || item.date || item.status) + "</small>" : "") +
        "<h3>" + e(title) + "</h3>" + (summary ? "<p>" + e(summary) + "</p>" : "") +
        route(item, actionLabel || "詳しく見る") + evidence(item) + "</article>";
    }).join("");
  }

  function detailList(items, className) {
    return '<dl class="' + e(className || "site-definition-list") + '">' + list(items).map((item) => '<div data-site-filter-item data-filter-text="' + e(itemText(item)) + '"><dt>' + e(item.label || item.title || item.name || "項目") + "</dt><dd>" + e(item.value || item.summary || item.description || item.text || "") + "</dd></div>").join("") + "</dl>";
  }

  function sections(page, className) {
    const values = list(page && page.sections);
    if (!values.length) return "";
    return '<section class="' + e(className || "site-extra-sections") + '">' + values.map((section) => '<article><h2>' + e(section.title || "関連情報") + "</h2>" + (section.text ? "<p>" + e(section.text) + "</p>" : "") +
      (list(section.items).length ? "<ul>" + list(section.items).map((item) => "<li>" + (typeof item === "object" ? "<strong>" + e(item.title || item.label || item.name || "項目") + "</strong> " + e(item.summary || item.description || item.text || "") + route(item) : e(item)) + "</li>").join("") + "</ul>" : "") +
      (section.table ? table(section.table) : "") + list(section.links).map((item) => route(item)).join("") + "</article>").join("") + "</section>";
  }

  function table(value, className) {
    if (!value) return "";
    const columns = list(value.columns || value.headers);
    const rows = list(value.rows);
    if (!columns.length && !rows.length) return "";
    return '<div class="site-table-wrap"><table class="' + e(className || "") + '">' +
      (columns.length ? "<thead><tr>" + columns.map((column) => "<th>" + e(column) + "</th>").join("") + "</tr></thead>" : "") +
      "<tbody>" + rows.map((row) => "<tr>" + list(row.cells || row).map((cell) => "<td>" + e(cell) + "</td>").join("") + "</tr>").join("") + "</tbody></table></div>";
  }

  function site404(host, site, page, navItems, modifier, footer) {
    return css + '<article class="case-site site-404 ' + e(modifier) + '" data-site-id="' + e(host) + '"><header><a href="#" data-route="vdm://' + e(host) + '/" class="site-wordmark">' + e(site.name) + "</a>" + mobileMenu() + nav(navItems, modifier + "-nav") + '</header><main><p class="error-code">404</p><h1>' + e(page.title || "ページが見つかりません") + "</h1><p>" + e(page.notice || "指定されたページは公開されていません。") + '</p><a href="#" data-route="vdm://' + e(host) + '/" class="site-primary-link">トップへ戻る</a></main>' + footer + "</article>";
  }

  const footers = {
    city: '<footer class="city-footer"><strong>霧川市役所</strong><p>〒霧川市中央一丁目　代表窓口 平日8:30〜17:15</p><p>サイト管理：市長公室 広報広聴課</p></footer>',
    tohama: '<footer class="tohama-footer"><strong>東浜情報ソリューションズ株式会社</strong><p>霧川市東浜二丁目 / 法人・自治体向け窓口 平日9:00〜17:00</p><p>© 2025 Tohama Information Solutions</p></footer>',
    news: '<footer class="news-footer"><strong>霧川ローカルニュース編集部</strong><p>記事への情報提供、写真利用、訂正の申出は編集部受付へ。</p><p>発行：霧川地域メディア合同会社</p></footer>',
    support: '<footer class="support-footer"><strong>きりかわ暮らし支援室</strong><p>相談受付 平日10:00〜17:00。相談の有無を第三者へ回答しません。</p><p>運営：一般社団法人きりかわ生活支援ネット</p></footer>',
    university: '<footer class="university-footer"><strong>北辰女子大学 公開資料室</strong><p>目録・公開画像について：地域連携課 資料担当</p><p>閲覧室 平日9:30〜16:30</p></footer>',
    hospital: '<footer class="hospital-footer"><strong>霧川市民医療センター</strong><p>代表受付 平日8:00〜17:00 / 診療に関する個別回答はWebでは行いません。</p><p>サイト管理：広報委員会</p></footer>',
    realty: '<footer class="realty-footer"><strong>クレセントホーム霧川</strong><p>営業時間9:30〜18:00 / 水曜休 / 霧川駅西口徒歩4分</p><p>宅地建物取引業務・賃貸管理窓口</p></footer>',
    bbs: '<footer class="bbs-footer"><strong>霧川まちBBS 管理室</strong><p>この掲示板の投稿と通報は端末内だけに保存されます。</p><p>個人情報を含む投稿は禁止です。</p></footer>',
    blog: '<footer class="blog-footer"><strong>cache-note</strong><p>水原聡の個人メモ。記事時刻は原則として後から変更しません。</p><p>リンク切れと公開範囲は月に一度確認しています。</p></footer>',
    studio: '<footer class="studio-footer"><strong>Studio Lumen Kirikawa</strong><p>完全予約制 10:00〜19:00 / 火曜・第2水曜休</p><p>撮影、納品、作例掲載は用途と同意範囲を先に確認します。</p></footer>'
  };

  function renderCity(site, page, context) {
    const host = "kirikawa-city", navItems = site.navigation;
    if (Number(page.status) === 404) return site404(host, site, page, navItems, "city", footers.city);
    const forceSearch = pathOf(context) === "/search";
    return css + '<article class="case-site city-site" data-site-id="kirikawa-city"><header class="city-header"><div class="city-brand"><span aria-hidden="true">霧</span><div><strong>霧川市</strong><small>暮らし・手続・市政情報</small></div></div>' + mobileMenu("メニュー") + pageDirectory(site, host, context, "サイト内検索", forceSearch) + "</header>" + nav(navItems, "city-nav") + '<main class="city-main"><aside class="city-side"><h2>よく使う手続</h2>' + list(navItems).slice(1, 5).map((item) => route(item)).join("") + '</aside><article class="city-document">' + hero(page, "city-photo") + '<p class="city-breadcrumb">' + e(page.breadcrumb || "ホーム") + "</p><h1>" + e(page.title) + '</h1><p class="city-meta">所管：' + e(page.department || "担当課") + "　公開：" + e(page.publishedAt || "") + "</p>" + (page.notice ? '<div class="city-notice">' + e(page.notice) + "</div>" : "") + (list(page.services).length ? '<section><h2>手続・関連ページ</h2><div class="city-link-grid">' + itemCards(page.services, "city-link", "案内を見る") + "</div></section>" : "") + (list(page.notices).length ? '<section><h2>お知らせ</h2><div class="city-news-list">' + itemCards(page.notices, "city-news-row", "詳細") + "</div></section>" : "") + (list(page.documents).length ? '<section><h2>資料・公表情報</h2><div class="city-document-list">' + itemCards(page.documents, "city-document-row", "資料を開く") + "</div></section>" : "") + sections(page, "city-sections") + (list(page.updates).length ? '<details class="city-history"><summary>更新履歴</summary>' + itemCards(page.updates, "city-history-row") + "</details>" : "") + "</article></main>" + footers.city + "</article>";
  }

  function renderTohama(site, page, context) {
    const host = "tohama-its", navItems = site.navigation;
    if (Number(page.status) === 404) return site404(host, site, page, navItems, "tohama", footers.tohama);
    return css + '<article class="case-site tohama-site" data-site-id="tohama-its"><header class="tohama-header"><a href="#" data-route="vdm://tohama-its/" class="tohama-logo"><span>T</span><strong>TOHAMA</strong></a>' + mobileMenu() + nav(navItems, "tohama-nav") + '</header><main><section class="tohama-hero"><div><p class="tohama-eyebrow">' + e(page.eyebrow || "TOHAMA INFORMATION SOLUTIONS") + "</p><h1>" + e(page.title) + "</h1><p>" + e(page.lead || "") + "</p></div>" + hero(page, "tohama-photo") + "</section>" + pageDirectory(site, host, context, "ページ・資料を検索") + (list(page.services).length ? '<section class="tohama-services"><header><small>SERVICE</small><h2>業務内容</h2></header><div>' + itemCards(page.services, "tohama-service", "内容を見る") + "</div></section>" : "") + (list(page.caseStudies).length ? '<section class="tohama-cases"><header><small>CASE / DOCUMENT</small><h2>事例・公開資料</h2></header><div>' + itemCards(page.caseStudies, "tohama-case", "詳細を確認") + "</div></section>" : "") + (list(page.news).length ? '<section class="tohama-news"><h2>お知らせ</h2>' + itemCards(page.news, "tohama-news-row") + "</section>" : "") + (list(page.profile).length ? '<section class="tohama-profile"><h2>会社情報</h2>' + detailList(page.profile) + "</section>" : "") + sections(page, "tohama-sections") + (list(page.faq).length ? '<section class="tohama-faq"><h2>よくある質問</h2>' + itemCards(page.faq, "tohama-faq-row") + "</section>" : "") + "</main>" + footers.tohama + "</article>";
  }

  function renderNews(site, page, context) {
    const host = "kirikawa-news", navItems = site.navigation;
    if (Number(page.status) === 404) return site404(host, site, page, navItems, "news", footers.news);
    const paragraphs = list(page.body).length ? page.body : (page.lead ? [page.lead] : []);
    return css + '<article class="case-site local-news-site" data-site-id="kirikawa-news"><header class="news-masthead"><div><time>' + e(site.edition || "LOCAL EDITION") + '</time><a href="#" data-route="vdm://kirikawa-news/">霧川ローカルニュース</a><p>霧川市内の出来事を、取材日時と訂正履歴とともに伝えます。</p></div>' + mobileMenu("紙面メニュー") + pageDirectory(site, host, context, "記事検索") + "</header>" + nav(navItems, "news-nav") + '<main class="news-main"><article class="news-story"><p class="news-category">' + e(page.category || "地域") + "</p><h1>" + e(page.title) + '</h1><p class="news-deck">' + e(page.lead || "") + '</p><p class="news-byline">' + e(page.author || "編集部") + "　" + e(page.publishedAt || "") + "</p>" + hero(page, "news-photo") + '<div class="news-body">' + paragraphs.map((paragraph) => "<p>" + e(paragraph) + "</p>").join("") + "</div>" + (list(page.articles).length ? '<section class="news-list"><h2>記事・関連項目</h2>' + itemCards(page.articles, "news-list-row", "記事を読む") + "</section>" : "") + sections(page, "news-sections") + '<aside class="news-correction"><strong>訂正・更新</strong><p>' + e(page.correction || "訂正情報はありません") + '</p></aside></article><aside class="news-sidebar">' + (list(page.related).length ? '<section><h2>関連記事</h2>' + itemCards(page.related, "news-side-row", "読む") + "</section>" : "") + (list(page.popular).length ? '<section><h2>よく読まれている記事</h2>' + itemCards(page.popular, "news-side-row", "読む") + "</section>" : "") + '<a href="#" data-route="vdm://kirikawa-news/about" class="news-policy-link">編集部と訂正方針</a></aside></main>' + footers.news + "</article>";
  }

  function renderSupport(site, page, context) {
    const host = "kirikawa-support", navItems = site.navigation;
    if (Number(page.status) === 404) return site404(host, site, page, navItems, "support", footers.support);
    return css + '<article class="case-site support-site" data-site-id="kirikawa-support"><header class="support-header"><a href="#" data-route="vdm://kirikawa-support/" class="support-logo"><span aria-hidden="true">くらし</span><strong>きりかわ暮らし支援室</strong></a>' + mobileMenu("案内") + nav(navItems, "support-nav") + '</header><div class="support-safety">相談の有無や内容を、本人の同意なく第三者へ伝えません。</div><main class="support-main">' + pageDirectory(site, host, context, "相談案内を検索") + '<p class="support-eyebrow">' + e(page.eyebrow || "相談と生活支援") + "</p><h1>" + e(page.title) + '</h1><p class="support-lead">' + e(page.lead || "") + "</p>" + hero(page, "support-photo") + (page.emergency ? '<aside class="support-emergency">' + e(page.emergency) + "</aside>" : "") + (list(page.flow).length ? '<section class="support-flow"><h2>相談の流れ</h2><ol>' + list(page.flow).map((item, index) => '<li><span>' + (index + 1) + "</span><div><h3>" + e(item.title || item) + "</h3><p>" + e(item.text || "") + "</p></div></li>").join("") + "</ol></section>" : "") + (list(page.audience).length ? '<section class="support-audience"><h2>対象別の案内</h2><div>' + itemCards(page.audience, "support-audience-card") + "</div></section>" : "") + (list(page.reports).length || list(page.training).length ? '<section class="support-reports"><h2>制度・活動報告</h2><div>' + itemCards([].concat(list(page.reports), list(page.training)), "support-report", "詳しく確認") + "</div></section>" : "") + (list(page.staff).length ? '<section class="support-staff"><h2>担当者</h2>' + itemCards(page.staff, "support-staff-card") + "</section>" : "") + (list(page.faq).length ? '<section class="support-faq"><h2>よくある質問</h2>' + list(page.faq).map((item) => '<details><summary>' + e(item.title) + "</summary><p>" + e(item.summary) + "</p>" + evidence(item) + "</details>").join("") + "</section>" : "") + sections(page, "support-sections") + (page.privacy ? '<aside class="support-privacy"><h2>相談記録について</h2><p>' + e(page.privacy) + "</p></aside>" : "") + "</main>" + footers.support + "</article>";
  }

  function renderUniversity(site, page, context) {
    const host = "hokushin-wu", navItems = site.navigation;
    if (Number(page.status) === 404) return site404(host, site, page, navItems, "university", footers.university);
    const query = queryOf(context);
    return css + '<article class="case-site university-site" data-site-id="hokushin-wu"><header class="university-header"><a href="#" data-route="vdm://hokushin-wu/"><span>北辰女子大学</span><strong>公開資料室</strong></a>' + mobileMenu("目録メニュー") + nav(navItems, "university-nav") + '</header><main class="university-main"><aside class="catalog-filter"><h2>目録検索</h2><form data-catalog-filter><label>キーワード<input name="q" value="' + e(query) + '"></label>' + list(page.filters).map((filter) => '<label>' + e(filter.label) + '<select name="' + e(filter.key) + '">' + list(filter.options).map((option) => "<option>" + e(option) + "</option>").join("") + "</select></label>").join("") + '<button type="submit">絞り込む</button></form><p>公開範囲：' + e(page.accessLevel || "一般公開") + '</p><a href="#" data-route="vdm://hokushin-wu/export">書出し案内</a></aside><article class="catalog-content">' + hero(page, "catalog-photo") + '<p class="catalog-breadcrumb">' + e(page.breadcrumb || "公開資料室") + "</p><h1>" + e(page.title) + "</h1><p data-catalog-count>" + list(page.records).length + '件</p><div class="catalog-records">' + list(page.records).map((record) => '<article class="catalog-record" data-archive-record="' + e(record.id) + '" data-site-filter-item data-filter-text="' + e(itemText(record) + " " + list(record.metadata).map((m) => m.value).join(" ")) + '"><header><small>' + e(record.id) + " / " + e(record.type) + "</small><h2>" + e(record.title) + "</h2></header>" + detailList(record.metadata, "catalog-metadata") + "<p>" + e(record.description || "") + "</p>" + route(record, "資料詳細") + '<button type="button" data-archive-export>目録を書き出す</button></article>').join("") + '<p class="catalog-empty" data-site-filter-empty hidden>条件に一致する資料はありません。</p></div>' + (list(page.versions).length ? '<section class="catalog-versions"><h2>版履歴</h2>' + itemCards(page.versions, "catalog-version") + "</section>" : "") + (list(page.related).length ? '<section class="catalog-related"><h2>関連資料</h2>' + itemCards(page.related, "catalog-related-row", "資料を開く") + "</section>" : "") + sections(page, "catalog-sections") + "</article></main>" + footers.university + "</article>";
  }

  function renderHospital(site, page, context) {
    const host = "kirikawa-med", navItems = site.navigation;
    if (Number(page.status) === 404) return site404(host, site, page, navItems, "hospital", footers.hospital);
    return css + '<article class="case-site hospital-site" data-site-id="kirikawa-med"><header class="hospital-header"><a href="#" data-route="vdm://kirikawa-med/" class="hospital-logo"><span aria-hidden="true">＋</span><div><strong>霧川市民医療センター</strong><small>Kirikawa Civic Medical Center</small></div></a>' + mobileMenu("診療メニュー") + pageDirectory(site, host, context, "院内案内を検索") + "</header>" + nav(navItems, "hospital-nav") + '<main class="hospital-main"><div class="hospital-alert">受付時間は診療科で異なります。予約票または休診案内を確認してください。</div><article class="hospital-content">' + hero(page, "hospital-photo") + '<p class="hospital-department">' + e(page.department || "担当窓口") + "</p><h1>" + e(page.title) + '</h1><p class="hospital-lead">' + e(page.notice || "") + "</p>" + (list(page.documents).length ? '<section class="hospital-guides"><h2>案内</h2><div>' + itemCards(page.documents, "hospital-guide", "確認する") + "</div></section>" : "") + (list(page.services).length ? '<section><h2>診療・手続</h2><div class="hospital-guides">' + itemCards(page.services, "hospital-guide", "確認する") + "</div></section>" : "") + sections(page, "hospital-sections") + (list(page.updates).length ? '<details class="hospital-history"><summary>更新履歴</summary>' + itemCards(page.updates, "hospital-history-row") + "</details>" : "") + "</article></main>" + footers.hospital + "</article>";
  }

  function renderRealty(site, page, context) {
    const host = "crescent-home", navItems = site.navigation;
    if (Number(page.status) === 404) return site404(host, site, page, navItems, "realty", footers.realty);
    const isListing = pathOf(context).startsWith("/listings");
    return css + '<article class="case-site realty-site" data-site-id="crescent-home"><header class="realty-header"><a href="#" data-route="vdm://crescent-home/" class="realty-logo"><span>CH</span><strong>クレセントホーム霧川</strong></a>' + mobileMenu("物件メニュー") + nav(navItems, "realty-nav") + "</header><main>" + (isListing ? '<section class="property-filter"><form data-site-local-filter><label>物件内検索<input name="q" placeholder="物件名・間取り・設備"></label><button type="submit">絞り込む</button></form></section>' : pageDirectory(site, host, context, "サイト内検索")) + '<section class="realty-hero"><div><p>賃貸物件・管理窓口</p><h1>' + e(page.title) + "</h1><p>" + e(page.lead || "") + "</p></div>" + hero(page, "realty-photo") + "</section>" + (list(page.services).length ? '<section class="property-list"><h2>' + (isListing ? "物件・条件" : "ご案内") + '</h2><div data-local-filter-list>' + itemCards(page.services, "property-card", "詳細を見る") + '<p data-site-filter-empty hidden>条件に一致する項目はありません。</p></div></section>' : "") + (list(page.caseStudies).length ? '<section class="property-details"><h2>写真・補足</h2><div>' + itemCards(page.caseStudies, "property-detail", "確認する") + "</div></section>" : "") + (list(page.news).length ? '<section class="realty-notices"><h2>管理会社からのお知らせ</h2>' + itemCards(page.news, "realty-notice") + "</section>" : "") + sections(page, "realty-sections") + (list(page.faq).length ? '<section class="realty-faq"><h2>よくある質問</h2>' + itemCards(page.faq, "realty-faq-row") + "</section>" : "") + "</main>" + footers.realty + "</article>";
  }

  function boardPosts(site) {
    const rows = [];
    Object.entries(site.pages || {}).forEach(([pagePath, raw]) => {
      const page = firstPage(raw);
      list(page.threads || page.posts).forEach((post) => rows.push(Object.assign({}, post, { route: "vdm://kirikawa-bbs" + pagePath + "#post-" + (post.number || 1), sourcePath: pagePath })));
    });
    return rows;
  }

  function threadDetailRoute(number) {
    const routes = { "188": "vdm://kirikawa-bbs/thread/188", "64": "vdm://kirikawa-bbs/thread/64", "411": "vdm://kirikawa-bbs/thread/411" };
    return routes[String(number)] || "";
  }

  function renderBbs(site, page, context) {
    const host = "kirikawa-bbs", navItems = site.boards;
    if (Number(page.status) === 404) return site404(host, site, page, navItems, "bbs", footers.bbs);
    const currentPath = pathOf(context), searching = currentPath === "/search", q = queryOf(context);
    const posts = searching ? boardPosts(site).filter((item) => !q || itemText(item).normalize("NFKC").toLowerCase().includes(q.normalize("NFKC").toLowerCase())) : list(page.threads || page.posts);
    return css + '<article class="case-site bbs-site" data-site-id="kirikawa-bbs" data-board-path="' + e(currentPath) + '"><header class="bbs-header"><a href="#" data-route="vdm://kirikawa-bbs/">霧川まちBBS</a>' + mobileMenu("板メニュー") + '<form data-route-form="vdm://kirikawa-bbs/search"><input name="q" value="' + e(q) + '" placeholder="投稿を検索"><button>検索</button></form></header>' + nav(navItems, "bbs-nav") + '<main><p class="bbs-path">霧川まちBBS ' + e(currentPath) + "</p><h1>" + e(page.title) + "</h1><p>" + e(page.description || "") + "</p>" + hero(page, "bbs-photo") + '<ol class="thread-list bbs-thread-list">' + posts.map((post, index) => {
      const number = post.number || index + 1, detailRoute = threadDetailRoute(number) || post.route || "";
      return '<li id="post-' + e(number) + '" data-site-filter-item data-filter-text="' + e(itemText(post)) + '"><header><span class="post-number">#' + e(number) + "</span><strong>" + e(post.title || post.userId || "匿名") + "</strong><small>ID:" + e(post.userId || "local") + "　" + e(post.date || "") + "</small></header><p>" + e(post.text || post.summary || "") + "</p>" + list(post.quotes).map((quote) => '<a href="#post-' + e(quote) + '">&gt;&gt;' + e(quote) + "</a>").join(" ") + (detailRoute ? '<a href="#" class="bbs-thread-link" data-route="' + e(detailRoute) + '">スレッドを開く</a>' : "") + '<button type="button" data-report="' + e(number) + '">報告</button></li>';
    }).join("") + "</ol>" + (!posts.length ? '<p class="bbs-no-result">該当する投稿はありません。</p>' : "") + (currentPath === "/write" ? '<form class="board-compose"><label>名前<input name="name" placeholder="匿名"></label><label>本文<textarea name="text"></textarea></label><button type="button" data-board-submit>端末内に投稿</button></form>' : "") + '<nav class="bbs-pagination" aria-label="ページ"><a href="#" data-route="vdm://kirikawa-bbs/">1</a><a href="#" data-route="vdm://kirikawa-bbs/page/2">2</a></nav>' + (page.rules ? '<details><summary>利用規則</summary><p>' + e(page.rules) + "</p></details>" : "") + sections(page, "bbs-sections") + "</main>" + footers.bbs + "</article>";
  }

  function blogPostRoute(post) {
    const title = String(post && post.title || "");
    if (title === "復旧後に最初に見るもの") return "vdm://cache-note/2025/05/recovery-first";
    if (title === "参照表を戻さない復旧") return "vdm://cache-note/2024/11/reference-table";
    return "";
  }

  function renderBlog(site, page, context) {
    const host = "cache-note", navItems = site.navigation;
    if (Number(page.status) === 404) return site404(host, site, page, navItems, "blog", footers.blog);
    return css + '<article class="case-site cache-blog-site" data-site-id="cache-note"><header class="blog-header"><p>' + e(site.subtitle || "PUBLIC SYSTEM NOTES") + '</p><a href="#" data-route="vdm://cache-note/">cache-note</a><small>水原聡 / 障害復旧と記録保全</small>' + mobileMenu("記事メニュー") + nav(navItems, "blog-nav") + '</header><main class="blog-main"><section class="blog-column">' + hero(page, "blog-hero") + "<h1>" + e(page.title) + "</h1>" + list(page.posts).map((post) => '<article class="blog-post" data-blog-date="' + e(post.date || "") + '" data-blog-tags="' + e(list(post.tags).join(" ")) + '" data-site-filter-item data-filter-text="' + e(itemText(post) + " " + list(post.tags).join(" ")) + '"><time>' + e(post.date || "") + "</time><h2>" + (blogPostRoute(post) ? '<a href="#" data-route="' + e(blogPostRoute(post)) + '">' + e(post.title) + "</a>" : e(post.title)) + "</h2><p>" + e(post.body || post.summary || "") + '</p><div class="blog-tags">' + list(post.tags).map((tag) => '<button type="button" data-blog-filter="category:' + e(tag) + '">#' + e(tag) + "</button>").join("") + "</div>" + (list(post.comments).length ? '<section class="blog-comments"><h3>コメント</h3>' + itemCards(post.comments, "blog-comment") + "</section>" : "") + "</article>").join("") + '</section><aside class="blog-sidebar"><section><h2>プロフィール</h2><p>' + e(page.profile || "") + '</p></section><section><h2>サイト内検索</h2><form data-site-local-filter><input name="q" placeholder="記事名・本文・タグ"><button>検索</button></form></section><section><h2>年月</h2>' + list(page.archive).map((label) => {
      const normalized = String(label).replace(/年/g, "-").replace(/月.*$/, "").replace(/-$/, "");
      return '<button type="button" data-blog-filter="month:' + e(normalized) + '">' + e(label) + "</button>";
    }).join("") + '</section><section><h2>カテゴリ</h2>' + list(page.categories).map((label) => '<button type="button" data-blog-filter="category:' + e(label) + '">' + e(label) + "</button>").join("") + "</section>" + pageDirectory(site, host, context, "ページ一覧") + "</aside></main>" + footers.blog + "</article>";
  }

  function renderStudio(site, page, context) {
    const host = "studio-lumen", navItems = site.navigation;
    if (Number(page.status) === 404) return site404(host, site, page, navItems, "studio", footers.studio);
    const currentPath = pathOf(context);
    return css + '<article class="case-site studio-site" data-site-id="studio-lumen"><header class="studio-header"><a href="#" data-route="vdm://studio-lumen/" class="studio-logo"><span>LUMEN</span><strong>Studio Lumen</strong></a>' + mobileMenu("撮影メニュー") + nav(navItems, "studio-nav") + '</header><main><section class="studio-intro"><div><p>STUDIO LUMEN / KIRIKAWA</p><h1>' + e(page.title) + "</h1><p>" + e(page.lead || "") + "</p></div>" + hero(page, "studio-photo") + "</section>" + pageDirectory(site, host, context, "撮影メニュー・規約を検索") + (list(page.services).length ? '<section class="studio-services"><h2>' + (currentPath === "/pricing" ? "料金表" : currentPath === "/portfolio" ? "作例カテゴリ" : "撮影・納品内容") + '</h2><div>' + itemCards(page.services, currentPath === "/portfolio" ? "studio-work" : "studio-service", "詳細") + "</div></section>" : "") + (list(page.caseStudies).length ? '<section class="studio-portfolio"><h2>掲載作例・制作記録</h2><div>' + itemCards(page.caseStudies, "studio-work") + "</div></section>" : "") + (list(page.news).length ? '<section class="studio-news"><h2>スタジオからのお知らせ</h2>' + itemCards(page.news, "studio-news-row") + "</section>" : "") + (list(page.profile).length ? '<section class="studio-profile"><h2>店舗案内</h2>' + detailList(page.profile) + "</section>" : "") + (list(page.faq).length ? '<section class="studio-faq"><h2>よくある質問</h2>' + itemCards(page.faq, "studio-faq-row") + "</section>" : "") + sections(page, "studio-sections") + "</main>" + footers.studio + "</article>";
  }

  const renderers = {
    "kirikawa-city": renderCity,
    "tohama-its": renderTohama,
    "kirikawa-news": renderNews,
    "kirikawa-support": renderSupport,
    "hokushin-wu": renderUniversity,
    "kirikawa-med": renderHospital,
    "crescent-home": renderRealty,
    "kirikawa-bbs": renderBbs,
    "cache-note": renderBlog,
    "studio-lumen": renderStudio,
    agency: (site, page, context) => site && site.name === "霧川市民医療センター" ? renderHospital(site, page, context) : renderCity(site, page, context),
    corporate: (site, page, context) => site && site.name === "クレセントホーム霧川" ? renderRealty(site, page, context) : site && site.name === "Studio Lumen" ? renderStudio(site, page, context) : renderTohama(site, page, context),
    news: renderNews,
    support: renderSupport,
    archive: renderUniversity,
    board: renderBbs,
    blog: renderBlog
  };

  global.VDM_SITE_RENDERERS = renderers;
})(window);
