# import dementia_dataset_1.csv and output the mean values for numerical columns and output mode values for categorical columns
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
import joblib
import warnings
warnings.filterwarnings("ignore")

# Load the dataset
data = pd.read_csv("dementia_dataset_1.csv")
# Drop unnecessary columns
data.drop(["PatientID", "DoctorInCharge"], axis=1, inplace=True)
# Identify numerical features: features with more than 5 unique values are considered numerical
num_cols = [
    col for col in data.columns if col != "Diagnosis" and data[col].nunique() > 5
]
# Identify categorical features: features that are not numerical and not 'Diagnosis'
cat_cols = data.columns.difference(num_cols).difference(["Diagnosis"]).to_list()
# Create a preprocessing pipeline
preprocessor = ColumnTransformer(
    transformers=[
        ('num', StandardScaler(), num_cols),
        ('cat', OneHotEncoder(drop='first', sparse_output=False, handle_unknown='ignore'), cat_cols)
    ],
    remainder='passthrough'
)

# Fit the preprocessor on the entire dataset
preprocessor.fit(data[num_cols + cat_cols])
# Transform the dataset
transformed_features = preprocessor.transform(data[num_cols + cat_cols])
# Create a DataFrame with transformed features
transformed_df = pd.DataFrame(transformed_features, columns=preprocessor.get_feature_names_out())

# Calculate mean values for numerical columns
mean_values = {}
for col in num_cols:
    # Find the transformed column name that corresponds to the original column
    transformed_col = f'num__{col}'
    if transformed_col in transformed_df.columns:
        mean_values[col] = transformed_df[transformed_col].mean()

# Calculate mode values for categorical columns
mode_values = {}
for col in cat_cols:
    mode_values[col] = data[col].mode()[0]  # Get the most frequent value for each categorical column

# Combine mean and mode values into a single dictionary
mean_mode_values = {**mean_values, **mode_values}
# Save the mean and mode values to a file
with open('mean_mode_values.txt', 'w') as f:
    for key, value in mean_mode_values.items():
        f.write(f"{key}: {value}\n")
# Print the mean and mode values
print("Mean values for numerical columns:")
for key, value in mean_values.items():
    print(f"{key}: {value}")
print("\nMode values for categorical columns:")
for key, value in mode_values.items():
    print(f"{key}: {value}")

