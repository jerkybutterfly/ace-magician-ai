"""
voice_service.py — Voice Assistant & Wake Word Service
Listens for a wake word, records user speech, and transcribes it using faster-whisper.
Sends transcribed text to the agent for processing.
"""
import threading
import time
import queue
import numpy as np
import sounddevice as sd
import soundfile as sf
import requests
import os
from pathlib import Path

# Try to import faster-whisper
try:
    from faster_whisper import WhisperModel
    WHISPER_AVAILABLE = True
except ImportError:
    WHISPER_AVAILABLE = False

# Try to import openwakeword
try:
    import openwakeword
    from openwakeword.model import Model
    OWW_AVAILABLE = True
except ImportError:
    OWW_AVAILABLE = False

AGENT_URL = "http://localhost:8484"
WAKE_WORD = "pesto" # Default wake word
SAMPLING_RATE = 16000
CHUNK_SIZE = 1280 # 80ms at 16kHz

class VoiceService:
    def __init__(self):
        global WHISPER_AVAILABLE, OWW_AVAILABLE
        self.running = False
        self.listening = False
        self.thread = None
        self.model = None
        self.oww_model = None
        self.audio_queue = queue.Queue()
        self.wake_word = WAKE_WORD
        
        # Load Whisper model (tiny for speed)
        if WHISPER_AVAILABLE:
            try:
                # Use CPU for maximum compatibility
                self.model = WhisperModel("tiny.en", device="cpu", compute_type="int8")
                print("✅ Whisper model loaded (tiny.en)")
            except Exception as e:
                print(f"❌ Failed to load Whisper: {e}")
                WHISPER_AVAILABLE = False

        # Load openWakeWord
        if OWW_AVAILABLE:
            try:
                self.oww_model = Model(wakeword_models=[self.wake_word])
                print(f"✅ Wake word model loaded for: {self.wake_word}")
            except Exception as e:
                print(f"❌ Failed to load openWakeWord: {e}")
                OWW_AVAILABLE = False

    def start(self):
        if self.running:
            return
        self.running = True
        self.thread = threading.Thread(target=self._run, daemon=True)
        self.thread.start()
        print("🎙️ Voice service started...")

    def stop(self):
        self.running = False
        if self.thread:
            self.thread.join(timeout=2)
        print("🛑 Voice service stopped.")

    def _audio_callback(self, indata, frames, time, status):
        if status:
            print(f"Audio error: {status}")
        self.audio_queue.put(indata.copy())

    def _play_notification(self, type="start"):
        """Simple beep sound using sounddevice."""
        try:
            duration = 0.15
            f = 440 if type == "start" else 330
            t = np.linspace(0, duration, int(SAMPLING_RATE * duration))
            wave = 0.2 * np.sin(2 * np.pi * f * t)
            sd.play(wave, SAMPLING_RATE)
            sd.wait()
        except:
            pass

    def _run(self):
        with sd.InputStream(samplerate=SAMPLING_RATE, channels=1, callback=self._audio_callback, blocksize=CHUNK_SIZE):
            print(f"👂 Listening for wake word: '{self.wake_word}'...")
            
            audio_buffer = []
            
            while self.running:
                try:
                    chunk = self.audio_queue.get(timeout=0.1)
                    audio_buffer.append(chunk)
                    
                    # Keep buffer around 2 seconds
                    if len(audio_buffer) > (SAMPLING_RATE // CHUNK_SIZE) * 2:
                        audio_buffer.pop(0)
                    
                    if OWW_AVAILABLE and self.oww_model:
                        # Process for wake word
                        prediction = self.oww_model.predict(chunk.flatten())
                        if prediction[self.wake_word] > 0.5:
                            print(f"⚡ Wake word detected: {self.wake_word}!")
                            self._handle_trigger()
                            audio_buffer = [] # Clear buffer after trigger
                    else:
                        # Fallback simple energy detection or just ignore if OWW not available
                        # In a real app, we'd want a better fallback
                        pass
                        
                except queue.Empty:
                    continue
                except Exception as e:
                    print(f"Voice service loop error: {e}")
                    time.sleep(1)

    def _handle_trigger(self):
        """Called when wake word is detected."""
        self._play_notification("start")
        print("🎤 Recording speech...")
        
        # Record for a fixed duration or until silence (simple version: 5 seconds)
        duration = 5
        recording = sd.rec(int(duration * SAMPLING_RATE), samplerate=SAMPLING_RATE, channels=1)
        sd.wait()
        self._play_notification("end")
        
        print("🧠 Transcribing...")
        try:
            if WHISPER_AVAILABLE and self.model:
                segments, info = self.model.transcribe(recording.flatten(), beam_size=5)
                transcript = " ".join([s.text for s in segments]).strip()
                
                if transcript:
                    print(f"📝 User said: \"{transcript}\"")
                    self._send_to_agent(transcript)
                else:
                    print("❓ No speech detected.")
            else:
                print("❌ Whisper not available for transcription.")
        except Exception as e:
            print(f"Transcription error: {e}")

    def _send_to_agent(self, text):
        """Send transcript to the main agent's chat endpoint."""
        try:
            resp = requests.post(
                f"{AGENT_URL}/llm/chat",
                json={"message": text, "stream": False},
                timeout=30
            )
            if resp.ok:
                data = resp.json()
                print(f"🤖 Agent: {data.get('response', '')[:100]}...")
                # Optionally use TTS here to reply back
            else:
                print(f"❌ Failed to send to agent: {resp.status_code}")
        except Exception as e:
            print(f"Error sending to agent: {e}")

# Global instance
_service = None

def get_service():
    global _service
    if _service is None:
        _service = VoiceService()
    return _service

if __name__ == "__main__":
    svc = get_service()
    svc.start()
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        svc.stop()
