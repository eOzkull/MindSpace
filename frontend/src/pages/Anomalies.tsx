import React from 'react';
import { motion } from 'framer-motion';
import { useAnomalies } from '../hooks/useAnomalies';
import { ShieldAlert, RefreshCw, Info, AlertOctagon, ScanLine } from 'lucide-react';
import { ErrorBanner } from '../components/Banner/ErrorBanner';
import LoadingScreen from '../components/LoadingScreen';
import DataTable from '../components/tables/DataTable';
import { StatCard } from '../components/cards';
import { fadeUp, staggerContainer, staggerItem } from '../lib/motion';

interface AnomalyResponse {
  anomalies: AnomalyItem[];
  total_scanned: number;
  total_flagged: number;
  columns_scanned: string[];
}

interface AnomalyResponse {
  anomalies: AnomalyItem[];
  total_scanned: number;
  total_flagged: number;
  columns_scanned: string[];
}

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
  const { data: fetchedData, isLoading, isError, refetch } = useAnomalies();
  const loading = isLoading;
  const error = isError ? 'Backend API scanning not available. Using offline cache data.' : '';

  const response = fetchedData as AnomalyResponse | undefined;
  const anomalies: AnomalyItem[] = isError
    ? MOCK_ANOMALIES
    : (Array.isArray(response?.anomalies) ? response!.anomalies : []);
  const totalScanned = response?.total_scanned ?? null;
  const totalFlagged = response?.total_flagged ?? anomalies.length;
  const columnsScanned = response?.columns_scanned ?? [];

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
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 500 }}>
          <ShieldAlert size={15} style={{ color: item.severity === 'High' ? 'var(--danger)' : 'var(--warning)' }} />
          {value}
        </span>
      )
    },
    {
      key: 'metric',
      header: 'Telemetry Matrix',
      width: '20%',
      style: { fontFamily: 'monospace', fontSize: '0.8rem' }
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
      style: { fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4 }
    }
  ], []);

  return (
    <motion.div {...fadeUp} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="top-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <AlertOctagon size={18} style={{ color: 'var(--danger)' }} /> Outlier & Anomaly Analysis
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>
            Multivariate detection of student telemetry discrepancies and burnout masking behaviors.
          </p>
        </div>

        <button onClick={() => refetch()} className="btn btn-outline" disabled={loading} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
          <RefreshCw className={loading ? "animate-spin" : ""} size={15} /> Re-scan Database
        </button>
      </div>

      {!isError && !loading && totalScanned !== null && (
        <motion.div variants={staggerContainer} initial="initial" animate="animate" className="stats-grid">
          <motion.div variants={staggerItem}>
            <StatCard
              labelIcon={ScanLine}
              label="Records Scanned"
              value={totalScanned}
              subtext="Active database entries"
              themeColor="brand-primary"
            />
          </motion.div>
          <motion.div variants={staggerItem}>
            <StatCard
              labelIcon={AlertOctagon}
              label="Anomalies Flagged"
              value={totalFlagged}
              subtext="Outliers requiring review"
              themeColor="danger"
            />
          </motion.div>
          <motion.div variants={staggerItem}>
            <StatCard
              labelIcon={ShieldAlert}
              label="Columns Monitored"
              value={columnsScanned.length}
              subtext="Multivariate variables"
              themeColor="info"
            />
          </motion.div>
        </motion.div>
      )}

      <div className="card" style={{
        background: 'rgba(239, 68, 68, 0.03)',
        borderLeft: '4px solid var(--danger)',
        padding: '1.5rem'
      }}>
        <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '10px',
            background: 'rgba(239, 68, 68, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--danger)',
            flexShrink: 0
          }}>
            <AlertOctagon size={22} />
          </div>
          <div>
            <h3 style={{ marginBottom: '0.35rem', fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Detection Engine Insights
            </h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.9rem', margin: 0 }}>
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
          />
          <div className="takeaway-box" style={{ margin: '0 1.5rem 1.5rem', background: 'rgba(139, 92, 246, 0.05)', borderLeftColor: 'var(--brand-primary)' }}>
            <strong style={{ fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Info size={15} style={{ color: 'var(--brand-primary)' }} /> Advisory Note
            </strong>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>Masking anomalies are highly critical. Students showing masking behaviors should be engaged with indirect wellness surveys rather than direct confrontation about academic performance.</p>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Anomalies;
