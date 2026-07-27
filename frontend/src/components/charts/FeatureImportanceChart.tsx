import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { CHART_COLORS, DEFAULT_GRID_PROPS, DEFAULT_X_AXIS_PROPS, DEFAULT_Y_AXIS_PROPS, formatChartValue } from './chartUtils';

export interface FeatureImportanceData {
  feature: string;
  importance: number;
  color?: string;
}

interface FeatureImportanceChartProps {
  data: FeatureImportanceData[];
  height?: number;
}

export const FeatureImportanceChart: React.FC<FeatureImportanceChartProps> = ({ data, height = 320 }) => {
  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => a.importance - b.importance);
  }, [data]);

  return (
    <div className="chart-container" style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={sortedData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid {...DEFAULT_GRID_PROPS} horizontal={true} vertical={false} />
          <XAxis 
            type="number" 
            {...DEFAULT_X_AXIS_PROPS} 
            tickFormatter={(val) => formatChartValue(val)} 
            tick={{ fill: CHART_COLORS.textMuted, fontSize: 11 }}
          />
          <YAxis 
            type="category" 
            dataKey="feature" 
            {...DEFAULT_Y_AXIS_PROPS}
            width={120}
            tick={{ fill: CHART_COLORS.textSecondary, fontSize: 12 }}
          />
          <Tooltip
            cursor={{ fill: 'var(--card-border)', opacity: 0.4 }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const itemData = payload[0].payload as FeatureImportanceData;
                return (
                  <div className="custom-chart-tooltip">
                    <div className="custom-chart-tooltip-title">{itemData.feature}</div>
                    <div className="custom-chart-tooltip-list">
                      <div className="custom-chart-tooltip-item">
                        <span 
                          className="custom-chart-tooltip-marker" 
                          style={{ backgroundColor: itemData.color || CHART_COLORS.primary }} 
                        />
                        Importance:
                        <span className="custom-chart-tooltip-value">
                          {formatChartValue(itemData.importance)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="importance" radius={[0, 4, 4, 0]}>
            {sortedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color || CHART_COLORS.primary} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default FeatureImportanceChart;
