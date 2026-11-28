# SmartChart reference expansion (41–80)

40 additional schematic examples for reference and editorial use. The original desktop catalog retains 40 functional renderers; the additional examples are not data-driven renderers yet. All visualizations are synthetic schematic illustrations, not calibrated observations.

## 41. Ridgeline plot

Overlapping density curves compare distributions. **Application:** ASIC temperature distributions. **Caution:** Use consistent bandwidth.

![Ridgeline plot](examples/41-ridgeline.svg)

## 42. Q–Q plot

Sample quantiles against theoretical quantiles reveal distribution differences. **Application:** Network latency diagnostics. **Caution:** Do not infer independence.

![Q–Q plot](examples/42-qq.svg)

## 43. P–P plot

Empirical and theoretical cumulative probabilities are compared against equality. **Application:** Outage-duration models. **Caution:** Tail differences may be obscured.

![P–P plot](examples/43-pp.svg)

## 44. ECDF plot

A staircase records the fraction of samples at or below a threshold. **Application:** Latency percentiles. **Caution:** Report sample size.

![ECDF plot](examples/44-ecdf.svg)

## 45. Forest plot

Points and horizontal intervals compare estimates and uncertainty. **Application:** Benchmark effects by device. **Caution:** Declare interval type.

![Forest plot](examples/45-forest.svg)

## 46. Error-bar plot

Interval endpoints around estimates show variability or uncertainty. **Application:** Repeated power measurements. **Caution:** Distinguish SD from confidence intervals.

![Error-bar plot](examples/46-errorbar.svg)

## 47. Residual plot

Observed minus fitted values are plotted against fitted values. **Application:** Power regression diagnostics. **Caution:** Patterns suggest model misspecification.

![Residual plot](examples/47-residual.svg)

## 48. Autocorrelation plot

Correlations with lagged copies of a series reveal persistence. **Application:** Periodic power demand. **Caution:** Account for nonstationarity.

![Autocorrelation plot](examples/48-acf.svg)

## 49. Partial autocorrelation plot

Lagged correlation after controlling for shorter lags helps identify autoregressive order. **Application:** Telemetry models. **Caution:** Report sampling uncertainty.

![Partial autocorrelation plot](examples/49-pacf.svg)

## 50. Lag plot

Observations are plotted against earlier observations. **Application:** Detecting serial dependence. **Caution:** Specify the lag.

![Lag plot](examples/50-lag.svg)

## 51. Bode plot

Gain and phase appear on aligned logarithmic frequency axes. **Application:** Power supply feedback. **Caution:** Specify frequency units.

![Bode plot](examples/51-bode.svg)

## 52. Nyquist plot

A complex frequency-response trajectory reveals feedback behavior. **Application:** Control-system stability. **Caution:** Interpret encirclements with open-loop poles.

![Nyquist plot](examples/52-nyquist.svg)

## 53. Smith chart

Complex reflection coefficient maps onto a normalized impedance grid. **Application:** RF matching. **Caution:** Declare reference impedance.

![Smith chart](examples/53-smith.svg)

## 54. Nichols chart

Gain in decibels is plotted against phase in degrees. **Application:** Controller margin analysis. **Caution:** Distinguish from Nyquist coordinates.

![Nichols chart](examples/54-nichols.svg)

## 55. Root locus plot

Closed-loop poles trace paths as feedback gain changes. **Application:** Regulator stability. **Caution:** Declare gain range and feedback convention.

![Root locus plot](examples/55-rootlocus.svg)

## 56. Spectrogram

Color represents signal power or magnitude by time and frequency. **Application:** Fan vibration. **Caution:** Specify window and overlap.

![Spectrogram](examples/56-spectrogram.svg)

## 57. Power spectral density

Power per frequency bandwidth is plotted against frequency. **Application:** Switching noise. **Caution:** State units and estimator.

![Power spectral density](examples/57-psd.svg)

## 58. Quiver plot

Arrows encode vector direction and magnitude at spatial points. **Application:** Rack airflow. **Caution:** Explain arrow scale.

![Quiver plot](examples/58-quiver.svg)

## 59. Streamline plot

Curves follow instantaneous vector-field directions. **Application:** Liquid cooling. **Caution:** Not necessarily particle paths in unsteady flow.

![Streamline plot](examples/59-streamline.svg)

## 60. Contour plot

Lines connect equal scalar values. **Application:** Heat-sink temperature. **Caution:** Label levels and interpolation.

![Contour plot](examples/60-contour.svg)

## 61. 3D scatter plot

Points occupy three coordinate axes. **Application:** Throughput, temperature and power. **Caution:** Projection can hide points.

![3D scatter plot](examples/61-scatter3d.svg)

## 62. 3D surface plot

A response surface maps two input variables to one output. **Application:** Voltage-frequency optimization. **Caution:** Distinguish measured and interpolated regions.

![3D surface plot](examples/62-surface3d.svg)

## 63. 3D mesh plot

Connected vertices and faces depict geometry or sampled surfaces. **Application:** Heat-sink geometry. **Caution:** Declare mesh resolution.

![3D mesh plot](examples/63-mesh3d.svg)

## 64. Isosurface plot

A surface marks equal values in a volumetric field. **Application:** Thermal thresholds. **Caution:** Specify threshold and interpolation.

![Isosurface plot](examples/64-isosurface.svg)

## 65. Ternary plot

Three nonnegative fractions summing to one occupy a triangle. **Application:** Three-source energy mix. **Caution:** Normalize only meaningful totals.

![Ternary plot](examples/65-ternary.svg)

## 66. Parallel coordinates

Each record connects multiple parallel variable axes. **Application:** Mining hardware comparisons. **Caution:** Declare normalization and axis order.

![Parallel coordinates](examples/66-parallel.svg)

## 67. Scatterplot matrix

A grid displays pairwise scatterplots and diagonal distributions. **Application:** Telemetry correlations. **Caution:** Correlation is not causation.

![Scatterplot matrix](examples/67-scattermatrix.svg)

## 68. Carpet plot

Two families of parameter curves form a response grid. **Application:** Pump operating envelopes. **Caution:** Label both parameter families.

![Carpet plot](examples/68-carpet.svg)

## 69. Polar plot

Angle and radius encode directional values. **Application:** Antenna radiation. **Caution:** Declare angular origin and radial units.

![Polar plot](examples/69-polar.svg)

## 70. Icicle chart

Nested rectangles encode hierarchical quantities by depth. **Application:** Data-center budgets. **Caution:** Child totals must reconcile.

![Icicle chart](examples/70-icicle.svg)

## 71. OHLC bar chart

High-low lines carry left-open and right-close ticks. **Application:** Bitcoin trading ranges. **Caution:** Declare venue and interval.

![OHLC bar chart](examples/71-ohlc.svg)

## 72. Fan chart

Nested uncertainty intervals depict forecasts over time. **Application:** Efficiency projections. **Caution:** Scenarios are not probabilities without calibration.

![Fan chart](examples/72-fan.svg)

## 73. Horizon chart

Magnitude bands are folded into a compact colored time-series strip. **Application:** Power telemetry. **Caution:** Use consistent band size.

![Horizon chart](examples/73-horizon.svg)

## 74. Streamgraph

Multiple nonnegative series stack around a shifting baseline. **Application:** Energy composition. **Caution:** Baseline complicates absolute comparisons.

![Streamgraph](examples/74-streamgraph.svg)

## 75. Drawdown chart

Decline from a running peak is plotted as a percentage. **Application:** Bitcoin risk. **Caution:** Use consistent sampling.

![Drawdown chart](examples/75-drawdown.svg)

## 76. Order-book depth chart

Cumulative bids and asks are plotted by price. **Application:** Exchange liquidity. **Caution:** Orders may be cancelled.

![Order-book depth chart](examples/76-orderbook.svg)

## 77. Load duration curve

Descending power measurements are plotted against exceedance duration. **Application:** Grid and facility sizing. **Caution:** Chronology is lost.

![Load duration curve](examples/77-loadduration.svg)

## 78. Learning curve

Unit cost or performance is related to cumulative production. **Application:** ASIC manufacturing economics. **Caution:** Cumulative output is not calendar time.

![Learning curve](examples/78-learning.svg)

## 79. Pareto frontier

Nondominated options show trade-offs between competing objectives. **Application:** Miner cost versus energy intensity. **Caution:** Declare optimization direction.

![Pareto frontier](examples/79-paretofrontier.svg)

## 80. Network graph

Nodes and edges represent entities and relationships. **Application:** Switch and server topology. **Caution:** Layout distance need not be physical.

![Network graph](examples/80-network.svg)

## Further reading
- https://matplotlib.org/stable/gallery/
- https://plotly.com/python/
- https://www.itl.nist.gov/div898/handbook/
- https://python-control.readthedocs.io/en/stable/
