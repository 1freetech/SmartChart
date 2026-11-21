"""Python-only source audit and 40-chart atlas integrity regression tests."""
from __future__ import annotations

import json
import unittest
from pathlib import Path
from xml.etree import ElementTree

ROOT = Path(__file__).resolve().parent.parent
NON_PYTHON_PROGRAMS = {".js", ".mjs", ".cjs", ".jsx", ".ts", ".tsx", ".html", ".htm", ".css", ".scss"}


class CatalogTests(unittest.TestCase):
    def test_catalog_contains_40_unique_chart_types(self):
        catalog = json.loads((ROOT / "atlas/catalog.json").read_text(encoding="utf-8"))
        charts = catalog["charts"]
        self.assertEqual(len(charts), 40)
        self.assertEqual(len({c["id"] for c in charts}), 40)
        for chart in charts:
            with self.subTest(chart=chart["id"]):
                self.assertTrue(chart["name"])
                self.assertTrue(chart["family"])
                self.assertTrue(chart["bestFor"])
                self.assertTrue(chart["caution"])
                self.assertTrue(chart["textbook"]["paragraph"])
                self.assertGreaterEqual(len(chart["textbook"]["sources"]), 2)
                artwork = ROOT / chart["illustration"]
                self.assertTrue(artwork.is_file(), artwork)
                self.assertEqual(ElementTree.parse(artwork).getroot().tag.rsplit("}", 1)[-1], "svg")

    def test_no_non_python_application_code(self):
        # Published Gutenberg snippets are archival article exports, not an
        # executable browser frontend. Keep checking every other location.
        def archived_gutenberg_export(path: Path) -> bool:
            relative = path.relative_to(ROOT)
            return (
                len(relative.parts) == 3
                and relative.parts[:2] == ("atlas", "2026")
                and relative.name.endswith("-published-gutenberg.html")
            )

        left = [str(p.relative_to(ROOT)) for p in ROOT.rglob("*")
                if p.is_file()
                and p.suffix.lower() in NON_PYTHON_PROGRAMS
                and not archived_gutenberg_export(p)]
        self.assertEqual(left, [], "Executable web/JavaScript code must not return")

    def test_python_desktop_entrypoint_exists(self):
        self.assertTrue((ROOT / "desktop/smartchart.py").is_file())


if __name__ == "__main__":
    unittest.main()
