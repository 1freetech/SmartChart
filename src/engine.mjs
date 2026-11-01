// SmartChart data engine. No network calls, dependencies, or evaluation of user input.
const MAX_ROWS = 5000;
const MAX_COLUMNS = 64;

export function numeric(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (value === null || value === undefined) return null;
  let text = String(value).trim();
  if (!text || /^(?:na|n\/a|null|undefined|—|-)$/i.test(text)) return null;
  const negative = /^\(.*\)$/.test(text);
  if (negative) text = text.slice(1, -1);
  text = text.replace(/[$,%\s]/g, "");
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(text)) return null;
  const n = Number(text) * (negative ? -1 : 1);
  return Number.isFinite(n) ? n : null;
}

export function dateValue(value, columnName = "") {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  if (/^(?:18|19|20|21)\d{2}$/.test(text) && /year|date|time/i.test(columnName)) {
    return Date.UTC(Number(text), 0, 1);
  }
  if (!/^\d{4}[-/]\d{1,2}(?:[-/]\d{1,2})?(?:[T ]\d{2}:\d{2}.*)?$/.test(text) &&
      !/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(text)) return null;
  const milliseconds = Date.parse(text);
  return Number.isFinite(milliseconds) ? milliseconds : null;
}

function parseDelimited(source, delimiter) {
  const result = [];
  let row = [], field = "", quoted = false;
  for (let i = 0; i < source.length; i++) {
    const c = source[i];
    if (quoted) {
      if (c === '"' && source[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"' && field === "") quoted = true;
    else if (c === delimiter) { row.push(field.trim()); field = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && source[i + 1] === "\n") i++;
      row.push(field.trim());
      if (row.some(x => x !== "")) result.push(row);
      row = []; field = "";
    } else field += c;
  }
  if (quoted) throw new Error("Unclosed quoted field in the table.");
  row.push(field.trim());
  if (row.some(x => x !== "")) result.push(row);
  return result;
}

function uniqueNames(names) {
  const counts = new Map();
  return names.map((name, i) => {
    const label = String(name ?? "").trim() || "Column " + (i + 1);
    const n = (counts.get(label.toLowerCase()) || 0) + 1;
    counts.set(label.toLowerCase(), n);
    return n === 1 ? label : label + " (" + n + ")";
  });
}

export function parseTable(raw) {
  const text = String(raw ?? "").replace(/^\uFEFF/, "").trim();
  if (!text) throw new Error("Paste a CSV, TSV, or JSON table first.");
  if (text.length > 1200000) throw new Error("The input is too large; limit it to 1.2 MB.");
  let data;
  if (text[0] === "[" || text[0] === "{") {
    let json;
    try { json = JSON.parse(text); } catch { throw new Error("Invalid JSON. Use an array of objects or { rows: [...] }."); }
    if (!Array.isArray(json)) json = json.rows ?? json.data;
    if (!Array.isArray(json)) throw new Error("JSON must contain an array of records.");
    if (Array.isArray(json[0])) {
      const names = uniqueNames(json[0]);
      data = json.slice(1).map(row => Object.fromEntries(names.map((name, i) => [name, row[i] ?? ""])));
    } else {
      if (!json.every(row => row && typeof row === "object" && !Array.isArray(row))) throw new Error("JSON records must be objects.");
      const names = uniqueNames([...new Set(json.flatMap(x => Object.keys(x)))]);
      data = json.map(row => Object.fromEntries(names.map(name => [name, row[name] ?? ""])));
    }
  } else {
    const firstLine = text.split(/\r?\n/, 1)[0];
    const delimiter = ["\t", ",", ";"].sort((a, b) => firstLine.split(b).length - firstLine.split(a).length)[0];
    const matrix = parseDelimited(text, delimiter);
    if (matrix.length < 2) throw new Error("Include a header row and at least one data row.");
    const names = uniqueNames(matrix[0]);
    data = matrix.slice(1).map(row => Object.fromEntries(names.map((name, i) => [name, row[i] ?? ""])));
  }
  if (!data.length) throw new Error("No data rows were found.");
  if (data.length > MAX_ROWS) throw new Error("Limit data to " + MAX_ROWS.toLocaleString() + " rows.");
  const names = [...new Set(data.flatMap(x => Object.keys(x)))];
  if (names.length > MAX_COLUMNS) throw new Error("Limit the dataset to " + MAX_COLUMNS + " columns.");
  if (names.length === 0) throw new Error("No columns were found.");
  return { rows: data, names };
}

export function inferColumns(rows) {
  if (!Array.isArray(rows) || !rows.length) return [];
  return [...new Set(rows.flatMap(row => Object.keys(row)))].map(name => {
    const values = rows.map(row => row[name]).filter(x => x !== null && x !== undefined && String(x).trim() !== "");
    const numbers = values.map(numeric).filter(x => x !== null);
    const dates = values.map(x => dateValue(x, name)).filter(x => x !== null);
    const distinct = new Set(values.map(x => String(x).trim())).size;
    const threshold = Math.max(1, Math.ceil(values.length * 0.85));
    const yearColumn = /^(year|fiscal year)$/i.test(name.trim());
    const type = (dates.length >= threshold && (yearColumn || numbers.length < threshold)) ? "date" :
      numbers.length >= threshold ? "number" :
      dates.length >= threshold ? "date" : "category";
    return {
      name, type, count: values.length, missing: rows.length - values.length, distinct,
      min: numbers.length ? Math.min(...numbers) : null,
      max: numbers.length ? Math.max(...numbers) : null,
      nonnegative: numbers.every(n => n >= 0),
      geographic: /^(?:country|state|province|region|city|county|zip|postal|location|latitude|longitude|lat|lon|lng)$/i.test(name)
    };
  });
}

const goalFamilies = {
  trend: ["Trends"], compare: ["Comparisons"], distribution: ["Distributions"],
  relationship: ["Relationships"], composition: ["Composition"],
  flow: ["Flows"], operations: ["Operations"], geography: ["Geography"]
};

export function evaluateChartCandidates(columns, rows, catalog, goal = "auto") {
  if (!Array.isArray(columns) || !columns.length || !Array.isArray(catalog)) return [];
  const num = columns.filter(c => c.type === "number");
  const cats = columns.filter(c => c.type === "category");
  const dates = columns.filter(c => c.type === "date");
  const labels = [...cats, ...dates];
  const values = num.filter(c => c.count);
  const fewCategories = cats.some(c => c.distinct >= 2 && c.distinct <= 12);
  const manyRows = rows.length >= 20;
  const plentyRows = rows.length >= 100;
  const hasGeo = columns.some(c => c.geographic);
  const allNonnegative = values.every(c => c.nonnegative);
  const scoreFor = id => {
    switch (id) {
      case "line": return dates.length && num.length ? 93 : 0;
      case "area": return dates.length && num.length ? 84 : 0;
      case "stackedArea": return dates.length && num.length >= 2 ? 81 : 0;
      case "step": return dates.length && num.length ? 66 : 0;
      case "candlestick": return dates.length && num.length >= 4 && /open|high|low|close/i.test(columns.map(c=>c.name).join(" ")) ? 89 : 0;
      case "spark": return dates.length && num.length ? 61 : 0;
      case "slope": return cats.length && num.length >= 2 ? 79 : 0;
      case "bump": return dates.length && cats.length && num.length ? 63 : 0;
      case "bars": return labels.length && num.length ? (dates.length && !cats.length ? 48 : 84) : 0;
      case "groupedBars": return labels.length && num.length >= 2 ? 87 : 0;
      case "stackedBars": return labels.length && num.length >= 2 && allNonnegative ? 67 : 0;
      case "percentBars": return labels.length && num.length >= 2 && allNonnegative ? 62 : 0;
      case "lollipop": return cats.length && num.length ? 79 : 0;
      case "dumbbell": return cats.length && num.length >= 2 ? 91 : 0;
      case "bullet": return labels.length && num.length >= 2 ? 72 : 0;
      case "waterfall": return labels.length && num.length ? (/change|variance|delta|contribution|increase|decrease/i.test(columns.map(c=>c.name).join(" ")) ? 90 : 45) : 0;
      case "pareto": return cats.length && num.length && allNonnegative ? 70 : 0;
      case "tornado": return cats.length && num.length >= 2 ? 57 : 0;
      case "histogram": return num.length && manyRows ? 89 : num.length ? 70 : 0;
      case "boxplot": return num.length && manyRows ? 79 : 0;
      case "violin": return num.length && plentyRows ? 73 : 0;
      case "dot": return num.length ? 68 : 0;
      case "density": return num.length && manyRows ? 67 : 0;
      case "scatter": return num.length >= 2 ? 91 : 0;
      case "bubble": return num.length >= 3 && allNonnegative ? 76 : 0;
      case "heatmap": return cats.length >= 2 && num.length ? 88 : 0;
      case "hexbin": return num.length >= 2 && plentyRows ? 78 : 0;
      case "donut": return cats.length && num.length && fewCategories && allNonnegative ? 83 : 0;
      case "treemap": return cats.length && num.length && allNonnegative ? 76 : 0;
      case "waffle": return cats.length && num.length && fewCategories && allNonnegative ? 67 : 0;
      case "sunburst": return cats.length >= 2 && num.length && allNonnegative ? 70 : 0;
      case "sankey": return cats.length >= 2 && num.length && allNonnegative ? 70 : 0;
      case "funnel": return cats.length && num.length && allNonnegative ? 65 : 0;
      case "gantt": return dates.length >= 2 && cats.length ? 90 : 0;
      case "calendar": return dates.length && num.length ? 75 : 0;
      case "control": return dates.length && num.length && manyRows ? 72 : 0;
      case "gauge": return num.length ? 50 : 0;
      case "radar": return cats.length && num.length >= 3 ? 64 : 0;
      case "choropleth": return hasGeo && num.length ? 76 : 0;
      case "symbolMap": return columns.filter(c => /^(?:lat|latitude|lon|lng|longitude)$/i.test(c.name)).length >= 2 && num.length >= 2 ? 94 : 0;
      default: return 0;
    }
  };
  const whyFor = chart => {
    const descriptions = {
      Trends: "Date or time values with quantitative measurements support change-over-time analysis.",
      Comparisons: "Labeled categories and numeric measures support comparing magnitudes.",
      Distributions: "Numeric observations can reveal range, spread, and concentration.",
      Relationships: "Two or more quantitative or categorical dimensions support comparison of relationships.",
      Composition: "Categorical groups and nonnegative values can describe parts of a whole.",
      Flows: "Sequential stages or category links may describe changes or transfers; verify continuity first.",
      Operations: "Dates or numeric measures may support monitoring or process performance.",
      Geography: "Location data may support mapping; verify actual coordinates and appropriate normalization."
    };
    return descriptions[chart.family] || chart.bestFor;
  };
  const wants = goalFamilies[goal] || [];
  // Evaluate ALL 40 sourced atlas types before ranking. Never award a score bonus
  // merely because a chart is easy to render; unsupported but better analytical
  // options must remain visible instead of silently collapsing to horizontal bars.
  return catalog.map(chart => {
    const sourceReferences = (chart.textbook?.sources || []).filter(s => /^https:\/\//.test(s.url || ""));
    const pattern = chart.historicalDataPattern || "unspecified";
    const fit = scoreFor(chart.id);
    const matchedGoal = !wants.length || wants.includes(chart.family);
    const score = fit ? Math.max(1, fit + (wants.length ? (matchedGoal ? 28 : -25) : 0)) : 0;
    const eligible = fit > 0 && sourceReferences.length > 0;
    const categoryColumn = cats[0];
    const orientation = categoryColumn && (categoryColumn.distinct > 9 ||
      rows.some(row => String(row[categoryColumn.name] ?? "").length > 20))
      ? "horizontal" : "vertical";
    const gate = !sourceReferences.length ? "Missing verified chart-method references." :
      !fit ? "Dataset lacks the required data roles for this chart; do not force it." :
      !matchedGoal ? "Possible shape match, but a different analytical family was requested." :
      chart.autoRenderable ? "Eligible; SmartChart can render this chart." :
      "Eligible reference candidate; requires a supported external renderer or manual design.";
    return {...chart, eligible, score, gate, orientation,
      sourceReferences, historicalPattern:pattern,
      rationale: chart.bestFor + " " + whyFor(chart) +
        " Historical data pattern: " + pattern.replace(/_/g," ") + "."};
  }).sort((a,b)=>b.score-a.score || a.name.localeCompare(b.name));
}

export function recommendCharts(columns, rows, catalog, goal = "auto") {
  return evaluateChartCandidates(columns,rows,catalog,goal)
    .filter(chart => chart.eligible).slice(0,12);
}

export function chooseEncoding(columns, chartType) {
  const numbers = columns.filter(c => c.type === "number");
  const cats = columns.filter(c => c.type === "category");
  const dates = columns.filter(c => c.type === "date");
  const label = cats[0] ?? dates[0] ?? numbers[0];
  if (chartType === "line" || chartType === "area") return {x:(dates[0] ?? label)?.name, y:numbers[0]?.name, z:numbers[1]?.name};
  if (chartType === "scatter") return {x:numbers[0]?.name, y:numbers[1]?.name, z:numbers[2]?.name};
  if (chartType === "histogram") return {x:numbers[0]?.name, y:numbers[0]?.name, z:numbers[1]?.name};
  if (chartType === "heatmap") return {x:cats[0]?.name, y:cats[1]?.name, z:numbers[0]?.name};
  return {x:label?.name, y:numbers[0]?.name, z:numbers[1]?.name};
}
