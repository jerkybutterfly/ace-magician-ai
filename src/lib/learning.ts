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
 * Build the memory-injection block that goes into the system prompt.
 * - Lessons: full text (small file, always include)
 * - Episodes: top N keyword-matched past episodes for the current request
 */
export async function buildMemoryContext(currentRequest: string): Promise<string> {
  const [lessons, similar] = await Promise.all([
    getLessons(),
    searchEpisodes(currentRequest, 3),
  ]);

  const parts: string[] = [];

  if (lessons.trim()) {
    parts.push(`--- LESSONS LEARNED (apply these — they came from past mistakes) ---\n${lessons.trim()}`);
  }

  if (similar.length > 0) {
    const lines = similar.map((ep) => {
      const status = ep.outcome === 'success' ? '✅' : ep.outcome === 'denied' ? '🚫' : '⚠️';
      return `${status} [${ep.outcome}] ${ep.tag} — ${ep.summary.slice(0, 120)}`;
    });
    parts.push(`--- SIMILAR PAST ATTEMPTS (learn from these) ---\n${lines.join('\n')}`);
  }

  return parts.join('\n\n');
}
