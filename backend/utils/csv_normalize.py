import pandas as pd

def normalize_dataframe(df):
    """
    Fuzzy maps and normalizes target columns 'sleep_hours', 'study_hours', 'stress_level'
    in-place in the dataframe.
    """
    col_map = {
        'sleep_hours': ['sleep_hours', 'sleep hours', 'sleep', 'sleeping_hours'],
        'study_hours': ['study_hours', 'study hours', 'study', 'studying_hours'],
        'stress_level': ['stress_level', 'stress level', 'stress', 'stress_score']
    }
    
    for target, variations in col_map.items():
        actual_col = None
        for col in df.columns:
            if col.lower().strip() in variations:
                actual_col = col
                break
        
        if actual_col is not None:
            # Map column to canonical name if it is different
            if actual_col != target:
                df[target] = df[actual_col]
            df[target] = pd.to_numeric(df[target], errors='coerce').fillna(0)
            df[target] = df[target].apply(lambda x: max(x, 0))
        else:
            # Default fallback if not found (though validation ensures it exists)
            df[target] = 0.0

    return df
