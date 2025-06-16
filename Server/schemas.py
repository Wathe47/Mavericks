from pydantic import BaseModel

class ClinicalInput(BaseModel):
    Age: float
    Gender: int
    BMI: float
    FamilyHistoryAlzheimers: int
    Hypertension: int
    CardiovascularDisease: int
    MMSE: float
    ADL: float
    FunctionalAssessment: float
    MemoryComplaints: int
    BehavioralProblems: int


class SpeechInput(BaseModel):
    Transcript_CTD: str
    Transcript_PFT: str
    Transcript_SFT: str


class PredictionRequest(BaseModel):
    clinical: ClinicalInput
    speech: SpeechInput