import React, { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { CHART_COLORS, DEFAULT_GRID_PROPS } from './chartUtils';

interface BurnoutAreaChartProps {
  data: Array<Record<string, string | number>>;
}

export const BurnoutAreaChart: React.FC<BurnoutAreaChartProps> = ({ data }) => {
  const chartData = useMemo(() => {
    // Initialize 20 bins of size 5 (from 0 to 100)
    const bins = Array.from({ length: 20 }, (_, i) => {
      const start = i * 5;
      const end = start + 4;
      return {
        range: `${start}-${end}`,
        count: 0,
        minVal: start,
      };
    });

    data.forEach((row) => {
      const score = Number(row.burnout_score);
      if (!isNaN(score)) {
        const binIdx = Math.min(19, Math.floor(score / 5));
        bins[binIdx].count++;
      }
    });

    return bins;
  }, [data]);

  return (
    <div className="chart-container" style={{ width: '100%', height: 320 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="burnoutGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.4} />
              <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid {...DEFAULT_GRID_PROPS} />
          <XAxis
            dataKey="range"
            stroke="transparent"
            tick={{ fill: CHART_COLORS.textMuted, fontSize: 11 }}
            dy={8}
          />
          <YAxis
            stroke="transparent"
            tick={{ fill: CHART_COLORS.textMuted, fontSize: 11 }}
            dx={-8}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload;
                return (
                  <div className="custom-chart-tooltip">
                    <div className="custom-chart-tooltip-title">Burnout range: {item.range}</div>
                    <div className="custom-chart-tooltip-list">
                      <div className="custom-chart-tooltip-item">
                        <span
                          className="custom-chart-tooltip-marker"
                          style={{ backgroundColor: CHART_COLORS.primary }}
                        />
                        Students:
                        <span className="custom-chart-tooltip-value">{item.count}</span>
                      </div>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Area
            type="monotone"
            dataKey="count"
            stroke={CHART_COLORS.primary}
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#burnoutGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BurnoutAreaChart;
