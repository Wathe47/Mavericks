import pandas as pd
from sklearn.ensemble import GradientBoostingClassifier, RandomForestClassifier
from xgboost import XGBClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.svm import SVC
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    classification_report,
    confusion_matrix,
)
from sklearn.model_selection import RandomizedSearchCV, GridSearchCV
from imblearn.pipeline import Pipeline
from imblearn.over_sampling import SMOTE
from imblearn.under_sampling import RandomUnderSampler
from imblearn.combine import SMOTEENN
from scipy.stats import randint, uniform

# Load datasets
train_dataset = pd.read_csv("train_dataset.csv")
test_dataset = pd.read_csv("test_dataset.csv")

# Split datasets into features and target
X_train = train_dataset.drop("Severity", axis=1)
y_train = train_dataset["Severity"]

X_test = test_dataset.drop("Severity", axis=1)
y_test = test_dataset["Severity"]


# Function to dynamically select resampling method
def get_resampler(method="undersample"):
    if method == "smote":
        return SMOTE(random_state=42)
    elif method == "undersample":
        return RandomUnderSampler(random_state=42)
    elif method == "combine":
        return SMOTEENN(random_state=42)
    else:
        raise ValueError(
            "Invalid resampling method. Choose 'smote', 'undersample', or 'combine'."
        )


# Function to evaluate models
def evaluate_model(model, X_train, y_train, X_test, y_test):
    model.fit(X_train, y_train)
    predictions = model.predict(X_test)
    results = {
        "accuracy": accuracy_score(y_test, predictions) * 100,
        "precision": precision_score(y_test, predictions, average="weighted") * 100,
        "recall": recall_score(y_test, predictions, average="weighted") * 100,
        "f1": f1_score(y_test, predictions, average="weighted") * 100,
        "roc_auc": (
            roc_auc_score(y_test, model.predict_proba(X_test), multi_class="ovr") * 100
            if hasattr(model, "predict_proba")
            else None
        ),
        "classification_report": classification_report(y_test, predictions),
        "confusion_matrix": confusion_matrix(y_test, predictions),
    }
    return results


# Instantiate models
models = {
    "Decision Tree": DecisionTreeClassifier(),
    "Random Forest": RandomForestClassifier(),
    "K-Nearest Neighbors": KNeighborsClassifier(),
    "Support Vector Machine": SVC(probability=True),  # Enable probability for ROC AUC
    "Gradient Boosting Classifier": GradientBoostingClassifier(),
    "XGBClassifier": XGBClassifier(eval_metric="mlogloss", random_state=42),
}

# Evaluate models
for name, model in models.items():
    print(f"Evaluating {name}...")
    results = evaluate_model(model, X_train, y_train, X_test, y_test)

    # Print evaluation metrics
    print(f"\n{name} Results:")
    print(f"Accuracy: {results['accuracy']:.2f}%")
    print(f"Precision: {results['precision']:.2f}%")
    print(f"Recall: {results['recall']:.2f}%")
    print(f"F1-Score: {results['f1']:.2f}%")
    if results["roc_auc"] is not None:
        print(f"ROC AUC: {results['roc_auc']:.2f}%")
    print("\nClassification Report:")
    print(results["classification_report"])
    print("\nConfusion Matrix:")
    print(results["confusion_matrix"])
    print("\n" + "-" * 50)


# Hyperparameter tuning for XGBClassifier with resampling
def tune_hyperparameters(X_train, y_train, resampling_method="undersample"):
    resampler = get_resampler(resampling_method)
    model = XGBClassifier(eval_metric="mlogloss", random_state=42)

    pipeline = Pipeline(
        [
            ("resampler", resampler),  # Dynamically apply resampling
            ("classifier", model),
        ]
    )

    search = RandomizedSearchCV(
        pipeline,
        param_distributions={
            "classifier__n_estimators": randint(50, 600),
            "classifier__learning_rate": uniform(0.005, 0.3),
            "classifier__max_depth": randint(2, 20),
            "classifier__min_child_weight": randint(1, 15),
            "classifier__gamma": uniform(0, 2),
            "classifier__subsample": uniform(0.4, 0.6),
            "classifier__colsample_bytree": uniform(0.4, 0.6),
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
    return search.best_estimator_


# Tune and evaluate the best model
best_model = tune_hyperparameters(X_train, y_train, resampling_method="undersample")
results = evaluate_model(best_model, X_train, y_train, X_test, y_test)

# Print evaluation metrics for the tuned model
print("\nTuned XGBClassifier Results:")
print(f"Accuracy: {results['accuracy']:.2f}%")
print(f"Precision: {results['precision']:.2f}%")
print(f"Recall: {results['recall']:.2f}%")
print(f"F1-Score: {results['f1']:.2f}%")
if results["roc_auc"] is not None:
    print(f"ROC AUC: {results['roc_auc']:.2f}%")
print("\nClassification Report:")
print(results["classification_report"])
print("\nConfusion Matrix:")
print(results["confusion_matrix"])
