// Ultron voice bridge — browser Web Speech API (STT) + SpeechSynthesis (TTS).
// No backend required. Falls back gracefully when APIs are missing.

type Recognition = any;

export interface VoiceHandlers {
  onTranscript: (text: string) => void;
  onStatus?: (s: "idle" | "listening" | "error", detail?: string) => void;
}

export function createRecognizer(handlers: VoiceHandlers): Recognition | null {
  const Ctor =
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition;
  if (!Ctor) return null;
  const rec: Recognition = new Ctor();
  rec.continuous = true;
  rec.interimResults = false;
  rec.lang = "en-US";

  rec.onresult = (e: any) => {
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const r = e.results[i];
      if (r.isFinal) {
        const text = String(r[0]?.transcript || "").trim();
        if (text) handlers.onTranscript(text);
      }
    }
  };
  rec.onerror = (e: any) => handlers.onStatus?.("error", String(e?.error || "unknown"));
  rec.onend = () => handlers.onStatus?.("idle");
  rec.onstart = () => handlers.onStatus?.("listening");
  return rec;
}

let cachedVoice: SpeechSynthesisVoice | null = null;
function pickVoice(): SpeechSynthesisVoice | null {
  if (!("speechSynthesis" in window)) return null;
  if (cachedVoice) return cachedVoice;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  // Prefer a deep/male English voice for Ultron vibes.
  const preferred =
    voices.find((v) => /en-GB.*(male|Daniel|Oliver|Google UK English Male)/i.test(`${v.lang} ${v.name}`)) ||
    voices.find((v) => /Male/i.test(v.name) && /en/i.test(v.lang)) ||
    voices.find((v) => /en-GB/i.test(v.lang)) ||
    voices.find((v) => /^en/i.test(v.lang)) ||
    voices[0];
  cachedVoice = preferred || null;
  return cachedVoice;
}

export function speak(text: string) {
  if (!("speechSynthesis" in window)) return;
  const clean = text.replace(/```[\s\S]*?```/g, " code block ").slice(0, 800);
  if (!clean.trim()) return;
  const utter = new SpeechSynthesisUtterance(clean);
  const v = pickVoice();
  if (v) utter.voice = v;
  utter.rate = 0.98;
  utter.pitch = 0.75;
  utter.volume = 1;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utter);
}

export function stopSpeaking() {
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
}

export function primeVoices() {
  if (!("speechSynthesis" in window)) return;
  // Some browsers load voices asynchronously.
  window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    cachedVoice = null;
    pickVoice();
  };
}
