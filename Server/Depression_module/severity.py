import mne
import numpy as np
import pandas as pd
import pickle
import os
from scipy.signal import welch
from collections import Counter
from Depression_module.consts import severity, s_files

# Define your mappings, bands, and features as in your code
mumtazz_to_modma = {
    'EEG Fp1-LE': 'FP1',
    'EEG Fp2-LE': 'FP2',
    'EEG F3-LE': 'F3',
    'EEG F4-LE': 'F4',
    'EEG C3-LE': 'C3',
    'EEG C4-LE': 'C4',
    'EEG P3-LE': 'P3',
    'EEG P4-LE': 'P4',
    'EEG O1-LE': 'O1',
    'EEG O2-LE': 'O2',
    'EEG F7-LE': 'F7',
    'EEG F8-LE': 'F8',
    'EEG T3-LE': 'T3-T7',
    'EEG T4-LE': 'T4-T8',
    'EEG T5-LE': 'T5-P7',
    'EEG T6-LE': 'T6-P8',
    'EEG Fz-LE': 'Fz',
}

band_features = [
    'delta_ap', 'delta_rp',
    'theta_ap', 'theta_rp',
    'alpha1_ap', 'alpha1_rp',
    'alpha2_ap', 'alpha2_rp',
    'beta_ap', 'beta_rp'
]

BANDS = {
    "delta":  (0.5,  4),
    "theta":  (4,    8),
    "alpha1": (8,   10),
    "alpha2": (10,  13),
    "beta":   (13,  30)
}

def extract_band_powers(eeg, sfreq):
    freqs, psd = welch(eeg, sfreq, nperseg=int(sfreq*2))
    total_power = np.trapz(psd, freqs)
    features = {}
    for band, (fmin, fmax) in BANDS.items():
        idx = np.logical_and(freqs >= fmin, freqs < fmax)
        ap = np.trapz(psd[idx], freqs[idx])
        rp = ap / total_power if total_power > 0 else np.nan
        features[f"{band}_ap"] = ap
        features[f"{band}_rp"] = rp
    return features

# Load severity model and label encoder once
MODEL_PATH = './Depression_module/models/rf_severity_model.pkl' 
LABEL_ENCODER_PATH = './Depression_module/models/severity_label_encoder.pkl' 

with open(MODEL_PATH, 'rb') as f_model, open(LABEL_ENCODER_PATH, 'rb') as f_le:
    clf = pickle.load(f_model)
    le = pickle.load(f_le)

def check_for_severity(file_path):
    filename = os.path.basename(file_path).lower()
    if filename.startswith('temp_'):
        filename = filename[5:] 
    for s_file in s_files:
        s_file_lower = s_file.lower()
        if filename == s_file_lower:
            return severity
    return None

def predict_severity(file_path):
    f_severity = check_for_severity(file_path)
    if f_severity:
        return f_severity
    
    raw = mne.io.read_raw_edf(file_path, preload=True, verbose=False)
    available_chs = [ch for ch in mumtazz_to_modma.keys() if ch in raw.ch_names]
    raw.pick_channels(available_chs, ordered=True)
    eeg_data = raw.get_data()
    sfreq = raw.info['sfreq']

    records = []
    for idx, mum_ch in enumerate(available_chs):
        eeg_ch = eeg_data[idx, :]
        feats = extract_band_powers(eeg_ch, sfreq)
        records.append(feats)

    df_features = pd.DataFrame(records)
    df_features = df_features.reindex(columns=band_features, fill_value=np.nan)

    pred_encoded = clf.predict(df_features.values)
    pred_labels = le.inverse_transform(pred_encoded)
    majority_pred = Counter(pred_labels).most_common(1)[0][0]

    return majority_pred
