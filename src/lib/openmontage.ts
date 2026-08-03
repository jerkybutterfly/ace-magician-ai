import { getSettings } from './settings';

export const OPENMONTAGE_REPO = 'https://github.com/calesthio/OpenMontage.git';

export interface MontagePipeline {
  id: string;
  name: string;
  produces: string;
  bestFor: string;
}

/** The 12 production pipelines shipped with OpenMontage. */
export const PIPELINES: MontagePipeline[] = [
  { id: 'animated-explainer', name: 'Animated Explainer', produces: 'AI explainer with research, narration, visuals, music', bestFor: 'Tutorials, topic breakdowns' },
  { id: 'animation', name: 'Animation', produces: 'Motion graphics, kinetic typography', bestFor: 'Social media, product demos' },
  { id: 'avatar-spokesperson', name: 'Avatar Spokesperson', produces: 'Avatar-driven presenter videos', bestFor: 'Corporate comms, training' },
  { id: 'cinematic', name: 'Cinematic', produces: 'Trailers, teasers, mood-driven edits', bestFor: 'Brand films, promos' },
  { id: 'clip-factory', name: 'Clip Factory', produces: 'Ranked short-form clips from one long source', bestFor: 'Repurposing long content' },
  { id: 'documentary-montage', name: 'Documentary Montage', produces: 'Montage cut from free stock/open archives', bestFor: 'Video essays, real-footage edits' },
  { id: 'hybrid', name: 'Hybrid', produces: 'Source footage + AI support visuals', bestFor: 'Enhancing existing footage' },
  { id: 'localization-dub', name: 'Localization & Dub', produces: 'Subtitles, dubs, translations', bestFor: 'Multi-language distribution' },
  { id: 'podcast-repurpose', name: 'Podcast Repurpose', produces: 'Podcast highlights to video', bestFor: 'Audiograms, podcast marketing' },
  { id: 'screen-demo', name: 'Screen Demo', produces: 'Polished screen recordings and walkthroughs', bestFor: 'Product demos, docs' },
  { id: 'talking-head', name: 'Talking Head', produces: 'Footage-led speaker videos', bestFor: 'Presentations, vlogs' },
  { id: 'reference-remix', name: 'Reference Remix', produces: 'Production plan grounded in a reference video', bestFor: 'Cloning pacing/style of a video you like' },
];

export const STAGES = ['research', 'proposal', 'script', 'scene_plan', 'assets', 'edit', 'compose'] as const;
export type MontageStage = typeof STAGES[number];

export interface MontageProject {
  id: string;
  path: string;
  title?: string;
  pipeline?: string;
  stage?: string;
  status?: string;
  updated?: string;
}

export interface TerminalResult {
  stdout: string;
  stderr: string;
  returncode: number;
}

function agentUrl(p: string): string {
  return `${getSettings().agentUrl}${p}`;
}

/** Run a shell command on the agent host. */
export async function runOnHost(command: string, timeoutMs = 600000): Promise<TerminalResult> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(agentUrl('/terminal'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command }),
      signal: ctrl.signal,
    });
    if (!res.ok) throw new Error(`Agent error ${res.status}`);
    const data = await res.json();
    return { stdout: data.stdout ?? '', stderr: data.stderr ?? '', returncode: data.returncode ?? 0 };
  } finally {
    clearTimeout(t);
  }
}

function q(s: string): string {
  return JSON.stringify(s);
}

export interface InstallStatus {
  installed: boolean;
  commit?: string;
  node?: string;
  python?: string;
  hasNodeModules?: boolean;
  detail: string;
}

/** Check whether OpenMontage is cloned and its toolchain is present. */
export async function checkInstall(root: string): Promise<InstallStatus> {
  const cmd = [
    `if [ -d ${q(root)}/.git ]; then echo "REPO=$(git -C ${q(root)} rev-parse --short HEAD 2>/dev/null)"; else echo "REPO="; fi`,
    `echo "NODE=$(node -v 2>/dev/null)"`,
    `echo "PY=$(python3 --version 2>/dev/null || python --version 2>/dev/null)"`,
    `if [ -d ${q(root)}/node_modules ]; then echo "MODULES=yes"; else echo "MODULES=no"; fi`,
  ].join('; ');
  const r = await runOnHost(cmd, 60000);
  const get = (k: string) => (r.stdout.match(new RegExp(`^${k}=(.*)$`, 'm'))?.[1] ?? '').trim();
  const commit = get('REPO');
  return {
    installed: !!commit,
    commit: commit || undefined,
    node: get('NODE') || undefined,
    python: get('PY') || undefined,
    hasNodeModules: get('MODULES') === 'yes',
    detail: r.stdout.trim() || r.stderr.trim(),
  };
}

/** Clone the repo (or pull if already present) and install JS + Python deps. */
export async function installOpenMontage(root: string, withDeps = true): Promise<TerminalResult> {
  const parent = root.replace(/\/[^/]+\/?$/, '') || '.';
  const clone =
    `mkdir -p ${q(parent)} && ` +
    `if [ -d ${q(root)}/.git ]; then git -C ${q(root)} pull --ff-only; ` +
    `else git clone --depth 1 ${OPENMONTAGE_REPO} ${q(root)}; fi`;
  const deps = withDeps
    ? ` && cd ${q(root)} && (npm install --no-audit --no-fund || true) && ` +
      `(python3 -m pip install -r requirements.txt || pip install -r requirements.txt || true)`
    : '';
  return runOnHost(clone + deps, 900000);
}

/** List productions found in <root>/projects. */
export async function listProjects(root: string): Promise<MontageProject[]> {
  const cmd =
    `for d in ${q(root)}/projects/*/; do ` +
    `[ -d "$d" ] || continue; echo "###$d"; ` +
    `cat "$d/project.json" 2>/dev/null; echo; done`;
  const r = await runOnHost(cmd, 60000);
  const out: MontageProject[] = [];
  for (const chunk of r.stdout.split('###').slice(1)) {
    const nl = chunk.indexOf('\n');
    const path = (nl === -1 ? chunk : chunk.slice(0, nl)).trim().replace(/\/$/, '');
    const body = nl === -1 ? '' : chunk.slice(nl + 1).trim();
    const id = path.split('/').pop() || path;
    let meta: Record<string, unknown> = {};
    try {
      meta = body ? JSON.parse(body) : {};
    } catch {
      meta = {};
    }
    out.push({
      id,
      path,
      title: (meta.title as string) ?? (meta.name as string) ?? id,
      pipeline: meta.pipeline as string | undefined,
      stage: (meta.stage as string) ?? (meta.current_stage as string | undefined),
      status: meta.status as string | undefined,
      updated: (meta.updated_at as string) ?? (meta.created_at as string | undefined),
    });
  }
  return out;
}

/** Open the Backlot living storyboard board (library, or one production). */
export async function openBacklot(root: string, projectId?: string): Promise<TerminalResult> {
  const target = projectId ? ` ${q(projectId)}` : '';
  return runOnHost(`cd ${q(root)} && python3 -m backlot open${target}`, 120000);
}

/** Run the built-in simulated production so you can watch the board fill in. */
export async function simulateRun(root: string): Promise<TerminalResult> {
  return runOnHost(`cd ${q(root)} && python3 scripts/backlot_simulate_run.py`, 600000);
}

/** Read a project's latest checkpoint JSON, if any. */
export async function readCheckpoint(projectPath: string): Promise<string> {
  const r = await runOnHost(`cat ${q(projectPath)}/checkpoint.json 2>/dev/null || echo '{}'`, 60000);
  return r.stdout.trim();
}

export interface BriefInput {
  root: string;
  pipeline: MontagePipeline;
  topic: string;
  duration: number;
  reference?: string;
  style?: string;
}

/**
 * Build the agent brief that drives an OpenMontage production.
 * The repo is agent-native: production is driven by natural-language
 * instructions plus its director skills, so we hand the chat model a
 * precise prompt with the working directory and stage contract.
 */
export function buildProductionBrief(input: BriefInput): string {
  const { root, pipeline, topic, duration, reference, style } = input;
  return [
    `Run an OpenMontage production. Working directory: ${root}`,
    ``,
    `Pipeline: ${pipeline.name} (${pipeline.produces})`,
    `Topic: ${topic}`,
    `Target duration: ${duration}s`,
    style ? `Style / tone: ${style}` : '',
    reference ? `Reference video: ${reference} — analyze transcript, pacing, scenes and keyframes first.` : '',
    ``,
    `Follow OpenMontage's stage contract in order: ${STAGES.join(' -> ')}.`,
    `Read the matching director skill under ${root}/.agents/skills before each stage,`,
    `write a checkpoint after each stage, and STOP for my approval at the gated stages`,
    `(script and assets). Report the cost estimate before generating any paid assets.`,
    ``,
    `Start by reading the repo layout:`,
    `[RUN_CMD:cd "${root}" && ls -1]`,
  ]
    .filter(Boolean)
    .join('\n');
}

/** Chat brief for turning a reference video into a grounded plan. */
export function buildReferenceBrief(root: string, url: string, twist: string): string {
  return [
    `Use OpenMontage at ${root} to start from a reference video.`,
    `Reference: ${url}`,
    twist ? `Make something like it, but: ${twist}` : '',
    ``,
    `Analyze the transcript, pacing, scene structure and keyframes, then give me`,
    `2-3 differentiated concepts, an honest tool path, a cost estimate at my target`,
    `duration, and a sample — before any full production run.`,
  ]
    .filter(Boolean)
    .join('\n');
}
