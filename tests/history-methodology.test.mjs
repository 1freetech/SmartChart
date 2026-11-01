import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {parseTable,inferColumns,evaluateChartCandidates,recommendCharts} from "../src/engine.mjs";
import {historicalSignatureMatch} from "../src/history-methodology.mjs";

const atlas=JSON.parse(readFileSync(new URL("../atlas/catalog.json",import.meta.url),"utf8"));
const rowsFrom=text=>parseTable(text).rows;
const chart=id=>atlas.charts.find(x=>x.id===id);
const match=(id,text)=>{const rows=rowsFrom(text);return historicalSignatureMatch(chart(id),inferColumns(rows),rows);};
const candidates=(value,goal="auto")=>{const rows=rowsFrom(value);return evaluateChartCandidates(inferColumns(rows),rows,atlas.charts,goal);};

test("all 40 types have six encyclopedia sentences, references and signatures",()=>{
  assert.equal(atlas.charts.length,40);
  for(const item of atlas.charts){
    assert.ok(item.historicalDataPattern,item.id+" has no pattern");
    assert.equal(item.textbook?.sources?.length,2,item.id+" has wrong source count");
    const keys=["history","mathematics","dataRequirements","modernInterpretation","interpretiveRisks","chartComparison"];
    assert.ok(keys.every(key=>item.textbook[key]?.length>50),item.id+" has incomplete entry");
    assert.equal(item.textbook.paragraph,keys.map(key=>item.textbook[key]).join(" "));
    assert.ok(item.textbook.sources.every(src=>/^https:\/\/[^ ]+$/.test(src.url)));
    assert.notEqual(match(item.id,"Date,State,Value\n2026-01-01,A,10\n2026-01-02,B,30").signature,"undefined");
  }
});

test("full audit includes all 40 even if excluded or not renderable",()=>{
  const audit=candidates("Project,MW\nA,100\nB,200","compare");
  assert.equal(audit.length,40);
  assert.equal(audit.find(x=>x.id==="bars").eligible,true);
  assert.equal(audit.find(x=>x.id==="sankey").eligible,false);
  assert.ok(audit.every(x=>x.gate && x.methodology && x.historicalPattern));
});

test("generic category rankings favor bars, not funnels or conserved flows",()=>{
  const audit=candidates("State,MW\nOhio,520\nTexas,980\nUtah,410","compare");
  assert.equal(audit[0].id,"bars");
  assert.equal(audit.find(x=>x.id==="sankey").eligible,false);
  assert.equal(audit.find(x=>x.id==="funnel").eligible,false);
  assert.equal(audit.find(x=>x.id==="treemap").eligible,false);
});

test("time observations prefer lines, not unverified piecewise states",()=>{
  const audit=candidates("Date,Hashrate\n2026-01-01,800\n2026-02-01,820\n2026-03-01,850","trend");
  assert.equal(audit[0].id,"line");
  assert.equal(audit.find(x=>x.id==="step").eligible,false);
});

test("candlestick validates all four OHLC fields per interval",()=>{
  const okay="Date,Open,High,Low,Close\n2026-01-01,10,15,8,12\n2026-01-02,12,17,11,16";
  const bad="Date,Open,High,Low,Close\n2026-01-01,10,7,8,12\n2026-01-02,12,17,11,16";
  assert.equal(match("candlestick",okay).eligible,true);
  assert.equal(match("candlestick",bad).eligible,false);
});

test("Sankey needs named origins and destinations",()=>{
  const flow="Source,Target,MW\nSolar,Grid,10\nWind,Grid,20\nGrid,IT,15";
  const ranked=candidates(flow,"flow");
  assert.equal(ranked.find(x=>x.id==="sankey").eligible,true);
  assert.ok(ranked.find(x=>x.id==="sankey").evidenceCautions.some(x=>/losses/.test(x)));
  assert.equal(match("sankey","Site,MW\nA,4\nB,8").eligible,false);
});

test("Gantt needs task start and end dates",()=>{
  const tasks="Task,Start,End\nDesign,2026-01-01,2026-01-05\nBuild,2026-01-05,2026-02-01";
  assert.equal(match("gantt",tasks).eligible,true);
  assert.equal(match("gantt","Year,MW\n2026-01-01,5\n2026-02-01,7").eligible,false);
});

test("control charts demand process context and a substantial sample",()=>{
  const base=["Date,CoolantTemperature"].concat(Array.from({length:18},(_,i)=>"2026-01-"+String(i+1).padStart(2,"0")+","+(50+i%3))).join("\n");
  const prices=base.replace("CoolantTemperature","BitcoinPrice");
  assert.equal(match("control",base).eligible,true);
  assert.equal(match("control",prices).eligible,false);
});

test("regional totals trigger a normalization warning",()=>{
  const counts=match("choropleth","State,Population\nTexas,30000000\nOregon,4000000");
  assert.equal(counts.eligible,true);
  assert.ok(counts.cautions.some(x=>/rate/.test(x)));
  const rates=match("choropleth","State,Incidents_per_10000\nTexas,7\nOregon,10");
  assert.equal(rates.eligible,true);
  assert.equal(rates.cautions.length,0);
});

test("radar requires normalized measures, not mixed physical units",()=>{
  assert.equal(match("radar","Device,MW,Watts,Dollars\nA,6,3400,500000\nB,8,3800,600000").eligible,false);
  assert.equal(match("radar","Device,AccuracyScore,SpeedScore,EfficiencyScore\nA,0.7,0.5,0.9\nB,0.9,0.8,0.6").eligible,true);
});

test("recommendation scores do not favor supported rendering",()=>{
  const rows=rowsFrom("Cause,Failures\nNetwork,80\nPower,30\nFans,15");
  const out=recommendCharts(inferColumns(rows),rows,atlas.charts,"compare");
  assert.ok(out.every(x=>x.sourceReferences.length>0));
  assert.equal(out.find(x=>x.id==="pareto").eligible,true);
  assert.equal(out.find(x=>x.id==="bars").historyBonus,out.find(x=>x.id==="lollipop").historyBonus);
});
