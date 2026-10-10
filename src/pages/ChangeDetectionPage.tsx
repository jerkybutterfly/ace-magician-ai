import { useCallback, useEffect, useState } from 'react';
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { useConversations } from '@/hooks/useConversations';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { Eye, RefreshCw, Trash2, Plus, Play, Square, Download, ExternalLink, KeyRound, RotateCw } from 'lucide-react';
import { changeDetection, getApiKey, setApiKey, type Watch } from '@/lib/changedetection';
import { useNavigate } from 'react-router-dom';

export default function ChangeDetectionPage() {
  const navigate = useNavigate();
  const { conversations, currentConvoId, createConversation, selectConversation, deleteConversation } = useConversations();
  const [busy, setBusy] = useState<string | null>(null);
  const [output, setOutput] = useState('');
  const [installed, setInstalled] = useState('');
  const [up, setUp] = useState(false);
  const [apiKey, setApiKeyState] = useState(getApiKey());
  const [watches, setWatches] = useState<Record<string, Watch>>({});
  const [newUrl, setNewUrl] = useState('');
  const [newTag, setNewTag] = useState('');

  const refreshWatches = useCallback(async () => {
    if (!getApiKey()) return;
    const w = await changeDetection.listWatches().catch(() => ({}));
    setWatches(w);
  }, []);

  const refresh = useCallback(async () => {
    const [inst, st] = await Promise.all([
      changeDetection.checkInstalled().catch(() => ({ stdout: '' })),
      changeDetection.status().catch(() => ({ stdout: 'DOWN' })),
    ]);
    const v = (inst.stdout || '').trim();
    setInstalled(v.includes('Version') ? v : '');
    const isUp = (st.stdout || '').trim().startsWith('200') || (st.stdout || '').trim().startsWith('302');
    setUp(isUp);
    if (isUp) await refreshWatches();
  }, [refreshWatches]);

  useEffect(() => { refresh(); }, [refresh]);

  const run = async (label: string, fn: () => Promise<{ stdout: string; stderr: string }>) => {
    setBusy(label);
    setOutput('');
    try {
      const r = await fn();
      setOutput((r.stdout || '') + (r.stderr ? `\n${r.stderr}` : ''));
      toast.success(`${label} finished`);
      await refresh();
    } catch (e) {
      toast.error(`${label} failed: ${(e as Error).message}`);
    } finally {
      setBusy(null);
    }
  };

  const saveKey = (k: string) => {
    setApiKeyState(k);
    setApiKey(k);
  };

  const addWatch = async () => {
    if (!newUrl.trim()) { toast.error('Enter a URL first'); return; }
    if (!getApiKey()) { toast.error('Add your API key first (see step 3)'); return; }
    setBusy('Add watch');
    try {
      const r = await changeDetection.addWatch(newUrl.trim(), newTag.trim() || undefined);
      setOutput(r.stdout + (r.stderr ? `\n${r.stderr}` : ''));
      setNewUrl('');
      toast.success('Watch added');
      await refreshWatches();
    } catch (e) {
      toast.error(`Add failed: ${(e as Error).message}`);
    } finally {
      setBusy(null);
    }
  };

  const watchList = Object.entries(watches);
  const fmt = (ts?: number) => (ts ? new Date(ts * 1000).toLocaleString() : 'never');

  return (
    <div className="flex min-h-screen w-full">
      <AppSidebar
        conversations={conversations}
        currentConvoId={currentConvoId}
        onNewChat={() => { createConversation(); navigate('/chat'); }}
        onSelectConvo={(id) => { selectConversation(id); navigate('/chat'); }}
        onDeleteConvo={deleteConversation}
      />
      <SidebarInset>
        <header className="h-12 border-b border-border/50 flex items-center px-4 gap-3">
          <SidebarTrigger />
          <Eye className="h-4 w-4 text-primary" />
          <h1 className="text-sm font-semibold tracking-tight">Change Detection</h1>
          <Badge variant={up ? 'default' : 'outline'} className="ml-2 text-[10px] font-mono">
            {up ? 'RUNNING' : installed ? 'INSTALLED' : 'NOT INSTALLED'}
          </Badge>
          <div className="ml-auto flex gap-2">
            {up && (
              <Button size="sm" variant="outline" asChild>
                <a href={changeDetection.webUi} target="_blank" rel="noreferrer">
                  <ExternalLink className="h-3 w-3 mr-1" /> Open web UI
                </a>
              </Button>
            )}
            <Button size="sm" variant="outline" onClick={refresh}><RefreshCw className="h-3 w-3" /></Button>
          </div>
        </header>

        <main className="p-4 space-y-4 max-w-5xl mx-auto w-full">
          <Card className="p-4 space-y-3">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Step 1 — Install on your mini PC</div>
            <p className="text-sm text-muted-foreground">
              changedetection.io watches web pages and tells you when they change — price drops, restocks, new posts.
              It runs on your mini PC with Python and needs no Docker and no graphics card.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" disabled={!!busy} onClick={() => run('Check Python', changeDetection.checkPython)}>
                Check Python
              </Button>
              <Button size="sm" disabled={!!busy} onClick={() => run('Install', changeDetection.install)}>
                <Download className="h-3 w-3 mr-1" /> {busy === 'Install' ? 'Installing…' : 'Install changedetection.io'}
              </Button>
            </div>
          </Card>

          <Card className="p-4 space-y-3">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Step 2 — Start / stop</div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" disabled={!!busy || !installed} onClick={() => run('Start', changeDetection.start)}>
                <Play className="h-3 w-3 mr-1" /> Start (port {changeDetection.port})
              </Button>
              <Button size="sm" variant="outline" disabled={!!busy || !up} onClick={() => run('Stop', changeDetection.stop)}>
                <Square className="h-3 w-3 mr-1" /> Stop
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              First start creates a password-protected web UI. Open it, set a password, then go to Settings → API to copy your API key.
            </p>
          </Card>

          <Card className="p-4 space-y-3">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Step 3 — API key</div>
            <div className="flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-muted-foreground shrink-0" />
              <Input
                type="password"
                value={apiKey}
                onChange={(e) => saveKey(e.target.value)}
                placeholder="Paste API key from the changedetection Settings page"
                className="h-9 font-mono text-xs"
              />
              <Button size="sm" variant="outline" disabled={!apiKey} onClick={refreshWatches}>Connect</Button>
            </div>
          </Card>

          <Card className="p-4 space-y-3">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Add a watch</div>
            <div className="flex flex-wrap gap-2">
              <Input
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="https://example.com/product-page"
                className="h-9 font-mono text-xs flex-1 min-w-[220px]"
              />
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Tag (optional)"
                className="h-9 text-xs w-32"
              />
              <Button size="sm" disabled={!!busy || !up} onClick={addWatch}>
                <Plus className="h-3 w-3 mr-1" /> Watch this page
              </Button>
            </div>
          </Card>

          {output && (
            <Card className="p-0 overflow-hidden">
              <div className="px-4 py-2 border-b text-xs uppercase tracking-wider text-muted-foreground">Output</div>
              <ScrollArea className="h-56">
                <pre className="p-3 text-[11px] font-mono whitespace-pre-wrap">{output}</pre>
              </ScrollArea>
            </Card>
          )}

          <Card className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Watches ({watchList.length})</div>
              <Button size="sm" variant="ghost" className="h-7" disabled={!!busy || !up} onClick={() => run('Recheck all', changeDetection.recheckAll)}>
                <RotateCw className="h-3 w-3 mr-1" /> Recheck all
              </Button>
            </div>
            {watchList.length === 0 && (
              <p className="text-sm text-muted-foreground">
                {up ? 'No watches yet — add one above.' : 'Start the service to see your watches.'}
              </p>
            )}
            <div className="space-y-1">
              {watchList.map(([uuid, w]) => (
                <div key={uuid} className="flex items-center gap-2 text-xs border-b border-border/40 py-1.5">
                  <div className="flex-1 min-w-0">
                    <div className="truncate font-mono">{w.title || w.url}</div>
                    <div className="text-[10px] text-muted-foreground">
                      Checked {fmt(w.last_checked)}
                      {w.last_changed ? ` · changed ${fmt(w.last_changed)}` : ' · no change yet'}
                      {w.last_error ? ` · error: ${w.last_error}` : ''}
                    </div>
                  </div>
                  {!!w.last_changed && <Badge variant="default" className="text-[9px]">CHANGED</Badge>}
                  <Button size="icon" variant="ghost" className="h-6 w-6" title="Recheck now" disabled={!!busy}
                    onClick={() => run('Recheck', () => changeDetection.recheck(uuid))}>
                    <RefreshCw className="h-3 w-3" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-6 w-6" title="Delete watch" disabled={!!busy}
                    onClick={() => run('Delete', () => changeDetection.removeWatch(uuid))}>
                    <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </main>
      </SidebarInset>
    </div>
  );
}
