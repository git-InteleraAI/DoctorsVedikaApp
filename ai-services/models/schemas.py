"""
Pydantic Schemas for AI Microservices Data Contracts
"""
from pydantic import BaseModel
from typing import Optional, List

class TranscriptionRequest(BaseModel):
    audio_url: str
    language: Optional[str] = "en"

class TranscriptionResponse(BaseModel):
    transcript: str
    confidence: float

class SOAPRequest(BaseModel):
    transcript: str
    doctor_notes: Optional[str] = ""

class SOAPResponse(BaseModel):
    subjective: str
    objective: str
    assessment: str
    plan: str
