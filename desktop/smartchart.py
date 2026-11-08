"""SmartChart Python desktop studio — Tkinter/standard library, no cloud service.

Chart previews use the same shape definitions as exported SVG files. The
40-style atlas is preserved; unsupported special formats are labeled clearly.
"""
from __future__ import annotations

import csv
import io
import json
import math
import re
import sys
import tkinter as tk
from html import escape
from pathlib import Path
from tkinter import filedialog, messagebox, ttk

SAMPLE = "Year,ASIC efficiency J/TH\n2020,45\n2021,38\n2022,29\n2023,23\n2024,17\n2025,12\n2026,8.9"
SUPPORTED = ("Bar", "Line", "Area", "Scatter", "Histogram", "Donut")
COLORS = ("#2563eb", "#e97316", "#16a34a", "#b91c1c", "#9333ea",
          "#0891b2", "#f59e0b", "#6b7280")
WIDTH, HEIGHT = 920, 550


def resource(path):
    return Path(getattr(sys, "_MEIPASS", Path(__file__).resolve().parent.parent)) / path


def parse_data(raw):
    text = raw.lstrip("\ufeff").strip()
    if not text:
        raise ValueError("Paste or import a CSV, TSV, or JSON dataset.")
    if len(text) > 1_200_000:
        raise ValueError("Input is limited to 1.2 MB.")
    if text.startswith(("{", "[")):
        data = json.loads(text)
        if isinstance(data, dict):
            data = data.get("rows", data.get("data"))
        if not isinstance(data, list) or not data:
            raise ValueError("JSON must contain a nonempty array of records.")
        if isinstance(data[0], list):
            headings = [str(h).strip() for h in data[0]]
            records = data[1:]
            if not all(isinstance(row, list) for row in records):
                raise ValueError("JSON matrix rows must be arrays.")
            rows = [{name: row[i] if i < len(row) else "" for i, name in enumerate(headings)}
                    for row in records]
        else:
            if not all(isinstance(row, dict) for row in data):
                raise ValueError("JSON records must be objects.")
            headings = list(dict.fromkeys(k for row in data for k in row))
            rows = [{name: row.get(name, "") for name in headings} for row in data]
    else:
        first = text.splitlines()[0]
        delim = max((",", "\t", ";"), key=first.count)
        matrix = list(csv.reader(io.StringIO(text), delimiter=delim))
        matrix = [row for row in matrix if any(cell.strip() for cell in row)]
        if len(matrix) < 2:
            raise ValueError("A header and at least one data row are required.")
        headings = [h.strip() for h in matrix[0]]
        rows = [{name: row[i] if i < len(row) else "" for i, name in enumerate(headings)}
                for row in matrix[1:]]
    if not headings or len(headings) > 64 or len(rows) > 5000 or not rows:
        raise ValueError("Use 1–64 columns and 1–5,000 data rows.")
    if not all(headings) or len(set(headings)) != len(headings):
        raise ValueError("Column names must be nonempty and unique.")
    return headings, rows


def numeric(value):
    if isinstance(value, bool) or value is None:
        return None
    s = str(value).strip()
    if not s or s.lower() in ("na", "n/a", "null", "undefined", "-", "—"):
        return None
    negative = s.startswith("(") and s.endswith(")")
    if negative:
        s = s[1:-1]
    s = re.sub(r"[$,%\s]", "", s)
    if not re.fullmatch(r"[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?", s):
        return None
    n = float(s) * (-1 if negative else 1)
    return n if math.isfinite(n) else None


def numeric_columns(names, rows):
    return [name for name in names if sum(numeric(row.get(name)) is not None for row in rows)
            >= max(1, math.ceil(len(rows) * .8))]


def chart_advice(names, rows):
    nums = numeric_columns(names, rows)
    is_time = any(re.search(r"year|date|time|month", n, re.I) for n in names)
    has_category = len(nums) < len(names)
    ranked = []
    if nums and has_category:
        ranked.append(("Bar", 90, "Categorical comparisons; bars start at zero."))
    if nums and is_time:
        ranked.append(("Line", 96, "Ordered observations over time; gaps must remain visible."))
        ranked.append(("Area", 72, "Change over ordered observations; area may imply totals."))
    if len(nums) >= 2:
        ranked.append(("Scatter", 94, "Numeric x/y relationships; correlation is not causation."))
    if nums:
        ranked.append(("Histogram", 83 if len(rows) >= 20 else 60,
                       "Numeric distribution and bin counts."))
    if nums and has_category and len(rows) <= 12 and all(
            numeric(r.get(nums[0])) is not None and numeric(r[nums[0]]) >= 0 for r in rows):
        ranked.append(("Donut", 64, "Nonnegative parts of a coherent whole only."))
    if nums and not ranked:
        ranked.append(("Bar", 45, "Compare numeric observations."))
    return sorted(ranked, key=lambda x: -x[1])[:3]


def shape(kind, **kwargs):
    return (kind, kwargs)


def build_shapes(rows, x_name, y_name, kind, width=WIDTH, height=HEIGHT):
    """Pure chart layout; no Tk root is needed for regression tests."""
    if kind not in SUPPORTED:
        raise ValueError(f"Unsupported chart renderer: {kind}")
    points = [(str(r.get(x_name, "")), numeric(r.get(y_name))) for r in rows]
    if kind == "Scatter":
        points = [(numeric(r.get(x_name)), numeric(r.get(y_name))) for r in rows]
        points = [(x, y) for x, y in points if x is not None and y is not None]
    else:
        points = [(x, y) for x, y in points if y is not None]
    if not points:
        raise ValueError("No usable numeric values for the chosen axes.")
    if len(points) > 5000:
        raise ValueError("Chart limited to 5,000 observations.")
    shapes = [shape("rect", x=0, y=0, w=width, h=height, fill="#ffffff")]
    left, top, right, bottom = 85, 45, width - 45, height - 94
    shapes.append(shape("text", x=width/2, y=17, text=f"{kind}: {y_name}",
                        fill="#1f2937", size=16, anchor="middle"))
    if kind == "Donut":
        values = [p[1] for p in points]
        if any(v < 0 for v in values) or sum(values) <= 0:
            raise ValueError("Donut charts require nonnegative parts with a positive total.")
        if len(points) > 12:
            raise ValueError("Donut charts require at most 12 categories.")
        total = sum(values)
        angle = 0
        radius = min((right-left), (bottom-top)) * .4
        cx, cy = width*.50, (top+bottom)*.5
        for i, (label, val) in enumerate(points):
            sweep = val / total * 360
            if sweep:
                shapes.append(shape("arc", cx=cx, cy=cy, r=radius,
                                    start=angle, sweep=sweep, fill=COLORS[i % len(COLORS)]))
            shapes.append(shape("text", x=width*.80, y=top+14*i,
                                text=f"{label[:18]}: {val:g}", fill=COLORS[i % len(COLORS)],
                                size=10, anchor="start"))
            angle += sweep
        shapes.append(shape("circle", cx=cx, cy=cy, r=radius*.52, fill="#ffffff"))
        return shapes
    if kind == "Histogram":
        values = [p[1] for p in points]
        low, high = min(values), max(values)
        n_bins = min(15, max(1, math.ceil(math.sqrt(len(values)))))
        bins = [0] * n_bins
        for val in values:
            index = min(n_bins-1, int((val-low) / (high-low) * n_bins)) if high > low else 0
            bins[index] += 1
        points = [(f"{low+(high-low)*i/n_bins:g}", count) for i, count in enumerate(bins)]
    values = [p[1] for p in points]
    low = min(0, *values) if kind in ("Bar", "Area", "Histogram") else min(values)
    high = max(0, *values) if kind in ("Bar", "Area", "Histogram") else max(values)
    if high == low:
        high += 1
        low -= 1
    def yy(v):
        return bottom - (v-low)/(high-low)*(bottom-top)
    shapes.extend([shape("line", x1=left, y1=top, x2=left, y2=bottom, fill="#334155"),
                   shape("line", x1=left, y1=bottom, x2=right, y2=bottom, fill="#334155")])
    for step in range(5):
        val = low + (high-low)*step/4
        y = yy(val)
        shapes.append(shape("line", x1=left, y1=y, x2=right, y2=y, fill="#e5e7eb"))
        shapes.append(shape("text", x=left-10, y=y, text=f"{val:.3g}",
                            size=10, fill="#475569", anchor="end"))
    n = len(points)
    dx = (right-left)/max(n, 1)
    selected = points if n <= 90 else points[:90] if kind in ("Bar", "Histogram") else points
    if kind in ("Bar", "Histogram"):
        zero = yy(0)
        for i, (label, val) in enumerate(selected):
            x = left + (i+.15)*dx
            y = yy(val)
            shapes.append(shape("rect", x=x, y=min(y, zero),
                                w=dx*.70, h=max(abs(zero-y), .5), fill="#2563eb"))
    elif kind in ("Line", "Area"):
        dots = [(left+(i+.5)*dx, yy(val)) for i, (_label, val) in enumerate(points)]
        if kind == "Area":
            zero = yy(0)
            shapes.append(shape("poly", coords=[(dots[0][0], zero), *dots,
                                                 (dots[-1][0], zero)], fill="#dbeafe"))
        for a, b in zip(dots, dots[1:]):
            shapes.append(shape("line", x1=a[0], y1=a[1], x2=b[0], y2=b[1],
                                fill="#2563eb", width=2))
        if len(dots) <= 150:
            shapes.extend(shape("circle", cx=x, cy=y, r=3, fill="#f97316") for x, y in dots)
    elif kind == "Scatter":
        xs = [p[0] for p in points]
        minx, maxx = min(xs), max(xs)
        spread = max(maxx-minx, 1e-9)
        shapes.extend(shape("circle", cx=left+(x-minx)/spread*(right-left),
                            cy=yy(y), r=3, fill="#2563eb") for x, y in points)
    if kind != "Scatter" and n <= 35:
        for i, (label, _val) in enumerate(points):
            if i % max(1, math.ceil(n/15)):
                continue
            shapes.append(shape("text", x=left+(i+.5)*dx, y=bottom+18, text=str(label)[:15],
                                size=9, fill="#475569", anchor="middle"))
    shapes.append(shape("text", x=(left+right)/2, y=height-35, text=str(x_name),
                        size=12, fill="#334155", anchor="middle"))
    return shapes


def svg_document(shapes, width=WIDTH, height=HEIGHT):
    chunks = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}">']
    for kind, v in shapes:
        color = escape(str(v.get("fill", "#111827")), quote=True)
        if kind == "rect":
            chunks.append(f'<rect x="{v["x"]}" y="{v["y"]}" width="{v["w"]}" height="{v["h"]}" fill="{color}"/>')
        elif kind == "line":
            chunks.append(f'<line x1="{v["x1"]}" y1="{v["y1"]}" x2="{v["x2"]}" y2="{v["y2"]}" stroke="{color}" stroke-width="{v.get("width",1)}"/>')
        elif kind == "circle":
            chunks.append(f'<circle cx="{v["cx"]}" cy="{v["cy"]}" r="{v["r"]}" fill="{color}"/>')
        elif kind == "poly":
            coords = " ".join(f'{x},{y}' for x, y in v["coords"])
            chunks.append(f'<polygon points="{coords}" fill="{color}"/>')
        elif kind == "text":
            align = {"start":"start", "middle":"middle", "end":"end"}[v.get("anchor", "start")]
            chunks.append(f'<text x="{v["x"]}" y="{v["y"]+4}" fill="{color}" font-family="sans-serif" font-size="{v.get("size",11)}" text-anchor="{align}">{escape(str(v["text"]))}</text>')
        elif kind == "arc":
            start, sweep = v["start"], v["sweep"]
            cx, cy, r = v["cx"], v["cy"], v["r"]
            if sweep >= 359.999:
                chunks.append(f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{color}"/>')
                continue
            a, b = math.radians(start), math.radians(start+sweep)
            x1, y1 = cx+r*math.cos(a), cy-r*math.sin(a)
            x2, y2 = cx+r*math.cos(b), cy-r*math.sin(b)
            chunks.append(f'<path d="M {cx},{cy} L {x1},{y1} A {r},{r} 0 {int(sweep>180)} 0 {x2},{y2} Z" fill="{color}"/>')
    chunks.append("</svg>")
    return "\n".join(chunks)


class SmartChartApp(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("SmartChart — Python Desktop")
        self.geometry("1220x840")
        self.minsize(940, 650)
        self.names, self.rows, self.shapes = [], [], []
        self.catalog = json.loads(resource("atlas/catalog.json").read_text(encoding="utf-8"))["charts"]
        self.chart = tk.StringVar(value="Bar")
        self.xaxis, self.yaxis = tk.StringVar(), tk.StringVar()
        self.status = tk.StringVar(value="Synthetic example only — import your own data.")
        top = ttk.Frame(self, padding=7)
        top.pack(fill="x")
        for label, action in (("Import CSV/TSV/JSON", self.open_file), ("Analyze pasted data", self.analyze),
                              ("Export CSV", self.export_csv), ("Export SVG", self.export_svg)):
            ttk.Button(top, text=label, command=action).pack(side="left", padx=4)
        ttk.Label(top, textvariable=self.status).pack(side="left", padx=14)
        tabs = ttk.Notebook(self)
        tabs.pack(fill="both", expand=True)
        studio = ttk.Frame(tabs, padding=6)
        atlas = ttk.Frame(tabs, padding=6)
        tabs.add(studio, text="Chart studio")
        tabs.add(atlas, text="40-chart atlas")
        control = ttk.Frame(studio)
        control.pack(fill="x", pady=5)
        ttk.Label(control, text="Chart type").pack(side="left")
        cb = ttk.Combobox(control, textvariable=self.chart, values=SUPPORTED, state="readonly", width=15)
        cb.pack(side="left", padx=5)
        cb.bind("<<ComboboxSelected>>", lambda _e: self.draw())
        ttk.Label(control, text="X/category").pack(side="left", padx=(15, 2))
        self.x_combo = ttk.Combobox(control, textvariable=self.xaxis, state="readonly", width=23)
        self.x_combo.pack(side="left")
        self.x_combo.bind("<<ComboboxSelected>>", lambda _e: self.draw())
        ttk.Label(control, text="Y/value").pack(side="left", padx=(15, 2))
        self.y_combo = ttk.Combobox(control, textvariable=self.yaxis, state="readonly", width=23)
        self.y_combo.pack(side="left")
        self.y_combo.bind("<<ComboboxSelected>>", lambda _e: self.draw())
        self.canvas = tk.Canvas(studio, bg="white", height=520)
        self.canvas.pack(fill="both", expand=True)
        bottom = ttk.Panedwindow(studio, orient="horizontal")
        bottom.pack(fill="both", expand=False)
        self.raw = tk.Text(bottom, wrap="none", height=9, width=62)
        bottom.add(self.raw, weight=2)
        self.advice = tk.Text(bottom, wrap="word", height=9, width=52, state="disabled")
        bottom.add(self.advice, weight=1)
        self.raw.insert("1.0", SAMPLE)
        self.atlas_list = tk.Listbox(atlas, width=31, exportselection=False)
        self.atlas_list.pack(side="left", fill="y", padx=5)
        self.atlas_info = tk.Text(atlas, wrap="word", width=95)
        self.atlas_info.pack(side="left", fill="both", expand=True)
        for record in self.catalog:
            self.atlas_list.insert("end", record.get("name", record["id"]))
        self.atlas_list.bind("<<ListboxSelect>>", self.show_atlas)
        self.atlas_list.selection_set(0)
        self.show_atlas()
        self.analyze()

    def show_atlas(self, *_):
        selection = self.atlas_list.curselection()
        if not selection:
            return
        record = self.catalog[selection[0]]
        book = record.get("textbook") or {}
        sections = [record.get("name", ""), "Family: " + record.get("family", ""),
                    "Best for: " + record.get("bestFor", ""),
                    "Caution: " + record.get("caution", ""),
                    "", book.get("paragraph", ""),
                    "", "Method references:"]
        sections.extend(f"• {s.get('title')}: {s.get('url')}" for s in book.get("sources", []))
        sections.extend(["", "Python renderer: " +
                        ("available" if record.get("id") in
                        {"bars", "line", "area", "scatter", "histogram", "donut"} else
                        "reference only; not yet implemented")])
        self.atlas_info.delete("1.0", "end")
        self.atlas_info.insert("end", "\n".join(sections))

    def open_file(self):
        path = filedialog.askopenfilename(filetypes=[("Datasets", "*.csv *.tsv *.json *.txt"),
                                                    ("All files", "*.*")])
        if not path:
            return
        try:
            if Path(path).stat().st_size > 1_200_000:
                raise ValueError("Files are limited to 1.2 MB")
            data = Path(path).read_text(encoding="utf-8-sig")
            self.raw.delete("1.0", "end")
            self.raw.insert("1.0", data)
            self.analyze()
        except (OSError, UnicodeError, ValueError) as exc:
            messagebox.showerror("Import failed", str(exc))

    def analyze(self):
        try:
            names, rows = parse_data(self.raw.get("1.0", "end"))
            nums = numeric_columns(names, rows)
            if not nums:
                raise ValueError("At least one predominantly numeric column is required.")
            self.names, self.rows = names, rows
            self.x_combo["values"] = names
            self.y_combo["values"] = nums
            self.xaxis.set(next((n for n in names if n not in nums), names[0]))
            self.yaxis.set(nums[0])
            ranking = chart_advice(names, rows)
            self.chart.set(ranking[0][0] if ranking else "Bar")
            self.advice.config(state="normal")
            self.advice.delete("1.0", "end")
            self.advice.insert("end", "Top three compatible desktop chart types:\n\n" +
                               "\n".join(f"{n} ({score}): {why}" for n, score, why in ranking) +
                               "\n\nAll 40 original atlas formats remain available in the Atlas tab; "
                               "specialized formats are not yet Python-renderable.")
            self.advice.config(state="disabled")
            self.status.set(f"{len(rows)} rows, {len(names)} columns — data processed locally.")
            self.draw()
        except (ValueError, json.JSONDecodeError) as exc:
            messagebox.showerror("Data error", str(exc))

    def draw(self):
        if not self.rows:
            return
        try:
            self.shapes = build_shapes(self.rows, self.xaxis.get(), self.yaxis.get(),
                                       self.chart.get())
            self.canvas.delete("all")
            sx = max(self.canvas.winfo_width(), 1) / WIDTH
            sy = max(self.canvas.winfo_height(), 1) / HEIGHT
            for kind, p in self.shapes:
                color = p.get("fill", "#000000")
                if kind == "rect":
                    self.canvas.create_rectangle(p["x"]*sx, p["y"]*sy,
                        (p["x"]+p["w"])*sx, (p["y"]+p["h"])*sy, fill=color, outline="")
                elif kind == "line":
                    self.canvas.create_line(p["x1"]*sx, p["y1"]*sy, p["x2"]*sx,
                                            p["y2"]*sy, fill=color, width=p.get("width", 1))
                elif kind == "circle":
                    self.canvas.create_oval((p["cx"]-p["r"])*sx, (p["cy"]-p["r"])*sy,
                        (p["cx"]+p["r"])*sx, (p["cy"]+p["r"])*sy, fill=color, outline="")
                elif kind == "poly":
                    coords = [z for x, y in p["coords"] for z in (x*sx, y*sy)]
                    self.canvas.create_polygon(*coords, fill=color, outline="")
                elif kind == "arc":
                    self.canvas.create_arc((p["cx"]-p["r"])*sx, (p["cy"]-p["r"])*sy,
                        (p["cx"]+p["r"])*sx, (p["cy"]+p["r"])*sy, start=p["start"],
                        extent=p["sweep"], fill=color, outline="")
                elif kind == "text":
                    align = {"start":"w", "middle":"center", "end":"e"}.get(p.get("anchor"), "w")
                    self.canvas.create_text(p["x"]*sx, p["y"]*sy, text=p["text"],
                                            fill=color, anchor=align,
                                            font=("Arial", p.get("size", 11)))
        except ValueError as exc:
            self.shapes = []
            self.status.set(str(exc))

    def export_svg(self):
        if not self.shapes:
            messagebox.showwarning("No chart", "Analyze a valid dataset and chart first.")
            return
        path = filedialog.asksaveasfilename(defaultextension=".svg",
                     initialfile="smartchart.svg", filetypes=[("SVG", "*.svg")])
        if path:
            try:
                Path(path).write_text(svg_document(self.shapes), encoding="utf-8")
                self.status.set(f"SVG exported to {path}")
            except OSError as exc:
                messagebox.showerror("Export failed", str(exc))

    def export_csv(self):
        if not self.rows:
            messagebox.showwarning("No data", "Analyze a dataset first.")
            return
        path = filedialog.asksaveasfilename(defaultextension=".csv",
                     initialfile="smartchart-data.csv", filetypes=[("CSV", "*.csv")])
        if path:
            try:
                with open(path, "w", encoding="utf-8-sig", newline="") as out:
                    writer = csv.DictWriter(out, fieldnames=self.names, extrasaction="ignore")
                    writer.writeheader()
                    writer.writerows(self.rows)
                self.status.set(f"CSV exported to {path}")
            except OSError as exc:
                messagebox.showerror("Export failed", str(exc))


if __name__ == "__main__":
    try:
        SmartChartApp().mainloop()
    except (FileNotFoundError, ValueError, json.JSONDecodeError) as exc:
        root = tk.Tk()
        root.withdraw()
        messagebox.showerror("Chart atlas unavailable",
            f"Could not load atlas/catalog.json: {exc}\nDownload the complete repository ZIP "
            "or a packaged desktop build.")
        root.destroy()
