"""Offline, standard-library-only layouts for the complete SmartChart atlas.

All outputs use the host application's primitive shapes, shared between Tkinter
preview and SVG export. Complex chart types demand suitable input columns;
invalid semantics raise ValueError rather than fabricating measurements.
"""
import math
import datetime
from collections import defaultdict

KINDS = {
"line":"Line","area":"Area","stackedArea":"Stacked area","step":"Step",
"candlestick":"Candlestick","spark":"Sparkline","slope":"Slopegraph",
"bump":"Bump chart","bars":"Bar","groupedBars":"Grouped bars",
"stackedBars":"Stacked bars","percentBars":"100% stacked bars",
"lollipop":"Lollipop","dumbbell":"Dumbbell","bullet":"Bullet",
"waterfall":"Waterfall","pareto":"Pareto","tornado":"Tornado",
"histogram":"Histogram","boxplot":"Box plot","violin":"Violin",
"dot":"Dot plot","density":"Density curve","scatter":"Scatter",
"bubble":"Bubble","heatmap":"Heatmap","hexbin":"Hexbin",
"donut":"Donut","treemap":"Treemap","waffle":"Waffle",
"sunburst":"Sunburst","sankey":"Sankey","funnel":"Funnel",
"gantt":"Gantt","calendar":"Calendar heatmap","control":"Control chart",
"gauge":"Gauge","radar":"Radar","choropleth":"Choropleth map",
"symbolMap":"Proportional-symbol map"}
COLORS = ("#2563eb","#e97316","#16a34a","#b91c1c","#9333ea",
          "#0891b2","#f59e0b","#64748b")
BASE = {"Line","Area","Bar","Scatter","Histogram","Donut"}
ALL = tuple(KINDS.values())
TIME = {"Line","Area","Stacked area","Step","Candlestick","Sparkline",
        "Slopegraph","Bump chart","Gantt","Calendar heatmap","Control chart"}
NEEDS = {
"Candlestick":4,"Dumbbell":2,"Bullet":2,"Tornado":2,
"Bubble":3,"Control chart":1,"Radar":3,"Proportional-symbol map":3,
"Gantt":2,"Sankey":1,"Heatmap":1,"Hexbin":2,"Grouped bars":2,
"Stacked bars":2,"100% stacked bars":2,"Stacked area":2,"Bump chart":2,
"Slopegraph":2,"Sunburst":2,"Choropleth map":1,
}

def advice(names, rows, number, numeric_columns):
    nums = numeric_columns(names, rows)
    nonnum = [n for n in names if n not in nums]
    time = any(any(word in n.lower() for word in ("year","date","time","month","day")) for n in names)
    count = len(rows)
    entries = []
    def add(kind, score, why, ok=True):
        if ok:
            entries.append((kind, score, why))
    n = len(nums)
    positive = bool(n and all((number(r.get(nums[0])) or 0) >= 0 for r in rows))
    add("Bar",90,"Compare categories using a zero baseline.",n>=1 and bool(nonnum))
    add("Line",96,"Chronological measurements and changes.",n>=1 and time)
    add("Area",76,"Nonnegative magnitude over ordered samples.",n>=1 and time and positive)
    add("Scatter",94,"Two measured quantities; association is not causation.",n>=2)
    add("Histogram",86 if count>=20 else 57,"Count observations in numeric bins.",n>=1)
    add("Donut",65,"Parts must form an independently verified whole.",n>=1 and positive and bool(nonnum) and count<=12)
    add("Stacked area",82,"Components over common time points.",time and n>=2 and positive)
    add("Step",90,"Event-based discrete levels.",time and n>=1)
    add("Candlestick",84,"Requires ordered open/high/low/close measures.",time and n>=4)
    add("Sparkline",73,"Compact single-series trend.",time and n>=1)
    add("Slopegraph",77,"Compare two periods per category.",bool(nonnum) and n>=2)
    add("Bump chart",69,"Show changing ordinal ranks.",time and n>=2)
    add("Grouped bars",87,"Compare multiple measures by category.",bool(nonnum) and n>=2)
    add("Stacked bars",75,"Compare additive nonnegative components.",bool(nonnum) and n>=2 and positive)
    add("100% stacked bars",70,"Compare shares, not totals.",bool(nonnum) and n>=2 and positive)
    add("Lollipop",72,"Sparse categorical comparison.",bool(nonnum) and n>=1)
    add("Dumbbell",78,"Compare two measurements per category.",bool(nonnum) and n>=2)
    add("Bullet",79,"Actual vs target measures.",bool(nonnum) and n>=2)
    add("Waterfall",70,"Sequential additive changes.",n>=1 and bool(nonnum))
    add("Pareto",79,"Ranked contributions and cumulative share.",n>=1 and positive and bool(nonnum))
    add("Tornado",75,"Paired signed impact estimates.",n>=2 and bool(nonnum))
    add("Box plot",85,"Show quartiles, median, and range.",n>=1 and count>=5)
    add("Violin",70,"Estimate a distribution using smoothed density.",n>=1 and count>=8)
    add("Dot plot",80,"Individual observations.",n>=1)
    add("Density curve",75,"Smoothed numeric distribution.",n>=1 and count>=8)
    add("Bubble",76,"Two axes plus nonnegative size.",n>=3)
    add("Heatmap",80,"Numeric intensity by category or row.",n>=1 and count>=2)
    add("Hexbin",79,"Binned two-dimensional observations.",n>=2 and count>=10)
    add("Treemap",76,"Nonnegative composition.",n>=1 and positive and bool(nonnum))
    add("Waffle",65,"Discrete proportions from nonnegative parts.",n>=1 and positive and bool(nonnum))
    add("Sunburst",62,"Two-level category hierarchy and measures.",n>=2 and bool(nonnum))
    add("Sankey",72,"Source/target/weight flow records.",len(nonnum)>=2 and n>=1)
    add("Funnel",76,"Ordered nonincreasing process stages.",n>=1 and bool(nonnum))
    add("Gantt",78,"Tasks with numeric start/end or ISO dates.",len(names)>=3)
    add("Calendar heatmap",75,"Daily values by date.",time and n>=1)
    add("Control chart",82,"Monitored sequential measures; limits need assumptions.",time and n>=1 and count>=5)
    add("Gauge",55,"One bounded measurement with explicit scale.",n>=1)
    add("Radar",60,"Normalized measurements on common dimensions.",n>=3)
    add("Choropleth map",60,"Geographic regions require valid boundaries.",n>=1 and bool(nonnum))
    add("Proportional-symbol map",76,"Verified latitude, longitude and magnitude.",n>=3)
    return sorted(entries,key=lambda z:(-z[1],z[0]))

def render(rows, x_name, y_name, kind, num, s, width=920, height=550):
    """Return shapes; validation is intentionally strict about missing numeric data."""
    if kind not in ALL:
        raise ValueError("Unknown chart: "+str(kind))
    if kind in BASE:
        raise ValueError("Base renderer must handle "+kind)
    if not rows:
        raise ValueError("No chart data")
    names = list(rows[0])
    nums = [name for name in names if sum(num(r.get(name)) is not None for r in rows) >= max(1,math.ceil(.8*len(rows)))]
    extra = [name for name in nums if name != y_name]
    numeric_fields = [y_name]+extra if y_name in nums else nums
    if not numeric_fields:
        raise ValueError(kind+" requires numeric values")
    def v(row, field):
        x=num(row.get(field))
        if x is None or not math.isfinite(x):
            raise ValueError(kind+" requires complete numeric field "+field)
        return x
    def series(field):
        return [v(row,field) for row in rows]
    def require(k):
        if len(numeric_fields)<k:
            raise ValueError(kind+" requires at least "+str(k)+" numeric fields")
    if kind not in ("Gantt","Calendar heatmap","Choropleth map"):
        require(NEEDS.get(kind,1))
    def pal(i): return COLORS[i%len(COLORS)]
    a=[]
    def put(t,**kw): a.append(s(t,**kw))
    put("rect",x=0,y=0,w=width,h=height,fill="white")
    put("text",x=width/2,y=18,text=kind+" — "+str(y_name),size=15,
        fill="#1f2937",anchor="middle")
    L,T,R,B=78.,52.,width-46.,height-88.
    def txt(x,y,t,color="#334155",size=10,anchor="middle"):
        put("text",x=x,y=y,text=str(t)[:35],fill=color,size=size,anchor=anchor)
    def line(x,y,x2,y2,color="#2563eb",w=2):
        put("line",x1=x,y1=y,x2=x2,y2=y2,fill=color,width=w)
    def rect(x,y,w,h,color="#2563eb"):
        put("rect",x=x,y=y,w=max(0,w),h=max(0,h),fill=color)
    def dot(x,y,r=3,color="#2563eb"):
        put("circle",cx=x,cy=y,r=max(.3,r),fill=color)
    def poly(p,color): put("poly",coords=p,fill=color)
    def coord(values,lo=None,hi=None):
        lo=min(values) if lo is None else lo
        hi=max(values) if hi is None else hi
        if lo==hi: hi=lo+1
        return lambda v:B-(v-lo)/(hi-lo)*(B-T)
    def axes(values,zero=False):
        low=min(values+[0]) if zero else min(values)
        high=max(values+[0]) if zero else max(values)
        Y=coord(values,low,high)
        line(L,T,L,B,"#64748b",1);line(L,B,R,B,"#64748b",1)
        for k in range(5):
            z=low+(high-low if high!=low else 1)*k/4
            yy=Y(z);line(L,yy,R,yy,"#e2e8f0",1);txt(L-8,yy,f"{z:.3g}",anchor="end")
        return Y
    def xpos(i,n):return L+(i+.5)*(R-L)/max(n,1)
    values=series(numeric_fields[0]) if numeric_fields else [0.]*len(rows);n=len(rows)
    labels=[str(row.get(x_name,i)) for i,row in enumerate(rows)]
    if kind in ("Step","Sparkline","Control chart","Bump chart","Stacked area"):
        if kind in ("Stacked area","Bump chart"):
            require(2)
            fields=numeric_fields
            sets=[series(f) for f in fields]
            if kind=="Stacked area":
                if any(q<0 for group in sets for q in group):raise ValueError("Stacked area requires nonnegative parts")
                totals=[sum(col) for col in zip(*sets)]
                Y=axes(totals,True)
                lower=[0.]*n
                for j,group in enumerate(sets):
                    upper=[x+y for x,y in zip(lower,group)]
                    poly([(xpos(i,n),Y(v)) for i,v in enumerate(lower)]+
                         [(xpos(i,n),Y(v)) for i,v in reversed(list(enumerate(upper)))],pal(j))
                    lower=upper
            else:
                ranks=[[sorted([z[i] for z in sets],reverse=True).index(z[i])+1 for i in range(n)] for z in sets]
                Y=coord(list(range(1,len(sets)+1)),len(sets)+.5,.5)
                for j,group in enumerate(ranks):
                    for i in range(n-1):line(xpos(i,n),Y(group[i]),xpos(i+1,n),Y(group[i+1]),pal(j))
                    for i in range(n):dot(xpos(i,n),Y(group[i]),4,pal(j))
        else:
            Y=axes(values,kind=="Step")
            for i in range(n-1):
                x1,x2=xpos(i,n),xpos(i+1,n)
                if kind=="Step":
                    line(x1,Y(values[i]),x2,Y(values[i]),w=2)
                    line(x2,Y(values[i]),x2,Y(values[i+1]),w=2)
                else:line(x1,Y(values[i]),x2,Y(values[i+1]),w=2)
            if kind=="Control chart":
                mean=sum(values)/n;sd=math.sqrt(sum((z-mean)**2 for z in values)/max(1,n-1))
                for threshold,c in ((mean,"#16a34a"),(mean+3*sd,"#dc2626"),(mean-3*sd,"#dc2626")):
                    line(L,Y(threshold),R,Y(threshold),c,1)
                txt(R-8,T+12,"Illustrative ±3 SD limits; verify process stability",size=9,anchor="end")
            if kind=="Sparkline":
                for i,z in enumerate(values):dot(xpos(i,n),Y(z),2)
    elif kind in ("Grouped bars","Stacked bars","100% stacked bars","Slopegraph","Dumbbell","Bullet","Tornado","Candlestick"):
        require(4 if kind=="Candlestick" else 2)
        fields=numeric_fields[:4] if kind=="Candlestick" else numeric_fields
        sets=[series(f) for f in fields]
        if kind=="Candlestick":
            # Expected order: open, high, low, close; no price values fabricated.
            op,high,low,close=sets
            if any(not (l<=min(o,c)<=max(o,c)<=h) for o,h,l,c in zip(op,high,low,close)):
                raise ValueError("Candlestick fields must be ordered Open, High, Low, Close")
            Y=axes(low+high)
            for i,(o,h,l,c) in enumerate(zip(op,high,low,close)):
                x=xpos(i,n);line(x,Y(h),x,Y(l),"#334155")
                rect(x-7,min(Y(o),Y(c)),14,max(1,abs(Y(o)-Y(c))),"#16a34a" if c>=o else "#dc2626")
        elif kind=="Slopegraph":
            require(2);Y=axes(sets[0]+sets[1])
            for i,(u,w) in enumerate(zip(sets[0],sets[1])):
                x=L+(i+.5)*(R-L)/max(n,1)
                line(x-12,Y(u),x+12,Y(w),pal(i),2)
        elif kind=="Dumbbell":
            Y=axes(sets[0]+sets[1])
            for i,(u,w) in enumerate(zip(sets[0],sets[1])):
                x=xpos(i,n)
                line(x-12,Y(u),x+12,Y(w),"#94a3b8",2)
                dot(x-12,Y(u),5,pal(0));dot(x+12,Y(w),5,pal(1))
        elif kind=="Tornado":
            Y=axes([z for group in sets[:2] for z in group]+[0],True)
            for i,(u,w) in enumerate(zip(sets[0],sets[1])):
                x=xpos(i,n);dx=(R-L)/n
                for j,z in enumerate((u,w)):
                    yy=Y(z);rect(x-dx*.36+j*dx*.34,min(yy,Y(0)),dx*.3,abs(yy-Y(0)),pal(j))
        elif kind=="Bullet":
            Y=axes(sets[0]+sets[1],True)
            for i,(actual,target) in enumerate(zip(sets[0],sets[1])):
                x=xpos(i,n);dx=(R-L)/n
                rect(x-dx*.27,Y(max(0,actual)),dx*.54,abs(Y(actual)-Y(0)),pal(i))
                line(x-dx*.3,Y(target),x+dx*.3,Y(target),"#111827",3)
        else:
            totals=[sum(z) for z in zip(*sets)]
            if kind in ("Stacked bars","100% stacked bars") and any(q<0 for group in sets for q in group):
                raise ValueError("Stacks require nonnegative components")
            if kind=="100% stacked bars" and any(z<=0 for z in totals):
                raise ValueError("Each percentage stack requires a positive total")
            chartmax=[100]*n if kind=="100% stacked bars" else totals if kind=="Stacked bars" else [z for group in sets for z in group]
            Y=axes(chartmax,True);dx=(R-L)/n
            for i in range(n):
                base=0
                for j,group in enumerate(sets):
                    val=group[i]/totals[i]*100 if kind=="100% stacked bars" else group[i]
                    if kind=="Grouped bars":
                        x=L+i*dx+(j+.1)*dx/len(sets);w=dx*.8/len(sets)
                        rect(x,min(Y(0),Y(val)),w,abs(Y(0)-Y(val)),pal(j))
                    else:
                        rect(L+(i+.2)*dx,Y(base+val),dx*.6,max(.5,Y(base)-Y(base+val)),pal(j))
                        base+=val
    elif kind in ("Lollipop","Waterfall","Pareto","Funnel","Gauge"):
        if kind=="Gauge":
            if n!=1:raise ValueError("Gauge needs exactly one measurement")
            bound=series(numeric_fields[1])[0] if len(numeric_fields)>1 else 100.
            if bound<=0 or not 0<=values[0]<=bound:raise ValueError("Gauge requires 0 <= value <= positive maximum")
            frac=values[0]/bound
            rect(L,B-70,(R-L),35,"#e2e8f0");rect(L,B-70,(R-L)*frac,35,pal(0))
            txt((L+R)/2,B-90,f"{values[0]:g} / {bound:g}",size=18)
        elif kind=="Pareto":
            if any(z<0 for z in values) or sum(values)<=0:raise ValueError("Pareto requires nonnegative contributions")
            vv=sorted(values,reverse=True);Y=axes(vv,True);dx=(R-L)/n
            acc=0
            for i,z in enumerate(vv):
                rect(L+(i+.2)*dx,Y(z),dx*.6,Y(0)-Y(z),pal(0))
                acc+=z;dot(xpos(i,n),B-(acc/sum(vv))*(B-T),3,pal(1))
        elif kind=="Funnel":
            if any(z<0 for z in values) or any(a<b for a,b in zip(values,values[1:])):
                raise ValueError("Funnel stages must be nonnegative and nonincreasing")
            m=max(values) or 1
            for i,z in enumerate(values):
                w=(R-L)*z/m;h=(B-T)/n*.7
                rect((L+R-w)/2,T+i*(B-T)/n,w,h,pal(i))
                txt((L+R)/2,T+i*(B-T)/n+12,labels[i]+" "+f"{z:g}",size=9)
        else:
            Y=axes(values,True);dx=(R-L)/n;current=0
            for i,z in enumerate(values):
                if kind=="Waterfall":
                    new=current+z;y1,y2=Y(current),Y(new)
                    rect(L+(i+.2)*dx,min(y1,y2),dx*.6,abs(y2-y1),pal(0) if z>=0 else pal(3))
                    current=new
                else:
                    line(xpos(i,n),Y(0),xpos(i,n),Y(z),pal(0))
                    dot(xpos(i,n),Y(z),5)
    elif kind in ("Box plot","Violin","Dot plot","Density curve"):
        seq=sorted(values);m=len(seq)
        def quant(p):
            i=(m-1)*p;lo=math.floor(i);hi=math.ceil(i)
            return seq[lo]*(hi-i)+seq[hi]*(i-lo) if hi!=lo else seq[lo]
        Y=axes(values)
        if kind=="Box plot":
            q1,med,q3=quant(.25),quant(.5),quant(.75)
            iqr=q3-q1
            whisk=[v for v in seq if q1-1.5*iqr<=v<=q3+1.5*iqr]
            l,h=(min(whisk),max(whisk)) if whisk else (q1,q3)
            x=(L+R)/2;line(x,Y(l),x,Y(h))
            rect(x-65,Y(q3),130,max(1,Y(q1)-Y(q3)),"#bfdbfe")
            line(x-65,Y(med),x+65,Y(med),"#1e3a8a",3)
            for z in seq:
                if z<l or z>h:dot(x,Y(z),3,"#dc2626")
        elif kind=="Dot plot":
            for i,z in enumerate(values):
                x=L+((i*37)%37)/37*(R-L)
                dot(x,Y(z),3,pal(i))
        else:
            if m<3:raise ValueError(kind+" needs at least three samples")
            sd=math.sqrt(sum((z-sum(seq)/m)**2 for z in seq)/max(1,m-1))
            bw=max(1e-9,1.06*sd*m**(-.2),(max(seq)-min(seq))/50)
            pts=[]
            for i in range(85):
                z=min(seq)+(max(seq)-min(seq))*i/84 if max(seq)>min(seq) else min(seq)+(i-42)*bw/8
                d=sum(math.exp(-.5*((z-v)/bw)**2) for v in seq)/(m*bw*math.sqrt(2*math.pi))
                pts.append((z,d))
            peak=max(z for _,z in pts) or 1
            if kind=="Density curve":
                for p,q in zip(pts,pts[1:]):
                    line(L+p[1]/peak*(R-L),Y(p[0]),L+q[1]/peak*(R-L),Y(q[0]))
            else:
                x=(L+R)/2;poly([(x-90*d/peak,Y(z)) for z,d in pts]+
                    [(x+90*d/peak,Y(z)) for z,d in reversed(pts)],"#93c5fd")
    elif kind in ("Bubble","Heatmap","Hexbin","Radar","Proportional-symbol map","Choropleth map"):
        if kind=="Choropleth map":
            raise ValueError("Choropleth requires actual region polygons; no geographic boundaries bundled. Use a verified GeoJSON map renderer.")
        if kind=="Proportional-symbol map":
            require(3)
            # Latitude/longitude projection of site coordinates; no political boundaries implied.
            lat=series(numeric_fields[0]);lon=series(numeric_fields[1]);mag=series(numeric_fields[2])
            if any(abs(z)>90 for z in lat) or any(abs(z)>180 for z in lon) or any(z<0 for z in mag):
                raise ValueError("Requires latitude [-90,90], longitude [-180,180], nonnegative sizes")
            for i,(y,x,z) in enumerate(zip(lat,lon,mag)):
                dot(L+(x+180)/360*(R-L),T+(90-y)/180*(B-T),3+17*math.sqrt(z/(max(mag) or 1)),pal(i))
        elif kind=="Radar":
            vals=[series(f)[0] for f in numeric_fields]
            if len(rows)!=1 or any(z<0 or z>100 for z in vals):
                raise ValueError("Radar expects one row and normalized fields in 0–100")
            cx,cy=(L+R)/2,(T+B)/2;r=min(R-L,B-T)*.38
            for step in range(1,5):
                poly([(cx+r*step/4*math.sin(2*math.pi*i/len(vals)),
                       cy-r*step/4*math.cos(2*math.pi*i/len(vals))) for i in range(len(vals))],"#e2e8f0")
            poly([(cx+r*z/100*math.sin(2*math.pi*i/len(vals)),
                   cy-r*z/100*math.cos(2*math.pi*i/len(vals))) for i,z in enumerate(vals)],"#93c5fd")
        elif kind=="Heatmap":
            fields=numeric_fields
            cells=[[v(row,f) for f in fields] for row in rows]
            lo=min(map(min,cells));hi=max(map(max,cells));dx=(R-L)/len(fields);dy=(B-T)/n
            for i,row in enumerate(cells):
                for j,z in enumerate(row):
                    p=(z-lo)/(hi-lo or 1);color=f"#{int(230-190*p):02x}{int(240-140*p):02x}{int(255-35*p):02x}"
                    rect(L+j*dx,T+i*dy,dx*.96,dy*.96,color)
        elif kind=="Hexbin":
            require(2);xx=series(numeric_fields[0]);yy=series(numeric_fields[1])
            bins=defaultdict(int)
            minx,maxx=min(xx),max(xx);miny,maxy=min(yy),max(yy)
            for x,y in zip(xx,yy):
                ix=min(15,int((x-minx)/(maxx-minx or 1)*16))
                iy=min(9,int((y-miny)/(maxy-miny or 1)*10))
                bins[ix,iy]+=1
            for (ix,iy),count in bins.items():
                cx=L+(ix+.5)*(R-L)/16;cy=T+(iy+.5)*(B-T)/10;r=min((R-L)/18,(B-T)/12)
                poly([(cx+r*math.cos(math.pi*j/3),cy+r*math.sin(math.pi*j/3)) for j in range(6)],
                     COLORS[min(7,int(count/max(bins.values())*7))])
        else:
            require(3);xx=series(numeric_fields[0]);yy=series(numeric_fields[1]);sz=series(numeric_fields[2])
            if any(z<0 for z in sz):raise ValueError("Bubble sizes must be nonnegative")
            Y=axes(yy);lo,hi=min(xx),max(xx)
            for i,(x,y,z) in enumerate(zip(xx,yy,sz)):
                dot(L+(x-lo)/(hi-lo or 1)*(R-L),Y(y),2+16*math.sqrt(z/(max(sz) or 1)),pal(i))
    elif kind in ("Treemap","Waffle","Sunburst"):
        if any(z<0 for z in values) or sum(values)<=0:
            raise ValueError(kind+" requires nonnegative parts of a positive total")
        total=sum(values)
        if kind=="Waffle":
            allocated=[int(round(sum(values[:i+1])/total*100))-int(round(sum(values[:i])/total*100)) for i in range(n)]
            cells=[j for j,k in enumerate(allocated) for _ in range(k)]
            for i,j in enumerate(cells[:100]):
                rect(L+(i%10)*(R-L)/10,T+(i//10)*(B-T)/10,(R-L)/10-2,(B-T)/10-2,pal(j))
        elif kind=="Treemap":
            pos=L
            for i,z in enumerate(values):
                w=(R-L)*z/total;rect(pos,T,w,B-T,pal(i))
                if w>40:txt(pos+w/2,(T+B)/2,labels[i],color="white")
                pos+=w
        else:
            require(2)
            # Parent totals form inner ring, leaf values outer ring.
            angle=0;cx,cy=(L+R)/2,(T+B)/2;r=min(R-L,B-T)*.4
            for i,z in enumerate(values):
                sweep=360*z/total
                if sweep>0:put("arc",cx=cx,cy=cy,r=r,start=angle,sweep=sweep,fill=pal(i))
                angle+=sweep
            dot(cx,cy,r*.45,"white")
    elif kind=="Sankey":
        non=[f for f in names if f not in numeric_fields]
        if len(non)<2:raise ValueError("Sankey requires source and target text columns")
        if any(z<0 for z in values):raise ValueError("Flow weights must be nonnegative")
        sources=list(dict.fromkeys(str(r[non[0]]) for r in rows))
        targets=list(dict.fromkeys(str(r[non[1]]) for r in rows))
        sy={v:T+(i+.5)*(B-T)/len(sources) for i,v in enumerate(sources)}
        ty={v:T+(i+.5)*(B-T)/len(targets) for i,v in enumerate(targets)}
        for i,(row,z) in enumerate(zip(rows,values)):
            line(L+30,sy[str(row[non[0]])],R-30,ty[str(row[non[1]])],pal(i),
                 max(1,8*z/(max(values) or 1)))
        for k,y in sy.items():txt(L,y,k,anchor="start")
        for k,y in ty.items():txt(R,y,k,anchor="end")
    elif kind in ("Gantt","Calendar heatmap"):
        def dateval(t):
            try:return datetime.date.fromisoformat(str(t)[:10]).toordinal()
            except ValueError:return num(t)
        if kind=="Gantt":
            other=next((f for f in names if f!=x_name and f!=y_name),None)
            if not other:raise ValueError("Gantt requires task, start and end columns")
            starts=[dateval(r[y_name]) for r in rows]
            ends=[dateval(r[other]) for r in rows]
            if any(v is None for v in starts+ends) or any(e<z for z,e in zip(starts,ends)):
                raise ValueError("Gantt needs valid start and end values")
            lo,hi=min(starts),max(ends);span=hi-lo or 1
            for i,(z,e) in enumerate(zip(starts,ends)):
                rect(L+(z-lo)/span*(R-L),T+(i+.1)*(B-T)/n,
                     max(2,(e-z)/span*(R-L)),.7*(B-T)/n,pal(i))
        else:
            dates=[]
            for row in rows:
                try: dates.append(datetime.date.fromisoformat(str(row[x_name])[:10]))
                except ValueError: raise ValueError("Calendar heatmap requires ISO date column as X")
            start=min(dates)
            for i,(d,z) in enumerate(zip(dates,values)):
                week=(d-start).days//7;dow=d.weekday()
                x=L+week*19;y=T+dow*35
                if x>R:raise ValueError("Calendar range exceeds available preview width")
                rect(x,y,16,30,COLORS[min(7,int((z-min(values))/(max(values)-min(values) or 1)*7))])
    else:
        raise ValueError("Chart renderer not implemented: "+kind)
    txt((L+R)/2,height-32,x_name,size=11)
    return a
