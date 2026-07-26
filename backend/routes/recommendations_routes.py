"""
recommendations_routes.py -- Risk-driven recommendations endpoint.

GET /api/recommendations
    Analyses the active dataset and returns a prioritised list of
    actionable insight cards derived from cohort-level statistics.
"""

from flask import Blueprint, jsonify
import state

recommendations_bp = Blueprint("recommendations", __name__)


# ---------------------------------------------------------------------------
# Rule engine: each rule is a (condition_fn, insight_dict) tuple.
# condition_fn receives the stats dict and returns True when the rule fires.
# ---------------------------------------------------------------------------
_RULES = [
    (
        lambda s: s.get("pct_high_risk", 0) >= 30,
        {
            "type":        "Critical",
            "severity":    "High",
            "category":    "Burnout Risk",
            "title":       "High proportion of at-risk students",
            "description": (
                "More than 30% of the cohort is classified as High burnout risk. "
                "Immediate intervention — such as reduced assessment load or "
                "mandatory wellness check-ins — is strongly recommended."
            ),
            "action":      "Schedule group counselling sessions within the next week.",
        },
    ),
    (
        lambda s: (s.get("avg_sleep") or 0) < 6.0,
        {
            "type":        "Warning",
            "severity":    "High",
            "category":    "Sleep Health",
            "title":       "Cohort average sleep below healthy threshold",
            "description": (
                "The cohort averages fewer than 6 hours of sleep per night. "
                "Chronic sleep deprivation is strongly correlated with elevated "
                "burnout and reduced academic performance."
            ),
            "action":      "Introduce sleep hygiene workshops and review late-night deadline policies.",
        },
    ),
    (
        lambda s: (s.get("avg_stress") or 0) >= 7.0,
        {
            "type":        "Warning",
            "severity":    "High",
            "category":    "Stress Management",
            "title":       "Average stress level is critically elevated",
            "description": (
                "The mean self-reported stress level is 7 or above out of 10. "
                "This level of sustained stress is a strong predictor of burnout "
                "within the next academic period."
            ),
            "action":      "Deploy peer-support networks and reduce non-essential workload.",
        },
    ),
    (
        lambda s: (s.get("avg_study") or 0) >= 10.0,
        {
            "type":        "Warning",
            "severity":    "Medium",
            "category":    "Workload",
            "title":       "Excessive average daily study hours",
            "description": (
                "The cohort averages 10 or more study hours per day. "
                "Sustained workloads of this intensity are unsustainable and "
                "significantly increase burnout probability."
            ),
            "action":      "Audit curriculum contact hours and redistribute deadlines across the semester.",
        },
    ),
    (
        lambda s: 15 <= s.get("pct_high_risk", 0) < 30,
        {
            "type":        "Advisory",
            "severity":    "Medium",
            "category":    "Burnout Risk",
            "title":       "Elevated proportion of medium-to-high risk students",
            "description": (
                "Between 15% and 30% of the cohort is at High burnout risk. "
                "While not yet critical, this trend warrants proactive monitoring "
                "and early support outreach."
            ),
            "action":      "Identify at-risk individuals for voluntary one-to-one check-ins.",
        },
    ),
    (
        lambda s: (s.get("avg_sentiment") or 1) < -0.1,
        {
            "type":        "Advisory",
            "severity":    "Medium",
            "category":    "Student Sentiment",
            "title":       "Cohort feedback sentiment is net negative",
            "description": (
                "Aggregate feedback text sentiment is below zero, indicating "
                "prevailing dissatisfaction or distress in written responses. "
                "This often precedes measurable performance decline."
            ),
            "action":      "Conduct an anonymous pulse survey to surface specific concerns.",
        },
    ),
    (
        lambda s: (s.get("avg_burnout") or 0) < 30 and s.get("pct_high_risk", 100) < 10,
        {
            "type":        "Positive",
            "severity":    "Low",
            "category":    "Overall Health",
            "title":       "Cohort burnout levels are within healthy range",
            "description": (
                "The average burnout score is below 30 and fewer than 10% of "
                "students fall into the High-risk tier. Current support structures "
                "appear effective — maintain existing practices."
            ),
            "action":      "Continue regular check-ins and maintain current workload balance.",
        },
    ),
]


def _build_stats(df):
    """Derive summary stats needed by the rule engine from the dataset."""
    stats = {}

    if "burnout_score" in df.columns:
        stats["avg_burnout"] = float(df["burnout_score"].mean())

    if "risk" in df.columns:
        total = max(len(df), 1)
        high  = int((df["risk"] == "High").sum())
        stats["high_risk_count"] = high
        stats["pct_high_risk"]   = round(high / total * 100, 1)

    if "sleep_hours" in df.columns:
        stats["avg_sleep"] = float(df["sleep_hours"].mean())

    if "study_hours" in df.columns:
        stats["avg_study"] = float(df["study_hours"].mean())

    if "stress_level" in df.columns:
        stats["avg_stress"] = float(df["stress_level"].mean())

    if "sentiment_score" in df.columns:
        stats["avg_sentiment"] = float(df["sentiment_score"].mean())

    return stats


@recommendations_bp.route("/api/recommendations", methods=["GET"])
def get_recommendations():
    """
    GET /api/recommendations

    Returns a prioritised list of insight cards derived from cohort statistics.

    Response 200:
        {
            "recommendations": [...],
            "total":           int,
            "stats":           { avg_burnout, pct_high_risk, ... }
        }
    Response 400 if no dataset is loaded.
    """
    df = state.data_df
    if df is None or df.empty:
        return jsonify({
            "error": "No dataset loaded. Upload a CSV from the Home page first."
        }), 400

    stats  = _build_stats(df)
    fired  = [rule for condition, rule in _RULES if condition(stats)]

    # Severity sort order
    _ORDER = {"High": 0, "Medium": 1, "Low": 2}
    fired.sort(key=lambda r: _ORDER.get(r["severity"], 99))

    return jsonify({
        "recommendations": fired,
        "total":           len(fired),
        "stats":           stats,
    })
