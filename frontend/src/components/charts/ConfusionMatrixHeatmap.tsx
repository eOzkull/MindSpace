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
  // Find max value for color scale interpolation
  const maxValue = useMemo(() => {
    let max = 0;
    matrix.forEach(row => {
      row.forEach(val => {
        if (val > max) max = val;
      });
    });
    return max || 1; // avoid division by zero
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
                  return (
                    <div 
                      key={`cell-${i}-${j}`} 
                      className="confusion-matrix-cell"
                      style={{ 
                        backgroundColor: `color-mix(in srgb, var(--brand-primary, #3b82f6) ${Math.max(5, intensity * 100)}%, transparent)`,
                        color: intensity > 0.5 ? '#ffffff' : 'var(--text-primary)'
                      }}
                      title={`Actual: ${labels[i]}\nPredicted: ${labels[j]}\nValue: ${val}`}
                    >
                      <span className="confusion-matrix-val">{val}</span>
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
