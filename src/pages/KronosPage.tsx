import { useEffect, useMemo, useState } from 'react';
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { useConversations } from '@/hooks/useConversations';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { CandlestickChart, Download, Play, ExternalLink, Loader2 } from 'lucide-react';
import { kronos, KRONOS_MODELS, type KronosResult } from '@/lib/kronos';
import { useNavigate } from 'react-router-dom';

const INTERVALS = ['5m', '15m', '1h', '4h', '1d'];

function Chart({ data }: { data: KronosResult }) {
  const W = 900, H = 300, P = 30;
  const hist = data.history.slice(-150);
  const all = [...hist.map((h) => h.close), ...data.forecast.flatMap((f) => [f.high, f.low])];
  const min = Math.min(...all), max = Math.max(...all);
  const n = hist.length + data.forecast.length;
  const x = (i: number) => P + (i / (n - 1)) * (W - 2 * P);
  const y = (v: number) => H - P - ((v - min) / (max - min || 1)) * (H - 2 * P);
  const hp = hist.map((h, i) => `${x(i)},${y(h.close)}`).join(' ');
  const fp = [`${x(hist.length - 1)},${y(hist[hist.length - 1].close)}`, ...data.forecast.map((f, i) => `${x(hist.length + i)},${y(f.close)}`)].join(' ');
  const band = [...data.forecast.map((f, i) => `${x(hist.length + i)},${y(f.high)}`), ...data.forecast.map((f, i) => `${x(hist.length + i)},${y(f.low)}`).reverse()].join(' ');
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      <polygon points={band} className="fill-primary/15" />
      <polyline points={hp} fill="none" className="stroke-muted-foreground" strokeWidth={1.5} />
      <polyline points={fp} fill="none" className="stroke-primary" strokeWidth={2} strokeDasharray="5 3" />
      <line x1={x(hist.length - 1)} x2={x(hist.length - 1)} y1={P} y2={H - P} className="stroke-border" strokeDasharray="2 4" />
      <text x={P} y={16} className="fill-muted-foreground text-[11px]">{max.toFixed(2)}</text>
      <text x={P} y={H - 8} className="fill-muted-foreground text-[11px]">{min.toFixed(2)}</text>
    </svg>
  );
}

export default function KronosPage() {
  const navigate = useNavigate();
  const { conversations, currentConvoId, createConversation, selectConversation, deleteConversation } = useConversations();
  const [installed, setInstalled] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [symbol, setSymbol] = useState('BTCUSDT');
  const [interval, setIntervalV] = useState('1h');
  const [lookback, setLookback] = useState(400);
  const [pred, setPred] = useState(24);
  const [modelIdx, setModelIdx] = useState(1);
  const [samples, setSamples] = useState(1);
  const [result, setResult] = useState<KronosResult | null>(null);

  useEffect(() => { kronos.status().then(setInstalled); }, []);

  const install = async () => {
    setBusy('install');
    try { await kronos.install(); setInstalled(await kronos.status()); toast.success('Kronos installed'); }
    catch (e) { toast.error(`Install failed: ${(e as Error).message}`); }
    finally { setBusy(null); }
  };

  const run = async () => {
    setBusy('forecast');
    try {
      const r = await kronos.forecast({ symbol: symbol.toUpperCase().trim(), interval, lookback, pred, model: KRONOS_MODELS[modelIdx], samples });
      setResult(r); toast.success('Forecast ready');
    } catch (e) { toast.error(`Forecast failed: ${(e as Error).message}`); }
    finally { setBusy(null); }
  };

  const summary = useMemo(() => {
    if (!result) return null;
    const last = result.history[result.history.length - 1].close;
    const end = result.forecast[result.forecast.length - 1].close;
    return { last, end, pct: ((end - last) / last) * 100 };
  }, [result]);

  return (
    <div className="flex min-h-screen w-full">
      <AppSidebar
        conversations={conversations}
        currentConvoId={currentConvoId}
        onNewChat={() => { createConversation(); navigate('/chat'); }}
        onSelectConvo={(id) => { selectConversation(id); navigate('/chat'); }}
        onDeleteConvo={deleteConversation}
      />
      <SidebarInset>
        <header className="h-12 border-b border-border/50 flex items-center px-4 gap-3">
          <SidebarTrigger />
          <CandlestickChart className="h-4 w-4 text-primary" />
          <h1 className="text-sm font-semibold tracking-tight">Kronos — Market Forecasts</h1>
          <Badge variant={installed ? 'default' : 'outline'} className="ml-2 text-[10px]">{installed ? 'INSTALLED' : 'NOT INSTALLED'}</Badge>
          <Button size="sm" variant="outline" className="ml-auto" asChild>
            <a href="https://shiyu-coder.github.io/Kronos-demo/" target="_blank" rel="noreferrer"><ExternalLink className="h-3 w-3 mr-1" />Live demo</a>
          </Button>
        </header>

        <main className="p-4 space-y-4 max-w-6xl mx-auto w-full">
          <Card className="p-4 space-y-3">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Setup</div>
            <p className="text-sm text-muted-foreground">
              Kronos is an open AI model trained on price candles from 45+ exchanges. It predicts the next candles for a
              coin. Install downloads it to <code className="text-xs">~/.aiapp/kronos</code> on your mini PC (needs Python 3.10+ and git).
              Forecasts are guesses, not financial advice.
            </p>
            <Button size="sm" disabled={!!busy} onClick={install}>
              {busy === 'install' ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Download className="h-3 w-3 mr-1" />}
              {installed ? 'Update' : 'Install'}
            </Button>
          </Card>

          <Card className="p-4 space-y-3">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Forecast (live Binance prices)</div>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
              <label className="text-xs space-y-1">Pair<Input value={symbol} onChange={(e) => setSymbol(e.target.value)} /></label>
              <label className="text-xs space-y-1">Candle
                <select value={interval} onChange={(e) => setIntervalV(e.target.value)} className="w-full h-10 rounded-md border border-input bg-background px-2 text-sm">
                  {INTERVALS.map((i) => <option key={i}>{i}</option>)}
                </select>
              </label>
              <label className="text-xs space-y-1">History<Input type="number" min={50} max={1000} value={lookback} onChange={(e) => setLookback(+e.target.value)} /></label>
              <label className="text-xs space-y-1">Predict<Input type="number" min={1} max={240} value={pred} onChange={(e) => setPred(+e.target.value)} /></label>
              <label className="text-xs space-y-1">Model
                <select value={modelIdx} onChange={(e) => setModelIdx(+e.target.value)} className="w-full h-10 rounded-md border border-input bg-background px-2 text-sm">
                  {KRONOS_MODELS.map((m, i) => <option key={m.id} value={i}>{m.label}</option>)}
                </select>
              </label>
              <label className="text-xs space-y-1">Samples<Input type="number" min={1} max={10} value={samples} onChange={(e) => setSamples(+e.target.value)} /></label>
            </div>
            <Button size="sm" disabled={!!busy || !installed} onClick={run}>
              {busy === 'forecast' ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Play className="h-3 w-3 mr-1" />}
              Run forecast
            </Button>
            {busy === 'forecast' && <p className="text-xs text-muted-foreground">First run downloads the model — can take a few minutes.</p>}
          </Card>

          {result && summary && (
            <Card className="p-4 space-y-3">
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <span>Now <b>{summary.last.toFixed(4)}</b></span>
                <span>Predicted <b>{summary.end.toFixed(4)}</b></span>
                <Badge variant={summary.pct >= 0 ? 'default' : 'destructive'}>{summary.pct >= 0 ? '+' : ''}{summary.pct.toFixed(2)}%</Badge>
                <span className="text-xs text-muted-foreground ml-auto">grey = real · dashed = Kronos · shaded = high/low range</span>
              </div>
              <Chart data={result} />
            </Card>
          )}
        </main>
      </SidebarInset>
    </div>
  );
}
