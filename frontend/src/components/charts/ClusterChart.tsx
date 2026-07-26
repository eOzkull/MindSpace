import React, { useMemo } from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { CHART_COLORS, DEFAULT_GRID_PROPS, DEFAULT_X_AXIS_PROPS, DEFAULT_Y_AXIS_PROPS, DEFAULT_TOOLTIP_STYLE, formatChartValue } from './chartUtils';

export interface ClusterPoint {
  x: number;
  y: number;
  cluster: string;
  label?: string;
}

interface ClusterChartProps {
  data: ClusterPoint[];
  height?: number;
  xAxisLabel?: string;
  yAxisLabel?: string;
}

export const ClusterChart: React.FC<ClusterChartProps> = ({ 
  data, 
  height = 400,
  xAxisLabel = 'Component 1',
  yAxisLabel = 'Component 2'
}) => {
  const clusters = useMemo(() => {
    const grouped = data.reduce((acc, point) => {
      if (!acc[point.cluster]) {
        acc[point.cluster] = [];
      }
      acc[point.cluster].push(point);
      return acc;
    }, {} as Record<string, ClusterPoint[]>);
    
    return grouped;
  }, [data]);

  const clusterKeys = Object.keys(clusters);
  
  const palette = [
    CHART_COLORS.primary,
    CHART_COLORS.info,
    CHART_COLORS.success,
    CHART_COLORS.warning,
    CHART_COLORS.danger,
    CHART_COLORS.secondary
  ];

  return (
    <div className="chart-container" style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart
          margin={{ top: 16, right: 16, left: -10, bottom: 16 }}
        >
          <CartesianGrid {...DEFAULT_GRID_PROPS} />
          <XAxis 
            {...DEFAULT_X_AXIS_PROPS}
            type="number" 
            dataKey="x" 
            name={xAxisLabel} 
          />
          <YAxis 
            {...DEFAULT_Y_AXIS_PROPS}
            type="number" 
            dataKey="y" 
            name={yAxisLabel} 
          />
          <Tooltip
            cursor={DEFAULT_TOOLTIP_STYLE.cursor}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const pointData = payload[0].payload as ClusterPoint;
                return (
                  <div className="custom-chart-tooltip">
                    <div className="custom-chart-tooltip-title">
                      {pointData.label || `Cluster: ${pointData.cluster}`}
                    </div>
                    <div className="custom-chart-tooltip-list">
                      <div className="custom-chart-tooltip-item">
                        {xAxisLabel}:
                        <span className="custom-chart-tooltip-value">
                          {formatChartValue(pointData.x)}
                        </span>
                      </div>
                      <div className="custom-chart-tooltip-item">
                        {yAxisLabel}:
                        <span className="custom-chart-tooltip-value">
                          {formatChartValue(pointData.y)}
                        </span>
                      </div>
                      <div className="custom-chart-tooltip-item" style={{ marginTop: 4 }}>
                        <span className="badge" style={{ 
                          fontSize: '0.7rem', 
                          padding: '2px 6px',
                          background: 'var(--input-bg)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '4px'
                        }}>
                          {pointData.cluster}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend 
            wrapperStyle={{ paddingTop: '16px' }}
            content={(props) => {
              const { payload } = props;
              return (
                <ul className="custom-chart-legend">
                  {payload?.map((entry, index) => (
                    <li key={`item-${index}`} className="custom-chart-legend-item">
                      <span 
                        className="custom-chart-legend-marker" 
                        style={{ backgroundColor: entry.color, borderRadius: '50%', width: 8, height: 8 }} 
                      />
                      {entry.value}
                    </li>
                  ))}
                </ul>
              );
            }}
          />
          {clusterKeys.map((clusterName, index) => (
            <Scatter
              key={clusterName}
              name={clusterName}
              data={clusters[clusterName]}
              fill={palette[index % palette.length]}
              fillOpacity={0.85}
            />
          ))}
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ClusterChart;
