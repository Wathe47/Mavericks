import pandas as pd
import torch
import numpy as np
import re
import xgboost as xgb
from sklearn.model_selection import train_test_split, RandomizedSearchCV
from sklearn.metrics import classification_report, accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
from transformers import BertTokenizer, BertModel
from sklearn.preprocessing import StandardScaler
from scipy.stats import randint, uniform
from imblearn.over_sampling import SMOTE
import matplotlib.pyplot as plt
from xgboost import plot_importance

# Load dataset
df = pd.read_csv("dementia_dataset_6.csv")
df['Severity'] = df['Severity'].astype(int)

# Clean text
def clean_text(text):
    text = str(text).lower()
    text = re.sub(r"\s+", " ", text)
    return text.strip()

df["Transcript_CTD"] = df["Transcript_CTD"].fillna("").apply(clean_text)
df["Transcript_PFT"] = df["Transcript_PFT"].fillna("").apply(clean_text)
df["Transcript_SFT"] = df["Transcript_SFT"].fillna("").apply(clean_text)

# Use only numeric features
feature_columns = df.select_dtypes(include=[np.number]).columns.tolist()
feature_columns.remove('Severity')  # Exclude the target column

# Split dataset
train_idx, test_idx = train_test_split(df.index, test_size=0.2, random_state=42)
train_labels = df.loc[train_idx, 'Severity']
test_labels = df.loc[test_idx, 'Severity']
train_features = df.loc[train_idx, feature_columns].values
test_features = df.loc[test_idx, feature_columns].values

# Normalize numeric features
scaler = StandardScaler()
train_features_scaled = scaler.fit_transform(train_features)
test_features_scaled = scaler.transform(test_features)

# Load BERT
tokenizer = BertTokenizer.from_pretrained("bert-base-uncased")
bert_model = BertModel.from_pretrained("bert-base-uncased")

# Function to extract BERT embeddings in batches
def extract_bert_embeddings(texts, batch_size=16):
    embeddings = []
    for i in range(0, len(texts), batch_size):
        batch_texts = list(texts[i:i+batch_size])
        inputs = tokenizer(batch_texts, return_tensors="pt", truncation=True, padding=True, max_length=256)
        with torch.no_grad():
            outputs = bert_model(**inputs)
        batch_embeddings = outputs.last_hidden_state.mean(dim=1).numpy()
        embeddings.append(batch_embeddings)
    return np.vstack(embeddings)

# Extract embeddings for each transcript type
ct_emb_train = extract_bert_embeddings(df.loc[train_idx, 'Transcript_CTD'])
pf_emb_train = extract_bert_embeddings(df.loc[train_idx, 'Transcript_PFT'])
sf_emb_train = extract_bert_embeddings(df.loc[train_idx, 'Transcript_SFT'])

ct_emb_test = extract_bert_embeddings(df.loc[test_idx, 'Transcript_CTD'])
pf_emb_test = extract_bert_embeddings(df.loc[test_idx, 'Transcript_PFT'])
sf_emb_test = extract_bert_embeddings(df.loc[test_idx, 'Transcript_SFT'])

# Scale BERT embeddings
scaler_bert = StandardScaler()
ct_emb_train_scaled = scaler_bert.fit_transform(ct_emb_train)
pf_emb_train_scaled = scaler_bert.fit_transform(pf_emb_train)
sf_emb_train_scaled = scaler_bert.fit_transform(sf_emb_train)

ct_emb_test_scaled = scaler_bert.transform(ct_emb_test)
pf_emb_test_scaled = scaler_bert.transform(pf_emb_test)
sf_emb_test_scaled = scaler_bert.transform(sf_emb_test)

# Combine scaled embeddings and features before applying SMOTE
train_combined = np.hstack((ct_emb_train_scaled, pf_emb_train_scaled, sf_emb_train_scaled, train_features_scaled))
test_combined = np.hstack((ct_emb_test_scaled, pf_emb_test_scaled, sf_emb_test_scaled, test_features_scaled))

# Apply SMOTE to the combined training data
smote = SMOTE(random_state=42)
train_combined_resampled, train_labels_resampled = smote.fit_resample(train_combined, train_labels)

# Define a function for hyperparameter tuning
def tune_hyperparameters(X_train, y_train):
    model = xgb.XGBClassifier(
        random_state=42, 
        eval_metric="mlogloss",
        scale_pos_weight=1  # Adjust if needed for imbalance
    )
    param_distributions = {
        "n_estimators": randint(50, 600),
        "learning_rate": uniform(0.01, 0.3),
        "max_depth": randint(3, 15),
        "min_child_weight": randint(1, 10),
        "gamma": uniform(0, 2),
        "subsample": uniform(0.5, 1.0),
        "colsample_bytree": uniform(0.5, 1.0),
        "reg_alpha": uniform(0, 5),
        "reg_lambda": uniform(0, 5),
    }
    search = RandomizedSearchCV(
        model,
        param_distributions=param_distributions,
        n_iter=100,
        scoring="accuracy",
        cv=5,
        verbose=1,
        random_state=42,
        n_jobs=-1,
    )
    print("Starting hyperparameter tuning with RandomizedSearchCV...")
    search.fit(X_train, y_train)
    print("Best parameters found from RandomizedSearchCV:", search.best_params_)
    return search.best_estimator_

# Perform hyperparameter tuning
best_model = tune_hyperparameters(train_combined_resampled, train_labels_resampled)

# Evaluate the model
def evaluate_model(model, X_test, y_test):
    predictions = model.predict(X_test)
    print("\nEvaluation Results:")
    print(f"Accuracy: {accuracy_score(y_test, predictions):.2f}")
    print(f"Precision: {precision_score(y_test, predictions, average='weighted'):.2f}")
    print(f"Recall: {recall_score(y_test, predictions, average='weighted'):.2f}")
    print(f"F1-Score: {f1_score(y_test, predictions, average='weighted'):.2f}")
    print("\nClassification Report:")
    print(classification_report(y_test, predictions))
    print("\nConfusion Matrix:")
    print(confusion_matrix(y_test, predictions))
    
    # Plot feature importance
    plt.figure(figsize=(10, 8))
    plot_importance(model, max_num_features=20, importance_type="weight", title="Feature Importance")
    plt.show()

# Evaluate the tuned model
evaluate_model(best_model, test_combined, test_labels)