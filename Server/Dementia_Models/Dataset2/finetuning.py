import pandas as pd
import torch
import numpy as np
import re
import matplotlib.pyplot as plt
import xgboost as xgb
from sklearn.model_selection import train_test_split, RandomizedSearchCV
from sklearn.metrics import (
    classification_report,
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
)
from transformers import BertTokenizer, BertModel
from sklearn.preprocessing import StandardScaler
from scipy.stats import randint, uniform
from imblearn.over_sampling import SMOTE

# Load dataset
df = pd.read_csv("dementia_dataset_6.csv")
df["Severity"] = df["Severity"].astype(int)


# Clean text
def clean_text(text):
    text = str(text).lower()
    text = re.sub(r"\s+", " ", text)
    return text.strip()


df["Transcript_CTD"] = df["Transcript_CTD"].fillna("").apply(clean_text)
df["Transcript_PFT"] = df["Transcript_PFT"].fillna("").apply(clean_text)
df["Transcript_SFT"] = df["Transcript_SFT"].fillna("").apply(clean_text)

# Define all feature columns to include
feature_columns = [
    "TTR",
    "Brunet_Index",
    "Avg_Word_Length",
    "NOUN_ratio",
    "VERB_ratio",
    "PRONOUN_ratio",
    "Subordinate_Clauses",
    "Parse_Tree_Depth",
    "Idea_Density",
    "Key_Elements_Described",
    "Irrelevant_Details",
    "Pauses",
    "Repair_Rate",
]

# Split dataset
train_idx, test_idx = train_test_split(df.index, test_size=0.2, random_state=42)
train_labels = df.loc[train_idx, "Severity"]
test_labels = df.loc[test_idx, "Severity"]
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
        batch_texts = list(texts[i : i + batch_size])
        inputs = tokenizer(
            batch_texts,
            return_tensors="pt",
            truncation=True,
            padding=True,
            max_length=256,
        )
        with torch.no_grad():
            outputs = bert_model(**inputs)
        batch_embeddings = outputs.last_hidden_state.mean(dim=1).numpy()
        embeddings.append(batch_embeddings)
    return np.vstack(embeddings)


# Extract embeddings for each transcript type
ct_emb_train = extract_bert_embeddings(df.loc[train_idx, "Transcript_CTD"])
pf_emb_train = extract_bert_embeddings(df.loc[train_idx, "Transcript_PFT"])
sf_emb_train = extract_bert_embeddings(df.loc[train_idx, "Transcript_SFT"])

ct_emb_test = extract_bert_embeddings(df.loc[test_idx, "Transcript_CTD"])
pf_emb_test = extract_bert_embeddings(df.loc[test_idx, "Transcript_PFT"])
sf_emb_test = extract_bert_embeddings(df.loc[test_idx, "Transcript_SFT"])

# Combine embeddings and features
train_combined = np.hstack(
    (ct_emb_train, pf_emb_train, sf_emb_train, train_features_scaled)
)
test_combined = np.hstack((ct_emb_test, pf_emb_test, sf_emb_test, test_features_scaled))


# Define a function for hyperparameter tuning
def tune_hyperparameters(X_train, y_train):
    model = xgb.XGBClassifier(
        random_state=42, use_label_encoder=False, eval_metric="mlogloss"
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
best_model = tune_hyperparameters(train_combined, train_labels)


# Evaluate the model
def evaluate_model(model, X_test, y_test):
    predictions = model.predict(X_test)
    pred_probabilities = model.predict_proba(X_test)

    print("\nEvaluation Results:")
    print(f"Accuracy: {accuracy_score(y_test, predictions):.2f}")
    print(f"Precision: {precision_score(y_test, predictions, average='weighted'):.2f}")
    print(f"Recall: {recall_score(y_test, predictions, average='weighted'):.2f}")
    print(f"F1-Score: {f1_score(y_test, predictions, average='weighted'):.2f}")
    print("\nClassification Report:")
    print(classification_report(y_test, predictions))
    print("\nConfusion Matrix:")
    print(confusion_matrix(y_test, predictions))
    
        # Probability analysis
    print("\nProbability Distribution Analysis:")
    
    # Calculate average prediction probability for correct predictions
    correct_indices = predictions == y_test
    if np.any(correct_indices):
        correct_probs = [prob[true] for prob, true in zip(pred_probabilities, y_test[correct_indices])]
        print(f"Average probability for correct predictions: {np.mean(correct_probs):.4f}")
    
    # Calculate average highest probability for incorrect predictions
    incorrect_indices = ~correct_indices
    if np.any(incorrect_indices):
        incorrect_max_probs = [np.max(prob) for prob in pred_probabilities[incorrect_indices]]
        print(f"Average highest probability for incorrect predictions: {np.mean(incorrect_max_probs):.4f}")
    
    # Find uncertain predictions (highest probability < threshold)
    threshold = 0.7
    uncertain_predictions = [i for i, probs in enumerate(pred_probabilities) 
                            if np.max(probs) < threshold]
    print(f"Number of uncertain predictions (max prob < {threshold}): {len(uncertain_predictions)}")
    
    return predictions, pred_probabilities



# Evaluate the tuned model
predictions, probabilities = evaluate_model(best_model, test_combined, test_labels)

# Optional: Save the probabilities for further analysis
results_df = pd.DataFrame(probabilities)
results_df['true_class'] = test_labels.values
results_df['predicted_class'] = predictions
results_df.to_csv('prediction_probabilities.csv', index=False)