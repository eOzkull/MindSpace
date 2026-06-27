import pandas as pd
import numpy as np

def _build_stats(df, sia):
    """Compute summary stats dict for one dataset."""
    from services.burnout_service import calculate_burnout, assign_risk, calculate_sentiment
    df = df.copy()
    df = calculate_sentiment(df, sia)
    for col in ['sleep_hours', 'study_hours', 'stress_level']:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0)
    df = calculate_burnout(df)
    df = assign_risk(df)
    risk_counts = df['risk'].value_counts().reindex(['Low', 'Medium', 'High'], fill_value=0)
    return {
        'n': len(df),
        'avg_burnout': round(df['burnout_score'].mean(), 2),
        'median_burnout': round(df['burnout_score'].median(), 2),
        'std_burnout': round(df['burnout_score'].std(), 2),
        'high_risk': int(risk_counts.get('High', 0)),
        'medium_risk': int(risk_counts.get('Medium', 0)),
        'low_risk': int(risk_counts.get('Low', 0)),
        'pct_high': round(risk_counts.get('High', 0) / max(len(df), 1) * 100, 1),
        'avg_sleep': round(df['sleep_hours'].mean(), 2) if 'sleep_hours' in df.columns else None,
        'avg_study': round(df['study_hours'].mean(), 2) if 'study_hours' in df.columns else None,
        'avg_stress': round(df['stress_level'].mean(), 2) if 'stress_level' in df.columns else None,
        'avg_sentiment': round(df.get('sentiment_score', pd.Series([0])).mean(), 3),
        '_df': df,
    }
