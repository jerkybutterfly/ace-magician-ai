import { useEffect, useMemo, useState } from 'react';
import { RefreshCw, Trash2, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { getEpisodes, clearEpisodes, type Episode, type EpisodeOutcome } from '@/lib/learning';
import { toast } from 'sonner';

const OUTCOME_COLORS: Record<EpisodeOutcome, string> = {
  success: 'bg-primary/15 text-primary border-primary/30',
  error: 'bg-destructive/15 text-destructive border-destructive/30',
  denied: 'bg-yellow-500/15 text-yellow-500 border-yellow-500/30',
  blocked: 'bg-orange-500/15 text-orange-500 border-orange-500/30',
};

const OUTCOME_ICONS: Record<EpisodeOutcome, string> = {
  success: '✅',
  error: '⚠️',
  denied: '🚫',
  blocked: '⛔',
};

export default function AuditLogPage() {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [outcomeFilter, setOutcomeFilter] = useState<string>('all');
  const [toolFilter, setToolFilter] = useState<string>('all');

  const load = async () => {
    setLoading(true);
    try {
      const eps = await getEpisodes(500);
      setEpisodes(eps.reverse());
    } catch {
      toast.error('Failed to load episodes — is the agent online?');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const tools = useMemo(() => {
    const s = new Set<string>();
    episodes.forEach((e) => e.tool && s.add(e.tool));
    return Array.from(s).sort();
  }, [episodes]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return episodes.filter((ep) => {
      if (outcomeFilter !== 'all' && ep.outcome !== outcomeFilter) return false;
      if (toolFilter !== 'all' && ep.tool !== toolFilter) return false;
      if (q && !`${ep.request} ${ep.tag} ${ep.summary}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [episodes, query, outcomeFilter, toolFilter]);

  const stats = useMemo(() => {
    const total = filtered.length;
    const success = filtered.filter((e) => e.outcome === 'success').length;
    const fail = total - success;
    return { total, success, fail, rate: total ? Math.round((success / total) * 100) : 0 };
  }, [filtered]);

  const handleClear = async () => {
    if (!confirm('Clear ALL episode history? This cannot be undone.')) return;
    await clearEpisodes();
    setEpisodes([]);
    toast.success('Episode history cleared');
  };

  return (
    <div className="h-full flex flex-col p-4 gap-4 overflow-hidden">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold">Audit Log</h1>
          <p className="text-xs text-muted-foreground">Every tool call, ranked by recency. {stats.total} shown · {stats.success} ok · {stats.fail} failed · {stats.rate}% success</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={`h-3.5 w-3.5 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="ghost" size="sm" onClick={handleClear} className="text-destructive hover:text-destructive">
            <Trash2 className="h-3.5 w-3.5 mr-1" />
            Clear
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search request, tag, or summary…"
            className="pl-8 h-8 text-xs"
          />
        </div>
        <Select value={outcomeFilter} onValueChange={setOutcomeFilter}>
          <SelectTrigger className="h-8 w-[130px] text-xs">
            <Filter className="h-3 w-3 mr-1" />
            <SelectValue placeholder="Outcome" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All outcomes</SelectItem>
            <SelectItem value="success">✅ Success</SelectItem>
            <SelectItem value="error">⚠️ Error</SelectItem>
            <SelectItem value="denied">🚫 Denied</SelectItem>
            <SelectItem value="blocked">⛔ Blocked</SelectItem>
          </SelectContent>
        </Select>
        <Select value={toolFilter} onValueChange={setToolFilter}>
          <SelectTrigger className="h-8 w-[160px] text-xs">
            <SelectValue placeholder="Tool" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All tools ({tools.length})</SelectItem>
            {tools.map((t) => (
              <SelectItem key={t} value={t}>{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-1.5 pr-2">
          {filtered.length === 0 && (
            <div className="text-center text-sm text-muted-foreground py-12">
              {episodes.length === 0 ? 'No episodes logged yet — every tool call will appear here.' : 'No matches.'}
            </div>
          )}
          {filtered.map((ep, i) => (
            <Card key={`${ep.ts}-${i}`} className="p-2.5 hover:bg-secondary/30 transition-colors">
              <div className="flex items-start gap-2">
                <span className="text-base shrink-0 leading-none mt-0.5">{OUTCOME_ICONS[ep.outcome]}</span>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className={`text-[10px] py-0 h-4 ${OUTCOME_COLORS[ep.outcome]}`}>
                      {ep.outcome}
                    </Badge>
                    {ep.tool && (
                      <Badge variant="secondary" className="text-[10px] py-0 h-4 font-mono">
                        {ep.tool}
                      </Badge>
                    )}
                    <span className="text-[10px] text-muted-foreground ml-auto">
                      {new Date(ep.ts).toLocaleString()}
                    </span>
                  </div>
                  {ep.request && (
                    <div className="text-xs text-muted-foreground line-clamp-1">
                      <span className="text-foreground/70">›</span> {ep.request}
                    </div>
                  )}
                  <code className="block text-[11px] bg-muted/40 px-2 py-1 rounded font-mono break-all">
                    {ep.tag}
                  </code>
                  {ep.summary && (
                    <div className="text-[11px] text-muted-foreground line-clamp-2 pl-1">
                      {ep.summary}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
