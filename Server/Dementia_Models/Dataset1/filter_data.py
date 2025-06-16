import pandas as pd

# Load the dataset
df = pd.read_csv('dementia_dataset_1.csv')

# Specify the columns to keep
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

# Filter the dataframe
filtered_df = df[columns_to_keep]

# Save the filtered dataframe
filtered_df.to_csv('dementia_dataset_1_filtered.csv', index=False)