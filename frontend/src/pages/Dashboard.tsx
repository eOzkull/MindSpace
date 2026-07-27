import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDashboard } from '../hooks/useDashboard';
import { fadeUp, staggerContainer, staggerItem, modalEntrance } from '../lib/motion';
import {
  BurnoutAreaChart,
  StressBarChart,
  RiskPieChart,
  SleepScatterChart,
  StudyBurnoutChart,
  StressSleepChart,
  SentimentDistChart,
  SentimentBurnoutChart,
  BurnoutBoxChart,
  ConfusionMatrixHeatmap,
} from '../components/charts';
import LoadingScreen from '../components/LoadingScreen';
import DataTable from '../components/tables/DataTable';
import { StatCard, InsightCard } from '../components/cards';
import ChartCard from '../components/cards/ChartCard';

import { useAppStore, selectSearchQuery, selectRiskFilter, selectDashboardCurrentPage, selectDashboardExpanded } from '../store/appStore';
import type { RiskFilter } from '../store/appStore';
import {
  AlertTriangle,
  Pencil,
  Plus,
  Flame,
  ArrowLeftRight,
  TrendingUp,
  Smile,
  Table,
  ChevronDown,
  Search,
  ChevronLeft,
  ChevronRight,
  Presentation,
  BarChart2,
  PieChart,
  Grid,
  Moon,
  BarChart3,
  BookOpen,
  Activity,
  MessageSquare,
  Users,
  Upload,
  CloudUpload,
  X
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const {
    data: dashboard,
    isLoading: loading,
    error,
  } = useDashboard();

  const stats = dashboard?.stats;
  const columns = dashboard?.columns ?? [];
  const data = dashboard?.data ?? [];

  const search = useAppStore(selectSearchQuery);
  const riskFilter = useAppStore(selectRiskFilter);
  const setSearch = useAppStore((s) => s.setSearchQuery);
  const setRiskFilter = useAppStore((s) => s.setRiskFilter);

  const currentPage = useAppStore(selectDashboardCurrentPage);
  const setCurrentPage = useAppStore((s) => s.setDashboardCurrentPage);
  const recordsPerPage = 10;

  const expanded = useAppStore(selectDashboardExpanded);
  const setExpanded = useAppStore((s) => s.setDashboardExpanded);

  const navigate = useNavigate();
  const selectedStudentRows = useAppStore((s) => s.selectedStudentRows);
  const toggleStudentRow = useAppStore((s) => s.toggleStudentRow);
  const clearStudentSelection = useAppStore((s) => s.clearStudentSelection);

  const isRowSelected = (row: any) => {
    const originalIdx = data.indexOf(row);
    return selectedStudentRows.includes(originalIdx);
  };

  const onRowSelectToggle = (row: any) => {
    const originalIdx = data.indexOf(row);
    toggleStudentRow(originalIdx);
  };

  const handleCompareNavigate = () => {
    if (selectedStudentRows.length < 2 || selectedStudentRows.length > 5) return;
    const studentIds = selectedStudentRows.map((idx) => `ST-${idx + 1}`).join(',');
    navigate(`/compare?students=${studentIds}`);
  };

  const tableColumns = React.useMemo(() => {
    return columns.map((c) => ({
      key: c,
      header: c.replace('_', ' ').toUpperCase(),
      render: c === 'risk'
        ? (value: any) => (
          <span className={`badge badge-${String(value || '').toLowerCase()}`}>
            {value}
          </span>
        )
        : undefined,
    }));
  }, [columns]);

  if (error || (!loading && !stats)) {
    const rawError = (error as any)?.body?.error || error?.message || 'No dataset loaded yet.';
    const isNoDataset = rawError.includes('No dataset') || rawError.includes('400');

    return (
      <motion.div {...fadeUp} className="card" style={{ padding: '3.5rem 2rem', textAlign: 'center', maxWidth: '600px', margin: '2rem auto' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(139, 92, 246, 0.1)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-primary)', marginBottom: '1.5rem' }}>
          <CloudUpload size={32} />
        </div>
        <h2 style={{ marginBottom: '0.5rem', fontSize: '1.25rem', fontWeight: 600 }}>{isNoDataset ? 'No Active Dataset' : 'Dashboard Unavailable'}</h2>
        <p className="text-secondary" style={{ marginBottom: '2rem', fontSize: '0.95rem', lineHeight: '1.6' }}>
          {isNoDataset
            ? 'Upload a student cohort CSV dataset from the Home page to unlock interactive visualizations and risk analytics.'
            : rawError}
        </p>
        <Link to="/" className="btn btn-primary" style={{ padding: '10px 24px', fontSize: '0.95rem', display: 'inline-flex', alignItems: 'center', gap: '8px', margin: '0 auto' }}>
          <Upload size={18} /> Go to Upload Page
        </Link>
      </motion.div>
    );
  }

  if (loading) return <LoadingScreen message="Loading Dashboard..." subtitle="Assembling cohort stats and rendering visual insights." />;
  if (!stats) return null;

  const filteredData = data.filter(row => {
    const riskMatch = riskFilter === 'All' || row['risk'] === riskFilter;
    const searchMatch = !search || Object.values(row).some(v => String(v).toLowerCase().includes(search.toLowerCase()));
    return riskMatch && searchMatch;
  });

  const totalPages = Math.ceil(filteredData.length / recordsPerPage);
  const start = (currentPage - 1) * recordsPerPage;
  const currentData = filteredData.slice(start, start + recordsPerPage);

  const riskOptions: RiskFilter[] = ['All', 'Low', 'Medium', 'High'];

  return (
    <motion.div {...fadeUp} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Top Actions */}
      <div className="controls" style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', alignItems: 'center' }}>
        <Link to="/edit" className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem' }}>
          <Pencil size={15} /> Edit Dataset
        </Link>
        <Link to="/" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem' }}>
          <Plus size={15} /> Upload New
        </Link>
      </div>

      {/* Hero Metric Cards */}
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="stats-grid"
      >
        <motion.div variants={staggerItem}>
          <StatCard
            labelIcon={Flame}
            label="Avg Burnout"
            value={stats.avg_burnout}
            subtext="out of 100 max index"
            themeColor="danger"
          />
        </motion.div>
        <motion.div variants={staggerItem}>
          <StatCard
            labelIcon={TrendingUp}
            label="Median / StdDev"
            value={stats.median_burnout}
            subtext={`±${stats.std_burnout} spread`}
            themeColor="info"
          />
        </motion.div>
        <motion.div variants={staggerItem}>
          <StatCard
            labelIcon={AlertTriangle}
            label="High-Risk Students"
            value={stats.high_risk_count}
            subtext={`(${stats.pct_high_risk}% of cohort)`}
            themeColor="brand-primary"
          />
        </motion.div>
        <motion.div variants={staggerItem}>
          <StatCard
            labelIcon={Smile}
            label="Avg Sentiment"
            value={stats.avg_sentiment}
            subtext="compound score (-1 to +1)"
            themeColor="success"
          />
        </motion.div>
      </motion.div>

      {/* Student Records Table Section */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div
          className="accordion-header"
          style={{ padding: '1.25rem 1.5rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', userSelect: 'none' }}
          onClick={() => setExpanded(!expanded)}
        >
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.05rem', fontWeight: 600, letterSpacing: '-0.02em', margin: 0 }}>
            <Table size={18} style={{ color: 'var(--brand-primary)' }} /> Student Records
            <span className="badge badge-brand" style={{ fontSize: '0.75rem', marginLeft: '6px' }}>
              {filteredData.length} matches
            </span>
          </h3>
          <button className="btn btn-outline" aria-label="Toggle data view" style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <span>{expanded ? 'Collapse View' : 'Expand All'}</span>
            <ChevronDown size={16} style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
          </button>
        </div>

        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              style={{ overflow: 'hidden' }}
            >
              {/* Filter & Search Bar */}
              <div className="table-filters" style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: '1', minWidth: '240px' }}>
                  <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    value={search}
                    onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
                    className="filter-input"
                    placeholder="Search students, feedback, scores…"
                    style={{ paddingLeft: '36px', paddingRight: search ? '36px' : '12px', width: '100%', height: 'var(--input-height)' }}
                  />
                  {search && (
                    <button
                      onClick={() => setSearch('')}
                      style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 2, display: 'inline-flex' }}
                      aria-label="Clear search"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Pill Risk Filter Group */}
                <div style={{ display: 'flex', gap: '4px', background: 'var(--input-bg)', padding: '3px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--input-border)' }}>
                  {riskOptions.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => { setRiskFilter(opt); setCurrentPage(1); }}
                      style={{
                        padding: '5px 12px',
                        fontSize: '0.785rem',
                        fontWeight: riskFilter === opt ? 600 : 500,
                        borderRadius: 'var(--radius-xs)',
                        border: 'none',
                        background: riskFilter === opt ? 'var(--brand-primary)' : 'transparent',
                        color: riskFilter === opt ? '#fff' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {opt === 'All' ? 'All Risk' : `${opt} Risk`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Data Table */}
              <DataTable
                id="dashboard-table"
                columns={tableColumns}
                data={currentData}
                showIndex={true}
                startIndex={start + 1}
                selectable={true}
                isRowSelected={isRowSelected}
                onRowSelectToggle={onRowSelectToggle}
              />

              {/* Pagination */}
              <div className="pagination-footer" style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--card-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--card-bg)', flexWrap: 'wrap', gap: '1rem' }}>
                <div className="pagination-info text-secondary" style={{ fontSize: '0.85rem' }}>
                  Showing {filteredData.length ? start + 1 : 0} – {Math.min(start + recordsPerPage, filteredData.length)} of {filteredData.length} records
                </div>
                <div className="pagination-controls" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
                    <ChevronLeft size={15} /> Previous
                  </button>
                  <span style={{ margin: '0 6px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Page {currentPage} of {totalPages || 1}
                  </span>
                  <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages || totalPages === 0} className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
                    Next <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Visual Charts Section */}
      <div>
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 id="charts" style={{ fontSize: '1.1rem', fontWeight: 600, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <Presentation size={18} style={{ color: 'var(--brand-primary)' }} /> Visual Insights
            <span style={{ fontWeight: 400, color: 'var(--text-muted)', fontSize: '0.85rem', marginLeft: '4px' }}>(Interactive ML Visualizations)</span>
          </h2>
        </div>

        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
        >
<<<<<<< HEAD
          <ChartCard icon={BarChart2} title="Burnout Score Distribution" description="Histogram distribution showing how burnout scores are spread across the cohort population." takeaway="Peaks clustered above 60 indicate that a significant portion of this cohort is experiencing high stress levels.">
            <BurnoutAreaChart data={data} />
          </ChartCard>
=======
          <motion.div variants={staggerItem}>
            <InsightCard icon={BarChart2} title="Burnout Score Distribution" desc="How burnout scores are spread across the whole student population." takeaway="Peaks clustered above 60 indicate that a significant portion of this cohort is under chronic pressure.">
              <BurnoutAreaChart data={data} />
            </InsightCard>
          </motion.div>

          <motion.div variants={staggerItem}>
            <InsightCard icon={PieChart} title="Burnout Risk Proportions" desc="Categorical slice of the cohort." takeaway="If High-risk exceeds 25%, the cohort needs structural support." reverse>
              <RiskPieChart data={data} />
            </InsightCard>
          </motion.div>
>>>>>>> 5b96ee4 (fix anomaly bug, recommendations bug, reload errors, framer-motion react19 router error, client.ts errors, minor ui changes)

          <InsightCard icon={PieChart} title="Burnout Risk Proportions" desc="Categorical proportion of students categorized into Low, Medium, and High risk tiers." takeaway="If High-risk exceeds 25%, institutional support policies should be activated." layout="split" reverse>
            <RiskPieChart data={data} />
          </InsightCard>

<<<<<<< HEAD
          <ChartCard icon={TrendingUp} title="Stress Level vs Avg Burnout" description="Average burnout score evaluated at each self-reported stress level step (1 to 10)." takeaway="The escalation from stress level 7 to 8 represents a steep non-linear increase in burnout risk.">
            <StressBarChart data={data} />
          </ChartCard>
=======
          <motion.div variants={staggerItem}>
            <InsightCard icon={Grid} title="Feature Correlation Heatmap" desc="Strength and direction of linear relationships." takeaway="High positive correlations tell you which levers to pull first." reverse>
              {dashboard?.corr_matrix && (
                <ConfusionMatrixHeatmap
                  matrix={dashboard.corr_matrix.data}
                  labels={dashboard.corr_matrix.columns.map((c: string) => c.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase()))}
                  title=""
                />
              )}
            </InsightCard>
          </motion.div>
>>>>>>> 5b96ee4 (fix anomaly bug, recommendations bug, reload errors, framer-motion react19 router error, client.ts errors, minor ui changes)

          <InsightCard icon={Grid} title="Feature Correlation Heatmap" desc="Linear correlation matrix between telemetry factors and burnout risk outcome." takeaway="High positive correlations indicate the strongest predictor vectors in the dataset." layout="split" reverse>
            {dashboard?.corr_matrix && (
              <ConfusionMatrixHeatmap
                matrix={dashboard.corr_matrix.data}
                labels={dashboard.corr_matrix.columns.map((c: string) => c.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase()))}
                title=""
              />
            )}
          </InsightCard>

          <ChartCard icon={Moon} title="Sleep Hours vs Burnout Score" description="Bivariate scatter of individual student sleep hours against calculated burnout score." takeaway="Students sleeping fewer than 5 hours per night almost universally cluster in the high burnout tier.">
            <SleepScatterChart data={data} />
          </ChartCard>

          <InsightCard icon={BarChart3} title="Burnout Score by Risk Tier" desc="Spread and range of burnout scores across the three risk cohorts." takeaway="A wide error spread in the Medium tier indicates borderline classification boundaries." layout="split" reverse>
            <BurnoutBoxChart data={data} />
          </InsightCard>

          <ChartCard icon={BookOpen} title="Study Hours vs Burnout Score" description="Average burnout score at varying weekly study hour intervals." takeaway="Extremely high study hours without proportional rest intervals generate high burnout metrics.">
            <StudyBurnoutChart data={data} />
          </ChartCard>

          <InsightCard icon={Activity} title="Stress Level vs Sleep Hours" desc="Inverse relationship between self-reported stress and nightly sleep duration." takeaway="The downward trajectory confirms that sleep reduction directly correlates with elevated stress." layout="split" reverse>
            <StressSleepChart data={data} />
          </InsightCard>

          <ChartCard icon={MessageSquare} title="Sentiment Score Distribution" description="Sentiment analysis distribution calculated from qualitative feedback text." takeaway="A negative skew in feedback sentiment correlates strongly with elevated risk factors.">
            <SentimentDistChart data={data} />
          </ChartCard>

          <InsightCard icon={Users} title="Sentiment Score vs Burnout Score" desc="Correlation between text sentiment and actual burnout score." takeaway="Outliers in the top-right quadrant represent masking students who self-report high stress with neutral feedback." layout="split" reverse>
            <SentimentBurnoutChart data={data} />
          </InsightCard>
        </motion.div>
      </div>

      {/* Floating Compare Action Panel */}
      <AnimatePresence>
        {selectedStudentRows.length >= 2 && selectedStudentRows.length <= 5 && (
          <motion.div className="floating-action-panel" {...modalEntrance}>
            <div className="panel-content">
              <span className="panel-text">
                <strong>{selectedStudentRows.length}</strong> students selected for compare
              </span>
              <div className="panel-actions">
                <button onClick={clearStudentSelection} className="btn btn-outline" style={{ padding: '6px 14px', fontSize: '0.85rem', borderRadius: 'var(--radius-full)' }}>
                  Clear
                </button>
                <button onClick={handleCompareNavigate} className="btn btn-primary" style={{ padding: '6px 18px', fontSize: '0.85rem', borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  Compare Selected <ArrowLeftRight size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Dashboard;

