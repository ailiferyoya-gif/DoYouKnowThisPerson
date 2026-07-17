(function (global) {
  "use strict";

  const data = global.VDM_CONTENT_DATA;
  if (!data || data.__caseExpansionLoaded) return;
  Object.defineProperty(data, "__caseExpansionLoaded", { value: true });

  const sites = data.sites || {};
  const photoItems = (data.media && data.media.photos) || [];
  const photo = (id, alt, caption, credit) => {
    const found = photoItems.find((item) => item.id === id);
    return {
      id,
      src: (found && found.src) || "../../assets/images/" + id + ".png",
      alt,
      caption,
      credit: credit || "作品内資料 / 生成画像"
    };
  };
  const route = (host, path, label) => ({ label, route: "vdm://" + host + path });
  const nav = (host, items) => items.map(([label, path]) => route(host, path, label));
  const card = (title, summary, routeValue, extra) => Object.assign({ title, summary }, routeValue ? { route: routeValue } : {}, extra || {});
  const section = (title, text, items, extra) => Object.assign({ title, text, items: items || [] }, extra || {});

  function agencyPage(title, department, notice, documents, extra) {
    return Object.assign({
      title,
      breadcrumb: "ホーム > " + title,
      department,
      publishedAt: "2025年6月20日",
      notice,
      services: [],
      notices: [],
      documents: documents || [],
      updates: [{ date: "2025.06.20", title: "掲載内容を確認", summary: "リンクと問い合わせ先を現行情報へ更新しました。" }],
      contact: department + "（作品内窓口）",
      sections: []
    }, extra || {});
  }

  function corporatePage(title, eyebrow, lead, services, extra) {
    return Object.assign({
      title,
      eyebrow,
      lead,
      services: services || [],
      news: [],
      caseStudies: [],
      profile: [],
      faq: [],
      sections: []
    }, extra || {});
  }

  function newsPage(title, category, lead, heroMedia, articles, extra) {
    return Object.assign({
      title,
      category,
      lead,
      author: "霧川ローカルニュース編集部",
      publishedAt: "2025年6月20日 18:10",
      photoAlt: heroMedia && heroMedia.alt,
      heroMedia,
      articles: articles || [],
      related: [],
      popular: [],
      correction: "訂正情報はありません",
      sections: []
    }, extra || {});
  }

  function supportPage(title, lead, heroMedia, extra) {
    return Object.assign({
      title,
      eyebrow: "きりかわ暮らし支援室",
      lead,
      heroMedia,
      emergency: "差し迫った危険がある場合は、このサイトより先に地域の公的な緊急窓口を利用してください。",
      flow: [],
      audience: [],
      faq: [],
      reports: [],
      training: [],
      staff: [],
      privacy: "相談記録の目的、共有先、保存期間を説明し、本人が選べる範囲を確認します。",
      sections: []
    }, extra || {});
  }

  function archivePage(title, records, heroMedia, extra) {
    return Object.assign({
      title,
      breadcrumb: "公開資料室 > " + title,
      searchRoute: "vdm://hokushin-wu/search",
      filters: [{ label: "資料種別", key: "type", options: ["すべて", "写真", "広報", "講座", "同窓会"] }],
      accessLevel: "一般公開",
      records: records || [],
      versions: [],
      related: [],
      heroMedia,
      sections: []
    }, extra || {});
  }

  function boardPage(title, description, posts, heroMedia, extra) {
    return Object.assign({
      title,
      description,
      posts: posts || [],
      pages: [1, 2, 3],
      searchRoute: "vdm://kirikawa-bbs/search",
      rules: "実名、住所、連絡先の投稿は禁止です。作品内の書込みはこの端末にだけ保存されます。",
      heroMedia,
      sections: []
    }, extra || {});
  }

  function blogPage(title, profile, posts, heroMedia, extra) {
    return Object.assign({
      title,
      profile,
      archive: ["2025年5月", "2025年3月", "2024年11月"],
      categories: ["運用", "復旧", "公開記録"],
      posts: posts || [],
      heroMedia,
      sections: []
    }, extra || {});
  }

  function mergePages(host, pages) {
    if (!sites[host]) return;
    sites[host].pages = Object.assign({}, sites[host].pages || {}, pages);
  }

  // 霧川市: 行政文書の入口を増やし、検索・所管・実証事業・統計を分離する。
  if (sites["kirikawa-city"]) {
    sites["kirikawa-city"].navigation = nav("kirikawa-city", [
      ["ホーム", "/"], ["手続", "/services"], ["市政資料", "/records"], ["資料室", "/digital-archive"],
      ["実証事業", "/demonstration"], ["例規・統計", "/statistics"], ["個人情報", "/privacy"], ["サイト内検索", "/search"]
    ]);
    mergePages("kirikawa-city", {
      "/": agencyPage("霧川市ホーム", "市長公室 広報広聴課", "窓口の混雑状況、催し、災害情報をまとめています。", [
        card("広報きりかわ 6月号", "防災訓練、図書館休館日、市民講座の日程。", "vdm://kirikawa-city/records"),
        card("朝霧川遊歩道の利用案内", "東岸の補修工事は6月18日に完了しました。", "vdm://kirikawa-city/services")
      ], {
        heroMedia: photo("P18", "朝霧川の河川清掃で、ごみ袋を持つ市民と職員。", "5月18日に行われた河川清掃。", "霧川市 公園河川課"),
        notices: [
          { date: "2025.06.20", title: "駅西夜市に伴う交通規制", summary: "27日16時から21時まで駅西通りの一部を車両通行止めにします。" },
          { date: "2025.06.18", title: "市民プールの予約受付", summary: "7月利用分は22日午前9時から受け付けます。" }
        ],
        sections: [section("今日の窓口", "転入・証明書窓口は午前中が混み合います。", ["待ち時間は目安です", "本人確認書類をご用意ください"])]
      }),
      "/search": agencyPage("サイト内検索", "総務部 デジタル推進課", "公開中のページ、例規、統計、PDF目録を検索します。", [], {
        sections: [
          section("よく検索される項目", "手続名や担当課から探せます。", ["転入・転出", "粗大ごみ", "施設予約", "広報写真利用"]),
          section("検索範囲", "公開終了したページは、公開可能な更新履歴だけを表示します。", ["現行ページ", "広報PDF", "議会会議録"])
        ]
      }),
      "/departments": agencyPage("組織・所管一覧", "総務部 人事課", "各課の担当業務と代表内線を掲載します。", [
        { title: "広報広聴課", summary: "広報紙、Web、報道対応、市民の声。" },
        { title: "デジタル推進課", summary: "庁内システム、公開データ、情報セキュリティ。" },
        { title: "福祉連携課", summary: "生活相談、支援機関との連絡調整。" }
      ], { publishedAt: "2025年4月1日" }),
      "/demonstration": agencyPage("実証事業一覧", "企画政策部 政策調整課", "市が参加している実証事業の目的、期間、委託先、評価方法を公開します。", [
        { title: "生活情報保護連携実証事業", summary: "本人同意に基づく公開情報整理と連絡先切替。", route: "vdm://kirikawa-city/life-protection" },
        { title: "窓口混雑可視化", summary: "市民課2窓口で待ち時間表示を試行。" },
        { title: "河川水位通知", summary: "朝霧川3地点の観測値を防災メールへ連携。" }
      ], { publishedAt: "2025年5月30日" }),
      "/statistics": agencyPage("例規・統計", "総務部 総務課", "人口、予算、施設利用などの基礎統計を年度別に公開します。", [
        { title: "人口統計 2025年5月末", summary: "146,208人、70,814世帯。" },
        { title: "公共施設利用 2024年度", summary: "文化会館、図書館、体育施設の月別利用。" },
        { title: "情報公開請求の処理状況", summary: "受付128件、全部公開74件、一部公開46件。" }
      ], { publishedAt: "2025年6月6日" })
    });
  }

  // 東浜情報ソリューションズ: 公共IT企業として製品、運用、採用の声を分ける。
  if (sites["tohama-its"]) {
    sites["tohama-its"].navigation = nav("tohama-its", [
      ["会社情報", "/company"], ["サービス", "/services"], ["公共分野", "/public"], ["導入事例", "/cases"],
      ["ニュース", "/news"], ["品質・セキュリティ", "/quality"], ["採用", "/careers"]
    ]);
    mergePages("tohama-its", {
      "/": corporatePage("公共システムの切替・運用支援", "TOHAMA INFORMATION SOLUTIONS", "自治体と地域機関のシステム更新について、現行調査から切替後の受付までを受託しています。", [
        card("移行設計", "現行調査、切替日、差戻し条件を一冊の手順へまとめます。"),
        card("運用支援", "担当者交代後も迷わない更新記録と研修を提供します。"),
        card("公開情報管理", "索引、PDF、更新履歴の整合を日次で確認します。")
      ], {
        heroMedia: photo("P13", "小規模な説明会で、担当者が公共情報システムの画面を示している。", "地域連携説明会の様子。", "東浜情報ソリューションズ"),
        news: [
          { date: "2025.06.02", title: "夏季インターンの受付を開始", summary: "運用設計とヘルプデスクの2コースです。" },
          { date: "2025.05.21", title: "保守窓口の訓練に伴う案内", summary: "22日18時以降は折返しに時間を要する場合があります。" }
        ],
        profile: [{ label: "設立", value: "2008年4月" }, { label: "本社", value: "霧川市東浜二丁目" }, { label: "従業員", value: "184名" }]
      }),
      "/news/2025-04": corporatePage("年度切替の運用結果", "OPERATIONS NOTE / 2025.04", "4月1日の切替作業は予定時刻内に完了しました。公開サイト2件は確認継続中です。", [
        { title: "切替件数", summary: "本番9件、訓練3件。" },
        { title: "差戻し", summary: "実施なし。表示差分2件を翌営業日に修正。" }
      ], { heroMedia: photo("P23", "モニターと紙のチェックリストが並ぶ運用担当者の机。", "切替翌朝の確認作業。", "東浜情報ソリューションズ 運用部") }),
      "/security/report": corporatePage("情報セキュリティ報告", "TRUST CENTER", "アクセス権、変更管理、委託先点検の実施状況を四半期ごとに公開します。", [
        { title: "アクセス権棚卸し", summary: "対象214件、是正4件、完了4件。" },
        { title: "変更記録レビュー", summary: "緊急変更を含む86件を確認。" },
        { title: "訓練", summary: "標的型メール訓練の報告率は91.2%。" }
      ], { publishedAt: "2025.06.12" }),
      "/contact": corporatePage("お問い合わせ", "CONTACT", "契約中の障害連絡は、契約番号を添えて専用窓口へお知らせください。", [
        { title: "導入相談", summary: "平日9:00〜17:00。通常2営業日以内に返信します。" },
        { title: "採用", summary: "募集要項に記載された担当へご連絡ください。" }
      ], { faq: [{ title: "個人の情報を照会できますか", summary: "契約主体を通さない個別照会には回答しません。" }] }),
      "/404": { title: "ページが見つかりません", status: 404, notice: "URLが変更されたか、公開期間が終了しています。" }
    });
  }

  // 地域ニュース: 記事、記者、写真、訂正を独立したページとして持たせる。
  if (sites["kirikawa-news"]) {
    sites["kirikawa-news"].navigation = nav("kirikawa-news", [
      ["トップ", "/"], ["行政", "/government"], ["地域", "/local"], ["暮らし", "/life"],
      ["催し", "/events"], ["天気・交通", "/weather"], ["訂正", "/corrections"]
    ]);
    mergePages("kirikawa-news", {
      "/": newsPage("駅前広場、夏の改修へ", "まち", "屋根の補修とベンチ更新を7月8日から行う。通路は確保される。", photo("P20", "夕方の霧川駅北口。バス停と歩行者が見える。", "改修対象となる駅北口側の広場。", "撮影・河合美緒"), [
        card("河川清掃に126人", "朝霧川の両岸で市民清掃が行われた。", "vdm://kirikawa-news/articles/river-cleanup"),
        card("駅西夜市は27日", "38店舗が参加。雨天時はアーケード内のみ。", "vdm://kirikawa-news/events")
      ], {
        author: "永瀬拓",
        related: [{ title: "北口バス乗り場の変更", summary: "工事中は2番乗り場を20メートル移設。" }],
        popular: [{ title: "朝霧川の桜定点", summary: "今年の開花写真を日ごとに掲載。" }, { title: "市民プール7月予定", summary: "一般開放と教室の時間。" }]
      }),
      "/articles/river-cleanup": newsPage("朝霧川清掃、両岸に126人", "地域", "自治会、商店会、市職員が参加し、午前9時から約1時間半作業した。", photo("P18", "朝霧川沿いでごみ袋を持つ清掃参加者。", "東岸の集合地点。", "撮影・永瀬拓"), [], {
        author: "永瀬拓",
        publishedAt: "2025年5月18日 13:40",
        sections: [section("回収量", "可燃ごみ41袋、不燃ごみ9袋。大型ごみは市が別に回収した。", ["次回は11月を予定", "遊歩道は通常通り利用可能"])]
      }),
      "/events": newsPage("週末イベント一覧", "催し", "市内で予定されている催しを主催者発表からまとめた。", photo("P19", "駅西商店街に残る古い靴店の看板。", "夜市会場となる駅西商店街。", "撮影・編集部"), [
        { date: "6月27日", title: "駅西夜市", summary: "16時〜20時30分。38店舗。" },
        { date: "6月28日", title: "市民文化会館 写真保存講座", summary: "事前申込制、定員24人。" },
        { date: "7月5日", title: "朝霧川いきもの観察", summary: "小学生は保護者同伴。" }
      ], { author: "イベントデスク" }),
      "/weather": newsPage("21日は午後から雨、北口で混雑予想", "天気・交通", "夕方は短時間の強い雨となる見込み。駅北口の工事区画では案内員を増やす。", photo("P20", "曇天の駅北口とバス待ちの列。", "20日17時ごろの駅北口。", "撮影・編集部"), [], { author: "生活情報デスク" }),
      "/about": newsPage("霧川ローカルニュースについて", "編集部", "行政発表だけでなく、現場取材、訂正履歴、写真の撮影情報を残します。", photo("P16", "市役所資料室で取材する記者と職員。", "地域資料の記事取材。", "撮影・編集部"), [], {
        sections: [section("訂正方針", "事実関係を変更した場合は、記事番号を維持して理由と時刻を追記します。", ["誤字のみの修正は更新時刻へ記録", "写真差替えは撮影情報も更新"])]
      }),
      "/page/2": newsPage("新着記事 2ページ", "新着", "5月下旬から6月上旬の記事。", photo("P19", "駅西商店街の通りと閉店した店舗の看板。", "駅西商店街。", "撮影・編集部"), [
        { date: "2025.06.08", title: "図書館の返却口を増設", summary: "西側入口に一台追加。" },
        { date: "2025.06.03", title: "東浜公園の時計を修理", summary: "表示の遅れを調整した。" },
        { date: "2025.05.29", title: "商店街に共同配送棚", summary: "実証期間は8月末まで。" }
      ], { author: "編集部" }),
      "/404": { title: "記事が見つかりません", status: 404, notice: "公開終了した記事は訂正履歴に索引だけ残る場合があります。" }
    });
  }

  // 支援室: 制度だけでなく、利用条件、同意、記録保持を通常ページで説明する。
  if (sites["kirikawa-support"]) {
    sites["kirikawa-support"].pages["/"].title = "相談内容と利用方法";
    sites["kirikawa-support"].navigation = nav("kirikawa-support", [
      ["相談の流れ", "/flow"], ["支援制度", "/programs"], ["同意と記録", "/consent"],
      ["活動報告", "/reports"], ["相談員", "/staff"], ["FAQ", "/faq"]
    ]);
    mergePages("kirikawa-support", {
      "/consent": supportPage("同意と相談記録", "何を記録し、誰と共有し、いつ見直すかを相談の途中でも確認できます。", photo("P14", "机と二脚の椅子が置かれた静かな相談室。", "来室相談に使う個室。", "きりかわ暮らし支援室"), {
        flow: [
          { title: "目的を決める", text: "住まい、連絡、公開情報など、今回扱う範囲を確認します。" },
          { title: "共有先を選ぶ", text: "医療、行政、住まいの窓口へ渡す項目を別々に選べます。" },
          { title: "見直す", text: "状況が変わったときは、同意を止めたり訂正できます。" }
        ],
        faq: [{ title: "家族から照会があった場合", summary: "本人の安全を損なうおそれがあるため、相談の有無を含め回答しません。" }]
      }),
      "/annual-report": supportPage("2024年度 活動報告", "相談件数、連携先、研修、寄付の使途を集計しました。個別事例は掲載しません。", photo("P15", "段ボール箱へ生活用品を仕分ける支援室スタッフ。", "緊急宿泊用の生活用品を確認する様子。", "きりかわ暮らし支援室"), {
        reports: [
          { title: "相談", summary: "延べ318件。来室96件、電話142件、オンライン80件。" },
          { title: "緊急宿泊", summary: "実人数17人、平均利用3.4泊。" },
          { title: "研修", summary: "支援者向け4回、一般公開2回。" }
        ]
      }),
      "/contact": supportPage("相談予約と問い合わせ", "予約なしでも相談できます。安全な連絡方法が限られる場合は、その旨だけ伝えてください。", photo("P14", "相談室の机にメモ用紙と水差しが置かれている。", "相談室。", "きりかわ暮らし支援室"), {
        audience: [
          { title: "電話", summary: "平日10時〜17時。番号非通知でも受け付けます。" },
          { title: "来室", summary: "予約優先。入口で氏名を告げる必要はありません。" },
          { title: "同行支援", summary: "本人の希望がある場合に限り、行政・医療・住まいの窓口へ同行します。" }
        ]
      }),
      "/404": { title: "ページが見つかりません", status: 404, notice: "緊急時の案内はトップページから確認できます。" }
    });
  }

  // 北辰女子大学公開資料室: 検索、資料詳細、版履歴、関連資料、書出しを実体化する。
  if (sites["hokushin-wu"]) {
    sites["hokushin-wu"].navigation = nav("hokushin-wu", [
      ["資料検索", "/search"], ["資料一覧", "/records"], ["写真部", "/photo-club"], ["同窓会", "/alumni"],
      ["公開講座", "/public-lectures"], ["学園祭", "/festival"], ["版履歴", "/version-history"]
    ]);
    mergePages("hokushin-wu", {
      "/": archivePage("公開資料室", [
        { id: "HW-2025-006", type: "広報", title: "2025年度オープンキャンパス", metadata: [{ label: "公開日", value: "2025-06-01" }, { label: "所蔵元", value: "入試広報課" }], description: "模擬授業、図書館見学、学生相談の案内。" },
        { id: "PC-2016-081", type: "写真", title: "2016年度 学園祭展示班", metadata: [{ label: "撮影日", value: "2016-10-22" }, { label: "公開範囲", value: "一般公開" }], description: "写真部から移管された行事写真。", route: "vdm://hokushin-wu/records/PC-2016-081" }
      ], photo("P06", "市民文化会館の講座会場で、スクリーンを見る参加者。", "公開講座の記録写真。", "北辰女子大学 公開資料室"), {
        sections: [section("利用案内", "資料番号、資料名、所蔵元から検索できます。原版の閲覧には申請が必要な場合があります。", ["一般公開資料は書出し可能", "個人情報を含む原版は閲覧室のみ"])]
      }),
      "/search": archivePage("資料検索", [
        { id: "PC-2016-081", type: "写真", title: "2016年度 学園祭展示班", metadata: [{ label: "撮影日", value: "2016-10-22" }, { label: "所蔵元", value: "写真部" }], description: "展示室前で撮影された集合写真。", route: "vdm://hokushin-wu/records/PC-2016-081" },
        { id: "LEC-2024-019", type: "講座", title: "地域写真の保存", metadata: [{ label: "開催日", value: "2024-10-05" }, { label: "所蔵元", value: "地域連携課" }], description: "配布資料、音声記録、会場写真。", route: "vdm://hokushin-wu/records/LEC-2024-019" }
      ], photo("P12", "紙焼き写真、手袋、ノートPCが並ぶ資料整理机。", "資料検索後の確認に使う作業机。", "北辰女子大学 公開資料室"), {
        filters: [
          { label: "年度", key: "year", options: ["すべて", "2025", "2024", "2016"] },
          { label: "資料種別", key: "type", options: ["すべて", "写真", "講座", "広報"] }
        ]
      }),
      "/records": archivePage("資料一覧", [
        { id: "AL-2018-014", type: "同窓会", title: "写真部卒業生の近況", metadata: [{ label: "公開日", value: "2018-06-30" }], description: "卒業生3名の活動紹介。" },
        { id: "FES-2016-033", type: "広報", title: "第53回北辰祭パンフレット", metadata: [{ label: "開催日", value: "2016-10-22" }], description: "展示、講演、模擬店の一覧。" },
        { id: "PC-2016-081", type: "写真", title: "2016年度 学園祭展示班", metadata: [{ label: "撮影日", value: "2016-10-22" }], description: "公開用画像と版履歴あり。", route: "vdm://hokushin-wu/records/PC-2016-081" }
      ], photo("P04", "大学祭の展示室前に写真部員が並ぶ集合写真の初版。", "目録 PC-2016-081。", "北辰女子大学 写真部")),
      "/records/PC-2016-081": archivePage("資料詳細 PC-2016-081", [
        { id: "PC-2016-081", type: "写真", title: "2016年度 学園祭展示班", metadata: [{ label: "撮影日", value: "2016-10-22" }, { label: "撮影場所", value: "北校舎 展示室前" }, { label: "所蔵元", value: "写真部" }, { label: "公開範囲", value: "一般公開" }], description: "公開用画像。原版は資料室の管理端末で閲覧。" }
      ], photo("P04", "大学祭の展示室前に6人が並ぶ写真部集合写真。", "公開用初版。", "北辰女子大学 写真部"), {
        versions: [
          { date: "2025.04.01", title: "目録移行", summary: "旧分類 PC16-81 から現行番号へ変更。" },
          { date: "2025.06.18", title: "公開画像更新", summary: "画像データを更新。ALTは確認継続中。" }
        ],
        related: [{ title: "第53回北辰祭パンフレット", summary: "展示班の配置と担当を掲載。", route: "vdm://hokushin-wu/festival" }]
      }),
      "/records/LEC-2024-019": archivePage("資料詳細 LEC-2024-019", [
        { id: "LEC-2024-019", type: "講座", title: "地域写真の保存", metadata: [{ label: "開催日", value: "2024-10-05" }, { label: "会場", value: "霧川市民文化会館" }, { label: "公開範囲", value: "配布資料・抄録" }], description: "家庭写真の整理、撮影情報、公開範囲を扱った公開講座。" }
      ], photo("P06", "市民文化会館の講座で、参加者がスクリーンを見ている。", "公開講座の会場記録。", "北辰女子大学 地域連携課")),
      "/version-history": archivePage("版履歴", [
        { id: "VER-2025-0618", type: "更新記録", title: "6月18日の画像更新", metadata: [{ label: "対象", value: "PC-2016-081" }, { label: "担当", value: "公開資料室" }], description: "公開画像と説明文を更新。目録番号は維持。" },
        { id: "VER-2025-0401", type: "更新記録", title: "目録システム移行", metadata: [{ label: "対象", value: "全資料" }], description: "分類記号と公開URLを現行形式へ変更。" }
      ], photo("P12", "写真資料を照合する机上の作業風景。", "版履歴の照合作業。", "北辰女子大学 公開資料室")),
      "/related": archivePage("関連資料", [
        { id: "FES-2016-033", type: "広報", title: "第53回北辰祭パンフレット", metadata: [{ label: "開催", value: "2016-10-22" }], description: "写真部展示の会場と担当一覧。" },
        { id: "NEWS-2018-011", type: "ニュース", title: "写真部が市民展へ出展", metadata: [{ label: "公開", value: "2018-11-04" }], description: "卒業制作8点を展示。" }
      ], photo("P04", "大学祭の写真部集合写真。", "関連資料の代表画像。", "北辰女子大学 写真部")),
      "/export": archivePage("書出し案内", [], photo("P24", "USBメモリ、印刷資料、外付け媒体をまとめたオフライン資料一式。", "書出し後の資料一式。", "北辰女子大学 公開資料室"), {
        sections: [section("書出せるもの", "一般公開資料の目録情報と公開画像を端末へ保存できます。", ["目録テキスト", "公開画像", "版履歴"]), section("書出せないもの", "閲覧室限定の原版、連絡先、申請書は対象外です。", [])]
      }),
      "/404": { title: "資料が見つかりません", status: 404, notice: "目録番号が変更された場合は版履歴から旧番号を検索できます。" }
    });
  }

  // 医療センター: 市役所の共通文言を排し、診療導線と地域連携に限定する。
  if (sites["kirikawa-med"]) {
    sites["kirikawa-med"].navigation = nav("kirikawa-med", [
      ["診療案内", "/departments"], ["受付時間", "/hours"], ["予約", "/appointments"],
      ["医療相談", "/consultation"], ["地域連携", "/community"], ["アクセス", "/access"]
    ]);
    const med = (title, department, lead, docs, image, extra) => agencyPage(title, department, lead, docs, Object.assign({
      heroMedia: image,
      contact: "霧川市民医療センター 代表（作品内案内）",
      notices: []
    }, extra || {}));
    mergePages("kirikawa-med", {
      "/": med("霧川市民医療センター", "患者サポート室", "受診、面会、地域連携に関する案内です。緊急時は地域の救急案内を利用してください。", [
        { title: "外来受付", summary: "初診8:15〜11:00、再診8:00〜11:30。" },
        { title: "面会", summary: "平日15:00〜19:00、土日13:00〜19:00。" }
      ], photo("P14", "机と椅子が置かれた個別相談室。", "患者サポート室の相談スペース。", "霧川市民医療センター"), {
        sections: [section("来院前に", "発熱や感染症症状がある場合は、正面入口へ入る前に電話でお知らせください。", ["保険証または資格確認書", "紹介状とお薬手帳"])]
      }),
      "/departments": med("診療科・外来担当", "医事課 外来係", "診療科ごとの受付曜日と休診情報を掲載します。", [
        { title: "内科", summary: "月〜金。紹介状なしでも受診できます。" },
        { title: "外科", summary: "火・木は手術日のため予約優先。" },
        { title: "整形外科", summary: "水曜午後は休診。" }
      ], photo("P14", "個別相談用の机と二脚の椅子。", "診療前相談にも使用する患者サポート室。", "霧川市民医療センター")),
      "/hours": med("受付時間・休診日", "医事課", "受付時間は診療科で異なります。予約票に記載された時刻を優先してください。", [
        { title: "平日", summary: "初診8:15〜11:00、再診8:00〜11:30。" },
        { title: "休診", summary: "土日祝、年末年始。救急は別体制。" }
      ], photo("P12", "時計、書類、ノートPCが置かれた受付裏の作業机。", "外来受付の確認作業。", "霧川市民医療センター")),
      "/appointments": med("予約・予約変更", "予約センター", "診察券番号と予約日を確認してお電話ください。メールでの変更は受け付けていません。", [
        { title: "紹介予約", summary: "紹介元医療機関から地域連携室へ申し込みます。" },
        { title: "予約変更", summary: "平日13:00〜16:30。診療科により変更できない場合があります。" }
      ], photo("P14", "相談室の机に電話と予約票が置かれている。", "予約内容の確認スペース。", "霧川市民医療センター")),
      "/consultation": med("医療相談", "患者サポート室", "治療費、退院後の生活、介護、仕事との両立について医療ソーシャルワーカーが相談を受けます。", [
        { title: "利用方法", summary: "主治医、看護師、受付へお申し出ください。予約も可能です。" },
        { title: "費用", summary: "相談のみの費用はかかりません。" }
      ], photo("P14", "外からの視線を遮った相談室。", "患者サポート室。", "霧川市民医療センター")),
      "/careers": med("採用情報", "総務課 人事係", "看護師、医療事務、臨床工学技士の募集状況です。", [
        { title: "看護師", summary: "2026年4月採用。病院見学は月2回。" },
        { title: "医療事務", summary: "経験者採用。診療情報管理士資格を歓迎。" }
      ], photo("P15", "物品を確認しながら仕分けるスタッフ。", "院内物品の確認研修を想起させる作業風景。", "作品内資料")),
      "/bulletin": med("広報誌 きりかわ医療", "広報委員会", "地域向けの健康情報、院内の取組、連携機関の紹介を掲載します。", [
        { title: "2025年春号", summary: "健診結果の見方、訪問看護との連携。", route: "vdm://kirikawa-med/magazine/2025-spring" },
        { title: "2024年冬号", summary: "冬の転倒予防、年末年始の受診案内。" }
      ], photo("P12", "印刷物とノートPCが並ぶ編集作業机。", "広報誌の校正作業。", "霧川市民医療センター")),
      "/community": med("地域医療連携", "地域連携室", "紹介予約と退院支援に必要な情報を、本人へ説明した範囲で医療・介護機関と共有します。", [
        { title: "診療情報提供書", summary: "紹介目的、検査結果、処方内容を確認します。" },
        { title: "生活情報保護事業との接続", summary: "連絡先切替の完了通知のみ受領し、診療内容は共有しません。" }
      ], photo("P14", "資料を広げて面談できる個室。", "退院支援の面談室。", "霧川市民医療センター")),
      "/privacy": med("個人情報の取扱い", "診療情報管理室", "診療情報の利用目的、第三者提供、開示手続きを説明します。", [
        { title: "院内利用", summary: "診療、会計、医療安全、職員教育。" },
        { title: "院外提供", summary: "法令上の例外を除き、本人同意を確認します。" }
      ], photo("P24", "ファイルと外部媒体が整理されたオフライン資料一式。", "開示資料の受渡し例。", "作品内資料")),
      "/access": med("交通・院内案内", "総務課", "霧川駅東口から路線バスで約12分。正面玄関は7時30分に開きます。", [
        { title: "バス", summary: "医療センター前下車。平日日中は1時間3本。" },
        { title: "駐車場", summary: "外来受診は最初の4時間まで無料処理。" }
      ], photo("P20", "霧川駅北口のバス乗り場と歩行者。", "駅から医療センター方面へのバス案内。", "霧川ローカル資料")),
      "/magazine/2025-spring": med("広報誌 2025年春号", "広報委員会", "健診結果の見方と、地域連携室の利用方法を紹介します。", [
        { title: "特集", summary: "数値だけで判断せず、前年との変化を確認する。" },
        { title: "連携室から", summary: "退院後の生活を入院中から相談できます。" }
      ], photo("P12", "印刷物の校正紙とノートPC。", "春号の校正紙。", "霧川市民医療センター")),
      "/notices": med("お知らせ", "総務課", "休診、面会、院内設備に関する案内です。", [
        { title: "7月1日からの面会時間", summary: "平日は15時から19時。病棟受付で手続きが必要です。" },
        { title: "売店棚卸し", summary: "6月30日は17時で閉店します。" }
      ], photo("P12", "予定表を確認する作業机。", "院内案内の更新作業。", "霧川市民医療センター")),
      "/404": { title: "ページが見つかりません", status: 404, notice: "診療内容に関する個別相談はWebでは回答していません。" }
    });
  }

  // クレセントホーム: IT企業の共通プロフィールを排し、物件と入居後手続に特化する。
  if (sites["crescent-home"]) {
    sites["crescent-home"].navigation = nav("crescent-home", [
      ["物件検索", "/listings"], ["入居者向け", "/residents"], ["修繕", "/repairs"], ["退去", "/move-out"],
      ["費用", "/fees"], ["周辺情報", "/area"], ["過去掲載", "/archive"]
    ]);
    const realty = (title, lead, services, image, extra) => corporatePage(title, "CRESCENT HOME KIRIKAWA", lead, services, Object.assign({
      heroMedia: image,
      profile: [{ label: "管理戸数", value: "428戸" }, { label: "営業時間", value: "9:30〜18:00 / 水曜休" }, { label: "所在地", value: "霧川駅西口 徒歩4分" }]
    }, extra || {}));
    mergePages("crescent-home", {
      "/": realty("霧川市内の賃貸物件・管理窓口", "駅西・朝霧台・東浜を中心に、空室情報と入居中の連絡先を掲載しています。", [
        { title: "空室を探す", summary: "間取り、賃料、入居時期から絞り込めます。" },
        { title: "入居中の連絡", summary: "水漏れ、鍵、共用部の不具合を受け付けます。" },
        { title: "退去", summary: "契約書の予告期間を確認して手続きしてください。" }
      ], photo("P10", "低層賃貸住宅の外観と自転車置場。", "朝霧台の管理物件。", "クレセントホーム霧川"), {
        news: [{ date: "2025.06.14", title: "夏季のエアコン試運転", summary: "入居者向けに確認手順を掲載しました。" }]
      }),
      "/listings": realty("物件一覧", "公開中の空室です。申込状況は店頭確認が優先されます。", [
        { title: "朝霧台コーポ 203", summary: "1K / 23.4㎡ / 48,000円 / 管理費3,000円", route: "vdm://crescent-home/listings/asagiri-203" },
        { title: "東浜ハイツ 105", summary: "2DK / 39.1㎡ / 61,000円 / 管理費4,000円", route: "vdm://crescent-home/listings/tohama-105" }
      ], photo("P10", "朝霧台の賃貸住宅外観。", "公開中物件の外観。", "クレセントホーム霧川")),
      "/listings/asagiri-203": realty("朝霧台コーポ 203", "駅徒歩11分。南向きの1K。現在は内見予約を受け付けています。", [
        { title: "賃料", summary: "48,000円 / 管理費3,000円 / 敷金1か月" },
        { title: "設備", summary: "バス・トイレ別、室内洗濯機置場、無料駐輪場" },
        { title: "入居", summary: "7月中旬予定。保証会社審査あり。" }
      ], photo("P10", "二階建て賃貸住宅の外観。", "朝霧台コーポ。", "クレセントホーム霧川"), {
        caseStudies: [{ title: "共用廊下", summary: "夜間は足元灯が点灯します。", heroMedia: photo("P11", "集合住宅の共用廊下。", "共用部。", "クレセントホーム霧川") }]
      }),
      "/listings/tohama-105": realty("東浜ハイツ 105", "商店街まで徒歩4分。二人入居相談可の2DKです。", [
        { title: "賃料", summary: "61,000円 / 管理費4,000円 / 礼金なし" },
        { title: "設備", summary: "追い焚き、独立洗面台、敷地内ごみ置場" },
        { title: "入居", summary: "即入居可。自転車は2台まで登録可。" }
      ], photo("P11", "手すりと玄関扉が並ぶ集合住宅の共用廊下。", "東浜ハイツ共用部。", "クレセントホーム霧川")),
      "/residents": realty("入居者向け案内", "契約内容の確認、鍵、駐輪、ごみ、設備の連絡先です。", [
        { title: "鍵の紛失", summary: "本人確認後、提携業者を案内します。出張費は入居者負担です。" },
        { title: "ごみ", summary: "物件ごとの曜日と集積場所を掲示板で確認してください。" },
        { title: "駐輪登録", summary: "管理番号シールを店頭または郵送で受け取れます。" }
      ], photo("P11", "集合住宅の共用廊下と各戸の玄関。", "入居者が利用する共用部。", "クレセントホーム霧川")),
      "/management": realty("管理会社・対応時間", "巡回、修繕手配、契約更新は当社管理部が行います。", [
        { title: "通常窓口", summary: "9:30〜18:00、水曜休。" },
        { title: "夜間", summary: "漏水、火災設備、共用玄関故障のみ委託窓口へ。" }
      ], photo("P12", "書類と鍵札が置かれた管理用の作業机。", "管理部の確認机。", "作品内資料")),
      "/repairs": realty("修繕受付", "症状、発生時刻、室内か共用部かを確認します。緊急性に応じて訪問日時を調整します。", [
        { title: "水回り", summary: "止水できない場合は夜間窓口へ。" },
        { title: "エアコン", summary: "型番とエラー表示を控えてください。" },
        { title: "共用部", summary: "照明切れ、放置物、オートロック。" }
      ], photo("P11", "照明のある集合住宅の共用廊下。", "共用部点検の対象。", "クレセントホーム霧川")),
      "/move-out": realty("退去手続", "契約書記載の予告期間までに書面または店頭で申請してください。", [
        { title: "申請", summary: "退去日、転居先、立会希望を記入。" },
        { title: "立会", summary: "鍵と取扱説明書を返却。所要約30分。" },
        { title: "精算", summary: "使用状況と契約特約に基づき書面で通知。" }
      ], photo("P11", "荷物のない共用廊下。", "退去立会時に確認する共用部。", "クレセントホーム霧川")),
      "/fees": realty("初期費用・更新費用", "表示賃料以外に必要な費用を物件ごとに見積書で示します。", [
        { title: "契約時", summary: "敷金、前家賃、保証会社、火災保険、鍵交換。" },
        { title: "更新", summary: "契約更新料は物件により0〜1か月。" }
      ], photo("P12", "見積書と電卓が置かれた机。", "契約費用の確認。", "作品内資料")),
      "/area": realty("周辺情報", "生活圏を確認できるよう、買い物、交通、医療、避難所を掲載します。", [
        { title: "朝霧台", summary: "スーパー徒歩8分、駅徒歩11分、指定避難所は東小学校。" },
        { title: "東浜", summary: "商店街徒歩4分、バス停徒歩2分、市民医療センター行きあり。" }
      ], photo("P19", "駅西商店街の通りと古い店舗看板。", "霧川駅西側の商店街。", "地域資料")),
      "/contact": realty("来店予約・問い合わせ", "内見は前日までの予約をおすすめします。申込みは本人確認後に受け付けます。", [
        { title: "来店", summary: "9:30〜18:00、水曜休。" },
        { title: "内見", summary: "現地待合せも可能。身分証の写しは契約時まで不要です。" }
      ], photo("P12", "書類と鍵札が並ぶ受付机。", "来店時の受付イメージ。", "作品内資料")),
      "/404": { title: "掲載を終了しました", status: 404, notice: "成約、募集条件の変更、入居者の安全上の理由で公開を終了する場合があります。" }
    });
  }

  // BBS: 板、個別スレッド、過去ログ、規則、通報を別ルート化する。
  if (sites["kirikawa-bbs"]) {
    sites["kirikawa-bbs"].boards = nav("kirikawa-bbs", [
      ["板一覧", "/"], ["地域", "/boards/local"], ["市役所", "/boards/city"], ["過去ログ", "/archive"],
      ["検索", "/search"], ["利用規則", "/rules"]
    ]);
    mergePages("kirikawa-bbs", {
      "/thread/188": boardPage("駅北口の工事と取材", "地域板 / 2025年2月", [
        { number: 188, userId: "kiri3", date: "2025/02/19 18:07", text: "駅北口で取材やってた。工事の人とは別に、誰か待ってた？" },
        { number: 189, userId: "noon", date: "2025/02/19 18:21", text: "ニュースの腕章だった。バス停側に三人いたと思う。", quotes: [188] },
        { number: 190, userId: "bus_wait", date: "2025/02/19 19:02", text: "17時台はいつも混む。撮影なら通行人が映らないようにしてほしい。", quotes: [188] }
      ], photo("P20", "夕方の霧川駅北口とバス停。", "スレッドで話題になった駅北口。", "投稿者提供 / 作品内資料")),
      "/thread/64": boardPage("市役所の公開資料", "市役所板 / 2025年2月〜6月", [
        { number: 64, userId: "doc_old", date: "2025/02/17 21:40", text: "古いPDFのページずれ、資料室の人が直してくれた。閲覧履歴も引き継げて助かった。" },
        { number: 65, userId: "local8", date: "2025/06/19 12:06", text: "担当一覧を見たけど、その人いなくない？", quotes: [64] },
        { number: 66, userId: "doc_old", date: "2025/06/19 13:11", text: "名札まで見たわけじゃない。ページが直ったのは本当。", quotes: [65] }
      ], photo("P01", "市役所地下資料室で資料箱を扱う職員。", "公開資料の整理作業。", "地域資料")),
      "/thread/411": boardPage("古い住所の検索結果", "相談板 過去ログ / 2024年9月", [
        { number: 411, userId: "after_move", date: "2024/09/08 22:14", text: "古い住所の検索結果を止めてもらって助かった。知人の投稿までは触らない説明だった。" },
        { number: 412, userId: "supporter", date: "2024/09/08 22:31", text: "申請した本人が範囲を選ぶ制度。全部消すものではない。", quotes: [411] },
        { number: 413, userId: "after_move", date: "2024/09/09 07:02", text: "そこは紙でも確認した。連絡先を変えた後もしばらく相談できた。", quotes: [412] }
      ], photo("P14", "二脚の椅子がある相談室。", "相談窓口のイメージ。", "作品内資料")),
      "/rules": boardPage("利用規則", "書込み前に確認してください。", [
        { number: 1, userId: "admin", date: "2025/04/01", title: "個人情報", text: "実名、住所、電話番号、通学先など、個人を特定できる投稿は禁止します。" },
        { number: 2, userId: "admin", date: "2025/04/01", title: "削除", text: "削除後も引用番号や通報記録が一定期間残る場合があります。" },
        { number: 3, userId: "admin", date: "2025/04/01", title: "ローカル書込み", text: "この作品内の投稿は外部へ送信されません。" }
      ]),
      "/report": boardPage("通報窓口", "投稿番号と理由を選んでください。この端末内で受付状態を保存します。", [
        { number: 1, userId: "admin", date: "2025/04/01", text: "緊急の危険がある場合は掲示板の通報ではなく公的な窓口を利用してください。" }
      ]),
      "/page/2": boardPage("地域板 2ページ", "2025年6月上旬のスレッド。", [
        { number: 171, userId: "poolside", date: "2025/06/08", title: "市民プールの予約", text: "午前の家族枠、今年も抽選？" },
        { number: 166, userId: "lamp33", date: "2025/06/03", title: "東浜公園の時計", text: "今日見たら直ってた。" },
        { number: 159, userId: "bread9", date: "2025/05/29", title: "共同配送棚", text: "冷蔵品は置けないって貼ってあった。" }
      ]),
      "/404": { title: "スレッドが見つかりません", status: 404, notice: "削除跡または過去ログに索引だけ残っている場合があります。" }
    });
  }

  // cache-note: 技術資料と個人メモの中間にある通常記事を追加する。
  if (sites["cache-note"]) {
    sites["cache-note"].navigation = nav("cache-note", [
      ["最近", "/"], ["障害復旧", "/recovery"], ["キャッシュ", "/cache"], ["公共システム", "/public-systems"],
      ["過去記事", "/archive"], ["プロフィール", "/profile"], ["リンク", "/links"]
    ]);
    mergePages("cache-note", {
      "/": blogPage("最近の記事", "水原聡。公共系システムの運用と復旧をしていた。今は小規模な移行案件を手伝う。", [
        { date: "2025-05-30", title: "復旧後に最初に見るもの", body: "成功ログより先に、空欄になった担当者と更新時刻を見る。画面が戻っても、索引まで戻ったとは限らない。", tags: ["復旧", "記録"] },
        { date: "2025-05-12", title: "交代表を一枚にしない", body: "夜間窓口と通常窓口では、見ている情報が違う。引継ぎ表を一枚にまとめると例外が消える。", tags: ["運用"] }
      ], photo("P23", "モニター、付箋、紙のチェックリストが置かれた技術者の作業机。", "作業机。", "cache-note")),
      "/2025/05/recovery-first": blogPage("復旧後に最初に見るもの", "水原聡 / 個人メモ", [
        { date: "2025-05-30", title: "復旧後に最初に見るもの", body: "監視の緑色は、監視対象が返事をしたという意味でしかない。担当者欄、検索索引、通知テンプレートの順に差分を取る。作業者名が空なら、先に画面と時刻を保存する。", tags: ["復旧", "記録"], comments: [{ name: "ops_2", summary: "通知テンプレートは見落としていた。次回の手順へ追加します。" }] }
      ], photo("P23", "運用画面と紙の手順書が並ぶ机。", "記事を書いた日の作業机。", "cache-note")),
      "/2024/11/reference-table": blogPage("参照表を戻さない復旧", "水原聡 / 2024年の記録", [
        { date: "2024-11-24", title: "参照表を戻さない復旧", body: "人名をキーにした連携は、表示だけ消しても返信と通知に残る。だからといって、参照表を丸ごと巻き戻すと別の人の訂正まで失う。対象を一件ずつ切り離すしかない。", tags: ["公共", "復旧"], comments: [{ name: "r_shindo", summary: "私の件も同じです。二度確認してください。" }] }
      ], photo("P24", "USBメモリと印刷資料をまとめたオフライン資料一式。", "ネットへ戻さない確認用資料。", "cache-note")),
      "/profile": blogPage("プロフィール", "水原聡。以前は公共系システム会社で移行と障害復旧を担当。現在は個人で記録保全を手伝う。", [
        { date: "2025-04-01", title: "このブログについて", body: "顧客名と現行構成は書かない。古い失敗と一般化できる手順だけ残す。記事の時刻は後から直さない。", tags: ["このサイト"] }
      ], photo("P23", "技術者の机。人物は写っていない。", "プロフィール代わりに掲載されている作業机。", "cache-note")),
      "/links": blogPage("リンク集", "運用時に参照する公開情報。リンク切れは月に一度確認する。", [
        { date: "2025-06-01", title: "公開資料", body: "霧川市の例規・統計、北辰女子大学公開資料室、地域ニュース訂正履歴。", tags: ["リンク"] },
        { date: "2025-05-01", title: "支援と相談", body: "きりかわ暮らし支援室。相談の有無を第三者へ答えない方針が明記されている。", tags: ["リンク"] }
      ], photo("P24", "印刷資料と外付け媒体を分類した机上。", "月次リンク確認の手元資料。", "cache-note")),
      "/comments/archive": blogPage("コメント保管", "承認済みコメントのうち、元記事が公開終了したもの。", [
        { date: "2024-11-28", title: "公開終了記事へのコメント", body: "本文は保管されていません。投稿名、承認日、返信先の番号だけが残っています。", tags: ["コメント"], comments: [{ name: "archive_user", summary: "番号だけでも残してください。あとで照合します。" }] }
      ], photo("P24", "ラベル付きの媒体と印刷資料。", "コメント索引のオフライン控え。", "cache-note")),
      "/404": { title: "記事が見つかりません", status: 404, notice: "削除した記事でも、コメント索引だけ残している場合があります。" }
    });
  }

  // Studio Lumen: すべてを写真スタジオ固有の業務・料金・納品・個人情報へ置換する。
  if (sites["studio-lumen"]) {
    sites["studio-lumen"].footer = "Studio Lumen Kirikawa / 完全予約制";
    sites["studio-lumen"].navigation = nav("studio-lumen", [
      ["撮影", "/portrait"], ["イベント", "/events"], ["作例", "/portfolio"], ["料金", "/pricing"],
      ["予約", "/booking"], ["納品", "/delivery"], ["スタッフ", "/staff"], ["アクセス", "/access"]
    ]);
    const studio = (title, eyebrow, lead, services, image, extra) => corporatePage(title, eyebrow, lead, services, Object.assign({
      heroMedia: image,
      profile: [{ label: "所在地", value: "霧川市駅西三丁目" }, { label: "営業時間", value: "10:00〜19:00" }, { label: "定休日", value: "火曜・第2水曜" }]
    }, extra || {}));
    mergePages("studio-lumen", {
      "/": studio("撮影メニューと予約案内", "STUDIO LUMEN / KIRIKAWA", "家族写真、仕事用プロフィール、学校行事について、撮影時間と納品範囲を案内します。", [
        { title: "人物撮影", summary: "一組ずつ。背景紙と窓側の自然光から選べます。" },
        { title: "イベント", summary: "学校、式典、小規模ライブ。事前に撮影不可範囲を確認します。" },
        { title: "証明写真", summary: "当日データとプリント。修整範囲は撮影後に確認します。" }
      ], photo("P17", "写真スタジオでカメラを構える東雲遥。背景紙と照明が見える。", "人物撮影の準備中。", "Studio Lumen"), {
        news: [
          { date: "2025.06.16", title: "7月の土曜枠", summary: "家族撮影は午後に2枠空きがあります。" },
          { date: "2025.06.05", title: "駅西夜市の撮影", summary: "主催者記録班として参加します。個別販売は行いません。" }
        ],
        caseStudies: [{ title: "人物", summary: "45分撮影 / 20カット納品" }, { title: "店舗", summary: "外観、スタッフ、商品、Web用横位置" }]
      }),
      "/portrait": studio("人物撮影", "PORTRAIT", "撮られるのが苦手な方には、立ち位置と視線を一つずつ確認しながら進めます。", [
        { title: "家族", summary: "60分。集合と一人ずつ、合計30カット。" },
        { title: "仕事用", summary: "30分。背景2種類、Webと印刷の比率で納品。" },
        { title: "証明写真", summary: "15分。当日プリント2枚とデータ1点。" }
      ], photo("P17", "カメラを構えるスタッフと柔らかいスタジオ照明。", "人物撮影担当の東雲遥。", "Studio Lumen"), {
        faq: [{ title: "服装を替えられますか", summary: "60分プランは一回まで。更衣スペースがあります。" }]
      }),
      "/events": studio("イベント撮影", "EVENT DOCUMENTATION", "進行表、撮影禁止区域、公開範囲を主催者と確認してから見積もります。", [
        { title: "学校行事", summary: "集合、舞台、展示。保護者向け販売の有無を事前に決めます。" },
        { title: "式典", summary: "受付から終了まで。納品は時系列と登壇者別。" },
        { title: "地域催事", summary: "広報用と記録用を分け、写り込みの扱いを主催者へ確認します。" }
      ], photo("P18", "川沿いの地域行事で活動する参加者。", "屋外イベントの記録例。", "Studio Lumen / 地域行事記録")),
      "/staff": studio("スタッフ", "PEOPLE", "撮影、レタッチ、受付を担当別に紹介します。", [
        { title: "東雲 遥 / photographer", summary: "人物、学校行事。会話を続けながら短い連写で撮る。" },
        { title: "榊原 理沙 / retoucher", summary: "色調整、プリント、アルバム校正。" },
        { title: "木戸 直人 / desk", summary: "予約、見積、撮影許可の確認。" }
      ], photo("P17", "スタジオ内でカメラを構える東雲遥。", "東雲遥。", "Studio Lumen")),
      "/booking": studio("予約", "BOOKING", "用途、人数、希望日、公開範囲を確認してから予約を確定します。", [
        { title: "空き確認", summary: "第3希望まで。返信は原則翌営業日。" },
        { title: "打合せ", summary: "イベント撮影は進行表と会場図を確認。" },
        { title: "キャンセル", summary: "7日前から所定の料金。体調不良は日程変更を相談できます。" }
      ], photo("P12", "予定表とノートPCが置かれた受付机。", "予約確認に使う受付机。", "Studio Lumen")),
      "/pricing": studio("料金", "PRICE GUIDE", "撮影時間、納品点数、利用範囲を含む税込料金です。追加費用は予約前に見積書へ記載します。", [
        { title: "人物 45", summary: "45分 / 20カット / 16,500円" },
        { title: "家族 60", summary: "60分 / 30カット / 24,200円" },
        { title: "証明写真", summary: "15分 / データ1点・プリント2枚 / 3,300円" },
        { title: "イベント", summary: "2時間 44,000円から。交通費別。" }
      ], photo("P12", "料金表と電卓が置かれた受付机。", "見積確認。", "Studio Lumen")),
      "/delivery": studio("納品", "DELIVERY", "撮影後にセレクトし、色と明るさを整えて納品します。顔や体形を別人のように変える修整は行いません。", [
        { title: "Webギャラリー", summary: "合言葉付き。公開期間30日。個別ダウンロード可。" },
        { title: "USB", summary: "店頭受取。ケースと納品書を付けます。" },
        { title: "プリント", summary: "L判からA3ノビ。色校正が必要な場合は店頭確認。" }
      ], photo("P24", "USBメモリ、印刷物、ケースをまとめた納品一式。", "USBとプリントの納品例。", "Studio Lumen")),
      "/privacy": studio("写真と個人情報", "PRIVACY", "撮影データの保存期間、第三者への公開、削除依頼の扱いを撮影前に説明します。", [
        { title: "通常撮影", summary: "納品後12か月保管。期間短縮を希望できます。" },
        { title: "作例掲載", summary: "別紙同意がある写真だけ。後から掲載停止を申し出られます。" },
        { title: "イベント", summary: "主催者との契約範囲で納品。個人からの問い合わせは主催者へ案内します。" }
      ], photo("P24", "納品用媒体と同意書を別々にまとめた机上。", "納品物と書類は分けて管理する。", "Studio Lumen")),
      "/portfolio": studio("作例", "SELECTED WORK", "掲載許可を受けた写真と、公開用に用意した地域記録です。", [
        { title: "人物", summary: "自然光、背景紙、仕事用プロフィール。" },
        { title: "地域", summary: "河川清掃、商店街、文化会館。" },
        { title: "仕事", summary: "受付、作業風景、店舗外観。" }
      ], photo("P17", "スタジオで人物撮影を行うカメラマン。", "人物撮影の作例制作風景。", "Studio Lumen"), {
        caseStudies: [
          { title: "朝霧川清掃", summary: "主催者記録。参加者の名札は公開版に含めない。" },
          { title: "駅西商店街", summary: "閉店前の店舗外観と看板を記録。" }
        ]
      }),
      "/access": studio("アクセス", "VISIT", "霧川駅西口から徒歩7分。商店街の旧靴店を曲がり、白い引戸の建物2階です。", [
        { title: "徒歩", summary: "駅西口から約550メートル。エレベーターあり。" },
        { title: "車", summary: "専用1台。予約時に利用希望をお知らせください。" },
        { title: "自転車", summary: "建物裏の共用ラックを利用。" }
      ], photo("P19", "駅西商店街に残る大きな文字の靴店看板。", "スタジオへ曲がる目印。", "Studio Lumen")),
      "/faq": studio("よくある質問", "FAQ", "予約前によく受ける質問です。", [
        { title: "撮影中に選べますか", summary: "途中で数枚確認できます。最終セレクトは撮影後です。" },
        { title: "ペット同伴", summary: "小型犬・猫は人物プランで相談可。清掃時間を含めます。" },
        { title: "データを紛失した", summary: "保管期間内で本人確認ができれば再納品できます。" }
      ], photo("P17", "スタジオの照明とカメラ。", "撮影前の準備。", "Studio Lumen")),
      "/contact": studio("問い合わせ", "CONTACT", "予約変更、見積、納品について、撮影名と日付をお知らせください。", [
        { title: "受付", summary: "10:00〜19:00。撮影中は折返しになる場合があります。" },
        { title: "納品後", summary: "ファイル不備は受取後14日以内にご連絡ください。" }
      ], photo("P12", "電話と予約台帳が置かれた受付机。", "受付。", "Studio Lumen")),
      "/404": { title: "ページが見つかりません", status: 404, notice: "公開期間を終えた作例は、プライバシー方針に基づき表示しません。" }
    });
  }

  // 初期ファクトリー由来の共通欄を、各サイトで本来掲載するページだけへ限定する。
  // Evidenceを含む項目は削らず、事件の観測経路と版管理はそのまま維持する。
  const pageVariants = (raw) => !raw?.title && Array.isArray(raw?.versions) ? raw.versions : [raw];
  const containsEvidence = (value) => {
    if (!value || typeof value !== "object") return false;
    if (typeof value.evidenceId === "string") return true;
    return (Array.isArray(value) ? value : Object.values(value)).some(containsEvidence);
  };
  const keepEvidenceOnly = (items) => Array.isArray(items) ? items.filter(containsEvidence) : items;
  const forRoute = (host, routePath, callback) => {
    const raw = sites[host]?.pages?.[routePath];
    if (raw) pageVariants(raw).forEach(callback);
  };
  const filterByTitle = (host, keys, rejectedTitles) => {
    Object.values(sites[host]?.pages || {}).forEach((raw) => pageVariants(raw).forEach((page) => {
      keys.forEach((key) => {
        if (!Array.isArray(page[key])) return;
        page[key] = page[key].filter((item) => containsEvidence(item) || !rejectedTitles.includes(item?.title));
      });
    }));
  };

  filterByTitle("kirikawa-city", ["notices"], ["熱中症予防のための公共施設開放", "河川清掃に伴う通行案内"]);
  filterByTitle("kirikawa-city", ["updates"], ["表記を更新", "掲載内容を確認"]);

  const tohamaKeep = {
    "/": ["services", "news", "profile"],
    "/services": ["services"],
    "/public": ["services"],
    "/cases": ["caseStudies"],
    "/news": ["news"],
    "/company": ["profile"],
    "/faq": ["faq", "caseStudies"]
  };
  ["/", "/services", "/public", "/cases", "/news", "/careers", "/quality", "/faq", "/company"].forEach((routePath) => {
    forRoute("tohama-its", routePath, (page) => {
      ["services", "news", "profile", "faq", "caseStudies"].forEach((key) => {
        if (!(tohamaKeep[routePath] || []).includes(key)) page[key] = keepEvidenceOnly(page[key]);
      });
    });
  });
  forRoute("tohama-its", "/careers", (page) => { page.sections = [section("募集職種", "2026年4月入社の運用設計、ヘルプデスク、法人営業を募集しています。", ["書類受付 7月31日まで", "一次面接は霧川本社またはオンライン", "公共分野の経験は不問"]), section("選考に関する連絡", "応募書類の受領後、五営業日以内に採用担当から連絡します。", [])]; });
  forRoute("tohama-its", "/quality", (page) => { page.sections = [section("変更管理", "本番反映は申請、相互確認、反映後点検の三段階で記録します。", ["緊急変更は翌営業日に再確認", "権限棚卸しは四半期ごと", "委託先の操作記録は一年保存"]), section("障害の受付", "契約番号と発生時刻を確認し、公開影響のある事象を優先して切り分けます。", [])]; });

  filterByTitle("kirikawa-news", ["related"], ["市民講座、写真整理を学ぶ", "駅北口の歩道工事が完了"]);
  filterByTitle("kirikawa-news", ["popular"], ["朝霧川の桜、今週末が見頃", "商店街の夜市は27日"]);
  const newsBodies = {
    "/government": ["市の広報デジタル資料室では、紙の広報と公開済み写真を年度別に点検している。取材日は2月12日。担当表と当日の作業写真を編集部で確認した。", "記事本文を6月19日に改稿した。変更箇所と理由は訂正欄に記録している。"],
    "/local": ["夜市は駅西通りの車道を使い、午後4時から9時まで開く。出店者一覧は商店会が20日に更新した。", "雨天時はアーケード内の飲食店のみ営業する。開催可否は当日正午に追記する。"],
    "/life": ["祝日の家庭ごみは通常の曜日どおり収集する。東地区の資源回収だけは翌週へ振り替える。", "収集時刻は道路状況で前後するため、午前8時までに集積所へ出すよう市環境課が呼びかけている。"],
    "/authors/kawai": ["河合美緒は行政、福祉、地域交通を担当。会議資料と現地取材を照合し、公開後の訂正履歴を記事末尾に残す。", "情報提供は編集部窓口で受け付ける。匿名情報は、別の資料または取材先で確認できた場合に限り記事へ用いる。"],
    "/corrections": ["記事番号を維持したまま本文を変更した場合、変更日時と対象箇所を掲載する。表記の調整だけの場合も履歴から確認できる。"],
    "/popular": ["閲覧数は直近七日間の集計。速報の自動更新を除き、同じ端末からの連続閲覧は一回として数える。"],
    "/tips": ["写真は撮影日時と場所、文書は作成元が分かる状態で送ってください。個人の住所や電話番号は本文へ書かないでください。"]
  };
  Object.entries(newsBodies).forEach(([routePath, body]) => forRoute("kirikawa-news", routePath, (page) => { page.body = body; }));

  const supportKeep = {
    "/": ["flow", "audience", "faq", "training", "staff", "privacy", "emergency"],
    "/flow": ["flow"],
    "/eligible": ["audience"],
    "/programs": ["reports"],
    "/staff": ["staff"],
    "/faq": ["faq"],
    "/privacy": ["privacy"],
    "/training": ["reports", "training"],
    "/emergency": ["emergency"]
  };
  ["/", "/flow", "/eligible", "/programs", "/reports", "/staff", "/faq", "/privacy", "/training", "/donate", "/emergency"].forEach((routePath) => {
    forRoute("kirikawa-support", routePath, (page) => {
      ["flow", "audience", "faq", "reports", "training", "staff"].forEach((key) => {
        if (!(supportKeep[routePath] || []).includes(key)) page[key] = keepEvidenceOnly(page[key]);
      });
      if (!(supportKeep[routePath] || []).includes("privacy")) page.privacy = "";
      if (!(supportKeep[routePath] || []).includes("emergency")) page.emergency = "";
    });
  });
  forRoute("kirikawa-support", "/reports", (page) => { page.sections = [section("2024年度の内訳", "個人を特定できない形で受付方法と支援区分を集計しています。", ["相談 延べ318件", "来室96件・電話142件・オンライン80件", "緊急宿泊 実人数17人"]), section("公開日", "2025年5月16日。数値の修正がある場合は同じページへ履歴を残します。", [])]; });
  forRoute("kirikawa-support", "/donate", (page) => { page.sections = [section("2024年度の使途", "寄付金は緊急宿泊費、移動費、生活用品の購入へ充てました。相談員の人件費には使用していません。", ["緊急宿泊 42%", "移動・通信 31%", "生活用品 27%"]), section("受領方法", "窓口または銀行振込。匿名での寄付も受け付けます。", [])]; });
  forRoute("kirikawa-support", "/emergency", (page) => { page.sections = [section("このページを閉じる前に", "安全な端末へ移れる場合は履歴を残さず、地域の公的な緊急窓口へ連絡してください。", ["端末を共有している場合は通知表示に注意", "位置情報や写真の送信は本人が選ぶ", "支援室は警察・消防の代わりにはなりません"] )]; });

  filterByTitle("hokushin-wu", ["versions"], ["目録更新"]);
  filterByTitle("hokushin-wu", ["related"], ["学園祭パンフレット"]);
  filterByTitle("kirikawa-med", ["notices"], ["熱中症予防のための公共施設開放", "河川清掃に伴う通行案内"]);
  filterByTitle("kirikawa-med", ["updates"], ["表記を更新", "掲載内容を確認"]);

  Object.entries(sites["crescent-home"]?.pages || {}).forEach(([routePath, raw]) => {
    if (routePath !== "/") pageVariants(raw).forEach((page) => { page.profile = []; });
  });
  Object.entries(sites["studio-lumen"]?.pages || {}).forEach(([routePath, raw]) => {
    if (routePath !== "/") pageVariants(raw).forEach((page) => { page.profile = []; });
  });
  Object.entries(sites["kirikawa-bbs"]?.pages || {}).forEach(([routePath, raw]) => {
    if (!["/", "/rules"].includes(routePath)) pageVariants(raw).forEach((page) => { page.rules = ""; });
  });

  // 通常検索結果を増やす。事件語を含めず、サイトが日常に使われている手触りを補う。
  if (data.search && Array.isArray(data.search.records)) {
    const additions = [
      { id: "exp-city-search", kind: "all", title: "霧川市 サイト内検索", snippet: "手続、例規、統計、公開資料を検索できます。", path: "kirikawa-city / search", route: "vdm://kirikawa-city/search", keywords: ["霧川市", "手続", "統計", "検索"] },
      { id: "exp-city-stats", kind: "all", title: "例規・統計｜霧川市", snippet: "人口、施設利用、情報公開請求の処理状況。", path: "kirikawa-city / statistics", route: "vdm://kirikawa-city/statistics", keywords: ["霧川市", "人口", "統計"] },
      { id: "exp-tohama-security", kind: "all", title: "情報セキュリティ報告｜東浜情報ソリューションズ", snippet: "アクセス権と変更管理の四半期点検。", path: "tohama-its / security / report", route: "vdm://tohama-its/security/report", keywords: ["東浜情報ソリューションズ", "セキュリティ", "運用"] },
      { id: "exp-news-river", kind: "news", title: "朝霧川清掃、両岸に126人｜霧川ローカルニュース", snippet: "自治会、商店会、市職員が参加。", path: "kirikawa-news / articles / river-cleanup", route: "vdm://kirikawa-news/articles/river-cleanup", keywords: ["朝霧川", "清掃", "霧川ニュース"] },
      { id: "exp-support-consent", kind: "all", title: "同意と相談記録｜きりかわ暮らし支援室", snippet: "記録目的、共有先、保存期間を本人と確認します。", path: "kirikawa-support / consent", route: "vdm://kirikawa-support/consent", keywords: ["相談", "同意", "記録"] },
      { id: "exp-university-search", kind: "all", title: "公開資料検索｜北辰女子大学", snippet: "資料番号、資料名、所蔵元から検索。", path: "hokushin-wu / search", route: "vdm://hokushin-wu/search", keywords: ["北辰女子大学", "公開資料", "検索"] },
      { id: "exp-med-hours", kind: "all", title: "受付時間｜霧川市民医療センター", snippet: "診療科ごとの受付と休診日。", path: "kirikawa-med / hours", route: "vdm://kirikawa-med/hours", keywords: ["霧川市民医療センター", "受付", "診療"] },
      { id: "exp-realty-asagiri", kind: "all", title: "朝霧台コーポ203｜クレセントホーム霧川", snippet: "1K、23.4㎡、駅徒歩11分。", path: "crescent-home / listings / asagiri-203", route: "vdm://crescent-home/listings/asagiri-203", keywords: ["朝霧台", "賃貸", "1K"] },
      { id: "exp-bbs-rules", kind: "all", title: "利用規則｜霧川まちBBS", snippet: "個人情報、削除、ローカル書込みの扱い。", path: "kirikawa-bbs / rules", route: "vdm://kirikawa-bbs/rules", keywords: ["霧川BBS", "利用規則"] },
      { id: "exp-cache-profile", kind: "all", title: "cache-note / プロフィール", snippet: "公共系システムの運用と復旧に関する個人メモ。", path: "cache-note / profile", route: "vdm://cache-note/profile", keywords: ["cache-note", "水原聡", "プロフィール"] },
      { id: "exp-shindo-general", kind: "all", title: "新堂里緒｜公開行事スタッフ記録", snippet: "2024年秋の地域相談会で受付を担当したスタッフ名簿。", path: "端末内一般索引 / 地域行事", keywords: ["新堂里緒", "地域相談会", "公開名簿"], body: "公開行事の配布資料に、新堂里緒という氏名が一件だけ残っています。連絡先と所属は掲載されていません。" },
      { id: "exp-studio-price", kind: "all", title: "料金｜Studio Lumen", snippet: "人物、家族、証明写真、イベント撮影。", path: "studio-lumen / pricing", route: "vdm://studio-lumen/pricing", keywords: ["Studio Lumen", "写真", "料金"] },
      { id: "exp-studio-privacy", kind: "all", title: "写真と個人情報｜Studio Lumen", snippet: "撮影データの保存期間と作例掲載の同意。", path: "studio-lumen / privacy", route: "vdm://studio-lumen/privacy", keywords: ["Studio Lumen", "写真", "個人情報"] }
    ];
    const known = new Set(data.search.records.map((item) => item.id));
    additions.forEach((item) => { if (!known.has(item.id)) data.search.records.push(item); });
  }

  // Linkに事件と無関係な日常会話を加える。
  if (data.messages && Array.isArray(data.messages.conversations)) {
    const normalConversations = [
      {
        id: "bakery",
        name: "駅西ベーカリー",
        status: "本日分は18時まで",
        tone: 8,
        messages: [
          { id: "bk1", sender: "bakery", text: "塩パン6個、17時受取で承りました。紙袋は二つに分けますか？", date: "6月20日", time: "11:06" },
          { id: "bk2", sender: "me", text: "一つで大丈夫です。", date: "6月20日", time: "11:08" },
          { id: "bk3", sender: "bakery", text: "了解しました。焼き上がり次第、棚の右端に置きます。", date: "6月20日", time: "11:10" }
        ],
        intents: [{ examples: ["予約", "塩パン", "受取"], replies: ["本日の取置きは17時30分までです。個数をお知らせください。"], delay: 650 }]
      },
      {
        id: "delivery",
        name: "きりかわ宅配案内",
        status: "自動案内",
        tone: 6,
        messages: [
          { id: "dl1", type: "system", text: "お問い合わせ番号 KR-0620-184", date: "6月20日", time: "08:32" },
          { id: "dl2", sender: "delivery", text: "お荷物は宅配ボックス3番へお届けしました。暗証番号は紙の不在票をご確認ください。", date: "6月20日", time: "08:32" }
        ],
        intents: [{ examples: ["荷物", "宅配", "再配達"], replies: ["この端末では再配達を受け付けません。不在票に記載された作品内窓口をご確認ください。"], delay: 700 }]
      },
      {
        id: "photo-circle",
        name: "写真整理の会",
        status: "次回 6月28日",
        tone: 9,
        messages: [
          { id: "pc1", sender: "photo-circle", text: "土曜の講座、アルバムは持ってこなくて大丈夫です。まず日付の付け方を練習します。", date: "6月18日", time: "19:14" },
          { id: "pc2", sender: "me", text: "手袋は会場にありますか。", date: "6月18日", time: "19:22" },
          { id: "pc3", sender: "photo-circle", text: "薄手のものを用意します。使い慣れたものがあれば持参でも。", date: "6月18日", time: "19:26" }
        ],
        intents: [{ examples: ["講座", "手袋", "写真整理"], replies: ["会場は文化会館2階です。受付は13時15分から始めます。"], delay: 720 }]
      }
    ];
    const known = new Set(data.messages.conversations.map((item) => item.id));
    normalConversations.forEach((item) => { if (!known.has(item.id)) data.messages.conversations.push(item); });
    if (Array.isArray(data.messages.contacts)) {
      normalConversations.forEach((item) => {
        if (!data.messages.contacts.some((contact) => contact.conversationId === item.id)) {
          data.messages.contacts.push({ conversationId: item.id, name: item.name, status: item.status, tone: item.tone });
        }
      });
    }
    const allConversations = data.messages.conversations.slice();
    Object.defineProperty(data.messages, "conversations", {
      configurable: true,
      enumerable: true,
      get() {
        const ending = window.parent.CASE_STATE?.get?.().ending;
        return ending === "C" ? allConversations.filter((item) => ["bakery", "delivery", "photo-circle"].includes(item.id)) : allConversations;
      }
    });
    const callsDescriptor = Object.getOwnPropertyDescriptor(data.messages, "calls");
    const callsGetter = callsDescriptor?.get?.bind(data.messages);
    const callsItems = !callsGetter && Array.isArray(data.messages.calls) ? data.messages.calls : [];
    Object.defineProperty(data.messages, "calls", {
      configurable: true,
      enumerable: true,
      get() {
        return window.parent.CASE_STATE?.get?.().ending === "C" ? [] : (callsGetter ? callsGetter() : callsItems);
      }
    });
  }

  // Postboxに生活・業務の通常メールを加え、事件メールの密度を下げる。
  if (data.mail) {
    const normalMail = [
      { id: "m-normal-01", folder: "inbox", from: { name: "霧川市立図書館", address: "notice@library.kirikawa.local" }, to: ["fujisaki@kirikawa.local"], date: "2025/06/20 09:10", subject: "予約資料の取置期限", body: "予約資料『地域写真の整理』は6月24日まで中央館カウンターで取り置きます。休館日は月曜日です。" },
      { id: "m-normal-02", folder: "inbox", from: { name: "駅西ベーカリー", address: "order@ekibread.local" }, to: ["fujisaki@kirikawa.local"], date: "2025/06/20 11:11", subject: "取置きを受け付けました", body: "塩パン6個を17時受取で用意します。紙袋は一つです。受取時にこのメールを見せる必要はありません。" },
      { id: "m-normal-03", folder: "inbox", from: { name: "庁内施設係", address: "facility@kirikawa.local" }, to: ["archive-room@kirikawa.local"], date: "2025/02/13 15:40", subject: "地下資料室 除湿機の点検", body: "14日10時ごろ、委託業者が除湿機2台を点検します。資料箱を吸気口から30センチ以上離してください。" },
      { id: "m-normal-04", folder: "sent", from: { name: "藤崎千尋", address: "fujisaki@kirikawa.local" }, to: ["photo-circle@community.local"], date: "2025/02/09 18:22", subject: "Re: 6月講座の資料箱", body: "空の保存箱を8箱確保しました。手袋は会場側の在庫を使ってください。" },
      { id: "m-normal-05", folder: "drafts", from: { name: "藤崎千尋", address: "fujisaki@kirikawa.local" }, to: ["aoi@local"], date: "2025/02/12 20:01", subject: "みかん", body: "土曜に持っていく。固いのは母さんがジャム向きって言ってた。" },
      { id: "m-normal-06", folder: "archive", from: { name: "Studio Lumen", address: "desk@lumen.local" }, to: ["fujisaki@kirikawa.local"], date: "2025/01/24 19:06", subject: "撮影データを用意しました", body: "本日の撮影データ20点を用意しました。公開期間は2月23日までです。", attachments: [{ name: "納品案内.txt", type: "text", text: "納品20点 / 公開30日 / 作例掲載なし", size: 52 }] },
      { id: "m-normal-07", folder: "trash", from: { name: "庁内研修", address: "training@kirikawa.local" }, to: ["all-staff@kirikawa.local"], date: "2025/01/06 08:44", subject: "標的型メール訓練の終了", body: "訓練は終了しました。添付を開いた職員には個別研修を案内します。" }
    ];
    const descriptor = Object.getOwnPropertyDescriptor(data.mail, "messages");
    const originalGetter = descriptor && descriptor.get ? descriptor.get.bind(data.mail) : null;
    const originalItems = !originalGetter && Array.isArray(data.mail.messages) ? data.mail.messages : [];
    Object.defineProperty(data.mail, "messages", {
      configurable: true,
      enumerable: true,
      get() {
        const current = originalGetter ? originalGetter() : originalItems;
        const ids = new Set((current || []).map((item) => item.id));
        const combined = [...(current || []), ...normalMail.filter((item) => !ids.has(item.id))];
        return window.parent.CASE_STATE?.get?.().ending === "C" ? combined.filter((item) => String(item.id).startsWith("m-normal-")) : combined;
      }
    });
  }

  // Rippleの半数以上を地域の日常投稿として維持する。
  if (data.social) {
    const normalAccounts = [
      { id: "library", name: "霧川市立図書館", handle: "kirikawa_lib", bio: "開館、展示、予約資料のお知らせ。", followingCount: 34, followerCount: 2810, postCount: 1284, status: "public", verified: true, tone: 3 },
      { id: "culturehall", name: "霧川市民文化会館", handle: "kiri_culture", bio: "公演、講座、貸館情報。", followingCount: 49, followerCount: 1940, postCount: 809, status: "public", verified: true, tone: 6 }
    ];
    if (Array.isArray(data.social.accounts)) {
      const known = new Set(data.social.accounts.map((item) => item.id));
      normalAccounts.forEach((item) => { if (!known.has(item.id)) data.social.accounts.push(item); });
    }
    const normalPosts = [
      { id: "normal-r01", authorId: "library", body: "今週の新着は地域史6冊、写真整理3冊。予約資料の取置期限は一週間です。", createdAt: "2025-06-20T09:00:00+09:00", metrics: { replies: 1, reposts: 6, likes: 21 } },
      { id: "normal-r02", authorId: "culturehall", body: "28日の写真保存講座は満席になりました。キャンセル待ちは受付で3名まで。", createdAt: "2025-06-20T08:20:00+09:00", metrics: { replies: 2, reposts: 4, likes: 17 } },
      { id: "normal-r03", authorId: "resident1", body: "塩パンの追加分、15時20分に焼けるそうです。今日は風が強い。", createdAt: "2025-06-20T14:42:00+09:00", metrics: { replies: 0, reposts: 1, likes: 11 } },
      { id: "normal-r04", authorId: "resident2", body: "朝霧川の東岸、ベンチのペンキが乾いていました。座って大丈夫。", createdAt: "2025-06-19T16:08:00+09:00", metrics: { replies: 1, reposts: 2, likes: 15 } },
      { id: "normal-r05", authorId: "city", body: "駅西夜市に伴い、27日16時から駅西通りの一部を通行止めにします。", createdAt: "2025-06-19T12:00:00+09:00", metrics: { replies: 3, reposts: 18, likes: 43 } },
      { id: "normal-r06", authorId: "library", body: "返却口の工事が終わりました。西側入口は朝7時から利用できます。", createdAt: "2025-06-18T17:30:00+09:00", metrics: { replies: 0, reposts: 3, likes: 19 } }
    ];
    const descriptor = Object.getOwnPropertyDescriptor(data.social, "posts");
    const originalGetter = descriptor && descriptor.get ? descriptor.get.bind(data.social) : null;
    const originalItems = !originalGetter && Array.isArray(data.social.posts) ? data.social.posts : [];
    Object.defineProperty(data.social, "posts", {
      configurable: true,
      enumerable: true,
      get() {
        const current = originalGetter ? originalGetter() : originalItems;
        const ids = new Set((current || []).map((item) => item.id));
        const combined = [...(current || []), ...normalPosts.filter((item) => !ids.has(item.id))];
        const ending = window.parent.CASE_STATE?.get?.().ending;
        if (ending === "C") return combined.filter((item) => String(item.id).startsWith("normal-r"));
        if (ending === "B") return combined.filter((item) => !["chihiro", "haruka", "shindo"].includes(item.authorId));
        return combined;
      }
    });
  }

  if (data.notes && Array.isArray(data.notes.items)) {
    const additions = [
      { id: "note-normal-1", title: "土曜", body: "図書館 → パン受取 → 葵へみかん", updatedAt: "2025-02-14" },
      { id: "note-normal-2", title: "資料室の備品", body: "薄手手袋 / 中性紙の封筒 / 鉛筆B / ラベルテープ", updatedAt: "2025-02-13" }
    ];
    const known = new Set(data.notes.items.map((item) => item.id));
    additions.forEach((item) => { if (!known.has(item.id)) data.notes.items.push(item); });
  }

  // 機械検査とルート巡回が同じ一覧を使えるよう、拡張後の全ルートを公開する。
  data.routeInventory = Object.entries(sites).flatMap(([host, site]) => Object.keys(site.pages || {}).map((path) => ({
    host,
    path,
    route: "vdm://" + host + path,
    title: ((site.pages[path].versions || [site.pages[path]])[0] || {}).title || site.name,
    preset: site.preset,
    intentional404: Boolean(site.pages[path].status === 404 || path === "/404" || path.endsWith("/removed"))
  })));
})(window);
