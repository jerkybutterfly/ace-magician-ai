import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { installRagStack, listCollections, ingestPath, queryCollection } from '@/lib/vector-store';
import { SendToChatButton } from '@/components/SendToChatButton';

export default function VectorStorePage() {
  const [collections, setCollections] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [coll, setColl] = useState('default');
  const [path, setPath] = useState('~/Documents');
  const [q, setQ] = useState('');
  const [answer, setAnswer] = useState<any>(null);

  const refresh = () => listCollections().then(setCollections).catch(() => {});
  useEffect(() => { refresh(); }, []);

  const wrap = async (label: string, fn: () => Promise<any>) => {
    setBusy(true);
    try { const r = await fn(); toast.success(`${label} done`); return r; }
    catch (e: any) { toast.error(`${label} failed: ${e.message}`); }
    finally { setBusy(false); refresh(); }
  };

  return (
    <div className="p-4 space-y-4 overflow-y-auto">
      <div>
        <h1 className="text-2xl font-semibold">Vector Store (RAG)</h1>
        <p className="text-sm text-muted-foreground">Chroma + LlamaIndex, embeddings via Ollama nomic-embed-text. Ingest Obsidian, Files, Hermes.</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Setup</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <Button disabled={busy} onClick={() => wrap('Install', installRagStack)}>Install / scaffold on host</Button>
          <div className="flex flex-wrap gap-1">
            {collections.length === 0 && <span className="text-xs text-muted-foreground">No collections yet.</span>}
            {collections.map((c) => <Badge key={c} variant="secondary">{c}</Badge>)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Ingest</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <Input placeholder="collection name" value={coll} onChange={(e) => setColl(e.target.value)} />
          <Input placeholder="path on host to index" value={path} onChange={(e) => setPath(e.target.value)} />
          <Button disabled={busy || !coll || !path} onClick={() => wrap('Ingest', () => ingestPath(coll, path))}>
            Ingest folder
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Query</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <Input value={coll} onChange={(e) => setColl(e.target.value)} />
          <Textarea rows={2} placeholder="ask the collection..." value={q} onChange={(e) => setQ(e.target.value)} />
          <div className="flex gap-2">
            <Button disabled={busy || !q} onClick={() => wrap('Query', async () => setAnswer(await queryCollection(coll, q)))}>
              Query
            </Button>
            {q && <SendToChatButton text={`[RAG:${coll}] ${q}`} />}
          </div>
          {answer && (
            <div className="text-xs bg-muted p-2 rounded space-y-2">
              <div className="whitespace-pre-wrap">{answer.answer}</div>
              {answer.sources?.length > 0 && (
                <details><summary className="cursor-pointer">Sources ({answer.sources.length})</summary>
                  <pre className="whitespace-pre-wrap">{JSON.stringify(answer.sources, null, 2)}</pre>
                </details>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
