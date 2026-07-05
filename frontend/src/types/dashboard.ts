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
