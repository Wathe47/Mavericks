# Import two trained models: clinical_model and speech_model
import numpy as np
import pandas as pd
import joblib
from sentence_transformers import SentenceTransformer
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import VotingClassifier
from transformers import BertTokenizer, BertModel
import spacy
from collections import Counter
import re
from sklearn.preprocessing import OneHotEncoder, StandardScaler
import torch
from scipy.stats import entropy
from dotenv import load_dotenv

load_dotenv()
import os

# Import XAI explainer
from .xai_explainer import DementiaXAIExplainer

# Load spaCy model
nlp = spacy.load("en_core_web_sm")


# Load the trained models
clinical_model = joblib.load("./Dementia_Models/Dataset1/best_model_clinical.joblib")
speech_model = joblib.load("./Dementia_Models/Dataset2/best_model_speech.joblib")
meta_classifier = joblib.load(
    "./Dementia_Models/MetaClassifier/full_meta_classifier.joblib"
)
preprocessor = joblib.load("./Dementia_Models/Dataset1/preprocessor.joblib")
scaler = joblib.load("./Dementia_Models/Dataset2/speech_scaler.joblib")

# Initialize XAI explainer
xai_explainer = DementiaXAIExplainer(clinical_model, speech_model, meta_classifier)


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


# Clean text
def clean_text(text):
    text = str(text).lower()
    text = re.sub(r"\s+", " ", text)
    return text.strip()


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


def predict_from_input(manual_input, transcript_ctd, transcript_pft, transcript_sft):

    manual_df = pd.DataFrame([manual_input])
    manual_df_processed = preprocessor.transform(manual_df)
    clinical_pred = clinical_model.predict(manual_df_processed)[0]
    clinical_proba = clinical_model.predict_proba(manual_df_processed)[0]

    df = pd.DataFrame(
        {
            "combined_text": [transcript_ctd],
            "Transcript_CTD": [transcript_ctd],
            "Transcript_PFT": [transcript_pft],
            "Transcript_SFT": [transcript_sft],
        }
    )

    # Apply features to full dataset
    df["TTR"] = df["combined_text"].apply(calculate_ttr)
    df["Brunet_Index"] = df["combined_text"].apply(calculate_brunet)
    df["Avg_Word_Length"] = df["combined_text"].apply(calculate_avg_word_length)

    pos_ratios = df["combined_text"].apply(calculate_pos_ratios)
    df["NOUN_ratio"] = pos_ratios.apply(lambda x: x["NOUN_ratio"])
    df["VERB_ratio"] = pos_ratios.apply(lambda x: x["VERB_ratio"])
    df["PRONOUN_ratio"] = pos_ratios.apply(lambda x: x["PRONOUN_ratio"])

    complexity = df["combined_text"].apply(calculate_sentence_complexity)
    df["Subordinate_Clauses"] = complexity.apply(
        lambda x: x["subordinate_clauses"] if x else 0
    )
    df["Parse_Tree_Depth"] = complexity.apply(
        lambda x: x["parse_tree_depth"] if x else 0
    )

    df["Idea_Density"] = df["combined_text"].apply(calculate_idea_density)

    key_elements = [
        "boy stealing cookies",
        "sink overflowing",
        "mother",
        "kitchen",
        "cookies",
    ]
    irrelevant_details = ["dog", "cat", "car", "tree"]

    df["Key_Elements_Described"] = df["combined_text"].apply(
        lambda x: count_key_elements(x, key_elements)
    )
    df["Irrelevant_Details"] = df["combined_text"].apply(
        lambda x: count_irrelevant_details(x, irrelevant_details)
    )
    df["Pauses"] = df["combined_text"].apply(count_pauses)
    df["Repair_Rate"] = df["combined_text"].apply(calculate_repair_rate)

    df.drop(columns=["combined_text"], inplace=True)

    df["Transcript_CTD"] = df["Transcript_CTD"].fillna("").apply(clean_text)
    df["Transcript_PFT"] = df["Transcript_PFT"].fillna("").apply(clean_text)
    df["Transcript_SFT"] = df["Transcript_SFT"].fillna("").apply(clean_text)
    df["Text"] = (
        df["Transcript_CTD"] + " " + df["Transcript_PFT"] + " " + df["Transcript_SFT"]
    )

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
    test_features = df.loc[df.index, feature_columns].values
    test_features_scaled = scaler.transform(test_features)

    ct_emb_test = extract_bert_embeddings(df.loc[df.index, "Transcript_CTD"])
    pf_emb_test = extract_bert_embeddings(df.loc[df.index, "Transcript_PFT"])
    sf_emb_test = extract_bert_embeddings(df.loc[df.index, "Transcript_SFT"])
    test_combined = np.hstack(
        (ct_emb_test, pf_emb_test, sf_emb_test, test_features_scaled)
    )

    speech_pred = speech_model.predict(test_combined)[0]
    speech_proba = speech_model.predict_proba(test_combined)[0]

    combined_probs = np.hstack((clinical_proba, speech_proba))
    clinical_max_prob = np.max(clinical_proba)
    speech_max_prob = np.max(speech_proba)
    confidence_diff = np.abs(clinical_max_prob - speech_max_prob)
    confidence_ratio = clinical_max_prob / (speech_max_prob + 1e-10)
    clinical_pred_idx = np.argmax(clinical_proba)
    speech_pred_idx = np.argmax(speech_proba)
    agreement = int(clinical_pred_idx == speech_pred_idx)

    clinical_entropy = entropy(clinical_proba + 1e-10)
    speech_entropy = entropy(speech_proba + 1e-10)
    clinical_weight = 0.5 + clinical_max_prob
    speech_weight = 0.5 + speech_max_prob

    meta_features = np.hstack(
        [
            combined_probs,
            [
                clinical_max_prob,
                speech_max_prob,
                confidence_diff,
                confidence_ratio,
                clinical_entropy,
                speech_entropy,
                agreement,
                clinical_weight,
                speech_weight,
            ],
        ]
    )

    result = meta_classifier.predict(meta_features.reshape(1, -1))
    proba = meta_classifier.predict_proba(meta_features.reshape(1, -1))

    # Generate XAI explanations
    try:
        xai_explanations = xai_explainer.generate_comprehensive_explanation(
            clinical_data=(
                manual_df_processed[0] if len(manual_df_processed) > 0 else np.array([])
            ),
            speech_features=(
                test_combined[0] if len(test_combined) > 0 else np.array([])
            ),
            meta_features=meta_features,
            clinical_pred=clinical_pred,
            clinical_conf=clinical_proba[clinical_pred],
            speech_pred=speech_pred,
            speech_conf=speech_proba[speech_pred],
            meta_pred=result[0],
            meta_conf=proba[0][result[0]],
        )
    except Exception as e:
        print(f"XAI explanation generation failed: {e}")
        xai_explanations = {"error": "XAI explanations unavailable", "message": str(e)}

    return {
        "clinical_pred": int(clinical_pred),
        "clinical_proba": float(clinical_proba[clinical_pred]),
        "speech_pred": int(speech_pred),
        "speech_proba": float(speech_proba[speech_pred]),
        "meta_pred": int(result[0]),
        "meta_proba": float(proba[0][result[0]]),
        "xai_explanations": xai_explanations,
    }
