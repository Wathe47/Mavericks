from sentence_transformers import SentenceTransformer
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.decomposition import LatentDirichletAllocation
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from textblob import TextBlob
from tqdm import tqdm
import ast
import pandas as pd
import numpy as np
import spacy
import re
from collections import Counter

tqdm.pandas()  # For progress bars

# Load dataset
df = pd.read_csv("dementia_dataset_4.csv")
df["combined_text"] = df["Transcript_CTD"].fillna("").astype(str)

# Load spaCy model
nlp = spacy.load("en_core_web_sm")

# Print the counts of Class_label before clustering
class_label_counts = df['Class_label'].value_counts()
print("Counts of Class_label before clustering:")
print(class_label_counts)

# Feature functions

def calculate_ttr(text):
    words = text.split()
    return len(set(words)) / len(words) if words else 0

def calculate_brunet(text):
    words = text.split()
    return len(words) ** (len(set(words)) ** -0.165) if words else 0

def calculate_avg_word_length(text):
    words = text.split()
    return np.mean([len(word) for word in words]) if words else 0

def calculate_pos_ratios(text):
    doc = nlp(text)
    total = len(doc)
    counts = Counter([t.pos_ for t in doc])
    return {
        "NOUN_ratio": counts.get("NOUN", 0) / total if total else 0,
        "VERB_ratio": counts.get("VERB", 0) / total if total else 0,
        "PRONOUN_ratio": counts.get("PRON", 0) / total if total else 0,
    }

def get_parse_depth(sent):
    depths = {token.i: 0 for token in sent}
    for token in sent:
        if token.head != token:
            depths[token.i] = depths[token.head.i] + 1
    return max(depths.values()) if depths else 0

def calculate_sentence_complexity(text):
    doc = nlp(text)
    sentences = list(doc.sents)
    if not sentences:
        return {"subordinate_clauses": 0, "parse_tree_depth": 0}
    clauses = sum(1 for t in doc if t.dep_ == "mark")
    depth = max(get_parse_depth(s) for s in sentences)
    return {"subordinate_clauses": clauses / len(sentences), "parse_tree_depth": depth}

def calculate_idea_density(text):
    words = text.split()
    return (len(set(words)) / len(words)) * 100 if words else 0

def count_key_elements(text, elements):
    text = text.lower()
    return sum(1 for e in elements if e in text)

def count_irrelevant_details(text, details):
    text = text.lower()
    return sum(1 for d in details if d in text)

def count_pauses(text):
    return len(re.findall(r"\b(uh|um)\b", text.lower()))

def calculate_repair_rate(text):
    doc = nlp(text)
    repairs = sum(1 for token in doc if token.dep_ == "reparandum")
    return repairs / len(list(doc.sents)) if doc else 0

# Apply features to full dataset
df["TTR"] = df["combined_text"].apply(calculate_ttr)
df["Brunet_Index"] = df["combined_text"].apply(calculate_brunet)
df["Avg_Word_Length"] = df["combined_text"].apply(calculate_avg_word_length)

pos_ratios = df["combined_text"].apply(calculate_pos_ratios)
df["NOUN_ratio"] = pos_ratios.apply(lambda x: x["NOUN_ratio"])
df["VERB_ratio"] = pos_ratios.apply(lambda x: x["VERB_ratio"])
df["PRONOUN_ratio"] = pos_ratios.apply(lambda x: x["PRONOUN_ratio"])

complexity = df["combined_text"].apply(calculate_sentence_complexity)
df["Subordinate_Clauses"] = complexity.apply(lambda x: x["subordinate_clauses"] if x else 0)
df["Parse_Tree_Depth"] = complexity.apply(lambda x: x["parse_tree_depth"] if x else 0)

df["Idea_Density"] = df["combined_text"].apply(calculate_idea_density)

key_elements = ["boy stealing cookies", "sink overflowing", "mother", "kitchen", "cookies"]
irrelevant_details = ["dog", "cat", "car", "tree"]

df["Key_Elements_Described"] = df["combined_text"].apply(lambda x: count_key_elements(x, key_elements))
df["Irrelevant_Details"] = df["combined_text"].apply(lambda x: count_irrelevant_details(x, irrelevant_details))
df["Pauses"] = df["combined_text"].apply(count_pauses)
df["Repair_Rate"] = df["combined_text"].apply(calculate_repair_rate)

vectorizer = CountVectorizer(stop_words='english', max_features=1000)
X_text = vectorizer.fit_transform(df["combined_text"])

lda_model = LatentDirichletAllocation(n_components=5, random_state=42)
lda_topics = lda_model.fit_transform(X_text)

for i in range(lda_topics.shape[1]):
    df[f"Topic_{i+1}"] = lda_topics[:, i]

def named_entity_count(text):
    doc = nlp(text)
    return len([ent for ent in doc.ents])

df["Named_Entity_Count"] = df["combined_text"].apply(named_entity_count)


df["Polarity"] = df["combined_text"].apply(lambda x: TextBlob(x).sentiment.polarity)
df["Subjectivity"] = df["combined_text"].apply(lambda x: TextBlob(x).sentiment.subjectivity)

# Save processed dataset
df.to_csv("dementia_dataset_5.csv", index=False)
print("Feature extraction done and saved as 'dementia_dataset_5.csv'!")

