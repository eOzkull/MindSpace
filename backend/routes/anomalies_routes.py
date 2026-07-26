"""
anomalies_routes.py -- IQR-based anomaly detection endpoint.

GET /api/anomalies
    Scans the active dataset for statistical outliers across all numeric
    columns using the interquartile-range (IQR) fence method.  Returns at
    most MAX_ANOMALIES records ordered by absolute z-score descending.
"""

import numpy as np
from flask import Blueprint, jsonify
import state

anomalies_bp = Blueprint("anomalies", __name__)

# Maximum rows returned to the UI (keeps payload small)
MAX_ANOMALIES = 50

# Columns to scan and their human-readable labels
TRACKED_COLUMNS = {
    "burnout_score":   "Burnout Score",
    "sleep_hours":     "Sleep Hours",
    "study_hours":     "Study Hours",
    "stress_level":    "Stress Level",
    "sentiment_score": "Sentiment Score",
}


def _classify_severity(z_abs):
    """Return severity label based on z-score magnitude."""
    if z_abs >= 3.0:
        return "High"
    if z_abs >= 2.0:
        return "Medium"
    return "Low"


def _detect_anomalies(df):
    """
    Run IQR outlier detection on each tracked numeric column.

    Observations outside [Q1 - 1.5*IQR, Q3 + 1.5*IQR] are flagged.
    Returns list of anomaly dicts sorted by z-score descending.
    """
    anomalies = []

    for col, label in TRACKED_COLUMNS.items():
        if col not in df.columns:
            continue

        series = df[col].dropna()
        if len(series) < 10:
            continue

        q1  = float(series.quantile(0.25))
        q3  = float(series.quantile(0.75))
        iqr = q3 - q1

        if iqr == 0:
            continue

        lower_fence = q1 - 1.5 * iqr
        upper_fence = q3 + 1.5 * iqr
        median      = float(series.median())
        std         = float(series.std()) or 1.0

        for original_idx, value in series.items():
            val_f = float(value)
            if lower_fence <= val_f <= upper_fence:
                continue

            z_abs     = abs((val_f - median) / std)
            severity  = _classify_severity(z_abs)
            direction = "above" if val_f > median else "below"

            # Build student identifier
            sid_val = None
            for sid_col in ("student_id", "id", "ID"):
                if sid_col in df.columns:
                    sid_val = df.loc[original_idx, sid_col]
                    break
            student_label = f"ST-{sid_val}" if sid_val else f"Row {original_idx}"

            anomalies.append({
                "id":          student_label,
                "metric":      label,
                "column":      col,
                "value":       round(val_f, 3),
                "median":      round(median, 3),
                "q1":          round(q1, 3),
                "q3":          round(q3, 3),
                "iqr":         round(iqr, 3),
                "lower_fence": round(lower_fence, 3),
                "upper_fence": round(upper_fence, 3),
                "z_score":     round(z_abs, 3),
                "direction":   direction,
                "severity":    severity,
                "description": (
                    f"{student_label} has a {label} of {round(val_f, 2)}, "
                    f"which is {direction} the IQR fence "
                    f"({round(lower_fence, 2)} - {round(upper_fence, 2)}). "
                    f"z-score: {round(z_abs, 2)}."
                ),
            })

    anomalies.sort(key=lambda a: a["z_score"], reverse=True)
    return anomalies[:MAX_ANOMALIES]


@anomalies_bp.route("/api/anomalies", methods=["GET"])
def get_anomalies():
    """
    GET /api/anomalies

    Returns statistical outliers from the active dataset.

    Response 200:
        {
            "anomalies":       [...],
            "total_scanned":   int,
            "total_flagged":   int,
            "columns_scanned": [...]
        }
    Response 400 if no dataset is loaded.
    """
    df = state.data_df
    if df is None or df.empty:
        return jsonify({
            "error": "No dataset loaded. Upload a CSV from the Home page first."
        }), 400

    anomalies    = _detect_anomalies(df)
    cols_scanned = [c for c in TRACKED_COLUMNS if c in df.columns]

    return jsonify({
        "anomalies":       anomalies,
        "total_scanned":   len(df),
        "total_flagged":   len(anomalies),
        "columns_scanned": cols_scanned,
    })
