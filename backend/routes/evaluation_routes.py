from flask import Blueprint, request, jsonify
import state
from services.ml_service import _auto_train

evaluation_bp = Blueprint('evaluation', __name__)

@evaluation_bp.route('/api/evaluate', methods=['GET'])
def evaluate():
    target = request.args.get('dataset', 'primary')
    if target not in ['primary', 'compare']:
        target = 'primary'

    eval_metrics = state.eval_metrics
    metrics = eval_metrics.get(target)

    data_df = state.data_df

    if metrics is None and data_df is None:
        return jsonify({'error': 'No dataset loaded yet. Upload a CSV from the Home page first.'}), 400

    if metrics is None:
        df_to_train = data_df if target == 'primary' else state.compare_df
        metrics = _auto_train(df_to_train, target)
        if metrics:
            eval_metrics[target] = metrics
            state.eval_metrics = eval_metrics
        metrics = eval_metrics.get(target)

    if metrics is None:
        return jsonify({'error': f'Could not train model on the {target} dataset.'}), 400

    latest_metrics = state.eval_metrics

    return jsonify({
        'metrics': metrics,
        'primary_exists': (latest_metrics['primary'] is not None),
        'compare_exists': (latest_metrics['compare'] is not None)
    })
