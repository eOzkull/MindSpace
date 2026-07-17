import React, { useState } from 'react';
import { useInsights } from '../hooks/useInsights';
import { ChevronRight, AlertCircle, RefreshCw } from 'lucide-react';

interface RecommendationItem {
  id: string;
  title: string;
  category: string;
  impact: 'High' | 'Medium' | 'Low';
  cohort: string;
  actionablePlan: string;
  status: 'Pending' | 'Active' | 'Resolved';
}

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
  const { isLoading, isError, refetch } = useInsights();

  const loading = isLoading;
  const error = isError ? 'Could not connect to live recommendations API. Running in offline evaluation mode.' : '';

  const [recommendations, setRecommendations] = useState<RecommendationItem[]>(MOCK_RECOMMENDATIONS);

  const handleToggleStatus = (id: string) => {
    setRecommendations(prev =>
      prev.map(rec => {
        if (rec.id === id) {
          const nextStatusMap: Record<RecommendationItem['status'], RecommendationItem['status']> = {
            'Pending': 'Active',
            'Active': 'Resolved',
            'Resolved': 'Pending'
          };
          return { ...rec, status: nextStatusMap[rec.status] };
        }
        return rec;
      })
    );
  };

  return (
    <div className="recommendations-container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div className="top-actions" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={() => refetch()} className="btn btn-outline" disabled={loading}>
          <RefreshCw className={loading ? "animate-spin" : ""} size={16} /> Re-evaluate Recommendations
        </button>
      </div>

      {error && (
        <div className="card flash-alert flash-warning" style={{ marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={20} style={{ color: 'var(--warning)' }} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div>Loading recommendations...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1.5rem' }}>
          {recommendations.map((item) => (
            <div 
              key={item.id} 
              className="card" 
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'space-between',
                borderLeft: `4px solid var(--${item.impact === 'High' ? 'danger' : 'brand-primary'})`
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <span className="badge badge-low" style={{ background: 'var(--input-bg)', color: 'var(--text-muted)' }}>
                    {item.category}
                  </span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <span className={`badge badge-${item.impact === 'High' ? 'high' : 'medium'}`}>
                      {item.impact} Impact
                    </span>
                    <button 
                      onClick={() => handleToggleStatus(item.id)}
                      className={`badge badge-${item.status.toLowerCase()}`}
                      style={{ cursor: 'pointer', border: 'none' }}
                      title="Click to toggle status"
                    >
                      {item.status}
                    </button>
                  </div>
                </div>

                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                  {item.title}
                </h3>

                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <AlertCircle size={14} /> Cohort Focus: {item.cohort}
                </div>

                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.5, margin: 0 }}>
                  {item.actionablePlan}
                </p>
              </div>

              <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--card-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                  ID: {item.id}
                </span>
                <button 
                  onClick={() => handleToggleStatus(item.id)}
                  className="btn btn-outline" 
                  style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  Change Status <ChevronRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Recommendations;
