import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { installLightRAG, lightragIngest, lightragQuery } from '@/lib/lightrag';

export default function LightRagPage() {
  const [busy, setBusy] = useState(false);
  const [path, setPath] = useState('~/Documents/*.md');
  const [q, setQ] = useState('What are the main topics in these documents?');
  const [mode, setMode] = useState<'naive' | 'local' | 'global' | 'hybrid'>('hybrid');
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
        <h1 className="text-2xl font-semibold">LightRAG</h1>
        <p className="text-sm text-muted-foreground">Graph-augmented retrieval over local docs, powered by Ollama.</p>
      </div>
      <Card>
        <CardHeader><CardTitle>Setup</CardTitle></CardHeader>
        <CardContent><Button disabled={busy} onClick={() => wrap('Install', installLightRAG)}>Install / update on host</Button></CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Ingest</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <Input value={path} onChange={(e) => setPath(e.target.value)} placeholder="file or glob" />
          <Button disabled={busy || !path} onClick={() => wrap('Ingest', () => lightragIngest(path, model))}>Ingest</Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Query</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <Input value={model} onChange={(e) => setModel(e.target.value)} placeholder="Ollama model" />
          <div className="flex gap-2">
            {(['naive','local','global','hybrid'] as const).map(m => (
              <Button key={m} size="sm" variant={mode===m?'default':'outline'} onClick={() => setMode(m)}>{m}</Button>
            ))}
          </div>
          <Textarea rows={3} value={q} onChange={(e) => setQ(e.target.value)} />
          <Button disabled={busy || !q} onClick={() => wrap('Query', () => lightragQuery(q, mode, model))}>Ask</Button>
          {out && <pre className="text-xs bg-muted p-2 rounded whitespace-pre-wrap max-h-[500px] overflow-auto">{out}</pre>}
        </CardContent>
      </Card>
    </div>
  );
}
