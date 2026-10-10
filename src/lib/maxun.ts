// Maxun bridge — runs on the AM06 host via Docker (Windows-safe commands).
// Repo: https://github.com/getmaxun/maxun
// No-code web data extraction: point-and-click robots that scrape sites on a schedule.
import { getSettings } from './settings';

// Maxun docker compose: frontend on 5173, backend API on 8080.
// Beebots=8090, changedetection=5050, clm=8700/8095 — no clashes.
const FRONTEND_PORT = 5173;
const BACKEND_PORT = 8080;
const DIR = '%USERPROFILE%\\.aiapp\\maxun';

async function sh(command: string, timeoutMs = 120_000) {
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

const FRONTEND = `http://127.0.0.1:${FRONTEND_PORT}`;
const BACKEND = `http://127.0.0.1:${BACKEND_PORT}`;

export const maxun = {
  frontendPort: FRONTEND_PORT,
  backendPort: BACKEND_PORT,
  webUi: FRONTEND,
  apiUrl: BACKEND,

  checkDocker: () => sh(`docker --version && docker compose version`),
  checkGit: () => sh(`git --version`),

  checkInstalled: () =>
    sh(`if exist "${DIR}\\docker-compose.yml" (echo INSTALLED) else (echo NOT_INSTALLED)`),

  // Clone the repo into the app folder.
  install: () =>
    sh(
      `if not exist "%USERPROFILE%\\.aiapp" mkdir "%USERPROFILE%\\.aiapp" && ` +
      `if exist "${DIR}" (cd /d "${DIR}" && git pull) else (git clone --depth 1 https://github.com/getmaxun/maxun.git "${DIR}") && ` +
      `cd /d "${DIR}" && if not exist .env copy .env.example .env`,
      600_000,
    ),

  // Pull images and start the full stack (frontend, backend, postgres, redis, minio).
  start: () =>
    sh(`cd /d "${DIR}" && docker compose up -d && timeout /t 10 /nobreak >nul && curl -s -o nul -w "HTTP %{http_code}" ${FRONTEND}`, 900_000),

  stop: () => sh(`cd /d "${DIR}" && docker compose down`, 300_000),

  logs: () => sh(`cd /d "${DIR}" && docker compose logs --tail 60`, 120_000),

  status: () => sh(`curl -s -o nul -w "%{http_code}" ${FRONTEND} || echo DOWN`),

  containers: () => sh(`cd /d "${DIR}" && docker compose ps --format "{{.Name}} {{.Status}}" || docker compose ps`),
};
