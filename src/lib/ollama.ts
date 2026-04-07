import { getSettings } from './settings';

export type LLMProvider = 'ollama' | 'cloud' | 'google' | 'lmstudio';

export const CLOUD_MODELS = [
  { value: 'google/gemini-3-flash-preview', label: 'Gemini 3 Flash (fast)' },
  { value: 'google/gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
  { value: 'google/gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
  { value: 'openai/gpt-5-mini', label: 'GPT-5 Mini' },
  { value: 'openai/gpt-5', label: 'GPT-5' },
];

export const GOOGLE_MODELS = [
  { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
  { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
  { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash' },
];
export interface OllamaModel {
  name: string;
  size: number;
  modified_at: string;
}

export async function fetchModels(): Promise<OllamaModel[]> {
  const { ollamaUrl } = getSettings();
  const res = await fetch(`${ollamaUrl}/api/tags`);
  if (!res.ok) throw new Error('Failed to fetch models');
  const data = await res.json();
  return data.models ?? [];
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface PullProgress {
  status: string;
  digest?: string;
  total?: number;
  completed?: number;
}

const RUNTIME_EXECUTION_PROMPT = `You are operating inside Pesto Steve's AI.

RUNTIME EXECUTION RULES
- This interface auto-executes these tags: [LIST_DIR:path], [READ_FILE:path], [WRITE_FILE:path|content], [RUN_CMD:command].
- For any request that can be advanced with local tools, respond with a short status line plus the required tags.
- Never tell the user to run commands manually.
- Never claim you lack access to local files, shell commands, or app launching on this PC.
- If a task depends on an external website, installer, or app, take the next concrete local step with tags instead of refusing.
- If a previous answer refused or over-explained, correct yourself by emitting tags now.
- When you receive [TOOL_RESULTS], analyze them and either continue with more tags or summarize briefly if the task is complete.`;

function getLatestObjective(messages: ChatMessage[]): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i];
    if (message.role !== 'user') continue;
    if (message.content.startsWith('[TOOL_RESULTS]')) continue;
    return message.content;
  }

  return '';
}

export async function* pullModel(modelName: string): AsyncGenerator<PullProgress> {
  const { ollamaUrl } = getSettings();
  const res = await fetch(`${ollamaUrl}/api/pull`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: modelName, stream: true }),
  });

  if (!res.ok) throw new Error(`Failed to pull model: ${res.statusText}`);
  const reader = res.body?.getReader();
  if (!reader) throw new Error('No response body');

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';
    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        yield JSON.parse(line);
      } catch {}
    }
  }
}

export async function deleteModel(modelName: string): Promise<void> {
  const { ollamaUrl } = getSettings();
  const res = await fetch(`${ollamaUrl}/api/delete`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: modelName }),
  });
  if (!res.ok) throw new Error(`Failed to delete model: ${res.statusText}`);
}

export async function* streamChat(
  model: string,
  messages: ChatMessage[],
): AsyncGenerator<string> {
  const { ollamaUrl, systemPrompt } = getSettings();
  const agentMemory = (await import('./memory')).getAgentMemory();
  const currentObjective = getLatestObjective(messages);
  const fullSystemPrompt = [
    systemPrompt.trim(),
    RUNTIME_EXECUTION_PROMPT,
    agentMemory ? `--- AGENT MEMORY ---\n${agentMemory}` : '',
    currentObjective ? `--- CURRENT OBJECTIVE ---\n${currentObjective}` : '',
  ]
    .filter(Boolean)
    .join('\n\n');
  const allMessages: ChatMessage[] = fullSystemPrompt
    ? [{ role: 'system', content: fullSystemPrompt }, ...messages]
    : messages;

  const res = await fetch(`${ollamaUrl}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, messages: allMessages, stream: true }),
  });

  if (!res.ok) throw new Error(`Ollama error: ${res.statusText}`);
  const reader = res.body?.getReader();
  if (!reader) throw new Error('No response body');

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';
    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        const json = JSON.parse(line);
        if (json.message?.content) yield json.message.content;
      } catch {}
    }
  }
}

export async function* streamCloudChat(
  model: string,
  messages: ChatMessage[],
): AsyncGenerator<string> {
  const { systemPrompt } = getSettings();
  const agentMemory = (await import('./memory')).getAgentMemory();
  const currentObjective = getLatestObjective(messages);
  const fullSystemPrompt = [
    systemPrompt.trim(),
    RUNTIME_EXECUTION_PROMPT,
    agentMemory ? `--- AGENT MEMORY ---\n${agentMemory}` : '',
    currentObjective ? `--- CURRENT OBJECTIVE ---\n${currentObjective}` : '',
  ]
    .filter(Boolean)
    .join('\n\n');

  const allMessages: ChatMessage[] = [
    { role: 'system', content: fullSystemPrompt },
    ...messages,
  ];

  const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

  const res = await fetch(CHAT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ model, messages: allMessages }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Cloud AI error: ${res.statusText}`);
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error('No response body');

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let newlineIndex: number;
    while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
      let line = buffer.slice(0, newlineIndex);
      buffer = buffer.slice(newlineIndex + 1);
      if (line.endsWith('\r')) line = line.slice(0, -1);
      if (line.startsWith(':') || line.trim() === '') continue;
      if (!line.startsWith('data: ')) continue;

      const jsonStr = line.slice(6).trim();
      if (jsonStr === '[DONE]') return;

      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) yield content;
      } catch {
        buffer = line + '\n' + buffer;
        break;
      }
    }
  }
}

export async function* streamGoogleChat(
  model: string,
  messages: ChatMessage[],
): AsyncGenerator<string> {
  const { systemPrompt } = getSettings();
  const agentMemory = (await import('./memory')).getAgentMemory();
  const currentObjective = getLatestObjective(messages);
  const fullSystemPrompt = [
    systemPrompt.trim(),
    RUNTIME_EXECUTION_PROMPT,
    agentMemory ? `--- AGENT MEMORY ---\n${agentMemory}` : '',
    currentObjective ? `--- CURRENT OBJECTIVE ---\n${currentObjective}` : '',
  ]
    .filter(Boolean)
    .join('\n\n');

  const allMessages: ChatMessage[] = [
    { role: 'system', content: fullSystemPrompt },
    ...messages,
  ];

  const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-google`;

  const res = await fetch(CHAT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ model, messages: allMessages }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Google AI error: ${res.statusText}`);
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error('No response body');

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let newlineIndex: number;
    while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
      let line = buffer.slice(0, newlineIndex);
      buffer = buffer.slice(newlineIndex + 1);
      if (line.endsWith('\r')) line = line.slice(0, -1);
      if (line.startsWith(':') || line.trim() === '') continue;
      if (!line.startsWith('data: ')) continue;

      const jsonStr = line.slice(6).trim();
      if (jsonStr === '[DONE]') return;

      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) yield content;
      } catch {
        buffer = line + '\n' + buffer;
        break;
      }
    }
  }
}
