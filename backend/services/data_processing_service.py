import pandas as pd
from services.burnout_service import calculate_burnout, assign_risk, calculate_sentiment
from utils.csv_normalize import normalize_dataframe

def process_data(data_df, sia):
    if data_df is None:
        return None, None

    data_df = normalize_dataframe(data_df)

    data_df = calculate_burnout(data_df)
    data_df = assign_risk(data_df)
    data_df = calculate_sentiment(data_df, sia)

    available_cols = [c for c in ['sleep_hours', 'study_hours', 'stress_level', 'burnout_score'] if c in data_df.columns]
    corr_matrix = data_df[available_cols].corr()

    return data_df, corr_matrix
