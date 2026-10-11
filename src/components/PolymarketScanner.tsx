import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { RefreshCw, Sparkles, TrendingUp, Trash2 } from 'lucide-react';
import {
  fetchMarkets, estimate, calibrate, signal, stakeSize, loadTrades, saveTrades, settleTrades,
  type PMarket, type PaperTrade,
} from '@/lib/polymarket';

const BANKROLL = 1000;
const pct = (n: number) => `${Math.round(n * 100)}%`;

export default function PolymarketScanner({ engineUp }: { engineUp: boolean }) {
  const [markets, setMarkets] = useState<PMarket[]>([]);
  const [est, setEst] = useState<Record<string, number>>({});
  const [trades, setTrades] = useState<PaperTrade[]>(loadTrades);
  const [busy, setBusy] = useState<string | null>(null);

  const load = async () => {
    setBusy('load');
    try { setMarkets(await fetchMarkets()); } catch { toast.error("Couldn't reach Polymarket"); }
    setBusy(null);
  };
  useEffect(() => { load(); settleTrades(loadTrades()).then((t) => { setTrades(t); saveTrades(t); }); }, []);

  const update = (t: PaperTrade[]) => { setTrades(t); saveTrades(t); };

  const scan = async (m: PMarket, auto = false) => {
    setBusy(m.id);
    try {
      const raw = await estimate(m.question);
      if (raw == null) { toast.error('PYTHIA gave no number'); return; }
      const p = calibrate(raw);
      setEst((e) => ({ ...e, [m.id]: p }));
      const s = signal(p, m.yes);
      if (auto && s && !trades.some((t) => t.marketId === m.id && t.status === 'open')) {
        const entry = s.side === 'YES' ? m.yes : 1 - m.yes;
        const prob = s.side === 'YES' ? p : 1 - p;
        const stake = stakeSize(BANKROLL, prob, entry);
        if (stake > 0) update([{ id: crypto.randomUUID(), marketId: m.id, question: m.question, slug: m.slug, side: s.side, entry, model: p, stake, openedAt: new Date().toISOString(), status: 'open' }, ...loadTrades()]);
      }
    } catch { toast.error('PYTHIA is not answering'); }
    finally { setBusy(null); }
  };

  const scanAll = async () => { for (const m of markets.slice(0, 10)) await scan(m, true); toast.success('Scan finished'); };

  const settled = trades.filter((t) => t.status !== 'open');
  const pnl = settled.reduce((a, t) => a + (t.payout ?? 0) - t.stake, 0);
  const wins = settled.filter((t) => t.status === 'won').length;

  return (
    <div className="space-y-4">
      <Card className="p-4 space-y-2">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Polymarket paper trading · pretend money only</div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" disabled={!!busy} onClick={load}><RefreshCw className="h-3 w-3 mr-1" /> Refresh</Button>
            <Button size="sm" disabled={!!busy || !engineUp} onClick={scanAll}><Sparkles className="h-3 w-3 mr-1" /> Scan top 10</Button>
          </div>
        </div>
        {!engineUp && <p className="text-xs text-destructive">Start PYTHIA on the Setup tab to get its estimates.</p>}
        <div className="grid grid-cols-3 gap-2 text-center text-sm">
          <div><div className="text-muted-foreground text-xs">Open</div>{trades.length - settled.length}</div>
          <div><div className="text-muted-foreground text-xs">Hit rate</div>{settled.length ? pct(wins / settled.length) : '—'}</div>
          <div><div className="text-muted-foreground text-xs">Profit</div><span className={pnl >= 0 ? 'text-primary' : 'text-destructive'}>${pnl.toFixed(2)}</span></div>
        </div>
      </Card>

      <div className="space-y-2">
        {markets.map((m) => {
          const p = est[m.id];
          const s = p != null ? signal(p, m.yes) : null;
          return (
            <Card key={m.id} className="p-3 space-y-2">
              <a href={`https://polymarket.com/market/${m.slug}`} target="_blank" rel="noreferrer" className="text-sm font-medium hover:underline">{m.question}</a>
              <div className="flex items-center gap-2 flex-wrap text-xs">
                <Badge variant="outline">Market {pct(m.yes)}</Badge>
                {p != null && <Badge variant="outline">PYTHIA {pct(p)}</Badge>}
                {s && <Badge><TrendingUp className="h-3 w-3 mr-1" /> Buy {s.side} · edge {pct(s.edge)}</Badge>}
                {p != null && !s && <Badge variant="secondary">No edge</Badge>}
                <Button size="sm" variant="ghost" className="ml-auto h-7" disabled={!!busy || !engineUp} onClick={() => scan(m, true)}>
                  {busy === m.id ? 'Thinking…' : 'Ask PYTHIA'}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {trades.length > 0 && (
        <Card className="p-4 space-y-2">
          <div className="flex justify-between items-center">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Paper trades</div>
            <Button size="sm" variant="ghost" onClick={() => update([])}><Trash2 className="h-3 w-3" /></Button>
          </div>
          {trades.map((t) => (
            <div key={t.id} className="text-xs flex gap-2 justify-between border-b border-border pb-1">
              <span className="truncate">{t.side} · {t.question}</span>
              <span className="shrink-0">${t.stake} @ {pct(t.entry)} · {t.status === 'open' ? 'open' : `${t.status} $${((t.payout ?? 0) - t.stake).toFixed(2)}`}</span>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
