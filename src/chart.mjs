import {numeric, dateValue} from "./engine.mjs";

const NS = "http://www.w3.org/2000/svg";
const COLORS = ["#3e95ff","#43d7c3","#ffbc68","#af93ff","#f2789a","#97b5e6"];
function node(parent, tag, attrs = {}, value) {
  const element = document.createElementNS(NS, tag);
  for (const [key, v] of Object.entries(attrs)) element.setAttribute(key, String(v));
  if (value !== undefined) element.textContent = String(value);
  parent.appendChild(element);
  return element;
}
function label(g, x, y, value, attrs={}) {
  return node(g, "text", {x,y,fill:"#b4c5d8","font-size":13,"font-family":"system-ui,sans-serif",...attrs}, value);
}
function line(g, x1, y1, x2, y2, stroke="#34445c", width=1) {
  node(g,"line",{x1,y1,x2,y2,stroke,"stroke-width":width});
}
function rect(g,x,y,width,height,fill,r=0) {
  return node(g,"rect",{x,y,width:Math.max(0,width),height:Math.max(0,height),fill,rx:r});
}
function pretty(n) {
  if (!Number.isFinite(n)) return "–";
  return Intl.NumberFormat("en-US",{maximumFractionDigits:2,notation:Math.abs(n)>=1000000?"compact":"standard"}).format(n);
}
function collect(rows, key) { return rows.map(r=>numeric(r[key])).filter(v=>v!==null); }
function header(svg,title,subtitle) {
  label(svg,30,36,title || "SmartChart",{"font-size":24,"font-weight":700,fill:"#eef7ff"});
  if(subtitle) label(svg,30,60,subtitle,{"font-size":12,fill:"#8195ad"});
}
function baseSvg(container,title,subtitle) {
  container.replaceChildren();
  const svg=node(container,"svg",{viewBox:"0 0 980 525",xmlns:NS,role:"img","aria-label":title || "Generated chart"});
  rect(svg,0,0,980,525,"#101b2c",12);
  header(svg,title,subtitle);
  return svg;
}
function tooltip(parent, text) { node(parent,"title",{},text); }
function range(values, includeZero=false) {
  let low=Math.min(...values), high=Math.max(...values);
  if(includeZero){low=Math.min(0,low);high=Math.max(0,high);}
  if(low===high){low-=Math.max(1,Math.abs(low)*.1);high+=Math.max(1,Math.abs(high)*.1);}
  return [low,high];
}
function axes(svg, bounds, xLabels, yRange, unit) {
  const {l,r,t,b}=bounds;
  for(let i=0;i<=4;i++){
    const v=yRange[0]+(yRange[1]-yRange[0])*(4-i)/4;
    const y=t+(b-t)*i/4;
    line(svg,l,y,r,y,"#2b3a4f");
    label(svg,l-11,y+4,pretty(v),{"text-anchor":"end","font-size":12});
  }
  if (xLabels?.length) {
    const stride=Math.max(1,Math.ceil(xLabels.length/9));
    xLabels.forEach((txt,i)=>{
      if(i%stride && i!==xLabels.length-1)return;
      const x=l+(r-l)*(xLabels.length===1?.5:i/(xLabels.length-1));
      label(svg,x,b+23,String(txt).slice(0,17),{"text-anchor":"middle","font-size":11});
    });
  }
  if(unit) label(svg,l,t-14,unit,{"font-size":12,fill:"#9fb3cf"});
}
// Vertical columns are the default for short categorical comparisons.
// Horizontal bars are reserved for crowded or genuinely long labels.
function drawVerticalBars(svg,rows,type,encoding,unit,sort=true) {
  const {x,y,z}=encoding;
  if(!x||!y)throw new Error("Choose a category and a numeric measure.");
  if(type!=="bars"&&(!z||z===y))throw new Error("Choose a second distinct measure for grouped or stacked columns.");
  let values=rows.map(row=>({name:String(row[x]??""),a:numeric(row[y]),b:numeric(row[z])}))
    .filter(d=>d.name&&d.a!==null&&(type==="bars"||d.b!==null));
  if(!values.length)throw new Error("No complete numeric rows to plot.");
  if(type==="bars"&&sort)values.sort((a,b)=>b.a-a.a);
  values=values.slice(0,12);
  if(type==="stackedBars"&&values.some(d=>d.a<0||d.b<0))
    throw new Error("Stacked columns require nonnegative additive components.");
  const l=88,r=945,t=113,b=433;
  const samples=values.flatMap(d=>type==="stackedBars"?[0,d.a+d.b]:
    type==="groupedBars"?[0,d.a,d.b]:[0,d.a]);
  const low=Math.min(...samples),high=Math.max(...samples);
  const upper=high===low?high+1:high,lower=high===low?low-1:low;
  const sy=value=>b-(value-lower)/(upper-lower)*(b-t);
  const zero=sy(0),band=(r-l)/values.length;
  for(let i=0;i<=4;i++){
    const value=lower+(upper-lower)*i/4,yy=sy(value);
    line(svg,l,yy,r,yy,"#2b3a4f");
    label(svg,l-10,yy+4,pretty(value),{"text-anchor":"end","font-size":12});
  }
  values.forEach((d,i)=>{
    const center=l+(i+.5)*band;
    const bw=Math.max(5,Math.min(46,band*.64));
    const bar=(value,start,xpos,width,color)=>{
      const y1=sy(value),y0=sy(start);
      const shape=rect(svg,xpos,Math.min(y0,y1),width,Math.abs(y0-y1),color,2);
      tooltip(shape,d.name+": "+pretty(value)+(unit?" "+unit:""));
    };
    if(type==="bars"){
      bar(d.a,0,center-bw/2,bw,COLORS[0]);
      label(svg,center,Math.min(sy(d.a),zero)-8,pretty(d.a),{"text-anchor":"middle","font-size":11});
    } else if(type==="groupedBars"){
      bar(d.a,0,center-bw/2,bw/2-2,COLORS[0]);
      bar(d.b,0,center+2,bw/2-2,COLORS[1]);
    } else {
      bar(d.a,0,center-bw/2,bw,COLORS[0]);
      bar(d.a+d.b,d.a,center-bw/2,bw,COLORS[1]);
    }
    label(svg,center,b+21,d.name.length>14?d.name.slice(0,13)+"…":d.name,
      {"text-anchor":"middle","font-size":Math.max(9,Math.min(12,band*.21))});
  });
  label(svg,l,t-15,"Value"+(unit?" ("+unit+")":""),{"font-size":12});
  if(type!=="bars"){
    rect(svg,635,76,12,12,COLORS[0],2);label(svg,652,86,y.slice(0,20),{"font-size":11});
    rect(svg,790,76,12,12,COLORS[1],2);label(svg,807,86,z.slice(0,17),{"font-size":11});
  }
}
function drawBars(svg, rows, type, encoding, unit, sort=true) {
  const x=encoding.x, y=encoding.y, z=encoding.z;
  if (!x || !y) throw new Error("Choose a category and at least one numeric measure.");
  if ((type==="groupedBars"||type==="stackedBars") && (!z||z===y)) throw new Error("Choose a second, distinct numeric measure (Z) for this chart.");
  const values=rows.map(row=>({name:String(row[x]??""),a:numeric(row[y]),b:numeric(row[z])}))
    .filter(v=>v.name && v.a!==null && (type==="bars"||v.b!==null));
  if(!values.length) throw new Error("No complete numeric rows to plot.");
  if(sort && type==="bars") values.sort((a,b)=>b.a-a.a);
  const data=values.slice(0,18), left=245,right=930,top=94,bottom=452;
  let lower=0,upper=0;
  for(const d of data){
    const vals=type==="stackedBars"?[d.a+d.b,0]:type==="groupedBars"?[d.a,d.b,0]:[d.a,0];
    lower=Math.min(lower,...vals);upper=Math.max(upper,...vals);
  }
  if(upper===lower)upper=lower+1;
  const sx=v=>left+(v-lower)/(upper-lower)*(right-left);
  const zero=sx(0),h=(bottom-top)/data.length;
  for(let i=0;i<=4;i++){
    const value=lower+(upper-lower)*i/4, xx=sx(value);
    line(svg,xx,top,xx,bottom,"#2b3a4f");
    label(svg,xx,bottom+26,pretty(value),{"text-anchor":"middle","font-size":12});
  }
  data.forEach((d,i)=>{
    const yy=top+i*h,cent=yy+h/2;
    label(svg,left-14,cent+4,d.name.slice(0,29),{"text-anchor":"end","font-size":Math.min(13,Math.max(10,h*.32))});
    if(type==="bars"){
      const bar=rect(svg,Math.min(zero,sx(d.a)),yy+h*.19,Math.abs(sx(d.a)-zero),h*.62,COLORS[0],4);
      tooltip(bar,d.name+": "+pretty(d.a)+(unit?" "+unit:""));
      label(svg,Math.min(right-5,Math.max(zero,sx(d.a))+8),cent+4,pretty(d.a),{"font-size":11});
    } else if(type==="groupedBars"){
      const first=rect(svg,Math.min(zero,sx(d.a)),yy+h*.12,Math.abs(sx(d.a)-zero),h*.35,COLORS[0],2);
      const second=rect(svg,Math.min(zero,sx(d.b)),yy+h*.53,Math.abs(sx(d.b)-zero),h*.35,COLORS[1],2);
      tooltip(first,y+": "+pretty(d.a));tooltip(second,z+": "+pretty(d.b));
    } else {
      if(d.a<0||d.b<0) throw new Error("Stacked bars require nonnegative values; use grouped bars instead.");
      const first=rect(svg,zero,yy+h*.2,sx(d.a)-zero,h*.6,COLORS[0],2);
      const second=rect(svg,sx(d.a),yy+h*.2,sx(d.a+d.b)-sx(d.a),h*.6,COLORS[1],2);
      tooltip(first,y+": "+pretty(d.a));tooltip(second,z+": "+pretty(d.b));
    }
  });
  label(svg,left,bottom+52,"Value"+(unit?" ("+unit+")":""),{"font-size":12});
  if(type!=="bars"){
    rect(svg,650,58,12,12,COLORS[0],2);label(svg,667,68,y.slice(0,22),{"font-size":11});
    rect(svg,810,58,12,12,COLORS[1],2);label(svg,827,68,z.slice(0,18),{"font-size":11});
  }
}
function drawTrend(svg,rows,encoding,unit,type) {
  const x=encoding.x,y=encoding.y;
  if(!x||!y)throw new Error("Choose an X column and a numeric Y column.");
  let data=rows.map((r,i)=>({x:String(r[x]??""),value:numeric(r[y]),order:dateValue(r[x],x)??numeric(r[x])??i})).filter(p=>p.value!==null);
  if(!data.length)throw new Error("No numeric observations in the selected Y column.");
  if(data.length>400)throw new Error("For clarity, use a subset of 400 or fewer points for a line/area chart.");
  data.sort((a,b)=>a.order-b.order);
  const b={l:75,r:940,t:100,b:447},r=range(data.map(p=>p.value)),sy=v=>b.b-(v-r[0])/(r[1]-r[0])*(b.b-b.t);
  const sx=i=>b.l+(b.r-b.l)*(data.length===1?.5:i/(data.length-1));
  axes(svg,b,data.map(p=>p.x),r,unit);
  const points=data.map((p,i)=>[sx(i),sy(p.value)]);
  if(type==="area"){
    const d="M "+b.l+" "+sy(Math.max(0,r[0]))+" L "+points.map(p=>p.join(" ")).join(" L ")+" L "+b.r+" "+sy(Math.max(0,r[0]))+" Z";
    node(svg,"path",{d,fill:COLORS[0],"fill-opacity":".25"});
  }
  node(svg,"polyline",{points:points.map(p=>p.join(",")).join(" "),fill:"none",stroke:COLORS[0],"stroke-width":3,"stroke-linejoin":"round","stroke-linecap":"round"});
  if(data.length<=75)points.forEach((p,i)=>{const dot=node(svg,"circle",{cx:p[0],cy:p[1],r:3.5,fill:COLORS[1]});tooltip(dot,data[i].x+": "+pretty(data[i].value));});
  label(svg,500,500,x,{"text-anchor":"middle","font-size":12});
}
function drawScatter(svg,rows,enc,unit){
  const x=enc.x,y=enc.y;
  if(!x||!y||x===y)throw new Error("Choose two different numeric X and Y columns.");
  const data=rows.map(r=>({a:numeric(r[x]),b:numeric(r[y])})).filter(p=>p.a!==null&&p.b!==null);
  if(!data.length)throw new Error("No complete numeric X/Y pairs.");
  const bounds={l:88,r:930,t:93,b:446},rx=range(data.map(p=>p.a)),ry=range(data.map(p=>p.b));
  const sx=v=>bounds.l+(v-rx[0])/(rx[1]-rx[0])*(bounds.r-bounds.l);
  const sy=v=>bounds.b-(v-ry[0])/(ry[1]-ry[0])*(bounds.b-bounds.t);
  axes(svg,bounds,[],ry,unit);
  for(let i=0;i<=4;i++){let v=rx[0]+(rx[1]-rx[0])*i/4,xx=sx(v);label(svg,xx,bounds.b+25,pretty(v),{"text-anchor":"middle"});}
  data.slice(0,1500).forEach(p=>{
    const dot=node(svg,"circle",{cx:sx(p.a),cy:sy(p.b),r:5,fill:COLORS[0],"fill-opacity":.65});
    tooltip(dot,x+": "+pretty(p.a)+", "+y+": "+pretty(p.b));
  });
  label(svg,490,499,x,{"text-anchor":"middle"});label(svg,20,280,y,{"transform":"rotate(-90 20 280)","text-anchor":"middle"});
}
function drawHistogram(svg,rows,enc,unit) {
  const vals=collect(rows,enc.x);
  if(!vals.length)throw new Error("Select a numeric measure to build a histogram.");
  let [lo,hi]=range(vals);const count=Math.max(4,Math.min(18,Math.ceil(Math.sqrt(vals.length))));
  const counts=Array.from({length:count},()=>0);
  vals.forEach(v=>{const k=Math.min(count-1,Math.max(0,Math.floor((v-lo)/(hi-lo)*count)));counts[k]++;});
  const b={l:85,r:932,t:99,b:446},top=Math.max(...counts,1);
  axes(svg,b,[],[0,top],"Observation count");
  counts.forEach((n,i)=>{
    const w=(b.r-b.l)/count;
    const bar=rect(svg,b.l+i*w+1,b.b-n/top*(b.b-b.t),Math.max(1,w-2),n/top*(b.b-b.t),COLORS[0],1);
    tooltip(bar,pretty(lo+i*(hi-lo)/count)+" to "+pretty(lo+(i+1)*(hi-lo)/count)+": "+n+" observations");
  });
  for(let i=0;i<=4;i++){const xx=b.l+(b.r-b.l)*i/4;label(svg,xx,b.b+22,pretty(lo+(hi-lo)*i/4),{"text-anchor":"middle"});}
  label(svg,500,497,enc.x+(unit?" ("+unit+")":""),{"text-anchor":"middle"});
}
function drawDonut(svg,rows,enc,unit) {
  const x=enc.x,y=enc.y;
  if(!x||!y)throw new Error("Choose a category X and numeric Y.");
  const map=new Map();
  rows.forEach(r=>{const name=String(r[x]??"").trim(),v=numeric(r[y]);if(!name||v===null)return;if(v<0)throw new Error("Pie/donut values must be nonnegative.");map.set(name,(map.get(name)||0)+v);});
  const data=[...map.entries()].filter(d=>d[1]>0).sort((a,b)=>b[1]-a[1]);
  if(!data.length)throw new Error("No positive totals available for the pie/donut.");
  if(data.length>12)throw new Error("A donut with over 12 groups is unreadable; try a bar chart.");
  const total=data.reduce((s,d)=>s+d[1],0),cx=350,cy=295,outer=172,inner=93;
  let angle=-Math.PI/2;
  data.forEach(([name,v],i)=>{
    const next=angle+v/total*Math.PI*2;
    const p=(r,a)=>[(cx+r*Math.cos(a)).toFixed(2),(cy+r*Math.sin(a)).toFixed(2)].join(" ");
    const large=next-angle>Math.PI?1:0;
    const d="M "+p(outer,angle)+" A "+outer+" "+outer+" 0 "+large+" 1 "+p(outer,next)+" L "+p(inner,next)+" A "+inner+" "+inner+" 0 "+large+" 0 "+p(inner,angle)+" Z";
    const sector=node(svg,"path",{d,fill:COLORS[i%COLORS.length],stroke:"#101b2c","stroke-width":2});
    tooltip(sector,name+": "+pretty(v)+" ("+pretty(v/total*100)+"%)");angle=next;
  });
  label(svg,cx,cy+6,pretty(total),{"text-anchor":"middle","font-size":25,fill:"#edf6ff","font-weight":"bold"});
  data.forEach(([name,v],i)=>{
    const xx=620,yy=106+i*32;
    rect(svg,xx,yy-12,13,13,COLORS[i%COLORS.length],2);
    label(svg,xx+21,yy,name.slice(0,24)+" · "+pretty(v/total*100)+"%",{"font-size":13,fill:"#d9e5f2"});
  });
  label(svg,620,499,unit?"Total in "+unit:"Shares of total",{"font-size":12});
}
function drawHeatmap(svg,rows,enc,unit) {
  const x=enc.x,y=enc.y,z=enc.z;
  if(!x||!y||!z||x===y)throw new Error("Select two categorical dimensions (X, Y) and a numeric value (Z).");
  const xs=[...new Set(rows.map(r=>String(r[x]??"")).filter(Boolean))].slice(0,16);
  const ys=[...new Set(rows.map(r=>String(r[y]??"")).filter(Boolean))].slice(0,12);
  if(!xs.length||!ys.length)throw new Error("Heatmap rows require two categorical dimensions.");
  const counts=new Map();
  rows.forEach(r=>{const value=numeric(r[z]);if(value===null)return;const key=String(r[x])+"\u0000"+String(r[y]);counts.set(key,(counts.get(key)||0)+value);});
  const vals=[...counts.values()];
  const low=Math.min(0,...vals),high=Math.max(1,...vals);
  const l=186,t=110,width=740,height=320,cw=width/xs.length,ch=height/ys.length;
  ys.forEach((yy,j)=>{label(svg,l-10,t+j*ch+ch*.6,yy.slice(0,18),{"text-anchor":"end","font-size":Math.min(13,ch*.36)});});
  xs.forEach((xx,i)=>{label(svg,l+i*cw+cw/2,t+height+20,xx.slice(0,11),{"text-anchor":"middle","font-size":Math.min(12,cw*.26)});});
  xs.forEach((xx,i)=>ys.forEach((yy,j)=>{
    const value=counts.get(xx+"\u0000"+yy);
    const intensity=value===undefined?.06:.18+.82*(value-low)/(high-low);
    const cell=rect(svg,l+i*cw+2,t+j*ch+2,cw-4,ch-4,"rgba(62,149,255,"+intensity.toFixed(3)+")",3);
    tooltip(cell,xx+" · "+yy+": "+(value===undefined?"no observation":pretty(value)+(unit?" "+unit:"")));
    if(value!==undefined&&cw>45&&ch>23)label(svg,l+i*cw+cw/2,t+j*ch+ch*.6,pretty(value),{"text-anchor":"middle","font-size":11,fill:"#e7f2ff"});
  }));
  label(svg,l,t+height+52,"Color intensity = aggregated "+z+(unit?" ("+unit+")":""),{"font-size":12});
}
export function renderDataChart(container, rows, type, encoding, options={}) {
  const supported=new Set(["bars","groupedBars","stackedBars","line","area","scatter","histogram","donut","heatmap"]);
  if(!supported.has(type))throw new Error("This specialized chart is an atlas reference only; choose a supported chart to render data.");
  const svg=baseSvg(container,options.title||"Data preview",options.subtitle||"Data-backed preview · Not a schematic atlas image");
  if(type==="bars"||type==="groupedBars"||type==="stackedBars") {
    const labels=rows.map(r=>String(r[encoding.x]??""));
    const orientation=options.orientation || (labels.length>9||labels.some(l=>l.length>20)?"horizontal":"vertical");
    if(orientation==="vertical")drawVerticalBars(svg,rows,type,encoding,options.unit||"",options.sort!==false);
    else drawBars(svg,rows,type,encoding,options.unit||"",options.sort!==false);
  }
  else if(type==="line"||type==="area")drawTrend(svg,rows,encoding,options.unit||"",type);
  else if(type==="scatter")drawScatter(svg,rows,encoding,options.unit||"");
  else if(type==="histogram")drawHistogram(svg,rows,encoding,options.unit||"");
  else if(type==="donut")drawDonut(svg,rows,encoding,options.unit||"");
  else if(type==="heatmap")drawHeatmap(svg,rows,encoding,options.unit||"");
  return svg;
}
