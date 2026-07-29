import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useHistory, useUploadFile, useResetSession } from '../hooks/useUpload';
import { ErrorBanner } from '../components/Banner/ErrorBanner';
import LoadingScreen from '../components/LoadingScreen';
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
      title: 'Sleep Hours',
      description: 'Average nightly sleep duration (hours vector).',
      color: 'var(--info)'
    },
    {
      icon: BookOpen,
      title: 'Study Hours',
      description: 'Daily focused learning & study duration.',
      color: 'var(--brand-primary)'
    },
    {
      icon: AlertTriangle,
      title: 'Stress Level',
      description: 'Self-reported stress rating (scale 1–10).',
      color: 'var(--danger)'
    },
    {
      icon: MessageSquare,
      title: 'Student Feedback',
      description: 'Qualitative comments for VADER sentiment analysis.',
      color: 'var(--success)'
    }
  ];

  return (
    <motion.div {...fadeUp} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {loading && (
        <LoadingScreen
          variant="overlay"
          message="Analyzing Your Data..."
          subtitle="Recalculating burnout metrics and training ML models. Please wait."
        />
      )}

      {error && (
        <ErrorBanner
          title="Upload Failed"
          message={error}
          variant="danger"
        />
      )}

      {/* Centered Upload Hero Section */}
      <div style={{ maxWidth: '720px', width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div className="card" style={{ padding: '2.5rem', background: 'radial-gradient(circle at 50% 0%, rgba(139, 92, 246, 0.08) 0%, transparent 70%), var(--card-bg)' }}>
          <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(139, 92, 246, 0.12)', border: '1px solid rgba(139, 92, 246, 0.25)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-primary)', marginBottom: '1rem' }}>
              <Upload size={24} />
            </div>
            <h2 style={{ marginBottom: '0.5rem', fontSize: '1.35rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
              New Analysis Session
            </h2>
            <p className="text-secondary" style={{ fontSize: '0.925rem', margin: '0 auto', maxWidth: '480px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Upload a student cohort CSV dataset to run automated ML evaluations, risk predictions, and intervention guidelines.
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
            buttonText="Analyze Dataset"
          />

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1.25rem',
            marginTop: '1.5rem',
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
            flexWrap: 'wrap'
          }}>
            <span>Accepted format: <strong>.csv</strong></span>
            <span>•</span>
            <span>Max size: <strong>50 MB</strong></span>
            <span>•</span>
            <span>Secure local processing</span>
          </div>
        </div>

        {/* History Section */}
        {history.length > 0 && (
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.05rem', fontWeight: 600, letterSpacing: '-0.02em', margin: 0 }}>
                <History size={18} style={{ color: 'var(--brand-primary)' }} />
                Recent Dataset Logs
              </h3>
              <button onClick={handleClear} className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Trash2 size={14} /> Clear Logs
              </button>
            </div>
            <div className="table-wrapper">
              <table style={{ tableLayout: 'auto' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left' }}>Dataset Name</th>
                    <th style={{ textAlign: 'left' }}>Records Analyzed</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((entry, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 500 }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
                          <FileSpreadsheet size={16} style={{ color: 'var(--brand-primary)' }} />
                          <span>{entry.filename}</span>
                        </div>
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{entry.records} rows</td>
                      <td style={{ textAlign: 'right' }}>
                        {idx === 0 ? (
                          <button onClick={() => navigate('/dashboard')} className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            <LayoutDashboard size={14} /> View Dashboard
                          </button>
                        ) : (
                          <span className="badge badge-resolved">Archived</span>
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
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.05rem', fontWeight: 600, letterSpacing: '-0.02em', margin: 0 }}>
            <CheckSquare size={18} style={{ color: 'var(--brand-primary)' }} />
            CSV Feature Requirements
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>
            Telemetry columns recognized by the machine learning pipeline for accurate feature extraction.
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
                className="card"
                style={{
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  borderLeft: `3px solid ${item.color}`,
                  background: 'var(--card-bg)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '34px',
                    height: '34px',
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

