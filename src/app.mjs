import {parseTable,inferColumns,recommendCharts,evaluateChartCandidates,chooseEncoding} from "./engine.mjs";
import {renderDataChart} from "./chart.mjs";
const $ = id => document.getElementById(id);
const state = {catalog:[],families:[],rows:[],columns:[],recommendations:[],audit:[],selected:null,family:"All",query:""};
const SAMPLE = "Month,Hydro_MWh,Wind_MWh,Solar_MWh\n2026-01,80,42,17\n2026-02,84,46,20\n2026-03,79,51,29\n2026-04,89,55,34\n2026-05,94,57,40\n2026-06,91,62,47\n2026-07,102,71,51\n2026-08,106,69,55\n2026-09,100,75,48\n2026-10,112,81,43\n";
function make(tag, cls, text) {
  const el=document.createElement(tag);
  if(cls)el.className=cls;
  if(text!==undefined)el.textContent=String(text);
  return el;
}
function setNotice(id,msg){
  const el=$(id);el.textContent=msg||"";el.hidden=!msg;
}
function clearNotices(){setNotice("inputError","");setNotice("inputSuccess","");setNotice("renderError","");}
function imageUrl(chart){return "./"+chart.illustration.replace(/^\/+/,"");}
function profileUi() {
  const holder=$("profileChips");holder.replaceChildren();
  state.columns.forEach(col=>{
    const chip=make("span","chip",col.name+" ");
    chip.append(make("b","",col.type));
    holder.append(chip);
  });
  const missing=state.columns.reduce((n,c)=>n+c.missing,0);
  $("profileStats").textContent=state.rows.length.toLocaleString()+" rows · "+state.columns.length+" columns · "+missing+" missing cells · Types inferred from nonempty values";
  $("profile").hidden=false;
}
function selectOptions(el, value, includeBlank=false) {
  el.replaceChildren();
  if(includeBlank){const option=make("option","", "None");option.value="";el.append(option);}
  state.columns.forEach(col=>{
    const option=make("option","",col.name+" ("+col.type+")");
    option.value=col.name;
    el.append(option);
  });
  if (value && state.columns.some(col=>col.name===value)) el.value=value;
  else if(includeBlank) el.value="";
}
function getEnc(){return {x:$("xSelect").value,y:$("ySelect").value,z:$("zSelect").value};}
function updateEncoding(type) {
  const enc=chooseEncoding(state.columns,type);
  selectOptions($("xSelect"),enc.x);
  selectOptions($("ySelect"),enc.y);
  selectOptions($("zSelect"),enc.z,true);
}
function chartNote(){
  const selection=state.selected;
  return selection ? selection.caution+" Values are data-driven. Check source, units, and whether observations are estimates or forecasts." : "";
}
function updatePreview() {
  if(!state.selected||!state.rows.length||!state.selected.autoRenderable)return;
  setNotice("renderError","");
  const chartTitle=$("chartTitle").value.trim() || state.selected.name;
  const unit=$("unitInput").value.trim();
  const source=$("sourceInput").value.trim();
  try{
    renderDataChart($("chartFrame"),state.rows,state.selected.id,getEnc(),{
      title:chartTitle,unit,sort:true,orientation:$("orientationSelect").value,
      subtitle:source ? "Source: "+source.slice(0,95) : "SmartChart · Data from user-supplied table"
    });
    $("downloadBtn").disabled=false;
    $("previewNote").textContent=chartNote()+(source?" Source: "+source+".":" No source specified.");
  }catch(error){
    $("chartFrame").replaceChildren();
    setNotice("renderError",error.message);
    $("downloadBtn").disabled=true;
  }
}
function chooseChart(chart){
  if(!chart.autoRenderable){openDetails(chart);return;}
  state.selected=chart;
  $("orientationSelect").value=chart.orientation || "vertical";
  $("previewSection").hidden=false;
  $("chartTitle").value=chart.name;
  updateEncoding(chart.id);
  updatePreview();
  renderRecommendations();
}
function renderRecommendations(){
  const container=$("recommendations");
  container.replaceChildren();
  $("emptyRecommendations").hidden=state.recommendations.length>0;
  container.hidden=state.recommendations.length===0;
  if(!state.recommendations.length){
    $("emptyRecommendations").querySelector("strong").textContent="No suitable chart detected";
    $("emptyRecommendations").querySelector("p").textContent="Try a table with numbers and category labels, or a numeric time series.";
    return;
  }
  state.recommendations.slice(0,8).forEach((chart,i)=>{
    const card=make("button","rec"+(state.selected?.id===chart.id?" active":""));
    card.type="button";
    card.setAttribute("aria-label","Select "+chart.name);
    const art=make("span","mini-art"),pic=make("img");
    pic.src=imageUrl(chart);pic.alt="Illustrative "+chart.name+" example";pic.loading="lazy";art.append(pic);
    const body=make("span");
    const head=make("span","rec-head");
    head.append(make("span","rec-title",(i===0?"★ ":"")+chart.name));
    head.append(make("span","rec-score",chart.family));
    body.append(head);
    body.append(make("span","rec-tag",chart.autoRenderable?"READY TO GENERATE":"ATLAS GUIDE"));
    body.append(make("p","rec-rationale",chart.rationale));
    body.append(make("p","rec-only","Historical pattern: "+(chart.historicalPattern||"unspecified")+". "+chart.sourceReferences.length+" research sources; "+(chart.orientation==="vertical"?"vertical bars preferred when applicable":"long labels may need horizontal bars")+"."));
    if(!chart.autoRenderable)body.append(make("p","rec-only","View original chart and guidance · Auto-rendering not yet supported"));
    body.append(make("p","rec-caution","Watch out: "+chart.caution));
    card.append(art,body);
    card.addEventListener("click",()=>chooseChart(chart));
    container.append(card);
  });
}
function renderAudit(){
  const holder=$("selectionAudit");
  holder.replaceChildren();
  if(!state.audit.length)return;
  const list=make("ol","evidence-list");
  state.audit.forEach(chart=>{
    const li=make("li","evidence-item");
    const status=chart.eligible?"Candidate":"Excluded";
    const b=make("strong","",chart.name+" · "+status+" · "+chart.score);
    li.append(b,make("p","",chart.gate+" "+chart.rationale));
    const sources=make("p","evidence-sources","Source-backed method: ");
    chart.sourceReferences.forEach((source,i)=>{
      const a=make("a","",source.title || "Research source "+(i+1));
      if(!/^https:\/\//.test(source.url))return;
      a.href=source.url;a.target="_blank";a.rel="noopener noreferrer";
      sources.append(a);
      if(i<chart.sourceReferences.length-1)sources.append(document.createTextNode(" · "));
    });
    if(!chart.sourceReferences.length)sources.append(document.createTextNode("none — not eligible"));
    li.append(sources);
    list.append(li);
  });
  holder.append(list);
}
function rerank(){
  if(!state.rows.length)return;
  state.audit=evaluateChartCandidates(state.columns,state.rows,state.catalog,$("goalSelect").value);
  state.recommendations=recommendCharts(state.columns,state.rows,state.catalog,$("goalSelect").value);
  renderRecommendations();
  renderAudit();
}
function analyze(){
  clearNotices();
  try{
    const {rows}=parseTable($("dataInput").value);
    state.rows=rows;state.columns=inferColumns(rows);
    profileUi();rerank();
    const first=state.recommendations.find(x=>x.autoRenderable);
    if(first)chooseChart(first);
    else{$("previewSection").hidden=true;state.selected=null;}
    setNotice("inputSuccess","Analyzed "+rows.length+" rows. Recommendations below use your actual table structure.");
  }catch(error){
    state.rows=[];state.columns=[];state.selected=null;
    $("profile").hidden=true;$("previewSection").hidden=true;
    $("recommendations").hidden=true;$("emptyRecommendations").hidden=false;
    setNotice("inputError",error.message);
  }
}
function openDetails(chart){
  const body=$("atlasDialogBody");body.replaceChildren();
  body.append(make("span","step",chart.family));
  body.append(make("h2","dialog-title",chart.name));
  const artwork=make("div","dialog-art"),pic=make("img");
  pic.src=imageUrl(chart);pic.alt="Schematic "+chart.name;artwork.append(pic);body.append(artwork);
  for(const [name,text] of [["Best for",chart.bestFor],["Historical mathematical use",chart.textbook?.history||"No history recorded"],["How it encodes data",chart.textbook?.mathematics||"No method recorded"],["Data requirements",chart.textbook?.dataRequirements||chart.bestFor],["Modern interpretation",chart.textbook?.modernInterpretation||""],["Compare alternatives",chart.textbook?.chartComparison||""],["Editorial example",chart.editorialExample],["Caution",chart.caution]]){
    const p=make("p","dialog-text");const strong=make("strong","",name+": ");p.append(strong,document.createTextNode(text));body.append(p);
  }
  body.append(make("p","dialog-text",chart.autoRenderable?"This format can be generated from a compatible dataset using Chart Studio.":"This format is included in the complete Atlas, but automatic data rendering is not yet implemented."));
  const sourced=make("div","source-links");
  sourced.append(make("strong","","Historical / textbook references:"));
  for(const ref of chart.textbook?.sources || []){
    if(!/^https:\/\//.test(ref.url))continue;
    const p=make("p","dialog-text");
    const a=make("a","",ref.title||ref.url);
    a.href=ref.url;a.target="_blank";a.rel="noopener noreferrer";
    p.append(a);sourced.append(p);
  }
  body.append(sourced);
  if(chart.autoRenderable && state.rows.length){
    const btn=make("button","btn primary","Use with my data");
    btn.type="button";btn.addEventListener("click",()=>{$("atlasDialog").close();chooseChart(chart);$("previewSection").scrollIntoView({behavior:"smooth",block:"start"});});
    body.append(btn);
  }
  const dialog=$("atlasDialog");
  if(!dialog.open)dialog.showModal();
}
function filteredAtlas(){
  return state.catalog.filter(chart=>(state.family==="All"||chart.family===state.family)&&[chart.name,chart.bestFor,chart.editorialExample,chart.family].join(" ").toLowerCase().includes(state.query));
}
function renderAtlas(){
  const data=filteredAtlas();
  $("atlasCount").textContent=data.length+" of "+state.catalog.length+" chart types · Illustrations are synthetic";
  const grid=$("atlasGrid");grid.replaceChildren();
  data.forEach(chart=>{
    const tile=make("button","atlas-tile");tile.type="button";
    const art=make("span","art");const pic=make("img");pic.src=imageUrl(chart);pic.alt="Illustrative "+chart.name;pic.loading="lazy";art.append(pic);
    tile.append(art,make("span","family",chart.family),make("strong","",chart.name),make("span","use",chart.bestFor));
    tile.append(make("span","mode",chart.autoRenderable?"● Data chart supported":"○ Reference only"));
    tile.addEventListener("click",()=>openDetails(chart));grid.append(tile);
  });
}
function filters(){
  const bar=$("familyFilters");bar.replaceChildren();
  ["All",...state.families].forEach(family=>{
    const btn=make("button","filter"+(state.family===family?" active":""),family);btn.type="button";
    btn.setAttribute("aria-pressed",String(state.family===family));
    btn.addEventListener("click",()=>{state.family=family;filters();renderAtlas();});
    bar.append(btn);
  });
}
function download(){
  const chart=$("chartFrame").querySelector("svg");
  if(!chart)return;
  const xml=new XMLSerializer().serializeToString(chart);
  const blob=new Blob([xml],{type:"image/svg+xml;charset=utf-8"});
  const url=URL.createObjectURL(blob);
  const a=document.createElement("a");a.href=url;
  a.download="smartchart-"+(state.selected?.id||"chart")+".svg";
  document.body.append(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}
async function init(){
  $("analyzeBtn").addEventListener("click",analyze);
  $("sampleBtn").addEventListener("click",()=>{ $("dataInput").value=SAMPLE; analyze(); $("chartTitle").value="Synthetic energy generation trends (demo)"; $("sourceInput").value="Synthetic demonstration data — not actual measurements"; updatePreview(); setNotice("inputSuccess","Sample loaded: these figures are synthetic illustrations, not measured energy production."); });
  $("uploadInput").addEventListener("change",async e=>{
    const file=e.target.files?.[0];if(!file)return;
    if(file.size>1200000){setNotice("inputError","Choose a file smaller than 1.2 MB.");return;}
    try{$("dataInput").value=await file.text();analyze();}
    catch{setNotice("inputError","Could not read the selected file.");}
    e.target.value="";
  });
  $("goalSelect").addEventListener("change",rerank);
  ["xSelect","ySelect","zSelect","chartTitle","unitInput","sourceInput","orientationSelect"].forEach(id=>$(id).addEventListener("change",updatePreview));
  $("refreshBtn").addEventListener("click",updatePreview);
  $("downloadBtn").addEventListener("click",download);
  $("atlasSearch").addEventListener("input",e=>{state.query=e.target.value.toLowerCase();renderAtlas();});
  $("closeDialog").addEventListener("click",()=>$("atlasDialog").close());
  $("atlasDialog").addEventListener("click",e=>{if(e.target===$("atlasDialog"))$("atlasDialog").close();});
  try{
    const response=await fetch("./atlas/catalog.json",{cache:"no-cache"});
    if(!response.ok)throw new Error("HTTP "+response.status);
    const atlas=await response.json();
    if(atlas.charts?.length!==40)throw new Error("Incomplete Chart Atlas catalog.");
    state.catalog=atlas.charts;state.families=atlas.families;
    filters();renderAtlas();
  }catch(error){
    $("atlasCount").textContent="Could not load the local Chart Atlas ("+error.message+").";
    setNotice("inputError","The chart catalog could not be loaded. Serve this directory through HTTP, not file://.");
  }
}
init();
