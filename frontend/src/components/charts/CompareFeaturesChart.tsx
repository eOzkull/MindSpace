import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts';
import { CHART_COLORS, DEFAULT_GRID_PROPS } from './chartUtils';

interface CompareFeaturesChartProps {
  statsA: {
    avg_sleep: number | null;
    avg_study: number | null;
    avg_stress: number | null;
    avg_burnout: number | null;
  };
  statsB: {
    avg_sleep: number | null;
    avg_study: number | null;
    avg_stress: number | null;
    avg_burnout: number | null;
  };
  labelA: string;
  labelB: string;
  height?: number;
}

export const CompareFeaturesChart: React.FC<CompareFeaturesChartProps> = ({ statsA, statsB, labelA, labelB, height = 320 }) => {
  const scale = {
    sleep: 10,
    study: 10,
    stress: 10,
    burnout: 100,
  };

  const formatVal = (v: number | null | undefined) => (v !== undefined && v !== null) ? v : 0;

  const data = [
    {
      name: 'Avg Sleep (hrs)',
      [labelA + '_norm']: formatVal(statsA.avg_sleep) / scale.sleep,
      [labelB + '_norm']: formatVal(statsB.avg_sleep) / scale.sleep,
      [labelA]: formatVal(statsA.avg_sleep),
      [labelB]: formatVal(statsB.avg_sleep),
    },
    {
      name: 'Avg Study (hrs)',
      [labelA + '_norm']: formatVal(statsA.avg_study) / scale.study,
      [labelB + '_norm']: formatVal(statsB.avg_study) / scale.study,
      [labelA]: formatVal(statsA.avg_study),
      [labelB]: formatVal(statsB.avg_study),
    },
    {
      name: 'Avg Stress (/10)',
      [labelA + '_norm']: formatVal(statsA.avg_stress) / scale.stress,
      [labelB + '_norm']: formatVal(statsB.avg_stress) / scale.stress,
      [labelA]: formatVal(statsA.avg_stress),
      [labelB]: formatVal(statsB.avg_stress),
    },
    {
      name: 'Avg Burnout (/100)',
      [labelA + '_norm']: formatVal(statsA.avg_burnout) / scale.burnout,
      [labelB + '_norm']: formatVal(statsB.avg_burnout) / scale.burnout,
      [labelA]: formatVal(statsA.avg_burnout),
      [labelB]: formatVal(statsB.avg_burnout),
    },
  ];

  const renderCustomizedLabel = (props: any) => {
    const { x, y, width, value } = props;
    if (value === undefined || value === null) return null;
    return (
      <g>
        <text x={x + width / 2} y={y - 6} fill={CHART_COLORS.textMuted} fontSize={10} textAnchor="middle">
          {Number(value).toFixed(1)}
        </text>
      </g>
    );
  };

  return (
    <div className="chart-container" style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 15, left: -20, bottom: 5 }}>
          <CartesianGrid {...DEFAULT_GRID_PROPS} />
          <XAxis dataKey="name" stroke="transparent" tick={{ fill: CHART_COLORS.textMuted, fontSize: 11 }} dy={8} />
          <YAxis domain={[0, 1.2]} stroke="transparent" tick={{ fill: CHART_COLORS.textMuted, fontSize: 11 }} dx={-8} />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const rawData = payload[0].payload;
                return (
                  <div className="custom-chart-tooltip">
                    <div className="custom-chart-tooltip-title">{rawData.name}</div>
                    <div className="custom-chart-tooltip-list">
                      <div className="custom-chart-tooltip-item">
                        <span className="custom-chart-tooltip-marker" style={{ backgroundColor: '#4facfe' }} />
                        {labelA}: <span className="custom-chart-tooltip-value">{rawData[labelA].toFixed(1)}</span>
                      </div>
                      <div className="custom-chart-tooltip-item">
                        <span className="custom-chart-tooltip-marker" style={{ backgroundColor: '#ff9f43' }} />
                        {labelB}: <span className="custom-chart-tooltip-value">{rawData[labelB].toFixed(1)}</span>
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
          <Bar dataKey={`${labelA}_norm`} fill="#4facfe" radius={[4, 4, 0, 0]} maxBarSize={45}>
            <LabelList dataKey={labelA} content={renderCustomizedLabel} />
          </Bar>
          <Bar dataKey={`${labelB}_norm`} fill="#ff9f43" radius={[4, 4, 0, 0]} maxBarSize={45}>
            <LabelList dataKey={labelB} content={renderCustomizedLabel} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CompareFeaturesChart;
