from datetime import datetime
from flask import Blueprint, request, jsonify, session
from werkzeug.utils import secure_filename
import pandas as pd
import state
from services.data_processing_service import process_data
from services.ml_service import _auto_train
from utils.validators import validate_csv

upload_bp = Blueprint('upload', __name__)

@upload_bp.route('/api/upload', methods=['POST'])
def upload():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    if file and file.filename.endswith('.csv'):
        try:
            safe_filename = secure_filename(file.filename) or "upload.csv"
            temp_df = pd.read_csv(file)

            is_valid, error_msg = validate_csv(temp_df)
            if not is_valid:
                return jsonify({'error': error_msg}), 400
                
            state.data_df = temp_df

            history = session.get('history', [])
            new_entry = {
                'filename': safe_filename,
                'timestamp': datetime.now().strftime("%Y-%m-%d %H:%M"),
                'records': len(state.data_df)
            }
            history.insert(0, new_entry)
            session['history'] = history[:10]
            session.modified = True

            state.data_df, state.corr_matrix = process_data(state.data_df, state.get_sia())

            metrics = _auto_train(state.data_df, 'primary')
            if metrics:
                em = state.eval_metrics
                em['primary'] = metrics
                state.eval_metrics = em

            return jsonify({
                'success': True,
                'message': f"Successfully uploaded {safe_filename}.",
                'records': len(state.data_df)
            })
        except pd.errors.EmptyDataError:
            return jsonify({'error': 'The uploaded CSV file is completely empty or corrupted.'}), 400
        except pd.errors.ParserError:
            return jsonify({'error': 'Failed to parse the CSV file. Please ensure it is a valid, well-formed CSV format.'}), 400
        except Exception as e:
            return jsonify({'error': f'An unexpected error occurred during processing: {str(e)}'}), 500
    return jsonify({'error': 'Invalid file format. Only .csv files are supported.'}), 400
