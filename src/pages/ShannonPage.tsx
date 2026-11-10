import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Download, ExternalLink, RefreshCw, ShieldCheck, Square, Play, Terminal } from 'lucide-react';
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useConversations } from '@/hooks/useConversations';
import { shannon } from '@/lib/shannon';
import { getSettings } from '@/lib/settings';

export default function ShannonPage() {
  const navigate = useNavigate();
  const conversations = useConversations();
  const [busy, setBusy] = useState(false);
  const [connected, setConnected] = useState<boolean | null>(null);
  const [status, setStatus] = useState('Not checked');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [url, setUrl] = useState('');
  const [repository, setRepository] = useState('');
  const [workspace, setWorkspace] = useState('my-staging-test');
  const [model, setModel] = useState(getSettings().defaultModel || '');
  const [authorised, setAuthorised] = useState(false);
  const [nonProduction, setNonProduction] = useState(false);
  const refresh = useCallback(async () => {
    try { setStatus(await shannon.status()); setConnected(true); }
    catch { setConnected(false); setStatus('Mini PC unreachable'); }
  }, []);
  useEffect(() => { refresh(); const timer = setInterval(refresh, 15_000); return () => clearInterval(timer); }, [refresh]);
  async function run(fn: () => Promise<string>) {
    setBusy(true); setError('');
    try { setOutput(await fn()); await refresh(); }
    catch (e) { setError(e instanceof Error ? e.message : 'The command failed.'); }
    finally { setBusy(false); }
  }
  return <div className="flex min-h-screen w-full">
    <AppSidebar conversations={conversations.conversations} currentConvoId={conversations.currentConvoId}
      onNewChat={() => { conversations.createConversation(); navigate('/chat'); }}
      onSelectConvo={id => { conversations.selectConversation(id); navigate('/chat'); }} onDeleteConvo={conversations.deleteConversation} />
    <SidebarInset className="min-w-0">
      <header className="flex min-h-12 items-center gap-3 border-b border-border px-4">
        <SidebarTrigger /><ShieldCheck className="h-4 w-4 text-primary" /><h1 className="text-sm font-semibold">Shannon</h1>
        <Badge variant="outline" className="ml-auto">{connected === null ? 'CHECKING' : connected ? 'HELPER CONNECTED' : 'OFFLINE'}</Badge>
        <Button size="icon" variant="ghost" aria-label="Refresh Shannon status" onClick={refresh}><RefreshCw className="h-4 w-4" /></Button>
      </header>
      <main className="mx-auto w-full max-w-4xl space-y-6 p-4 md:p-6">
        <div className="space-y-2"><h2 className="text-2xl font-semibold">Shannon security testing</h2>
          <p className="text-sm text-muted-foreground">Keygraph’s autonomous web application and API pentester · Local Ollama · WSL2 + Docker</p>
          <Button asChild variant="link" className="h-auto p-0"><a href="https://github.com/KeygraphHQ/shannon" target="_blank" rel="noreferrer">Repository <ExternalLink className="ml-2 h-3 w-3" /></a></Button>
        </div>
        <div className="border-l-2 border-destructive bg-destructive/10 p-4 text-sm">Active exploits can change or delete data. Written permission and an isolated, non-production copy are required. A CPU-only Ollama model may be slow or unreliable for complex tests; success is not guaranteed.</div>
        {connected === false && <p className="text-sm text-destructive">Can’t reach your mini PC. <Link to="/settings" className="underline">Check the helper address in Settings</Link>.</p>}
        <section className="space-y-3 border-t border-border pt-5">
          <h3 className="font-semibold">Installation</h3>
          <p className="text-sm text-muted-foreground">Requires WSL2 with a Linux distribution, Node.js 22+ inside WSL, and Docker Desktop with WSL integration enabled. No NVIDIA GPU required. Windows may need a restart after installing WSL2.</p>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" disabled={busy} onClick={() => run(shannon.checkTools)}><Terminal className="mr-2 h-4 w-4" />Check tools</Button>
            <Button disabled={busy} onClick={() => run(shannon.install)}><Download className="mr-2 h-4 w-4" />Install Shannon</Button>
            <Button variant="outline" disabled={busy} onClick={() => run(shannon.logs)}>Logs</Button>
            <Button asChild variant="outline"><a href="https://github.com/KeygraphHQ/shannon/blob/main/docs/platforms.md" target="_blank" rel="noreferrer">Windows requirements <ExternalLink className="ml-2 h-4 w-4" /></a></Button>
          </div>
          <pre className="whitespace-pre-wrap break-words text-xs text-muted-foreground" aria-live="polite">{status}</pre>
        </section>
        <section className="space-y-4 border-t border-border pt-5">
          <h3 className="font-semibold">Authorised staging test</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2"><Label htmlFor="shannon-url">Staging application URL</Label><Input id="shannon-url" placeholder="http://host.docker.internal:3000" value={url} onChange={e => { setUrl(e.target.value); setAuthorised(false); setNonProduction(false); }} /></div>
            <div className="space-y-2 sm:col-span-2"><Label htmlFor="shannon-repo">Source repository on mini PC (WSL path)</Label><Input id="shannon-repo" placeholder="/mnt/c/Projects/my-app" value={repository} onChange={e => { setRepository(e.target.value); setAuthorised(false); }} /></div>
            <div className="space-y-2"><Label htmlFor="shannon-model">Installed Ollama model</Label><Input id="shannon-model" placeholder="qwen3:8b" value={model} onChange={e => setModel(e.target.value)} /></div>
            <div className="space-y-2"><Label htmlFor="shannon-workspace">Workspace</Label><Input id="shannon-workspace" value={workspace} onChange={e => setWorkspace(e.target.value)} /></div>
          </div>
          <p className="text-xs text-muted-foreground">Ollama must be reachable by Docker at host.docker.internal:11434. Reports stay in the WSL home folder under .shannon/workspaces. Your app’s AI settings are not changed.</p>
          <div className="flex items-start gap-3"><Checkbox id="shannon-authorised" checked={authorised} onCheckedChange={v => setAuthorised(v === true)} /><Label htmlFor="shannon-authorised" className="leading-5">I own this target or have explicit written permission to test it.</Label></div>
          <div className="flex items-start gap-3"><Checkbox id="shannon-staging" checked={nonProduction} onCheckedChange={v => setNonProduction(v === true)} /><Label htmlFor="shannon-staging" className="leading-5">This is an isolated non-production environment with backed-up test data.</Label></div>
          <div className="flex flex-wrap gap-2">
            <Button disabled={busy || !authorised || !nonProduction} onClick={() => { setAuthorised(false); setNonProduction(false); run(() => shannon.start({ url, repository, model, workspace, authorised, nonProduction })); }}><Play className="mr-2 h-4 w-4" />Start test</Button>
            <Button variant="destructive" disabled={busy || !workspace} onClick={() => run(() => shannon.stop(workspace))}><Square className="mr-2 h-4 w-4" />Stop workspace</Button>
          </div>
        </section>
        {error && <p role="alert" className="break-words text-sm text-destructive">{error}</p>}
        {output && <section className="border-t border-border pt-4"><h3 className="mb-3 font-semibold">Output</h3><pre className="max-h-96 overflow-auto whitespace-pre-wrap break-words rounded-md border border-border bg-muted p-4 text-xs" aria-live="polite">{output}</pre></section>}
      </main>
    </SidebarInset>
  </div>;
}