import { getSettings } from './settings';

export const COPY_TRADER_PORT = 8486;
const DIR = '%USERPROFILE%\\.aiapp\\copytrader';

export function copyTraderUrl() {
  if (typeof window !== 'undefined' && window.location?.hostname) {
    return `http://${window.location.hostname}:${COPY_TRADER_PORT}`;
  }
  return `http://localhost:${COPY_TRADER_PORT}`;
}

export function agentApiUrl() {
  const { agentUrl } = getSettings();
  if (typeof window !== 'undefined' && window.location?.hostname && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    try {
      const u = new URL(agentUrl);
      if (u.hostname === 'localhost' || u.hostname === '127.0.0.1') {
        u.hostname = window.location.hostname;
        return u.origin;
      }
    } catch {}
  }
  return agentUrl;
}

async function sh(command: string, timeoutMs = 300_000) {
  const url = agentApiUrl();
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const r = await fetch(`${url}/terminal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command }),
      signal: ctrl.signal,
    });
    const d = await r.json().catch(() => ({}));
    return { ok: r.ok, stdout: (d.stdout ?? '') as string, stderr: (d.stderr ?? '') as string };
  } finally {
    clearTimeout(t);
  }
}

export interface CopyTraderOpts {
  wallet?: string;
  stake: number;
  minPrice?: number;
  maxPrice: number;
  maxPerWindow?: number;
  noHedging?: boolean;
  live: boolean;
  pollInterval?: number;
  privateKey?: string;
  funderAddress?: string;
}

export interface CopyTraderStatus {
  target_wallet: string;
  target_name: string;
  mode: 'PAPER' | 'LIVE';
  running: boolean;
  stake: number;
  min_price: number;
  max_price: number;
  max_per_window: number;
  no_hedging: boolean;
  poll_interval: number;
  last_check_ts: number;
  total_copied: number;
  wins: number;
  losses: number;
  pnl: number;
  log: string[];
  recent_target_trades: Array<{
    title: string;
    outcome?: string;
    price: number;
    size: number;
    side: string;
    timestamp: number;
    transactionHash?: string;
    slug?: string;
  }>;
  my_trades: Array<{
    id: number;
    copied_at: number;
    title: string;
    outcome: string;
    side: string;
    target_price: number;
    my_price: number;
    stake: number;
    shares: number;
    mode: string;
    status: 'PENDING' | 'WON' | 'LOST';
    pnl: number;
    slug?: string;
  }>;
  target_stats: {
    pnl: number;
    volume: number;
    total_trades: number;
    win_rate: number;
  };
}

export const copyTrader = {
  install: () =>
    sh(
      `if not exist "${DIR}" mkdir "${DIR}" && curl.exe -sL "${window.location.origin}/polymarket_copy_trader.py" -o "${DIR}\\polymarket_copy_trader.py" && python -m pip install --upgrade requests && echo INSTALLED`,
      600_000
    ),
  start: async (o: CopyTraderOpts) => {
    // 1. Try dynamic configuration on the running engine (instant & zero-downtime)
    try {
      const cfgRes = await fetch(`${copyTraderUrl()}/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stake: o.stake,
          min_price: o.minPrice,
          max_price: o.maxPrice,
          max_per_window: o.maxPerWindow,
          no_hedging: o.noHedging,
          running: true,
          mode: o.live ? 'LIVE' : 'PAPER',
          private_key: o.privateKey,
          funder: o.funderAddress,
        }),
        signal: AbortSignal.timeout(3500),
      });
      if (cfgRes.ok) {
        const data = await cfgRes.json();
        return {
          ok: true,
          stdout: `Copy trader active in ${data.state?.mode || (o.live ? 'LIVE' : 'PAPER')} mode ($${o.stake}/trade, min $${o.minPrice || 0.45}, max $${o.maxPrice}).`,
        };
      } else {
        const errData = await cfgRes.json().catch(() => ({}));
        if (errData.error) throw new Error(errData.error);
      }
    } catch (e) {
      if ((e as Error).message && !(e as Error).message.includes('fetch') && !(e as Error).message.includes('aborted') && !(e as Error).message.includes('timeout')) {
        throw e;
      }
      // Server not reachable yet, fall back to spawning the process via terminal agent
    }

    try {
      await copyTrader.stopProcess();
    } catch {
      // ignore
    }
    const keyArg = o.privateKey ? ` --key ${o.privateKey}` : '';
    const funderArg = o.funderAddress ? ` --funder ${o.funderAddress}` : '';
    const minPriceArg = o.minPrice != null ? ` --min-price ${o.minPrice}` : '';
    const maxWindowArg = o.maxPerWindow != null ? ` --max-per-window ${o.maxPerWindow}` : '';
    const hedgingArg = o.noHedging === false ? ' --allow-hedging' : '';
    return sh(
      `start "copytrader" /min cmd /c "cd /d ${DIR} && python polymarket_copy_trader.py --stake ${o.stake} --max-price ${o.maxPrice}${minPriceArg}${maxWindowArg}${hedgingArg}${
        o.live ? ' --live' : ''
      }${o.wallet ? ` --wallet ${o.wallet}` : ''}${keyArg}${funderArg} > copytrader.log 2>&1"`,
      30_000
    );
  },
  stopProcess: () =>
    sh(
      `for /f "tokens=5" %a in ('netstat -ano ^| findstr :${COPY_TRADER_PORT} ^| findstr LISTENING') do taskkill /PID %a /F`,
      30_000
    ),
  logs: async () => {
    try {
      const s = await copyTrader.status();
      return { ok: true, stdout: (s.log || []).join('\n') };
    } catch {
      return sh(`type "${DIR}\\copytrader.log"`);
    }
  },
  status: async (): Promise<CopyTraderStatus> => {
    const res = await fetch(`${copyTraderUrl()}/status`, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },
  pause: () => fetch(`${copyTraderUrl()}/stop`, { method: 'POST' }),
  resume: () => fetch(`${copyTraderUrl()}/resume`, { method: 'POST' }),
  clearHistory: () => fetch(`${copyTraderUrl()}/clear-history`),
  configure: (cfg: { stake?: number; min_price?: number; max_price?: number; max_per_window?: number; no_hedging?: boolean }) =>
    fetch(`${copyTraderUrl()}/config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cfg),
    }),
};
