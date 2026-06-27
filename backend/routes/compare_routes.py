import os
from flask import Blueprint, request, jsonify, session, current_app
import pandas as pd
import numpy as np
import state
from services.ml_service import _auto_train
from services.analytics_service import _build_stats
from services.visualisation_service import _generate_compare_plots
from services.file_service import get_static_url

compare_bp = Blueprint('compare', __name__)

@compare_bp.route('/api/compare', methods=['GET'])
def compare_status():
    return jsonify({
        'primary_loaded': state.data_df is not None,
        'compare_loaded': state.compare_df is not None,
        'compare_meta':   state.compare_meta,
    })

@compare_bp.route('/api/compare/upload', methods=['POST'])
def compare_upload():
    if state.data_df is None:
        return jsonify({'error': 'No primary dataset loaded'}), 400
    if 'file' not in request.files or request.files['file'].filename == '':
        return jsonify({'error': 'No selected file'}), 400
    file = request.files['file']
    if not file.filename.endswith('.csv'):
        return jsonify({'error': 'Invalid file format'}), 400
    try:
        cdf = pd.read_csv(file)
        for col in ['sleep_hours', 'study_hours', 'stress_level']:
            if col in cdf.columns:
                cdf[col] = pd.to_numeric(cdf[col], errors='coerce').fillna(0)
                cdf[col] = cdf[col].apply(lambda x: max(x, 0))
        from services.burnout_service import calculate_burnout, assign_risk, calculate_sentiment
        cdf = calculate_burnout(cdf)
        cdf = assign_risk(cdf)
        cdf = calculate_sentiment(cdf, state.get_sia())

        state.compare_df = cdf
        state.compare_meta = {'filename': file.filename, 'records': len(cdf)}

        plot_dir = os.path.join(current_app.static_folder, 'plots')
        metrics = _auto_train(state.compare_df, plot_dir, 'compare')
        if metrics:
            em = state.eval_metrics
            em['compare'] = metrics
            state.eval_metrics = em

        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@compare_bp.route('/api/compare/results', methods=['GET'])
def compare_results():
    if state.data_df is None or state.compare_df is None:
        return jsonify({'error': 'Datasets not loaded'}), 400

    label_a = (
        session.get('history', [{}])[0].get('filename', 'Dataset A')
        if session.get('history') else 'Dataset A'
    )
    label_b = state.compare_meta.get('filename', 'Dataset B')

    if getattr(state, '_last_data_df_id', None) != id(state.data_df):
        state.primary_stats = _build_stats(state.data_df.copy(), state.get_sia())
        state._last_data_df_id = id(state.data_df)
    stats_a = state.primary_stats

    if getattr(state, '_last_compare_df_id', None) != id(state.compare_df):
        state.compare_stats = _build_stats(state.compare_df.copy(), state.get_sia())
        state._last_compare_df_id = id(state.compare_df)
    stats_b = state.compare_stats

    plot_dir = os.path.join(current_app.static_folder, 'plots')
    _generate_compare_plots(stats_a, stats_b, label_a, label_b, plot_dir)

    def _strip(s):
        return {k: v for k, v in s.items() if k != '_df'}

    def _delta(a, b):
        if a is None or b is None:
            return None
        return round(b - a, 2)

    deltas = {
        'avg_burnout':   _delta(stats_a['avg_burnout'],   stats_b['avg_burnout']),
        'pct_high':      _delta(stats_a['pct_high'],      stats_b['pct_high']),
        'avg_sleep':     _delta(stats_a['avg_sleep'],     stats_b['avg_sleep']),
        'avg_study':     _delta(stats_a['avg_study'],     stats_b['avg_study']),
        'avg_stress':    _delta(stats_a['avg_stress'],    stats_b['avg_stress']),
        'avg_sentiment': _delta(stats_a['avg_sentiment'], stats_b['avg_sentiment']),
    }

    return jsonify({
        'label_a': label_a,
        'label_b': label_b,
        'stats_a': _strip(stats_a),
        'stats_b': _strip(stats_b),
        'deltas':  deltas,
        'plots': {
            'cmp_burnout_hist': get_static_url('cmp_burnout_hist.png'),
            'cmp_risk_bar':     get_static_url('cmp_risk_bar.png'),
            'cmp_features':     get_static_url('cmp_features.png'),
            'cmp_boxplot':      get_static_url('cmp_boxplot.png'),
            'cmp_sentiment':    get_static_url('cmp_sentiment.png'),
        }
    })

@compare_bp.route('/api/compare/clear', methods=['POST'])
def compare_clear():
    state.compare_df = None
    state.compare_meta = None
    state.eval_metrics['compare'] = None
    return jsonify({'success': True})
