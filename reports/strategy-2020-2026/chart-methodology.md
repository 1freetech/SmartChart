# Strategy due-diligence chart evidence (2020-November 2026)

Aligned with SmartChart chart-selection protocol v2.0 (40-chart atlas). No data interpolated.

## 1. Bitcoin holdings
Claim: cumulative BTC holdings changed across report dates.
Dataset: annual year-end 2020-2025 + snapshot November 1 2026; unit BTC, not thousands in source CSV.
Selected: line chart, historically ordered time measure. Alternatives assessed: step chart (individual trade dates absent, so misleading); area chart (adds an unnecessary area emphasis); columns (valid but makes annual change less continuous); scatter plot (treats years as measurements, weaker directionality).
Key caution: 2026 is an incomplete year; the last point is November 1. Holdings are not BTC attributable per common share.
Primary sources: SEC 2020 and 2021 10-K; 2022, 2023 and 2025 Forms 10-K; November 2 2026 8-K.
Validation: 70,469;124,391;132,500;189,150;447,470;672,500;849,327 BTC, strictly increasing.

## 2. Stockholder return
Claim: Strategy equity's indexed total return versus Nasdaq Composite varies markedly over 2020-2025.
Dataset: 2025 Strategy Form 10-K shareholder performance table; both series normalized at $100 on December 31, 2020, no 2026 included.
Selected: two-line time-series comparison sharing identical denominators. Alternatives assessed: grouped columns (categorical date marks but hides continuous comparative paths), slopegraph (only endpoints and obscures 2022 drawdown/2024 surge), dual-axis (needless because shared index units).
Data: Strategy: 100,140.12,36.43,162.50,745.01,390.82. Nasdaq: 100,122.18,82.43,119.22,154.48,187.14.
Limitations: These are selected year-end points, not a maximum-drawdown study or price series through November 2026. SEC includes dividends reinvested as applicable. Avoid inferring day-to-day volatility solely from sparse year-end observations.

Editorial note: This folder archives reproducible presentation values and chart choice; it does not imply a machine-learning or empirically measured past chart popularity ranking.
