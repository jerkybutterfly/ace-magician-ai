import { useEffect, useState } from 'react';
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { useConversations } from '@/hooks/useConversations';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Film, Play, Square, Download, RefreshCw, ExternalLink } from 'lucide-react';
import { wan2gp, WAN2GP_PROFILES, type Wan2gpOptions, type Wan2gpProfile } from '@/lib/wan2gp';
import { getSettings } from '@/lib/settings';
import { useNavigate } from 'react-router-dom';

const CFG_KEY = 'wan2gp.cfg';

export default function Wan2gpPage() {
  const navigate = useNavigate();
  const { conversations, currentConvoId, createConversation, selectConversation, deleteConversation } = useConversations();
  const [running, setRunning] = useState(false);
  const [reachable, setReachable] = useState(true);
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [logs, setLogs] = useState('');
  const [files, setFiles] = useState<string[]>([]);
  const [opts, setOpts] = useState<Wan2gpOptions>(() => {
    try {
      const raw = localStorage.getItem(CFG_KEY);
      if (raw) return JSON.parse(raw) as Wan2gpOptions;
    } catch { /* ignore */ }
    return { profile: '4', attention: 'sdpa', compile: false, share: false };
  });
  const url = wan2gp.url();

  useEffect(() => { localStorage.setItem(CFG_KEY, JSON.stringify(opts)); }, [opts]);

  const check = async () => {
    try {
      const s = await wan2gp.status();
      setRunning(s.running); setStatus(s.status); setReachable(true);
    } catch {
      setRunning(false); setStatus(''); setReachable(false);
    }
  };
  useEffect(() => { check(); const id = setInterval(check, 8000); return () => clearInterval(id); }, []);

  const run = async (label: string, fn: () => Promise<unknown>) => {
    setBusy(label);
    try { await fn(); toast.success(`${label} ok`); await check(); }
    catch (e) { toast.error(`${label} failed: ${(e as Error).message}`); }
    finally { setBusy(null); }
  };

  const loadLogs = async () => {
    const r = await wan2gp.logs().catch(() => ({ stdout: '' }));
    setLogs(r.stdout || '(no logs yet)');
  };

  const loadOutputs = async () => {
    setFiles(await wan2gp.outputs().catch(() => []));
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
          <Film className="h-4 w-4 text-primary" />
          <h1 className="text-sm font-semibold tracking-tight">Wan2GP — Video Generation for the GPU Poor</h1>
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
          {!reachable && (
            <Card className="p-4 space-y-2 border-destructive/50">
              <div className="text-sm font-semibold text-destructive">Can't reach your mini PC</div>
              <p className="text-sm text-muted-foreground">
                Nothing on this page can install, start or open until the app can talk to your mini PC.
                It's currently trying <code className="text-xs">{getSettings().agentUrl}</code>.
                If you're on your phone, that address points at the phone itself — change it in Settings to your
                mini PC's address on your home network, for example <code className="text-xs">http://192.168.1.50:8484</code>,
                and make sure the helper program is running there.
              </p>
              <Button size="sm" variant="outline" onClick={() => navigate('/settings')}>Open Settings</Button>
            </Card>
          )}
          <Card className="p-4 space-y-3">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Setup</div>
            <p className="text-sm text-muted-foreground">
              Wan2GP makes videos from text or images on modest hardware (works from about 6GB of graphics memory).
              Install puts it in <code className="text-xs">~/.aiapp/Wan2GP</code> with its own Python environment and
              runs it on port {`7860`}. Needs Python 3.10+, git and your helper program running. The first video
              downloads several GB of model files.
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs">Memory profile</Label>
                <Select value={opts.profile} onValueChange={(v) => setOpts({ ...opts, profile: v as Wan2gpProfile })}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {WAN2GP_PROFILES.map((p) => (
                      <SelectItem key={p.value} value={p.value} className="text-xs">{p.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Attention mode</Label>
                <Select value={opts.attention} onValueChange={(v) => setOpts({ ...opts, attention: v as Wan2gpOptions['attention'] })}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sdpa" className="text-xs">sdpa (default, always works)</SelectItem>
                    <SelectItem value="sage" className="text-xs">sage (faster)</SelectItem>
                    <SelectItem value="sage2" className="text-xs">sage2 (fastest)</SelectItem>
                    <SelectItem value="flash" className="text-xs">flash</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={opts.compile} onCheckedChange={(c) => setOpts({ ...opts, compile: c })} />
                <Label className="text-xs">Compile models (faster after warm-up)</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={opts.share} onCheckedChange={(c) => setOpts({ ...opts, share: c })} />
                <Label className="text-xs">Public share link</Label>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button size="sm" disabled={!!busy} onClick={() => run('Install', wan2gp.install)}>
                <Download className="h-3 w-3 mr-1" /> Install
              </Button>
              <Button size="sm" disabled={!!busy || running} onClick={() => run('Start', () => wan2gp.start(opts))}>
                <Play className="h-3 w-3 mr-1" /> Start
              </Button>
              <Button size="sm" variant="destructive" disabled={!!busy || !running} onClick={() => run('Stop', wan2gp.stop)}>
                <Square className="h-3 w-3 mr-1" /> Stop
              </Button>
              <Button size="sm" variant="outline" disabled={!!busy} onClick={() => run('Update', wan2gp.update)}>
                <RefreshCw className="h-3 w-3 mr-1" /> Update
              </Button>
            </div>
            {status && (
              <pre className="text-[11px] text-muted-foreground bg-secondary/30 rounded p-2 overflow-auto">{status}</pre>
            )}
          </Card>

          <Card className="p-0 overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 border-b border-border/40">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Studio</div>
              <span className="text-[11px] text-muted-foreground">{url}</span>
            </div>
            {running ? (
              <iframe title="Wan2GP" src={url} className="w-full h-[75vh] bg-background" />
            ) : (
              <div className="p-8 text-sm text-muted-foreground text-center">
                Start Wan2GP to load the video studio here.
              </div>
            )}
          </Card>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Logs</div>
                <Button size="sm" variant="outline" onClick={loadLogs}>
                  <RefreshCw className="h-3 w-3 mr-1" /> Refresh
                </Button>
              </div>
              <ScrollArea className="h-56">
                <pre className="text-[11px] whitespace-pre-wrap p-2">{logs || '(press Refresh to load logs)'}</pre>
              </ScrollArea>
            </Card>

            <Card className="p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Recent videos</div>
                <Button size="sm" variant="outline" onClick={loadOutputs}>
                  <RefreshCw className="h-3 w-3 mr-1" /> Refresh
                </Button>
              </div>
              <ScrollArea className="h-56">
                <div className="p-2 space-y-1">
                  {files.length === 0 && <div className="text-[11px] text-muted-foreground">(no videos listed yet)</div>}
                  {files.map((f) => (
                    <div key={f} className="text-[11px] font-mono truncate">{f}</div>
                  ))}
                </div>
              </ScrollArea>
            </Card>
          </div>
        </main>
      </SidebarInset>
    </div>
  );
}
