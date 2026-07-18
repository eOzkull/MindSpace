from utils.logger import logger

def _auto_train(df, target='primary'):
    """Train a RandomForest on the specified dataset and return metrics."""
    if df is None:
        return None

    try:
        from sklearn.ensemble import RandomForestClassifier
        from sklearn.model_selection import train_test_split
        from sklearn.preprocessing import LabelEncoder
        from sklearn.metrics import (
            accuracy_score, precision_score, recall_score,
            f1_score, roc_auc_score, confusion_matrix, classification_report
        )
        feature_cols = [c for c in ['sleep_hours', 'study_hours', 'stress_level'] if c in df.columns]
        if 'risk' not in df.columns or len(feature_cols) < 2:
            return None

        df_clean = df[feature_cols + ['risk']].dropna()
        if df_clean.empty or df_clean['risk'].nunique() < 2:
            return None

        le = LabelEncoder()
        y = le.fit_transform(df_clean['risk'])
        X = df_clean[feature_cols].values
        class_names = le.classes_.tolist()

        if len(y) < 10:
            return None

        test_size = max(0.15, min(0.3, 20 / len(y)))
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=test_size, random_state=42, stratify=y
        )

        model = RandomForestClassifier(n_estimators=100, random_state=42)
        model.fit(X_train, y_train)

        y_pred = model.predict(X_test)
        y_prob = model.predict_proba(X_test)

        cm = confusion_matrix(y_test, y_pred).tolist()
        report = classification_report(y_test, y_pred, target_names=class_names, output_dict=True, zero_division=0)

        roc_auc = None
        try:
            if len(class_names) > 2:
                roc_auc = round(roc_auc_score(y_test, y_prob, multi_class='ovr'), 4)
        except:
            pass

        metrics = {
            'accuracy':  round(accuracy_score(y_test, y_pred), 4),
            'precision': round(precision_score(y_test, y_pred, average='weighted', zero_division=0), 4),
            'recall':    round(recall_score(y_test, y_pred, average='weighted', zero_division=0), 4),
            'f1':        round(f1_score(y_test, y_pred, average='weighted', zero_division=0), 4),
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