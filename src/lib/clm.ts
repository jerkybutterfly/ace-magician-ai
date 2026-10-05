// CLM bridge — Contrastive Language Models (Contrastive-LM/CLM), a fast "System One" decision model.
//
// Two ways to run it:
//  - 'ollama'  → CPU/iGPU friendly. Works on the Ace Magician AM06 Pro (Ryzen + Radeon, no NVIDIA GPU).
//                clm-serve runs in a plain Python venv on Windows and uses Ollama's OpenAI-compatible
//                /v1/embeddings endpoint as its encoder. No WSL, no vLLM, no 16 GB download.
//  - 'vllm'    → needs Linux/WSL + an NVIDIA GPU (~18 GB VRAM). Fastest, serves Qwen3-8B embeddings.
//
// Encoder (vLLM path) runs on :8095 (beebots already owns :8090). Setup goes through the agent
// /terminal endpoint; questions go straight to the CLM API (started with --cors).
import { getSettings } from './settings';

export const CLM_PORT = 8700;
export const CLM_ENC_PORT = 8095;
export type ClmOs = 'windows' | 'linux';
export type ClmBackend = 'ollama' | 'vllm';

/** Default embedding model pulled into Ollama for the CPU backend. */
export const CLM_EMB_MODEL = 'nomic-embed-text';

async function sh(command: string, timeoutMs = 900_000) {
  const { agentUrl } = getSettings();
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const r = await fetch(`${agentUrl}/terminal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command }),
      signal: ctrl.signal,
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(data.stderr || `HTTP ${r.status}`);
    return { stdout: (data.stdout ?? '') as string, stderr: (data.stderr ?? '') as string };
  } finally { clearTimeout(t); }
}

// On the vLLM path Windows runs everything inside WSL (vLLM has no native Windows build).
const wrap = (os: ClmOs, script: string) =>
  os === 'windows' ? `wsl bash -lc "${script.replace(/"/g, '\\"')}"` : `bash -lc '${script.replace(/'/g, `'\\''`)}'`;

const VENV = '~/.aiapp/clm/.venv';
const ACT = `mkdir -p ~/.aiapp/clm && cd ~/.aiapp/clm && . ${VENV}/bin/activate`;

// ── Native Windows (CPU / Ollama backend) ──────────────────────────────────
const PS_DIR = '$env:USERPROFILE\\.aiapp\\clm';
const ps = (script: string) => `powershell -NoProfile -Command "${script.replace(/"/g, '\\"')}"`;
const PS_ACT = `if (!(Test-Path '${PS_DIR}')) { New-Item -ItemType Directory -Force -Path '${PS_DIR}' | Out-Null }; Set-Location '${PS_DIR}'; . '${PS_DIR}\\.venv\\Scripts\\Activate.ps1'`;

/** Ollama's OpenAI-compatible embeddings endpoint, as seen from the mini PC itself. */
function ollamaEmbUrl(): string {
  try {
    const u = new URL(getSettings().ollamaUrl);
    return `http://127.0.0.1:${u.port || '11434'}/v1/embeddings`;
  } catch { return 'http://127.0.0.1:11434/v1/embeddings'; }
}

export const clm = {
  url: () => {
    try { const u = new URL(getSettings().agentUrl); return `${u.protocol}//${u.hostname}:${CLM_PORT}`; }
    catch { return `http://localhost:${CLM_PORT}`; }
  },
  installWsl: () => sh('wsl --install -d Ubuntu --no-launch', 1800_000),

  checkTools: (os: ClmOs, backend: ClmBackend = 'vllm') =>
    backend === 'ollama'
      ? sh(os === 'windows'
          ? ps(`python --version; ollama --version; ollama list`)
          : wrap(os, 'python3 --version; ollama --version; ollama list'))
      : sh(wrap(os, 'python3 --version; nvidia-smi --query-gpu=name,memory.total --format=csv,noheader || echo NO_GPU')),

  install: (os: ClmOs, backend: ClmBackend = 'vllm') =>
    backend === 'ollama'
      ? sh(os === 'windows'
          ? ps(`if (!(Test-Path '${PS_DIR}')) { New-Item -ItemType Directory -Force -Path '${PS_DIR}' | Out-Null }; Set-Location '${PS_DIR}'; python -m venv .venv; . '${PS_DIR}\\.venv\\Scripts\\Activate.ps1'; python -m pip install --upgrade pip; python -m pip install contrastive-lm; ollama pull ${CLM_EMB_MODEL}; Write-Output installed`)
          : wrap(os, `mkdir -p ~/.aiapp/clm && cd ~/.aiapp/clm && (python3 -m venv .venv || (sudo apt-get update && sudo apt-get install -y python3-venv && python3 -m venv .venv)) && . .venv/bin/activate && pip install --upgrade pip && pip install contrastive-lm && ollama pull ${CLM_EMB_MODEL} && echo installed`),
          3600_000)
      : sh(wrap(os,
          `mkdir -p ~/.aiapp/clm && cd ~/.aiapp/clm && (python3 -m venv .venv || (sudo apt-get update && sudo apt-get install -y python3-venv && python3 -m venv .venv)) && . .venv/bin/activate && pip install --upgrade pip && pip install contrastive-lm huggingface_hub && echo installed`),
          3600_000),

  start: (os: ClmOs, backend: ClmBackend = 'vllm') =>
    backend === 'ollama'
      ? sh(os === 'windows'
          ? ps(`${PS_ACT}; Start-Process -WindowStyle Hidden -FilePath '${PS_DIR}\\.venv\\Scripts\\clm-serve.exe' -ArgumentList '--cors','--port','${CLM_PORT}','--emb-url','${ollamaEmbUrl()}','--emb-model','${CLM_EMB_MODEL}' -RedirectStandardOutput '${PS_DIR}\\clm.log' -RedirectStandardError '${PS_DIR}\\clm.err'; Start-Sleep 3; Write-Output started`)
          : wrap(os, `${ACT} && nohup clm-serve --cors --port ${CLM_PORT} --emb-url ${ollamaEmbUrl()} --emb-model ${CLM_EMB_MODEL} > clm.log 2>&1 & sleep 3; echo started`))
      : sh(wrap(os,
          `${ACT} && nohup vllm serve Qwen/Qwen3-8B --served-model-name qwen3-8b --runner pooling --max-model-len 2048 --port ${CLM_ENC_PORT} > enc.log 2>&1 & ` +
          `${ACT} && nohup clm-serve --cors --port ${CLM_PORT} --emb-url http://127.0.0.1:${CLM_ENC_PORT}/v1/embeddings > clm.log 2>&1 & sleep 3; echo started`)),

  stop: (os: ClmOs, backend: ClmBackend = 'vllm') =>
    backend === 'ollama' && os === 'windows'
      ? sh(ps(`Get-Process clm-serve -ErrorAction SilentlyContinue | Stop-Process -Force; Write-Output stopped`))
      : sh(wrap(os, `pkill -f 'vllm serve Qwen/Qwen3-8B'; pkill -f clm-serve; echo stopped`)),

  logs: (os: ClmOs, backend: ClmBackend = 'vllm') =>
    backend === 'ollama' && os === 'windows'
      ? sh(ps(`Get-Content '${PS_DIR}\\clm.log' -Tail 80 -ErrorAction SilentlyContinue; Write-Output -----; Get-Content '${PS_DIR}\\clm.err' -Tail 80 -ErrorAction SilentlyContinue`))
      : sh(wrap(os, 'cd ~/.aiapp/clm && tail -n 80 enc.log; echo ----- ; tail -n 80 clm.log')),

  health: async (): Promise<{ ok: boolean; embedder?: boolean; models?: string[] } | null> => {
    try {
      const r = await fetch(`${clm.url()}/health`, { signal: AbortSignal.timeout(4000) });
      return r.ok ? await r.json() : null;
    } catch { return null; }
  },
  ask: async (state: string, questions: Record<string, unknown>) => {
    const r = await fetch(`${clm.url()}/v1/systemone`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ state, questions }),
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(data.detail || `HTTP ${r.status}`);
    return data as { answers: Record<string, ClmAnswer> };
  },
  rank: async (context: string, question: string, answers: string[]) => {
    const r = await fetch(`${clm.url()}/v1/rank`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ context, question, answers }),
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(data.detail || `HTTP ${r.status}`);
    return data.ranked as { rank: number; candidate: string; prob: number }[];
  },
};

export interface ClmAnswer {
  type: 'noul' | 'choice' | 'score';
  noul?: number; choice?: string; score?: number; confidence?: number;
  probabilities?: Record<string, number>;
}
