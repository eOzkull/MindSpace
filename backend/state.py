"""
state.py — Session-isolated application state.

Replaces global in-memory state with a Proxy object that dynamically reads/writes
to the database per user session.
"""

import sys
import uuid
import json
import pandas as pd
import nltk
from nltk.sentiment.vader import SentimentIntensityAnalyzer
from flask import session, has_app_context, g
from extensions import db
from models import SessionState

def _get_session_id():
    """Ensure a unique session ID exists for the current user."""
    if 'uid' not in session:
        session['uid'] = uuid.uuid4().hex
        session.modified = True
    return session['uid']

class StateManager:
    """Proxy object that acts like the old AppState but persists to DB."""

    def __init__(self):
        self._sia = None

    def get_sia(self):
        """NLP model is stateless and heavy, load globally in memory once."""
        if self._sia is None:
            try:
                nltk.data.find('sentiment/vader_lexicon.zip')
            except LookupError:
                nltk.download('vader_lexicon', quiet=True)
            self._sia = SentimentIntensityAnalyzer()
        return self._sia

    # --- DB IO Helpers ---
    def _save_state(self, key, value, is_df=False):
        if not has_app_context():
            return
            
        sid = _get_session_id()
        
        # Save to request context cache
        cache_key = f"_state_{key}"
        setattr(g, cache_key, value)
        
        state_record = SessionState.query.filter_by(session_uid=sid, state_key=key).first()
        
        if value is None:
            if state_record:
                db.session.delete(state_record)
                db.session.commit()
            return

        serialized = value.to_json(orient='split') if is_df else json.dumps(value)
        
        if not state_record:
            state_record = SessionState(session_uid=sid, state_key=key, state_value=serialized)
            db.session.add(state_record)
        else:
            state_record.state_value = serialized
            
        db.session.commit()

    def _load_state(self, key, is_df=False, default=None):
        if not has_app_context():
            return default
            
        cache_key = f"_state_{key}"
        if hasattr(g, cache_key):
            return getattr(g, cache_key)
            
        sid = _get_session_id()
        state_record = SessionState.query.filter_by(session_uid=sid, state_key=key).first()
        
        if not state_record or not state_record.state_value:
            setattr(g, cache_key, default)
            return default
            
        try:
            if is_df:
                from io import StringIO
                val = pd.read_json(StringIO(state_record.state_value), orient='split')
            else:
                val = json.loads(state_record.state_value)
        except Exception:
            val = default
            
        setattr(g, cache_key, val)
        return val

    # --- Properties mapping to DB ---

    @property
    def data_df(self):
        return self._load_state('data_df', is_df=True)

    @data_df.setter
    def data_df(self, df):
        self._save_state('data_df', df, is_df=True)

    @property
    def compare_df(self):
        return self._load_state('compare_df', is_df=True)

    @compare_df.setter
    def compare_df(self, df):
        self._save_state('compare_df', df, is_df=True)

    @property
    def corr_matrix(self):
        return self._load_state('corr_matrix', is_df=True)

    @corr_matrix.setter
    def corr_matrix(self, matrix):
        self._save_state('corr_matrix', matrix, is_df=True)

    @property
    def compare_meta(self):
        return self._load_state('compare_meta', is_df=False)

    @compare_meta.setter
    def compare_meta(self, meta):
        self._save_state('compare_meta', meta, is_df=False)

    @property
    def eval_metrics(self):
        return self._load_state('eval_metrics', is_df=False, default={'primary': None, 'compare': None})

    @eval_metrics.setter
    def eval_metrics(self, metrics):
        self._save_state('eval_metrics', metrics, is_df=False)


sys.modules[__name__] = StateManager()

