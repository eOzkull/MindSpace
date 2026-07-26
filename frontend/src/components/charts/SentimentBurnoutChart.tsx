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
import { CHART_COLORS, DEFAULT_GRID_PROPS, DEFAULT_X_AXIS_PROPS, DEFAULT_Y_AXIS_PROPS, DEFAULT_TOOLTIP_STYLE } from './chartUtils';

interface SentimentBurnoutChartProps {
  data: Array<Record<string, string | number>>;
  height?: number;
}

export const SentimentBurnoutChart: React.FC<SentimentBurnoutChartProps> = ({ data, height = 320 }) => {
  const chartData = useMemo(() => {
    return data
      .map((row) => ({
        sentiment: Math.round(Number(row.sentiment_score) * 100) / 100,
        burnout: Number(row.burnout_score),
        risk: String(row.risk || 'Low'),
      }))
      .filter((d) => !isNaN(d.sentiment) && !isNaN(d.burnout));
  }, [data]);

  return (
    <div className="chart-container" style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 12, right: 15, left: -20, bottom: 4 }}>
          <CartesianGrid {...DEFAULT_GRID_PROPS} />
          <XAxis
            {...DEFAULT_X_AXIS_PROPS}
            type="number"
            dataKey="sentiment"
            name="Sentiment"
            domain={[-1, 1]}
            tickCount={9}
          />
          <YAxis
            {...DEFAULT_Y_AXIS_PROPS}
            type="number"
            dataKey="burnout"
            name="Burnout"
            domain={[0, 100]}
          />
          <Tooltip
            cursor={DEFAULT_TOOLTIP_STYLE.cursor}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const d = payload[0].payload;
                const riskColor =
                  d.risk === 'High'
                    ? CHART_COLORS.danger
                    : d.risk === 'Medium'
                      ? CHART_COLORS.info
                      : CHART_COLORS.success;
                return (
                  <div className="custom-chart-tooltip">
                    <div className="custom-chart-tooltip-title">Student Profile</div>
                    <div className="custom-chart-tooltip-list">
                      <div className="custom-chart-tooltip-item">
                        Sentiment:<span className="custom-chart-tooltip-value">{d.sentiment}</span>
                      </div>
                      <div className="custom-chart-tooltip-item">
                        Burnout:<span className="custom-chart-tooltip-value">{d.burnout}/100</span>
                      </div>
                      <div className="custom-chart-tooltip-item">
                        Risk:
                        <span
                          style={{
                            marginLeft: 'auto',
                            background: riskColor + '22',
                            color: riskColor,
                            border: `1px solid ${riskColor}44`,
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                          }}
                        >
                          {d.risk}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <ReferenceLine
            x={0}
            stroke={CHART_COLORS.textMuted}
            strokeDasharray="4 3"
            strokeWidth={1}
          />
          <Scatter name="Students" data={chartData} fillOpacity={0.8}>
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
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SentimentBurnoutChart;
