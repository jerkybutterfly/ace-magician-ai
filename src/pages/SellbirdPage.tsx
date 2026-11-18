import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Link2, Mail, Pause, Play, RefreshCw, ScrollText, Square } from 'lucide-react';
import { toast } from 'sonner';
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useConversations } from '@/hooks/useConversations';
import { sellbird, SELLBIRD_PORT } from '@/lib/sellbird';

type Result = { stdout: string; stderr: string; returncode: number };

export default function SellbirdPage() {
  const navigate = useNavigate();
  const conversations = useConversations();
  const [busy, setBusy] = useState('');
  const [installation, setInstallation] = useState('unknown');
  const [running, setRunning] = useState(false);
  const [unreachable, setUnreachable] = useState(false);
  const [output, setOutput] = useState('');
  const [website, setWebsite] = useState('');
  const refresh = useCallback(async () => {
    try {
      const [installed, up] = await Promise.all([sellbird.installation(), sellbird.status()]);
      setInstallation((previous) => installed === 'not-verified' && previous === 'installing' ? previous : installed);
      setRunning(up); setUnreachable(false);
    } catch { setUnreachable(true); setInstallation('unknown'); setRunning(false); }
  }, []);
  useEffect(() => {
    void refresh();
    const timer = window.setInterval(() => void refresh(), 10_000);
    return () => window.clearInterval(timer);
  }, [refresh]);
  const run = async (label: string, action: () => Promise<Result>) => {
    if (busy) return;
    setBusy(label);
    try {
      const result = await action();
      setOutput([result.stdout, result.stderr].filter(Boolean).join('\n') || `${label} requested. Check logs for progress.`);
      if (result.returncode !== 0) toast.error(`${label} failed — see output`);
      else if (label === 'Install') { setInstallation('installing'); toast.success('Installation started on your mini PC'); }
      else toast.success(`${label} requested`);
      if (label !== 'Install') await refresh();
    } catch (error) {
      setOutput(error instanceof Error ? error.message : 'Cannot reach your mini PC');
      toast.error('Could not complete request');
    } finally { setBusy(''); }
  };
  const installed = installation === 'installed';
  const status = unreachable ? 'UNREACHABLE' : running ? 'RUNNING' : installed ? 'INSTALLED' : installation === 'failed' ? 'INSTALL FAILED' : installation === 'installing' ? 'INSTALLING' : 'NOT VERIFIED';
  return (
    <div className="flex min-h-screen w-full">
      <AppSidebar conversations={conversations.conversations} currentConvoId={conversations.currentConvoId}
        onNewChat={() => { conversations.createConversation(); navigate('/chat'); }}
        onSelectConvo={(id) => { conversations.selectConversation(id); navigate('/chat'); }} onDeleteConvo={conversations.deleteConversation} />
      <SidebarInset className="min-w-0">
        <header className="min-h-12 border-b flex flex-wrap items-center px-4 py-2 gap-3">
          <SidebarTrigger /><Mail className="h-4 w-4 text-primary" />
          <h1 className="text-sm font-semibold">Sellbird</h1><Badge variant={running ? 'default' : 'outline'}>{status}</Badge>
          <Button className="ml-auto" size="icon" variant="ghost" title="Refresh status" aria-label="Refresh status" onClick={refresh}><RefreshCw className="h-4 w-4" /></Button>
        </header>
        <main className="w-full max-w-5xl mx-auto p-4 space-y-8">
          {unreachable && <div role="alert" className="border-l-2 border-destructive pl-3 space-y-2">
            <p className="text-sm text-destructive">Cannot reach your mini PC. Installation status is unknown.</p>
            <Button size="sm" variant="outline" onClick={() => navigate('/settings')}>Settings</Button>
          </div>}
          <section className="space-y-2">
            <p className="text-sm">Sellbird finds companies that need what you sell, finds who decides, checks their email address, writes each a personal cold email and handles replies. Nothing is sent until you approve it in its Outbox.</p>
          </section>
          <section className="space-y-3">
            <h2 className="text-sm font-semibold">Step 1 · Installation</h2>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" disabled={!!busy} onClick={() => run('Check tools', sellbird.checkTools)}>Check tools</Button>
              <Button size="sm" disabled={!!busy || installation === 'installing'} onClick={() => run('Install', sellbird.install)}><Download className="h-4 w-4 mr-2" />Install Sellbird</Button>
              <Button size="sm" variant="outline" disabled={!!busy} onClick={() => run('Logs', sellbird.logs)}><ScrollText className="h-4 w-4 mr-2" />Logs</Button>
            </div>
            <p className="text-xs text-muted-foreground">Windows · Git required · Python 3.12 installed automatically · Claude Pro/Max with Claude Code signed in (<code>claude login</code>), or a ChatGPT plan with Codex.</p>
            <p className="text-xs text-muted-foreground">Sellbird writes emails through your Claude or ChatGPT subscription, not through your local Ollama models.</p>
          </section>
          <section className="space-y-3 border-t pt-6">
            <h2 className="text-sm font-semibold">Step 2 · Teach it your product</h2>
            <div className="flex flex-wrap gap-2">
              <Input className="max-w-sm" inputMode="url" placeholder="https://your-company.com" value={website} onChange={(e) => setWebsite(e.target.value)} aria-label="Your website address" />
              <Button size="sm" disabled={!!busy || !installed || !website.trim()} onClick={() => run('Train', () => sellbird.train(website))}>Train from website</Button>
            </div>
            <p className="text-xs text-muted-foreground">Runs in the background; press Logs to follow it. Add your mailbox details afterwards in the dashboard settings.</p>
          </section>
          <section className="space-y-3 border-t pt-6">
            <h2 className="text-sm font-semibold">Step 3 · Dashboard</h2>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" disabled={!!busy || !installed || running} onClick={() => run('Start', sellbird.start)}><Play className="h-4 w-4 mr-2" />Start dashboard</Button>
              <Button size="sm" variant="outline" disabled={!!busy || !running} onClick={() => run('Stop', sellbird.stop)}><Square className="h-4 w-4 mr-2" />Stop</Button>
              <Button size="sm" variant="outline" disabled={!!busy || !installed} onClick={() => run('Show link', sellbird.link)}><Link2 className="h-4 w-4 mr-2" />Show private link</Button>
              <Button size="sm" variant="destructive" disabled={!!busy || !installed} onClick={() => run('Pause sending', sellbird.pauseSending)}><Pause className="h-4 w-4 mr-2" />Pause all sending</Button>
            </div>
            <p className="text-xs text-muted-foreground">Port {SELLBIRD_PORT}. For safety the dashboard only opens on the mini PC itself: press Show private link, then open that link in a browser on the mini PC (or tunnel to it). It cannot be opened from your phone directly.</p>
            <p className="text-xs text-muted-foreground">Only email people lawfully and honour opt-outs; keep approval on until you trust the drafts.</p>
          </section>
          {(busy || output) && <section className="border rounded-md overflow-hidden" aria-live="polite">
            <h2 className="px-3 py-2 border-b text-xs text-muted-foreground">{busy ? `${busy}…` : 'Output'}</h2>
            <pre className="p-3 text-xs font-mono whitespace-pre-wrap break-words max-h-96 overflow-auto">{output}</pre>
          </section>}
        </main>
      </SidebarInset>
    </div>
  );
}
