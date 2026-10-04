// Ruflo bridge — ruflo (github.com/ruvnet/ruflo) provides swarm coordination,
// shared memory and 300+ MCP tools. Instead of Claude Code / Codex, the "brain"
// here is this app's own local model (Ollama), and ruflo is only used for
// coordination + memory via its CLI on the mini PC (agent /terminal endpoint).
import { getSettings } from './settings';
import { streamChat, fetchModels, type ChatMessage } from './ollama';
import { upsertServer, getServers } from './mcp';

export const RUFLO_DIR = '%USERPROFILE%\\.aiapp\\ruflo';
export const RUFLO_MCP_PORT = 3010;
const RF = 'npx -y ruflo@latest';

async function sh(command: string, timeoutMs = 600_000) {
  const { agentUrl } = getSettings();
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const r = await fetch(`${agentUrl}/terminal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command }),
      signal: ctrl.signal,
    });
    const data = await r.json().catch(() => ({}));
    return { ok: r.ok, out: `${data.stdout ?? ''}${data.stderr ? `\n${data.stderr}` : ''}`.trim() };
  } finally {
    clearTimeout(t);
  }
}

// Double-quote for Windows cmd; strip characters that would break the line.
const dq = (s: string) => `"${s.replace(/["\r\n%^&|<>]/g, ' ').trim()}"`;
const inDir = (cmd: string) => `if not exist "${RUFLO_DIR}" mkdir "${RUFLO_DIR}" & cd /d "${RUFLO_DIR}" & ${cmd}`;

export const ruflo = {
  checkTools: () => sh(`node --version & npm --version & git --version`, 60_000),
  installNode: () => sh(`winget install -e --id OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements`, 900_000),
  install: () => sh(inDir(`npm install -g ruflo@latest & ${RF} --version`), 900_000),
  init: () => sh(inDir(`${RF} init --force`), 600_000),
  doctor: () => sh(inDir(`${RF} doctor --fix`), 300_000),
  version: () => sh(`${RF} --version`, 120_000),
  startMcp: () =>
    sh(inDir(`start "ruflo-mcp" /min cmd /c "${RF} mcp start --transport http --port ${RUFLO_MCP_PORT} > ruflo-mcp.log 2>&1"`), 60_000),
  stopMcp: () => sh(`taskkill /FI "WINDOWTITLE eq ruflo-mcp*" /T /F`, 60_000),
  mcpLog: () => sh(inDir(`type ruflo-mcp.log`), 60_000),
  swarmInit: (topology: string) => sh(inDir(`${RF} swarm init --topology ${topology}`)),
  swarmStatus: () => sh(inDir(`${RF} swarm status`)),
  agentList: () => sh(inDir(`${RF} agent list`)),
  hiveStatus: () => sh(inDir(`${RF} hive-mind status`)),
  memoryStore: (key: string, value: string, ns = 'aiapp') =>
    sh(inDir(`${RF} memory store --namespace ${ns} --key ${dq(key)} --value ${dq(value.slice(0, 1500))}`)),
  memorySearch: (query: string, ns = 'aiapp') =>
    sh(inDir(`${RF} memory search --namespace ${ns} --query ${dq(query)}`)),
  memoryList: (ns = 'aiapp') => sh(inDir(`${RF} memory list --namespace ${ns}`)),

  /** Register ruflo's MCP server in this app's MCP list so chat can call its tools. */
  registerMcp() {
    const { agentUrl } = getSettings();
    const host = agentUrl.replace(/:\d+$/, '');
    const existing = getServers().find((s) => s.id === 'ruflo');
    upsertServer({
      id: 'ruflo',
      name: 'Ruflo (swarm + memory)',
      transport: 'http',
      url: `${host}:${RUFLO_MCP_PORT}/mcp`,
      enabled: existing?.enabled ?? true,
    });
  },
};

export interface SwarmStep {
  role: string;
  task: string;
}
export interface SwarmEvent {
  kind: 'plan' | 'agent' | 'memory' | 'done' | 'error';
  role?: string;
  text: string;
}

async function ask(model: string, system: string, user: string, signal?: AbortSignal): Promise<string> {
  const msgs: ChatMessage[] = [
    { role: 'system', content: system },
    { role: 'user', content: user },
  ];
  let out = '';
  for await (const c of streamChat(model, msgs, undefined, signal)) out += c.content ?? '';
  return out.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
}

export async function pickLocalModel(): Promise<string> {
  const { defaultModel } = getSettings();
  if (defaultModel) return defaultModel;
  const m = await fetchModels();
  if (!m.length) throw new Error('No Ollama models found. Pull a model first.');
  return m[0].name;
}

/**
 * Run a ruflo-style swarm where every agent is THIS app's local model:
 * queen plans → each worker runs in turn → results saved to ruflo memory → queen summarises.
 */
export async function runLocalSwarm(
  objective: string,
  opts: { model: string; maxAgents: number; useMemory: boolean },
  onEvent: (e: SwarmEvent) => void,
  signal?: AbortSignal,
) {
  const { model, maxAgents, useMemory } = opts;
  let context = '';
  if (useMemory) {
    const mem = await ruflo.memorySearch(objective).catch(() => null);
    if (mem?.ok && mem.out) {
      context = mem.out.slice(0, 2000);
      onEvent({ kind: 'memory', text: `Recalled from ruflo memory:\n${context}` });
    }
  }

  const planRaw = await ask(
    model,
    `You are the queen coordinator of a ruflo hive-mind. Break the objective into at most ${maxAgents} worker steps. Reply ONLY with JSON: [{"role":"researcher|architect|coder|tester|reviewer|writer|analyst","task":"..."}]`,
    `Objective: ${objective}${context ? `\n\nRelevant past memory:\n${context}` : ''}`,
    signal,
  );
  let steps: SwarmStep[] = [];
  try {
    const m = planRaw.match(/\[[\s\S]*\]/);
    steps = JSON.parse(m ? m[0] : planRaw);
  } catch {
    steps = [{ role: 'generalist', task: objective }];
  }
  steps = steps.filter((s) => s?.task).slice(0, maxAgents);
  onEvent({ kind: 'plan', text: steps.map((s, i) => `${i + 1}. [${s.role}] ${s.task}`).join('\n') });

  const results: string[] = [];
  for (const s of steps) {
    if (signal?.aborted) throw new Error('Stopped');
    const out = await ask(
      model,
      `You are the ${s.role} agent in a ruflo swarm. Do your task fully and concretely. Be concise.`,
      `Overall objective: ${objective}\n\nYour task: ${s.task}\n\nWork from teammates so far:\n${results.join('\n\n').slice(-6000) || '(none yet)'}`,
      signal,
    );
    results.push(`### ${s.role}\n${out}`);
    onEvent({ kind: 'agent', role: s.role, text: out });
    if (useMemory) {
      ruflo.memoryStore(`${s.role}:${objective.slice(0, 60)}:${Date.now()}`, out).catch(() => {});
    }
  }

  const final = await ask(
    model,
    'You are the queen coordinator. Merge the workers\' output into one final answer for the user.',
    `Objective: ${objective}\n\n${results.join('\n\n').slice(-10000)}`,
    signal,
  );
  if (useMemory) ruflo.memoryStore(`result:${objective.slice(0, 60)}`, final).catch(() => {});
  onEvent({ kind: 'done', text: final });
  return final;
}
