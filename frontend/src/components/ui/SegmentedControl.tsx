import React from 'react';
import { motion } from 'framer-motion';

export interface SegmentOption<T extends string = string> {
  value: T;
  label: string;
  icon?: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
}

export interface SegmentedControlProps<T extends string = string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  style?: React.CSSProperties;
}

export function SegmentedControl<T extends string = string>({
  options,
  value,
  onChange,
  className = '',
  style,
}: SegmentedControlProps<T>) {
  return (
    <div
      className={`segmented-control ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '3px',
        background: 'var(--input-bg)',
        border: '1px solid var(--input-border)',
        borderRadius: 'var(--radius-sm)',
        position: 'relative',
        ...style,
      }}
    >
      {options.map((option) => {
        const isActive = option.value === value;
        const Icon = option.icon;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            style={{
              position: 'relative',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '6px 14px',
              fontSize: '0.85rem',
              fontWeight: isActive ? 600 : 500,
              color: isActive ? '#ffffff' : 'var(--text-secondary)',
              border: 'none',
              background: 'transparent',
              borderRadius: 'calc(var(--radius-sm) - 2px)',
              cursor: 'pointer',
              zIndex: 1,
              transition: 'color 0.15s ease',
            }}
          >
            {isActive && (
              <motion.div
                layoutId="segmented-active-bg"
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'var(--brand-primary)',
                  borderRadius: 'calc(var(--radius-sm) - 2px)',
                  boxShadow: '0 2px 8px rgba(139, 92, 246, 0.3)',
                  zIndex: -1,
                }}
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
            {Icon && <Icon size={15} style={{ color: isActive ? '#ffffff' : 'var(--text-muted)' }} />}
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export default SegmentedControl;
