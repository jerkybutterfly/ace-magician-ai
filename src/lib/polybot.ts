// Low-latency Polymarket BTC bot — Python engine on the mini PC (public/polymarket_bot.py).
// Setup/start go through the helper's /terminal (Windows commands). Live status comes straight from the bot on :8485.
import { getSettings } from './settings';

export const BOT_PORT = 8485;
const DIR = '%USERPROFILE%\\.aiapp\\polybot';

async function sh(command: string, timeoutMs = 300_000) {
  const { agentUrl } = getSettings();
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const r = await fetch(`${agentUrl}/terminal`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command }), signal: ctrl.signal,
    });
    const d = await r.json().catch(() => ({}));
    return { ok: r.ok, stdout: (d.stdout ?? '') as string, stderr: (d.stderr ?? '') as string };
  } finally { clearTimeout(t); }
}

/** Bot status URL lives on the same machine as the helper, different port. */
export function botUrl() {
  const { agentUrl } = getSettings();
  try { const u = new URL(agentUrl); u.port = String(BOT_PORT); return u.origin; } catch { return `http://localhost:${BOT_PORT}`; }
}

export interface BotOpts { window: 5 | 15; edge: number; stake: number; live: boolean }

export const polybot = {
  checkPython: () => sh('python --version'),
  install: () => sh(
    `if not exist "${DIR}" mkdir "${DIR}" && curl.exe -sL "${window.location.origin}/polymarket_bot.py" -o "${DIR}\\polymarket_bot.py" && python -m pip install --upgrade websockets requests && echo INSTALLED`, 600_000),
  installLive: () => sh('python -m pip install py-clob-client', 600_000),
  start: (o: BotOpts) => sh(
    `start "polybot" /min cmd /c "cd /d ${DIR} && python polymarket_bot.py --window ${o.window} --edge ${o.edge} --stake ${o.stake}${o.live ? ' --live' : ''} > polybot.log 2>&1"`, 30_000),
  stopProcess: () => sh(`for /f "tokens=5" %a in ('netstat -ano ^| findstr :${BOT_PORT} ^| findstr LISTENING') do taskkill /PID %a /F`, 30_000),
  logs: () => sh(`type "${DIR}\\polybot.log"`),
  status: async () => (await fetch(`${botUrl()}/status`, { signal: AbortSignal.timeout(3000) })).json(),
  pause: () => fetch(`${botUrl()}/stop`, { method: 'POST' }),
  resume: () => fetch(`${botUrl()}/resume`, { method: 'POST' }),
};
