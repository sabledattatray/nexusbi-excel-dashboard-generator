EXCEL.DATTASABLE.COM COMPLETE PRODUCTION-GRADE PRODUCT REQUIREMENTS
DOCUMENT (PRD) Universal Excel/CSV MIS Automation, 32 Dashboard
Templates, Schema Intelligence, Data Accuracy, Export Reliability, and
Client Conversion Version: 3.0 | Date: 23 October 2026 Status:
Implementation specification; requires repository discovery and
validation Owner: Datta Sable
============================================================

0.  EXECUTIVE DIRECTIVE Improve the EXISTING excel.dattasable.com
    application, which supports Excel/CSV uploads under 50 MB, generates
    reports on mobile and desktop, and contains 32 dashboard templates.
    DO NOT rebuild, delete, replace or break its current capabilities.
    Inspect its actual repository and dependencies before modifying
    anything. Treat all uploaded files as potentially unfamiliar: field
    names, positions, types, formats, grain, sheet names and domains
    change on every upload.

Outcome: an uploaded supported file is safely profiled; source values
are preserved; semantic fields are inferred with appropriate user
confirmation; compatible reports are selected; defensible KPIs are
calculated; Excel dashboards are exported and independently validated;
errors are clearly reported. No invented data or hard-coded financial
KPIs.

This document consolidates the earlier defect review, universal schema
addendum, functional architecture, quality, security, performance,
product and commercial recommendations. Some defects were reported
during earlier workbook review; the coding agent must reproduce them
against the supplied fixture and code before claiming their precise root
causes.

1.  CURRENT PRODUCT & NON-NEGOTIABLE CONSTRAINTS

-   Existing website: excel.dattasable.com
-   Existing 32 dashboard templates: preserve each and record its actual
    ID, required/optional fields and compatibility status.
-   Existing uploads: CSV/XLSX under 50 MB; preserve existing supported
    formats.
-   Existing fast report generation and mobile workflow: preserve.
-   No mandatory new backend, database, cloud upload, paid AI, analytics
    or subscription.
-   No silent changes to privacy promises. Determine whether processing
    is local or server-side from source and actual network tests.
-   No unauthorized production deployment or destructive schema
    migration.
-   Feature flags for risky changes, migration/rollback plan, and
    regression tests.
-   Reuse existing Next.js, UI, libraries and services IF actually
    present; do not assume the Excel subdomain uses the main site’s
    stack.
-   Avoid changing the original source file; maintain immutable logical
    source rows and separately track normalization and derived values.

2.  REPORTED DEFECTS TO REPRODUCE AND FIX (P0/P1) Earlier review of
    Sales_MIS_Validation_6000_Transactions_Executive_Sales_Dashboard_2026.xlsx
    reported: D01 [P0] Gross profit margin displayed 0%, expected 21.16%
    for full unfiltered fixture. D02 [P0] Discount percentage displayed
    as a summed value (e.g. 343.52), rather than a valid discount amount
    or effective rate. D03 [P0] Exported source dates apparently
    included 2024 despite input range 2025-01-01 to 2026-09-30. D04 [P0]
    Product category margin used hard-coded 48% in a formula; remove
    fabricated assumptions. D05 [P1] Regional margin calculation
    appeared to use discount/gross sales rather than gross profit/net
    sales. D06 [P1] INR measures had USD ($) formatting. D07 [P1]
    Generated customer/product dimensions included apparently
    unsupported descriptions, tiers, renewal and stock attributes. D08
    [P1] City/region crosstab may have silently omitted categories;
    label Top N and Other explicitly or include all. D09 [P2] Raw
    technical KPI names and unsupported ‘Certified Actuals’ labels. D10
    [P2] Average gross sales/transaction displayed rounded 60,042
    instead of 60,042.44; display precision issue, not automatically a
    calculation failure. D11 [P1] Earlier inspection reported an
    openpyxl failure involving workbook protection algorithmName;
    reproduce and test OOXML interoperability, do not claim Excel itself
    fails without checking. For each: identify exact sheet/cell/formula,
    root cause, minimal fix, before/after test and severity. Do not
    assume all 32 templates have these defects.

3.  PERMANENT REFERENCE FIXTURE (P0) File:
    Sales_MIS_Validation_6000_Transactions.csv Reference:
    Sales_MIS_Validation_Reference_Totals.json Rows/transaction IDs:
    6,000 / 6,000 unique Date range: 2025-01-01 to 2026-09-30 Quantity:
    17,966 Gross Sales INR: 360254632.50 Discount Amount INR:
    20424045.95 Net Sales INR: 339830586.55 Total Cost INR: 267920146.50
    Gross Profit INR: 71910440.05 Gross Profit Margin: 21.16% (display
    rounding) Average Gross Sales/Transaction: 60042.43875, displayed
    60042.44 Business definition: one row is one transaction line in
    this fixture; no returns/taxes/shipping; payment status does not
    change recognized sales. Reference regional net sales: East
    84618565.83; North 93847848.12; South 80799797.34; West 80564375.26.
    Reference category net sales: Accessories 15819173.70; Laptop
    230090394.75; Monitor 60123522.95; Networking 22297015.55; Storage
    11500479.60. Payment statuses: Paid 4934; Overdue 346; Pending 720.
    Use reference JSON for monthly breakdown and exact reconciliation.
    These values belong in TESTS ONLY, never in report-generation code.

4.  UNIVERSAL SCHEMA-ADAPTIVE INGESTION (P0) Every file can have
    entirely different:

-   Column names, spelling, language, casing, whitespace, punctuation
    and abbreviations.
-   Column order, count, nested headers, blank/duplicate headers.
-   Date/time and timezone representations.
-   Numeric/currency/percent/boolean/status formats and missing-value
    conventions.
-   Sheet names and multiple tables per workbook.
-   Record grain: line item, order, invoice, payment, employee,
    attendance day, daily aggregate.
-   Business domain and field relationships. Never depend on fixed CSV
    headers, positional column indexes or an example schema.

Pipeline: intake -> security/size checks -> parse -> immutable source
snapshot -> profile/type inference -> grain/domain inference -> semantic
mapping -> user confirmation as needed -> validated canonical model ->
metrics -> filters -> compatible templates -> render -> export ->
independent verification.

Support UTF-8 with/without BOM, common encodings where safely detected,
CSV delimiters/quoted multiline fields, locale-sensitive decimal/group
separators, XLSX sheet selection, Excel serial dates, ISO and common
localized dates. Reject unsafe/malformed structures gracefully. Protect
identifiers with leading zeroes. Preserve original cell values and row
order for traceability. Do not drop duplicates without explicit
business-key validation.

5.  SEMANTIC FIELD MAPPING (P0) Candidate examples (not universal
    equivalences):

-   Net revenue: Net_Sales_INR, Revenue, NetAmount, Sales_Amount,
    NetSales (check gross vs net meaning).
-   Gross sales: Gross_Sales, Gross_Amount.
-   Discount amount: Discount_Amount, Discount_Value.
-   Discount rate: Discount_Pct, Discount_Rate.
-   Cost: Total_Cost, COGS, Cost_Amount (check unit vs extended).
-   Quantity: Qty, Quantity, Units_Sold.
-   Date: Order_Date, Txn_Date, InvoiceDate, Date (check business
    event).
-   Customer: Customer_ID, Client_ID, Buyer.
-   Region: Region, Zone, Territory.
-   Employee: Employee_ID, EmpCode, Staff_ID.
-   Attendance: Attendance_Status, Present_Status. A column called Rate,
    Value, Amount, Total or Status is inherently ambiguous: use value
    distributions, companion columns, units, domain, relationships and
    explicit confirmation.

Types: IDENTIFIER, TEXT_DIMENSION, CATEGORY, DATE, DATETIME, CURRENCY,
INTEGER_MEASURE, DECIMAL_MEASURE, QUANTITY, PERCENTAGE, RATIO, BOOLEAN,
STATUS, DURATION, DERIVED_MEASURE, UNKNOWN. Mapping precedence: explicit
current user selection > validated saved mapping > exact recognized
schema > high-confidence aliases plus values/context > type/statistical
inference > confirmation. For each mapping retain source header,
canonical field, source and normalized types, units/currency, grain,
confidence, mapping origin, transform provenance and warnings. Do not
assume confidence 0.99 based only on a column name. Require confirmation
for high-impact ambiguous fields. Show concise mobile-friendly mapping
preview; allow override and ‘Unknown’. Saved profiles must be scoped,
versioned and revalidated against changed schemas. Unfamiliar data ->
generic descriptive profiling, not fake industry-specific metrics.
Missing required fields -> mark template incompatible; optional missing
-> omit relevant KPI/chart and explain.

6.  DATA-TYPE AND LOCALE EDGE CASES (P0) Examples: 2026-10-23,
    23/10/2026, 10/23/2026, 23-Oct-2026, Excel serial; 15000, 15,000.00,
    ₹15,000, INR 15000, (15,000); 15%, 0.15, 15;
    Paid/PAID/Completed/1/True.

-   Ambiguous dates require locale confirmation; no arbitrary MM/DD
    assumption.
-   Percent 15 and 0.15 cannot be normalized interchangeably without
    evidence.
-   Parentheses may mean negative amounts; document conversion.
-   Phone/postal/IDs are not sums; preserve leading zeroes and long
    identifiers.
-   Do not silently coerce mixed currencies or mixed status codes.
-   Track invalid conversions and rows affected; show warnings and block
    unsafe calculations.
-   Multi-sheet joins require user-confirmed keys, cardinality and
    grain; detect one-to-many duplication risk.
-   Distinguish source missing from derived unavailable and valid
    numeric zero.

7.  DATASET GRAIN, DOMAIN & TEMPLATE MATCHING (P0) Detect or confirm
    whether rows represent sales lines, orders, invoices, payments,
    customers, employees, attendance, balances, aggregate periods, etc.
    Separate row count, unique transaction count, order count and
    customer count. Never sum an already repeated order header amount
    across its lines. Domains: Sales, Finance, Inventory, HR, Payroll,
    Banking/Collections, Procurement, CRM, Logistics, Healthcare,
    Education, Manufacturing, Marketing, Support, General/Unknown. For
    each existing template define actual required fields, optional
    fields, supported grain, domain, metrics, charts, fallback rules and
    version. Statuses: Fully Compatible / Partially Compatible /
    Requires Mapping / Incompatible. Never force unrelated data into a
    sales dashboard or generate unsupported metrics. Generic profile
    fallback when domain unknown. Template recommendation must explain
    missing requirements and why a match is proposed.

8.  CANONICAL CALCULATION ENGINE (P0) Central versioned metric registry
    shared by all 32 templates. Template renderers consume validated
    metric results, not custom ad hoc arithmetic. Where supported by
    source accounting definitions: Gross Sales = SUM(gross sales).
    Discount Amount = SUM(discount amount). Net Sales = Gross Sales -
    Discount Amount; if directly supplied, compare/reconcile, do not
    overwrite. Gross Profit = Net Sales - COGS/total applicable cost.
    Gross Profit Margin = SUM(Gross Profit) / SUM(Net Sales). Effective
    Discount Rate = SUM(Discount Amount) / SUM(Gross Sales). Average
    Transaction Value = SUM(Net Sales) / DISTINCTCOUNT(Transaction ID),
    only if appropriate grain. Average Gross Sales per transaction =
    SUM(Gross Sales) / DISTINCTCOUNT(Transaction ID). Use decimal-safe
    arithmetic; avoid early rounding. Never sum percent fields, average
    unweighted row margins for total margin, or hard-code 48% or any
    other fallback business result. Zero denominator -> ‘N/A’ with
    reason, not falsely 0%. Support dates/day/week/month/quarter/year,
    MoM, YoY, YTD/QTD, rolling periods, partial period labels and
    comparable-period logic. Do not fabricate previous years or targets.
    Cross-domain calculations: HR headcount/attrition, attendance,
    finance expense/budget, inventory stock movements and valuation, AR
    aging, loan DPD/recovery, procurement, fulfillment, support SLA —
    only when necessary source events and definitions exist. Mixed
    currencies must remain separate unless explicit FX rates, conversion
    dates and rules are supplied.

9.  FILTERS, CHARTS AND VISUAL ACCURACY (P1) Single filter context for
    all affected KPIs, charts and detail tables. Region selection
    updates revenue, cost, margin, quantity and trends consistently;
    dependent city filters show only relevant cities. Charts selected
    based on data: date+measure trend; category+measure bars;
    actual+target variance; status counts; department headcount; region
    revenue. Use correct chart types, units, chronological order, label
    Top N and excluded Other, avoid category omission and cached stale
    values. Unsupported charts hidden with explanations, not populated
    with placeholder actuals. Professional readable KPI labels,
    source-derived period, correct INR/USD/other currency formatting,
    responsive preview, printable layouts, data definitions, filters and
    warnings.

10. EXPORT WORKBOOK DESIGN (P1) Preserve current successful workbook
    structure where possible; optional standardized sheets: START_HERE,
    EXECUTIVE_DASHBOARD, DETAILED_ANALYSIS, SOURCE_DATA,
    DATA_DICTIONARY, DATA_QUALITY, CALCULATION_AUDIT, REPORT_METADATA.
    SOURCE_DATA must preserve originals, or document explicit
    normalization and provide original copy. Excel Tables/expandable
    ranges where suitable; correct formulas, chart references, cached
    values, recalc flags, data formats, freeze panes, printing,
    reasonable sheet protection. No unsafe protection
    algorithmName/OOXML metadata. Test zip/XML relationships, formulas,
    charts, reopening with openpyxl where appropriate and Microsoft
    Excel Desktop/web/mobile. Note openpyxl does not calculate formulas;
    use actual calculation engine or Excel to test values. Independent
    pre-export and post-export checks; status VERIFIED only after actual
    reconciliation. Avoid formula injection: sanitize untrusted text
    values beginning with =, +, -, @ where required for spreadsheet
    output, while preserving underlying original values safely. Do not
    execute macros.

11. DATA QUALITY & RECONCILIATION (P0) Checks: invalid headers, types,
    date range, missing values, duplicate keys, impossible business
    values, mismatched sums, broken references, unexpected currency,
    source/export row/ID differences, unsupported assumptions,
    mismatched filters. Negative amounts may be legitimate
    returns/credits; do not reject blindly. Severity: CRITICAL blocks
    affected report; ERROR blocks affected KPI; WARNING allows informed
    continuation; INFO documents condition. Export data quality sheet
    with source file, row count, unique keys, range, inferred currency,
    mapping decisions, transforms, unsupported KPIs, validation results,
    engine version and timestamp. Core tests: sum
    monthly/region/category net sales = total net sales; profit = net
    sales - cost; margin = profit/net sales; filtered aggregates match
    charts; source dates and IDs unchanged. No arbitrary ‘quality score’
    concealing a critical issue.

12. PERFORMANCE, 50 MB LIMIT, MOBILE (P1) Measure separately parsing,
    profiling, mapping, metrics, rendering and XLSX export. Avoid
    UI-thread blocking; use existing Web Workers if available.
    Stream/chunk where feasible, minimize memory copies, cache reusable
    aggregations, release memory, support cancellation and progress.
    Proposed non-guaranteed targets on documented reference devices: 6K
    rows <10s, 50K <20s, 100K <30s; 50 MB no crash and understandable
    progress. Benchmark realistically; 50 MB does not imply a fixed row
    count. Preserve mobile file picker, mapping controls, template
    selection, download, navigation and touch accessibility. Show actual
    generation duration, errors and compatibility status. Graceful
    memory exhaustion.

13. SECURITY & PRIVACY (P0/P1) Verify client-only vs server processing;
    don’t make unverified zero-upload/zero-telemetry claims. File
    signature validation, archive-bomb guards, XLSX parser safety, 50 MB
    checks, safe formula handling, no arbitrary script/macro execution,
    XSS protection, no confidential source rows in logs/analytics.
    Server-side temporary retention and access control documented if
    used. Saved reports protected. Use dependency security scans and
    licenses. Privacy-respecting telemetry only with appropriate
    disclosure/consent.

14. AUTOMATED QA MATRIX (P0/P1) For every template test compatible
    source, missing optional/required fields, nulls/invalids,
    renamed/reordered columns, type variation, small/large files,
    filters, Excel export and mobile flow. Metamorphic tests: identical
    source facts under renamed columns, reordered columns, alternative
    supported dates and formatted amounts -> identical canonical KPIs
    after confirmed mapping. Adversarial tests: ambiguous dates, 15 vs
    0.15, duplicate IDs, multiple sheets with one-to-many joins,
    currencies mixed, all-null measure, zero denominators, negative
    returns, Unicode, malicious formulas, malformed XLSX/CSV, file over
    limit. Test levels: unit, integration, end-to-end, export, Excel
    interoperability, performance, security, accessibility. Each test
    needs fixture, expected result, reproducible command, outcome and
    failure evidence. Never fabricate passing tests or claim
    ‘production-ready’ based on successful compilation alone.

15. SMART FEATURES AFTER ACCURACY (P2)

-   Explain This KPI: source columns, definition, numerator/denominator,
    filter context, validation.
-   Automatic template recommendations with reasons.
-   Saved mapping profiles and schema drift warnings.
-   Evidence-based narrative insights, never ungrounded recommendations.
-   Custom KPI builder with safe typed expression parser, no arbitrary
    code execution.
-   Compatible period/file comparisons.
-   Downloadable validation/audit summary.
-   Preview sample data and template compatibility before upload.
-   Provide optional anomaly highlights only when statistically and
    contextually defensible. All P2 features must be feature-flagged and
    not delay P0 fixes.

16. BUSINESS CONVERSION FEATURES (P2) Focus on excel.dattasable.com as
    an actual lead funnel, not just template count.

-   Publish 3-6 verified synthetic-data demo case studies with
    measurable real generation times on named devices.
-   Gallery of existing 32 templates with compatibility and example
    KPIs; do not publish unfinished ones as verified.
-   Free sample workbook and source schema; protect actual client data.
-   ‘Request Custom Excel MIS Report’ flow: problem, deliverable,
    frequency, timeline, contact consent; no required sensitive upload.
-   Professional services: Excel dashboard customization, Power Query
    automation, data cleanup, multi-source MIS integration, ongoing
    support.
-   Privacy-safe funnel events: demo_started, file_validated,
    mapping_confirmed, template_selected, report_generated,
    report_downloaded, quote_requested.
-   Never send uploaded values/identifying filenames to analytics.
-   Keep free demo distinct from paid implementation and support. Price
    only after scoping.
-   Gather opt-in feedback on incorrect KPIs, failed mappings and report
    usefulness.

17. SUGGESTED MODULAR ARCHITECTURE file-intake/ parsers, signatures,
    security, source snapshots schema-intelligence/ type inference,
    aliases, grain, domain, confidence, saved mappings canonical-model/
    typed fields, provenance, units, row grain, relationship metadata
    metric-engine/ metric registry, decimal math, time intelligence,
    filter context validation/ source integrity, quality rules,
    reconciliation, audit status templates/ existing 32 renderers,
    manifests, compatibility adapter excel-export/ workbook generation,
    formulas, styles, protection, reopen checks ui/ mobile upload,
    mapping confirmation, previews, warnings, downloads tests/ fixtures,
    expected totals, metamorphic, end-to-end, performance, security This
    is a logical layout, NOT a command to restructure the repository
    wholesale.

18. DELIVERY PHASES & EXIT GATES Phase 0: Repository discovery and
    current behavior baseline. Deliver component inventory, dependency
    map, fixture reproduction, risk list. Phase 1: Source integrity and
    robust parsing. Gate: IDs, dates, source values preserved. Phase 2:
    Canonical schema mapping, grain and type inference. Gate:
    renamed/reordered/alternate format tests pass. Phase 3: Shared
    metric engine. Gate: all fixture totals and ratios reconcile. Phase
    4: Template compatibility and filters. Gate: no invented unsupported
    KPI; 32 manifests reviewed. Phase 5: XLSX export and
    interoperability. Gate: formulas/charts valid, independent
    reopen/Excel checks. Phase 6: Validation and 32-template regression.
    Gate: each template has documented supported/unsupported test
    results. Phase 7: Mobile and 50 MB performance/security. Gate:
    measurable benchmark, no severe regressions. Phase 8: Optional P2
    intelligence and commercial features. Gate: consent/privacy and
    business-flow tests. Phase 9: Staging, release checklist, explicit
    approval, monitored deployment, rollback. No production deployment
    without approval. Use feature flags and reversible incremental
    changes.

19. ACCEPTANCE CRITERIA / DEFINITION OF DONE [ ] Original uploaded
    source fields and values preserved. [ ] Every field mapping is
    explainable and correct or user-confirmed. [ ] Unfamiliar headers,
    reordered columns and supported type changes produce equivalent
    results. [ ] Missing/ambiguous essential fields never create fake
    metrics. [ ] Source grain and join cardinality prevent double
    counting. [ ] 6,000-row reference metrics reconcile exactly before
    display rounding. [ ] Monthly/region/category totals and filtered
    charts reconcile. [ ] No hard-coded business margins, targets,
    trends or unsupported customer/product attributes. [ ] Currency and
    ratio formats correct, undefined values not misrepresented. [ ] 32
    existing templates remain accessible with explicit compatibility
    outcomes. [ ] XLSX opens, recalculates and charts work in supported
    Excel clients. [ ] Protection metadata interoperable; workbook
    integrity checked. [ ] Data-quality and calculation-audit outputs
    available. [ ] 50 MB limits, malformed inputs and mobile workflows
    tested. [ ] Security and privacy statements match actual
    implementation. [ ] Regression suite, performance measurements and
    known limitations documented. [ ] Deployment requires owner approval
    and rollback plan.

20. REQUIRED HANDOVER Provide: architecture findings; list of exact
    modified files; defect-by-defect before/after evidence; semantic
    mapping rules; metric definitions; all 32 template compatibility
    statuses; automated test commands and outputs; performance results
    with hardware; export compatibility results; security/privacy
    findings; remaining limitations; migration/rollback/deployment plan.
    Distinguish confirmed defects, hypotheses and enhancement requests.
    If the fixture files are not in the repo, request them; never
    fabricate test data/results.

FINAL DIRECTIVE TO CODEX / ANTIGRAVITY Inspect the existing
excel.dattasable.com repository FIRST. Reproduce reported errors using
the real uploaded Sales MIS fixture and reference JSON. Preserve all
existing functionality and 32 templates. Implement a shared universal
schema-adaptive, source-preserving, grain-aware, validated metric and
export pipeline. Treat every newly uploaded file as potentially using
entirely different names, types, formats and relationships. Ask for
clarification on consequential ambiguity. Never fabricate missing
business values. Test across domains and devices. Make changes
incrementally and do not deploy without approval.
============================================================ 
============================================================
21. FUNDAMENTAL PRODUCT PIVOT: AUTONOMOUS, DATA-DRIVEN DASHBOARD GENERATION (P0)
The product is NOT primarily a system that assigns an arbitrary file to one of 32 predefined dashboards. It is a universal analytical report designer. Any user may upload any supported tabular data from any industry for any purpose. The system MUST first understand that particular dataset, then independently decide which truthful KPIs, dimensions, comparisons, visualizations, report sections and dashboard layout are appropriate. The existing 32 templates are OPTIONAL presentation presets or inspirations, never a constraint on what analyses are possible.

Core invariant: discover -> understand -> validate -> plan -> calculate -> visualize -> explain -> export -> reconcile. Never design a chart first and fabricate data to fill it. Never infer business meaning with unwarranted certainty.

For unknown data, generic descriptive exploration (distribution, completeness, unique categories, valid temporal patterns, relationships) is a successful output. It is better than a fabricated sales dashboard.

22. USER-DRIVEN INTENT AND AUTONOMOUS ANALYSIS (P0)
Accept an optional natural-language goal: "analyze attendance", "find regional revenue drivers", "compare monthly expenses", "summarize my survey", "show trends and outliers", or "just make the best dashboard". Goals are preferences, not evidence; calculations still require data.
Modes:
A. Auto Discover (default): generate the most useful defensible dashboard with no setup.
B. Goal Guided: prioritize analyses that answer the user's stated question.
C. Advanced: user can override fields, aggregation, chart selection, filters, units and layouts.
D. Template Guided: use one of the 32 presets when compatible.
The system should autonomously proceed on unambiguous mappings, but pause for only consequential ambiguities (e.g., which amount is revenue; whether row is invoice line or invoice; whether 15 means 15% or 0.15; ambiguous dates; multi-sheet joins). Never make the user configure every chart.

23. AUTONOMOUS DATA UNDERSTANDING PIPELINE (P0)
23.1 File discovery: enumerate sheets/tables; infer header rows, schema, row counts, potential key fields, type/format, duplicate headers, blanks, mixed types, currency, locale, date coverage and null patterns. Recognize wide versus long data and cross-tabs; do not automatically unpivot/pivot without explaining the transformation.
23.2 Dataset identity: infer likely domain(s) but allow UNKNOWN. Support unrelated business, scientific, school, survey, operations, marketing, public and personal datasets, subject to applicable safety/privacy constraints.
23.3 Grain and semantics: infer each row's meaning, identifiers, measures, dimensions, dates, ordinal categories, targets, rates, balances and event statuses; detect additive, semi-additive (e.g., inventory balance), and non-additive metrics (e.g., rates). Never sum stock balances over dates or ratios over rows.
23.4 Relationships: for multi-sheet files, propose key relationships and test uniqueness/cardinality, orphan keys, and join fan-out. Require confirmation for ambiguous joins. Never cross-join just to make a dashboard.
23.5 Dataset profile: row count, type confidence, nulls, distinct values, min/max, outliers, numeric distributions, time gaps, duplicate candidates, correlations where statistically meaningful. Distinguish raw observations from analytical interpretations.
23.6 Semantic plan: generate a machine-readable AnalysisPlan containing metric specs, dimensions, filters, proposed insights, chart specs, data lineage, assumptions and confidence.
23.7 Validate plan BEFORE running: required fields exist, grain matches, units compatible, denominators defined, time comparisons possible, category cardinality reasonable, privacy-sensitive fields excluded where appropriate.
23.8 Execute deterministic calculation engine, not hallucinated figures. Generate report only from computed aggregates.
23.9 Independently reconcile and export.

24. DATA-DEPENDENT KPI SELECTION (P0)
The engine must dynamically choose KPI cards from what data supports:
- Any tabular data: valid record count, distinct entities when identified, missing-value rate, data coverage, numeric summary.
- Numeric measure: total ONLY when additive, mean/median/min/max, standard deviation, percentile, distribution, with clear definitions.
- Time + numeric measure: trend, change and growth ONLY when periods are comparable and semantics permit.
- Category + measure: ranking, share, group averages or totals as appropriate.
- Actual + target: variance/attainment only if comparable units and periods.
- Duration/event data: elapsed time, counts and SLA metrics only if timestamps/status definitions support.
- Survey: response count, distribution and scale-specific summary, never treat arbitrary response codes as numeric measurements.
- Snapshot/balance: point-in-time totals, period-end balance, not sum of repeated balances across time.
- Rates/percentages: weighted aggregation with valid denominator; otherwise show clearly labeled unweighted mean only if justified.
- High-cardinality identifiers: counts and drilldowns, not unreadable charts.
A domain-specific metric (profit, churn, attrition, recovery, stock turnover, conversion, retention) is shown only when necessary definitions and fields are available. When a dataset cannot support business KPIs, produce a useful general exploration dashboard.

25. AUTOMATIC CHART SELECTION & VISUAL VARIATION (P0)
Generate a different mix of visuals based on field types, cardinality, distribution, business question, dataset size and quality. Do NOT always generate the same 7 charts or force a pie chart/line chart for every file.
Rules:
- Date/time + valid metric: line/area trend; bar for sparse periods; show gaps, incomplete periods.
- Few nominal categories + additive metric: sorted bar/column; stacked bar only with meaningful second category and comparable totals.
- Composition with few positive mutually exclusive categories: donut/100% stacked bar; avoid pies with many categories or negative amounts.
- Numeric continuous distribution: histogram or box plot; show outliers responsibly.
- Two meaningful numeric variables: scatter with optional trend line, not a causal claim.
- Two categorical variables: heatmap or grouped/stacked bars where density permits.
- Date/time + categorical events: event counts over time, stacked or small multiples.
- Hierarchy: treemap only for nonnegative additive measures with meaningful parent/child structure.
- Geographic: map only with reliable geographic identifiers and suitable mapping support; otherwise region bars.
- Correlation matrix: only for enough valid numeric observations; explain correlation is not causation.
- Wide high-cardinality tables: searchable detail table, Top N with labeled 'Other', optional drilldown; no crowded unreadable axes.
- Missing/dirty data: quality overview and null distribution.
- No appropriate chart: well-formatted summary table and explanation.
- Accessibility: readable titles, units, contrast, legends, alt descriptions; avoid redundant charts.
Visual recommendations must include a justification and rejected alternatives in debug metadata. User can change chart type only to semantically compatible options. For each upload, layout and visual mix may vary legitimately.

26. GENERATIVE DASHBOARD COMPOSITION (P0)
Create dashboards dynamically from a validated report specification, not from fixed sheet/cell coordinates:
- Generate 1–3 meaningful pages/sections by default, more only when justified by complexity.
- Suggested composition: Overview (3–6 KPIs and 2–4 strongest charts), Trends/Segments, Detail/Quality.
- If there is no time field, omit trend sections. If no categorical dimension, omit segment comparisons. If no additive measure, do not create totals that are meaningless.
- Rank proposed charts using relevance to user goal, statistical validity, information gain, data quality, readability and redundancy penalties.
- Use responsive layout, consistent visual grammar, clear units, notes on missing metrics and data provenance.
- Allow a dynamic report title based on detected domain/goal; if uncertain use 'Data Overview' rather than invented company or period.
- Generate filter controls only for actual, useful dimensions and date fields.
- Support empty, tiny, sparse and single-column datasets gracefully.
- 32 existing templates remain available as optional style/layout presets, and should be refactored to consume the same dynamic AnalysisPlan and MetricResults rather than defining truth.

27. REQUIRED INTERNAL CONTRACTS (P0)
Illustrative typed specification (adapt to current language/framework):
DatasetProfile: {datasets, sheets, fields:[{sourceName, inferredType, semanticRole, confidence, examplesRedacted, nullRate, cardinality, units}], grain, keys, relationships, qualityIssues}
UserIntent: {mode, goalText, selectedTemplate?, overrides?}
MetricSpec: {id, label, inputs, aggregation, numerator?, denominator?, unit, grain, filterContext, missingPolicy, formulaVersion}
ChartSpec: {id, title, type, xField, yMetrics, aggregation, grouping?, filterDependencies, dataQualityGate, rationale}
DashboardPlan: {title, datasetRef, goals, metrics, charts, sections, filters, assumptions, unsupportedRequests, warnings, version}
MetricResult: {valueOrUnavailable, unit, sourceFieldRefs, filters, validationStatus, calculationTrace}
ExportManifest: {sourceHash, planHash, engineVersion, metrics, chartRefs, reconciliationResults, limitations}
All numerical data must come from deterministic calculations; if an LLM is optionally used for field descriptions or plan suggestions, it MUST NOT supply numeric values, fabricate columns, execute arbitrary uploaded instructions or bypass the deterministic validator. Provide a rules-based baseline with no paid AI dependency.

28. AUTONOMOUS EXAMPLE SCENARIOS & EXPECTED OUTPUT (P0)
A. Two columns Date, Temperature: trend + min/max/average and distribution; no revenue/profit.
B. Student, Subject, Score: subject distributions, student performance table, score spread; no fabricated pass rate without threshold.
C. Employee, Department, JoinDate, Status: headcount by department, join trends, status mix; no salary/attrition claims without definitions.
D. OrderDate, Product, Qty, UnitPrice: compute line sales only if quantities and unit prices are compatible; sales trend, top products, quantity mix; no profit without cost.
E. Survey responses with Likert categories: response distribution, segment comparisons; ordinal-aware summaries, no arbitrary sum of response codes.
F. Inventory snapshots by date/SKU: latest stock by SKU and stock trends; never sum balances across dates.
G. Support tickets with OpenedAt, ClosedAt, Status: counts, duration for valid pairs, aging; avoid assuming unclosed cases have zero resolution time.
H. Single numeric column: count, distribution, quartiles and outliers; no unsupported categorical comparison.
I. Unknown data with inconsistent types: profile, warnings, valid descriptive summaries; offer manual mapping.
J. Multiple related sheets: verify keys, avoid double-counting; build cross-sheet dashboard only if relationship is defensible.
K. Renamed/reordered/locale-formatted versions of same facts: equivalent results after mapping.
L. Sensitive information: avoid exposing individual-level sensitive details in public examples, logs or insights.
These are acceptance fixtures, not prewritten dashboards; the engine should generalize to unseen schemas.

29. PLANNING QUALITY & SELF-VERIFICATION (P0)
Before exporting, run a DashboardPlan validator:
- Every metric has required inputs and a defined grain.
- Every chart references computed metric IDs and actual dimension fields.
- Aggregation rules are mathematically appropriate for type and business meaning.
- No unsupported currency conversion, date interpretation or join.
- Every chart has at least a meaningful number of observations; otherwise degrade gracefully.
- Report title and descriptions are supported by the data.
- Filtered and unfiltered totals reconcile to canonical aggregates.
- Duplicate visualizations are removed unless serving different user questions.
- All chart data is regenerated when filter context changes.
- Unsupported requests are surfaced explicitly, not silently ignored.
Report quality should be assessed through validity, usefulness, diversity and readability; do not optimize chart count alone.

30. NEW TEST GATES FOR TRUE UNIVERSALITY (P0)
Use an unseen-schema holdout suite in addition to the 6,000-row sales fixture. At least 12 unrelated datasets from different domains, shapes and sizes. Randomize column names/order, formats and data types with equivalent meaning. Include sparse, wide, long, time series, snapshot, survey, multitable, no-date, no-number, high-cardinality and mixed-quality cases.
Assert:
- The engine can produce a defensible profile even when it cannot infer business meaning.
- Chosen KPIs and visuals change appropriately with dataset structure.
- No hallucinated business metric, category, location, date or source value.
- Same underlying facts yield equivalent metrics under harmless schema transformations.
- Semantically different fields do NOT get treated as equivalent based on similar names.
- No sums of identifiers, percentages, rates or repeated balances.
- No invalid comparisons, duplicate joins or invented time trends.
- Every generated visual can be traced to valid source aggregates.
- User intent influences prioritization but cannot override evidence.
- Mobile export and XLSX remain valid for dynamically generated layouts.
Track coverage by data archetype, not just by the 32 legacy templates.

31. PRODUCT UX: ONE-CLICK AUTO ANALYZE (P1)
Recommended primary workflow:
Upload -> Auto-profile -> 'Best Dashboard for This Data' recommendation -> Auto-generate -> Preview -> Explain/Edit -> Download.
Show a short 'What I detected' summary: probable domain, date field, measures, dimensions, grain, currency and issues. Ask only the minimum questions needed for correctness. Show why each visual was chosen and let user swap a chart type or exclude a metric.
Provide a 'Regenerate layout' action that changes chart arrangement/type without changing validated calculations. Allow an optional user prompt to prioritize questions. When no safe automatic interpretation exists, present a useful Data Quality & Overview report with specific choices rather than failing or guessing.

32. DELIVERY ORDER CHANGE
P0-A: Reproduce defects and source-integrity errors.
P0-B: Universal profiling, type/grain inference, canonical schema and ambiguity handling.
P0-C: Metric registry and deterministic calculation engine.
P0-D: Autonomous DashboardPlan and ChartSpec selection with strict validator.
P0-E: Dynamic layout renderer and XLSX exporter with post-export reconciliation.
P0-F: Cross-domain holdout tests and 32 legacy-template compatibility.
P1: Mobile UX, performance, accessibility, explainability.
P2: AI-assisted explanations, saved profiles, comparative reports, commercial lead flow.
The product is not complete if it merely maps any file to a pre-existing sales dashboard. It must demonstrably produce different accurate dashboard designs from genuinely different datasets.

33. FINAL REVISED PRODUCT DEFINITION
'Excel.dattasable.com is a universal, schema-adaptive, data-driven dashboard generator that inspects any supported tabular file, discovers what the data can reliably say, chooses relevant metrics and visualizations, builds an appropriate dashboard layout, and exports a validated report. The design adapts to the dataset and user goal; the numbers always come from source-backed deterministic calculations. When the data does not support a requested analysis, the application says so instead of inventing it.'
============================================================

END OF CONSOLIDATED PRD
