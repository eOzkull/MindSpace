import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAppStore, selectSelectedPredictionDataset } from '../store/appStore';
import { useEvaluate } from '../hooks/usePrediction';
import { useDebounce } from '../hooks/useDebounce';
import { fadeUp } from '../lib/motion';
import { Sparkles, Brain, AlertTriangle, Moon, BookOpen, AlertCircle, RefreshCw } from 'lucide-react';

const Predict: React.FC = () => {
  const selectedDataset = useAppStore(selectSelectedPredictionDataset);
  const setSelectedDataset = useAppStore((s) => s.setSelectedPredictionDataset);

  // Debounce remote prediction requests by 300ms via reusable hook
  const debouncedDataset = useDebounce(selectedDataset, 300);

  // Reuse existing prediction hook to keep backend model metadata support intact
  const { data: evaluateData } = useEvaluate(debouncedDataset);
  const metrics = evaluateData?.metrics;

  // Controlled form inputs
  const [studentId, setStudentId] = useState('ST-9021');
  const [sleepHours, setSleepHours] = useState(6.5);
  const [studyHours, setStudyHours] = useState(5.0);
  const [stressLevel, setStressLevel] = useState(5);
  const [feedbackText, setFeedbackText] = useState('Feeling a bit overwhelmed with assignments lately, but trying to keep up.');

  // useMemo for deterministic calculations (reactive, immediate update)
  const result = useMemo(() => {
    let score = (stressLevel * 8) + (studyHours * 1.5) - (sleepHours * 4);

    // Simple sentiment estimation from feedbackText (simulate VADER)
    let sentiment = 0.0;
    const lowerText = feedbackText.toLowerCase();
    if (lowerText.includes('overwhelmed') || lowerText.includes('stress') || lowerText.includes('tired') || lowerText.includes('hard')) {
      sentiment -= 0.3;
    }
    if (lowerText.includes('happy') || lowerText.includes('good') || lowerText.includes('manageable') || lowerText.includes('easy')) {
      sentiment += 0.3;
    }
    if (lowerText.includes('depressed') || lowerText.includes('burnout') || lowerText.includes('exhausted') || lowerText.includes('cannot cope')) {
      sentiment -= 0.5;
    }

    // Sentiment adjustment
    score -= sentiment * 20;

    // Adjust slightly based on selected prediction model dataset base
    if (selectedDataset === 'compare') {
      score += 5;
    }

    // Clamp score
    score = Math.max(0, Math.min(100, Math.round(score)));

    // Determine risk tier
    let risk: 'Low' | 'Medium' | 'High' = 'Low';
    if (score >= 70) {
      risk = 'High';
    } else if (score >= 40) {
      risk = 'Medium';
    }

    let explanation = '';
    if (risk === 'High') {
      explanation = 'Critical warning. Student shows high stress coupled with low recovery hours. The textual analysis signals distress. Immediate advisor intervention is recommended.';
    } else if (risk === 'Medium') {
      explanation = 'Moderate risk. Balance is tipping. Monitor study load and sleep habits. Recommend time-management workshop.';
    } else {
      explanation = 'Low risk. Student appears to have sustainable study hours and sufficient sleep to buffer stress levels.';
    }

    return { score, risk, explanation };
  }, [sleepHours, studyHours, stressLevel, feedbackText, selectedDataset]);

  const handleReset = () => {
    setStudentId('ST-9021');
    setSleepHours(6.5);
    setStudyHours(5.0);
    setStressLevel(5);
    setFeedbackText('');
  };

  const getRiskColorVar = (risk: 'Low' | 'Medium' | 'High') => {
    return risk === 'High' ? 'var(--danger)' : risk === 'Medium' ? 'var(--info)' : 'var(--success)';
  };

  return (
    <motion.div {...fadeUp} style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Active Model Top Strip */}
      <div className="card" style={{ padding: '1rem 1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: 'rgba(99, 102, 241, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--brand-primary)'
            }}>
              <Brain size={18} />
            </div>
            <div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block' }}>Active Prediction Model</span>
              {metrics ? (
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '2px' }}>
                  <span className="badge badge-medium" style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                    Accuracy: {(metrics.accuracy * 100).toFixed(1)}%
                  </span>
                  <span className="badge badge-medium" style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                    F1 Score: {metrics.f1}
                  </span>
                </div>
              ) : (
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>Standard Cohort Classifier</span>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setSelectedDataset('primary')}
              className={`btn ${selectedDataset === 'primary' ? 'btn-primary' : 'btn-outline'}`}
              style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}
            >
              Primary Cohort Model
            </button>
            {evaluateData?.compare_exists && (
              <button
                onClick={() => setSelectedDataset('compare')}
                className={`btn ${selectedDataset === 'compare' ? 'btn-primary' : 'btn-outline'}`}
                style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}
              >
                Compare Cohort Model
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem' }}>
        {/* Left Form Panel */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', fontWeight: 600, letterSpacing: '-0.02em', margin: 0 }}>
              <Sparkles size={18} style={{ color: 'var(--brand-primary)' }} /> Input Student Metrics
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>
              Adjust features to dynamically calculate real-time burnout index.
            </p>
          </div>

          <form onSubmit={(e) => e.preventDefault()} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontWeight: 500, fontSize: '0.875rem' }}>Student ID / Ref</label>
                <span className="badge badge-medium" style={{ fontSize: '0.75rem' }}>{studentId}</span>
              </div>
              <input
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="filter-input"
                style={{ width: '100%' }}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500, fontSize: '0.875rem' }}>
                    <Moon size={15} style={{ color: 'var(--brand-primary)' }} /> Sleep
                  </label>
                  <span className="badge badge-medium" style={{ fontSize: '0.75rem' }}>{sleepHours}h</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="12"
                  step="0.5"
                  value={sleepHours}
                  onChange={(e) => setSleepHours(parseFloat(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--brand-primary)', cursor: 'pointer' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500, fontSize: '0.875rem' }}>
                    <BookOpen size={15} style={{ color: 'var(--brand-primary)' }} /> Study
                  </label>
                  <span className="badge badge-medium" style={{ fontSize: '0.75rem' }}>{studyHours}h</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="14"
                  step="0.5"
                  value={studyHours}
                  onChange={(e) => setStudyHours(parseFloat(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--brand-primary)', cursor: 'pointer' }}
                />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500, fontSize: '0.875rem' }}>
                  <AlertCircle size={15} style={{ color: 'var(--brand-primary)' }} /> Stress Level (1–10)
                </label>
                <span className="badge badge-medium" style={{ fontSize: '0.75rem' }}>{stressLevel}/10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={stressLevel}
                onChange={(e) => setStressLevel(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--brand-primary)', cursor: 'pointer' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500, fontSize: '0.875rem' }}>
                Student Comments / Qualitative Feedback
              </label>
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Describe academic pressure, motivation level or feedback..."
                style={{
                  width: '100%',
                  height: '90px',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  background: 'var(--input-bg)',
                  color: 'var(--text-primary)',
                  fontFamily: 'inherit',
                  fontSize: '0.875rem',
                  resize: 'vertical'
                }}
              />
            </div>
          </form>
        </div>

        {/* Right Diagnostic Panel */}
        <div className="card" style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          borderLeft: `4px solid ${getRiskColorVar(result.risk)}`,
          transition: 'border-left-color 0.2s ease'
        }}>
          <div>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', fontWeight: 600, letterSpacing: '-0.02em', margin: '0 0 1.5rem 0' }}>
              Diagnostic Results
            </h3>

            <div style={{ textAlign: 'center', margin: '1.5rem 0 2rem 0' }}>
              <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: 600 }}>
                Burnout Score Index
              </span>
              <div style={{
                fontSize: '3.5rem',
                fontWeight: 800,
                lineHeight: 1.1,
                color: getRiskColorVar(result.risk),
                margin: '0.5rem 0',
                transition: 'color 0.2s ease'
              }}>
                {result.score}
              </div>
              <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'center' }}>
                <span className={`badge badge-${result.risk.toLowerCase()}`} style={{
                  fontSize: '0.9rem',
                  padding: '6px 18px',
                  borderRadius: '9999px',
                  fontWeight: 600
                }}>
                  {result.risk} Risk Tier
                </span>
              </div>
            </div>

            <div className="takeaway-box" style={{
              background: 'var(--input-bg)',
              borderLeft: `3px solid ${getRiskColorVar(result.risk)}`,
              padding: '1rem',
              borderRadius: '6px',
              transition: 'border-left-color 0.2s ease'
            }}>
              <strong style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                <AlertTriangle size={15} style={{ color: getRiskColorVar(result.risk) }} /> Clinical Breakdown
              </strong>
              <p style={{ marginTop: '6px', fontSize: '0.875rem', lineHeight: 1.5, color: 'var(--text-secondary)', margin: '6px 0 0 0' }}>
                {result.explanation}
              </p>
            </div>
          </div>

          <button onClick={handleReset} className="btn btn-outline" style={{ marginTop: '1.5rem', width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <RefreshCw size={15} /> Clear Assessment
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default Predict;
