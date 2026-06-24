import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchCompareStatus, uploadCompareFile, fetchCompareResults, clearCompare } from '../api';

const Compare: React.FC = () => {
  const [status, setStatus] = useState<any>(null);
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const s = await fetchCompareStatus();
      setStatus(s);
      if (s.primary_loaded && s.compare_loaded) {
        const r = await fetchCompareResults();
        setResults(r);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploading(true);
      await uploadCompareFile(e.target.files[0]);
      await load();
      setUploading(false);
    }
  };

  const handleClear = async () => {
    await clearCompare();
    setResults(null);
    await load();
  };

  if (loading || uploading) {
    return (
      <div id="loading-overlay" style={{ display: 'flex', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 9999, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
        <i className="ph-duotone ph-spinner ph-spin" style={{ fontSize: '4rem', color: 'var(--brand-secondary)', marginBottom: '1.5rem' }}></i>
        <h2 style={{ marginBottom: '0.5rem' }}>Comparing Datasets...</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Generating comparison metrics and plotting delta charts. Please wait.</p>
      </div>
    );
  }

  if (!status?.primary_loaded) {
    return (
      <div className="card" style={{ maxWidth: '680px', margin: '0 auto', textAlign: 'center', padding: '3rem' }}>
        <i className="ph-duotone ph-folder-dashed" style={{ fontSize: '4rem', color: 'var(--text-muted)', marginBottom: '1rem' }}></i>
        <h3 style={{ marginBottom: '0.75rem' }}>No primary dataset loaded</h3>
        <p className="insight-desc" style={{ marginBottom: '1.5rem' }}>
          Upload a primary dataset from the Home page first. Once that is done, come back here to compare it against a second CSV.
        </p>
        <Link to="/" className="btn btn-primary" style={{ margin: '0 auto' }}>
          <i className="ph ph-upload-simple"></i> Go to Upload
        </Link>
      </div>
    );
  }

  if (!status?.compare_loaded) {
    return (
      <div className="card" style={{ maxWidth: '680px', margin: '0 auto', textAlign: 'center' }}>
        <h3 style={{ marginBottom: '0.5rem', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <i className="ph-fill ph-check-circle"></i> Primary dataset loaded
        </h3>
        <p className="insight-desc" style={{ marginBottom: '2rem' }}>
          Your primary dataset is in memory. Upload a second CSV below to run the comparison.
        </p>
        <label className="upload-zone" style={{ padding: '3rem 1.5rem', cursor: 'pointer', display: 'block' }}>
          <i className="ph-duotone ph-files" style={{ fontSize: '3rem', color: 'var(--brand-secondary)', marginBottom: '1rem' }}></i>
          <h4 style={{ marginBottom: '0.5rem' }}>Select Dataset B</h4>
          <p className="insight-desc" style={{ marginBottom: '1.5rem' }}>Click to browse your files</p>
          <input type="file" accept=".csv" onChange={handleUpload} style={{ display: 'none' }} />
        </label>
      </div>
    );
  }

  if (!results) return <div>Loading results...</div>;

  const { label_a, label_b, stats_a, stats_b, deltas, plots } = results;

  const CmpChart = ({ icon, title, desc, insight, img_url, reverse = false }: any) => (
    <div className={`card insight-row ${reverse ? 'reverse' : ''}`} style={{ marginBottom: '2.5rem' }}>
      <div className="insight-text-col">
        <h3 className="insight-title"><i className={`ph-duotone ${icon}`}></i> {title}</h3>
        <p className="insight-desc">{desc}</p>
        <div className="takeaway-box">
          <strong><i className="ph-fill ph-magnifying-glass"></i> What to look for</strong>
          <p style={{ marginTop: '6px' }}>{insight}</p>
        </div>
      </div>
      <div className="insight-visual-col">
        <img src={img_url} alt={title} loading="lazy" style={{ width: '100%', borderRadius: 'var(--radius-md)', border: '1px solid var(--card-border)', background: 'var(--input-bg)' }} />
      </div>
    </div>
  );

  return (
    <>
      <div className="top-actions" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn btn-outline" onClick={handleClear}>
          <i className="ph ph-arrows-clockwise"></i> Clear Dataset B
        </button>
      </div>

      <div className="card" style={{ marginBottom: '2rem', padding: '1.25rem 1.75rem' }}>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.1rem' }}>
            <i className="ph-fill ph-circle" style={{ color: 'var(--info)', fontSize: '1.2rem' }}></i>
            <strong>{label_a}</strong>
            <span className="badge badge-low" style={{ background: 'var(--input-bg)', color: 'var(--text-muted)' }}>{stats_a.n} students</span>
          </div>
          <i className="ph ph-arrows-left-right" style={{ color: 'var(--text-muted)', fontSize: '1.5rem' }}></i>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.1rem' }}>
            <i className="ph-fill ph-circle" style={{ color: 'var(--warning)', fontSize: '1.2rem' }}></i>
            <strong>{label_b}</strong>
            <span className="badge badge-low" style={{ background: 'var(--input-bg)', color: 'var(--text-muted)' }}>{stats_b.n} students</span>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '2rem', padding: 0, overflow: 'hidden' }}>
        <h3 style={{ padding: '1.5rem', borderBottom: '1px solid var(--card-border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <i className="ph-duotone ph-list-numbers"></i> Metric-by-Metric Summary
        </h3>
        <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
          <table>
            <thead>
              <tr>
                <th style={{ whiteSpace: 'nowrap', width: '15%' }}>Metric</th>
                <th style={{ color: 'var(--info)', width: '12%', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={label_a}>{label_a}</th>
                <th style={{ color: 'var(--warning)', width: '12%', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={label_b}>{label_b}</th>
                <th style={{ width: '18%' }}>Δ Change</th>
                <th style={{ width: '43%' }}>Interpretation</th>
              </tr>
            </thead>
            <tbody>
              {[
                { label: "Avg Burnout Score", va: stats_a.avg_burnout, vb: stats_b.avg_burnout, d: deltas.avg_burnout, unit: '/100', lower: true, note: "Lower is healthier — fewer students are overloaded." },
                { label: "High-Risk %", va: stats_a.pct_high, vb: stats_b.pct_high, d: deltas.pct_high, unit: '%', lower: true, note: "The proportion requiring urgent support." },
                { label: "Avg Stress Level", va: stats_a.avg_stress, vb: stats_b.avg_stress, d: deltas.avg_stress, unit: '/10', lower: true, note: "Lower stress means a healthier learning environment." },
                { label: "Avg Study Hours", va: stats_a.avg_study, vb: stats_b.avg_study, d: deltas.avg_study, unit: 'h', lower: true, note: "More study hours often correlates with higher burnout." },
                { label: "Avg Sleep Hours", va: stats_a.avg_sleep, vb: stats_b.avg_sleep, d: deltas.avg_sleep, unit: 'h', lower: false, note: "More sleep is protective; below 6h is a risk threshold." },
                { label: "Avg Sentiment", va: stats_a.avg_sentiment, vb: stats_b.avg_sentiment, d: deltas.avg_sentiment, unit: '', lower: false, note: "Closer to +1 = more positive student feedback tone." },
              ].map(row => {
                const positive = row.d !== null && row.d > 0;
                const negative = row.d !== null && row.d < 0;
                const neutral = row.d === 0;
                const good = row.lower ? negative : positive;
                return (
                  <tr key={row.label}>
                    <td><strong>{row.label}</strong></td>
                    <td style={{ color: 'var(--info)', fontWeight: 500 }}>{row.va}{row.unit}</td>
                    <td style={{ color: 'var(--warning)', fontWeight: 500 }}>{row.vb}{row.unit}</td>
                    <td>
                      {row.d === null ? <span className="stat-sub">—</span> : neutral ? <span className="badge" style={{ background: 'var(--input-bg)', color: 'var(--text-secondary)' }}>= flat</span> : <span className={`badge ${good ? 'badge-low' : 'badge-high'}`}>{positive ? '+' : ''}{row.d}{row.unit} <i className={`ph ${positive ? 'ph-trend-up' : 'ph-trend-down'}`}></i></span>}
                    </td>
                    <td className="insight-desc" style={{ fontSize: '0.85rem', margin: 0 }}>{row.note}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <i className="ph-duotone ph-chart-bar"></i> Risk Tier Breakdown
        </h3>
        <p className="insight-desc" style={{ marginBottom: '1.5rem' }}>How many students fall into each burnout risk category in each dataset.</p>

        <div className="metrics-grid">
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-around' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div className="card" style={{ textAlign: 'center', borderTop: '4px solid var(--success)', padding: '1.25rem 1rem' }}>
                <div className="stat-label" style={{ justifyContent: 'center' }}>Low Risk</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--success)' }}>{stats_a.low_risk}</div>
                <div className="stat-sub" style={{ color: 'var(--info)', fontWeight: 500 }}>{label_a}</div>
              </div>
              <div className="card" style={{ textAlign: 'center', borderTop: '4px solid var(--info)', padding: '1.25rem 1rem' }}>
                <div className="stat-label" style={{ justifyContent: 'center' }}>Med Risk</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--info)' }}>{stats_a.medium_risk}</div>
                <div className="stat-sub" style={{ color: 'var(--info)', fontWeight: 500 }}>{label_a}</div>
              </div>
              <div className="card" style={{ textAlign: 'center', borderTop: '4px solid var(--danger)', padding: '1.25rem 1rem' }}>
                <div className="stat-label" style={{ justifyContent: 'center' }}>High Risk</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--danger)' }}>{stats_a.high_risk}</div>
                <div className="stat-sub" style={{ color: 'var(--info)', fontWeight: 500 }}>{label_a}</div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div className="card" style={{ textAlign: 'center', borderTop: '4px solid var(--success)', padding: '1.25rem 1rem' }}>
                <div className="stat-label" style={{ justifyContent: 'center' }}>Low Risk</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--success)' }}>{stats_b.low_risk}</div>
                <div className="stat-sub" style={{ color: 'var(--warning)', fontWeight: 500 }}>{label_b}</div>
              </div>
              <div className="card" style={{ textAlign: 'center', borderTop: '4px solid var(--info)', padding: '1.25rem 1rem' }}>
                <div className="stat-label" style={{ justifyContent: 'center' }}>Med Risk</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--info)' }}>{stats_b.medium_risk}</div>
                <div className="stat-sub" style={{ color: 'var(--warning)', fontWeight: 500 }}>{label_b}</div>
              </div>
              <div className="card" style={{ textAlign: 'center', borderTop: '4px solid var(--danger)', padding: '1.25rem 1rem' }}>
                <div className="stat-label" style={{ justifyContent: 'center' }}>High Risk</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--danger)' }}>{stats_b.high_risk}</div>
                <div className="stat-sub" style={{ color: 'var(--warning)', fontWeight: 500 }}>{label_b}</div>
              </div>
            </div>
          </div>
          <div>
            <img src={plots.cmp_risk_bar} alt="Risk bar comparison" style={{ width: '100%', borderRadius: 'var(--radius-md)', border: '1px solid var(--card-border)', background: 'var(--input-bg)' }} />
          </div>
        </div>
      </div>

      <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
        <i className="ph-duotone ph-presentation-chart"></i> Visual Comparisons
      </h2>

      <CmpChart icon="ph-waves" title="Burnout Score Distributions — Overlaid" desc={`Both datasets overlaid on the same axis. Blue = ${label_a}, Orange = ${label_b}.`} insight="If the orange waveform is shifted right of blue, Dataset B has structurally higher burnout. Overlap in the middle means similar distributions." img_url={plots.cmp_burnout_hist} />
      <CmpChart icon="ph-chart-polar" title="Burnout Spread — Box Plot" desc="Median, interquartile range, and outliers for each dataset's burnout scores." insight="A higher median line means one cohort is systematically more burned out. Wide boxes mean inconsistent experiences across students — some doing fine, others struggling. Narrow boxes indicate a more uniform experience." img_url={plots.cmp_boxplot} reverse />
      <CmpChart icon="ph-sliders-horizontal" title="Feature Averages — Scaled Side by Side" desc="Sleep, Study, Stress, and Burnout averages for each dataset, normalised to a 0–1 scale for fair comparison. Raw values annotated above bars." insight="Look for the dataset that has lower sleep AND higher stress — that combination predicts the worst burnout outcomes. A dataset leading on both is the higher-priority group for intervention." img_url={plots.cmp_features} />
      <CmpChart icon="ph-chat-teardrop-text" title="Sentiment Score Distributions — Overlaid" desc="VADER compound scores from student feedback text. Scores run from -1 (very negative) to +1 (very positive)." insight="If the distributions look similar despite very different burnout scores, students may not be reporting distress in their language — watch for silent high-burnout groups. A left-shifted distribution with low burnout might indicate external pressures beyond academic load." img_url={plots.cmp_sentiment} reverse />

      <div className="card" style={{ marginBottom: '2rem', border: '2px solid var(--brand-primary)', background: 'linear-gradient(180deg, rgba(139, 92, 246, 0.05) 0%, rgba(24, 24, 27, 0) 100%)' }}>
        <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--brand-primary)' }}>
          <i className="ph-fill ph-brain"></i> Key Findings Summary
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div>
            <h4 style={{ color: 'var(--info)', marginBottom: '0.75rem', fontSize: '1.1rem' }}><i className="ph-fill ph-circle"></i> {label_a}</h4>
            <ul className="insight-desc" style={{ paddingLeft: '1.5rem', lineHeight: 2 }}>
              <li>{stats_a.n} students &mdash; Avg burnout <strong>{stats_a.avg_burnout}</strong></li>
              <li>High-risk cohort: <strong style={{ color: 'var(--danger)' }}>{stats_a.pct_high}%</strong> ({stats_a.high_risk} students)</li>
              <li>Avg sleep: <strong>{stats_a.avg_sleep}h</strong> / Avg stress: <strong>{stats_a.avg_stress}</strong></li>
              <li>Sentiment: <strong>{stats_a.avg_sentiment}</strong> avg compound</li>
            </ul>
          </div>
          <div>
            <h4 style={{ color: 'var(--warning)', marginBottom: '0.75rem', fontSize: '1.1rem' }}><i className="ph-fill ph-circle"></i> {label_b}</h4>
            <ul className="insight-desc" style={{ paddingLeft: '1.5rem', lineHeight: 2 }}>
              <li>{stats_b.n} students &mdash; Avg burnout <strong>{stats_b.avg_burnout}</strong></li>
              <li>High-risk cohort: <strong style={{ color: 'var(--danger)' }}>{stats_b.pct_high}%</strong> ({stats_b.high_risk} students)</li>
              <li>Avg sleep: <strong>{stats_b.avg_sleep}h</strong> / Avg stress: <strong>{stats_b.avg_stress}</strong></li>
              <li>Sentiment: <strong>{stats_b.avg_sentiment}</strong> avg compound</li>
            </ul>
          </div>
        </div>
        <div className="takeaway-box" style={{ marginTop: '1.5rem', borderColor: 'var(--brand-primary)', background: 'rgba(139, 92, 246, 0.1)' }}>
          <strong style={{ color: 'var(--text-primary)' }}><i className="ph-fill ph-scales"></i> Overall verdict</strong>
          {deltas.avg_burnout !== null && (
            deltas.avg_burnout > 3 ? (
              <p style={{ marginTop: '6px' }}><strong>{label_b}</strong> is notably more burned out (+{deltas.avg_burnout} pts avg). If these represent the same cohort at different times, the situation has worsened and requires attention. If different cohorts, {label_b} needs priority support.</p>
            ) : deltas.avg_burnout < -3 ? (
              <p style={{ marginTop: '6px' }}><strong>{label_a}</strong> carries a higher burnout burden ({Math.abs(deltas.avg_burnout)} pts difference). {label_b} shows a healthier profile by comparison.</p>
            ) : (
              <p style={{ marginTop: '6px' }}>Both datasets show broadly similar burnout levels (Δ{deltas.avg_burnout}). Differences are unlikely to be practically significant — look at the risk-tier split and sentiment for more nuanced signals.</p>
            )
          )}
        </div>
      </div>
    </>
  );
};

export default Compare;
