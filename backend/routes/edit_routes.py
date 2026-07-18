from flask import Blueprint, request, jsonify
import pandas as pd
import state
from services.data_processing_service import process_data
from services.ml_service import _auto_train

from pydantic import ValidationError
from schemas.edit_schema import EditPayloadSchema

from utils.logger import logger

edit_bp = Blueprint('edit', __name__)

@edit_bp.route('/api/edit', methods=['POST'])
def edit():
    if state.data_df is None:
        return jsonify({'error': 'No dataset loaded'}), 400

    df = state.data_df
    
    try:
        payload = EditPayloadSchema.model_validate(request.json or {})
    except ValidationError as e:
        return jsonify({
            'success': False,
            'error': 'VALIDATION_FAILED',
            'message': e.errors()
        }), 422

    for update in payload.updates:
        row = update.row
        col = update.col
        value = update.value

        if row >= len(df):
            new_rows = row - len(df) + 1
            new_df = pd.DataFrame(
                index=range(len(df), len(df) + new_rows),
                columns=df.columns
            )
            df = pd.concat([df, new_df], ignore_index=False)

        try:
            if col in df.columns:
                df.at[row, col] = (
                    pd.to_numeric(value, errors='coerce')
                    if pd.api.types.is_numeric_dtype(df[col]) else value
                )
        except Exception as e:
            logger.error(f"Error updating row {row} col {col}: {e}")

    df, corr_matrix = process_data(df, state.get_sia())
    
    state.data_df = df
    state.corr_matrix = corr_matrix

    metrics = _auto_train(state.data_df, 'primary')
    if metrics:
        em = state.eval_metrics
        em['primary'] = metrics
        state.eval_metrics = em

    return jsonify({'success': True, 'message': 'Dataset updated successfully.'})
