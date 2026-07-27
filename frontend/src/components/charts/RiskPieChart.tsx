import React, { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { CHART_COLORS } from './chartUtils';

interface RiskPieChartProps {
  data: Array<Record<string, string | number>>;
}

export const RiskPieChart: React.FC<RiskPieChartProps> = ({ data }) => {
  const chartData = useMemo(() => {
    const counts = { Low: 0, Medium: 0, High: 0 };
    data.forEach((row) => {
      const risk = String(row.risk || '').trim();
      if (risk === 'Low') counts.Low++;
      else if (risk === 'Medium') counts.Medium++;
      else if (risk === 'High') counts.High++;
    });

    return [
      { name: 'Low Risk', value: counts.Low, color: CHART_COLORS.success },
      { name: 'Medium Risk', value: counts.Medium, color: CHART_COLORS.info },
      { name: 'High Risk', value: counts.High, color: CHART_COLORS.danger },
    ].filter((item) => item.value > 0);
  }, [data]);

  return (
    <div className="chart-container" style={{ width: '100%', height: 320 }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0];
                return (
                  <div className="custom-chart-tooltip">
                    <div className="custom-chart-tooltip-title">{item.name}</div>
                    <div className="custom-chart-tooltip-list">
                      <div className="custom-chart-tooltip-item">
                        <span
                          className="custom-chart-tooltip-marker"
                          style={{ backgroundColor: item.payload.color }}
                        />
                        Students:
                        <span className="custom-chart-tooltip-value">{item.value}</span>
                      </div>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            innerRadius={60}
            paddingAngle={4}
            label={({ name, percent }) => `${name}: ${percent !== undefined ? (percent * 100).toFixed(0) : 0}%`}
            labelLine={{ stroke: CHART_COLORS.border, strokeWidth: 1 }}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RiskPieChart;
