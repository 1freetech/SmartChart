# SmartChart — Python desktop

Run `python desktop/smartchart.py` from the repository root, with Python 3.12+ and Tkinter installed. The full 40-chart atlas is also embedded in the Python script, so copying `desktop/smartchart.py` alone works without `atlas/catalog.json`. Downloading the complete repository remains recommended for the original SVG example illustrations and docs. The Python GUI supports CSV/TSV/JSON import or paste, numeric-column inference, six chart renderers (Bar, Line, Area, Scatter, Histogram, Donut), chart preview, CSV and SVG exports, and a browseable 40-chart atlas. No data is sent to a server.

The original JavaScript/HTML frontend has been retired from this repository. SVG gallery illustrations are static resources, **not runtime frontend code**. The remaining 34 atlas formats are guide/reference entries, and the old JavaScript historical suitability engine has not been ported to Python.

Packaged app downloads are produced by [Python desktop build](https://github.com/1freetech/SmartChart/actions/workflows/python-desktop.yml) for Windows, macOS and Linux. Download the latest successful artifact for your OS. Unsigned builds may require local approval and have not all been end-to-end certified.

Checks:

```sh
python -m unittest discover -s desktop -p "test_*.py" -v
python -m unittest discover -s tests -p "test_*.py" -v
```

Headless unit tests cover data parsing and rendering; Xvfb smoke checks run on Linux CI. Manual file-dialog, accessibility, and platform validation remain necessary.
