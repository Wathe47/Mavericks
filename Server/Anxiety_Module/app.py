from flask import Flask, render_template, request
import os
import numpy as np
import pandas as pd
import joblib

from audio_utils import extract_audio_features
from facial_utils import extract_facial_features
from transcript_utils import extract_transcript_features

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'

# Load the model and encoders
model = joblib.load("models/Final.pkl")
label_encoder = joblib.load("models/LabelEncoder.pkl")

def save_file(file, filename):
    path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(path)
    return path

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Get files
        audio_file = request.files['audio']
        facial_files = [request.files[f'facial{i}'] for i in range(1, 4)]
        transcript_file = request.files['transcript']

        # Save uploaded files
        audio_path = save_file(audio_file, audio_file.filename)
        facial_paths = [save_file(file, file.filename) for file in facial_files]
        transcript_path = save_file(transcript_file, transcript_file.filename)

        # Extract features
        audio_df = extract_audio_features(audio_path)
        facial_df = extract_facial_features(facial_paths)
        transcript_df = extract_transcript_features(transcript_path)

        # Check if they are DataFrames and have 'participant_id'
        for df_name, df in zip(["Audio", "Facial", "Transcript"], [audio_df, facial_df, transcript_df]):
            if not isinstance(df, pd.DataFrame):
                raise ValueError(f"{df_name} features are not in DataFrame format.")
            if 'participant_id' not in df.columns:
                raise ValueError(f"'participant_id' column missing in {df_name} features.")

        # Merge data
        df_merged = audio_df.merge(facial_df, on="participant_id", how="inner")
        df_merged = df_merged.merge(transcript_df, on="participant_id", how="inner")

        # Drop unnecessary columns
        df_merged = df_merged.drop(columns=["participant_id"], errors='ignore')

        # Debug: Check merged DataFrame
        print("✅ Merged DataFrame Sample:")
        print(df_merged.head())  # This will print the first few rows of the DataFrame

        # Ensure feature length matches model expectation (111 features)
        expected_features = 111  # Your model expects this

        # Convert DataFrame to NumPy array
        current_features = df_merged.to_numpy()

        # Adjust shape if it's 1D
        if current_features.ndim == 1:
            current_features = current_features.reshape(1, -1)

        # Handle feature mismatch
        num_features = current_features.shape[1]

        if num_features < expected_features:
            # Pad with NaNs
            padding = np.full((current_features.shape[0], expected_features - num_features), np.nan)
            final_features = np.concatenate([current_features, padding], axis=1)
        elif num_features > expected_features:
            # Truncate extra columns
            final_features = current_features[:, :expected_features]
        else:
            final_features = current_features

        #print(f"✅ Final features shape: {final_features.shape}")
        #print("✅ Sample features:", final_features[:1])

        # Predict
        prediction = model.predict(final_features)
        predicted_class = label_encoder.inverse_transform(prediction)[0]

        return render_template('result.html', prediction=f"✅ Anxiety Type: {predicted_class}")

    except Exception as e:
        return render_template('result.html', prediction=f"❌ Error during prediction: {str(e)}")

if __name__ == '__main__':
    if not os.path.exists(app.config['UPLOAD_FOLDER']):
        os.makedirs(app.config['UPLOAD_FOLDER'])
    app.run(debug=True)
