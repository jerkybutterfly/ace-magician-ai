// PYTHIA bridge — live world-state + forecasts engine (Osiris globe + MiroFish oracle on Ollama).
// Repo: https://github.com/jangles-byte/Pythia — engine API on :8088, Osiris globe on :3000.
// Setup commands go through the mini PC helper (/terminal); Windows-safe (no head/tail/ls).
import { getSettings } from './settings';

export const PYTHIA_PORT = 8088;
export const OSIRIS_PORT = 3000;
const DIR = '%USERPROFILE%\\.aiapp\\pythia';

async function sh(command: string, timeoutMs = 120_000) {
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
    return { ok: r.ok, stdout: (data.stdout ?? '') as string, stderr: (data.stderr ?? '') as string };
  } finally { clearTimeout(t); }
}

/** The mini PC's host, taken from the helper address in Settings. */
function host() {
  try { return new URL(getSettings().agentUrl).hostname || '127.0.0.1'; } catch { return '127.0.0.1'; }
}
export const engineUrl = () => `http://${host()}:${PYTHIA_PORT}`;
export const osirisUrl = () => `http://${host()}:${OSIRIS_PORT}`;

async function api<T>(path: string, init?: RequestInit, timeoutMs = 15_000): Promise<T> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const r = await fetch(`${engineUrl()}${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
      signal: ctrl.signal,
    });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return (await r.json()) as T;
  } finally { clearTimeout(t); }
}

export interface WorldEvent {
  id?: string; title?: string; name?: string; summary?: string; source?: string;
  lat?: number; lng?: number; lon?: number; salience?: number; url?: string; domain?: string;
}
export interface Prediction {
  id?: string; title?: string; claim?: string; text?: string; probability?: number;
  horizon?: string; reasoning?: string; lat?: number; lng?: number; region?: string;
}
export interface AgentView {
  summary?: string; domains?: string[]; event_count?: number;
  events_by_domain?: Record<string, WorldEvent[]>; predictions?: Prediction[];
}

export const pythia = {
  // --- setup on the mini PC ---
  checkTools: () => sh(`git --version & node --version & python --version & uv --version & bash --version & ollama --version`),
  installUv: () => sh(`powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"`, 300_000),
  install: () =>
    sh(
      `if not exist "%USERPROFILE%\\.aiapp" mkdir "%USERPROFILE%\\.aiapp" && ` +
      `if exist "${DIR}" (cd /d "${DIR}" && git pull) else (git clone --depth 1 https://github.com/jangles-byte/Pythia.git "${DIR}") && ` +
      `cd /d "${DIR}" && if not exist osiris (git clone --depth 1 https://github.com/simplifaisoul/osiris.git osiris) && ` +
      `xcopy /y /q integrations\\osiris\\*.tsx osiris\\src\\components\\ && cd osiris && npm install`,
      900_000,
    ),
  pullModel: () => sh(`ollama pull llama3.1`, 900_000),
  checkInstalled: () => sh(`if exist "${DIR}\\run-all.sh" (echo INSTALLED) else (echo NOT_INSTALLED)`),
  // run-all.sh needs bash — Git for Windows provides it.
  start: () => sh(`cd /d "${DIR}" && start "PYTHIA" /min bash -lc "./run-all.sh > pythia.log 2>&1" && timeout /t 15 /nobreak >nul && curl -s http://127.0.0.1:${PYTHIA_PORT}/links`, 180_000),
  stop: () => sh(`for /f "tokens=5" %a in ('netstat -ano ^| findstr ":${PYTHIA_PORT} :${OSIRIS_PORT}" ^| findstr LISTENING') do taskkill /f /pid %a`),
  logs: () => sh(`powershell -c "Get-Content '${DIR.replace('%USERPROFILE%', '$env:USERPROFILE')}\\pythia.log' -Tail 60"`),

  // --- engine API (CORS open) ---
  links: () => api<{ engine?: boolean; osiris?: boolean; oracle?: boolean; model?: string; prediction_count?: number }>('/links', undefined, 4000),
  view: () => api<AgentView>('/agent/view', undefined, 20_000),
  predictions: (horizon?: string) => api<{ predictions?: Prediction[] }>(`/predictions${horizon ? `?horizon=${horizon}` : ''}`),
  predict: () => api<{ status?: string }>('/predict', { method: 'POST' }),
  chat: (message: string) => api<{ answer?: string; persona?: string }>('/chat', { method: 'POST', body: JSON.stringify({ message, history: [] }) }, 120_000),
  whatif: (scenario: string) => api<{ narrative?: string; predictions?: Prediction[] }>('/whatif', { method: 'POST', body: JSON.stringify({ scenario }) }, 180_000),
};

// --- Free keyless feeds used directly when the PYTHIA engine isn't running ---
export interface MapPoint { lat: number; lng: number; title: string; kind: string; detail?: string; url?: string }

export async function fetchFallbackFeeds(): Promise<MapPoint[]> {
  const out: MapPoint[] = [];
  const [quakes, eonet] = await Promise.allSettled([
    fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson').then((r) => r.json()),
    fetch('https://eonet.gsfc.nasa.gov/api/v3/events?status=open&limit=150').then((r) => r.json()),
  ]);
  if (quakes.status === 'fulfilled') {
    for (const f of quakes.value.features ?? []) {
      const [lng, lat] = f.geometry.coordinates;
      out.push({ lat, lng, kind: 'earthquake', title: `M${f.properties.mag} ${f.properties.place ?? ''}`, url: f.properties.url });
    }
  }
  if (eonet.status === 'fulfilled') {
    for (const e of eonet.value.events ?? []) {
      const g = e.geometry?.[e.geometry.length - 1];
      if (!g || g.type !== 'Point') continue;
      out.push({ lat: g.coordinates[1], lng: g.coordinates[0], kind: (e.categories?.[0]?.title ?? 'disaster').toLowerCase(), title: e.title, url: e.sources?.[0]?.url });
    }
  }
  return out;
}

export function viewToPoints(v: AgentView): MapPoint[] {
  const out: MapPoint[] = [];
  for (const [domain, evs] of Object.entries(v.events_by_domain ?? {})) {
    for (const e of evs ?? []) {
      const lng = e.lng ?? e.lon;
      if (typeof e.lat !== 'number' || typeof lng !== 'number') continue;
      out.push({ lat: e.lat, lng, kind: domain, title: e.title ?? e.name ?? domain, detail: e.summary, url: e.url });
    }
  }
  for (const p of v.predictions ?? []) {
    if (typeof p.lat === 'number' && typeof p.lng === 'number') {
      out.push({ lat: p.lat, lng: p.lng, kind: 'forecast', title: p.title ?? p.claim ?? p.text ?? 'Forecast', detail: p.probability != null ? `${Math.round(p.probability * 100)}% · ${p.horizon ?? ''}` : undefined });
    }
  }
  return out;
}
