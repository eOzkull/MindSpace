import pandas as pd
import numpy as np

def calculate_burnout(df):
    """
    Calculates the burnout score for a DataFrame.
    Expects 'study_hours', 'sleep_hours', and 'stress_level' columns.
    """
    if 'burnout_score' not in df.columns:
        df['burnout_score'] = df.apply(
            lambda row: ((row.get('study_hours', 0) / row.get('sleep_hours', 1)
                          if row.get('sleep_hours', 0) > 0 else 0) * row.get('stress_level', 0)) * 10,
            axis=1
        )
        df['burnout_score'] = np.clip(df['burnout_score'], 0, 100)
    return df

def assign_risk(df):
    """
    Assigns a burnout risk category based on the burnout score.
    """
    if 'risk' not in df.columns:
        df['risk'] = pd.cut(
            df['burnout_score'], bins=[-1, 33, 66, 101], labels=['Low', 'Medium', 'High']
        )
    return df

def calculate_sentiment(df, sia):
    """
    Calculates the sentiment score from feedback if the feedback column exists.
    """
    if 'feedback' in df.columns:
        df['sentiment_score'] = df['feedback'].apply(
            lambda x: sia.polarity_scores(str(x))['compound']
        )
    else:
        if 'sentiment_score' not in df.columns:
            df['sentiment_score'] = 0
    return df
