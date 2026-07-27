import React from 'react';
import { X } from 'lucide-react';

type ErrorBannerProps = {
  title?: string;
  message: string;
  variant?: 'danger' | 'warning' | 'info';
};

const variantToStyle = (variant: NonNullable<ErrorBannerProps['variant']>) => {
  switch (variant) {
    case 'danger':
      return { borderColor: 'var(--danger)', background: 'rgba(239, 68, 68, 0.08)', color: 'var(--danger)' };
    case 'warning':
      return { borderColor: 'var(--warning)', background: 'rgba(245, 158, 11, 0.10)', color: 'var(--warning)' };
    case 'info':
    default:
      return { borderColor: 'var(--info)', background: 'rgba(59, 130, 246, 0.08)', color: 'var(--info)' };
  }
};

export const ErrorBanner: React.FC<ErrorBannerProps> = ({
  title = 'Error',
  message,
  variant = 'danger',
}) => {
  const [open, setOpen] = React.useState(true);
  if (!open) return null;

  const style = variantToStyle(variant);

  return (
    <div
      className="card"
      style={{
        marginBottom: '1.5rem',
        border: '1px solid var(--card-border)',
        borderLeft: `4px solid ${style.borderColor}`,
        background: style.background,
        color: style.color,
        padding: '0.9rem 1rem',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: '1rem',
      }}
      role="alert"
    >
      <div>
        <div style={{ fontWeight: 700, marginBottom: 4 }}>{title}</div>
        <div style={{ color: 'var(--text-primary)' }}>{message}</div>
      </div>
      <button
        type="button"
        onClick={() => setOpen(false)}
        aria-label="Dismiss"
        style={{
          border: 'none',
          background: 'transparent',
          color: style.color,
          cursor: 'pointer',
          padding: 4,
        }}
      >
        <X size={18} />
      </button>
    </div>
  );
};

