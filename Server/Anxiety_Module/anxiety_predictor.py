import os
import numpy as np
import pandas as pd
import joblib
import tempfile
from io import BytesIO

from Anxiety_Module.audio_utils import extract_audio_features
from Anxiety_Module.facial_utils import extract_facial_features
from Anxiety_Module.transcript_utils import extract_transcript_features

# Global variables for lazy loading
model = None
label_encoder = None


def load_models():
    """Load models lazily when first needed"""
    global model, label_encoder
    if model is None or label_encoder is None:
        current_dir = os.path.dirname(os.path.abspath(__file__))
        model_path = os.path.join(current_dir, "models/Final.pkl")
        encoder_path = os.path.join(current_dir, "models/LabelEncoder.pkl")

        print(f"Loading models from: {current_dir}")

        model = joblib.load(model_path)
        label_encoder = joblib.load(encoder_path)
        print("✅ Successfully loaded models!")

    return model, label_encoder


def create_temp_file_from_upload(upload_file):
    """
    Create a temporary file from an uploaded file without saving to permanent storage
    Args:
        upload_file: UploadFile object from FastAPI or similar
    Returns:
        str: Path to temporary file
    """
    # Create a temporary file
    temp_file = tempfile.NamedTemporaryFile(
        delete=False, suffix=f"_{upload_file.filename}"
    )

    # Read file content and write to temp file
    content = upload_file.file.read()
    temp_file.write(content)
    temp_file.close()

    # Reset file pointer for potential reuse
    upload_file.file.seek(0)

    return temp_file.name


def predict_anxiety(audio, facial1, facial2, facial3, transcript):
    """
    Predict anxiety type from uploaded files without saving them permanently

    Args:
        audio: UploadFile - Audio file
        facial1: UploadFile - First facial image
        facial2: UploadFile - Second facial image
        facial3: UploadFile - Third facial image
        transcript: UploadFile - Transcript file

    Returns:
        dict: Prediction result with success status and message
    """
    temp_files = []

    try:
        # Create temporary files for processing
        audio_path = create_temp_file_from_upload(audio)
        facial1_path = create_temp_file_from_upload(facial1)
        facial2_path = create_temp_file_from_upload(facial2)
        facial3_path = create_temp_file_from_upload(facial3)
        transcript_path = create_temp_file_from_upload(transcript)

        # Keep track of temp files for cleanup
        temp_files = [
            audio_path,
            facial1_path,
            facial2_path,
            facial3_path,
            transcript_path,
        ]
        facial_paths = [facial1_path, facial2_path, facial3_path]

        # Extract features
        audio_df = extract_audio_features(audio_path)
        facial_df = extract_facial_features(facial_paths)
        transcript_df = extract_transcript_features(transcript_path)

        # Check if they are DataFrames and have 'participant_id'
        for df_name, df in zip(
            ["Audio", "Facial", "Transcript"], [audio_df, facial_df, transcript_df]
        ):
            if not isinstance(df, pd.DataFrame):
                raise ValueError(f"{df_name} features are not in DataFrame format.")
            if "participant_id" not in df.columns:
                raise ValueError(
                    f"'participant_id' column missing in {df_name} features."
                )

        # Merge data
        df_merged = audio_df.merge(facial_df, on="participant_id", how="inner")
        df_merged = df_merged.merge(transcript_df, on="participant_id", how="inner")

        # Drop unnecessary columns
        df_merged = df_merged.drop(columns=["participant_id"], errors="ignore")

        # Debug: Check merged DataFrame
        print("✅ Merged DataFrame Sample:")
        print(df_merged.head())

        # Ensure feature length matches model expectation (111 features)
        expected_features = 111

        # Convert DataFrame to NumPy array
        current_features = df_merged.to_numpy()

        # Adjust shape if it's 1D
        if current_features.ndim == 1:
            current_features = current_features.reshape(1, -1)

        # Handle feature mismatch
        num_features = current_features.shape[1]

        if num_features < expected_features:
            # Pad with NaNs
            padding = np.full(
                (current_features.shape[0], expected_features - num_features), np.nan
            )
            final_features = np.concatenate([current_features, padding], axis=1)
        elif num_features > expected_features:
            # Truncate extra columns
            final_features = current_features[:, :expected_features]
        else:
            final_features = current_features

        print(f"✅ Final features shape: {final_features.shape}")

        # Load models when needed
        model, label_encoder = load_models()

        # Predict
        prediction = model.predict(final_features)
        predicted_class = label_encoder.inverse_transform(prediction)[0]

        return {
            "success": True,
            "prediction": predicted_class,
            "message": f"✅ Anxiety Type: {predicted_class}",
            "features_shape": final_features.shape,
            "confidence": None,  # Add confidence scores if your model supports predict_proba
        }

    except Exception as e:
        return {
            "success": False,
            "prediction": None,
            "message": f"❌ Error during prediction: {str(e)}",
            "error": str(e),
        }

    finally:
        # Clean up temporary files
        for temp_file in temp_files:
            try:
                if os.path.exists(temp_file):
                    os.unlink(temp_file)
            except Exception as e:
                print(f"Warning: Could not delete temporary file {temp_file}: {e}")
