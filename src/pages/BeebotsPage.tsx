import { useEffect, useState } from 'react';
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { useConversations } from '@/hooks/useConversations';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { Hexagon, Play, Square, Download, RefreshCw, ExternalLink, RotateCcw } from 'lucide-react';
import { beebots as odysseus } from '@/lib/beebots';
import { useNavigate } from 'react-router-dom';

export default function BeebotsPage() {
  const navigate = useNavigate();
  const { conversations, currentConvoId, createConversation, selectConversation, deleteConversation } = useConversations();
  const [running, setRunning] = useState(false);
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [logs, setLogs] = useState('');
  const [pw, setPw] = useState('');
  const url = odysseus.url();

  const check = async () => {
    const s = await odysseus.status().catch(() => ({ running: false, status: '' }));
    setRunning(s.running); setStatus(s.status);
  };
  useEffect(() => { check(); const id = setInterval(check, 6000); return () => clearInterval(id); }, []);

  const run = async (label: string, fn: () => Promise<unknown>) => {
    setBusy(label);
    try { await fn(); toast.success(`${label} ok`); await check(); }
    catch (e) { toast.error(`${label} failed: ${(e as Error).message}`); }
    finally { setBusy(null); }
  };

  const loadLogs = async () => {
    const r = await odysseus.logs().catch(() => ({ stdout: '' }));
    setLogs(r.stdout || '(no logs)');
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
          <Hexagon className="h-4 w-4 text-primary" />
          <h1 className="text-sm font-semibold tracking-tight">beebots — AI Trading Bees (paper)</h1>
          <Badge variant={running ? 'default' : 'outline'} className="ml-2 text-[10px]">
            {running ? 'RUNNING' : 'STOPPED'}
          </Badge>
          <div className="ml-auto flex gap-2">
            <Button size="sm" variant="outline" onClick={check}><RefreshCw className="h-3 w-3" /></Button>
            <Button size="sm" variant="outline" asChild>
              <a href={url} target="_blank" rel="noreferrer"><ExternalLink className="h-3 w-3 mr-1" />Open</a>
            </Button>
          </div>
        </header>

        <main className="p-4 space-y-4 max-w-6xl mx-auto w-full">
          <Card className="p-4 space-y-3">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Setup</div>
            <p className="text-sm text-muted-foreground">
              Three AI bees trade OKX crypto futures with <b>paper money</b> (real prices, simulated $333 each).
              Install downloads the official Docker setup to <code className="text-xs">~/.aiapp/beebots</code> on
              port 8090. On Setup you'll need a Jev key (console.typesafe.ai) and an OpenAI key, and you pick an owner
              password. Not financial advice — leave it on paper.
            </p>
            <div className="text-xs uppercase tracking-wider text-muted-foreground pt-2">Step 1 — Tools (Docker)</div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" disabled={!!busy} onClick={() => run('Check tools', async () => { const r = await odysseus.checkTools(); setPw(r.stdout + r.stderr); })}>
                Check tools
              </Button>
              <Button size="sm" variant="outline" disabled={!!busy} onClick={() => run('Install Docker (Windows)', async () => { const r = await odysseus.installDockerWindows(); setPw(r.stdout + r.stderr); })}>
                <Download className="h-3 w-3 mr-1" /> Install Docker (Windows)
              </Button>
              <Button size="sm" variant="outline" disabled={!!busy} onClick={() => run('Install Docker (Linux)', async () => { const r = await odysseus.installDockerLinux(); setPw(r.stdout + r.stderr); })}>
                <Download className="h-3 w-3 mr-1" /> Install Docker (Linux)
              </Button>
            </div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground pt-2">Step 2 — beebots</div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" disabled={!!busy} onClick={() => run('Install', odysseus.install)}>
                <Download className="h-3 w-3 mr-1" /> Install / Build
              </Button>
              <Button size="sm" disabled={!!busy || running} onClick={() => run('Start', odysseus.start)}>
                <Play className="h-3 w-3 mr-1" /> Start
              </Button>
              <Button size="sm" variant="destructive" disabled={!!busy || !running} onClick={() => run('Stop', odysseus.stop)}>
                <Square className="h-3 w-3 mr-1" /> Stop
              </Button>
              <Button size="sm" variant="outline" disabled={!!busy} onClick={() => run('Update', odysseus.update)}>
                <RefreshCw className="h-3 w-3 mr-1" /> Update
              </Button>
              <Button size="sm" variant="outline" disabled={!!busy} onClick={() => run('Restart engine', odysseus.restartEngine)}>
                <RotateCcw className="h-3 w-3 mr-1" /> Restart engine (reopen Setup)
              </Button>
            </div>
            {pw && (
              <pre className="text-xs bg-secondary/40 rounded p-2 overflow-auto">{pw}</pre>
            )}
            {status && (
              <pre className="text-[11px] text-muted-foreground bg-secondary/30 rounded p-2 overflow-auto">{status}</pre>
            )}
          </Card>

          <Card className="p-0 overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 border-b border-border/40">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Dashboard</div>
              <span className="text-[11px] text-muted-foreground">{url}</span>
            </div>
            {running ? (
              <iframe title="beebots" src={url} className="w-full h-[70vh] bg-background" />
            ) : (
              <div className="p-8 text-sm text-muted-foreground text-center">
                Start beebots to load its dashboard here. First visit shows Setup (open for 2 hours after start).
              </div>
            )}
          </Card>

          <Card className="p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Logs</div>
              <Button size="sm" variant="outline" onClick={loadLogs}>
                <RefreshCw className="h-3 w-3 mr-1" /> Refresh
              </Button>
            </div>
            <ScrollArea className="h-56">
              <pre className="text-[11px] whitespace-pre-wrap p-2">{logs || '(press Refresh to load container logs)'}</pre>
            </ScrollArea>
          </Card>
        </main>
      </SidebarInset>
    </div>
  );
}
