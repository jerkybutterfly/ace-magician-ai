import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Eye, Play, Pause, Square, ShieldAlert, MousePointerClick, Keyboard, Monitor } from 'lucide-react';
import { toast } from 'sonner';
import {
  cuScreenshot, cuDecide, cuExecute, cuScreenSize, summarizeAction,
  type CUDecision, type CUHistoryEntry,
} from '@/lib/computer-use';

interface LogEntry {
  ts: number;
  thought: string;
  action: string;
  risk: 'low' | 'medium' | 'high';
  status: 'pending' | 'approved' | 'executed' | 'skipped' | 'error';
  detail?: string;
}

export default function ComputerUsePage() {
  const [goal, setGoal] = useState('');
  const [running, setRunning] = useState(false);
  const [autoApprove, setAutoApprove] = useState(false);
  const [maxSteps, setMaxSteps] = useState(15);
  const [stepDelay, setStepDelay] = useState(1.2);
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [screenSize, setScreenSize] = useState<{ w: number; h: number } | null>(null);
  const [pyAvailable, setPyAvailable] = useState<boolean | null>(null);
  const [pending, setPending] = useState<CUDecision | null>(null);
  const [log, setLog] = useState<LogEntry[]>([]);
  const stopRef = useRef(false);
  const approveRef = useRef<((ok: boolean) => void) | null>(null);

  useEffect(() => {
    cuScreenSize()
      .then((s) => {
        setPyAvailable(s.available);
        if (s.available) setScreenSize({ w: s.width, h: s.height });
      })
      .catch(() => setPyAvailable(false));
  }, []);

  const pushLog = (entry: LogEntry) => setLog((l) => [...l, entry].slice(-100));

  const stop = () => {
    stopRef.current = true;
    setRunning(false);
    if (approveRef.current) { approveRef.current(false); approveRef.current = null; }
    setPending(null);
  };

  const approve = (ok: boolean) => {
    if (approveRef.current) { approveRef.current(ok); approveRef.current = null; }
    setPending(null);
  };

  const start = async () => {
    if (!goal.trim()) { toast.error('Set a goal first'); return; }
    setRunning(true);
    stopRef.current = false;
    setLog([]);
    const history: CUHistoryEntry[] = [];

    for (let step = 1; step <= maxSteps; step++) {
      if (stopRef.current) break;
      try {
        const shot = await cuScreenshot();
        setScreenshot(shot.image);
        if (shot.width && shot.height) setScreenSize({ w: shot.width, h: shot.height });

        toast.message(`Step ${step}: thinking…`);
        const decision = await cuDecide(goal, shot.image, history);
        const summary = summarizeAction(decision.action);
        const entry: LogEntry = {
          ts: Date.now(),
          thought: decision.thought,
          action: summary,
          risk: decision.risk,
          status: 'pending',
        };
        pushLog(entry);

        if (decision.action.type === 'done' || decision.action.type === 'fail') {
          entry.status = 'executed';
          setLog((l) => [...l]);
          toast[decision.action.type === 'done' ? 'success' : 'error'](`${decision.action.type.toUpperCase()}: ${decision.action.reason || ''}`);
          break;
        }

        const needsApproval = decision.needs_approval || decision.risk === 'high' || !autoApprove;
        if (needsApproval) {
          setPending(decision);
          const ok = await new Promise<boolean>((res) => { approveRef.current = res; });
          if (!ok) {
            entry.status = 'skipped';
            setLog((l) => [...l]);
            history.push({ summary: `SKIPPED: ${summary}` });
            if (stopRef.current) break;
            continue;
          }
        }

        await cuExecute(decision.action);
        entry.status = 'executed';
        setLog((l) => [...l]);
        history.push({ summary });
        await new Promise((r) => setTimeout(r, stepDelay * 1000));
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        pushLog({ ts: Date.now(), thought: 'error', action: msg, risk: 'low', status: 'error' });
        toast.error(msg);
        break;
      }
    }
    setRunning(false);
  };

  const refreshShot = async () => {
    try {
      const s = await cuScreenshot();
      setScreenshot(s.image);
      if (s.width && s.height) setScreenSize({ w: s.width, h: s.height });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Screenshot failed');
    }
  };

  return (
    <div className="flex-1 overflow-auto p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Monitor className="h-5 w-5 text-primary" />
        <h1 className="text-2xl font-bold">Computer Use</h1>
        <Badge variant="outline" className="ml-2">Vision · Action · Verify</Badge>
      </div>

      <Alert>
        <ShieldAlert className="h-4 w-4" />
        <AlertTitle>How it works</AlertTitle>
        <AlertDescription className="text-xs">
          The agent screenshots your desktop, an AI vision model decides the next click/type/key, and the agent executes it.
          High-risk actions always require approval. Move your mouse to a screen corner to abort (pyautogui failsafe).
          Requires <code className="px-1 py-0.5 rounded bg-muted">pip install pyautogui pillow</code> on your mini PC, plus
          Screen Recording + Accessibility permissions on macOS.
        </AlertDescription>
      </Alert>

      {pyAvailable === false && (
        <Alert variant="destructive">
          <AlertTitle>pyautogui not available</AlertTitle>
          <AlertDescription className="text-xs space-y-1">
            <p>Install on the agent host (desktop/mini PC): <code>pip install pyautogui pillow</code> (Linux also needs <code>scrot python3-tk</code>), then restart <code>agent.py</code>.</p>
            <p className="text-muted-foreground">⚠️ Not available on Android — pyautogui requires a desktop OS (Windows/macOS/Linux). Use the Phone page for Android remote control instead.</p>
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2"><MousePointerClick className="h-4 w-4" /> Task</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            placeholder="e.g. Open Chrome, search for the weather in London, and read the first result"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            rows={3}
            disabled={running}
          />
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch id="auto" checked={autoApprove} onCheckedChange={setAutoApprove} disabled={running} />
              <Label htmlFor="auto" className="text-xs">Auto-approve low/medium-risk actions</Label>
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-xs">Max steps</Label>
              <Input type="number" className="w-20 h-8" value={maxSteps} onChange={(e) => setMaxSteps(parseInt(e.target.value) || 1)} disabled={running} />
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-xs">Step delay (s)</Label>
              <Input type="number" step="0.1" className="w-20 h-8" value={stepDelay} onChange={(e) => setStepDelay(parseFloat(e.target.value) || 0.5)} disabled={running} />
            </div>
            <div className="ml-auto flex gap-2">
              <Button variant="outline" size="sm" onClick={refreshShot} disabled={running}><Eye className="h-4 w-4 mr-1" /> Preview</Button>
              {!running ? (
                <Button size="sm" onClick={start} disabled={pyAvailable === false}><Play className="h-4 w-4 mr-1" /> Start</Button>
              ) : (
                <Button size="sm" variant="destructive" onClick={stop}><Square className="h-4 w-4 mr-1" /> Stop</Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {pending && (
        <Card className="border-yellow-500/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-yellow-500" /> Approval required
              <Badge variant={pending.risk === 'high' ? 'destructive' : 'secondary'}>{pending.risk} risk</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground italic">{pending.thought}</p>
            <p className="font-mono text-sm">{summarizeAction(pending.action)}</p>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => approve(true)}>Approve & run</Button>
              <Button size="sm" variant="outline" onClick={() => approve(false)}>Skip</Button>
              <Button size="sm" variant="destructive" onClick={stop}>Stop loop</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Eye className="h-4 w-4" /> Live screenshot
              {screenSize && <Badge variant="outline" className="ml-auto">{screenSize.w}×{screenSize.h}</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {screenshot ? (
              <img src={`data:image/png;base64,${screenshot}`} alt="desktop" className="w-full rounded border border-border" />
            ) : (
              <div className="aspect-video flex items-center justify-center text-xs text-muted-foreground border border-dashed border-border rounded">
                No screenshot yet
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2"><Keyboard className="h-4 w-4" /> Action log</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-2">
              {log.length === 0 ? (
                <p className="text-xs text-muted-foreground">No actions yet.</p>
              ) : (
                <ul className="space-y-2">
                  {log.map((e, i) => (
                    <li key={i} className="text-xs border-l-2 pl-2 border-border">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={e.status === 'executed' ? 'default' : e.status === 'error' ? 'destructive' : 'secondary'}
                          className="text-[10px]"
                        >
                          {e.status}
                        </Badge>
                        <span className="font-mono">{e.action}</span>
                        <Badge variant="outline" className="ml-auto text-[10px]">{e.risk}</Badge>
                      </div>
                      <p className="text-muted-foreground italic mt-0.5">{e.thought}</p>
                    </li>
                  ))}
                </ul>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
