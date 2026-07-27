import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { CHART_COLORS, DEFAULT_GRID_PROPS } from './chartUtils';

interface StressBarChartProps {
  data: Array<Record<string, string | number>>;
}

export const StressBarChart: React.FC<StressBarChartProps> = ({ data }) => {
  const chartData = useMemo(() => {
    const stressGroups: Record<number, { count: number; totalBurnout: number; totalSleep: number }> = {};
    for (let i = 1; i <= 10; i++) {
      stressGroups[i] = { count: 0, totalBurnout: 0, totalSleep: 0 };
    }

    data.forEach((row) => {
      const stress = Number(row.stress_level);
      if (!isNaN(stress) && stress >= 1 && stress <= 10) {
        stressGroups[stress].count++;
        stressGroups[stress].totalBurnout += Number(row.burnout_score) || 0;
        stressGroups[stress].totalSleep += Number(row.sleep_hours) || 0;
      }
    });

    return Object.entries(stressGroups).map(([stress, info]) => ({
      stress: `Lvl ${stress}`,
      burnout: info.count > 0 ? Math.round(info.totalBurnout / info.count) : 0,
      sleep: info.count > 0 ? Number((info.totalSleep / info.count).toFixed(1)) : 0,
    }));
  }, [data]);

  return (
    <div className="chart-container" style={{ width: '100%', height: 320 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 15, right: -10, left: -20, bottom: 5 }}
        >
          <CartesianGrid {...DEFAULT_GRID_PROPS} />
          <XAxis
            dataKey="stress"
            stroke="transparent"
            tick={{ fill: CHART_COLORS.textMuted, fontSize: 11 }}
            dy={8}
          />
          {/* Left Y-axis for Burnout (0 - 100) */}
          <YAxis
            yAxisId="left"
            orientation="left"
            domain={[0, 100]}
            stroke="transparent"
            tick={{ fill: CHART_COLORS.textMuted, fontSize: 11 }}
            dx={-8}
          />
          {/* Right Y-axis for Sleep (0 - 10) */}
          <YAxis
            yAxisId="right"
            orientation="right"
            domain={[0, 10]}
            stroke="transparent"
            tick={{ fill: CHART_COLORS.textMuted, fontSize: 11 }}
            dx={8}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload;
                return (
                  <div className="custom-chart-tooltip">
                    <div className="custom-chart-tooltip-title">Stress Level: {item.stress}</div>
                    <div className="custom-chart-tooltip-list">
                      <div className="custom-chart-tooltip-item">
                        <span
                          className="custom-chart-tooltip-marker"
                          style={{ backgroundColor: CHART_COLORS.primary }}
                        />
                        Avg Burnout:
                        <span className="custom-chart-tooltip-value">{item.burnout}/100</span>
                      </div>
                      <div className="custom-chart-tooltip-item">
                        <span
                          className="custom-chart-tooltip-marker"
                          style={{ backgroundColor: CHART_COLORS.secondary }}
                        />
                        Avg Sleep:
                        <span className="custom-chart-tooltip-value">{item.sleep} hrs</span>
                      </div>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend
            verticalAlign="top"
            height={36}
            content={() => (
              <ul className="custom-chart-legend" style={{ margin: 0 }}>
                <li className="custom-chart-legend-item">
                  <span
                    className="custom-chart-legend-marker"
                    style={{ backgroundColor: CHART_COLORS.primary }}
                  />
                  Avg Burnout (Left Axis)
                </li>
                <li className="custom-chart-legend-item">
                  <span
                    className="custom-chart-legend-marker"
                    style={{ backgroundColor: CHART_COLORS.secondary }}
                  />
                  Avg Sleep Hours (Right Axis)
                </li>
              </ul>
            )}
          />
          <Bar
            yAxisId="left"
            dataKey="burnout"
            fill={CHART_COLORS.primary}
            radius={[4, 4, 0, 0]}
            maxBarSize={40}
          />
          <Bar
            yAxisId="right"
            dataKey="sleep"
            fill={CHART_COLORS.secondary}
            radius={[4, 4, 0, 0]}
            maxBarSize={40}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StressBarChart;
