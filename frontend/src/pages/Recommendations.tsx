import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useInsights } from '../hooks/useInsights';
import { ErrorBanner } from '../components/Banner/ErrorBanner';
import LoadingScreen from '../components/LoadingScreen';
import { fadeUp, staggerContainer, staggerItem } from '../lib/motion';
import { ChevronRight, AlertCircle, RefreshCw, Lightbulb } from 'lucide-react';

type RecommendationItem = {
  id: string;
  title: string;
  category: string;
  impact: 'High' | 'Medium' | 'Low';
  cohort: string;
  actionablePlan: string;
  status: 'Pending' | 'Active' | 'Resolved';
};

const OFFLINE_FALLBACK: RecommendationItem[] = [
  {
    id: 'REC-01',
    title: 'Workplace Substitution Restructuring',
    category: 'Policy / Scheduling',
    impact: 'High',
    cohort: 'High Risk Students (Sleep < 5h, Study > 9h)',
    actionablePlan:
      'Establish a late-night assignment submission lock-out (e.g. no submissions accepted between 12:00 AM and 6:00 AM) to force physiological recovery and sleep.',
    status: 'Pending',
  },
  {
    id: 'REC-02',
    title: 'Mandatory Wellness Check-ins',
    category: 'Counseling Outreach',
    impact: 'High',
    cohort: 'Students self-reporting stress level 7 or higher',
    actionablePlan:
      'Automatically schedule a 15-minute informal check-in with a peer mentor or mental health staff advisor within 48 hours of logging stress levels >= 7.',
    status: 'Active',
  },
  {
    id: 'REC-03',
    title: 'Dissonance & Masking Outreach Protocol',
    category: 'Alternative Assessment',
    impact: 'Medium',
    cohort: 'Students flagged with telemetry/sentiment anomalies',
    actionablePlan:
      'Engage students using indirect wellness metrics. Do not confront with analytical risk indicators. Offer non-academic counseling workshops.',
    status: 'Pending',
  },
  {
    id: 'REC-04',
    title: 'Workload Adjustments and Extensions',
    category: 'Academic Support',
    impact: 'Medium',
    cohort: 'Medium Risk students showing increasing burnout index',
    actionablePlan:
      'Recommend course load adjustments or automatic 2-day submission extensions on major assignments to provide brief intervals of relief.',
    status: 'Resolved',
  },
];

const MOCK_RECOMMENDATIONS: RecommendationItem[] = [
  {
    id: "REC-01",
    title: "Workplace Substitution Restructuring",
    category: "Policy / Scheduling",
    impact: "High",
    cohort: "High Risk Students (Sleep < 5h, Study > 9h)",
    actionablePlan: "Establish a late-night assignment submission lock-out (e.g. no submissions accepted between 12:00 AM and 6:00 AM) to force physiological recovery and sleep.",
    status: "Pending"
  },
  {
    id: "REC-02",
    title: "Mandatory Wellness Check-ins",
    category: "Counseling Outreach",
    impact: "High",
    cohort: "Students self-reporting stress level 7 or higher",
    actionablePlan: "Automatically schedule a 15-minute informal check-in with a peer mentor or mental health staff advisor within 48 hours of logging stress levels >= 7.",
    status: "Active"
  },
  {
    id: "REC-03",
    title: "Dissonance & Masking Outreach Protocol",
    category: "Alternative Assessment",
    impact: "Medium",
    cohort: "Students flagged with telemetry/sentiment anomalies",
    actionablePlan: "Engage students using indirect wellness metrics. Do not confront with analytical risk indicators. Offer non-academic counseling workshops.",
    status: "Pending"
  },
  {
    id: "REC-04",
    title: "Workload Adjustments and Extensions",
    category: "Academic Support",
    impact: "Medium",
    cohort: "Medium Risk students showing increasing burnout index",
    actionablePlan: "Recommend course load adjustments or automatic 2-day submission extensions on major assignments to provide brief intervals of relief.",
    status: "Resolved"
  }
];

const Recommendations: React.FC = () => {
  const { data: insightsData, isLoading, isError, refetch } = useInsights();
  const loading = isLoading;
  const error = isError ? 'Could not connect to live recommendations API. Running in offline evaluation mode.' : '';

  const [recommendations, setRecommendations] = useState<RecommendationItem[]>(MOCK_RECOMMENDATIONS);

  useEffect(() => {
    if (insightsData) {
      const recList = Array.isArray(insightsData)
        ? insightsData
        : (insightsData as any)?.recommendations;
      if (Array.isArray(recList) && recList.length > 0) {
        setRecommendations(recList as RecommendationItem[]);
      }
    }
  }, [insightsData]);

  useEffect(() => {
    if (isError) {
      setRecommendations(OFFLINE_FALLBACK);
    }
  }, [isError]);

  const handleToggleStatus = (id: string) => {
    setRecommendations((prev) =>
      prev.map((rec) => {
        if (rec.id !== id) return rec;
        const nextStatusMap: Record<RecommendationItem['status'], RecommendationItem['status']> = {
          Pending: 'Active',
          Active: 'Resolved',
          Resolved: 'Pending',
        };
        const currentStatus: RecommendationItem['status'] = rec.status ?? 'Pending';
        return { ...rec, status: nextStatusMap[currentStatus] };
      }),
    );
  };

  return (
    <motion.div {...fadeUp} style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="top-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <Lightbulb size={18} style={{ color: 'var(--brand-primary)' }} /> Prescriptive Interventions
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>
            Actionable institutional policies based on Machine Learning cohort analysis.
          </p>
        </div>
        <button onClick={() => refetch()} className="btn btn-outline" disabled={loading} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
          <RefreshCw className={loading ? "animate-spin" : ""} size={15} /> Re-evaluate Recommendations
        </button>
      </div>

      {error && (
        <ErrorBanner
          title="Connection Notice"
          message={error}
          variant="warning"
        />
      )}

      {loading ? (
        <LoadingScreen message="Loading Recommendations..." subtitle="Analyzing student cohort stats to determine action guidelines." />
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem' }}
        >
          {recommendations.map((item) => (
            <motion.div
              key={item.id}
              variants={staggerItem}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderLeft: `4px solid ${item.impact === 'High' ? 'var(--danger)' : 'var(--brand-primary)'}`
              }}
            >
              {/* Top Section */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <span className="badge badge-medium" style={{ background: 'var(--input-bg)', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                  {item.category}
                </span>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <span className={`badge badge-${item.impact === 'High' ? 'high' : 'medium'}`} style={{ fontSize: '0.75rem' }}>
                    {item.impact} Impact
                  </span>
                  <button
                    onClick={() => handleToggleStatus(item.id)}
                    className={`badge badge-${(item.status ?? 'pending').toLowerCase()}`}
                    style={{ cursor: 'pointer', border: 'none', fontSize: '0.75rem' }}
                    title="Click to toggle status"
                  >
                    {item.status ?? 'Pending'}
                  </button>
                </div>
              </div>

              {/* Middle Section */}
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 0.35rem 0' }}>{item.title}</h3>

                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <AlertCircle size={14} style={{ color: item.impact === 'High' ? 'var(--danger)' : 'var(--brand-primary)' }} /> Cohort Focus: {item.cohort}
                </div>

                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.5, margin: 0 }}>{item.actionablePlan}</p>
              </div>

              {/* Bottom Section */}
              <div
                style={{
                  marginTop: '1.25rem',
                  paddingTop: '0.75rem',
                  borderTop: '1px solid var(--border-color)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)', fontWeight: 600 }}>ID: {item.id}</span>
                <button
                  onClick={() => handleToggleStatus(item.id)}
                  className="btn btn-outline"
                  style={{ padding: '4px 10px', fontSize: '0.775rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  Change Status <ChevronRight size={13} />
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
};

export default Recommendations;
