import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { mem0Install, mem0Add, mem0Search, mem0List, mem0Delete, mem0Reset, type Mem0Entry } from '@/lib/mem0';
import { SendToChatButton } from '@/components/SendToChatButton';

export default function Mem0Page() {
  const [busy, setBusy] = useState(false);
  const [text, setText] = useState('');
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<Mem0Entry[]>([]);
  const [results, setResults] = useState<Mem0Entry[]>([]);

  const wrap = async (label: string, fn: () => Promise<unknown>) => {
    setBusy(true);
    try { await fn(); toast.success(`${label} ok`); }
    catch (e) { toast.error(`${label}: ${(e as Error).message}`); }
    finally { setBusy(false); }
  };

  const refresh = async () => {
    try { setItems(await mem0List(200)); } catch { /* offline */ }
  };

  useEffect(() => { refresh(); }, []);

  return (
    <div className="p-4 space-y-4 overflow-y-auto">
      <div>
        <h1 className="text-2xl font-semibold">mem0 — Long-term memory</h1>
        <p className="text-sm text-muted-foreground">Semantic memory layer using mem0ai + Ollama embeddings. Powers the Hermes loop.</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Install</CardTitle></CardHeader>
        <CardContent>
          <Button disabled={busy} onClick={() => wrap('Install', mem0Install)}>Install mem0 on host</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Add memory</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <Textarea rows={3} value={text} onChange={(e) => setText(e.target.value)} placeholder="Something worth remembering..." />
          <Button disabled={busy || !text} onClick={() => wrap('Add', async () => {
            await mem0Add(text); setText(''); await refresh();
          })}>Add</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Search</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <div className="flex gap-2">
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="What did I say about..." />
            <Button disabled={busy || !query} onClick={() => wrap('Search', async () => setResults(await mem0Search(query)))}>Search</Button>
          </div>
          {results.map((r) => (
            <div key={r.id} className="text-xs bg-muted p-2 rounded flex justify-between gap-2">
              <span>{r.memory}</span>
              {r.score !== undefined && <Badge variant="outline">{r.score.toFixed(2)}</Badge>}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>All memories ({items.length})</CardTitle>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={refresh}>Refresh</Button>
            <Button size="sm" variant="destructive" disabled={busy} onClick={() => wrap('Reset', async () => { await mem0Reset(); await refresh(); })}>Reset all</Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-1 max-h-96 overflow-auto">
          {items.map((r) => (
            <div key={r.id} className="text-xs bg-muted p-2 rounded flex justify-between gap-2">
              <span className="flex-1">{r.memory}</span>
              <SendToChatButton text={`Context from memory: ${r.memory}`} />
              <Button size="sm" variant="ghost" onClick={() => wrap('Delete', async () => { await mem0Delete(r.id); await refresh(); })}>×</Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
