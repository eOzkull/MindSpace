/**
 * Common color theme mappings that match the CSS design variables.
 * Recharts SVG properties (fill, stroke) can accept these variables directly
 * to automatically adapt to light/dark mode changes.
 */
export const CHART_COLORS = {
  primary: 'var(--brand-primary)',
  secondary: 'var(--brand-secondary)',
  success: 'var(--success)',
  warning: 'var(--warning)',
  danger: 'var(--danger)',
  info: 'var(--info)',
  textPrimary: 'var(--text-primary)',
  textSecondary: 'var(--text-secondary)',
  textMuted: 'var(--text-muted)',
  border: 'var(--card-border)',
  cardBg: 'var(--card-bg)',
} as const;

/**
 * Standard configuration properties for Recharts grid lines
 */
export const DEFAULT_GRID_PROPS = {
  stroke: 'var(--card-border)',
  strokeDasharray: '4 4',
  vertical: false,
} as const;

/**
 * Standard configuration properties for Recharts X Axis ticks
 */
export const DEFAULT_X_AXIS_PROPS = {
  stroke: 'transparent',
  tickLine: false,
  dy: 8,
} as const;

/**
 * Standard configuration properties for Recharts Y Axis ticks
 */
export const DEFAULT_Y_AXIS_PROPS = {
  stroke: 'transparent',
  tickLine: false,
  dx: -8,
} as const;

/**
 * Utility for formatting large numbers inside tooltips or axes
 */
export const formatChartValue = (value: number | string): string => {
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    if (isNaN(parsed)) return value;
    value = parsed;
  }
  
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }
  return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
};
