import { getSettings } from './settings';

export interface UAGraphNode {
  id: string;
  kind: 'file' | 'function' | 'class';
  name: string;
  path: string;
  layer: string;
  language?: string;
  lines?: number;
  line?: number;
  summary?: string;
  imports?: string[];
}

export interface UAGraphEdge {
  source: string;
  target: string;
  relation: string;
}

export interface UAGraph {
  root: string;
  generated_at: string;
  model: string;
  stats: {
    files: number;
    functions: number;
    classes: number;
    edges: number;
    layers: Record<string, number>;
  };
  nodes: UAGraphNode[];
  edges: UAGraphEdge[];
}

function agentUrl(p: string): string {
  return `${getSettings().agentUrl}${p}`;
}

/**
 * Run the Understand-Anything pipeline on the agent host.
 * Calls /terminal with a `python3 understand_anything.py ...` invocation
 * (the script is shipped in /public). Then reads the generated JSON.
 */
export async function runUnderstand(opts: {
  path: string;
  model: string;
  ollamaUrl: string;
  maxFiles?: number;
}): Promise<UAGraph> {
  const out = `${opts.path.replace(/\/$/, '')}/.understand-anything/knowledge-graph.json`;
  const script = '/tmp/understand_anything.py';

  // Ensure the script exists on the agent host (download from this app's /public).
  const origin = window.location.origin;
  const fetchScript = `curl -fsSL ${origin}/understand_anything.py -o ${script}`;
  const run = `python3 ${script} ${JSON.stringify(opts.path)} ` +
    `--model ${JSON.stringify(opts.model)} ` +
    `--ollama ${JSON.stringify(opts.ollamaUrl)} ` +
    `--max-files ${opts.maxFiles ?? 250} ` +
    `--out ${JSON.stringify(out)}`;
  const command = `${fetchScript} && ${run}`;

  const res = await fetch(agentUrl('/terminal'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ command }),
  });
  if (!res.ok) throw new Error(`Agent run failed: ${res.status}`);
  const data = await res.json();
  if (data.returncode !== 0) {
    throw new Error(data.stderr || data.stdout || 'understand_anything.py failed');
  }

  // Read the generated JSON via the agent's file API.
  const fileRes = await fetch(agentUrl(`/files/read?path=${encodeURIComponent(out)}`));
  if (!fileRes.ok) throw new Error('Could not read knowledge-graph.json');
  const fileData = await fileRes.json();
  return JSON.parse(fileData.content) as UAGraph;
}
