import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { BookOpen, Loader2, Plus, RefreshCw, Trash2, AlertTriangle, Search } from 'lucide-react';
import {
  listRagSources, addRagSource, deleteRagSource, reindexRagSource, getIndexStatus, ragQuery,
  isRagAugmentEnabled, setRagAugmentEnabled,
  type RagSource, type IndexStatus, type RagChunk,
} from '@/lib/rag';
import { toast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

export default function RagPage() {
  const [sources, setSources] = useState<RagSource[]>([]);
  const [status, setStatus] = useState<IndexStatus | null>(null);
  const [newPath, setNewPath] = useState('');
  const [recursive, setRecursive] = useState(true);
  const [busy, setBusy] = useState(false);
  const [augment, setAugment] = useState(isRagAugmentEnabled());
  const [query, setQuery] = useState('');
  const [chunks, setChunks] = useState<RagChunk[]>([]);
  const [querying, setQuerying] = useState(false);

  useEffect(() => {
    void refresh();
    const t = window.setInterval(pollStatus, 1500);
    return () => window.clearInterval(t);
  }, []);

  const refresh = async () => {
    try {
      const [s, st] = await Promise.all([listRagSources(), getIndexStatus()]);
      setSources(s);
      setStatus(st);
    } catch (e) {
      toast({ title: 'Cannot reach agent', description: e instanceof Error ? e.message : 'unknown' });
    }
  };

  const pollStatus = async () => {
    try { setStatus(await getIndexStatus()); } catch {/* silent */}
  };

  const handleAdd = async () => {
    if (!newPath.trim()) return;
    setBusy(true);
    try {
      await addRagSource(newPath.trim(), recursive);
      setNewPath('');
      toast({ title: 'Folder added — indexing started' });
      await refresh();
    } catch (e) {
      toast({ title: 'Add failed', description: e instanceof Error ? e.message : 'unknown' });
    } finally { setBusy(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Remove this source and all its embeddings?')) return;
    try { await deleteRagSource(id); await refresh(); } catch (e) {
      toast({ title: 'Delete failed', description: e instanceof Error ? e.message : 'unknown' });
    }
  };

  const handleReindex = async (id: number) => {
    try { await reindexRagSource(id); toast({ title: 'Re-indexing started' }); await refresh(); } catch (e) {
      toast({ title: 'Reindex failed', description: e instanceof Error ? e.message : 'unknown' });
    }
  };

  const handleQuery = async () => {
    if (!query.trim()) return;
    setQuerying(true);
    try {
      const { chunks } = await ragQuery(query.trim(), 5);
      setChunks(chunks);
    } catch (e) {
      toast({ title: 'Query failed', description: e instanceof Error ? e.message : 'unknown' });
    } finally { setQuerying(false); }
  };

  const toggleAugment = (v: boolean) => { setAugment(v); setRagAugmentEnabled(v); };

  const indexProgress = status && status.total > 0 ? (status.processed / status.total) * 100 : 0;

  return (
    <ScrollArea className="flex-1">
      <div className="p-4 max-w-5xl mx-auto space-y-4">
        {status && !status.embed_model_available && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Embedding model missing</AlertTitle>
            <AlertDescription>
              You need <code className="bg-muted px-1 rounded">nomic-embed-text</code> from Ollama for RAG.{' '}
              Run <code className="bg-muted px-1 rounded">ollama pull nomic-embed-text</code> or visit{' '}
              <Link to="/local-models" className="text-primary underline">Local Models</Link>.
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><BookOpen className="h-4 w-4" /> Document RAG</CardTitle>
            <CardDescription>Index local folders and let the agent answer from them</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <Input value={newPath} onChange={(e) => setNewPath(e.target.value)} placeholder="C:\\Users\\Stephen Dunne\\Documents\\notes" className="h-8 text-sm flex-1" />
              <label className="flex items-center gap-2 text-xs whitespace-nowrap">
                <Switch checked={recursive} onCheckedChange={setRecursive} /> Recursive
              </label>
              <Button size="sm" onClick={handleAdd} disabled={busy || !newPath.trim()}>
                {busy ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Plus className="h-3 w-3 mr-1" />}Add folder
              </Button>
            </div>

            <div className="flex items-center justify-between rounded-md border border-border/50 bg-muted/30 px-3 py-2">
              <Label className="text-xs">Auto-augment chats with document context</Label>
              <Switch checked={augment} onCheckedChange={toggleAugment} />
            </div>

            {status?.active && (
              <div className="space-y-1 rounded-md border border-border/50 bg-muted/20 p-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground truncate">Indexing: {status.current_file || '...'}</span>
                  <span>{status.processed}/{status.total}</span>
                </div>
                <Progress value={indexProgress} className="h-1" />
              </div>
            )}
            {status?.error && <p className="text-xs text-destructive">{status.error}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Indexed Sources</CardTitle></CardHeader>
          <CardContent>
            <div className="border border-border/50 rounded-md divide-y divide-border/40">
              {sources.length === 0 && <p className="p-4 text-xs text-muted-foreground text-center">No sources yet — add a folder above.</p>}
              {sources.map(s => (
                <div key={s.id} className="flex items-center justify-between p-3 gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-mono truncate">{s.path}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-[10px]">{s.doc_count} docs</Badge>
                      <Badge variant="secondary" className="text-[10px]">{s.chunk_count} chunks</Badge>
                      {s.recursive && <Badge variant="outline" className="text-[10px]">recursive</Badge>}
                    </div>
                  </div>
                  <Button size="icon" variant="ghost" onClick={() => handleReindex(s.id)} title="Re-index"><RefreshCw className="h-3.5 w-3.5" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => handleDelete(s.id)} title="Remove"><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Test Query</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Ask anything about your indexed documents…" className="h-8 text-sm" onKeyDown={(e) => e.key === 'Enter' && handleQuery()} />
              <Button size="sm" onClick={handleQuery} disabled={querying || !query.trim()}>
                {querying ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Search className="h-3 w-3 mr-1" />}Search
              </Button>
            </div>
            <div className="space-y-2">
              {chunks.map((c, i) => (
                <div key={i} className="border border-border/50 rounded-md p-3 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-primary truncate">{c.path}</span>
                    <Badge variant="outline" className="text-[10px]">score {c.score.toFixed(3)}</Badge>
                  </div>
                  <p className="text-xs whitespace-pre-wrap">{c.text}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
}
