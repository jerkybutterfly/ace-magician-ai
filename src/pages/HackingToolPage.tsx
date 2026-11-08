import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, ExternalLink, RefreshCw, Search, ShieldCheck } from 'lucide-react';
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useConversations } from '@/hooks/useConversations';
import { hackingtool, type HackingToolCatalog } from '@/lib/hackingtool';

export default function HackingToolPage() {
  const navigate = useNavigate();
  const conversations = useConversations();
  const [catalog, setCatalog] = useState<HackingToolCatalog | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const refresh = useCallback(async () => {
    setBusy(true);
    try { setCatalog(await hackingtool.catalog()); setError(''); }
    catch (e) { setCatalog(null); setError(e instanceof Error ? e.message : 'Cannot reach your mini PC'); }
    finally { setBusy(false); }
  }, []);
  useEffect(() => { void refresh(); }, [refresh]);
  const download = async () => {
    setBusy(true);
    try { await hackingtool.download(); await refresh(); }
    catch (e) { setError(e instanceof Error ? e.message : 'Catalogue download failed'); }
    finally { setBusy(false); }
  };
  const categories = useMemo(() => [...new Set(catalog?.tools.map(t => t.category) || [])].sort(), [catalog]);
  const tools = useMemo(() => (catalog?.tools || []).filter(t =>
    (category === 'all' || t.category === category) && query.toLowerCase().split(/\s+/).every(word =>
      `${t.title} ${t.description} ${t.category}`.toLowerCase().includes(word))), [catalog, category, query]);
  return <div className="flex min-h-screen w-full">
    <AppSidebar conversations={conversations.conversations} currentConvoId={conversations.currentConvoId}
      onNewChat={() => { conversations.createConversation(); navigate('/chat'); }}
      onSelectConvo={id => { conversations.selectConversation(id); navigate('/chat'); }} onDeleteConvo={conversations.deleteConversation} />
    <SidebarInset className="min-w-0">
      <header className="min-h-12 border-b flex flex-wrap items-center px-4 py-2 gap-3">
        <SidebarTrigger /><ShieldCheck className="h-4 w-4 text-primary" />
        <h1 className="text-sm font-semibold">HackingTool</h1>
        <Badge variant="outline">{error ? 'UNAVAILABLE' : catalog?.loaded ? 'CATALOGUE READY' : 'NOT LOADED'}</Badge>
        <Button size="icon" variant="ghost" className="ml-auto" disabled={busy} aria-label="Refresh catalogue" title="Refresh catalogue" onClick={refresh}><RefreshCw className="h-4 w-4" /></Button>
      </header>
      <main className="mx-auto w-full max-w-5xl p-4 space-y-6">
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Security tool catalogue</h2>
          <p className="text-sm text-muted-foreground">Read-only · No tools installed or executed</p>
          <div className="border-l-2 border-destructive pl-3 text-sm space-y-2">
            <p>The requested repository contains mismatched installer links and an unverified ZIP archive. Installer execution is disabled.</p>
            <p className="text-muted-foreground">Only pinned, checksum-verified catalogue data is downloaded. Use security tools only on systems you own or have permission to test.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button disabled={busy || !!error} onClick={download}><Download className="mr-2 h-4 w-4" />{busy ? 'Connecting…' : catalog?.loaded ? 'Reload catalogue' : 'Load catalogue'}</Button>
            <Button variant="outline" asChild><a href="https://github.com/MAXZL1/hackingtool-plugin" target="_blank" rel="noopener noreferrer"><ExternalLink className="mr-2 h-4 w-4" />Repository</a></Button>
          </div>
        </section>
        {error && <section role="alert" className="border-l-2 border-destructive pl-3 space-y-3">
          <p className="text-sm text-destructive break-words">{error}</p>
          <p className="text-sm text-muted-foreground">The latest helper needs both agent.py and hackingtool_catalog.py in the same folder on your mini PC.</p>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" asChild><a href="/agent.py" download>Download helper</a></Button>
            <Button size="sm" variant="outline" asChild><a href="/hackingtool_catalog.py" download>Download catalogue adapter</a></Button>
            <Button size="sm" variant="outline" onClick={() => navigate('/settings')}>Settings</Button>
          </div>
        </section>}
        <section className="border-t pt-5 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input aria-label="Search tools" placeholder="Search tools" className="pl-9" value={query} onChange={e => setQuery(e.target.value)} /></div>
            <Select value={category} onValueChange={setCategory}><SelectTrigger aria-label="Category" className="w-full sm:w-64"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All categories</SelectItem>{categories.map(c => <SelectItem key={c} value={c}>{c.replace(/_/g, ' ')}</SelectItem>)}</SelectContent></Select>
          </div>
          <p className="text-xs text-muted-foreground">{tools.length} tools{catalog?.loaded ? ` · Revision ${catalog.commit.slice(0, 12)}` : ''}</p>
          {!tools.length && <p className="text-sm text-muted-foreground py-8">{catalog?.loaded ? 'No matching tools.' : 'Catalogue not loaded.'}</p>}
          <div className="divide-y divide-border">{tools.map(t => <article key={t.id} className="py-4 space-y-1">
            <div className="flex items-start gap-2 justify-between"><h3 className="text-sm font-medium break-words min-w-0">{t.title}</h3>
              {t.project_url.startsWith('https://') && <Button size="icon" variant="ghost" className="shrink-0" asChild><a href={t.project_url} target="_blank" rel="noopener noreferrer" aria-label={`Open ${t.title} project`} title="Open project"><ExternalLink className="h-4 w-4" /></a></Button>}</div>
            <p className="text-xs text-primary">{t.category.replace(/_/g, ' ')}</p>
            <p className="text-sm text-muted-foreground break-words">{t.description}</p>
          </article>)}</div>
        </section>
      </main>
    </SidebarInset>
  </div>;
}