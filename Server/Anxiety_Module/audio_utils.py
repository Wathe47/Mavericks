import pandas as pd
import numpy as np
import librosa

def extract_audio_features(audio_path):
    y, sr = librosa.load(audio_path, sr=None)

    # Extract audio features
    mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
    chroma = librosa.feature.chroma_stft(y=y, sr=sr)
    zcr = librosa.feature.zero_crossing_rate(y)

    # Compute means
    mfcc_means = np.mean(mfcc, axis=1)
    chroma_mean = np.mean(chroma)
    zcr_mean = np.mean(zcr)

    # Build dictionary of features
    features = {
        'participant_id': ['user1'],  # or a dynamic ID if needed
        **{f'mfcc_{i+1}': [mfcc_means[i]] for i in range(len(mfcc_means))},
        'chroma_mean': [chroma_mean],
        'zcr_mean': [zcr_mean]
    }

    return pd.DataFrame(features)
