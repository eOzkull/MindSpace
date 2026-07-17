import React from 'react';
import { Loader2 } from 'lucide-react';

export type SpinnerProps = {
  size?: number;
  label?: string;
};

export const Spinner: React.FC<SpinnerProps> = ({ size = 64, label = 'Loading...' }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        color: 'white',
      }}
    >
      <Loader2 className="animate-spin" size={size} style={{ color: 'var(--brand-primary)' }} />
      <h2 style={{ margin: 0, fontSize: '1.1rem' }}>{label}</h2>
    </div>
  );
};

