import json
from datetime import datetime
from flask import Blueprint, request, jsonify, session
from werkzeug.utils import secure_filename
import pandas as pd
import state
from extensions import db
from models import Dataset, Student
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

            # Persist dataset and students for history tracking
            dataset = Dataset(filename=safe_filename, records=len(state.data_df))
            db.session.add(dataset)
            db.session.commit()
            
            # Identify columns
            df = state.data_df
            student_records = []
            
            # Find a student ID column if it exists, for history tracking
            sid_col = None
            for col in df.columns:
                if 'student_id' in col.lower() or 'id' == col.lower().strip():
                    sid_col = col
                    break
            
            for index, row in df.iterrows():
                # Extract core metrics
                sleep_hours = row.get('sleep_hours') if 'sleep_hours' in df.columns else None
                study_hours = row.get('study_hours') if 'study_hours' in df.columns else None
                stress_level = row.get('stress_level') if 'stress_level' in df.columns else None
                burnout_score = row.get('burnout_score') if 'burnout_score' in df.columns else None
                sentiment_score = row.get('sentiment_score') if 'sentiment_score' in df.columns else None
                risk = row.get('risk') if 'risk' in df.columns else None
                
                # Get student ID if available
                student_id_val = str(row[sid_col]) if sid_col and pd.notnull(row[sid_col]) else None
                
                # Extract remaining data for demographics JSON
                known_cols = {'sleep_hours', 'study_hours', 'stress_level', 'burnout_score', 'sentiment_score', 'risk'}
                if sid_col:
                    known_cols.add(sid_col)
                    
                demo_data = {k: v for k, v in row.to_dict().items() if k not in known_cols and pd.notnull(v)}
                demographics_json = json.dumps(demo_data) if demo_data else None
                
                student = Student(
                    student_id=student_id_val,
                    dataset_id=dataset.id,
                    demographics=demographics_json,
                    sleep_hours=float(sleep_hours) if sleep_hours is not None and not pd.isna(sleep_hours) else None,
                    study_hours=float(study_hours) if study_hours is not None and not pd.isna(study_hours) else None,
                    stress_level=float(stress_level) if stress_level is not None and not pd.isna(stress_level) else None,
                    burnout_score=float(burnout_score) if burnout_score is not None and not pd.isna(burnout_score) else None,
                    sentiment_score=float(sentiment_score) if sentiment_score is not None and not pd.isna(sentiment_score) else None,
                    risk=risk
                )
                student_records.append(student)
                
            db.session.bulk_save_objects(student_records)
            db.session.commit()

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
            db.session.rollback()
            return jsonify({'error': f'An unexpected error occurred during processing: {str(e)}'}), 500
    return jsonify({'error': 'Invalid file format. Only .csv files are supported.'}), 400
