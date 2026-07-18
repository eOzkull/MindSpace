import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ErrorBar,
  ResponsiveContainer,
} from 'recharts';
import { CHART_COLORS, DEFAULT_GRID_PROPS } from './chartUtils';

interface BurnoutBoxChartProps {
  data: Array<Record<string, string | number>>;
  height?: number;
}

export const BurnoutBoxChart: React.FC<BurnoutBoxChartProps> = ({ data, height = 320 }) => {
  const chartData = useMemo(() => {
    const tiers = ['Low', 'Medium', 'High'] as const;
    return tiers.map((tier) => {
      const scores = data
        .filter((row) => String(row.risk) === tier)
        .map((row) => Number(row.burnout_score))
        .filter((v) => !isNaN(v));

      if (scores.length === 0) return { tier, mean: 0, stdDev: 0, count: 0 };

      const mean = scores.reduce((s, v) => s + v, 0) / scores.length;
      const variance = scores.reduce((s, v) => s + (v - mean) ** 2, 0) / scores.length;
      const stdDev = Math.sqrt(variance);

      return {
        tier,
        mean: Math.round(mean * 10) / 10,
        stdDev: Math.round(stdDev * 10) / 10,
        count: scores.length,
      };
    });
  }, [data]);

  const TIER_COLORS: Record<string, string> = {
    Low: CHART_COLORS.success,
    Medium: CHART_COLORS.info,
    High: CHART_COLORS.danger,
  };

  return (
    <div className="chart-container" style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 15, left: -20, bottom: 5 }}>
          <CartesianGrid {...DEFAULT_GRID_PROPS} />
          <XAxis
            dataKey="tier"
            stroke="transparent"
            tick={{ fill: CHART_COLORS.textMuted, fontSize: 12 }}
            dy={8}
          />
          <YAxis
            domain={[0, 100]}
            stroke="transparent"
            tick={{ fill: CHART_COLORS.textMuted, fontSize: 11 }}
            dx={-8}
          />
          <Tooltip
            cursor={{ fill: 'var(--card-border)', opacity: 0.4 }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const d = payload[0].payload;
                return (
                  <div className="custom-chart-tooltip">
                    <div className="custom-chart-tooltip-title">{d.tier} Risk Tier</div>
                    <div className="custom-chart-tooltip-list">
                      <div className="custom-chart-tooltip-item">
                        Mean Burnout:<span className="custom-chart-tooltip-value">{d.mean}/100</span>
                      </div>
                      <div className="custom-chart-tooltip-item">
                        Std Dev:<span className="custom-chart-tooltip-value">±{d.stdDev}</span>
                      </div>
                      <div className="custom-chart-tooltip-item">
                        Students:<span className="custom-chart-tooltip-value">{d.count}</span>
                      </div>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="mean" radius={[6, 6, 0, 0]}>
            <ErrorBar dataKey="stdDev" width={6} strokeWidth={2} stroke="var(--text-muted)" />
            {chartData.map((entry, i) => (
              <Cell key={`cell-${i}`} fill={TIER_COLORS[entry.tier]} fillOpacity={0.85} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BurnoutBoxChart;
