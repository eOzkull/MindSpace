import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDashboard } from '../hooks/useDashboard';
import DataTable from '../components/tables/DataTable';
import LoadingScreen from '../components/LoadingScreen';
import { InsightCard } from '../components/cards';
import FileDropzone from '../components/Dropzone/FileDropzone';
import { fadeUp, staggerContainer, staggerItem } from '../lib/motion';
import {
  CompareBurnoutHistChart,
  CompareRiskBarChart,
  CompareFeaturesChart,
  CompareBoxChart,
  CompareSentimentHistChart,
} from '../components/charts';
import {
  useCompareStatus,
  useCompareResults,
  useUploadCompareFile,
  useClearCompare,
} from '../hooks/useCompare';
import {
  Loader2,
  FolderMinus,
  Upload,
  CheckCircle2,
  Files,
  RotateCw,
  ArrowLeftRight,
  ListOrdered,
  TrendingUp,
  TrendingDown,
  BarChart2,
  Presentation,
  Brain,
  Scale,
  Waves,
  BarChart3,
  SlidersHorizontal,
  MessageSquare,
} from 'lucide-react';

const Compare = () => {
  const [searchParams] = useSearchParams();
  const studentsParam = searchParams.get('students');

  // React Query hooks called unconditionally at the top level
  const {
    data: dashboard,
    isLoading: loadingDashboard,
  } = useDashboard();

  const {
    data: status,
    isLoading: loadingStatus,
    isError: statusError,
  } = useCompareStatus();

  const {
    data: results,
    isLoading: loadingResults,
    isError: resultsError,
    refetch: refetchResults,
  } = useCompareResults();

  // When compare_loaded becomes true after an upload, fetch results immediately.
  React.useEffect(() => {
    if (status?.compare_loaded) {
      refetchResults();
    }
  }, [status?.compare_loaded, refetchResults]);

  // Parse student identifiers (e.g. ST-1,ST-3) to original row indices (0-based)
  const selectedIndices = React.useMemo(() => {
    if (!studentsParam) return [];
    return studentsParam.split(',')
      .map(id => {
        const match = id.match(/ST-(\d+)/i);
        return match ? parseInt(match[1]) - 1 : -1;
      })
      .filter(idx => idx >= 0);
  }, [studentsParam]);

  const selectedStudents = React.useMemo(() => {
    if (!dashboard?.data || selectedIndices.length === 0) return [];
    return selectedIndices
      .map(idx => dashboard.data![idx])
      .filter(Boolean);
  }, [dashboard?.data, selectedIndices]);

  const isStudentCompareMode = selectedIndices.length >= 2;

  const renderDeltaBadge = (value: number, baselineValue: number, isLowerBetter: boolean, unit: string = '') => {
    const delta = value - baselineValue;
    if (delta === 0) return null;
    const isGood = isLowerBetter ? delta < 0 : delta > 0;
    const sign = delta > 0 ? '+' : '';
    const badgeClass = isGood ? 'badge-low' : 'badge-high';
    return (
      <span className={`badge ${badgeClass}`} style={{ marginLeft: '8px', fontSize: '0.75rem', padding: '2px 6px', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
        {sign}{delta.toFixed(1)}{unit}
        {delta > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
      </span>
    );
  };

  const uploadMutation = useUploadCompareFile();
  const clearMutation = useClearCompare();

  const handleClear = () => {
    clearMutation.mutate();
  };

  const isBusy = loadingStatus || loadingResults || uploadMutation.isPending || clearMutation.isPending;

  if (isBusy) {
    return (
      <div id="loading-overlay" className="loading-overlay">
        <Loader2
          className="animate-spin"
          size={54}
          style={{ color: 'var(--brand-secondary)', marginBottom: '1.25rem' }}
        />
        <h2 style={{ marginBottom: '0.5rem' }}>Comparing Datasets...</h2>
        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '0 1rem' }}>
          Generating comparison metrics and plotting delta charts. Please wait.
        </p>
      </div>
    );
  }

  if (statusError || resultsError) {
    return (
      <motion.div {...fadeUp} className="card" style={{ maxWidth: '680px', margin: '0 auto', textAlign: 'center', padding: '2.5rem' }}>
        <h3 style={{ marginBottom: '0.75rem', color: 'var(--danger)' }}>Failed to load comparison</h3>
        <p className="insight-desc" style={{ marginBottom: '1.5rem' }}>
          Refresh the page or try uploading Dataset B again.
        </p>
        <Link to="/" className="btn btn-primary">
          <Upload size={16} /> Go to Upload
        </Link>
      </motion.div>
    );
  }

  if (!status?.primary_loaded) {
    return (
      <motion.div {...fadeUp} className="card" style={{ maxWidth: '680px', margin: '0 auto', textAlign: 'center', padding: '3rem' }}>
        <FolderMinus size={54} style={{ color: 'var(--text-muted)', marginBottom: '1rem', display: 'inline-block' }} />
        <h3 style={{ marginBottom: '0.75rem', fontSize: '1.2rem', fontWeight: 600 }}>No primary dataset loaded</h3>
        <p className="insight-desc" style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
          Upload a primary dataset from the Home page first. Once that is done, come back here to compare it against a second CSV.
        </p>
        <Link to="/" className="btn btn-primary" style={{ margin: '0 auto', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <Upload size={16} /> Go to Upload
        </Link>
      </motion.div>
    );
  }

  if (!status?.compare_loaded) {
    return (
      <motion.div {...fadeUp} className="card" style={{ maxWidth: '860px', margin: '0 auto', padding: '2.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2.5rem', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '9999px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', fontSize: '0.8rem', fontWeight: 600, marginBottom: '1rem' }}>
              <CheckCircle2 size={14} /> Dataset A Ready
            </div>
            <h3 style={{ marginBottom: '0.5rem', fontSize: '1.25rem', fontWeight: 600 }}>Primary Dataset Loaded</h3>
            <p style={{ fontSize: '0.9rem', lineHeight: 1.5, color: 'var(--text-secondary)', margin: 0 }}>
              Your primary dataset is currently active in memory. Upload a secondary CSV file (Dataset B) to perform comparative cohort analysis.
            </p>
          </div>
          <div>
            <FileDropzone
              onFileDrop={(file) => uploadMutation.mutate(file)}
              isLoading={uploadMutation.isPending}
              disabled={uploadMutation.isPending}
              title="Upload Dataset B"
              subtitle="Drag & drop CSV or click to browse"
              icon={Files}
              compact
            />
          </div>
        </div>
      </motion.div>
    );
  }

  if (!results) return <div className="card" style={{ maxWidth: 680, margin: '0 auto', padding: '2rem', textAlign: 'center' }}>Loading results...</div>;

  const { label_a, label_b, stats_a, stats_b, deltas, data_a, data_b } = results;

  if (isStudentCompareMode) {
    if (loadingDashboard || !dashboard) {
      return <LoadingScreen message="Loading Student Records..." subtitle="Retrieving student parameters and assembling side-by-side metrics." />;
    }

    if (selectedStudents.length === 0) {
      return (
        <motion.div {...fadeUp} className="card" style={{ maxWidth: '680px', margin: '0 auto', textAlign: 'center', padding: '2.5rem' }}>
          <h3 style={{ marginBottom: '0.75rem', color: 'var(--danger)' }}>No students found</h3>
          <p className="insight-desc" style={{ marginBottom: '1.5rem' }}>
            The selected student identifiers are invalid or could not be found in the current dataset.
          </p>
          <Link to="/dashboard" className="btn btn-primary">
            Back to Dashboard
          </Link>
        </motion.div>
      );
    }

    return (
      <motion.div {...fadeUp} style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div className="top-actions" style={{ display: 'flex', justifyContent: 'flex-start' }}>
          <Link to="/dashboard" className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
            &larr; Back to Dashboard
          </Link>
        </div>

        <div className="card">
          <h2 style={{ margin: '0 0 0.35rem 0', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', fontWeight: 600, letterSpacing: '-0.02em' }}>
            <Scale size={18} style={{ color: 'var(--brand-primary)' }} /> Student Comparison
          </h2>
          <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Side-by-side clinical breakdown of {selectedStudents.length} selected students compared against baseline student (<strong>ST-{selectedIndices[0] + 1}</strong>).
          </p>
        </div>

        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(260px, 1fr))`, gap: '1.25rem' }}
        >
          {selectedStudents.map((student, idx) => {
            const studentId = `ST-${selectedIndices[idx] + 1}`;
            const isBaseline = idx === 0;
            const baseline = selectedStudents[0];

            const sleep = Number(student.sleep_hours) || 0;
            const study = Number(student.study_hours) || 0;
            const stress = Number(student.stress_level) || 0;
            const burnout = Number(student.burnout_score) || 0;
            const sentiment = Number(student.sentiment_score) || 0;
            const risk = String(student.risk || 'Low');

            const baseSleep = Number(baseline.sleep_hours) || 0;
            const baseStudy = Number(baseline.study_hours) || 0;
            const baseStress = Number(baseline.stress_level) || 0;
            const baseBurnout = Number(baseline.burnout_score) || 0;
            const baseSentiment = Number(baseline.sentiment_score) || 0;

            return (
              <motion.div key={studentId} variants={staggerItem} className="card" style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderLeft: `4px solid var(--${risk.toLowerCase()})`
              }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem', fontWeight: 600 }}>
                      {studentId} {isBaseline && <span className="badge badge-low" style={{ fontSize: '0.7rem', padding: '2px 8px', background: 'rgba(40, 199, 111, 0.1)', color: 'var(--success)' }}>Baseline</span>}
                    </h3>
                    <span className={`badge badge-${risk.toLowerCase()}`}>
                      {risk} Risk
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Burnout Index</span>
                      <span style={{ fontWeight: 700, display: 'flex', alignItems: 'center' }}>
                        {burnout.toFixed(0)}/100
                        {!isBaseline && renderDeltaBadge(burnout, baseBurnout, true)}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Sleep Hours</span>
                      <span style={{ fontWeight: 500, display: 'flex', alignItems: 'center' }}>
                        {sleep.toFixed(1)} hrs
                        {!isBaseline && renderDeltaBadge(sleep, baseSleep, false, 'h')}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Study Hours</span>
                      <span style={{ fontWeight: 500, display: 'flex', alignItems: 'center' }}>
                        {study.toFixed(1)} hrs
                        {!isBaseline && renderDeltaBadge(study, baseStudy, true, 'h')}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Stress Level</span>
                      <span style={{ fontWeight: 500, display: 'flex', alignItems: 'center' }}>
                        {stress}/10
                        {!isBaseline && renderDeltaBadge(stress, baseStress, true)}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Sentiment Score</span>
                      <span style={{ fontWeight: 500, display: 'flex', alignItems: 'center' }}>
                        {sentiment.toFixed(3)}
                        {!isBaseline && renderDeltaBadge(sentiment, baseSentiment, false)}
                      </span>
                    </div>
                  </div>

                  {student.feedback && (
                    <div className="takeaway-box" style={{ background: 'var(--input-bg)', borderLeftColor: `var(--${risk.toLowerCase()})`, margin: '0.75rem 0 0 0', padding: '0.75rem' }}>
                      <strong style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}>
                        <MessageSquare size={13} /> Qualitative Comment
                      </strong>
                      <p style={{ marginTop: '4px', fontSize: '0.8rem', fontStyle: 'italic', lineHeight: 1.4, margin: '4px 0 0 0' }}>
                        "{student.feedback}"
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', fontWeight: 600, letterSpacing: '-0.02em', margin: 0 }}>
              <ListOrdered size={18} style={{ color: 'var(--brand-primary)' }} /> Metric Comparison Grid
            </h3>
          </div>
          <DataTable
            columns={[
              { key: 'metric', header: 'Metric', width: '25%', style: { fontWeight: 600 } },
              ...selectedStudents.map((_, i) => ({
                key: `student_${i}`,
                header: `ST-${selectedIndices[i] + 1}`,
                width: `${75 / selectedStudents.length}%`,
                style: { textAlign: 'center' as const },
                headerStyle: { textAlign: 'center' as const }
              }))
            ]}
            data={[
              {
                metric: 'Burnout Score',
                ...selectedStudents.reduce((acc, s, i) => {
                  acc[`student_${i}`] = (
                    <span>
                      {Number(s.burnout_score).toFixed(0)}
                      {i > 0 && renderDeltaBadge(Number(s.burnout_score), Number(selectedStudents[0].burnout_score), true)}
                    </span>
                  );
                  return acc;
                }, {} as any)
              },
              {
                metric: 'Sleep Hours',
                ...selectedStudents.reduce((acc, s, i) => {
                  acc[`student_${i}`] = (
                    <span>
                      {Number(s.sleep_hours).toFixed(1)}h
                      {i > 0 && renderDeltaBadge(Number(s.sleep_hours), Number(selectedStudents[0].sleep_hours), false, 'h')}
                    </span>
                  );
                  return acc;
                }, {} as any)
              },
              {
                metric: 'Study Hours',
                ...selectedStudents.reduce((acc, s, i) => {
                  acc[`student_${i}`] = (
                    <span>
                      {Number(s.study_hours).toFixed(1)}h
                      {i > 0 && renderDeltaBadge(Number(s.study_hours), Number(selectedStudents[0].study_hours), true, 'h')}
                    </span>
                  );
                  return acc;
                }, {} as any)
              },
              {
                metric: 'Stress Level',
                ...selectedStudents.reduce((acc, s, i) => {
                  acc[`student_${i}`] = (
                    <span>
                      {s.stress_level}/10
                      {i > 0 && renderDeltaBadge(Number(s.stress_level), Number(selectedStudents[0].stress_level), true)}
                    </span>
                  );
                  return acc;
                }, {} as any)
              },
              {
                metric: 'Sentiment Score',
                ...selectedStudents.reduce((acc, s, i) => {
                  acc[`student_${i}`] = (
                    <span>
                      {Number(s.sentiment_score).toFixed(3)}
                      {i > 0 && renderDeltaBadge(Number(s.sentiment_score), Number(selectedStudents[0].sentiment_score), false)}
                    </span>
                  );
                  return acc;
                }, {} as any)
              }
            ]}
          />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div {...fadeUp} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="top-actions" style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          className="btn btn-outline"
          onClick={handleClear}
          disabled={clearMutation.isPending}
          aria-busy={clearMutation.isPending}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}
        >
          <RotateCw size={15} /> Clear Dataset B
        </button>
      </div>

      {/* Dataset Comparison Header Strip */}
      <div className="card" style={{ padding: '1rem 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--info)' }} />
              <span style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{label_a}</span>
              <span className="badge badge-medium" style={{ fontSize: '0.75rem' }}>{stats_a.n} students</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              <ArrowLeftRight size={15} /> vs
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--warning)' }} />
              <span style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{label_b}</span>
              <span className="badge badge-medium" style={{ fontSize: '0.75rem' }}>{stats_b.n} students</span>
            </div>
          </div>
        </div>
      </div>

      {/* Metric-by-Metric Summary Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', fontWeight: 600, letterSpacing: '-0.02em', margin: 0 }}>
            <ListOrdered size={18} style={{ color: 'var(--brand-primary)' }} /> Metric-by-Metric Summary
          </h3>
        </div>
        <DataTable
          columns={[
            { key: 'label', header: 'Metric', width: '15%', style: { fontWeight: 600 } },
            {
              key: 'va',
              header: label_a,
              width: '12%',
              headerStyle: { color: 'var(--info)', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
              style: { color: 'var(--info)', fontWeight: 500 },
              render: (v, r) => `${v}${r.unit}`
            },
            {
              key: 'vb',
              header: label_b,
              width: '12%',
              headerStyle: { color: 'var(--warning)', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
              style: { color: 'var(--warning)', fontWeight: 500 },
              render: (v, r) => `${v}${r.unit}`
            },
            {
              key: 'd',
              header: 'Δ Change',
              width: '18%',
              render: (d, r) => {
                if (d === null) return <span className="stat-sub">—</span>;
                if (d === 0) {
                  return (
                    <span className="badge" style={{ background: 'var(--input-bg)', color: 'var(--text-secondary)' }}>
                      = flat
                    </span>
                  );
                }
                const positive = d > 0;
                const good = r.lower ? d < 0 : positive;
                return (
                  <span className={`badge ${good ? 'badge-low' : 'badge-high'}`}>
                    {positive ? '+' : ''}
                    {d}
                    {r.unit}{' '}
                    {positive ? <TrendingUp size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> : <TrendingDown size={14} style={{ display: 'inline', verticalAlign: 'middle' }} />}
                  </span>
                );
              }
            },
            {
              key: 'note',
              header: 'Interpretation',
              width: '43%',
              cellStyle: { fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4 }
            }
          ]}
          data={[
            { label: 'Avg Burnout Score', va: stats_a.avg_burnout, vb: stats_b.avg_burnout, d: deltas.avg_burnout, unit: '/100', lower: true, note: 'Lower is healthier — fewer students are overloaded.' },
            { label: 'High-Risk %', va: stats_a.pct_high, vb: stats_b.pct_high, d: deltas.pct_high, unit: '%', lower: true, note: 'The proportion requiring urgent support.' },
            { label: 'Avg Stress Level', va: stats_a.avg_stress, vb: stats_b.avg_stress, d: deltas.avg_stress, unit: '/10', lower: true, note: 'Lower stress means a healthier learning environment.' },
            { label: 'Avg Study Hours', va: stats_a.avg_study, vb: stats_b.avg_study, d: deltas.avg_study, unit: 'h', lower: true, note: 'More study hours often correlates with higher burnout.' },
            { label: 'Avg Sleep Hours', va: stats_a.avg_sleep, vb: stats_b.avg_sleep, d: deltas.avg_sleep, unit: 'h', lower: false, note: 'More sleep is protective; below 6h is a risk threshold.' },
            { label: 'Avg Sentiment', va: stats_a.avg_sentiment, vb: stats_b.avg_sentiment, d: deltas.avg_sentiment, unit: '', lower: false, note: 'Closer to +1 = more positive student feedback tone.' },
          ]}
        />
      </div>

      {/* Risk Tier Breakdown */}
      <div className="card">
        <div style={{ marginBottom: '1.25rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', fontWeight: 600, letterSpacing: '-0.02em', margin: 0 }}>
            <BarChart2 size={18} style={{ color: 'var(--brand-primary)' }} /> Risk Tier Breakdown
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>
            Comparison of student distribution across risk tiers.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
              <div className="card" style={{ textAlign: 'center', borderTop: '3px solid var(--success)', padding: '1rem 0.5rem' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Low Risk</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--success)' }}>{stats_a.low_risk}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--info)', fontWeight: 500 }}>{label_a}</div>
              </div>
              <div className="card" style={{ textAlign: 'center', borderTop: '3px solid var(--info)', padding: '1rem 0.5rem' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Med Risk</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--info)' }}>{stats_a.medium_risk}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--info)', fontWeight: 500 }}>{label_a}</div>
              </div>
              <div className="card" style={{ textAlign: 'center', borderTop: '3px solid var(--danger)', padding: '1rem 0.5rem' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>High Risk</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--danger)' }}>{stats_a.high_risk}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--info)', fontWeight: 500 }}>{label_a}</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
              <div className="card" style={{ textAlign: 'center', borderTop: '3px solid var(--success)', padding: '1rem 0.5rem' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Low Risk</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--success)' }}>{stats_b.low_risk}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--warning)', fontWeight: 500 }}>{label_b}</div>
              </div>
              <div className="card" style={{ textAlign: 'center', borderTop: '3px solid var(--info)', padding: '1rem 0.5rem' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Med Risk</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--info)' }}>{stats_b.medium_risk}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--warning)', fontWeight: 500 }}>{label_b}</div>
              </div>
              <div className="card" style={{ textAlign: 'center', borderTop: '3px solid var(--danger)', padding: '1rem 0.5rem' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>High Risk</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--danger)' }}>{stats_b.high_risk}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--warning)', fontWeight: 500 }}>{label_b}</div>
              </div>
            </div>
          </div>

          <div>
            <CompareRiskBarChart statsA={stats_a} statsB={stats_b} labelA={label_a} labelB={label_b} />
          </div>
        </div>
      </div>

      {/* Visual Comparisons */}
      <div>
        <div style={{ marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <Presentation size={18} style={{ color: 'var(--brand-primary)' }} /> Visual Comparisons
          </h2>
        </div>

        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
        >
          <motion.div variants={staggerItem}>
            <InsightCard
              icon={Waves}
              title="Burnout Score Distributions — Overlaid"
              desc={`Both datasets overlaid on the same axis. Blue = ${label_a}, Orange = ${label_b}.`}
              takeawayLabel="What to look for"
              takeaway="If the orange waveform is shifted right of blue, Dataset B has structurally higher burnout. Overlap in the middle means similar distributions."
            >
              <CompareBurnoutHistChart dataA={data_a} dataB={data_b} labelA={label_a} labelB={label_b} />
            </InsightCard>
          </motion.div>

          <motion.div variants={staggerItem}>
            <InsightCard
              icon={BarChart3}
              title="Burnout Spread — Box Plot"
              desc="Median, interquartile range, and outliers for each dataset's burnout scores."
              takeawayLabel="What to look for"
              takeaway="A higher median line means one cohort is systematically more burned out. Wide boxes mean inconsistent experiences across students."
              reverse
            >
              <CompareBoxChart dataA={data_a} dataB={data_b} labelA={label_a} labelB={label_b} />
            </InsightCard>
          </motion.div>

          <motion.div variants={staggerItem}>
            <InsightCard
              icon={SlidersHorizontal}
              title="Feature Averages — Scaled Side by Side"
              desc="Sleep, Study, Stress, and Burnout averages for each dataset, normalised to a 0–1 scale for fair comparison."
              takeawayLabel="What to look for"
              takeaway="Look for the dataset that has lower sleep AND higher stress — that combination predicts the worst burnout outcomes."
            >
              <CompareFeaturesChart statsA={stats_a} statsB={stats_b} labelA={label_a} labelB={label_b} />
            </InsightCard>
          </motion.div>

          <motion.div variants={staggerItem}>
            <InsightCard
              icon={MessageSquare}
              title="Sentiment Score Distributions — Overlaid"
              desc="VADER compound scores from student feedback text. Scores run from -1 (very negative) to +1 (very positive)."
              takeawayLabel="What to look for"
              takeaway="If distributions look similar despite different burnout scores, students may not be reporting distress in their language."
              reverse
            >
              <CompareSentimentHistChart dataA={data_a} dataB={data_b} labelA={label_a} labelB={label_b} />
            </InsightCard>
          </motion.div>
        </motion.div>
      </div>

      {/* Key Findings Summary */}
      <div className="card" style={{ borderLeft: '4px solid var(--brand-primary)' }}>
        <div style={{ marginBottom: '1rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', fontWeight: 600, letterSpacing: '-0.02em', margin: 0 }}>
            <Brain size={18} style={{ color: 'var(--brand-primary)' }} /> Key Findings Summary
          </h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          <div>
            <h4 style={{ color: 'var(--info)', marginBottom: '0.5rem', fontSize: '0.95rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--info)' }} /> {label_a}
            </h4>
            <ul style={{ paddingLeft: '1.2rem', lineHeight: 1.8, fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
              <li>{stats_a.n} students &mdash; Avg burnout <strong>{stats_a.avg_burnout}</strong></li>
              <li>High-risk cohort: <strong style={{ color: 'var(--danger)' }}>{stats_a.pct_high}%</strong> ({stats_a.high_risk} students)</li>
              <li>Avg sleep: <strong>{stats_a.avg_sleep}h</strong> / Avg stress: <strong>{stats_a.avg_stress}</strong></li>
              <li>Sentiment: <strong>{stats_a.avg_sentiment}</strong> avg compound</li>
            </ul>
          </div>

          <div>
            <h4 style={{ color: 'var(--warning)', marginBottom: '0.5rem', fontSize: '0.95rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--warning)' }} /> {label_b}
            </h4>
            <ul style={{ paddingLeft: '1.2rem', lineHeight: 1.8, fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
              <li>{stats_b.n} students &mdash; Avg burnout <strong>{stats_b.avg_burnout}</strong></li>
              <li>High-risk cohort: <strong style={{ color: 'var(--danger)' }}>{stats_b.pct_high}%</strong> ({stats_b.high_risk} students)</li>
              <li>Avg sleep: <strong>{stats_b.avg_sleep}h</strong> / Avg stress: <strong>{stats_b.avg_stress}</strong></li>
              <li>Sentiment: <strong>{stats_b.avg_sentiment}</strong> avg compound</li>
            </ul>
          </div>
        </div>

        <div className="takeaway-box" style={{ marginTop: '1.25rem', borderLeftColor: 'var(--brand-primary)', background: 'rgba(139, 92, 246, 0.05)', padding: '1rem' }}>
          <strong style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem' }}>
            <Scale size={15} style={{ color: 'var(--brand-primary)' }} /> Overall Verdict
          </strong>
          {deltas.avg_burnout !== null &&
            (deltas.avg_burnout > 3 ? (
              <p style={{ marginTop: '4px', fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                <strong>{label_b}</strong> is notably more burned out (+{deltas.avg_burnout} pts avg). If these represent the same cohort at different times, the situation has worsened and requires attention.
              </p>
            ) : deltas.avg_burnout < -3 ? (
              <p style={{ marginTop: '4px', fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                <strong>{label_a}</strong> carries a higher burnout burden ({Math.abs(deltas.avg_burnout)} pts difference). {label_b} shows a healthier profile by comparison.
              </p>
            ) : (
              <p style={{ marginTop: '4px', fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                Both datasets show broadly similar burnout levels (Δ{deltas.avg_burnout}). Differences are unlikely to be practically significant.
              </p>
            ))}
        </div>
      </div>
    </motion.div>
  );
};

export default Compare;
