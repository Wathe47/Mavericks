import mne
import numpy as np
import torch
from app.models_cbramod import Params

selected_channels = [
    'EEG Fp1-LE', 'EEG Fp2-LE', 'EEG F3-LE', 'EEG F4-LE', 'EEG C3-LE', 'EEG C4-LE',
    'EEG P3-LE', 'EEG P4-LE', 'EEG O1-LE', 'EEG O2-LE', 'EEG F7-LE', 'EEG F8-LE',
    'EEG T3-LE', 'EEG T4-LE', 'EEG T5-LE', 'EEG T6-LE', 'EEG Fz-LE', 'EEG Cz-LE', 'EEG Pz-LE'
]

param = Params()

def preprocess_edf(file_path):
    raw = mne.io.read_raw_edf(file_path, preload=True, verbose=False)
    raw.pick_channels(selected_channels, ordered=True)
    raw.resample(200, verbose=False)
    raw.filter(l_freq=0.3, h_freq=75, verbose=False)
    raw.notch_filter(freqs=50, verbose=False)
    data = raw.get_data()
    data = data.T
    window_size = 5 * 200
    n_points, n_ch = data.shape
    remainder = n_points % window_size
    if remainder != 0:
        data = data[:-remainder, :]
    segments = data.reshape(-1, window_size, n_ch)
    segments = segments.transpose(0, 2, 1)
    segments = segments.reshape(-1, 19, 5, 200)
    segments = segments.astype(np.float32) * 1e6 / 100.0
    tensor_segments = torch.tensor(segments, dtype=torch.float32)
    return tensor_segments.to(param.device)
