import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDashboard, useUpdateDashboard } from '../hooks/useDashboard';
import type { DataRow } from '../types/dashboard';
import type { UpdatePayload } from '../types/common';
import { ErrorBanner } from '../components/Banner/ErrorBanner';
import { Spinner } from '../components/Spinner/Spinner';
import {
  Save,
  X,
  Table,
  PlusCircle
} from 'lucide-react';

const Edit: React.FC = () => {
  const { data: dashboard, isLoading: loading, error: queryError } = useDashboard();
  const columns: string[] = dashboard?.columns ?? [];
  const error = queryError ? (queryError as Error).message || 'Failed to load dataset.' : '';

  const [editRows, setEditRows] = useState<DataRow[]>([]);
  const [saveError, setSaveError] = useState('');
  const updateMutation = useUpdateDashboard();
  const saving = updateMutation.isPending;
  const navigate = useNavigate();

  useEffect(() => {
    if (dashboard?.data) {
      setEditRows(dashboard.data);
    }
  }, [dashboard?.data]);

  const handleAddRow = () => {
    const newRow = columns.reduce<DataRow>((acc, col) => ({ ...acc, [col]: '' }), {});
    setEditRows([...editRows, newRow]);
  };

  const handleChange = (rowIndex: number, col: string, value: string) => {
    const newData = [...editRows];
    newData[rowIndex][col] = value;
    setEditRows(newData);
  };

  const handleSave = async () => {
    setSaveError('');
    const updates: UpdatePayload[] = [];
    editRows.forEach((row, rIdx) => {
      columns.forEach(col => {
        if (row[col] !== undefined) {
          updates.push({ row: rIdx, col, value: row[col] });
        }
      });
    });
    
    updateMutation.mutate(updates, {
      onSuccess: (res) => {
        if (res.success) {
          navigate('/dashboard');
        } else {
          setSaveError(res.error || 'Failed to save.');
        }
      },
      onError: (err) => {
        console.error(err);
        setSaveError('Error saving data.');
      }
    });
  };

  if (loading || saving) {
    return (
      <div id="loading-overlay" style={{ display: 'flex', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 9999, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
        <Spinner
  size={64}
  label={saving ? 'Recalculating Analysis...' : 'Loading Data...'}
/>
        <p style={{ color: 'var(--text-secondary)' }}>{saving ? 'Updating records and retraining the model. Please wait.' : 'Please wait.'}</p>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorBanner
        title="Load Failed"
        message={error}
        variant="danger"
      />
    );
  }

  return (
    <>
      {saveError && (
        <ErrorBanner
          title="Save Failed"
          message={saveError}
          variant="danger"
        />
      )}
      <div className="top-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginBottom: '1.5rem' }}>
        <button onClick={handleSave} className="btn btn-primary">
          <Save size={16} /> Save & Analyze
        </button>
        <button onClick={() => navigate('/dashboard')} className="btn btn-outline">
          <X size={16} /> Cancel
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--card-border)' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Table size={20} /> Interactive Grid
          </h3>
          <button type="button" onClick={handleAddRow} className="btn btn-outline" style={{ padding: '6px 14px', fontSize: '0.85rem' }}>
            <PlusCircle size={16} /> Add Row
          </button>
        </div>

        <div className="table-wrapper" style={{ border: 'none', borderRadius: 0, maxHeight: '60vh', overflowY: 'auto' }}>
          <table id="edit-table">
            <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
              <tr>
                <th style={{ width: '50px' }}>#</th>
                {columns.map(c => <th key={c}>{c.replace('_', ' ').toUpperCase()}</th>)}
              </tr>
            </thead>
            <tbody>
              {editRows.map((row, i) => (
                <tr key={i}>
                  <td className="row-num" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>{i + 1}</td>
                  {columns.map(col => (
                    <td key={col} style={{ padding: '4px' }}>
                      <input 
                        type="text" 
                        value={row[col] ?? ''} 
                        onChange={(e) => handleChange(i, col, e.target.value)} 
                        placeholder="Empty" 
                        style={{ width: '100%', padding: '4px 8px', border: '1px solid var(--card-border)', background: 'transparent', color: 'var(--text-primary)', borderRadius: '4px' }}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ padding: '1.5rem', background: 'var(--card-bg)', borderTop: '1px solid var(--card-border)', display: 'flex', justifyContent: 'flex-end', gap: '12px', position: 'sticky', bottom: 0 }}>
          <button onClick={() => navigate('/dashboard')} className="btn btn-outline">Cancel</button>
          <button onClick={handleSave} className="btn btn-primary"><Save size={16} /> Save Changes</button>
        </div>
      </div>
    </>
  );
};

export default Edit;
