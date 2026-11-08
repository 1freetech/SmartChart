# SmartChart

## Python desktop application — downloadable

**New:** SmartChart includes an offline Python/Tkinter desktop program in the style of [Lexicon](https://github.com/1freetech/Lexicon). For Windows, macOS, and Linux executable ZIP downloads, visit [Python desktop build on GitHub Actions](https://github.com/1freetech/SmartChart/actions/workflows/python-desktop.yml), choose the latest **successful** run, and select the OS-specific artifact under **Artifacts**.

To run the source, choose **Code → Download ZIP** for the full repository (including `atlas/`) and run `python desktop/smartchart.py`. The desktop studio supports local dataset import, six Python chart renderers, CSV and SVG export, and browsing the full 40-type atlas. See [Python desktop guide](desktop/README.md) for the current functionality and QA limits. The original browser implementation below remains available.


**SmartChart** is a lightweight, browser-based data-to-chart assistant built on the original **BitcoinVersus.Tech Data Visualization Atlas**.

Give SmartChart a CSV, TSV, JSON array, or pasted table; it profiles the columns, recommends suitable visualizations with explanations and editorial cautions, and draws supported chart types using your actual values. You can inspect every one of the 40 original chart designs and their guidance in the bundled atlas.

## Getting started

Open `index.html` via a static HTTP server (e.g. `python -m http.server 8000`) or GitHub Pages. The app requires no paid APIs, build step, authentication, or network calls to analyze your data. Local browser uploads stay in your browser.

### Features
- Paste CSV/TSV/JSON, upload CSV/TSV/JSON, or try a sample data set.
- Detect numeric, categorical, and date columns; change the category/date and value-axis assignments.
- **Evaluate all 40 historically sourced chart styles before selecting**: show every candidate and exclusion, linked mathematical/textbook references, and the top alternatives. Score analytical fit independently of auto-render support.
- Draw data-backed vertical-first column/bar, line, area, scatter, histogram, donut, heatmap, and grouped/stacked charts; choose horizontal bars for long category labels and retain an orientation control; download generated SVG.
- Search all 40 atlas formats, see original schematic SVGs and their reporting cautions.
- Show units and source notes; detect missing or non-numeric cells rather than fabricating data.
- Preserve the original interactive atlas under `atlas/index.html` and all 40 SVG examples under `atlas/examples/`.
- Preserve a real-world editorial example in `atlas/2026/`. The atlas thumbnails are *synthetic illustrations*, not evidence.

**Scope:** All 40 atlas entries are migrated and browsable, but not all 40 are supported as auto-generated data-driven charts. Unsupported specialized plots remain discoverable as guidance.

## Historically grounded chart selection (v2)

SmartChart now uses **historical mathematical data relationships** together with modern analytical and publication standards:

1. Profile the supplied dataset's variable types and measurement roles.
2. Check all 40 chart types against their historical mathematical signatures (time order, categorical magnitude, quantitative pairs, composition, flows, hierarchy, and geography).
3. Reject inappropriate shapes when essential fields or mathematical assumptions are absent. A Sankey needs flow endpoints and a magnitude; a Gantt needs task intervals; an OHLC candle must have valid prices.
4. Rank valid candidates by structural suitability, the analytical goal, and modern editorial concerns. **Renderer availability does not earn a score bonus.**
5. Explain why each chart fits, display research references and warnings, and keep nonrenderable but appropriate formats visible.

These historical signatures are hand-curated chart-data archetypes, **not measured historical adoption rates** or machine-learned probabilities. Age alone does not make a visualization more accurate.

See the [complete 40-chart encyclopedia textbook](docs/CHART_TEXTBOOK.md) (six additional sentences and two citations per entry), [historical-fit rules](src/history-methodology.mjs), and [regression tests](tests/history-methodology.test.mjs).

## Repository layout

- `atlas/catalog.json`: machine-readable imported chart taxonomy (40 formats).
- `atlas/index.html`: original standalone BitcoinVersus.Tech interactive atlas.
- `atlas/examples/`: 40 original illustrative SVGs.
- `atlas/2026/`: original editorial chart example.
- `src/engine.mjs`: table parsing, inference, validation, scoring, recommendations.
- `src/history-methodology.mjs`: historical mathematical signatures and modern guardrails.
- `src/app.mjs`: frontend, preview, downloads.
- `styles.css`: responsive interface.
- `tests/engine.test.mjs` and `tests/history-methodology.test.mjs`: unit and regression tests.
- `docs/CHART_TEXTBOOK.md`: 40 encyclopedia entries with six additional sentences each and sources.
- `docs/migration.md`: provenance and migration inventory.

## Development / checks

Requires Node.js 20+ for tests only:

```bash
node --test tests/*.test.mjs
python -m http.server 8000
```

## Editorial chart selection standard

The [40-chart source matrix and chart selection law](docs/chart-selection-protocol-v2.md) is the required research-first method. Consider all feasible families, document at least three competing forms, and use a table or an external supported renderer when the most accurate graphic is not yet supported by SmartChart. The atlas already includes **two cited chart-method references per style**, but these do not replace sources for the numeric data in any chart.

## Data visualization rules

Choose a chart that answers the actual question. Show a zero baseline for ordinary bars, avoid implying causality from correlation, state units and denominators, separate actuals from forecasts, and do not display synthetic demonstration chart values as sourced measurements.

Source: [BitcoinVersus.Tech Chart Atlas](https://github.com/1freetech/Bitcoinversus.tech/tree/main/editorial/chart-atlas), originally published October 2026. All original assets retain their attribution.
