"""Forty-chart data-to-SVG regression tests: standard library only."""
import json
import sys
import unittest
from pathlib import Path
from xml.etree import ElementTree

sys.path.insert(0,str(Path(__file__).resolve().parent))
from smartchart import build_shapes, svg_document, parse_data, chart_advice, KINDS

BASIC=[
 {"Label":"A","Value":2,"Second":3,"Third":5,"Fourth":4},
 {"Label":"B","Value":4,"Second":6,"Third":8,"Fourth":5},
 {"Label":"C","Value":3,"Second":5,"Third":6,"Fourth":4},
 {"Label":"D","Value":5,"Second":9,"Third":10,"Fourth":6},
 {"Label":"E","Value":6,"Second":11,"Third":12,"Fourth":8},
 {"Label":"F","Value":7,"Second":12,"Third":14,"Fourth":9},
 {"Label":"G","Value":8,"Second":13,"Third":15,"Fourth":11},
 {"Label":"H","Value":9,"Second":14,"Third":16,"Fourth":12},
 {"Label":"I","Value":10,"Second":15,"Third":17,"Fourth":13},
 {"Label":"J","Value":11,"Second":16,"Third":18,"Fourth":14},
]
def fixture(kind):
    if kind=="Candlestick":
        return ([{"Date":f"2026-11-{i+1:02d}","Open":4+i,"High":7+i,"Low":2+i,"Close":5+i} for i in range(6)],"Date","Open")
    if kind=="Radar":
        return ([{"Category":"Device","A":20,"B":40,"C":60,"D":80}],"Category","A")
    if kind=="Gauge":
        return ([{"Label":"Power","Value":60,"Maximum":100}],"Label","Value")
    if kind=="Sankey":
        return ([{"Source":"GPU","Target":"Compute","Value":10},
                 {"Source":"Power","Target":"Compute","Value":15}],"Source","Value")
    if kind=="Gantt":
        return ([{"Task":"Rack A","Start":"2026-11-01","End":"2026-11-10"},
                 {"Task":"Rack B","Start":"2026-11-05","End":"2026-11-16"}],"Task","Start")
    if kind=="Calendar heatmap":
        return ([{"Date":f"2026-11-{i+1:02d}","Value":i+1} for i in range(10)],"Date","Value")
    if kind=="Choropleth map":
        return ([{"State":"Region A","Value":10,"geometry":json.dumps({"type":"Polygon","coordinates":[[[0,0],[1,0],[1,1],[0,1],[0,0]]]})},
                 {"State":"Region B","Value":20,"geometry":json.dumps({"type":"Polygon","coordinates":[[[1,0],[2,0],[2,1],[1,1],[1,0]]]})}],"State","Value")
    if kind=="Proportional-symbol map":
        return ([{"Location":"A","Latitude":47,"Longitude":-122,"MW":10},
                 {"Location":"B","Latitude":35,"Longitude":-115,"MW":20}],"Location","Latitude")
    if kind=="Funnel":
        return ([{"Label":"All","Value":100},{"Label":"Qualified","Value":80},{"Label":"Accepted","Value":50}],"Label","Value")
    if kind=="100% stacked bars":
        return (BASIC,"Label","Value")
    if kind=="Bump chart":
        return (BASIC,"Label","Value")
    return BASIC,"Label","Value"

class AtlasRegressionTests(unittest.TestCase):
    def test_all_forty_have_unique_id_and_output(self):
        self.assertEqual(len(KINDS),40)
        self.assertEqual(len(set(KINDS.values())),40)
        for kind in KINDS.values():
            with self.subTest(chart=kind):
                rows,x,y=fixture(kind)
                shapes=build_shapes(rows,x,y,kind)
                self.assertGreater(len(shapes),2)
                doc=svg_document(shapes)
                root=ElementTree.fromstring(doc)
                self.assertEqual(root.tag.rsplit("}",1)[-1],"svg")
                self.assertIn('width="920"',doc)

    def test_recommendations_are_ranked_and_named(self):
        names,rows=parse_data("Year,Metric,Comparison\n2023,10,11\n2024,20,22\n2025,30,33")
        choices=chart_advice(names,rows)
        self.assertTrue(1<=len(choices)<=3)
        self.assertTrue(all(x[0] in KINDS.values() for x in choices))
        self.assertIn("Line",[x[0] for x in choices])

    def test_semantic_guards(self):
        with self.assertRaisesRegex(ValueError,"nonnegative"):
            build_shapes([{"Category":"A","Value":-5,"Other":1}],
                         "Category","Value","Stacked bars")
        with self.assertRaisesRegex(ValueError,"geometry"):
            build_shapes([{"Region":"A","Value":1}],"Region","Value","Choropleth map")
        with self.assertRaisesRegex(ValueError,"nonincreasing"):
            build_shapes([{"Stage":"A","Value":2},{"Stage":"B","Value":5}],
                         "Stage","Value","Funnel")

if __name__=="__main__":
    unittest.main()
