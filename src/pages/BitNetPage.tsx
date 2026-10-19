import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Gauge, Play, RefreshCw, ScrollText, Binary } from 'lucide-react';
import { toast } from 'sonner';
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useConversations } from '@/hooks/useConversations';
import { bitnet } from '@/lib/bitnet';

type R = { stdout: string; stderr: string; returncode: number };

export default function BitNetPage() {
  const navigate = useNavigate();
  const conversations = useConversations();
  const [busy, setBusy] = useState('');
  const [installation, setInstallation] = useState('unknown');
  const [unreachable, setUnreachable] = useState(false);
  const [output, setOutput] = useState('');
  const [prompt, setPrompt] = useState('Explain in three sentences why 1-bit models run fast on a CPU.');
  const [threads, setThreads] = useState(4);

  const refresh = useCallback(async () => {
    try {
      const s = await bitnet.installation();
      setInstallation((p) => s === 'not-verified' && p === 'installing' ? p : s); setUnreachable(false);
    } catch { setUnreachable(true); setInstallation('unknown'); }
  }, []);
  useEffect(() => { void refresh(); const t = window.setInterval(() => void refresh(), 10_000); return () => window.clearInterval(t); }, [refresh]);

  const run = async (label: string, action: () => Promise<R>, note?: string) => {
    if (busy) return;
    setBusy(label);
    try {
      const r = await action();
      setOutput([r.stdout, r.stderr].filter(Boolean).join('\n') || note || `${label} started.`);
      if (r.returncode !== 0) toast.error(`${label} failed — see output`);
      else { if (label === 'Install') setInstallation('installing'); if (note) toast.success(note); }
    } catch (e) {
      setOutput(e instanceof Error ? e.message : 'Cannot reach your mini PC'); toast.error('Could not complete request');
    } finally { setBusy(''); }
  };

  const installed = installation === 'installed';
  const status = unreachable ? 'UNREACHABLE' : installed ? 'INSTALLED' : installation === 'failed' ? 'INSTALL FAILED' : installation === 'installing' ? 'INSTALLING' : 'NOT INSTALLED';
  return (
    <div className="flex min-h-screen w-full">
      <AppSidebar conversations={conversations.conversations} currentConvoId={conversations.currentConvoId}
        onNewChat={() => { conversations.createConversation(); navigate('/chat'); }}
        onSelectConvo={(id) => { conversations.selectConversation(id); navigate('/chat'); }} onDeleteConvo={conversations.deleteConversation} />
      <SidebarInset className="min-w-0">
        <header className="min-h-12 border-b flex flex-wrap items-center px-4 py-2 gap-3">
          <SidebarTrigger /><Binary className="h-4 w-4 text-primary" />
          <h1 className="text-sm font-semibold">BitNet</h1><Badge variant={installed ? 'default' : 'outline'}>{status}</Badge>
          <Button className="ml-auto" size="icon" variant="ghost" aria-label="Refresh status" onClick={refresh}><RefreshCw className="h-4 w-4" /></Button>
        </header>
        <main className="w-full max-w-5xl mx-auto p-4 space-y-8">
          {unreachable && <div role="alert" className="border-l-2 border-destructive pl-3 space-y-2">
            <p className="text-sm text-destructive">Cannot reach your mini PC. Check the helper address.</p>
            <Button size="sm" variant="outline" onClick={() => navigate('/settings')}>Settings</Button>
          </div>}
          <section className="space-y-3">
            <h2 className="text-sm font-semibold">1 · Install</h2>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" disabled={!!busy} onClick={() => run('Check tools', bitnet.checkTools)}>Check tools</Button>
              <Button size="sm" disabled={!!busy || installation === 'installing'} onClick={() => run('Install', bitnet.install, 'Installation started on your mini PC')}><Download className="h-4 w-4 mr-2" />Install BitNet</Button>
              <Button size="sm" variant="outline" disabled={!!busy} onClick={() => run('Logs', bitnet.logs)}><ScrollText className="h-4 w-4 mr-2" />Logs</Button>
            </div>
            <p className="text-xs text-muted-foreground">Needs Git. Installs Microsoft's C++ build tools if missing (big download, 20+ min), then the 2B BitNet model (~1.2 GB). No graphics card needed.</p>
          </section>
          <section className="space-y-3 border-t pt-6">
            <h2 className="text-sm font-semibold">2 · Test</h2>
            <Textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={3} aria-label="Prompt" />
            <label className="flex items-center gap-2 text-xs text-muted-foreground">CPU threads
              <Input className="w-20 h-8" type="number" min={1} max={16} value={threads} onChange={(e) => setThreads(Number(e.target.value))} />
            </label>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" disabled={!!busy || !installed} onClick={() => run('Run prompt', () => bitnet.runPrompt(prompt, threads), 'Running — press Show answer in a few seconds')}><Play className="h-4 w-4 mr-2" />Run prompt</Button>
              <Button size="sm" variant="outline" disabled={!!busy} onClick={() => run('Show answer', () => bitnet.result('prompt'))}>Show answer</Button>
              <Button size="sm" disabled={!!busy || !installed} onClick={() => run('Benchmark', () => bitnet.benchmark(threads), 'Benchmark running — press Show speed in a minute')}><Gauge className="h-4 w-4 mr-2" />Benchmark</Button>
              <Button size="sm" variant="outline" disabled={!!busy} onClick={() => run('Show speed', () => bitnet.result('bench'))}>Show speed</Button>
            </div>
            <p className="text-xs text-muted-foreground">The speed result lists tokens per second — compare it with the same size model in Ollama.</p>
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
