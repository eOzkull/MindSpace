export interface ClassReport {
  precision: number;
  recall: number;
  'f1-score': number;
  support: number;
}

export interface EvaluationMetrics {
  accuracy: number;
  n_test: number;
  f1: number;
  precision: number;
  recall: number;
  confusion_matrix: number[][];
  class_names: string[];
  report: Record<string, ClassReport>;
  roc_auc?: number;
}

export interface EvaluateResponse {
  error?: string;
  metrics?: EvaluationMetrics;
  plot?: string;
  compare_exists?: boolean;
}
