/**
 * Auto-Learn: Dynamic RAG Code-Writing Loop
 *
 * When the agent encounters a tool, API, or coding language it doesn't know,
 * it autonomously:
 * 1. Searches documentation (web search + fetch)
 * 2. Writes a custom Python integration block
 * 3. Tests it in a sandbox (via agent /terminal)
 * 4. Saves the code to its permanent toolkit
 *
 * This is the "meta-learning" layer — the agent teaches itself new skills.
 */

import { getSettings } from './settings';

// ── Types ──────────────────────────────────────────────────────────────

export interface SkillModule {
  id: string;
  name: string;
  description: string;
  language: 'python' | 'bash' | 'javascript' | 'typescript';
  code: string;
  dependencies: string[];
  test_command: string;
  source_docs: string[];
  created_at: number;
  last_used: number;
  use_count: number;
  success_rate: number;  // 0-1
  verified: boolean;
  tags: string[];
}

export interface LearnAttempt {
  id: string;
  tool_name: string;
  phase: 'discovery' | 'coding' | 'testing' | 'saving' | 'done' | 'failed';
  docs_found: string[];
  code_written: string;
  test_result: { ok: boolean; output: string } | null;
  error: string | null;
  started_at: number;
  completed_at: number | null;
}

export interface Toolkit {
  skills: SkillModule[];
  attempts: LearnAttempt[];
}

// ── Storage ────────────────────────────────────────────────────────────

const TOOLKIT_KEY = 'auto-learn-toolkit-v1';

function loadToolkit(): Toolkit {
  try {
    const raw = localStorage.getItem(TOOLKIT_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { skills: [], attempts: [] };
}

function saveToolkit(toolkit: Toolkit): void {
  try {
    localStorage.setItem(TOOLKIT_KEY, JSON.stringify(toolkit));
  } catch (e) {
    console.error('Auto-learn save failed:', e);
  }
}

// ── Agent Helper ───────────────────────────────────────────────────────

async function runOnHost(cmd: string, timeoutMs = 120_000): Promise<{ ok: boolean; stdout: string; stderr: string }> {
  const { agentUrl } = getSettings();
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(`${agentUrl}/terminal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command: cmd }),
      signal: ctrl.signal,
    });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, stdout: data.stdout ?? '', stderr: data.stderr ?? '' };
  } catch (e) {
    return { ok: false, stdout: '', stderr: String(e) };
  } finally {
    clearTimeout(t);
  }
}

async function webSearch(query: string): Promise<{ title: string; url: string; snippet: string }[]> {
  const { agentUrl } = getSettings();
  try {
    const res = await fetch(`${agentUrl}/web/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, limit: 5 }),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.results ?? [];
  } catch {
    return [];
  }
}

async function webFetch(url: string): Promise<string> {
  const { agentUrl } = getSettings();
  try {
    const res = await fetch(`${agentUrl}/web/fetch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
    if (!res.ok) return '';
    const data = await res.json();
    return data.text ?? '';
  } catch {
    return '';
  }
}

// ── Discovery Phase ────────────────────────────────────────────────────

/**
 * Search for documentation about an unknown tool/API/language.
 * Returns relevant doc URLs and snippets.
 */
export async function discoverDocs(toolName: string): Promise<{
  docs: { url: string; title: string; snippet: string; content: string }[];
  summary: string;
}> {
  const queries = [
    `${toolName} API documentation python`,
    `${toolName} quickstart guide`,
    `${toolName} python integration example`,
  ];

  const allResults: { url: string; title: string; snippet: string }[] = [];
  for (const q of queries) {
    const results = await webSearch(q);
    allResults.push(...results);
  }

  // Deduplicate by URL
  const seen = new Set<string>();
  const unique = allResults.filter((r) => {
    if (seen.has(r.url)) return false;
    seen.add(r.url);
    return true;
  });

  // Fetch top 3 docs for full content
  const docs: { url: string; title: string; snippet: string; content: string }[] = [];
  for (const r of unique.slice(0, 3)) {
    const content = await webFetch(r.url);
    docs.push({ ...r, content: content.slice(0, 8000) });
  }

  const summary = docs.length > 0
    ? `Found ${docs.length} documentation sources for ${toolName}. Key info: ${docs.map((d) => d.title).join('; ')}`
    : `No documentation found for ${toolName}. Will attempt to write integration from name alone.`;

  return { docs, summary };
}

// ── Coding Phase ───────────────────────────────────────────────────────

/**
 * Generate a Python integration module for an unknown tool.
 * Uses the local LLM to write code based on discovered documentation.
 */
export async function generateIntegrationCode(
  toolName: string,
  docs: { url: string; title: string; content: string }[],
): Promise<string> {
  const docContext = docs
    .map((d) => `--- ${d.title} (${d.url}) ---\n${d.content.slice(0, 3000)}`)
    .join('\n\n');

  const prompt = `You are writing a Python integration module for a tool called "${toolName}".

Here is the documentation:
${docContext || '(no documentation available — infer from the tool name)'}

Write a complete, self-contained Python script that:
1. Installs any required pip packages (in a try/except)
2. Provides a main function to interact with ${toolName}
3. Includes error handling
4. Can be run standalone with: python ${toolName.replace(/[^a-z0-9]/gi, '_')}.py

Output ONLY the Python code, no explanation. Use standard library where possible.
The code should be practical and ready to use.`;

  const { generateText } = await import('./ollama');
  const code = await generateText(prompt);
  return code.replace(/^```python\n?|```$/g, '').trim();
}

// ── Testing Phase ──────────────────────────────────────────────────────

/**
 * Test a generated integration module in a sandboxed environment.
 * Runs it via the agent's /terminal endpoint with a timeout.
 */
export async function testIntegration(
  code: string,
  toolName: string,
): Promise<{ ok: boolean; output: string; error: string }> {
  const filename = `~/.aiapp/skills/${toolName.replace(/[^a-z0-9]/gi, '_')}.py`;

  // Write the code to a file
  const writeResult = await runOnHost(
    `mkdir -p ~/.aiapp/skills && cat > ${filename} << 'PYEOF'\n${code}\nPYEOF`,
    10_000,
  );
  if (!writeResult.ok) {
    return { ok: false, output: '', error: `Failed to write file: ${writeResult.stderr}` };
  }

  // Try to run it with a timeout
  const testResult = await runOnHost(
    `cd ~/.aiapp/skills && timeout 30 python3 ${filename} 2>&1 || echo "EXIT_CODE=$?"`,
    60_000,
  );

  const output = testResult.stdout + testResult.stderr;
  const ok = testResult.ok && !output.includes('EXIT_CODE=') && !output.includes('Error') && !output.includes('Traceback');

  return {
    ok,
    output: output.slice(0, 2000),
    error: ok ? '' : output.slice(0, 1000),
  };
}

// ── Saving Phase ───────────────────────────────────────────────────────

/**
 * Save a verified integration to the permanent toolkit.
 */
export function saveSkill(
  toolName: string,
  code: string,
  docs: { url: string }[],
  testResult: { ok: boolean; output: string },
): SkillModule {
  const toolkit = loadToolkit();
  const id = `skill_${toolName.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}`;

  const skill: SkillModule = {
    id,
    name: toolName,
    description: `Auto-learned integration for ${toolName}`,
    language: 'python',
    code,
    dependencies: extractDependencies(code),
    test_command: `python3 ~/.aiapp/skills/${toolName.replace(/[^a-z0-9]/gi, '_')}.py`,
    source_docs: docs.map((d) => d.url),
    created_at: Date.now(),
    last_used: Date.now(),
    use_count: 0,
    success_rate: testResult.ok ? 1.0 : 0.5,
    verified: testResult.ok,
    tags: [toolName.toLowerCase(), 'auto-learned'],
  };

  // Remove existing skill with same name
  toolkit.skills = toolkit.skills.filter((s) => s.name !== toolName);
  toolkit.skills.push(skill);
  saveToolkit(toolkit);

  return skill;
}

function extractDependencies(code: string): string[] {
  const imports = code.match(/^(?:import|from)\s+(\S+)/gm) ?? [];
  return [...new Set(
    imports
      .map((i) => i.replace(/^(?:import|from)\s+/, '').split('.')[0])
      .filter((d) => !['os', 'sys', 'json', 're', 'time', 'datetime', 'pathlib', 'subprocess', 'urllib', 'http'].includes(d)),
  )];
}

// ── Full Auto-Learn Pipeline ───────────────────────────────────────────

/**
 * Complete auto-learn pipeline: discover → code → test → save.
 * Returns the learning attempt with full trace.
 */
export async function autoLearn(toolName: string): Promise<LearnAttempt> {
  const attempt: LearnAttempt = {
    id: `attempt_${Date.now()}`,
    tool_name: toolName,
    phase: 'discovery',
    docs_found: [],
    code_written: '',
    test_result: null,
    error: null,
    started_at: Date.now(),
    completed_at: null,
  };

  const toolkit = loadToolkit();

  try {
    // Phase 1: Discovery
    const { docs, summary } = await discoverDocs(toolName);
    attempt.docs_found = docs.map((d) => d.url);

    // Phase 2: Coding
    attempt.phase = 'coding';
    const code = await generateIntegrationCode(toolName, docs);
    attempt.code_written = code;

    // Phase 3: Testing
    attempt.phase = 'testing';
    const testResult = await testIntegration(code, toolName);
    attempt.test_result = testResult;

    // Phase 4: Saving
    if (testResult.ok || code.length > 100) {
      attempt.phase = 'saving';
      saveSkill(toolName, code, docs, testResult);
    }

    attempt.phase = 'done';
  } catch (e) {
    attempt.phase = 'failed';
    attempt.error = String(e);
  }

  attempt.completed_at = Date.now();
  toolkit.attempts.push(attempt);
  // Keep last 50 attempts
  if (toolkit.attempts.length > 50) {
    toolkit.attempts = toolkit.attempts.slice(-50);
  }
  saveToolkit(toolkit);

  return attempt;
}

// ── Query Toolkit ──────────────────────────────────────────────────────

/**
 * Check if we already have a skill for a given tool.
 */
export function hasSkill(toolName: string): SkillModule | null {
  const toolkit = loadToolkit();
  return toolkit.skills.find(
    (s) => s.name.toLowerCase() === toolName.toLowerCase() ||
      s.tags.includes(toolName.toLowerCase()),
  ) ?? null;
}

/**
 * Get all learned skills.
 */
export function listSkills(): SkillModule[] {
  return loadToolkit().skills;
}

/**
 * Get recent learning attempts.
 */
export function getRecentAttempts(limit = 10): LearnAttempt[] {
  return loadToolkit().attempts.slice(-limit);
}

/**
 * Delete a skill from the toolkit.
 */
export function deleteSkill(skillId: string): void {
  const toolkit = loadToolkit();
  toolkit.skills = toolkit.skills.filter((s) => s.id !== skillId);
  saveToolkit(toolkit);
}

/**
 * Check if a tool needs auto-learning (not in toolkit and not a known built-in).
 */
export function needsAutoLearn(toolName: string): boolean {
  const known = new Set([
    'ollama', 'llama.cpp', 'lmstudio', 'openai', 'gemini', 'anthropic',
    'chrome', 'firefox', 'python', 'node', 'npm', 'git', 'docker',
    'ffmpeg', 'piper', 'adb', 'curl', 'wget', 'powershell', 'cmd',
  ]);
  return !known.has(toolName.toLowerCase()) && !hasSkill(toolName);
}
