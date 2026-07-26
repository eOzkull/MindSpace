import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDashboard } from '../hooks/useDashboard';
import { fadeUp, staggerContainer, staggerItem } from '../lib/motion';
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

import { useAppStore, selectSearchQuery, selectRiskFilter, selectDashboardCurrentPage, selectDashboardExpanded } from '../store/appStore';
import type { RiskFilter } from '../store/appStore';
import {
  AlertTriangle,
  Pencil,
  Plus,
  Flame,
  ArrowLeftRight,
  TrendingUp,
  LineChart,
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
  CloudUpload
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

  // Pagination and UI state from appStore
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
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.1)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-primary)', marginBottom: '1.5rem' }}>
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

  return (
    <motion.div {...fadeUp} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="controls" style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', alignItems: 'center' }}>
        <Link to="/edit" className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <Pencil size={16} /> Edit Dataset
        </Link>
        <Link to="/" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <Plus size={16} /> Upload New
        </Link>
      </div>

      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="stats-grid"
      >
        <motion.div variants={staggerItem}>
          <StatCard
            labelIcon={Flame}
            bgIcon={Flame}
            label="Avg Burnout"
            value={stats.avg_burnout}
            subtext="out of 100"
            themeColor="danger"
          />
        </motion.div>
        <motion.div variants={staggerItem}>
          <StatCard
            labelIcon={TrendingUp}
            bgIcon={LineChart}
            label="Median / StdDev"
            value={stats.median_burnout}
            subtext={`±${stats.std_burnout} spread`}
            themeColor="info"
          />
        </motion.div>
        <motion.div variants={staggerItem}>
          <StatCard
            labelIcon={AlertTriangle}
            bgIcon={AlertTriangle}
            label="High-Risk Students"
            value={stats.high_risk_count}
            subtext={`(${stats.pct_high_risk}% of cohort)`}
            themeColor="brand-primary"
          />
        </motion.div>
        <motion.div variants={staggerItem}>
          <StatCard
            labelIcon={Smile}
            bgIcon={Smile}
            label="Avg Sentiment"
            value={stats.avg_sentiment}
            subtext="compound score (-1 to +1)"
            themeColor="success"
          />
        </motion.div>
      </motion.div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="accordion-header" style={{ padding: '1.25rem 1.5rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} onClick={() => setExpanded(!expanded)}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', fontWeight: 600, letterSpacing: '-0.02em', margin: 0 }}>
            <Table size={18} style={{ color: 'var(--brand-primary)' }} /> Student Records
            <span className="badge badge-medium" style={{ fontSize: '0.75rem', marginLeft: '6px' }}>{filteredData.length} matches</span>
          </h3>
          <button className="btn btn-outline" aria-label="Toggle data view" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
            <span className="btn-text">{expanded ? 'Collapse View' : 'Expand All'}</span>
            <ChevronDown size={16} className="chevron" style={{ transform: expanded ? 'rotate(180deg)' : '', transition: 'transform 0.2s', marginLeft: '4px' }} />
          </button>
        </div>

        {expanded && (
          <div className="accordion-body open" style={{ marginTop: 0 }}>
            <div className="table-filters" style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flex: '1', minWidth: '220px' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input type="text" value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }} className="filter-input" placeholder="Search feedback, scores…" style={{ paddingLeft: '36px', width: '100%' }} />
              </div>
              <select value={riskFilter} onChange={e => { setRiskFilter(e.target.value as RiskFilter); setCurrentPage(1); }} className="filter-select" style={{ width: '180px' }}>
                <option value="All">All Risk Levels</option>
                <option value="Low">Low Risk</option>
                <option value="Medium">Medium Risk</option>
                <option value="High">High Risk</option>
              </select>
            </div>

            <DataTable
              columns={tableColumns}
              data={currentData}
              showIndex={true}
              startIndex={start + 1}
              selectable={true}
              isRowSelected={isRowSelected}
              onRowSelectToggle={onRowSelectToggle}
            />

            <div className="pagination-footer" style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--card-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--card-bg)', flexWrap: 'wrap', gap: '1rem' }}>
              <div className="pagination-info text-secondary" style={{ fontSize: '0.875rem' }}>
                Showing {filteredData.length ? start + 1 : 0} – {Math.min(start + recordsPerPage, filteredData.length)} of {filteredData.length} records
              </div>
              <div className="pagination-controls" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
                  <ChevronLeft size={16} /> Previous
                </button>
                <span style={{ margin: '0 8px', fontSize: '0.875rem' }}>Page {currentPage} of {totalPages || 1}</span>
                <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages || totalPages === 0} className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
                  Next <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div>
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 id="charts" style={{ fontSize: '1.1rem', fontWeight: 600, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <Presentation size={18} style={{ color: 'var(--brand-primary)' }} /> Visual Insights
            <span style={{ fontWeight: 400, color: 'var(--text-secondary)', fontSize: '0.875rem', marginLeft: '6px' }}>(Scroll to explore)</span>
          </h2>
        </div>

        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}
        >
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

          <motion.div variants={staggerItem}>
            <InsightCard icon={TrendingUp} title="Stress Level vs Avg Burnout" desc="Average burnout score at each self-reported stress level." takeaway="The jump from stress level 7 to 8 is typically steeper.">
              <StressBarChart data={data} />
            </InsightCard>
          </motion.div>

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

          <motion.div variants={staggerItem}>
            <InsightCard icon={Moon} title="Sleep Hours vs Burnout Score" desc="Each dot is a student." takeaway="Students sleeping under 5 hours almost universally appear in the red zone.">
              <SleepScatterChart data={data} />
            </InsightCard>
          </motion.div>

          <motion.div variants={staggerItem}>
            <InsightCard icon={BarChart3} title="Burnout Score by Risk Tier" desc="Mean ± std dev spread across the three risk cohorts." takeaway="A wide error bar in the Medium tier indicates uncertain classification cases." reverse>
              <BurnoutBoxChart data={data} />
            </InsightCard>
          </motion.div>

          <motion.div variants={staggerItem}>
            <InsightCard icon={BookOpen} title="Study Hours vs Burnout Score" desc="Average burnout at each study-hour bracket." takeaway="At high study loads burnout is nearly guaranteed unless sleep is preserved.">
              <StudyBurnoutChart data={data} />
            </InsightCard>
          </motion.div>

          <motion.div variants={staggerItem}>
            <InsightCard icon={Activity} title="Stress Level vs Sleep Hours" desc="Inverse pattern between stress and sleep with regression trendline." takeaway="The downward trend confirms the inverse relationship." reverse>
              <StressSleepChart data={data} />
            </InsightCard>
          </motion.div>

          <motion.div variants={staggerItem}>
            <InsightCard icon={MessageSquare} title="Sentiment Score Distribution" desc="VADER compound score from student feedback." takeaway="A distribution skewed negative signals hidden distress.">
              <SentimentDistChart data={data} />
            </InsightCard>
          </motion.div>

          <motion.div variants={staggerItem}>
            <InsightCard icon={Users} title="Sentiment Score vs Burnout Score" desc="Does language match actual burnout?" takeaway="Outliers are potential maskers — look for high burnout paired with positive sentiment." reverse>
              <SentimentBurnoutChart data={data} />
            </InsightCard>
          </motion.div>
        </motion.div>
      </div>

      {selectedStudentRows.length >= 2 && selectedStudentRows.length <= 5 && (
        <div className="floating-action-panel">
          <div className="panel-content">
            <span className="panel-text">
              <strong>{selectedStudentRows.length}</strong> students selected for comparison
            </span>
            <div className="panel-actions">
              <button onClick={clearStudentSelection} className="btn btn-outline" style={{ padding: '6px 14px', fontSize: '0.85rem', borderRadius: '30px' }}>
                Clear
              </button>
              <button onClick={handleCompareNavigate} className="btn btn-primary" style={{ padding: '6px 18px', fontSize: '0.85rem', borderRadius: '30px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                Compare Selected <ArrowLeftRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Dashboard;
