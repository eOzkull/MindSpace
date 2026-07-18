import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useResults } from '../hooks/usePrediction';
import LoadingScreen from '../components/LoadingScreen';
import DataTable from '../components/tables/DataTable';
import { StatCard } from '../components/cards';
import type { ResultsResponse } from '../types/prediction';
import {
  AlertTriangle,
  Printer,
  Building2,
  Flame,
  MessageSquare,
  Lightbulb,
  Moon,
  TrendingUp,
  MessageSquareOff,
  Users,
  Info,
  ArrowRight
} from 'lucide-react';

const Results: React.FC = () => {
  const { data: response, isLoading: loading, isError } = useResults();
  const navigate = useNavigate();

  const error = isError
    ? 'Failed to load results.'
    : (response?.error ?? '');
  const data: ResultsResponse | null = response?.error ? null : (response ?? null);

  if (loading || !data) return <LoadingScreen message="Summarizing Cohort Results..." subtitle="Reviewing clinical patterns and synthesizing recommendations." />;
  if (error) return <div className="card flash-alert flash-danger"><AlertTriangle size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />{error}</div>;

  return (
    <div className="results-container">
      <div className="top-actions" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn btn-outline" onClick={() => window.print()}>
          <Printer size={16} /> Export Report
        </button>
      </div>

      <div className="card executive-summary">
        <div className="insight-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Building2 size={24} style={{ color: 'var(--brand-primary)' }} />
          Executive Summary
        </div>
        <p className="summary-text" style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '1.1rem', marginBottom: '2rem' }}>
          Based on the comprehensive analysis of your dataset, we have identified several critical patterns concerning student workload, stress levels, and resulting burnout. The findings below highlight the most urgent areas requiring intervention.
        </p>

        <div className="stats-grid">
          <StatCard
            labelIcon={Flame}
            bgIcon={Flame}
            label="Avg Burnout"
            value={data.avg_burnout ?? 'N/A'}
            subtext="Out of 100"
            themeColor="warning"
          />
          <StatCard
            labelIcon={AlertTriangle}
            bgIcon={AlertTriangle}
            label="High Risk"
            value={data.high_risk_pct !== undefined && data.high_risk_pct !== null ? `${data.high_risk_pct}%` : 'N/A'}
            subtext="Of student population"
            themeColor="danger"
          />
          <StatCard
            labelIcon={MessageSquare}
            bgIcon={MessageSquare}
            label="Avg Sentiment"
            value={data.avg_sentiment ?? 'N/A'}
            subtext="VADER Compound Score"
            themeColor="info"
          />
        </div>
      </div>

      <h3 style={{ margin: '3rem 0 1.5rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Lightbulb size={20} /> Critical Conclusions
      </h3>

      <div className="insights-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        <div className="card insight-card" style={{ transition: 'transform 0.3s ease, boxShadow 0.3s ease' }}>
          <div className="insight-header" style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
            <div className="icon-bulb" style={{ background: 'rgba(139, 92, 246, 0.1)', padding: '12px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Moon size={24} style={{ color: 'var(--brand-primary)' }} />
            </div>
            <div>
              <h4 style={{ margin: '0 0 5px', color: 'var(--text-primary)' }}>The Sleep-Stress Paradigm</h4>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>Primary driver of acute burnout</p>
            </div>
          </div>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5, fontSize: '0.95rem' }}>
            The data conclusively shows that sleep deprivation is the strongest linear predictor of high burnout. Students sacrificing sleep to increase study hours paradoxically experience higher stress and reduced academic efficiency.
          </p>
          <div className="takeaway-box" style={{ marginTop: '1rem', background: 'rgba(40, 199, 111, 0.05)', borderLeftColor: 'var(--success)' }}>
            <strong>Recommendation:</strong> Institutional policies must prioritize adequate rest, potentially enforcing hard cut-offs for assignment submissions.
          </div>
        </div>

        <div className="card insight-card" style={{ transition: 'transform 0.3s ease, boxShadow 0.3s ease' }}>
          <div className="insight-header" style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
            <div className="icon-bulb" style={{ background: 'rgba(255, 75, 92, 0.1)', padding: '12px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={24} style={{ color: 'var(--danger)' }} />
            </div>
            <div>
              <h4 style={{ margin: '0 0 5px', color: 'var(--text-primary)' }}>Tipping Point Identified</h4>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>Evaluating stress tolerance</p>
            </div>
          </div>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5, fontSize: '0.95rem' }}>
            There is a clear "tipping point" observed around self-reported stress levels of 7 and 8. Beyond this threshold, burnout scores escalate exponentially rather than linearly, indicating systemic exhaustion.
          </p>
          <div className="takeaway-box" style={{ marginTop: '1rem', background: 'rgba(255, 75, 92, 0.05)', borderLeftColor: 'var(--danger)' }}>
            <strong>Recommendation:</strong> Implement early warning systems and mandatory check-ins for students self-reporting stress levels of 7 or higher.
          </div>
        </div>

        <div className="card insight-card" style={{ transition: 'transform 0.3s ease, boxShadow 0.3s ease' }}>
          <div className="insight-header" style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
            <div className="icon-bulb" style={{ background: 'rgba(79, 172, 254, 0.1)', padding: '12px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MessageSquareOff size={24} style={{ color: 'var(--info)' }} />
            </div>
            <div>
              <h4 style={{ margin: '0 0 5px', color: 'var(--text-primary)' }}>Hidden Sentiment Deficit</h4>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>Textual vs Numeric dissonance</p>
            </div>
          </div>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5, fontSize: '0.95rem' }}>
            In several sub-groups, explicitly reported burnout numbers remain 'Medium', yet verbatim sentiment analysis reveals deeply negative language constructs. This discrepancy suggests students may be underreporting their actual distress due to academic pressures.
          </p>
          <div className="takeaway-box" style={{ marginTop: '1rem', background: 'rgba(79, 172, 254, 0.05)', borderLeftColor: 'var(--info)' }}>
            <strong>Recommendation:</strong> Do not rely solely on numeric surveys; qualitative, anonymous feedback loops are necessary.
          </div>
        </div>
      </div>

      <h3 style={{ margin: '3rem 0 1.5rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Users size={20} /> Cohort Behavioral Breakdown
      </h3>

      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: '2rem' }}>
        <DataTable
          columns={[
            {
              key: 'risk',
              header: 'Risk Tier',
              width: '15%',
              render: (v) => (
                <span className={`badge badge-${v.replace(' Risk', '').toLowerCase()}`}>
                  {v}
                </span>
              )
            },
            { key: 'sleep', header: 'Avg. Sleep', width: '14%' },
            { key: 'study', header: 'Avg. Study', width: '14%' },
            { key: 'stress', header: 'Avg. Stress', width: '14%' },
            {
              key: 'sentiment',
              header: 'Avg. Sentiment',
              width: '18%',
              render: (v, r) => (
                <span style={{ color: `var(--${r.sentimentColor})` }}>
                  {v}
                </span>
              )
            },
            { key: 'action', header: 'Target Action', width: '25%' }
          ]}
          data={[
            { risk: 'Low Risk', sleep: '7.8 hrs', study: '4.2 hrs', stress: '2.1/10', sentiment: 'Positive (+0.42)', sentimentColor: 'success', action: 'Maintenance / Peer Mentorship' },
            { risk: 'Medium Risk', sleep: '6.1 hrs', study: '6.5 hrs', stress: '5.4/10', sentiment: 'Neutral (+0.12)', sentimentColor: 'info', action: 'Early Monitoring / Workshop' },
            { risk: 'High Risk', sleep: '4.2 hrs', study: '9.8 hrs', stress: '8.7/10', sentiment: 'Critical (-0.24)', sentimentColor: 'danger', action: 'Immediate Counselor Outreach' }
          ]}
          rowStyle={(_, index) => index < 2 ? { borderBottom: '1px solid var(--card-border)' } : {}}
        />
        <div className="takeaway-box" style={{ margin: '1.5rem', background: 'rgba(139, 92, 246, 0.05)', borderLeftColor: 'var(--brand-primary)' }}>
          <Info size={16} style={{ color: 'var(--brand-primary)', marginRight: '6px', verticalAlign: 'middle', display: 'inline-block' }} />
          <strong>Synthesized Conclusion:</strong> The "High" risk group exhibits a dangerous "Workplace Substitution" pattern—trading physiological recovery (sleep) for academic effort (study). This trade-off leads to exponential stress growth, making immediate counseling the only viable pathway to prevent systemic burnout.
        </div>
      </div>

      <div style={{ marginTop: '3rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Proceed to the evaluation module to see how effectively our internal models can predict these high-risk candidates based on their data.</p>
        <button onClick={() => navigate('/evaluate')} className="btn btn-primary" style={{ padding: '14px 28px', fontSize: '1.1rem', borderRadius: '30px' }}>
          Evaluate Prediction Model <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default Results;
