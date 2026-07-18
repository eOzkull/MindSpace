import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingScreenProps {
  message?: string;
  subtitle?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = 'Loading dashboard analytics...', 
  subtitle = 'Please wait while we prepare your data.'
}) => {
  return (
    <div style={{
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
    }}>
      <Loader2 
        className="animate-spin" 
        size={44} 
        style={{ color: 'var(--brand-primary)', marginBottom: '1.25rem' }} 
      />
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
    </div>
  );
};

export default LoadingScreen;
