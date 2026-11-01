# SmartChart

**SmartChart** is a lightweight, browser-based data-to-chart assistant built on the original **BitcoinVersus.Tech Data Visualization Atlas**.

Give SmartChart a CSV, TSV, JSON array, or pasted table; it profiles the columns, recommends suitable visualizations with explanations and editorial cautions, and draws supported chart types using your actual values. You can inspect every one of the 40 original chart designs and their guidance in the bundled atlas.

## Getting started

Open `index.html` via a static HTTP server (e.g. `python -m http.server 8000`) or GitHub Pages. The app requires no paid APIs, build step, authentication, or network calls to analyze your data. Local browser uploads stay in your browser.

### Features
- Paste CSV/TSV/JSON, upload CSV/TSV/JSON, or try a sample data set.
- Detect numeric, categorical, and date columns; change the category/date and value-axis assignments.
- Explain and rank chart recommendations based on column types, row counts, cardinality, and analytical goal.
- Draw data-backed bar, line, area, scatter, histogram, donut, heatmap, and grouped/stacked bar charts; download generated SVG.
- Search all 40 atlas formats, see original schematic SVGs and their reporting cautions.
- Show units and source notes; detect missing or non-numeric cells rather than fabricating data.
- Preserve the original interactive atlas under `atlas/index.html` and all 40 SVG examples under `atlas/examples/`.
- Preserve a real-world editorial example in `atlas/2026/`. The atlas thumbnails are *synthetic illustrations*, not evidence.

**Scope:** All 40 atlas entries are migrated and browsable, but not all 40 are supported as auto-generated data-driven charts. Unsupported specialized plots remain discoverable as guidance.

## Repository layout

- `atlas/catalog.json`: machine-readable imported chart taxonomy (40 formats).
- `atlas/index.html`: original standalone BitcoinVersus.Tech interactive atlas.
- `atlas/examples/`: 40 original illustrative SVGs.
- `atlas/2026/`: original editorial chart example.
- `src/engine.mjs`: table parsing, inference, validation, scoring, recommendations.
- `src/app.mjs`: frontend, preview, downloads.
- `styles.css`: responsive interface.
- `tests/engine.test.mjs`: node built-in test runner.
- `docs/migration.md`: provenance and migration inventory.

## Development / checks

Requires Node.js 20+ for tests only:

```bash
node --test tests/engine.test.mjs
python -m http.server 8000
```

## Data visualization rules

Choose a chart that answers the actual question. Show a zero baseline for ordinary bars, avoid implying causality from correlation, state units and denominators, separate actuals from forecasts, and do not display synthetic demonstration chart values as sourced measurements.

Source: [BitcoinVersus.Tech Chart Atlas](https://github.com/1freetech/Bitcoinversus.tech/tree/main/editorial/chart-atlas), originally published October 2026. All original assets retain their attribution.
