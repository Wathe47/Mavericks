import pandas as pd

# Load data
data2 = pd.read_csv("dementia_dataset_2_combined.csv")
data3 = pd.read_csv("dementia_dataset_3.csv")

# Find and print duplicate values
duplicate_values = data2[data2["message"].isin(data3["Transcript_CTD"])]

if not duplicate_values.empty:
    print("Duplicate values found:")
    print(duplicate_values["message"])
else:
    print("No duplicate values found between 'message' and 'Transcript_CTD' columns.")

# Remove duplicate values from data2
data2 = data2[~data2["message"].isin(data3["Transcript_CTD"])]

print("Duplicates removed from 'data2'.")

# Update "label" in data2: control -> 0, dementia -> 1
data2["Label"] = data2["Label"].replace({"control": 0, "dementia": 1})

# Convert "Class_label" values in data3: 2 -> 1
data3["Class_label"] = data3["Class_label"].replace(2, 1)

# Remove the "Class" column from data3
if "Class" in data3.columns:
    data3 = data3.drop(columns=["Class"])

# Retain only "Label" and "message" columns in data2
data2 = data2[["Label", "message"]]

print("Retained only 'Label' and 'message' columns in 'data2'.")

print("Data transformations completed.")

# Keep only entries with more than 10 characters in the "message" column
data2 = data2[data2["message"].str.len() > 50]

# Count the number of entries left
remaining_entries = len(data2)
print(f"Number of entries left in 'data2': {remaining_entries}")

# Rename columns in data2 to match data3
data2 = data2.rename(columns={"message": "Transcript_CTD", "Label": "Class_label"})

# Retain only "Transcript_CTD", "Transcript_PFT", "Transcript_SFT", and "Class_label" columns in data3
data3 = data3[["Transcript_CTD", "Transcript_PFT", "Transcript_SFT", "Class_label"]]

print("Retained only 'Transcript_CTD', 'Transcript_PFT', 'Transcript_SFT', and 'Class_label' columns in 'data3'.")


# Split data3 into two halves
half_index = len(data3) // 2
data3_top = data3.iloc[:half_index]
data3_bottom = data3.iloc[half_index:]

# Combine the datasets with one half of data3 at the top and the other half at the end
combined_data = pd.concat([data3_top, data2, data3_bottom], ignore_index=True)

# Add a recordID column
combined_data.reset_index(inplace=True)
combined_data.rename(columns={"index": "recordID"}, inplace=True)

print("Datasets combined successfully with data3 split into two halves.")
print(f"Combined dataset has {len(combined_data)} entries.")

# Save the combined dataset to a CSV file
combined_data.to_csv("dementia_dataset_4.csv", index=False)

print("Combined dataset saved to 'dementia_dataset_4.csv'.")