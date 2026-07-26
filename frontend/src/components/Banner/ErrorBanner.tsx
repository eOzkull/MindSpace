import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Info } from 'lucide-react';

type ErrorBannerProps = {
  title?: string;
  message: string;
  variant?: 'danger' | 'warning' | 'info';
};

export const ErrorBanner: React.FC<ErrorBannerProps> = ({
  title = 'Error',
  message,
  variant = 'danger',
}) => {
  const [open, setOpen] = React.useState(true);

  const IconComponent = variant === 'info' ? Info : AlertTriangle;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className={`error-banner ${variant}`}
          role="alert"
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
            <IconComponent size={20} style={{ marginTop: '2px', flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 700, marginBottom: 2 }}>{title}</div>
              <div style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>{message}</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Dismiss"
            style={{
              border: 'none',
              background: 'transparent',
              color: 'inherit',
              cursor: 'pointer',
              padding: 4,
              display: 'inline-flex',
            }}
          >
            <X size={18} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

