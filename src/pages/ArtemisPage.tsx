import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, ExternalLink, Play, RefreshCw, Smartphone, Square, ScrollText } from 'lucide-react';
import { toast } from 'sonner';
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useConversations } from '@/hooks/useConversations';
import { artemis, artemisConsoleUrl, ARTEMIS_PORT } from '@/lib/artemis';

export default function ArtemisPage() {
  const navigate = useNavigate();
  const conversations = useConversations();
  const [busy, setBusy] = useState('');
  const [installation, setInstallation] = useState('unknown');
  const [running, setRunning] = useState(false);
  const [unreachable, setUnreachable] = useState(false);
  const [output, setOutput] = useState('');
  const refresh = useCallback(async () => {
    try {
      const [installed, up] = await Promise.all([artemis.installation(), artemis.status()]);
      setInstallation(installed); setRunning(up); setUnreachable(false);
    } catch { setUnreachable(true); setInstallation('unknown'); setRunning(false); }
  }, []);
  useEffect(() => {
    void refresh();
    const timer = window.setInterval(() => void refresh(), 10_000);
    return () => window.clearInterval(timer);
  }, [refresh]);
  const run = async (label: string, action: () => Promise<{ stdout: string; stderr: string; returncode: number }>) => {
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
  let consoleUrl = '';
  try { consoleUrl = artemisConsoleUrl(); } catch { /* Invalid helper setting */ }
  const installed = installation === 'installed';
  const status = unreachable ? 'UNREACHABLE' : running ? 'RUNNING' : installed ? 'INSTALLED' : installation === 'failed' ? 'INSTALL FAILED' : installation === 'installing' ? 'INSTALLING' : 'NOT VERIFIED';
  return (
    <div className="flex min-h-screen w-full">
      <AppSidebar conversations={conversations.conversations} currentConvoId={conversations.currentConvoId}
        onNewChat={() => { conversations.createConversation(); navigate('/chat'); }}
        onSelectConvo={(id) => { conversations.selectConversation(id); navigate('/chat'); }} onDeleteConvo={conversations.deleteConversation} />
      <SidebarInset className="min-w-0">
        <header className="min-h-12 border-b flex flex-wrap items-center px-4 py-2 gap-3">
          <SidebarTrigger /><Smartphone className="h-4 w-4 text-primary" />
          <h1 className="text-sm font-semibold">Artemis</h1><Badge variant={running ? 'default' : 'outline'}>{status}</Badge>
          <Button className="ml-auto" size="icon" variant="ghost" title="Refresh status" aria-label="Refresh status" onClick={refresh}><RefreshCw className="h-4 w-4" /></Button>
        </header>
        <main className="w-full max-w-5xl mx-auto p-4 space-y-8">
          {unreachable && <div role="alert" className="border-l-2 border-destructive pl-3 space-y-2">
            <p className="text-sm text-destructive">Cannot reach your mini PC. Installation status is unknown.</p>
            <Button size="sm" variant="outline" onClick={() => navigate('/settings')}>Settings</Button>
          </div>}
          <section className="space-y-3">
            <h2 className="text-sm font-semibold">Installation</h2>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" disabled={!!busy} onClick={() => run('Check tools', artemis.checkTools)}>Check tools</Button>
              <Button size="sm" disabled={!!busy || installation === 'installing'} onClick={() => run('Install', artemis.install)}><Download className="h-4 w-4 mr-2" />Install Artemis</Button>
              <Button size="sm" variant="outline" disabled={!!busy} onClick={() => run('Logs', artemis.logs)}><ScrollText className="h-4 w-4 mr-2" />Logs</Button>
            </div>
            <p className="text-xs text-muted-foreground">Windows · Git required · Python 3.12 installed automatically · Android device with USB debugging</p>
          </section>
          <section className="space-y-3 border-t pt-6">
            <h2 className="text-sm font-semibold">Device console</h2>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" disabled={!!busy || !installed || running} onClick={() => run('Start', artemis.start)}><Play className="h-4 w-4 mr-2" />Start Artemis</Button>
              <Button size="sm" variant="outline" disabled={!!busy || !running} onClick={() => run('Stop', artemis.stop)}><Square className="h-4 w-4 mr-2" />Stop</Button>
              <Button size="sm" variant="outline" disabled={!!busy || !installed} onClick={() => run('Check device', artemis.devices)}><Smartphone className="h-4 w-4 mr-2" />Check device</Button>
              <Button size="sm" variant="outline" disabled={!running || !consoleUrl} asChild><a href={running ? consoleUrl : undefined} target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4 mr-2" />Open console</a></Button>
            </div>
            <p className="text-xs text-muted-foreground">Port {ARTEMIS_PORT} · Private network only — do not expose this phone-control console to the internet.</p>
            <p className="text-xs text-muted-foreground">A compatible vision model must be configured in Artemis. Provider usage may cost money; your app’s AI settings are not automatically shared.</p>
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