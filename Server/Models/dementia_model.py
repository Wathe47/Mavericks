from sqlalchemy import Column, Integer, String, Float, DateTime
from datetime import datetime
from Config.dbConfig import Base

class DementiaModel(Base):
    __tablename__ = "dementia_records"

    id = Column(Integer, primary_key=True, index=True)
    # Clinical fields
    age = Column(Integer, nullable=False)
    gender = Column(Integer, nullable=False)
    bmi = Column(Float, nullable=False)
    family_history_alzheimers = Column(Integer, nullable=False)
    hypertension = Column(Integer, nullable=False)
    cardiovascular_disease = Column(Integer, nullable=False)
    mmse = Column(Float, nullable=False)
    adl = Column(Float, nullable=False)
    functional_assessment = Column(Float, nullable=False)
    memory_complaints = Column(Integer, nullable=False)
    behavioral_problems = Column(Integer, nullable=False)
    # Speech fields
    transcript_ctd = Column(String(500), nullable=True)
    transcript_pft = Column(String(500), nullable=True)
    transcript_sft = Column(String(500), nullable=True)
    # Prediction results
    clinical_pred = Column(Integer, nullable=False)
    clinical_proba = Column(Float, nullable=False)
    speech_pred = Column(Integer, nullable=False)
    speech_proba = Column(Float, nullable=False)
    meta_pred = Column(Integer, nullable=False)
    meta_proba = Column(Float, nullable=False)
    # Timestamp
    created_at = Column(DateTime, default=datetime.utcnow)