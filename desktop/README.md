# SmartChart Python desktop app

The new `desktop/smartchart.py` is an **offline Tkinter chart studio** in the style of the `1freetech/Lexicon` Python desktop tool. The current browser version remains intact.

## Download and run from source

1. Choose **Code → Download ZIP** on this branch and extract the entire repository. The Python program uses the existing `atlas/catalog.json` for source-grounded chart descriptions.
2. Install Python 3.12+ with Tkinter.
3. Run `python desktop/smartchart.py`.

The Studio tab imports CSV/TSV/JSON files or pasted data, analyzes numeric fields, recommends three compatible chart styles, allows axis and renderer selection, previews data-backed charts, and exports **UTF-8 CSV** datasets or **SVG** graphics. Supported desktop renderers: **Bar, Line, Area, Scatter, Histogram, Donut**. The original 40-format atlas is browsable in the second tab; the remaining specialist formats are marked as **reference-only**, not falsely claimed as rendered. The initial example is synthetic and labeled as such. No uploaded data leaves the desktop app.

## Download a packaged application

A `Python desktop build` GitHub Actions workflow builds Windows, macOS and Linux binaries with PyInstaller. After a successful run, visit **Actions → Python desktop build → Artifacts**, and download `SmartChart-<OS>`. The ZIP includes the OS executable and bundled atlas. Windows launches `SmartChart.exe`; other systems use their corresponding build. These packages are not yet certified on all real machines, and unsigned macOS binaries may require local approval.

## Development checks

```shell
python -m unittest discover -s desktop -p "test_*.py" -v
```

The regression tests run without a display and check CSV/JSON import, numeric parsing, recommendations, SVG export and invalid-data handling. GUI click testing, file dialogs, accessibility and platform packaging still require real machine validation.

The desktop application is a **first functional Python port**, not parity with every existing browser chart renderer or specialized 40-format evaluator. Improve the port without discarding vetted atlas references.
