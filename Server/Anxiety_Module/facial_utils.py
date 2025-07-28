import pandas as pd
import numpy as np

def extract_facial_features(file_path):
    try:
        # Read CSV and skip first row if it's a duplicate header
        df = pd.read_csv(file_path)

        if isinstance(df.columns[0], str) and 'frame' in df.columns[0].lower():
            df = pd.read_csv(file_path, skiprows=1)

        # Convert everything to numeric, dropping non-numeric columns
        df = df.apply(pd.to_numeric, errors='coerce')
        df = df.dropna(axis=1, how='all')  # Drop columns with all NaNs

        # Extract stats: mean, std, min, max for each column
        stats = df.describe().loc[['mean', 'std', 'min', 'max']]

        # Flatten to one row with named columns
        flattened = stats.values.flatten()
        col_names = [f"{col}_{stat}" for stat in ['mean', 'std', 'min', 'max'] for col in df.columns]

        feature_df = pd.DataFrame([flattened], columns=col_names)
        feature_df.insert(0, 'participant_id', 'user1')  # Optional ID

        return feature_df

    except Exception as e:
        print(f"Error reading facial data from {file_path}: {e}")
        # Return DataFrame of zeros with consistent column names
        zero_data = pd.DataFrame([np.zeros(100)])  # Adjust size if needed
        zero_data.insert(0, 'participant_id', 'user1')
        return zero_data
