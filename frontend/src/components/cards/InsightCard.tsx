import React from 'react';
import { Lightbulb } from 'lucide-react';

export interface InsightCardProps {
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  title: string;
  desc: string;
  takeawayLabel?: string;
  takeaway: string;
  imgUrl?: string;
  imgAlt?: string;
  reverse?: boolean;
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
  children,
}) => {
  return (
    <div className={`card insight-row ${reverse ? 'reverse' : ''}`} style={{ marginBottom: '2.5rem' }}>
      <div className="insight-text-col">
        <h3 className="insight-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <IconComponent size={24} style={{ color: 'var(--brand-primary)' }} /> {title}
        </h3>
        <p className="insight-desc">{desc}</p>
        <div className="takeaway-box">
          <strong style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Lightbulb size={16} /> {takeawayLabel}
          </strong>
          <p style={{ marginTop: '6px' }}>{takeaway}</p>
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
    </div>
  );
};

export default InsightCard;
