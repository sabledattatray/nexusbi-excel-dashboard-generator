UNIVERSAL AUTO PIVOT GENERATOR
Complete Product Requirements Document and Implementation Instructions for Antigravity
Version 1.0 | 16 October 2026

============================================================
0. MISSION AND NON-NEGOTIABLE PRINCIPLES
============================================================
Build a production-quality Windows desktop automation application that accepts structured CSV/XLSX/XLSM files, intelligently classifies their fields, recommends business-specific analyses, and generates genuine, editable, refreshable native Microsoft Excel PivotTables and PivotCharts. The primary implementation should use Python and Excel COM automation (pywin32) on Windows with a licensed desktop Microsoft Excel installation. The system must NOT misrepresent pandas summaries, formulas, or static cross-tabulations as native PivotTables.

Design for arbitrary business domains, not just Blinkit or retail: e-commerce, BFSI, collections, HR/payroll, healthcare, education, logistics, manufacturing, finance, procurement, hospitality, and more. Prefer deterministic, explainable rules and explicit user confirmation for ambiguous mappings. Never silently invent financial measures or change source data. Provide robust validation, safe Excel lifecycle management, test fixtures, logs, error recovery, and a polished UI.

Deliver a working application, not just a mockup, landing page, sample workbook, or architecture document. Do not claim any feature is complete without executable verification. If native PivotTables cannot be produced because Excel COM is unavailable, clearly label the limited summary-only mode and do not claim feature parity.

============================================================
1. PRODUCT DEFINITION
============================================================
Product name: Universal Auto Pivot Generator (working name; branding configurable)
Target user: MIS professionals, analysts, accountants, operations managers, Excel users, and BI developers.
Core value: Import data -> profile and understand schema -> propose relevant PivotTable layouts -> preview and correct -> generate professional Excel workbook with native pivots -> refresh safely.
Primary platform: Windows 10/11, 64-bit, desktop Excel installed, Python 3.12+ where compatible with dependencies (verify installed Python/pywin32 versions; do not assume newest Python is supported).
UI recommendation: PySide6 desktop interface, with an independently testable Python core and COM worker process. Streamlit is optional for a prototype, not the primary choice for reliable Excel COM desktop lifecycle.
Deployment: Local-first; user data remains on device; no uploads or telemetry by default. Provide signed/packaged installer only after functional tests.

Out of scope for initial version: Excel Online native PivotTable creation, cross-platform native PivotTable generation, cloud-hosted COM automation, autonomous AI calls with raw sensitive records, Power BI report generation, and modifying user source files in place.

============================================================
2. ACCEPTANCE CRITERIA / DEFINITION OF DONE
============================================================
A. User imports a valid CSV or Excel worksheet/table, previews rows and profiling results, chooses data sheet/table, and receives meaningful recommended PivotTable plans.
B. On a geography dataset containing Country, State, City, the application recommends row hierarchy Country > State > City, but only if data checks support it.
C. On a retail dataset, recommend Sales by Geography, Sales by Product, Monthly Trends, Customer Segment, Payment and Order Status, and Inventory (only when metric semantics are valid).
D. On a financial dataset, never sum percentages, IDs, unit prices, balances, or non-additive measures by default; choose appropriate weighted calculations or mark for user review.
E. Native Excel PivotTables are created through Excel's PivotCaches and PivotTables COM APIs, verified after workbook save/reopen. They remain editable in Excel and can be refreshed from the embedded source Excel Table.
F. Multiple pivots share a PivotCache where technically feasible; avoid redundant cache bloat.
G. Filter controls and slicers are created where supported, with graceful fallback and truthful status. Avoid promising slicers for unsupported layouts.
H. Errors, Excel absence, locked output files, invalid inputs, and partial failures produce actionable messages, never silent corruption.
I. Source workbook is never overwritten without explicit opt-in and safe backup; default output is a new workbook in a chosen destination.
J. Application ships with automated tests and an integration test run on a real Windows + Excel machine; do not treat mocks as proof of COM behavior.
K. Generate a report manifest detailing detected fields, rules applied, pivots created, warnings, failed optional features, refresh mode, and runtime.
L. Data with 3,000 rows and ~50-60 columns produces the configured pivots successfully. Also benchmark 50k and 100k rows with clear performance/memory notes; do not hardcode a fixed row cap without evidence.

============================================================
3. USER WORKFLOW AND UI
============================================================
Step 1 - Start / Home:
- New Project, Recent Projects (metadata only), Open Existing Project, Help, Settings.
- Local privacy indicator, Excel detected/version/bitness, compatibility status.

Step 2 - Import:
- Drag/drop or file picker: .csv, .xlsx, .xlsm (read-only input for .xlsm unless user explicitly requests preservation); optionally .xls with documented converter limitations.
- Excel: list visible worksheets and Excel Tables; select one table/range, optionally combine compatible tables with explicit mapping.
- CSV: encoding detection with user override (UTF-8, UTF-8 BOM, Windows-1252), delimiter and quote settings, decimal separator and date locale.
- Display file size, row count, column count, sample rows, inferred types, parse warnings.
- Never execute macros; never enable external workbook links.

Step 3 - Profile:
- Column cards: name, normalized name, detected type, semantic role, null %, unique count, representative values (redacted in logs), min/max, possible currency/unit, confidence, warnings.
- Identify duplicate/blank column headers, merged cells, mixed types, formula errors, date ambiguity, number-as-text, high-cardinality IDs, negative values, duplicates, potential PII.
- Allow manual edits to type, role, aggregation, and hierarchy assignment; show why a recommendation was made.

Step 4 - Recommendations:
- Display recommended PivotTable templates with confidence and business rationale.
- Per pivot: editable name, Rows (ordered), Columns (ordered), Values with aggregation and format, Report Filters, sort, Top N, subtotal/grand-total behavior, chart type, slicer candidates.
- Buttons: Add Pivot, Remove, Duplicate, Reorder, Save Template, Restore Defaults.
- Explicit warning for semantically unsafe metrics.

Step 5 - Output Options:
- Select output location, workbook name, include Raw_Data sheet, Data_Dictionary, Executive_Summary, Pivot sheets, Charts, QA_Log, optional README.
- Choose native PivotTables (requires Excel) or clearly labeled static-summary fallback.
- Source as an Excel Table with stable name; refresh behavior on open; optional slicers.
- Style theme: professional light/dark accents, number format by measure, consistent headers.

Step 6 - Generate:
- Progress by stage (read, validate, classify, plan, create workbook, build cache, create pivots, charts, slicers, verify, save).
- Cancel safely; log failures; do not leave orphan Excel processes or corrupt output.
- Completion view: open file, open output folder, show warnings, manifest, retry optional components.

============================================================
4. ARCHITECTURE
============================================================
Separate layers:
- ui/: PySide6 views, state, preview, progress, accessible controls.
- ingestion/: csv_reader, excel_reader, normalization, type inference.
- profiling/: data_quality, statistics, semantic_classification, hierarchy_inference.
- planning/: pivot_plan_schema, recommendation_engine, validation, business_templates.
- excel_engine/: workbook_writer, com_session, pivot_cache, pivot_builder, chart_builder, slicer_builder, refresh_manager, verification.
- output/: naming, atomic_save, manifest, reports.
- config/: app settings, field aliases, templates, theme, limits.
- tests/: unit, integration, golden fixtures, performance.
- docs/: installation, troubleshooting, developer guide, user manual.

Suggested packages: pandas for parsing/analysis; openpyxl for inspecting source XLSX and optionally staging data (NOT for native pivot creation); pywin32 for native Excel COM; PySide6 for GUI; pydantic or dataclasses for typed plans; pytest for tests; python-dateutil for date parsing. Pin and test dependency versions. Optional pyarrow for large datasets; not required.

Process isolation: COM automation in a dedicated STA worker process. Initialize COM in that process/thread with pythoncom.CoInitialize(), run Excel operations there, then CoUninitialize(). Never pass COM objects between threads. Use interprocess progress/events and cancellation flags. Do not run COM on the GUI thread.

COM lifecycle: create a dedicated Excel.Application instance (DispatchEx where appropriate), set Visible=False, DisplayAlerts=False, ScreenUpdating=False, EnableEvents=False, and AutomationSecurity to disable macros when supported. Preserve and restore any modified application settings in finally. Only close workbooks and Quit the Excel instance created by this app; never kill all EXCEL.EXE processes. Release COM references, run garbage collection, and handle orphan cleanup only for verified app-owned instances.

============================================================
5. DATA MODEL AND SEMANTIC INFERENCE
============================================================
5.1 Structural types: string, integer, decimal, boolean, date, datetime, categorical, percentage, currency, unknown.
5.2 Semantic roles: geography, time, product/category, customer, order/transaction ID, employee, supplier, store, payment, status, quantitative additive measure, semi-additive measure, non-additive measure, unit measure, dimension, PII.
5.3 Alias dictionary (case-insensitive, punctuation-normalized):
- Geography: Country/Country_Name/Nation; State/Province/Region; City/Town/District; Area/Locality; Pincode/ZIP/Postal_Code (postal code is an identifier, never summed).
- Time: Order_Date, Invoice_Date, Transaction_Date, Delivery_Date, Year, Quarter, Month, Month_Number, Week, Day.
- Financial: Revenue, Net_Sales, Sales_Amount, Gross_Sales, Profit, Cost, COGS, Discount_Amount, Tax, Refund, Payment_Amount, Outstanding.
- Quantity: Quantity, Units, Items, Order_Qty, Stock_On_Hand.
- Ratios: Margin_%, Discount_%, Conversion_Rate, Return_Rate, Average_Price, Unit_Price.
- Dimensions: Product, SKU, Brand, Category, Subcategory, Customer_Segment, Channel, Payment_Method, Order_Status.

5.4 Profile actual values, not headers alone. Confirm geographic hierarchies by cardinality and parent-child consistency. 'Region' may be a sales territory rather than a state; do not force a hierarchy without evidence. When Country has only one value, optionally collapse it from rows and offer as a filter. If multiple parents share a city name, keep full parent hierarchy.
5.5 IDs with numeric-looking values are categorical, not additive; preserve leading zeros. Avoid summing phone numbers, postal codes, employee IDs, order IDs, SKU codes.
5.6 Recognize repeated transactional lines: one row may be an order line, not an entire order. COUNT(Order_ID) counts lines; distinct order count requires Data Model/Power Pivot support or a documented precomputed helper with validated semantics. NEVER label a normal Count as Distinct Count.
5.7 Measures: SUM for line-level sales/quantity/profit when appropriate; AVERAGE for ratings/lead times; COUNT for rows; MIN/MAX for dates or ranges; ratios calculated from aggregated numerators and denominators (e.g., SUM(Profit)/SUM(Revenue), not SUM(Margin%)). Semi-additive snapshots like stock balance should not be summed across dates by default. Unit prices are not automatically additive.
5.8 Sales status: determine whether revenue is gross ordered, paid, delivered, refunded, or recognized. If dataset includes Realized_Sales_INR, prefer that for realized revenue. If using Net_Item_Sales_INR, show that it may include cancelled/returned orders; provide filters and clear metric names.
5.9 Date inference: use explicit year/month columns when reliable, otherwise create safe helper columns in output data table. Verify month order is chronological, not alphabetic. For ambiguous DD/MM/YYYY vs MM/DD/YYYY ask user or use documented locale setting.
5.10 Hierarchy candidates: Geography Country > State > City > Area; Product Category > Subcategory > Brand > Product; Time Year > Quarter > Month; Organization Division > Department > Team > Employee. Let users reorder/remove any level.
5.11 Nulls: keep source nulls; optionally display '(Blank)' or '(Unknown)' in pivot only, with user-selectable behavior. Never silently replace raw values.
5.12 Confidence scores are transparent heuristics, not uncalibrated probabilities. Provide reason codes and manual overrides. Support editable mapping rules saved by industry/project.

============================================================
6. PIVOT PLAN CONTRACT
============================================================
Define a validated structured plan for each pivot, e.g.:
{
  "name": "Sales by Geography",
  "source_table": "tblRawData",
  "rows": ["Country", "State", "City"],
  "columns": ["Year", "Quarter"],
  "values": [
    {"field": "Realized_Sales_INR", "aggregation": "sum", "caption": "Realized Sales", "format": "INR"},
    {"field": "Estimated_Gross_Profit_INR", "aggregation": "sum", "caption": "Gross Profit", "format": "INR"},
    {"field": "Quantity", "aggregation": "sum", "caption": "Units Sold", "format": "integer"}
  ],
  "filters": ["Category", "Sales_Channel"],
  "layout": "tabular",
  "subtotals": true,
  "grand_totals": true,
  "chart": "clustered_column",
  "slicers": ["State", "Category"],
  "warnings": []
}

Validation: every referenced field exists and has compatible semantic type; unique names; no conflicting field placements unless Excel allows; avoid exceeding Excel sheet/pivot field limits; detect overlapping pivot placement; require at least one measure; reject unsupported distinct-count paths; validate formulas and division by zero.

============================================================
7. RECOMMENDATION ENGINE AND INDUSTRY TEMPLATES
============================================================
Recommend based on detected roles and available columns, not industry keywords alone. Show only feasible templates. Each template has required fields, optional fields, aggregation rules, filters, chart guidance, and exclusions.

Retail/E-commerce:
1 Sales by Geography: Country > State > City; SUM(Realized Sales), SUM(Profit), SUM(Quantity); filters Year, Category, Channel.
2 Category Performance: Category > Subcategory > Brand > Product; sales/profit/quantity.
3 Monthly Sales Trend: Year > Quarter > Month; sales and profit; chronological order.
4 Channel and Payment: Channel rows, Payment_Method columns, sales/counts.
5 Customer Segments: Segment rows, sales and validated distinct customers.
6 Order Fulfillment: Order_Status rows, count of orders/lines correctly labeled; returns analysis.
7 Inventory: SKU/warehouse rows, current stock only if source contains true current snapshot; warn if per-order stock values are repeated and cannot be summed.
8 Discount Effectiveness: discount bands vs sales/profit; do not infer causal impact.

BFSI/Collections:
- Loan portfolio by product, state, branch; outstanding balance, collections, DPD buckets, recovery rates with validated definitions; snapshots handled correctly; PII protections.

HR:
- Headcount by department/location, hires/exits by month, salary expense, tenure, attrition rate with defined denominator and snapshot logic.

Healthcare:
- Visits by facility/specialty/month, average waiting time, billing, cancellations; do not expose sensitive patient identifiers by default.

Education:
- Enrollment by course/campus, fees billed vs collected, outstanding, attendance percentages with correct denominators.

Logistics:
- Shipments by route/carrier, on-time delivery %, delay averages, freight costs, exceptions.

Manufacturing:
- Production by plant/product, yield/scrap %, downtime, quality defects, inventory snapshots.

Fallback generic templates:
- Dimension vs additive numeric metric; date trend; top categories; status distribution; data quality summary. If no safe additive metric exists, recommend COUNT rows with clear label.

============================================================
8. EXCEL OUTPUT SPECIFICATION
============================================================
Workbook sheets (configurable):
00_ReadMe: project metadata, definitions, refresh instructions, disclaimers.
01_Raw_Data: sanitized headers, Excel Table named tblRawData, original values preserved as much as practical, added helper columns clearly flagged; source lineage.
02_Data_Dictionary: original and normalized column names, types, roles, null rates, formulas/definitions.
03_Executive_Summary: KPI cells linked to reliable pivots or calculated with validated formulas; navigation links.
10_Pivot_Geography, 11_Pivot_Product, 12_Pivot_Monthly, etc.: one or more non-overlapping genuine native PivotTables.
20_Charts: native PivotCharts where Excel COM supports them, otherwise standard charts clearly described as such.
90_QA_Log: input and output row counts, control totals, warnings, PivotTable inventory, refresh status.

Excel COM implementation details:
- Build and save a staging XLSX with a properly typed Excel Table; Excel COM opens staging workbook.
- Use Excel ListObject/table range or explicit source range as PivotCache SourceData; verify table-name references work across target Excel versions. Create PivotCache via Workbook.PivotCaches().Create with xlDatabase; use one cache for compatible pivots.
- CreatePivotTable with a unique valid TableName and destination cell on a dedicated worksheet.
- Assign fields to xlRowField/xlColumnField/xlPageField, Position in specified order; add data fields using AddDataField with xlSum/xlCount/xlAverage/etc.; set NumberFormat.
- Configure RowAxisLayout(xlTabularRow) where supported; repeat labels optionally; subtotals, grand totals, sorting, filtering, number formats, styles.
- Group dates cautiously: helper columns Year/Quarter/Month are safer and deterministic across locales than automatic date grouping. If native date grouping is used, validate no blanks/text and handle COM errors.
- Slicers: create/reuse SlicerCache, connect to compatible PivotTables, add slicers on designated dashboard sheet. Slicer API and shared-cache behavior vary by Excel version; feature-detect, test, and provide clear fallback.
- PivotCharts: feature-detect COM APIs; verify chart remains linked to the PivotTable. Do not call ordinary charts PivotCharts.
- Refresh: source must remain inside workbook as a stable Table; RefreshAll or individual cache refresh, then verify counts and pivot fields. Excel Table expansion is not always automatically reflected in cache SourceData: explicitly update/validate source and cache on refresh as needed. Provide an in-app Refresh action or documented Excel refresh behavior.
- Preserve formulas, number types, and date serials; Excel 1,048,576-row and 16,384-column sheet limits apply. Never silently truncate.
- Use descriptive PivotTable names without invalid characters; avoid Excel sheet name length >31 chars and forbidden characters.
- Disable external data links by default; no data connections or Power Query dependency unless explicitly configured.

Distinct Count: Excel native distinct count usually requires Data Model/OLAP PivotTables. Implement only after separate verified compatibility testing; otherwise provide an accurately labeled unique-count helper summary or disable it. Never substitute simple count.

============================================================
9. VALIDATION, RECONCILIATION AND DATA QUALITY
============================================================
- Check input rows, imported rows, output table rows, duplicates, invalid dates, numeric parse errors, missing key fields.
- Validate raw control totals against staged table (e.g. sum of realized sales and quantity), with floating-point tolerance and decimal handling.
- Compare pivot grand totals with source aggregation under equivalent filters and status conditions; use pandas independent checks.
- Ensure PivotTables exist in saved/reopened workbook; enumerate Worksheets/PivotTables and fields through COM.
- Verify pivot cache source and refresh result, workbook file existence/size, expected chart/slicer counts.
- Record failed optional components separately; mark output partial success and do not suppress warnings.
- Show summary of row-level limitations: synthetic data, inconsistent customer IDs/names, duplicate transaction IDs, if any.
- For multi-line orders, avoid double counting delivery charges or order totals; require appropriate aggregation grain.
- For inventory, avoid summing per-transaction stock snapshots as if they were on-hand inventory.
- Do not infer causation from correlation or discount data.

============================================================
10. SECURITY, PRIVACY, AND RELIABILITY
============================================================
- All data processing local by default. No cloud uploads, telemetry, or LLM requests without explicit opt-in and data handling disclosure.
- Do not log customer names, phone numbers, emails, addresses, account numbers, or sample records. Logs contain schema metadata and masked values.
- CSV formula injection: treat cells starting with =,+,-,@ carefully when writing untrusted strings to Excel; preserve legitimate numeric negatives and formula behavior intentionally, never execute injected formulas.
- Excel macro security: disable macros when opening untrusted workbooks; no automatic link updates; no execution of external connections.
- Path traversal, long paths, permissions, file locks, low disk space, and antivirus interference handled gracefully.
- Save to temporary file in target directory, verify, then atomic rename/replace only with explicit overwrite confirmation. Preserve original on failure.
- Concurrency: one COM workbook-generation job per worker; serialize COM calls; support queue.
- Excel dialog hangs: watchdog and user-facing timeout guidance; no indiscriminate process kills.
- Cancellation: stop at safe checkpoints, close app-owned workbook/Excel instance, remove incomplete temp file, retain diagnostics.
- Recovery: optional retry after Excel restart; support resuming planning state but not blindly resuming half-built COM objects.

============================================================
11. PERFORMANCE AND LIMITS
============================================================
- Profile datasets without converting all columns to strings; preserve types.
- Use efficient vectorized pandas operations and chunked CSV sampling where helpful.
- Minimize Excel COM round-trips: bulk write staging data; never write 100k rows cell by cell through COM.
- Cache profiles and normalized mappings keyed by file hash/mtime with privacy-conscious local metadata.
- Avoid excessive PivotCaches and high-cardinality slicers; estimate workbook size and memory.
- Define thresholds with warning prompts for >100k rows, high-cardinality fields, large workbooks; test actual capacity rather than promising unlimited.
- Progress percentages based on stages, not fabricated elapsed time.

============================================================
12. TEST PLAN
============================================================
Unit tests:
- header normalization, type inference, date parsing, alias detection, confidence reasons, hierarchy parent-child checks, metric aggregation safety, pivot plan validation, filenames.
- CSV with BOM, embedded commas/newlines, delimiters, encodings, leading-zero IDs, blank headers, duplicates, mixed types, malformed rows.
- Percentage aggregation and profit-margin ratio semantics; stock snapshot logic; order-line vs order-grain count.

Integration tests (Windows + real desktop Excel):
- Import provided Blinkit-style 3k-row/46-column CSV and Retail Superstore 3k-row/59-column CSV, if supplied in workspace; otherwise create equivalent synthetic fixtures.
- Build at least 6 real native pivots in a single workbook; verify row hierarchy Country > State > City, value aggregations, filters, cache sharing, date ordering, no overlaps.
- Save, close, reopen, enumerate pivot tables and fields, refresh, compare control totals.
- Append new rows to source Table, refresh using supported mechanism, validate new rows included.
- Verify charts and slicers independently and label unsupported features honestly.
- Test Excel unavailable, read-only output, locked file, cancellation, corrupt workbook, 50k/100k rows, long Unicode headers, unsupported formats.

Golden fixture expected outcomes should be computed independently from pandas and stored as assertions, not generated from the same faulty code path as COM output.

============================================================
13. IMPLEMENTATION PHASES AND MILESTONES
============================================================
Phase 1: Discovery and technical spike
- Inspect current repository, Python/Excel environment and available files. Confirm desktop Excel COM and pywin32 work; prototype one native pivot and save/reopen. Document version compatibility and failure modes.

Phase 2: Import/profiling engine
- Robust CSV/XLSX ingestion, schema profiling, alias dictionary, role inference, hierarchy candidates, manual overrides, tests.

Phase 3: Pivot planner
- Typed plan schema, industry templates, safe aggregation selection, warnings, preview, unit tests.

Phase 4: Native Excel engine
- Staging workbook, Excel Table, COM process, cache reuse, multiple PivotTables, formatting, verification, atomic output, integration tests.

Phase 5: Charts, slicers, refresh
- Optional PivotCharts/slicers with feature detection, refresh manager, QA manifest, safe fallback.

Phase 6: Desktop UI and polish
- PySide6 wizard, plan editor, progress, cancellation, logs, settings, keyboard accessibility, error messaging.

Phase 7: QA, packaging and handover
- Real Excel integration tests, benchmarks, Windows packaging, installer, end-user manual, troubleshooting, demo workbook, release checklist.

At the end of each phase, show changed files, test evidence, blockers, known limitations, and what remains. Do not jump ahead or label untested behavior as complete.

============================================================
14. PROJECT DELIVERABLES
============================================================
1. Complete source repository with clean modules and typed interfaces.
2. requirements.txt or pyproject.toml with pinned compatible versions.
3. Working Windows desktop UI and launch script.
4. Native Excel COM generator, independent from UI.
5. Configurable industry templates and field alias dictionaries.
6. Synthetic sample datasets and expected-result fixtures.
7. Real native PivotTable example XLSX with geography/product/time pivots.
8. Automated tests and Windows+Excel integration test instructions/results.
9. User guide: import, field mapping, plan editing, export, refresh, troubleshooting.
10. Developer guide: architecture, COM lifecycle, testing, extension points.
11. Manifest/log schema and privacy documentation.
12. Packaging script and release checklist.

============================================================
15. FIRST IMPLEMENTATION TASK FOR ANTIGRAVITY
============================================================
Start by checking the repository and environment, then produce a short implementation plan and create a minimal vertical slice that:
(1) imports a CSV;
(2) detects Country, State, City and one safe additive sales measure;
(3) presents an editable pivot plan;
(4) creates a NEW XLSX with embedded raw Excel Table;
(5) uses real Excel COM to generate a native PivotTable with Country > State > City as Rows and SUM(Sales) as Values;
(6) saves, closes, reopens, verifies PivotTable fields and totals;
(7) reports clear pass/fail evidence.
Only after this succeeds, proceed to the full feature set in the phases above. If Excel COM is not available in the development environment, stop and report the exact blocker; do not replace native PivotTables with static tables without user approval.

============================================================
16. IMPORTANT PRODUCT DESIGN DECISIONS
============================================================
- Do not conflate automatic column classification with reliable business semantics. Confidence and user review are required.
- Do not use a language model as the only source of field mapping. Deterministic validation is mandatory.
- Do not assume every dataset contains Country/State/City; infer the best available hierarchy.
- Do not sum non-additive ratios or snapshots.
- Do not treat a normal chart as a PivotChart or a static summary as a PivotTable.
- Do not assume pivot refresh automatically extends to newly appended rows without testing.
- Do not overwrite source files.
- Do not enable workbook macros or external links.
- Do not promise native Excel COM functionality on Linux, macOS, or hosted servers.
- Do not skip real Windows/Excel verification.

END OF PRD