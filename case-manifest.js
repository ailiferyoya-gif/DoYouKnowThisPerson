window.CASE_MANIFEST = {
    "schemaVersion":  2,
    "projectName":  "この人を知っていますか？",
    "caseSlug":  "doyouknowthisperson",
    "mode":  "Discovery",
    "selectedApps":  [
                         "search",
                         "browser",
                         "social",
                         "line",
                         "mail",
                         "photos",
                         "audio",
                         "files",
                         "notes",
                         "settings"
                     ],
    "storageKey":  "doyouknowthisperson-case-v1",
    "appCatalog":  {
                       "search":  {
                                      "id":  "search",
                                      "label":  "Mira Search",
                                      "icon":  "app-search",
                                      "iconAsset":  "core/ui-icons.js#app-search",
                                      "entry":  "apps/search/index.html",
                                      "dependencies":  [
                                                           "browser"
                                                       ],
                                      "capabilities":  [
                                                           "interactive",
                                                           "local-state",
                                                           "evidence-hooks",
                                                           "keyboard",
                                                           "mobile",
                                                           "single-html"
                                                       ]
                                  },
                       "browser":  {
                                       "id":  "browser",
                                       "label":  "Lattice",
                                       "icon":  "app-browser",
                                       "iconAsset":  "core/ui-icons.js#app-browser",
                                       "entry":  "apps/browser/index.html",
                                       "dependencies":  [
                                                            "search"
                                                        ],
                                       "capabilities":  [
                                                            "interactive",
                                                            "local-state",
                                                            "evidence-hooks",
                                                            "keyboard",
                                                            "mobile",
                                                            "single-html"
                                                        ]
                                   },
                       "social":  {
                                      "id":  "social",
                                      "label":  "Ripple",
                                      "icon":  "app-social",
                                      "iconAsset":  "core/ui-icons.js#app-social",
                                      "entry":  "apps/social/index.html",
                                      "window":  {
                                                     "width":  1190,
                                                     "height":  740,
                                                     "minWidth":  780
                                                 },
                                      "dependencies":  [

                                                       ],
                                      "capabilities":  [
                                                           "interactive",
                                                           "local-state",
                                                           "evidence-hooks",
                                                           "keyboard",
                                                           "mobile",
                                                           "single-html"
                                                       ]
                                  },
                       "line":  {
                                    "id":  "line",
                                    "label":  "Link",
                                    "icon":  "app-line",
                                    "iconAsset":  "core/ui-icons.js#app-line",
                                    "entry":  "apps/line/index.html",
                                    "window":  {
                                                   "width":  1040,
                                                   "height":  710,
                                                   "minWidth":  760
                                               },
                                    "dependencies":  [

                                                     ],
                                    "capabilities":  [
                                                         "interactive",
                                                         "local-state",
                                                         "evidence-hooks",
                                                         "keyboard",
                                                         "mobile",
                                                         "single-html"
                                                     ]
                                },
                       "mail":  {
                                    "id":  "mail",
                                    "label":  "Postbox",
                                    "icon":  "app-mail",
                                    "iconAsset":  "core/ui-icons.js#app-mail",
                                    "entry":  "apps/mail/index.html",
                                    "dependencies":  [

                                                     ],
                                    "capabilities":  [
                                                         "interactive",
                                                         "local-state",
                                                         "evidence-hooks",
                                                         "keyboard",
                                                         "mobile",
                                                         "single-html"
                                                     ]
                                },
                       "photos":  {
                                      "id":  "photos",
                                      "label":  "Photos",
                                      "icon":  "app-photos",
                                      "iconAsset":  "core/ui-icons.js#app-photos",
                                      "entry":  "apps/photos/index.html",
                                      "dependencies":  [

                                                       ],
                                      "capabilities":  [
                                                           "interactive",
                                                           "local-state",
                                                           "evidence-hooks",
                                                           "keyboard",
                                                           "mobile",
                                                           "single-html"
                                                       ]
                                  },
                       "audio":  {
                                     "id":  "audio",
                                     "label":  "Audio",
                                     "icon":  "app-audio",
                                     "iconAsset":  "core/ui-icons.js#app-audio",
                                     "entry":  "apps/audio/index.html",
                                     "dependencies":  [

                                                      ],
                                     "capabilities":  [
                                                          "interactive",
                                                          "local-state",
                                                          "evidence-hooks",
                                                          "keyboard",
                                                          "mobile",
                                                          "single-html"
                                                      ]
                                 },
                       "files":  {
                                     "id":  "files",
                                     "label":  "Files",
                                     "icon":  "app-files",
                                     "iconAsset":  "core/ui-icons.js#app-files",
                                     "entry":  "apps/files/index.html",
                                     "dependencies":  [

                                                      ],
                                     "capabilities":  [
                                                          "interactive",
                                                          "local-state",
                                                          "evidence-hooks",
                                                          "keyboard",
                                                          "mobile",
                                                          "single-html"
                                                      ]
                                 },
                       "notes":  {
                                     "id":  "notes",
                                     "label":  "Notes",
                                     "icon":  "app-notes",
                                     "iconAsset":  "core/ui-icons.js#app-notes",
                                     "entry":  "apps/notes/index.html",
                                     "dependencies":  [

                                                      ],
                                     "capabilities":  [
                                                          "interactive",
                                                          "local-state",
                                                          "evidence-hooks",
                                                          "keyboard",
                                                          "mobile",
                                                          "single-html"
                                                      ]
                                 },
                       "settings":  {
                                        "id":  "settings",
                                        "label":  "Settings",
                                        "icon":  "app-settings",
                                        "iconAsset":  "core/ui-icons.js#app-settings",
                                        "entry":  "apps/settings/index.html",
                                        "dependencies":  [

                                                         ],
                                        "capabilities":  [
                                                             "interactive",
                                                             "local-state",
                                                             "evidence-hooks",
                                                             "keyboard",
                                                             "mobile",
                                                             "single-html"
                                                         ]
                                    }
                   },
    "dependencies":  {
                         "search":  [
                                        "browser"
                                    ],
                         "browser":  [
                                         "search"
                                     ]
                     },
    "features":  {
                     "generatedImages":  true,
                     "audioMode":  "On",
                     "audio":  true,
                     "video":  false,
                     "fictionalSites":  true,
                     "richSites":  true,
                     "interactiveMessaging":  true,
                     "localCalls":  true,
                     "searchSessions":  true,
                     "pageVersioning":  true,
                     "templateV2Smoke":  false
                 },
    "templateVersion":  "2.2.0",
    "version":  "1.0.0",
    "distributionMode":  "SingleHTML"
};
