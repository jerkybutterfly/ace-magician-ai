import { useEffect, useMemo, useState } from 'react';
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useConversations } from '@/hooks/useConversations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, RefreshCw, ExternalLink, Search, Library, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { fetchAwesomeApps, groupByCategory, type AwesomeApp } from '@/lib/awesome-llm-apps';

const REPO_URL = 'https://github.com/Shubhamsaboo/awesome-llm-apps';

export default function AwesomeLlmAppsPage() {
  const convos = useConversations();
  const [apps, setApps] = useState<AwesomeApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string | null>(null);

  const load = async (force = false) => {
    setLoading(true);
    setError(null);
    try {
      setApps(await fetchAwesomeApps(force));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load catalog');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return apps.filter((a) =>
      (!category || a.category === category) &&
      (!q || a.name.toLowerCase().includes(q) || a.path.toLowerCase().includes(q))
    );
  }, [apps, query, category]);

  const grouped = useMemo(() => groupByCategory(filtered), [filtered]);
  const categories = useMemo(() => [...new Set(apps.map((a) => a.category))].sort(), [apps]);

  const cloneCmd = (app: AwesomeApp) =>
    `git clone --depth 1 --filter=blob:none --sparse https://github.com/Shubhamsaboo/awesome-llm-apps.git && cd awesome-llm-apps && git sparse-checkout set ${app.path}`;

  return (
    <div className="flex h-screen w-full">
      <AppSidebar {...convos} />
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center gap-3 border-b border-border/50 px-4 py-3">
          <SidebarTrigger />
          <Library className="h-5 w-5 text-primary" />
          <div>
            <h1 className="text-lg font-semibold">Awesome LLM Apps</h1>
            <p className="text-xs text-muted-foreground">
              Browse the awesome-llm-apps collection — {apps.length || '…'} example apps with code
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => load(true)} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              <span className="ml-1.5 hidden sm:inline">Refresh</span>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href={REPO_URL} target="_blank" rel="noreferrer">
                <ExternalLink className="h-4 w-4 mr-1.5" /> Repo
              </a>
            </Button>
          </div>
        </header>

        <div className="border-b border-border/50 px-4 py-3 space-y-3">
          <div className="relative max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search apps…"
              className="pl-8"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            <Badge
              variant={category === null ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setCategory(null)}
            >
              All
            </Badge>
            {categories.map((c) => (
              <Badge
                key={c}
                variant={category === c ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setCategory(category === c ? null : c)}
              >
                {c}
              </Badge>
            ))}
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-6">
            {error && (
              <Card className="border-destructive/50">
                <CardContent className="py-4 text-sm text-destructive">{error}</CardContent>
              </Card>
            )}
            {loading && apps.length === 0 && (
              <div className="flex items-center justify-center py-20 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading catalog from GitHub…
              </div>
            )}
            {[...grouped.entries()].map(([cat, list]) => (
              <section key={cat}>
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  {cat} <span className="text-xs font-normal">({list.length})</span>
                </h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {list.map((app) => (
                    <Card key={app.path} className="hover:border-primary/40 transition-colors">
                      <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-sm leading-snug">{app.name}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0 flex items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <a href={app.url} target="_blank" rel="noreferrer">
                            <ExternalLink className="h-3.5 w-3.5 mr-1" /> View code
                          </a>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Copy sparse-clone command for just this app"
                          onClick={() => {
                            navigator.clipboard.writeText(cloneCmd(app));
                            toast.success('Clone command copied — run it on your mini PC');
                          }}
                        >
                          <Copy className="h-3.5 w-3.5 mr-1" /> Clone
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            ))}
            {!loading && filtered.length === 0 && !error && (
              <p className="text-center text-sm text-muted-foreground py-16">No apps match your search.</p>
            )}
          </div>
        </ScrollArea>
      </main>
    </div>
  );
}
