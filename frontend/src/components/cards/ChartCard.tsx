import React from 'react';
import { motion } from 'framer-motion';
import { Lightbulb } from 'lucide-react';
import { staggerItem } from '../../lib/motion';

export interface ChartCardProps {
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  title: string;
  description: string;
  takeawayLabel?: string;
  takeaway: string;
  children: React.ReactNode;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  icon: IconComponent,
  title,
  description,
  takeawayLabel = 'Key Takeaway',
  takeaway,
  children,
}) => {
  return (
    <motion.div
      variants={staggerItem}
      initial="initial"
      animate="animate"
      className="card"
      style={{
        marginBottom: '2.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
        padding: '1.75rem',
      }}
    >
      {/* Header */}
      <div>
        <h3 className="insight-title" style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '0 0 0.5rem 0', fontSize: '1.15rem', fontWeight: 600 }}>
          <div style={{ padding: '6px', borderRadius: '8px', background: 'rgba(139, 92, 246, 0.12)', display: 'inline-flex' }}>
            <IconComponent size={20} style={{ color: 'var(--brand-primary)' }} />
          </div>
          <span>{title}</span>
        </h3>
        <p className="insight-desc" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5, margin: 0 }}>
          {description}
        </p>
      </div>

      {/* Main Chart Area */}
      <div style={{ width: '100%', minHeight: '300px' }}>
        {children}
      </div>

      {/* Key Takeaway Box */}
      <div className="takeaway-box" style={{ marginTop: '1rem' }}>
        <strong style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--brand-primary)', fontSize: '0.85rem' }}>
          <Lightbulb size={16} /> {takeawayLabel}
        </strong>
        <p style={{ marginTop: '6px', margin: '6px 0 0 0', fontSize: '0.875rem', color: 'var(--text-primary)' }}>
          {takeaway}
        </p>
      </div>
    </motion.div>
  );
};

export default ChartCard;
