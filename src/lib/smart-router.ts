/**
 * Smart Router + Speed Optimizer
 *
 * - classifyRequest: picks task complexity (simple | code | reasoning | tool)
 * - pickModel: chooses best available model for the task from a candidate pool
 * - truncateHistory: keeps prompt size sane so first-token latency stays low
 * - tunedOllamaOptions / tunedLMStudioOptions: per-task sampling/speed knobs
 * - warmModel: pre-loads a model into Ollama so first reply is instant
 */

import { getSettings } from './settings';

export type TaskKind = 'simple' | 'code' | 'reasoning' | 'tool';

const CODE_HINTS = /```|\b(function|class|def |const |let |var |import |npm |pip |python|node|tsx|jsx|regex|stack ?trace|error:|exception)\b/i;
const REASONING_HINTS = /\b(why|explain|analy[sz]e|compare|design|architect|plan|strategi[sz]e|prove|debate|trade[- ]off|step[- ]by[- ]step)\b/i;
const TOOL_HINTS = /\b(open|launch|start|run|install|download|click|fill|type|navigate|browse|visit|go to|read|write|create|delete|move|copy|search files|list dir|screenshot|kill|notify|mqtt|wifi|ip|process)\b|[A-Za-z]:\\/i;
const SIMPLE_HINTS = /^(hi|hey|hello|yo|sup|thanks|thank you|ok|okay|cool|nice|lol|good morning|good night|gn|gm)\b/i;

export function classifyRequest(text: string): TaskKind {
  const t = text.trim();
  if (!t) return 'simple';
  if (t.length < 60 && SIMPLE_HINTS.test(t)) return 'simple';
  if (TOOL_HINTS.test(t)) return 'tool';
  if (CODE_HINTS.test(t)) return 'code';
  if (REASONING_HINTS.test(t) || t.length > 280) return 'reasoning';
  return 'simple';
}

/** Score model name by likely strength for a task. Higher = better fit. */
function scoreModel(name: string, task: TaskKind): number {
  const n = name.toLowerCase();
  let score = 0;

  // Generic size hints
  const sizeMatch = n.match(/(\d+(?:\.\d+)?)\s*b\b/);
  const billions = sizeMatch ? parseFloat(sizeMatch[1]) : 0;

  if (task === 'simple') {
    // Prefer small, fast models
    score += billions > 0 ? Math.max(0, 10 - billions) : 5;
    if (/lite|mini|nano|flash|tiny|small|1b|2b|3b/.test(n)) score += 5;
  } else if (task === 'code') {
    if (/code|coder|qwen.*code|deepseek|starcoder/.test(n)) score += 10;
    score += Math.min(billions, 14); // bigger is usually better, capped
  } else if (task === 'reasoning') {
    if (/reason|think|r1|qwq|o1|pro|gpt-5(?!-)|gemini-3-pro|gemini-2\.5-pro/.test(n)) score += 10;
    score += Math.min(billions, 30);
  } else if (task === 'tool') {
    // Tool use: instruction-following matters more than raw size
    if (/instruct|gemma|llama.*3|qwen.*2\.5|mistral/.test(n)) score += 6;
    if (/flash|mini|fast/.test(n)) score += 3; // speed helps in tool loops
    score += Math.min(billions, 8);
  }

  return score;
}

export function pickModel(available: string[], task: TaskKind, fallback: string): string {
  if (!available || available.length === 0) return fallback;
  const ranked = [...available]
    .map((m) => ({ m, s: scoreModel(m, task) }))
    .sort((a, b) => b.s - a.s);
  return ranked[0]?.m ?? fallback;
}

/**
 * Trim long histories to keep prompts small.
 * Always preserves the first system message + the last `keepTurns` turns.
 */
export function truncateHistory<T extends { role: string; content: string }>(
  messages: T[],
  keepTurns = 12,
  maxCharsPerMessage = 8000,
): T[] {
  if (messages.length <= keepTurns + 1) return messages.map(clip);
  const head: T[] = [];
  const first = messages[0];
  if (first?.role === 'system') head.push(clip(first));
  const tail = messages.slice(-keepTurns).map(clip);
  return [...head, ...tail];

  function clip(m: T): T {
    if (m.content.length <= maxCharsPerMessage) return m;
    return { ...m, content: m.content.slice(0, maxCharsPerMessage) + '\n…[truncated]' };
  }
}

/** Ollama `options` block tuned per task kind. Faster + sharper than defaults. */
export function tunedOllamaOptions(task: TaskKind): Record<string, unknown> {
  const base = {
    num_ctx: 4096,
    num_batch: 512,
    repeat_penalty: 1.1,
  };
  switch (task) {
    case 'simple':
      return { ...base, temperature: 0.4, top_p: 0.9, num_predict: 256 };
    case 'code':
      return { ...base, num_ctx: 8192, temperature: 0.2, top_p: 0.95, num_predict: 1024 };
    case 'reasoning':
      return { ...base, num_ctx: 8192, temperature: 0.5, top_p: 0.95, num_predict: 1536 };
    case 'tool':
      return { ...base, temperature: 0.3, top_p: 0.9, num_predict: 768 };
  }
}

/** OpenAI-compatible (LM Studio / Cloud) sampling tuned per task. */
export function tunedSamplingParams(task: TaskKind): Record<string, unknown> {
  switch (task) {
    case 'simple':
      return { temperature: 0.4, top_p: 0.9, max_tokens: 256 };
    case 'code':
      return { temperature: 0.2, top_p: 0.95, max_tokens: 1024 };
    case 'reasoning':
      return { temperature: 0.5, top_p: 0.95, max_tokens: 1536 };
    case 'tool':
      return { temperature: 0.3, top_p: 0.9, max_tokens: 768 };
  }
}

/** Pre-load a model on Ollama so the first user request streams instantly. */
export async function warmOllamaModel(model: string): Promise<void> {
  if (!model) return;
  try {
    const { ollamaUrl } = getSettings();
    await fetch(`${ollamaUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // Empty prompt + keep_alive triggers a load without generating tokens.
      body: JSON.stringify({ model, prompt: '', keep_alive: '30m' }),
    });
  } catch {
    /* ignore — Ollama may be offline */
  }
}

const ROUTER_KEY = 'smart-router-enabled';

export function isSmartRouterEnabled(): boolean {
  try {
    const v = localStorage.getItem(ROUTER_KEY);
    return v === null ? true : v === '1';
  } catch {
    return true;
  }
}

export function setSmartRouterEnabled(on: boolean): void {
  try {
    localStorage.setItem(ROUTER_KEY, on ? '1' : '0');
  } catch {}
}
