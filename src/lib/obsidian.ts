import { getSettings } from './settings';

export const CLAUDE_OBSIDIAN_REPO = 'https://github.com/AgriciDaniel/claude-obsidian.git';

export interface TerminalResult {
  stdout: string;
  stderr: string;
  returncode: number;
}

export interface VaultNote {
  path: string;      // vault-relative path, forward slashes
  name: string;      // file name without .md
  folder: string;    // vault-relative folder ('' for root)
  size: number;
  modified: number;  // epoch seconds
}

export interface VaultSearchHit {
  path: string;
  line: number;
  text: string;
}

export interface VaultStatus {
  exists: boolean;
  notes: number;
  folders: number;
  hasObsidianConfig: boolean;
  pluginInstalled: boolean;
  pluginCommit?: string;
  detail: string;
}

function agentUrl(p: string): string {
  return `${getSettings().agentUrl}${p}`;
}

/** Run a shell command on the agent host. */
export async function runOnHost(command: string, timeoutMs = 120000): Promise<TerminalResult> {
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

function b64(s: string): string {
  return btoa(String.fromCharCode(...new TextEncoder().encode(s)));
}

/**
 * Run a Python snippet on the host. The code is base64-encoded so Windows /
 * POSIX quoting never mangles it. Vault paths with spaces are safe.
 */
async function runPy(code: string, timeoutMs = 120000): Promise<TerminalResult> {
  const payload = b64(code);
  const inner = `import base64;exec(base64.b64decode('${payload}').decode('utf-8'))`;
  const cmd = `python -c "${inner}" || python3 -c "${inner}"`;
  return runOnHost(cmd, timeoutMs);
}

function parseJson<T>(out: string, fallback: T): T {
  const start = out.indexOf('@@JSON@@');
  if (start === -1) return fallback;
  try {
    return JSON.parse(out.slice(start + 8).trim()) as T;
  } catch {
    return fallback;
  }
}

const PY_HEAD = `
import os, json, base64, time
def emit(o):
    print('@@JSON@@' + json.dumps(o))
`;

/** Inspect the vault + whether the claude-obsidian plugin is cloned. */
export async function checkVault(vault: string, pluginRoot: string): Promise<VaultStatus> {
  const code = `${PY_HEAD}
vault = base64.b64decode('${b64(vault)}').decode('utf-8')
plugin = base64.b64decode('${b64(pluginRoot)}').decode('utf-8')
notes = 0; folders = 0
exists = os.path.isdir(vault)
if exists:
    for root, dirs, files in os.walk(vault):
        dirs[:] = [d for d in dirs if not d.startswith('.')]
        folders += len(dirs)
        notes += len([f for f in files if f.lower().endswith('.md')])
emit({
    'exists': exists,
    'notes': notes,
    'folders': folders,
    'hasObsidianConfig': os.path.isdir(os.path.join(vault, '.obsidian')),
    'pluginInstalled': os.path.isdir(os.path.join(plugin, '.git')),
})
`;
  const r = await runPy(code, 120000);
  const d = parseJson<Partial<VaultStatus>>(r.stdout, {});
  return {
    exists: !!d.exists,
    notes: d.notes ?? 0,
    folders: d.folders ?? 0,
    hasObsidianConfig: !!d.hasObsidianConfig,
    pluginInstalled: !!d.pluginInstalled,
    detail: (r.stdout.split('@@JSON@@')[0] || r.stderr).trim(),
  };
}

/** List every markdown note in the vault (newest first). */
export async function listNotes(vault: string, limit = 800): Promise<VaultNote[]> {
  const code = `${PY_HEAD}
vault = base64.b64decode('${b64(vault)}').decode('utf-8')
out = []
for root, dirs, files in os.walk(vault):
    dirs[:] = [d for d in dirs if not d.startswith('.')]
    for f in files:
        if not f.lower().endswith('.md'):
            continue
        p = os.path.join(root, f)
        try:
            st = os.stat(p)
        except OSError:
            continue
        rel = os.path.relpath(p, vault).replace('\\\\', '/')
        out.append({
            'path': rel,
            'name': f[:-3],
            'folder': os.path.dirname(rel),
            'size': st.st_size,
            'modified': int(st.st_mtime),
        })
out.sort(key=lambda n: n['modified'], reverse=True)
emit(out[:${limit}])
`;
  const r = await runPy(code, 180000);
  return parseJson<VaultNote[]>(r.stdout, []);
}

/** Read one note (vault-relative path). */
export async function readNote(vault: string, rel: string): Promise<string> {
  const code = `${PY_HEAD}
vault = base64.b64decode('${b64(vault)}').decode('utf-8')
rel = base64.b64decode('${b64(rel)}').decode('utf-8')
p = os.path.abspath(os.path.join(vault, rel))
if not p.startswith(os.path.abspath(vault)):
    emit({'error': 'path escapes the vault'})
else:
    try:
        with open(p, 'r', encoding='utf-8', errors='replace') as fh:
            emit({'content': fh.read()})
    except OSError as e:
        emit({'error': str(e)})
`;
  const r = await runPy(code, 60000);
  const d = parseJson<{ content?: string; error?: string }>(r.stdout, {});
  if (d.error) throw new Error(d.error);
  return d.content ?? '';
}

/** Create or overwrite a note. Parent folders are created. */
export async function writeNote(vault: string, rel: string, content: string, append = false): Promise<void> {
  const code = `${PY_HEAD}
vault = base64.b64decode('${b64(vault)}').decode('utf-8')
rel = base64.b64decode('${b64(rel)}').decode('utf-8')
body = base64.b64decode('${b64(content)}').decode('utf-8')
p = os.path.abspath(os.path.join(vault, rel))
if not p.startswith(os.path.abspath(vault)):
    emit({'error': 'path escapes the vault'})
else:
    try:
        os.makedirs(os.path.dirname(p), exist_ok=True)
        with open(p, 'a' if ${append ? 'True' : 'False'} else 'w', encoding='utf-8') as fh:
            fh.write(body)
        emit({'ok': True})
    except OSError as e:
        emit({'error': str(e)})
`;
  const r = await runPy(code, 60000);
  const d = parseJson<{ ok?: boolean; error?: string }>(r.stdout, {});
  if (!d.ok) throw new Error(d.error || 'Write failed');
}

/** Full-text search across the vault. */
export async function searchVault(vault: string, query: string, limit = 200): Promise<VaultSearchHit[]> {
  const code = `${PY_HEAD}
vault = base64.b64decode('${b64(vault)}').decode('utf-8')
q = base64.b64decode('${b64(query)}').decode('utf-8').lower()
hits = []
for root, dirs, files in os.walk(vault):
    dirs[:] = [d for d in dirs if not d.startswith('.')]
    for f in files:
        if not f.lower().endswith('.md'):
            continue
        p = os.path.join(root, f)
        rel = os.path.relpath(p, vault).replace('\\\\', '/')
        try:
            with open(p, 'r', encoding='utf-8', errors='replace') as fh:
                for i, line in enumerate(fh, 1):
                    if q in line.lower():
                        hits.append({'path': rel, 'line': i, 'text': line.strip()[:300]})
                        if len(hits) >= ${limit}:
                            emit(hits)
                            raise SystemExit
        except OSError:
            continue
emit(hits)
`;
  const r = await runPy(code, 180000);
  return parseJson<VaultSearchHit[]>(r.stdout, []);
}

/** Clone / update the claude-obsidian plugin on the host. */
export async function installPlugin(pluginRoot: string): Promise<TerminalResult> {
  const code = `${PY_HEAD}
import subprocess, shlex
root = base64.b64decode('${b64(pluginRoot)}').decode('utf-8')
parent = os.path.dirname(root.rstrip('/\\\\')) or '.'
os.makedirs(parent, exist_ok=True)
if os.path.isdir(os.path.join(root, '.git')):
    cmd = ['git', '-C', root, 'pull', '--ff-only']
else:
    cmd = ['git', 'clone', '--depth', '1', '${CLAUDE_OBSIDIAN_REPO}', root]
r = subprocess.run(cmd, capture_output=True, text=True)
print(r.stdout)
print(r.stderr)
emit({'ok': r.returncode == 0})
`;
  return runPy(code, 600000);
}

/** Today's daily note path, Obsidian style: Daily/YYYY-MM-DD.md */
export function dailyNotePath(folder = 'Daily'): string {
  const d = new Date();
  const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  return `${folder}/${iso}.md`;
}

/** Format a quick capture block with timestamp + tags. */
export function formatCapture(text: string, tags: string[]): string {
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const tagLine = tags.length ? ` ${tags.map((t) => `#${t.replace(/^#/, '')}`).join(' ')}` : '';
  return `\n- **${time}** ${text}${tagLine}\n`;
}

// ── Chat briefs (drive the vault from the agent with tool tags) ──

export function buildVaultBrief(vault: string, task: string): string {
  return [
    `Work in my Obsidian vault at: ${vault}`,
    ``,
    `Task: ${task}`,
    ``,
    `Rules (claude-obsidian conventions):`,
    `- Notes are markdown with YAML frontmatter (title, created, tags).`,
    `- Link related notes with [[wikilinks]]; never break existing links.`,
    `- Never delete or overwrite an existing note without showing me a diff first.`,
    `- Put new captures in the vault's Inbox folder unless I say otherwise.`,
    ``,
    `Start by listing the vault:`,
    `[LIST_DIR:${vault}]`,
  ].join('\n');
}

export function buildResearchBrief(vault: string, topic: string, folder = 'Research'): string {
  return [
    `Research "${topic}" and write it into my Obsidian vault at ${vault}.`,
    ``,
    `1. Search the web and read the best sources.`,
    `2. Write a permanent note at ${vault}\\${folder}\\${topic.replace(/[\\/:*?"<>|]/g, '-')}.md with:`,
    `   YAML frontmatter (title, created, tags, sources), a short summary,`,
    `   key findings as bullets, open questions, and a Sources section with links.`,
    `3. Add [[wikilinks]] to any related notes you find in the vault.`,
    `4. Append a one-line entry to today's daily note.`,
  ].join('\n');
}

export function buildSummarizeBrief(vault: string, rel: string): string {
  return [
    `Read this Obsidian note and summarize it.`,
    `[READ_FILE:${vault}\\${rel.replace(/\//g, '\\')}]`,
    ``,
    `Give me: a 3-line summary, the key claims, anything that contradicts other notes,`,
    `and 5 suggested [[wikilinks]] to related topics.`,
  ].join('\n');
}
