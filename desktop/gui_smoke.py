"""Tkinter UI smoke checks; run under xvfb-run on Linux."""
from smartchart import SmartChartApp, svg_document


def main():
    app = SmartChartApp()
    try:
        app.update()
        assert len(app.rows) >= 3, "Startup data analysis failed"
        assert app.shapes, "Startup chart preview not rendered"
        app.chart.set("Scatter")
        app.xaxis.set("Year")
        app.yaxis.set("ASIC efficiency J/TH")
        app.draw()
        app.update()
        assert "<svg" in svg_document(app.shapes), "Scatter SVG not rendered"
        for label, dataset in (
            ("CSV", "Label,Value\nA,4\nB,7\nC,5"),
            ("TSV", "Label\tValue\nA\t4\nB\t7\nC\t5"),
            ("JSON", '[{"Label":"A","Value":4},{"Label":"B","Value":7},{"Label":"C","Value":5}]'),
        ):
            app.raw.delete("1.0", "end")
            app.raw.insert("1.0", dataset)
            app.analyze()
            app.update()
            assert len(app.rows) == 3, f"{label} import failed"
            assert "Label" in app.headers and "Value" in app.headers, (
                f"{label} column headers missing"
            )
        app.chart.set("Donut")
        app.draw()
        app.update()
        assert any(name == "arc" for name, _ in app.shapes), "Donut not rendered"
        assert len(app.atlas_list.get(0, "end")) == 40, "Chart atlas not loaded"
        print("SmartChart GUI smoke: CSV, TSV, JSON, scatter, donut, SVG and atlas passed.")
    finally:
        app.destroy()


if __name__ == "__main__":
    main()
