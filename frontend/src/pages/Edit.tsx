import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDashboard, useUpdateDashboard } from '../hooks/useDashboard';
import type { DataRow } from '../types/dashboard';
import type { UpdatePayload } from '../types/common';
import { ErrorBanner } from '../components/Banner/ErrorBanner';
import LoadingScreen from '../components/LoadingScreen';
import DataTable from '../components/tables/DataTable';
import { fadeUp } from '../lib/motion';
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

  const tableColumns = React.useMemo(() => {
    return columns.map((col) => ({
      key: col,
      header: col.replace('_', ' ').toUpperCase(),
      render: (value: any, _row: DataRow, i: number) => (
        <input 
          type="text" 
          value={value ?? ''} 
          onChange={(e) => handleChange(i, col, e.target.value)} 
          placeholder="Empty" 
          className="filter-input"
          style={{ width: '100%', padding: '6px 10px', fontSize: '0.85rem' }}
        />
      ),
      cellStyle: { padding: '4px' }
    }));
  }, [columns]);

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
      <LoadingScreen
        variant="overlay"
        message={saving ? 'Recalculating Analysis...' : 'Loading Data...'}
        subtitle={saving ? 'Updating records and retraining the model. Please wait.' : 'Loading dataset grid for interactive editing.'}
      />
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
    <motion.div {...fadeUp} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {saveError && (
        <ErrorBanner
          title="Save Failed"
          message={saveError}
          variant="danger"
        />
      )}
      
      <div className="top-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <Table size={18} style={{ color: 'var(--brand-primary)' }} /> Edit Dataset Records
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>
            Modify values directly in the dataset grid and save to recalculate model parameters.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={() => navigate('/dashboard')} className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
            <X size={15} /> Cancel
          </button>
          <button onClick={handleSave} className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
            <Save size={15} /> Save & Analyze
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem', fontWeight: 600, margin: 0 }}>
            <Table size={16} style={{ color: 'var(--brand-primary)' }} /> Interactive Grid ({editRows.length} Rows)
          </h3>
          <button type="button" onClick={handleAddRow} className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <PlusCircle size={15} /> Add Row
          </button>
        </div>

        <DataTable
          id="edit-table"
          columns={tableColumns}
          data={editRows}
          showIndex={true}
          wrapperStyle={{ maxHeight: '60vh', overflowY: 'auto' }}
          theadStyle={{ position: 'sticky', top: 0, zIndex: 10 }}
        />

        <div style={{ padding: '1rem 1.5rem', background: 'var(--card-bg)', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: '8px', position: 'sticky', bottom: 0 }}>
          <button onClick={() => navigate('/dashboard')} className="btn btn-outline" style={{ fontSize: '0.85rem' }}>Cancel</button>
          <button onClick={handleSave} className="btn btn-primary" style={{ fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Save size={15} /> Save Changes
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default Edit;
