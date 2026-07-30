import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';

export interface StatCardProps {
  labelIcon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  label: string;
  value: string | number;
  subtext?: string;
  themeColor: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  labelIcon: LabelIcon,
  label,
  value,
  subtext,
  themeColor,
}) => {
  const numericVal = typeof value === 'number' ? value : parseFloat(String(value));
  const isNumeric = !isNaN(numericVal);
  const precision = isNumeric && String(value).includes('.') ? (String(value).split('.')[1]?.length || 1) : 0;

  const count = useMotionValue(0);
  const animatedDisplay = useTransform(count, (v: number) => v.toFixed(precision));
  const [displayValue, setDisplayValue] = useState<string | number>(isNumeric ? 0 : value);

  useEffect(() => {
    if (isNumeric) {
      const controls = animate(count, numericVal, {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1],
      });
      const unsubscribe = animatedDisplay.on('change', (latest: string) => {
        setDisplayValue(latest);
      });
      return () => {
        controls.stop();
        unsubscribe();
      };
    } else {
      setDisplayValue(value);
    }
  }, [value, isNumeric, numericVal]);

  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="card stat-card-inner"
      style={{
        '--accent-color': `var(--${themeColor})`,
        padding: '1.25rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.35rem',
        position: 'relative',
        overflow: 'hidden',
      } as React.CSSProperties}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.15rem' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--text-muted)' }}>
          {label}
        </span>
        <span className="stat-card-badge">
          <LabelIcon size={16} style={{ color: `var(--${themeColor})` }} />
        </span>
      </div>

      <div style={{ fontSize: '2.25rem', fontWeight: 800, color: `var(--${themeColor})`, lineHeight: 1.1, letterSpacing: '-0.03em' }}>
        {displayValue}
      </div>

      {subtext && (
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
          {subtext}
        </div>
      )}
    </motion.div>
  );
};

export default StatCard;

