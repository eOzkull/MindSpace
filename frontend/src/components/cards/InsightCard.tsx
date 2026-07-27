import React from 'react';
import { motion } from 'framer-motion';
import { Lightbulb } from 'lucide-react';
import { staggerItem } from '../../lib/motion';

export interface InsightCardProps {
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  title: string;
  desc: string;
  takeawayLabel?: string;
  takeaway: string;
  imgUrl?: string;
  imgAlt?: string;
  reverse?: boolean;
  layout?: 'stacked' | 'split';
  children?: React.ReactNode;
}

export const InsightCard: React.FC<InsightCardProps> = ({
  icon: IconComponent,
  title,
  desc,
  takeawayLabel = 'Key Takeaway',
  takeaway,
  imgUrl,
  imgAlt,
  reverse = false,
  layout,
  children,
}) => {
  const isSplit = layout ? layout === 'split' : (reverse || imgUrl !== undefined);

  if (!isSplit) {
    return (
      <motion.div
        variants={staggerItem}
        initial="initial"
        animate="animate"
        className="card"
        style={{ marginBottom: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1.75rem' }}
      >
        <div>
          <h3 className="insight-title" style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '0 0 0.5rem 0', fontSize: '1.15rem', fontWeight: 600 }}>
            <div style={{ padding: '6px', borderRadius: '8px', background: 'rgba(139, 92, 246, 0.12)', display: 'inline-flex' }}>
              <IconComponent size={20} style={{ color: 'var(--brand-primary)' }} />
            </div>
            <span>{title}</span>
          </h3>
          <p className="insight-desc" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5, margin: 0 }}>
            {desc}
          </p>
        </div>

        {children && <div style={{ width: '100%' }}>{children}</div>}

        <div className="takeaway-box" style={{ marginTop: '0.5rem' }}>
          <strong style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--brand-primary)', fontSize: '0.85rem' }}>
            <Lightbulb size={16} /> {takeawayLabel}
          </strong>
          <p style={{ marginTop: '6px', margin: '6px 0 0 0', fontSize: '0.875rem', color: 'var(--text-primary)' }}>
            {takeaway}
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={staggerItem}
      initial="initial"
      animate="animate"
      className={`card insight-row ${reverse ? 'reverse' : ''}`}
      style={{ marginBottom: '2.5rem', gap: '2rem' }}
    >
      <div className="insight-text-col">
        <h3 className="insight-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <IconComponent size={24} style={{ color: 'var(--brand-primary)' }} /> {title}
        </h3>
        <p className="insight-desc">{desc}</p>
        <div className="takeaway-box" style={{ marginTop: '1rem' }}>
          <strong style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--brand-primary)', fontSize: '0.85rem' }}>
            <Lightbulb size={16} /> {takeawayLabel}
          </strong>
          <p style={{ marginTop: '6px', margin: '6px 0 0 0', fontSize: '0.875rem', color: 'var(--text-primary)' }}>{takeaway}</p>
        </div>
      </div>
      <div className="insight-visual-col" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {children ? children : imgUrl ? (
          <img
            src={imgUrl}
            alt={imgAlt || title}
            loading="lazy"
            style={{ width: '100%', borderRadius: 'var(--radius-md)', border: '1px solid var(--card-border)', background: 'var(--input-bg)' }}
          />
        ) : null}
      </div>
    </motion.div>
  );
};

export default InsightCard;

