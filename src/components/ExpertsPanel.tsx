import { useState } from 'react';
import { getSettings, updateSettings, type Expert, type ExpertRole, type ExpertProvider } from '@/lib/settings';
import { newExpertId } from '@/lib/experts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Plus, Brain } from 'lucide-react';

const ROLES: ExpertRole[] = ['heavy', 'code', 'vision', 'fast', 'long-context'];
const PROVIDERS: ExpertProvider[] = ['ollama', 'colibri', 'llamacpp', 'lmstudio', 'opencode'];

const PRESETS: Expert[] = [
  { id: '', name: 'colibrì heavy', provider: 'colibri', model: 'glm-5.2-colibri', role: 'heavy', ramGb: 24, alwaysOn: false, priority: 90 },
  { id: '', name: 'Laguna XS (fast)', provider: 'ollama', model: 'laguna-xs:2.1', role: 'fast', ramGb: 4, alwaysOn: true, priority: 60 },
  { id: '', name: 'DeepSeek coder', provider: 'ollama', model: 'deepseek-coder-v2:16b', role: 'code', ramGb: 12, alwaysOn: false, priority: 70 },
  { id: '', name: 'Qwen VL vision', provider: 'ollama', model: 'qwen2.5vl:7b', role: 'vision', ramGb: 8, alwaysOn: false, priority: 70 },
];

export function ExpertsPanel() {
  const [experts, setExperts] = useState<Expert[]>(() => getSettings().experts);

  const commit = (next: Expert[]) => {
    setExperts(next);
    updateSettings({ experts: next });
  };

  const add = (base?: Partial<Expert>) => {
    const e: Expert = {
      id: newExpertId(),
      name: base?.name ?? 'New expert',
      provider: base?.provider ?? 'ollama',
      model: base?.model ?? '',
      role: base?.role ?? 'heavy',
      ramGb: base?.ramGb ?? 8,
      alwaysOn: base?.alwaysOn ?? false,
      priority: base?.priority ?? 50,
    };
    commit([...experts, e]);
  };

  const patch = (id: string, p: Partial<Expert>) => {
    commit(experts.map((e) => (e.id === id ? { ...e, ...p } : e)));
  };

  const remove = (id: string) => commit(experts.filter((e) => e.id !== id));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Brain className="h-4 w-4" /> Expert Router (MoE)
        </CardTitle>
        <CardDescription>
          Register several local models as “experts.” The <strong>Router</strong> provider in Chat picks the best one
          per prompt (heavy / code / vision / fast / long-context). Prefix a message with <code className="bg-muted px-1 rounded">@code</code>,
          <code className="bg-muted px-1 rounded"> @fast</code>, <code className="bg-muted px-1 rounded">@vision</code>,
          <code className="bg-muted px-1 rounded"> @long</code> or <code className="bg-muted px-1 rounded">@heavy</code> to force one.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {experts.length === 0 && (
          <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
            No experts yet. Add one below or pick a preset.
          </div>
        )}

        {experts.map((e) => (
          <div key={e.id} className="rounded-lg border p-3 space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Name</Label>
                <Input value={e.name} onChange={(ev) => patch(e.id, { name: ev.target.value })} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Provider</Label>
                <Select value={e.provider} onValueChange={(v) => patch(e.id, { provider: v as ExpertProvider })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PROVIDERS.map((p) => (<SelectItem key={p} value={p}>{p}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Model id</Label>
                <Input value={e.model} onChange={(ev) => patch(e.id, { model: ev.target.value })} placeholder="e.g. laguna-xs:2.1" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Role</Label>
                <Select value={e.role} onValueChange={(v) => patch(e.id, { role: v as ExpertRole })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ROLES.map((r) => (<SelectItem key={r} value={r}>{r}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 items-end">
              <div className="space-y-1">
                <Label className="text-xs">RAM (GB)</Label>
                <Input type="number" min={1} max={512} value={e.ramGb} onChange={(ev) => patch(e.id, { ramGb: Number(ev.target.value) || 0 })} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Priority</Label>
                <Input type="number" min={0} max={100} value={e.priority} onChange={(ev) => patch(e.id, { priority: Number(ev.target.value) || 0 })} />
              </div>
              <div className="flex items-center justify-between rounded-md border px-2 py-1.5">
                <Label className="text-xs font-normal">Always on (fallback)</Label>
                <Switch checked={e.alwaysOn} onCheckedChange={(v) => patch(e.id, { alwaysOn: !!v })} />
              </div>
              <Button variant="ghost" size="sm" onClick={() => remove(e.id)} className="text-destructive justify-self-end">
                <Trash2 className="h-3.5 w-3.5 mr-1" /> Remove
              </Button>
            </div>
          </div>
        ))}

        <div className="flex flex-wrap gap-2 pt-2">
          <Button size="sm" onClick={() => add()}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Add expert
          </Button>
          {PRESETS.map((p) => (
            <Button key={p.name} size="sm" variant="outline" onClick={() => add(p)}>
              + {p.name}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
