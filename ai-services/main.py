"""
Doctors Vedika AI Services - FastAPI Microservice Gateway
Provides AI modules: Speech, Transcription, Medical Summarizer, SOAP Notes,
Diagnosis Assisting, OCR, Translation, Prescription Parser, Chatbot, Embeddings.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Doctors Vedika AI Services",
    description="Enterprise Medical AI Engine for Speech, Transcription, SOAP Notes, and Diagnosis Assistance",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "Doctors Vedika AI Microservice",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy", "modules": [
        "speech", "transcription", "summarizer", "soap",
        "diagnosis", "ocr", "translation", "prescription",
        "chatbot", "embeddings"
    ]}
