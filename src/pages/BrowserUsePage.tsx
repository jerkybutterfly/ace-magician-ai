import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { installBrowserUse, runBrowserTask } from '@/lib/browser-use';
import { SendToChatButton } from '@/components/SendToChatButton';

const EXAMPLES = [
  'Go to news.ycombinator.com and give me the top 5 stories with a one-line summary each.',
  'Search Google for the current price of Bitcoin and report the number.',
  'Open my Alpaca dashboard and read out my portfolio equity.',
];

export default function BrowserUsePage() {
  const [busy, setBusy] = useState(false);
  const [model, setModel] = useState('llama3.2');
  const [task, setTask] = useState(EXAMPLES[0]);
  const [maxSteps, setMaxSteps] = useState(25);
  const [output, setOutput] = useState('');

  const wrap = async (label: string, fn: () => Promise<any>) => {
    setBusy(true);
    try { const r = await fn(); toast.success(`${label} done`); return r; }
    catch (e: any) { toast.error(`${label} failed: ${e.message}`); }
    finally { setBusy(false); }
  };

  return (
    <div className="p-4 space-y-4 overflow-y-auto">
      <div>
        <h1 className="text-2xl font-semibold">Browser Use</h1>
        <p className="text-sm text-muted-foreground">LLM-driven Chromium automation (browser-use + Ollama). Much more capable than Computer Use for web tasks.</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Install</CardTitle></CardHeader>
        <CardContent>
          <Button disabled={busy} onClick={() => wrap('Install', installBrowserUse)}>
            Install browser-use + Playwright on host
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Run task</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Input placeholder="ollama model" value={model} onChange={(e) => setModel(e.target.value)} />
            <Input type="number" value={maxSteps} onChange={(e) => setMaxSteps(Number(e.target.value) || 25)} />
          </div>
          <Textarea rows={4} value={task} onChange={(e) => setTask(e.target.value)} placeholder="Describe what the browser should do..." />
          <div className="flex flex-wrap gap-1">
            {EXAMPLES.map((ex, i) => (
              <Button key={i} size="sm" variant="ghost" className="text-xs h-6"
                onClick={() => setTask(ex)}>{ex.slice(0, 40)}…</Button>
            ))}
          </div>
          <div className="flex gap-2">
            <Button disabled={busy || !task} onClick={() => wrap('Run', async () => {
              const r = await runBrowserTask(task, { model, maxSteps });
              setOutput(`${r.stdout}\n---\n${r.stderr}`);
            })}>Run</Button>
            <SendToChatButton text={`[BROWSER] ${task}`} />
          </div>
          {output && <pre className="text-xs bg-muted p-2 rounded whitespace-pre-wrap max-h-96 overflow-auto">{output}</pre>}
        </CardContent>
      </Card>
    </div>
  );
}
