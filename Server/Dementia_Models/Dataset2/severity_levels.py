import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import silhouette_score

# Load the processed train and test datasets
df = pd.read_csv("dementia_dataset_5.csv")

df["Disfluency_Ratio"] = df["Pauses"] / (df["Key_Elements_Described"] + 1)

# Small constant to avoid division by zero
epsilon = 1e-6

# Calculate the composite severity score for each row
df["Severity_Score"] = (df["Pauses"] + df["Repair_Rate"] + df["Irrelevant_Details"]) / (
    df["Parse_Tree_Depth"] + df["Key_Elements_Described"] + epsilon
)

df["Cognitive_Expression_Score"] = (
    df["TTR"] * 0.1 + df["Idea_Density"] * 0.1 + df["Parse_Tree_Depth"] * 0.05
)


selected_features = [
    "Cognitive_Expression_Score",
    "Disfluency_Ratio",
    "Severity_Score",
]

# Filter only dementia patients (Class_label == 1)
dementia_df = df[df["Class_label"] == 1].copy()

X = dementia_df[selected_features]

# Scale features
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# Apply KMeans clustering with 3 clusters
kmeans = KMeans(n_clusters=3, random_state=42, n_init=10)
dementia_df["Severity_Cluster"] = kmeans.fit_predict(X_scaled)

# Print the number of entries per cluster
Severity_counts = dementia_df["Severity_Cluster"].value_counts()
print("Number of entries per cluster:")
print(Severity_counts)

# Analyze cluster means
cluster_means = dementia_df.groupby("Severity_Cluster")[selected_features].mean()
print("Cluster means (for interpretation):")
print(cluster_means)

# Map clusters to severity labels (based on feature inspection)
# Check the printed means to adjust this mapping as needed!
cluster_to_severity = {0: "1", 1: "3", 2: "2"}
dementia_df["Severity"] = dementia_df["Severity_Cluster"].map(cluster_to_severity)

# Combine back with control group
control_df = df[df["Class_label"] == 0].copy()
control_df["Severity"] = "0"

final_df = pd.concat([control_df, dementia_df], ignore_index=True)

# Calculate Silhouette Score
silhouette_avg = silhouette_score(X_scaled, dementia_df["Severity_Cluster"])
print(f"Silhouette Score: {silhouette_avg}")

final_df.drop(columns=['Class_label','Severity_Cluster','Disfluency_Ratio','Severity_Score','Cognitive_Expression_Score'], inplace=True)

# Save final dataset
final_df.to_csv("dementia_dataset_6.csv", index=False)

print(" Results saved to 'dementia_dataset_6.csv'.")

# Print the number of entries per cluster
Severity_counts = final_df["Severity"].value_counts()
print("Number of entries per cluster:")
print(Severity_counts)
