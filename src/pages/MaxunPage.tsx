import { useCallback, useEffect, useState } from 'react';
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { useConversations } from '@/hooks/useConversations';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { MousePointerClick, RefreshCw, Play, Square, Download, ExternalLink, ScrollText, Boxes } from 'lucide-react';
import { maxun } from '@/lib/maxun';
import { useNavigate } from 'react-router-dom';

export default function MaxunPage() {
  const navigate = useNavigate();
  const { conversations, currentConvoId, createConversation, selectConversation, deleteConversation } = useConversations();
  const [busy, setBusy] = useState<string | null>(null);
  const [output, setOutput] = useState('');
  const [installed, setInstalled] = useState(false);
  const [up, setUp] = useState(false);
  const [containers, setContainers] = useState('');

  const refresh = useCallback(async () => {
    const [inst, st, ps] = await Promise.all([
      maxun.checkInstalled().catch(() => ({ stdout: '' })),
      maxun.status().catch(() => ({ stdout: 'DOWN' })),
      maxun.containers().catch(() => ({ stdout: '' })),
    ]);
    setInstalled((inst.stdout || '').includes('INSTALLED') && !(inst.stdout || '').includes('NOT_INSTALLED'));
    setUp((st.stdout || '').trim().startsWith('200') || (st.stdout || '').trim().startsWith('30'));
    setContainers((ps.stdout || '').trim());
  }, []);

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
          <MousePointerClick className="h-4 w-4 text-primary" />
          <h1 className="text-sm font-semibold tracking-tight">Maxun</h1>
          <Badge variant={up ? 'default' : 'outline'} className="ml-2 text-[10px] font-mono">
            {up ? 'RUNNING' : installed ? 'INSTALLED' : 'NOT INSTALLED'}
          </Badge>
          <div className="ml-auto flex gap-2">
            {up && (
              <Button size="sm" variant="outline" asChild>
                <a href={maxun.webUi} target="_blank" rel="noreferrer">
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
              Maxun is a no-code web scraper: you show it what to grab by clicking on a page, and it builds a
              "robot" that collects that data on a schedule — into spreadsheets or an API. It runs in Docker
              on your mini PC and needs no graphics card.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" disabled={!!busy} onClick={() => run('Check Docker', maxun.checkDocker)}>
                Check Docker
              </Button>
              <Button size="sm" variant="outline" disabled={!!busy} onClick={() => run('Check Git', maxun.checkGit)}>
                Check Git
              </Button>
              <Button size="sm" disabled={!!busy} onClick={() => run('Install', maxun.install)}>
                <Download className="h-3 w-3 mr-1" /> {busy === 'Install' ? 'Installing…' : 'Install Maxun'}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Needs Docker Desktop and Git — the same tools beebots uses. If Docker is missing, install it from the beebots page first.
            </p>
          </Card>

          <Card className="p-4 space-y-3">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Step 2 — Start / stop</div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" disabled={!!busy || !installed} onClick={() => run('Start', maxun.start)}>
                <Play className="h-3 w-3 mr-1" /> {busy === 'Start' ? 'Starting…' : `Start (port ${maxun.frontendPort})`}
              </Button>
              <Button size="sm" variant="outline" disabled={!!busy || !installed} onClick={() => run('Stop', maxun.stop)}>
                <Square className="h-3 w-3 mr-1" /> Stop
              </Button>
              <Button size="sm" variant="outline" disabled={!!busy || !installed} onClick={() => run('Logs', maxun.logs)}>
                <ScrollText className="h-3 w-3 mr-1" /> Logs
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              First start downloads the Docker images (a few GB) and can take several minutes. When it says RUNNING,
              open the web UI, create your account, and record your first robot by clicking through a website.
            </p>
          </Card>

          {containers && (
            <Card className="p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                <Boxes className="h-3.5 w-3.5" /> Containers
              </div>
              <pre className="text-[11px] font-mono whitespace-pre-wrap text-muted-foreground">{containers}</pre>
            </Card>
          )}

          {output && (
            <Card className="p-0 overflow-hidden">
              <div className="px-4 py-2 border-b text-xs uppercase tracking-wider text-muted-foreground">Output</div>
              <ScrollArea className="h-64">
                <pre className="p-3 text-[11px] font-mono whitespace-pre-wrap">{output}</pre>
              </ScrollArea>
            </Card>
          )}
        </main>
      </SidebarInset>
    </div>
  );
}
