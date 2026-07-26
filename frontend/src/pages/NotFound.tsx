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
          alignItems: 'center'
        }}
      >
        {/* Large Muted 404 */}
        <div
          style={{
            fontSize: '6rem',
            fontWeight: 800,
            lineHeight: 1,
            letterSpacing: '-0.05em',
            color: 'var(--text-muted)',
            opacity: 0.3,
            userSelect: 'none',
            marginBottom: '0.5rem'
          }}
        >
          404
        </div>

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
            padding: '10px 22px',
            fontSize: '0.9rem',
            borderRadius: '8px'
          }}
        >
          <ArrowLeft size={16} /> Back to Home
        </Link>
      </div>
    </motion.div>
  );
};

export default NotFound;
