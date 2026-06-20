/**
 * Hermes-style learning client.
 * Talks to the Python agent's /memory/* endpoints to log episodes (action history)
 * and lessons (short corrective rules learned from past mistakes).
 *
 * Storage lives on the PC at ~/.pesto-ai/memory/ — survives browser clears.
 */
import { getSettings } from './settings';

export type EpisodeOutcome = 'success' | 'error' | 'denied' | 'blocked';

export interface Episode {
  ts: string;
  request: string;
  tag: string;
  tool: string;
  outcome: EpisodeOutcome;
  summary: string;
}

const memUrl = (path: string) => `${getSettings().agentUrl}${path}`;

async function safeFetch(input: RequestInfo, init?: RequestInit): Promise<Response | null> {
  try {
    return await fetch(input, init);
  } catch {
    return null;
  }
}

export async function logEpisode(ep: {
  request: string;
  tag: string;
  tool: string;
  outcome: EpisodeOutcome;
  summary: string;
}): Promise<void> {
  await safeFetch(memUrl('/memory/episodes'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(ep),
  });
}

export async function getEpisodes(limit = 200): Promise<Episode[]> {
  const res = await safeFetch(memUrl(`/memory/episodes?limit=${limit}`));
  if (!res?.ok) return [];
  const data = await res.json().catch(() => ({ episodes: [] }));
  return data.episodes ?? [];
}

export async function clearEpisodes(): Promise<void> {
  await safeFetch(memUrl('/memory/episodes'), { method: 'DELETE' });
}

export async function searchEpisodes(query: string, limit = 5): Promise<Episode[]> {
  if (!query.trim()) return [];
  const res = await safeFetch(memUrl(`/memory/episodes/search?q=${encodeURIComponent(query)}&limit=${limit}`));
  if (!res?.ok) return [];
  const data = await res.json().catch(() => ({ matches: [] }));
  return data.matches ?? [];
}

export async function recentEpisodesForTool(tool: string, limit = 3): Promise<Episode[]> {
  if (!tool.trim()) return [];
  const res = await safeFetch(memUrl(`/memory/episodes/recent?tool=${encodeURIComponent(tool)}&limit=${limit}`));
  if (!res?.ok) return [];
  const data = await res.json().catch(() => ({ matches: [] }));
  return data.matches ?? [];
}

export async function recordLesson(text: string, sourceTag = '', sourceError = ''): Promise<void> {
  if (!text.trim()) return;
  await safeFetch(memUrl('/memory/lessons'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, source_tag: sourceTag, source_error: sourceError }),
  });
}

export async function getLessons(): Promise<string> {
  const res = await safeFetch(memUrl('/memory/lessons'));
  if (!res?.ok) return '';
  const data = await res.json().catch(() => ({ content: '' }));
  return data.content ?? '';
}

export async function overwriteLessons(content: string): Promise<void> {
  await safeFetch(memUrl('/memory/lessons'), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  });
}

// ─── User profile (auto-grown "about you") ──────────────────────────
export async function getProfile(): Promise<string> {
  const res = await safeFetch(memUrl('/memory/profile'));
  if (!res?.ok) return '';
  const data = await res.json().catch(() => ({ content: '' }));
  return data.content ?? '';
}

export async function overwriteProfile(content: string): Promise<void> {
  await safeFetch(memUrl('/memory/profile'), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  });
}

export async function clearProfile(): Promise<void> {
  await safeFetch(memUrl('/memory/profile'), { method: 'DELETE' });
}

const PROFILE_MAX_LINES = 200;

async function appendProfileLines(newLines: string[]): Promise<void> {
  if (!newLines.length) return;
  const current = await getProfile();
  const existing = new Set(current.split('\n').map(l => l.trim()).filter(Boolean));
  const additions = newLines.map(l => l.trim()).filter(l => l && !existing.has(l));
  if (!additions.length) return;
  const merged = [...current.split('\n').filter(l => l.trim()), ...additions];
  const trimmed = merged.slice(-PROFILE_MAX_LINES).join('\n');
  await overwriteProfile(trimmed);
}

// ─── Chat-turn learning ─────────────────────────────────────────────
export async function logChatTurn(userMsg: string, assistantMsg: string): Promise<void> {
  await logEpisode({
    request: userMsg.slice(0, 500),
    tag: '[CHAT]',
    tool: 'chat',
    outcome: 'success',
    summary: assistantMsg.slice(0, 400),
  });
}

export async function reflectChatTurn(userMsg: string, assistantMsg: string): Promise<void> {
  if (!userMsg.trim() || userMsg.trim().length < 3 || userMsg.trim().startsWith('/')) return;
  const { generateText } = await import('./ollama');
  const prompt = `You are extracting a single generalized rule the assistant should remember for future similar requests.

USER ASKED:
${userMsg.slice(0, 800)}

ASSISTANT REPLIED:
${assistantMsg.slice(0, 800)}

Write ONE short sentence starting with "Always", "Never", or "When" — a rule that would improve future answers to similar requests. If nothing useful can be generalized, reply with exactly: NONE
Reply with the single sentence and nothing else.`;
  try {
    const out = (await generateText(prompt)).trim().split('\n')[0].replace(/^["']|["']$/g, '').trim();
    if (!out || /^none\b/i.test(out)) return;
    if (out.length < 10 || out.length > 240) return;
    await recordLesson(out, '[CHAT]', '');
  } catch (e) {
    console.error('reflectChatTurn failed:', e);
  }
}

export async function updateProfileFromTurn(userMsg: string, assistantMsg: string): Promise<void> {
  if (!userMsg.trim() || userMsg.trim().length < 3 || userMsg.trim().startsWith('/')) return;
  const { generateText } = await import('./ollama');
  const prompt = `Extract STABLE facts about the USER from this conversation turn (name, role, preferences, tools, projects, locations, recurring habits, goals). Ignore one-off questions and ephemeral details.

USER:
${userMsg.slice(0, 800)}

ASSISTANT:
${assistantMsg.slice(0, 400)}

Reply with bullet lines, each starting with "- " (e.g. "- prefers dark mode", "- works on AM06 mini PC"). One fact per line, max 5 lines. If no stable facts can be extracted, reply with exactly: NONE`;
  try {
    const out = (await generateText(prompt)).trim();
    if (!out || /^none\b/i.test(out)) return;
    const lines = out.split('\n')
      .map(l => l.trim())
      .filter(l => l.startsWith('- ') && l.length > 4 && l.length < 200)
      .slice(0, 5);
    if (!lines.length) return;
    await appendProfileLines(lines);
  } catch (e) {
    console.error('updateProfileFromTurn failed:', e);
  }
}

export async function clearLessons(): Promise<void> {
  await safeFetch(memUrl('/memory/lessons'), { method: 'DELETE' });
}

/**
 * Auto-reflect: derive a short one-line lesson from a failed/denied tag.
 * No LLM call here — uses the error text directly. The agent itself
 * can still write richer lessons later via [WRITE_FILE] if it wants.
 */
export function deriveLesson(tag: string, outcome: EpisodeOutcome, errorOrSummary: string): string {
  const tool = tag.replace(/^\[/, '').split(/[:\]]/, 1)[0];
  const trimmed = errorOrSummary.replace(/\s+/g, ' ').slice(0, 180);
  switch (outcome) {
    case 'denied':
      return `${tool}: user denied this exact tag. Suggest an alternative approach before re-emitting.`;
    case 'blocked':
      return `${tool}: blocked by permissions. Reason: ${trimmed}. Adjust strategy or ask user to allow.`;
    case 'error':
      return `${tool}: failed. ${trimmed}. Next time, verify preconditions or use a different approach.`;
    default:
      return `${tool}: ${trimmed}`;
  }
}

/**
 * True Hermes-style reflection: calls the local LLM to reflect on a failure
 * and deduce a generalized rule to avoid it in the future.
 */
export async function llmReflectLesson(
  request: string,
  tag: string,
  outcome: EpisodeOutcome,
  summary: string,
): Promise<void> {
  const { generateText } = await import('./ollama');
  
  const prompt = `
You are evaluating a failed action from an autonomous PC agent.
User Request: "${request}"
Action Attempted: \`${tag}\`
Outcome: ${outcome}
Error/Summary: ${summary}

Reflect on this failure. What is the fundamental root cause, and what precise, generalized lesson must the system remember to avoid making this exact same mistake in the future?
Respond with ONLY ONE SHORT SENTENCE that begins with a clear directive (e.g. "Always verify...", "Never use...", "When doing X, ensure Y..."). Do not include any other text, reasoning, or markdown.
  `.trim();

  try {
    const reflection = await generateText(prompt);
    if (reflection && reflection.trim()) {
      // Clean up any extra quotes or newlines
      const cleanLesson = reflection.replace(/^["']|["']$/g, '').trim().split('\\n')[0];
      await recordLesson(cleanLesson, tag, summary);
    } else {
      // Fallback to naive
      const fallback = deriveLesson(tag, outcome, summary);
      await recordLesson(fallback, tag, summary);
    }
  } catch (err) {
    console.error('LLM reflection failed:', err);
    const fallback = deriveLesson(tag, outcome, summary);
    await recordLesson(fallback, tag, summary);
  }
}

/** Guess which tool the request is most likely to invoke, for per-tool memory injection. */
function predictTool(req: string): string | null {
  const t = req.toLowerCase();
  if (/\b(open|launch|start|run|install|execute|cmd|powershell)\b/.test(t)) return 'RUN_CMD';
  if (/\b(write|create|save).*(file|to)\b/.test(t)) return 'WRITE_FILE';
  if (/\b(read|show|cat|open).*(file)\b/.test(t)) return 'READ_FILE';
  if (/\b(list|ls|dir|show).*(folder|directory|files)\b/.test(t)) return 'LIST_DIR';
  if (/\b(search|google|find online|web|news|latest|today)\b/.test(t)) return 'WEB_SEARCH';
  if (/\b(fetch|download|http|api|url|browse|visit)\b/.test(t)) return 'WEB_FETCH';
  if (/\b(click|fill|type|form|button)\b/.test(t)) return 'CLICK';
  if (/\b(screenshot|page text|html)\b/.test(t)) return 'SCREENSHOT';
  if (/\b(network|scan|wifi|devices)\b/.test(t)) return 'SCAN_NETWORK';
  if (/\b(mqtt|publish|home assistant)\b/.test(t)) return 'MQTT_PUBLISH';
  if (/\b(phone|battery|camera|gps)\b/.test(t)) return 'PHONE_INFO';
  if (/\b(notify|notification|alert)\b/.test(t)) return 'NOTIFY';
  return null;
}

/**
 * Build the memory-injection block that goes into the system prompt.
 * - Lessons: full text (small file, always include — server promotes hit≥5 to [CORE])
 * - Semantically similar past episodes (embedding-ranked when available)
 * - Recent episodes for the predicted tool — direct prior art for the likely action
 */
export async function buildMemoryContext(currentRequest: string): Promise<string> {
  const predicted = predictTool(currentRequest);
  const [lessons, similar, toolHistory, profile] = await Promise.all([
    getLessons(),
    searchEpisodes(currentRequest, 3),
    predicted ? recentEpisodesForTool(predicted, 3) : Promise.resolve<Episode[]>([]),
    getProfile(),
  ]);

  const parts: string[] = [];

  if (profile.trim()) {
    parts.push(`--- ABOUT THE USER (learned from past chats) ---\n${profile.trim()}`);
  }

  if (lessons.trim()) {
    parts.push(`--- LESSONS LEARNED (apply these — they came from past mistakes) ---\n${lessons.trim()}`);
  }

  const seen = new Set<string>();
  const renderEp = (ep: Episode) => {
    const status = ep.outcome === 'success' ? '✅' : ep.outcome === 'denied' ? '🚫' : '⚠️';
    return `${status} [${ep.outcome}] ${ep.tag} — ${ep.summary.slice(0, 120)}`;
  };

  if (similar.length > 0) {
    const lines: string[] = [];
    for (const ep of similar) {
      const key = `${ep.tag}|${ep.outcome}`;
      if (seen.has(key)) continue;
      seen.add(key);
      lines.push(renderEp(ep));
    }
    if (lines.length) parts.push(`--- SIMILAR PAST ATTEMPTS (learn from these) ---\n${lines.join('\n')}`);
  }

  if (toolHistory.length > 0) {
    const lines: string[] = [];
    for (const ep of toolHistory) {
      const key = `${ep.tag}|${ep.outcome}`;
      if (seen.has(key)) continue;
      seen.add(key);
      lines.push(renderEp(ep));
    }
    if (lines.length) parts.push(`--- RECENT ${predicted} USES (last ${lines.length}) ---\n${lines.join('\n')}`);
  }

  return parts.join('\n\n');
}
