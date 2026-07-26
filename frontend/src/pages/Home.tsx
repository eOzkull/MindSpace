import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHistory, useUploadFile, useResetSession } from '../hooks/useUpload';
import { ErrorBanner } from '../components/Banner/ErrorBanner';
import { Spinner } from '../components/Spinner/Spinner';
import FileDropzone from '../components/Dropzone/FileDropzone';
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

  return (
    <>
      {loading && (
        <div id="loading-overlay" style={{ display: 'flex', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 9999, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
          <Spinner size={64} label="Analyzing Your Data..."/>
          <p style={{ color: 'var(--text-secondary)' }}>Recalculating burnout metrics and training ML models. Please wait.</p>
        </div>
      )}

      {error && (
  <ErrorBanner
    title="Upload Failed"
    message={error}
    variant="danger"
  />
)}

      <div className="stats-grid" style={{ marginBottom: '2.5rem' }}>
        <div className="card" style={{ gridColumn: 'span 2', padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1.75rem 1.75rem 0.5rem 1.75rem' }}>
            <h2 style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Upload size={24} style={{ color: 'var(--brand-primary)' }} /> New Session
            </h2>
            <p className="text-secondary">Upload a student dataset in CSV format to begin analysis.</p>
          </div>

          <div style={{ padding: '1.75rem' }}>
            <FileDropzone
              onFileDrop={(file) => {
                setSelectedFile(file);
                handleUpload(file);
              }}
              selectedFile={selectedFile}
              isLoading={loading}
              disabled={loading}
              title="Drag and drop your CSV"
              subtitle="or click to browse from your computer"
              buttonText="Analyze Data"
            />
          </div>
        </div>

        {history.length > 0 && (
          <div className="card" style={{ gridColumn: 'span 2' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <History size={20} /> Recent Logs
              </h3>
              <button onClick={handleClear} className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                <Trash2 size={16} /> Clear All
              </button>
            </div>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Dataset Name</th>
                    <th>Records Analyzed</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((entry, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 500 }}>
                        <FileSpreadsheet size={16} style={{ color: 'var(--brand-secondary)', marginRight: '6px', display: 'inline-block', verticalAlign: 'middle' }} />
                        {entry.filename}
                      </td>
                      <td>{entry.records} rows</td>
                      <td>
                        {idx === 0 ? (
                          <button onClick={() => navigate('/dashboard')} className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '0.8rem' }}>
                            <LayoutDashboard size={16} /> View Dashboard
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

      <div className="card">
        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckSquare size={20} /> System Requirements
        </h3>
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
          <div className="card feature-pill" style={{ '--accent': 'var(--info)' } as React.CSSProperties}>
            <h4 style={{ color: 'var(--info)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Moon size={20} /> Sleep
            </h4>
            <p className="insight-desc" style={{ fontSize: '0.9rem', margin: 0 }}>Average nightly sleep duration (hours).</p>
          </div>
          <div className="card feature-pill" style={{ '--accent': 'var(--brand-primary)' } as React.CSSProperties}>
            <h4 style={{ color: 'var(--brand-primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BookOpen size={20} /> Study
            </h4>
            <p className="insight-desc" style={{ fontSize: '0.9rem', margin: 0 }}>Daily focused learning hours.</p>
          </div>
          <div className="card feature-pill" style={{ '--accent': 'var(--danger)' } as React.CSSProperties}>
            <h4 style={{ color: 'var(--danger)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={20} /> Stress
            </h4>
            <p className="insight-desc" style={{ fontSize: '0.9rem', margin: 0 }}>Self-reported level (scale 1–10).</p>
          </div>
          <div className="card feature-pill" style={{ '--accent': 'var(--success)' } as React.CSSProperties}>
            <h4 style={{ color: 'var(--success)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MessageSquare size={20} /> Feedback
            </h4>
            <p className="insight-desc" style={{ fontSize: '0.9rem', margin: 0 }}>Natural language student comments.</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
