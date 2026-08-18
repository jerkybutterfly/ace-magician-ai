// Expert Router — MoE-style dispatch across separately-loaded local models.
// Classifies each prompt and streams from the best-fit expert, keeping a
// concurrency guard so two heavy models never run at once on this box.
import { getSettings, type Expert, type ExpertRole } from './settings';
import {
  streamChat,
  streamColibriChat,
  streamLMStudioChat,
  streamLlamaCppChat,
  streamOpencodeChat,
  type ChatMessage,
  type StreamChunk,
} from './ollama';

export type { Expert, ExpertRole };

const OVERRIDE_RE = /^\s*@(heavy|code|vision|fast|long)\b\s*/i;

/** `@code refactor this` → { role: 'code', stripped: 'refactor this' } */
export function parseRoleOverride(prompt: string): { role?: ExpertRole; stripped: string } {
  const m = prompt.match(OVERRIDE_RE);
  if (!m) return { stripped: prompt };
  const raw = m[1].toLowerCase();
  const role: ExpertRole = raw === 'long' ? 'long-context' : (raw as ExpertRole);
  return { role, stripped: prompt.slice(m[0].length) };
}

export function classifyExpertRole(prompt: string): ExpertRole {
  if (/\[(SCREENSHOT|DESKTOP_SCREENSHOT|OMNI_PARSE|GET_PAGE_HTML)\]/i.test(prompt)) return 'vision';
  const tokens = Math.ceil(prompt.length / 4);
  if (tokens > 16000) return 'long-context';
  const hasCode =
    /```/.test(prompt) ||
    /\b(function|import|class|def|async|await|const|let|var|return|=>)\b/.test(prompt) ||
    /\.(ts|tsx|js|jsx|py|go|rs|cpp|c|java|rb|swift|kt|sh|ps1)\b/i.test(prompt);
  if (hasCode) return 'code';
  if (tokens <= 40 && !/[.?!]\s+\S/.test(prompt)) return 'fast';
  return 'heavy';
}

function sortedExperts(): Expert[] {
  return [...getSettings().experts].sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
}

export function pickExpert(role: ExpertRole): Expert | null {
  const all = sortedExperts();
  return (
    all.find((e) => e.role === role) ??
    all.find((e) => e.role === 'heavy') ??
    all[0] ??
    null
  );
}

// Track heavy experts currently mid-stream so we don't blow the RAM budget.
const activeHeavy = new Set<string>();

function pickStreamer(e: Expert) {
  switch (e.provider) {
    case 'colibri':
      return streamColibriChat;
    case 'lmstudio':
      return streamLMStudioChat;
    case 'llamacpp':
      return streamLlamaCppChat;
    case 'opencode':
      return streamOpencodeChat;
    case 'ollama':
    default:
      return streamChat;
  }
}

export interface RouterPick {
  expert: Expert;
  role: ExpertRole;
  reason: string;
}

/**
 * Route a chat turn to the best-fit expert and stream its reply.
 * Falls back to a small always-on expert if the picked heavy model is already busy.
 */
export async function* streamViaRouter(
  messages: ChatMessage[],
  onPicked?: (pick: RouterPick) => void,
): AsyncGenerator<StreamChunk> {
  const last = [...messages]
    .reverse()
    .find((m) => m.role === 'user' && !m.content.startsWith('[TOOL_RESULTS]'));
  const prompt = last?.content ?? '';
  const { role: override, stripped } = parseRoleOverride(prompt);
  const role = override ?? classifyExpertRole(stripped);

  let expert = pickExpert(role);
  if (!expert) {
    throw new Error(
      'Router has no experts registered. Open Settings → Expert Router and add at least one model.',
    );
  }

  // Heavy-model concurrency guard (70/30 style split).
  const isHeavy = expert.ramGb >= 16 || expert.role === 'heavy';
  if (isHeavy && activeHeavy.size > 0 && !activeHeavy.has(expert.id)) {
    const fallback = sortedExperts().find((e) => e.alwaysOn && e.ramGb < 16 && e.id !== expert!.id);
    if (fallback) expert = fallback;
  }

  const reason = override ? `manual @${role}` : `auto → ${role}`;
  onPicked?.({ expert, role, reason });

  const forwarded = last
    ? messages.map((m) => (m === last ? { ...m, content: stripped } : m))
    : messages;

  const heavy = expert.ramGb >= 16 || expert.role === 'heavy';
  if (heavy) activeHeavy.add(expert.id);
  try {
    const streamer = pickStreamer(expert);
    for await (const chunk of streamer(expert.model, forwarded)) yield chunk;
  } finally {
    if (heavy) activeHeavy.delete(expert.id);
  }
}

export function newExpertId(): string {
  return `exp_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}
