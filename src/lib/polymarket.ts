// Polymarket paper-trading scanner — compares live Polymarket odds with PYTHIA's estimate.
// Read-only: uses the public Gamma API (CORS open). No real orders are ever placed.
import { pythia } from './pythia';

const GAMMA = 'https://gamma-api.polymarket.com';
const KEY = 'pythia-polymarket-paper';

export interface PMarket { id: string; question: string; slug: string; yes: number; volume: number; endDate?: string; closed: boolean }
export interface PaperTrade {
  id: string; marketId: string; question: string; slug: string; side: 'YES' | 'NO';
  entry: number; model: number; stake: number; openedAt: string;
  status: 'open' | 'won' | 'lost'; payout?: number;
}

function parse(m: any): PMarket | null {
  try {
    const outcomes: string[] = JSON.parse(m.outcomes ?? '[]');
    const prices: string[] = JSON.parse(m.outcomePrices ?? '[]');
    const i = outcomes.findIndex((o) => o.toLowerCase() === 'yes');
    if (i < 0 || prices[i] == null) return null;
    return { id: String(m.id), question: m.question, slug: m.slug, yes: Number(prices[i]), volume: Number(m.volume ?? 0), endDate: m.endDate, closed: !!m.closed };
  } catch { return null; }
}

export async function fetchMarkets(limit = 30): Promise<PMarket[]> {
  const r = await fetch(`${GAMMA}/markets?active=true&closed=false&order=volume24hr&ascending=false&limit=${limit}`);
  const data = await r.json();
  return (data as any[]).map(parse).filter((m): m is PMarket => !!m && m.yes > 0.02 && m.yes < 0.98);
}

export async function fetchMarket(id: string): Promise<PMarket | null> {
  const r = await fetch(`${GAMMA}/markets/${id}`);
  return r.ok ? parse(await r.json()) : null;
}

/** Ask PYTHIA's oracle for a YES probability (0..1). */
export async function estimate(question: string): Promise<number | null> {
  const res = await pythia.chat(
    `Using your current world state, estimate the probability this prediction market resolves YES: "${question}". ` +
    `Reply with only a number between 0 and 100.`,
  );
  const m = (res.answer ?? '').match(/(\d+(?:\.\d+)?)\s*%?/);
  if (!m) return null;
  const n = Number(m[1]);
  return n >= 0 && n <= 100 ? n / 100 : null;
}

/** Shrink extreme model probabilities toward 50% — raw LLMs are over-confident. */
export const calibrate = (p: number, shrink = 0.3) => 0.5 + (p - 0.5) * (1 - shrink);

/** Which side to take, or null if the edge is below threshold. */
export function signal(model: number, yesPrice: number, threshold = 0.15): { side: 'YES' | 'NO'; edge: number } | null {
  const edge = model - yesPrice;
  if (edge >= threshold) return { side: 'YES', edge };
  if (-edge >= threshold) return { side: 'NO', edge: -edge };
  return null;
}

/** Quarter-Kelly stake, capped at 5% of bankroll. */
export function stakeSize(bankroll: number, prob: number, price: number): number {
  const b = (1 - price) / price;
  const kelly = (prob * b - (1 - prob)) / b;
  if (kelly <= 0) return 0;
  return Math.round(Math.min(kelly * 0.25, 0.05) * bankroll * 100) / 100;
}

/** Payout for a resolved trade: shares = stake/entry, each worth $1 if won. */
export const payoutFor = (t: Pick<PaperTrade, 'stake' | 'entry'>, won: boolean) => (won ? Math.round((t.stake / t.entry) * 100) / 100 : 0);

export const loadTrades = (): PaperTrade[] => { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; } };
export const saveTrades = (t: PaperTrade[]) => localStorage.setItem(KEY, JSON.stringify(t));

export async function settleTrades(trades: PaperTrade[]): Promise<PaperTrade[]> {
  return Promise.all(trades.map(async (t) => {
    if (t.status !== 'open') return t;
    const m = await fetchMarket(t.marketId).catch(() => null);
    if (!m || !m.closed || (m.yes > 0.02 && m.yes < 0.98)) return t;
    const yesWon = m.yes >= 0.98;
    const won = (t.side === 'YES') === yesWon;
    return { ...t, status: won ? 'won' : 'lost', payout: payoutFor(t, won) } as PaperTrade;
  }));
}
