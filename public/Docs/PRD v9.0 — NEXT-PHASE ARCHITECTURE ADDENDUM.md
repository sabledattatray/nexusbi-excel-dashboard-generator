=========================================================================================================
PRD v9.0 — NEXT-PHASE ARCHITECTURE ADDENDUM (NOT A REPLACEMENT FOR v8)
=========================================================================================================
PRODUCT: excel.dattasable.com
DATE: 23 October 2026
OWNER INTENT: Antigravity is already implementing v8. DO NOT interrupt, restart, revert, replace, or re-scope that work.
STATUS: FUTURE IMPLEMENTATION SPECIFICATION ONLY. No v9 functionality is represented as implemented.
DEPENDENCY: v8 must be completed, independently tested, and accepted before v9 integration work.
PURPOSE: Introduce DuckDB-Wasm analytical acceleration, scalable deterministic planning, professional Julius-class UI enhancements, and resilient cross-format delivery as a staged, opt-in evolution of the existing platform.
AUTHORITATIVE PRIORITY: security and zero-upload invariant > correctness and v8 acceptance > backward compatibility > v9 performance/features > visual polish.

HOW TO HAND TO ANTIGRAVITY:
1. Store as docs/roadmap/PRD-v9-next-phases.md or equivalent documentation ONLY while v8 is in progress.
2. Record v9 as FUTURE / BLOCKED_BY_V8 in backlog; do not execute code changes until owner gives explicit start approval.
3. Do not paste this document into an active v8 task as an instruction to change architecture mid-flight.
4. At v8 completion, request release evidence and a repository handoff, then audit actual code before planning v9.
5. Preserve v8's entire implementation, tests, metric definitions, templates, exports, and zero-AI policy.
6. v9 is an ADDITIVE document: v8 remains the source of truth for outstanding correctness defects.
7. If v9 proposal conflicts with a validated v8 design, create an ADR and obtain approval; no silent replacement.


=========================================================================================================
01 — BASELINE, SCOPE AND DEPENDENCY MAP
=========================================================================================================
BASELINE from v8 requirements (not claims of completion):
- 100% browser-local parsing/analytics/export; no LLM, no remote AI, no data-content telemetry.
- Helpdesk 8,000 fixture: 8,000 tickets, 6,199 completed, 1,801 open, 2,925 SLA met, 3,274 breached, 47.185% SLA compliance, mean resolution ~55.6082 hours.
- Fix date/time precision, #VALUE! propagation, formula coverage, cross-sheet/export reconciliation and truthful audit statuses.
- Keep 32 templates as OPTIONAL presentation presets; no default sales assumptions.
- Preserve 6,000-row Sales fixture and its correct financial results.
- Produce editable XLSX, print-quality PDF, and standalone offline HTML using canonical validated metrics.

WHAT v9 ADDS, WITHOUT RE-IMPLEMENTING v8:
- DuckDB-Wasm as an OPTIONAL, locally executed analytics backend behind existing canonical metric contracts.
- Safe typed SQL compiler for vetted metric AST; dual-engine parity before enabling DuckDB as default.
- Columnar/Arrow transport and worker isolation for predictable memory and performance.
- Advanced dashboard composer, reusable layouts, analytical drilldowns, explainable chart ranking and no-AI insights.
- Cross-export enhancement and manifest-driven reproducibility, not new independent KPI implementations.
- Browser compatibility matrix, WASM fallback, resource limits, failure recovery and gradual rollout.

OUT OF SCOPE:
- Server-side DuckDB, cloud warehouse, LLM, embedding search, third-party data upload.
- Replacing Next.js/React/Prisma, authentication, current hosting or business systems.
- Rebuilding v8 exporters before evidence shows a real gap.
- Claiming universal semantic understanding or guaranteed execution under 20 seconds.
- Building arbitrary SQL execution from untrusted source data or allowing spreadsheet content to execute scripts.


=========================================================================================================
02 — PHASE ZERO: v8 HANDOFF AND ENTRY GATE (NO CODING)
=========================================================================================================
H0.1 Obtain v8 implementation summary: commits, changed modules, dependencies, ADRs, tests, known defects, performance baselines, screenshots, and deployment state.
H0.2 Confirm whether all P0 defects have actually been fixed with independent source-vs-export evidence; no acceptance from a self-asserted green audit badge.
H0.3 Re-run 8k Helpdesk fixture in the exact production flow and inspect generated XLSX, PDF, HTML.
H0.4 Re-run Sales 6k fixture, unknown-field fixture, all 32 template compatibility checks.
H0.5 Validate lossless timestamps including source HD-000001 and exact duration; confirm no unexpected #VALUE! cells and no unfilled formula rows.
H0.6 Validate SLA compliance 2,925/6,199, mean resolution ~55.6082h, rating count 4,508, reopened count 415 with explicit denominator labels.
H0.7 Verify all export paths are client-side using browser network interception; no source rows/headers/file names/aggregates in outbound requests.
H0.8 Capture measured p50/p95: parse, profile, aggregate, filter, chart render, XLSX, PDF, HTML; peak memory and file sizes.
H0.9 Identify existing canonical ReportSpec, MetricSpec, validator and export interfaces; document where each is defined.
H0.10 Identify all existing date/time representations, decimal handling, filter AST and local worker architecture.
H0.11 Run source-control status and freeze a known-good v8 baseline tag. Do not tag unverified work as accepted.
H0.12 Owner approves a v9 start plan and explicit feature flags; until then no code migration.

ENTRY GATE: every v8 P0 test PASS, known P1 limitations disclosed, owner approves, and a rollback build is available.
IF GATE FAILS: v9 remains blocked; fix v8 through existing task scope, not by silently switching engines.


=========================================================================================================
03 — TARGET ARCHITECTURE AND DATA FLOW
=========================================================================================================
Local file -> existing secure import/parse -> immutable source store + source manifest
 -> existing deterministic semantic mapping and confirmation -> typed ReportSpec/Metric AST
 -> query planner and capability negotiation -> [existing v8 engine OR DuckDB-Wasm adapter]
 -> canonical normalized MetricResult / ChartDataset / ActionRows -> independent validation
 -> ECharts-based dashboard + decision cards + action queue
 -> shared export render model -> XLSX / PDF / single-file HTML.

BOUNDARY RULES:
A. The source is immutable; maintain original values and normalized typed columns separately.
B. No chart, insight, or export may run its own undocumented metric math.
C. Semantic mapping, KPI registry and provenance remain independent of query execution engine.
D. Query engine returns values and diagnostics; validator decides verification status.
E. WASM never directly accesses remote storage; use bundled, version-pinned assets and local file buffers.
F. Never persist uploaded data automatically. IndexedDB/OPFS require existing opt-in policy.
G. Do not load both full row-object copies and Arrow copies if avoidable; measure peak memory.
H. Engine fallback must be deterministic and preserve metric semantics; never silently change results.

PROPOSED INTERFACES (adapt to existing code):
AnalyticsEngine {id, version, capabilities, initialize(config), registerDataset(tableManifest, columns), execute(queryPlan, signal), explain(queryPlan), dispose()}
EngineCapabilities {functions, decimalSupport, timestampSupport, medianPolicy, maxRows?, supportedBrowsers, workerMode}
QueryPlan {planId, metricSpecIds, filterAST, groupBy, sort, limit, timeBasis, nullPolicy, provenance, estimatedCost}
ExecutionResult {planId, engineId, engineVersion, typedRows, metrics, diagnostics, rowCounts, executionMs, sourceHash, filterHash}
ParityEvidence {metricId, baselineValue, duckdbValue, tolerance, status, cause, fixture, timestamp}

Never introduce an incompatible replacement type without versioned adapter and migration tests.


=========================================================================================================
04 — DUCKDB-WASM INTEGRATION, PACKAGING AND ISOLATION
=========================================================================================================
D01. Add version-pinned @duckdb/duckdb-wasm only after v8 signoff; inspect current lockfile and supported bundler.
D02. Run DuckDB in a dedicated browser worker; prevent main-thread blocking.
D03. Bundle WASM and worker assets from the site's own origin; avoid third-party CDN dependencies and remote worker imports.
D04. Determine actual bundle variant by browser feature detection; provide compatibility fallback for environments lacking required WASM capabilities.
D05. Feature flag duckdb_engine_enabled=false by default until parity gate passes; owner-controlled enablement.
D06. Confirm compatibility with Next.js client components and server-side rendering; use dynamic client-only initialization, never instantiate WASM on SSR.
D07. Initialize once per workspace where practical; dispose on file reset, navigation or memory pressure.
D08. Register tables with stable sanitized internal identifiers; keep original display labels separately.
D09. Use prepared/bound parameters or compiler-produced SQL literals with strict escaping; never concatenate raw user text into SQL identifiers or expressions.
D10. Use an allowlisted AST->SQL compiler, not raw SQL from CSV/XLSX cells, filenames, column names or editable descriptions.
D11. Quote internal identifiers correctly; reject unsupported expressions and functions before compilation.
D12. Ensure Worker messages contain only necessary data, avoid echoing PII into errors/logs.
D13. If DuckDB-Wasm fails to load, OOMs or times out, show a non-alarming error and offer the validated v8 engine fallback.
D14. If fallback results differ, mark report NOT_VERIFIED and block certified export; do not present mismatched data as reconciled.
D15. Test worker cancellation, repeated uploads, multiple workspaces, background tab suspension and cleanup.
D16. Verify CSP/COOP/COEP/worker constraints on actual hosting; never weaken security headers silently for performance.
D17. Browser cross-origin isolation requirements for threaded builds must be investigated and documented before enabling them.
D18. Record WASM version, build variant and feature flag state in local audit metadata.
D19. Do not expose SQL execution console in public UI as part of this phase; optional future developer sandbox requires separate threat review.
D20. Avoid creating server API routes for dataset ingestion as a shortcut to browser compatibility.


=========================================================================================================
05 — DATA TYPES, TIMESTAMPS, PRECISION AND ARROW TRANSPORT
=========================================================================================================
T01. Preserve source datetime text, parse status, timezone interpretation, subsecond precision and original cell coordinates.
T02. Define date-only, local datetime, offset-aware instant and elapsed duration as separate logical types.
T03. Ensure Excel 1900/1904 serial dates and time-of-day fractions are preserved in both directions.
T04. Define explicit time zone selection when source timestamps are naive; do not silently reinterpret local times as UTC.
T05. Choose canonical elapsed duration as integer microseconds or milliseconds with documented precision, then convert to hours only for aggregation/display.
T06. SQL timestamp/duration conversions must match existing v8 reference semantics, including boundaries and negative duration rejection.
T07. Distinguish exact DECIMAL for currency and other high-precision values from floating point; never silently coerce money to binary float.
T08. Use Arrow columnar transfer when beneficial; benchmark serialization vs row-wise transfer on 8k and large fixtures.
T09. Preserve IDs as strings when leading zeros or semantic identifier roles are detected.
T10. Null, invalid, blank, zero, NaN and infinity must not collapse into the same value.
T11. Define UTF-8 Unicode normalization rules only for comparisons, not destructive source rewriting.
T12. Maintain stable row IDs to link DuckDB results back to source ledger and action queue.
T13. Never round during intermediate aggregations; formatting at UI/export boundary only.
T14. For group percentages, recompute from summed numerator and denominator, never average precomputed rates.
T15. Test DST transitions, leap days, month ends, ambiguous 01/02 dates, offset timestamps, fractional seconds and Excel date serial edge cases.
T16. For the Helpdesk source, assert exact 4h duration for HD-000001 as an end-to-end invariant when source row confirms it.
T17. Validate SQL MEDIAN/PERCENTILE interpolation policy against v8 implementation and fixture; document any algorithm differences.
T18. If decimal/timestamp semantics cannot be made equivalent, keep the corresponding metric on the v8 engine until resolved.


=========================================================================================================
06 — SAFE SEMANTIC QUERY PLANNER AND METRIC REGISTRY
=========================================================================================================
Q01. Keep existing deterministic semantic detection; do not add AI or rewrite accepted v8 rules.
Q02. Build QueryPlan from confirmed MetricSpec + FilterSpec; reject metrics lacking required semantic roles.
Q03. Translate AST nodes for countRows, countDistinct, sum, weightedAvg, median, percentile, min, max, durationBetween, ratio, cohort and time buckets.
Q04. Query compiler must explicitly implement null policies, zero denominator, group grain and eligible population.
Q05. Enforce currency/unit compatibility before SQL generation; multi-currency metrics require grouping or explicitly supplied FX mapping.
Q06. Support typed date filters (inclusive/exclusive boundaries) and stable time bucketing.
Q07. Require stable sort/tie-breakers for action queue, top N and pagination.
Q08. Expose explain-plan metadata for developer diagnostics, not raw sensitive row values.
Q09. Build query deduplication: reuse common filtered base tables and numerator/denominator scans without changing semantics.
Q10. Plan cost estimation can choose v8 engine for tiny data and DuckDB for larger data only after measured parity.
Q11. Engine selection must be visible in audit metadata but need not clutter executive UI.
Q12. Avoid SQL injection via source names, user custom labels, filter values, calculated expressions and group aliases.
Q13. User-defined calculated metrics use an allowlisted AST editor; no eval, Function, arbitrary JS or unrestricted SQL.
Q14. SQL aggregate result schemas must be validated before accepting values into canonical MetricResult.
Q15. Chart query and KPI query must share filter fingerprint and eligible population contract.
Q16. For datasets with mixed grain or joins, planner must require validated relationships; refuse fanout-prone queries.
Q17. For large category dimensions, enforce top N+Other based on full totals with deterministic tie rules.
Q18. Explain rejected chart/metric proposals with concrete reason and user-remediable mapping when possible.


=========================================================================================================
07 — ADVANCED JULIUS-CLASS DASHBOARD COMPOSER (NO CLONING)
=========================================================================================================
U01. Use existing React/Next.js UI and design system; Apache ECharts if already present, otherwise integrate behind chart adapter.
U02. Build a declarative DashboardSpec with sections, cards, charts, tables, insights, filters, audit and export presentation.
U03. Adaptive executive header: domain, report title, intake period, as-of timestamp, record counts, quality state, data locality.
U04. KPI cards display exact unit, numerator/denominator, cohort, source columns, missing exclusions and explanation drawer.
U05. Auto-compose 4–8 cards when supported; fewer when insufficient data, no filler KPIs.
U06. Contextual charts: intake vs completions, SLA by priority, backlog age, group workload, rating distribution, channel share for Helpdesk.
U07. Cross-filtering and drill-through preserve stable source row IDs; selected row count always visible.
U08. Support time grain day/week/month/quarter only when data coverage and metric semantics allow.
U09. Support custom dashboard layout with drag/reorder/resize but persist only layout metadata locally with user consent.
U10. Offer light/dark/print themes with colorblind-safe palettes, responsive labels, typography and contrast.
U11. Build a data-quality side panel with anomalies, ambiguity, invalid timestamps, null coverage and user mapping controls.
U12. Management decision brief uses deterministic evidence-linked templates, never LLM-generated assertions.
U13. Action queue ranks real source rows by transparent configured rules; show priority, age, status, site, owner and reason.
U14. Scorecards show numerator/denominator, count, median/mean and coverage; comparisons labeled descriptive, not causal.
U15. Avoid false interactivity claims in PDF; PDF is snapshot of selected filter state.
U16. Empty/no-data and unsupported metric states must be visually polished and honest.
U17. Charts must not be constructed directly from raw unverified spreadsheet formulas.
U18. Ensure no chart includes fabricated revenue, profit or sales labels on Helpdesk dataset.
U19. Chart accessibility: keyboard navigation, accessible data table alternative, text summaries and screen-reader labels.
U20. Visual regression testing at desktop, tablet, mobile, and PDF A4/Letter portrait/landscape.
U21. Do not reuse Julius branding, proprietary visual assets or copyrighted templates.


=========================================================================================================
08 — INSIGHTS, ACTIONS AND EXPLAINABILITY EXTENSION
=========================================================================================================
I01. Reuse v8 rule registry; introduce versioned rule packs only if the existing API is insufficient.
I02. Every insight has conditions, eligibility, numeric evidence IDs, threshold source, caveats and deterministic text template.
I03. Add comparison integrity: avoid misleading trends across partial months, incomplete cohorts or different eligible populations.
I04. Backlog aging requires user-confirmed as-of date/time and timezone, not system clock guess.
I05. Open-ticket overdue rules require SLA policy and pause calendar confirmation; never conflate with completed SLA breach.
I06. Rating response coverage must state eligibility and missingness; rating average is not CSAT top-box percentage.
I07. Reopened share of all tickets and reopened share of completed are distinct metrics with explicit denominators.
I08. Do not infer root causes from correlations; use 'review' and 'investigate' language rather than assertions.
I09. Action ranking uses deterministic weighted components; weights and tie-breakers are inspectable and editable.
I10. No fabricated tickets, owners, SLA deadlines or urgency levels.
I11. Insight deduplication removes contradictory/near-duplicate recommendations.
I12. Exports embed same evidence references and caveats; user can trace every insight to source rows where included.
I13. Configurable thresholds are clearly tagged as user settings, not universal industry standards.
I14. When no validated insight is available, show 'No evidence-backed insight for this selection.'


=========================================================================================================
09 — EXPORT ENHANCEMENT WITHOUT EXPORTER REWRITE
=========================================================================================================
E01. Retain existing v8 exporters and their public interfaces; add a shared ExportRenderModel adapter only where needed.
E02. Freeze validated metric values and selected filter fingerprint before starting parallel exports.
E03. Excel: preserve original source columns and datetime precision; maintain editable formulas where validated, or explicitly static derived values with methodology.
E04. Excel: ensure no #VALUE!, #REF!, #DIV/0!, #NAME?, stale caches, missing formulas or incorrect chart ranges.
E05. Excel: native charts and tables when supported; preserve the domain-specific sheet structure accepted in v8.
E06. PDF: vector text, high-resolution local charts, repeat headers, stable pagination, methodology and quality footnotes.
E07. HTML: offline single-file output with embedded assets and selected aggregates; warn when embedding raw rows/PII.
E08. HTML: disable all remote dependencies and network fetches, including CDN, fonts, telemetry and worker imports.
E09. All exports carry source hash, report hash, filter fingerprint, engine version, timestamp policy, metric dictionary and audit status.
E10. For each KPI, exported values must match canonical full-precision result within documented tolerance.
E11. Chart categories and series must match source aggregate values and selected filter population across formats.
E12. Include a printable 'Methods & Assumptions' section; never call audit verified without executed checks.
E13. XLSX independent readback validates actual stored dates, formula coverage, cached results, chart series and key KPI values.
E14. PDF text extraction and visual page rendering tests verify values, labels, clipped elements and page boundaries.
E15. Offline HTML E2E test opens file:// with network blocked and confirms filters, charts, selected-row CSV export and reset.
E16. Export failures must be recoverable without reuploading data; partial downloads must not be marked complete.
E17. If DuckDB engine disabled/fails, the same v8 export pathway must continue to work.
E18. No format may independently recompute business metrics with a conflicting algorithm.


=========================================================================================================
10 — PERFORMANCE, MEMORY, OFFLINE AND FALLBACK
=========================================================================================================
P01. Measure baseline before optimization: 8k x 12 Helpdesk, 6k Sales, 50MB stress file, wide CSV, high-cardinality, multi-sheet XLSX.
P02. Compare v8 engine vs DuckDB-Wasm for parse excluded, query execution, repeated filters, median/percentiles, groupings and total end-to-end latency.
P03. Record cold start, WASM download/init, warm start, query compile, execute, transfer, render and export separately.
P04. Use Web Workers and transferable buffers/Arrow where benchmark demonstrates advantage.
P05. Avoid unnecessary source duplication in JS heap and WASM memory; release tables and references on reset.
P06. Limit rows, columns, total cells, inflated XLSX bytes, string length, query complexity, group cardinality and memory.
P07. Support cancellation and timeout with clean worker teardown; no frozen main UI.
P08. DuckDB engine optional; fallback to validated v8 engine for unsupported browsers or failed init.
P09. Prefer correctness over speed; no sampling for final KPI unless user explicitly opts for a clearly labeled preview.
P10. No unsubstantiated 20-second guarantee; publish benchmark conditions and p50/p95 after testing.
P11. Verify offline dashboard export separately from offline app shell; these are distinct capabilities.
P12. If WASM assets require first online load, disclose it; do not claim app is offline-ready without cached-shell tests.
P13. Avoid cross-origin isolation changes that break other website features without compatibility review.
P14. Create local diagnostic JSON export (redacted by default) with engine timings and failure codes.


=========================================================================================================
11 — SECURITY AND PRIVACY TEST PLAN
=========================================================================================================
S01. No user file bytes, row values, field names, file names, chart snapshots or derived KPI values sent to backend or third parties.
S02. Instrument network requests during upload, parse, DuckDB init, query, filter, export and reset; assert no data-bearing requests.
S03. Verify static WASM bundle and workers are same-origin or safely prebundled; no external analytics SDK in workspace.
S04. CSP and Trusted Types where compatible; no eval or new Function; safe escaping for HTML/CSV/XLSX exports.
S05. Reject malformed/corrupt XLSX archives, decompression bombs, unsafe hyperlinks and external workbook links.
S06. Test CSV/Excel formula injection strings =,+,-,@ as literal source text without executable export behavior.
S07. Test SQL injection through column headers, filter values, row content and custom metric labels; AST compiler must resist.
S08. Test HTML injection and script payloads inside user-provided strings in dashboard and standalone HTML.
S09. Local persistence only by explicit opt-in; provide delete-all and explain browser storage limitations.
S10. Error logs and crash reports must not contain sensitive source data; no hidden telemetry of metadata.
S11. Dependency review, license checks, SRI/lockfile integrity as applicable, vulnerability scan and supply-chain audit.
S12. Re-test privacy whenever DuckDB/WASM bundle, chart library or export dependency changes.


=========================================================================================================
12 — DETAILED PHASE ROADMAP AND OWNERSHIP GATES
=========================================================================================================
PHASE 9A — DOCUMENTATION AND AUDIT (after v8 acceptance)
 Deliver: repository inventory, baseline tests, performance profile, ADR-009, exact adapters and feature-flag plan.
 Gate: owner approves architecture and rollout. No user-facing behavior change.

PHASE 9B — DUCKDB PROTOTYPE BEHIND FLAG
 Deliver: worker initialization, local table registration, AST compiler MVP, SELECT/COUNT/GROUP/AVG/MEDIAN/duration, teardown.
 Gate: 8k Helpdesk and 6k Sales results match v8 reference; privacy network test passes; no regression.

PHASE 9C — FULL METRIC PARITY AND ADVANCED QUERY PLANNER
 Deliver: ratio, weighted aggregation, joins/grain safety, time buckets, quantiles, null handling, decimal rules, filter context, query diagnostics.
 Gate: all fixture metrics exact/tolerance-matched and independently verified; all known timestamp edge tests pass.

PHASE 9D — DASHBOARD COMPOSER ENHANCEMENT
 Deliver: adaptive sections, ECharts adapter, drillthrough, action queue, explain metric/chart, visual accessibility, themes.
 Gate: filters reconcile with source and exports; visual tests pass; no invented domain metrics.

PHASE 9E — EXPORT REFINEMENT
 Deliver: manifest parity, native XLSX validation, PDF print tests, offline HTML portability, source/aggregate-only export choices.
 Gate: 0 critical spreadsheet formula errors; all export KPIs match source; offline HTML works without requests.

PHASE 9F — PERFORMANCE AND HARDENING
 Deliver: worker/memory optimization, browser fallback, security review, p50/p95, stress tests and documented device constraints.
 Gate: no privacy violations, no unacceptable regressions, graceful errors on resource exhaustion.

PHASE 9G — CANARY ROLLOUT AND OPTIONAL DEFAULT SWITCH
 Deliver: feature flag enabled for opted-in test users, local diagnostics, rollback plan, comparison dashboard.
 Gate: owner approval after parity, performance, privacy and browser tests; v8 remains available as fallback.

RULES FOR ALL PHASES:
- Each phase must be independently reversible, reviewed and tested.
- Do not start next phase while P0 failures remain.
- Do not migrate hosting/database or change user-data handling without approval.
- Do not silently swap default calculation engines mid-session or mid-report.


=========================================================================================================
13 — ACCEPTANCE TEST MATRIX AND GOLDEN DATA
=========================================================================================================
CORE FIXTURE A: Helpdesk 8k rows: 8000 total, 6199 completed, 1801 open, 2925 SLA met, 3274 breached, 47.185% compliance, 55.6082h mean, 415 reopened, 4508 rated.
CORE FIXTURE B: Sales 6k rows: 17,966 quantity, INR 339,830,586.55 Net Sales, INR 267,920,146.50 COGS, INR 71,910,440.05 Gross Profit, 21.16% margin.
CORE FIXTURE C: unknown schema: generic safe profile; no invented domain or KPI.

TEST ID GROUPS (minimum 150 automated checks for v9, additive to v8 suite):
001–010 baseline v8 regression and 32 templates
011–020 WASM init, bundle, worker, feature flags, SSR, fallback
021–030 CSV/XLSX parsing and Arrow/columnar fidelity
031–045 timestamps, serial fractions, DST, offset, precision, invalid duration
046–060 numeric/DECIMAL/null/NaN/currency/percentage policies
061–075 semantic mapping, typed AST, SQL compiler injection resistance
076–090 group, filter, join, grain, count distinct, weighted ratios
091–105 KPI parity, independent validation, source row trace
106–120 chart composition, cross-filter, drillthrough, insight and action provenance
121–130 XLSX formula/cache/native chart/readback checks
131–140 PDF typography/page breaks/HTML offline/security/parity
141–150 privacy, performance, cancellation, memory, browser compatibility and rollback

REQUIRED ARTIFACTS PER TEST RUN:
- machine-readable JSON of expected vs actual, tolerance, PASS/FAIL/NOT_RUN
- source/metric/filter/engine hashes, version and timestamp policy
- Excel OOXML and native app recalculation evidence when available
- PDF page renders and HTML offline browser evidence
- network trace redacted of sensitive contents and summarized
- explicit defects, severity, owner, fix commit, regression test ID

Never fabricate a passing result or call a fixture 'verified' without executed evidence.


=========================================================================================================
14 — DEFINITION OF DONE, CHANGE CONTROL AND HANDOFF
=========================================================================================================
DONE means:
[ ] v8 accepted and regression suite still green.
[ ] v9 DuckDB adapter remains opt-in until independent parity and owner approval.
[ ] Zero AI, zero remote processing, zero source-data telemetry preserved.
[ ] No fabricated metrics, semantic mappings, forecasts or confidence badges.
[ ] Timestamp precision and SLA calculations correct end-to-end.
[ ] DuckDB vs v8 results match for all supported metric definitions and fixtures.
[ ] Every chart, insight, scorecard and action item has traceable evidence.
[ ] Excel, PDF, HTML exports agree with canonical metric results and preserve caveats.
[ ] Standalone HTML is truly offline in supported browsers.
[ ] Browser fallback works and failed WASM init does not block validated v8 functionality.
[ ] Measured memory/performance, security, accessibility and browser results documented.
[ ] All changes are versioned, reversible and reviewed; owner authorizes deployment.

HANDOFF TO ANTIGRAVITY WHEN v8 FINISHES:
A. Provide v8 acceptance evidence and current repository status.
B. Summarize how v8 implements parser, semantic mapping, metric AST, validation, charts and exporters.
C. Identify integration points and proposed v9 files; give risks and alternative options.
D. Produce a 9A plan and wait for explicit 'Start Phase 9A' approval.
E. Do not implement 9B–9G merely because this document has been received.

SUGGESTED START PROMPT FOR LATER:
'v8 has been completed and accepted. Read PRD v9 Next-Phase Addendum. Perform PHASE 9A ONLY: audit the current repo and provide architecture decision, compatibility risks, performance baseline, feature-flag design and phase-by-phase implementation plan. Do not change production logic, do not deploy, and wait for approval before Phase 9B.'