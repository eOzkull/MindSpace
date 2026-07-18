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

export interface CompareDataRecord {
  burnout_score?: number;
  sentiment_score?: number;
  risk?: string;
  sleep_hours?: number;
  study_hours?: number;
  stress_level?: number;
}

export interface CompareResultsResponse {
  label_a: string;
  label_b: string;
  stats_a: CompareStats;
  stats_b: CompareStats;
  deltas: CompareDeltas;
  data_a: CompareDataRecord[];
  data_b: CompareDataRecord[];
}

