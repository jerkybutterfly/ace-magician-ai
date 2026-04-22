import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Cpu, Download, Trash2, Plus, RefreshCw, CheckCircle2, AlertCircle, Link2, Copy as CopyIcon, FolderInput, Zap, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  listLocalModels,
  loadLocalModel,
  unloadLocalModel,
  deleteLocalModel,
  pullLocalModel,
  getLocalLLMStatus,
  scanExternalModels,
  importExternalModel,
  type LocalModel,
  type LocalLLMStatus,
  type ExternalModel,
} from '@/lib/local-llm';
import { getSystemInfo, type SystemInfo } from '@/lib/agent';
import { TuneWizard, type TunedParams } from '@/components/TuneWizard';

const SUGGESTED = [
  { label: 'Hermes-3-Llama-3.2-3B Q4', url: 'https://huggingface.co/NousResearch/Hermes-3-Llama-3.2-3B-GGUF/resolve/main/Hermes-3-Llama-3.2-3B.Q4_K_M.gguf' },
  { label: 'Llama-3.2-3B-Instruct Q4', url: 'https://huggingface.co/bartowski/Llama-3.2-3B-Instruct-GGUF/resolve/main/Llama-3.2-3B-Instruct-Q4_K_M.gguf' },
  { label: 'Qwen2.5-3B-Instruct Q4', url: 'https://huggingface.co/bartowski/Qwen2.5-3B-Instruct-GGUF/resolve/main/Qwen2.5-3B-Instruct-Q4_K_M.gguf' },
  { label: 'Phi-3.5-mini-Instruct Q4', url: 'https://huggingface.co/bartowski/Phi-3.5-mini-instruct-GGUF/resolve/main/Phi-3.5-mini-instruct-Q4_K_M.gguf' },
];

const RECOMMENDED = [
  { label: 'Phi-3.5 Mini Q5_K_M', size: '~2.8 GB', speed: '~25+ tok/s', url: 'https://huggingface.co/bartowski/Phi-3.5-mini-instruct-GGUF/resolve/main/Phi-3.5-mini-instruct-Q5_K_M.gguf', note: 'Fastest overall' },
  { label: 'Llama 3.1 8B Q4_K_M', size: '~4.7 GB', speed: '~12-18 tok/s', url: 'https://huggingface.co/bartowski/Meta-Llama-3.1-8B-Instruct-GGUF/resolve/main/Meta-Llama-3.1-8B-Instruct-Q4_K_M.gguf', note: 'Best quality/speed balance' },
  { label: 'Qwen 2.5 7B Q4_K_M', size: '~4.4 GB', speed: '~13-18 tok/s', url: 'https://huggingface.co/bartowski/Qwen2.5-7B-Instruct-GGUF/resolve/main/Qwen2.5-7B-Instruct-Q4_K_M.gguf', note: 'Strong reasoning' },
];

function formatBytes(bytes: number): string {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  let i = 0;
  let n = bytes;
  while (n >= 1024 && i < units.length - 1) { n /= 1024; i++; }
  return `${n.toFixed(1)} ${units[i]}`;
}

export default function LocalModelsPage() {
  const { toast } = useToast();
  const [models, setModels] = useState<LocalModel[]>([]);
  const [status, setStatus] = useState<LocalLLMStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [nCtx, setNCtx] = useState(4096);
  const [nGpuLayers, setNGpuLayers] = useState(0);
  const [nThreads, setNThreads] = useState(0); // 0 = auto (physical cores)
  const [nBatch, setNBatch] = useState(512);
  const [flashAttn, setFlashAttn] = useState(false);
  const [useMmap, setUseMmap] = useState(true);
  const [useMlock, setUseMlock] = useState(false);
  const [sysInfo, setSysInfo] = useState<SystemInfo | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [wizardOpen, setWizardOpen] = useState(false);

  // Pull dialog state
  const [pullOpen, setPullOpen] = useState(false);
  const [pullUrl, setPullUrl] = useState('');
  const [pulling, setPulling] = useState(false);
  const [pullProgress, setPullProgress] = useState(0);
  const [pullTotal, setPullTotal] = useState(0);

  // Import (Ollama / LM Studio) dialog state
  const [importOpen, setImportOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [external, setExternal] = useState<ExternalModel[]>([]);
  const [searchedDirs, setSearchedDirs] = useState<string[]>([]);
  const [importMode, setImportMode] = useState<'symlink' | 'copy'>('symlink');

  const refresh = async () => {
    setLoading(true);
    setError('');
    try {
      const [s, m, sys] = await Promise.all([
        getLocalLLMStatus(),
        listLocalModels(),
        getSystemInfo().catch(() => null),
      ]);
      setStatus(s);
      setModels(m.models);
      setSysInfo(sys);
      if (s.n_ctx) setNCtx(s.n_ctx);
      if (typeof s.n_gpu_layers === 'number') setNGpuLayers(s.n_gpu_layers);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Cannot reach agent');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, []);

  const applyTuned = (p: TunedParams) => {
    setNThreads(p.n_threads);
    setNBatch(p.n_batch);
    setNCtx(p.n_ctx);
    setNGpuLayers(p.n_gpu_layers);
    setUseMmap(p.use_mmap);
    setUseMlock(p.use_mlock);
    setFlashAttn(p.flash_attn);
    setShowAdvanced(true);
  };

  const handleLoad = async (name: string) => {
    try {
      await loadLocalModel(name, nCtx, nGpuLayers, {
        n_threads: nThreads || undefined,
        n_batch: nBatch,
        flash_attn: flashAttn,
        use_mmap: useMmap,
        use_mlock: useMlock,
      });
      toast({ title: 'Model loaded', description: name });
      refresh();
    } catch (e) {
      toast({ title: 'Load failed', description: e instanceof Error ? e.message : 'Error', variant: 'destructive' });
    }
  };

  const handleUnload = async () => {
    await unloadLocalModel();
    toast({ title: 'Model unloaded' });
    refresh();
  };

  const handleDelete = async (name: string) => {
    if (!confirm(`Delete ${name}?`)) return;
    try {
      await deleteLocalModel(name);
      toast({ title: 'Deleted', description: name });
      refresh();
    } catch (e) {
      toast({ title: 'Delete failed', description: e instanceof Error ? e.message : 'Error', variant: 'destructive' });
    }
  };

  const handlePull = async (url?: string) => {
    const target = url || pullUrl.trim();
    if (!target) return;
    setPulling(true);
    setPullProgress(0);
    setPullTotal(0);
    try {
      for await (const p of pullLocalModel(target)) {
        if (p.status === 'downloading') {
          setPullProgress(p.completed || 0);
          setPullTotal(p.total || 0);
        } else if (p.status === 'done') {
          toast({ title: 'Download complete', description: p.filename });
        } else if (p.status === 'error') {
          throw new Error(p.error || 'Download failed');
        }
      }
      setPullOpen(false);
      setPullUrl('');
      refresh();
    } catch (e) {
      toast({ title: 'Download failed', description: e instanceof Error ? e.message : 'Error', variant: 'destructive' });
    } finally {
      setPulling(false);
    }
  };

  const pct = pullTotal > 0 ? Math.round((pullProgress / pullTotal) * 100) : 0;

  const openImport = async () => {
    setImportOpen(true);
    setScanning(true);
    try {
      const r = await scanExternalModels();
      setExternal(r.models);
      setSearchedDirs(r.searched_dirs);
    } catch (e) {
      toast({ title: 'Scan failed', description: e instanceof Error ? e.message : 'Error', variant: 'destructive' });
    } finally {
      setScanning(false);
    }
  };

  const handleImport = async (m: ExternalModel) => {
    setImporting(true);
    try {
      const result = await importExternalModel(m.path, m.name, importMode);
      toast({
        title: 'Imported',
        description: result.fallback_reason
          ? `${result.name} (copied — symlink unavailable)`
          : `${result.name} (${result.mode})`,
      });
      // Update inline so user sees it marked imported
      setExternal((prev) => prev.map((x) => (x.path === m.path ? { ...x, imported: true } : x)));
      refresh();
    } catch (e) {
      toast({ title: 'Import failed', description: e instanceof Error ? e.message : 'Error', variant: 'destructive' });
    } finally {
      setImporting(false);
    }
  };

  const ollamaCount = external.filter((m) => m.source === 'ollama').length;
  const lmstudioCount = external.filter((m) => m.source === 'lmstudio').length;

  return (
    <ScrollArea className="flex-1 min-h-0">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Cpu className="h-6 w-6 text-primary" /> Local Models
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Built-in llama.cpp runtime — no Ollama required.</p>
          </div>
          <Button variant="ghost" size="icon" onClick={refresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {error && (
          <Card className="border-destructive/50">
            <CardContent className="pt-6 flex gap-2 items-start">
              <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-destructive">Cannot reach the local agent.</p>
                <p className="text-muted-foreground mt-1">{error}</p>
                <p className="text-xs text-muted-foreground mt-2">Make sure <code>python public/agent.py</code> is running.</p>
              </div>
            </CardContent>
          </Card>
        )}

        {status && !status.available && (
          <Card className="border-primary/40">
            <CardContent className="pt-6 space-y-2">
              <p className="text-sm font-medium">⚠️ <code>llama-cpp-python</code> is not installed on the agent.</p>
              <p className="text-xs text-muted-foreground">Install it on your PC, then restart the agent:</p>
              <pre className="text-xs bg-secondary/50 rounded p-2 overflow-x-auto">pip install llama-cpp-python --prefer-binary</pre>
              <p className="text-xs text-muted-foreground">For NVIDIA GPU support:</p>
              <pre className="text-xs bg-secondary/50 rounded p-2 overflow-x-auto">CMAKE_ARGS="-DGGML_CUDA=on" pip install llama-cpp-python --no-cache-dir</pre>
            </CardContent>
          </Card>
        )}

        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" /> Recommended for your system
            </CardTitle>
            <CardDescription>
              {sysInfo?.cpu?.model
                ? `${sysInfo.cpu.model.replace(/\s+/g, ' ').trim()} · ${formatBytes(sysInfo.memory.total)} RAM`
                : 'CPU-friendly models that run well on Ryzen mobile + 32 GB RAM.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {RECOMMENDED.map((r) => (
              <div key={r.url} className="flex items-center justify-between gap-2 p-2.5 rounded-md border border-border/50 bg-background/40">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{r.label}</p>
                  <p className="text-[11px] text-muted-foreground">{r.size} · {r.speed} · {r.note}</p>
                </div>
                <Button size="sm" variant="outline" disabled={pulling} onClick={() => handlePull(r.url)}>
                  <Download className="h-3.5 w-3.5 mr-1" /> Get
                </Button>
              </div>
            ))}
            <p className="text-[10px] text-muted-foreground pt-1">
              Avoid 13B+ models and Q8/F16 quants on integrated graphics — RAM bandwidth is the bottleneck.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-base">Runtime settings</CardTitle>
              <CardDescription>Applied when loading a model.</CardDescription>
            </div>
            <Button size="sm" variant="outline" onClick={() => setWizardOpen(true)}>
              <Zap className="h-4 w-4 mr-1" /> Tune for my CPU
            </Button>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <Label>Context size</Label>
                <span className="text-muted-foreground">{nCtx.toLocaleString()} tokens</span>
              </div>
              <Slider min={2048} max={32768} step={1024} value={[nCtx]} onValueChange={(v) => setNCtx(v[0])} />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <Label>GPU layers</Label>
                <span className="text-muted-foreground">{nGpuLayers === -1 ? 'All' : nGpuLayers === 0 ? 'CPU only' : nGpuLayers}</span>
              </div>
              <Slider min={-1} max={80} step={1} value={[nGpuLayers]} onValueChange={(v) => setNGpuLayers(v[0])} />
              <p className="text-xs text-muted-foreground">−1 = offload all layers to GPU, 0 = pure CPU. AMD Vega iGPUs: keep at 0.</p>
            </div>

            <button
              onClick={() => setShowAdvanced((v) => !v)}
              className="text-xs text-primary hover:underline"
            >
              {showAdvanced ? '▾ Hide' : '▸ Show'} advanced CPU tuning
            </button>

            {showAdvanced && (
              <div className="space-y-5 pt-2 border-t border-border/40">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <Label>Threads</Label>
                    <span className="text-muted-foreground">
                      {nThreads === 0 ? `Auto (${sysInfo?.cpu?.physical_cores ?? '?'} cores)` : nThreads}
                    </span>
                  </div>
                  <Slider min={0} max={Math.max(16, sysInfo?.cpu?.logical_cores ?? 16)} step={1} value={[nThreads]} onValueChange={(v) => setNThreads(v[0])} />
                  <p className="text-xs text-muted-foreground">Use physical core count, not SMT/HT — extra threads usually slow llama.cpp down.</p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <Label>Batch size</Label>
                    <span className="text-muted-foreground">{nBatch}</span>
                  </div>
                  <Slider min={64} max={2048} step={64} value={[nBatch]} onValueChange={(v) => setNBatch(v[0])} />
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={flashAttn} onChange={(e) => setFlashAttn(e.target.checked)} />
                    Flash attention
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={useMmap} onChange={(e) => setUseMmap(e.target.checked)} />
                    use_mmap
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={useMlock} onChange={(e) => setUseMlock(e.target.checked)} />
                    use_mlock
                  </label>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-base">Installed models</CardTitle>
              <CardDescription>{status?.models_dir || '~/.pesto-ai/models/'}</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={openImport} disabled={!status?.available}>
                <FolderInput className="h-4 w-4 mr-1" /> Import
              </Button>
              <Dialog open={pullOpen} onOpenChange={setPullOpen}>
                <DialogTrigger asChild>
                  <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Add model</Button>
                </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Download a GGUF model</DialogTitle>
                  <DialogDescription>Paste a HuggingFace .gguf URL or pick a suggestion.</DialogDescription>
                </DialogHeader>
                <div className="space-y-3">
                  <Input
                    placeholder="https://huggingface.co/.../model.gguf"
                    value={pullUrl}
                    onChange={(e) => setPullUrl(e.target.value)}
                    disabled={pulling}
                  />
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Suggestions:</p>
                    {SUGGESTED.map((s) => (
                      <button
                        key={s.url}
                        disabled={pulling}
                        onClick={() => handlePull(s.url)}
                        className="w-full text-left text-xs px-3 py-2 rounded-md hover:bg-secondary/60 transition-colors flex items-center justify-between gap-2 disabled:opacity-50"
                      >
                        <span>{s.label}</span>
                        <Download className="h-3 w-3 text-muted-foreground" />
                      </button>
                    ))}
                  </div>
                  {pulling && (
                    <div className="space-y-1">
                      <Progress value={pct} />
                      <p className="text-xs text-muted-foreground text-center">
                        {formatBytes(pullProgress)}{pullTotal ? ` / ${formatBytes(pullTotal)}` : ''} ({pct}%)
                      </p>
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button variant="ghost" onClick={() => setPullOpen(false)} disabled={pulling}>Cancel</Button>
                  <Button onClick={() => handlePull()} disabled={pulling || !pullUrl.trim()}>
                    <Download className="h-4 w-4 mr-1" /> Download
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={importOpen} onOpenChange={setImportOpen}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Import from Ollama / LM Studio</DialogTitle>
                  <DialogDescription>
                    GGUFs found on your PC. Symlink keeps one copy on disk; copy duplicates the file.
                  </DialogDescription>
                </DialogHeader>

                <div className="flex items-center gap-3 text-xs">
                  <span className="text-muted-foreground">Mode:</span>
                  <button
                    onClick={() => setImportMode('symlink')}
                    className={`px-2.5 py-1 rounded-md border flex items-center gap-1.5 transition-colors ${importMode === 'symlink' ? 'bg-primary/15 border-primary/40 text-primary' : 'border-border/50 hover:bg-secondary/60'}`}
                  >
                    <Link2 className="h-3 w-3" /> Symlink (recommended)
                  </button>
                  <button
                    onClick={() => setImportMode('copy')}
                    className={`px-2.5 py-1 rounded-md border flex items-center gap-1.5 transition-colors ${importMode === 'copy' ? 'bg-primary/15 border-primary/40 text-primary' : 'border-border/50 hover:bg-secondary/60'}`}
                  >
                    <CopyIcon className="h-3 w-3" /> Copy
                  </button>
                  <Button variant="ghost" size="sm" className="ml-auto" onClick={openImport} disabled={scanning}>
                    <RefreshCw className={`h-3.5 w-3.5 mr-1 ${scanning ? 'animate-spin' : ''}`} /> Rescan
                  </Button>
                </div>

                <ScrollArea className="max-h-[420px] pr-2">
                  {scanning ? (
                    <p className="text-sm text-muted-foreground text-center py-8">Scanning…</p>
                  ) : external.length === 0 ? (
                    <div className="text-center py-8 space-y-2">
                      <p className="text-sm text-muted-foreground">No GGUF files found in Ollama or LM Studio folders.</p>
                      {searchedDirs.length > 0 && (
                        <details className="text-xs text-muted-foreground">
                          <summary className="cursor-pointer">Searched {searchedDirs.length} location(s)</summary>
                          <ul className="mt-1 text-left inline-block">
                            {searchedDirs.map((d) => <li key={d}><code>{d}</code></li>)}
                          </ul>
                        </details>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {ollamaCount > 0 && (
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">Ollama ({ollamaCount})</p>
                          <div className="space-y-1.5">
                            {external.filter((m) => m.source === 'ollama').map((m) => (
                              <ImportRow key={m.path} m={m} importing={importing} onImport={() => handleImport(m)} />
                            ))}
                          </div>
                        </div>
                      )}
                      {lmstudioCount > 0 && (
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">LM Studio ({lmstudioCount})</p>
                          <div className="space-y-1.5">
                            {external.filter((m) => m.source === 'lmstudio').map((m) => (
                              <ImportRow key={m.path} m={m} importing={importing} onImport={() => handleImport(m)} />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </ScrollArea>

                <DialogFooter>
                  <Button variant="ghost" onClick={() => setImportOpen(false)}>Close</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {models.length === 0 && !loading && (
              <p className="text-sm text-muted-foreground text-center py-6">No models yet. Click "Add model" to download one.</p>
            )}
            <div className="space-y-2">
              {models.map((m) => (
                <div key={m.name} className="flex items-center justify-between gap-2 p-3 rounded-lg border border-border/50 bg-secondary/20">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm truncate">{m.name}</span>
                      {m.loaded && (
                        <Badge variant="default" className="h-5 text-[10px] gap-1">
                          <CheckCircle2 className="h-2.5 w-2.5" /> loaded
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{formatBytes(m.size)}</p>
                  </div>
                  <div className="flex gap-1">
                    {m.loaded ? (
                      <Button size="sm" variant="outline" onClick={handleUnload}>Unload</Button>
                    ) : (
                      <Button size="sm" onClick={() => handleLoad(m.name)} disabled={!status?.available}>Load</Button>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(m.name)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      <TuneWizard open={wizardOpen} onOpenChange={setWizardOpen} onApplied={applyTuned} />
    </ScrollArea>
  );
}

function ImportRow({ m, importing, onImport }: { m: ExternalModel; importing: boolean; onImport: () => void }) {
  return (
    <div className="flex items-center justify-between gap-2 p-2.5 rounded-md border border-border/50 bg-secondary/20">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium truncate">{m.display}</p>
        <p className="text-[11px] text-muted-foreground truncate" title={m.path}>
          {formatBytes(m.size)} · <code className="text-[10px]">{m.path}</code>
        </p>
      </div>
      {m.imported ? (
        <Badge variant="secondary" className="h-6 text-[10px] gap-1">
          <CheckCircle2 className="h-2.5 w-2.5" /> Imported
        </Badge>
      ) : (
        <Button size="sm" variant="outline" disabled={importing} onClick={onImport}>
          <FolderInput className="h-3.5 w-3.5 mr-1" /> Import
        </Button>
      )}
    </div>
  );
}
