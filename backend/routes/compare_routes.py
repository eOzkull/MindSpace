import numpy as np
from flask import Blueprint, request, jsonify, session
import pandas as pd
import state
from services.ml_service import _auto_train
from services.analytics_service import _build_stats
from services.burnout_service import calculate_burnout, assign_risk, calculate_sentiment
from utils.validators import validate_csv
from utils.csv_normalize import normalize_dataframe

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
        safe_filename = secure_filename_filename(file.filename)
        cdf = pd.read_csv(file)

        is_valid, error_msg = validate_csv(cdf)
        if not is_valid:
            return jsonify({'error': error_msg}), 400

        cdf = normalize_dataframe(cdf)

        cdf = calculate_burnout(cdf)
        cdf = assign_risk(cdf)
        cdf = calculate_sentiment(cdf, state.get_sia())

        state.compare_df = cdf
        state.compare_meta = {'filename': safe_filename, 'records': len(cdf)}

        metrics = _auto_train(cdf, 'compare')
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

def secure_filename_filename(filename):
    from werkzeug.utils import secure_filename
    return secure_filename(filename) or 'compare.csv'

@compare_bp.route('/api/compare/results', methods=['GET'])
def compare_results():
    data_df = state.data_df
    compare_df = state.compare_df

    if data_df is None or compare_df is None:
        return jsonify({'error': 'Datasets not loaded'}), 400

    label_a = (
        session.get('history', [{}])[0].get('filename', 'Dataset A')
        if session.get('history') else 'Dataset A'
    )
    label_b = (state.compare_meta or {}).get('filename', 'Dataset B')

    # Always recompute stats fresh (disk-based state, no in-memory caching)
    sia = state.get_sia()
    stats_a = _build_stats(data_df.copy(), sia)
    stats_b = _build_stats(compare_df.copy(), sia)

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

    cols_to_send = ['burnout_score', 'sentiment_score', 'risk', 'sleep_hours', 'study_hours', 'stress_level']
    available_a = [c for c in cols_to_send if c in data_df.columns]
    available_b = [c for c in cols_to_send if c in compare_df.columns]

    safe_a = data_df[available_a].replace({np.nan: None})
    safe_b = compare_df[available_b].replace({np.nan: None})

    data_a = safe_a.to_dict('records')
    data_b = safe_b.to_dict('records')

    return jsonify({
        'label_a': label_a,
        'label_b': label_b,
        'stats_a': _strip(stats_a),
        'stats_b': _strip(stats_b),
        'deltas':  deltas,
        'data_a':  data_a,
        'data_b':  data_b
    })

@compare_bp.route('/api/compare/clear', methods=['POST'])
def compare_clear():
    state.compare_df = None
    state.compare_meta = None
    em = state.eval_metrics
    em['compare'] = None
    state.eval_metrics = em
    return jsonify({'success': True})
