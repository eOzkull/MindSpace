import numpy as np
from flask import Blueprint, jsonify
import state
from services.file_service import get_static_url

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

    return jsonify({
        'stats': stats,
        'columns': df.columns.tolist(),
        'data': safe_df.to_dict('records')[:100],
        'plots': {
            'score_hist':           get_static_url('score_hist.png'),
            'risk_pie':             get_static_url('risk_pie.png'),
            'stress_vs_burnout':    get_static_url('stress_vs_burnout.png'),
            'correlation_heatmap':  get_static_url('correlation_heatmap.png'),
            'sleep_vs_burnout':     get_static_url('sleep_vs_burnout.png'),
            'burnout_boxplot':      get_static_url('burnout_boxplot.png'),
            'study_vs_burnout':     get_static_url('study_vs_burnout.png'),
            'stress_vs_sleep':      get_static_url('stress_vs_sleep.png'),
            'sentiment_dist':       get_static_url('sentiment_dist.png'),
            'sentiment_vs_burnout': get_static_url('sentiment_vs_burnout.png'),
        }
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
