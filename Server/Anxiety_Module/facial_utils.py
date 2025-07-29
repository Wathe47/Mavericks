import pandas as pd
import numpy as np


def extract_facial_features(file_paths):
    """
    Extract facial features from multiple OpenFace output files
    Args:
        file_paths: List of file paths or single file path
    Returns:
        DataFrame with extracted features
    """
    try:
        # Handle both single file and list of files
        if isinstance(file_paths, str):
            file_paths = [file_paths]

        all_features = []

        for file_path in file_paths:
            try:
                # Read CSV and skip first row if it's a duplicate header
                df = pd.read_csv(file_path)

                if isinstance(df.columns[0], str) and "frame" in df.columns[0].lower():
                    df = pd.read_csv(file_path, skiprows=1)

                # Convert everything to numeric, dropping non-numeric columns
                df = df.apply(pd.to_numeric, errors="coerce")
                df = df.dropna(axis=1, how="all")  # Drop columns with all NaNs

                # Extract stats: mean, std, min, max for each column
                stats = df.describe().loc[["mean", "std", "min", "max"]]

                # Flatten to one row with named columns
                flattened = stats.values.flatten()
                col_names = [
                    f"{col}_{stat}"
                    for stat in ["mean", "std", "min", "max"]
                    for col in df.columns
                ]

                file_features = pd.DataFrame([flattened], columns=col_names)
                all_features.append(file_features)

            except Exception as e:
                print(f"Error reading individual facial file {file_path}: {e}")
                # Add zeros for this file
                zero_data = pd.DataFrame([np.zeros(100)])
                all_features.append(zero_data)

        # Combine all features horizontally
        if all_features:
            feature_df = pd.concat(all_features, axis=1)
        else:
            feature_df = pd.DataFrame([np.zeros(300)])  # Default size for 3 files

        feature_df.insert(0, "participant_id", "user1")  # Optional ID
        return feature_df

    except Exception as e:
        print(f"Error reading facial data from {file_paths}: {e}")
        # Return DataFrame of zeros with consistent column names
        zero_data = pd.DataFrame([np.zeros(300)])  # Adjust size for multiple files
        zero_data.insert(0, "participant_id", "user1")
        return zero_data
