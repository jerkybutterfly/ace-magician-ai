import { useEffect, useState } from 'react';
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { useConversations } from '@/hooks/useConversations';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { Download, RefreshCw, Trash2, Archive, Globe2 } from 'lucide-react';
import { websiteDownloader, type Engine } from '@/lib/website-downloader';
import { useNavigate } from 'react-router-dom';

export default function WebsiteDownloaderPage() {
  const navigate = useNavigate();
  const { conversations, currentConvoId, createConversation, selectConversation, deleteConversation } = useConversations();
  const [url, setUrl] = useState('');
  const [engine, setEngine] = useState<Engine>('httrack');
  const [depth, setDepth] = useState(3);
  const [sameHost, setSameHost] = useState(true);
  const [assetsOnly, setAssetsOnly] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [output, setOutput] = useState('');
  const [version, setVersion] = useState('');
  const [sites, setSites] = useState<string[]>([]);

  const refresh = async () => {
    const [v, l] = await Promise.all([
      websiteDownloader.version().catch(() => ({ stdout: '' })),
      websiteDownloader.list().catch(() => ({ stdout: '' })),
    ]);
    setVersion((v.stdout || '').trim().split('\n')[0] || '');
    setSites((l.stdout || '').trim().split('\n').filter(Boolean));
  };
  useEffect(() => { refresh(); }, []);

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

  const needsUrl = () => {
    if (!url.trim()) { toast.error('Enter a URL first'); return true; }
    return false;
  };

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
          <Globe2 className="h-4 w-4 text-primary" />
          <h1 className="text-sm font-semibold tracking-tight">Website Downloader</h1>
          <Badge variant={version ? 'default' : 'outline'} className="ml-2 text-[10px] font-mono">
            {version || 'NOT INSTALLED'}
          </Badge>
          <div className="ml-auto flex gap-2">
            <Button size="sm" variant="outline" onClick={refresh}><RefreshCw className="h-3 w-3" /></Button>
          </div>
        </header>

        <main className="p-4 space-y-4 max-w-5xl mx-auto w-full">
          <Card className="p-4 space-y-3">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Setup</div>
            <p className="text-sm text-muted-foreground">
              Mirrors a full website to the AM06 host using HTTrack or wget. Saves to{' '}
              <code className="text-xs">{websiteDownloader.dir}/&lt;host&gt;</code>.
            </p>
            <Button size="sm" disabled={!!busy} onClick={() => run('Install', websiteDownloader.install)}>
              <Download className="h-3 w-3 mr-1" /> Install httrack + wget
            </Button>
          </Card>

          <Card className="p-4 space-y-3">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Mirror site</div>
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="h-9 font-mono text-xs"
            />
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <div className="flex gap-1">
                {(['httrack', 'wget'] as Engine[]).map((e) => (
                  <Button key={e} size="sm" variant={engine === e ? 'default' : 'outline'} onClick={() => setEngine(e)}>
                    {e}
                  </Button>
                ))}
              </div>
              <label className="flex items-center gap-2">
                Depth
                <Input
                  type="number"
                  min={1}
                  max={10}
                  value={depth}
                  onChange={(e) => setDepth(Math.max(1, Math.min(10, Number(e.target.value) || 1)))}
                  className="h-8 w-16 font-mono text-xs"
                />
              </label>
              <label className="flex items-center gap-2">
                <Switch checked={sameHost} onCheckedChange={setSameHost} /> Same host only
              </label>
              <label className="flex items-center gap-2">
                <Switch checked={assetsOnly} onCheckedChange={setAssetsOnly} /> Single page + assets
              </label>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                disabled={!!busy}
                onClick={() =>
                  !needsUrl() &&
                  run('Download', () =>
                    websiteDownloader.download({ url: url.trim(), engine, depth, sameHost, assetsOnly }),
                  )
                }
              >
                <Download className="h-3 w-3 mr-1" /> {busy === 'Download' ? 'Downloading…' : 'Download site'}
              </Button>
            </div>
          </Card>

          {output && (
            <Card className="p-0 overflow-hidden">
              <div className="px-4 py-2 border-b text-xs uppercase tracking-wider text-muted-foreground">Output</div>
              <ScrollArea className="h-64">
                <pre className="p-3 text-[11px] font-mono whitespace-pre-wrap">{output}</pre>
              </ScrollArea>
            </Card>
          )}

          <Card className="p-4 space-y-2">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Library ({sites.length})</div>
            {sites.length === 0 && <p className="text-sm text-muted-foreground">No mirrored sites yet.</p>}
            <div className="space-y-1">
              {sites.map((f) => (
                <div key={f} className="flex items-center gap-2 text-xs font-mono border-b border-border/40 py-1">
                  <span className="truncate flex-1">{f}</span>
                  <Button size="sm" variant="ghost" className="h-7" disabled={!!busy} onClick={() => run('Size', () => websiteDownloader.size(f))}>
                    Size
                  </Button>
                  <Button size="sm" variant="ghost" className="h-7" disabled={!!busy} onClick={() => run('Archive', () => websiteDownloader.archive(f))}>
                    <Archive className="h-3 w-3 mr-1" /> tar.gz
                  </Button>
                  <Button size="icon" variant="ghost" className="h-6 w-6" disabled={!!busy} onClick={() => run('Delete', () => websiteDownloader.remove(f))}>
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
