# XAI Module for Dementia Prediction
import numpy as np
import pandas as pd
import shap
import warnings

warnings.filterwarnings("ignore")
from typing import Dict, List, Any, Optional


class DementiaXAIExplainer:
    """
    Explainable AI module for dementia prediction models.
    Provides SHAP explanations, feature importance, and clinical interpretations.
    """

    def __init__(self, clinical_model, speech_model, meta_classifier):
        self.clinical_model = clinical_model
        self.speech_model = speech_model
        self.meta_classifier = meta_classifier

        # Initialize SHAP explainers
        self._init_explainers()

        # Define feature names and clinical interpretations
        self._init_feature_mappings()

    def _init_explainers(self):
        """Initialize SHAP explainers for each model"""
        try:
            # Clinical model explainer (XGBoost)
            if hasattr(self.clinical_model, "named_steps"):
                clinical_xgb = self.clinical_model.named_steps["classifier"]
            else:
                clinical_xgb = self.clinical_model
            self.clinical_explainer = shap.TreeExplainer(clinical_xgb)

            # Meta-classifier explainer
            if hasattr(self.meta_classifier, "feature_importances_"):
                self.meta_explainer = shap.TreeExplainer(self.meta_classifier)
            else:
                self.meta_explainer = None

        except Exception as e:
            print(f"Warning: Could not initialize SHAP explainers: {e}")
            self.clinical_explainer = None
            self.meta_explainer = None

    def _init_feature_mappings(self):
        """Initialize feature names and clinical interpretations"""
        self.clinical_features = [
            "Age",
            "Gender",
            "BMI",
            "FamilyHistoryAlzheimers",
            "Hypertension",
            "CardiovascularDisease",
            "MMSE",
            "ADL",
            "FunctionalAssessment",
            "MemoryComplaints",
            "BehavioralProblems",
        ]

        self.speech_features = [
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

        self.meta_features = [
            "clinical_prob_class_0",
            "clinical_prob_class_1",
            "clinical_prob_class_2",
            "clinical_prob_class_3",
            "speech_prob_class_0",
            "speech_prob_class_1",
            "speech_prob_class_2",
            "speech_prob_class_3",
            "clinical_max_prob",
            "speech_max_prob",
            "confidence_diff",
            "confidence_ratio",
            "clinical_entropy",
            "speech_entropy",
            "agreement",
            "clinical_weight",
            "speech_weight",
        ]

        # Clinical interpretations for features
        self.clinical_interpretations = {
            "Age": "Patient age in years - Advanced age is a primary risk factor for dementia",
            "Gender": "Patient gender - Some types of dementia show gender-specific patterns",
            "BMI": "Body Mass Index - Both low and high BMI can be associated with dementia risk",
            "FamilyHistoryAlzheimers": "Family history of Alzheimer's disease - Strong genetic component",
            "Hypertension": "High blood pressure - Vascular risk factor for dementia",
            "CardiovascularDisease": "Heart disease - Affects brain blood flow and dementia risk",
            "MMSE": "Mini-Mental State Examination score - Direct cognitive assessment (0-30)",
            "ADL": "Activities of Daily Living score - Functional independence measure",
            "FunctionalAssessment": "Overall functional capacity assessment",
            "MemoryComplaints": "Patient-reported memory problems - Early warning sign",
            "BehavioralProblems": "Behavioral and psychological symptoms",
        }

        self.speech_interpretations = {
            "TTR": "Type-Token Ratio - Vocabulary diversity indicator",
            "Brunet_Index": "Brunet's Index - Lexical richness measure",
            "Avg_Word_Length": "Average word length - Linguistic complexity",
            "NOUN_ratio": "Noun usage ratio - Naming ability indicator",
            "VERB_ratio": "Verb usage ratio - Action word usage",
            "PRONOUN_ratio": "Pronoun usage ratio - Potential vague reference indicator",
            "Subordinate_Clauses": "Complex sentence structure usage",
            "Parse_Tree_Depth": "Syntactic complexity measure",
            "Idea_Density": "Information content per utterance",
            "Key_Elements_Described": "Task-relevant content identification",
            "Irrelevant_Details": "Off-topic or tangential content",
            "Pauses": "Speech fluency and planning difficulties",
            "Repair_Rate": "Self-correction frequency",
        }

    def get_clinical_explanation(
        self, clinical_data: np.ndarray, prediction: int, confidence: float
    ) -> Dict[str, Any]:
        """Generate clinical model explanation"""
        explanation = {
            "model_type": "clinical",
            "prediction": int(prediction),
            "confidence": float(confidence),
            "shap_available": False,
            "feature_importance": [],
            "top_contributing_factors": [],
            "clinical_interpretation": "",
            "confidence_level": self._get_confidence_level(confidence),
        }

        # Get feature importance if available
        if hasattr(self.clinical_model, "named_steps") and hasattr(
            self.clinical_model.named_steps["classifier"], "feature_importances_"
        ):
            feature_importance = self.clinical_model.named_steps[
                "classifier"
            ].feature_importances_
            importance_data = [
                {
                    "feature": feature,
                    "importance": float(importance),
                    "value": float(clinical_data[i]) if i < len(clinical_data) else 0.0,
                    "interpretation": self.clinical_interpretations.get(
                        feature, "Clinical feature"
                    ),
                }
                for i, (feature, importance) in enumerate(
                    zip(self.clinical_features, feature_importance)
                )
            ]
            # Sort by importance
            importance_data.sort(key=lambda x: x["importance"], reverse=True)
            explanation["feature_importance"] = importance_data[:5]  # Top 5

        # Generate SHAP explanation if available
        if self.clinical_explainer is not None:
            try:
                shap_values = self.clinical_explainer.shap_values(
                    clinical_data.reshape(1, -1)
                )

                if isinstance(shap_values, list):
                    # Multiclass case - use prediction class
                    if prediction < len(shap_values):
                        shap_vals = shap_values[prediction]
                        if hasattr(shap_vals, "shape") and len(shap_vals.shape) > 1:
                            shap_vals = shap_vals[0]
                    else:
                        shap_vals = shap_values[0]
                        if hasattr(shap_vals, "shape") and len(shap_vals.shape) > 1:
                            shap_vals = shap_vals[0]
                else:
                    shap_vals = shap_values
                    if hasattr(shap_vals, "shape") and len(shap_vals.shape) > 1:
                        shap_vals = shap_vals[0]

                # Ensure shap_vals is 1D array
                shap_vals = np.array(shap_vals).flatten()

                # Get top SHAP contributors
                shap_contributions = [
                    {
                        "feature": (
                            self.clinical_features[i]
                            if i < len(self.clinical_features)
                            else f"feature_{i}"
                        ),
                        "shap_value": float(shap_val),
                        "direction": "increases" if shap_val > 0 else "decreases",
                        "magnitude": self._get_magnitude_level(abs(shap_val)),
                        "interpretation": self.clinical_interpretations.get(
                            (
                                self.clinical_features[i]
                                if i < len(self.clinical_features)
                                else f"feature_{i}"
                            ),
                            "Clinical feature",
                        ),
                    }
                    for i, shap_val in enumerate(shap_vals)
                ]

                # Sort by absolute SHAP value
                shap_contributions.sort(
                    key=lambda x: abs(x["shap_value"]), reverse=True
                )
                explanation["top_contributing_factors"] = shap_contributions[:5]
                explanation["shap_available"] = True

            except Exception as e:
                print(f"SHAP explanation failed: {e}")

        # Generate clinical interpretation
        explanation["clinical_interpretation"] = self._generate_clinical_interpretation(
            explanation, prediction, confidence
        )

        return explanation

    def get_speech_explanation(
        self, speech_features: np.ndarray, prediction: int, confidence: float
    ) -> Dict[str, Any]:
        """Generate speech model explanation"""
        explanation = {
            "model_type": "speech",
            "prediction": int(prediction),
            "confidence": float(confidence),
            "linguistic_features": [],
            "speech_patterns": {},
            "clinical_interpretation": "",
            "confidence_level": self._get_confidence_level(confidence),
        }

        # Analyze linguistic features (last part of the combined features)
        if len(speech_features) >= len(self.speech_features):
            linguistic_data = speech_features[-len(self.speech_features) :]

            linguistic_analysis = [
                {
                    "feature": feature,
                    "value": float(value),
                    "interpretation": self.speech_interpretations.get(
                        feature, "Speech feature"
                    ),
                    "clinical_relevance": self._get_speech_clinical_relevance(
                        feature, value
                    ),
                }
                for feature, value in zip(self.speech_features, linguistic_data)
            ]

            explanation["linguistic_features"] = linguistic_analysis

        # Generate speech pattern analysis
        explanation["speech_patterns"] = self._analyze_speech_patterns(speech_features)

        # Generate clinical interpretation for speech
        explanation["clinical_interpretation"] = self._generate_speech_interpretation(
            explanation, prediction, confidence
        )

        return explanation

    def get_meta_explanation(
        self,
        meta_features: np.ndarray,
        clinical_pred: int,
        speech_pred: int,
        meta_pred: int,
        meta_confidence: float,
    ) -> Dict[str, Any]:
        """Generate meta-classifier explanation"""
        explanation = {
            "model_type": "meta_classifier",
            "prediction": int(meta_pred),
            "confidence": float(meta_confidence),
            "model_agreement": clinical_pred == speech_pred,
            "clinical_prediction": int(clinical_pred),
            "speech_prediction": int(speech_pred),
            "ensemble_reasoning": {},
            "feature_importance": [],
            "clinical_interpretation": "",
            "confidence_level": self._get_confidence_level(meta_confidence),
        }

        # Analyze model agreement and confidence
        explanation["ensemble_reasoning"] = {
            "models_agree": clinical_pred == speech_pred,
            "clinical_confidence": (
                float(meta_features[4]) if len(meta_features) > 4 else 0.0
            ),  # clinical_max_prob
            "speech_confidence": (
                float(meta_features[5]) if len(meta_features) > 5 else 0.0
            ),  # speech_max_prob
            "confidence_difference": (
                float(meta_features[6]) if len(meta_features) > 6 else 0.0
            ),  # confidence_diff
            "agreement_score": (
                float(meta_features[10]) if len(meta_features) > 10 else 0.0
            ),  # agreement
            "reasoning": self._generate_ensemble_reasoning(
                meta_features, clinical_pred, speech_pred
            ),
        }

        # Get meta-classifier feature importance if available
        if hasattr(self.meta_classifier, "feature_importances_"):
            feature_importance = self.meta_classifier.feature_importances_
            importance_data = [
                {
                    "feature": feature,
                    "importance": float(importance),
                    "value": float(meta_features[i]) if i < len(meta_features) else 0.0,
                    "interpretation": self._get_meta_feature_interpretation(feature),
                }
                for i, (feature, importance) in enumerate(
                    zip(
                        self.meta_features[: len(feature_importance)],
                        feature_importance,
                    )
                )
            ]
            importance_data.sort(key=lambda x: x["importance"], reverse=True)
            explanation["feature_importance"] = importance_data[:5]

        # Generate SHAP explanation for meta-classifier if available
        if self.meta_explainer is not None:
            try:
                shap_values = self.meta_explainer.shap_values(
                    meta_features.reshape(1, -1)
                )
                # Process SHAP values similar to clinical model
                # ... (similar to clinical explanation)
            except Exception as e:
                print(f"Meta SHAP explanation failed: {e}")

        explanation["clinical_interpretation"] = self._generate_meta_interpretation(
            explanation, meta_pred, meta_confidence, clinical_pred, speech_pred
        )

        return explanation

    def _get_confidence_level(self, confidence: float) -> str:
        """Convert confidence score to interpretable level"""
        if confidence >= 0.8:
            return "high"
        elif confidence >= 0.6:
            return "moderate"
        else:
            return "low"

    def _get_magnitude_level(self, value: float) -> str:
        """Convert SHAP value magnitude to interpretable level"""
        if abs(value) > 0.1:
            return "high"
        elif abs(value) > 0.05:
            return "medium"
        else:
            return "low"

    def _get_speech_clinical_relevance(self, feature: str, value: float) -> str:
        """Get clinical relevance of speech features"""
        relevance_map = {
            "TTR": "Higher values indicate better vocabulary diversity; lower values may suggest word-finding difficulties",
            "NOUN_ratio": "Reduced noun usage may indicate naming difficulties common in dementia",
            "PRONOUN_ratio": "Increased pronoun usage might indicate vague reference patterns",
            "Pauses": "Increased pauses may reflect word-finding or planning difficulties",
            "Repair_Rate": "Higher repair rates might indicate linguistic processing difficulties",
        }
        return relevance_map.get(
            feature, "Speech feature with potential clinical relevance"
        )

    def _analyze_speech_patterns(self, speech_features: np.ndarray) -> Dict[str, Any]:
        """Analyze speech patterns for clinical insights"""
        patterns = {
            "fluency_indicators": {},
            "complexity_measures": {},
            "semantic_indicators": {},
        }

        if len(speech_features) >= len(self.speech_features):
            linguistic_data = speech_features[-len(self.speech_features) :]
            feature_dict = dict(zip(self.speech_features, linguistic_data))

            # Fluency indicators
            patterns["fluency_indicators"] = {
                "pause_frequency": float(feature_dict.get("Pauses", 0)),
                "repair_rate": float(feature_dict.get("Repair_Rate", 0)),
                "overall_fluency": (
                    "good" if feature_dict.get("Pauses", 0) < 0.5 else "reduced"
                ),
            }

            # Complexity measures
            patterns["complexity_measures"] = {
                "syntactic_complexity": float(feature_dict.get("Parse_Tree_Depth", 0)),
                "lexical_diversity": float(feature_dict.get("TTR", 0)),
                "overall_complexity": (
                    "preserved" if feature_dict.get("TTR", 0) > 0.5 else "reduced"
                ),
            }

            # Semantic indicators
            patterns["semantic_indicators"] = {
                "idea_density": float(feature_dict.get("Idea_Density", 0)),
                "relevant_content": float(
                    feature_dict.get("Key_Elements_Described", 0)
                ),
                "semantic_coherence": (
                    "good"
                    if feature_dict.get("Irrelevant_Details", 0) < 0.3
                    else "reduced"
                ),
            }

        return patterns

    def _generate_clinical_interpretation(
        self, explanation: Dict, prediction: int, confidence: float
    ) -> str:
        """Generate clinical interpretation for clinical model"""
        confidence_text = explanation["confidence_level"]
        severity_map = {
            0: "No Dementia",
            1: "Mild Dementia",
            2: "Moderate Dementia",
            3: "Severe Dementia",
        }
        predicted_severity = severity_map.get(prediction, f"Class {prediction}")

        interpretation = f"""
CLINICAL MODEL ASSESSMENT:

The clinical model predicts: {predicted_severity} with {confidence_text} confidence ({confidence:.1%}).

CONFIDENCE ASSESSMENT:
"""

        if confidence >= 0.8:
            interpretation += "HIGH confidence - The clinical indicators strongly support this assessment."
        elif confidence >= 0.6:
            interpretation += "MODERATE confidence - The clinical indicators reasonably support this assessment."
        else:
            interpretation += "LOW confidence - This assessment should be interpreted with caution and may require additional evaluation."

        # Add top contributing factors if available
        if explanation.get("top_contributing_factors"):
            interpretation += "\n\nKEY CLINICAL FACTORS:\n"
            for factor in explanation["top_contributing_factors"][:3]:
                direction = (
                    "supporting" if factor["shap_value"] > 0 else "contradicting"
                )
                interpretation += f"• {factor['feature']}: {direction} the diagnosis\n"

        return interpretation.strip()

    def _generate_speech_interpretation(
        self, explanation: Dict, prediction: int, confidence: float
    ) -> str:
        """Generate clinical interpretation for speech model"""
        confidence_text = explanation["confidence_level"]
        severity_map = {
            0: "No Dementia",
            1: "Mild Dementia",
            2: "Moderate Dementia",
            3: "Severe Dementia",
        }
        predicted_severity = severity_map.get(prediction, f"Class {prediction}")

        interpretation = f"""
SPEECH ANALYSIS ASSESSMENT:

The speech model predicts: {predicted_severity} with {confidence_text} confidence ({confidence:.1%}).

LINGUISTIC PATTERN ANALYSIS:
"""

        patterns = explanation.get("speech_patterns", {})
        if patterns:
            fluency = patterns.get("fluency_indicators", {})
            complexity = patterns.get("complexity_measures", {})
            semantic = patterns.get("semantic_indicators", {})

            interpretation += (
                f"• Speech Fluency: {fluency.get('overall_fluency', 'unknown')}\n"
            )
            interpretation += f"• Language Complexity: {complexity.get('overall_complexity', 'unknown')}\n"
            interpretation += f"• Semantic Coherence: {semantic.get('semantic_coherence', 'unknown')}\n"

        return interpretation.strip()

    def _generate_meta_interpretation(
        self,
        explanation: Dict,
        meta_pred: int,
        meta_confidence: float,
        clinical_pred: int,
        speech_pred: int,
    ) -> str:
        """Generate clinical interpretation for meta-classifier"""
        confidence_text = explanation["confidence_level"]
        severity_map = {
            0: "No Dementia",
            1: "Mild Dementia",
            2: "Moderate Dementia",
            3: "Severe Dementia",
        }
        predicted_severity = severity_map.get(meta_pred, f"Class {meta_pred}")

        interpretation = f"""
ENSEMBLE MODEL ASSESSMENT:

Final prediction: {predicted_severity} with {confidence_text} confidence ({meta_confidence:.1%}).

MODEL CONSENSUS ANALYSIS:
"""

        ensemble_reasoning = explanation.get("ensemble_reasoning", {})
        models_agree = ensemble_reasoning.get("models_agree", False)

        if models_agree:
            interpretation += f"✓ STRONG CONSENSUS: Both clinical and speech models agree on the assessment.\n"
        else:
            clinical_sev = severity_map.get(clinical_pred, f"Class {clinical_pred}")
            speech_sev = severity_map.get(speech_pred, f"Class {speech_pred}")
            interpretation += f"⚠ MIXED SIGNALS: Clinical model suggests {clinical_sev}, speech model suggests {speech_sev}.\n"

        interpretation += f"• Clinical model confidence: {ensemble_reasoning.get('clinical_confidence', 0):.1%}\n"
        interpretation += f"• Speech model confidence: {ensemble_reasoning.get('speech_confidence', 0):.1%}\n"

        interpretation += "\nRECOMMENDATION:\n"
        if meta_confidence >= 0.8 and models_agree:
            interpretation += (
                "High confidence with model agreement supports reliable assessment."
            )
        elif meta_confidence >= 0.6:
            interpretation += "Moderate confidence assessment - consider additional clinical evaluation."
        else:
            interpretation += "Low confidence - recommend comprehensive clinical assessment and possible re-evaluation."

        return interpretation.strip()

    def _generate_ensemble_reasoning(
        self, meta_features: np.ndarray, clinical_pred: int, speech_pred: int
    ) -> str:
        """Generate reasoning for ensemble decision"""
        if clinical_pred == speech_pred:
            return "Both models agree, providing strong evidence for the prediction."
        else:
            clinical_conf = meta_features[4] if len(meta_features) > 4 else 0.5
            speech_conf = meta_features[5] if len(meta_features) > 5 else 0.5

            if clinical_conf > speech_conf:
                return "Clinical indicators are stronger; meta-model weighs clinical assessment more heavily."
            elif speech_conf > clinical_conf:
                return "Speech patterns are more distinctive; meta-model weighs linguistic assessment more heavily."
            else:
                return "Both models show similar confidence; meta-model balances both assessments."

    def _get_meta_feature_interpretation(self, feature: str) -> str:
        """Get interpretation for meta-classifier features"""
        interpretations = {
            "clinical_max_prob": "Highest confidence from clinical model",
            "speech_max_prob": "Highest confidence from speech model",
            "confidence_diff": "Difference in model confidences",
            "confidence_ratio": "Ratio of model confidences",
            "clinical_entropy": "Uncertainty in clinical predictions",
            "speech_entropy": "Uncertainty in speech predictions",
            "agreement": "Whether models agree on prediction",
            "clinical_weight": "Importance weight of clinical model",
            "speech_weight": "Importance weight of speech model",
        }
        return interpretations.get(feature, "Meta-classifier feature")

    def _convert_numpy_types(self, obj):
        """Convert numpy types to native Python types for JSON serialization"""
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        elif isinstance(obj, np.integer):
            return int(obj)
        elif isinstance(obj, np.floating):
            return float(obj)
        elif isinstance(obj, np.bool_):
            return bool(obj)
        elif isinstance(obj, dict):
            return {key: self._convert_numpy_types(value) for key, value in obj.items()}
        elif isinstance(obj, list):
            return [self._convert_numpy_types(item) for item in obj]
        else:
            return obj

    def generate_comprehensive_explanation(
        self,
        clinical_data: np.ndarray,
        speech_features: np.ndarray,
        meta_features: np.ndarray,
        clinical_pred: int,
        clinical_conf: float,
        speech_pred: int,
        speech_conf: float,
        meta_pred: int,
        meta_conf: float,
    ) -> Dict[str, Any]:
        """Generate comprehensive explanation for all models"""

        explanation = {
            "clinical_explanation": self.get_clinical_explanation(
                clinical_data, clinical_pred, clinical_conf
            ),
            "speech_explanation": self.get_speech_explanation(
                speech_features, speech_pred, speech_conf
            ),
            "meta_explanation": self.get_meta_explanation(
                meta_features, clinical_pred, speech_pred, meta_pred, meta_conf
            ),
            "summary": {
                "final_prediction": int(meta_pred),
                "final_confidence": float(meta_conf),
                "model_agreement": bool(clinical_pred == speech_pred),
                "confidence_level": self._get_confidence_level(meta_conf),
                "clinical_recommendations": self._generate_clinical_recommendations(
                    meta_pred, meta_conf, clinical_pred == speech_pred
                ),
            },
        }

        # Convert all numpy types to native Python types for JSON serialization
        return self._convert_numpy_types(explanation)

    def _generate_clinical_recommendations(
        self, prediction: int, confidence: float, models_agree: bool
    ) -> List[str]:
        """Generate clinical recommendations based on prediction and explanation"""
        recommendations = []

        if confidence < 0.6:
            recommendations.append(
                "LOW CONFIDENCE: Recommend comprehensive clinical assessment"
            )

        if not models_agree:
            recommendations.append(
                "MODEL DISAGREEMENT: Consider additional evaluation modalities"
            )

        if prediction > 0:  # Some level of dementia predicted
            recommendations.append(
                "POSITIVE PREDICTION: Recommend neurological consultation"
            )
            recommendations.append("Consider comprehensive neuropsychological testing")

        if confidence >= 0.8 and models_agree:
            recommendations.append(
                "HIGH CONFIDENCE: Assessment reliable for clinical decision support"
            )

        recommendations.append(
            "GENERAL: This AI assessment should supplement, not replace, clinical judgment"
        )

        return recommendations
