// mem0 bridge — long-term semantic memory for the Hermes learning loop.
// Talks to the Python agent's /mem0/* endpoints (backed by mem0ai + Ollama embeddings).
import { getSettings } from './settings';

const url = (p: string) => `${getSettings().agentUrl}${p}`;

export interface Mem0Entry {
  id: string;
  memory: string;
  score?: number;
  metadata?: Record<string, unknown>;
  created_at?: string;
}

async function j<T>(r: Response): Promise<T> {
  if (!r.ok) throw new Error(`${r.status}: ${await r.text().catch(() => r.statusText)}`);
  return r.json();
}

export async function mem0Install(): Promise<{ ok: boolean; log: string }> {
  return j(await fetch(url('/mem0/install'), { method: 'POST' }));
}

export async function mem0Add(text: string, metadata?: Record<string, unknown>): Promise<Mem0Entry> {
  return j(await fetch(url('/mem0/add'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, metadata: metadata ?? {} }),
  }));
}

export async function mem0Search(query: string, limit = 8): Promise<Mem0Entry[]> {
  return j(await fetch(url('/mem0/search'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, limit }),
  }));
}

export async function mem0List(limit = 100): Promise<Mem0Entry[]> {
  return j(await fetch(url(`/mem0/list?limit=${limit}`)));
}

export async function mem0Delete(id: string): Promise<{ ok: boolean }> {
  return j(await fetch(url(`/mem0/${encodeURIComponent(id)}`), { method: 'DELETE' }));
}

export async function mem0Reset(): Promise<{ ok: boolean }> {
  return j(await fetch(url('/mem0/reset'), { method: 'POST' }));
}
