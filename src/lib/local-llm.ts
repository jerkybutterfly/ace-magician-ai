import { getSettings } from './settings';
import type { ChatMessage, StreamChunk } from './ollama';

export interface LocalModel {
  name: string;
  size: number;
  loaded: boolean;
}

export interface LocalLLMStatus {
  available: boolean;
  loaded: string | null;
  n_ctx: number;
  n_gpu_layers: number;
  models_dir: string;
}

export interface LocalPullProgress {
  status: 'downloading' | 'done' | 'error';
  filename?: string;
  completed?: number;
  total?: number;
  error?: string;
}

function base() {
  return getSettings().agentUrl.replace(/\/$/, '');
}

export async function getLocalLLMStatus(): Promise<LocalLLMStatus> {
  const res = await fetch(`${base()}/llm/status`);
  if (!res.ok) throw new Error(`Agent error: ${res.status}`);
  return res.json();
}

export async function listLocalModels(): Promise<{ models: LocalModel[]; available: boolean; loaded: string | null }> {
  const res = await fetch(`${base()}/llm/models`);
  if (!res.ok) throw new Error(`Agent error: ${res.status}`);
  return res.json();
}

export interface LoadOptions {
  n_ctx?: number;
  n_gpu_layers?: number;
  n_threads?: number;
  n_batch?: number;
  flash_attn?: boolean;
  use_mmap?: boolean;
  use_mlock?: boolean;
}

export async function loadLocalModel(name: string, n_ctx = 4096, n_gpu_layers = 0, opts: LoadOptions = {}): Promise<void> {
  const res = await fetch(`${base()}/llm/load`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, n_ctx, n_gpu_layers, ...opts }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || `Load failed: ${res.status}`);
  }
}

export async function unloadLocalModel(): Promise<void> {
  await fetch(`${base()}/llm/unload`, { method: 'POST' });
}

export async function deleteLocalModel(name: string): Promise<void> {
  const res = await fetch(`${base()}/llm/models/${encodeURIComponent(name)}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
}

export interface ExternalModel {
  source: 'ollama' | 'lmstudio';
  path: string;
  name: string;
  display: string;
  size: number;
  imported: boolean;
}

export async function scanExternalModels(): Promise<{ models: ExternalModel[]; searched_dirs: string[] }> {
  const res = await fetch(`${base()}/llm/scan-external`);
  if (!res.ok) throw new Error(`Scan failed: ${res.status}`);
  return res.json();
}

export async function importExternalModel(
  path: string,
  name?: string,
  mode: 'symlink' | 'copy' = 'symlink',
): Promise<{ name: string; mode: string; fallback_reason?: string }> {
  const res = await fetch(`${base()}/llm/import`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path, name, mode }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || `Import failed: ${res.status}`);
  }
  return res.json();
}

export async function* pullLocalModel(url: string, filename?: string): AsyncGenerator<LocalPullProgress> {
  const res = await fetch(`${base()}/llm/pull`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, filename }),
  });
  if (!res.ok || !res.body) throw new Error(`Pull failed: ${res.status}`);
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let idx: number;
    while ((idx = buffer.indexOf('\n\n')) !== -1) {
      const block = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 2);
      for (const line of block.split('\n')) {
        if (!line.startsWith('data: ')) continue;
        const json = line.slice(6).trim();
        if (!json) continue;
        try {
          yield JSON.parse(json) as LocalPullProgress;
        } catch {}
      }
    }
  }
}

function getLatestObjective(messages: ChatMessage[]): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i];
    if (m.role !== 'user') continue;
    if (m.content.startsWith('[TOOL_RESULTS]')) continue;
    return m.content;
  }
  return '';
}

export async function* streamLocalChat(model: string, messages: ChatMessage[]): AsyncGenerator<StreamChunk> {
  const { systemPrompt } = getSettings();
  const { RUNTIME_EXECUTION_PROMPT } = await import('./ollama-prompt');
  const agentMemory = (await import('./memory')).getAgentMemory();
  const objective = getLatestObjective(messages);
  const memoryContext = objective ? await (await import('./learning')).buildMemoryContext(objective) : '';
  const fullSystemPrompt = [
    systemPrompt.trim(),
    RUNTIME_EXECUTION_PROMPT,
    agentMemory ? `--- AGENT MEMORY ---\n${agentMemory}` : '',
    memoryContext,
    objective ? `--- CURRENT OBJECTIVE ---\n${objective}` : '',
  ].filter(Boolean).join('\n\n');

  const allMessages: ChatMessage[] = [{ role: 'system', content: fullSystemPrompt }, ...messages];

  const res = await fetch(`${base()}/llm/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, messages: allMessages, stream: true }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || data.error || `Local LLM error: ${res.status}`);
  }
  if (!res.body) throw new Error('No response body');

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let nl: number;
    while ((nl = buffer.indexOf('\n')) !== -1) {
      let line = buffer.slice(0, nl);
      buffer = buffer.slice(nl + 1);
      if (line.endsWith('\r')) line = line.slice(0, -1);
      if (!line.startsWith('data: ')) continue;
      const json = line.slice(6).trim();
      if (json === '[DONE]') return;
      try {
        const parsed = JSON.parse(json);
        if (parsed.error) throw new Error(parsed.error);
        const delta = parsed.choices?.[0]?.delta;
        const chunk: StreamChunk = {};
        if (delta?.content) chunk.content = delta.content;
        if (delta?.reasoning_content) chunk.thinking = delta.reasoning_content;
        if (chunk.content || chunk.thinking) yield chunk;
      } catch (e) {
        if (e instanceof Error && e.message) throw e;
      }
    }
  }
}
