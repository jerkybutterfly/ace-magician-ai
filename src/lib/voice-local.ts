// Local voice bridge: whisper.cpp (STT) + Piper (TTS) via the Python agent's /terminal endpoint.
// The agent host must have whisper.cpp built at ~/whisper.cpp and Piper installed as `piper`.
import { getSettings } from './settings';

async function runOnHost(cmd: string, timeoutMs = 120_000): Promise<{ ok: boolean; stdout: string; stderr: string }> {
  const { agentUrl } = getSettings();
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(`${agentUrl}/terminal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command: cmd }),
      signal: ctrl.signal,
    });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, stdout: data.stdout ?? '', stderr: data.stderr ?? '' };
  } finally {
    clearTimeout(t);
  }
}

const WHISPER_DIR = '~/whisper.cpp';
const DEFAULT_MODEL = 'ggml-base.en.bin';
const DEFAULT_VOICE = 'en_US-lessac-medium';

export async function checkVoiceStack() {
  const [w, p] = await Promise.all([
    runOnHost(`test -x ${WHISPER_DIR}/main && echo ok || echo missing`),
    runOnHost(`command -v piper >/dev/null && echo ok || echo missing`),
  ]);
  return {
    whisper: w.stdout.trim() === 'ok',
    piper: p.stdout.trim() === 'ok',
  };
}

/** Build & install whisper.cpp + Piper on the host (one-time). */
export async function installVoiceStack() {
  const script = [
    `git clone https://github.com/ggerganov/whisper.cpp ${WHISPER_DIR} 2>/dev/null || (cd ${WHISPER_DIR} && git pull)`,
    `cd ${WHISPER_DIR} && make -j`,
    `cd ${WHISPER_DIR} && bash ./models/download-ggml-model.sh base.en`,
    `pip install --user piper-tts || pipx install piper-tts`,
  ].join(' && ');
  return runOnHost(script, 600_000);
}

/** Transcribe a WAV file already on host disk. */
export async function transcribeFile(wavPath: string, model = DEFAULT_MODEL) {
  const cmd = `${WHISPER_DIR}/main -m ${WHISPER_DIR}/models/${model} -nt -f "${wavPath}" 2>/dev/null`;
  const r = await runOnHost(cmd, 300_000);
  return r.stdout.trim();
}

/** Synthesize text to a WAV file on the host, returning the path. */
export async function synthesize(text: string, voice = DEFAULT_VOICE, outPath = '/tmp/piper-out.wav') {
  const safe = text.replace(/"/g, '\\"');
  const cmd = `echo "${safe}" | piper --model ${voice} --output_file ${outPath}`;
  const r = await runOnHost(cmd, 120_000);
  return { path: outPath, ...r };
}
