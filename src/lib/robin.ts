// Robin bridge — AI-Powered Dark Web OSINT (apurvsinghgautam/robin)
// Runs the official Docker image on the host via the agent's /terminal endpoint
// and exposes the Streamlit UI at http://<host>:8501 for iframe embedding.
import { getSettings } from './settings';

const IMAGE = 'apurvsg/robin:latest';
const CONTAINER = 'robin-osint';
const PORT = 8501;

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

export const robin = {
  url: () => {
    try {
      const u = new URL(getSettings().agentUrl);
      return `${u.protocol}//${u.hostname}:${PORT}`;
    } catch { return `http://localhost:${PORT}`; }
  },
  pull: () => sh(`docker pull ${IMAGE}`, 900_000),
  install: () => sh(`
    which tor >/dev/null 2>&1 || (sudo apt-get update && sudo apt-get install -y tor) || brew install tor || true;
    (pgrep -x tor >/dev/null || (tor &)) ;
    docker pull ${IMAGE};
    mkdir -p ~/.aiapp/robin/investigations;
    echo installed`, 900_000),
  start: (env: Record<string, string> = {}) => {
    const envArgs = Object.entries(env)
      .filter(([, v]) => v)
      .map(([k, v]) => `-e ${k}=${JSON.stringify(v)}`)
      .join(' ');
    return sh([
      `docker rm -f ${CONTAINER} >/dev/null 2>&1;`,
      `docker run -d --name ${CONTAINER}`,
      `--add-host=host.docker.internal:host-gateway`,
      `-v ~/.aiapp/robin/investigations:/app/investigations`,
      envArgs,
      `-p ${PORT}:${PORT} ${IMAGE}`,
    ].join(' '));
  },
  stop: () => sh(`docker rm -f ${CONTAINER}`),
  status: async () => {
    const r = await sh(`docker ps --filter name=${CONTAINER} --format '{{.Status}}'`);
    return { running: r.stdout.trim().length > 0, status: r.stdout.trim() };
  },
  logs: () => sh(`docker logs --tail 200 ${CONTAINER}`),
  listInvestigations: () => sh(`ls -1t ~/.aiapp/robin/investigations 2>/dev/null | head -50`),
};
