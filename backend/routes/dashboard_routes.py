import numpy as np
from flask import Blueprint, jsonify
import state

dashboard_bp = Blueprint('dashboard', __name__)

@dashboard_bp.route('/api/dashboard', methods=['GET'])
def dashboard():
    df = state.data_df
    if df is None:
        return jsonify({'error': 'No dataset loaded'}), 400

    stats = {
        'avg_burnout':    round(df['burnout_score'].mean(), 1),
        'median_burnout': round(df['burnout_score'].median(), 1),
        'std_burnout':    round(df['burnout_score'].std(), 1),
        'total_records':  len(df),
        'high_risk_count': int((df['risk'] == 'High').sum()),
        'pct_high_risk':  round((df['risk'] == 'High').sum() / len(df) * 100, 1),
        'avg_sentiment':  round(df['sentiment_score'].mean(), 2)
    }

    safe_df = df.replace({np.nan: None})

    # Compute correlation matrix for the numeric features
    available_cols = [c for c in ['sleep_hours', 'study_hours', 'stress_level', 'burnout_score'] if c in df.columns]
    corr_matrix = df[available_cols].corr().round(2).replace({np.nan: None}).to_dict('split')

    return jsonify({
        'stats': stats,
        'columns': df.columns.tolist(),
        'data': safe_df.to_dict('records')[:100],
        'corr_matrix': corr_matrix
    })

@dashboard_bp.route('/api/results', methods=['GET'])
def results():
    df = state.data_df
    if df is None:
        return jsonify({'error': 'No dataset loaded'}), 400
    eval_metrics = state.eval_metrics
    return jsonify({
        'avg_burnout':   round(df['burnout_score'].mean(), 2) if 'burnout_score' in df.columns else None,
        'high_risk_pct': round(len(df[df['risk'] == 'High']) / len(df) * 100, 1) if 'risk' in df.columns else None,
        'avg_sentiment': round(df['sentiment_score'].mean(), 2) if 'sentiment_score' in df.columns else None,
        'metrics':       eval_metrics['primary']
    })
