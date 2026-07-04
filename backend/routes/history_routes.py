import os
import shutil
from flask import Blueprint, session, jsonify
import state

history_bp = Blueprint('history', __name__)


@history_bp.route('/api/history', methods=['GET'])
def get_history():
    history = session.get('history', [])
    return jsonify({'history': history})


@history_bp.route('/api/reset', methods=['POST'])
def reset():
    session.pop('history', None)
    user_dir = state.get_user_dir()
    if os.path.exists(user_dir):
        shutil.rmtree(user_dir, ignore_errors=True)
    return jsonify({'success': True})


@history_bp.route('/api/delete-session/<int:idx>', methods=['DELETE'])
def delete_session(idx):
    history = session.get('history', [])
    if 0 <= idx < len(history):
        history.pop(idx)
        session['history'] = history
        session.modified = True
    return jsonify({'success': True, 'history': session.get('history', [])})
