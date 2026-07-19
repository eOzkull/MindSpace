import os
import shutil
from flask import Blueprint, session, jsonify
import state
from extensions import db
from models import Student, Dataset

history_bp = Blueprint('history', __name__)


@history_bp.route('/api/history', methods=['GET'])
def get_history():
    history = session.get('history', [])
    return jsonify({'history': history})


@history_bp.route('/api/students/<string:student_id>/history', methods=['GET'])
def get_student_history(student_id):
    # Query history of a student across all datasets they appear in
    student_records = Student.query.join(Dataset).filter(
        Student.student_id == student_id
    ).order_by(Dataset.uploaded_at.asc()).all()

    if not student_records:
        return jsonify({'error': 'Student not found in any dataset'}), 404

    history_data = []
    for record in student_records:
        history_data.append({
            'dataset_id': record.dataset.id,
            'dataset_filename': record.dataset.filename,
            'uploaded_at': record.dataset.uploaded_at.isoformat(),
            'burnout_score': record.burnout_score,
            'stress_level': record.stress_level,
            'sentiment_score': record.sentiment_score,
            'risk': record.risk
        })

    return jsonify({
        'student_id': student_id,
        'history': history_data
    })


@history_bp.route('/api/reset', methods=['POST'])
def reset():
    session.pop('history', None)
    sid = session.get('uid')
    if sid:
        from models import SessionState
        SessionState.query.filter_by(session_uid=sid).delete()
        db.session.commit()
    return jsonify({'success': True})


@history_bp.route('/api/delete-session/<int:idx>', methods=['DELETE'])
def delete_session(idx):
    history = session.get('history', [])
    if 0 <= idx < len(history):
        history.pop(idx)
        session['history'] = history
        session.modified = True
    return jsonify({'success': True, 'history': session.get('history', [])})

