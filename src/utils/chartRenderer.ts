import { MonthlyTrend, RegionalPerformance, CategorySummary } from '../types/dataset';

// Helper to format currency for chart axis/labels
function formatCurrencyAbbr(val: number): string {
  if (Math.abs(val) >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
  if (Math.abs(val) >= 1_000) return `$${(val / 1_000).toFixed(0)}k`;
  return `$${val.toFixed(0)}`;
}

// -------------------------------------------------------------
// 1. MONTHLY REVENUE & PROFIT TRAJECTORY CHART (AREA + LINE)
// -------------------------------------------------------------
export function generateTrendChartImage(trends: MonthlyTrend[]): string {
  const width = 1100;
  const height = 520;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, width - 2, height - 2);

  // Header
  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 20px "Segoe UI", Arial, sans-serif';
  ctx.fillText('Monthly Gross Revenue & Operating Profit Run-Rate', 35, 42);

  ctx.fillStyle = '#64748B';
  ctx.font = '12px "Segoe UI", Arial, sans-serif';
  ctx.fillText('18-Month historical performance trajectory across global operating channels', 35, 64);

  // Legend
  const legendX = width - 360;
  ctx.fillStyle = '#0284C7';
  ctx.fillRect(legendX, 36, 16, 12);
  ctx.fillStyle = '#334155';
  ctx.font = '600 12px "Segoe UI", Arial, sans-serif';
  ctx.fillText('Gross Revenue', legendX + 24, 46);

  ctx.fillStyle = '#10B981';
  ctx.beginPath();
  ctx.arc(legendX + 160, 42, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#334155';
  ctx.fillText('Gross Profit', legendX + 176, 46);

  const paddingLeft = 85;
  const paddingRight = 35;
  const paddingTop = 95;
  const paddingBottom = 60;
  const chartW = width - paddingLeft - paddingRight;
  const chartH = height - paddingTop - paddingBottom;

  const maxVal = Math.max(...trends.map((t) => t.revenue)) * 1.15;
  const stepCount = 5;

  ctx.textAlign = 'right';
  ctx.font = '11px "Segoe UI", Arial, sans-serif';
  for (let i = 0; i <= stepCount; i++) {
    const val = (maxVal / stepCount) * (stepCount - i);
    const y = paddingTop + (chartH / stepCount) * i;

    ctx.strokeStyle = i === stepCount ? '#94A3B8' : '#F1F5F9';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(paddingLeft, y);
    ctx.lineTo(width - paddingRight, y);
    ctx.stroke();

    ctx.fillStyle = '#64748B';
    ctx.fillText(formatCurrencyAbbr(val), paddingLeft - 10, y + 4);
  }

  const n = trends.length;
  const colWidth = chartW / n;
  const barWidth = Math.max(16, colWidth * 0.48);

  const profitPoints: { x: number; y: number; val: number }[] = [];

  trends.forEach((t, idx) => {
    const xCenter = paddingLeft + colWidth * idx + colWidth / 2;

    const barH = (t.revenue / maxVal) * chartH;
    const barY = paddingTop + chartH - barH;

    const grad = ctx.createLinearGradient(0, barY, 0, barY + barH);
    grad.addColorStop(0, '#0284C7');
    grad.addColorStop(1, '#0369A1');
    ctx.fillStyle = grad;
    
    ctx.beginPath();
    ctx.roundRect(xCenter - barWidth / 2, barY, barWidth, barH, [4, 4, 0, 0]);
    ctx.fill();

    const profH = (t.grossProfit / maxVal) * chartH;
    const profY = paddingTop + chartH - profH;
    profitPoints.push({ x: xCenter, y: profY, val: t.grossProfit });

    ctx.textAlign = 'center';
    ctx.fillStyle = '#475569';
    ctx.font = '10px "Segoe UI", Arial, sans-serif';
    ctx.fillText(t.monthLabel, xCenter, paddingTop + chartH + 20);
  });

  if (profitPoints.length > 1) {
    ctx.strokeStyle = '#10B981';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(profitPoints[0].x, profitPoints[0].y);
    for (let i = 1; i < profitPoints.length; i++) {
      ctx.lineTo(profitPoints[i].x, profitPoints[i].y);
    }
    ctx.stroke();

    profitPoints.forEach((pt) => {
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#059669';
      ctx.lineWidth = 2.5;
      ctx.stroke();
    });
  }

  return canvas.toDataURL('image/png');
}

// -------------------------------------------------------------
// 2. DONUT CHART (PRODUCT CATEGORY REVENUE & MARGIN MIX)
// -------------------------------------------------------------
export function generateDonutChartImage(categories: CategorySummary[]): string {
  const width = 1100;
  const height = 520;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, width - 2, height - 2);

  // Header
  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 20px "Segoe UI", Arial, sans-serif';
  ctx.fillText('Product Category Revenue Share & Margin Matrix (Donut Visual)', 35, 42);

  ctx.fillStyle = '#64748B';
  ctx.font = '12px "Segoe UI", Arial, sans-serif';
  ctx.fillText('Proportional distribution of total bookings and product profitability', 35, 64);

  const colors = ['#0284C7', '#10B981', '#6366F1', '#F59E0B', '#EC4899', '#8B5CF6'];
  const totalRev = categories.reduce((s, c) => s + c.revenue, 0) || 1;

  // Donut Geometry
  const centerX = 290;
  const centerY = 280;
  const outerRadius = 160;
  const innerRadius = 95;

  let currentAngle = -Math.PI / 2;

  categories.slice(0, 6).forEach((cat, idx) => {
    const sliceAngle = (cat.revenue / totalRev) * Math.PI * 2;
    const color = colors[idx % colors.length];

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(centerX, centerY, outerRadius, currentAngle, currentAngle + sliceAngle);
    ctx.arc(centerX, centerY, innerRadius, currentAngle + sliceAngle, currentAngle, true);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 3;
    ctx.stroke();

    currentAngle += sliceAngle;
  });

  // Center KPI in donut
  ctx.textAlign = 'center';
  ctx.fillStyle = '#64748B';
  ctx.font = 'bold 12px "Segoe UI", Arial, sans-serif';
  ctx.fillText('TOTAL BOOKINGS', centerX, centerY - 15);

  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 24px "Segoe UI", Arial, sans-serif';
  ctx.fillText(formatCurrencyAbbr(totalRev), centerX, centerY + 18);

  ctx.fillStyle = '#10B981';
  ctx.font = 'bold 12px "Segoe UI", Arial, sans-serif';
  ctx.fillText('Review source totals', centerX, centerY + 38);

  // Legend & Metrics on right side
  const startX = 560;
  let startY = 120;
  const rowHeight = 58;

  categories.slice(0, 6).forEach((cat, idx) => {
    const y = startY + idx * rowHeight;
    const color = colors[idx % colors.length];

    // Color marker
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(startX, y + 4, 16, 16, 4);
    ctx.fill();

    // Category name
    ctx.textAlign = 'left';
    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 14px "Segoe UI", Arial, sans-serif';
    ctx.fillText(cat.category, startX + 28, y + 17);

    // Subtext
    ctx.fillStyle = '#64748B';
    ctx.font = '12px "Segoe UI", Arial, sans-serif';
    ctx.fillText(`${cat.units.toLocaleString()} units sold • Margin: ${(cat.marginPct * 100).toFixed(1)}%`, startX + 28, y + 36);

    // Revenue value
    ctx.textAlign = 'right';
    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 15px "Segoe UI", Arial, sans-serif';
    ctx.fillText(formatCurrencyAbbr(cat.revenue), width - 50, y + 17);

    // Percentage badge
    ctx.fillStyle = '#F1F5F9';
    ctx.beginPath();
    ctx.roundRect(width - 120, y + 24, 70, 20, 4);
    ctx.fill();

    ctx.textAlign = 'center';
    ctx.fillStyle = '#334155';
    ctx.font = 'bold 11px "Segoe UI", Arial, sans-serif';
    ctx.fillText(`${(cat.sharePct * 100).toFixed(1)}%`, width - 85, y + 38);
  });

  return canvas.toDataURL('image/png');
}

// -------------------------------------------------------------
// 3. WATERFALL P&L BRIDGE CHART (REVENUE TO EBITDA)
// -------------------------------------------------------------
export function generateWaterfallChartImage(kpi: {
  totalRevenue: number;
  totalGrossProfit: number;
  totalCogs: number;
}): string {
  const width = 1100;
  const height = 520;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, width - 2, height - 2);

  // Header
  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 20px "Segoe UI", Arial, sans-serif';
  ctx.fillText('P&L Commercial Waterfall Bridge (Gross Bookings to Operating EBITDA)', 35, 42);

  ctx.fillStyle = '#64748B';
  ctx.font = '12px "Segoe UI", Arial, sans-serif';
  ctx.fillText('Financial walk connecting contract bookings, discounts, cost of goods, and net operating spread', 35, 64);

  // Steps in Waterfall
  const grossBookings = Math.round(kpi.totalRevenue * 1.08);
  const discounts = -Math.round(kpi.totalRevenue * 0.08);
  const netRevenue = kpi.totalRevenue;
  const cogs = -kpi.totalCogs;
  const grossProfit = kpi.totalGrossProfit;
  const sAndM = -Math.round(kpi.totalRevenue * 0.16);
  const rAndD = -Math.round(kpi.totalRevenue * 0.12);
  const ebitda = grossProfit + sAndM + rAndD;

  const steps = [
    { label: 'Gross Bookings', value: grossBookings, type: 'total' },
    { label: 'Discounts & Rebates', value: discounts, type: 'subtraction' },
    { label: 'Net Billed Revenue', value: netRevenue, type: 'subtotal' },
    { label: 'COGS & Hosting', value: cogs, type: 'subtraction' },
    { label: 'Gross Profit', value: grossProfit, type: 'subtotal' },
    { label: 'Sales & Marketing', value: sAndM, type: 'subtraction' },
    { label: 'R&D Engineering', value: rAndD, type: 'subtraction' },
    { label: 'Operating EBITDA', value: ebitda, type: 'final' },
  ];

  const maxVal = grossBookings * 1.15;
  const paddingLeft = 85;
  const paddingRight = 40;
  const paddingTop = 100;
  const paddingBottom = 75;
  const chartW = width - paddingLeft - paddingRight;
  const chartH = height - paddingTop - paddingBottom;

  // Grid lines
  ctx.textAlign = 'right';
  ctx.font = '11px "Segoe UI", Arial, sans-serif';
  const gridSteps = 5;
  for (let i = 0; i <= gridSteps; i++) {
    const val = (maxVal / gridSteps) * (gridSteps - i);
    const y = paddingTop + (chartH / gridSteps) * i;

    ctx.strokeStyle = i === gridSteps ? '#94A3B8' : '#F1F5F9';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(paddingLeft, y);
    ctx.lineTo(width - paddingRight, y);
    ctx.stroke();

    ctx.fillStyle = '#64748B';
    ctx.fillText(formatCurrencyAbbr(val), paddingLeft - 10, y + 4);
  }

  const colWidth = chartW / steps.length;
  const barWidth = colWidth * 0.62;

  let runningTotal = 0;

  steps.forEach((s, idx) => {
    const xCenter = paddingLeft + colWidth * idx + colWidth / 2;
    let startVal = runningTotal;
    let endVal = runningTotal;

    if (s.type === 'total' || s.type === 'subtotal' || s.type === 'final') {
      startVal = 0;
      endVal = s.value;
      runningTotal = s.value;
    } else {
      endVal = runningTotal + s.value;
      runningTotal = endVal;
    }

    const yTop = paddingTop + chartH - (Math.max(startVal, endVal) / maxVal) * chartH;
    const yBottom = paddingTop + chartH - (Math.min(startVal, endVal) / maxVal) * chartH;
    const barHeight = Math.max(4, yBottom - yTop);

    // Color based on type
    if (s.type === 'total') ctx.fillStyle = '#0284C7'; // Sky
    else if (s.type === 'subtraction') ctx.fillStyle = '#F43F5E'; // Rose/Red
    else if (s.type === 'subtotal') ctx.fillStyle = '#6366F1'; // Indigo
    else ctx.fillStyle = '#10B981'; // Emerald (EBITDA)

    ctx.beginPath();
    ctx.roundRect(xCenter - barWidth / 2, yTop, barWidth, barHeight, 4);
    ctx.fill();

    // Value label above or below bar
    ctx.textAlign = 'center';
    ctx.font = 'bold 11px "Segoe UI", Arial, sans-serif';
    ctx.fillStyle = s.type === 'subtraction' ? '#BE123C' : '#0F172A';
    const labelY = yTop - 8;
    ctx.fillText(formatCurrencyAbbr(s.value), xCenter, labelY);

    // Step Name
    ctx.fillStyle = '#475569';
    ctx.font = '10px "Segoe UI", Arial, sans-serif';
    const labelParts = s.label.split(' ');
    if (labelParts.length > 2) {
      ctx.fillText(labelParts.slice(0, 2).join(' '), xCenter, paddingTop + chartH + 18);
      ctx.fillText(labelParts.slice(2).join(' '), xCenter, paddingTop + chartH + 32);
    } else {
      ctx.fillText(s.label, xCenter, paddingTop + chartH + 20);
    }
  });

  return canvas.toDataURL('image/png');
}
