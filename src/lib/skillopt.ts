// SkillOpt bridge — trains agent skill markdown files against rollouts.
// Wraps Microsoft's SkillOpt (https://github.com/microsoft/SkillOpt) via the Python agent's /skillopt/* endpoints.
import { getSettings } from './settings';

const url = (p: string) => `${getSettings().agentUrl}${p}`;

export interface SkillFile {
  name: string;
  path: string;
  size: number;
  tokens?: number;
  updated_at?: string;
}

export interface TrainRun {
  id: string;
  skill: string;
  benchmark: string;
  backend: string;
  epoch: number;
  epochs: number;
  batch_size: number;
  learning_rate: string;
  status: 'idle' | 'running' | 'done' | 'error';
  best_score?: number;
  val_score?: number;
  started_at?: string;
  updated_at?: string;
  log_tail?: string[];
}

export interface TrainConfig {
  skill: string;            // filename of the seed skill (or "new")
  benchmark: string;        // e.g. "searchqa"
  backend: string;          // e.g. "openai_compatible" | "ollama"
  target_model: string;     // e.g. "llama3.1:8b"
  optimizer_model: string;  // e.g. "qwen2.5:32b"
  epochs: number;
  batch_size: number;
  learning_rate: 'low' | 'medium' | 'high';
  validation_gate: boolean;
}

async function j<T>(r: Response): Promise<T> {
  if (!r.ok) throw new Error(`${r.status}: ${await r.text().catch(() => r.statusText)}`);
  return r.json();
}

export async function skilloptInstall(): Promise<{ ok: boolean; log: string }> {
  return j(await fetch(url('/skillopt/install'), { method: 'POST' }));
}

export async function skilloptStatus(): Promise<{ installed: boolean; version?: string; sleep?: boolean }> {
  return j(await fetch(url('/skillopt/status')));
}

export async function skilloptListSkills(): Promise<SkillFile[]> {
  return j(await fetch(url('/skillopt/skills')));
}

export async function skilloptReadSkill(name: string): Promise<{ name: string; content: string }> {
  return j(await fetch(url(`/skillopt/skills/${encodeURIComponent(name)}`)));
}

export async function skilloptWriteSkill(name: string, content: string): Promise<{ ok: boolean }> {
  return j(await fetch(url(`/skillopt/skills/${encodeURIComponent(name)}`), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  }));
}

export async function skilloptDeleteSkill(name: string): Promise<{ ok: boolean }> {
  return j(await fetch(url(`/skillopt/skills/${encodeURIComponent(name)}`), { method: 'DELETE' }));
}

export async function skilloptListBenchmarks(): Promise<string[]> {
  return j(await fetch(url('/skillopt/benchmarks')));
}

export async function skilloptTrain(config: TrainConfig): Promise<TrainRun> {
  return j(await fetch(url('/skillopt/train'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config),
  }));
}

export async function skilloptRuns(): Promise<TrainRun[]> {
  return j(await fetch(url('/skillopt/runs')));
}

export async function skilloptRun(id: string): Promise<TrainRun> {
  return j(await fetch(url(`/skillopt/runs/${encodeURIComponent(id)}`)));
}

export async function skilloptStop(id: string): Promise<{ ok: boolean }> {
  return j(await fetch(url(`/skillopt/runs/${encodeURIComponent(id)}/stop`), { method: 'POST' }));
}

export async function skilloptSleepStart(): Promise<{ ok: boolean }> {
  // nightly offline self-evolution loop (SkillOpt-Sleep)
  return j(await fetch(url('/skillopt/sleep/start'), { method: 'POST' }));
}

export async function skilloptSleepStop(): Promise<{ ok: boolean }> {
  return j(await fetch(url('/skillopt/sleep/stop'), { method: 'POST' }));
}

export async function skilloptPromoteBest(name: string): Promise<{ ok: boolean; path: string }> {
  // copies best_skill.md into the app's active system prompt / hermes skills dir
  return j(await fetch(url(`/skillopt/promote/${encodeURIComponent(name)}`), { method: 'POST' }));
}
