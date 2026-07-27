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
import { CHART_COLORS, DEFAULT_GRID_PROPS, formatChartValue } from './chartUtils';

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
  // Group by cluster for legend and separate scatters
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
  
  // Color palette for clusters
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
          margin={{ top: 20, right: 20, left: 10, bottom: 20 }}
        >
          <CartesianGrid {...DEFAULT_GRID_PROPS} />
          <XAxis 
            type="number" 
            dataKey="x" 
            name={xAxisLabel} 
            stroke="transparent"
            tick={{ fill: CHART_COLORS.textMuted, fontSize: 11 }}
            dy={8}
          />
          <YAxis 
            type="number" 
            dataKey="y" 
            name={yAxisLabel} 
            stroke="transparent"
            tick={{ fill: CHART_COLORS.textMuted, fontSize: 11 }}
            dx={-8}
          />
          <Tooltip
            cursor={{ strokeDasharray: '3 3' }}
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
                          background: 'var(--bg-main)',
                          border: '1px solid var(--card-border)',
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
            wrapperStyle={{ paddingTop: '20px' }}
            content={(props) => {
              const { payload } = props;
              return (
                <ul className="custom-chart-legend">
                  {payload?.map((entry, index) => (
                    <li key={`item-${index}`} className="custom-chart-legend-item">
                      <span 
                        className="custom-chart-legend-marker" 
                        style={{ backgroundColor: entry.color, borderRadius: '50%', width: 10, height: 10 }} 
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
              fillOpacity={0.8}
            />
          ))}
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ClusterChart;
