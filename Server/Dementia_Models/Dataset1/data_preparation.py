import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.cluster import KMeans
from sklearn.model_selection import train_test_split
from sklearn.metrics import silhouette_score
from sklearn.compose import ColumnTransformer
import joblib

# Load data
data = pd.read_csv("./dementia_dataset_1.csv")

# List the columns you want to keep
columns_to_keep = [
    "PatientID",
    "Age",
    "Gender",
    "BMI",
    "FamilyHistoryAlzheimers",
    "Hypertension",
    "CardiovascularDisease",
    "MMSE",
    "ADL",
    "FunctionalAssessment",
    "MemoryComplaints",
    "BehavioralProblems",
    "Diagnosis",
]

# Keep only these columns
data = data[columns_to_keep]

# First split: 60% train, 40% temp_test
train_data, temp_test = train_test_split(data, test_size=0.4, random_state=42)
# Second split: Split the 40% into two equal parts (20% each)
test_data1, test_data2 = train_test_split(temp_test, test_size=0.5, random_state=42)

# Preprocessing
num_cols = [
    col for col in data.columns if col not in ["Diagnosis", "PatientID"] and data[col].nunique() > 5
]
cat_cols = data.columns.difference(num_cols).difference(["Diagnosis", "PatientID"]).to_list()

# Create a preprocessing pipeline
preprocessor = ColumnTransformer(
    transformers=[
        ("num", StandardScaler(), num_cols),
        (
            "cat",
            OneHotEncoder(drop="first", sparse_output=False, handle_unknown="ignore"),
            cat_cols,
        ),
    ],
    remainder="passthrough",
)

# Get feature names after transformation (using only training data)
feature_names = num_cols.copy()
# Add transformed categorical feature names
for col in cat_cols:
    unique_vals = train_data[col].unique()[1:]  # Using only training data
    for val in unique_vals:
        feature_names.append(f"{col}_{val}")

# Add the target column
feature_names.append("Diagnosis")

# Fit preprocessor on training data only
preprocessor.fit(train_data[num_cols + cat_cols])

# Save the preprocessor for later use with new data
joblib.dump(preprocessor, "preprocessor.joblib")


# Transform all datasets
def transform_data(df, preprocessor):
    # Extract the target column
    target = df[["Diagnosis", "PatientID"]].values

    # Transform features
    transformed_features = preprocessor.transform(df[num_cols + cat_cols])

    # Create DataFrame with transformed features
    transformed_df = pd.DataFrame(transformed_features, columns=feature_names[:-1])

    # Add target column back
    transformed_df["Diagnosis"] = target[:, 0]
    transformed_df["PatientID"] = target[:, 1]

    return transformed_df


train_data_transformed = transform_data(train_data, preprocessor)
test_data1_transformed = transform_data(test_data1, preprocessor)
test_data2_transformed = transform_data(test_data2, preprocessor)


# FIT KMEANS ONLY ON TRAINING DATA
# This ensures consistent cluster definitions across all datasets
def create_severity_model(
    train_data, cluster_features, target_column="Diagnosis", n_clusters=3
):
    # Filter only dementia patients for clustering
    dementia_mask = train_data[target_column] == 1
    dementia_patients = train_data[dementia_mask]

    # Fit KMeans only on training dementia patients
    kmeans = KMeans(n_clusters=n_clusters, random_state=42)
    kmeans.fit(dementia_patients[cluster_features])

    # Get cluster assignments for training dementia patients
    train_clusters = kmeans.predict(dementia_patients[cluster_features])

    # Order clusters by MMSE (clinical relevance) - THIS MAPPING IS NOW FIXED
    cluster_order = (
        dementia_patients.groupby(train_clusters)["MMSE"]
        .mean()
        .sort_values(ascending=False)
        .index
    )

    # Create severity mapping based on training data
    severity_mapping = {cluster_order[0]: 1, cluster_order[1]: 2, cluster_order[2]: 3}

    # Calculate silhouette score
    silhouette_avg = (
        silhouette_score(dementia_patients[cluster_features], train_clusters)
        if sum(dementia_mask) >= n_clusters
        else 0
    )

    print(f"Training Silhouette Score: {silhouette_avg}")

    return {"kmeans_model": kmeans, "severity_mapping": severity_mapping}


# Function to apply severity model to any dataset
def apply_severity_model(
    data, severity_model, cluster_features, target_column="Diagnosis"
):
    data_result = data.copy()

    # Identify dementia patients
    dementia_mask = data_result[target_column] == 1

    # If there are dementia patients
    if np.any(dementia_mask):
        # Use the pre-trained model to predict clusters
        kmeans = severity_model["kmeans_model"]
        severity_mapping = severity_model["severity_mapping"]

        # Get clusters for dementia patients
        clusters = kmeans.predict(data_result[dementia_mask][cluster_features])

        # Map clusters to severity levels using the FIXED mapping from training
        y = data_result[target_column].copy()
        y[dementia_mask] = [severity_mapping[c] for c in clusters]

        # Add severity column
        data_result["Severity"] = y

        # Drop the original diagnosis column
        data_result.drop(columns=[target_column], inplace=True)

        return data_result
    else:
        # Handle case with no dementia patients
        data_result["Severity"] = 0
        data_result.drop(columns=[target_column], inplace=True)
        return data_result


# Specify features for clustering
cluster_features = ["MMSE"]

# Create severity model using ONLY training data
severity_model = create_severity_model(train_data_transformed, cluster_features)

# Apply the SAME model to all datasets
clustered_train_data = apply_severity_model(
    train_data_transformed, severity_model, cluster_features
)
clustered_test_data1 = apply_severity_model(
    test_data1_transformed, severity_model, cluster_features
)
clustered_test_data2 = apply_severity_model(
    test_data2_transformed, severity_model, cluster_features
)

# Split clustered data into features and target for all three datasets
y_train = clustered_train_data["Severity"]
X_train = clustered_train_data.drop("Severity", axis=1)

y_test1 = clustered_test_data1["Severity"]
X_test1 = clustered_test_data1.drop("Severity", axis=1)

y_test2 = clustered_test_data2["Severity"]
X_test2 = clustered_test_data2.drop("Severity", axis=1)

# Reorder columns: PatientID, Severity, then the rest
def reorder_columns(df):
    cols = list(df.columns)
    # Remove if already present
    cols.remove("PatientID")
    cols.remove("Severity")
    # Place PatientID and Severity at the front
    return df[["PatientID", "Severity"] + cols]

# Combine features and target into a single dataset for all three datasets
train_dataset = pd.concat([X_train, y_train], axis=1)
test_dataset1 = pd.concat([X_test1, y_test1], axis=1)
test_dataset2 = pd.concat([X_test2, y_test2], axis=1)

# Reorder columns
train_dataset = reorder_columns(train_dataset)
test_dataset1 = reorder_columns(test_dataset1)
test_dataset2 = reorder_columns(test_dataset2)


# Save all three datasets to CSV files
train_dataset.to_csv("train_dataset.csv", index=False)
test_dataset1.to_csv("test_dataset.csv", index=False)
test_dataset2.to_csv("test_dataset_clinical.csv", index=False)

print(
    "Datasets saved successfully as train_dataset.csv, test_dataset.csv, and test_dataset_clinical.csv!"
)
print(
    "Preprocessing and clustering models saved as preprocessor.joblib and severity_model.joblib"
)
