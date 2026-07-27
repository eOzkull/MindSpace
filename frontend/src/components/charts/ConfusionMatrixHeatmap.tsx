import React, { useMemo } from 'react';

export interface ConfusionMatrixProps {
  matrix: number[][];
  labels: string[];
  title?: string;
  height?: number | string;
}

export const ConfusionMatrixHeatmap: React.FC<ConfusionMatrixProps> = ({ 
  matrix, 
  labels,
  title = 'Confusion Matrix',
  height = '100%'
}) => {
  const maxValue = useMemo(() => {
    let max = 0;
    matrix.forEach(row => {
      row.forEach(val => {
        if (val > max) max = val;
      });
    });
    return max || 1;
  }, [matrix]);

  const totalPredictions = useMemo(() => {
    let total = 0;
    matrix.forEach(row => row.forEach(val => { total += val; }));
    return total || 1;
  }, [matrix]);

  return (
    <div className="confusion-matrix-container" style={{ height }}>
      {title && <h4 className="confusion-matrix-title">{title}</h4>}
      
      <div className="confusion-matrix-layout">
        {/* Y-axis label */}
        <div className="confusion-matrix-y-label">
          <span>Actual</span>
        </div>
        
        <div className="confusion-matrix-core">
          {/* X-axis top labels */}
          <div className="confusion-matrix-header">
            <div className="confusion-matrix-corner"></div>
            {labels.map((label, i) => (
              <div key={`col-label-${i}`} className="confusion-matrix-col-label">
                {label}
              </div>
            ))}
          </div>
          
          {/* Grid rows */}
          <div className="confusion-matrix-grid">
            {matrix.map((row, i) => (
              <div key={`row-${i}`} className="confusion-matrix-row">
                <div className="confusion-matrix-row-label">{labels[i]}</div>
                {row.map((val, j) => {
                  const intensity = val / maxValue;
                  const isDiagonal = i === j;
                  const pct = Math.round((val / totalPredictions) * 100);
                  return (
                    <div 
                      key={`cell-${i}-${j}`} 
                      className={`confusion-matrix-cell${isDiagonal ? ' confusion-matrix-cell--diagonal' : ''}`}
                      style={{ 
                        backgroundColor: isDiagonal
                          ? `color-mix(in srgb, var(--brand-primary, #6c63ff) ${Math.max(10, intensity * 90)}%, transparent)`
                          : intensity > 0.05
                            ? `color-mix(in srgb, var(--danger, #ef4444) ${Math.max(5, intensity * 70)}%, transparent)`
                            : 'transparent',
                        color: intensity > 0.5 ? '#ffffff' : 'var(--text-primary)',
                      }}
                      title={`Actual: ${labels[i]}\nPredicted: ${labels[j]}\nCount: ${val} (${pct}%)`}
                    >
                      <span className="confusion-matrix-val">{val}</span>
                      {val > 0 && (
                        <span className="confusion-matrix-pct">{pct}%</span>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
          
          {/* X-axis label at bottom */}
          <div className="confusion-matrix-x-label">
            Predicted
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfusionMatrixHeatmap;
