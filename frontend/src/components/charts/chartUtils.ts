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
  border: 'var(--border-color)',
  cardBg: 'var(--card-bg)',
} as const;

export const CHART_ANIMATION_DURATION = 800;
export const CHART_HEIGHT_DEFAULT = 320;

export const CHART_ANIMATION_PROPS = {
  isAnimationActive: true,
  animationDuration: 800,
  animationEasing: 'ease-out' as const,
};

export const DEFAULT_CHART_MARGIN = {
  top: 12,
  right: 12,
  left: -16,
  bottom: 4,
} as const;

export const DEFAULT_GRID_PROPS = {
  stroke: 'var(--card-border)',
  strokeDasharray: '4 4',
  vertical: false,
} as const;

export const DEFAULT_AXIS_TICK = {
  fontSize: 12,
  fill: 'var(--text-muted)',
  fontFamily: 'inherit',
} as const;

export const DEFAULT_X_AXIS_PROPS = {
  stroke: 'transparent',
  tickLine: false,
  dy: 8,
  tick: DEFAULT_AXIS_TICK,
} as const;

export const DEFAULT_Y_AXIS_PROPS = {
  stroke: 'transparent',
  tickLine: false,
  dx: -8,
  tick: DEFAULT_AXIS_TICK,
} as const;

export const DEFAULT_TOOLTIP_STYLE = {
  contentStyle: {
    backgroundColor: 'var(--card-bg)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2)',
    color: 'var(--text-primary)',
    fontSize: '0.825rem',
    padding: '8px 12px',
  },
  itemStyle: {
    color: 'var(--text-primary)',
    fontSize: '0.8rem',
    padding: '2px 0',
  },
  labelStyle: {
    color: 'var(--text-secondary)',
    fontWeight: 600,
    fontSize: '0.8rem',
    marginBottom: '4px',
  },
  cursor: {
    stroke: 'var(--brand-primary)',
    strokeWidth: 1,
    strokeDasharray: '3 3',
    fill: 'rgba(99, 102, 241, 0.05)',
  },
} as const;

export const DEFAULT_LEGEND_STYLE = {
  wrapperStyle: {
    paddingTop: '12px',
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
  },
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
