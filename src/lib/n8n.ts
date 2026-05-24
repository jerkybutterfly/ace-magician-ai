// n8n REST API client — talks directly to a self-hosted n8n from the browser.
// Configure URL + API key in /n8n Settings panel. Stored in localStorage.

const KEY = 'local-ai-n8n';

export interface N8nConfig {
  baseUrl: string;
  apiKey: string;
}

export function getN8nConfig(): N8nConfig {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { baseUrl: 'http://localhost:5678', apiKey: '' };
}

export function saveN8nConfig(cfg: N8nConfig) {
  localStorage.setItem(KEY, JSON.stringify(cfg));
}

async function call<T = any>(path: string, init: RequestInit = {}): Promise<T> {
  const { baseUrl, apiKey } = getN8nConfig();
  if (!baseUrl) throw new Error('n8n base URL not set');
  const url = `${baseUrl.replace(/\/$/, '')}/api/v1${path}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'X-N8N-API-KEY': apiKey,
      'Accept': 'application/json',
      ...(init.headers || {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`n8n ${res.status}: ${text || res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export interface N8nWorkflow {
  id: string;
  name: string;
  active: boolean;
  tags?: { id: string; name: string }[];
  updatedAt: string;
  createdAt: string;
}

export interface N8nExecution {
  id: string;
  workflowId: string;
  finished: boolean;
  mode: string;
  status?: string;
  startedAt: string;
  stoppedAt?: string;
}

export async function listWorkflows() {
  const r = await call<{ data: N8nWorkflow[] }>(`/workflows?limit=250`);
  return r.data || [];
}

export async function activateWorkflow(id: string) {
  return call(`/workflows/${id}/activate`, { method: 'POST' });
}

export async function deactivateWorkflow(id: string) {
  return call(`/workflows/${id}/deactivate`, { method: 'POST' });
}

export async function deleteWorkflow(id: string) {
  return call(`/workflows/${id}`, { method: 'DELETE' });
}

export async function listExecutions(workflowId?: string) {
  const q = workflowId ? `?workflowId=${workflowId}&limit=50` : `?limit=50`;
  const r = await call<{ data: N8nExecution[] }>(`/executions${q}`);
  return r.data || [];
}

export async function getExecution(id: string) {
  return call<N8nExecution & { data?: any }>(`/executions/${id}?includeData=true`);
}

export async function pingN8n() {
  // /workflows is the cheapest authenticated probe
  await call('/workflows?limit=1');
  return true;
}

/** Fire a webhook workflow by URL (no API key needed — webhooks are public on the n8n side) */
export async function triggerWebhook(webhookUrl: string, payload: any) {
  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload ?? {}),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`webhook ${res.status}: ${text}`);
  try { return JSON.parse(text); } catch { return text; }
}
