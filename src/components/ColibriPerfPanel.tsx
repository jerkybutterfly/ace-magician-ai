import { useState } from 'react';
import { getSettings, updateSettings, DEFAULT_COLIBRI_PERF, type ColibriPerf } from '@/lib/settings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Zap, RotateCcw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const AM06_PRESET: ColibriPerf = {
  ctx: 8192,
  pipe: true,
  pilot: true,
  draft: 4,
  direct: true,
  repin: 2048,
  modelMirror: '',
  mmap: true,
  mlock: true,
  flashAttn: true,
  threads: 8,
  batch: 512,
  kvQuant: 'q8_0',
};

export function ColibriPerfPanel() {
  const [perf, setPerf] = useState<ColibriPerf>(() => getSettings().colibriPerf);

  const patch = (p: Partial<ColibriPerf>) => {
    const next = { ...perf, ...p };
    setPerf(next);
    updateSettings({ colibriPerf: next });
  };

  const applyPreset = (preset: ColibriPerf, label: string) => {
    setPerf(preset);
    updateSettings({ colibriPerf: preset });
    toast({ title: `Loaded ${label} preset`, description: 'Restart colibrì for changes to take effect.' });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Zap className="h-4 w-4" /> colibrì Performance Tuning
        </CardTitle>
        <CardDescription>
          Env vars passed to <code className="bg-muted px-1 rounded">coli serve</code> on the next start.
          These make Laguna XS 2.1 and other big GGUFs run faster on the AM06 Pro.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={() => applyPreset(AM06_PRESET, 'AM06 Pro')}>
            <Zap className="h-3.5 w-3.5 mr-1" /> AM06 Pro preset
          </Button>
          <Button size="sm" variant="ghost" onClick={() => applyPreset(DEFAULT_COLIBRI_PERF, 'default')}>
            <RotateCcw className="h-3.5 w-3.5 mr-1" /> Reset defaults
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Context (CTX)</Label>
            <Input type="number" min={512} step={512} value={perf.ctx} onChange={(e) => patch({ ctx: Number(e.target.value) || 0 })} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">CPU threads (0 = auto)</Label>
            <Input type="number" min={0} value={perf.threads} onChange={(e) => patch({ threads: Number(e.target.value) || 0 })} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Batch size</Label>
            <Input type="number" min={64} step={64} value={perf.batch} onChange={(e) => patch({ batch: Number(e.target.value) || 0 })} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Speculative draft (DRAFT)</Label>
            <Input type="number" min={0} max={8} value={perf.draft} onChange={(e) => patch({ draft: Number(e.target.value) || 0 })} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Hot-expert repin (REPIN)</Label>
            <Input type="number" min={0} step={256} value={perf.repin} onChange={(e) => patch({ repin: Number(e.target.value) || 0 })} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">KV cache quant</Label>
            <Select value={perf.kvQuant} onValueChange={(v) => patch({ kvQuant: v as ColibriPerf['kvQuant'] })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="off">off (f16)</SelectItem>
                <SelectItem value="q8_0">q8_0 (½ VRAM)</SelectItem>
                <SelectItem value="q4_0">q4_0 (¼ VRAM)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Mirror model path (dual-SSD)</Label>
          <Input value={perf.modelMirror} onChange={(e) => patch({ modelMirror: e.target.value })} placeholder="E:\glm52_i4_mirror" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {[
            ['pipe', 'PIPE (async disk overlap)'],
            ['pilot', 'PILOT (router prefetch)'],
            ['direct', 'DIRECT (unbuffered I/O)'],
            ['mmap', 'mmap'],
            ['mlock', 'mlock (pin RAM)'],
            ['flashAttn', 'Flash-Attn'],
          ].map(([k, label]) => (
            <div key={k} className="flex items-center justify-between rounded-md border px-2 py-1.5">
              <Label className="text-xs font-normal">{label}</Label>
              <Switch
                checked={perf[k as keyof ColibriPerf] as boolean}
                onCheckedChange={(v) => patch({ [k]: !!v } as Partial<ColibriPerf>)}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
