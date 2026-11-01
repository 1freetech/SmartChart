# SmartChart Encyclopedic Chart Textbook

**Edition 2.0 · November 1, 2026 · 40 chart entries, six new sentences each.**

This companion to the interactive Chart Atlas explains each visualization in the language of historical statistical practice and modern technical reporting. The historical origins and methodological traditions inform chart selection; they do **not** provide measured frequencies of historical use or imply that older chart types are automatically better. Each entry has exactly six interpretive sentences: history, mathematics, data requirements, modern interpretation, interpretive risks, and comparison to alternatives. Individual references are linked after each entry.

## Selection framework

SmartChart first asks *what mathematical relationship do the data encode?* It then checks variable roles and measurement validity, whether the historical form is appropriate for those relationships, the reader's analytical goal, and modern legibility and data-integrity requirements. A chart may be appropriate even when its renderer is not yet implemented; unsupported chart types must be identified as reference candidates rather than silently substituted. Historical chart history is scholarly background, **not** a computed empirical popularity weight.

## 1. Line chart

**Family:** Trends · **Historical dataset relationship:** `ordered_time_measure` · **Data renderer:** Available

Statistical line graphs were popularized for economic time series by William Playfair, linking recorded observations in their chronological sequence. The mathematical operation maps each ordered time point to a measured value and draws connecting segments to expose rates of change. Use the form when the horizontal variable has a defensible sequence and repeated measurements share units and definitions. Modern analysts use it for ASIC joules per terahash, electricity demand, market indices, and scientific sensor histories. Keep gaps visible when sampling was interrupted because a continuous line may otherwise imply unsupported intermediate observations. Choose bars instead for independent categories, and choose a step chart when the quantity changes instantaneously at defined events.

**SmartChart example:** ASIC efficiency (J/TH), 2000–2026.

**Editorial caution:** Use real observation dates; label missing periods.

**Read further:** [Mathematical Association of America — History of statistical graphs](https://old.maa.org/press/periodicals/convergence/seeing-and-understanding-data-a-mini-primary-source-project-for-students-of-statistics?device=mobile) · [Wilke — Time-series visualization](https://clauswilke.com/dataviz/time-series.html)

## 2. Area chart

**Family:** Trends · **Historical dataset relationship:** `ordered_time_magnitude` · **Data renderer:** Available

Filled time-series graphs grew from the same quantitative tradition as Playfair-style line charts, with area emphasizing total magnitude. At each time point the filled region extends from a fixed baseline to the observed value, so its shape encodes absolute size. Use it for nonnegative, consistently measured sequences when magnitude and cumulative visual weight are more important than precise point comparison. Modern examples include sustained data-center load, annual energy generation, and the installed capacity of robotics fleets. Truncated baselines or unrelated overlapping filled regions can exaggerate amounts and conceal one series behind another. Choose a line when slopes and exact changes matter most, and choose stacked area only when components form a meaningful total.

**SmartChart example:** Total installed industrial robot capacity.

**Editorial caution:** Avoid if overlapping series obscure each other.

**Read further:** [Wilke — Time-series visualization](https://clauswilke.com/dataviz/time-series.html) · [Financial Times — Visual Vocabulary](https://github.com/Financial-Times/chart-doctor/blob/main/visual-vocabulary/README.md)

## 3. Stacked area

**Family:** Trends · **Historical dataset relationship:** `ordered_time_additive_components` · **Data renderer:** Reference only

Statistical area diagrams were adapted to examine the evolving mix of categories within an economic or demographic total. Each band is cumulatively placed on the sum of preceding bands, making its vertical thickness represent its component amount. Require nonnegative, additive components observed at shared time points with matching units and clearly stated coverage. Use it today for electricity-generation mixes, hardware revenue segments, or portions of an evolving cloud workload. Middle bands lack a common baseline, and missing categories can make apparent compositional change indistinguishable from reporting change. Prefer separate lines to compare individual trajectories, or 100-percent stacks when the question concerns share rather than absolute total.

**SmartChart example:** Global electricity generation by source.

**Editorial caution:** Absolute amounts and shares answer different questions.

**Read further:** [Wilke — Time-series visualization](https://clauswilke.com/dataviz/time-series.html) · [Wilke — Visualizing proportions](https://clauswilke.com/dataviz/visualizing-proportions.html)

## 4. Step chart

**Family:** Trends · **Historical dataset relationship:** `discrete_state_changes` · **Data renderer:** Reference only

Piecewise-constant plots reflect mathematical step functions long used for tariffs, schedules, discrete control states, and policy regimes. Between documented change points the value remains constant, and jumps occur only at a specified boundary. Use this form for event-timestamped rates, rule states, reward schedules, or operational thresholds rather than smoothly varying measurements. Bitcoin subsidy epochs and staged power-capacity approvals are modern examples where a sloped interpolation would be misleading. Define whether changes take effect before or after each timestamp because left- versus right-continuous steps differ. Prefer a line for continuously sampled temperatures or prices, not a stair-step unless observations genuinely represent discrete regimes.

**SmartChart example:** Bitcoin block subsidies after halvings.

**Editorial caution:** Do not interpolate gradual change between steps.

**Read further:** [Wilke — Time-series visualization](https://clauswilke.com/dataviz/time-series.html) · [Financial Times — Visual Vocabulary](https://github.com/Financial-Times/chart-doctor/blob/main/visual-vocabulary/README.md)

## 5. Candlestick

**Family:** Trends · **Historical dataset relationship:** `time_ohlc` · **Data renderer:** Reference only

Candlestick displays belong to a long Japanese market-charting tradition, later standardized in modern financial analysis for interval quotations. Each mark encodes four order-statistic-like market observations: open, high, low, and close within one defined interval. Require all four consistently timestamped prices with high at least as large as open and close and low no greater than either. Modern trading interfaces use candles to summarize Bitcoin, equities, and commodity price intervals alongside separate volume panels. Color conventions are not universal, and the display does not reveal intraperiod transaction paths or trading volume by itself. Choose a line for a single closing-price series, or a range plot when only interval minima and maxima are available.

**SmartChart example:** Bitcoin daily OHLC trading ranges.

**Editorial caution:** Price candles do not show transaction volume.

**Read further:** [Wilke — Time-series visualization](https://clauswilke.com/dataviz/time-series.html) · [Financial Times — Visual Vocabulary](https://github.com/Financial-Times/chart-doctor/blob/main/visual-vocabulary/README.md)

## 6. Sparkline

**Family:** Trends · **Historical dataset relationship:** `ordered_time_measure` · **Data renderer:** Reference only

Sparklines extend the compact time-series tradition into dense tables and were promoted as word-sized statistical graphics. The display compresses an ordered numeric sequence into a small trajectory, generally minimizing axes and annotation. Use sparklines only where surrounding labels provide a metric name, observation interval, scale, and context. Modern infrastructure dashboards place uptime, equipment error rates, and throughput history beside rows of operational KPIs. Without consistent scales across rows, two sparklines can appear similarly volatile despite dramatically different measurement ranges. Use a full line chart whenever the reader must inspect exact dates, comparative magnitudes, or uncertainty.

**SmartChart example:** 30-day miner uptime in equipment tables.

**Editorial caution:** Pair with a clear metric, unit, and time window.

**Read further:** [Wilke — Time-series visualization](https://clauswilke.com/dataviz/time-series.html) · [Financial Times — Visual Vocabulary](https://github.com/Financial-Times/chart-doctor/blob/main/visual-vocabulary/README.md)

## 7. Slopegraph

**Family:** Trends · **Historical dataset relationship:** `paired_endpoints` · **Data renderer:** Reference only

Slopegraphs simplify historical before-and-after tables by connecting a small set of corresponding values at two endpoints. Each segment's slope shows direction and size of change between matched subjects on a shared numeric scale. Require paired measurements with identical units, compatible definitions, and exactly two explicitly named periods or conditions. Use the chart for pre-upgrade versus post-upgrade site power draw or paired hardware efficiency benchmarks. The line says nothing about intermediate movements, and crossing lines become difficult to interpret when there are many groups. Choose a dumbbell plot for an especially compact paired-value comparison or a time-series chart if intermediate observations exist.

**SmartChart example:** Site power draw before and after upgrades.

**Editorial caution:** Two endpoints cannot prove what happened between.

**Read further:** [Financial Times — Visual Vocabulary](https://github.com/Financial-Times/chart-doctor/blob/main/visual-vocabulary/README.md) · [Wilke — Visualizing amounts](https://clauswilke.com/dataviz/visualizing-amounts.html)

## 8. Bump chart

**Family:** Trends · **Historical dataset relationship:** `repeated_rankings` · **Data renderer:** Reference only

Rank-order diagrams developed from recurring league tables and the mathematical task of tracking changing ordinal positions. Each line connects an entity's rank in successive periods; the vertical axis encodes order rather than measured magnitude. Require a rank per entity and period derived from the same metric, with a disclosed approach to ties and missing entries. Modern examples include yearly GPU-shipment rankings, top chipmakers by revenue position, and model benchmark leaderboards. Changes in rank can occur without meaningful absolute change, so do not present them as evidence of growth in share. Choose multi-series lines or bars when the magnitude of the underlying quantity matters more than placement.

**SmartChart example:** Top GPU vendors by yearly shipment rank.

**Editorial caution:** Show rank, not absolute share, on the vertical axis.

**Read further:** [Financial Times — Visual Vocabulary](https://github.com/Financial-Times/chart-doctor/blob/main/visual-vocabulary/README.md) · [Wilke — Time-series visualization](https://clauswilke.com/dataviz/time-series.html)

## 9. Horizontal / vertical bar

**Family:** Comparisons · **Historical dataset relationship:** `categorical_magnitudes` · **Data renderer:** Available

William Playfair helped establish the bar chart for comparing economic observations by category rather than following an ordered curve. The length of each rectangle encodes an amount measured from a common zero, allowing direct magnitude comparison. Use it for one numeric measure across independent named categories, including clearly defined groups and consistent denominators. Modern reporting uses horizontal bars for megawatt rankings, ASIC shipments by manufacturer, and counts of data-center projects. Sorting unordered categories usually helps, while arbitrary category rearrangement or truncated value axes can distort ranking. Choose a line for genuine temporal continuity and a dot plot when the value range is narrow relative to a meaningful nonzero baseline.

**SmartChart example:** Largest data center projects by MW.

**Editorial caution:** Start the value axis at zero for ordinary bars.

**Read further:** [Mathematical Association of America — History of statistical graphs](https://old.maa.org/press/periodicals/convergence/seeing-and-understanding-data-a-mini-primary-source-project-for-students-of-statistics?device=mobile) · [Wilke — Visualizing amounts](https://clauswilke.com/dataviz/visualizing-amounts.html)

## 10. Grouped bars

**Family:** Comparisons · **Historical dataset relationship:** `categorical_cohorts` · **Data renderer:** Available

Grouped bars extend classical categorical comparison to two populations, periods, or treatments measured on the same numeric scale. Within each category multiple bar lengths share a zero origin, so side-by-side differences are visible without arithmetic subtraction. Require comparable measures across the same labeled groups and a limited number of cohorts or series. Use it today for announced versus operating data-center MW or hardware throughput under two test conditions. Excess groups overwhelm a reader and prevent easy comparison of any single series across distant categories. Choose a dumbbell for exactly two matched measurements or small-multiple bars when numerous subgroup colors would be required.

**SmartChart example:** Proposed versus operating MW by state.

**Editorial caution:** Too many group members become unreadable.

**Read further:** [Wilke — Visualizing amounts](https://clauswilke.com/dataviz/visualizing-amounts.html) · [Financial Times — Visual Vocabulary](https://github.com/Financial-Times/chart-doctor/blob/main/visual-vocabulary/README.md)

## 11. Stacked bars

**Family:** Comparisons · **Historical dataset relationship:** `additive_components` · **Data renderer:** Available

Stacked bars arose naturally from tabulated totals whose subgroups could be counted and added without changing measurement units. Each component length adds to the previous component so the complete bar represents the sum of its parts. Require mutually exclusive nonnegative components with a meaningful arithmetic total and matching definitions across categories. Modern examples include server bill-of-materials costs, facility electricity by equipment class, and workload allocation across services. Internal parts lack a shared baseline, and adding averages, rates, or overlapping categories makes the implied total invalid. Choose grouped bars to compare individual subgroup values or 100-percent bars when relative shares are the central question.

**SmartChart example:** AI server bill of materials by supplier.

**Editorial caution:** Internal components are hard to compare across bars.

**Read further:** [Wilke — Visualizing amounts](https://clauswilke.com/dataviz/visualizing-amounts.html) · [Wilke — Visualizing proportions](https://clauswilke.com/dataviz/visualizing-proportions.html)

## 12. 100% stacked bars

**Family:** Comparisons · **Historical dataset relationship:** `normalized_composition` · **Data renderer:** Reference only

Percentage bars adapt historical contingency tables and proportional displays to compare compositions when group totals differ. Each category's component amounts are divided by that category's total, making every full bar exactly 100 percent. Require nonnegative mutually exclusive parts, nonzero totals, and a clear denominator for every group. Use them for regional generation mixes, data-center cooling technology shares, and customer-class distributions. The chart hides absolute market or population size, so report group totals when they matter to the interpretation. Choose ordinary stacked bars when total counts matter more than share, or grouped bars for precise subgroup comparison.

**SmartChart example:** Energy-source shares by country.

**Editorial caution:** Does not reveal total underlying market size.

**Read further:** [Wilke — Visualizing proportions](https://clauswilke.com/dataviz/visualizing-proportions.html) · [Wilke — Visualizing amounts](https://clauswilke.com/dataviz/visualizing-amounts.html)

## 13. Lollipop

**Family:** Comparisons · **Historical dataset relationship:** `categorical_magnitudes` · **Data renderer:** Reference only

Lollipop plots are a minimalist descendant of position-based dot plots and categorical bar charts used for simple comparisons. A line extends from a common reference to a dot at the observed value, emphasizing a precise endpoint over filled area. Use them for a moderate set of numeric category observations that share units and do not require composition. Modern applications include robotics installation rankings and smaller equipment performance tables where bars feel visually heavy. Keep reference points and sorting consistent; decorative stems can exaggerate minute differences if scales are poorly chosen. Prefer a conventional bar when zero-based magnitude is essential or a dot plot when the baseline should not dominate.

**SmartChart example:** Robotic installations by industry.

**Editorial caution:** Keep baseline and sorting consistent.

**Read further:** [Wilke — Visualizing amounts](https://clauswilke.com/dataviz/visualizing-amounts.html) · [Financial Times — Visual Vocabulary](https://github.com/Financial-Times/chart-doctor/blob/main/visual-vocabulary/README.md)

## 14. Dumbbell

**Family:** Comparisons · **Historical dataset relationship:** `paired_endpoints` · **Data renderer:** Reference only

Paired-dot diagrams develop the statistical comparison of matched observations without turning two time points into a full time series. Two endpoints share a category axis and a connecting segment, so their signed difference can be read visually. Require paired values measured on an identical scale for every category and explicit identities for both endpoints. Modern engineers compare advertised and measured runtime, before-and-after efficiency, or different benchmark configurations this way. Do not infer the path between endpoints, and use consistent pair ordering to keep the direction legible. Use a slopegraph for a small two-period story or grouped bars when individual magnitudes need separate zero-baseline emphasis.

**SmartChart example:** Advertised versus measured robot runtime.

**Editorial caution:** Clearly identify what each endpoint represents.

**Read further:** [Wilke — Visualizing amounts](https://clauswilke.com/dataviz/visualizing-amounts.html) · [Financial Times — Visual Vocabulary](https://github.com/Financial-Times/chart-doctor/blob/main/visual-vocabulary/README.md)

## 15. Bullet

**Family:** Comparisons · **Historical dataset relationship:** `actual_target` · **Data renderer:** Reference only

Bullet graphs modernized business scorecards by replacing dashboard gauges with compact quantitative bars and targets. Actual performance is encoded by length, while an independent reference mark encodes a target and bands may encode performance ranges. Require a measured actual value, a justified target, and compatible scales with any qualitative performance bands. Modern uses include rack utilization versus a safe threshold or preventive-maintenance performance against a service-level objective. Do not invent target thresholds, and do not confuse statistical control limits with management goals. Use a conventional bar for simple cross-category amounts or a control chart for process variability over time.

**SmartChart example:** Data center utilization versus safe limit.

**Editorial caution:** Do not bury the target benchmark.

**Read further:** [Financial Times — Visual Vocabulary](https://github.com/Financial-Times/chart-doctor/blob/main/visual-vocabulary/README.md) · [Wilke — Visualizing amounts](https://clauswilke.com/dataviz/visualizing-amounts.html)

## 16. Waterfall

**Family:** Comparisons · **Historical dataset relationship:** `reconcilable_changes` · **Data renderer:** Reference only

Waterfall charts formalize the accounting bridge between an initial balance, sequential signed changes, and a final total. Each contribution begins at the previous cumulative level, with increases and decreases algebraically reconciling to the endpoint. Require an initial value, ordered delta contributions, and a final value that can be verified by arithmetic. Modern data-center reports use them to reconcile capacity added, capacity retired, and available megawatts across a quarter. A missing contribution or an inconsistent sign convention breaks the calculation even if the picture looks plausible. Choose ordinary bars for independent differences and a time-series line for repeated final balances without explained components.

**SmartChart example:** MW added or lost from facility capacity.

**Editorial caution:** Make start, contributions, and end reconcile.

**Read further:** [Financial Times — Visual Vocabulary](https://github.com/Financial-Times/chart-doctor/blob/main/visual-vocabulary/README.md) · [Wilke — Visualizing amounts](https://clauswilke.com/dataviz/visualizing-amounts.html)

## 17. Pareto

**Family:** Comparisons · **Historical dataset relationship:** `categorical_cause_counts` · **Data renderer:** Reference only

Pareto diagrams combine ranked categorical counts with the cumulative-share reasoning associated with quality-control analysis. Bars are sorted descending by a common nonnegative measure, and a cumulative curve shows their fraction of the whole. Require nonoverlapping causes or categories with counts or losses measured using the same exposure and denominator. Use them to prioritize ASIC failure classes, recurring network incidents, or causes of planned downtime. The familiar 80/20 pattern is a heuristic, not a statistical law or proof of causal importance. Choose a simple ranked bar chart when cumulative contribution would not change the decision.

**SmartChart example:** Primary causes of ASIC downtime.

**Editorial caution:** Measure causes by the same denominator.

**Read further:** [Financial Times — Visual Vocabulary](https://github.com/Financial-Times/chart-doctor/blob/main/visual-vocabulary/README.md) · [NIST — Exploratory Data Analysis handbook](https://www.nist.gov/publications/nistsematech-e-handbook-statistical-methods-chapter-1-exploratory-data-analysis)

## 18. Tornado

**Family:** Comparisons · **Historical dataset relationship:** `sensitivity_scenarios` · **Data renderer:** Reference only

Tornado diagrams grew from sensitivity analysis in decision modeling, where assumptions are varied around a reference case. Horizontal signed bars show how low and high input scenarios change a defined outcome relative to one baseline. Require a documented baseline model and comparable one-at-a-time perturbations or clearly specified scenario ranges. Modern teams use them to inspect mining-project profitability sensitivity to electricity price, hashprice, and hardware cost. Independent changes cannot represent correlated inputs or full probabilistic uncertainty without a more complete model. Use a waterfall for changes that actually sum and a scatter plot for measured—not scenario-derived—relationships.

**SmartChart example:** Robot ROI sensitivity to labor and energy costs.

**Editorial caution:** State baseline and scenario assumptions.

**Read further:** [Financial Times — Visual Vocabulary](https://github.com/Financial-Times/chart-doctor/blob/main/visual-vocabulary/README.md) · [NIST — Exploratory Data Analysis handbook](https://www.nist.gov/publications/nistsematech-e-handbook-statistical-methods-chapter-1-exploratory-data-analysis)

## 19. Histogram

**Family:** Distributions · **Historical dataset relationship:** `univariate_sample` · **Data renderer:** Available

Histograms became central to statistical tabulation of frequencies as measured samples grew too large for individual inspection. The numeric axis is partitioned into adjacent bins and the bar heights represent frequencies or densities within those intervals. Require multiple observations from one quantitative variable and a disclosed binning rule, especially for unequal-width bins. Modern telemetry systems use histograms for chip temperatures, request latency, and distributions of machine power draw. Bin width can create or hide modes, and a histogram of averages is not a substitute for raw measurement distributions. Choose a boxplot for a compact multi-group summary or a density curve when a justified smoothing estimate is useful.

**SmartChart example:** Hashboard temperature distributions.

**Editorial caution:** Bin widths can change the perceived shape.

**Read further:** [Wilke — Histograms and density plots](https://clauswilke.com/dataviz/histograms-density-plots.html) · [NIST — Exploratory Data Analysis handbook](https://www.nist.gov/publications/nistsematech-e-handbook-statistical-methods-chapter-1-exploratory-data-analysis)

## 20. Box-and-whisker

**Family:** Distributions · **Historical dataset relationship:** `grouped_samples` · **Data renderer:** Reference only

John Tukey popularized the box-and-whisker display through exploratory data analysis in the 1970s, building on earlier summaries of spread. A box marks quartiles around the median while whiskers and optional points summarize tails under a declared whisker convention. Require quantitative observations with enough samples per group for median and quantile summaries to be stable. Modern comparisons use boxplots for technician salary ranges, repair durations, or thermal spread across hardware cohorts. Different whisker rules change which values count as outliers, and a small sample can hide multimodal structure. Choose a violin for distribution shape or a dot plot when displaying all individual observations is more informative.

**SmartChart example:** Technician salaries by experience group.

**Editorial caution:** State quartile and whisker definitions.

**Read further:** [Kafadar — Boxplot history and method (2026)](https://wires.onlinelibrary.wiley.com/doi/10.1002/wics.70073) · [Wilke — Boxplots, violins, and distributions](https://clauswilke.com/dataviz/boxplots-violins.html)

## 21. Violin

**Family:** Distributions · **Historical dataset relationship:** `dense_grouped_samples` · **Data renderer:** Reference only

Violin plots extend boxplots with mirrored smoothed densities, reflecting computing-era advances beyond hand-drawn summary statistics. The width at a measured value encodes an estimated probability density rather than a count of literal records. Use them to compare adequately sampled quantitative distributions on common measurement scales. Modern operations teams can inspect runtime, power, or fan-speed distributions across ASIC batches or facilities. Bandwidth choice can invent or erase apparent peaks, so annotate sample sizes and optionally overlay raw observations. Choose boxplots for robust quartile comparisons or jittered dots when each observation should remain visible.

**SmartChart example:** Distribution of shift-length robot runtimes.

**Editorial caution:** Needs sufficient observations and a defined scale.

**Read further:** [Wilke — Boxplots, violins, and distributions](https://clauswilke.com/dataviz/boxplots-violins.html) · [Wilke — Histograms and density plots](https://clauswilke.com/dataviz/histograms-density-plots.html)

## 22. Dot / beeswarm

**Family:** Distributions · **Historical dataset relationship:** `individual_observations` · **Data renderer:** Reference only

Dot and strip displays preserve the statistical tradition of showing observations directly, instead of replacing them with aggregates. Each mark locates an individual measured value, and careful jitter or beeswarm packing reduces overlapping identical positions. Use them for samples small enough to inspect or for grouped data where hidden outliers would be consequential. Modern applications include individual miner faults, repair durations, and device-to-device performance variation. Random jitter must be confined to the nonvalue axis, and huge samples quickly become overplotted. Choose a histogram or boxplot when the sample is too large for faithful individual dots.

**SmartChart example:** Individual miner failures across facilities.

**Editorial caution:** Avoid jitter that disguises the actual values.

**Read further:** [Wilke — Boxplots, violins, and distributions](https://clauswilke.com/dataviz/boxplots-violins.html) · [Wilke — Visualizing amounts](https://clauswilke.com/dataviz/visualizing-amounts.html)

## 23. Density curve

**Family:** Distributions · **Historical dataset relationship:** `continuous_sample` · **Data renderer:** Reference only

Probability-density curves arose from mathematical distribution modeling and became a common visual complement to histograms. Kernel density estimation sums local smoothing kernels around observations; bandwidth controls the final curve's apparent detail. Require a reasonably sized continuous numeric sample and clear treatment of boundaries and weights. Modern analysts compare server power distributions, latency profiles, and variability among hardware cohorts with these curves. Smoothed tails can extend into physically impossible values and may conceal rare observations crucial for engineering decisions. Choose histograms for directly observable bin counts or empirical cumulative curves when avoiding smoothing assumptions is important.

**SmartChart example:** Server power-draw profiles across a fleet.

**Editorial caution:** Smoothing is not raw observations.

**Read further:** [Wilke — Histograms and density plots](https://clauswilke.com/dataviz/histograms-density-plots.html) · [NIST — Exploratory Data Analysis handbook](https://www.nist.gov/publications/nistsematech-e-handbook-statistical-methods-chapter-1-exploratory-data-analysis)

## 24. Scatter plot

**Family:** Relationships · **Historical dataset relationship:** `paired_numeric` · **Data renderer:** Available

Paired-coordinate plots supported nineteenth-century studies of empirical association and Francis Galton's work on regression and correlation. Every point represents one paired observation on two quantitative axes so patterns, clusters, and anomalies remain visible. Require meaningful matched X–Y measurements; a computed fit should be labeled separately from the observed points. Modern studies compare ASIC efficiency with hashrate, rack power with temperature, or electricity cost with output. A visual trend alone does not establish causality and a third variable can create a spurious association. Choose a time series when one axis is intrinsically temporal or a hexbin map when dense observations overlap.

**SmartChart example:** ASIC J/TH versus device hashrate.

**Editorial caution:** Correlation alone does not prove causation.

**Read further:** [Friendly & Denis — Early origins of the scatterplot](https://onlinelibrary.wiley.com/doi/10.1002/jhbs.20078) · [Wilke — Directory of visualizations](https://clauswilke.com/dataviz/directory-of-visualizations.html)

## 25. Bubble chart

**Family:** Relationships · **Historical dataset relationship:** `paired_numeric_size` · **Data renderer:** Reference only

Bubble charts extend scatterplots by introducing a third quantitative dimension, an approach used in multivariate exploratory graphics. Position encodes two values, while the area of each circle represents a third nonnegative magnitude. Require matched X and Y measurements, a nonnegative size variable, and a defensible area-scaling legend. Modern comparisons place robotics cost against throughput while using fleet size or shipment volume as bubble area. Scaling radius directly to the size value exaggerates large observations because visible area grows with radius squared. Choose a scatterplot when the third variable adds little analytical value or a faceted plot when sizes overlap heavily.

**SmartChart example:** Robot cost, throughput, and fleet size.

**Editorial caution:** Circle area—not radius—must represent size.

**Read further:** [Wilke — Directory of visualizations](https://clauswilke.com/dataviz/directory-of-visualizations.html) · [Financial Times — Visual Vocabulary](https://github.com/Financial-Times/chart-doctor/blob/main/visual-vocabulary/README.md)

## 26. Heatmap

**Family:** Relationships · **Historical dataset relationship:** `matrix_values` · **Data renderer:** Available

Matrix shading extends cross-tabulation, where patterns in two-dimensional arrays mattered more than individually enumerating every cell. Rows and columns define ordered or categorical coordinates, while a calibrated color scale encodes a measured cell value. Require genuine paired dimensions with compatible repeated observations and a clear aggregation rule for duplicate cells. Modern engineering uses heatmaps for rack-by-hour temperature, grid load by region and month, or network incident matrices. Perceptually uneven colors, missing-value confusion, and omitted legends can create false gradients or invented data. Choose grouped bars for a few precise comparisons or a scatterplot when both axes are continuous measurements.

**SmartChart example:** Server temperature by rack and time.

**Editorial caution:** Use a legend with meaningful units.

**Read further:** [Wilke — Visualizing amounts](https://clauswilke.com/dataviz/visualizing-amounts.html) · [Financial Times — Visual Vocabulary](https://github.com/Financial-Times/chart-doctor/blob/main/visual-vocabulary/README.md)

## 27. Hexbin plot

**Family:** Relationships · **Historical dataset relationship:** `dense_paired_numeric` · **Data renderer:** Reference only

Hexagonal binning extends density estimation and cartographic tessellation to large paired datasets whose points overplot. The X–Y plane is partitioned into hexagonal cells, with color or height indicating the count or aggregated value in each. Require many paired numeric observations with continuous axes and a declared bin size and aggregation statistic. Modern systems use hexbin maps for dense telemetry clouds or millions of transaction and performance measurements. Cell size controls apparent clusters, and a count map is not a map of means unless the statistic is explicitly changed. Choose raw scatterplots when individual observations remain legible or heatmaps for pre-defined categorical matrices.

**SmartChart example:** Millions of data center telemetry samples.

**Editorial caution:** Hexagon counts depend on spatial bin size.

**Read further:** [Wilke — Directory of visualizations](https://clauswilke.com/dataviz/directory-of-visualizations.html) · [NIST — Exploratory Data Analysis handbook](https://www.nist.gov/publications/nistsematech-e-handbook-statistical-methods-chapter-1-exploratory-data-analysis)

## 28. Pie / donut

**Family:** Composition · **Historical dataset relationship:** `single_composition` · **Data renderer:** Available

William Playfair's early nineteenth-century pie diagram established part-to-whole reasoning; donut variants retain that proportional geometry. Each sector subtends an angle proportional to its nonnegative share of a single defined total. Require mutually exclusive categories, a common denominator, and only a few proportions that genuinely sum to the whole. Modern examples include robotics-market revenue shares and technology adoption fractions in a defined hardware fleet. Thin slices are difficult to compare and a donut hole adds no new numeric variable by itself. Choose sorted bars when exact category ranking matters, or 100-percent stacked bars to compare multiple populations.

**SmartChart example:** Robotics market revenue by segment.

**Editorial caution:** Shares must sum to the whole; avoid many slices.

**Read further:** [Mathematical Association of America — History of statistical graphs](https://old.maa.org/press/periodicals/convergence/seeing-and-understanding-data-a-mini-primary-source-project-for-students-of-statistics?device=mobile) · [Wilke — Visualizing proportions](https://clauswilke.com/dataviz/visualizing-proportions.html)

## 29. Treemap

**Family:** Composition · **Historical dataset relationship:** `hierarchical_additive` · **Data renderer:** Reference only

Treemaps modernized the long tradition of hierarchical tables by encoding nested totals as recursively partitioned rectangles. The area of each leaf rectangle is proportional to its nonnegative value within a hierarchy whose parent totals reconcile. Require a tree of distinct parent–child groups with additive measurements and no double-counted leaves. Modern analysts inspect semiconductor revenue by product family or data-center costs by subsystem and vendor. Comparing nonadjacent rectangle areas is difficult, and shallow labels can conceal tiny but important categories. Choose a sunburst for exploring hierarchy depth or a ranked bar chart when exact leaf comparisons are the goal.

**SmartChart example:** Semiconductor revenue by product family.

**Editorial caution:** Area labels must match the same denominator.

**Read further:** [Wilke — Nested proportions](https://clauswilke.com/dataviz/nested-proportions.html) · [Financial Times — Visual Vocabulary](https://github.com/Financial-Times/chart-doctor/blob/main/visual-vocabulary/README.md)

## 30. Waffle

**Family:** Composition · **Historical dataset relationship:** `single_composition` · **Data renderer:** Reference only

Waffle charts translate elementary fraction diagrams into a fixed grid of equal-area cells, commonly used for percentage communication. Every cell corresponds to a constant fraction of a whole, and color assigns that fraction to one category. Require one nonnegative compositional total and a declared grid resolution and rounding approach. Modern reports use them to depict upgraded ASIC fleet shares or production completion proportions without complex axes. Rounding can make small groups disappear and a partial grid can misstate the denominator. Choose a donut for a few simple fractions or a 100-percent stacked bar for comparisons across several groups.

**SmartChart example:** Share of a factory fleet with upgraded ASICs.

**Editorial caution:** Define rounding and total number of cells.

**Read further:** [Wilke — Visualizing proportions](https://clauswilke.com/dataviz/visualizing-proportions.html) · [Financial Times — Visual Vocabulary](https://github.com/Financial-Times/chart-doctor/blob/main/visual-vocabulary/README.md)

## 31. Sunburst

**Family:** Composition · **Historical dataset relationship:** `hierarchical_additive` · **Data renderer:** Reference only

Radial partition diagrams extend hierarchical taxonomies and early tree diagrams into rings of proportional angular sectors. Each child inherits angular space from its parent, and ring depth represents successive categorical levels. Require a true hierarchy with additive nonnegative leaf values and explicitly defined parent–child relations. Modern use includes drilling from data-center capital expenditure into facilities, subsystems, and individual equipment types. Thin outer segments lose labels and near-equal arc lengths are difficult to compare quantitatively. Choose a treemap for area-efficient nested totals or a simple bar chart for a single hierarchy level.

**SmartChart example:** Data center spend: category → subsystem.

**Editorial caution:** Too many levels make labels unreadable.

**Read further:** [Wilke — Nested proportions](https://clauswilke.com/dataviz/nested-proportions.html) · [Financial Times — Visual Vocabulary](https://github.com/Financial-Times/chart-doctor/blob/main/visual-vocabulary/README.md)

## 32. Sankey

**Family:** Flows · **Historical dataset relationship:** `conserved_flows` · **Data renderer:** Reference only

Sankey-style flow maps gained prominence with nineteenth-century engineering energy balances and quantitative accounts of material transfer. Link width is proportional to flow magnitude, while incoming and outgoing quantities are reconciled at each node. Require named origin and destination stages, nonnegative link magnitudes, and explicit treatment of losses or external inputs. Modern models depict electricity supply through conversion losses and distribution to cooling and IT workloads. Do not interpret a diagram of unrelated categories as a conserved flow, and avoid false precision in uncertain links. Choose stacked bars for static composition or a network diagram without variable-width links when quantities are unavailable.

**SmartChart example:** Electricity production → losses → IT load.

**Editorial caution:** Flow values must conserve quantity.

**Read further:** [Financial Times — Visual Vocabulary](https://github.com/Financial-Times/chart-doctor/blob/main/visual-vocabulary/README.md) · [Wilke — Nested proportions](https://clauswilke.com/dataviz/nested-proportions.html)

## 33. Funnel

**Family:** Flows · **Historical dataset relationship:** `sequential_cohort` · **Data renderer:** Reference only

Funnel diagrams adapt sequential accounting and attrition tables into a visual model of a narrowing population. Counts or percentages represent the same cohort after successive filters, with each downstream stage nested within its predecessor. Require logically ordered stages, consistent identities or cohorts, and an explicit denominator at every transition. Modern teams track robotics prototypes from testing through pilots to deployment, or hardware production yields across checks. Independent stage totals must not be presented as if the same individuals or units necessarily passed through every stage. Choose a bar chart when phases are unrelated, or a Sankey when people can branch, return, or change destinations.

**SmartChart example:** Robotics trials → pilots → production.

**Editorial caution:** Only use when populations truly pass sequential stages.

**Read further:** [Financial Times — Visual Vocabulary](https://github.com/Financial-Times/chart-doctor/blob/main/visual-vocabulary/README.md) · [Wilke — Visualizing amounts](https://clauswilke.com/dataviz/visualizing-amounts.html)

## 34. Gantt / timeline

**Family:** Operations · **Historical dataset relationship:** `task_intervals` · **Data renderer:** Reference only

Gantt schedules developed in industrial project management to relate named activities to start dates, durations, and dependencies. Each task occupies an interval on a common time axis, enabling comparison of overlap, sequence, and completion status. Require task identifiers plus start and end dates, and distinguish planned milestones from observed completion. Modern operators use them for data-center construction, power-commissioning phases, and hardware repair work orders. Overlapping bars alone do not prove task dependencies, which must be provided separately if claimed. Choose a timeline for isolated milestones or a line chart when the primary variable is measured performance over time.

**SmartChart example:** Datacenter project construction schedules.

**Editorial caution:** Do not label planned dates as completed milestones.

**Read further:** [Financial Times — Visual Vocabulary](https://github.com/Financial-Times/chart-doctor/blob/main/visual-vocabulary/README.md) · [Wilke — Time-series visualization](https://clauswilke.com/dataviz/time-series.html)

## 35. Calendar heatmap

**Family:** Operations · **Historical dataset relationship:** `dated_daily_measure` · **Data renderer:** Reference only

Calendar heatmaps combine historical calendar tables with shading methods used in statistical matrices. Each day occupies a stable weekday-by-week grid cell, with intensity encoding count, rate, or a daily summary statistic. Require verified dates and a daily numeric measurement or event count, aggregated with a declared time zone. Modern infrastructure teams use them for daily service incidents, fleet uptime, or energy-demand peaks across months. Different day lengths, missing dates, or variable exposure can make raw daily totals misleading. Choose a line chart for precise trends or a heatmap matrix when the dimensions are not literal calendar dates.

**SmartChart example:** Data center incidents by calendar day.

**Editorial caution:** Normalize if days have unequal exposure.

**Read further:** [Financial Times — Visual Vocabulary](https://github.com/Financial-Times/chart-doctor/blob/main/visual-vocabulary/README.md) · [Wilke — Time-series visualization](https://clauswilke.com/dataviz/time-series.html)

## 36. Control chart

**Family:** Operations · **Historical dataset relationship:** `time_process_baseline` · **Data renderer:** Reference only

Walter Shewhart's industrial quality-control tradition established charts that separate routine process variation from potential special causes. Measurements are plotted in time order against a center line and statistically calculated upper and lower control limits. Require a stable measurement process, suitable sampling subgroup, and limits derived from an appropriate historical baseline. Modern data centers monitor coolant flow, rack temperatures, and manufacturing yields for changes exceeding expected process noise. Management targets are not control limits, and normal observations outside arbitrary thresholds are not proof of statistical instability. Choose a line chart for descriptive trends or a bullet chart when the question is target attainment rather than process control.

**SmartChart example:** Coolant flow variation with control limits.

**Editorial caution:** Use statistical limits, not arbitrary decoration.

**Read further:** [ASQ — Statistical control charts](https://asq.org/quality-resources/control-chart) · [NIST — Exploratory Data Analysis handbook](https://www.nist.gov/publications/nistsematech-e-handbook-statistical-methods-chapter-1-exploratory-data-analysis)

## 37. Gauge

**Family:** Operations · **Historical dataset relationship:** `bounded_current_value` · **Data renderer:** Reference only

Gauge graphics borrow the visual metaphor of mechanical instrument dials once used to display bounded physical measurements. A pointer or filled arc maps a current value onto an explicitly defined minimum-to-maximum interval. Require a meaningful bounded range, current observation, and optional threshold justified by the measurement context. Modern operations interfaces show live rack utilization, memory occupancy, and thermal-headroom status in dashboards. Without stated range and thresholds, a pointer angle implies severity that the underlying measurement may not justify. Choose a bullet chart for comparisons against a target or a simple number when historical context is unnecessary.

**SmartChart example:** Live rack utilization percentage.

**Editorial caution:** A single number plus target may be clearer.

**Read further:** [Financial Times — Visual Vocabulary](https://github.com/Financial-Times/chart-doctor/blob/main/visual-vocabulary/README.md) · [Wilke — Visualizing amounts](https://clauswilke.com/dataviz/visualizing-amounts.html)

## 38. Radar / spider

**Family:** Operations · **Historical dataset relationship:** `normalized_multivariate_profile` · **Data renderer:** Reference only

Radar diagrams adapt multiaxis profile graphics to compare several dimensions about a common center. Each spoke is normalized to a declared scale, and polygon vertices indicate a subject's values on those dimensions. Require a small set of commensurably normalized criteria with explicit directionality and the same axis order for every subject. Modern analysts profile robots across mobility, power, payload, and dexterity, or hardware across different benchmark attributes. Polygon area depends on spoke ordering and arbitrary normalization, so it is not an objective composite performance score. Choose grouped bars or a table when exact multidimensional differences are more important than an overall profile.

**SmartChart example:** Robot mobility, dexterity, battery, payload.

**Editorial caution:** Normalize dimensions and avoid arbitrary scores.

**Read further:** [Financial Times — Visual Vocabulary](https://github.com/Financial-Times/chart-doctor/blob/main/visual-vocabulary/README.md) · [Wilke — Directory of visualizations](https://clauswilke.com/dataviz/directory-of-visualizations.html)

## 39. Choropleth map

**Family:** Geography · **Historical dataset relationship:** `region_normalized_metric` · **Data renderer:** Reference only

Choropleths continue the thematic cartography tradition of assigning quantitative classifications to geographic administrative regions. Each mapped polygon receives a shade based on its linked regional metric, not the arbitrary geographic size of the region. Require valid polygon identifiers, a joinable regional dataset, and a rate or other normalization when region areas differ. Modern readers use them to compare electricity consumption per resident, adoption rates, or workforce density by state. Raw counts can visually overemphasize large regions, and geographic area is not equivalent to statistical population weight. Choose a proportional-symbol map for discrete sites with measured totals or bars when geography adds no analytical context.

**SmartChart example:** Regional robot installations per 10,000 workers.

**Editorial caution:** Use rates for fair comparisons between regions.

**Read further:** [Wilke — Visualizing geospatial data](https://clauswilke.com/dataviz/geospatial-data.html) · [Financial Times — Visual Vocabulary](https://github.com/Financial-Times/chart-doctor/blob/main/visual-vocabulary/README.md)

## 40. Proportional-symbol map

**Family:** Geography · **Historical dataset relationship:** `site_coordinates_magnitude` · **Data renderer:** Reference only

Proportional-symbol mapping extends thematic cartography by placing count- or magnitude-scaled symbols at verified locations. Marker position encodes geographic coordinates while marker area represents a nonnegative numeric magnitude. Require validated latitudes and longitudes, one numeric magnitude per site, and an explicitly documented area-to-value scale. Modern maps locate data-center projects, power stations, or energy production sites with measured or proposed MW. Symbol overlap, inaccurate coordinates, and scaling radius instead of area can distort a regional comparison. Choose choropleths for rates defined by regional polygons or ranked bars if exact site values matter most.

**SmartChart example:** MW at individual data center project locations.

**Editorial caution:** Use area-scaled symbols and verified coordinates.

**Read further:** [Wilke — Visualizing geospatial data](https://clauswilke.com/dataviz/geospatial-data.html) · [Financial Times — Visual Vocabulary](https://github.com/Financial-Times/chart-doctor/blob/main/visual-vocabulary/README.md)

## Notes on sources

Core references include Claus O. Wilke's openly readable *Fundamentals of Data Visualization*, the Financial Times Visual Vocabulary, NIST statistical methodology, research on the history of statistical graphics, and relevant specialist sources for control charts and boxplots. Links support methods and history at the family or chart level; they do not necessarily substantiate every modern editorial example. All source SVG thumbnails remain expressly synthetic.
