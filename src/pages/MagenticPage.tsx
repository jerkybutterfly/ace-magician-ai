import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { installMagentic, runMagentic } from '@/lib/magentic';

export default function MagenticPage() {
  const [busy, setBusy] = useState(false);
  const [task, setTask] = useState('Research the current price of BTC and summarize the last 24h news.');
  const [model, setModel] = useState('llama3.2');
  const [out, setOut] = useState('');

  const wrap = async (label: string, fn: () => Promise<any>) => {
    setBusy(true);
    try {
      const r = await fn();
      setOut((r.stdout || '') + (r.stderr ? `\n---stderr---\n${r.stderr}` : ''));
      toast.success(`${label} done`);
    } catch (e: any) { toast.error(`${label} failed: ${e.message}`); }
    finally { setBusy(false); }
  };

  return (
    <div className="p-4 space-y-4 overflow-y-auto">
      <div>
        <h1 className="text-2xl font-semibold">Magentic-One</h1>
        <p className="text-sm text-muted-foreground">
          Microsoft's hierarchical multi-agent planner: Orchestrator + WebSurfer + FileSurfer + Coder + Terminal, driven by Ollama.
        </p>
      </div>
      <Card>
        <CardHeader><CardTitle>Setup</CardTitle></CardHeader>
        <CardContent>
          <Button disabled={busy} onClick={() => wrap('Install', installMagentic)}>Install / update on host</Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Run task</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <Input value={model} onChange={(e) => setModel(e.target.value)} placeholder="Ollama model" />
          <Textarea rows={4} value={task} onChange={(e) => setTask(e.target.value)} />
          <Button disabled={busy || !task} onClick={() => wrap('Run', () => runMagentic(task, model))}>Run</Button>
          {out && <pre className="text-xs bg-muted p-2 rounded whitespace-pre-wrap max-h-[500px] overflow-auto">{out}</pre>}
        </CardContent>
      </Card>
    </div>
  );
}
