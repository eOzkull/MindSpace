export const API_BASE_URL = '/api';

export interface HistoryEntry {
  filename: string;
  records: number;
}

export interface HistoryResponse {
  history?: HistoryEntry[];
  error?: string;
}

export interface SuccessResponse {
  success: boolean;
  error?: string;
}

export interface UploadResponse {
  success: boolean;
  error?: string;
}

export interface DashboardStats {
  avg_burnout: number;
  median_burnout: number;
  std_burnout: number;
  high_risk_count: number;
  pct_high_risk: number;
  avg_sentiment: number;
}

export interface DashboardPlots {
  score_hist: string;
  risk_pie: string;
  stress_vs_burnout: string;
  correlation_heatmap: string;
  sleep_vs_burnout: string;
  burnout_boxplot: string;
  study_vs_burnout: string;
  stress_vs_sleep: string;
  sentiment_dist: string;
  sentiment_vs_burnout: string;
}

export type DataRow = Record<string, string | number>;

export interface DashboardResponse {
  error?: string;
  stats?: DashboardStats;
  columns?: string[];
  data?: DataRow[];
  plots?: DashboardPlots;
}

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

export interface ResultsResponse {
  error?: string;
  avg_burnout?: number;
  high_risk_pct?: number;
  avg_sentiment?: number;
}

export interface UpdatePayload {
  row: number;
  col: string;
  value: string | number;
}

export interface CompareStatusResponse {
  primary_loaded: boolean;
  compare_loaded: boolean;
}

export interface CompareStats {
  n: number;
  avg_burnout: number;
  pct_high: number;
  avg_stress: number;
  avg_study: number;
  avg_sleep: number;
  avg_sentiment: number;
  low_risk: number;
  medium_risk: number;
  high_risk: number;
}

export interface CompareDeltas {
  avg_burnout: number | null;
  pct_high: number | null;
  avg_stress: number | null;
  avg_study: number | null;
  avg_sleep: number | null;
  avg_sentiment: number | null;
}

export interface ComparePlots {
  cmp_risk_bar: string;
  cmp_burnout_hist: string;
  cmp_boxplot: string;
  cmp_features: string;
  cmp_sentiment: string;
}

export interface CompareResultsResponse {
  label_a: string;
  label_b: string;
  stats_a: CompareStats;
  stats_b: CompareStats;
  deltas: CompareDeltas;
  plots: ComparePlots;
}

export const fetchHistory = async (): Promise<HistoryResponse> => {
  const res = await fetch(`${API_BASE_URL}/history`);
  return res.json();
};

export const resetSession = async (): Promise<SuccessResponse> => {
  const res = await fetch(`${API_BASE_URL}/reset`, { method: 'POST' });
  return res.json();
};

export const deleteSession = async (idx: number): Promise<SuccessResponse> => {
  const res = await fetch(`${API_BASE_URL}/delete-session/${idx}`, { method: 'DELETE' });
  return res.json();
};

export const uploadFile = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_BASE_URL}/upload`, {
    method: 'POST',
    body: formData,
  });
  return res.json();
};

export const fetchDashboard = async (): Promise<DashboardResponse> => {
  const res = await fetch(`${API_BASE_URL}/dashboard`);
  return res.json();
};

export const fetchEvaluate = async (dataset: string = 'primary'): Promise<EvaluateResponse> => {
  const res = await fetch(`${API_BASE_URL}/evaluate?dataset=${dataset}`);
  return res.json();
};

export const fetchResults = async (): Promise<ResultsResponse> => {
  const res = await fetch(`${API_BASE_URL}/results`);
  return res.json();
};

export const updateData = async (updates: UpdatePayload[]): Promise<SuccessResponse> => {
  const res = await fetch(`${API_BASE_URL}/edit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ updates }),
  });
  return res.json();
};

export const fetchCompareStatus = async (): Promise<CompareStatusResponse> => {
  const res = await fetch(`${API_BASE_URL}/compare`);
  return res.json();
};

export const uploadCompareFile = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_BASE_URL}/compare/upload`, {
    method: 'POST',
    body: formData,
  });
  return res.json();
};

export const fetchCompareResults = async (): Promise<CompareResultsResponse> => {
  const res = await fetch(`${API_BASE_URL}/compare/results`);
  return res.json();
};

export const clearCompare = async (): Promise<SuccessResponse> => {
  const res = await fetch(`${API_BASE_URL}/compare/clear`, { method: 'POST' });
  return res.json();
};
