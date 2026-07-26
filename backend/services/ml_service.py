import numpy as np
import pandas as pd
from utils.logger import logger


class _NumPyDecisionTree:
    """Lightweight pure-NumPy Decision Tree classifier fallback when sklearn is not installed."""

    def __init__(self, max_depth=5, min_samples_split=2):
        self.max_depth = max_depth
        self.min_samples_split = min_samples_split
        self.tree = None

    def _gini(self, y):
        if len(y) == 0:
            return 0.0
        _, counts = np.unique(y, return_counts=True)
        probs = counts / len(y)
        return float(1.0 - np.sum(probs ** 2))

    def _best_split(self, X, y):
        best_gini = 1.0
        best_col, best_thresh = None, None
        n_samples, n_features = X.shape
        if n_samples < self.min_samples_split:
            return None, None

        for col in range(n_features):
            thresholds = np.unique(X[:, col])
            for thresh in thresholds:
                left_mask = X[:, col] <= thresh
                right_mask = ~left_mask
                if not np.any(left_mask) or not np.any(right_mask):
                    continue
                gini_left = self._gini(y[left_mask])
                gini_right = self._gini(y[right_mask])
                weighted_gini = (np.sum(left_mask) * gini_left + np.sum(right_mask) * gini_right) / n_samples
                if weighted_gini < best_gini:
                    best_gini = weighted_gini
                    best_col = col
                    best_thresh = thresh
        return best_col, best_thresh

    def _build_tree(self, X, y, depth=0):
        n_samples = len(y)
        classes = np.unique(y)
        if depth >= self.max_depth or len(classes) == 1 or n_samples < self.min_samples_split:
            counts = np.bincount(y.astype(int), minlength=3)
            probs = counts / max(1, len(y))
            return {'leaf': True, 'prediction': int(np.argmax(counts)), 'probs': probs}

        col, thresh = self._best_split(X, y)
        if col is None:
            counts = np.bincount(y.astype(int), minlength=3)
            probs = counts / max(1, len(y))
            return {'leaf': True, 'prediction': int(np.argmax(counts)), 'probs': probs}

        left_mask = X[:, col] <= thresh
        right_mask = ~left_mask
        left_tree = self._build_tree(X[left_mask], y[left_mask], depth + 1)
        right_tree = self._build_tree(X[right_mask], y[right_mask], depth + 1)
        return {'leaf': False, 'col': col, 'thresh': thresh, 'left': left_tree, 'right': right_tree}

    def fit(self, X, y):
        self.tree = self._build_tree(X, y)

    def _predict_row(self, node, row):
        if node['leaf']:
            return node['prediction'], node['probs']
        if row[node['col']] <= node['thresh']:
            return self._predict_row(node['left'], row)
        else:
            return self._predict_row(node['right'], row)

    def predict(self, X):
        preds = [self._predict_row(self.tree, row)[0] for row in X]
        return np.array(preds)

    def predict_proba(self, X):
        probs = [self._predict_row(self.tree, row)[1] for row in X]
        return np.array(probs)


def _compute_numpy_metrics(y_true, y_pred, y_prob, class_names):
    num_classes = len(class_names)
    cm = [[int(np.sum((y_true == i) & (y_pred == j))) for j in range(num_classes)] for i in range(num_classes)]
    
    report = {}
    total_samples = len(y_true)
    weighted_p, weighted_r, weighted_f1 = 0.0, 0.0, 0.0

    for i, c_name in enumerate(class_names):
        tp = float(np.sum((y_true == i) & (y_pred == i)))
        fp = float(np.sum((y_true != i) & (y_pred == i)))
        fn = float(np.sum((y_true == i) & (y_pred != i)))
        support = int(np.sum(y_true == i))

        prec = round(tp / (tp + fp), 4) if (tp + fp) > 0 else 0.0
        rec  = round(tp / (tp + fn), 4) if (tp + fn) > 0 else 0.0
        f1   = round(2 * prec * rec / (prec + rec), 4) if (prec + rec) > 0 else 0.0

        report[str(c_name)] = {'precision': prec, 'recall': rec, 'f1-score': f1, 'support': support}
        weighted_p += prec * support
        weighted_r += rec * support
        weighted_f1 += f1 * support

    acc = round(float(np.mean(y_true == y_pred)), 4)
    weighted_p = round(weighted_p / max(1, total_samples), 4)
    weighted_r = round(weighted_r / max(1, total_samples), 4)
    weighted_f1 = round(weighted_f1 / max(1, total_samples), 4)

    return acc, weighted_p, weighted_r, weighted_f1, cm, report


def _auto_train(df, target='primary'):
    """Train a classification model on the dataset and return metrics."""
    if df is None or df.empty:
        return None

    try:
        feature_cols = [c for c in ['sleep_hours', 'study_hours', 'stress_level'] if c in df.columns]
        if 'risk' not in df.columns or len(feature_cols) < 2:
            return None

        df_clean = df[feature_cols + ['risk']].dropna()
        if df_clean.empty or df_clean['risk'].nunique() < 2:
            return None

        # Categorical label mapping
        risk_labels = ['Low', 'Medium', 'High']
        existing_risks = [r for r in risk_labels if r in df_clean['risk'].values]
        if len(existing_risks) < 2:
            existing_risks = sorted(df_clean['risk'].unique().tolist())

        label_to_id = {val: idx for idx, val in enumerate(existing_risks)}
        y = np.array([label_to_id.get(val, 0) for val in df_clean['risk']])
        X = df_clean[feature_cols].values
        class_names = existing_risks

        if len(y) < 10:
            return None

        # Train/test split index
        n_samples = len(y)
        n_test = max(2, min(int(n_samples * 0.25), 20))
        indices = np.arange(n_samples)
        np.random.seed(42)
        np.random.shuffle(indices)

        test_idx = indices[:n_test]
        train_idx = indices[n_test:]

        X_train, X_test = X[train_idx], X[test_idx]
        y_train, y_test = y[train_idx], y[test_idx]

        # Try sklearn first; fall back to NumPy DecisionTree if sklearn is omitted (e.g. Vercel deployment)
        try:
            from sklearn.ensemble import RandomForestClassifier
            from sklearn.metrics import (
                accuracy_score, precision_score, recall_score,
                f1_score, roc_auc_score, confusion_matrix, classification_report
            )
            model = RandomForestClassifier(n_estimators=100, random_state=42)
            model.fit(X_train, y_train)

            y_pred = model.predict(X_test)
            y_prob = model.predict_proba(X_test)

            labels_idx = list(range(len(class_names)))
            cm = confusion_matrix(y_test, y_pred, labels=labels_idx).tolist()
            report = classification_report(y_test, y_pred, labels=labels_idx, target_names=class_names, output_dict=True, zero_division=0)
            
            acc = round(accuracy_score(y_test, y_pred), 4)
            prec = round(precision_score(y_test, y_pred, average='weighted', zero_division=0), 4)
            rec = round(recall_score(y_test, y_pred, average='weighted', zero_division=0), 4)
            f1 = round(f1_score(y_test, y_pred, average='weighted', zero_division=0), 4)

            roc_auc = None
            try:
                if len(class_names) > 2:
                    roc_auc = round(roc_auc_score(y_test, y_prob, multi_class='ovr'), 4)
            except:
                pass

        except ImportError:
            # Pure NumPy fallback for lightweight serverless environments
            model = _NumPyDecisionTree(max_depth=5)
            model.fit(X_train, y_train)

            y_pred = model.predict(X_test)
            y_prob = model.predict_proba(X_test)

            acc, prec, rec, f1, cm, report = _compute_numpy_metrics(y_test, y_pred, y_prob, class_names)
            roc_auc = None

        metrics = {
            'accuracy':  acc,
            'precision': prec,
            'recall':    rec,
            'f1':        f1,
            'roc_auc':   roc_auc,
            'class_names': class_names,
            'n_test': len(y_test),
            'n_train': len(y_train),
            'n_total': len(y),
            'features': feature_cols,
            'report': report,
            'confusion_matrix': cm,
        }

        return metrics

    except Exception as e:
        logger.error(f"[Auto-train error] {e}", exc_info=True)
        return None