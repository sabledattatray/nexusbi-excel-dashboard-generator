UNIVERSAL DATA INTELLIGENCE ENGINE (UDIE)
PRODUCTION-GRADE CORRECTION & IMPLEMENTATION PRD — VERSION 5.0
Product: excel.dattasable.com
Date: 23 October 2026
Audience: Codex / Antigravity / Engineering / QA
Status: Implementation specification; no implementation is asserted complete.

================================================================================
00. EXECUTIVE DIRECTIVE — READ BEFORE CODING
================================================================================
The existing product can import a CSV and export an Excel dashboard. A test with an 8,000-row IT Helpdesk Operations dataset exposed a critical architectural failure: a non-sales dataset was forced into an Executive Sales dashboard and unsupported revenue/profit/customer/product semantics. This is not a cosmetic defect; it invalidates business calculations and destroys user trust.

REQUIRED OUTCOME:
Build a deterministic, provenance-aware, confidence-scored, domain-independent data intelligence pipeline that:
1. Inspects any supported tabular file BEFORE choosing a template.
2. Preserves original source data exactly and records every transformation.
3. Identifies column data types, semantic roles, entity keys, date fields, relationships, missing values, distributions, and row grain.
4. Understands when information is ambiguous, conflicting, unavailable, or unsupported.
5. Chooses valid metrics from a typed metric registry; never fabricates financial, operational, demographic, geographic, target, or growth data.
6. Chooses charts and worksheets appropriate to the actual data.
7. Produces correct, auditable Excel output with source reconciliation.
8. Retains the existing 32 templates as OPTIONAL compatible presets and does not break current mobile, export, privacy, or performance workflows.
9. Performs comprehensive automated and human acceptance testing before release.

NON-NEGOTIABLE: No default Sales schema, no arbitrary numeric columns reinterpreted as revenue, no fake customer IDs, no artificial margins, no silent date rewriting, no fabricated location or targets. On uncertainty, ask a concise user question or degrade gracefully to a neutral exploratory dashboard.

Do not hardcode the 8,000-ticket or 6,000-sales test fixtures into production logic. Do not automatically deploy or remove existing functionality. Start with a repo audit and write a gap analysis.

================================================================================
01. KNOWN FAILURE / TEST CASE
================================================================================
Uploaded synthetic test dataset: Helpdesk_Operations_8000_Tickets_Universal_Dashboard_Test.csv
Columns: Case Ref; Logged On; Finished At; Current State; Urgency Band; Resolver Group; Issue Family; Intake Method; Service Site; SLA Limit (hrs); Reopened Flag; Customer Rating (1-5).
Expected domain: IT helpdesk / ticket operations, or generic event/case workflow.
Expected row grain: one ticket/case per row; confirm Case Ref uniqueness.
Expected source-preserving measures: ticket count, completed count, unresolved count, duration for completed cases, SLA compliance, reopening, rating response coverage, priority/team/channel distributions.
Unacceptable generated content: Executive Sales Dashboard, revenue, profit, product SKU, customer accounts derived from timestamps, sales targets, fabricated country or licenses.

Reference expected values from synthetic fixture:
Total tickets 8,000; completed 6,199; unresolved 1,801; SLA met 2,925; SLA breached 3,274; compliance 47.185% (display 47.19%); mean completed-case resolution 55.6082 hours (display 55.61); rating responses 4,508. Other values MUST be computed from the reference JSON and input, not guessed.

The observed XLSX behavior is a reported audit finding from a prior examination; verify the current source implementation and reproduce before changing code. Capture input-to-output lineage and a failing regression test.

================================================================================
02. SCOPE AND NON-GOALS
================================================================================
IN SCOPE: CSV/XLSX parsing; schema detection; headers; profiling; data quality; semantic inference; keys/grain; relationships; domain classification; typed metrics; chart selection; dashboard layout; Excel export; validation; observability; tests; UX; performance; security; compatibility.
OUT OF SCOPE for initial release: magical understanding of every industry without confirmation; reliable forecasting without sufficient time-series evidence; inferential causal claims; invented goals/targets; automatic external enrichment; unsupported currency conversion; guaranteed correctness for every malformed dataset.
The product must explicitly communicate confidence and limits rather than overpromise.

================================================================================
03. END-TO-END ARCHITECTURE — MANDATORY STAGES
================================================================================
Pipeline:
Upload -> File Safety Gate -> Workbook/CSV Discovery -> Structural Normalization -> Column Profiling -> Candidate Semantic Mapping -> Key/Grain/Relationship Analysis -> Data Quality Report -> User Confirmation (only if needed) -> Valid Metric Plan -> Dashboard/Chart Plan -> Independent Calculation -> Export Builder -> Post-Export Reconciliation -> Download.

Each stage returns a versioned, immutable result with input hashes and structured warnings. A downstream stage must not bypass an upstream hard-fail. Separate semantic decisions from presentation presets.

Suggested modules/interfaces (adapt to current repo, do not rewrite without need):
- ingest/file-validator
- ingest/sheet-discovery
- profile/type-profiler
- profile/missingness
- semantics/role-inference
- semantics/domain-classifier
- semantics/confidence-policy
- model/key-grain-detector
- model/relationship-validator
- metrics/registry
- metrics/planner
- metrics/executor
- charts/eligibility-rules
- dashboards/layout-planner
- export/xlsx-writer
- export/post-export-validator
- quality/reconciliation
- quality/audit-trail
- tests/fixtures-and-golden-results

================================================================================
04. FILE DISCOVERY, SAFE INGESTION AND NORMALIZATION
================================================================================
4.1 Supported inputs: CSV with UTF-8/UTF-8-BOM and other explicitly supported encodings; XLSX multi-sheet; maintain existing 50 MB limit unless changed through tested product decision. Reject macro execution, malicious formula payloads and decompression bombs.
4.2 CSV sniffing: detect delimiter comma/tab/semicolon/pipe, quoting, escapes, BOM, encoding, inconsistent field counts, empty rows, multiline quoted cells. Report confidence and offer override.
4.3 Excel discovery: enumerate visible/hidden sheets, dimensions, merged cells, title rows, blank separators, Excel Tables, date-formatted cells, formulas vs cached values, multiple independent tables in one sheet, charts-only sheets, named ranges. Do not assume first sheet or first row is data.
4.4 Header detection: score candidate header rows using type consistency, uniqueness, density, text patterns, repeated headers, merged titles and surrounding content. Ask user if multiple plausible tables. Support multi-row headers and duplicate/empty headers with stable internal column IDs.
4.5 Infer data blocks and footer/total rows; exclude subtotals from fact-row sums only after evidence and preserve excluded source records in provenance.
4.6 Preserve exact original values, original column names, row order, sheet origin and cell coordinates. Use normalized copies; never silently overwrite original data.
4.7 Preserve identifiers as strings, including leading zeros, long numeric identifiers, scientific-looking codes and postal codes.
4.8 Date/time: distinguish actual Excel date serial from integer, date vs datetime vs time-of-day, timezone aware vs naive, locale day/month ambiguity, duration vs timestamp. Preserve original raw string and normalized ISO value. Never manufacture a reporting date.
4.9 Parse numeric values with locale awareness: 1,234.50 vs 1.234,50, negative parentheses, percent signs, currency symbols, spaces and null tokens. Preserve raw values and conversion errors.
4.10 Handle sheets with multiple unrelated tables: discover and ask for selection or model separate entities, never concatenate indiscriminately.
4.11 Provide a preview before heavy generation with detected table(s), rows, columns, sample, type confidence and warnings.

================================================================================
05. COLUMN DATA TYPE INFERENCE
================================================================================
5.1 Distinguish physical types: string, integer, decimal, boolean, date, datetime, time, duration, currency, percentage, categorical, free-text, JSON-like, geolocation, binary/unsupported, mixed/unknown.
5.2 Distinguish logical roles: identifier, dimension, additive measure, semi-additive measure, non-additive ratio, timestamp, start timestamp, end timestamp, status, category, hierarchy level, geographic field, free-text description, target/plan, flag, unit/quantity, reference/master attribute.
5.3 Combine header clues, actual value distribution, uniqueness ratio, null ratio, formatting, unit suffix, range, co-occurrence, relationships and domain context. Never rely on header name alone.
5.4 For every column output candidate types/roles with confidence, evidence, sample valid/invalid counts, null count, distinct count, cardinality ratio, parsing success, outliers, min/max and representative values.
5.5 Recognize numeric IDs: unique sequential ticket numbers are keys, not measures; ZIP codes and phone numbers are identifiers, not quantities.
5.6 Recognize binary 0/1 flags, but distinguish from measures. Reopened Flag can be SUM for count of reopened tickets if validated.
5.7 Recognize rating scales (1–5, 0–10) but require scale validation; compute mean only over nonmissing valid responses.
5.8 Recognize rates (0.2 vs 20%) and currency amounts only with sufficient evidence. Do not assume all decimals are percentages.
5.9 Distinguish 'SLA Limit (hrs)' as a threshold duration, not cost or revenue.
5.10 Distinguish 'Logged On' and 'Finished At' as event timestamps and derive duration only when both are present and end >= start.
5.11 Mixed-type columns: report type proportions, parsing exceptions and whether coercion is safe. Preserve unparseable values; do not silently discard.
5.12 Ambiguous date strings like 03/04/2026 require locale selection or consistency evidence; show preview before committing.
5.13 Very sparse columns must not be assigned confident business semantics based on a few rows.
5.14 Column profiling should be based on complete data where feasible; sample for speed but confirm decisions using full-column validation.

================================================================================
06. MISSING VALUES, INVALID VALUES AND DATA QUALITY
================================================================================
6.1 Separate missing/null/blank/whitespace/'N/A'/'NA'/'NULL'/'Unknown'/'-'/'—'/'Not provided'/0/false. Zero is a legitimate number, not missing.
6.2 Per-column metrics: missing count/rate, invalid count/rate, unique values, duplicates, outliers, type inconsistency, min/max, parse failures.
6.3 Per-row metrics: invalid key, missing required fields, impossible date order, negative duration, invalid rating, orphan foreign key, contradictory status/end date.
6.4 Missingness by segment/time: optional analysis to detect systematic gaps; avoid treating random and structural missingness as equivalent.
6.5 Policy matrix: identifiers missing -> cannot safely distinct count; numerator missing -> metric invalid or partial with disclosure; denominator zero -> N/A; missing rating -> exclude from mean and report response count; missing end timestamp -> unresolved/unknown, not zero-hour duration.
6.6 Do not fill missing values automatically with zero, average, 'Active', generic locations, synthetic dates or category names. Imputation only on explicit user request, with original vs imputed separated and tagged.
6.7 Date order validation: Finished At earlier than Logged On must be flagged and excluded from duration calculations unless corrected with user confirmation.
6.8 Status consistency: Completed/Resolved/Closed with no end timestamp is an anomaly; open with an end timestamp is an anomaly. Define policy explicitly, do not silently fix.
6.9 SLA comparisons: compute completed-ticket compliance from actual elapsed hours and SLA Limit (hrs). If business-hours SLA or pause periods are not present, label result 'elapsed-time SLA (illustrative)' rather than implying contractual SLA compliance.
6.10 Missing categorical values should appear as '(Missing)' or be excluded with clear accounting, not vanish unnoticed.
6.11 Distinguish expected nonapplicability from data defect: unresolved tickets normally lack completion timestamp.
6.12 Produce quality scores only with transparent formulas and weights; do not assert '100% verified' from superficial checks.

================================================================================
07. ENTITY KEYS, ROW GRAIN AND AGGREGATION SAFETY
================================================================================
7.1 Detect candidate primary keys using non-null coverage, uniqueness, stability, composite-key combinations, patterns and domain hints.
7.2 Identify row grain explicitly: one ticket per row, one ticket event per row, one sales order line, one order, one employee snapshot per month, one stock item per day, one survey response, etc.
7.3 Use confidence-scored hypotheses and ask when ambiguity affects sums or counts.
7.4 Ticket fixture: one Case Ref per row -> COUNTROWS and DISTINCTCOUNT(Case Ref) should both be 8,000; if repeated Case Ref exists, determine event vs ticket grain before using either.
7.5 Sales fixture: transaction ID uniqueness and order-line grain must be verified before interpreting average order value.
7.6 Distinguish additive (sales, ticket events), semi-additive (inventory balances, account balance), and non-additive (rates, margins, averages, percentages) metrics.
7.7 Never SUM a snapshot balance across dates. Use latest valid observation per entity for point-in-time measures.
7.8 Never average row margins to produce total margin; recompute weighted ratio from summed numerator and denominator.
7.9 Detect duplicate records vs legitimate repeated events; preserve duplicates until business rules authorize deduplication.
7.10 Track count semantics: rows, unique tickets, unique customers, resolved tickets, ticket events, responses; label every count precisely.

================================================================================
08. MULTI-SHEET RELATIONSHIP DISCOVERY
================================================================================
8.1 Identify possible entity tables and candidate joins from names, type compatibility, overlap of distinct keys and uniqueness/cardinality.
8.2 Calculate one-to-one, one-to-many, many-to-one, many-to-many and orphan rates; do not create joins based on matching names alone.
8.3 Detect accidental fan-out: joining transactions to duplicate product master rows must not multiply sales.
8.4 Require uniqueness or explicit aggregation before one-to-many joins; use bridge tables for many-to-many only with supported rules.
8.5 Validate relationship direction, join coverage, null keys, key normalization and temporal effective dates.
8.6 Show a relationship diagram/summary with confidence and sample matches. User confirms risky joins.
8.7 Metric planner must specify source table and grain, not assume a global flat dataset.
8.8 Cross-sheet reconciliation: joined row counts and source financial totals must remain unchanged unless intentionally transformed.

================================================================================
09. SEMANTIC INTELLIGENCE AND DOMAIN RECOGNITION
================================================================================
9.1 Separate domain recognition from metric selection. Recognize broad patterns: sales, finance, helpdesk, HR, inventory, marketing, education, survey, operations, project management, manufacturing, generic tabular.
9.2 Allow multi-domain data, e.g. sales plus inventory, without forcing a single label.
9.3 Use column ensembles and value patterns: Case Ref + status + open/end times + SLA -> helpdesk; SKU + stock snapshot -> inventory; employee ID + hire date -> HR; sales amount + invoice -> sales.
9.4 Header aliases must be extensible: 'Logged On', 'Created At', 'Opened Date', 'Ticket Opened' can be candidates for start timestamp, subject to evidence.
9.5 Score candidate semantic roles and domain with explainable evidence, not opaque guesses.
9.6 AI/LLM, if available, may propose roles and interpretations only; deterministic validators decide whether candidate metrics are legal. Never allow LLM text to write fabricated values into report.
9.7 Do not transmit private user data to external AI without clear disclosure, consent and applicable policy. Prefer metadata/redacted samples when sufficient.
9.8 Domain classification should include 'generic/unknown' as a successful safe outcome, not an error.
9.9 For unknown data, generate truthful counts, missingness, distributions, numeric summaries and relationships; do not manufacture a business narrative.
9.10 Detect conflicts: a column called 'Sales' containing ticket states is not automatically revenue. Actual values and grain override weak header clues.
9.11 Source-provided target, budget, forecast, prior-year and margin fields require exact definitions and units before being displayed.
9.12 Maintain user-approved semantic mapping profiles by schema fingerprint; invalidate or re-confirm when column semantics change.

================================================================================
10. CONFIDENCE, ABSTENTION AND USER CLARIFICATION
================================================================================
10.1 Every inferred role/metric/relationship gets confidence [0,1] and evidence list.
10.2 Suggested policy (configurable and calibrated): >=0.90 high confidence, 0.70–0.90 review for consequential metrics, <0.70 abstain. Do not mistake these thresholds for statistically calibrated probabilities without evaluation.
10.3 Consequential mapping (revenue, cost, profit, headcount, SLA, currency, date range, customer identity, joins) requires stronger evidence than a generic category.
10.4 Ask at most a small number of high-impact questions, e.g. 'Is SLA Limit measured in elapsed hours or business hours?' or 'Which column is the ticket identifier?'
10.5 Provide user choice: Confirm / Change mapping / Exclude metric / Continue with generic report.
10.6 No blocking question when safe generic dashboard is possible.
10.7 Every exclusion must be explained in report or preview: 'Gross Profit not available: no validated cost field.'
10.8 User override must be persisted with provenance; it does not transform assumption into verified source fact.
10.9 Confidence is separate from correctness; verify predictions against labeled fixtures and track precision/recall.

================================================================================
11. TYPED METRIC REGISTRY AND VALIDATION ENGINE
================================================================================
11.1 Every metric definition must include: metric_id, display name, semantic domain, required fields/roles, source table, grain, aggregation, numerator/denominator, filters, time semantics, missing policy, unit, formatting, dependencies, lineage, validation and eligibility.
11.2 Formula execution is deterministic and type-checked. Metrics with missing prerequisites are ineligible and MUST NOT be replaced with made-up values.
11.3 Valid universal metrics: record count, distinct key count (when key confirmed), missingness, category frequency, numeric min/max/mean/median (where meaningful), time trend (valid date), outlier distribution.
11.4 Helpdesk metrics:
- Total Tickets = distinct Case Ref when one ticket per key verified.
- Completed = count of valid completed cases under documented status/end-date policy.
- Unresolved = total - completed only if categories are exhaustive and non-overlapping.
- Resolution Hours = (Finished At - Logged On) in elapsed hours, completed valid cases only.
- Average Resolution Hours = SUM(valid resolution hours)/COUNT(valid completed cases).
- SLA Met = COUNT(completed cases with duration <= valid SLA Limit).
- SLA Breached = COUNT(completed cases with duration > valid SLA Limit).
- SLA Compliance = SLA Met/(SLA Met+SLA Breached); exclude unknown/unassessable with count disclosed.
- Reopened Tickets = SUM(valid 0/1 Reopened Flag) if ticket grain and flag semantics validated.
- Average Customer Rating = SUM(valid ratings)/COUNT(nonmissing valid ratings); report response coverage.
- Backlog = unresolved as of a defined date, if historical status data supports it; current-state backlog only when latest state is available.
11.5 Sales metrics: gross sales, discount amount, net sales, cost, gross profit, gross profit margin only when corresponding fields and grain are validated. Weighted margin = SUM(profit)/SUM(net sales). Never SUM discount percentages.
11.6 HR metrics: headcount distinct employees at as-of date; attrition rate only with confirmed employee population and exits; salary only if supplied and authorized.
11.7 Inventory metrics: on-hand at date is point-in-time, inventory turnover needs validated COGS and average inventory, stockouts require actual data.
11.8 Survey metrics: response counts, rating distribution and missingness; avoid inferring revenue or demographics.
11.9 Reject divide-by-zero with N/A and reason; don't convert missing to 0.
11.10 Validate units: hours vs minutes, INR vs USD, ratio vs percentage, headcount vs FTE, dates vs durations.
11.11 For mixed currencies, segment by currency or require authorized conversion rate; never add unconverted currencies.
11.12 Every metric output must have calculation trace and exact supporting source fields.

================================================================================
12. CHART ELIGIBILITY AND AUTONOMOUS SELECTION
================================================================================
12.1 Chart planning occurs AFTER metric eligibility and relationship validation.
12.2 Valid date + additive count/measure -> line/column trend; use proper time grain and chronological sort.
12.3 Low/medium-cardinality category + count/measure -> sorted horizontal bar/column; show Top N + Other and reconcile to total.
12.4 Valid status categories -> status distribution; priority -> priority mix; team -> workload; intake -> channel mix.
12.5 Numeric continuous measure -> histogram/boxplot with meaningful bins; don't use ticket IDs as numeric distribution.
12.6 Two validated numeric measures -> scatter if observations align at same grain.
12.7 Two categorical dimensions -> heatmap/stacked bars if cardinality manageable.
12.8 Geographic visualization only with validated geolocation; do not invent country, region, state or coordinates.
12.9 Pie/donut only for small, mutually exclusive nonnegative composition; avoid misleading slices.
12.10 No time field -> no fake monthly trend; no cost -> no profit chart; no SLA field -> no SLA compliance chart.
12.11 Detect missing/partial periods and warn about misleading period comparisons.
12.12 Charts must specify measure, aggregation, filters, grain, source and quality status.
12.13 Score chart utility by relevance, variety, readability, evidence, data quality and user goal; prevent duplicate/redundant charts.
12.14 Allow compatible chart override; reject nonsensical visual combinations.
12.15 Accessibility: legible labels, color contrast, non-color-only semantics, print layout and mobile-friendly preview.

================================================================================
13. DYNAMIC DASHBOARD AND WORKSHEET COMPOSITION
================================================================================
13.1 Never generate a fixed 'Executive Sales Dashboard' for unknown/helpdesk datasets.
13.2 Plan workbook sheets based on detected entities, metrics and business domain.
13.3 Helpdesk example: Service Desk Overview, Ticket Details, SLA Analysis, Team & Priority, Customer Feedback, Data Quality, Metric Definitions.
13.4 Sales example: Executive Sales Overview, Transactions, Regions/Channels, Product Analysis, Data Quality, Metric Definitions.
13.5 Generic example: Data Overview, Column Profiles, Category Analysis, Numeric Analysis, Missing Values, Source Data.
13.6 Preserve user-selected built-in template only when its semantic requirements are met. Incompatible template -> explain why and offer compatible layouts.
13.7 Dashboard KPI count and chart count should be data-dependent, not forced to fixed counts.
13.8 Show report title, period, record population, filter context, generation timestamp, source label and limitations.
13.9 Distinguish generated insights from observed facts; no ungrounded 'high performance' or 'growth' claims.
13.10 Export should retain raw source and a readable data dictionary. Separate calculated columns from original source.
13.11 Do not insert unsupported fields as zero-filled placeholders.
13.12 Preserve workbook navigation, branding, readable formats, print area, chart positioning, frozen headers and filters.

================================================================================
14. XLSX EXPORT CORRECTNESS AND COMPATIBILITY
================================================================================
14.1 Use supported export implementation compatible with current architecture; do not require replacing existing library without evidence.
14.2 Preserve data types, timestamps, leading zeros, numeric precision and nulls in exported cells.
14.3 Prevent CSV/XLSX formula injection from untrusted text. Do not execute macros or external links.
14.4 Formula definitions must reference correct ranges, sheets, table columns and filters. Avoid fixed row end 6002.
14.5 Validate cached values/recalculation behavior; don't claim formulas are correct because cached displayed numbers look plausible.
14.6 Check OOXML ZIP relationships, chart references, shared strings, styles, defined names and protection metadata.
14.7 Test Microsoft Excel desktop, web, and mobile if claimed; record actual environment and outcomes.
14.8 All dashboard totals and chart source series must reconcile to independently computed source results.
14.9 Sheet protection is optional; if used, must not break intended filters, recalculation, accessibility or third-party parsing.
14.10 No #REF!, #DIV/0!, #VALUE!, #NAME?, stale chart categories or unexpected hidden placeholder data.

================================================================================
15. UX AND PRODUCT WORKFLOW
================================================================================
15.1 After upload show 'Analyzing structure', then detected dataset type, row count, date coverage, data quality and proposed KPIs/charts.
15.2 Explain semantic decisions in plain English: 'Logged On identified as ticket start time because values are timestamps and match ticket records.'
15.3 Provide 'Review mappings' panel with confidence, examples, units and change control.
15.4 Ask only consequential questions; otherwise one-click Generate.
15.5 Warn 'No cost data found; profit will not be shown' rather than silently inventing profit.
15.6 Show report preview and validation summary before download.
15.7 Errors should be actionable: unsupported file, invalid header, ambiguous date, conflicting keys, join fan-out, no valid numeric metrics.
15.8 Retain existing templates, drag/drop, mobile generation, 50 MB guardrail and save/download workflows.
15.9 Add 'Explain KPI' and 'Data Lineage' affordances where feasible.
15.10 Do not expose raw personal/sensitive data in diagnostics, logs or analytics.

================================================================================
16. DATA CONTRACTS / JSON SCHEMAS (ILLUSTRATIVE)
================================================================================
ProfiledColumn {
  columnId, originalName, sourceSheet, sourceIndex,
  physicalType, logicalRoleCandidates:[{role,confidence,evidence}],
  totalCount, nonNullCount, nullCount, invalidCount,
  distinctCount, uniquenessRatio, examples, unit, parseErrors
}
DatasetProfile {
  schemaVersion, sourceHash, tables:[{tableId,sourceSheet,rowCount,columns}],
  candidateDomains, candidateKeys, rowGrainHypotheses,
  relationshipCandidates, qualityIssues, confirmationQuestions
}
SemanticDecision {
  decisionId, tableId, columnIds, role, confidence, evidence,
  source:'deterministic'|'ai-suggestion'|'user-confirmed',
  accepted, confirmedBy, decisionTimestamp, schemaFingerprint
}
MetricDefinition {
  metricId, domain, requiredRoles, grain, aggregation,
  numerator, denominator, eligibility, unit, nullPolicy,
  sourceTables, lineage, validator, version
}
MetricResult {
  metricId, value, unit, populationCount, excludedCount,
  filterContext, validationStatus, warnings, sourceTrace
}
ChartPlan {
  chartId, chartType, xRole, yMetricId, groupRole,
  filterContext, sourceGrain, chartEligibility, title,
  validationStatus, dataCoverage
}
ExportAudit {
  inputHash, outputHash, engineVersion, profileVersion,
  metricResults, sourceReconciliations, formulaChecks,
  chartChecks, unresolvedWarnings, testTimestamp
}

Enforce runtime schema validation, stable IDs, versioned contracts, no free-form unvalidated metric expressions, and safe serialization. Use existing project conventions for TypeScript, database and services.

================================================================================
17. PERFORMANCE, COST, PRIVACY AND SAFETY
================================================================================
17.1 Benchmark parse, profile, inference, planning, aggregation, chart generation and XLSX export separately.
17.2 Target approximately 20 seconds for known representative files only after measurement. Set size/complexity-based targets and show progress; never promise universal fixed timing.
17.3 Use bounded sampling for preliminary inference and full-data validation for metric correctness.
17.4 Avoid O(rows*columns^2) scans, repeated full dataset copies, huge stringification and synchronous UI blocking.
17.5 Use workers/streaming/batching where compatible with current product and privacy claims.
17.6 Do not transmit uploaded files to third parties unless clearly disclosed and user-authorized. Review actual deployment behavior, not marketing assumptions.
17.7 Guard against ZIP bombs, malformed CSV quoting, enormous sheets, path traversal, formula injection, excessive memory, denial-of-service and unauthorized file retention.
17.8 Avoid collecting PII in error telemetry. Use anonymous performance counters where permitted.
17.9 Support cancellation, failure recovery and predictable resource cleanup.
17.10 Log anonymized semantic decisions and failure categories for debugging; not raw user records.

================================================================================
18. COMPREHENSIVE AUTOMATED TEST MATRIX
================================================================================
GROUP A — INGESTION AND STRUCTURE
A01 CSV comma/tab/semicolon/pipe detection.
A02 UTF-8 BOM and supported encoding handling.
A03 Quoted multiline CSV fields.
A04 Blank/title/header rows and repeated headers.
A05 Multiple Excel sheets with unrelated tables.
A06 Multiple tables in one sheet and footer totals.
A07 Leading-zero IDs and 16+ digit identifiers preserved.
A08 Ambiguous date formats trigger confirmation.
A09 Excel date serial vs integer distinction.
A10 Formula injection and malformed XLSX safely rejected.

GROUP B — COLUMN TYPE AND MISSINGNESS
B01 0/1 flag not misread as revenue.
B02 SLA Limit (hrs) classified as duration threshold.
B03 Customer Rating 1–5 recognized as rating with missing coverage.
B04 Finished At blanks remain missing, not zero.
B05 Literal zero distinct from missing.
B06 Invalid rating 6 or -1 flagged.
B07 Mixed numeric/currency formats handled or flagged.
B08 Postal code/phone numeric-looking ID preserved as text.
B09 Mixed date/text column produces error evidence.
B10 Outlier and negative duration warnings.

GROUP C — KEYS, GRAIN, RELATIONSHIPS
C01 Unique ticket Case Ref recognized as ticket key.
C02 Repeated Case Ref event log not counted as distinct new tickets.
C03 Duplicate exact rows handled without silent deletion.
C04 Inventory snapshots not summed across dates.
C05 Sales order lines not mistaken for unique orders.
C06 One-to-many join fan-out detected and blocked.
C07 Many-to-many relationship requires confirmation.
C08 Missing foreign keys and orphan rates surfaced.

GROUP D — DOMAIN AND SEMANTIC SAFETY
D01 Helpdesk classified as ticket operations, not sales.
D02 Sales fixture retains valid revenue/profit semantics.
D03 HR dataset does not generate sales KPIs.
D04 Inventory dataset generates stock metrics only when supported.
D05 Education dataset generates score analysis, not revenue.
D06 Survey dataset generates response/rating metrics.
D07 Unknown dataset safely produces generic data profile.
D08 Misleading column name does not override value evidence.
D09 Mixed-domain file supports multiple semantic groups.
D10 Unconfirmed low-confidence field mapping abstains.

GROUP E — METRIC VALIDITY
E01 Helpdesk total 8,000, completed 6,199, unresolved 1,801.
E02 SLA met 2,925, breached 3,274, rate 47.185%.
E03 Mean completed duration 55.6082 hours.
E04 Rating responses 4,508; blanks excluded from mean.
E05 Reopened count reconciles to 0/1 flags.
E06 No revenue, cost, gross profit or margin in helpdesk export.
E07 No invented targets, growth, stock or account health.
E08 Sales reference net sales/profit/margin exact to cent.
E09 Weighted ratios, not average row percentages.
E10 Zero denominator -> N/A, not 0%.
E11 Mixed currency blocked from combined sum.
E12 Filtering by date/status/team preserves numerator/denominator consistency.

GROUP F — VISUALS AND EXPORT
F01 Helpdesk charts: time, status, priority, team, issue category, channel, SLA.
F02 No sales charts for helpdesk.
F03 Dynamic worksheet titles and structure.
F04 Top N + Other sums to full source total.
F05 Chronological month ordering.
F06 No chart series pointing to fabricated or stale ranges.
F07 XLSX formulas and cached values checked in Excel.
F08 No broken cell references or Excel errors.
F09 All 32 existing compatible templates remain usable.
F10 Incompatible template explicitly declined or mapped safely.
F11 Mobile import, preview, export functional.
F12 Workbook source data preserved, including timestamps.

GROUP G — SCALE, PRIVACY, REGRESSION
G01 100-row dataset.
G02 6,000-row sales fixture.
G03 8,000-row helpdesk fixture.
G04 20,000-row mixed-domain dataset.
G05 100,000-row benchmark if within product limits.
G06 Near-50 MB file behavior measured.
G07 Sensitive data not logged or sent unexpectedly.
G08 Repeat generation deterministic for same inputs and choices.
G09 Schema rename/reorder with confirmed mappings yields equivalent results.
G10 Re-import exported workbook does not double-count summary rows.

All tests must include expected, actual, source fixture, pass/fail, screenshots or logs, and code revision. Do not mark unexecuted tests PASS.

================================================================================
19. INDEPENDENT RECONCILIATION REQUIREMENTS
================================================================================
19.1 Use an independent reference implementation/test fixture to compare computed metrics; do not validate a metric using the same function that produced it.
19.2 Reconcile by group: status, priority, resolver team, issue family, intake channel, service site, month. Include missing/unknown groups in population accounting.
19.3 Validate every KPI's denominator and exclusions.
19.4 Verify chart data arrays independently against source grouping.
19.5 Verify source-row checksum and field-level equality after export; transformed fields must have traceable source and formula.
19.6 Generate a machine-readable audit manifest and user-facing Data Quality sheet.
19.7 Fail export or remove affected KPI on critical inconsistency; do not silently ship misleading numbers.

================================================================================
20. ENGINEERING DELIVERY PHASES
================================================================================
PHASE 0 — Baseline (required before edits)
- Inspect repo architecture, current importer, template selector, mapping logic, workbook writer, tests and hosting constraints.
- Reproduce helpdesk failure and collect screenshots/formula references.
- Identify source of fixed Sales dashboard choice and fabricated mappings.
- Document migration plan preserving 32 templates.

PHASE 1 — Structural Data Profiler
- Safe ingestion, table/header discovery, type profiling, null/invalid analysis, source preservation.
- Implement schemas and automated A/B tests.

PHASE 2 — Grain, Keys and Relationships
- Key candidate scoring, duplicate handling, grain hypotheses, join validation, fan-out protection.
- Implement C tests.

PHASE 3 — Semantic Inference and Confidence
- Domain classification, role mapping, alias dictionaries, evidence, abstention, user confirmation.
- Implement D tests.

PHASE 4 — Typed Metric Registry
- Generic and domain-specific metric definitions; safe formula execution; unit/missingness policy; full reconciliation.
- Implement E tests and independent reference oracle.

PHASE 5 — Autonomous Dashboard Planner
- Chart eligibility and scoring; dynamic layout/sheets; compatibility gate for 32 templates.
- Implement F tests.

PHASE 6 — Export and QA Hardening
- XLSX fidelity, recalculation, chart ranges, provenance sheets, security, mobile, performance.
- Implement G tests and real Excel verification.

PHASE 7 — Controlled Release
- Feature flag new engine, retain legacy fallback ONLY when semantically safe; never fallback to wrong Sales report.
- Run regression suite, manual acceptance, beta feedback and rollback drill.
- Release only after owner approval.

================================================================================
21. ACCEPTANCE CRITERIA — NO EXCEPTIONS
================================================================================
[ ] Unknown file does not default to Executive Sales.
[ ] Column types, roles, null rates and row grain are visible and explainable.
[ ] Original source values are preserved and auditable.
[ ] Relationships do not duplicate facts.
[ ] Domain inference abstains when ambiguous.
[ ] Every displayed KPI has validated prerequisites and definition.
[ ] Missing values do not silently become zero.
[ ] Helpdesk fixture yields correct ticket/SLA metrics and no finance fields.
[ ] Sales fixture still yields correct financial metrics.
[ ] Dynamic charts and worksheet composition adapt across at least five domains.
[ ] 32 existing templates remain available where compatible.
[ ] All charts, cells, formulas and filters reconcile independently.
[ ] Excel opens and calculates correctly on claimed platforms.
[ ] No invented managers, targets, growth, countries, stock or customer attributes.
[ ] Performance is benchmarked rather than assumed.
[ ] Security/privacy review completed.
[ ] Automated tests pass, manual QA signed off, owner approves deploy.

================================================================================
22. REQUIRED FINAL HANDOFF FROM CODING AGENT
================================================================================
Return ONE consolidated implementation report containing:
1. Root cause analysis with exact file paths/functions causing Sales-template coercion.
2. Architecture diagram and changed/added modules.
3. Before/after semantic mappings for Helpdesk and Sales fixtures.
4. Full metric definitions and sample calculation traces.
5. Independent source-to-output reconciliation tables.
6. Screenshots of generated helpdesk and sales dashboards.
7. Full automated test matrix results (including failures and skipped tests).
8. Excel desktop/web/mobile interoperability results where actually tested.
9. Performance timing breakdown and file sizes.
10. Security/privacy review and any outstanding limitations.
11. Feature flags, migration and rollback steps.
12. Clear statement of what was NOT implemented or tested.
13. Explicit request for owner approval before production deployment.

================================================================================
23. SINGLE COPY-PASTE IMPLEMENTATION INSTRUCTION
================================================================================
'Implement Universal Data Intelligence Engine PRD v5 in the existing excel.dattasable.com codebase. First audit and reproduce the 8,000-ticket Helpdesk dataset being incorrectly transformed into a Sales dashboard. Preserve all current functionality, 32 built-in templates, mobile import/export and the current deployment architecture. Build a source-preserving, type-aware, grain-aware, relationship-aware, confidence-scored semantic pipeline before metric selection. Reject or abstain from unsupported interpretations. Implement deterministic metric definitions, autonomous chart and worksheet selection, full source-to-output reconciliation and the listed test matrix. Do not invent financial values, targets, customers, dates or geography. Do not hardcode fixture values. Provide before/after evidence and independent tests. Do not deploy without my approval.'

END OF PRD
