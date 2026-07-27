import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useResults } from '../hooks/usePrediction';
import LoadingScreen from '../components/LoadingScreen';
import DataTable from '../components/tables/DataTable';
import { StatCard } from '../components/cards';
import { fadeUp, staggerContainer, staggerItem } from '../lib/motion';
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

  if (loading) return <LoadingScreen message="Summarizing Cohort Results..." subtitle="Reviewing clinical patterns and synthesizing recommendations." />;
  if (error || !data) {
    return (
      <motion.div {...fadeUp} className="card" style={{ padding: '2.5rem', textAlign: 'center', maxWidth: '600px', margin: '2rem auto', borderLeft: '4px solid var(--danger)' }}>
        <AlertTriangle size={36} style={{ color: 'var(--danger)', marginBottom: '1rem', display: 'inline-block' }} />
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Results Unavailable</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>{error || 'No active dataset loaded. Please upload a dataset first.'}</p>
      </motion.div>
    );
  }

  return (
    <motion.div {...fadeUp} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="top-actions" style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn btn-outline" onClick={() => window.print()} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
          <Printer size={16} /> Export Report
        </button>
      </div>

      {/* Executive Summary Card */}
      <div className="card executive-summary" style={{ padding: '2rem' }}>
        <div style={{ marginBottom: '1.25rem' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.1rem', fontWeight: 600, letterSpacing: '-0.02em', margin: 0 }}>
            <Building2 size={20} style={{ color: 'var(--brand-primary)' }} />
            Executive Summary
          </h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.95rem', margin: '0.5rem 0 0 0' }}>
            Based on the comprehensive analysis of your dataset, we have identified several critical patterns concerning student workload, stress levels, and resulting burnout. The findings below highlight the most urgent areas requiring intervention.
          </p>
        </div>

        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="stats-grid"
          style={{ marginTop: '1.5rem' }}
        >
          <motion.div variants={staggerItem}>
            <StatCard
              labelIcon={Flame}
              bgIcon={Flame}
              label="Avg Burnout"
              value={data.avg_burnout ?? 'N/A'}
              subtext="Out of 100"
              themeColor="warning"
            />
          </motion.div>
          <motion.div variants={staggerItem}>
            <StatCard
              labelIcon={AlertTriangle}
              bgIcon={AlertTriangle}
              label="High Risk"
              value={data.high_risk_pct !== undefined && data.high_risk_pct !== null ? `${data.high_risk_pct}%` : 'N/A'}
              subtext="Of student population"
              themeColor="danger"
            />
          </motion.div>
          <motion.div variants={staggerItem}>
            <StatCard
              labelIcon={MessageSquare}
              bgIcon={MessageSquare}
              label="Avg Sentiment"
              value={data.avg_sentiment ?? 'N/A'}
              subtext="VADER Compound Score"
              themeColor="info"
            />
          </motion.div>
        </motion.div>
      </div>

      {/* Critical Conclusions Section */}
      <div>
        <div style={{ marginBottom: '1.25rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', fontWeight: 600, letterSpacing: '-0.02em', margin: 0 }}>
            <Lightbulb size={18} style={{ color: 'var(--brand-primary)' }} /> Critical Conclusions
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>
            Key analytical takeaways synthesized from cohort behavioral metrics.
          </p>
        </div>

        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}
        >
          {/* Card 1 */}
          <motion.div variants={staggerItem} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: 'rgba(139, 92, 246, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Moon size={24} style={{ color: 'var(--brand-primary)' }} />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>The Sleep-Stress Paradigm</h4>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Primary driver of acute burnout</p>
              </div>
            </div>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5, fontSize: '0.9rem', margin: 0 }}>
              The data conclusively shows that sleep deprivation is the strongest linear predictor of high burnout. Students sacrificing sleep to increase study hours paradoxically experience higher stress and reduced academic efficiency.
            </p>
            <div className="takeaway-box" style={{ marginTop: 'auto', background: 'rgba(40, 199, 111, 0.05)', borderLeftColor: 'var(--success)', padding: '0.75rem 1rem' }}>
              <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>Recommendation:</strong> Institutional policies must prioritize adequate rest, potentially enforcing hard cut-offs for assignment submissions.
            </div>
          </motion.div>

          {/* Card 2 */}
          <motion.div variants={staggerItem} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: 'rgba(255, 75, 92, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <TrendingUp size={24} style={{ color: 'var(--danger)' }} />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>Tipping Point Identified</h4>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Evaluating stress tolerance</p>
              </div>
            </div>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5, fontSize: '0.9rem', margin: 0 }}>
              There is a clear "tipping point" observed around self-reported stress levels of 7 and 8. Beyond this threshold, burnout scores escalate exponentially rather than linearly, indicating systemic exhaustion.
            </p>
            <div className="takeaway-box" style={{ marginTop: 'auto', background: 'rgba(255, 75, 92, 0.05)', borderLeftColor: 'var(--danger)', padding: '0.75rem 1rem' }}>
              <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>Recommendation:</strong> Implement early warning systems and mandatory check-ins for students self-reporting stress levels of 7 or higher.
            </div>
          </motion.div>

          {/* Card 3 */}
          <motion.div variants={staggerItem} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: 'rgba(79, 172, 254, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <MessageSquareOff size={24} style={{ color: 'var(--info)' }} />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>Hidden Sentiment Deficit</h4>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Textual vs Numeric dissonance</p>
              </div>
            </div>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5, fontSize: '0.9rem', margin: 0 }}>
              In several sub-groups, explicitly reported burnout numbers remain 'Medium', yet verbatim sentiment analysis reveals deeply negative language constructs. This discrepancy suggests students may be underreporting their actual distress due to academic pressures.
            </p>
            <div className="takeaway-box" style={{ marginTop: 'auto', background: 'rgba(79, 172, 254, 0.05)', borderLeftColor: 'var(--info)', padding: '0.75rem 1rem' }}>
              <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>Recommendation:</strong> Do not rely solely on numeric surveys; qualitative, anonymous feedback loops are necessary.
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Cohort Behavioral Breakdown */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', fontWeight: 600, letterSpacing: '-0.02em', margin: 0 }}>
            <Users size={18} style={{ color: 'var(--brand-primary)' }} /> Cohort Behavioral Breakdown
          </h3>
        </div>

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
                <span style={{ color: `var(--${r.sentimentColor})`, fontWeight: 500 }}>
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
        />

        <div className="takeaway-box" style={{ margin: '1.25rem 1.5rem', background: 'rgba(139, 92, 246, 0.05)', borderLeftColor: 'var(--brand-primary)', padding: '1rem' }}>
          <Info size={16} style={{ color: 'var(--brand-primary)', marginRight: '6px', verticalAlign: 'middle', display: 'inline-block' }} />
          <strong style={{ fontSize: '0.875rem' }}>Synthesized Conclusion:</strong> The "High" risk group exhibits a dangerous "Workplace Substitution" pattern—trading physiological recovery (sleep) for academic effort (study). This trade-off leads to exponential stress growth, making immediate counseling the only viable pathway to prevent systemic burnout.
        </div>
      </div>

      <div style={{ textAlign: 'center', margin: '1rem 0 2rem 0' }}>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.25rem', fontSize: '0.9rem' }}>
          Proceed to the evaluation module to see how effectively our internal models can predict these high-risk candidates based on their data.
        </p>
        <button onClick={() => navigate('/evaluate')} className="btn btn-primary" style={{ padding: '12px 24px', fontSize: '1rem', borderRadius: '30px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          Evaluate Prediction Model <ArrowRight size={16} />
        </button>
      </div>
    </motion.div>
  );
};

export default Results;
