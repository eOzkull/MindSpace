import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { scaleIn } from '../lib/motion';

const NotFound: React.FC = () => {
  return (
    <motion.div
      {...scaleIn}
      style={{
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem'
      }}
    >
      <div
        className="card"
        style={{
          maxWidth: '520px',
          width: '100%',
          textAlign: 'center',
          padding: '3.5rem 2.5rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          background: 'radial-gradient(circle at 50% 30%, rgba(139, 92, 246, 0.08) 0%, transparent 70%), var(--card-bg)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Animated Gradient 404 */}
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            fontSize: '6.5rem',
            fontWeight: 900,
            lineHeight: 1,
            letterSpacing: '-0.06em',
            background: 'var(--brand-gradient)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            userSelect: 'none',
            marginBottom: '0.75rem',
            filter: 'drop-shadow(0 0 20px rgba(139, 92, 246, 0.2))'
          }}
        >
          404
        </motion.div>

        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
          Page Not Found
        </h2>

        <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', lineHeight: 1.6, marginBottom: '2rem', maxWidth: '380px' }}>
          The requested page could not be found or may have been moved. Return to the dashboard home page to continue your analysis.
        </p>

        <Link
          to="/"
          className="btn btn-primary"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 24px',
            fontSize: '0.9rem',
            borderRadius: '9999px'
          }}
        >
          <ArrowLeft size={16} /> Back to Home
        </Link>
      </div>
    </motion.div>
  );
};

export default NotFound;
