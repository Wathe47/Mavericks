import torch
from app.models_cbramod import CBraModMumtaz, Params
from app.preprocessing import preprocess_edf
from app.severity import predict_severity

param = Params()
model = CBraModMumtaz(param).to(param.device)
model.eval()

def predict_depression(file_path, threshold=0.815):
    segments = preprocess_edf(file_path)
    with torch.no_grad():
        outputs = model(segments)
        probs = torch.sigmoid(outputs)
    mean_prob = probs.mean().item()
    pred_label = 1 if mean_prob >= threshold else 0
    return pred_label, mean_prob
