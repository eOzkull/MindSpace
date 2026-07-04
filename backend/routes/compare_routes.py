import os
import shutil
from flask import Blueprint, request, jsonify, session, current_app
from werkzeug.utils import secure_filename
import pandas as pd
import state
from services.ml_service import _auto_train
from services.analytics_service import _build_stats
from services.visualisation_service import _generate_compare_plots
from services.burnout_service import calculate_burnout, assign_risk, calculate_sentiment
from services.file_service import get_static_url
from utils.validators import validate_csv

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
        return jsonify({'error': 'Invalid file format. Only .csv files are supported.'}), 400

    try:
        safe_filename = secure_filename(file.filename) or 'compare.csv'
        cdf = pd.read_csv(file)

        is_valid, error_msg = validate_csv(cdf)
        if not is_valid:
            return jsonify({'error': error_msg}), 400

        for col in ['sleep_hours', 'study_hours', 'stress_level']:
            if col in cdf.columns:
                cdf[col] = pd.to_numeric(cdf[col], errors='coerce').fillna(0)
                cdf[col] = cdf[col].apply(lambda x: max(x, 0))

        cdf = calculate_burnout(cdf)
        cdf = assign_risk(cdf)
        cdf = calculate_sentiment(cdf, state.get_sia())

        state.compare_df = cdf
        state.compare_meta = {'filename': safe_filename, 'records': len(cdf)}

        plot_dir = os.path.join(current_app.static_folder, 'plots')
        metrics = _auto_train(state.compare_df, plot_dir, 'compare')
        if metrics:
            em = state.eval_metrics
            em['compare'] = metrics
            state.eval_metrics = em

        return jsonify({'success': True})
    except pd.errors.EmptyDataError:
        return jsonify({'error': 'The uploaded CSV file is completely empty or corrupted.'}), 400
    except pd.errors.ParserError:
        return jsonify({'error': 'Failed to parse the CSV file. Please ensure it is a valid, well-formed CSV format.'}), 400
    except Exception as e:
        return jsonify({'error': f'An unexpected error occurred: {str(e)}'}), 500


@compare_bp.route('/api/compare/results', methods=['GET'])
def compare_results():
    if state.data_df is None or state.compare_df is None:
        return jsonify({'error': 'Datasets not loaded'}), 400

    label_a = (
        session.get('history', [{}])[0].get('filename', 'Dataset A')
        if session.get('history') else 'Dataset A'
    )
    label_b = (state.compare_meta or {}).get('filename', 'Dataset B')

    # Always recompute stats fresh (disk-based state, no in-memory caching)
    stats_a = _build_stats(state.data_df.copy(), state.get_sia())
    stats_b = _build_stats(state.compare_df.copy(), state.get_sia())

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
    em = state.eval_metrics
    em['compare'] = None
    state.eval_metrics = em
    return jsonify({'success': True})

