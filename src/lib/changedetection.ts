// changedetection.io bridge — runs on the AM06 host (Windows-safe commands).
// Repo: https://github.com/dgtlmoon/changedetection.io
// Watches web pages and flags when they change (price drops, restocks, news).
import { getSettings } from './settings';

const PORT = 5050; // avoid 5000 (commonly taken); beebots=8090, clm=8700/8095
const DATA_DIR = '%USERPROFILE%\\.aiapp\\changedetection-data';
const KEY_STORAGE = 'changedetection-api-key';

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

export const getApiKey = () => localStorage.getItem(KEY_STORAGE) || '';
export const setApiKey = (k: string) => localStorage.setItem(KEY_STORAGE, k.trim());

const BASE = `http://127.0.0.1:${PORT}`;

// API calls go through the agent with curl to avoid browser CORS issues.
function api(method: string, path: string, body?: object) {
  const key = getApiKey();
  const auth = key ? `-H "x-api-key: ${key}"` : '';
  const data = body ? `-H "Content-Type: application/json" -d "${JSON.stringify(body).replace(/"/g, '\\"')}"` : '';
  return sh(`curl -s -X ${method} ${auth} ${data} "${BASE}${path}"`);
}

export interface Watch {
  uuid: string;
  url: string;
  title?: string;
  last_changed?: number;
  last_checked?: number;
  last_error?: string | false;
  viewed?: boolean;
}

export const changeDetection = {
  port: PORT,
  baseUrl: BASE,
  webUi: BASE,

  checkPython: () => sh(`py --version && py -m pip --version`),
  checkInstalled: () => sh(`py -m pip show changedetection-io 2>nul | findstr /C:"Version" || echo NOT_INSTALLED`),

  install: () =>
    sh(`py -m pip install --upgrade changedetection-io && py -m pip show changedetection-io | findstr /C:"Version"`, 600_000),

  start: () =>
    sh(`if not exist "${DATA_DIR}" mkdir "${DATA_DIR}" && start "changedetection" /min py -m changedetection.io -d "${DATA_DIR}" -p ${PORT} && timeout /t 5 /nobreak >nul && curl -s -o nul -w "HTTP %{http_code}" ${BASE}`),

  stop: () =>
    sh(`for /f "tokens=5" %a in ('netstat -ano ^| findstr :${PORT} ^| findstr LISTENING') do taskkill /F /PID %a`),

  status: () => sh(`curl -s -o nul -w "%{http_code}" ${BASE} || echo DOWN`),

  // ---- REST API (needs the API key from the changedetection Settings page) ----
  listWatches: async (): Promise<Record<string, Watch>> => {
    const r = await api('GET', '/api/v1/watch');
    try { return JSON.parse(r.stdout || '{}'); } catch { return {}; }
  },
  addWatch: (url: string, tag?: string) =>
    api('POST', '/api/v1/watch', { url, ...(tag ? { tag } : {}) }),
  recheck: (uuid: string) => api('POST', `/api/v1/watch/${uuid}?recheck=1`),
  recheckAll: () => api('POST', '/api/v1/watch?recheck_all=1'),
  removeWatch: (uuid: string) => api('DELETE', `/api/v1/watch/${uuid}`),
  history: async (uuid: string): Promise<Record<string, string>> => {
    const r = await api('GET', `/api/v1/watch/${uuid}/history`);
    try { return JSON.parse(r.stdout || '{}'); } catch { return {}; }
  },
  snapshot: (uuid: string, timestamp?: string) =>
    api('GET', `/api/v1/watch/${uuid}/history/${timestamp || 'latest'}`),
};
