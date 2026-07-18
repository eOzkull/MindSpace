import React, { useMemo } from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import { CHART_COLORS, DEFAULT_GRID_PROPS } from './chartUtils';

interface StressSleepChartProps {
  data: Array<Record<string, string | number>>;
  height?: number;
}

export const StressSleepChart: React.FC<StressSleepChartProps> = ({ data, height = 320 }) => {
  const chartData = useMemo(() => {
    return data
      .map((row) => ({
        stress: Number(row.stress_level),
        sleep: Number(row.sleep_hours),
        risk: String(row.risk || 'Low'),
      }))
      .filter((d) => !isNaN(d.stress) && !isNaN(d.sleep));
  }, [data]);

  // Compute simple linear regression for trendline
  const trendPoints = useMemo(() => {
    if (chartData.length < 2) return [];
    const n = chartData.length;
    const sumX = chartData.reduce((s, d) => s + d.stress, 0);
    const sumY = chartData.reduce((s, d) => s + d.sleep, 0);
    const sumXY = chartData.reduce((s, d) => s + d.stress * d.sleep, 0);
    const sumX2 = chartData.reduce((s, d) => s + d.stress * d.stress, 0);
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    return [1, 10].map((x) => ({ stress: x, trend: Math.round((slope * x + intercept) * 10) / 10 }));
  }, [chartData]);

  return (
    <div className="chart-container" style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 10, right: 15, left: -20, bottom: 5 }}>
          <CartesianGrid {...DEFAULT_GRID_PROPS} />
          <XAxis
            type="number"
            dataKey="stress"
            name="Stress"
            domain={[1, 10]}
            tickCount={10}
            stroke="transparent"
            tick={{ fill: CHART_COLORS.textMuted, fontSize: 11 }}
            dy={8}
          />
          <YAxis
            type="number"
            dataKey="sleep"
            name="Sleep"
            domain={[3, 12]}
            unit="h"
            stroke="transparent"
            tick={{ fill: CHART_COLORS.textMuted, fontSize: 11 }}
            dx={-8}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const d = payload[0].payload;
                return (
                  <div className="custom-chart-tooltip">
                    <div className="custom-chart-tooltip-title">Student</div>
                    <div className="custom-chart-tooltip-list">
                      <div className="custom-chart-tooltip-item">
                        Stress Level:<span className="custom-chart-tooltip-value">{d.stress}/10</span>
                      </div>
                      <div className="custom-chart-tooltip-item">
                        Sleep Hours:<span className="custom-chart-tooltip-value">{d.sleep}h</span>
                      </div>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Scatter name="Students" data={chartData} fillOpacity={0.7}>
            {chartData.map((entry, i) => {
              const fill =
                entry.risk === 'High'
                  ? CHART_COLORS.danger
                  : entry.risk === 'Medium'
                    ? CHART_COLORS.info
                    : CHART_COLORS.success;
              return <Cell key={`c-${i}`} fill={fill} />;
            })}
          </Scatter>
          {/* Trend line approximated via reference segment */}
          {trendPoints.length === 2 && (
            <ReferenceLine
              segment={[
                { x: trendPoints[0].stress, y: trendPoints[0].trend },
                { x: trendPoints[1].stress, y: trendPoints[1].trend },
              ]}
              stroke={CHART_COLORS.danger}
              strokeDasharray="5 4"
              strokeWidth={1.5}
            />
          )}
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StressSleepChart;
