from fastapi import FastAPI, File, HTTPException, UploadFile
import sys
import os
import tempfile
import subprocess

# Add the path to import using_trained.py
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from Dementia_Models.predict_dementia import predict_from_input
from Config.corsConfig import add_cors_middleware
from schemas import PredictionRequest
from Transcribe.transcribe import transcribe_local
from Transcribe.transcribe import transcribe_azure
from Config.dbConfig import SessionLocal,engine, Base
from Models.dementia_model import DementiaModel
from Depression_module.predictor import predict_depression
from Depression_module.severity import predict_severity
from Anxiety_Module.anxiety_predictor import predict_anxiety

# Create or update tables
Base.metadata.create_all(bind=engine)

app = FastAPI()
add_cors_middleware(app)


@app.post("/api/dementia/transcribe/")
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
        output = {"transcript": "(Empty result!)"}

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

    # Save the record to the database
    db = SessionLocal()
    try:
        record = DementiaModel(
            # Clinical fields
            age=manual_input["Age"],
            gender=manual_input["Gender"],
            bmi=manual_input["BMI"],
            family_history_alzheimers=manual_input["FamilyHistoryAlzheimers"],
            hypertension=manual_input["Hypertension"],
            cardiovascular_disease=manual_input["CardiovascularDisease"],
            mmse=manual_input["MMSE"],
            adl=manual_input["ADL"],
            functional_assessment=manual_input["FunctionalAssessment"],
            memory_complaints=manual_input["MemoryComplaints"],
            behavioral_problems=manual_input["BehavioralProblems"],
            # Speech fields
            transcript_ctd=transcript_ctd,
            transcript_pft=transcript_pft,
            transcript_sft=transcript_sft,
            # Prediction results
            clinical_pred=result["clinical_pred"],
            clinical_proba=result["clinical_proba"],
            speech_pred=result["speech_pred"],
            speech_proba=result["speech_proba"],
            meta_pred=result["meta_pred"],
            meta_proba=result["meta_proba"],
        )
        db.add(record)
        db.commit()
        db.refresh(record)
    except Exception as e:
        db.rollback()
        print(f"Error saving to database: {e}")
    finally:
        db.close()

    return result

#get all records 
@app.get("/api/dementia/records")
def getRecords():
   db = SessionLocal()
   try:
      records = db.query(DementiaModel).order_by(DementiaModel.id.desc()).all()
      result = [record.__dict__ for record in records]
      # Remove SQLAlchemy internal state
      for r in result:
         r.pop('_sa_instance_state', None)
   except Exception as e:
      print(f"Error fetching records from database: {e}")
   finally:
      db.close()
   return result

@app.post("/api/depression/predict/")
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


@app.post("/api/anxiety/predict/")
async def predict_anxiety_endpoint(
        audio: UploadFile = File(...),
        facial1: UploadFile = File(...),
        facial2: UploadFile = File(...),
        facial3: UploadFile = File(...),
        transcript: UploadFile = File(...),
    ):
    result = predict_anxiety( audio, facial1, facial2, facial3, transcript )
    return result
 