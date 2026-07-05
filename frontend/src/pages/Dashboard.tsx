import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchDashboard } from '../api/dashboard';
import type { DashboardStats, DashboardPlots, DataRow } from '../types/dashboard';

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [columns, setColumns] = useState<string[]>([]);
  const [data, setData] = useState<DataRow[]>([]);
  const [plots, setPlots] = useState<DashboardPlots | null>(null);

  // Pagination & Filtering
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchDashboard();
        if (res.error) {
          setError(res.error);
        } else {
          if (res.stats) setStats(res.stats);
          if (res.columns) setColumns(res.columns);
          if (res.data) setData(res.data);
          if (res.plots) setPlots(res.plots);
        }
      } catch (err) {
        setError('Failed to load dashboard.');
      }
      setLoading(false);
    };
    load();
  }, []);

  if (loading || !stats || !plots) return <div>Loading...</div>;
  if (error) return <div className="card flash-alert flash-danger"><i className="ph-duotone ph-warning-octagon"></i>{error}</div>;

  const filteredData = data.filter(row => {
    const riskMatch = riskFilter === 'All' || row['risk'] === riskFilter;
    const searchMatch = !search || Object.values(row).some(v => String(v).toLowerCase().includes(search.toLowerCase()));
    return riskMatch && searchMatch;
  });

  const totalPages = Math.ceil(filteredData.length / recordsPerPage);
  const start = (currentPage - 1) * recordsPerPage;
  const currentData = filteredData.slice(start, start + recordsPerPage);

  interface ChartCardProps {
    icon: string;
    title: string;
    desc: string;
    takeaway: string;
    img_url: string;
    img_alt: string;
    reverse?: boolean;
  }

  const ChartCard = ({ icon, title, desc, takeaway, img_url, img_alt, reverse = false }: ChartCardProps) => (
    <div className={`card insight-row ${reverse ? 'reverse' : ''}`} style={{ marginBottom: '2.5rem' }}>
      <div className="insight-text-col">
        <h3 className="insight-title"><i className={`ph-duotone ${icon}`}></i> {title}</h3>
        <p className="insight-desc">{desc}</p>
        <div className="takeaway-box">
          <strong><i className="ph-fill ph-lightbulb"></i> Key Takeaway</strong>
          <p style={{ marginTop: '6px' }}>{takeaway}</p>
        </div>
      </div>
      <div className="insight-visual-col">
        <img src={img_url} alt={img_alt} loading="lazy" />
      </div>
    </div>
  );

  return (
    <>
      <div className="controls" style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', justifyContent: 'flex-end' }}>
        <Link to="/edit" className="btn btn-outline">
          <i className="ph ph-pencil-simple"></i> Edit Dataset
        </Link>
        <Link to="/" className="btn btn-primary">
          <i className="ph ph-plus"></i> Upload New
        </Link>
      </div>

      <div className="stats-grid" style={{ marginBottom: '2.5rem' }}>
        <div className="card stat-card-inner">
          <i className="ph-fill ph-fire bg-icon"></i>
          <div className="stat-label"><i className="ph ph-fire" style={{ color: 'var(--danger)' }}></i> Avg Burnout</div>
          <div className="stat-val" style={{ color: 'var(--danger)' }}>{stats.avg_burnout}</div>
          <div className="stat-sub">out of 100</div>
        </div>
        <div className="card stat-card-inner">
          <i className="ph-fill ph-chart-line bg-icon"></i>
          <div className="stat-label"><i className="ph ph-chart-line" style={{ color: 'var(--info)' }}></i> Median / StdDev</div>
          <div className="stat-val" style={{ color: 'var(--info)' }}>{stats.median_burnout}</div>
          <div className="stat-sub">±{stats.std_burnout} spread</div>
        </div>
        <div className="card stat-card-inner">
          <i className="ph-fill ph-warning-circle bg-icon"></i>
          <div className="stat-label"><i className="ph ph-warning-circle" style={{ color: 'var(--brand-primary)' }}></i> High-Risk Students</div>
          <div className="stat-val" style={{ color: 'var(--brand-primary)' }}>{stats.high_risk_count}</div>
          <div className="stat-sub">({stats.pct_high_risk}% of cohort)</div>
        </div>
        <div className="card stat-card-inner">
          <i className="ph-fill ph-smiley bg-icon"></i>
          <div className="stat-label"><i className="ph ph-smiley" style={{ color: 'var(--success)' }}></i> Avg Sentiment</div>
          <div className="stat-val" style={{ color: 'var(--success)' }}>{stats.avg_sentiment}</div>
          <div className="stat-sub">compound score (-1 to +1)</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '2.5rem', padding: 0, overflow: 'hidden' }}>
        <div className="accordion-header" style={{ padding: '1.5rem', cursor: 'pointer' }} onClick={() => setExpanded(!expanded)}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="ph-duotone ph-table"></i> Student Records
            <span className="badge badge-medium" style={{ fontSize: '0.75rem', marginLeft: '8px' }}>{filteredData.length} matches</span>
          </h3>
          <button className="btn btn-outline" aria-label="Toggle data view">
            <span className="btn-text">{expanded ? 'Collapse View' : 'Expand All'}</span>
            <i className="ph ph-caret-down chevron" style={{ transform: expanded ? 'rotate(180deg)' : '' }}></i>
          </button>
        </div>

        {expanded && (
          <div className="accordion-body open" style={{ marginTop: 0 }}>
            <div className="table-filters">
              <div style={{ position: 'relative' }}>
                <i className="ph ph-magnifying-glass" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}></i>
                <input type="text" value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }} className="filter-input" placeholder="Search feedback, scores…" style={{ paddingLeft: '36px' }} />
              </div>
              <select value={riskFilter} onChange={e => { setRiskFilter(e.target.value); setCurrentPage(1); }} className="filter-select">
                <option value="All">All Risk Levels</option>
                <option value="Low">🟢 Low Risk</option>
                <option value="Medium">🟡 Medium Risk</option>
                <option value="High">🔴 High Risk</option>
              </select>
            </div>

            <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    {columns.map(c => <th key={c}>{c.replace('_', ' ').toUpperCase()}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {currentData.map((row, idx) => (
                    <tr key={idx}>
                      <td className="row-num" style={{ color: 'var(--text-muted)' }}>{start + idx + 1}</td>
                      {columns.map(c => (
                        <td key={c}>
                          {c === 'risk' ? (
                            <span className={`badge badge-${String(row[c] || '').toLowerCase()}`}>{row[c]}</span>
                          ) : (
                            row[c]
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pagination-footer" style={{ padding: '1.25rem 1.75rem', borderTop: '1px solid var(--card-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--card-bg)' }}>
              <div className="pagination-info text-secondary" style={{ fontSize: '0.9rem' }}>
                Showing {filteredData.length ? start + 1 : 0} – {Math.min(start + recordsPerPage, filteredData.length)} of {filteredData.length} records
              </div>
              <div className="pagination-controls" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="btn btn-outline" style={{ padding: '6px 12px' }}>
                  <i className="ph ph-caret-left"></i> Previous
                </button>
                <span style={{ margin: '0 10px' }}>Page {currentPage} of {totalPages || 1}</span>
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0} className="btn btn-outline" style={{ padding: '6px 12px' }}>
                  Next <i className="ph ph-caret-right"></i>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <h2 id="charts" style={{ marginBottom: '2rem', fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
        <i className="ph-duotone ph-presentation-chart"></i> Visual Insights
        <span style={{ fontWeight: 400, color: 'var(--text-secondary)', fontSize: '1rem' }}>(Scroll to explore)</span>
      </h2>

      <ChartCard icon="ph-chart-bar" title="Burnout Score Distribution" desc="How burnout scores are spread across the whole student population." takeaway="Peaks clustered above 60 indicate that a significant portion of this cohort is under chronic pressure." img_url={plots.score_hist} img_alt="Burnout Histogram" />
      <ChartCard icon="ph-chart-pie-slice" title="Burnout Risk Proportions" desc="Categorical slice of the cohort." takeaway="If High-risk exceeds 25%, the cohort needs structural support." img_url={plots.risk_pie} img_alt="Risk Pie" reverse />
      <ChartCard icon="ph-trend-up" title="Stress Level vs Avg Burnout" desc="Average burnout score at each self-reported stress level." takeaway="The jump from stress level 7 to 8 is typically steeper." img_url={plots.stress_vs_burnout} img_alt="Stress vs Burnout" />
      <ChartCard icon="ph-squares-four" title="Feature Correlation Heatmap" desc="Strength and direction of linear relationships." takeaway="High positive correlations tell you which levers to pull first." img_url={plots.correlation_heatmap} img_alt="Correlation Heatmap" reverse />
      <ChartCard icon="ph-moon-stars" title="Sleep Hours vs Burnout Score" desc="Each dot is a student." takeaway="Students sleeping under 5 hours almost universally appear in the red zone." img_url={plots.sleep_vs_burnout} img_alt="Sleep vs Burnout" />
      <ChartCard icon="ph-chart-polar" title="Burnout Score by Risk Tier" desc="Box-and-whisker plot showing full score spread." takeaway="Whiskers stretching far inside the 'Medium' box mean uncertain cases." img_url={plots.burnout_boxplot} img_alt="Burnout Boxplot" reverse />
      <ChartCard icon="ph-book-open-text" title="Study Hours vs Burnout Score" desc="Does studying more always mean more burnout?" takeaway="At high study loads burnout is nearly guaranteed unless sleep is preserved." img_url={plots.study_vs_burnout} img_alt="Study vs Burnout" />
      <ChartCard icon="ph-intersect" title="Stress Level vs Sleep Hours" desc="Pattern between stress and sleep." takeaway="The downward trend confirms the inverse relationship." img_url={plots.stress_vs_sleep} img_alt="Stress vs Sleep" reverse />
      <ChartCard icon="ph-chat-centered-text" title="Sentiment Score Distribution" desc="VADER compound score from student feedback." takeaway="A distribution skewed negative signals hidden distress." img_url={plots.sentiment_dist} img_alt="Sentiment Distribution" />
      <ChartCard icon="ph-users-three" title="Sentiment Score vs Burnout Score" desc="Does language match actual burnout?" takeaway="Outliers are potential maskers." img_url={plots.sentiment_vs_burnout} img_alt="Sentiment vs Burnout" reverse />
    </>
  );
};

export default Dashboard;
