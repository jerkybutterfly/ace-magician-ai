import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Cpu, MemoryStick, CheckCircle2, AlertTriangle, Loader2, Zap, RotateCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getSystemInfo, type SystemInfo } from '@/lib/agent';
import { listLocalModels, loadLocalModel, unloadLocalModel, getLocalLLMStatus, type LoadOptions } from '@/lib/local-llm';

export interface TunedParams {
  n_ctx: number;
  n_gpu_layers: number;
  n_threads: number;
  n_batch: number;
  flash_attn: boolean;
  use_mmap: boolean;
  use_mlock: boolean;
}

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onApplied?: (p: TunedParams) => void;
}

type Step = 'detect' | 'review' | 'restart' | 'done';

function computeTuning(sys: SystemInfo | null): TunedParams {
  const physical = sys?.cpu?.physical_cores || 8;
  const totalGb = sys ? sys.memory.total / 1024 ** 3 : 16;
  // Conservative ctx: bigger RAM → bigger ctx, but cap at 8192 for CPU-only
  const ctx = totalGb >= 24 ? 8192 : totalGb >= 12 ? 4096 : 2048;
  return {
    n_ctx: ctx,
    n_gpu_layers: 0, // Vega 8 / iGPU on Windows: stay CPU
    n_threads: physical,
    n_batch: 512,
    flash_attn: true,
    use_mmap: true,
    use_mlock: false,
  };
}

export function TuneWizard({ open, onOpenChange, onApplied }: Props) {
  const { toast } = useToast();
  const [step, setStep] = useState<Step>('detect');
  const [sys, setSys] = useState<SystemInfo | null>(null);
  const [loadedModel, setLoadedModel] = useState<string | null>(null);
  const [params, setParams] = useState<TunedParams | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!open) return;
    setStep('detect');
    setErr('');
    (async () => {
      setBusy(true);
      try {
        const [s, st] = await Promise.all([
          getSystemInfo().catch(() => null),
          getLocalLLMStatus().catch(() => null),
        ]);
        setSys(s);
        setLoadedModel(st?.loaded ?? null);
        setParams(computeTuning(s));
        setStep('review');
      } catch (e) {
        setErr(e instanceof Error ? e.message : 'Detection failed');
      } finally {
        setBusy(false);
      }
    })();
  }, [open]);

  const apply = async () => {
    if (!params) return;
    setBusy(true);
    setErr('');
    try {
      onApplied?.(params);
      // Safe restart only if a model is currently loaded
      if (loadedModel) {
        setStep('restart');
        const opts: LoadOptions = {
          n_threads: params.n_threads,
          n_batch: params.n_batch,
          flash_attn: params.flash_attn,
          use_mmap: params.use_mmap,
          use_mlock: params.use_mlock,
        };
        try {
          await unloadLocalModel();
        } catch {
          /* unload may fail if nothing loaded — ignore */
        }
        await loadLocalModel(loadedModel, params.n_ctx, params.n_gpu_layers, opts);
        toast({ title: 'Model reloaded with tuned settings', description: loadedModel });
      } else {
        toast({ title: 'Tuning applied', description: 'Settings will be used next time you load a model.' });
      }
      setStep('done');
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Restart failed');
      // Try to restore previous model load if possible
      if (loadedModel) {
        try {
          await loadLocalModel(loadedModel, 4096, 0);
        } catch {
          /* swallow */
        }
      }
    } finally {
      setBusy(false);
    }
  };

  const close = () => {
    if (busy) return;
    onOpenChange(false);
  };

  const ramGb = sys ? (sys.memory.total / 1024 ** 3).toFixed(1) : '?';
  const singleChannel = sys?.ram?.channels === 1;

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" /> Tune for my CPU
          </DialogTitle>
          <DialogDescription>
            Auto-detects your hardware and applies the best llama.cpp runtime parameters, then safely restarts the loaded model.
          </DialogDescription>
        </DialogHeader>

        {err && (
          <div className="text-xs text-destructive bg-destructive/10 border border-destructive/30 rounded p-2 flex gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{err}</span>
          </div>
        )}

        {step === 'detect' && (
          <div className="py-8 flex flex-col items-center gap-3 text-sm text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            Detecting hardware…
          </div>
        )}

        {step === 'review' && params && (
          <div className="space-y-4">
            <div className="rounded-md border border-border/60 p-3 space-y-2 bg-secondary/30">
              <div className="flex items-center gap-2 text-sm">
                <Cpu className="h-4 w-4 text-primary" />
                <span className="font-medium truncate">{sys?.cpu?.model || 'Unknown CPU'}</span>
              </div>
              <div className="flex flex-wrap gap-1 text-[10px]">
                {sys?.cpu?.physical_cores && (
                  <Badge variant="secondary">{sys.cpu.physical_cores}c / {sys.cpu.logical_cores}t</Badge>
                )}
                {sys?.cpu?.has_avx2 && <Badge variant="secondary" className="bg-primary/15 text-primary">AVX2</Badge>}
                {sys?.cpu?.has_avx512 && <Badge variant="secondary" className="bg-primary/15 text-primary">AVX512</Badge>}
                {sys?.cpu?.has_fma && <Badge variant="secondary" className="bg-primary/15 text-primary">FMA</Badge>}
              </div>
              <div className="flex items-center gap-2 text-sm pt-1">
                <MemoryStick className="h-4 w-4 text-primary" />
                <span>{ramGb} GB RAM</span>
                {sys?.ram?.channels === 2 && (
                  <Badge variant="secondary" className="bg-primary/15 text-primary">Dual-channel</Badge>
                )}
                {singleChannel && (
                  <Badge variant="destructive" className="text-[10px]">Single-channel</Badge>
                )}
              </div>
              {singleChannel && (
                <p className="text-[11px] text-destructive flex items-start gap-1 pt-1">
                  <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0" />
                  Add a 2nd SO-DIMM for ~80% faster inference. Tuning alone can't fix bandwidth.
                </p>
              )}
            </div>

            <div className="space-y-1.5 text-xs">
              <p className="font-medium text-sm mb-2">Recommended settings</p>
              <ParamRow label="Threads" value={`${params.n_threads} (physical cores)`} />
              <ParamRow label="Batch size" value={String(params.n_batch)} />
              <ParamRow label="Context window" value={`${params.n_ctx.toLocaleString()} tokens`} />
              <ParamRow label="GPU layers" value="0 (CPU only — Vega iGPU not supported)" />
              <ParamRow label="Flash attention" value="On" />
              <ParamRow label="Memory map (mmap)" value="On" />
              <ParamRow label="Lock in RAM (mlock)" value="Off" />
            </div>

            {loadedModel && (
              <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                <RotateCw className="h-3 w-3" />
                <span>Will reload <span className="font-mono text-foreground">{loadedModel}</span> with new settings.</span>
              </div>
            )}
          </div>
        )}

        {step === 'restart' && (
          <div className="py-6 flex flex-col items-center gap-3 text-sm">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="text-muted-foreground">Restarting model with tuned parameters…</span>
            <Progress value={66} className="h-1.5 w-full" />
          </div>
        )}

        {step === 'done' && (
          <div className="py-6 flex flex-col items-center gap-2 text-center">
            <CheckCircle2 className="h-8 w-8 text-primary" />
            <p className="text-sm font-medium">All tuned up</p>
            <p className="text-xs text-muted-foreground">
              {loadedModel ? `${loadedModel} reloaded with optimized settings.` : 'Settings saved — load a model to use them.'}
            </p>
          </div>
        )}

        <DialogFooter>
          {step === 'review' && (
            <>
              <Button variant="ghost" onClick={close} disabled={busy}>Cancel</Button>
              <Button onClick={apply} disabled={busy || !params}>
                <Zap className="h-4 w-4 mr-1" />
                {loadedModel ? 'Apply & restart model' : 'Apply settings'}
              </Button>
            </>
          )}
          {step === 'done' && <Button onClick={close}>Done</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ParamRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2 py-1 border-b border-border/30 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono text-foreground">{value}</span>
    </div>
  );
}
