// Atlas bridge — "source control for coding agents" (https://github.com/pacifio/atlas).
// Atlas is a desktop app (Windows .msi / macOS .dmg). We install/launch it on the host
// and read each project's .atlas/ folder (sessions.db checkpoints + knowledge notes)
// through the local agent /terminal endpoint.
import { getSettings } from './settings';

export type HostOs = 'windows' | 'unix';

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
    return { ok: r.ok, stdout: (data.stdout ?? '') as string, stderr: (data.stderr ?? '') as string };
  } finally { clearTimeout(t); }
}

const ps = (script: string) =>
  `powershell -NoProfile -ExecutionPolicy Bypass -Command "${script.replace(/"/g, '\\"')}"`;
const sq = (s: string) => `'${s.replace(/'/g, "''")}'`; // PowerShell single-quote
const bq = (s: string) => `'${s.replace(/'/g, `'\\''`)}'`; // bash single-quote
const sqlStr = (s: string) => s.replace(/'/g, "''");

export interface AtlasSession {
  id: string; agent: string; model: string; title: string; updated_at: string; attention: number; checkpoints: number;
}
export interface AtlasCheckpoint {
  commit_sha: string; branch: string; insertions: number; deletions: number; created_at: string; title: string; agent: string;
}

function db(os: HostOs, project: string, sql: string) {
  const one = sql.replace(/\s+/g, ' ').trim();
  if (os === 'windows') {
    const p = `${project.replace(/[\\/]$/, '')}\\.atlas\\sessions.db`;
    return sh(ps(`sqlite3 -json ${sq(p)} ${sq(one)}`));
  }
  return sh(`sqlite3 -json ${bq(project.replace(/\/$/, '') + '/.atlas/sessions.db')} ${bq(one)}`);
}

function parse<T>(out: string): T[] {
  try { const j = JSON.parse(out.trim() || '[]'); return Array.isArray(j) ? j : []; } catch { return []; }
}

export const atlas = {
  releases: 'https://github.com/pacifio/atlas/releases',
  site: 'https://www.tryatlas.cc/',

  install: (os: HostOs) => os === 'windows'
    ? sh(ps(`$r = Invoke RestMethod https://api.github.com/repos/pacifio/atlas/releases/latest; `
        .replace('Invoke RestMethod', 'Invoke-RestMethod') +
        `$a = $r.assets | Where-Object { $_.name -like '*.msi' } | Select-Object -First 1; ` +
        `if (-not $a) { 'No .msi in latest release'; exit 1 }; ` +
        `$f = Join-Path $env:TEMP $a.name; Invoke-WebRequest $a.browser_download_url -OutFile $f; ` +
        `Start-Process msiexec.exe -Wait -ArgumentList '/i', $f, '/passive'; 'Installed ' + $r.tag_name; ` +
        `winget install -e --id SQLite.SQLite --accept-source-agreements --accept-package-agreements 2>&1 | Select-Object -Last 2`), 900_000)
    : sh(`echo "Atlas ships .dmg (macOS) / .msi (Windows). Linux: build from source (cargo + bun)."; which sqlite3 || (sudo apt-get install -y sqlite3 2>&1 | tail -2)`),

  launch: (os: HostOs) => os === 'windows'
    ? sh(ps(`$e = Get-ChildItem $env:LOCALAPPDATA,$env:ProgramFiles -Recurse -Filter 'Atlas*.exe' -ErrorAction SilentlyContinue | Select-Object -First 1; if ($e) { Start-Process $e.FullName; 'Launched ' + $e.FullName } else { 'Atlas not found — install first' }`), 120_000)
    : sh(`open -a Atlas 2>&1 || echo "Launch Atlas manually"`),

  status: (os: HostOs, project: string) => os === 'windows'
    ? sh(ps(`if (Test-Path ${sq(project + '\\.atlas')}) { 'atlas: yes' } else { 'atlas: no' }; (sqlite3 -version) 2>&1 | Select-Object -First 1`))
    : sh(`[ -d ${bq(project + '/.atlas')} ] && echo 'atlas: yes' || echo 'atlas: no'; sqlite3 -version 2>&1 | head -1`),

  sessions: async (os: HostOs, project: string): Promise<AtlasSession[]> => {
    const r = await db(os, project, `SELECT s.id, COALESCE(s.agent,s.source) agent, COALESCE(s.model,'') model,
      COALESCE(s.title,'(untitled)') title, s.updated_at, s.needs_attention attention,
      (SELECT COUNT(*) FROM checkpoint c WHERE c.session_id=s.id) checkpoints
      FROM agent_session s ORDER BY s.updated_at DESC LIMIT 50`);
    return parse<AtlasSession>(r.stdout);
  },

  checkpoints: async (os: HostOs, project: string, sessionId?: string): Promise<AtlasCheckpoint[]> => {
    const where = sessionId ? `WHERE c.session_id='${sqlStr(sessionId)}'` : '';
    const r = await db(os, project, `SELECT c.commit_sha, COALESCE(c.branch,'') branch, c.insertions, c.deletions,
      c.created_at, COALESCE(s.title,'') title, COALESCE(s.agent,s.source) agent
      FROM checkpoint c JOIN agent_session s ON s.id=c.session_id ${where}
      ORDER BY c.created_at DESC LIMIT 100`);
    return parse<AtlasCheckpoint>(r.stdout);
  },

  notes: (os: HostOs, project: string) => os === 'windows'
    ? sh(ps(`Get-ChildItem ${sq(project + '\\.atlas\\knowledge')} -Filter *.md -ErrorAction SilentlyContinue | ForEach-Object { $_.Name }`))
    : sh(`ls -1 ${bq(project + '/.atlas/knowledge')} 2>/dev/null | grep '\\.md$'`),

  readFile: (os: HostOs, path: string) => os === 'windows'
    ? sh(ps(`Get-Content -Raw ${sq(path)} -ErrorAction SilentlyContinue`))
    : sh(`cat ${bq(path)} 2>/dev/null`),

  // Writes via base64 so any content survives shell quoting.
  writeFile: (os: HostOs, path: string, content: string) => {
    const b64 = btoa(unescape(encodeURIComponent(content)));
    return os === 'windows'
      ? sh(ps(`$p=${sq(path)}; New-Item -ItemType Directory -Force (Split-Path $p) | Out-Null; [IO.File]::WriteAllBytes($p,[Convert]::FromBase64String('${b64}')); 'saved ' + $p`))
      : sh(`mkdir -p "$(dirname ${bq(path)})" && echo '${b64}' | base64 -d > ${bq(path)} && echo saved`);
  },

  join: (os: HostOs, ...parts: string[]) =>
    parts.map((p, i) => (i ? p.replace(/^[\\/]+/, '') : p.replace(/[\\/]+$/, ''))).join(os === 'windows' ? '\\' : '/'),
};
