import pandas as pd

def validate_csv(df):
    """
    Validates the uploaded dataset.
    Returns (is_valid, error_message).
    """
    if df is None or df.empty:
        return False, "The uploaded dataset is empty."
    
    # Fuzzy column mapping to check for required features
    col_map = {
        'sleep_hours': ['sleep_hours', 'sleep hours', 'sleep', 'sleeping_hours'],
        'study_hours': ['study_hours', 'study hours', 'study', 'studying_hours'],
        'stress_level': ['stress_level', 'stress level', 'stress', 'stress_score']
    }
    
    missing_cols = []
    
    for target, variations in col_map.items():
        found = any(col.lower().strip() in variations for col in df.columns)
        if not found:
            missing_cols.append(target)
            
    if missing_cols:
        return False, f"Missing required columns (or recognizable variations): {', '.join(missing_cols)}"
        
    return True, None
