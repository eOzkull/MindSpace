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
        background: 'var(--card-bg)',
        border: '1px solid var(--card-border)',
        borderRadius: 'var(--radius-lg)',
        backdropFilter: 'var(--glass-blur)',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
        marginTop: '1rem',
      }}
    >
      <motion.div
        animate={{ rotate: 360, opacity: [0.6, 1, 0.6] }}
        transition={{
          rotate: { repeat: Infinity, duration: 1, ease: 'linear' },
          opacity: { repeat: Infinity, duration: 1.8, ease: 'easeInOut' },
        }}
        style={{ display: 'inline-flex', marginBottom: '1.25rem' }}
      >
        <Loader2 
          size={44} 
          style={{ color: 'var(--brand-primary)' }} 
        />
      </motion.div>
      <h3 style={{ 
        marginBottom: '0.5rem', 
        fontWeight: 600, 
        color: 'var(--text-primary)',
        fontSize: '1.2rem',
        textAlign: 'center'
      }}>
        {message}
      </h3>
      <p style={{ 
        color: 'var(--text-secondary)', 
        fontSize: '0.95rem',
        textAlign: 'center',
        margin: 0,
        maxWidth: '450px',
        lineHeight: 1.5
      }}>
        {subtitle}
      </p>
    </motion.div>
  );
};

export default LoadingScreen;
