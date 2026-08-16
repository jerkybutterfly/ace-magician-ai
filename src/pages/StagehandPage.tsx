import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { installStagehand, runStagehand } from '@/lib/stagehand';

export default function StagehandPage() {
  const [busy, setBusy] = useState(false);
  const [url, setUrl] = useState('https://news.ycombinator.com');
  const [instr, setInstr] = useState('click the first story link and read the article title');
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
        <h1 className="text-2xl font-semibold">Stagehand</h1>
        <p className="text-sm text-muted-foreground">Typed AI browser automation with natural-language act/extract.</p>
      </div>
      <Card>
        <CardHeader><CardTitle>Setup</CardTitle></CardHeader>
        <CardContent><Button disabled={busy} onClick={() => wrap('Install', installStagehand)}>Install / update on host</Button></CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Run</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." />
          <Input value={model} onChange={(e) => setModel(e.target.value)} placeholder="Ollama model" />
          <Textarea rows={3} value={instr} onChange={(e) => setInstr(e.target.value)} />
          <Button disabled={busy || !url || !instr} onClick={() => wrap('Run', () => runStagehand(url, instr, model))}>Run</Button>
          {out && <pre className="text-xs bg-muted p-2 rounded whitespace-pre-wrap max-h-[500px] overflow-auto">{out}</pre>}
        </CardContent>
      </Card>
    </div>
  );
}
