import React, { useState } from 'react';
import { useAppStore, selectSelectedPredictionDataset } from '../store/appStore';
import { Sparkles, Brain, AlertTriangle, Moon, BookOpen, AlertCircle, RefreshCw } from 'lucide-react';

const Predict: React.FC = () => {
  const selectedDataset = useAppStore(selectSelectedPredictionDataset);
  const setSelectedDataset = useAppStore((s) => s.setSelectedPredictionDataset);

  const [studentId, setStudentId] = useState('ST-9021');
  const [sleepHours, setSleepHours] = useState(6.5);
  const [studyHours, setStudyHours] = useState(5.0);
  const [stressLevel, setStressLevel] = useState(5);
  const [feedbackText, setFeedbackText] = useState('Feeling a bit overwhelmed with assignments lately, but trying to keep up.');
  const [calculating, setCalculating] = useState(false);
  const [result, setResult] = useState<{
    score: number;
    risk: 'Low' | 'Medium' | 'High';
    explanation: string;
  } | null>(null);

  const handlePredict = (e: React.FormEvent) => {
    e.preventDefault();
    setCalculating(true);

    setTimeout(() => {
      // Logic matching typical burnout formula:
      // Base score influenced by stress, study, and sleep
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
        score += 5; // Simulates slightly higher burnout model trained on compare dataset
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

      setResult({ score, risk, explanation });
      setCalculating(false);
    }, 800);
  };

  const handleReset = () => {
    setResult(null);
    setSleepHours(6.5);
    setStudyHours(5.0);
    setStressLevel(5);
    setFeedbackText('');
  };

  return (
    <div className="predict-container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div className="card" style={{ marginBottom: '2rem', padding: '1.25rem 1.75rem', background: 'var(--input-bg)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Brain size={20} style={{ color: 'var(--brand-primary)' }} />
            <span style={{ fontSize: '1.05rem', fontWeight: 500 }}>Active Model Weights:</span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setSelectedDataset('primary')}
              className={`btn ${selectedDataset === 'primary' ? 'btn-primary' : 'btn-outline'}`}
              style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}
            >
              Primary Cohort Model
            </button>
            <button
              onClick={() => setSelectedDataset('compare')}
              className={`btn ${selectedDataset === 'compare' ? 'btn-primary' : 'btn-outline'}`}
              style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}
            >
              Compare Cohort Model
            </button>
          </div>
        </div>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: result ? '1.2fr 1fr' : '1fr', gap: '2rem' }}>
        <div className="card">
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={20} /> Input Student Metrics
          </h3>
          <form onSubmit={handlePredict}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500 }}>Student ID / Ref</label>
              <input
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="filter-input"
                style={{ width: '100%' }}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px', fontWeight: 500 }}>
                  <Moon size={16} /> Sleep Hours: {sleepHours}h
                </label>
                <input
                  type="range"
                  min="3"
                  max="12"
                  step="0.5"
                  value={sleepHours}
                  onChange={(e) => setSleepHours(parseFloat(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--brand-primary)' }}
                />
              </div>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px', fontWeight: 500 }}>
                  <BookOpen size={16} /> Study Hours: {studyHours}h
                </label>
                <input
                  type="range"
                  min="1"
                  max="14"
                  step="0.5"
                  value={studyHours}
                  onChange={(e) => setStudyHours(parseFloat(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--brand-primary)' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px', fontWeight: 500 }}>
                <AlertCircle size={16} /> Self-Reported Stress (1 - 10): {stressLevel}
              </label>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={stressLevel}
                onChange={(e) => setStressLevel(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--brand-primary)' }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500 }}>Student Comments / Qualitative Feedback</label>
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Describe academic pressure, motivation level or feedback..."
                style={{
                  width: '100%',
                  height: '100px',
                  padding: '10px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--card-border)',
                  background: 'var(--input-bg)',
                  color: 'var(--text-primary)',
                  fontFamily: 'inherit',
                  resize: 'vertical'
                }}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }} disabled={calculating}>
              {calculating ? (
                <>
                  <RefreshCw className="animate-spin" size={16} /> Calculating Risk...
                </>
              ) : (
                'Run Burnout Diagnostic'
              )}
            </button>
          </form>
        </div>

        {result && (
          <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: `2px solid var(--${result.risk === 'High' ? 'danger' : result.risk === 'Medium' ? 'info' : 'success'})` }}>
            <div>
              <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                Diagnostic Results
              </h3>
              <div style={{ textAlign: 'center', margin: '2rem 0' }}>
                <div style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Burnout Score Index</div>
                <div style={{ fontSize: '4.5rem', fontWeight: 800, color: `var(--${result.risk === 'High' ? 'danger' : result.risk === 'Medium' ? 'info' : 'success'})` }}>
                  {result.score}
                </div>
                <div style={{ marginTop: '0.5rem' }}>
                  <span className={`badge badge-${result.risk.toLowerCase()}`} style={{ fontSize: '1rem', padding: '6px 16px' }}>
                    {result.risk} Risk Tier
                  </span>
                </div>
              </div>
              
              <div className="takeaway-box" style={{ background: 'var(--input-bg)', borderLeftColor: `var(--${result.risk === 'High' ? 'danger' : result.risk === 'Medium' ? 'info' : 'success'})` }}>
                <strong style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlertTriangle size={16} /> Clinical Breakdown
                </strong>
                <p style={{ marginTop: '6px', fontSize: '0.95rem' }}>
                  {result.explanation}
                </p>
              </div>
            </div>

            <button onClick={handleReset} className="btn btn-outline" style={{ marginTop: '1.5rem' }}>
              Clear Assessment
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Predict;
