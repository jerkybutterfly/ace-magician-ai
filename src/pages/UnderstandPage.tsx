import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, BookOpen, Play, FolderTree, Code2, ExternalLink, Search } from 'lucide-react';
import { runUnderstand, type UAGraph, type UAGraphNode } from '@/lib/understand';
import { getSettings } from '@/lib/settings';
import { toast } from 'sonner';

const LAYER_STYLE: Record<string, string> = {
  api: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  service: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  data: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
  ui: 'bg-pink-500/15 text-pink-300 border-pink-500/30',
  utility: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  test: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
  config: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
  other: 'bg-muted text-muted-foreground border-border/40',
};

export default function UnderstandPage() {
  const settings = getSettings();
  const [path, setPath] = useState('');
  const [model, setModel] = useState(settings.defaultModel || 'gemma3:4b');
  const [maxFiles, setMaxFiles] = useState(150);
  const [running, setRunning] = useState(false);
  const [graph, setGraph] = useState<UAGraph | null>(null);
  const [filter, setFilter] = useState('');
  const [selected, setSelected] = useState<UAGraphNode | null>(null);

  const files = useMemo(
    () => (graph?.nodes ?? []).filter((n) => n.kind === 'file'),
    [graph],
  );
  const visibleFiles = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return files;
    return files.filter(
      (f) =>
        f.path.toLowerCase().includes(q) ||
        (f.summary ?? '').toLowerCase().includes(q),
    );
  }, [files, filter]);

  const childrenOf = (id: string) =>
    (graph?.nodes ?? []).filter((n) => n.kind !== 'file' && n.id.startsWith(id + '::'));

  const onRun = async () => {
    if (!path.trim()) {
      toast.error('Enter a codebase path on the agent host');
      return;
    }
    setRunning(true);
    setGraph(null);
    setSelected(null);
    try {
      const g = await runUnderstand({
        path: path.trim(),
        model,
        ollamaUrl: settings.ollamaUrl,
        maxFiles,
      });
      setGraph(g);
      toast.success(`Indexed ${g.stats.files} files, ${g.stats.functions} functions`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Run failed');
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      <div className="border-b border-border/50 p-4 space-y-3 shrink-0">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-semibold">Understand Anything</h1>
          <Badge variant="outline" className="text-[10px]">local · Ollama</Badge>
          <a
            href="https://github.com/Lum1104/Understand-Anything"
            target="_blank"
            rel="noreferrer"
            className="ml-auto text-xs text-muted-foreground hover:text-primary inline-flex items-center gap-1"
          >
            inspired by Lum1104/Understand-Anything <ExternalLink className="h-3 w-3" />
          </a>
        </div>
        <p className="text-xs text-muted-foreground">
          Point at any codebase path on the AM06 agent. Builds a knowledge graph of
          files, functions, classes and imports, summarised by your local model.
        </p>
        <div className="grid gap-2 sm:grid-cols-[1fr_180px_120px_auto]">
          <Input
            placeholder="/home/user/projects/my-repo"
            value={path}
            onChange={(e) => setPath(e.target.value)}
            disabled={running}
          />
          <Input
            placeholder="model"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            disabled={running}
          />
          <Input
            type="number"
            min={10}
            max={1000}
            value={maxFiles}
            onChange={(e) => setMaxFiles(Number(e.target.value) || 150)}
            disabled={running}
          />
          <Button onClick={onRun} disabled={running} className="gap-2">
            {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            {running ? 'Indexing…' : 'Understand'}
          </Button>
        </div>
        {graph && (
          <div className="flex flex-wrap gap-2 text-xs">
            <Badge variant="outline">{graph.stats.files} files</Badge>
            <Badge variant="outline">{graph.stats.functions} fns</Badge>
            <Badge variant="outline">{graph.stats.classes} classes</Badge>
            <Badge variant="outline">{graph.stats.edges} edges</Badge>
            {Object.entries(graph.stats.layers).map(([l, n]) => (
              <Badge key={l} variant="outline" className={LAYER_STYLE[l] ?? LAYER_STYLE.other}>
                {l}: {n}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {graph ? (
        <div className="flex-1 grid grid-cols-1 md:grid-cols-[1fr_1.2fr] min-h-0">
          <div className="border-r border-border/50 flex flex-col min-h-0">
            <div className="p-2 border-b border-border/50 flex items-center gap-2">
              <Search className="h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="filter files / summaries"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="h-7 text-xs"
              />
              <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                {visibleFiles.length}/{files.length}
              </span>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {visibleFiles.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setSelected(f)}
                  className={`w-full text-left rounded-lg px-2 py-1.5 border transition-colors ${
                    selected?.id === f.id
                      ? 'border-primary/50 bg-primary/10'
                      : 'border-transparent hover:bg-secondary/60'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <FolderTree className="h-3 w-3 text-muted-foreground shrink-0" />
                    <span className="text-xs font-mono truncate flex-1">{f.path}</span>
                    <Badge variant="outline" className={`text-[9px] ${LAYER_STYLE[f.layer] ?? LAYER_STYLE.other}`}>
                      {f.layer}
                    </Badge>
                  </div>
                  {f.summary && (
                    <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2 pl-5">
                      {f.summary}
                    </p>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-y-auto p-4">
            {selected ? (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-sm font-mono">{selected.path}</h2>
                    <Badge variant="outline" className={LAYER_STYLE[selected.layer] ?? LAYER_STYLE.other}>
                      {selected.layer}
                    </Badge>
                    {selected.language && <Badge variant="outline">{selected.language}</Badge>}
                    {selected.lines && <Badge variant="outline">{selected.lines} lines</Badge>}
                  </div>
                  {selected.summary && (
                    <p className="text-sm text-foreground/80 mt-2">{selected.summary}</p>
                  )}
                </div>

                <div>
                  <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                    Symbols
                  </h3>
                  <div className="space-y-1">
                    {childrenOf(selected.id).map((c) => (
                      <div
                        key={c.id}
                        className="flex items-center gap-2 text-xs rounded-md px-2 py-1 bg-card/40 border border-border/40"
                      >
                        <Code2 className="h-3 w-3 text-primary" />
                        <span className="font-medium">{c.name}</span>
                        <Badge variant="outline" className="text-[9px]">{c.kind}</Badge>
                        {c.line && (
                          <span className="ml-auto text-muted-foreground font-mono">:{c.line}</span>
                        )}
                      </div>
                    ))}
                    {childrenOf(selected.id).length === 0 && (
                      <p className="text-xs text-muted-foreground">No symbols extracted.</p>
                    )}
                  </div>
                </div>

                {selected.imports && selected.imports.length > 0 && (
                  <div>
                    <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                      Imports
                    </h3>
                    <div className="flex flex-wrap gap-1">
                      {selected.imports.map((i) => (
                        <Badge key={i} variant="outline" className="text-[10px] font-mono">{i}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                    Outgoing edges
                  </h3>
                  <div className="space-y-1">
                    {(graph.edges ?? [])
                      .filter((e) => e.source === selected.id)
                      .slice(0, 50)
                      .map((e, i) => (
                        <div key={i} className="text-xs font-mono text-muted-foreground">
                          <span className="text-primary">{e.relation}</span> → {e.target}
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                Select a file to inspect.
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground p-8 text-center">
          {running
            ? 'Walking the codebase and summarising with your local model…'
            : 'Enter a path on the agent host and click Understand.'}
        </div>
      )}
    </div>
  );
}
