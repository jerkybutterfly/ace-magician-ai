// Detects repeated tool-call sequences across conversations and surfaces them
// as candidates for becoming reusable skills.

const STORAGE_KEY = 'skill-suggestions';
const SEEN_KEY = 'skill-detector-seen';

const TAG_PATTERNS = [
  /\[RUN_CMD:(.*?)\]/g,
  /\[BROWSER_NAVIGATE:(.*?)\]/g,
  /\[OPEN_URL:(.*?)\]/g,
  /\[WRITE_FILE:(.*?)\|([\s\S]*?)\]/g,
  /\[READ_FILE:(.*?)\]/g,
  /\[WEB_SEARCH:([\s\S]*?)\]/g,
  /\[WEB_FETCH:(.*?)\]/g,
  /\[DOWNLOAD:(.*?)\|(.*?)\]/g,
  /\[HTTP_REQUEST:(GET|POST|PUT|DELETE|PATCH)\|(.*?)(?:\|([\s\S]*?))?\]/g,
];

export interface ToolCall {
  tag: string;
  args: string[];
}

export interface SkillSuggestion {
  id: string;
  signature: string;
  occurrences: number;
  template: string;
  rawSequence: ToolCall[];
  firstSeen: number;
  lastSeen: number;
  dismissed?: boolean;
  saved?: boolean;
}

export function extractToolCalls(text: string): ToolCall[] {
  const calls: ToolCall[] = [];
  const found: { index: number; call: ToolCall }[] = [];
  for (const pattern of TAG_PATTERNS) {
    const re = new RegExp(pattern.source, pattern.flags);
    let m: RegExpExecArray | null;
    while ((m = re.exec(text))) {
      const tag = m[0].split(':')[0].replace('[', '');
      found.push({ index: m.index, call: { tag, args: m.slice(1).filter(Boolean) } });
    }
  }
  found.sort((a, b) => a.index - b.index);
  return found.map((f) => f.call);
}

function signatureFor(calls: ToolCall[]): string {
  return calls.map((c) => c.tag).join('→');
}

function templateFor(calls: ToolCall[]): string {
  let argIdx = 0;
  return calls
    .map((c) => {
      const placeholders = c.args.map(() => `{{arg${++argIdx}}}`);
      return `[${c.tag}:${placeholders.join('|')}]`;
    })
    .join('\n');
}

export function getSuggestions(): SkillSuggestion[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveSuggestions(list: SkillSuggestion[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

interface SeenEntry {
  signature: string;
  count: number;
  sample: ToolCall[];
  firstSeen: number;
  lastSeen: number;
}

function getSeen(): SeenEntry[] {
  try {
    const raw = localStorage.getItem(SEEN_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveSeen(list: SeenEntry[]): void {
  localStorage.setItem(SEEN_KEY, JSON.stringify(list.slice(-100)));
}

/**
 * Records a sequence of tool calls. If the same signature has been seen at
 * least twice, returns a SkillSuggestion ready to surface to the user.
 */
export function recordSequence(text: string): SkillSuggestion | null {
  const calls = extractToolCalls(text);
  if (calls.length < 2) return null;
  const sig = signatureFor(calls);
  const now = Date.now();

  const seen = getSeen();
  const existing = seen.find((s) => s.signature === sig);
  if (existing) {
    existing.count++;
    existing.lastSeen = now;
  } else {
    seen.push({ signature: sig, count: 1, sample: calls, firstSeen: now, lastSeen: now });
  }
  saveSeen(seen);

  const entry = seen.find((s) => s.signature === sig)!;
  if (entry.count < 2) return null;

  // Don't re-surface ones the user already dismissed/saved.
  const suggestions = getSuggestions();
  const prior = suggestions.find((s) => s.signature === sig);
  if (prior?.dismissed || prior?.saved) return null;
  if (prior) {
    prior.occurrences = entry.count;
    prior.lastSeen = now;
    saveSuggestions(suggestions);
    return prior;
  }

  const suggestion: SkillSuggestion = {
    id: typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function' 
      ? crypto.randomUUID() 
      : Date.now().toString(36) + Math.random().toString(36).substring(2),
    signature: sig,
    occurrences: entry.count,
    template: templateFor(entry.sample),
    rawSequence: entry.sample,
    firstSeen: entry.firstSeen,
    lastSeen: now,
  };
  suggestions.push(suggestion);
  saveSuggestions(suggestions);
  return suggestion;
}

export function dismissSuggestion(id: string): void {
  const list = getSuggestions();
  const item = list.find((s) => s.id === id);
  if (item) {
    item.dismissed = true;
    saveSuggestions(list);
  }
}

export function markSaved(id: string): void {
  const list = getSuggestions();
  const item = list.find((s) => s.id === id);
  if (item) {
    item.saved = true;
    saveSuggestions(list);
  }
}

export function generateSkillCode(name: string, suggestion: SkillSuggestion): string {
  const argCount = suggestion.rawSequence.reduce((n, c) => n + c.args.length, 0);
  const argDocs = Array.from({ length: argCount }, (_, i) => `    arg${i + 1}: positional argument`).join('\n');
  const lines: string[] = [
    '#!/usr/bin/env python3',
    `"""Auto-generated skill: ${name}`,
    '',
    'Generated from a repeated tool-call sequence detected by the agent.',
    'Tool sequence:',
    ...suggestion.rawSequence.map((c) => `  - [${c.tag}]`),
    '',
    'Arguments:',
    argDocs || '    (no arguments)',
    '"""',
    'import sys',
    'import argparse',
    '',
    'def main():',
    `    parser = argparse.ArgumentParser(description=${JSON.stringify(name)})`,
    ...Array.from({ length: argCount }, (_, i) => `    parser.add_argument("arg${i + 1}", help="positional argument ${i + 1}")`),
    '    args = parser.parse_args()',
    '',
    '    # TODO: Re-implement this sequence in Python.',
    '    # Original tool tags below for reference:',
    ...suggestion.rawSequence.map((c) => `    # [${c.tag}:${c.args.join('|')}]`),
    '',
    `    print("Running ${name} with", vars(args))`,
    '',
    'if __name__ == "__main__":',
    '    main()',
    '',
  ];
  return lines.join('\n');
}
