import pandas as pd
from textblob import TextBlob

def extract_transcript_features(transcript_path):
    try:
        df = pd.read_csv(transcript_path)

        # Check for common column names that may contain transcript text
        possible_columns = ['text', 'value', 'transcript', 'utterance']
        selected_column = next((col for col in possible_columns if col in df.columns), None)

        if selected_column:
            texts = df[selected_column].dropna().astype(str)
            combined_text = " ".join(texts)

            blob = TextBlob(combined_text)
            polarity = blob.sentiment.polarity
            subjectivity = blob.sentiment.subjectivity
        else:
            polarity = 0.0
            subjectivity = 0.0

        # Return DataFrame with proper column names
        return pd.DataFrame([{
            "participant_id": 'user1',
            "transcript_polarity": polarity,
            "transcript_subjectivity": subjectivity
        }])

    except Exception as e:
        print(f"Error processing transcript from {transcript_path}: {e}")
        # Return fallback DataFrame with neutral values
        return pd.DataFrame([{
            "participant_id": 'user1',
            "transcript_polarity": 0.0,
            "transcript_subjectivity": 0.0
        }])
