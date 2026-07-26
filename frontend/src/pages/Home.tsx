import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useHistory, useUploadFile, useResetSession } from '../hooks/useUpload';
import { ErrorBanner } from '../components/Banner/ErrorBanner';
import { Spinner } from '../components/Spinner/Spinner';
import FileDropzone from '../components/Dropzone/FileDropzone';
import { fadeUp, staggerContainer, staggerItem } from '../lib/motion';
import {
  Upload,
  History,
  Trash2,
  FileSpreadsheet,
  LayoutDashboard,
  CheckSquare,
  Moon,
  BookOpen,
  AlertTriangle,
  MessageSquare
} from 'lucide-react';

const Home: React.FC = () => {
  const { data: historyData } = useHistory();
  const history = historyData?.history ?? [];
  const uploadMutation = useUploadFile();
  const resetMutation = useResetSession();

  const loading = uploadMutation.isPending;
  const [error, setError] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const navigate = useNavigate();

  const handleClear = async () => {
    resetMutation.mutate();
  };

  const handleUpload = async (file: File) => {
    setError('');
    uploadMutation.mutate(file, {
      onSuccess: (res) => {
        if (res.success) {
          navigate('/dashboard');
        } else {
          setError(res.error || 'Upload failed');
        }
      },
      onError: (err: any) => {
        console.error('Upload error:', err);
        const bodyError = err?.body?.error || err?.body?.message;
        const msg = typeof bodyError === 'string' ? bodyError : (err?.message || 'Error uploading file');
        setError(msg);
      }
    });
  };

  const featureItems = [
    {
      icon: Moon,
      title: 'Sleep',
      description: 'Average nightly sleep duration (hours).',
      color: 'var(--info)'
    },
    {
      icon: BookOpen,
      title: 'Study',
      description: 'Daily focused learning hours.',
      color: 'var(--brand-primary)'
    },
    {
      icon: AlertTriangle,
      title: 'Stress',
      description: 'Self-reported level (scale 1–10).',
      color: 'var(--danger)'
    },
    {
      icon: MessageSquare,
      title: 'Feedback',
      description: 'Natural language student comments.',
      color: 'var(--success)'
    }
  ];

  return (
    <motion.div {...fadeUp} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {loading && (
        <div id="loading-overlay" style={{ display: 'flex', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 9999, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
          <Spinner size={64} label="Analyzing Your Data..." />
          <p style={{ color: 'var(--text-secondary)', marginTop: '1rem' }}>Recalculating burnout metrics and training ML models. Please wait.</p>
        </div>
      )}

      {error && (
        <ErrorBanner
          title="Upload Failed"
          message={error}
          variant="danger"
        />
      )}

      {/* Centered Upload Section */}
      <div style={{ maxWidth: '700px', width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div className="card" style={{ padding: '2rem' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.1rem', fontWeight: 600, letterSpacing: '-0.02em' }}>
              <Upload size={20} style={{ color: 'var(--brand-primary)' }} />
              New Analysis Session
            </h2>
            <p className="text-secondary" style={{ fontSize: '0.9rem', margin: 0, color: 'var(--text-secondary)' }}>
              Upload a student dataset in CSV format to begin machine learning burnout analysis.
            </p>
          </div>

          <FileDropzone
            onFileDrop={(file) => {
              setSelectedFile(file);
              handleUpload(file);
            }}
            selectedFile={selectedFile}
            isLoading={loading}
            disabled={loading}
            title="Drag and drop your CSV dataset"
            subtitle="or click to browse files from your computer"
            buttonText="Analyze Data"
          />

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1.25rem',
            marginTop: '1.25rem',
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
            flexWrap: 'wrap'
          }}>
            <span>Accepted format: <strong>.csv</strong></span>
            <span>•</span>
            <span>Max file size: <strong>50 MB</strong></span>
            <span>•</span>
            <span>Secure local ML processing</span>
          </div>
        </div>

        {history.length > 0 && (
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', fontWeight: 600, letterSpacing: '-0.02em', margin: 0 }}>
                <History size={18} style={{ color: 'var(--brand-primary)' }} />
                Recent Logs
              </h3>
              <button onClick={handleClear} className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                <Trash2 size={15} /> Clear All
              </button>
            </div>
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Dataset Name</th>
                    <th>Records Analyzed</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((entry, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 500 }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                          <FileSpreadsheet size={16} style={{ color: 'var(--brand-secondary)' }} />
                          <span>{entry.filename}</span>
                        </div>
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>{entry.records} rows</td>
                      <td style={{ textAlign: 'right' }}>
                        {idx === 0 ? (
                          <button onClick={() => navigate('/dashboard')} className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '0.8rem' }}>
                            <LayoutDashboard size={15} /> View Dashboard
                          </button>
                        ) : (
                          <span className="badge badge-medium">Archived</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* System Requirements Grid */}
      <div className="card">
        <div style={{ marginBottom: '1.25rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', fontWeight: 600, letterSpacing: '-0.02em', margin: 0 }}>
            <CheckSquare size={18} style={{ color: 'var(--brand-primary)' }} />
            System Requirements
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>
            Expected features in the uploaded CSV file for accurate ML evaluation.
          </p>
        </div>

        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem'
          }}
        >
          {featureItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={idx}
                variants={staggerItem}
                className="card feature-pill"
                style={{
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  border: '1px solid var(--border-color)',
                  transition: 'transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    backgroundColor: `color-mix(in srgb, ${item.color} 12%, transparent)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: item.color
                  }}>
                    <Icon size={18} />
                  </div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>
                    {item.title}
                  </h4>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                  {item.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Home;
