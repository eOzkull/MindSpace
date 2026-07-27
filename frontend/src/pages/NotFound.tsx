import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, ArrowLeft } from 'lucide-react';

const NotFound: React.FC = () => {
  return (
    <div className="card" style={{ maxWidth: '600px', margin: '4rem auto', textAlign: 'center', padding: '3rem' }}>
      <HelpCircle size={64} style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', display: 'inline-block' }} />
      <h2 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Page Not Found</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        The page you are looking for does not exist or has been moved.
      </p>
      <Link to="/" className="btn btn-primary" style={{ margin: '0 auto', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
        <ArrowLeft size={16} /> Back to Home
      </Link>
    </div>
  );
};

export default NotFound;
