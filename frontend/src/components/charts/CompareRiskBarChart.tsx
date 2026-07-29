import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CHART_COLORS, DEFAULT_GRID_PROPS, DEFAULT_X_AXIS_PROPS, DEFAULT_Y_AXIS_PROPS, DEFAULT_TOOLTIP_STYLE } from './chartUtils';

interface CompareRiskBarChartProps {
  statsA: { low_risk: number; medium_risk: number; high_risk: number };
  statsB: { low_risk: number; medium_risk: number; high_risk: number };
  labelA: string;
  labelB: string;
  height?: number;
}

export const CompareRiskBarChart: React.FC<CompareRiskBarChartProps> = ({ statsA, statsB, labelA, labelB, height = 320 }) => {
  const data = [
    { name: 'Low', [labelA]: statsA.low_risk, [labelB]: statsB.low_risk },
    { name: 'Medium', [labelA]: statsA.medium_risk, [labelB]: statsB.medium_risk },
    { name: 'High', [labelA]: statsA.high_risk, [labelB]: statsB.high_risk },
  ];

  return (
    <div className="chart-container" style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 12, right: 15, left: -20, bottom: 4 }}>
          <CartesianGrid {...DEFAULT_GRID_PROPS} />
          <XAxis {...DEFAULT_X_AXIS_PROPS} dataKey="name" />
          <YAxis {...DEFAULT_Y_AXIS_PROPS} />
          <Tooltip
            cursor={DEFAULT_TOOLTIP_STYLE.cursor}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="custom-chart-tooltip">
                    <div className="custom-chart-tooltip-title">{payload[0].payload.name} Risk Tier</div>
                    <div className="custom-chart-tooltip-list">
                      {payload.map((entry, idx) => (
                        <div className="custom-chart-tooltip-item" key={idx}>
                          <span className="custom-chart-tooltip-marker" style={{ backgroundColor: entry.color }} />
                          {entry.name}: <span className="custom-chart-tooltip-value">{entry.value}</span>
                        </div>
                      ))}
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
              <ul className="custom-chart-legend" style={{ margin: 0, justifyContent: 'center' }}>
                <li className="custom-chart-legend-item">
                  <span className="custom-chart-legend-marker" style={{ backgroundColor: CHART_COLORS.info }} />
                  {labelA}
                </li>
                <li className="custom-chart-legend-item">
                  <span className="custom-chart-legend-marker" style={{ backgroundColor: CHART_COLORS.warning }} />
                  {labelB}
                </li>
              </ul>
            )}
          />
          <Bar dataKey={labelA} fill={CHART_COLORS.info} radius={[4, 4, 0, 0]} maxBarSize={45} />
          <Bar dataKey={labelB} fill={CHART_COLORS.warning} radius={[4, 4, 0, 0]} maxBarSize={45} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CompareRiskBarChart;
