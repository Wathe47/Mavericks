from fastapi import FastAPI, File, UploadFile, requests
from typing import List, Any
import sys
import os
from faster_whisper import WhisperModel
import tempfile
import subprocess
from dotenv import load_dotenv
load_dotenv()
import numpy as np
import requests

# Add the path to import using_trained.py
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from predict_dementia import predict_from_input
from config import add_cors_middleware
from schemas import PredictionRequest


async def transcribe_local(wav_file):

   """
   Transcribe audio file using local Whisper model.
   Args:
       wav_file (str): Path to the WAV file to transcribe.
   Returns:
       dict: Transcription result containing the text.
   Raises:
       Exception: If transcription fails or if the file format is unsupported.
   """

   model = WhisperModel("medium", compute_type="int8")
   segments, _ = model.transcribe(wav_file, word_timestamps=True)

   words = []
   for segment in segments:
      words.extend(segment.words)

   transcript = []
   pause_threshold = 0.7  # seconds
   for i, word in enumerate(words):
      transcript.append(word.word)
      if i < len(words) - 1:
         gap = words[i + 1].start - word.end
         if gap >= pause_threshold:
               transcript.append(f"[pause {gap:.1f}s]")

   final_transcript = " ".join(transcript)
   print(f"Final transcript: {final_transcript}")
   return {"transcript": final_transcript}
 

async def transcribe_azure(wav_file):

   """
      Transcribe audio file using Azure Speech service.
   Args:
       wav_file (str): Path to the WAV file to transcribe.
   Returns:
       dict: Transcription result containing the text.
   Raises:
       Exception: If transcription fails or if the file format is unsupported.
   """

   speech_key = os.getenv("AZURE_SPEECH_KEY1")
   speech_region = os.getenv("AZURE_SPEECH_REGION")
   endpoint = os.getenv("AZURE_SPEECH_ENDPOINT")
   
   if not speech_key or not speech_region or not endpoint:
      print("Azure Speech service credentials are not set in environment variables.")
      raise ValueError("Azure Speech service credentials are not set in environment variables.")

   if not os.path.exists(wav_file):
      print(f"The file {wav_file} does not exist.")
      raise FileNotFoundError(f"The file {wav_file} does not exist.")
   
   if not wav_file.endswith(".wav"):
      print(f"The file {wav_file} is not a WAV file.")
      raise ValueError("The file must be a WAV file.")

   headers = {
      "Ocp-Apim-Subscription-Key": speech_key,
      "Content-Type": "audio/wav",
      "Accept": "application/json",
   }
   
   params = {
      "language": "en-US",
   }

   with open(wav_file, "rb") as audio_file:
      response = requests.post(endpoint, headers=headers, params=params, data=audio_file)
      if response.status_code != 200:
         raise Exception(f"Azure Speech API error: {response.status_code} - {response.text}") 

   data = response.json()
   if "DisplayText" not in data:
      raise Exception("Azure Speech API did not return a valid transcript")

   transcript = data["DisplayText"]
   print(f"Final transcript: {transcript}")
   return {"transcript": transcript}
