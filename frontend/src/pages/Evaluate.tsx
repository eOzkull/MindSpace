import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useEvaluate } from '../hooks/usePrediction';
import { ConfusionMatrixHeatmap } from '../components/charts';
import LoadingScreen from '../components/LoadingScreen';
import { StatCard } from '../components/cards';
import SegmentedControl from '../components/ui/SegmentedControl';
import { fadeUp, staggerContainer, staggerItem } from '../lib/motion';
import type { EvaluateResponse } from '../types/evaluate';
import {
  AlertTriangle,
  ArrowLeft,
  Database,
  ArrowLeftRight,
  CheckCircle2,
  Target,
  Scale,
  Crosshair,
  ZoomIn,
  Grid,
  Info,
  List,
  Lightbulb,
  GraduationCap,
  Network,
  Activity,
  Zap,
  AlertCircle
} from 'lucide-react';

const Evaluate: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const target = searchParams.get('dataset') || 'primary';
  const { data: response, isLoading: loading, isError } = useEvaluate(target);

  const error = isError
    ? 'Failed to load evaluation metrics.'
    : (response?.error ?? '');
  const data: EvaluateResponse | null = response?.error ? null : (response ?? null);

  if (loading) return <LoadingScreen message="Evaluating Model..." subtitle="Reading accuracy, recall, and computing validation metrics." />;

  if (error || !data || !data.metrics) {
    return (
      <motion.div {...fadeUp} className="card" style={{ borderLeft: '4px solid var(--danger)', padding: '2.5rem', textAlign: 'center', maxWidth: '600px', margin: '2rem auto' }}>
        <AlertCircle size={48} style={{ color: 'var(--danger)', marginBottom: '1rem', display: 'inline-block' }} />
        <h3 style={{ marginBottom: '0.5rem', fontSize: '1.2rem', fontWeight: 600 }}>Model Not Ready</h3>
<<<<<<< HEAD
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>{error || 'No dataset loaded or evaluation metrics unavailable.'}</p>
=======
        <p className="insight-desc" style={{ color: 'var(--text-secondary)' }}>{error || 'No dataset loaded or evaluation metrics unavailable.'}</p>
>>>>>>> 5b96ee4 (fix anomaly bug, recommendations bug, reload errors, framer-motion react19 router error, client.ts errors, minor ui changes)
        {target === 'compare' && (
          <div style={{ marginTop: '1.5rem' }}>
            <button onClick={() => navigate('/evaluate?dataset=primary')} className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <ArrowLeft size={16} /> Back to Primary Dataset
            </button>
          </div>
        )}
      </motion.div>
    );
  }

  const metrics = data.metrics;
  const isReady = metrics.f1 >= 0.85 && metrics.recall >= 0.80;

  return (
    <motion.div {...fadeUp} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Segmented Control Dataset Selector */}
      {data.compare_exists && (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <SegmentedControl
            options={[
              { value: 'primary', label: 'Primary Dataset', icon: Database },
              { value: 'compare', label: 'Comparison Dataset', icon: ArrowLeftRight },
            ]}
            value={target}
            onChange={(val) => navigate(`/evaluate?dataset=${val}`)}
          />
        </div>
      )}

      {/* Verdict Card */}
<<<<<<< HEAD
      <div className="card" style={{
=======
      <div className={`card verdict-card ${readyStatus}`} style={{
>>>>>>> 5b96ee4 (fix anomaly bug, recommendations bug, reload errors, framer-motion react19 router error, client.ts errors, minor ui changes)
        padding: '1.75rem',
        borderLeft: `4px solid var(--${isReady ? 'success' : 'warning'})`,
        background: isReady ? 'rgba(40, 199, 111, 0.03)' : 'rgba(255, 171, 0, 0.03)',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.25rem' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: isReady ? 'rgba(40, 199, 111, 0.12)' : 'rgba(255, 171, 0, 0.12)',
            border: `1px solid ${isReady ? 'rgba(40,199,111,0.25)' : 'rgba(255,171,0,0.25)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            {isReady ? (
              <CheckCircle2 size={22} style={{ color: 'var(--success)' }} />
            ) : (
              <AlertTriangle size={22} style={{ color: 'var(--warning)' }} />
            )}
          </div>
          <div>
            <h3 style={{ marginBottom: '0.4rem', fontSize: '1.05rem', fontWeight: 600, color: isReady ? 'var(--success)' : 'var(--warning)' }}>
              {isReady ? '✓ Approved for Production Deployment' : '⚠ Further Tuning Advised'}
            </h3>
<<<<<<< HEAD
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.9rem', margin: 0 }}>
              {isReady
                ? 'The model exceeds the 85% F1-score and 80% Recall thresholds — reliably identifying high-risk students without excessive false alarms.'
                : 'Falls below deployment thresholds (F1 > 85%, Recall > 80%). Recommend collecting more diverse samples or engineering additional features before automated outreach.'}
=======
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.925rem', margin: 0 }}>
              {isReady
                ? 'The model demonstrates robust predictive capabilities, exceeding the 85% F1-score and 80% Recall thresholds. It is highly reliable at identifying high-risk students without generating excessive false alarms.'
                : 'The model shows promise but falls below our strict deployment thresholds (F1 > 85%, Recall > 80%). We recommend collecting more diverse samples or engineering additional features before using this model for automated outreach.'}
>>>>>>> 5b96ee4 (fix anomaly bug, recommendations bug, reload errors, framer-motion react19 router error, client.ts errors, minor ui changes)
            </p>
          </div>
        </div>
      </div>

      {/* Staggered Metrics Grid */}
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="stats-grid"
      >
        <motion.div variants={staggerItem}>
          <StatCard
            labelIcon={Target}
            label="Accuracy"
            value={`${(metrics.accuracy * 100).toFixed(2)}%`}
            subtext={`${metrics.n_test} test samples`}
            themeColor="success"
          />
        </motion.div>
        <motion.div variants={staggerItem}>
          <StatCard
            labelIcon={Scale}
            label="F1 Score (weighted)"
            value={metrics.f1}
            subtext="precision × recall balance"
            themeColor="brand-primary"
          />
        </motion.div>
        <motion.div variants={staggerItem}>
          <StatCard
            labelIcon={Crosshair}
            label="Precision"
            value={metrics.precision}
            subtext="weighted average"
            themeColor="info"
          />
        </motion.div>
        <motion.div variants={staggerItem}>
          <StatCard
            labelIcon={ZoomIn}
            label="Recall"
            value={metrics.recall}
            subtext="weighted average"
            themeColor="warning"
          />
        </motion.div>
      </motion.div>

      {/* Metrics Detail Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
        {/* Confusion Matrix Card */}
        <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', fontWeight: 600, letterSpacing: '-0.02em', margin: 0 }}>
            <Grid size={18} style={{ color: 'var(--brand-primary)' }} /> Confusion Matrix
          </h3>
          {metrics.confusion_matrix && (
            <ConfusionMatrixHeatmap matrix={metrics.confusion_matrix} labels={metrics.class_names} title="" />
          )}
          <p style={{ marginTop: 'auto', fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', margin: 0 }}>
            <Info size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
            Diagonal cells = correct predictions. Off-diagonal = misclassifications.
          </p>
        </div>

        {/* Per-Class Breakdown Table Card */}
        <div className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', fontWeight: 600, letterSpacing: '-0.02em', margin: 0 }}>
              <List size={18} style={{ color: 'var(--brand-primary)' }} /> Per-Class Breakdown
            </h3>
          </div>
          <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Class</th>
                  <th>Precision</th>
                  <th>Recall</th>
                  <th>F1</th>
                  <th>Support</th>
                </tr>
              </thead>
              <tbody>
                {metrics.class_names.map((name: string) => {
                  const cls = metrics.report[name];
                  return (
                    <tr key={name}>
                      <td><span className={`badge badge-${name.toLowerCase()}`}>{name}</span></td>
                      <td>{cls['precision'].toFixed(2)}</td>
                      <td>{cls['recall'].toFixed(2)}</td>
                      <td><strong style={{ color: 'var(--brand-primary)' }}>{cls['f1-score'].toFixed(2)}</strong></td>
                      <td style={{ color: 'var(--text-muted)' }}>{Math.round(cls['support'])}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="takeaway-box" style={{ margin: '1.25rem 1.5rem', borderRadius: 'var(--radius-sm)', borderLeftColor: 'var(--brand-primary)', background: 'rgba(139, 92, 246, 0.05)', padding: '1rem' }}>
            <strong style={{ color: 'var(--text-primary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Lightbulb size={15} style={{ color: 'var(--brand-primary)' }} /> Translating Model Efficacy to Student Welfare
            </strong>
            <ul style={{ marginTop: '0.75rem', lineHeight: 1.6, color: 'var(--text-secondary)', fontSize: '0.85rem', paddingLeft: '1.2rem', margin: '0.75rem 0 0 0' }}>
              <li><strong style={{ color: 'var(--info)' }}>Precision:</strong> Percentage of flagged students truly at risk. High precision avoids false alarm fatigue.</li>
              <li><strong style={{ color: 'var(--warning)' }}>Recall:</strong> Percentage of actual high-risk students captured. <em>Missing a student crisis is far worse than a false alarm.</em></li>
              <li><strong style={{ color: 'var(--brand-primary)' }}>F1-Score:</strong> Harmonic balance of precision and recall.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Methodology Section */}
      <div className="card" style={{ background: 'rgba(139, 92, 246, 0.02)' }}>
        <div style={{ marginBottom: '1.25rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.1rem', fontWeight: 600, letterSpacing: '-0.02em', margin: 0 }}>
            <GraduationCap size={20} style={{ color: 'var(--brand-primary)' }} /> Methodology & Theoretical Framework
          </h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          <div style={{ background: 'var(--card-bg)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <h4 style={{ color: 'var(--brand-primary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.95rem', fontWeight: 600 }}>
              <Network size={18} /> The Algorithm
            </h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
              MindSpace utilizes a <strong>Random Forest Classifier</strong> to model complex non-linear burnout spikes from study/sleep interactions.
            </p>
          </div>
          <div style={{ background: 'var(--card-bg)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <h4 style={{ color: 'var(--info)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.95rem', fontWeight: 600 }}>
              <Activity size={18} /> Evaluation Split
            </h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
              An <strong>80/20 train/test split</strong> ensures reported metrics reflect performance on unseen blind test data.
            </p>
          </div>
          <div style={{ background: 'var(--card-bg)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <h4 style={{ color: 'var(--warning)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.95rem', fontWeight: 600 }}>
              <Zap size={18} /> Diagnostic Target
            </h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
              Identifies <strong>multivariate clusters</strong> to distinguish high achievers from genuine burnout candidates.
            </p>
          </div>
        </div>
      </div>

      {/* ROC-AUC Banner */}
      {metrics.roc_auc && (
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.25rem 1.5rem' }}>
          <div style={{ flexShrink: 0, textAlign: 'center', paddingRight: '1.5rem', borderRight: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>ROC-AUC (OvR)</div>
            <div style={{ color: 'var(--info)', fontSize: '1.8rem', fontWeight: 700, lineHeight: 1.2, marginTop: '2px' }}>{metrics.roc_auc}</div>
          </div>
          <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            AUC above <strong>0.90</strong> indicates exceptional discrimination capacity between Low, Medium, and High risk tiers.
          </p>
        </div>
      )}

    </motion.div>
  );
};

export default Evaluate;
