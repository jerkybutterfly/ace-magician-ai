// exo bridge — distributed inference cluster (run models across multiple PCs on your LAN).
// Talks to the local exo node's OpenAI-compatible endpoint (default :52415).
import { getSettings } from './settings';

const EXO_KEY = 'exo-url';

export function getExoUrl(): string {
  try {
    return localStorage.getItem(EXO_KEY) || (getSettings() ? 'http://localhost:52415' : 'http://localhost:52415');
  } catch {
    return 'http://localhost:52415';
  }
}

export function setExoUrl(u: string) {
  try { localStorage.setItem(EXO_KEY, u); } catch {}
}

const agent = (p: string) => `${getSettings().agentUrl}${p}`;

async function j<T>(r: Response): Promise<T> {
  if (!r.ok) throw new Error(`${r.status}: ${await r.text().catch(() => r.statusText)}`);
  return r.json();
}

export interface ExoPeer {
  id: string;
  address: string;
  device?: string;
  memory_gb?: number;
  flops?: number;
  status?: 'online' | 'offline';
}

export interface ExoStatus {
  online: boolean;
  node_id?: string;
  peers: ExoPeer[];
  models?: string[];
  error?: string;
}

export async function exoInstall(): Promise<{ ok: boolean; log: string }> {
  return j(await fetch(agent('/exo/install'), { method: 'POST' }));
}

export async function exoStart(): Promise<{ ok: boolean; pid?: number; log: string }> {
  return j(await fetch(agent('/exo/start'), { method: 'POST' }));
}

export async function exoStop(): Promise<{ ok: boolean }> {
  return j(await fetch(agent('/exo/stop'), { method: 'POST' }));
}

export async function exoStatus(): Promise<ExoStatus> {
  try {
    const r = await fetch(`${getExoUrl()}/v1/topology`, { signal: AbortSignal.timeout(3000) });
    if (!r.ok) return { online: false, peers: [], error: `HTTP ${r.status}` };
    const data = await r.json();
    return {
      online: true,
      node_id: data.node_id,
      peers: data.peers || data.nodes || [],
      models: data.models,
    };
  } catch (e) {
    return { online: false, peers: [], error: (e as Error).message };
  }
}

export async function exoListModels(): Promise<string[]> {
  try {
    const r = await fetch(`${getExoUrl()}/v1/models`, { signal: AbortSignal.timeout(3000) });
    if (!r.ok) return [];
    const data = await r.json();
    return (data.data || []).map((m: { id: string }) => m.id);
  } catch { return []; }
}

export async function exoChat(model: string, prompt: string): Promise<string> {
  const r = await fetch(`${getExoUrl()}/v1/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      stream: false,
    }),
  });
  if (!r.ok) throw new Error(`Exo error ${r.status}: ${await r.text().catch(() => '')}`);
  const data = await r.json();
  return data.choices?.[0]?.message?.content ?? '';
}
