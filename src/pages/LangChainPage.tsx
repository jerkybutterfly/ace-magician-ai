import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Play, RefreshCw, ScrollText, Workflow } from 'lucide-react';
import { toast } from 'sonner';
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useConversations } from '@/hooks/useConversations';
import { getSettings } from '@/lib/settings';
import { langchain, type LangChainAgentResult } from '@/lib/langchain';

export default function LangChainPage() {
  const navigate = useNavigate();
  const conversations = useConversations();
  const [busy, setBusy] = useState('');
  const [installation, setInstallation] = useState('unknown');
  const [helperReady, setHelperReady] = useState(false);
  const [unreachable, setUnreachable] = useState(false);
  const [output, setOutput] = useState('');
  const [model, setModel] = useState(() => getSettings().defaultModel || 'gemma3:4b');
  const [task, setTask] = useState('');
  const [result, setResult] = useState<LangChainAgentResult | null>(null);

  const refresh = useCallback(async () => {
    try {
      const [installed, status] = await Promise.all([langchain.installation(), langchain.status().catch(() => null)]);
      setInstallation((previous) => installed === 'not-verified' && previous === 'installing' ? previous : installed);
      setHelperReady(Boolean(status && status.installed));
      setUnreachable(false);
    } catch { setUnreachable(true); setInstallation('unknown'); setHelperReady(false); }
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
      const res = await action();
      setOutput([res.stdout, res.stderr].filter(Boolean).join('\n') || `${label} requested. Check logs for progress.`);
      if (res.returncode !== 0) toast.error(`${label} failed — see output`);
      else if (label === 'Install') { setInstallation('installing'); toast.success('Installation started on your mini PC'); }
      else toast.success(`${label} requested`);
      if (label !== 'Install') await refresh();
    } catch (error) {
      setOutput(error instanceof Error ? error.message : 'Cannot reach your mini PC');
      toast.error('Could not complete request');
    } finally { setBusy(''); }
  };

  const runAgent = async () => {
    if (busy || !task.trim()) return;
    setBusy('Agent');
    setResult(null);
    try {
      const res = await langchain.runAgent(task.trim(), model.trim() || 'gemma3:4b');
      setResult(res);
      toast.success('Agent finished');
    } catch (error) {
      setOutput(error instanceof Error ? error.message : 'Agent failed');
      toast.error('Agent failed — see output');
    } finally { setBusy(''); }
  };

  const installed = installation === 'installed';
  const status = unreachable ? 'UNREACHABLE' : helperReady ? 'READY' : installed ? 'INSTALLED' : installation === 'failed' ? 'INSTALL FAILED' : installation === 'installing' ? 'INSTALLING' : 'NOT VERIFIED';
  return (
    <div className="flex min-h-screen w-full">
      <AppSidebar conversations={conversations.conversations} currentConvoId={conversations.currentConvoId}
        onNewChat={() => { conversations.createConversation(); navigate('/chat'); }}
        onSelectConvo={(id) => { conversations.selectConversation(id); navigate('/chat'); }} onDeleteConvo={conversations.deleteConversation} />
      <SidebarInset className="min-w-0">
        <header className="min-h-12 border-b flex flex-wrap items-center px-4 py-2 gap-3">
          <SidebarTrigger /><Workflow className="h-4 w-4 text-primary" />
          <h1 className="text-sm font-semibold">LangChain</h1><Badge variant={helperReady ? 'default' : 'outline'}>{status}</Badge>
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
              <Button size="sm" variant="outline" disabled={!!busy} onClick={() => run('Check tools', langchain.checkTools)}>Check Python &amp; Ollama</Button>
              <Button size="sm" disabled={!!busy || installation === 'installing'} onClick={() => run('Install', langchain.install)}><Download className="h-4 w-4 mr-2" />Install LangChain</Button>
              <Button size="sm" variant="outline" disabled={!!busy} onClick={() => run('Logs', langchain.logs)}><ScrollText className="h-4 w-4 mr-2" />Logs</Button>
            </div>
            <p className="text-xs text-muted-foreground">Installs LangChain into the mini PC's Python so the helper program's brain runs on it: your model decides which tools to call (terminal, files, web, system info) and LangChain runs the loop.</p>
            <p className="text-xs text-muted-foreground">The helper program itself must be the latest version of agent.py from this app — replace the copy on your mini PC and restart it, or the badge stays at INSTALLED instead of READY.</p>
          </section>
          <section className="space-y-3 border-t pt-6">
            <h2 className="text-sm font-semibold">Try the agent</h2>
            <div className="flex flex-wrap items-center gap-2">
              <label htmlFor="lc-model" className="text-xs text-muted-foreground">Model</label>
              <Input id="lc-model" className="w-48 h-8 text-sm" value={model} onChange={(e) => setModel(e.target.value)} placeholder="gemma3:4b" />
            </div>
            <Textarea value={task} onChange={(e) => setTask(e.target.value)} rows={3}
              placeholder='Give the agent a job, e.g. "List what is on my desktop and save the list to a text file"' />
            <Button size="sm" disabled={!!busy || !helperReady || !task.trim()} onClick={runAgent}><Play className="h-4 w-4 mr-2" />Run agent</Button>
            {result && <div className="border rounded-md p-3 space-y-3" aria-live="polite">
              <p className="text-sm whitespace-pre-wrap break-words">{result.output || '(no answer)'}</p>
              {result.steps.length > 0 && <div className="space-y-2 border-t pt-3">
                <p className="text-xs text-muted-foreground">Tools used ({result.steps.length})</p>
                {result.steps.map((step, i) => <div key={i} className="text-xs font-mono border-l-2 border-primary pl-2">
                  <p className="text-primary">{step.tool}</p>
                  <p className="text-muted-foreground break-words">{JSON.stringify(step.input)}</p>
                  <p className="break-words whitespace-pre-wrap">{step.output.slice(0, 300)}</p>
                </div>)}
              </div>}
            </div>}
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
