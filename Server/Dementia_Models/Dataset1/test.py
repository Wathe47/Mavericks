import pandas as pd
from xgboost import XGBClassifier
from sklearn.metrics import classification_report, accuracy_score

# Load datasets
train_df = pd.read_csv('train_dataset.csv')
test_df = pd.read_csv('test_dataset.csv')

# Split features and target
X_train = train_df.drop('Severity', axis=1)
y_train = train_df['Severity']
X_test = test_df.drop('Severity', axis=1)
y_test = test_df['Severity']

# Train XGBoost model
model = XGBClassifier(use_label_encoder=False, eval_metric='mlogloss')
model.fit(X_train, y_train)

# Predict
y_pred = model.predict(X_test)

# Evaluation
print("Accuracy:", accuracy_score(y_test, y_pred))
print("Classification Report:\n", classification_report(y_test, y_pred))