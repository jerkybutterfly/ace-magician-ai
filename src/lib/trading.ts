// Trading client — talks to the local Python agent's /trading namespace (Alpaca).
import { getSettings } from './settings';

export interface Account {
  equity: number;
  cash: number;
  buying_power: number;
  day_pnl: number;
  day_pnl_pct: number;
  paper: boolean;
  connected: boolean;
  status?: string;
}

export interface Position {
  symbol: string;
  qty: number;
  avg_entry: number;
  last: number;
  market_value: number;
  unrealized_pl: number;
  unrealized_plpc: number;
  side: 'long' | 'short';
}

export interface Order {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  qty: number;
  type: 'market' | 'limit' | 'stop';
  limit_price?: number;
  status: string;
  filled_qty: number;
  filled_avg_price?: number;
  submitted_at: string;
}

export interface Strategy {
  id: string;
  name: string;
  symbols: string[];
  enabled: boolean;
  last_signal?: { side: 'buy' | 'sell' | 'hold'; symbol: string; at: string };
  pnl: number;
  trades: number;
}

export interface PlaceOrderArgs {
  symbol: string;
  side: 'buy' | 'sell';
  qty?: number;
  notional?: number;
  type?: 'market' | 'limit' | 'stop';
  limit_price?: number;
  stop_price?: number;
}

const url = (path: string) => `${getSettings().agentUrl}${path}`;

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const r = await fetch(url(path), {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
  });
  if (!r.ok) {
    const txt = await r.text().catch(() => '');
    throw new Error(`${r.status}: ${txt || r.statusText}`);
  }
  return r.json();
}

export const trading = {
  connect: (key: string, secret: string, paper = true) =>
    req<Account>('/trading/connect', { method: 'POST', body: JSON.stringify({ key, secret, paper }) }),
  account: () => req<Account>('/trading/account'),
  positions: () => req<Position[]>('/trading/positions'),
  orders: (status: 'open' | 'closed' | 'all' = 'all') => req<Order[]>(`/trading/orders?status=${status}`),
  placeOrder: (a: PlaceOrderArgs) =>
    req<Order>('/trading/order', { method: 'POST', body: JSON.stringify({ type: 'market', ...a }) }),
  cancelOrder: (id: string) => req<{ ok: true }>(`/trading/order/${id}`, { method: 'DELETE' }),
  closeAll: () => req<{ closed: number }>('/trading/close_all', { method: 'POST' }),
  strategies: () => req<Strategy[]>('/trading/strategies'),
  toggleStrategy: (id: string) => req<Strategy>(`/trading/strategies/${id}/toggle`, { method: 'POST' }),
  strategyLogs: (id: string) => req<{ logs: string[] }>(`/trading/strategies/${id}/logs`),
  settings: () => req<{ max_notional: number; daily_loss_limit: number; live_unlocked: boolean }>('/trading/settings'),
  updateSettings: (s: { max_notional?: number; daily_loss_limit?: number; unlock_phrase?: string }) =>
    req<{ ok: true; live_unlocked: boolean }>('/trading/settings', { method: 'POST', body: JSON.stringify(s) }),
};

export function fmtMoney(n: number): string {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

export function fmtPct(n: number): string {
  return `${n >= 0 ? '+' : ''}${(n * 100).toFixed(2)}%`;
}
