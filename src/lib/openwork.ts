// OpenWork bridge — different-ai/openwork (open-source alternative to Claude Cowork).
// Clones + runs the headless web build of OpenWork on the AM06 host via the agent's
// /terminal endpoint, and can register the OpenWork remote MCP with this app's MCP client.
import { getSettings } from './settings';
import { upsertServer, type McpServer } from './mcp';

const REPO = 'https://github.com/different-ai/openwork.git';
const DIR = '~/.aiapp/openwork';
const PORT = 7788;
export const OPENWORK_MCP_URL = 'https://api.openworklabs.com/mcp/agent';

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

export const openwork = {
  dir: DIR,
  port: PORT,
  mcpUrl: OPENWORK_MCP_URL,

  url: () => {
    try {
      const u = new URL(getSettings().agentUrl);
      return `${u.protocol}//${u.hostname}:${PORT}`;
    } catch { return `http://localhost:${PORT}`; }
  },

  // Clone the repo, enable corepack/pnpm and install workspace deps.
  install: () => sh(`
    set -e
    mkdir -p ~/.aiapp
    if [ -d ${DIR}/.git ]; then cd ${DIR} && git pull --ff-only; else git clone --depth 1 -b dev ${REPO} ${DIR}; fi
    cd ${DIR}
    corepack enable >/dev/null 2>&1 || true
    corepack prepare pnpm@latest --activate >/dev/null 2>&1 || true
    pnpm install 2>&1 | tail -20
    node -v; pnpm -v`),

  // Headless web UI (no Electron shell) + local openwork-server.
  start: () => sh(`
    cd ${DIR} || exit 1
    pkill -f "openwork.*dev-headless" >/dev/null 2>&1 || true
    mkdir -p ${DIR}/.aiapp-logs
    PORT=${PORT} nohup pnpm world up dev-headless --detach > ${DIR}/.aiapp-logs/headless.log 2>&1 &
    sleep 4; echo started`, 300_000),

  stop: () => sh(`pkill -f "openwork" >/dev/null 2>&1; echo stopped`),

  status: async () => {
    const r = await sh(`(pgrep -fa "openwork" | head -5) 2>/dev/null; echo "---"; (curl -s -o /dev/null -w "%{http_code}" http://localhost:${PORT} || echo 000)`);
    const [procs = '', code = ''] = r.stdout.split('---');
    const http = code.trim();
    return { running: http.startsWith('2') || http.startsWith('3'), http, procs: procs.trim() };
  },

  logs: () => sh(`tail -n 200 ${DIR}/.aiapp-logs/headless.log 2>/dev/null || echo "no logs yet"`),

  update: () => sh(`cd ${DIR} && git pull --ff-only && pnpm install 2>&1 | tail -10`),

  version: () => sh(`cd ${DIR} 2>/dev/null && git log -1 --pretty=format:'%h %s' 2>/dev/null || echo "not installed"`),

  // Register the hosted OpenWork MCP so any chat/agent flow can use its
  // search_capabilities / execute_capability tools.
  registerMcp: () => {
    const server: McpServer = {
      id: 'openwork',
      name: 'OpenWork',
      transport: 'http',
      url: OPENWORK_MCP_URL,
      enabled: true,
    };
    upsertServer(server);
    return server;
  },
};
