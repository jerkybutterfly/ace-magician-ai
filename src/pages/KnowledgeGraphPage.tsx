import { useState, useEffect, useCallback } from 'react';
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useConversations } from '@/hooks/useConversations';
import { Brain, Plus, Search, GitBranch, Trash2, ArrowRight, BarChart3, RefreshCw, X } from 'lucide-react';

const AGENT = 'http://localhost:8484';

const TYPE_COLORS: Record<string, string> = {
  concept: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  person:  'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  place:   'bg-purple-500/20 text-purple-300 border-purple-500/30',
  event:   'bg-orange-500/20 text-orange-300 border-orange-500/30',
  tool:    'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  file:    'bg-slate-500/20 text-slate-300 border-slate-500/30',
};

interface Entity { id: string; name: string; type: string; description?: string; }
interface Edge { source: string; target: string; relation: string; notes?: string; weight?: number; }
interface Stats { nodes: number; edges: number; density: number; components: number; is_dag: boolean; }

function EntityCard({ entity, onDelete, onExplore }: { entity: Entity; onDelete: (id: string) => void; onExplore: (id: string) => void }) {
  const color = TYPE_COLORS[entity.type] ?? TYPE_COLORS.concept;
  return (
    <div className="rounded-xl border border-border/40 bg-card/50 p-3 flex items-start gap-3 group hover:border-primary/30 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-foreground">{entity.name}</span>
          <Badge variant="outline" className={`text-[10px] border ${color}`}>{entity.type}</Badge>
        </div>
        {entity.description && <p className="text-xs text-muted-foreground mt-0.5 truncate">{entity.description}</p>}
        <p className="text-[10px] text-muted-foreground/50 font-mono mt-0.5">{entity.id}</p>
      </div>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => onExplore(entity.id)} title="Explore neighbours" className="text-muted-foreground hover:text-primary transition-colors p-1">
          <GitBranch className="h-3.5 w-3.5" />
        </button>
        <button onClick={() => onDelete(entity.id)} title="Delete" className="text-muted-foreground hover:text-destructive transition-colors p-1">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

function NeighbourPanel({ centre, nodes, edges, onClose }: { centre: string; nodes: Entity[]; edges: Edge[]; onClose: () => void }) {
  return (
    <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GitBranch className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-primary">Neighbourhood: <span className="font-mono">{centre}</span></span>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
      </div>
      <div className="space-y-1.5">
        {edges.map((e, i) => (
          <div key={i} className="flex items-center gap-2 text-xs text-foreground/80 bg-background/40 rounded-lg px-3 py-2">
            <span className="font-mono text-muted-foreground">{e.source}</span>
            <ArrowRight className="h-3 w-3 text-primary flex-shrink-0" />
            <span className="text-primary font-medium">{e.relation}</span>
            <ArrowRight className="h-3 w-3 text-primary flex-shrink-0" />
            <span className="font-mono text-muted-foreground">{e.target}</span>
          </div>
        ))}
        {edges.length === 0 && <p className="text-xs text-muted-foreground">No relationships found.</p>}
      </div>
    </div>
  );
}

export default function KnowledgeGraphPage() {
  const { conversations, currentConvoId, createConversation, selectConversation, deleteConversation } = useConversations();

  const [tab, setTab] = useState<'browse' | 'add-entity' | 'add-relation' | 'path'>('browse');
  const [entities, setEntities] = useState<Entity[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [searchQ, setSearchQ] = useState('');
  const [neighbour, setNeighbour] = useState<{ centre: string; nodes: Entity[]; edges: Edge[] } | null>(null);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  // Add entity form
  const [eName, setEName] = useState(''); const [eType, setEType] = useState('concept'); const [eDesc, setEDesc] = useState('');
  // Add relation form
  const [rSrc, setRSrc] = useState(''); const [rTgt, setRTgt] = useState(''); const [rRel, setRRel] = useState(''); const [rNotes, setRNotes] = useState('');
  // Path form
  const [pSrc, setPSrc] = useState(''); const [pTgt, setPTgt] = useState(''); const [pathResult, setPathResult] = useState<any>(null);

  const fetchStats = useCallback(async () => {
    try { const r = await fetch(`${AGENT}/graph/stats`); if (r.ok) setStats(await r.json()); } catch {}
  }, []);

  const fetchEntities = useCallback(async (q = '') => {
    try {
      const url = q ? `${AGENT}/graph/search?q=${encodeURIComponent(q)}` : `${AGENT}/graph/search?q=`;
      const r = await fetch(url); if (r.ok) setEntities(await r.json());
    } catch {}
  }, []);

  useEffect(() => { fetchStats(); fetchEntities(); }, []);
  useEffect(() => { const t = setTimeout(() => fetchEntities(searchQ), 300); return () => clearTimeout(t); }, [searchQ]);

  const addEntity = async () => {
    if (!eName.trim()) return;
    setLoading(true);
    try {
      await fetch(`${AGENT}/graph/entity`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ name: eName.trim(), entity_type: eType, description: eDesc }) });
      setStatus(`✅ Entity '${eName}' added`); setEName(''); setEDesc('');
      fetchEntities(searchQ); fetchStats();
    } catch (e: any) { setStatus(`❌ ${e.message}`); } finally { setLoading(false); }
  };

  const addRelation = async () => {
    if (!rSrc.trim() || !rTgt.trim() || !rRel.trim()) return;
    setLoading(true);
    try {
      await fetch(`${AGENT}/graph/relation`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ source: rSrc, target: rTgt, relation: rRel, notes: rNotes }) });
      setStatus(`✅ Relation added`); setRSrc(''); setRTgt(''); setRRel(''); setRNotes('');
      fetchStats();
    } catch (e: any) { setStatus(`❌ ${e.message}`); } finally { setLoading(false); }
  };

  const deleteEntity = async (name: string) => {
    try {
      await fetch(`${AGENT}/graph/entity/${encodeURIComponent(name)}`, { method: 'DELETE' });
      setStatus(`🗑️ Deleted '${name}'`); fetchEntities(searchQ); fetchStats();
    } catch {}
  };

  const exploreNeighbours = async (name: string) => {
    try {
      const r = await fetch(`${AGENT}/graph/neighbours/${encodeURIComponent(name)}?depth=2`);
      if (r.ok) { const d = await r.json(); setNeighbour({ centre: d.centre, nodes: d.nodes, edges: d.edges }); }
    } catch {}
  };

  const findPath = async () => {
    if (!pSrc.trim() || !pTgt.trim()) return;
    setLoading(true);
    try {
      const r = await fetch(`${AGENT}/graph/path`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ source: pSrc, target: pTgt }) });
      setPathResult(await r.json());
    } catch (e: any) { setPathResult({ error: e.message }); } finally { setLoading(false); }
  };

  const TABS = [
    { id: 'browse', label: 'Browse' },
    { id: 'add-entity', label: 'Add Entity' },
    { id: 'add-relation', label: 'Add Relation' },
    { id: 'path', label: 'Find Path' },
  ] as const;

  return (
    <div className="flex-1 flex flex-col min-w-0">
      {/* Header */}
      <div className="border-b border-border/50 bg-background/95 backdrop-blur sticky top-0 z-10">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-7 h-7 rounded-lg bg-primary/10 ring-1 ring-primary/20 flex items-center justify-center">
            <Brain className="h-4 w-4 text-primary" />
          </div>
            <div>
              <h1 className="text-sm font-bold text-foreground">Knowledge Graph</h1>
              <p className="text-[10px] text-muted-foreground">Entity memory &amp; relationships</p>
            </div>
            {stats && (
              <div className="ml-auto flex items-center gap-3 text-[10px] text-muted-foreground">
                <span><span className="text-foreground font-medium">{stats.nodes}</span> nodes</span>
                <span><span className="text-foreground font-medium">{stats.edges}</span> edges</span>
                <span><span className="text-foreground font-medium">{stats.components}</span> components</span>
              </div>
            )}
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { fetchEntities(searchQ); fetchStats(); }} title="Refresh">
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          </div>
          {/* Tabs */}
          <div className="flex gap-1 px-4 pb-2">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${tab === t.id ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'}`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 max-w-4xl mx-auto w-full space-y-4">
          {status && (
            <div className="text-xs px-3 py-2 rounded-lg bg-secondary/50 text-foreground/80 flex items-center justify-between">
              <span>{status}</span>
              <button onClick={() => setStatus('')}><X className="h-3 w-3" /></button>
            </div>
          )}

          {/* Browse */}
          {tab === 'browse' && (
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Search entities…" className="pl-9 bg-background/50" />
              </div>
              {neighbour && <NeighbourPanel {...neighbour} onClose={() => setNeighbour(null)} />}
              {entities.length === 0 ? (
                <div className="text-center py-16 space-y-3">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 ring-1 ring-primary/20 flex items-center justify-center mx-auto">
                    <Brain className="h-8 w-8 text-primary/60" />
                  </div>
                  <p className="text-sm text-muted-foreground">No entities yet. Add some using the tabs above.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {entities.map(e => <EntityCard key={e.id} entity={e} onDelete={deleteEntity} onExplore={exploreNeighbours} />)}
                </div>
              )}
            </div>
          )}

          {/* Add Entity */}
          {tab === 'add-entity' && (
            <div className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Plus className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-semibold">Add Entity</h2>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 space-y-1">
                  <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Name *</label>
                  <Input value={eName} onChange={e => setEName(e.target.value)} placeholder="e.g. Stephen Dunne" className="bg-background/50" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Type</label>
                  <select value={eType} onChange={e => setEType(e.target.value)}
                    className="w-full h-9 rounded-md border border-input bg-background/50 px-3 text-sm text-foreground">
                    {['concept','person','place','event','tool','file'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Description</label>
                  <Input value={eDesc} onChange={e => setEDesc(e.target.value)} placeholder="Optional" className="bg-background/50" />
                </div>
              </div>
              <Button onClick={addEntity} disabled={loading || !eName.trim()} className="gap-2">
                <Plus className="h-4 w-4" /> Add Entity
              </Button>
            </div>
          )}

          {/* Add Relation */}
          {tab === 'add-relation' && (
            <div className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur p-5 space-y-4">
              <div className="flex items-center gap-2">
                <ArrowRight className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-semibold">Add Relationship</h2>
              </div>
              <div className="grid grid-cols-3 gap-3 items-end">
                <div className="space-y-1">
                  <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Source *</label>
                  <Input value={rSrc} onChange={e => setRSrc(e.target.value)} placeholder="e.g. python" className="bg-background/50" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Relation *</label>
                  <Input value={rRel} onChange={e => setRRel(e.target.value)} placeholder="e.g. is_used_by" className="bg-background/50" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Target *</label>
                  <Input value={rTgt} onChange={e => setRTgt(e.target.value)} placeholder="e.g. agent" className="bg-background/50" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Notes</label>
                <Input value={rNotes} onChange={e => setRNotes(e.target.value)} placeholder="Optional context" className="bg-background/50" />
              </div>
              <Button onClick={addRelation} disabled={loading || !rSrc.trim() || !rTgt.trim() || !rRel.trim()} className="gap-2">
                <ArrowRight className="h-4 w-4" /> Add Relationship
              </Button>
            </div>
          )}

          {/* Path Finder */}
          {tab === 'path' && (
            <div className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur p-5 space-y-4">
              <div className="flex items-center gap-2">
                <GitBranch className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-semibold">Find Shortest Path</h2>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-muted-foreground uppercase tracking-wider">From</label>
                  <Input value={pSrc} onChange={e => setPSrc(e.target.value)} placeholder="Source entity" className="bg-background/50" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-muted-foreground uppercase tracking-wider">To</label>
                  <Input value={pTgt} onChange={e => setPTgt(e.target.value)} placeholder="Target entity" className="bg-background/50" />
                </div>
              </div>
              <Button onClick={findPath} disabled={loading || !pSrc.trim() || !pTgt.trim()} className="gap-2">
                <BarChart3 className="h-4 w-4" /> Find Path
              </Button>
              {pathResult && (
                <div className={`rounded-xl p-4 ${pathResult.error ? 'bg-red-500/5 border border-red-500/20' : 'bg-primary/5 border border-primary/20'}`}>
                  {pathResult.error ? (
                    <p className="text-sm text-red-400">{pathResult.error}</p>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground">Path length: <span className="text-foreground font-medium">{pathResult.length}</span></p>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {pathResult.path?.map((node: string, i: number) => (
                          <div key={i} className="flex items-center gap-1.5">
                            <span className="px-2 py-1 rounded-lg bg-primary/10 text-xs font-mono text-primary">{node}</span>
                            {i < pathResult.path.length - 1 && (
                              <div className="flex flex-col items-center">
                                <span className="text-[9px] text-muted-foreground">{pathResult.edges?.[i]?.relation}</span>
                                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
    </div>
  );
}
