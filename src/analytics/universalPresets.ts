/**
 * Universal Dataset Presets for Zero-AI Analytical Engine
 * Authoritative source: PRD v9.0 Phase 9C/9D
 */

import Papa from 'papaparse';


export interface UniversalPresetInfo {
  id: string;
  name: string;
  industryOrDomain: string;
  rowCount: number;
  description: string;
}

export const UNIVERSAL_PRESET_CATALOG: UniversalPresetInfo[] = [
  {
    id: 'sales',
    name: 'Sales & Commercial Transactions',
    industryOrDomain: 'Commercial MIS & B2B/B2C Sales',
    rowCount: 6000,
    description: '6,000 authenticated commercial transactions across regions, accounts, and categories.',
  },
  {
    id: 'helpdesk',
    name: 'Helpdesk & Service Desk Operations',
    industryOrDomain: 'IT Support & Incident Operations',
    rowCount: 8000,
    description: 'Authoritative 8,000-ticket fixture with SLA thresholds, states, and CSAT ratings.',
  },
  {
    id: 'hr',
    name: 'HR Workforce & Payroll Analytics',
    industryOrDomain: 'Human Resources & Compensation',
    rowCount: 500,
    description: '500 employee records with salaries, bonuses, job titles, and performance ratings.',
  },
  {
    id: 'inventory',
    name: 'Inventory & Warehouse Logistics',
    industryOrDomain: 'Supply Chain & Stock Control',
    rowCount: 400,
    description: '400 industrial SKU balances, unit costs, reorder thresholds, and warehouse sites.',
  },
  {
    id: 'unknown',
    name: 'Adversarial Unknown Dataset (No Dates, Obfuscated)',
    industryOrDomain: 'Unclassified Universal Fallback',
    rowCount: 400,
    description: 'Adversarial structure with no date dimensions, synthetic column codes, and mixed nulls.',
  },
];

export async function loadUniversalDataset(id: string): Promise<{
  name: string;
  headers: string[];
  rows: Record<string, any>[];
}> {
  if (id === 'sales' || id === 'ecommerce') {
    // 1. Try loading 5,000-row canonical e-commerce dataset
    try {
      if (typeof window !== 'undefined') {
        const res = await fetch('/datasets/ecommerce_sales_5k.csv');
        if (res.ok) {
          const text = await res.text();
          const parsed = Papa.parse(text, { header: true, skipEmptyLines: 'greedy' });
          const headers = (parsed.meta.fields || []).map((h) => h.replace(/^\ufeff/, '').trim()).filter(Boolean);
          const rows = (parsed.data as Record<string, any>[]).filter((r) =>
            Object.values(r).some((v) => v !== null && v !== undefined && v !== '')
          );
          return { name: 'E-Commerce Sales & Revenue Operations', headers, rows };
        }
      } else {
        const fs = await import('node:fs');
        const path = await import('node:path');
        const p = path.resolve(process.cwd(), 'public/datasets/ecommerce_sales_5k.csv');
        if (fs.existsSync(p)) {
          const text = fs.readFileSync(p, 'utf8');
          const parsed = Papa.parse(text, { header: true, skipEmptyLines: 'greedy' });
          const headers = (parsed.meta.fields || []).map((h) => h.replace(/^\ufeff/, '').trim()).filter(Boolean);
          const rows = (parsed.data as Record<string, any>[]).filter((r) =>
            Object.values(r).some((v) => v !== null && v !== undefined && v !== '')
          );
          return { name: 'E-Commerce Sales & Revenue Operations', headers, rows };
        }
      }
    } catch {
      // Fallback to legacy sales_6k if ecommerce_sales_5k is unavailable
    }

    try {
      const res = await fetch('/datasets/sales_6k.csv');
      if (res.ok) {
        const text = await res.text();
        const parsed = Papa.parse(text, { header: true, skipEmptyLines: 'greedy' });
        const headers = (parsed.meta.fields || []).map((h) => h.replace(/^\ufeff/, '').trim()).filter(Boolean);
        const rows = (parsed.data as Record<string, any>[]).filter((r) =>
          Object.values(r).some((v) => v !== null && v !== undefined && v !== '')
        );
        return { name: 'Sales & Commercial Transactions', headers, rows };
      }
    } catch {
      // Fallback below
    }
  }

  if (id === 'helpdesk') {
    try {
      // In browser, fetch from static asset
      const res = await fetch('/datasets/customer_support_tickets_8k.csv');
      if (res.ok) {
        const text = await res.text();
        const parsed = Papa.parse(text, { header: true, skipEmptyLines: 'greedy' });
        const headers = (parsed.meta.fields || []).map((h) => h.replace(/^\ufeff/, '').trim()).filter(Boolean);
        const rows = (parsed.data as Record<string, any>[]).filter((r) =>
          Object.values(r).some((v) => v !== null && v !== undefined && v !== '')
        );
        for (const r of rows) {
          const state = String(r['Current State'] || '').trim().toLowerCase();
          if (state === 'closed' || state === 'resolved') {
            const startStr = String(r['Logged On'] || '').trim();
            const endStr = String(r['Finished At'] || '').trim();
            const m0 = startStr.match(/^(\d{1,2})-(\d{1,2})-(\d{4})\s+(\d{1,2}):(\d{2})$/);
            const m1 = endStr.match(/^(\d{1,2})-(\d{1,2})-(\d{4})\s+(\d{1,2}):(\d{2})$/);
            if (m0 && m1) {
              const d0 = new Date(Date.UTC(+m0[3], +m0[2] - 1, +m0[1], +m0[4], +m0[5]));
              const d1 = new Date(Date.UTC(+m1[3], +m1[2] - 1, +m1[1], +m1[4], +m1[5]));
              r['Resolution_Duration_Hours'] = (d1.getTime() - d0.getTime()) / 3600000;
            } else {
              r['Resolution_Duration_Hours'] = null;
            }
          } else {
            r['Resolution_Duration_Hours'] = null;
          }
        }
        if (!headers.includes('Resolution_Duration_Hours')) {
          headers.push('Resolution_Duration_Hours');
        }

        return { name: 'Helpdesk & Service Desk Operations', headers, rows };
      }
    } catch {
      // Fallback if running outside browser
    }
  }

  if (id === 'hr') {
    const depts = ['Engineering', 'Marketing', 'Sales', 'Human Resources', 'Finance', 'Legal'];
    const titles = ['Analyst', 'Specialist', 'Manager', 'Senior Engineer', 'Director', 'VP'];
    const statuses = ['Active', 'On Leave', 'Active', 'Active', 'Terminated'];
    const rows: Record<string, any>[] = [];

    for (let i = 1; i <= 500; i++) {
      const salary = 50000 + ((i * 137) % 95000);
      const bonus = Math.round(salary * 0.12);
      const m = (i % 12) + 1;
      const d = (i % 28) + 1;
      rows.push({
        Emp_ID: `EMP-${String(i).padStart(5, '0')}`,
        Full_Name: `Employee ${i}`,
        Department: depts[i % depts.length],
        Job_Title: titles[i % titles.length],
        Annual_Salary: salary,
        Bonus_Amount: bonus,
        Hire_Date: `202${(i % 4) + 1}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
        Performance_Rating: (i % 5) + 1,
        Employment_Status: statuses[i % statuses.length],
      });
    }
    const headers = Object.keys(rows[0] || {});
    return { name: 'HR Workforce & Payroll Analytics', headers, rows };
  }

  if (id === 'inventory') {
    const categories = ['Hardware', 'Fasteners', 'Electronics', 'Packaging', 'Raw Metals', 'Hydraulics'];
    const whs = ['WH-North', 'WH-South', 'WH-East', 'WH-West', 'Central-Depot'];
    const rows: Record<string, any>[] = [];

    for (let i = 1; i <= 400; i++) {
      const qty = (i * 23) % 1500;
      const reorder = 200;
      const cost = Math.round((12.5 + ((i * 7) % 85)) * 100) / 100;
      rows.push({
        SKU_Code: `SKU-${String(i).padStart(6, '0')}`,
        Item_Description: `Industrial Component Part ${i}`,
        Product_Category: categories[i % categories.length],
        Warehouse_Site: whs[i % whs.length],
        Unit_Cost: cost,
        Stock_On_Hand: qty,
        Reorder_Threshold: reorder,
        Is_Understocked: qty < reorder ? 'Yes' : 'No',
      });
    }
    const headers = Object.keys(rows[0] || {});
    return { name: 'Inventory & Warehouse Logistics', headers, rows };
  }

  // Fallback: Adversarial Unknown
  const categories = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon'];
  const rows: Record<string, any>[] = [];

  for (let i = 1; i <= 400; i++) {
    const isDup = i > 400 - 10;
    const idx = isDup ? 1 : i;
    const hasNull = i % 7 === 0;

    rows.push({
      COL_ALPHA: `ID-${String(idx).padStart(4, '0')}`,
      COL_BETA: categories[idx % categories.length],
      COL_GAMMA: hasNull ? null : Math.round(((idx * 13.7) % 450) * 10) / 10,
      COL_DELTA: (idx * 3) % 50,
      COL_EPSILON: idx % 2 === 0 ? 'STATUS_OK' : 'STATUS_FLAG',
      COL_ZETA: hasNull ? '' : `Code_${idx % 10}`,
    });
  }
  const headers = Object.keys(rows[0] || {});
  return { name: 'Adversarial Unknown Dataset (No Dates, Obfuscated Headers)', headers, rows };
}
