/**
 * Accessible Chart Adapter
 * Authoritative source: PRD v9.0 Section 07 (U01, U10, U19)
 *
 * Implements accessible, colorblind-safe, multi-theme visual adapters
 * for bar, line, donut, and ranking charts with screen-reader data table alternatives.
 */

import { ChartViewModel } from './dashboardComposer';

export type ChartThemeMode = 'dark' | 'light' | 'print';

export interface ChartPalette {
  primary: string;
  secondary: string;
  accent: string;
  gridLine: string;
  textMuted: string;
  textMain: string;
  cardBg: string;
  cardBorder: string;
  series: string[];
}

export const COLORBLIND_SAFE_PALETTES: Record<ChartThemeMode, ChartPalette> = {
  dark: {
    primary: '#38bdf8',
    secondary: '#818cf8',
    accent: '#009E73',
    gridLine: '#26354A',
    textMuted: '#A8B6C9',
    textMain: '#F4F7FC',
    cardBg: '#111B2E',
    cardBorder: '#26354A',
    series: [
      '#38BDF8', // Sky Blue
      '#818CF8', // Indigo
      '#34D399', // Emerald
      '#FBBF24', // Amber
      '#F87171', // Rose
      '#A78BFA', // Purple
      '#2DD4BF', // Teal
      '#FB923C', // Orange
    ],
  },
  light: {
    primary: '#0284c7',
    secondary: '#4f46e5',
    accent: '#059669',
    gridLine: '#DCE3EC',
    textMuted: '#52637B',
    textMain: '#172033',
    cardBg: '#FFFFFF',
    cardBorder: '#DCE3EC',
    series: [
      '#0284C7', // Sky
      '#4F46E5', // Indigo
      '#059669', // Emerald
      '#D97706', // Amber
      '#E11D48', // Rose
      '#7C3AED', // Purple
      '#0D9488', // Teal
      '#EA580C', // Orange
    ],
  },
  print: {
    primary: '#000000',
    secondary: '#444444',
    accent: '#222222',
    gridLine: '#cccccc',
    textMuted: '#555555',
    textMain: '#000000',
    cardBg: '#ffffff',
    cardBorder: '#000000',
    series: ['#111111', '#444444', '#777777', '#999999', '#bbbbbb', '#222222', '#555555'],
  },
};

export function getChartPalette(theme: ChartThemeMode): ChartPalette {
  return COLORBLIND_SAFE_PALETTES[theme] || COLORBLIND_SAFE_PALETTES.dark;
}

export function formatChartValue(val: number): string {
  if (Math.abs(val) >= 1_000_000) {
    return `${(val / 1_000_000).toLocaleString('en-US', { maximumFractionDigits: 2 })}M`;
  }
  if (Math.abs(val) >= 1_000) {
    return `${(val / 1_000).toLocaleString('en-US', { maximumFractionDigits: 1 })}K`;
  }
  return val.toLocaleString('en-US', { maximumFractionDigits: 2 });
}

export interface AccessibleTableData {
  headers: string[];
  rows: { label: string; value: number; formattedValue: string; percentage: string }[];
}

export function generateAccessibleTableData(chart: ChartViewModel): AccessibleTableData {
  const total = chart.data.reduce((sum, d) => sum + (Number.isFinite(d.value) ? d.value : 0), 0);
  const rows = chart.data.map((d) => {
    const pct = total > 0 ? `${((d.value / total) * 100).toFixed(1)}%` : '0.0%';
    return {
      label: d.label,
      value: d.value,
      formattedValue: formatChartValue(d.value),
      percentage: pct,
    };
  });

  return {
    headers: [chart.dimensionLabel, chart.metricLabel, 'Share %'],
    rows,
  };
}
