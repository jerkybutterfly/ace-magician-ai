import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { exoInstall, exoStart, exoStop, exoStatus, exoListModels, exoChat, getExoUrl, setExoUrl, type ExoStatus } from '@/lib/exo';

export default function ExoPage() {
  const [busy, setBusy] = useState(false);
  const [url, setUrl] = useState(getExoUrl());
  const [status, setStatus] = useState<ExoStatus | null>(null);
  const [models, setModels] = useState<string[]>([]);
  const [model, setModel] = useState('llama-3.2-3b');
  const [prompt, setPrompt] = useState('Hello — which node answered?');
  const [answer, setAnswer] = useState('');

  const wrap = async (label: string, fn: () => Promise<unknown>) => {
    setBusy(true);
    try { await fn(); }
    catch (e) { toast.error(`${label}: ${(e as Error).message}`); }
    finally { setBusy(false); }
  };

  const refresh = async () => {
    setStatus(await exoStatus());
    setModels(await exoListModels());
  };

  useEffect(() => { refresh(); const t = setInterval(refresh, 10000); return () => clearInterval(t); }, []);

  return (
    <div className="p-4 space-y-4 overflow-y-auto">
      <div>
        <h1 className="text-2xl font-semibold">exo — Distributed inference</h1>
        <p className="text-sm text-muted-foreground">Cluster multiple PCs on your LAN to run larger models. Runs alongside Ollama; use only when you add extra nodes.</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Cluster</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <div className="flex gap-2 items-center">
            <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="http://localhost:52415" />
            <Button size="sm" variant="outline" onClick={() => { setExoUrl(url); toast.success('Saved'); refresh(); }}>Save</Button>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button disabled={busy} onClick={() => wrap('Install', exoInstall)}>Install exo</Button>
            <Button disabled={busy} onClick={() => wrap('Start', exoStart)}>Start node</Button>
            <Button disabled={busy} variant="outline" onClick={() => wrap('Stop', exoStop)}>Stop</Button>
            <Button disabled={busy} variant="ghost" onClick={refresh}>Refresh</Button>
          </div>
          {status && (
            <div className="text-xs space-y-1 pt-2">
              <Badge variant={status.online ? 'default' : 'outline'}>{status.online ? 'Online' : 'Offline'}</Badge>
              {status.error && <div className="text-destructive">{status.error}</div>}
              {status.node_id && <div>Node: {status.node_id}</div>}
              <div className="text-muted-foreground">{status.peers.length} peer(s)</div>
              {status.peers.map((p) => (
                <div key={p.id} className="bg-muted p-1.5 rounded flex justify-between">
                  <span>{p.id}</span>
                  <span>{p.device || p.address} {p.memory_gb ? `· ${p.memory_gb}GB` : ''}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Test inference</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <div className="flex gap-2">
            <Input value={model} onChange={(e) => setModel(e.target.value)} placeholder="model id" />
            {models.length > 0 && (
              <select value={model} onChange={(e) => setModel(e.target.value)} className="text-xs bg-background border rounded px-2">
                {models.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            )}
          </div>
          <Textarea rows={3} value={prompt} onChange={(e) => setPrompt(e.target.value)} />
          <Button disabled={busy || !prompt} onClick={() => wrap('Run', async () => setAnswer(await exoChat(model, prompt)))}>Run on cluster</Button>
          {answer && <pre className="text-xs bg-muted p-2 rounded whitespace-pre-wrap">{answer}</pre>}
        </CardContent>
      </Card>
    </div>
  );
}
