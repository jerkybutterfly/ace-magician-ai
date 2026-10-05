// CLM bridge — Contrastive Language Models (Contrastive-LM/CLM), a fast "System One" decision model.
// Needs vLLM (Linux/WSL + NVIDIA GPU) serving Qwen3-8B embeddings, plus `clm-serve` on :8700.
// Encoder runs on :8095 (beebots already owns :8090). Setup goes through the agent /terminal endpoint;
// questions go straight to the CLM API (started with --cors).
import { getSettings } from './settings';

export const CLM_PORT = 8700;
export const CLM_ENC_PORT = 8095;
export type ClmOs = 'windows' | 'linux';

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

// On Windows everything runs inside WSL (vLLM has no native Windows build).
const wrap = (os: ClmOs, script: string) =>
  os === 'windows' ? `wsl bash -lc "${script.replace(/"/g, '\\"')}"` : `bash -lc '${script.replace(/'/g, `'\\''`)}'`;

const VENV = '~/.aiapp/clm/.venv';
const ACT = `mkdir -p ~/.aiapp/clm && cd ~/.aiapp/clm && . ${VENV}/bin/activate`;

export const clm = {
  url: () => {
    try { const u = new URL(getSettings().agentUrl); return `${u.protocol}//${u.hostname}:${CLM_PORT}`; }
    catch { return `http://localhost:${CLM_PORT}`; }
  },
  installWsl: () => sh('wsl --install -d Ubuntu --no-launch', 1800_000),
  checkTools: (os: ClmOs) => sh(wrap(os, 'python3 --version; nvidia-smi --query-gpu=name,memory.total --format=csv,noheader || echo NO_GPU')), 
  install: (os: ClmOs) => sh(wrap(os,
    `mkdir -p ~/.aiapp/clm && cd ~/.aiapp/clm && (python3 -m venv .venv || (sudo apt-get update && sudo apt-get install -y python3-venv && python3 -m venv .venv)) && . .venv/bin/activate && pip install --upgrade pip && pip install contrastive-lm huggingface_hub && echo installed`),
    3600_000),
  start: (os: ClmOs) => sh(wrap(os,
    `${ACT} && nohup vllm serve Qwen/Qwen3-8B --served-model-name qwen3-8b --runner pooling --max-model-len 2048 --port ${CLM_ENC_PORT} > enc.log 2>&1 & ` +
    `${ACT} && nohup clm-serve --cors --port ${CLM_PORT} --emb-url http://127.0.0.1:${CLM_ENC_PORT}/v1/embeddings > clm.log 2>&1 & sleep 3; echo started`)),
  stop: (os: ClmOs) => sh(wrap(os, `pkill -f 'vllm serve Qwen/Qwen3-8B'; pkill -f clm-serve; echo stopped`)),
  logs: (os: ClmOs) => sh(wrap(os, 'cd ~/.aiapp/clm && tail -n 80 enc.log; echo ----- ; tail -n 80 clm.log')),

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
