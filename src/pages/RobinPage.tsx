import { useEffect, useState } from 'react';
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { useConversations } from '@/hooks/useConversations';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { Bird, Play, Square, Download, RefreshCw, ExternalLink } from 'lucide-react';
import { robin } from '@/lib/robin';
import { useNavigate } from 'react-router-dom';

export default function RobinPage() {
  const navigate = useNavigate();
  const { conversations, currentConvoId, createConversation, selectConversation, deleteConversation } = useConversations();
  const [running, setRunning] = useState(false);
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [logs, setLogs] = useState('');
  const [ollamaBase, setOllamaBase] = useState('http://host.docker.internal:11434');
  const [openaiKey, setOpenaiKey] = useState('');
  const url = robin.url();

  const check = async () => {
    const s = await robin.status().catch(() => ({ running: false, status: '' }));
    setRunning(s.running); setStatus(s.status);
  };
  useEffect(() => { check(); const id = setInterval(check, 5000); return () => clearInterval(id); }, []);

  const run = async (label: string, fn: () => Promise<unknown>) => {
    setBusy(label);
    try { await fn(); toast.success(`${label} ok`); await check(); }
    catch (e) { toast.error(`${label} failed: ${(e as Error).message}`); }
    finally { setBusy(null); }
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
          <Bird className="h-4 w-4 text-primary" />
          <h1 className="text-sm font-semibold tracking-tight">Robin — Dark Web OSINT</h1>
          <Badge variant={running ? 'default' : 'outline'} className="ml-2 text-[10px]">
            {running ? 'RUNNING' : 'STOPPED'}
          </Badge>
          <div className="ml-auto flex gap-2">
            <Button size="sm" variant="outline" onClick={check}><RefreshCw className="h-3 w-3" /></Button>
            <Button size="sm" variant="outline" asChild><a href={url} target="_blank" rel="noreferrer"><ExternalLink className="h-3 w-3 mr-1" />Open</a></Button>
          </div>
        </header>

        <main className="p-4 space-y-4 max-w-6xl mx-auto w-full">
          <Card className="p-4 space-y-3">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Setup</div>
            <p className="text-sm text-muted-foreground">
              Robin uses Tor + LLMs to investigate dark-web search engines. Install pulls the Docker image
              (<code className="text-xs">{`apurvsg/robin:latest`}</code>) and ensures Tor is running on the AM06 host.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" disabled={!!busy} onClick={() => run('Install', robin.install)}>
                <Download className="h-3 w-3 mr-1" /> Install / Pull
              </Button>
              <Button size="sm" disabled={!!busy || running} onClick={() => run('Start', () => robin.start({
                OLLAMA_BASE_URL: ollamaBase,
                ...(openaiKey ? { OPENAI_API_KEY: openaiKey } : {}),
              }))}>
                <Play className="h-3 w-3 mr-1" /> Start
              </Button>
              <Button size="sm" variant="destructive" disabled={!!busy || !running} onClick={() => run('Stop', robin.stop)}>
                <Square className="h-3 w-3 mr-1" /> Stop
              </Button>
              <Button size="sm" variant="outline" disabled={!!busy} onClick={async () => {
                const r = await robin.logs(); setLogs(r.stdout || r.stderr);
              }}>Logs</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-muted-foreground">Ollama base URL (inside container)</label>
                <Input value={ollamaBase} onChange={e => setOllamaBase(e.target.value)} className="h-8 font-mono text-xs" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">OpenAI API key (optional)</label>
                <Input type="password" value={openaiKey} onChange={e => setOpenaiKey(e.target.value)} placeholder="sk-…" className="h-8 font-mono text-xs" />
              </div>
            </div>
            {status && <div className="text-[10px] font-mono text-muted-foreground">docker: {status}</div>}
          </Card>

          <Card className="overflow-hidden">
            <div className="px-3 py-2 border-b border-border/50 text-xs uppercase tracking-wider text-muted-foreground flex items-center justify-between">
              <span>Robin UI</span>
              <span className="font-mono">{url}</span>
            </div>
            {running ? (
              <iframe title="Robin" src={url} className="w-full h-[720px] bg-white" />
            ) : (
              <div className="p-8 text-sm text-muted-foreground text-center">
                Start Robin to load the investigation UI here, or open it in a new tab.
              </div>
            )}
          </Card>

          {logs && (
            <Card className="p-3">
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Container Logs</div>
              <ScrollArea className="h-64">
                <pre className="text-[10px] font-mono whitespace-pre-wrap">{logs}</pre>
              </ScrollArea>
            </Card>
          )}
        </main>
      </SidebarInset>
    </div>
  );
}
