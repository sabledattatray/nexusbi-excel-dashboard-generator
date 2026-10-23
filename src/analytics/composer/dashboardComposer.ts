/**
 * Universal Dashboard Composer
 * Authoritative source: PRD v9.0 Phase 9C Mandatory Requirement 1, 3, 6, 11 & 13
 *
 * Compiles a declarative, canonical UniversalDashboardModel from arbitrary datasets.
 * Powered by deterministic semantics, domain rule packs, and the dual analytics engine.
 */

import { DatasetProfile } from '../profiler/datasetProfiler';
import { DetectedSemanticModel } from '../profiler/semanticDetector';
import { DomainRulePack, ChartProposal } from '../rules/rulePacks';
import { QueryPlan, MetricQuery } from '../types';
import { executeAnalytics } from '../engineManager';

export interface KpiCardModel {
  id: string;
  label: string;
  value: number;
  formattedValue: string;
  unit?: string;
  calculationFormula: string;
  denominatorRule?: string;
  sourceColumns: string[];
  missingExclusions: number;
  confidence: number;
  isFinancial: boolean;
  explanation: string;
}

export interface ChartViewModel {
  id: string;
  title: string;
  chartType: 'bar' | 'line' | 'pie' | 'scatter';
  dimensionLabel: string;
  metricLabel: string;
  data: { label: string; value: number }[];
  accessibleSummary?: string;
}

export interface ActionQueueItem {
  rank: number;
  entityId: string;
  sourceRowIndex: number;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  status: string;
  ownerOrAssignee?: string;
  siteOrLocation?: string;
  ageDaysOrHours?: string;
  urgencyScore: number;
  reason: string;
  rawDetails: Record<string, any>;
}

export interface ManagementDecisionBrief {
  headline: string;
  executiveBullets: { title: string; text: string; evidenceMetricId?: string; evidenceValue?: string }[];
  recommendedActions: string[];
  caveats: string[];
}

export interface ExecutiveHeaderModel {
  domain: string;
  reportTitle: string;
  intakePeriod?: string;
  asOfTimestamp: string;
  totalRecords: number;
  qualityState: 'Optimal' | 'Acceptable' | 'Needs Review';
  domainConfidence: number;
  profilingConfidence: number;
  dataLocality: string;
}

export interface DataQualityReport {
  totalRecords: number;
  completeRecords: number;
  completenessRate: number;
  duplicateCount: number;
  columnNullRates: Record<string, number>;
  anomalies: string[];
}

export interface UniversalDashboardModel {
  dashboardTitle: string;
  domainClassification: string;
  isUniversalFallback: boolean;
  domainConfidence: number;
  profilingConfidence: number;
  executiveHeader: ExecutiveHeaderModel;
  kpiCards: KpiCardModel[];
  charts: ChartViewModel[];
  actionQueue: ActionQueueItem[];
  decisionBrief: ManagementDecisionBrief;
  dataQuality: DataQualityReport;
  queryPlans: QueryPlan[];
  generatedAt: string;
}

function formatValue(val: number, metric: MetricQuery, profile: DatasetProfile): string {
  if (!Number.isFinite(val)) return '0';

  if (metric.operation === 'ratio' || metric.id.includes('rate') || metric.id.includes('pct') || metric.id.includes('margin')) {
    const pct = val <= 1 ? val * 100 : val;
    return `${pct.toFixed(2)}%`;
  }

  const isFinancial = profile.hasFinancial && (
    metric.id.includes('sales') ||
    metric.id.includes('profit') ||
    metric.id.includes('cost') ||
    metric.id.includes('revenue') ||
    metric.id.includes('salary') ||
    metric.id.includes('aov') ||
    metric.id.includes('order_value') ||
    metric.id.includes('balance') ||
    metric.id.includes('price') ||
    metric.id.includes('cogs')
  );

  if (isFinancial) {
    const symbol = profile.columnMap.get(metric.field || '')?.currencySymbol ||
      profile.columns.find((c) => c.currencySymbol)?.currencySymbol || '$';
    if (Math.abs(val) >= 1_000_000) {
      return `${symbol}${(val / 1_000_000).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}M`;
    }
    return `${symbol}${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  if (Number.isInteger(val) || metric.operation === 'count' || metric.operation === 'countRows' || metric.operation === 'countDistinct') {
    return val.toLocaleString('en-US');
  }

  return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function buildActionQueue(
  rawRows: Record<string, any>[],
  profile: DatasetProfile,
  semantics: DetectedSemanticModel
): ActionQueueItem[] {
  if (rawRows.length === 0) return [];

  const idCol = semantics.primaryIdentifier || profile.columns[0]?.name;
  const statusCol = semantics.statusColumn || profile.columns.find((c) => /(status|stage|disposition)/i.test(c.name))?.name;
  const priorityCol = profile.columns.find((c) => /(priority|urgency|severity)/i.test(c.name))?.name;
  const ownerCol = profile.columns.find((c) => /(resolver|assigned|owner|rep|agent|team|doctor|physician)/i.test(c.name))?.name;
  const siteCol = profile.columns.find((c) => /(site|location|branch|warehouse|dept|department|clinic)/i.test(c.name))?.name;

  // Exception measure columns
  const overdueCol = profile.columns.find((c) => /(days_overdue|overdue_days|lag_days|delay)/i.test(c.name))?.name;
  const balanceCol = profile.columns.find((c) => /(outstanding_balance|unpaid_amount|balance)/i.test(c.name))?.name;

  const scoredRows: { index: number; row: Record<string, any>; score: number; priority: 'Critical' | 'High' | 'Medium' | 'Low'; reason: string }[] = [];

  for (let idx = 0; idx < rawRows.length; idx++) {
    const r = rawRows[idx];
    let score = 0;
    let priority: 'Critical' | 'High' | 'Medium' | 'Low' = 'Low';
    const reasons: string[] = [];

    // 1. Priority column check
    if (priorityCol && r[priorityCol]) {
      const pVal = String(r[priorityCol]).toLowerCase();
      if (pVal.includes('crit') || pVal.includes('urg') || pVal.includes('p1')) {
        score += 50;
        priority = 'Critical';
        reasons.push(`Priority: ${r[priorityCol]}`);
      } else if (pVal.includes('high') || pVal.includes('p2')) {
        score += 35;
        priority = 'High';
        reasons.push(`Priority: ${r[priorityCol]}`);
      }
    }

    // 2. Status column check (only negative or actionable lifecycle states)
    if (statusCol && r[statusCol]) {
      const sVal = String(r[statusCol]).toLowerCase();
      if (sVal.includes('breach') || sVal.includes('failed') || sVal.includes('scrap') || sVal.includes('rework') || sVal.includes('escalat') || sVal.includes('dispute') || sVal.includes('error') || sVal.includes('reject')) {
        score += 45;
        if (priority === 'Low') priority = 'Critical';
        reasons.push(`State: ${r[statusCol]}`);
      } else if (sVal.includes('overdue') || sVal.includes('unpaid')) {
        score += 35;
        if (priority === 'Low') priority = 'High';
        reasons.push(`State: ${r[statusCol]}`);
      } else if (sVal.includes('partially paid') || sVal.includes('pending') || sVal.includes('open') || sVal.includes('wait')) {
        // Only an exception if accompanied by overdue or balance
        const hasOverdue = overdueCol && Number(r[overdueCol]) > 0;
        const hasBalance = balanceCol && Number(r[balanceCol]) > 0;
        if (hasOverdue || hasBalance) {
          score += 25;
          if (priority === 'Low') priority = 'Medium';
          reasons.push(`State: ${r[statusCol]}`);
        }
      }
    }

    // 3. Overdue days check
    if (overdueCol && r[overdueCol] !== null && r[overdueCol] !== undefined) {
      const days = Number(r[overdueCol]);
      if (Number.isFinite(days) && days > 0) {
        score += Math.min(40, 20 + Math.round(days / 10));
        if (priority === 'Low' || priority === 'Medium') priority = days > 90 ? 'Critical' : 'High';
        reasons.push(`Overdue: ${days} days`);
      }
    }

    // 4. Outstanding balance check
    if (balanceCol && r[balanceCol] !== null && r[balanceCol] !== undefined) {
      const bal = Number(r[balanceCol]);
      const statusStr = statusCol ? String(r[statusCol] || '').toLowerCase() : '';
      if (Number.isFinite(bal) && bal > 0 && !statusStr.includes('paid')) {
        score += 30;
        if (priority === 'Low') priority = 'High';
        reasons.push(`Outstanding Balance: ${bal.toLocaleString()}`);
      }
    }

    // Only include rows with a REAL exception condition!
    if (score > 0 && reasons.length > 0) {
      scoredRows.push({
        index: idx,
        row: r,
        score,
        priority,
        reason: reasons.join(' • '),
      });
    }
  }

  // If no rows triggered genuine exception conditions, return empty queue
  if (scoredRows.length === 0) return [];

  // Sort descending by urgency score
  scoredRows.sort((a, b) => b.score - a.score);

  // Take top 15 action items
  return scoredRows.slice(0, 15).map((item, i) => {
    const raw = item.row;
    const entityId = idCol && raw[idCol] ? String(raw[idCol]) : `ROW-${item.index + 1}`;
    const status = statusCol && raw[statusCol] ? String(raw[statusCol]) : 'Active';
    const owner = ownerCol && raw[ownerCol] ? String(raw[ownerCol]) : undefined;
    const site = siteCol && raw[siteCol] ? String(raw[siteCol]) : undefined;

    return {
      rank: i + 1,
      entityId,
      sourceRowIndex: item.index,
      priority: item.priority,
      status,
      ownerOrAssignee: owner,
      siteOrLocation: site,
      urgencyScore: item.score,
      reason: item.reason,
      rawDetails: raw,
    };
  });
}

function buildDecisionBrief(
  profile: DatasetProfile,
  semantics: DetectedSemanticModel,
  rulePack: DomainRulePack,
  kpiCards: KpiCardModel[],
  charts: ChartViewModel[]
): ManagementDecisionBrief {
  const topKpis = kpiCards.slice(0, 4);
  const cleanDomainName = rulePack.name.replace(/^executive\s+/i, '').trim();
  const headline = `${cleanDomainName}: Executive Operational Brief (${profile.totalRows.toLocaleString()} Records Audited)`;

  const bullets: { title: string; text: string; evidenceMetricId?: string; evidenceValue?: string }[] = [];

  // Bullet 1: Ingestion & Data Quality Profile
  bullets.push({
    title: 'Ingestion & Data Quality Profile',
    text: `Audited ${profile.totalRows.toLocaleString()} source rows across ${profile.totalColumns} columns with ${(profile.completenessRate * 100).toFixed(1)}% full record completeness. Detected ${profile.duplicateRowsCount} duplicate records in source data.`,
  });

  // Bullet 2: Primary Financial / Operational Metric Overview
  if (topKpis.length > 0) {
    const primaryKpi = topKpis.find((k) => k.id.includes('sales') || k.id.includes('revenue') || k.id.includes('tickets') || k.id.includes('records') || k.id.includes('balance') || k.id.includes('units')) || topKpis[0];
    const secondaryKpi = topKpis.find((k) => k.id !== primaryKpi.id && (k.id.includes('aov') || k.id.includes('profit') || k.id.includes('sla') || k.id.includes('average') || k.id.includes('cogs')));
    
    let kpiOverviewText = `${primaryKpi.label} stands at ${primaryKpi.formattedValue} calculated via ${primaryKpi.calculationFormula}.`;
    if (secondaryKpi) {
      kpiOverviewText += ` Supporting benchmark ${secondaryKpi.label} stands at ${secondaryKpi.formattedValue}.`;
    }
    bullets.push({
      title: `${primaryKpi.label} Benchmark`,
      text: kpiOverviewText,
      evidenceMetricId: primaryKpi.id,
      evidenceValue: primaryKpi.formattedValue,
    });
  }

  // Bullet 3: Cohort Concentration & Comparative Ratio
  const catChart = charts.find((c) => c.chartType === 'bar' || c.chartType === 'pie');
  if (catChart && catChart.data.length > 0) {
    const sortedData = [...catChart.data].sort((a, b) => b.value - a.value);
    const topItem = sortedData[0];
    const bottomItem = sortedData[sortedData.length - 1];
    const totalChartVal = sortedData.reduce((sum, d) => sum + d.value, 0);
    const topPct = totalChartVal > 0 ? ((topItem.value / totalChartVal) * 100).toFixed(1) : '0';
    
    let concentrationText = `Largest volume resides in '${topItem.label}' with ${topItem.value.toLocaleString()} (${topPct}% of cohort total).`;
    if (sortedData.length >= 2 && bottomItem && bottomItem.value > 0) {
      const ratio = (topItem.value / bottomItem.value).toFixed(1);
      concentrationText += ` Lead cohort exceeds '${bottomItem.label}' by ${ratio}x.`;
    }
    bullets.push({
      title: `Cohort Concentration (${catChart.dimensionLabel})`,
      text: concentrationText,
    });
  }

  // Bullet 4: Temporal Trajectory & Significant Shifts
  const timeChart = charts.find((c) => c.chartType === 'line' || c.id.includes('trend') || c.id.includes('time'));
  if (timeChart && timeChart.data.length >= 2) {
    const firstPoint = timeChart.data[0];
    const lastPoint = timeChart.data[timeChart.data.length - 1];
    let peakPoint = timeChart.data[0];
    for (const pt of timeChart.data) {
      if (pt.value > peakPoint.value) peakPoint = pt;
    }

    const deltaPct = firstPoint.value > 0
      ? (((lastPoint.value - firstPoint.value) / firstPoint.value) * 100).toFixed(1)
      : '0.0';
    const sign = Number(deltaPct) >= 0 ? '+' : '';

    bullets.push({
      title: `Temporal Trajectory (${timeChart.dimensionLabel})`,
      text: `Measured from ${firstPoint.label} (${firstPoint.value.toLocaleString()}) to ${lastPoint.label} (${lastPoint.value.toLocaleString()}) with ${sign}${deltaPct}% net trajectory. Peak volume recorded in ${peakPoint.label} (${peakPoint.value.toLocaleString()}).`,
    });
  } else if (topKpis.length > 1) {
    const secondKpi = topKpis[1];
    bullets.push({
      title: `${secondKpi.label} Distribution`,
      text: `Observed ${secondKpi.label} of ${secondKpi.formattedValue}. Denominator rules and null exclusions applied deterministically.`,
      evidenceMetricId: secondKpi.id,
      evidenceValue: secondKpi.formattedValue,
    });
  }

  const recommendedActions = [
    'Review active/unresolved records in the prioritized Action Queue below.',
    'Inspect columns with high null rates to ensure complete source data capture.',
    'Cross-filter by top category cohorts to identify operational bottleneck variance.',
  ];

  const caveats = [
    'Comparisons are strictly descriptive; no causal assertions, predictions or forward forecasts are fabricated.',
    'All metric aggregations reflect verified source data records executed within client-side browser memory.',
    'Missing or invalid values are explicitly excluded from mathematical calculations rather than imputed with synthetic estimates.',
  ];

  return {
    headline,
    executiveBullets: bullets,
    recommendedActions,
    caveats,
  };
}

export async function composeUniversalDashboard(
  tableName: string,
  rawRows: Record<string, any>[],
  profile: DatasetProfile,
  semantics: DetectedSemanticModel,
  rulePack: DomainRulePack
): Promise<UniversalDashboardModel> {
  // 1. Data Quality Assessment
  const columnNullRates: Record<string, number> = {};
  for (const c of profile.columns) {
    columnNullRates[c.name] = Number(c.nullRate.toFixed(4));
  }

  const anomalies: string[] = [];
  if (profile.duplicateRowsCount > 0) {
    anomalies.push(`Detected ${profile.duplicateRowsCount} duplicate rows in source dataset.`);
  }
  if (profile.completenessRate < 0.8) {
    anomalies.push(`High missingness: only ${(profile.completenessRate * 100).toFixed(1)}% of rows are fully populated.`);
  }

  // 2. Build Metrics Plan
  const metricQueries = rulePack.buildMetrics(profile, semantics);
  const summaryPlan: QueryPlan = {
    planId: `summary-${Date.now()}`,
    tableName,
    metrics: metricQueries,
  };

  const { result: summaryResult } = await executeAnalytics(summaryPlan, rawRows);

  // 3. Populate KPI Cards with explanation drawers and missing exclusions
  const kpiCards: KpiCardModel[] = [];
  for (const mq of metricQueries) {
    const val = summaryResult.metrics[mq.id] ?? 0;
    const isFinancial = profile.hasFinancial && /sales|revenue|cost|profit|salary|price/i.test(mq.id);
    let formulaDesc = `${mq.operation.toUpperCase()}`;
    if (mq.field) formulaDesc += `(${mq.field})`;
    if (mq.denominatorField) formulaDesc += ` / SUM(${mq.denominatorField})`;

    const sourceCols = [mq.field, mq.denominatorField, mq.weightField, mq.startField, mq.endField].filter(Boolean) as string[];
    const colProf = mq.field ? profile.columnMap.get(mq.field) : undefined;
    const missingExclusions = colProf ? colProf.nullCount : 0;

    let explanation = `Calculated using ${formulaDesc} across ${profile.totalRows.toLocaleString()} records.`;
    if (missingExclusions > 0) {
      explanation += ` Excluded ${missingExclusions} records where ${mq.field} was null or invalid.`;
    }
    if (mq.denominatorField) {
      explanation += ` Denominator strictly constrained to non-zero values of ${mq.denominatorField}.`;
    }

    kpiCards.push({
      id: mq.id,
      label: mq.label,
      value: val,
      formattedValue: formatValue(val, mq, profile),
      unit: mq.durationUnit || (isFinancial ? 'currency' : undefined),
      calculationFormula: formulaDesc,
      denominatorRule: mq.denominatorRule || (mq.denominatorField ? `Evaluated over non-zero ${mq.denominatorField}` : undefined),
      sourceColumns: sourceCols,
      missingExclusions,
      confidence: semantics.overallConfidence,
      isFinancial,
      explanation,
    });
  }

  // 4. Build and Execute Charts
  const chartProposals = rulePack.buildCharts(profile, semantics);
  const chartViewModels: ChartViewModel[] = [];
  const queryPlans: QueryPlan[] = [summaryPlan];

  for (const cp of chartProposals) {
    const targetMetricQuery = metricQueries.find((m) => m.id === cp.metricId) || {
      id: cp.metricId,
      label: cp.metricLabel,
      operation: 'countRows' as const,
    };

    const isTemporal = typeof cp.dimension === 'object' && 'timeBucket' in cp.dimension;
    const dimKey = typeof cp.dimension === 'string' ? cp.dimension : cp.dimension.alias || cp.dimension.field;

    const chartPlan: QueryPlan = {
      planId: `chart-${cp.id}-${Date.now()}`,
      tableName,
      metrics: [targetMetricQuery],
      groupBy: [cp.dimension],
      topN: isTemporal ? undefined : cp.topN,
      sort: isTemporal
        ? [{ field: dimKey, direction: 'asc' }]
        : (cp.sortDirection ? [{ field: cp.metricId, direction: cp.sortDirection }] : undefined),
      limit: isTemporal ? 36 : (cp.topN ? undefined : 12),
    };
    queryPlans.push(chartPlan);

    const { result: chartResult } = await executeAnalytics(chartPlan, rawRows);

    const dataPoints: { label: string; value: number }[] = [];
    if (chartResult.groupedRows) {
      for (const row of chartResult.groupedRows) {
        dataPoints.push({
          label: String(row[dimKey] ?? 'Unknown'),
          value: Number(row[cp.metricId] || 0),
        });
      }
    }

    // Ensure strict chronological ordering for time series
    if (isTemporal) {
      dataPoints.sort((a, b) => a.label.localeCompare(b.label));
    }

    const dimLabel = dimKey;
    const topItem = dataPoints[0];
    const accessibleSummary = topItem
      ? `${cp.title} displaying ${dataPoints.length} cohorts along ${dimLabel}. Lead category is '${topItem.label}' with ${topItem.value.toLocaleString()} ${cp.metricLabel}.`
      : `${cp.title} with 0 records.`;

    chartViewModels.push({
      id: cp.id,
      title: cp.title,
      chartType: cp.type === 'line' ? 'line' : cp.type === 'pie' ? 'pie' : 'bar',
      dimensionLabel: dimLabel,
      metricLabel: cp.metricLabel,
      data: dataPoints,
      accessibleSummary,
    });
  }

  const isUniversalFallback = rulePack.id === 'universal_fallback';
  let domainTitle: string;
  if (isUniversalFallback) {
    domainTitle = 'Dataset Intelligence & Operational Analysis';
  } else {
    const cleanName = rulePack.name.replace(/^executive\s+/i, '').trim();
    domainTitle = `${cleanName} Executive Dashboard`;
  }

  // 5. Build Action Queue & Management Decision Brief
  const actionQueue = buildActionQueue(rawRows, profile, semantics);
  const decisionBrief = buildDecisionBrief(profile, semantics, rulePack, kpiCards, chartViewModels);

  // 6. Build Executive Header
  let intakePeriod: string | undefined;
  if (semantics.primaryDate && profile.columnMap.get(semantics.primaryDate)?.dateRange) {
    const dr = profile.columnMap.get(semantics.primaryDate)!.dateRange!;
    intakePeriod = `${dr.min.toISOString().slice(0, 10)} to ${dr.max.toISOString().slice(0, 10)} (${dr.spanDays} days)`;
  }

  const qualityState = profile.completenessRate >= 0.9 ? 'Optimal' : profile.completenessRate >= 0.7 ? 'Acceptable' : 'Needs Review';

  const evalResult = rulePack.evaluate(profile, semantics);
  const domainConfidence = isUniversalFallback ? 0.0 : evalResult.confidence;
  const profilingConfidence = semantics.profilingConfidence || semantics.overallConfidence;

  const executiveHeader: ExecutiveHeaderModel = {
    domain: rulePack.name,
    reportTitle: domainTitle,
    intakePeriod,
    asOfTimestamp: new Date().toISOString(),
    totalRecords: profile.totalRows,
    qualityState,
    domainConfidence,
    profilingConfidence,
    dataLocality: '100% In-Browser Memory (Zero-AI, Zero-Telemetry)',
  };

  return {
    dashboardTitle: domainTitle,
    domainClassification: rulePack.name,
    isUniversalFallback,
    domainConfidence,
    profilingConfidence,
    executiveHeader,
    kpiCards,
    charts: chartViewModels,
    actionQueue,
    decisionBrief,
    dataQuality: {
      totalRecords: profile.totalRows,
      completeRecords: profile.completeRowsCount,
      completenessRate: profile.completenessRate,
      duplicateCount: profile.duplicateRowsCount,
      columnNullRates,
      anomalies,
    },
    queryPlans,
    generatedAt: new Date().toISOString(),
  };
}
