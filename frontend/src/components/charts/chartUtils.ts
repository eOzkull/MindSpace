
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

export const DEFAULT_GRID_PROPS = {
  stroke: 'var(--card-border)',
  strokeDasharray: '4 4',
  vertical: false,
} as const;

export const DEFAULT_X_AXIS_PROPS = {
  stroke: 'transparent',
  tickLine: false,
  dy: 8,
} as const;

export const DEFAULT_Y_AXIS_PROPS = {
  stroke: 'transparent',
  tickLine: false,
  dx: -8,
} as const;

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
