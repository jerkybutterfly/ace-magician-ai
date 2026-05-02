// Glasswing / Mythos client — vuln hunter, code auditor, agent loop, findings store.
import { supabase } from '@/integrations/supabase/client';
import { webSearch, webFetch, runCommand } from './agent';
import { runDranaCommand } from './drana';

export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type TriageState = 'new' | 'confirmed' | 'fixed' | 'ignored';

export interface Finding {
  id: string;
  title: string;
  severity: Severity;
  category?: string;
  location?: string;
  description: string;
  impact?: string;
  exploit_scenario?: string;
  patch_suggestion: string;
  cwe?: string;
  confidence: 'high' | 'medium' | 'low';
  target: string;
  source: 'hunter' | 'auditor' | 'agent';
  triage: TriageState;
  created_at: number;
}

export interface FindingsResponse {
  findings: Omit<Finding, 'id' | 'target' | 'source' | 'triage' | 'created_at'>[];
  summary: string;
}

export interface AgentStep {
  thought: string;
  action: 'web_search' | 'web_fetch' | 'run_command' | 'drana_run' | 'analyze' | 'finish';
  action_input?: string;
  is_final: boolean;
  final_report?: string;
}

export interface TranscriptEntry {
  step: number;
  thought: string;
  action: string;
  action_input?: string;
  observation: string;
  ts: number;
}

const STORE_KEY = 'glasswing-findings';

export function loadFindings(): Finding[] {
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveFindings(findings: Finding[]): void {
  localStorage.setItem(STORE_KEY, JSON.stringify(findings));
}

export function addFindings(
  raw: FindingsResponse['findings'],
  target: string,
  source: Finding['source'],
): Finding[] {
  const existing = loadFindings();
  const now = Date.now();
  const next: Finding[] = raw.map((f, i) => ({
    ...f,
    id: `${now}-${i}-${Math.random().toString(36).slice(2, 8)}`,
    target,
    source,
    triage: 'new' as TriageState,
    created_at: now,
  }));
  const all = [...next, ...existing];
  saveFindings(all);
  return all;
}

export function updateFindingTriage(id: string, triage: TriageState): Finding[] {
  const all = loadFindings().map((f) => (f.id === id ? { ...f, triage } : f));
  saveFindings(all);
  return all;
}

export function deleteFinding(id: string): Finding[] {
  const all = loadFindings().filter((f) => f.id !== id);
  saveFindings(all);
  return all;
}

export function clearFindings(): void {
  saveFindings([]);
}

export function exportFindingsMarkdown(findings: Finding[]): string {
  const sevOrder: Severity[] = ['critical', 'high', 'medium', 'low', 'info'];
  const groups = sevOrder.map((s) => [s, findings.filter((f) => f.severity === s)] as const);
  const lines: string[] = ['# Glasswing Findings Report', `Generated: ${new Date().toISOString()}`, ''];
  for (const [sev, list] of groups) {
    if (!list.length) continue;
    lines.push(`## ${sev.toUpperCase()} (${list.length})`);
    for (const f of list) {
      lines.push(`### ${f.title}`);
      lines.push(`- **Target:** ${f.target}`);
      if (f.location) lines.push(`- **Location:** ${f.location}`);
      if (f.cwe) lines.push(`- **CWE:** ${f.cwe}`);
      lines.push(`- **Confidence:** ${f.confidence}`);
      lines.push(`- **Triage:** ${f.triage}`);
      lines.push('', f.description, '');
      if (f.exploit_scenario) lines.push(`**Exploit:** ${f.exploit_scenario}`, '');
      lines.push(`**Patch:** ${f.patch_suggestion}`, '');
    }
  }
  return lines.join('\n');
}

// ── AI calls via edge function ──

async function callGlasswing<T>(mode: string, payload: unknown): Promise<T> {
  const { data, error } = await supabase.functions.invoke('glasswing', {
    body: { mode, payload },
  });
  if (error) throw new Error(error.message || 'Glasswing call failed');
  if (data?.error) throw new Error(data.error);
  return data as T;
}

export async function hunt(target: string, recon: string, model?: string): Promise<FindingsResponse> {
  return callGlasswing<FindingsResponse>('hunt', { target, recon, model });
}

export async function audit(
  code: string,
  language?: string,
  context?: string,
  model?: string,
): Promise<FindingsResponse> {
  return callGlasswing<FindingsResponse>('audit', { code, language, context, model });
}

export async function agentStep(
  goal: string,
  history: string,
  model?: string,
): Promise<AgentStep> {
  return callGlasswing<AgentStep>('agent_step', { goal, history, model });
}

// ── Autonomous agent loop ──

export interface RunAgentOpts {
  goal: string;
  maxSteps?: number;
  model?: string;
  onStep: (entry: TranscriptEntry) => void;
  shouldStop: () => boolean;
}

export async function runAgent(opts: RunAgentOpts): Promise<string> {
  const max = opts.maxSteps ?? 10;
  const transcript: TranscriptEntry[] = [];
  let finalReport = '';

  for (let step = 1; step <= max; step++) {
    if (opts.shouldStop()) break;

    const history = transcript
      .map((t) => `STEP ${t.step}\nThought: ${t.thought}\nAction: ${t.action}(${t.action_input ?? ''})\nObservation: ${t.observation.slice(0, 1500)}`)
      .join('\n\n') || '(no steps yet)';

    let plan: AgentStep;
    try {
      plan = await agentStep(opts.goal, history, opts.model);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      const entry: TranscriptEntry = {
        step,
        thought: '(planning failed)',
        action: 'error',
        observation: msg,
        ts: Date.now(),
      };
      transcript.push(entry);
      opts.onStep(entry);
      break;
    }

    if (plan.is_final || plan.action === 'finish') {
      finalReport = plan.final_report || plan.thought;
      const entry: TranscriptEntry = {
        step,
        thought: plan.thought,
        action: 'finish',
        observation: finalReport,
        ts: Date.now(),
      };
      transcript.push(entry);
      opts.onStep(entry);
      break;
    }

    let observation = '';
    try {
      switch (plan.action) {
        case 'web_search': {
          const r = await webSearch(plan.action_input || '', 5);
          observation = r.results.map((x) => `- ${x.title}\n  ${x.url}\n  ${x.snippet}`).join('\n');
          break;
        }
        case 'web_fetch': {
          const r = await webFetch(plan.action_input || '');
          observation = `${r.title}\n${r.text.slice(0, 3000)}`;
          break;
        }
        case 'run_command': {
          const r = await runCommand(plan.action_input || '');
          observation = `exit=${r.returncode}\nSTDOUT:\n${r.stdout.slice(0, 2500)}\nSTDERR:\n${r.stderr.slice(0, 1000)}`;
          break;
        }
        case 'drana_run': {
          const parsed = JSON.parse(plan.action_input || '{}');
          const r = await runDranaCommand(parsed.command, parsed.target, parsed.timeout || 60);
          observation = `exit=${r.returncode}\n${r.stdout.slice(0, 2500)}`;
          break;
        }
        case 'analyze':
        default:
          observation = plan.action_input || '(analysis only)';
      }
    } catch (e) {
      observation = `ERROR: ${e instanceof Error ? e.message : String(e)}`;
    }

    const entry: TranscriptEntry = {
      step,
      thought: plan.thought,
      action: plan.action,
      action_input: plan.action_input,
      observation,
      ts: Date.now(),
    };
    transcript.push(entry);
    opts.onStep(entry);
  }

  return finalReport;
}
