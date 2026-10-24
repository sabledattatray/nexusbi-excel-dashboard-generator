NEXUSBI UNIVERSAL ANALYTICS — ANTIGRAVITY IMPLEMENTATION PROMPT
PRD v10.1 | Visual Intelligence, Premium UX, Export Reliability
Date: 24 October 2026

ROLE AND MISSION
Act as a principal BI product designer, data visualization engineer, accessibility specialist, and senior TypeScript/React engineer. Upgrade the EXISTING Universal Julius Analytics application, not a replacement. The current screenshot shows repetitive horizontal bars across Customer Segment, Region, Category, and Sales Channel. Merely recoloring or adding more horizontal bars is NOT acceptance. Deliver a visually diverse, analytically defensible, responsive dashboard with polished KPI cards, both themes, true interactions, and working PDF export.

NON-NEGOTIABLE RULES
1. Audit repository and existing implementation first. Reuse established analytics, canonical metric/query engine, DuckDB-Wasm, ECharts (if installed), export adapters, and existing UI components. Do not introduce duplicate calculations, unnecessary packages, or new backend dependencies.
2. Keep CSV/XLSX client-side privacy model, offline HTML, Excel exports, deterministic calculations, provenance, and existing routes intact.
3. Never invent insights, currency, geography, business targets, or unavailable fields. Only render charts when their necessary dimensions and measures exist and have appropriate types.
4. Preserve verified metric definitions: Gross Margin = SUM(Profit)/SUM(Net_Sales), AOV = SUM(Net_Sales)/DISTINCTCOUNT(Order_ID) when valid unique order ID exists, otherwise explicit fallback with explanation; COGS is additive; margins/AOV are non-additive.
5. Every interactive chart must use canonical filtered data and update applicable KPIs, tables, other charts, exported snapshots and the active filter summary. Avoid silent mismatches between displayed and exported values.
6. Keep all existing features working. Make changes in small reversible phases with tests. Do not claim browsers tested unless executed there.

A. SCREENSHOT-SPECIFIC DIAGNOSIS AND REDESIGN
- Current issue: Customer Segment, Region, Category and Sales Channel are near-identical horizontal bar cards, creating monotony and weak visual hierarchy.
- Current issue: monthly x-axis labels crowd and overlap; line chart lacks useful tooltip/period exploration.
- Current issue: large blank space in small-category bar cards, inconsistent density, and generic grid layout.
- Current issue: raw field names remain in subtitles, e.g. Customer_Segment, Order_Date; humanize labels and preserve raw names only in metric lineage.
- Current issue: sales channel shows a currency symbol while subtitle says 'Transactions'; enforce measure/unit consistency and show count if chart is counting orders.
- Current issue: dark left sidebar plus light canvas can be intentional, but must feel cohesive and have full light/dark support, including sidebar, overlays, tooltips, tables and exports.
- Current issue: the screenshot's chart-table icons need meaningful accessible table-view toggles, not inert decoration.

B. REQUIRED DISTINCT VISUALS FOR THE CURRENT E-COMMERCE DATASET
Create an intentional dashboard composition (not one chart per raw column):
1. Net Sales Over Time: large 2-column interactive area/line chart; month-level default, optional weekly/quarterly/yearly grain where supported, smooth but faithful points, compact readable x-axis, hover with exact values, zoom/brush and reset, compare prior period only when mathematically valid.
2. Customer Segment Share: donut with central total and legend, exact values/percentages, click slices to cross-filter; if categories exceed a sensible threshold, choose a ranked bar instead.
3. Regional Sales: sorted horizontal bars, exact values and contribution percentages; support Top N/Other and zero/negative values without deceptive widths.
4. Product Category Mix: treemap sized by Net Sales, with tooltip for share and profit; use ranked bars when treemap becomes unreadable or category cardinality too high.
5. Sales Channel Mix: 100% stacked bar/column by segment or region if a meaningful second dimension exists; otherwise donut; make metric Net Sales or Order Count explicit and consistent.
6. Gross Sales -> Discount -> Net Sales -> COGS -> Gross Profit: true financial waterfall with valid bridge mathematics; do not treat all steps as positive additions.
7. Revenue and Gross Profit by Month: dual series combo chart (bars for sales, line for profit or profit margin); if mixing units, clearly label axes and avoid misleading scale.
8. Order Status by Channel: stacked column chart, counts or proportions, consistent legend and status colors; only if Order_Status and Sales_Channel exist.
9. Revenue Calendar: year/month heatmap when dates are valid and sufficiently populated; explain partial periods and avoid pretending sparse days represent full months.
10. Product Performance: scatter plot of product revenue vs margin (bubble size = quantity where meaningful), with non-additive margin computed from sums, not average of percentages; only if product grain exists.
No more than two charts of the same chart type in the first dashboard viewport unless the semantic selection engine documents why. At least five genuinely different visual encodings across the complete default e-commerce dashboard. Do not show all 10 charts by default on small screens; group them into Overview, Revenue, Customers & Regions, Products & Operations with navigation or configurable sections.

C. UNIVERSAL CHART INTELLIGENCE
Implement chart recommendation/validation from schema profiles, cardinality, time coverage, null rates, data grain, metric additivity and available dimensions. Explicit selection rules:
- Time + additive measure => line/area; temporal breakdown with categorical split => stacked area/columns only when legible.
- Small categorical share <=6 groups => donut if values are nonnegative; otherwise ranked bars.
- Hierarchical composition => treemap when hierarchy and positive additive size metric exist.
- Ranking / many categories => sorted horizontal bar with Top N/Other.
- Two numeric measures at coherent entity grain => scatter; third positive size measure => bubble.
- Date x category => heatmap when coverage adequate.
- Waterfall only when a valid financial bridge exists; otherwise omit.
- Status x channel => stacked columns when both dimensions present.
- Never sum percentage, unit price, rating, balance across time or other non-additive measure.
- Avoid pie/donut for negative values, excessive categories, or totals with mixed sign.
- Every chart spec records reason selected, dimensions, measures, aggregation, grain, filters, missing-data policy, and fallback reason.
- Provide chart-type switcher only among semantically valid alternatives. No arbitrary conversion that distorts data.

D. PREMIUM DASHBOARD DESIGN SYSTEM
Use a restrained executive SaaS aesthetic, not a noisy gradient template. Layout max-width around 1440-1600 px, fluid content; 12-column desktop grid, 6-column tablet, single-column mobile. One hero time-series chart, medium supporting cards, compact insights strip. Align edges, consistent padding 20-24px, 12-16px radii, soft shadows only in light theme, subtle borders in dark theme. Provide purposeful whitespace, no empty half-cards.
Dark tokens: page #090F1E, surface #111B2E, elevated #17243A, border #26354A, primary text #F4F7FC, muted #A8B6C9. Light tokens: page #F5F7FB, surface #FFFFFF, elevated #F9FBFE, border #DCE3EC, primary text #172033, muted #52637B. Adjust accents to meet WCAG AA. Theme switcher persists locally and respects system preference on first visit. Tooltips, dropdowns, axes, gridlines, dialogs, loading skeletons, tables, print and PDF must honor theme or use an intentional print-safe export palette.
Typography: clear hierarchy, sensible tabular numeric font, no tiny unreadable labels, no raw underscores in user-facing titles. Standardize formatting: $34.36M on cards, exact $34,364,744.05 in tooltip/table, proper currency from source/user selection, not guessed from locale. Show units on axes and legends. Do not use chart color as the only category identifier.

E. KPI CARDS — COMPLETE POLISH
Responsive 4-across desktop / 2 tablet / 1-2 mobile; 6-8 high-value KPIs, configurable. Each card: readable human label, prominent value, unit, subtle icon, optional period delta only with valid comparable baseline, optional tiny sparkline only if time series exists, info/definition popover, denominator and missing-row exclusions, accessible focus state, skeleton while calculating, explicit N/A for undefined ratios. Distinguish financial positives/negatives semantically; avoid showing a fabricated +x% badge. Clicking a card should open metric lineage/details, not falsely apply a filter. Cards must not overflow at 200% zoom. KPI values must update with filters and exports.

F. INTERACTION CONTRACT
- Support multi-select filters across Region, Customer Segment, Category, Sales Channel, Order Status, and date range; OR within a dimension, AND across dimensions. Clearly display chips and active record count.
- Click chart item to filter; Ctrl/Cmd or explicit mode to multi-select; keyboard equivalent for every action. Chart background click must not accidentally clear unrelated filters.
- All visuals update from the same filtered canonical dataset. Date bucket selections map to Order_Date accurately; month range includes all dates in selected month and respects local/date parsing policy.
- Provide Reset All, Undo Last Filter, clear individual chips, empty-result state, and active filters in exports.
- Tooltips show exact number, contribution %, period, relevant comparison, and units. Crosshair for line charts; hover and keyboard focus support.
- Drilldown: year > quarter > month > day where coverage supports it; back breadcrumb. Top N and sort controls should not alter total KPI values.
- Every chart has an accessible data-table toggle with sortable columns and copy/export CSV option; no nonfunctional icons.
- No data mutations; filter operations must be deterministic and reversible.

G. PDF EXPORT — BLOCKER / P0
Investigate current PDF button click handler end-to-end, not just generation helpers. Verify actual browser download in Chrome. Support browser-safe Uint8Array/Blob; no unguarded Node Buffer references. Ensure filename, correct MIME application/pdf, proper URL.revokeObjectURL timing, loading/progress indicator, error toast, repeated downloads, no popup blocker dependency. Multi-page A4 landscape or appropriate print layout, vector charts/text where feasible, chart/table pagination, non-clipped headings, legends, KPIs, footer, page number, timestamp, dataset name, active filter chips, row counts, source provenance. No screenshot-only blurry PDFs. Use print-safe palette, sufficient contrast, no dark page background unless user chooses it. Validate %PDF signature, %%EOF, page count, nonblank pages, content and numbers. Test unfiltered, South-filtered, date-filtered, and zero-record cases; exact parity with visible state. Avoid claiming embedded fonts unless actually embedded.

H. EXPORT PARITY AND OFFLINE
HTML must be standalone with zero CDNs and fully functional charts/filtering offline, not merely static SVG/bar placeholders. If chart library cannot be embedded safely, implement documented lightweight offline renderer with equivalent semantic visuals, or clearly disclose visual differences while maintaining numeric parity. Excel must preserve source rows and accurate summary, clear labels, correct min/max dates and additivity. Export all selected filter context. PDF, HTML, Excel, in-app KPI calculations must use one canonical metric specification. Add deterministic source hash labeling without claiming cryptographic signatures unless digitally signed.

I. PERFORMANCE, PRIVACY, SECURITY, ACCESSIBILITY
- Profile 5k, 25k, 100k and allowed maximum dataset size; avoid blocking main thread; worker-based aggregations where appropriate, memoized chart specs, virtualized long tables, debounced interactions, cancelable jobs, no excessive DOM/SVG points.
- Never send uploaded data to external endpoints. No third-party chart CDNs or remote telemetry by default. Escape untrusted headers/values, sanitize spreadsheet formula injection, prevent XSS, avoid dangerous HTML insertion.
- WCAG AA contrast, keyboard navigation, ARIA labels, reduced-motion support, visible focus, 200% zoom, accessible chart tables, and meaningful empty/loading/error states.
- Responsive check at 360, 390, 768, 1024, 1440 and 1920 widths. No overlapping date labels or horizontal page overflow.

J. IMPLEMENTATION PHASES
Phase 0: capture baseline screenshot, inspect components and exporters, identify actual chart renderer and PDF failure, add failing tests.
Phase 1: canonical chart-spec intelligence, semantic measure/type validation, metric consistency, cross-filter correctness.
Phase 2: premium light/dark design tokens and KPI component redesign.
Phase 3: diverse chart library implementation, purposeful responsive dashboard composition, real chart/table toggles.
Phase 4: export click-path repair, PDF pagination, offline HTML semantic parity, Excel parity.
Phase 5: visual regression snapshots, cross-browser and keyboard tests, performance/security audit, rollout and rollback.
After each phase run existing tests, preserve backward compatibility, and document changed files.

K. NON-NEGOTIABLE ACCEPTANCE TESTS
1. Original 5,000-row CSV displays 5,000 transactions, $34,364,744.05 Net Sales, $11,188,809.05 Profit, 32.56% margin and 22,660 units. Do not confuse this with the unrelated 5k INR demo data used in earlier handoff.
2. At least five different valid chart types visible across default e-commerce dashboard; four adjacent near-identical horizontal bar charts is an automatic FAIL.
3. Chart titles/subtitles human-readable; sales-channel count never formatted as currency; monthly x-axis labels do not overlap at 1280px and 390px.
4. Filter Region=South changes every applicable KPI/chart and all three exported snapshots; clearing restores exact original values. Compare against direct source-row recomputation.
5. Donut percentages sum to ~100% subject to display rounding; treemap and waterfall reconcile to canonical totals; profit margin is ratio-of-sums.
6. Both themes tested with screenshots on desktop and mobile; no contrast, clipping, or tooltip regressions.
7. PDF button triggers a real downloadable nonblank multi-page PDF from browser; header/EOF and content verified; all visible financial numbers reconcile.
8. HTML opens offline without network and preserves interactive filtering, exact metric values, and meaningful chart variety.
9. Chart data table toggles work; keyboard filtering and reset work; accessibility tests pass.
10. Run existing unit/integration suites, add chart-spec and PDF regression tests, provide actual output logs. Mark untested browsers UNTESTED, not PASSED.

L. REQUIRED ANTIGRAVITY HANDOFF
Provide: (1) changed-file inventory, (2) before/after desktop and mobile screenshots in dark and light themes, (3) chart selection matrix for 5k sales CSV plus at least two different domains, (4) tested PDF/HTML/XLSX output files, (5) exact KPI reconciliation table, (6) browser download verification evidence, (7) test logs and known limitations, (8) rollout/rollback instructions. No unsupported 'production ready' claims. Deliver implementation, not only a plan or mockup.

FINAL DIRECTIVE
The visual diversity and usability are the core objectives. Do not stop at CSS polishing, new colors, more cards, or a claimed test pass. Demonstrate a fundamentally improved, cohesive, interactive BI experience and a working PDF download with numerical integrity preserved.
