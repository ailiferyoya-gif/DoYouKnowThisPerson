(function (global) {
  "use strict";

  const evidence = {
    E01: { label: "市職員紹介・初版", medium: "city", claims: ["I1"], sources: ["Browser / kirikawa-city/staff の詳細", "Photos / P08拡大"], action: "職員欄の保存情報または写真を詳しく確認", initiallyVisible: true, protectUntilSeen: true },
    E02: { label: "大学写真部の初版", medium: "university", claims: ["I1"], sources: ["Browser / hokushin-wu/photo-club", "Photos / P04拡大"], action: "目録詳細または集合写真を拡大", initiallyVisible: true, protectUntilSeen: true },
    E03: { label: "遥との私的な写真と引用", medium: "line", claims: ["I1"], sources: ["Link / 東雲遥 / IMG_4812.png"], action: "引用付き画像を開く", initiallyVisible: true },
    E04: { label: "河合の記事初版", medium: "news", claims: ["I1"], sources: ["Browser / kirikawa-news/government"], action: "取材メモを展開", initiallyVisible: true, protectUntilSeen: true },
    E05: { label: "千尋本人の仕事メモ", medium: "audio", claims: ["I1"], sources: ["Audio / A01"], action: "該当区間を再生または全文文字起こしを開く", initiallyVisible: true },
    E06: { label: "市ページとチーム写真の改稿", medium: "city", claims: ["I2"], sources: ["Browser / kirikawa-city/staff 現行版", "Photos / P09比較"], action: "保存版と現行版を比較", availableWhen: ["I1"], alternate: "P08とP09の比較" },
    E07: { label: "Ripple投稿と返信の削除残滓", medium: "social", claims: ["I2"], sources: ["Ripple / 削除投稿の詳細"], action: "削除後に残った返信または引用を開く", availableWhen: ["I1"] },
    E08: { label: "大学集合写真の差分", medium: "photo", claims: ["I2"], sources: ["Browser / hokushin-wu/photo-club 現行版", "Photos / P04-P05比較"], action: "同じ画角の二版を比較", availableWhen: ["I1"], alternate: "大学目録の版履歴" },
    E09: { label: "ニュース訂正と駅北口記録", medium: "news", claims: ["I2"], sources: ["Browser / kirikawa-news/corrections", "Browser / government 現行版"], action: "訂正履歴の詳細を開く", availableWhen: ["I1"] },
    E10: { label: "支援室の制度説明", medium: "support", claims: ["I3"], sources: ["Browser / kirikawa-support/programs"], action: "制度の適用範囲を詳しく確認", availableWhen: ["I2"] },
    E11: { label: "千尋の保護申請範囲", medium: "mail", claims: ["I3", "I4"], sources: ["Postbox / 申請範囲の確認 / 添付", "Files / 保護申請控え.txt"], action: "添付または復元ファイルを開く", availableWhen: ["I2"], alternate: "Filesの控え" },
    E12: { label: "本人同意と訂正の市規程", medium: "document", claims: ["I3"], sources: ["Browser / kirikawa-city/privacy", "Files / 事業概要"], action: "規程本文または文書を開く", availableWhen: ["I2"] },
    E13: { label: "過去の相談記録", medium: "support", claims: ["I3"], sources: ["Browser / kirikawa-bbs/archive"], action: "過去ログの該当返信を展開", availableWhen: ["I2"] },
    E14: { label: "実証事業の契約別紙", medium: "mail", claims: ["I4"], sources: ["Postbox / アーカイブ / 契約別紙"], action: "転送メールの添付を開く", availableWhen: ["I3"] },
    E15: { label: "関係者への中継ログ", medium: "log", claims: ["I4"], sources: ["Files / relay_20250218.csv"], action: "ログを復元して開く", availableWhen: ["I3"] },
    E16: { label: "水原の技術警告", medium: "audio", claims: ["I4"], sources: ["Postbox / 水原聡の転送履歴", "Audio / A06"], action: "ヘッダーまたは文字起こしを開く", availableWhen: ["I3"] },
    E17: { label: "新堂里緒の先行キャッシュ", medium: "archive", claims: ["I4", "I5"], sources: ["Files / RRC-1_shindo.cache", "Browser / cache-note/cache"], action: "保存版を復元して開く", availableWhen: ["I3"] },
    E18: { label: "Link応答の差分", medium: "line", claims: ["I5"], sources: ["Link / 河合美緒 / 応答差分.txt"], action: "会話内添付を開く", availableWhen: ["I4"] },
    E19: { label: "通知プレビューの残滓", medium: "social", claims: ["I5"], sources: ["Ripple / 通知 / 削除投稿への返信"], action: "通知から投稿詳細を開く", availableWhen: ["I4"] },
    E20: { label: "企業FAQの旧版", medium: "company", claims: ["I5"], sources: ["Browser / tohama-its/faq"], action: "FAQの保存版を開く", availableWhen: ["I4"], protectUntilSeen: true },
    E21: { label: "遥の保存通話と現在通話", medium: "audio", claims: ["I6"], sources: ["Audio / A02", "Audio / A03", "Link / 東雲遥の通話履歴"], action: "二つの通話を再生または文字で比較", availableWhen: ["I5"], requiredComponents: 2 },
    E22: { label: "真理子の留守電と現在通話", medium: "call", claims: ["I6"], sources: ["Audio / A04", "Audio / A05", "Link / 藤崎真理子の通話履歴"], action: "二つの通話を再生または文字で比較", availableWhen: ["I5"], requiredComponents: 2 },
    E23: { label: "検索語を読む企業IVR", medium: "audio", claims: ["I6"], sources: ["Audio / A07", "Link / 東浜情報の通話履歴"], action: "通話終了後に履歴と全文を確認", availableWhen: ["I5"] },
    E24: { label: "会話と保存通話の共通挙動", medium: "mixed", claims: ["I6"], sources: ["Link / 運用連絡.txt", "Audio / A08", "Audio / A11"], action: "異媒体の間と訂正を比較", availableWhen: ["I5"], requiredComponents: 2, requiredComponentMedia: 2 },
    E25: { label: "PCの処分区分変更", medium: "mail", claims: ["I7"], sources: ["Postbox / 送信済み / 端末処分区分"], action: "送信済みメールの引用履歴を開く", availableWhen: ["I6"] },
    E26: { label: "ローカルキャッシュ設定", medium: "file", claims: ["I7"], sources: ["Files / cache_policy.ini"], action: "隠し設定を復元して開く", availableWhen: ["I6"] },
    E27: { label: "千尋の未送信メモ", medium: "notes", claims: ["I7"], sources: ["Notes / 未送信", "Files / 説明できなかったこと.txt"], action: "未送信メモを開く", availableWhen: ["I6"] },
    E28: { label: "過去所有者の記録", medium: "settings", claims: ["I7"], sources: ["Files / owners.log", "Audio / A09"], action: "所有者記録または文字起こしを開く", availableWhen: ["I6"] },
    E29: { label: "現在セッションへ注入された履歴", medium: "search", claims: ["I8"], sources: ["Files / current_session.log", "Mira Search / 新規履歴"], action: "検索後に現在ログを開く", availableWhen: ["I7"] },
    E30: { label: "現在の参照者表示", medium: "settings", claims: ["I8"], sources: ["Files / current_referrer.txt", "Settings / プライバシー"], action: "現在の参照元を詳しく確認", availableWhen: ["I7"] },
    E31: { label: "千尋の最終音声", medium: "audio", claims: ["I8"], sources: ["Audio / A10", "Files / final_message.wav"], action: "最後の区間または全文文字起こしを開く", availableWhen: ["I7"] },
    E32: { label: "表示名が本文には存在しない差分", medium: "system", claims: ["I8"], sources: ["Files / identity_diff.txt"], action: "三アプリの表示差分を開く", availableWhen: ["I7"] }
  };

  const claims = {
    I1: {
      stage: "人物記録の照合", world: 2, min: 3, dependency: null,
      currentObjective: "藤崎千尋が実在したことを、別の運営主体や私的記録で確認する。",
      observationDirection: "同じ人物を、異なる組織と私的な記録の両方で確認してください。",
      evidenceIds: ["E01", "E02", "E03", "E04", "E05"],
      question: "市、大学、私信、記事、音声に残る記録は、同じ人物を指しているか。",
      options: [
        { id: "coincidence", label: "同姓同名の別人が混在している" },
        { id: "supported", label: "生活圏をまたいで同じ人物が記録されている" },
        { id: "fabricated", label: "端末内だけで作られた架空人物である" }
      ],
      result: "複数の生活圏にいた同一人物として関連付けた。",
      hints: ["所属と私的な関係を分けて見てください。", "公的記録と個人の会話を一件ずつ選びます。", "市または大学と、Link・記事・音声のいずれかを組み合わせます。"]
    },
    I2: {
      stage: "改稿経路の照合", world: 3, min: 2, dependency: "I1",
      currentObjective: "同じ人物の記録が、媒体をまたいで変化しているか確かめる。",
      observationDirection: "同じページや写真の保存版と現在版、削除後に残った周辺情報を比べてください。",
      evidenceIds: ["E06", "E07", "E08", "E09"],
      question: "別々の媒体で起きた変更は、独立した削除として説明できるか。",
      options: [
        { id: "maintenance", label: "各運営者の通常メンテナンスである" },
        { id: "supported", label: "同じ人物参照を対象に連動した変更である" },
        { id: "single-site", label: "大学の目録だけが壊れている" }
      ],
      result: "複数媒体の変更を同じ参照処理として関連付けた。",
      hints: ["文章だけでなく人数や返信を比べます。", "一つは写真、もう一つは文章またはSNSを選びます。", "大学の二版と、ニュース訂正またはRippleの残り方を比べます。"]
    },
    I3: {
      stage: "制度目的の照合", world: 4, min: 2, dependency: "I2",
      currentObjective: "公開情報を減らす制度が、何のために始まったのか整理する。",
      observationDirection: "制度を説明する側と、申請した側の資料を分けて確認してください。",
      evidenceIds: ["E10", "E11", "E12", "E13"],
      question: "公開情報を減らす制度は、最初から記録隠しだけを目的にしていたか。",
      options: [
        { id: "coverup", label: "最初から不祥事隠しのために作られた" },
        { id: "supported", label: "危険から離れる人を守る必要から始まった" },
        { id: "advertising", label: "支援団体の広報企画にすぎない" }
      ],
      result: "制度には実際の保護目的があったと整理した。",
      hints: ["理念より、申請できる範囲を確認します。", "制度側と申請者側の資料を一件ずつ選びます。", "支援室または市規程と、申請控えを比べます。"]
    },
    I4: {
      stage: "同意範囲の照合", world: 5, min: 3, dependency: "I3",
      currentObjective: "申請された範囲と、実際に処理された範囲を比べる。",
      observationDirection: "本人が指定した対象外の情報と、運用記録に現れる対象を照合してください。",
      evidenceIds: ["E11", "E14", "E15", "E16", "E17"],
      question: "実際の処理は、本人が申請した公開範囲に収まっているか。",
      options: [
        { id: "within", label: "申請された三項目の範囲に収まる" },
        { id: "supported", label: "知人の応答や先行対象まで処理を広げている" },
        { id: "unknown", label: "契約資料だけでは処理範囲を判断できない" }
      ],
      result: "本人同意を越えた関係参照処理として分類した。",
      hints: ["申請書の対象外欄が基準です。", "申請、契約、実ログを異なる媒体から選びます。", "E11と、中継ログ・技術警告・先行キャッシュの二件を合わせます。"]
    },
    I5: {
      stage: "関係参照の照合", world: 6, min: 2, dependency: "I4",
      currentObjective: "補正が公開ページ以外の人間関係にも及ぶか確かめる。",
      observationDirection: "本文が消えた後も、返信、通知、連絡経路に残る参照を確認してください。",
      evidenceIds: ["E17", "E18", "E19", "E20"],
      question: "補正対象は公開ページだけか、それとも人間関係にも及ぶか。",
      options: [
        { id: "pages", label: "公開Webページだけが対象である" },
        { id: "supported", label: "返信、通知、連絡経路まで同じ参照表で処理される" },
        { id: "device", label: "この中古PCの表示不良だけである" }
      ],
      result: "人間関係と連絡経路も補正対象として関連付けた。",
      hints: ["本文が消えても周囲に残るものがあります。", "私信・通知と、企業または先行対象の記録を比べます。", "LinkまたはRippleと、FAQ旧版か新堂里緒の保存版を選びます。"]
    },
    I6: {
      stage: "応答音声の照合", world: 6, min: 2, dependency: "I5",
      currentObjective: "現在の応答を、その人の自由な証言として扱えるか判断する。",
      observationDirection: "保存された応答と現在の応答を、言葉だけでなく間や訂正の位置まで比べてください。",
      evidenceIds: ["E21", "E22", "E23", "E24"],
      question: "現在の応答を、その人の自由な証言だけとして扱えるか。",
      options: [
        { id: "memory", label: "全員が偶然に同じ忘れ方をした" },
        { id: "supported", label: "少なくとも一部に中継・誘導・合成の影響がある" },
        { id: "recording", label: "古い録音だけが誤っている" }
      ],
      result: "現在の応答には自由証言以外の処理が混じると分類した。",
      hints: ["内容だけでなく間と訂正の位置を比べます。", "保存通話の組と、Linkまたは運用記録を合わせます。", "二本を確認したE21/E22のどちらかと、異媒体のE24を選びます。"]
    },
    I7: {
      stage: "端末経路の照合", world: 7, min: 2, dependency: "I6",
      currentObjective: "この中古PCが、どのような意図で残されたのか整理する。",
      observationDirection: "端末の処分理由と、保存設定や過去所有者の記録を別媒体で確認してください。",
      evidenceIds: ["E25", "E26", "E27", "E28"],
      question: "このPCは偶然中古市場へ流れたのか。",
      options: [
        { id: "accident", label: "廃棄区分の入力ミスで流通した" },
        { id: "supported", label: "調査できる一台として意図的に残された" },
        { id: "seller", label: "販売者が後から資料を追加した" }
      ],
      result: "端末は次の調査者へ渡す意図を持って残されたと整理した。",
      hints: ["処分理由と保存設定を分けて見ます。", "メールまたはメモと、設定・所有者記録を合わせます。", "処分区分/未送信メモと、cache_policy/ownersを比べます。"]
    },
    I8: {
      stage: "現在参照の照合", world: 8, min: 2, dependency: "I7",
      currentObjective: "このPCと現在の利用者が、どのように接続されたか確かめる。",
      observationDirection: "現在セッションの表示名が、どの記録に現れ、どこには存在しないか比べてください。",
      evidenceIds: ["E29", "E30", "E31", "E32"],
      question: "このPCは過去を保存するだけで、現在の利用者とは無関係か。",
      options: [
        { id: "archive", label: "過去資料だけを読むオフラインアーカイブである" },
        { id: "supported", label: "調べた利用者を次の参照元として登録している" },
        { id: "telemetry", label: "実端末情報を外部へ送信している" }
      ],
      result: "現在のローカル表示名が新しい参照元に使われていると整理した。",
      hints: ["画面にある名前が、どこから来たかを確認します。", "現在セッションと過去所有者の境界を比べます。", "現在ログ/参照者表示と、最終音声または三アプリ差分を選びます。"]
    }
  };

  const worlds = [
    { id: "W0", title: "未起動", trigger: "保存状態なし" },
    { id: "W1", title: "一件だけの履歴", trigger: "ローカルセッション開始" },
    { id: "W2", title: "普通にいた人", trigger: "I1成立" },
    { id: "W3", title: "書き直された昨日", trigger: "I2成立" },
    { id: "W4", title: "保護制度", trigger: "I3成立" },
    { id: "W5", title: "同意範囲の外", trigger: "I4成立" },
    { id: "W6", title: "答える声", trigger: "I5/I6成立" },
    { id: "W7", title: "残された端末", trigger: "I7成立" },
    { id: "W8", title: "最後の参照者", trigger: "I8成立" }
  ];

  const endings = {
    A: { title: "実名公開", operation: "全資料の束を公開領域へ移し、3秒保持", summary: "記録を戻す代わりに個人を再び照合可能にする。" },
    B: { title: "匿名分散", operation: "三つの公開先へ順に移し、最後を2秒保持", summary: "制度の出来事だけを残し、人物の復帰を断念する。" },
    C: { title: "全削除", operation: "表示文言を入力し、削除領域で2秒保持", summary: "整合性と引き換えに唯一の参照を失う。" }
  };

  global.VDM_CASE_REGISTRY = { schemaVersion: 2, evidence, claims, worlds, endings };
})(window);
