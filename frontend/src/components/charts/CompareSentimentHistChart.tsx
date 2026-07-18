import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { CHART_COLORS, DEFAULT_GRID_PROPS } from './chartUtils';

interface CompareSentimentHistChartProps {
  dataA: Array<{ sentiment_score?: number | string }>;
  dataB: Array<{ sentiment_score?: number | string }>;
  labelA: string;
  labelB: string;
  height?: number;
}

export const CompareSentimentHistChart: React.FC<CompareSentimentHistChartProps> = ({ dataA, dataB, labelA, labelB, height = 320 }) => {
  const chartData = useMemo(() => {
    const numBins = 20;
    const binWidth = 0.1;
    const bins = Array.from({ length: numBins }, (_, idx) => {
      const start = -1.0 + idx * binWidth;
      const end = start + binWidth;
      return {
        range: `${start.toFixed(1)} to ${end.toFixed(1)}`,
        start,
        end,
        [labelA]: 0,
        [labelB]: 0,
      };
    });

    dataA.forEach((row) => {
      const val = Number(row.sentiment_score);
      if (!isNaN(val) && val >= -1 && val <= 1) {
        const idx = Math.min(Math.floor((val + 1.0) / binWidth), numBins - 1);
        (bins[idx] as any)[labelA]++;
      }
    });

    dataB.forEach((row) => {
      const val = Number(row.sentiment_score);
      if (!isNaN(val) && val >= -1 && val <= 1) {
        const idx = Math.min(Math.floor((val + 1.0) / binWidth), numBins - 1);
        (bins[idx] as any)[labelB]++;
      }
    });

    return bins;
  }, [dataA, dataB, labelA, labelB]);

  return (
    <div className="chart-container" style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 15, right: 15, left: -20, bottom: 5 }}>
          <CartesianGrid {...DEFAULT_GRID_PROPS} />
          <XAxis dataKey="range" stroke="transparent" tick={{ fill: CHART_COLORS.textMuted, fontSize: 10 }} dy={8} />
          <YAxis stroke="transparent" tick={{ fill: CHART_COLORS.textMuted, fontSize: 11 }} dx={-8} />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload;
                return (
                  <div className="custom-chart-tooltip">
                    <div className="custom-chart-tooltip-title">Sentiment range: {item.range}</div>
                    <div className="custom-chart-tooltip-list">
                      <div className="custom-chart-tooltip-item">
                        <span className="custom-chart-tooltip-marker" style={{ backgroundColor: '#4facfe' }} />
                        {labelA}: <span className="custom-chart-tooltip-value">{item[labelA]} students</span>
                      </div>
                      <div className="custom-chart-tooltip-item">
                        <span className="custom-chart-tooltip-marker" style={{ backgroundColor: '#ff9f43' }} />
                        {labelB}: <span className="custom-chart-tooltip-value">{item[labelB]} students</span>
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
              <ul className="custom-chart-legend" style={{ margin: 0, justifyContent: 'center' }}>
                <li className="custom-chart-legend-item">
                  <span className="custom-chart-legend-marker" style={{ backgroundColor: '#4facfe' }} />
                  {labelA}
                </li>
                <li className="custom-chart-legend-item">
                  <span className="custom-chart-legend-marker" style={{ backgroundColor: '#ff9f43' }} />
                  {labelB}
                </li>
              </ul>
            )}
          />
          <ReferenceLine x="0.0 to 0.1" stroke={CHART_COLORS.textMuted} strokeDasharray="3 3" />
          <Area type="monotone" dataKey={labelA} stroke="#4facfe" fill="#4facfe" fillOpacity={0.4} strokeWidth={2} />
          <Area type="monotone" dataKey={labelB} stroke="#ff9f43" fill="#ff9f43" fillOpacity={0.4} strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CompareSentimentHistChart;
