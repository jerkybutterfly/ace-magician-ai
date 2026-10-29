// Data feeds for the Bot Dashboard: bot status/history on the mini PC,
// with browser-side fallbacks (Binance spot, Polymarket Gamma) so the
// charts still move when the bot isn't running.
import { botUrl } from './polybot';

export interface TradeRow {
  ts: number; mode: string; slug: string; side: string;
  price: number; stake: number; fair: number; result: string; pnl: number;
}

/** Every settled trade ever, from the bot's database. Requires the updated bot script. */
export async function fetchHistory(): Promise<TradeRow[]> {
  const r = await fetch(`${botUrl()}/history`, { signal: AbortSignal.timeout(5000) });
  if (!r.ok) throw new Error(`history ${r.status}`);
  const d = await r.json();
  return (d.trades ?? []) as TradeRow[];
}

/** Cumulative profit points, oldest first. */
export function cumulativePnl(trades: Pick<TradeRow, 'ts' | 'pnl'>[]): { t: number; pnl: number }[] {
  let sum = 0;
  return trades.map((tr) => ({ t: tr.ts, pnl: Math.round((sum += tr.pnl) * 100) / 100 }));
}

/** Live BTC spot from Binance's public API (no key, CORS open). */
export async function fetchBtcSpot(): Promise<number | null> {
  const r = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT', { signal: AbortSignal.timeout(4000) });
  const d = await r.json();
  const p = Number(d.price);
  return Number.isFinite(p) ? p : null;
}

export interface ContractPrices { up: number; down: number; slug: string; endsAt: number }

/** Slug of the BTC up/down market covering timestamp `nowSec`. */
export function currentWindowSlug(windowMin: 5 | 15, nowSec: number): string {
  const w = windowMin * 60;
  return `btc-updown-${windowMin}m-${Math.floor(nowSec / w) * w}`;
}

/** Current Up/Down contract prices from Polymarket's public Gamma API. */
export async function fetchContractPrices(windowMin: 5 | 15, nowSec = Date.now() / 1000): Promise<ContractPrices | null> {
  const slug = currentWindowSlug(windowMin, nowSec);
  const r = await fetch(`https://gamma-api.polymarket.com/events?slug=${slug}`, { signal: AbortSignal.timeout(5000) });
  if (!r.ok) return null;
  const ev = await r.json();
  const m = ev?.[0]?.markets?.[0];
  if (!m) return null;
  const outcomes: string[] = JSON.parse(m.outcomes ?? '[]');
  const prices: string[] = JSON.parse(m.outcomePrices ?? '[]');
  const i = outcomes.findIndex((o) => o.toLowerCase() === 'up');
  const j = outcomes.findIndex((o) => o.toLowerCase() === 'down');
  if (i < 0 || j < 0) return null;
  const up = Number(prices[i]); const down = Number(prices[j]);
  if (!Number.isFinite(up) || !Number.isFinite(down)) return null;
  const w = windowMin * 60;
  return { up, down, slug, endsAt: (Math.floor(nowSec / w) + 1) * w };
}
