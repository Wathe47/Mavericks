from fastapi import FastAPI, File, UploadFile
from typing import List, Any
import sys
import os
from faster_whisper import WhisperModel
import tempfile
import subprocess

# Add the path to import using_trained.py
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from predict_dementia import predict_from_input
from config import add_cors_middleware
from schemas import PredictionRequest

app = FastAPI()
add_cors_middleware(app)


# Load Whisper model once at startup
model = WhisperModel("medium", compute_type="int8") 


@app.post("/transcribe/")
async def transcribe_audio(file: UploadFile = File(...)):
    # Save input file temporarily
    print("Received file for transcription:", file.filename)
    with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as tmp_in:
        tmp_in.write(await file.read())
        tmp_in.flush()

    tmp_wav_path = tmp_in.name.replace(".webm", ".wav")

    # Convert to WAV using ffmpeg
    subprocess.run([
        "ffmpeg", "-i", tmp_in.name, "-ar", "16000", "-ac", "1", tmp_wav_path
    ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

    # Transcribe with word timestamps
    segments, _ = model.transcribe(tmp_wav_path, word_timestamps=True)

    # Collect all words
    words = []
    for segment in segments:
        words.extend(segment.words)

    # Build transcript with pause markers
    transcript = []
    pause_threshold = 0.7  # seconds
    for i, word in enumerate(words):
        transcript.append(word.word)
        if i < len(words) - 1:
            gap = words[i + 1].start - word.end
            if gap >= pause_threshold:
                transcript.append(f"[pause {gap:.1f}s]")

    final_transcript = " ".join(transcript)

    # Cleanup
    os.remove(tmp_in.name)
    os.remove(tmp_wav_path)
   
    print(f"Final transcript: {final_transcript}")
    return {"transcript": final_transcript}


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
