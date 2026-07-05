import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchHistory, resetSession, uploadFile } from '../api/upload';
import type { HistoryEntry } from '../types/common';
import { 
  Loader2, 
  Upload, 
  CloudUpload, 
  Sparkles, 
  CheckCircle2, 
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
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const data = await fetchHistory();
      if (data.history) setHistory(data.history);
    } catch (err) {
      console.error(err);
    }
  };

  const handleClear = async () => {
    await resetSession();
    setHistory([]);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const onDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      await handleUpload(file);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      await handleUpload(file);
    }
  };

  const handleUpload = async (file: File) => {
    setLoading(true);
    try {
      const res = await uploadFile(file);
      if (res.success) {
        navigate('/dashboard');
      } else {
        alert(res.error || 'Upload failed');
      }
    } catch (err) {
      alert('Error uploading file');
    }
    setLoading(false);
  };

  return (
    <>
      {loading && (
        <div id="loading-overlay" style={{ display: 'flex', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 9999, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
          <Loader2 className="animate-spin" size={64} style={{ color: 'var(--brand-primary)', marginBottom: '1.5rem' }} />
          <h2 style={{ marginBottom: '0.5rem' }}>Analyzing Your Data...</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Recalculating burnout metrics and training ML models. Please wait.</p>
        </div>
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
            <label 
              className={`upload-zone ${dragOver ? 'dragover' : ''}`} 
              id="drop-zone" 
              htmlFor="file-upload"
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
            >
              <div className="upload-zone-content">
                <CloudUpload className="upload-icon" size={64} style={{ color: 'var(--brand-primary)', marginBottom: '1.5rem' }} />
                <h3 style={{ marginBottom: '8px' }}>Drag and drop your CSV</h3>
                <p className="text-secondary" style={{ marginBottom: '1.5rem' }}>or click to browse from your computer</p>

                <input 
                  type="file" 
                  id="file-upload" 
                  accept=".csv" 
                  ref={fileInputRef}
                  onChange={handleFileChange} 
                  style={{ display: 'none' }} 
                />
                <span className="btn btn-primary" style={{ margin: '0 auto' }}>
                  <Sparkles size={16} /> Analyze Data
                </span>
                {selectedFile && (
                  <p style={{ marginTop: '1.5rem', color: 'var(--success)', fontWeight: 500 }}>
                    <CheckCircle2 size={16} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} /> {selectedFile.name}
                  </p>
                )}
              </div>
            </label>
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
