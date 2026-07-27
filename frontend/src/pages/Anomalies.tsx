import React from 'react';
import { useAnomalies } from '../hooks/useAnomalies';
import { ShieldAlert, RefreshCw, Info, AlertOctagon } from 'lucide-react';
import { ErrorBanner } from '../components/Banner/ErrorBanner';
import LoadingScreen from '../components/LoadingScreen';
import DataTable from '../components/tables/DataTable';

interface AnomalyItem {
  id: string;
  type: string;
  metric: string;
  value: string;
  confidence: string;
  description: string;
  severity: 'High' | 'Medium' | 'Low';
}

const MOCK_ANOMALIES: AnomalyItem[] = [
  {
    id: "ST-0812",
    type: "Masking Pattern",
    metric: "Stress (8/10) vs Sentiment (+0.65)",
    value: "Dissonant Feedback",
    confidence: "94%",
    description: "Student reports extreme subjective stress but feedback text compound sentiment is highly positive. Suggests defensive mask and potential burnout concealment.",
    severity: "High"
  },
  {
    id: "ST-0931",
    type: "Sleep Deprivation Extreme",
    metric: "Sleep Hours (3.5h / night)",
    value: "Outlier Sleep Duration",
    confidence: "88%",
    description: "Sleep duration is below 3 standard deviations from cohort mean. Study hours remain high (9.5h), indicating high critical exhaustion risk.",
    severity: "High"
  },
  {
    id: "ST-0245",
    type: "Telemetry Dissonance",
    metric: "Stress (2/10) vs Burnout Score (74/100)",
    value: "Inconsistent Telemetry",
    confidence: "75%",
    description: "Low subjective stress reported but calculated ML burnout score is extremely elevated. Subject may be in cognitive denial or misinterpreting the survey parameters.",
    severity: "Medium"
  },
  {
    id: "ST-0477",
    type: "Chronic Study Load",
    metric: "Study Hours (13.5h / day)",
    value: "Workload Outlier",
    confidence: "91%",
    description: "Workload exceeds study recommendations by 2.2x. Burnout scores are rising steadily over the last three weekly logs.",
    severity: "Medium"
  }
];

const Anomalies: React.FC = () => {
  const { data: fetchedAnomalies, isLoading, isError, refetch, isFetching } = useAnomalies();
  const loading = isLoading || isFetching;
  const error = isError ? 'Backend API scanning not available. Using offline cache data.' : '';
  const anomalies: AnomalyItem[] = isError
    ? MOCK_ANOMALIES
    : ((fetchedAnomalies as AnomalyItem[] | undefined) ?? []);

  const tableColumns = React.useMemo(() => [
    {
      key: 'id',
      header: 'Student ID',
      width: '12%',
      style: { fontWeight: 600 }
    },
    {
      key: 'type',
      header: 'Anomaly Type',
      width: '18%',
      render: (value: any, item: AnomalyItem) => (
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ShieldAlert size={16} style={{ color: item.severity === 'High' ? 'var(--danger)' : 'var(--warning)' }} />
          {value}
        </span>
      )
    },
    {
      key: 'metric',
      header: 'Telemetry Matrix',
      width: '20%',
      style: { fontFamily: 'monospace', fontSize: '0.85rem' }
    },
    {
      key: 'confidence',
      header: 'Confidence',
      width: '10%'
    },
    {
      key: 'severity',
      header: 'Severity',
      width: '10%',
      render: (value: any) => (
        <span className={`badge badge-${String(value || '').toLowerCase()}`}>
          {value}
        </span>
      )
    },
    {
      key: 'description',
      header: 'Description / Insights',
      width: '30%',
      style: { fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.4 }
    }
  ], []);

  return (
    <div className="anomalies-container">
      <div className="top-actions" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={() => refetch()} className="btn btn-outline" disabled={loading}>
          <RefreshCw className={loading ? "animate-spin" : ""} size={16} /> Re-scan Database
        </button>
      </div>

      <div className="card Executive-verdict" style={{ background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, transparent 100%)', border: '1px solid var(--card-border)', marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
          <div style={{ padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '50%', color: 'var(--danger)' }}>
            <AlertOctagon size={32} />
          </div>
          <div>
            <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Outlier & Anomaly Analysis</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
              The anomaly detector scans multivariate variables to identify student telemetry discrepancies. This helps advisors isolate students whose reported values do not align with natural behavioral patterns or whose sleep profiles are critically abnormal.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <ErrorBanner
          title="Scan Notice"
          message={error}
          variant="warning"
        />
      )}

      {loading ? (
        <LoadingScreen message="Scanning Anomalies..." subtitle="Looking for telemetry mismatch and masking patterns in cohort." />
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <DataTable
            columns={tableColumns}
            data={anomalies}
            rowStyle={() => ({ borderBottom: '1px solid var(--card-border)' })}
          />
          <div className="takeaway-box" style={{ margin: '1.5rem', background: 'rgba(139, 92, 246, 0.05)', borderLeftColor: 'var(--brand-primary)' }}>
            <Info size={16} style={{ color: 'var(--brand-primary)', marginRight: '6px', verticalAlign: 'middle', display: 'inline-block' }} />
            <strong>Advisory Note:</strong> Masking anomalies are highly critical. Students showing masking behaviors should be engaged with indirect wellness surveys rather than direct confrontation about academic performance.
          </div>
        </div>
      )}
    </div>
  );
};

export default Anomalies;
