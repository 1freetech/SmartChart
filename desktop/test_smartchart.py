"""Headless parser, model and SVG export regression tests."""
import sys
import unittest
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from smartchart import parse_data, numeric, numeric_columns, chart_advice, build_shapes, svg_document


class SmartChartTests(unittest.TestCase):
    def test_csv_and_json_import(self):
        names, rows = parse_data('Year,Value\n2024,17\n2025,12\n2026,8.9')
        self.assertEqual(names, ['Year', 'Value'])
        self.assertEqual(len(rows), 3)
        self.assertEqual(numeric('(1,200.5)'), -1200.5)
        n2, r2 = parse_data('[{"Category":"A","Value":3},{"Category":"B","Value":4}]')
        self.assertEqual(n2, ['Category', 'Value'])
        self.assertEqual(numeric_columns(n2, r2), ['Value'])

    def test_chart_recommendations(self):
        names, rows = parse_data('Year,Value\n2024,17\n2025,12\n2026,8.9')
        self.assertIn("Line", [x[0] for x in chart_advice(names, rows)])

    def test_svg_renderers(self):
        names, rows = parse_data('Label,Value,Second\nA,15,3\nB,30,6\nC,5,9')
        for kind in ('Bar', 'Line', 'Area', 'Scatter', 'Histogram', 'Donut'):
            chart = build_shapes(rows, 'Second' if kind == 'Scatter' else 'Label',
                                 'Value', kind)
            svg = svg_document(chart)
            self.assertIn('<svg ', svg)
            self.assertIn('</svg>', svg)
            self.assertGreater(len(chart), 3)

    def test_reject_bad_data(self):
        with self.assertRaises(ValueError):
            parse_data('name,value')
        with self.assertRaises(ValueError):
            build_shapes([{'x':'a','y':-2}], 'x', 'y', 'Donut')


if __name__ == '__main__':
    unittest.main()
