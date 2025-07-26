from fastapi import FastAPI, UploadFile, File, HTTPException
import os
from app.predictor import predict_depression
from app.severity import predict_severity

app = FastAPI()

@app.post("/predict/")
async def predict(file: UploadFile = File(...)):
    if not file.filename.endswith('.edf'):
        raise HTTPException(status_code=400, detail="Only .edf files are supported")

    # Save uploaded file temporarily
    temp_path = f"./temp_{file.filename}"
    contents = await file.read()
    with open(temp_path, "wb") as f:
        f.write(contents)

    try:
        depression_label, depression_prob = predict_depression(temp_path)
    except Exception as e:
        os.remove(temp_path)
        raise HTTPException(status_code=500, detail=f"Error during depression prediction: {e}")

    result = {
        "depression_detected": bool(depression_label),
        "depression_probability": depression_prob
    }

    if depression_label == 1:
        try:
            severity_label = predict_severity(temp_path)
            result["severity_prediction"] = severity_label
        except Exception as e:
            os.remove(temp_path)
            raise HTTPException(status_code=500, detail=f"Error during severity prediction: {e}")
    else:
        result["message"] = "No depression detected"

    os.remove(temp_path)
    return result
