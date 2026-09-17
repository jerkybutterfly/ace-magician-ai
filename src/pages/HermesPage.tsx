import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Play, Square, Trash2, GraduationCap, RefreshCw } from 'lucide-react';
import { runHermes, getRuns, clearRuns, type HermesRun, type HermesStep } from '@/lib/hermes';
import { getLessons, overwriteLessons, clearLessons } from '@/lib/learning';
import type { PermissionDecision } from '@/lib/agent-tools';

const KIND_STYLE: Record<HermesStep['kind'], string> = {
  plan: 'border-primary/40',
  action: 'border-amber-500/50',
  observation: 'border-muted',
  reflection: 'border-emerald-500/50',
  error: 'border-destructive/60',
  done: 'border-emerald-500/60',
};

export default function HermesPage() {
  const [goal, setGoal] = useState('');
  const [maxSteps, setMaxSteps] = useState(12);
  const [autoApprove, setAutoApprove] = useState(false);
  const [running, setRunning] = useState(false);
  const [steps, setSteps] = useState<HermesStep[]>([]);
  const [runs, setRuns] = useState<HermesRun[]>([]);
  const [lessons, setLessons] = useState('');
  const [pending, setPending] = useState<{ tag: string; tool: string; reason: string } | null>(null);
  const resolverRef = useRef<((d: PermissionDecision) => void) | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const logRef = useRef<HTMLDivElement>(null);

  const loadLessons = () => getLessons().then(setLessons).catch(() => {});

  useEffect(() => {
    setRuns(getRuns());
    loadLessons();
  }, []);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: 'smooth' });
  }, [steps]);

  const askPermission = (info: { tag: string; tool: string; reason: string }) =>
    new Promise<PermissionDecision>((resolve) => {
      setPending(info);
      resolverRef.current = (d) => {
        setPending(null);
        resolverRef.current = null;
        resolve(d);
      };
    });

  const start = async () => {
    if (!goal.trim() || running) return;
    setSteps([]);
    setRunning(true);
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    try {
      const run = await runHermes(goal.trim(), {
        maxSteps,
        autoApprove,
        requestPermission: askPermission,
        signal: ctrl.signal,
        onStep: (s) => setSteps((prev) => [...prev, s]),
      });
      setRuns(getRuns());
      loadLessons();
      toast({ title: `Run ${run.status}`, description: run.lesson || `${run.steps.length} steps completed.` });
    } catch (e) {
      toast({ title: 'Run failed', description: e instanceof Error ? e.message : 'Unknown error' });
    } finally {
      setRunning(false);
      abortRef.current = null;
      resolverRef.current?.('deny');
    }
  };

  const stop = () => {
    abortRef.current?.abort();
    resolverRef.current?.('deny');
  };

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-4 overflow-y-auto h-full pb-10">
      <div className="flex items-center gap-2">
        <GraduationCap className="h-5 w-5 text-primary" />
        <h1 className="text-xl font-semibold">Hermes Agent</h1>
        <Badge variant="outline" className="ml-auto">self-learning loop</Badge>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Goal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            rows={3}
            placeholder="e.g. Find every log file over 50 MB on the C drive and list them with their sizes"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
          />
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="steps" className="text-xs">Max steps</Label>
              <Input
                id="steps"
                type="number"
                min={1}
                max={40}
                value={maxSteps}
                onChange={(e) => setMaxSteps(Math.max(1, Math.min(40, Number(e.target.value) || 12)))}
                className="h-8 w-20"
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch id="auto" checked={autoApprove} onCheckedChange={setAutoApprove} />
              <Label htmlFor="auto" className="text-xs">Auto-approve actions</Label>
            </div>
            <div className="ml-auto flex gap-2">
              {running ? (
                <Button variant="destructive" size="sm" onClick={stop}>
                  <Square className="h-4 w-4 mr-1" /> Stop
                </Button>
              ) : (
                <Button size="sm" onClick={start} disabled={!goal.trim()}>
                  <Play className="h-4 w-4 mr-1" /> Run
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {pending && (
        <Card className="border-amber-500/60">
          <CardContent className="py-3 space-y-2">
            <p className="text-sm">
              Approve <span className="font-mono text-xs">{pending.tag}</span>?
              {pending.reason ? <span className="text-muted-foreground"> — {pending.reason}</span> : null}
            </p>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => resolverRef.current?.('approve')}>Approve</Button>
              <Button size="sm" variant="outline" onClick={() => resolverRef.current?.('approve-session')}>Approve for session</Button>
              <Button size="sm" variant="destructive" onClick={() => resolverRef.current?.('deny')}>Deny</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Live loop</CardTitle>
        </CardHeader>
        <CardContent>
          <div ref={logRef} className="space-y-2 max-h-[420px] overflow-y-auto">
            {steps.length === 0 ? (
              <p className="text-sm text-muted-foreground">No run yet. Give Hermes a goal and press Run.</p>
            ) : (
              steps.map((s) => (
                <div key={s.id} className={`border-l-2 pl-3 py-1 ${KIND_STYLE[s.kind]}`}>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{s.kind}</p>
                  <pre className="text-xs whitespace-pre-wrap break-words">{s.text}</pre>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2 flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">Lessons learned</CardTitle>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={loadLessons}><RefreshCw className="h-4 w-4" /></Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={async () => { await clearLessons(); setLessons(''); }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <Textarea
            rows={8}
            value={lessons}
            onChange={(e) => setLessons(e.target.value)}
            className="font-mono text-xs"
            placeholder="Lessons written by Hermes after each run appear here."
          />
          <Button
            size="sm"
            onClick={async () => { await overwriteLessons(lessons); toast({ title: 'Lessons saved' }); }}
          >
            Save lessons
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2 flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">Past runs</CardTitle>
          <Button variant="ghost" size="icon" onClick={() => { clearRuns(); setRuns([]); }}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {runs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No past runs.</p>
          ) : (
            runs.map((r) => (
              <button
                key={r.id}
                onClick={() => setSteps(r.steps)}
                className="w-full text-left border rounded-lg p-3 hover:bg-secondary/40 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Badge variant={r.status === 'done' ? 'default' : 'outline'}>{r.status}</Badge>
                  <span className="text-sm truncate">{r.goal}</span>
                  <span className="ml-auto text-[10px] text-muted-foreground">{r.steps.length} steps</span>
                </div>
                {r.lesson && <p className="text-xs text-muted-foreground mt-1">📘 {r.lesson}</p>}
              </button>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
