import { useEffect, useRef, useState } from 'react';
import { Shield, Play, Square, Download, Trash2, Terminal as TermIcon, Sparkles, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { runVortex, type VortexEvent } from '@/lib/vortex';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { getSettings } from '@/lib/settings';

const SAFE_TARGETS = [
  'https://testphp.vulnweb.com',
  'https://demo.testfire.net',
  'https://juice-shop.herokuapp.com',
];

export default function VortexPage() {
  const [target, setTarget] = useState('');
  const [events, setEvents] = useState<VortexEvent[]>([]);
  const [report, setReport] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [maxSteps, setMaxSteps] = useState(15);
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [events]);

  const start = async () => {
    if (!target.trim()) { toast.error('Enter a target URL or host'); return; }
    if (!getSettings().defaultModel) { toast.error('Pick a default model in Settings first'); return; }
    setEvents([]); setReport(null); setRunning(true);
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    try {
      const r = await runVortex({
        target: target.trim(),
        maxSteps,
        onEvent: (e) => setEvents((prev) => [...prev, e]),
        signal: ctrl.signal,
      });
      if (r) setReport(r);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setRunning(false);
      abortRef.current = null;
    }
  };

  const stop = () => { abortRef.current?.abort(); setRunning(false); };

  const exportReport = () => {
    if (!report) return;
    const blob = new Blob([`# Vortex Assessment — ${target}\n\nGenerated: ${new Date().toISOString()}\n\n${report}`], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `vortex-report-${Date.now()}.md`; a.click();
    URL.revokeObjectURL(url);
  };

  const badgeFor = (t: VortexEvent['type']) => {
    switch (t) {
      case 'thought': return 'bg-primary/10 text-primary border-primary/30';
      case 'command': return 'bg-amber-500/10 text-amber-500 border-amber-500/30';
      case 'output':  return 'bg-secondary/60 text-foreground border-border';
      case 'report':  return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30';
      case 'error':   return 'bg-destructive/10 text-destructive border-destructive/30';
      case 'blocked': return 'bg-red-500/10 text-red-500 border-red-500/30';
      case 'done':    return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="border-b border-border/50 p-4 shrink-0">
        <div className="flex items-center gap-2 mb-1">
          <Shield className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-semibold">Vortex — AI Security Agent</h1>
          <Badge variant="outline" className="ml-2 text-[10px]">autonomous</Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          Drop a target URL. The agent runs recon → scan → enumeration → report autonomously via your local terminal.
        </p>
      </div>

      <div className="p-4 space-y-3 shrink-0 border-b border-border/50">
        <div className="flex gap-2">
          <Input
            placeholder="https://target.example.com or 10.0.0.5"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            disabled={running}
            onKeyDown={(e) => { if (e.key === 'Enter' && !running) start(); }}
          />
          <Input
            type="number"
            className="w-24"
            min={1} max={50}
            value={maxSteps}
            onChange={(e) => setMaxSteps(Number(e.target.value) || 15)}
            disabled={running}
            title="Max steps"
          />
          {running ? (
            <Button variant="destructive" onClick={stop}><Square className="h-4 w-4 mr-1" />Stop</Button>
          ) : (
            <Button onClick={start}><Play className="h-4 w-4 mr-1" />Scan</Button>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5 items-center text-xs text-muted-foreground">
          <span>Safe targets:</span>
          {SAFE_TARGETS.map((t) => (
            <button key={t} onClick={() => setTarget(t)} disabled={running}
              className="px-2 py-0.5 rounded border border-border hover:border-primary/50 hover:text-primary transition-colors">
              {t.replace(/^https?:\/\//, '')}
            </button>
          ))}
        </div>
        <div className="flex items-start gap-2 text-[11px] text-amber-500/90">
          <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
          <span>Only test targets you own or have explicit permission to assess. Unauthorized scanning is illegal.</span>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 min-h-0 overflow-hidden">
        <Card className="rounded-none border-0 border-r border-border/50 flex flex-col min-h-0">
          <div className="p-2 border-b border-border/50 flex items-center gap-2 text-xs font-medium">
            <TermIcon className="h-3.5 w-3.5" /> Live activity
            <span className="ml-auto text-muted-foreground">{events.length} events</span>
            {events.length > 0 && (
              <Button size="sm" variant="ghost" className="h-6 px-2" onClick={() => setEvents([])} disabled={running}>
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
          <ScrollArea className="flex-1">
            <div ref={scrollRef} className="p-3 space-y-2 font-mono text-[11px]">
              {events.length === 0 && !running && (
                <div className="text-muted-foreground text-xs italic">No activity yet. Enter a target and hit Scan.</div>
              )}
              {events.map((e, i) => (
                <div key={i} className={`rounded border px-2 py-1.5 ${badgeFor(e.type)}`}>
                  <div className="uppercase text-[9px] tracking-wider opacity-70 mb-0.5">{e.type}</div>
                  <pre className="whitespace-pre-wrap break-words">{e.text}</pre>
                </div>
              ))}
              {running && <div className="text-primary animate-pulse text-xs">▸ agent thinking…</div>}
            </div>
          </ScrollArea>
        </Card>

        <Card className="rounded-none border-0 flex flex-col min-h-0">
          <div className="p-2 border-b border-border/50 flex items-center gap-2 text-xs font-medium">
            <Sparkles className="h-3.5 w-3.5" /> Final Report
            {report && (
              <Button size="sm" variant="ghost" className="ml-auto h-6 px-2" onClick={exportReport}>
                <Download className="h-3 w-3 mr-1" /> Export
              </Button>
            )}
          </div>
          <ScrollArea className="flex-1">
            <div className="p-4">
              {report ? (
                <MarkdownRenderer content={report} />
              ) : (
                <div className="text-muted-foreground text-xs italic">
                  The report appears here once the agent finishes its assessment.
                </div>
              )}
            </div>
          </ScrollArea>
        </Card>
      </div>
    </div>
  );
}
