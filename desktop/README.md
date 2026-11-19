# SmartChart — Python/Tkinter desktop

Run `python desktop/smartchart.py` from the repository root with Python 3.12+ and Tkinter installed. The Python application imports local CSV, TSV and JSON datasets (or pasted tabular data), infers numeric columns, recommends compatible chart types, previews charts in a native Tkinter canvas, and exports data to CSV and the rendered chart to SVG. No data is sent to a server.

## Chart support and limitations

The atlas contains **40 named chart methods**, and `desktop/atlas_renderers.py` provides a Python shape renderer for every method. The six original base methods (Bar, Line, Area, Scatter, Histogram and Donut) remain available. Other methods use the Python atlas engine, with input-dependent semantic guards: a renderer's presence does **not** mean that arbitrary input data can be meaningfully displayed in that format. The application analyzes the dataset and ranks compatible choices; unsupported or semantically invalid combinations should fail with a visible error rather than silently inventing values.

The `desktop/test_atlas_renderers.py` regression suite exercises representative inputs for all 40 methods and checks that exported SVG is well-formed. This is automated fixture coverage, **not** a claim of full visual or numerical certification for every chart method. Interactive manipulation is limited to the application's Tkinter controls and chart selection; SVG export is a static vector file, not an interactive chart.

The complete 40-entry catalog is embedded in `desktop/smartchart.py` for offline use, while `atlas/catalog.json` remains the authoritative catalog. The source engine is also embedded for single-file Python operation.

## Browser frontend and parity

The earlier JavaScript/HTML frontend is **not present** in the current repository. The `atlas` illustrations are static reference SVGs rather than a working browser application. Browser fallback restoration and parity review remain open in [issue #5](https://github.com/1freetech/SmartChart/issues/5). Do not claim browser parity until a functioning fallback and its original capabilities have been verified.

## Cross-platform downloads and testing

[Python desktop build](https://github.com/1freetech/SmartChart/actions/workflows/python-desktop.yml) builds Windows, macOS and Linux PyInstaller artifacts. Select the latest successful run **for the desired source commit** and download the matching operating-system artifact. GitHub Actions package-launch smoke tests check basic executable startup, but do not establish complete manual GUI functionality on each OS. Unsigned binaries may require local operating-system approval.

Run the source regression suites:

```sh
python -m unittest discover -s desktop -p "test_*.py" -v
python -m unittest discover -s tests -p "test_*.py" -v
```

Linux CI also runs the Tkinter GUI smoke test under Xvfb. Remaining release acceptance includes real platform launches, file dialogs, accessibility, renderer-specific visual checks, data/units validation and import/export round trips. See the workflow run logs for tests actually executed.
