import React from 'react';
import { motion } from 'framer-motion';

export interface StatCardProps {
  labelIcon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  bgIcon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string | number;
  subtext: string;
  themeColor: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  labelIcon: LabelIcon,
  bgIcon: _BgIcon,
  label,
  value,
  subtext,
  themeColor,
}) => {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      className="card stat-card-inner"
      style={{
        '--accent-color': `var(--${themeColor})`,
      } as React.CSSProperties}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
        <span className="stat-card-badge">
          <LabelIcon size={18} style={{ color: `var(--${themeColor})` }} />
        </span>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>
          {label}
        </span>
      </div>
      <div style={{ fontSize: '2rem', fontWeight: 700, color: `var(--${themeColor})`, lineHeight: 1.2 }}>
        {value}
      </div>
      {subtext && (
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          {subtext}
        </div>
      )}
    </motion.div>
  );
};

export default StatCard;
