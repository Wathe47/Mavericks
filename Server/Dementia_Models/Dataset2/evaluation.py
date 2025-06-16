import pandas as pd
import torch
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
from transformers import BertTokenizer, BertForSequenceClassification, Trainer, TrainingArguments
from transformers import DataCollatorWithPadding
from datasets import Dataset
import re
import numpy as np

# Load the dataset
df = pd.read_csv("dementia_dataset_6.csv")
import pandas as pd
import torch
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
from transformers import BertTokenizer, BertForSequenceClassification, Trainer, TrainingArguments
from transformers import DataCollatorWithPadding
from datasets import Dataset
import re
import numpy as np

# Load the dataset
df = pd.read_csv("dementia_dataset_6.csv")

# Ensure Severity is treated as a categorical label
df['Severity'] = df['Severity'].astype(int)

# Enhanced text cleaning function
def clean_text(text):
    text = str(text).lower()
    text = re.sub(r"\s+", " ", text)  # Preserve punctuation
    return text.strip()
 
# Apply cleaning to text column
df["Transcript_CTD"] = df["Transcript_CTD"].fillna("").apply(clean_text)
df["Transcript_PFT"] = df["Transcript_PFT"].fillna("").apply(clean_text)
df["Transcript_SFT"] = df["Transcript_SFT"].fillna("").apply(clean_text)

# Combine the transcripts into a single text column
df['Text'] = df['Transcript_CTD'] + " " + df['Transcript_PFT'] + " " + df['Transcript_SFT']

# Split the dataset into train and test sets
train_texts, test_texts, train_labels, test_labels = train_test_split(
    df['Text'], df['Severity'], test_size=0.2, random_state=42
)

# Load the BERT tokenizer
tokenizer = BertTokenizer.from_pretrained("bert-base-uncased")

# Tokenize the text data
train_encodings = tokenizer(list(train_texts), truncation=True, padding=True, max_length=256)
test_encodings = tokenizer(list(test_texts), truncation=True, padding=True, max_length=256)

# Convert the data into PyTorch datasets
class DementiaDataset(torch.utils.data.Dataset):
    def __init__(self, encodings, labels):
        self.encodings = encodings
        self.labels = labels

    def __len__(self):
        return len(self.labels)

    def __getitem__(self, idx):
        item = {key: torch.tensor(val[idx]) for key, val in self.encodings.items()}
        item['labels'] = torch.tensor(self.labels[idx])
        return item

train_dataset = DementiaDataset(train_encodings, list(train_labels))
test_dataset = DementiaDataset(test_encodings, list(test_labels))

# Load the BERT model for multi-class classification
model = BertForSequenceClassification.from_pretrained("bert-base-uncased", num_labels=4)  # 4 classes: 0, 1, 2, 3

# Define training arguments
# Updated training arguments to optimize for the entire dataset
training_args = TrainingArguments(
    num_train_epochs=4,  # Minimum for meaningful learning
    warmup_ratio=0.1,  # 10% of total steps instead of fixed 200
    per_device_train_batch_size=8,  # Increase if GPU memory allows
    gradient_accumulation_steps=2,
    learning_rate=2e-5,
)

# Define a data collator for padding
data_collator = DataCollatorWithPadding(tokenizer=tokenizer)

# Define the evaluation metric
def compute_metrics(eval_pred):
    logits, labels = eval_pred
    predictions = torch.argmax(torch.tensor(logits), dim=-1)
    accuracy = accuracy_score(labels, predictions)
    report = classification_report(labels, predictions, output_dict=True)
    return {"accuracy": accuracy, "classification_report": report}

# Initialize the Trainer
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=train_dataset,
    eval_dataset=test_dataset,
    tokenizer=tokenizer,
    data_collator=data_collator,
    compute_metrics=compute_metrics
)

# Print the number of entries per cluster
Severity_counts = train_dataset['Severity'].value_counts()
print("Number of entries per cluster in training:")
print(Severity_counts)

# Print the number of entries per cluster
Severity_counts = test_dataset['Severity'].value_counts()
print("Number of entries per cluster in testing:")
print(Severity_counts)

# Train the model
trainer.train()

# Evaluate the model
results = trainer.evaluate()
print("Evaluation Results:")
print(results["classification_report"])
print("\nConfusion Matrix:")
print(results["confusion_matrix"])
print("\nCross-Validation Scores:")
print(results["cross_validation_scores"])

# Ensure Severity is treated as a categorical label
df['Severity'] = df['Severity'].astype(int)

# Enhanced text cleaning function
def clean_text(text):
    text = str(text).lower()
    text = re.sub(r"\s+", " ", text)  # Preserve punctuation
    return text.strip()
 
# Apply cleaning to text column
df["Transcript_CTD"] = df["Transcript_CTD"].fillna("").apply(clean_text)
df["Transcript_PFT"] = df["Transcript_PFT"].fillna("").apply(clean_text)
df["Transcript_SFT"] = df["Transcript_SFT"].fillna("").apply(clean_text)

# Combine the transcripts into a single text column
df['Text'] = df['Transcript_CTD'] + " " + df['Transcript_PFT'] + " " + df['Transcript_SFT']

# Split the dataset into train and test sets
train_texts, test_texts, train_labels, test_labels = train_test_split(
    df['Text'], df['Severity'], test_size=0.2, random_state=42
)

# Load the BERT tokenizer
tokenizer = BertTokenizer.from_pretrained("bert-base-uncased")

# Tokenize the text data
train_encodings = tokenizer(list(train_texts), truncation=True, padding=True, max_length=256)
test_encodings = tokenizer(list(test_texts), truncation=True, padding=True, max_length=256)

# Convert the data into PyTorch datasets
class DementiaDataset(torch.utils.data.Dataset):
    def __init__(self, encodings, labels):
        self.encodings = encodings
        self.labels = labels

    def __len__(self):
        return len(self.labels)

    def __getitem__(self, idx):
        item = {key: torch.tensor(val[idx]) for key, val in self.encodings.items()}
        item['labels'] = torch.tensor(self.labels[idx])
        return item

train_dataset = DementiaDataset(train_encodings, list(train_labels))
test_dataset = DementiaDataset(test_encodings, list(test_labels))

# Load the BERT model for multi-class classification
model = BertForSequenceClassification.from_pretrained("bert-base-uncased", num_labels=4)  # 4 classes: 0, 1, 2, 3

# Define training arguments
# Updated training arguments to optimize for the entire dataset
training_args = TrainingArguments(
    num_train_epochs=4,  # Minimum for meaningful learning
    warmup_ratio=0.1,  # 10% of total steps instead of fixed 200
    per_device_train_batch_size=8,  # Increase if GPU memory allows
    gradient_accumulation_steps=2,
    learning_rate=2e-5,
)

# Define a data collator for padding
data_collator = DataCollatorWithPadding(tokenizer=tokenizer)

# Define the evaluation metric
def compute_metrics(eval_pred):
    logits, labels = eval_pred
    predictions = torch.argmax(torch.tensor(logits), dim=-1)
    accuracy = accuracy_score(labels, predictions)
    report = classification_report(labels, predictions, output_dict=True)
    return {"accuracy": accuracy, "classification_report": report}

# Initialize the Trainer
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=train_dataset,
    eval_dataset=test_dataset,
    tokenizer=tokenizer,
    data_collator=data_collator,
    compute_metrics=compute_metrics
)

# Print the number of entries per cluster
Severity_counts = train_dataset['Severity'].value_counts()
print("Number of entries per cluster in training:")
print(Severity_counts)

# Print the number of entries per cluster
Severity_counts = test_dataset['Severity'].value_counts()
print("Number of entries per cluster in testing:")
print(Severity_counts)

# Train the model
trainer.train()

# Evaluate the model
results = trainer.evaluate()
print("Evaluation Results:")
print(results["classification_report"])
print("\nConfusion Matrix:")
print(results["confusion_matrix"])
print("\nCross-Validation Scores:")
print(results["cross_validation_scores"])
