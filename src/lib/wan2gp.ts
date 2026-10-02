// Wan2GP bridge — "Video Generation for the GPU Poor" (deepbeepmeep/Wan2GP).
// Gradio app (wgp.py) served on :7860, installed into ~/.aiapp/Wan2GP with its own venv.
// All commands run through the local agent /terminal endpoint.
import { getSettings } from './settings';

const REPO = 'https://github.com/deepbeepmeep/Wan2GP.git';
const DIR = '~/.aiapp/Wan2GP';
export const WAN2GP_PORT = 7860;

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
    return { ok: r.ok, stdout: (data.stdout ?? '') as string, stderr: (data.stderr ?? '') as string };
  } finally { clearTimeout(t); }
}

export type Wan2gpProfile = '1' | '2' | '3' | '4' | '5';

export const WAN2GP_PROFILES: { value: Wan2gpProfile; label: string }[] = [
  { value: '1', label: 'Profile 1 — HighRAM/HighVRAM (fastest, 48GB+ RAM)' },
  { value: '2', label: 'Profile 2 — HighRAM/LowVRAM (48GB+ RAM, small GPU)' },
  { value: '3', label: 'Profile 3 — LowRAM/HighVRAM (32GB RAM, 24GB VRAM)' },
  { value: '4', label: 'Profile 4 — LowRAM/LowVRAM (default, most PCs)' },
  { value: '5', label: 'Profile 5 — Minimum RAM (slowest, safest)' },
];

export interface Wan2gpOptions {
  profile: Wan2gpProfile;
  attention: 'sdpa' | 'sage' | 'sage2' | 'flash';
  compile: boolean;
  share: boolean;
}

export const wan2gp = {
  url: () => {
    try {
      const u = new URL(getSettings().agentUrl);
      return `${u.protocol}//${u.hostname}:${WAN2GP_PORT}`;
    } catch { return `http://localhost:${WAN2GP_PORT}`; }
  },

  install: () => sh(`
    mkdir -p ~/.aiapp && cd ~/.aiapp && \
    { [ -d Wan2GP/.git ] && cd Wan2GP && git pull || git clone ${REPO} Wan2GP && cd Wan2GP; } && \
    python3 -m venv .venv 2>/dev/null || python -m venv .venv; \
    . .venv/bin/activate 2>/dev/null || . .venv/Scripts/activate; \
    pip install --upgrade pip && \
    pip install torch torchvision --index-url https://download.pytorch.org/whl/cu124 && \
    pip install -r requirements.txt && echo installed`, 3600_000),

  start: (o: Wan2gpOptions) => {
    const flags = [
      `--profile ${o.profile}`,
      `--attention ${o.attention}`,
      o.compile ? '--compile' : '',
      o.share ? '--share' : '--listen',
      `--server-port ${WAN2GP_PORT}`,
    ].filter(Boolean).join(' ');
    return sh(`cd ${DIR} && { . .venv/bin/activate 2>/dev/null || . .venv/Scripts/activate; } && \
      nohup python wgp.py ${flags} > wan2gp.log 2>&1 & echo $! > wan2gp.pid; sleep 3; echo started`);
  },

  stop: () => sh(`kill $(cat ${DIR}/wan2gp.pid) 2>/dev/null; rm -f ${DIR}/wan2gp.pid; echo stopped`),

  update: () => sh(`cd ${DIR} && git pull && \
    { . .venv/bin/activate 2>/dev/null || . .venv/Scripts/activate; } && \
    pip install -r requirements.txt && echo updated`, 1800_000),

  status: async () => {
    const r = await sh(`ps -p $(cat ${DIR}/wan2gp.pid 2>/dev/null) -o pid=,etime=,cmd= 2>/dev/null`);
    const out = r.stdout.trim();
    return { running: out.length > 0, status: out };
  },

  logs: () => sh(`tail -200 ${DIR}/wan2gp.log 2>/dev/null`),

  outputs: async () => {
    const r = await sh(`ls -1t ${DIR}/outputs 2>/dev/null | head -30`);
    return r.stdout.split('\n').filter(Boolean);
  },
};
