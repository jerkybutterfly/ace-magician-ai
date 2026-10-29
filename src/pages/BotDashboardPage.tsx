import { useEffect, useRef, useState } from 'react';
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { useConversations } from '@/hooks/useConversations';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Gauge } from 'lucide-react';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, ReferenceLine } from 'recharts';
import { polybot } from '@/lib/polybot';
import { cumulativePnl, fetchBtcSpot, fetchContractPrices, fetchHistory, type TradeRow } from '@/lib/botdash';

interface LivePoint { t: number; btc: number | null; up: number | null; down: number | null; pnl: number | null }
const MAX_POINTS = 900; // ~15 min at 1s

export default function BotDashboardPage() {
  const { conversations, currentConvoId, createConversation, selectConversation, deleteConversation } = useConversations();
  const [st, setSt] = useState<any>(null);
  const [live, setLive] = useState<LivePoint[]>([]);
  const [trades, setTrades] = useState<TradeRow[]>([]);
  const [historyOk, setHistoryOk] = useState<boolean | null>(null);
  const [fallback, setFallback] = useState<{ btc: number | null; up: number | null; down: number | null }>({ btc: null, up: null, down: null });
  const botUp = useRef(false);

  // Bot status every second — the fastest source when the bot is running.
  useEffect(() => {
    let live0 = true;
    const tick = async () => {
      try {
        const s = await polybot.status();
        if (!live0) return;
        botUp.current = true;
        setSt(s);
        setLive((p) => [...p.slice(-MAX_POINTS + 1), {
          t: Date.now(),
          btc: s.btc ?? null,
          up: s.asks?.UP ?? null,
          down: s.asks?.DOWN ?? null,
          pnl: s.pnl ?? null,
        }]);
      } catch {
        if (!live0) return;
        botUp.current = false;
        setSt(null);
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => { live0 = false; clearInterval(id); };
  }, []);

  // Profit history from the bot's trade database, every 15s.
  useEffect(() => {
    let live0 = true;
    const tick = async () => {
      try {
        const rows = await fetchHistory();
        if (!live0) return;
        setTrades(rows); setHistoryOk(true);
      } catch { if (live0) setHistoryOk(false); }
    };
    tick();
    const id = setInterval(tick, 15000);
    return () => { live0 = false; clearInterval(id); };
  }, []);

  // Browser fallbacks so the charts still move when the bot is off.
  useEffect(() => {
    const tick = async () => {
      if (botUp.current) return;
      const btc = await fetchBtcSpot().catch(() => null);
      setFallback((f) => ({ ...f, btc }));
      if (btc != null) setLive((p) => [...p.slice(-MAX_POINTS + 1), { t: Date.now(), btc, up: null, down: null, pnl: null }]);
      const c = await fetchContractPrices(15).catch(() => null);
      if (c) {
        setFallback((f) => ({ ...f, up: c.up, down: c.down }));
        setLive((p) => {
          const last = p[p.length - 1];
          if (last && Date.now() - last.t < 1500) {
            const next = [...p.slice(0, -1), { ...last, up: c.up, down: c.down }];
            return next;
          }
          return p;
        });
      }
    };
    const id = setInterval(tick, 3000);
    return () => clearInterval(id);
  }, []);

  const pnlSeries = cumulativePnl(trades);
  const livePnl = st?.pnl ?? (pnlSeries.length ? pnlSeries[pnlSeries.length - 1].pnl : null);
  const allTime = trades.length
    ? [...pnlSeries, ...(st && livePnl != null && (pnlSeries.length === 0 || livePnl !== pnlSeries[pnlSeries.length - 1].pnl) ? [{ t: Date.now() / 1000, pnl: livePnl }] : [])]
    : (st && livePnl != null ? [{ t: Date.now() / 1000, pnl: livePnl }] : []);
  const wins = st?.wins ?? trades.filter((t) => t.result === 'won').length;
  const losses = st?.losses ?? trades.filter((t) => t.result === 'lost').length;
  const btcNow = st?.btc ?? fallback.btc;
  const upNow = st?.asks?.UP ?? fallback.up;
  const downNow = st?.asks?.DOWN ?? fallback.down;

  return (
    <div className="flex min-h-screen w-full">
      <AppSidebar conversations={conversations} currentConvoId={currentConvoId} onNewChat={createConversation} onSelectConvo={selectConversation} onDeleteConvo={deleteConversation} />
      <SidebarInset>
        <header className="flex items-center gap-2 border-b border-border p-3">
          <SidebarTrigger />
          <Gauge className="h-5 w-5 text-primary" />
          <h1 className="font-semibold">Bot Dashboard</h1>
          <Badge variant={st ? (st.mode === 'LIVE' ? 'destructive' : 'default') : 'secondary'} className="ml-auto">
            {st ? `${st.mode} · ${st.running ? 'RUNNING' : 'PAUSED'}` : 'BOT OFF · PUBLIC FEEDS'}
          </Badge>
        </header>
        <div className="space-y-4 p-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="BTC price" value={btcNow ? `$${Number(btcNow).toLocaleString(undefined, { maximumFractionDigits: 0 })}` : '—'} />
            <Stat label="Up / Down" value={upNow != null ? `${Number(upNow).toFixed(2)} / ${Number(downNow ?? 0).toFixed(2)}` : '—'} />
            <Stat label="Profit (all time)" value={livePnl != null ? `$${Number(livePnl).toFixed(2)}` : '—'} />
            <Stat label="Wins / losses" value={`${wins} / ${losses}`} />
          </div>

          {!st && (
            <Card className="p-3 text-sm text-muted-foreground">
              The bot isn't reachable, so BTC and Polymarket prices come from free public feeds. Profit history and the fastest prices need the bot running on your mini PC — start it from the Polymarket Speed Bot page.
              {historyOk === false && st === null && ' Once started, press Install bot there once so the dashboard can read its trade history.'}
            </Card>
          )}
          {st && historyOk === false && (
            <Card className="p-3 text-sm text-muted-foreground">
              This bot copy is too old to share its trade history. Press Install bot on the Polymarket Speed Bot page once, restart the bot, and the profit chart will fill in.
            </Card>
          )}

          <ChartCard title="BTC price (live)">
            <LiveChart data={live} lines={[{ key: 'btc', color: 'hsl(var(--primary))' }]} format={(v) => `$${Number(v).toLocaleString()}`} />
          </ChartCard>

          <ChartCard title="Polymarket contract prices (Up vs Down)">
            <LiveChart
              data={live}
              lines={[{ key: 'up', color: 'hsl(var(--primary))' }, { key: 'down', color: 'hsl(var(--destructive))' }]}
              format={(v) => `${(Number(v) * 100).toFixed(0)}¢`}
            />
          </ChartCard>

          <ChartCard title="Bot profit over time (all settled trades)">
            {allTime.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">No settled trades yet — the chart appears after the bot finishes its first window.</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={allTime} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
                  <XAxis dataKey="t" tickFormatter={(t) => new Date(Number(t) * 1000).toLocaleTimeString()} tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tickFormatter={(v) => `$${v}`} tick={{ fontSize: 10 }} width={60} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip labelFormatter={(t) => new Date(Number(t) * 1000).toLocaleString()} formatter={(v) => [`$${Number(v).toFixed(2)}`, 'Profit']} contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                  <ReferenceLine y={0} stroke="hsl(var(--border))" strokeDasharray="3 3" />
                  <Line type="stepAfter" dataKey="pnl" stroke="hsl(var(--primary))" dot={false} strokeWidth={2} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </div>
      </SidebarInset>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-mono text-lg">{value}</div>
    </Card>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="p-4">
      <h2 className="mb-2 text-sm font-medium">{title}</h2>
      {children}
    </Card>
  );
}

function LiveChart({ data, lines, format }: { data: LivePoint[]; lines: { key: keyof LivePoint; color: string }[]; format: (v: unknown) => string }) {
  if (data.length < 2) return <p className="p-4 text-sm text-muted-foreground">Waiting for data…</p>;
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
        <XAxis dataKey="t" tickFormatter={(t) => new Date(Number(t)).toLocaleTimeString()} tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
        <YAxis domain={['auto', 'auto']} tickFormatter={format} tick={{ fontSize: 10 }} width={70} stroke="hsl(var(--muted-foreground))" />
        <Tooltip labelFormatter={(t) => new Date(Number(t)).toLocaleTimeString()} formatter={format} contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
        {lines.map((l) => (
          <Line key={String(l.key)} type="monotone" dataKey={l.key} stroke={l.color} dot={false} strokeWidth={2} connectNulls isAnimationActive={false} />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
