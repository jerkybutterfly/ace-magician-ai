// Odysseus bridge — self-hosted AI workspace (odysseus-dev/odysseus)
// Clones the repo and runs it via docker compose on the AM06 host,
// then exposes the web UI at http://<host>:7000 for iframe embedding.
import { getSettings } from './settings';

const REPO = 'https://github.com/odysseus-dev/odysseus.git';
const DIR = '~/.aiapp/odysseus';
const PORT = 7000;

async function sh(command: string, timeoutMs = 900_000) {
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

export const odysseus = {
  url: () => {
    try {
      const u = new URL(getSettings().agentUrl);
      return `${u.protocol}//${u.hostname}:${PORT}`;
    } catch { return `http://localhost:${PORT}`; }
  },
  install: () => sh(`
    mkdir -p ${DIR} && cd ${DIR} && \
    (test -d .git || git clone ${REPO} .) && \
    git pull --ff-only && \
    (test -f .env || cp .env.example .env) && \
    docker compose build && echo installed`, 1800_000),
  start: () => sh(`cd ${DIR} && docker compose up -d`),
  stop: () => sh(`cd ${DIR} && docker compose down`),
  update: () => sh(`cd ${DIR} && git pull --ff-only && docker compose up -d --build`, 1800_000),
  status: async () => {
    const r = await sh(`cd ${DIR} 2>/dev/null && docker compose ps --format '{{.Name}} {{.Status}}' 2>/dev/null`);
    const lines = r.stdout.split('\n').filter(Boolean);
    return { running: lines.some((l) => /Up|running/i.test(l)), status: r.stdout.trim() };
  },
  logs: () => sh(`cd ${DIR} && docker compose logs --tail 200 odysseus 2>&1 | tail -200`),
  adminPassword: () => sh(`cd ${DIR} && docker compose logs odysseus 2>&1 | grep -i -m1 password || true`),
};
