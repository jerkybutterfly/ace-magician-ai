import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { useConversations } from '@/hooks/useConversations';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { Eye, RefreshCw, Play, Square, Download, ExternalLink, ScrollText, Globe2, Map as MapIcon, Send, Sparkles } from 'lucide-react';
import WorldEventsMap from '@/components/WorldEventsMap';
import PolymarketScanner from '@/components/PolymarketScanner';
import { pythia, osirisUrl, fetchFallbackFeeds, viewToPoints, type MapPoint, type Prediction } from '@/lib/pythia';

export default function PythiaPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const mapOnly = location.pathname === '/world-map';
  const { conversations, currentConvoId, createConversation, selectConversation, deleteConversation } = useConversations();
  const [busy, setBusy] = useState<string | null>(null);
  const [output, setOutput] = useState('');
  const [installed, setInstalled] = useState(false);
  const [engineUp, setEngineUp] = useState(false);
  const [points, setPoints] = useState<MapPoint[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [summary, setSummary] = useState('');
  const [globe, setGlobe] = useState(true);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');

  const loadWorld = useCallback(async () => {
    try {
      await pythia.links();
      const v = await pythia.view();
      setEngineUp(true);
      setPoints(viewToPoints(v));
      setPredictions(v.predictions ?? []);
      setSummary(v.summary ?? '');
    } catch {
      setEngineUp(false);
      setPredictions([]);
      setSummary('');
      setPoints(await fetchFallbackFeeds().catch(() => []));
    }
  }, []);

  const refresh = useCallback(async () => {
    const inst = await pythia.checkInstalled().catch(() => ({ stdout: '' }));
    setInstalled((inst.stdout || '').includes('INSTALLED') && !(inst.stdout || '').includes('NOT_INSTALLED'));
    await loadWorld();
  }, [loadWorld]);

  useEffect(() => { refresh(); const id = setInterval(loadWorld, 120_000); return () => clearInterval(id); }, [refresh, loadWorld]);

  const run = async (label: string, fn: () => Promise<{ stdout: string; stderr: string }>) => {
    setBusy(label); setOutput('');
    try {
      const r = await fn();
      setOutput((r.stdout || '') + (r.stderr ? `\n${r.stderr}` : ''));
      toast.success(`${label} finished`);
      await refresh();
    } catch (e) {
      toast.error(`${label} failed: ${(e as Error).message}`);
    } finally { setBusy(null); }
  };

  const ask = async () => {
    if (!question.trim()) return;
    setBusy('Ask'); setAnswer('');
    try {
      const r = question.toLowerCase().startsWith('what if')
        ? await pythia.whatif(question).then((x) => ({ answer: x.narrative }))
        : await pythia.chat(question);
      setAnswer(r.answer ?? 'No answer.');
    } catch (e) { toast.error(`PYTHIA isn't answering: ${(e as Error).message}`); }
    finally { setBusy(null); }
  };

  const kinds = useMemo(() => {
    const m = new Map<string, number>();
    points.forEach((p) => m.set(p.kind, (m.get(p.kind) ?? 0) + 1));
    return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
  }, [points]);

  const Header = (
    <header className="h-12 border-b border-border/50 flex items-center px-4 gap-3 shrink-0">
      <SidebarTrigger />
      {mapOnly ? <Globe2 className="h-4 w-4 text-primary" /> : <Eye className="h-4 w-4 text-primary" />}
      <h1 className="text-sm font-semibold tracking-tight">{mapOnly ? 'World Map' : 'PYTHIA'}</h1>
      <Badge variant={engineUp ? 'default' : 'outline'} className="text-[10px] font-mono">
        {engineUp ? 'LIVE · PYTHIA' : 'FREE FEEDS'}
      </Badge>
      <div className="ml-auto flex gap-2">
        <Button size="sm" variant="outline" onClick={() => setGlobe((g) => !g)}>
          {globe ? <MapIcon className="h-3 w-3" /> : <Globe2 className="h-3 w-3" />}
        </Button>
        <Button size="sm" variant="outline" onClick={refresh}><RefreshCw className="h-3 w-3" /></Button>
      </div>
    </header>
  );

  const MapCard = (
    <Card className={`relative overflow-hidden p-0 ${mapOnly ? 'flex-1 rounded-none border-0' : 'h-[55vh]'}`}>
      <WorldEventsMap points={points} globe={globe} />
      <div className="absolute left-2 bottom-8 bg-background/80 backdrop-blur rounded-md px-2 py-1 text-[10px] font-mono space-y-0.5 max-w-[60%]">
        <div>{points.length} live events</div>
        {kinds.map(([k, n]) => <div key={k} className="truncate">{k}: {n}</div>)}
      </div>
    </Card>
  );

  return (
    <div className="flex min-h-screen w-full">
      <AppSidebar
        conversations={conversations}
        currentConvoId={currentConvoId}
        onNewChat={() => { createConversation(); navigate('/chat'); }}
        onSelectConvo={(id) => { selectConversation(id); navigate('/chat'); }}
        onDeleteConvo={deleteConversation}
      />
      <SidebarInset className="h-dvh flex flex-col">
        {Header}
        {mapOnly ? MapCard : (
          <main className="p-4 space-y-4 max-w-5xl mx-auto w-full overflow-auto">
            {MapCard}
            {!engineUp && (
              <p className="text-xs text-muted-foreground">
                Showing free live earthquake and disaster feeds. Start PYTHIA below to add conflict, markets, news and forecasts.
              </p>
            )}

            {engineUp && (
              <Card className="p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                  <Sparkles className="h-3.5 w-3.5" /> Forecasts
                  <Button size="sm" variant="outline" className="ml-auto" disabled={!!busy}
                    onClick={async () => { await pythia.predict().catch(() => null); toast.success('New forecast started — check back in about a minute'); }}>
                    Forecast now
                  </Button>
                </div>
                {summary && <p className="text-sm text-muted-foreground">{summary}</p>}
                <div className="grid gap-2 sm:grid-cols-2">
                  {predictions.slice(0, 12).map((p, i) => (
                    <div key={p.id ?? i} className="rounded-md border border-border/50 p-2 text-sm">
                      <div className="flex gap-2 items-center">
                        <Badge variant="outline" className="text-[10px]">{p.horizon ?? '—'}</Badge>
                        {p.probability != null && <span className="font-mono text-primary">{Math.round(p.probability * 100)}%</span>}
                      </div>
                      <div className="mt-1">{p.title ?? p.claim ?? p.text}</div>
                    </div>
                  ))}
                  {predictions.length === 0 && <p className="text-sm text-muted-foreground">No forecasts yet — press Forecast now.</p>}
                </div>
                <div className="flex gap-2">
                  <Input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder='Ask the oracle, or "What if…"'
                    onKeyDown={(e) => e.key === 'Enter' && ask()} />
                  <Button disabled={!!busy} onClick={ask}><Send className="h-4 w-4" /></Button>
                </div>
                {answer && <p className="text-sm whitespace-pre-wrap">{answer}</p>}
              </Card>
            )}

            <Card className="p-4 space-y-3">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Step 1 — Install on your mini PC</div>
              <p className="text-sm text-muted-foreground">
                PYTHIA watches 40+ free live world feeds and uses your own Ollama model to forecast what happens next
                (next day, week, month, year). No cloud, no keys.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" disabled={!!busy} onClick={() => run('Check tools', pythia.checkTools)}>Check tools</Button>
                <Button size="sm" variant="outline" disabled={!!busy} onClick={() => run('Install uv', pythia.installUv)}>Install uv</Button>
                <Button size="sm" disabled={!!busy} onClick={() => run('Install', pythia.install)}>
                  <Download className="h-3 w-3 mr-1" /> {busy === 'Install' ? 'Installing…' : 'Install PYTHIA'}
                </Button>
                <Button size="sm" variant="outline" disabled={!!busy} onClick={() => run('Pull model', pythia.pullModel)}>Get llama3.1 model</Button>
              </div>
              <p className="text-xs text-muted-foreground">Needs Git (which includes bash), Node.js, Python 3.11+ and Ollama.</p>
            </Card>

            <Card className="p-4 space-y-3">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Step 2 — Start / stop</div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" disabled={!!busy || !installed} onClick={() => run('Start', pythia.start)}>
                  <Play className="h-3 w-3 mr-1" /> {busy === 'Start' ? 'Starting…' : 'Start'}
                </Button>
                <Button size="sm" variant="outline" disabled={!!busy || !installed} onClick={() => run('Stop', pythia.stop)}>
                  <Square className="h-3 w-3 mr-1" /> Stop
                </Button>
                <Button size="sm" variant="outline" disabled={!!busy || !installed} onClick={() => run('Logs', pythia.logs)}>
                  <ScrollText className="h-3 w-3 mr-1" /> Logs
                </Button>
                {engineUp && (
                  <Button size="sm" variant="outline" asChild>
                    <a href={osirisUrl()} target="_blank" rel="noreferrer"><ExternalLink className="h-3 w-3 mr-1" /> Open full globe</a>
                  </Button>
                )}
              </div>
            </Card>

            {output && (
              <Card className="p-0 overflow-hidden">
                <div className="px-4 py-2 border-b text-xs uppercase tracking-wider text-muted-foreground">Output</div>
                <ScrollArea className="h-64"><pre className="p-3 text-[11px] font-mono whitespace-pre-wrap">{output}</pre></ScrollArea>
              </Card>
            )}

            <PolymarketScanner engineUp={engineUp} />
          </main>
        )}
      </SidebarInset>
    </div>
  );
}
