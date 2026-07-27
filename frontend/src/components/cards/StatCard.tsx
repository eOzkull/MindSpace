import React from 'react';

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
  bgIcon: BgIcon,
  label,
  value,
  subtext,
  themeColor,
}) => {
  return (
    <div className="card stat-card-inner">
      <BgIcon size={112} className="bg-icon" />
      <div className="stat-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <LabelIcon size={20} style={{ color: `var(--${themeColor})` }} /> {label}
      </div>
      <div className="stat-val" style={{ color: `var(--${themeColor})` }}>{value}</div>
      <div className="stat-sub">{subtext}</div>
    </div>
  );
};

export default StatCard;
