import { useEffect, useState } from 'react';
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { useConversations } from '@/hooks/useConversations';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { Briefcase, Download, Play, Square, RefreshCw, Plug, ExternalLink } from 'lucide-react';
import { openwork } from '@/lib/openwork';
import { useNavigate } from 'react-router-dom';

export default function OpenWorkPage() {
  const navigate = useNavigate();
  const { conversations, currentConvoId, createConversation, selectConversation, deleteConversation } = useConversations();
  const [busy, setBusy] = useState<string | null>(null);
  const [output, setOutput] = useState('');
  const [running, setRunning] = useState(false);
  const [version, setVersion] = useState('');
  const [showApp, setShowApp] = useState(false);

  const refresh = async () => {
    const [s, v] = await Promise.all([
      openwork.status().catch(() => ({ running: false, http: '000', procs: '' })),
      openwork.version().catch(() => ({ stdout: '' })),
    ]);
    setRunning(s.running);
    setVersion((v.stdout || '').trim().split('\n')[0] || '');
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
          <Briefcase className="h-4 w-4 text-primary" />
          <h1 className="text-sm font-semibold tracking-tight">OpenWork — Shared AI Workflows</h1>
          <Badge variant={running ? 'default' : 'outline'} className="ml-2 text-[10px] font-mono">
            {running ? 'RUNNING' : 'STOPPED'}
          </Badge>
          <div className="ml-auto flex gap-2">
            <Button size="sm" variant="outline" onClick={refresh}><RefreshCw className="h-3 w-3" /></Button>
          </div>
        </header>

        <main className="p-4 space-y-4 max-w-5xl mx-auto w-full">
          <Card className="p-4 space-y-3">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Host runtime</div>
            <p className="text-sm text-muted-foreground">
              Clones <code className="text-xs">different-ai/openwork</code> into{' '}
              <code className="text-xs">{openwork.dir}</code> on the AM06 and runs the headless web build
              (no Electron) on port <code className="text-xs">{openwork.port}</code>.
              {version && <> Commit: <code className="text-xs">{version}</code></>}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" disabled={!!busy} onClick={() => run('Install', openwork.install)}>
                <Download className="h-3 w-3 mr-1" /> {busy === 'Install' ? 'Installing…' : 'Install / Update deps'}
              </Button>
              <Button size="sm" variant="outline" disabled={!!busy} onClick={() => run('Start', openwork.start)}>
                <Play className="h-3 w-3 mr-1" /> Start
              </Button>
              <Button size="sm" variant="outline" disabled={!!busy} onClick={() => run('Stop', openwork.stop)}>
                <Square className="h-3 w-3 mr-1" /> Stop
              </Button>
              <Button size="sm" variant="outline" disabled={!!busy} onClick={() => run('Pull latest', openwork.update)}>
                Pull latest
              </Button>
              <Button size="sm" variant="outline" disabled={!!busy} onClick={() => run('Logs', openwork.logs)}>
                Logs
              </Button>
            </div>
          </Card>

          <Card className="p-4 space-y-3">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Agent capabilities (MCP)</div>
            <p className="text-sm text-muted-foreground">
              Register the OpenWork remote MCP so your local agents get its{' '}
              <code className="text-xs">search_capabilities</code> and <code className="text-xs">execute_capability</code>{' '}
              tools — skills, plugins and connected services shared across machines.
            </p>
            <div className="flex flex-wrap gap-2 items-center">
              <Button size="sm" onClick={() => { openwork.registerMcp(); toast.success('OpenWork MCP added'); }}>
                <Plug className="h-3 w-3 mr-1" /> Add OpenWork MCP
              </Button>
              <Button size="sm" variant="outline" onClick={() => navigate('/mcp')}>Open MCP servers</Button>
              <code className="text-[11px] text-muted-foreground font-mono">{openwork.mcpUrl}</code>
            </div>
          </Card>

          <Card className="p-0 overflow-hidden">
            <div className="px-4 py-2 border-b flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">Workspace</span>
              <div className="ml-auto flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setShowApp((s) => !s)}>
                  {showApp ? 'Hide' : 'Embed UI'}
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <a href={openwork.url()} target="_blank" rel="noreferrer">
                    <ExternalLink className="h-3 w-3 mr-1" /> Open
                  </a>
                </Button>
              </div>
            </div>
            {showApp ? (
              <iframe
                title="OpenWork"
                src={openwork.url()}
                className="w-full h-[70vh] bg-background"
              />
            ) : (
              <p className="p-4 text-sm text-muted-foreground">
                Start the server, then embed the OpenWork UI here or open it in a new tab at{' '}
                <code className="text-xs">{openwork.url()}</code>.
              </p>
            )}
          </Card>

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
