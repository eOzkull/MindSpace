import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { CHART_COLORS, DEFAULT_GRID_PROPS } from './chartUtils';

interface CompareBoxChartProps {
  dataA: Array<{ burnout_score?: number | string }>;
  dataB: Array<{ burnout_score?: number | string }>;
  labelA: string;
  labelB: string;
  height?: number;
}

export const CompareBoxChart: React.FC<CompareBoxChartProps> = ({ dataA, dataB, labelA, labelB, height = 320 }) => {
  const stats = useMemo(() => {
    const getStats = (data: any[], label: string) => {
      const scores = data.map(d => Number(d.burnout_score)).filter(v => !isNaN(v)).sort((a, b) => a - b);
      if (scores.length === 0) return { label, min: 0, q1: 0, median: 0, q3: 0, max: 0, mean: 0 };
      
      const min = scores[0];
      const max = scores[scores.length - 1];
      const mean = scores.reduce((sum, v) => sum + v, 0) / scores.length;
      
      const getPercentile = (p: number) => {
        const pos = (scores.length - 1) * p;
        const base = Math.floor(pos);
        const rest = pos - base;
        if (scores[base + 1] !== undefined) {
          return scores[base] + rest * (scores[base + 1] - scores[base]);
        } else {
          return scores[base];
        }
      };

      const q1 = getPercentile(0.25);
      const median = getPercentile(0.5);
      const q3 = getPercentile(0.75);

      return {
        label,
        min: Math.round(min * 10) / 10,
        q1: Math.round(q1 * 10) / 10,
        median: Math.round(median * 10) / 10,
        q3: Math.round(q3 * 10) / 10,
        max: Math.round(max * 10) / 10,
        mean: Math.round(mean * 10) / 10,
      };
    };

    return [getStats(dataA, labelA), getStats(dataB, labelB)];
  }, [dataA, dataB, labelA, labelB]);

  const chartData = [
    {
      name: labelA,
      min: stats[0].min,
      q1: stats[0].q1,
      median: stats[0].median,
      q3: stats[0].q3,
      max: stats[0].max,
      iqr: stats[0].q3 - stats[0].q1,
      color: '#4facfe',
    },
    {
      name: labelB,
      min: stats[1].min,
      q1: stats[1].q1,
      median: stats[1].median,
      q3: stats[1].q3,
      max: stats[1].max,
      iqr: stats[1].q3 - stats[1].q1,
      color: '#ff9f43',
    }
  ];

  return (
    <div className="chart-container" style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 15, right: 15, left: -20, bottom: 5 }}>
          <CartesianGrid {...DEFAULT_GRID_PROPS} />
          <XAxis dataKey="name" stroke="transparent" tick={{ fill: CHART_COLORS.textMuted, fontSize: 11 }} dy={8} />
          <YAxis domain={[0, 100]} stroke="transparent" tick={{ fill: CHART_COLORS.textMuted, fontSize: 11 }} dx={-8} />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const d = payload[0].payload;
                return (
                  <div className="custom-chart-tooltip">
                    <div className="custom-chart-tooltip-title">{d.name} Spread</div>
                    <div className="custom-chart-tooltip-list">
                      <div className="custom-chart-tooltip-item">
                        Max: <span className="custom-chart-tooltip-value">{d.max}/100</span>
                      </div>
                      <div className="custom-chart-tooltip-item">
                        Q3 (75%): <span className="custom-chart-tooltip-value">{d.q3}/100</span>
                      </div>
                      <div className="custom-chart-tooltip-item">
                        Median: <span className="custom-chart-tooltip-value">{d.median}/100</span>
                      </div>
                      <div className="custom-chart-tooltip-item">
                        Q1 (25%): <span className="custom-chart-tooltip-value">{d.q1}/100</span>
                      </div>
                      <div className="custom-chart-tooltip-item">
                        Min: <span className="custom-chart-tooltip-value">{d.min}/100</span>
                      </div>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="q1" stackId="stack" fill="transparent" />
          <Bar dataKey="iqr" stackId="stack" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, idx) => (
              <Cell key={idx} fill={entry.color} fillOpacity={0.7} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CompareBoxChart;
