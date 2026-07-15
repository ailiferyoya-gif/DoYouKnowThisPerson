(function(){
  "use strict";
  const manifest=window.CASE_MANIFEST||{};
  const key=manifest.storageKey;
  if(!key)throw new Error("CASE_MANIFEST.storageKey is required");
  const blank=()=>({
    schemaVersion:2,setupComplete:false,worldVersion:0,pageVersion:0,
    evidence:{},claims:{},interpretations:{},snapshots:{},cachedPages:{},pageStates:{},discoveredTerms:["藤崎千尋"],
    apps:{},appState:{},search:{history:[],sessions:[]},messages:{},mail:{drafts:[],sent:[]},social:{posts:[],likes:[],bookmarks:[],following:[]},
    browser:{history:[],cursor:-1,sessionId:null},desktop:{windows:{}},settings:{},player:{displayName:""},ending:null,behavioralFlags:{},updatedAt:null
  });
  const objects=["evidence","claims","interpretations","snapshots","cachedPages","pageStates","apps","appState","search","messages","mail","social","browser","desktop","settings","player","behavioralFlags"];
  const merge=(base,input)=>{const out=Object.assign(base,input||{});objects.forEach(k=>out[k]=Object.assign(base[k]||{},input&&input[k]||{}));return out;};
  const read=()=>{try{return merge(blank(),window.SaveAdapter&&window.SaveAdapter.load()||JSON.parse(localStorage.getItem(key)||"{}"));}catch(_){return blank();}};
  let state=read();
  const clone=()=>JSON.parse(JSON.stringify(state));
  const save=(reason)=>{state.updatedAt=new Date().toISOString();if(window.SaveAdapter)window.SaveAdapter.save(state);else try{localStorage.setItem(key,JSON.stringify(state));}catch(_){}const detail=clone();detail.reason=reason||"update";window.dispatchEvent(new CustomEvent("case-state-change",{detail}));window.VDM_BUS&&window.VDM_BUS.emit("state:changed",{reason:detail.reason,state:clone()});};
  function observe(id,medium,payload){if(!id||state.evidence[id])return false;state.evidence[id]={medium:typeof medium==="string"?medium:medium&&medium.medium||"unknown",payload:payload||medium&&medium.payload||{},observedAt:new Date().toISOString()};save("evidence");window.VDM_BUS&&window.VDM_BUS.emit("evidence:observed",{evidenceId:id,medium:state.evidence[id].medium});return true;}
  window.CASE_STATE={
    get:clone,
    transact:(fn,reason)=>{const draft=clone();fn(draft);state=merge(blank(),draft);save(reason||"transaction");return clone();},
    update:(section,value,reason)=>{state[section]=Object.assign({},state[section]||{},value||{});save(reason);return clone();},
    setPlayer:name=>{state.player.displayName=String(name||"").trim().slice(0,32);save("player");},
    touchApp:id=>{state.appState[id]=Object.assign({},state.appState[id],{lastOpenedAt:new Date().toISOString()});save("app-open");},
    observe,
    observeEvidence:(id,meta)=>observe(id,meta&&meta.medium,meta),
    hasEvidence:ids=>(Array.isArray(ids)?ids:[ids]).every(id=>Boolean(state.evidence[id]||state.claims[id])),
    hasClaim:id=>Boolean(state.claims[id]),
    acceptClaim:(id,evidenceIds)=>{const items=evidenceIds.map(eid=>state.evidence[eid]).filter(Boolean);if(items.length!==evidenceIds.length||new Set(items.map(x=>x.medium)).size<2)return false;state.claims[id]={evidenceIds:evidenceIds.slice(),acceptedAt:new Date().toISOString()};state.interpretations[id]=state.claims[id];const order={I1:2,I2:3,I3:4,I4:5,I5:6,I6:6,I7:7,I8:8};state.worldVersion=Math.max(state.worldVersion||0,order[id]||0);state.pageVersion=(state.pageVersion||0)+1;save("claim");return true;},
    archive:(url,version,content)=>{state.snapshots[url+"@"+version]={url,version,content,capturedAt:new Date().toISOString()};save("archive");},
    reset:()=>{window.SaveAdapter&&window.SaveAdapter.reset();try{localStorage.removeItem(key);}catch(_){}state=blank();window.dispatchEvent(new CustomEvent("case-state-change",{detail:clone()}));}
  };
})();
