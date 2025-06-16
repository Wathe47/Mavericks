import pandas as pd
from xgboost import XGBClassifier
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    classification_report,
    confusion_matrix,
)
from sklearn.model_selection import RandomizedSearchCV, GridSearchCV
from imblearn.pipeline import Pipeline
from scipy.stats import randint, uniform
from imblearn.over_sampling import SMOTE
import numpy as np

# Load datasets
train_dataset = pd.read_csv("train_dataset.csv")
test_dataset = pd.read_csv("test_dataset.csv")

# Split datasets into features and target
X_train = train_dataset.drop("Severity", axis=1)
y_train = train_dataset["Severity"]

X_test = test_dataset.drop("Severity", axis=1)
y_test = test_dataset["Severity"]


# Perform hyperparameter tuning using RandomizedSearchCV with class_weight='balanced'
def tune_hyperparameters(X_train, y_train):
    model = XGBClassifier(
        use_label_encoder=False,
        eval_metric="mlogloss",
        random_state=42,
    )
    resampler = SMOTE(random_state=42)  
    pipeline = Pipeline(
        [
            ("resampler", resampler),
            ("classifier", model),
      ]
    )

    search = RandomizedSearchCV(
        pipeline,
        param_distributions={
            "classifier__n_estimators": randint(
                50, 600
            ), 
            "classifier__learning_rate": uniform(
                0.005, 0.3
            ),  
            "classifier__max_depth": randint(2, 20),  
            "classifier__min_child_weight": randint(
                1, 15
            ),  
            "classifier__gamma": uniform(0, 2), 
            "classifier__subsample": uniform(0.4, 0.6), 
            "classifier__colsample_bytree": uniform(
                0.4, 0.6
            ),  
            "classifier__reg_alpha": uniform(0, 5),  
            "classifier__reg_lambda": uniform(0, 5),  
            "classifier__tree_method": ["hist"],
        },
        n_iter=150,  
        scoring="accuracy",
        cv=5,
        verbose=1,
        random_state=42,
        n_jobs=-1,
    )
    print("Starting hyperparameter tuning with RandomizedSearchCV...")
    search.fit(X_train, y_train)
    print("Best parameters found from RandomizedSearchCV:", search.best_params_)
    return search.best_estimator_, search.best_params_

# Tune hyperparameters with RandomizedSearchCV
best_model, best_params = tune_hyperparameters(X_train, y_train)


# Define a refined grid based on the best parameters from RandomizedSearchCV
refined_param_grid = {
    "classifier__n_estimators": [
        max(50, best_params["classifier__n_estimators"] - 50),
        best_params["classifier__n_estimators"],
        best_params["classifier__n_estimators"] + 50,
    ],
    "classifier__learning_rate": [
        max(0.01, best_params["classifier__learning_rate"] * 0.8),
        best_params["classifier__learning_rate"],
        best_params["classifier__learning_rate"] * 1.2,
    ],
    "classifier__max_depth": [
        max(3, best_params["classifier__max_depth"] - 2),
        best_params["classifier__max_depth"],
        best_params["classifier__max_depth"] + 2,
    ],
}

# Perform fine-tuning using GridSearchCV with class_weight='balanced'
def fine_tune_hyperparameters(X_train, y_train, best_model):
    search = GridSearchCV(
        best_model,
        param_grid=refined_param_grid,
        scoring="accuracy",
        cv=5,
        verbose=1,
        n_jobs=-1,
    )
    print("Starting fine-tuning with GridSearchCV...")
    search.fit(X_train, y_train)
    print("Best parameters after fine-tuning:", search.best_params_)
    return search.best_estimator_


# Fine-tune the best model with GridSearchCV
best_model = fine_tune_hyperparameters(X_train, y_train, best_model)

# Evaluate the best model on the test set
def evaluate_model(model, X_test, y_test):
    predictions = model.predict(X_test)
    pred_probabilities = model.predict_proba(X_test)

    print("\nEvaluation Results:")
    print(f"Accuracy: {accuracy_score(y_test, predictions):.2f}%")
    print(f"Precision: {precision_score(y_test, predictions, average='weighted'):.2f}%")
    print(f"Recall: {recall_score(y_test, predictions, average='weighted'):.2f}%")
    print(f"F1-Score: {f1_score(y_test, predictions, average='weighted'):.2f}%")
    print("\nClassification Report:")
    print(classification_report(y_test, predictions))
    print("\nConfusion Matrix:")
    print(confusion_matrix(y_test, predictions))

       # Probability analysis
    print("\nProbability Distribution Analysis:")
    
    # Calculate average prediction probability for correct predictions
    correct_indices = np.array(predictions) == np.array(y_test)
    if np.any(correct_indices):
        correct_probs = [prob[true] for prob, true in zip(pred_probabilities, y_test.iloc[correct_indices] 
                                                        if hasattr(y_test, 'iloc') else y_test[correct_indices])]
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
    
    # Save probability data to CSV for further analysis
    results_df = pd.DataFrame(pred_probabilities, columns=[f'prob_class_{i}' for i in range(pred_probabilities.shape[1])])
    results_df['true_class'] = y_test.values if hasattr(y_test, 'values') else y_test
    results_df['predicted_class'] = predictions
    results_df['correct'] = correct_indices
    results_df['max_probability'] = [np.max(prob) for prob in pred_probabilities]
    results_df.to_csv('prediction_probabilities.csv', index=False)
    print("Detailed probability data saved to 'prediction_probabilities.csv'")
    

evaluate_model(best_model, X_test, y_test)