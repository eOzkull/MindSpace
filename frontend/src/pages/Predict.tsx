import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAppStore, selectSelectedPredictionDataset } from '../store/appStore';
import { useEvaluate } from '../hooks/usePrediction';
import { useDebounce } from '../hooks/useDebounce';
import { fadeUp } from '../lib/motion';
import SegmentedControl from '../components/ui/SegmentedControl';
import { Sparkles, Brain, AlertTriangle, Moon, BookOpen, AlertCircle, RefreshCw } from 'lucide-react';

const Predict: React.FC = () => {
  const selectedDataset = useAppStore(selectSelectedPredictionDataset);
  const setSelectedDataset = useAppStore((s) => s.setSelectedPredictionDataset);

  const debouncedDataset = useDebounce(selectedDataset, 300);
  const { data: evaluateData } = useEvaluate(debouncedDataset);
  const metrics = evaluateData?.metrics;

  const [studentId, setStudentId] = useState('ST-9021');
  const [sleepHours, setSleepHours] = useState(6.5);
  const [studyHours, setStudyHours] = useState(5.0);
  const [stressLevel, setStressLevel] = useState(5);
  const [feedbackText, setFeedbackText] = useState('Feeling a bit overwhelmed with assignments lately, but trying to keep up.');

  const result = useMemo(() => {
    let score = (stressLevel * 8) + (studyHours * 1.5) - (sleepHours * 4);

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

    score -= sentiment * 20;

    if (selectedDataset === 'compare') {
      score += 5;
    }

    score = Math.max(0, Math.min(100, Math.round(score)));

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
    return risk === 'High' ? 'var(--danger)' : risk === 'Medium' ? 'var(--warning)' : 'var(--success)';
  };

  // SVG Gauge calculations
  const gaugeRadius = 70;
  const circumference = 2 * Math.PI * gaugeRadius;
  const strokeDashoffset = circumference - (result.score / 100) * circumference;

  const datasetOptions = [
    { value: 'primary', label: 'Primary Cohort Model' },
    ...(evaluateData?.compare_exists ? [{ value: 'compare', label: 'Compare Cohort Model' }] : [])
  ];

  return (
    <motion.div {...fadeUp} style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Active Model Top Strip */}
      <div className="card" style={{ padding: '1.25rem 1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: 'rgba(139, 92, 246, 0.12)',
              border: '1px solid rgba(139, 92, 246, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--brand-primary)'
            }}>
              <Brain size={20} />
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', display: 'block' }}>Active Prediction Model</span>
              {metrics ? (
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '2px' }}>
                  <span className="badge badge-brand" style={{ fontSize: '0.75rem' }}>
                    Accuracy: {(metrics.accuracy * 100).toFixed(1)}%
                  </span>
                  <span className="badge badge-brand" style={{ fontSize: '0.75rem' }}>
                    F1 Score: {metrics.f1}
                  </span>
                </div>
              ) : (
                <span style={{ fontSize: '0.925rem', fontWeight: 600, color: 'var(--text-primary)' }}>Standard Cohort Classifier</span>
              )}
            </div>
          </div>

          <SegmentedControl
            options={datasetOptions}
            value={selectedDataset}
            onChange={(val) => setSelectedDataset(val as 'primary' | 'compare')}
          />
        </div>
      </div>

      {/* Two Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem' }}>
        {/* Left Form Panel */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1.75rem' }}>
          <div>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', fontWeight: 600, letterSpacing: '-0.02em', margin: 0 }}>
              <Sparkles size={18} style={{ color: 'var(--brand-primary)' }} /> Input Student Metrics
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>
              Adjust features to dynamically calculate real-time burnout probability.
            </p>
          </div>

          <form onSubmit={(e) => e.preventDefault()} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontWeight: 500, fontSize: '0.875rem' }}>Student ID / Identifier</label>
                <span className="badge badge-brand" style={{ fontSize: '0.75rem' }}>{studentId}</span>
              </div>
              <input
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="filter-input"
                style={{ width: '100%', height: 'var(--input-height)' }}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500, fontSize: '0.875rem' }}>
                    <Moon size={15} style={{ color: 'var(--brand-primary)' }} /> Sleep Hours
                  </label>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--brand-primary)' }}>{sleepHours}h</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="12"
                  step="0.5"
                  value={sleepHours}
                  onChange={(e) => setSleepHours(parseFloat(e.target.value))}
                  style={{
                    width: '100%',
                    cursor: 'pointer',
                    '--range-pct': `${((sleepHours - 3) / 9) * 100}%`
                  } as React.CSSProperties}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500, fontSize: '0.875rem' }}>
                    <BookOpen size={15} style={{ color: 'var(--brand-primary)' }} /> Study Hours
                  </label>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--brand-primary)' }}>{studyHours}h</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="14"
                  step="0.5"
                  value={studyHours}
                  onChange={(e) => setStudyHours(parseFloat(e.target.value))}
                  style={{
                    width: '100%',
                    cursor: 'pointer',
                    '--range-pct': `${((studyHours - 1) / 13) * 100}%`
                  } as React.CSSProperties}
                />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500, fontSize: '0.875rem' }}>
                  <AlertCircle size={15} style={{ color: 'var(--brand-primary)' }} /> Self-Reported Stress (1–10)
                </label>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: getRiskColorVar(result.risk) }}>{stressLevel}/10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={stressLevel}
                onChange={(e) => setStressLevel(parseInt(e.target.value))}
                style={{
                  width: '100%',
                  cursor: 'pointer',
                  '--range-pct': `${((stressLevel - 1) / 9) * 100}%`
                } as React.CSSProperties}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500, fontSize: '0.875rem' }}>
                Student Feedback / Qualitative Telemetry
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
                  border: '1px solid var(--input-border)',
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

        {/* Right Diagnostic Panel with Animated SVG Ring Gauge */}
        <div className="card" style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '1.75rem',
          borderLeft: `4px solid ${getRiskColorVar(result.risk)}`,
          transition: 'border-left-color 0.3s ease'
        }}>
          <div>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', fontWeight: 600, letterSpacing: '-0.02em', margin: '0 0 1rem 0' }}>
              Diagnostic Evaluation
            </h3>

            {/* SVG Ring Gauge */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '1rem 0 1.5rem 0' }}>
              <div style={{ position: 'relative', width: '160px', height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="160" height="160" viewBox="0 0 160 160" style={{ transform: 'rotate(-90deg)' }}>
                  {/* Background Track Circle */}
                  <circle
                    cx="80"
                    cy="80"
                    r={gaugeRadius}
                    fill="transparent"
                    stroke="var(--input-bg)"
                    strokeWidth="10"
                  />
                  {/* Animated Score Progress Arc */}
                  <motion.circle
                    cx="80"
                    cy="80"
                    r={gaugeRadius}
                    fill="transparent"
                    stroke={getRiskColorVar(result.risk)}
                    strokeWidth="10"
                    strokeDasharray={circumference}
                    animate={{ strokeDashoffset }}
                    transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                    strokeLinecap="round"
                  />
                </svg>

                {/* Score Number in Gauge Center */}
                <div style={{ position: 'absolute', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <motion.span
                    key={result.score}
                    initial={{ scale: 0.8, opacity: 0.5 }}
                    animate={{ scale: 1, opacity: 1 }}
                    style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1, color: getRiskColorVar(result.risk) }}
                  >
                    {result.score}
                  </motion.span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '2px' }}>
                    Score Index
                  </span>
                </div>
              </div>

              <div style={{ marginTop: '1rem' }}>
                <span className={`badge badge-${result.risk.toLowerCase()}`} style={{ fontSize: '0.85rem', padding: '6px 16px', borderRadius: 'var(--radius-full)' }}>
                  {result.risk} Risk Tier
                </span>
              </div>
            </div>

            {/* Clinical Breakdown */}
            <div className="takeaway-box" style={{
              background: 'var(--input-bg)',
              borderLeft: `3px solid ${getRiskColorVar(result.risk)}`,
              padding: '1rem',
              borderRadius: 'var(--radius-sm)',
              transition: 'border-left-color 0.3s ease'
            }}>
              <strong style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                <AlertTriangle size={15} style={{ color: getRiskColorVar(result.risk) }} /> Clinical Assessment
              </strong>
              <p style={{ marginTop: '6px', fontSize: '0.85rem', lineHeight: 1.5, color: 'var(--text-secondary)', margin: '6px 0 0 0' }}>
                {result.explanation}
              </p>
            </div>
          </div>

          <button onClick={handleReset} className="btn btn-outline" style={{ marginTop: '1.5rem', width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.85rem' }}>
            <RefreshCw size={15} /> Reset Form Inputs
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default Predict;

