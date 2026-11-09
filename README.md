# SmartChart — Python-only desktop chart studio

SmartChart is an offline **Python 3.12+ / Tkinter** desktop application. The application and automated tests are written in Python; **no Node.js, JavaScript, HTML browser frontend, CSS, or web server is required**. JSON chart metadata and SVG illustrations are retained as data/assets, not executable application code.

## Fixed: standalone script and chart atlas

The full 40-chart catalog is embedded in `desktop/smartchart.py` as an offline fallback. A **single copied Python file now starts even when `atlas/catalog.json` is absent**. When the complete repository is available, its JSON catalog is used as the authoritative source; the embedded catalog is kept in sync using `python scripts/sync_catalog.py`. No network request or JavaScript is involved.

## Run from source

Download/clone the **entire repository** (including `atlas/`). Python must include Tkinter.

```sh
python desktop/smartchart.py
```

For packaged Windows, macOS, and Linux executables, use the latest successful [Python desktop build](https://github.com/1freetech/SmartChart/actions/workflows/python-desktop.yml), then download the matching operating-system artifact. PyInstaller packages are not represented as signed or platform-certified.

## Features

- Load or paste CSV, TSV, and JSON tables (local only); inspect columns and values.
- Recommend compatible charts, select axes, and preview six data-backed Python renderers: vertical Bar, Line, Area, Scatter, Histogram, and Donut.
- Export the current dataset as UTF-8 CSV and rendered charts as SVG.
- Browse the **40 original chart types**, textbook descriptions, source links, methodological cautions, and schematic SVG examples through Python's atlas tab.
- Keep reported measurements distinct from synthetic examples; name units, data sources, and time periods.

**Scope/portability:** Only six chart renderers and their current recommendation rules are implemented in Python. The other 34 types are reference-only; the previous browser engine's more detailed 40-type suitability evaluation is **not yet ported**. No browser functionality is implied. The source catalog and [chart-selection research protocol](docs/chart-selection-protocol-v2.md) remain intact for future Python implementations.

## Repository layout

- `desktop/smartchart.py`: Python application, parsing, advice, SVG rendering, desktop interface.
- `desktop/gui_smoke.py`, `desktop/test_smartchart.py`: Python GUI and model checks.
- `tests/test_catalog.py`: Python atlas integrity and Python-only source audit.
- `atlas/catalog.json`: 40 chart definitions and historical notes.
- `atlas/examples/`: 40 synthetic SVG illustrations; `atlas/2026/`: editorial chart asset.
- `docs/`: 40-chart textbook, selection methodology, and migration notes.
- `.github/workflows/`: Python tests, headless GUI smoke checks and PyInstaller packaging.

## Test

```sh
python -m unittest discover -s desktop -p "test_*.py" -v
python -m unittest discover -s tests -p "test_*.py" -v
```

The Linux CI build also exercises Tkinter using Xvfb; every OS packages a Python executable. Run interactively on target operating systems before treating installer/GUI behavior as fully validated.

## Editorial standards

For publication, verify the underlying data and units, put normal bar charts on zero baselines, distinguish observations from forecasts, and avoid interpreting correlation as causation. Atlas SVG thumbnails illustrate chart shapes; they are **not observed data**.

Original atlas attribution: [BitcoinVersus.Tech chart atlas](https://github.com/1freetech/Bitcoinversus.tech/tree/main/editorial/chart-atlas).
