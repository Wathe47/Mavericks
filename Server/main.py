from fastapi import FastAPI, File, UploadFile
import sys
import os
import tempfile
import subprocess

# Add the path to import using_trained.py
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from predict_dementia import predict_from_input
from config import add_cors_middleware
from schemas import PredictionRequest
from Transcribe.transcribe import transcribe_local
from Transcribe.transcribe import transcribe_azure

app = FastAPI()
add_cors_middleware(app)


@app.post("/transcribe/")
async def transcribe_audio(file: UploadFile = File(...)):
    
    print("Received file for transcription:", file.filename)
   
    with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as tmp_in:
       tmp_in.write(await file.read())
       tmp_in.flush()

    wav_file = tmp_in.name.replace(".webm", ".wav")

    # Convert to WAV using ffmpeg
    subprocess.run(
        ["ffmpeg", "-i", tmp_in.name, "-ar", "16000", "-ac", "1", wav_file],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )

    try:
        output = await transcribe_azure(wav_file)
    except Exception as e:
        print(f"Azure transcription failed: {e}")
        print("Falling back to local transcription...")
        output = await transcribe_local(wav_file)

    if output == {"transcript": ""}:
        output = {"transcript": "(Returned empty result!)"}

    # Clean up temporary files
    os.remove(tmp_in.name)
    os.remove(wav_file)

    return output


@app.post("/api/dementia/predict")
def predict(request: PredictionRequest):

    manual_input = request.clinical.dict()
    transcript_ctd = request.speech.Transcript_CTD
    transcript_pft = request.speech.Transcript_PFT
    transcript_sft = request.speech.Transcript_SFT

    result = predict_from_input(
        manual_input, transcript_ctd, transcript_pft, transcript_sft
    )

    # Convert numpy.float32 to native Python types
    result["clinical_proba"] = float(result["clinical_proba"])
    result["speech_proba"] = float(result["speech_proba"])
    result["meta_proba"] = float(result["meta_proba"])

    return result
