import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import { CHART_COLORS, DEFAULT_GRID_PROPS } from './chartUtils';

interface SentimentDistChartProps {
  data: Array<Record<string, string | number>>;
  height?: number;
  bins?: number;
}

/**
 * Sentiment Score Distribution histogram (binned bar chart).
 * Replaces the backend matplotlib histogram (sentiment_dist.png).
 */
export const SentimentDistChart: React.FC<SentimentDistChartProps> = ({
  data,
  height = 320,
  bins = 15,
}) => {
  const chartData = useMemo(() => {
    const scores = data
      .map((row) => Number(row.sentiment_score))
      .filter((v) => !isNaN(v));

    if (scores.length === 0) return [];

    // Fixed bins from -1 to +1
    const binWidth = 2 / bins;
    const buckets: Record<string, number> = {};

    for (let i = 0; i < bins; i++) {
      const low = -1 + i * binWidth;
      const key = low.toFixed(2);
      buckets[key] = 0;
    }

    scores.forEach((score) => {
      const binIdx = Math.min(Math.floor((score + 1) / binWidth), bins - 1);
      const low = -1 + binIdx * binWidth;
      const key = low.toFixed(2);
      if (buckets[key] !== undefined) buckets[key]++;
      else buckets[key] = 1;
    });

    return Object.entries(buckets).map(([low, count]) => ({
      range: `${Number(low).toFixed(1)}`,
      count,
      rangeNum: Number(low),
    }));
  }, [data, bins]);

  return (
    <div className="chart-container" style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 15, left: -20, bottom: 5 }}>
          <CartesianGrid {...DEFAULT_GRID_PROPS} />
          <XAxis
            dataKey="range"
            stroke="transparent"
            tick={{ fill: CHART_COLORS.textMuted, fontSize: 10 }}
            dy={8}
            interval="preserveStartEnd"
          />
          <YAxis
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
                    <div className="custom-chart-tooltip-title">Sentiment {d.range}</div>
                    <div className="custom-chart-tooltip-list">
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
          <ReferenceLine
            x="0.0"
            stroke={CHART_COLORS.textMuted}
            strokeDasharray="4 3"
            strokeWidth={1}
          />
          <Bar
            dataKey="count"
            fill={CHART_COLORS.success}
            fillOpacity={0.8}
            radius={[3, 3, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SentimentDistChart;
