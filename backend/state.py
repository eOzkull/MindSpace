"""
state.py — Session-isolated application state.

Replaces global in-memory state with a Proxy object that dynamically reads/writes
to disk per user session.
"""

import sys
import os
import json
import uuid
import pandas as pd
import nltk
from nltk.sentiment.vader import SentimentIntensityAnalyzer
from flask import session, has_app_context, g

SESSION_DIR = os.path.join(os.path.dirname(__file__), 'data', 'sessions')
os.makedirs(SESSION_DIR, exist_ok=True)

def _get_session_id():
    """Ensure a unique session ID exists for the current user."""
    # We must operate inside a Flask request context.
    if 'uid' not in session:
        session['uid'] = uuid.uuid4().hex
        session.modified = True
    return session['uid']

def _get_user_dir():
    """Get the absolute path to the user's specific data folder."""
    sid = _get_session_id()
    user_dir = os.path.join(SESSION_DIR, sid)
    os.makedirs(user_dir, exist_ok=True)
    return user_dir

class StateManager:
    """Proxy object that acts like the old AppState but persists to disk."""

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

    def get_user_dir(self):
        """Public wrapper for the module-level _get_user_dir helper."""
        return _get_user_dir()

    # --- Disk IO Helpers ---
    def _save_df(self, name, df):
        path = os.path.join(_get_user_dir(), f"{name}.pkl")
        if df is None:
            if os.path.exists(path):
                os.remove(path)
            if has_app_context():
                g.pop(f"_state_df_{name}", None)
        else:
            df.to_pickle(path)
            if has_app_context():
                setattr(g, f"_state_df_{name}", df)

    def _load_df(self, name):
        if has_app_context() and hasattr(g, f"_state_df_{name}"):
            return getattr(g, f"_state_df_{name}")
            
        path = os.path.join(_get_user_dir(), f"{name}.pkl")
        df = None
        if os.path.exists(path):
            df = pd.read_pickle(path)
            
        if has_app_context():
            setattr(g, f"_state_df_{name}", df)
        return df

    def _save_json(self, name, data):
        path = os.path.join(_get_user_dir(), f"{name}.json")
        if data is None:
            if os.path.exists(path):
                os.remove(path)
            if has_app_context():
                g.pop(f"_state_json_{name}", None)
        else:
            with open(path, 'w') as f:
                json.dump(data, f)
            if has_app_context():
                setattr(g, f"_state_json_{name}", data)

    def _load_json(self, name, default=None):
        if has_app_context() and hasattr(g, f"_state_json_{name}"):
            return getattr(g, f"_state_json_{name}")
            
        path = os.path.join(_get_user_dir(), f"{name}.json")
        data = default
        if os.path.exists(path):
            with open(path, 'r') as f:
                data = json.load(f)
                
        if has_app_context():
            setattr(g, f"_state_json_{name}", data)
        return data

    # --- Properties mapping to disk ---

    @property
    def data_df(self):
        return self._load_df('data_df')

    @data_df.setter
    def data_df(self, df):
        self._save_df('data_df', df)

    @property
    def compare_df(self):
        return self._load_df('compare_df')

    @compare_df.setter
    def compare_df(self, df):
        self._save_df('compare_df', df)

    @property
    def corr_matrix(self):
        # Using pickle instead of json for corr_matrix because it's a DataFrame or Series sometimes
        return self._load_df('corr_matrix')

    @corr_matrix.setter
    def corr_matrix(self, matrix):
        self._save_df('corr_matrix', matrix)

    @property
    def compare_meta(self):
        return self._load_json('compare_meta')

    @compare_meta.setter
    def compare_meta(self, meta):
        self._save_json('compare_meta', meta)

    @property
    def eval_metrics(self):
        return self._load_json('eval_metrics', default={'primary': None, 'compare': None})

    @eval_metrics.setter
    def eval_metrics(self, metrics):
        self._save_json('eval_metrics', metrics)


sys.modules[__name__] = StateManager()
