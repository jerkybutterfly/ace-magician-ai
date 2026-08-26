/**
 * Executive Summary Agent — Dynamic State Hydration & Pruning
 *
 * Every 10-15 steps in a complex task loop, this secondary agent:
 * 1. Compresses the active conversation history into a dense "State File"
 * 2. Purges raw history beyond the working window
 * 3. Re-injects only core mission objectives, current blockers, and latest variables
 *
 * This prevents context window clogging and maintains coherent multi-step reasoning.
 */

import { getSettings } from './settings';

// ── Types ──────────────────────────────────────────────────────────────

export interface StateSnapshot {
  id: string;
  timestamp: number;
  mission: string;
  objectives: string[];
  blockers: string[];
  variables: Record<string, string>;
  decisions: { step: number; decision: string; rationale: string }[];
  progress: number;  // 0-100 estimated completion
  compressed_history: string;
  raw_step_count: number;
  token_estimate: number;
}

export interface StateFile {
  current: StateSnapshot;
  history: StateSnapshot[];  // last N snapshots for rollback
  created_at: number;
  updated_at: number;
}

// ── Storage ────────────────────────────────────────────────────────────

const STATE_KEY = 'executive-summary-state-v1';
const COMPRESS_INTERVAL = 12;  // compress every N steps

function loadState(): StateFile {
  try {
    const raw = localStorage.getItem(STATE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {
    current: emptySnapshot(),
    history: [],
    created_at: Date.now(),
    updated_at: Date.now(),
  };
}

function saveState(state: StateFile): void {
  try {
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('State manager save failed:', e);
  }
}

function emptySnapshot(): StateSnapshot {
  return {
    id: `snap_${Date.now()}`,
    timestamp: Date.now(),
    mission: '',
    objectives: [],
    blockers: [],
    variables: {},
    decisions: [],
    progress: 0,
    compressed_history: '',
    raw_step_count: 0,
    token_estimate: 0,
  };
}

// ── LLM Helper ─────────────────────────────────────────────────────────

async function generateSummary(prompt: string): Promise<string> {
  const { generateText } = await import('./ollama');
  return generateText(prompt);
}

// ── Compression ────────────────────────────────────────────────────────

/**
 * Estimate token count from text (rough: 1 token ≈ 4 chars).
 */
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Compress conversation history into a dense executive summary.
 * This is the core of the state hydration system.
 */
export async function compressHistory(
  messages: { role: string; content: string }[],
  currentMission: string,
): Promise<StateSnapshot> {
  const state = loadState();
  const prev = state.current;

  // Build the compression prompt
  const conversationText = messages
    .slice(-30)  // last 30 messages max
    .map((m) => `${m.role}: ${m.content.slice(0, 1500)}`)
    .join('\n');

  const compressionPrompt = `You are an Executive Summary Agent. Compress this conversation into a structured state file.

CURRENT MISSION: ${currentMission || prev.mission || 'No active mission'}

PREVIOUS STATE:
${prev.compressed_history ? `Mission: ${prev.mission}\nProgress: ${prev.progress}%\nObjectives: ${prev.objectives.join('; ')}\nBlockers: ${prev.blockers.join('; ')}` : 'No previous state'}

CONVERSATION (last ${messages.length} messages):
${conversationText}

Extract and output EXACTLY in this format (no other text):

MISSION: <one-line mission objective>
PROGRESS: <0-100>
OBJECTIVES:
- <objective 1>
- <objective 2>
BLOCKERS:
- <blocker 1 or "None">
VARIABLES:
- <key>=<value>
DECISIONS:
- Step <N>: <decision> (because <rationale>)
COMPRESSED: <3-5 sentence summary of all key information, decisions, and state>

Keep it under 800 tokens. Be precise and actionable.`;

  try {
    const raw = await generateSummary(compressionPrompt);

    // Parse the compressed output
    const mission = extractField(raw, 'MISSION') || prev.mission;
    const progress = parseInt(extractField(raw, 'PROGRESS') || '0', 10) || prev.progress;
    const objectives = extractList(raw, 'OBJECTIVES');
    const blockers = extractList(raw, 'BLOCKERS');
    const variables = extractKeyValueList(raw, 'VARIABLES');
    const decisions = extractDecisions(raw);
    const compressed = extractField(raw, 'COMPRESSED') || '';

    const totalTokens = estimateTokens(compressed) +
      objectives.reduce((s, o) => s + estimateTokens(o), 0) +
      blockers.reduce((s, b) => s + estimateTokens(b), 0);

    const snapshot: StateSnapshot = {
      id: `snap_${Date.now()}`,
      timestamp: Date.now(),
      mission,
      objectives: objectives.length > 0 ? objectives : prev.objectives,
      blockers: blockers.length > 0 ? blockers : prev.blockers,
      variables: { ...prev.variables, ...variables },
      decisions: [...prev.decisions, ...decisions].slice(-20),
      progress: Math.max(prev.progress, progress),
      compressed_history: compressed,
      raw_step_count: messages.length,
      token_estimate: totalTokens,
    };

    // Save to history
    state.history.push(state.current);
    if (state.history.length > 10) state.history = state.history.slice(-10);
    state.current = snapshot;
    state.updated_at = Date.now();
    saveState(state);

    return snapshot;
  } catch (e) {
    console.error('Compression failed:', e);
    // Fallback: simple compression without LLM
    const simpleSummary = messages
      .slice(-10)
      .map((m) => `${m.role}: ${m.content.slice(0, 200)}`)
      .join('\n');

    const snapshot: StateSnapshot = {
      ...prev,
      id: `snap_${Date.now()}`,
      timestamp: Date.now(),
      compressed_history: simpleSummary,
      raw_step_count: messages.length,
      token_estimate: estimateTokens(simpleSummary),
    };

    state.history.push(state.current);
    state.current = snapshot;
    state.updated_at = Date.now();
    saveState(state);

    return snapshot;
  }
}

// ── Parsing Helpers ────────────────────────────────────────────────────

function extractField(text: string, field: string): string {
  const regex = new RegExp(`${field}:\\s*(.+)`, 'i');
  const match = text.match(regex);
  return match?.[1]?.trim() ?? '';
}

function extractList(text: string, field: string): string[] {
  const regex = new RegExp(`${field}:\\n((?:- .+\\n?)+)`, 'i');
  const match = text.match(regex);
  if (!match) return [];
  return match[1]
    .split('\n')
    .map((l) => l.replace(/^-\s*/, '').trim())
    .filter((l) => l && l !== 'None' && l !== 'none');
}

function extractKeyValueList(text: string, field: string): Record<string, string> {
  const list = extractList(text, field);
  const result: Record<string, string> = {};
  for (const item of list) {
    const eqIndex = item.indexOf('=');
    if (eqIndex > 0) {
      const key = item.slice(0, eqIndex).trim();
      const value = item.slice(eqIndex + 1).trim();
      result[key] = value;
    }
  }
  return result;
}

function extractDecisions(text: string): { step: number; decision: string; rationale: string }[] {
  const regex = /Step\s+(\d+):\s*(.+?)(?:\s*\(because\s*(.+?)\))?$/gm;
  const decisions: { step: number; decision: string; rationale: string }[] = [];
  let match;
  while ((match = regex.exec(text))) {
    decisions.push({
      step: parseInt(match[1], 10),
      decision: match[2].trim(),
      rationale: match[3]?.trim() ?? '',
    });
  }
  return decisions;
}

// ── Context Injection ──────────────────────────────────────────────────

/**
 * Build a compressed context block for injection into the LLM system prompt.
 * This replaces raw history with the executive summary.
 */
export function buildStateContext(): string {
  const state = loadState();
  const { current } = state;

  if (!current.mission && current.objectives.length === 0) {
    return '';
  }

  const parts: string[] = ['--- EXECUTIVE STATE SUMMARY ---'];

  if (current.mission) {
    parts.push(`Mission: ${current.mission}`);
  }
  parts.push(`Progress: ${current.progress}%`);

  if (current.objectives.length > 0) {
    parts.push(`Objectives:\n${current.objectives.map((o) => `• ${o}`).join('\n')}`);
  }

  if (current.blockers.length > 0) {
    parts.push(`Blockers:\n${current.blockers.map((b) => `⚠️ ${b}`).join('\n')}`);
  }

  if (Object.keys(current.variables).length > 0) {
    parts.push(`Variables:\n${Object.entries(current.variables).map(([k, v]) => `• ${k} = ${v}`).join('\n')}`);
  }

  if (current.compressed_history) {
    parts.push(`Context:\n${current.compressed_history}`);
  }

  parts.push(`(Last compressed: ${new Date(current.timestamp).toLocaleTimeString()}, ${current.raw_step_count} raw steps → ${current.token_estimate} tokens)`);

  return parts.join('\n');
}

/**
 * Should we compress now? Returns true if we've had enough new steps.
 */
export function shouldCompress(stepCount: number): boolean {
  const state = loadState();
  const stepsSinceLast = stepCount - state.current.raw_step_count;
  return stepsSinceLast >= COMPRESS_INTERVAL;
}

/**
 * Get current state for display/debugging.
 */
export function getCurrentState(): StateSnapshot {
  return loadState().current;
}

/**
 * Get state history for rollback.
 */
export function getStateHistory(): StateSnapshot[] {
  return loadState().history;
}

/**
 * Roll back to a previous state snapshot.
 */
export function rollbackState(snapshotId: string): boolean {
  const state = loadState();
  const idx = state.history.findIndex((s) => s.id === snapshotId);
  if (idx === -1) return false;

  const snapshot = state.history[idx];
  state.history = state.history.filter((_, i) => i !== idx);
  state.history.push(state.current);
  state.current = snapshot;
  state.updated_at = Date.now();
  saveState(state);
  return true;
}

/**
 * Reset state completely.
 */
export function resetState(): void {
  saveState({
    current: emptySnapshot(),
    history: [],
    created_at: Date.now(),
    updated_at: Date.now(),
  });
}

/**
 * Update mission directly (without compression).
 */
export function setMission(mission: string, objectives: string[] = []): void {
  const state = loadState();
  state.current.mission = mission;
  if (objectives.length > 0) state.current.objectives = objectives;
  state.updated_at = Date.now();
  saveState(state);
}

/**
 * Add a blocker.
 */
export function addBlocker(blocker: string): void {
  const state = loadState();
  if (!state.current.blockers.includes(blocker)) {
    state.current.blockers.push(blocker);
    state.updated_at = Date.now();
    saveState(state);
  }
}

/**
 * Remove a blocker (when resolved).
 */
export function resolveBlocker(blocker: string): void {
  const state = loadState();
  state.current.blockers = state.current.blockers.filter((b) => b !== blocker);
  state.updated_at = Date.now();
  saveState(state);
}

/**
 * Update a variable.
 */
export function setVariable(key: string, value: string): void {
  const state = loadState();
  state.current.variables[key] = value;
  state.updated_at = Date.now();
  saveState(state);
}
