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
    resampler = SMOTE(random_state=42)  # Example resampler, can be changed
    pipeline = Pipeline(
        [
            ("resampler", resampler),  # Resampling step
            ("classifier", model),  # No resampler, use class_weight instead
        ]
    )

    search = RandomizedSearchCV(
        pipeline,
        param_distributions={
            "classifier__n_estimators": randint(
                50, 600
            ),  # Widen range for n_estimators
            "classifier__learning_rate": uniform(
                0.005, 0.3
            ),  # Widen range for learning_rate
            "classifier__max_depth": randint(2, 20),  # Widen range for max_depth
            "classifier__min_child_weight": randint(
                1, 15
            ),  # Widen range for min_child_weight
            "classifier__gamma": uniform(0, 2),  # Widen range for gamma
            "classifier__subsample": uniform(0.4, 0.6),  # Widen range for subsample
            "classifier__colsample_bytree": uniform(
                0.4, 0.6
            ),  # Widen range for colsample_bytree
            "classifier__reg_alpha": uniform(0, 5),  # Widen range for reg_alpha
            "classifier__reg_lambda": uniform(0, 5),  # Widen range for reg_lambda
            "classifier__tree_method": ["hist"],
        },
        n_iter=150,  # Increase iterations for better exploration
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
    print("\nEvaluation Results:")
    print(f"Accuracy: {accuracy_score(y_test, predictions):.2f}%")
    print(f"Precision: {precision_score(y_test, predictions, average='weighted'):.2f}%")
    print(f"Recall: {recall_score(y_test, predictions, average='weighted'):.2f}%")
    print(f"F1-Score: {f1_score(y_test, predictions, average='weighted'):.2f}%")
    print("\nClassification Report:")
    print(classification_report(y_test, predictions))
    print("\nConfusion Matrix:")
    print(confusion_matrix(y_test, predictions))


evaluate_model(best_model, X_test, y_test)