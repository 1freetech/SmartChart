# SC26 TOP500 / Green500 editorial SmartChart datasets — November 2026

Used in the article https://bitcoinversus.tech/2026/11/21/sc26-top500-27-new-supercomputers-green500-7328-gflops-per-watt-november-2026/.

Data are **measured benchmark submissions**, not annual energy usage, forecasts, or predictions. Performance chart units: EFLOP/s HPL Rmax. Efficiency chart units: HPL GFLOPS/W. The two metrics have distinct axes and must not be grouped together or used to infer Bitcoin SHA-256 J/TH.

Selection review (SmartChart 40-type atlas): vertical **Bar** is selected for comparable numeric values grouped by short categories; **Lollipop** is a valid sparse alternate but is less familiar; **Grouped bars** is rejected because the two datasets use unrelated units and metric semantics. Keep both bar chart zero baselines; label units, dates and source URLs.

Source: https://www.top500.org/lists/top500/list/2026/11/ and https://www.top500.org/lists/green500/list/2026/11/ (November 16, 2026).

Reproduction: open the CSV in the Python/Tkinter desktop studio from https://github.com/1freetech/SmartChart, select X = System and Y = HPL Rmax or Efficiency, and choose Bar. Export SVG. The article uses PNG rasters exported using the SmartChart base Bar shape/SVG layout logic with editorial title/data labels, source notes and the approved BitcoinVersus.tech watermark added for publication.

Live WordPress chart attachments: media 34389 (TOP500) and 34390 (Green500). Original PNG exports 1600 x 1060, source atlas SVG 920 x 550; the user should be able to select the figure for full-size review.
