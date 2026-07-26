import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { fadeIn } from '../lib/motion';

interface LoadingScreenProps {
  message?: string;
  subtitle?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = 'Loading dashboard analytics...', 
  subtitle = 'Please wait while we prepare your data.'
}) => {
  return (
    <motion.div
      {...fadeIn}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '5rem 2rem',
        minHeight: '400px',
        width: '100%',
        background: 'radial-gradient(circle at 50% 30%, rgba(139, 92, 246, 0.05) 0%, transparent 70%), var(--card-bg)',
        border: '1px solid var(--card-border)',
        borderRadius: 'var(--radius-lg)',
        backdropFilter: 'var(--glass-blur)',
        boxShadow: 'var(--card-shadow)',
        marginTop: '1rem',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'linear-gradient(to right, rgba(255, 255, 255, 0.02) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.02) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          pointerEvents: 'none',
          opacity: 0.6,
        }}
      />
      <motion.div
        animate={{ rotate: 360, opacity: [0.7, 1, 0.7] }}
        transition={{
          rotate: { repeat: Infinity, duration: 1, ease: 'linear' },
          opacity: { repeat: Infinity, duration: 1.8, ease: 'easeInOut' },
        }}
        style={{
          display: 'inline-flex',
          marginBottom: '1.5rem',
          padding: '12px',
          borderRadius: '9999px',
          background: 'rgba(139, 92, 246, 0.08)',
          border: '1px solid rgba(139, 92, 246, 0.2)',
          boxShadow: '0 0 20px rgba(139, 92, 246, 0.15)',
          zIndex: 1,
        }}
      >
        <Loader2 
          size={36} 
          style={{ color: 'var(--brand-primary)' }} 
        />
      </motion.div>
      <h3 style={{ 
        marginBottom: '0.5rem', 
        fontWeight: 700, 
        color: 'var(--text-primary)',
        fontSize: '1.25rem',
        textAlign: 'center',
        letterSpacing: '-0.02em',
        zIndex: 1,
      }}>
        {message}
      </h3>
      <p style={{ 
        color: 'var(--text-secondary)', 
        fontSize: '0.925rem',
        textAlign: 'center',
        margin: 0,
        maxWidth: '450px',
        lineHeight: 1.5,
        zIndex: 1,
      }}>
        {subtitle}
      </p>
    </motion.div>
  );
};

export default LoadingScreen;
