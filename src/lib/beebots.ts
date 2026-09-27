// beebots bridge — AI trading bees on OKX perps (imikerussell/beebots), paper trading by default.
// Downloads the published docker-compose.yml, remaps the web port to 8090 (avoids clashing with 80/443),
// and runs it via the local agent /terminal endpoint.
import { getSettings } from './settings';

const COMPOSE = 'https://raw.githubusercontent.com/imikerussell/beebots/main/docker-compose.yml';
const DIR = '~/.aiapp/beebots';
export const BEEBOTS_PORT = 8090;

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
    if (!r.ok) throw new Error(data.stderr || `HTTP ${r.status}`);
    return { ok: r.ok, stdout: (data.stdout ?? '') as string, stderr: (data.stderr ?? '') as string };
  } finally { clearTimeout(t); }
}

export const beebots = {
  url: () => {
    try {
      const u = new URL(getSettings().agentUrl);
      return `${u.protocol}//${u.hostname}:${BEEBOTS_PORT}`;
    } catch { return `http://localhost:${BEEBOTS_PORT}`; }
  },
  install: () => sh(`
    mkdir -p ${DIR} && cd ${DIR} && \
    curl -fsSL ${COMPOSE} -o docker-compose.yml && \
    sed -i -e 's/"80:80"/"${BEEBOTS_PORT}:80"/' -e '/"443:443/d' docker-compose.yml && \
    docker compose pull && echo installed`, 1800_000),
  start: () => sh(`cd ${DIR} && docker compose up -d`),
  stop: () => sh(`cd ${DIR} && docker compose down`),
  restartEngine: () => sh(`cd ${DIR} && docker compose restart engine`),
  update: () => sh(`cd ${DIR} && docker compose pull && docker compose up -d`, 1800_000),
  status: async () => {
    const r = await sh(`cd ${DIR} 2>/dev/null && docker compose ps --format '{{.Name}} {{.Status}}' 2>/dev/null`);
    const lines = r.stdout.split('\n').filter(Boolean);
    return { running: lines.some((l) => /Up|running/i.test(l)), status: r.stdout.trim() };
  },
  logs: () => sh(`cd ${DIR} && docker compose logs --tail 200 engine 2>&1 | tail -200`),
};
