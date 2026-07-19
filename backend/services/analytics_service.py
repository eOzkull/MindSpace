import pandas as pd
import numpy as np
from services.burnout_service import calculate_burnout, assign_risk, calculate_sentiment

def _build_stats(df, sia):
    """Compute summary stats dict for one dataset."""
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

def get_dashboard_stats(df):
    if df is None or df.empty:
        return {}
    
    stats = {
        'total_records': len(df)
    }

    if 'burnout_score' in df.columns:
        stats['avg_burnout'] = round(df['burnout_score'].mean(), 1)
        stats['median_burnout'] = round(df['burnout_score'].median(), 1)
        stats['std_burnout'] = round(df['burnout_score'].std(), 1)
        
    if 'risk' in df.columns:
        stats['high_risk_count'] = int((df['risk'] == 'High').sum())
        stats['pct_high_risk'] = round((df['risk'] == 'High').sum() / len(df) * 100, 1) if len(df) > 0 else 0
        
    if 'sentiment_score' in df.columns:
        stats['avg_sentiment'] = round(df['sentiment_score'].mean(), 2)
        
    return stats

def get_correlation_matrix(df):
    if df is None or df.empty:
        return {}
        
    available_cols = [c for c in ['sleep_hours', 'study_hours', 'stress_level', 'burnout_score', 'sentiment_score'] if c in df.columns]
    
    if len(available_cols) < 2:
        return {}
        
    corr_matrix = df[available_cols].corr().round(2).replace({np.nan: None}).to_dict('split')
    return corr_matrix

def get_results_metrics(df, eval_metrics):
    if df is None or df.empty:
        return {}
        
    return {
        'avg_burnout':   round(df['burnout_score'].mean(), 2) if 'burnout_score' in df.columns else None,
        'high_risk_pct': round(len(df[df['risk'] == 'High']) / len(df) * 100, 1) if 'risk' in df.columns and len(df) > 0 else None,
        'avg_sentiment': round(df['sentiment_score'].mean(), 2) if 'sentiment_score' in df.columns else None,
        'metrics':       eval_metrics.get('primary') if eval_metrics else None
    }
