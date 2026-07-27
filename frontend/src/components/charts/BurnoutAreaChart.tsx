import React, { useMemo, useId } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { CHART_COLORS, DEFAULT_GRID_PROPS, DEFAULT_X_AXIS_PROPS, DEFAULT_Y_AXIS_PROPS, DEFAULT_TOOLTIP_STYLE, CHART_ANIMATION_PROPS } from './chartUtils';
import { chartEntrance } from '../../lib/motion';

interface BurnoutAreaChartProps {
  data: Array<Record<string, string | number>>;
}

export const BurnoutAreaChart: React.FC<BurnoutAreaChartProps> = ({ data }) => {
  const gradientId = useId();
  const safeGradientId = `burnoutAreaGradient-${gradientId.replace(/:/g, '')}`;

  const chartData = useMemo(() => {
    const bins = Array.from({ length: 20 }, (_, i) => {
      const start = i * 5;
      const end = start + 4;
      return {
        range: `${start}-${end}`,
        count: 0,
        minVal: start,
      };
    });

    data.forEach((row) => {
      const score = Number(row.burnout_score);
      if (!isNaN(score)) {
        const binIdx = Math.min(19, Math.floor(score / 5));
        bins[binIdx].count++;
      }
    });

    return bins;
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <div style={{ height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
        No burnout distribution data available
      </div>
    );
  }

  return (
    <motion.div {...chartEntrance} className="chart-container" style={{ width: '100%', height: 320 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 12, right: 12, left: -20, bottom: 4 }}
        >
          <defs>
            <linearGradient id={safeGradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.35} />
              <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid {...DEFAULT_GRID_PROPS} />
          <XAxis
            {...DEFAULT_X_AXIS_PROPS}
            dataKey="range"
          />
          <YAxis
            {...DEFAULT_Y_AXIS_PROPS}
          />
          <Tooltip
            cursor={DEFAULT_TOOLTIP_STYLE.cursor}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload;
                return (
                  <div className="custom-chart-tooltip">
                    <div className="custom-chart-tooltip-title">Burnout range: {item.range}</div>
                    <div className="custom-chart-tooltip-list">
                      <div className="custom-chart-tooltip-item">
                        <span
                          className="custom-chart-tooltip-marker"
                          style={{ backgroundColor: CHART_COLORS.primary }}
                        />
                        Students:
                        <span className="custom-chart-tooltip-value">{item.count}</span>
                      </div>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Area
            type="monotone"
            dataKey="count"
            stroke={CHART_COLORS.primary}
            strokeWidth={2}
            fillOpacity={1}
            fill={`url(#${safeGradientId})`}
            {...CHART_ANIMATION_PROPS}
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

export default BurnoutAreaChart;
