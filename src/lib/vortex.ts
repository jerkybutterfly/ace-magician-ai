// Vortex — AI Security Agent loop (autonomous recon/scan/report).
// Inspired by github.com/ZeroXJacks/Vortex, rewired to use local Ollama + agent /terminal.
import { getSettings } from './settings';
import { streamChat, type ChatMessage } from './ollama';

const agent = (p: string) => `${getSettings().agentUrl}${p}`;

export const VORTEX_SYSTEM_PROMPT = `You are Vortex — an elite bug bounty hunter and penetration tester with full Linux terminal access.
Think step by step. Briefly explain what you're doing before each command.

When you want to run a terminal command, output it on its own line as:
<CMD>your command here</CMD>

Rules:
- One command per turn. Wait for the output before deciding the next step.
- After seeing output, analyze it and continue: recon → scanning → enumeration → light exploitation → reporting.
- Available tools (assume Kali/Linux): nmap, curl, wget, nikto, ffuf, whatweb, wafw00f, dig, whois, host, nslookup, python3, nuclei, subfinder, sqlmap, dirb, gobuster, wpscan, httpx, katana, amass.
- Prefer non-destructive, passive-first techniques. Never run destructive commands (rm -rf, mkfs, dd, fork bombs).
- When the assessment is complete, output a full markdown report between <REPORT> and </REPORT> tags and then stop.`;

const BLOCKED = [/rm\s+-rf\s+\//, /mkfs/, /dd\s+if=\/dev\/zero/, /:\(\)\s*\{\s*:\|:&\s*\};:/, /chmod\s+-R\s+777\s+\//, />\s*\/dev\/sd[a-z]/, /shutdown/, /reboot/, /:\(\)\s*\{/];

export function isBlocked(cmd: string): boolean {
  return BLOCKED.some((re) => re.test(cmd));
}

export function extractCommand(text: string): string | null {
  const m = text.match(/<CMD>([\s\S]*?)<\/CMD>/i);
  return m ? m[1].trim() : null;
}

export function extractReport(text: string): string | null {
  const m = text.match(/<REPORT>([\s\S]*?)<\/REPORT>/i);
  return m ? m[1].trim() : null;
}

export interface TerminalOut { returncode: number; stdout: string; stderr: string }

export async function runCommand(command: string, timeout = 300): Promise<TerminalOut> {
  const res = await fetch(agent('/terminal'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ command, timeout }),
  });
  if (!res.ok) throw new Error(`Agent /terminal error: ${res.status}`);
  return res.json();
}

export type VortexEventType = 'thought' | 'command' | 'output' | 'report' | 'error' | 'done' | 'blocked';
export interface VortexEvent { type: VortexEventType; text: string; ts: number }

export interface RunOptions {
  target: string;
  maxSteps?: number;
  model?: string;
  onEvent: (e: VortexEvent) => void;
  signal?: AbortSignal;
}

async function generateOnce(model: string, messages: ChatMessage[], onDelta?: (s: string) => void): Promise<string> {
  let full = '';
  for await (const chunk of streamChat(model, messages, 'reasoning')) {
    if (chunk.content) {
      full += chunk.content;
      onDelta?.(chunk.content);
    }
  }
  return full;
}

/** Run Vortex agent loop until <REPORT> or maxSteps reached. */
export async function runVortex(opts: RunOptions): Promise<string | null> {
  const { target, onEvent, signal } = opts;
  const maxSteps = opts.maxSteps ?? 15;
  const model = opts.model || getSettings().defaultModel;
  if (!model) throw new Error('No model selected. Pick one in Settings first.');

  const emit = (type: VortexEventType, text: string) => onEvent({ type, text, ts: Date.now() });

  const history: ChatMessage[] = [
    { role: 'system', content: VORTEX_SYSTEM_PROMPT },
    { role: 'user', content: `Target: ${target}\nBegin your security assessment now. Start with passive recon.` },
  ];

  for (let step = 0; step < maxSteps; step++) {
    if (signal?.aborted) { emit('error', 'Aborted by user'); return null; }

    let reply: string;
    try {
      reply = await generateOnce(model, history);
    } catch (e) {
      emit('error', `Model error: ${(e as Error).message}`);
      return null;
    }

    history.push({ role: 'assistant', content: reply });

    const report = extractReport(reply);
    const thought = reply.replace(/<CMD>[\s\S]*?<\/CMD>/gi, '').replace(/<REPORT>[\s\S]*?<\/REPORT>/gi, '').trim();
    if (thought) emit('thought', thought);

    if (report) {
      emit('report', report);
      emit('done', `Assessment complete after ${step + 1} step(s).`);
      return report;
    }

    const cmd = extractCommand(reply);
    if (!cmd) {
      emit('done', `Agent stopped without a command or report (step ${step + 1}).`);
      return null;
    }

    if (isBlocked(cmd)) {
      emit('blocked', `Refused destructive command: ${cmd}`);
      history.push({ role: 'user', content: `Command blocked by safety filter: "${cmd}". Choose a safer approach.` });
      continue;
    }

    emit('command', cmd);
    let out: TerminalOut;
    try {
      out = await runCommand(cmd);
    } catch (e) {
      const msg = (e as Error).message;
      emit('error', msg);
      history.push({ role: 'user', content: `Command execution failed: ${msg}` });
      continue;
    }

    const combined = [out.stdout, out.stderr].filter(Boolean).join('\n').slice(0, 8000);
    emit('output', combined || `(exit ${out.returncode}, no output)`);
    history.push({
      role: 'user',
      content: `Exit code: ${out.returncode}\n--- OUTPUT ---\n${combined || '(empty)'}\n--- END ---\nContinue the assessment. Next command or final <REPORT>.`,
    });
  }

  emit('done', `Reached max steps (${maxSteps}) without a final report.`);
  return null;
}
