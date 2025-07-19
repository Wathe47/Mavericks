import pandas as pd

# Load your datasets (replace with actual paths)
clinical_df = pd.read_csv("../Dataset1/test_dataset_clinical.csv")
text_df = pd.read_csv("../Dataset2/test_dataset_speech.csv")

# Make sure 'Severity' column exists
assert "Severity" in clinical_df.columns and "Severity" in text_df.columns, "Missing Severity column!"

# Get unique severity labels
severity_labels = sorted(set(clinical_df["Severity"]).intersection(set(text_df["Severity"])))

merged_rows = []

for severity in severity_labels:
    clinical_group = clinical_df[clinical_df["Severity"] == severity].reset_index(drop=True)
    text_group = text_df[text_df["Severity"] == severity].reset_index(drop=True)

    # Find how many we can match
    n = min(len(clinical_group), len(text_group))

    # Take the first n rows from each
    clinical_matched = clinical_group.iloc[:n].reset_index(drop=True)
    text_matched = text_group.iloc[:n].reset_index(drop=True)

    # Drop duplicate Severity column from text
    text_matched = text_matched.drop(columns=["Severity"])

    # Combine them column-wise
    merged = pd.concat([clinical_matched, text_matched], axis=1)
    merged_rows.append(merged)

# Concatenate all severity-matched rows into a final dataframe
final_merged_df = pd.concat(merged_rows, axis=0).reset_index(drop=True)

# Reorder columns: keep the first column, then RecordID, then Severity, then the rest
cols = list(final_merged_df.columns)

# Remove RecordID and Severity if they exist elsewhere
cols.remove("recordID")
cols.remove("Severity")

# Insert RecordID at position 1 and Severity at position 2
cols = [cols[0], "recordID", "Severity"] + cols[1:]

final_merged_df = final_merged_df.reindex(columns=cols)

# Save it
final_merged_df.to_csv("merged_features.csv", index=False)

print("Merged dataset created!")
print("Shape:", final_merged_df.shape)
print("Severity counts:\n", final_merged_df["Severity"].value_counts())
