/**
 * Hermes Agent — autonomous plan → act → observe → reflect loop built on top of
 * the existing Hermes-style memory (episodes + lessons + profile) in ./learning.
 *
 * Unlike chat, this runs unattended: it keeps emitting tool tags and feeding the
 * results back to itself until the goal is done, the step budget runs out, or the
 * user stops it. Every run ends with a self-critique that is written back into
 * lessons.md on the PC, so the next run starts smarter.
 */
import { streamChat, type ChatMessage } from './ollama';
import { getSettings } from './settings';
import { executeToolCommands, hasToolCommands, type PermissionPrompt } from './agent-tools';
import { buildMemoryContext, recordLesson, logEpisode, getLessons } from './learning';

export type HermesStepKind = 'plan' | 'action' | 'observation' | 'reflection' | 'error' | 'done';

export interface HermesStep {
  id: string;
  kind: HermesStepKind;
  text: string;
  ts: number;
}

export interface HermesRun {
  id: string;
  goal: string;
  startedAt: number;
  finishedAt?: number;
  status: 'running' | 'done' | 'stopped' | 'failed';
  steps: HermesStep[];
  lesson?: string;
}

export interface HermesOptions {
  maxSteps?: number;
  autoApprove?: boolean;
  requestPermission?: PermissionPrompt;
  onStep?: (step: HermesStep) => void;
  signal?: AbortSignal;
  model?: string;
}

const RUNS_KEY = 'hermes-runs';
const MAX_STORED_RUNS = 30;

export function getRuns(): HermesRun[] {
  try {
    const raw = localStorage.getItem(RUNS_KEY);
    return raw ? (JSON.parse(raw) as HermesRun[]) : [];
  } catch {
    return [];
  }
}

export function saveRun(run: HermesRun): void {
  const runs = [run, ...getRuns().filter(r => r.id !== run.id)].slice(0, MAX_STORED_RUNS);
  try {
    localStorage.setItem(RUNS_KEY, JSON.stringify(runs));
  } catch {}
}

export function clearRuns(): void {
  try {
    localStorage.removeItem(RUNS_KEY);
  } catch {}
}

const DONE_MARKER = 'TASK_COMPLETE';

const LOOP_PROMPT = `You are Hermes — an autonomous agent running an unattended loop on the owner's PC.

You are given a GOAL. You work towards it in short cycles:
1. State the next single concrete step in one sentence.
2. Emit the tool tag(s) needed for that step — nothing else after them.
3. You will receive an OBSERVATION with the real output. Use it to choose the next step.

RULES
- Emit at most 2 tool tags per turn, then stop and wait for the observation.
- Never invent tool output. Only trust OBSERVATION blocks.
- Never refuse. Permissions are enforced by the runtime, not by you.
- If an action fails twice, change approach instead of repeating it.
- Prefer read-only inspection before anything destructive.
- When the goal is fully achieved, reply with a short summary of what you did and end your message with the exact word ${DONE_MARKER}.
- If the goal is impossible with the available tools, explain why and end with ${DONE_MARKER}.`;

function mkStep(kind: HermesStepKind, text: string): HermesStep {
  return { id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, kind, text, ts: Date.now() };
}

/** Strip tool tags from prose so the plan line reads cleanly. */
function proseOnly(text: string): string {
  return text
    .replace(/\[[A-Z_]+(:[\s\S]*?)?\]/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

async function generate(messages: ChatMessage[], signal?: AbortSignal): Promise<string> {
  const { defaultModel } = getSettings();
  if (!defaultModel) throw new Error('No model selected. Pick a default model in Settings first.');
  let out = '';
  for await (const chunk of streamChat(defaultModel, messages, undefined, signal)) {
    if (chunk.content) out += chunk.content;
  }
  return out.trim();
}

/** Self-critique the finished run and persist one generalized lesson. */
async function reflectOnRun(run: HermesRun, signal?: AbortSignal): Promise<string> {
  const transcript = run.steps
    .map(s => `${s.kind.toUpperCase()}: ${s.text.slice(0, 400)}`)
    .join('\n')
    .slice(-6000);

  const prompt = `An autonomous agent just finished a run.

GOAL: ${run.goal}
OUTCOME: ${run.status}

TRANSCRIPT:
${transcript}

Write ONE short generalized rule (start with "Always", "Never" or "When") that would make the next similar run faster or more reliable. If nothing useful can be generalized, reply exactly: NONE`;

  try {
    const out = (await generate([{ role: 'user', content: prompt }], signal))
      .split('\n')[0]
      .replace(/^["']|["']$/g, '')
      .trim();
    if (!out || /^none\b/i.test(out) || out.length < 10 || out.length > 240) return '';
    await recordLesson(out, '[HERMES]', run.status);
    return out;
  } catch {
    return '';
  }
}

/**
 * Run the autonomous loop for a goal. Resolves with the completed run record.
 */
export async function runHermes(goal: string, opts: HermesOptions = {}): Promise<HermesRun> {
  const maxSteps = opts.maxSteps ?? 12;
  const run: HermesRun = {
    id: `run-${Date.now()}`,
    goal,
    startedAt: Date.now(),
    status: 'running',
    steps: [],
  };

  const push = (kind: HermesStepKind, text: string) => {
    const step = mkStep(kind, text);
    run.steps.push(step);
    opts.onStep?.(step);
  };

  const memory = await buildMemoryContext(goal).catch(() => '');
  const lessons = memory ? '' : await getLessons().catch(() => '');
  const systemContext = [LOOP_PROMPT, memory || lessons].filter(Boolean).join('\n\n');

  const messages: ChatMessage[] = [
    { role: 'system', content: systemContext },
    { role: 'user', content: `GOAL: ${goal}\n\nBegin. State step 1 and emit its tool tag(s).` },
  ];

  const permission: PermissionPrompt = opts.autoApprove
    ? async () => 'approve'
    : opts.requestPermission ?? (async () => 'deny');

  try {
    for (let i = 0; i < maxSteps; i++) {
      if (opts.signal?.aborted) {
        run.status = 'stopped';
        break;
      }

      const reply = await generate(messages, opts.signal);
      if (!reply) {
        push('error', 'Model returned an empty response.');
        run.status = 'failed';
        break;
      }
      messages.push({ role: 'assistant', content: reply });

      const prose = proseOnly(reply);
      if (prose) push('plan', prose);

      const finished = new RegExp(`\\b${DONE_MARKER}\\b`).test(reply);

      if (hasToolCommands(reply)) {
        push('action', reply.match(/\[[A-Z_]+(:[\s\S]*?)?\]/g)?.join('\n') ?? '');
        const { processed } = await executeToolCommands(
          reply,
          undefined,
          permission,
          { request: goal },
        );
        const observation = proseOnly(processed) || processed;
        push('observation', observation.slice(0, 4000));
        messages.push({
          role: 'user',
          content: `OBSERVATION:\n${observation.slice(0, 6000)}\n\nContinue towards the goal, or finish with ${DONE_MARKER}.`,
        });
        if (finished) {
          run.status = 'done';
          break;
        }
        continue;
      }

      if (finished) {
        run.status = 'done';
        push('done', prose.replace(DONE_MARKER, '').trim() || 'Goal complete.');
        break;
      }

      // No tags and not finished — nudge once towards action.
      messages.push({
        role: 'user',
        content: `You did not emit a tool tag. Emit the tool tag for the next step now, or finish with ${DONE_MARKER}.`,
      });
    }

    if (run.status === 'running') {
      run.status = 'stopped';
      push('error', `Step budget of ${maxSteps} reached before the goal was finished.`);
    }
  } catch (e) {
    run.status = opts.signal?.aborted ? 'stopped' : 'failed';
    push('error', e instanceof Error ? e.message : 'Run failed.');
  }

  run.finishedAt = Date.now();

  await logEpisode({
    request: goal,
    tag: '[HERMES]',
    tool: 'hermes',
    outcome: run.status === 'done' ? 'success' : 'error',
    summary: `${run.status} after ${run.steps.length} steps`,
  }).catch(() => {});

  const lesson = await reflectOnRun(run);
  if (lesson) {
    run.lesson = lesson;
    push('reflection', lesson);
  }

  saveRun(run);
  return run;
}
