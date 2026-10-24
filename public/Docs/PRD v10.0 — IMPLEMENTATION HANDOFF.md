NEXUSBI UNIVERSAL DASHBOARD ENGINE
PRODUCTION REMEDIATION, VISUAL REDESIGN, THEME SYSTEM & PDF EXPORT
PRD v10.0 — IMPLEMENTATION HANDOFF FOR ANTIGRAVITY
Date: 24 October 2026
Priority: P0 reliability, P1 UX, P2 enhancements
Status: Implementation specification; findings based on supplied screenshot and exported HTML, not a full runtime audit.

======================================================================
0. EXECUTIVE DIRECTIVE / NON-NEGOTIABLES
======================================================================
Improve the EXISTING universal, schema-agnostic, browser-local analytics platform; do NOT rewrite the app, replace its existing architecture, remove features, or break Excel/HTML/PDF exports. First inspect repository architecture, routes, rendering components, analytics engine, chart libraries, export pipeline, test harness, and existing phase 9E/9F acceptance evidence. Produce a precise impact map and implement incrementally. Preserve deterministic calculations, privacy-first local processing, offline HTML exports, cancellation, resilience, accessibility, and backward compatibility. No server upload, AI API, telemetry, external CDN, or remote font dependencies for user datasets. Never assert an unverified guarantee.

Success means: both dark and light themes are polished; every KPI and chart correctly responds to filters; charts are genuinely informative and responsive; PDF export works and yields a valid readable multi-page PDF; HTML, Excel, PDF and in-app views reconcile numerically; all changes are automated-tested and manually verified.

======================================================================
1. CURRENT BASELINE AND OBSERVED DEFECTS
======================================================================
Evidence: screenshot shows 8 KPI cards, 3 chart panels (customer segment, monthly trend, region), dark theme, excessive empty space, small/overcrowded month labels, developer-style field names with underscores, minimal chart variety, unbalanced layout. User reports Export to PDF button not working. Prior exported HTML contains KPI data, three chart groups, an action queue, audit trail, offline JS and embedded modelData.

Reported/previously observed source concerns to confirm against CURRENT code before patching:
- Exported HTML click-to-filter may update banner without recalculating chart data/KPIs.
- Chart monthly bucket 'Month' may not map to raw Order_Date correctly.
- Gross Profit Margin is incorrectly tagged ADDITIVE in audit dictionary; it is NON_ADDITIVE (ratio of sums).
- Total Cost is incorrectly tagged NON_ADDITIVE; it is ADDITIVE across independent transactions (subject to grain).
- Chart accessible summary may label first chronological month as 'lead' rather than maximum.
- Generic action-queue advice may appear when zero actionable exceptions exist.
- Tab switching uses implicit global event; avoid this.
- Earlier XLSX audit date range was reversed/inaccurate; correct date provenance across ALL formats.
- Audit claims cryptographic sealing without a real verifiable signature; remove or correctly implement/label hashes.
- HTML chart values are verbose/unformatted; KPI currency, chart currency and percent units need semantic formatting.
- Screenshot includes blank chart-panel space and insufficient chart variety.
- Export parity claim must be verified, not hard-coded.

These are validation targets, not authorization to change unrelated modules blindly.

======================================================================
2. SCOPE, USERS, OUT OF SCOPE
======================================================================
Users: nontechnical CSV/XLSX uploaders, analysts, business owners, BI professionals; datasets across sales, HR, support, finance, operations, education, inventory, healthcare (non-diagnostic), and unknown schemas.

In scope: ingestion metadata, semantic type inference, canonical measures, cross-filter engine, KPI UI, responsive chart gallery, dark/light themes, accessible interaction, offline HTML renderer, genuine PDF export, export integrity, QA/audit metadata, tests, performance and docs.
Out of scope: rewriting Next.js app, mandatory sign-in, cloud persistence, remote data processing, invented domain-specific metrics, replacing existing functioning spreadsheet formulas or native Excel charts, external AI dependency.

======================================================================
3. DELIVERY PHASES / RELEASE GATES
======================================================================
P0-A Baseline audit + reproducible failing tests.
P0-B Canonical aggregation/filters/date grain + metric classification.
P0-C Reliable PDF export and export-state handling.
P1-D Unified design tokens, KPI cards, dark/light themes.
P1-E Visualization selection engine + new charts + responsive layout.
P1-F HTML offline export parity, accessibility and print/PDF styling.
P2-G Advanced exploration, saved view configuration, performance polish.
P0 gates must pass before visual-only enhancements ship. Feature flag rollout if architecture allows. Every phase includes code diff, tests, screenshots, risks, rollback, evidence.

======================================================================
4. CANONICAL DATA CONTRACT / METRIC ENGINE
======================================================================
4.1 Preserve source row identity, typed values, original headers, normalized semantic labels, locale/currency metadata, source filename, source hash and row count. Avoid mutating input data. Detect dates robustly (ISO, Excel serials, supported locale formats), distinguish invalid dates, preserve timezone/calendar semantics and clearly specify aggregation timezone. Reject or quarantine impossible dates with counts.
4.2 Build one immutable analytical model consumed by in-app visuals and exports. Contract: DatasetProfile, FieldProfile, SemanticRole, MeasureDefinition, DimensionDefinition, FilterState, ChartSpec, AggregationResult, Provenance, ExportSnapshot. Define explicit versions and migration handling.
4.3 Every measure must declare id, label, source fields, operation, grain, additivity, unit, format, null policy, denominator, precision, filter behavior and provenance. Currency is not inferred from $ formatting alone; prefer explicit source currency metadata, otherwise show 'currency unspecified' or user-configured currency.
4.4 Correct operations:
  Total Net Sales = SUM(Net_Sales)
  Total Gross Sales = SUM(Gross_Sales)
  Gross Profit = SUM(Profit)
  Total COGS = SUM(Total_Cost)
  Total Units = SUM(Quantity)
  Gross Profit Margin = SUM(Profit)/SUM(Net_Sales), guard zero denominator
  AOV = SUM(Net_Sales)/COUNT(DISTINCT Order_ID) when order IDs exist and order grain may have multiple lines; AVERAGE(Net_Sales) only if one-row-per-order is verified. Explain which rule was selected.
  Customer count = DISTINCTCOUNT(Customer_ID) when applicable.
4.5 Additivity: money amounts/units additive across compatible dimensions and grain; margin and AOV nonadditive; balances/inventory semi-additive over time; rates/percentages must not be summed. Audit labels and UI must match calculations.
4.6 All chart values and KPIs derive from same canonical filtered row set. Floating point tolerances explicit (money round only at presentation; use fixed decimal or compensated summation if needed). Never sum displayed rounded numbers. Deterministic sort and tie-breaking.
4.7 Data quality: duplicate key vs duplicate entire row separately; missingness per column; invalid numeric/date counts; excluded row counts; no blanket '100% completeness' if validation skipped. Trace claims to executable checks.
4.8 Do not assume sales-specific schema. For generic data, fall back to safe descriptive metrics and suitable dimensions; no fabricated revenue, profit, SLA, clinical, or forecast metrics.

======================================================================
5. CROSS-FILTERING — REQUIRED END-TO-END FIX
======================================================================
5.1 Central FilterState: dimension id, operator, typed value(s), date range, search, null choice, source chart, selection mode. Immutable state transitions. Clear All, remove one chip, reset, undo optional.
5.2 Clicking bar, point, slice, legend or table row must update: ALL KPI values, ALL applicable charts, chart subtitles, total counts, filter chips, empty states, drilldowns and export snapshot. Other charts should show the filtered context. Clearly document self-filter policy (either include or exclude own selection) and apply consistently.
5.3 Map derived month to a canonical date bucket generated from Order_Date. '2024-04-01' selection means all rows with Order_Date in April 2024, not equality to nonexistent Month column. Apply identical logic to quarter/year/week/day. Avoid timezone boundary shifts.
5.4 Support single click select; Ctrl/Meta multi-select; keyboard Enter/Space; clear by clicking selected item or chip; touch-friendly targets. Multi-dimension filters use AND, within same dimension multi-values use OR. Expose policy in UI.
5.5 KPI recomputation must preserve denominator context and recalculate ratios of sums, not average displayed margins. Distinct count must use filtered records.
5.6 Add loading indicator only when actual async work occurs; cancellation and stale result prevention; worker messages tagged with requestId/datasetVersion/filterVersion. Debounce only expensive continuous controls, not direct clicks.
5.7 Exported offline HTML MUST either (A) embed sufficient sanitized row-level/aggregated cube data for correct local recalculation, or (B) explicitly mark filters noninteractive and remove misleading 'cross-filter entire dashboard' claims. Preferred: fully interactive local export with same canonical engine logic, versioned and parity-tested.
5.8 Tests: select South region -> every applicable KPI and chart changes and reconciles with raw CSV filtered to South; select Small Business + South -> AND intersection; select April 2024 -> exact date bucket; reset -> original 5,000 rows and full totals; zero-match -> no NaN/Infinity; date boundary and null cases.

======================================================================
6. KPI CARD DESIGN SYSTEM — DARK + LIGHT
======================================================================
6.1 Replace cramped uniform boxes with premium executive cards: 4 desktop columns, 2 tablet, 1 mobile; 16–24px gap, 20–24px padding, minimum accessible hit areas, consistent height but content-driven layout. No clipped titles or numbers.
6.2 Card hierarchy: eyebrow label, large formatted value, optional comparison/delta ONLY if legitimate comparison period exists, mini sparkline when time series exists, contextual icon (subtle), optional unit, data confidence/exclusions tooltip, expandable 'How calculated' drawer. No decorative arrows suggesting trends without a benchmark.
6.3 Use typography tokens: headings 14–16px, KPI 28–36px responsive, metadata 11–13px readable; tabular numerals, accessible contrast, no tiny pale-blue text on dark backgrounds.
6.4 Recommended KPI priority: Net Sales, Gross Profit, Margin, Orders in first row for sales; secondary AOV, Units, COGS, Gross Sales. Order dynamically for other domains. Allow configurable order.
6.5 Compact value $34.36M with exact value on hover/focus and accessible label; locale-aware currency and separators; negative values, zero, long values and missing values handled. Avoid showing percentage cards with currency metadata.
6.6 Card interactions: click/keyboard expands definition only; avoid implying KPI click filters if it does not. Use visible chevron state, accessible aria-expanded and focus ring. Smooth subtle animation respecting reduced motion.
6.7 Skeleton state, no-data state, error state, partially invalid metric state. No '0' where value is undefined. Tooltip states source fields, formula, filter context and exclusions.

======================================================================
7. THEME ARCHITECTURE
======================================================================
7.1 Three modes: Dark, Light, System. Persistent user preference locally if privacy policy allows; default System; exported HTML captures selected theme and optionally includes switcher. PDF uses dedicated print theme (light by default) with optional dark print mode.
7.2 Central semantic CSS variables: bg.canvas, bg.surface, bg.elevated, border.subtle, border.strong, text.primary, text.secondary, text.muted, accent.primary, positive, negative, warning, focus, chart.grid, chart.tooltip, chart.series[0..N], shadow, radius, spacing, typography. Never hardcode colors in individual chart logic.
7.3 Dark visual direction: deep navy canvas, slightly lighter cards, restrained blue/cyan accent, legible muted text, soft separators. Light: off-white/slate canvas, white cards, charcoal headings, subtle borders/shadows, identical information hierarchy.
7.4 Chart palettes distinct and color-blind-conscious; series labels and direct values must not rely on color alone. Same category maps to stable color across views/themes when meaningful. Print-safe patterns or labels.
7.5 Contrast targets WCAG AA: 4.5:1 normal text, 3:1 large text and UI boundaries. Focus visible, hover, disabled, selected, loading and error tokens. Test both themes at 320, 375, 768, 1024, 1440 and 1920 px; 125/150/200% zoom.
7.6 Theme switch must update every KPI, chart axis, tooltip, legend, data table, filters, dropdowns, modals, print view and exported HTML. No flash of incorrect theme if feasible.

======================================================================
8. DASHBOARD INFORMATION ARCHITECTURE & VISUAL REDESIGN
======================================================================
8.1 Layout:
- Top header: clear report title, dataset name, records, date coverage, last generated time, quality status and compact actions (Theme, Reset, Export menu).
- Filter toolbar: date range, dimension selectors, search, active chips, reset; only controls valid for detected schema.
- KPI overview row(s).
- Main analytic grid: priority trend chart full/2-column width, ranked category chart, geographic/segment comparison, contribution/share chart; no giant blank cards.
- Details: top/bottom performers, drilldown table, anomalies/data-quality notes and methodology in secondary tabs or collapsible panels.
8.2 Fix screenshot problems: replace 'Customer_Segment' with 'Customer Segment'; use human-readable titles ('Net Sales by Customer Segment'); show full meaningful chart scale and aligned value labels; month axis labels show 'Jan 2024', 'Apr 2024' etc with automatic tick density and tooltips; no overlap; remove unused vertical whitespace; balanced responsive grid.
8.3 Chart engine must choose suitable visuals by semantic role, cardinality, grain and measure; never select chart purely because field name matches. Rank and score candidates, suppress invalid ones, expose reason for selection. Cap default panels to useful set (4–8), with 'Add chart' / explore for more.
8.4 Supported visuals (implement where mathematically appropriate):
  a. Time-series line/area with proper temporal axis, period toggle, hover values, gap handling.
  b. Ranked horizontal bar for category/segment/region with top N and 'Other', clear sorting.
  c. Grouped/stacked bar for comparative dimensions and multiple compatible measures.
  d. Donut or 100% stacked bar for low-cardinality shares, show percentage and absolute values; never for negative/mixed-sign totals.
  e. Waterfall for additive components only when decomposition is logically valid.
  f. Scatter for two numeric measures with meaningful grain and outlier handling.
  g. Heatmap for calendar/category matrix where density supports it.
  h. Histogram for continuous distribution, bins documented.
  i. Table/matrix with sorting, pagination/virtualization and totals.
  j. Optional geographic map only with reliable geocoding/country/state codes; no guessed coordinates or remote requests.
8.5 For THIS 5k sales dataset suggested default: monthly net sales line/area; net sales by customer segment ranked bars; regional sales ranked bars; net sales by product category ranked bars; sales channel contribution donut; top products ranked bars; monthly profit and margin dual-panel (avoid misleading dual-axis); order status distribution; optionally discount vs profit scatter. Use detected fields, not hardcoded assumptions.
8.6 Every chart: title, subtitle, unit, aggregation, optional period, meaningful axis labels, tooltip with full precision, legend, no-data state, export/download chart, accessible text summary, optional show-as-table, keyboard selection and reset affordance. All charts should be visibly interactive if they are.
8.7 Time series must use real chronological order and actual dates, with missing-month handling (zero vs missing explicitly distinguished); compute peaks from MAX, not first item. Responsive tick thinning, zoom/brush where useful, tooltip crosshair, accessible fallback table.
8.8 Avoid misleading visualizations: truncated bars require zero baseline unless justified; no pie with >6–8 categories; do not use 3D; don't imply causality or forecast from descriptive data.
8.9 Render charts with an existing supported local library (reuse installed ECharts if present); lazy-load heavy modules locally. Offline export must bundle or render equivalent vector graphics without CDN.
8.10 Chart sizing: min-height based on content, not fixed oversized cards; equal row heights only when suitable; adapt from 2 columns to 1 at smaller widths; tables scroll horizontally without cutting controls.

======================================================================
9. EXPORT TO PDF — P0 FUNCTIONAL REMEDIATION
======================================================================
9.1 Diagnose why button fails: handler wiring, disabled state, thrown exceptions, worker cancellation, browser pop-up/print limitations, dynamic import failures, CSP, module chunk loading, fonts, images, canvas taint, memory, Blob creation, object URL revocation, Safari/Firefox differences. Capture console and reproducible trace. Fix root cause, not only label.
9.2 Export UX: visible 'Export' menu with PDF, Excel, Offline HTML; PDF button must trigger real PDF generation after explicit click. Show preparing/progress/completed/error state; no silent failures; allow retry and cancel when possible. Use safe filename <dataset>_Executive_Dashboard_<YYYY-MM-DD>.pdf.
9.3 Generate real binary PDF with valid %PDF header (not renamed HTML). Reuse existing jsPDF pipeline if available; otherwise choose local supported library and bundle it. Avoid external service. No print-dialog-only fallback masquerading as PDF download.
9.4 Print layout: A4/Letter selection, portrait for summary, landscape when appropriate for wide charts/tables, consistent margins, header/footer, page number, report title, date/time, source summary, active filters, metric definitions/notes. Charts rendered as vector where supported or high-resolution raster with sufficient DPI and legibility; no clipped axes/legends.
9.5 Pages: (1) executive cover/summary + key KPIs, (2+) charts in reading order, optional details/data quality/methodology; optional appendix with aggregated tables. No blank pages, split KPI cards, overlapping chart labels, cropped content, invisible light text or dark background ink waste by default.
9.6 PDF uses a FROZEN snapshot of canonical filter state and aggregation results; a user changing filters mid-export cannot produce inconsistent pages. Include filtered row count and explicit filter chips in report.
9.7 Verify monetary figures and percentages against source snapshot to agreed tolerance; format consistently in all formats. AOV and margin must use same denominator logic.
9.8 Validate download filename, Blob MIME application/pdf, nonzero size, %PDF signature, page count, extractable text, fonts, images, visual render and file open in Chrome/Edge/Adobe. Automated PDF parse and page raster smoke tests.
9.9 Failure handling: error boundary with actionable message, log locally without dataset contents, cleanup Blob URLs, prevent duplicate clicks, respect memory limits, allow export of summary-only PDF for large datasets only when explicitly indicated.
9.10 Test with dark/light UI, filtered/unfiltered views, 5k/25k rows, empty chart, long category names, Unicode text, currency symbols, negative values, no dates, no numeric columns, multiple charts, mobile browsers where supported.

======================================================================
10. OFFLINE HTML EXPORT — PARITY & SECURITY
======================================================================
10.1 Standalone file must work with network disabled; all CSS/JS/assets embedded or locally available within export; no CDN, trackers, network calls or external fonts. Content Security Policy compatible with self-contained export where possible.
10.2 Exported charts must be styled like in-app charts in selected theme, not downgraded to sparse static bars unless documented. Embed deterministic chart model and interaction controller. Use same labels, precision and aggregation definitions.
10.3 Avoid inline unescaped user text in HTML/JS/attributes; encode data safely, prevent XSS and script breakouts. Sanitize CSV-provided names and filenames. Test malicious labels, quotes, <script>, Unicode, formula injection for XLSX separately.
10.4 Use addEventListener with explicit event parameter rather than global event; semantic buttons, accessible roles, ARIA labels, focus behavior and keyboard support. Tabs need proper tablist/tab/tabpanel relationships.
10.5 Recompute filters locally from embedded dataset or precomputed sufficient cube; if full rows embedded, make size/memory cost explicit. Preserve zero-upload privacy. All data in exported HTML is readable by anyone with the file; warn user before sharing.
10.6 Provenance hashes: identify algorithm and what bytes were hashed; a hash is NOT a digital signature. Remove 'cryptographically sealed' or 'guaranteed parity' language unless verifiable. Provide validation result with timestamp/version/test scope, not marketing absolutes.
10.7 Action queue: if no exceptions, show 'No exceptions detected under configured rules' and list which rules actually ran; omit irrelevant 'review unresolved' recommendations. Never infer all records are healthy just because no rules were configured.

======================================================================
11. EXCEL EXPORT COMPATIBILITY
======================================================================
11.1 Preserve current workbook sheets, formulas, data validations, charts and user flows unless tests prove a change necessary. Align field labels, dates, measure definitions, and filtered totals with HTML/PDF.
11.2 Fix provenance date range by deriving min/max valid dates, ascending. Clarify formula-driven cross-tabs versus actual native PivotTables; don't call a formula cross-tab a native PivotTable.
11.3 Prevent formula injection in exported text cells, validate number formats, date serial handling, chart references, workbook opening, cached values and recalculation flags.
11.4 If Excel export uses full data while PDF exports filtered data, explicitly label the scope or provide an export-scope selector (Current Filter vs All Data) consistently.

======================================================================
12. ACCESSIBILITY, RESPONSIVENESS & POLISH
======================================================================
12.1 Keyboard-only flows for theme switch, filter controls, chart selection, tab navigation, KPI disclosure and export. Visible focus ring. Screen reader announces filter count, refreshed KPIs and export status without excessive noise.
12.2 WCAG AA contrast; semantic landmarks/headings; accessible chart summary and tabular data alternative; reduced-motion preference; touch targets >=44x44 CSS px where feasible.
12.3 Desktop/tablet/mobile: no horizontal viewport overflow, clipped KPI values, overlapping labels, dead space, clipped dropdowns or chart tooltips. Chart legends wrap or collapse. Sticky controls only when they don't obscure content.
12.4 Consistent premium iconography, card radii, whitespace, hover/focus transitions, microcopy, informative empty states and skeletons. No noisy gradients, decorative colors without semantic meaning or excessive animations.
12.5 Print CSS and export renderer must not hide essential chart labels or audit context.

======================================================================
13. PERFORMANCE, OFFLINE, RELIABILITY & SECURITY
======================================================================
13.1 Maintain existing 500, 5k, 8k, 25k stress fixtures and 10 reference dataset parity checks. Add 100k+ optional benchmark if memory allows; do not claim support without measurements.
13.2 Cache normalized typed columns and reusable aggregates keyed by datasetVersion/filterHash/metricSpec. Worker offload expensive aggregation; request cancellation, progress and memory ceilings. Prevent UI freezes on common 5k datasets.
13.3 Record cold load, filter-to-render latency p50/p95, export generation duration, peak memory, bundle growth. Preserve or improve existing documented baseline; define regression thresholds after measuring current implementation (do not invent numbers).
13.4 Avoid unsafe eval, arbitrary HTML, untrusted URLs, prototype pollution and CSV formula injection. Use escaping, input size limits and safe parsing. Do not send dataset data off-device.
13.5 Errors should be visible, recoverable and locally logged without exposing personal/sensitive source rows. Verify offline use in Chrome and Edge; explicitly test Firefox/Safari or mark NOT TESTED (never claim universal browser verification without evidence).

======================================================================
14. TEST MATRIX / ACCEPTANCE SCENARIOS
======================================================================
A. Dataset: 5,000 rows, 22 columns, expected unfiltered:
   Orders 5,000; Net Sales 34,364,744.05; Gross Sales 36,915,840.00;
   Profit 11,188,809.05; COGS 23,175,935.00; Units 22,660;
   Margin ~32.56%; AOV 6,872.94881 assuming verified unique order grain.
   Recalculate against actual source CSV, do not use these as hardcoded app constants.
B. Segment totals: Small Business 12,216,042.40; Consumer 11,217,211.45; Corporate 10,931,490.20; sum = Net Sales.
C. Region totals: South 9,408,288.45; North 8,760,973.60; East 8,126,875.40; West 8,068,606.60; sum = Net Sales.
D. Trend 34 monthly buckets Jan 2024 through Oct 2026; April 2024 peak ~1,379,931.80; verify month sums equal full total.
E. Clicking South changes KPIs + all charts; selecting Apr 2024 filters Order_Date correctly; multi-filter intersects; reset restores baseline; export snapshot matches selected state.
F. Profit Margin and AOV tagged NON_ADDITIVE; COGS ADDITIVE; no inappropriate sum of rates.
G. Dark/Light/System screenshots at desktop/tablet/mobile; readable cards, no cropped axes, no empty oversized panels; theme persists as configured.
H. PDF click downloads real PDF; parse opens; page count >0; no clipped charts; figures equal HTML/Excel; filename correct; error handling works.
I. HTML works with network disabled; tabs/filtering work; no global event reliance; XSS payloads render harmlessly.
J. Generic HR/support/education/unknown datasets do not display invented sales KPIs.
K. 0 rows, 1 row, missing dates, missing numeric columns, duplicate IDs, negative returns, nulls, multiple currencies, long labels, Unicode, invalid dates, 25k rows.
L. Browser coverage: Chrome/Edge verified; Firefox/Safari only marked passed after actual tests.

Automated tests:
- Unit: type inference, derived dates, aggregation, distinct counts, ratio denominators, additivity, sorting, formatting, null handling.
- Property/metamorphic: group sums reconcile to grand total; filters partition data; export totals invariant across formats; reset idempotent.
- Integration: chart click -> state -> engine -> KPI/chart/table -> export.
- E2E (Playwright or existing framework): upload, switch theme, click chart, verify KPIs, reset, export PDF/HTML/XLSX, inspect downloads.
- Visual regression: screenshot snapshots both themes at 3+ viewport widths and print/PDF renders.
- Security: hostile strings, HTML/script injection, CSV/XLSX formula injection, offline network block.

Release blockers: broken PDF, stale KPI after filter, wrong month mapping, incorrect core math, invalid metadata, clipped content, dark/light inaccessible contrast, network leakage, cross-format numeric mismatch, silent export errors.

======================================================================
15. IMPLEMENTATION GUIDANCE FOR ANTIGRAVITY
======================================================================
Step 1: Read existing code and phase reports. Inventory components, chart rendering, export entry points, filtering logic, data model, tests and package dependencies. Report actual root causes before editing.
Step 2: Create regression fixtures and failing tests for known bugs. Capture baseline screenshots in dark and light, export console errors and sample output artifacts.
Step 3: Implement canonical metrics/semantic grain and filter state. Make app and exports use shared functions; avoid divergent duplicated calculation code.
Step 4: Fix PDF export and add binary/document/visual validation.
Step 5: Build theme tokens, KPI components and responsive dashboard layout without changing math.
Step 6: Add chart recommendation rules and chart types with accessibility and data-table alternatives.
Step 7: Rebuild/align offline HTML interactions and audit metadata. Ensure full parity.
Step 8: Update Excel metadata carefully without removing working workbook features.
Step 9: Execute complete test matrix; compare all output formats, screenshot both themes and inspect PDF pages.
Step 10: Deliver release notes, file-level change list, benchmark delta, evidence and rollback plan.

Use existing stack and libraries whenever feasible. Do not introduce large dependencies without bundle/performance justification. Keep additive schema changes and existing public interfaces backward compatible. Require code review for risky export and parser changes. Avoid sweeping refactors while fixing P0 defects.

======================================================================
16. DELIVERABLES / REQUIRED FINAL RESPONSE FROM ANTIGRAVITY
======================================================================
1. Repository architecture audit and confirmed bug root causes.
2. Implemented code changes grouped by phase and impacted files.
3. Updated screenshots: dark desktop, light desktop, tablet, mobile, selected-filter state, export preview.
4. Valid sample outputs: HTML, XLSX, PDF from same 5k dataset, both unfiltered and South-filtered.
5. Numerical parity report including precise source math, KPI/chart totals, date range and tolerance.
6. Automated test output and browser test matrix; mark untested browsers explicitly.
7. PDF validation evidence (%PDF signature, parse success, page count, visual checks).
8. Performance and memory before/after metrics; bundle-size impact.
9. Security/privacy assessment, accessibility checklist, known limitations.
10. Production rollout, monitoring (privacy-safe), rollback instructions, and final PASS/FAIL checklist.

DEFINITION OF DONE: No open P0/P1 defects; every required test passing; screenshot/design approval; exports working; all math consistent; both themes accessible; offline HTML genuinely interactive; unsupported claims removed; user can upload arbitrary reasonable CSV/XLSX datasets without sales-only assumptions.

END OF PRD v10.0
