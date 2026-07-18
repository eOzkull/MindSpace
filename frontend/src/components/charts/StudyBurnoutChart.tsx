import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from 'recharts';
import { CHART_COLORS, DEFAULT_GRID_PROPS } from './chartUtils';

interface StudyBurnoutChartProps {
  data: Array<Record<string, string | number>>;
  height?: number;
}

/**
 * Study Hours vs Avg Burnout Score — bar chart binned by study hour brackets.
 * Replaces the backend matplotlib scatter (study_vs_burnout.png).
 */
export const StudyBurnoutChart: React.FC<StudyBurnoutChartProps> = ({ data, height = 320 }) => {
  const chartData = useMemo(() => {
    // Bin study hours into 1-hour buckets and average burnout
    const bins: Record<number, { total: number; count: number }> = {};
    data.forEach((row) => {
      const study = Math.floor(Number(row.study_hours));
      const burnout = Number(row.burnout_score);
      if (!isNaN(study) && !isNaN(burnout)) {
        if (!bins[study]) bins[study] = { total: 0, count: 0 };
        bins[study].total += burnout;
        bins[study].count += 1;
      }
    });

    return Object.entries(bins)
      .map(([hour, { total, count }]) => ({
        hour: `${hour}h`,
        avgBurnout: Math.round(total / count),
        hourNum: Number(hour),
      }))
      .sort((a, b) => a.hourNum - b.hourNum);
  }, [data]);

  return (
    <div className="chart-container" style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 15, left: -20, bottom: 5 }}>
          <CartesianGrid {...DEFAULT_GRID_PROPS} />
          <XAxis
            dataKey="hour"
            stroke="transparent"
            tick={{ fill: CHART_COLORS.textMuted, fontSize: 11 }}
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
                    <div className="custom-chart-tooltip-title">Study Load: {d.hour}</div>
                    <div className="custom-chart-tooltip-list">
                      <div className="custom-chart-tooltip-item">
                        Avg Burnout:
                        <span className="custom-chart-tooltip-value">{d.avgBurnout}/100</span>
                      </div>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="avgBurnout" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => {
              const intensity = entry.avgBurnout / 100;
              const fill = intensity > 0.66
                ? CHART_COLORS.danger
                : intensity > 0.33
                ? CHART_COLORS.info
                : CHART_COLORS.success;
              return <Cell key={`cell-${index}`} fill={fill} fillOpacity={0.85} />;
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StudyBurnoutChart;
