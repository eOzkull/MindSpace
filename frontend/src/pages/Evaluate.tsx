import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { fetchEvaluate } from '../api';

const Evaluate: React.FC = () => {
  const [searchParams] = useSearchParams();
  const target = searchParams.get('dataset') || 'primary';
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetchEvaluate(target);
        if (res.error) {
          setError(res.error);
        } else {
          setData(res);
        }
      } catch (err) {
        setError('Failed to load evaluation metrics.');
      }
      setLoading(false);
    };
    load();
  }, [target]);

  if (loading) return <div>Loading...</div>;

  if (error) {
    return (
      <div className="card" style={{ borderLeft: '4px solid var(--danger)', padding: '2.5rem', textAlign: 'center' }}>
        <i className="ph-duotone ph-warning-octagon" style={{ fontSize: '4rem', color: 'var(--danger)', marginBottom: '1rem' }}></i>
        <h3 style={{ marginBottom: '0.5rem' }}>Model Not Ready</h3>
        <p className="insight-desc">{error}</p>
        {target === 'compare' && (
          <p className="insight-desc" style={{ marginTop: '1rem' }}>
            <Link to="/evaluate?dataset=primary" className="btn btn-outline" style={{ margin: '0 auto' }}>
              <i className="ph ph-arrow-left"></i> Back to Primary Dataset
            </Link>
          </p>
        )}
      </div>
    );
  }

  const metrics = data.metrics;
  const isReady = metrics.f1 >= 0.85 && metrics.recall >= 0.80;
  const readyStatus = isReady ? 'ready' : 'not-ready';

  return (
    <>
      {data.compare_exists && (
        <div className="card" style={{ marginBottom: '2rem', padding: '0.75rem', display: 'flex', justifyContent: 'center', background: 'var(--input-bg)' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Link to="/evaluate?dataset=primary" className={`btn ${target === 'primary' ? 'btn-primary' : 'btn-outline'}`} style={{ padding: '0.6rem 1.5rem', fontSize: '0.9rem' }}>
              <i className="ph ph-database"></i> Primary Dataset
            </Link>
            <Link to="/evaluate?dataset=compare" className={`btn ${target === 'compare' ? 'btn-primary' : 'btn-outline'}`} style={{ padding: '0.6rem 1.5rem', fontSize: '0.9rem' }}>
              <i className="ph ph-arrows-left-right"></i> Comparison Dataset
            </Link>
          </div>
        </div>
      )}

      <div className={`card verdict-card ${readyStatus}`} style={{ 
        background: 'linear-gradient(135deg, rgba(40, 199, 111, 0.05) 0%, rgba(24, 24, 27, 0) 100%)', 
        marginBottom: '2.5rem',
        border: `2px solid var(--${isReady ? 'success' : 'warning'})`
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem' }}>
          <div style={{ padding: '1rem', background: 'var(--input-bg)', borderRadius: '50%', border: '1px solid var(--card-border)' }}>
            <i className={`ph-duotone ${isReady ? 'ph-check-circle' : 'ph-warning-circle'} verdict-icon ${readyStatus}`} style={{ fontSize: '2.5rem', color: `var(--${isReady ? 'success' : 'warning'})` }}></i>
          </div>
          <div>
            <h3 className={`verdict-title ${readyStatus}`} style={{ marginBottom: '0.5rem', fontSize: '1.4rem', color: `var(--${isReady ? 'success' : 'warning'})` }}>
              Deployment Readiness: {isReady ? 'Approved for Production' : 'Further Tuning Advised'}
            </h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '1.05rem', margin: 0 }}>
              {isReady 
                ? 'The model demonstrates robust predictive capabilities, exceeding the 85% F1-score and 80% Recall thresholds. It is highly reliable at identifying high-risk students without generating excessive false alarms.' 
                : 'The model shows promise but falls below our strict deployment thresholds (F1 > 85%, Recall > 80%). We recommend collecting more diverse samples or engineering additional features before using this model for automated outreach.'}
            </p>
          </div>
        </div>
      </div>

      <div className="stats-grid" style={{ marginBottom: '2.5rem' }}>
        <div className="card stat-card-inner">
          <i className="ph-fill ph-target bg-icon"></i>
          <div className="stat-label"><i className="ph ph-target" style={{ color: 'var(--success)' }}></i> Accuracy</div>
          <div className="stat-val" style={{ color: 'var(--success)' }}>{(metrics.accuracy * 100).toFixed(2)}%</div>
          <div className="stat-sub">{metrics.n_test} test samples</div>
        </div>
        <div className="card stat-card-inner">
          <i className="ph-fill ph-scales bg-icon"></i>
          <div className="stat-label"><i className="ph ph-scales" style={{ color: 'var(--brand-primary)' }}></i> F1 Score (weighted)</div>
          <div className="stat-val" style={{ color: 'var(--brand-primary)' }}>{metrics.f1}</div>
          <div className="stat-sub">precision × recall balance</div>
        </div>
        <div className="card stat-card-inner">
          <i className="ph-fill ph-crosshair-simple bg-icon"></i>
          <div className="stat-label"><i className="ph ph-crosshair-simple" style={{ color: 'var(--info)' }}></i> Precision</div>
          <div className="stat-val" style={{ color: 'var(--info)' }}>{metrics.precision}</div>
          <div className="stat-sub">weighted average</div>
        </div>
        <div className="card stat-card-inner">
          <i className="ph-fill ph-magnifying-glass-plus bg-icon"></i>
          <div className="stat-label"><i className="ph ph-magnifying-glass-plus" style={{ color: 'var(--warning)' }}></i> Recall</div>
          <div className="stat-val" style={{ color: 'var(--warning)' }}>{metrics.recall}</div>
          <div className="stat-sub">weighted average</div>
        </div>
      </div>

      <div className="metrics-grid" style={{ marginBottom: '2.5rem', display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '1.5rem' }}>
        <div className="card" style={{ padding: '1.5rem', overflow: 'hidden' }}>
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="ph-duotone ph-grid-four"></i> Confusion Matrix
          </h3>
          {metrics.confusion_matrix && (
            <div className="cm-grid" style={{ '--cm-cols': metrics.class_names.length } as any}>
              <div className="cm-corner"></div>
              {metrics.class_names.map((name: string) => (
                <div key={name} className="cm-head">Predicted<br /><strong style={{ color: 'var(--text-primary)' }}>{name}</strong></div>
              ))}
              {metrics.confusion_matrix.map((row: number[], i: number) => (
                <React.Fragment key={i}>
                  <div className="cm-side">Actual <strong style={{ color: 'var(--text-primary)', marginLeft: '4px' }}>{metrics.class_names[i]}</strong></div>
                  {row.map((val: number, j: number) => (
                    <div key={`${i}-${j}`} className={`cm-cell ${i === j ? 'cm-correct' : 'cm-wrong'}`}>{val}</div>
                  ))}
                </React.Fragment>
              ))}
            </div>
          )}
          <p className="insight-desc" style={{ marginTop: '1.5rem', fontSize: '0.85rem', textAlign: 'center' }}>
            <i className="ph-fill ph-info"></i> Diagonal cells = correct predictions.<br />Off-diagonal = misclassifications.
          </p>
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <h3 style={{ padding: '1.5rem', borderBottom: '1px solid var(--card-border)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <i className="ph-duotone ph-list-dashes"></i> Per-Class Breakdown
          </h3>
          <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
            <table>
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

          <div className="takeaway-box" style={{ margin: '1.5rem', borderRadius: 'var(--radius-sm)', borderLeftColor: 'var(--brand-primary)', background: 'rgba(139, 92, 246, 0.05)' }}>
            <strong style={{ color: 'var(--text-primary)', fontSize: '1.05rem' }}>
              <i className="ph-fill ph-lightbulb" style={{ color: 'var(--brand-primary)' }}></i> Translating Model Efficacy to Student Welfare
            </strong>
            <ul style={{ marginTop: '1rem', lineHeight: 1.8, color: 'var(--text-secondary)', fontSize: '0.95rem', paddingLeft: '1.2rem' }}>
              <li><strong style={{ color: 'var(--info)' }}>Precision:</strong> Of the students proactively flagged, what percentage were truly at risk? Low precision wastes counselling resources on false alarms.</li>
              <li><strong style={{ color: 'var(--warning)' }}>Recall (Sensitivity):</strong> Did the model successfully capture all students in the high-risk cohort? <em>In welfare applications, high recall is prioritized—missing a crisis is worse than a false positive.</em></li>
              <li><strong style={{ color: 'var(--brand-primary)' }}>F1-Score:</strong> The harmonic mean balancing Precision and Recall, indicating overall system robustness against imbalanced classes.</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '2.5rem', background: 'rgba(139, 92, 246, 0.02)' }}>
        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <i className="ph-duotone ph-student"></i> Methodology & Theoretical Framework
        </h3>
        <div className="insights-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          <div style={{ background: 'var(--card-bg)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--card-border)' }}>
            <h4 style={{ color: 'var(--brand-primary)', marginBottom: '0.75rem' }}><i className="ph-fill ph-tree-structure"></i> The Algorithm</h4>
            <p className="insight-desc" style={{ fontSize: '0.95rem' }}>
              MindSpace utilizes a <strong>Random Forest Classifier</strong>. Unlike simple linear models, Random Forest builds an ensemble of decision trees, each voting on the risk level. This handles the "Non-Linear Spikes" in burnout—where stress levels of 8 or 9 combined with low sleep create a risk level significantly higher than the sum of its parts.
            </p>
          </div>
          <div style={{ background: 'var(--card-bg)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--card-border)' }}>
            <h4 style={{ color: 'var(--info)', marginBottom: '0.75rem' }}><i className="ph-fill ph-intersect"></i> Evaluation Mode</h4>
            <p className="insight-desc" style={{ fontSize: '0.95rem' }}>
              We employ a <strong>80/20 Supervised Split</strong>. The uploaded dataset is partitioned: 80% is used for training (learning the patterns) and 20% is reserved as a "Blind Test." The metrics shown above reflect how well the model performed on the blind test—data it had never seen before—ensuring a realistic measure of its diagnostic accuracy.
            </p>
          </div>
          <div style={{ background: 'var(--card-bg)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--card-border)' }}>
            <h4 style={{ color: 'var(--warning)', marginBottom: '0.75rem' }}><i className="ph-fill ph-lightning"></i> Diagnostic Success</h4>
            <p className="insight-desc" style={{ fontSize: '0.95rem' }}>
              Our model "spared" through the data by identifying <strong>Multivariate Clusters</strong>. It doesn't just look at high study hours; it analyzes the <em>ratio</em> of effort to recovery. This allows MindSpace to differentiate between "High-Performance Achievers" (high study, high sleep) and "Burnout Candidates" (high study, low sleep).
            </p>
          </div>
        </div>
      </div>

      {metrics.roc_auc && (
        <div className="card" style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ flexShrink: 0, textAlign: 'center', paddingRight: '1.5rem', borderRight: '1px solid var(--card-border)' }}>
            <div className="stat-label" style={{ justifyContent: 'center' }}>ROC-AUC (OvR)</div>
            <div className="stat-val" style={{ color: 'var(--info)', fontSize: '2rem' }}>{metrics.roc_auc}</div>
          </div>
          <p className="insight-desc" style={{ margin: 0 }}>
            AUC above <strong>0.90</strong> means the model can reliably distinguish between all three risk classes. The closer to 1.0, the less it needs to guess when the decision boundary is tight.
          </p>
        </div>
      )}

      <div className="card">
        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <i className="ph-duotone ph-image"></i> Visual Confusion Matrix
        </h3>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <img src={data.plot} alt="Confusion Matrix Plot" style={{ width: '100%', borderRadius: 'var(--radius-md)', border: '1px solid var(--card-border)', background: 'var(--input-bg)' }} />
        </div>
      </div>
    </>
  );
};

export default Evaluate;
