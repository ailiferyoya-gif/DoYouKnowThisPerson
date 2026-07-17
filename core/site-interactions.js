(function (global) {
  "use strict";

  const status = (root, text) => {
    let node = root.querySelector("[data-site-status]");
    if (!node) {
      node = document.createElement("p");
      node.dataset.siteStatus = "";
      node.className = "site-status";
      node.setAttribute("role", "status");
      (root.querySelector("main") || root).prepend(node);
    }
    node.textContent = text;
  };
  const matches = (text, query) => !query || (global.VDMText ? global.VDMText.includesAll(text, query) : String(text).toLowerCase().includes(String(query).toLowerCase()));
  const localBlobUrl = (blob) => URL.createObjectURL(blob);
  global.localBlobUrl = global.localBlobUrl || localBlobUrl;

  function bindMenu(root) {
    const button = root.querySelector("[data-site-menu]");
    const navigation = root.querySelector("[data-site-nav]");
    if (!button || !navigation) return;
    button.addEventListener("click", () => {
      const open = navigation.classList.toggle("is-open");
      button.setAttribute("aria-expanded", String(open));
    });
    navigation.addEventListener("click", (event) => {
      if (!event.target.closest("a")) return;
      navigation.classList.remove("is-open");
      button.setAttribute("aria-expanded", "false");
    });
  }

  function bindDirectory(root) {
    root.querySelectorAll("[data-site-directory]").forEach((directory) => {
      const form = directory.querySelector("[data-site-directory-search]");
      const input = form && form.querySelector("[name=q]");
      const results = directory.querySelector("[data-site-search-results]");
      const items = [...directory.querySelectorAll("[data-site-filter-item]")];
      const empty = directory.querySelector("[data-site-filter-empty]");
      if (!form || !input || !results) return;
      const filter = () => {
        const query = input.value.trim();
        let count = 0;
        items.forEach((item) => {
          item.hidden = !matches(item.dataset.filterText || item.textContent, query);
          if (!item.hidden) count += 1;
        });
        results.hidden = false;
        if (empty) empty.hidden = count !== 0;
        status(root, query ? "サイト内検索：" + count + "件" : "サイト内の全ページを表示しています");
      };
      form.addEventListener("submit", (event) => { event.preventDefault(); filter(); });
      input.addEventListener("input", () => { if (!results.hidden) filter(); });
      if (input.value) filter();
    });
  }

  function bindLocalFilter(root) {
    root.querySelectorAll("[data-site-local-filter]").forEach((form) => {
      const input = form.querySelector("[name=q]");
      if (!input) return;
      const candidates = root.matches(".cache-blog-site") ? [...root.querySelectorAll(".blog-post")] : [...root.querySelectorAll("[data-local-filter-list] [data-site-filter-item]")];
      const empty = root.querySelector("[data-local-filter-list] [data-site-filter-empty]");
      const filter = () => {
        const query = input.value.trim();
        let count = 0;
        candidates.forEach((item) => {
          item.hidden = !matches(item.dataset.filterText || item.textContent, query);
          if (!item.hidden) count += 1;
        });
        if (empty) empty.hidden = count !== 0;
        status(root, query ? "絞り込み結果：" + count + "件" : "すべて表示しています");
      };
      form.addEventListener("submit", (event) => { event.preventDefault(); filter(); });
      input.addEventListener("input", filter);
    });
  }

  function bindCatalog(root) {
    const records = [...root.querySelectorAll("[data-archive-record]")];
    const form = root.querySelector("[data-catalog-filter]");
    const count = root.querySelector("[data-catalog-count]");
    const empty = root.querySelector(".catalog-records [data-site-filter-empty]");
    if (form) {
      const filter = () => {
        const values = [...new FormData(form).values()].map(String).filter((value) => value && value !== "すべて");
        let visible = 0;
        records.forEach((record) => {
          record.hidden = values.some((value) => !matches(record.dataset.filterText || record.textContent, value));
          if (!record.hidden) visible += 1;
        });
        if (count) count.textContent = visible + "件";
        if (empty) empty.hidden = visible !== 0;
        status(root, visible + "件を表示しています");
      };
      form.addEventListener("submit", (event) => { event.preventDefault(); filter(); });
      form.addEventListener("change", filter);
      if (form.querySelector("[name=q]")?.value) filter();
    }
    records.forEach((record) => {
      record.tabIndex = 0;
      const select = () => {
        records.forEach((item) => item.removeAttribute("aria-selected"));
        record.setAttribute("aria-selected", "true");
        status(root, record.dataset.archiveRecord + "を選択しました");
      };
      record.addEventListener("click", (event) => { if (!event.target.closest("a,button")) select(); });
      record.addEventListener("keydown", (event) => { if (event.key === "Enter") { event.preventDefault(); select(); } });
      record.querySelector("[data-archive-export]")?.addEventListener("click", () => {
        const blob = new Blob([record.innerText], { type: "text/plain;charset=utf-8" });
        const anchor = document.createElement("a");
        anchor.href = localBlobUrl(blob);
        const url = anchor.href;
        anchor.download = (record.dataset.archiveRecord || "record") + ".txt";
        anchor.click();
        setTimeout(() => URL.revokeObjectURL(url), 3000);
        status(root, "目録テキストを書き出しました");
      });
    });
  }

  function bindBoard(root, context) {
    const form = root.querySelector(".board-compose");
    const thread = root.querySelector(".thread-list");
    const appState = context.appState || (context.appState = {});
    const localState = appState.siteLocal || (appState.siteLocal = {});
    const boardPath = root.dataset.boardPath || "/";
    const savedPosts = Array.isArray(localState.boardPosts) ? localState.boardPosts : (localState.boardPosts = []);
    const savedReports = Array.isArray(localState.boardReports) ? localState.boardReports : (localState.boardReports = []);
    const save = () => {
      if (typeof context.save === "function") context.save();
      if (global.VDMApp && typeof global.VDMApp.saveAppState === "function") global.VDMApp.saveAppState({ siteLocal: localState });
    };
    const reportKey = (number) => boardPath + ":" + String(number);
    const wireReport = (button) => {
      if (!button) return;
      const key = reportKey(button.dataset.report);
      if (savedReports.includes(key)) {
        button.textContent = "報告済み";
        button.disabled = true;
        return;
      }
      button.addEventListener("click", () => {
        button.textContent = "報告済み";
        button.disabled = true;
        if (!savedReports.includes(key)) savedReports.push(key);
        save();
        status(root, "この端末内で報告済みにしました");
      }, { once: true });
    };

    const appendLocalPost = (post) => {
      if (!thread) return null;
      const number = Number(post.number);
      if (!Number.isFinite(number) || thread.querySelector("#post-" + number)) return null;
      const item = document.createElement("li");
      item.id = "post-" + number;
      item.dataset.localPost = "true";
      item.dataset.siteFilterItem = "";
      item.dataset.filterText = String(post.name || "匿名") + " " + String(post.text || "");
      item.innerHTML = '<header><span class="post-number">#' + number + '</span><strong></strong><small></small></header><p></p><button type="button" data-report="' + number + '">報告</button>';
      item.querySelector("strong").textContent = post.name || "匿名";
      item.querySelector("small").textContent = "ID:local　" + (post.date || "端末内保存");
      item.querySelector("p").textContent = post.text || "";
      thread.appendChild(item);
      wireReport(item.querySelector("[data-report]"));
      return item;
    };

    root.querySelectorAll("[data-report]").forEach(wireReport);
    if (form && boardPath === "/write") {
      savedPosts.filter((post) => (post.path || "/write") === boardPath).forEach(appendLocalPost);
    }
    root.querySelector("[data-board-submit]")?.addEventListener("click", () => {
      if (!form || !thread) return;
      const name = form.querySelector("[name=name]").value.trim() || "匿名";
      const text = form.querySelector("[name=text]").value.trim();
      if (!text) { status(root, "本文を入力してください"); return; }
      const existingNumbers = [...thread.querySelectorAll(".post-number")].map((node) => Number(node.textContent.replace("#", ""))).filter(Number.isFinite);
      const number = Math.max(0, ...existingNumbers) + 1;
      const post = { number, name, text, date: new Date().toLocaleString("ja-JP"), path: boardPath };
      savedPosts.push(post);
      appendLocalPost(post);
      save();
      form.reset();
      status(root, "端末内に投稿しました");
    });
  }

  function monthKey(value) {
    const match = String(value || "").match(/(\d{4})\D*(\d{1,2})/);
    return match ? match[1] + "-" + String(Number(match[2])).padStart(2, "0") : "";
  }

  function sameBlogPeriod(date, value) {
    const expectedMonth = monthKey(value);
    if (expectedMonth) return monthKey(date) === expectedMonth;
    const year = String(value || "").match(/\d{4}/)?.[0];
    return Boolean(year && String(date || "").startsWith(year));
  }

  function bindBlog(root) {
    const posts = [...root.querySelectorAll(".blog-post")];
    root.querySelectorAll("[data-blog-filter]").forEach((button) => button.addEventListener("click", () => {
      const [kind, value] = button.dataset.blogFilter.split(":");
      let count = 0;
      posts.forEach((post) => {
        const hit = kind === "month" ? sameBlogPeriod(post.dataset.blogDate, value) : matches(post.dataset.blogTags || "", value);
        post.hidden = !hit;
        if (hit) count += 1;
      });
      status(root, (kind === "month" ? "年月" : "カテゴリ") + "「" + button.textContent.trim() + "」：" + count + "件");
    }));
  }

  function bind(root, context) {
    const siteRoot = root.matches(".case-site") ? root : root.querySelector(".case-site");
    bindMenu(root);
    bindDirectory(root);
    bindLocalFilter(root);
    if (siteRoot?.matches(".university-site")) bindCatalog(siteRoot);
    if (siteRoot?.matches(".bbs-site")) bindBoard(siteRoot, context || { appState: {}, save() {} });
    if (siteRoot?.matches(".cache-blog-site")) bindBlog(siteRoot);
  }

  global.VDMSiteInteractions = { bind };
})(window);
