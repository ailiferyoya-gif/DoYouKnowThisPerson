(function(){
"use strict";
const A=VDMApp,root=document.getElementById("app-body"),sites=A.read("sites",{});A.frame(A.brand.name,A.brand.description);document.querySelector(".app-mark").textContent=A.brand.icon||"";
const initial={id:"t1",title:"新しいタブ",history:[],cursor:-1,sessionId:"b"+Date.now().toString(36)};
const S=A.appState({tabs:[initial],active:"t1"});let tabs=Array.isArray(S.tabs)&&S.tabs.length?S.tabs:[initial],active=S.active||tabs[0].id,scrollSaveTimer=0,restoringScroll=false;
root.innerHTML='<section class="browser"><header class="browser-chrome"><div class="tab-strip"></div><div class="browser-row"><button class="icon-button" data-back aria-label="戻る">←</button><button class="icon-button" data-forward aria-label="進む">→</button><button class="icon-button" data-reload aria-label="再読み込み">↻</button><form class="browser-row" data-address-form><input class="address" name="address" aria-label="アドレス"><button class="primary">移動</button></form><button class="icon-button" data-new aria-label="新しいタブ">＋</button></div></header><div class="browser-page" data-page></div></section>';
const page=root.querySelector("[data-page]"),address=root.querySelector(".address");
function tab(){return tabs.find(x=>x.id===active)||tabs[0];}function save(){A.saveAppState({tabs,active});}
function routeParts(route){try{const u=new URL(route.includes("://")?route:"vdm://"+route);return{query:u.search.slice(1),fragment:u.hash.slice(1),host:u.host,path:u.pathname||"/",url:u};}catch(_){return{query:"",fragment:"",host:"",path:"/",url:null};}}
function worldStamp(){const s=A.state?.get?.()||{};return{worldVersion:s.worldVersion??s.world?.version??s.schemaVersion??0,pageVersion:s.pageVersion??s.world?.pageVersion??0};}
function resolve(route,meta){const safe=String(route||"vdm://home"),parts=routeParts(safe),stamp=worldStamp();if(safe==="vdm://home"||safe==="about:blank")return{url:safe,query:parts.query,fragment:parts.fragment,worldVersion:stamp.worldVersion,pageVersion:meta?.pageVersion??stamp.pageVersion,sessionId:meta?.sessionId||tab().sessionId,title:"新しいタブ",kind:"home",snapshot:null,at:Date.now()};const site=sites[parts.host],base=site?.pages?.[parts.path]||site?.pages?.["/404"];if(!site||!base)return{url:safe,query:parts.query,fragment:parts.fragment,worldVersion:stamp.worldVersion,pageVersion:stamp.pageVersion,sessionId:meta?.sessionId||tab().sessionId,title:"接続できません",kind:"error",snapshot:null,at:Date.now()};const state=A.state?.get?.()||{},eligible=(base.versions||[base]).filter(v=>(!v.availableWhen||A.state.hasEvidence(v.availableWhen))&&(!v.protectUntilSeen||A.state.hasEvidence(v.protectUntilSeen)||!v.availableWhen)),version=(state.ending==="A"?eligible.at(0):eligible.at(-1))||base;return{url:safe,query:parts.query,fragment:parts.fragment,host:parts.host,worldVersion:stamp.worldVersion,pageVersion:version.version??meta?.pageVersion??stamp.pageVersion,sessionId:meta?.sessionId||tab().sessionId,title:version.title||site.name,kind:version.status==="deleted"||version.status===404?"deleted":"site",preset:site.preset,site:JSON.parse(JSON.stringify(site)),snapshot:JSON.parse(JSON.stringify(version)),at:Date.now()};}
function captureScroll(){const entry=current();if(entry)entry.scrollTop=Math.max(0,Number(page.scrollTop)||0);}
function push(route,meta){captureScroll();const t=tab(),entry=resolve(route,meta);entry.scrollTop=0;t.history=t.history.slice(0,t.cursor+1);t.history.push(entry);t.cursor=t.history.length-1;t.sessionId=entry.sessionId;t.title=entry.title;save();renderEntry(entry);emitRoute("push",entry);return entry;}
function openArchive(archiveKey){
  if(A.state?.get?.().ending==="C")return null;
  const archived=A.state?.get?.().snapshots?.[archiveKey];
  if(!archived)return null;
  const parts=routeParts(archived.url),site=sites[parts.host];
  if(!site)return null;
  captureScroll();
  const t=tab(),entry={url:archived.url,query:parts.query,fragment:parts.fragment,host:parts.host,worldVersion:worldStamp().worldVersion,pageVersion:archived.version,sessionId:t.sessionId,title:"保存版｜"+(archived.content?.title||site.name),kind:"archive",preset:site.preset,site:JSON.parse(JSON.stringify(site)),snapshot:JSON.parse(JSON.stringify(archived.content)),archiveKey,capturedAt:archived.capturedAt,scrollTop:0,at:Date.now()};
  t.history=t.history.slice(0,t.cursor+1);t.history.push(entry);t.cursor=t.history.length-1;t.title=entry.title;save();renderEntry(entry);emitRoute("archive",entry);return entry;
}
function replaceCurrent(route,meta){captureScroll();const t=tab(),previous=t.history[t.cursor],entry=resolve(route,meta);entry.scrollTop=Number(previous?.scrollTop)||0;if(t.cursor<0){t.history=[entry];t.cursor=0;}else t.history[t.cursor]=entry;t.sessionId=entry.sessionId;t.title=entry.title;save();renderEntry(entry);emitRoute("reload",entry);return entry;}
function current(){const t=tab();return t.history[t.cursor]||null;}function emitRoute(action,entry){A.emit("browser:route",{action,tabId:tab().id,cursor:tab().cursor,entry});}
function drawTabs(){root.querySelector(".tab-strip").innerHTML=tabs.map(t=>'<button class="tab '+(t.id===active?"active":"")+'" data-tab="'+t.id+'">'+A.esc(t.title||"新しいタブ")+'</button>').join("");root.querySelectorAll("[data-tab]").forEach(b=>b.onclick=()=>{captureScroll();active=b.dataset.tab;save();const entry=current();entry?renderEntry(entry):push("vdm://home");});}
function home(){page.innerHTML='<div class="browser-error"><h1>'+A.esc(A.brand.name)+'</h1><p>アドレスを入力するか、Searchから結果を開いてください。</p><button class="primary" data-search>Searchを開く</button></div>';page.querySelector("[data-search]").onclick=()=>A.openApp("search");}
function bindPage(){page.querySelectorAll("[data-route]").forEach(el=>el.addEventListener("click",e=>{e.preventDefault();push(el.dataset.route);}));page.querySelectorAll("form[data-route-form]").forEach(f=>f.onsubmit=e=>{e.preventDefault();const params=new URLSearchParams(new FormData(f));push(f.dataset.routeForm+(params.toString()?"?"+params:""));});page.querySelectorAll("[data-evidence-id]").forEach(button=>button.addEventListener("click",()=>{const detail=button.nextElementSibling;if(detail){detail.textContent=button.dataset.evidenceDetail||"保存された詳細を確認しました。";detail.hidden=false;}A.state?.observeEvidence?.(button.dataset.evidenceId,{medium:button.dataset.evidenceMedium||"browser",action:"inspect-detail",route:current()?.url});button.disabled=true;button.textContent="確認済み";}));window.VDMSiteInteractions?.bind(page,{navigate:route=>push(route),appState:S,save});}
function renderEntry(entry){restoringScroll=true;const desiredScroll=Math.max(0,Number(entry.scrollTop)||0);page.scrollTop=0;address.value=entry.url;if(A.state?.get?.().ending==="C"&&entry.kind==="archive")page.innerHTML='<div class="browser-error"><h2>保存版は削除されました</h2><p>現在のページ以外に、調査中に確保した版は残っていません。</p></div>';else if(entry.kind==="home")home();else if(entry.kind==="error")page.innerHTML='<div class="browser-error"><h2>ページを表示できません</h2><p>このアドレスは端末内に保存されていません。</p><button class="ghost" data-home>ホームへ</button></div>',page.querySelector("[data-home]").onclick=()=>push("vdm://home");else{const entryHost=entry.host||routeParts(entry.url).host;const renderer=VDM_SITE_RENDERERS[entryHost]||VDM_SITE_RENDERERS[entry.preset];page.innerHTML=renderer?renderer(entry.site,entry.snapshot,{route:entry.url,query:new URLSearchParams(entry.query),notFound:entry.kind==="deleted"}):'<div class="browser-error"><h2>'+A.esc(entry.title)+'</h2></div>';if(entry.kind==="archive")page.insertAdjacentHTML("afterbegin",'<aside class="archive-view-banner" role="status"><strong>ローカル保存版</strong><time>'+A.esc(entry.capturedAt||"")+'</time></aside>');if(entry.kind==="site"){A.state?.archive?.(entry.url,entry.pageVersion,entry.snapshot);VDMEvidence.observe(entry.snapshot,"open-page");}bindPage();}requestAnimationFrame(()=>{if(entry.fragment){const target=page.querySelector("#"+CSS.escape(entry.fragment));target?.scrollIntoView();entry.scrollTop=page.scrollTop;}else page.scrollTop=desiredScroll;setTimeout(()=>{restoringScroll=false;},0);});tab().title=entry.title;drawTabs();save();}
page.addEventListener("scroll",()=>{if(restoringScroll)return;captureScroll();clearTimeout(scrollSaveTimer);scrollSaveTimer=setTimeout(save,140);},{passive:true});
root.querySelector("[data-address-form]").onsubmit=e=>{e.preventDefault();push(address.value);};root.querySelector("[data-back]").onclick=()=>{captureScroll();const t=tab();if(t.cursor>0)t.cursor-=1;const entry=current();save();if(entry){renderEntry(entry);emitRoute("back",entry);}};root.querySelector("[data-forward]").onclick=()=>{captureScroll();const t=tab();if(t.cursor+1<t.history.length)t.cursor+=1;const entry=current();save();if(entry){renderEntry(entry);emitRoute("forward",entry);}};root.querySelector("[data-reload]").onclick=()=>{const entry=current();replaceCurrent(entry?.url||"vdm://home",{sessionId:tab().sessionId});};root.querySelector("[data-new]").onclick=()=>{captureScroll();const id="t"+Date.now().toString(36);tabs.push({id,title:"新しいタブ",history:[],cursor:-1,sessionId:"b"+Date.now().toString(36)});active=id;save();push("vdm://home");};
window.addEventListener("message",e=>{if(e.data?.type==="VDM_ROUTE")push(e.data.route,e.data);});window.addEventListener("vdm-open-payload",e=>{if(e.detail?.archiveKey)openArchive(e.detail.archiveKey);else if(e.detail?.route)push(e.detail.route,e.detail);});
function bindStructuredEvidence(){
  const snapshot=current()?.snapshot||{};
  const addControl=(record,item,label)=>{
    if(!item?.evidenceId||record.querySelector('[data-structured-evidence="'+CSS.escape(item.evidenceId)+'"]'))return;
    const button=document.createElement("button"),detail=document.createElement("p");
    button.type="button";button.className="ghost";button.textContent=label;button.dataset.structuredEvidence=item.evidenceId;
    detail.className="evidence-detail";detail.hidden=true;
    button.addEventListener("click",()=>{
      detail.textContent=item.detail||item.description||item.text||"保存情報を確認しました。";detail.hidden=false;
      A.state?.observeEvidence?.(item.evidenceId,{medium:item.medium||"browser",action:"inspect-detail",route:current()?.url});
      button.disabled=true;button.textContent="確認済み";
    });
    record.append(button,detail);
  };
  page.querySelectorAll("[data-archive-record]").forEach(record=>{
    const item=(snapshot.records||[]).find(value=>String(value.id)===String(record.dataset.archiveRecord));
    addControl(record,item,"保存情報を確認");
  });
  page.querySelectorAll(".thread-list > li").forEach(record=>{
    const number=String(record.querySelector(".post-number")?.textContent||"").replace("#","").trim();
    const item=(snapshot.threads||snapshot.posts||[]).find(value=>String(value.number)===number);
    addControl(record,item,"引用と保存情報を確認");
  });
}
const structuredEvidenceObserver=new MutationObserver(bindStructuredEvidence);structuredEvidenceObserver.observe(page,{childList:true,subtree:true});
if(A.state?.get?.().ending==="C"){const previous=tab(),entry=current()?resolve(current().url,{sessionId:previous.sessionId}):resolve("vdm://home",{sessionId:previous.sessionId});previous.history=[entry];previous.cursor=0;previous.title=entry.title;tabs=[previous];active=previous.id;save();}
drawTabs();current()?renderEntry(current()):push("vdm://home");
bindStructuredEvidence();
})();
