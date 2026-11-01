import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {parseTable,inferColumns,recommendCharts,chooseEncoding,numeric,dateValue} from "../src/engine.mjs";

const catalog = JSON.parse(readFileSync(new URL("../atlas/catalog.json",import.meta.url),"utf-8")).charts;
test("migration has exactly forty chart types and eight families",()=>{
  assert.equal(catalog.length,40);
  assert.equal(new Set(catalog.map(x=>x.id)).size,40);
  assert.equal(new Set(catalog.map(x=>x.family)).size,8);
  assert.ok(catalog.every(x=>x.illustration.startsWith("atlas/examples/")));
  assert.ok(catalog.every(x=>x.caution && x.bestFor));
});

test("CSV quoted commas, multiline text, and escaped double quotes",()=>{
  const data=parseTable('Name,Value,Note\n"Site, A",500,"The ""large"" site"\n"Site B",200,"One\nline later"');
  assert.equal(data.rows.length,2);
  assert.equal(data.rows[0].Name,"Site, A");
  assert.equal(data.rows[0].Note,'The "large" site');
  assert.equal(data.rows[1].Note,"One\nline later");
});

test("TSV and JSON objects can be parsed",()=>{
  assert.equal(parseTable("Site\tMW\nA\t100\nB\t90").rows[1].MW,"90");
  assert.equal(parseTable('[{"Site":"A","MW":100},{"Site":"B","MW":200}]').rows[1].MW,200);
  assert.equal(parseTable('{"rows":[{"Site":"A","MW":100}]}').rows.length,1);
});

test("input validation rejects unsafe or incomplete shapes",()=>{
  assert.throws(()=>parseTable(""),/Paste/);
  assert.throws(()=>parseTable("OnlyHeader"),/header/);
  assert.throws(()=>parseTable("{bad"),/Invalid JSON/);
  assert.throws(()=>parseTable('[{"x":2},4]'),/records/);
});

test("numeric/date parsing is strict",()=>{
  assert.equal(numeric("$1,240.50"),1240.5);
  assert.equal(numeric("(4,100)"),-4100);
  assert.equal(numeric("8.9 J/TH"),null);
  assert.equal(numeric("not-a-number"),null);
  assert.ok(dateValue("2026-11-01","Date")!==null);
  assert.equal(dateValue("2045","Watts"),null);
});

test("recommend line for dated numeric series",()=>{
  const {rows}=parseTable("Month,MW\n2026-01-01,10\n2026-02-01,16\n2026-03-01,20");
  const cols=inferColumns(rows);
  assert.equal(cols[0].type,"date");
  assert.equal(cols[1].type,"number");
  assert.equal(recommendCharts(cols,rows,catalog,"trend")[0].id,"line");
  assert.equal(chooseEncoding(cols,"line").x,"Month");
});

test("recommend bars for category comparisons",()=>{
  const {rows}=parseTable("State,MW\nTexas,1200\nOhio,300\nOregon,800");
  const cols=inferColumns(rows);
  assert.equal(recommendCharts(cols,rows,catalog,"compare")[0].id,"bars");
});

test("recommend scatter for two numeric variables when looking for a relationship",()=>{
  const {rows}=parseTable("Watts,TH\n2300,100\n2400,105\n2500,115\n2700,118");
  const cols=inferColumns(rows);
  const suggestions=recommendCharts(cols,rows,catalog,"relationship");
  assert.equal(suggestions[0].id,"scatter");
  assert.equal(chooseEncoding(cols,"scatter").y,"TH");
});

test("composition does not recommend pie with negative values",()=>{
  const {rows}=parseTable("Source,Net_MW\nHydro,50\nWind,-10\nSolar,20");
  const suggestions=recommendCharts(inferColumns(rows),rows,catalog,"composition");
  assert.ok(!suggestions.some(s=>s.id==="donut"));
});

test("missing values are counted and incomplete numerical cells do not silently become zeros",()=>{
  const {rows}=parseTable("Plant,MW\nA,100\nB,\nC,200");
  const cols=inferColumns(rows);
  assert.equal(cols[1].missing,1);
  assert.equal(cols[1].type,"number");
  assert.equal(numeric(rows[1].MW),null);
});
