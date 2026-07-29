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

interface SleepScatterChartProps {
  data: Array<Record<string, string | number>>;
}

export const SleepScatterChart: React.FC<SleepScatterChartProps> = ({ data }) => {
  const chartData = useMemo(() => {
    return data.map((row) => {
      const sleep = Number(row.sleep_hours);
      const burnout = Number(row.burnout_score);
      const risk = String(row.risk || 'Low');

      let color: string = CHART_COLORS.success;
      if (risk === 'Medium') color = CHART_COLORS.info;
      else if (risk === 'High') color = CHART_COLORS.danger;

      return {
        sleep: isNaN(sleep) ? 0 : sleep,
        burnout: isNaN(burnout) ? 0 : burnout,
        risk,
        color,
      };
    });
  }, [data]);

  return (
    <div className="chart-container" style={{ width: '100%', height: 320 }}>
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 12, right: 15, left: -20, bottom: 4 }}>
          <CartesianGrid {...DEFAULT_GRID_PROPS} />
          <XAxis
            {...DEFAULT_X_AXIS_PROPS}
            type="number"
            dataKey="sleep"
            name="Sleep"
            unit="h"
            domain={[3, 11]}
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
                const sleepVal = payload.find(p => p.name === 'Sleep')?.value;
                const burnoutVal = payload.find(p => p.name === 'Burnout')?.value;
                const rawObj = payload[0].payload;
                return (
                  <div className="custom-chart-tooltip">
                    <div className="custom-chart-tooltip-title">Student Profile</div>
                    <div className="custom-chart-tooltip-list">
                      <div className="custom-chart-tooltip-item">
                        Sleep Hours:
                        <span className="custom-chart-tooltip-value">{sleepVal} hrs</span>
                      </div>
                      <div className="custom-chart-tooltip-item">
                        Burnout Score:
                        <span className="custom-chart-tooltip-value">{burnoutVal}/100</span>
                      </div>
                      <div className="custom-chart-tooltip-item">
                        Risk Tier:
                        <span
                          style={{
                            backgroundColor: rawObj.color + '22',
                            color: rawObj.color,
                            border: `1px solid ${rawObj.color}44`,
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            marginLeft: 'auto',
                          }}
                        >
                          {rawObj.risk}
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
            x={5}
            stroke={CHART_COLORS.danger}
            strokeDasharray="4 4"
            strokeWidth={1.5}
            label={{
              value: 'Critical Threshold (<5h)',
              fill: CHART_COLORS.danger,
              position: 'insideTopLeft',
              fontSize: 10,
              fontWeight: 600,
              offset: 8,
            }}
          />
          <Scatter name="Students" data={chartData}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} stroke="var(--bg-main)" strokeWidth={1} />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SleepScatterChart;
