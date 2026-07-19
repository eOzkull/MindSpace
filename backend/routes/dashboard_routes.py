import numpy as np
from flask import Blueprint, jsonify
import state
from services.analytics_service import get_dashboard_stats, get_correlation_matrix, get_results_metrics

dashboard_bp = Blueprint('dashboard', __name__)

@dashboard_bp.route('/api/dashboard', methods=['GET'])
def dashboard():
    df = state.data_df
    if df is None:
        return jsonify({'error': 'No dataset loaded'}), 400

    stats = get_dashboard_stats(df)
    safe_df = df.replace({np.nan: None})
    corr_matrix = get_correlation_matrix(df)

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
    results_data = get_results_metrics(df, eval_metrics)
    
    return jsonify(results_data)
