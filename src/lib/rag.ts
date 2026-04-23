import { getSettings } from './settings';

const url = (p: string) => `${getSettings().agentUrl}${p}`;

export interface RagSource {
  id: number;
  path: string;
  recursive: boolean;
  doc_count: number;
  chunk_count: number;
  added_at: string;
}

export interface RagChunk {
  path: string;
  text: string;
  score: number;
  chunk_idx: number;
}

export interface IndexStatus {
  active: boolean;
  current_file: string | null;
  processed: number;
  total: number;
  source_id: number | null;
  error: string | null;
  embed_model_available: boolean;
}

export async function listRagSources(): Promise<RagSource[]> {
  const res = await fetch(url('/rag/sources'));
  if (!res.ok) throw new Error('Failed to list RAG sources');
  return res.json();
}

export async function addRagSource(path: string, recursive = true): Promise<RagSource> {
  const res = await fetch(url('/rag/sources'), {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path, recursive }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function deleteRagSource(id: number): Promise<void> {
  const res = await fetch(url(`/rag/sources/${id}`), { method: 'DELETE' });
  if (!res.ok) throw new Error(await res.text());
}

export async function reindexRagSource(id: number): Promise<void> {
  const res = await fetch(url(`/rag/reindex/${id}`), { method: 'POST' });
  if (!res.ok) throw new Error(await res.text());
}

export async function getIndexStatus(): Promise<IndexStatus> {
  const res = await fetch(url('/rag/index/status'));
  if (!res.ok) throw new Error('Failed to load index status');
  return res.json();
}

export async function ragQuery(query: string, top_k = 5): Promise<{ chunks: RagChunk[] }> {
  const res = await fetch(url('/rag/query'), {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, top_k }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

const RAG_AUGMENT_KEY = 'rag-auto-augment';

export function isRagAugmentEnabled(): boolean {
  return localStorage.getItem(RAG_AUGMENT_KEY) === 'true';
}

export function setRagAugmentEnabled(v: boolean): void {
  localStorage.setItem(RAG_AUGMENT_KEY, String(v));
}
