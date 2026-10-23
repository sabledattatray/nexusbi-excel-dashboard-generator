import type { HelpdeskMetrics } from '../types/dataset';
export type { HelpdeskMetrics };

/**
 * Parses universal date formats including:
 * - Date instances
 * - Excel date serials
 * - DD-MM-YYYY [HH:MM[:SS]]
 * - DD/MM/YYYY [HH:MM[:SS]]
 * - YYYY-MM-DD [HH:MM[:SS]]
 * - MM/DD/YYYY [HH:MM[:SS]]
 */
export function parseUniversalDate(val: unknown): Date | null {
  if (val === null || val === undefined || val === '') return null;
  if (val instanceof Date) return isNaN(val.getTime()) ? null : val;
  if (typeof val === 'number') {
    if (val > 30000 && val < 65000) {
      // Excel epoch: 1899-12-30
      return new Date(Math.round((val - 25569) * 86400 * 1000));
    }
    return null;
  }
  const s = String(val).trim();
  if (!s || s.length < 4) return null;

  // Match DD-MM-YYYY or DD/MM/YYYY with optional time
  const dmyMatch = s.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/);
  if (dmyMatch) {
    const [, p1, p2, yr, hr, mn, sc] = dmyMatch;
    let day = parseInt(p1, 10);
    let month = parseInt(p2, 10);
    // Disambiguate if month > 12 and day <= 12 (was MM-DD-YYYY)
    if (month > 12 && day <= 12) {
      month = parseInt(p1, 10);
      day = parseInt(p2, 10);
    }
    const year = parseInt(yr, 10);
    const hours = hr ? parseInt(hr, 10) : 0;
    const minutes = mn ? parseInt(mn, 10) : 0;
    const seconds = sc ? parseInt(sc, 10) : 0;
    const d = new Date(Date.UTC(year, month - 1, day, hours, minutes, seconds));
    return isNaN(d.getTime()) ? null : d;
  }

  // Match YYYY-MM-DD or YYYY/MM/DD with optional time
  const ymdMatch = s.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/);
  if (ymdMatch) {
    const [, yr, mo, dy, hr, mn, sc] = ymdMatch;
    const d = new Date(Date.UTC(+yr, +mo - 1, +dy, hr ? +hr : 0, mn ? +mn : 0, sc ? +sc : 0));
    return isNaN(d.getTime()) ? null : d;
  }

  // Only fallback to new Date(s) if string contains a month name and a 4-digit year
  if (/(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i.test(s) && /\d{4}/.test(s)) {
    const d = new Date(s);
    return isNaN(d.getTime()) ? null : d;
  }

  return null;
}

/**
 * Inspects headers and sample rows to determine if the dataset represents
 * IT Helpdesk / Service Desk / Support Ticket Operations.
 */
export function isHelpdeskDomain(headers: string[], rows: Record<string, any>[]): boolean {
  const normHeaders = headers.map((h) => h.toLowerCase().replace(/[^a-z0-9]/g, ''));
  
  // Strong indicators
  const hasCaseOrTicketId = normHeaders.some((h) => /^(caseref|ticketid|incidentid|ticketnumber|caseid|ticketno)$/.test(h));
  const hasLoggedOn = normHeaders.some((h) => /^(loggedon|createdat|openedat|opendate|ticketdate)$/.test(h));
  const hasCurrentState = normHeaders.some((h) => /^(currentstate|ticketstatus|status|incidentstatus|state)$/.test(h));
  const hasResolverOrUrgency = normHeaders.some((h) => /^(resolvergroup|assignedteam|urgencyband|priority|urgency|issuefamily|slalimit.*)$/.test(h));
  
  // Negative check for sales/financial revenue
  const hasSalesFinancial = normHeaders.some((h) => /^(netsales|netrevenue|cogs|grossprofit|unitprice|sellingprice|orderid|sku)$/.test(h));

  if (hasCaseOrTicketId && hasLoggedOn && (hasCurrentState || hasResolverOrUrgency) && !hasSalesFinancial) {
    return true;
  }

  // Value checks
  let supportValueCount = 0;
  const sample = rows.slice(0, 50);
  for (const r of sample) {
    for (const v of Object.values(r)) {
      const valStr = String(v || '').toLowerCase();
      if (/^(closed|resolved|in progress|waiting on customer|escalated)$/.test(valStr)) {
        supportValueCount++;
      }
    }
  }

  return supportValueCount >= 10 && !hasSalesFinancial;
}

export interface DetectedHelpdeskColumns {
  idCol?: string;
  startCol?: string;
  endCol?: string;
  statusCol?: string;
  urgencyCol?: string;
  resolverCol?: string;
  issueCol?: string;
  intakeCol?: string;
  siteCol?: string;
  slaLimitCol?: string;
  reopenedCol?: string;
  ratingCol?: string;
}

export function detectHelpdeskColumns(headers: string[]): DetectedHelpdeskColumns {
  const findCol = (pattern: RegExp) => headers.find((h) => pattern.test(h.trim()));

  return {
    idCol: findCol(/^(case[\s_-]?ref|ticket[\s_-]?id|incident[\s_-]?id|case[\s_-]?number|ticket[\s_-]?no|id)$/i) || headers[0],
    startCol: findCol(/^(logged[\s_-]?on|created[\s_-]?at|opened[\s_-]?at|open[\s_-]?date|start[\s_-]?time|logged[\s_-]?date)$/i),
    endCol: findCol(/^(finished[\s_-]?at|resolved[\s_-]?at|closed[\s_-]?at|end[\s_-]?time|completion[\s_-]?date)$/i),
    statusCol: findCol(/^(current[\s_-]?state|ticket[\s_-]?status|status|state|resolution[\s_-]?status)$/i),
    urgencyCol: findCol(/^(urgency[\s_-]?band|urgency|priority|severity)$/i),
    resolverCol: findCol(/^(resolver[\s_-]?group|assigned[\s_-]?team|support[\s_-]?team|owner[\s_-]?group|resolver)$/i),
    issueCol: findCol(/^(issue[\s_-]?family|category|issue[\s_-]?type|subcategory)$/i),
    intakeCol: findCol(/^(intake[\s_-]?method|channel|source|intake[\s_-]?channel)$/i),
    siteCol: findCol(/^(service[\s_-]?site|site|location|office|hub)$/i),
    slaLimitCol: findCol(/^(sla[\s_-]?limit.*|sla[\s_-]?hours|target[\s_-]?hours|sla)$/i),
    reopenedCol: findCol(/^(reopened[\s_-]?flag|reopened|is[\s_-]?reopened)$/i),
    ratingCol: findCol(/^(customer[\s_-]?rating.*|csat.*|rating|satisfaction)$/i),
  };
}

/**
 * Computes deterministic, auditable Helpdesk / Service Desk metrics
 * from source rows.
 */
export function calculateHelpdeskMetrics(
  rows: Record<string, any>[],
  columnMap?: Partial<DetectedHelpdeskColumns>
): HelpdeskMetrics {
  const headers = Object.keys(rows[0] || {});
  const detected = detectHelpdeskColumns(headers);
  const cols: DetectedHelpdeskColumns = { ...detected, ...columnMap };

  const totalTickets = rows.length;
  let completedTickets = 0;
  let unresolvedTickets = 0;
  let slaMet = 0;
  let slaBreached = 0;
  let reopenedCount = 0;

  const durations: number[] = [];
  const ratings: number[] = [];

  const statusMap = new Map<string, number>();
  const urgencyMap = new Map<string, { count: number; slaLimit: number }>();
  const resolverMap = new Map<
    string,
    { total: number; completed: number; slaMet: number; slaBreached: number; totalDuration: number }
  >();
  const intakeMap = new Map<string, number>();
  const issueMap = new Map<string, number>();
  const siteMap = new Map<string, number>();
  const ratingsMap = new Map<number, number>([
    [1, 0],
    [2, 0],
    [3, 0],
    [4, 0],
    [5, 0],
  ]);
  const monthMap = new Map<
    string,
    { monthLabel: string; ticketCount: number; completedCount: number; slaMetCount: number }
  >();

  for (const r of rows) {
    const status = cols.statusCol ? String(r[cols.statusCol] || '').trim() : 'Completed';
    const isCompleted = /^(closed|resolved)$/i.test(status);

    if (isCompleted) {
      completedTickets++;
    } else {
      unresolvedTickets++;
    }

    // Status distribution
    statusMap.set(status, (statusMap.get(status) || 0) + 1);

    // Timestamps and duration
    const tStart = cols.startCol ? parseUniversalDate(r[cols.startCol]) : null;
    const tEnd = cols.endCol ? parseUniversalDate(r[cols.endCol]) : null;
    const slaLimitVal = cols.slaLimitCol ? parseFloat(String(r[cols.slaLimitCol])) : NaN;
    const slaLimit = !isNaN(slaLimitVal) && slaLimitVal > 0 ? slaLimitVal : 48;

    let durationHours: number | null = null;
    let isSlaMet: boolean | null = null;

    if (isCompleted && tStart && tEnd) {
      const elapsed = (tEnd.getTime() - tStart.getTime()) / (3600 * 1000);
      if (elapsed >= 0) {
        durationHours = elapsed;
        durations.push(elapsed);
        if (elapsed <= slaLimit) {
          slaMet++;
          isSlaMet = true;
        } else {
          slaBreached++;
          isSlaMet = false;
        }
      }
    }

    // Monthly aggregation
    if (tStart) {
      const y = tStart.getUTCFullYear();
      const m = String(tStart.getUTCMonth() + 1).padStart(2, '0');
      const monthKey = `${y}-${m}`;
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthLabel = `${monthNames[tStart.getUTCMonth()]} ${y}`;

      const mEntry = monthMap.get(monthKey) || {
        monthLabel,
        ticketCount: 0,
        completedCount: 0,
        slaMetCount: 0,
      };
      mEntry.ticketCount++;
      if (isCompleted) mEntry.completedCount++;
      if (isSlaMet === true) mEntry.slaMetCount++;
      monthMap.set(monthKey, mEntry);
    }

    // Urgency
    const urgency = cols.urgencyCol ? String(r[cols.urgencyCol] || '').trim() : 'Standard';
    const uEntry = urgencyMap.get(urgency) || { count: 0, slaLimit };
    uEntry.count++;
    urgencyMap.set(urgency, uEntry);

    // Resolver Group
    const resolver = cols.resolverCol ? String(r[cols.resolverCol] || '').trim() : 'Operations';
    const resEntry = resolverMap.get(resolver) || {
      total: 0,
      completed: 0,
      slaMet: 0,
      slaBreached: 0,
      totalDuration: 0,
    };
    resEntry.total++;
    if (isCompleted) {
      resEntry.completed++;
      if (durationHours !== null) {
        resEntry.totalDuration += durationHours;
        if (isSlaMet === true) resEntry.slaMet++;
        else if (isSlaMet === false) resEntry.slaBreached++;
      }
    }
    resolverMap.set(resolver, resEntry);

    // Intake method
    if (cols.intakeCol) {
      const channel = String(r[cols.intakeCol] || '').trim();
      if (channel) intakeMap.set(channel, (intakeMap.get(channel) || 0) + 1);
    }

    // Issue family
    if (cols.issueCol) {
      const issue = String(r[cols.issueCol] || '').trim();
      if (issue) issueMap.set(issue, (issueMap.get(issue) || 0) + 1);
    }

    // Service Site
    if (cols.siteCol) {
      const site = String(r[cols.siteCol] || '').trim();
      if (site) siteMap.set(site, (siteMap.get(site) || 0) + 1);
    }

    // Reopened flag
    if (cols.reopenedCol) {
      const rVal = String(r[cols.reopenedCol] || '').trim();
      if (rVal === '1' || rVal.toLowerCase() === 'true') {
        reopenedCount++;
      }
    }

    // Customer Rating
    if (cols.ratingCol) {
      const ratingStr = String(r[cols.ratingCol] || '').trim();
      if (ratingStr) {
        const ratingNum = parseInt(ratingStr, 10);
        if (!isNaN(ratingNum) && ratingNum >= 1 && ratingNum <= 5) {
          ratings.push(ratingNum);
          ratingsMap.set(ratingNum, (ratingsMap.get(ratingNum) || 0) + 1);
        }
      }
    }
  }

  const slaComplianceRate =
    slaMet + slaBreached > 0 ? slaMet / (slaMet + slaBreached) : 0;
  const meanResolutionHours =
    durations.length > 0
      ? durations.reduce((a, b) => a + b, 0) / durations.length
      : 0;
  const ratingCount = ratings.length;
  const meanRating =
    ratingCount > 0 ? ratings.reduce((a, b) => a + b, 0) / ratingCount : 0;

  // Monthly trend sorted chronologically
  const monthlyTrend = Array.from(monthMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([monthKey, entry]) => ({
      monthKey,
      monthLabel: entry.monthLabel,
      ticketCount: entry.ticketCount,
      completedCount: entry.completedCount,
      slaMetCount: entry.slaMetCount,
      complianceRate:
        entry.completedCount > 0
          ? Math.round((entry.slaMetCount / entry.completedCount) * 10000) / 10000
          : 0,
    }));

  const statusBreakdown = Array.from(statusMap.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([status, count]) => ({
      status,
      count,
      sharePct: totalTickets > 0 ? Math.round((count / totalTickets) * 10000) / 10000 : 0,
    }));

  const urgencyBreakdown = Array.from(urgencyMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([urgency, { count, slaLimit }]) => ({
      urgency,
      count,
      sharePct: totalTickets > 0 ? Math.round((count / totalTickets) * 10000) / 10000 : 0,
      slaLimit,
    }));

  const resolverBreakdown = Array.from(resolverMap.entries())
    .sort((a, b) => b[1].total - a[1].total)
    .map(([resolver, data]) => {
      const assessed = data.slaMet + data.slaBreached;
      return {
        resolver,
        total: data.total,
        completed: data.completed,
        slaMet: data.slaMet,
        slaBreached: data.slaBreached,
        complianceRate: assessed > 0 ? Math.round((data.slaMet / assessed) * 10000) / 10000 : 0,
        avgDurationHours:
          data.completed > 0 ? Math.round((data.totalDuration / data.completed) * 100) / 100 : 0,
      };
    });

  const intakeBreakdown = Array.from(intakeMap.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([channel, count]) => ({
      channel,
      count,
      sharePct: totalTickets > 0 ? Math.round((count / totalTickets) * 10000) / 10000 : 0,
    }));

  const issueBreakdown = Array.from(issueMap.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([issue, count]) => ({
      issue,
      count,
      sharePct: totalTickets > 0 ? Math.round((count / totalTickets) * 10000) / 10000 : 0,
    }));

  const siteBreakdown = Array.from(siteMap.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([site, count]) => ({
      site,
      count,
      sharePct: totalTickets > 0 ? Math.round((count / totalTickets) * 10000) / 10000 : 0,
    }));

  const ratingsBreakdown = [1, 2, 3, 4, 5].map((rating) => {
    const count = ratingsMap.get(rating) || 0;
    return {
      rating,
      count,
      sharePct: ratingCount > 0 ? Math.round((count / ratingCount) * 10000) / 10000 : 0,
    };
  });

  return {
    totalTickets,
    completedTickets,
    unresolvedTickets,
    slaMet,
    slaBreached,
    slaComplianceRate,
    meanResolutionHours,
    reopenedCount,
    ratingCount,
    meanRating,
    monthlyTrend,
    statusBreakdown,
    urgencyBreakdown,
    resolverBreakdown,
    intakeBreakdown,
    issueBreakdown,
    siteBreakdown,
    ratingsBreakdown,
  };
}
