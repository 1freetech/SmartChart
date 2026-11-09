# Chart Atlas provenance and Python-only migration

Source: https://github.com/1freetech/Bitcoinversus.tech/tree/main/editorial/chart-atlas

SmartChart began by copying the original 40 SVG chart examples, illustrated editorial case study, standalone HTML atlas and references. The historical web files were part of the **initial import only**. As of the Python-only migration, SmartChart no longer carries `atlas/index.html`, root `index.html`, CSS, or JavaScript modules and tests. The original source remains available in the attribution repository and prior Git history.

The **40 SVG examples**, the `atlas/2026/` graphic, `atlas/catalog.json`, and the chart textbook are preserved. Illustrations are synthetic, not measured data. The energy megaprojects case study compares announced/planned capacities, not homogeneous measured operating load.

Current Python desktop implementation: `desktop/smartchart.py`. Six types render from user data. Remaining specialist chart types are reference-only; the retired browser engine's 40-style suitability scoring requires a separate Python port. Use primary-source numerical verification before publication.
