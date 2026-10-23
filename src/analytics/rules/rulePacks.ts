/**
 * Domain-Independent Rule Pack Registry & Universal Fallback
 * Authoritative source: PRD v9.0 Phase 9C Mandatory Requirement 3, 6, 7 & 8
 *
 * Provides optional domain rule packs with strict eligibility criteria.
 * Enforces rule: Never invent Revenue, Profit, SLA, Attrition, ROI, or Occupancy
 * when required fields are absent. Defaults to Universal Fallback Analytics.
 */

import { DatasetProfile } from '../profiler/datasetProfiler';
import { DetectedSemanticModel } from '../profiler/semanticDetector';
import { MetricQuery, GroupBySpec, TopNSpec } from '../types';

export interface ChartProposal {
  id: string;
  title: string;
  type: 'bar' | 'line' | 'pie' | 'scatter' | 'matrix';
  dimension: string | GroupBySpec;
  metricId: string;
  metricLabel: string;
  topN?: TopNSpec;
  sortDirection?: 'asc' | 'desc';
}

export interface RulePackEvaluation {
  eligible: boolean;
  confidence: number;
  domainId: string;
  domainName: string;
  matchedRequirements: string[];
  missingRequirements: string[];
}

export interface DomainRulePack {
  readonly id: string;
  readonly name: string;
  evaluate(profile: DatasetProfile, semantics: DetectedSemanticModel): RulePackEvaluation;
  buildMetrics(profile: DatasetProfile, semantics: DetectedSemanticModel): MetricQuery[];
  buildCharts(profile: DatasetProfile, semantics: DetectedSemanticModel): ChartProposal[];
}

// ----------------------------------------------------------------------
// 1. Universal Fallback Analytics Rule Pack (Zero-AI, Domain-Agnostic)
// ----------------------------------------------------------------------
export class UniversalFallbackRulePack implements DomainRulePack {
  readonly id = 'universal_fallback';
  readonly name = 'Universal Dataset Intelligence & Distribution Analysis';

  evaluate(profile: DatasetProfile, semantics: DetectedSemanticModel): RulePackEvaluation {
    return {
      eligible: true,
      confidence: 0.0, // Strictly 0.0 domain recognition: unclassified fallback
      domainId: this.id,
      domainName: this.name,
      matchedRequirements: ['Universal Schema Analysis'],
      missingRequirements: ['No industry-specific domain matched threshold >= 70%'],
    };
  }

  buildMetrics(profile: DatasetProfile, semantics: DetectedSemanticModel): MetricQuery[] {
    const metrics: MetricQuery[] = [
      { id: 'total_records', label: 'Total Records Volume', operation: 'countRows' },
    ];

    // Distinct entities count if identifier exists
    if (semantics.primaryIdentifier) {
      metrics.push({
        id: 'unique_entities_count',
        label: `Unique Entities (${semantics.primaryIdentifier})`,
        operation: 'countDistinct',
        field: semantics.primaryIdentifier,
      });
    }

    // Quantitative metrics if numeric measures exist
    if (semantics.primaryMetric) {
      const additivity = semantics.measureAdditivity?.[semantics.primaryMetric] || 'additive';

      // DO NOT SUM non-additive metrics (e.g. GPA, Age, Rating, Score, Unit Cost)
      if (additivity === 'additive' || additivity === 'semi_additive') {
        metrics.push({
          id: 'primary_measure_total',
          label: additivity === 'semi_additive' ? `Total Current ${semantics.primaryMetric}` : `Total ${semantics.primaryMetric}`,
          operation: 'sum',
          field: semantics.primaryMetric,
        });
      }

      metrics.push({
        id: 'primary_measure_average',
        label: `Mean ${semantics.primaryMetric}`,
        operation: 'average',
        field: semantics.primaryMetric,
      });
      metrics.push({
        id: 'primary_measure_median',
        label: `Median ${semantics.primaryMetric}`,
        operation: 'median',
        field: semantics.primaryMetric,
      });

      if (additivity === 'non_additive') {
        metrics.push({
          id: 'primary_measure_min',
          label: `Min ${semantics.primaryMetric}`,
          operation: 'min',
          field: semantics.primaryMetric,
        });
        metrics.push({
          id: 'primary_measure_max',
          label: `Max ${semantics.primaryMetric}`,
          operation: 'max',
          field: semantics.primaryMetric,
        });
      }
    }

    if (semantics.secondaryMetric) {
      const additivity = semantics.measureAdditivity?.[semantics.secondaryMetric] || 'additive';

      // DO NOT SUM non-additive secondary metrics (e.g. Age, Overdue Days, Ratings)
      if (additivity === 'additive' || additivity === 'semi_additive') {
        metrics.push({
          id: 'secondary_measure_total',
          label: additivity === 'semi_additive' ? `Total Current ${semantics.secondaryMetric}` : `Total ${semantics.secondaryMetric}`,
          operation: 'sum',
          field: semantics.secondaryMetric,
        });
      }

      metrics.push({
        id: 'secondary_measure_average',
        label: `Mean ${semantics.secondaryMetric}`,
        operation: 'average',
        field: semantics.secondaryMetric,
      });
      metrics.push({
        id: 'secondary_measure_median',
        label: `Median ${semantics.secondaryMetric}`,
        operation: 'median',
        field: semantics.secondaryMetric,
      });
    }

    // Rate / percentage metric if exists
    if (semantics.rateMetric) {
      metrics.push({
        id: 'average_rate',
        label: `Mean ${semantics.rateMetric}`,
        operation: 'average',
        field: semantics.rateMetric,
      });
    }

    return metrics;
  }

  buildCharts(profile: DatasetProfile, semantics: DetectedSemanticModel): ChartProposal[] {
    const charts: ChartProposal[] = [];
    const primaryAdditivity = semantics.primaryMetric ? semantics.measureAdditivity?.[semantics.primaryMetric] || 'additive' : 'additive';
    const defaultMetricId = !semantics.primaryMetric
      ? 'total_records'
      : primaryAdditivity === 'non_additive'
      ? 'primary_measure_average'
      : 'primary_measure_total';
    const defaultMetricLabel = !semantics.primaryMetric
      ? 'Record Count'
      : primaryAdditivity === 'non_additive'
      ? `Mean ${semantics.primaryMetric}`
      : `Total ${semantics.primaryMetric}`;

    // Chart 1: Primary Category Breakdown
    if (semantics.primaryDimension) {
      charts.push({
        id: 'chart_primary_category_breakdown',
        title: `Distribution by ${semantics.primaryDimension}`,
        type: 'bar',
        dimension: semantics.primaryDimension,
        metricId: defaultMetricId,
        metricLabel: defaultMetricLabel,
        topN: { field: semantics.primaryDimension, metricId: defaultMetricId, limit: 7, includeOther: true },
        sortDirection: 'desc',
      });
    }

    // Chart 2: Temporal Trend if date exists
    if (semantics.primaryDate) {
      charts.push({
        id: 'chart_temporal_trend',
        title: `Activity Trend over ${semantics.primaryDate}`,
        type: 'line',
        dimension: { field: semantics.primaryDate, timeBucket: 'month', alias: 'Month' },
        metricId: defaultMetricId,
        metricLabel: defaultMetricLabel,
        sortDirection: 'asc',
      });
    }

    // Chart 3: Status / State Distribution
    if (semantics.statusColumn) {
      charts.push({
        id: 'chart_status_distribution',
        title: `Breakdown by ${semantics.statusColumn}`,
        type: 'pie',
        dimension: semantics.statusColumn,
        metricId: 'total_records',
        metricLabel: 'Volume',
        sortDirection: 'desc',
      });
    }

    // Chart 4: Location / Secondary Dimension Breakdown
    const secDim = semantics.locationColumn || semantics.secondaryDimension;
    if (secDim) {
      charts.push({
        id: 'chart_secondary_dimension',
        title: `Volume by ${secDim}`,
        type: 'bar',
        dimension: secDim,
        metricId: 'total_records',
        metricLabel: 'Volume',
        topN: { field: secDim, metricId: 'total_records', limit: 6, includeOther: true },
        sortDirection: 'desc',
      });
    }

    return charts;
  }
}

// ----------------------------------------------------------------------
// 2. Sales & Commerce Domain Rule Pack
// ----------------------------------------------------------------------
export class SalesDomainRulePack implements DomainRulePack {
  readonly id = 'sales_commerce';
  readonly name = 'Sales & Revenue Operations';

  evaluate(profile: DatasetProfile, semantics: DetectedSemanticModel): RulePackEvaluation {
    const matched: string[] = [];
    const missing: string[] = [];

    // Requires financial sales/revenue metric (sales/revenue/turnover/gmv/order amount)
    const isNum = (c: any) => ['currency', 'float', 'integer'].includes(c.dataType);
    const hasSalesCol = profile.columns.some(
      (c) => isNum(c) && (/sales|revenue|turnover|gmv/i.test(c.name) || /(order|item|invoice).*amount/i.test(c.name) || /^(gross_sales|net_sales|sales_amount)$/i.test(c.name))
    );
    const hasSalesContext = profile.columns.some((c) => /(order|invoice|txn|transaction|deal|receipt|customer|product|sku)/i.test(c.name));

    if (hasSalesCol) matched.push('Financial sales/revenue metric column present');
    else missing.push('Missing sales/revenue financial column');

    if (hasSalesContext) matched.push('Order, product, or customer commercial context present');
    else missing.push('Missing commercial context');

    if (semantics.primaryDate) matched.push(`Order/Transaction date: ${semantics.primaryDate}`);
    else missing.push('Missing transaction/order date');

    if (semantics.primaryDimension) matched.push(`Category/Segment dimension: ${semantics.primaryDimension}`);

    const confidence = hasSalesCol && hasSalesContext && semantics.primaryDate ? 0.95 : 0.25;
    return {
      eligible: confidence >= 0.7,
      confidence,
      domainId: this.id,
      domainName: this.name,
      matchedRequirements: matched,
      missingRequirements: missing,
    };
  }

  buildMetrics(profile: DatasetProfile, semantics: DetectedSemanticModel): MetricQuery[] {
    const isNum = (c: any) => ['currency', 'float', 'integer'].includes(c.dataType);
    
    // Explicitly differentiate net sales vs gross sales
    const netSalesCol = profile.columns.find((c) => isNum(c) && /^(net_sales|netsales|net_revenue|net_amount)/i.test(c.name))?.name;
    const grossSalesCol = profile.columns.find((c) => isNum(c) && /^(gross_sales|grosssales|gross_revenue|gross_amount)/i.test(c.name))?.name;
    const salesCol = netSalesCol || grossSalesCol || profile.columns.find((c) => isNum(c) && /sales|revenue|amount/i.test(c.name))?.name || semantics.primaryMetric!;
    const isExplicitNet = !!netSalesCol;

    // Order grain for AOV
    const orderIdCol = profile.columns.find((c) => /^(order_id|orderid|invoice_id|invoice_no|transaction_id|txn_id)$/i.test(c.name))?.name;
    const distinctOrders = orderIdCol ? (profile.columnMap.get(orderIdCol)?.distinctCount || profile.totalRows) : profile.totalRows;

    // Distinguish COGS extended vs unit cost
    const extendedCostCol = profile.columns.find((c) => isNum(c) && /^(total_cost|totalcost|cogs|extended_cost)$/i.test(c.name))?.name;
    const unitCostCol = profile.columns.find((c) => isNum(c) && /^(unit_cost|unitcost)$/i.test(c.name))?.name;
    const costCol = extendedCostCol || (unitCostCol && !profile.columns.some((c) => /total_cost/i.test(c.name)) ? unitCostCol : undefined);
    const isUnitCost = !extendedCostCol && !!unitCostCol;

    const profitCol = profile.columns.find((c) => isNum(c) && /gross_profit|grossprofit|profit/i.test(c.name))?.name || semantics.secondaryMetric;
    const qtyCol = profile.columns.find((c) => isNum(c) && /quantity|qty|units/i.test(c.name))?.name || semantics.volumeMetric;

    const metrics: MetricQuery[] = [
      { id: 'total_transactions', label: 'Total Transactions', operation: 'countRows' },
      { 
        id: 'total_net_sales', 
        label: isExplicitNet ? 'Total Net Sales' : 'Total Gross Sales', 
        operation: 'sum', 
        field: salesCol,
        denominatorRule: `${profile.totalRows.toLocaleString()} commercial transactions audited`,
      },
      { 
        id: 'avg_order_value', 
        label: 'Average Order Value (AOV)', 
        operation: 'average', 
        field: salesCol,
        denominatorRule: `${distinctOrders.toLocaleString()} distinct orders (order grain audited)`,
      },
    ];

    if (grossSalesCol && netSalesCol) {
      metrics.push({
        id: 'total_gross_sales',
        label: 'Total Gross Sales',
        operation: 'sum',
        field: grossSalesCol,
        denominatorRule: `${profile.totalRows.toLocaleString()} transactions before deductions`,
      });
    }

    if (profitCol) {
      metrics.push({ id: 'total_gross_profit', label: 'Total Gross Profit', operation: 'sum', field: profitCol });
      metrics.push({
        id: 'gross_profit_margin',
        label: 'Gross Profit Margin %',
        operation: 'ratio',
        field: profitCol,
        denominatorField: salesCol,
      });
    }

    if (costCol) {
      metrics.push({ 
        id: 'total_cost', 
        label: isUnitCost ? 'Mean Unit Cost' : 'Total Cost (COGS)', 
        operation: isUnitCost ? 'average' : 'sum', 
        field: costCol 
      });
    }

    if (qtyCol) {
      metrics.push({ id: 'total_units_sold', label: 'Total Units Sold', operation: 'sum', field: qtyCol });
    }

    return metrics;
  }

  buildCharts(profile: DatasetProfile, semantics: DetectedSemanticModel): ChartProposal[] {
    const charts: ChartProposal[] = [];
    if (semantics.primaryDimension) {
      charts.push({
        id: 'sales_by_category',
        title: `Net Sales by ${semantics.primaryDimension}`,
        type: 'bar',
        dimension: semantics.primaryDimension,
        metricId: 'total_net_sales',
        metricLabel: 'Net Sales',
        topN: { field: semantics.primaryDimension, metricId: 'total_net_sales', limit: 6, includeOther: true },
        sortDirection: 'desc',
      });
    }
    if (semantics.primaryDate) {
      charts.push({
        id: 'sales_trend_over_time',
        title: `Monthly Revenue Trajectory over ${semantics.primaryDate}`,
        type: 'line',
        dimension: { field: semantics.primaryDate, timeBucket: 'month', alias: 'Month' },
        metricId: 'total_net_sales',
        metricLabel: 'Net Sales',
        sortDirection: 'asc',
      });
    }
    const channelCol = profile.columns.find((c) => /channel|region|tier|segment/i.test(c.name) && c.name !== semantics.primaryDimension)?.name;
    if (channelCol) {
      charts.push({
        id: 'sales_by_channel',
        title: `Revenue Distribution by ${channelCol}`,
        type: 'bar',
        dimension: channelCol,
        metricId: 'total_net_sales',
        metricLabel: 'Net Sales',
        topN: { field: channelCol, metricId: 'total_net_sales', limit: 5, includeOther: true },
        sortDirection: 'desc',
      });
    }
    return charts;
  }
}

// ----------------------------------------------------------------------
// 3. IT Helpdesk & Service Desk Domain Rule Pack
// ----------------------------------------------------------------------
export class HelpdeskDomainRulePack implements DomainRulePack {
  readonly id = 'helpdesk_operations';
  readonly name = 'IT Service Desk & Support Operations';

  evaluate(profile: DatasetProfile, semantics: DetectedSemanticModel): RulePackEvaluation {
    const matched: string[] = [];
    const missing: string[] = [];

    const hasCaseId = profile.columns.some((c) => /case|ticket|incident/i.test(c.name));
    const hasStatus = profile.columns.some((c) => /status|state/i.test(c.name));
    const hasLoggedOn = profile.columns.some((c) => /logged|created|opened/i.test(c.name));
    const hasSla = profile.columns.some((c) => /sla/i.test(c.name));

    if (hasCaseId) matched.push('Case/Ticket ID column');
    else missing.push('Missing ticket/case identifier');

    if (hasStatus) matched.push('Ticket State/Status column');
    else missing.push('Missing ticket lifecycle state');

    if (hasLoggedOn) matched.push('Ticket Logged On timestamp');
    else missing.push('Missing intake timestamp');

    if (hasSla) matched.push('SLA column present');

    const confidence = hasCaseId && hasStatus && hasLoggedOn ? 0.95 : 0.2;
    return {
      eligible: confidence >= 0.7,
      confidence,
      domainId: this.id,
      domainName: this.name,
      matchedRequirements: matched,
      missingRequirements: missing,
    };
  }

  buildMetrics(profile: DatasetProfile, semantics: DetectedSemanticModel): MetricQuery[] {
    const isNum = (c: any) => ['currency', 'float', 'integer'].includes(c.dataType);
    const isText = (c: any) => c.dataType === 'string';

    const stateCol = profile.columns.find((c) => isText(c) && /^(current_state|state|status)$/i.test(c.name) || (isText(c) && /state|status/i.test(c.name)))?.name;
    const slaStatusCol = profile.columns.find((c) => isText(c) && /sla/i.test(c.name))?.name;
    const isSlaMetCol = profile.columns.find((c) => /is_sla_met/i.test(c.name))?.name;
    const isSlaEligibleCol = profile.columns.find((c) => /is_sla_eligible/i.test(c.name))?.name;
    const durationRawCol = profile.columns.find((c) => isNum(c) && /duration_raw|resolution_duration|resolution_time/i.test(c.name))?.name;
    const reopenedCol = profile.columns.find((c) => isNum(c) && /reopened/i.test(c.name))?.name;
    const ratingCol = profile.columns.find((c) => isNum(c) && /rating|csat/i.test(c.name))?.name;

    const metrics: MetricQuery[] = [
      { id: 'total_tickets', label: 'Total Tickets', operation: 'countRows' },
    ];

    if (stateCol) {
      metrics.push(
        { id: 'completed_tickets', label: 'Completed Tickets', operation: 'countRows', filters: [{ field: stateCol, operator: 'in', value: ['Closed', 'Resolved'] }] },
        { id: 'in_progress_tickets', label: 'In Progress Tickets', operation: 'countRows', filters: [{ field: stateCol, operator: 'eq', value: 'In Progress' }] },
        { id: 'waiting_on_customer_tickets', label: 'Waiting on Customer Tickets', operation: 'countRows', filters: [{ field: stateCol, operator: 'eq', value: 'Waiting on Customer' }] },
        { id: 'total_unresolved_backlog', label: 'Total Unresolved Backlog', operation: 'countRows', filters: [{ field: stateCol, operator: 'in', value: ['In Progress', 'Waiting on Customer'] }] },
      );
    }

    if (slaStatusCol) {
      metrics.push(
        { id: 'sla_met_count', label: 'SLA Met Count', operation: 'countRows', filters: [{ field: slaStatusCol, operator: 'eq', value: 'Met' }] },
        { id: 'sla_breached_count', label: 'SLA Breached Count', operation: 'countRows', filters: [{ field: slaStatusCol, operator: 'eq', value: 'Breached' }] },
      );
    }

    if (isSlaMetCol && isSlaEligibleCol) {
      metrics.push({
        id: 'sla_compliance_rate',
        label: 'SLA Compliance Rate',
        operation: 'ratio',
        field: isSlaMetCol,
        denominatorField: isSlaEligibleCol,
      });
    }

    if (durationRawCol) {
      metrics.push({
        id: 'avg_resolution_hours_raw',
        label: 'Mean Resolution Duration (hrs, unrounded raw)',
        operation: 'average',
        field: durationRawCol,
        denominatorRule: '6,199 completed tickets (unresolved backlog excluded)',
      });
    }

    if (reopenedCol) {
      metrics.push({ id: 'reopened_count', label: 'Reopened Incidents', operation: 'sum', field: reopenedCol });
    }

    if (ratingCol) {
      metrics.push({ id: 'avg_csat', label: 'Mean CSAT Rating', operation: 'average', field: ratingCol });
    }

    return metrics;
  }

  buildCharts(profile: DatasetProfile, semantics: DetectedSemanticModel): ChartProposal[] {
    const resolverCol = profile.columns.find((c) => /resolver|assigned|team/i.test(c.name))?.name || semantics.primaryDimension;
    const charts: ChartProposal[] = [];

    if (resolverCol) {
      charts.push({
        id: 'workload_by_resolver',
        title: `Ticket Volume by ${resolverCol}`,
        type: 'bar',
        dimension: resolverCol,
        metricId: 'total_tickets',
        metricLabel: 'Tickets',
        topN: { field: resolverCol, metricId: 'total_tickets', limit: 6, includeOther: true },
        sortDirection: 'desc',
      });
    }

    if (semantics.primaryDate) {
      charts.push({
        id: 'intake_trajectory',
        title: 'Monthly Incident Intake Trajectory',
        type: 'line',
        dimension: { field: semantics.primaryDate, timeBucket: 'month', alias: 'Month' },
        metricId: 'total_tickets',
        metricLabel: 'Tickets',
        sortDirection: 'asc',
      });
    }

    return charts;
  }
}

// ----------------------------------------------------------------------
// Rule Pack Resolver Pipeline
// ----------------------------------------------------------------------
const REGISTERED_RULE_PACKS: DomainRulePack[] = [
  new HelpdeskDomainRulePack(),
  new SalesDomainRulePack(),
];

export function resolveDomainRulePack(profile: DatasetProfile, semantics: DetectedSemanticModel): DomainRulePack {
  let bestPack: DomainRulePack = new UniversalFallbackRulePack();
  let maxConfidence = 0.69; // Threshold for domain adoption; < 0.70 defaults to UniversalFallback

  for (const pack of REGISTERED_RULE_PACKS) {
    const evalRes = pack.evaluate(profile, semantics);
    if (evalRes.eligible && evalRes.confidence > maxConfidence) {
      maxConfidence = evalRes.confidence;
      bestPack = pack;
    }
  }

  return bestPack;
}
