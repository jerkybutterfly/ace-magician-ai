
import flask
import speech_recognition as sr
import pyttsx3
import time
import json

# --- TTS (Text-to-Speech) Setup ---
engine = pyttsx3.init()
voices = engine.getProperty('voices')
# Attempt to set a default voice, handling potential errors gracefully
if voices:
    engine.setProperty('voice', voices[0