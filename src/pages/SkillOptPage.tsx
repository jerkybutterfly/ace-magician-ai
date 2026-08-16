import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import {
  skilloptInstall, skilloptStatus, skilloptListSkills, skilloptReadSkill, skilloptWriteSkill,
  skilloptDeleteSkill, skilloptListBenchmarks, skilloptTrain, skilloptRuns, skilloptStop,
  skilloptSleepStart, skilloptSleepStop, skilloptPromoteBest,
  type SkillFile, type TrainRun, type TrainConfig,
} from '@/lib/skillopt';
import { SendToChatButton } from '@/components/SendToChatButton';
import { getSettings } from '@/lib/settings';

export default function SkillOptPage() {
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<{ installed: boolean; version?: string; sleep?: boolean }>({ installed: false });
  const [skills, setSkills] = useState<SkillFile[]>([]);
  const [benchmarks, setBenchmarks] = useState<string[]>([]);
  const [runs, setRuns] = useState<TrainRun[]>([]);
  const [selected, setSelected] = useState<string>('');
  const [content, setContent] = useState<string>('');

  const [cfg, setCfg] = useState<TrainConfig>({
    skill: '',
    benchmark: 'searchqa',
    backend: 'openai_compatible',
    target_model: getSettings().defaultModel || 'llama3.1:8b',
    optimizer_model: 'qwen2.5:32b',
    epochs: 3,
    batch_size: 4,
    learning_rate: 'medium',
    validation_gate: true,
  });

  const wrap = async (label: string, fn: () => Promise<unknown>) => {
    setBusy(true);
    try { await fn(); toast.success(`${label} ok`); }
    catch (e) { toast.error(`${label}: ${(e as Error).message}`); }
    finally { setBusy(false); }
  };

  const refresh = async () => {
    try {
      const [s, sk, bm, rs] = await Promise.all([
        skilloptStatus(), skilloptListSkills(), skilloptListBenchmarks(), skilloptRuns(),
      ]);
      setStatus(s); setSkills(sk); setBenchmarks(bm); setRuns(rs);
    } catch { /* offline */ }
  };

  useEffect(() => { refresh(); const t = setInterval(refresh, 5000); return () => clearInterval(t); }, []);

  const openSkill = async (name: string) => {
    setSelected(name);
    try { const r = await skilloptReadSkill(name); setContent(r.content); }
    catch (e) { toast.error((e as Error).message); }
  };

  return (
    <div className="p-4 space-y-4 overflow-y-auto">
      <div>
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          SkillOpt
          {status.installed ? <Badge variant="outline">v{status.version ?? 'ok'}</Badge> : <Badge variant="destructive">not installed</Badge>}
        </h1>
        <p className="text-sm text-muted-foreground">
          Microsoft SkillOpt — train agent skill markdown files with epochs, batch size, and validation gates. No model weights change; the deployed artifact is a compact <code>best_skill.md</code>.
        </p>
      </div>

      <Card>
        <CardHeader><CardTitle>Runtime</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button disabled={busy} onClick={() => wrap('Install', skilloptInstall)}>Install / upgrade</Button>
          <Button variant="outline" disabled={busy} onClick={refresh}>Refresh</Button>
          <div className="flex items-center gap-2 ml-auto">
            <Label htmlFor="sleep">SkillOpt-Sleep (nightly)</Label>
            <Switch
              id="sleep"
              checked={!!status.sleep}
              onCheckedChange={(v) => wrap(v ? 'Sleep start' : 'Sleep stop', () => v ? skilloptSleepStart() : skilloptSleepStop())}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle>Train a skill</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Seed skill</Label>
                <Select value={cfg.skill} onValueChange={(v) => setCfg({ ...cfg, skill: v })}>
                  <SelectTrigger><SelectValue placeholder="new / pick" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">new (empty)</SelectItem>
                    {skills.map((s) => <SelectItem key={s.name} value={s.name}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Benchmark</Label>
                <Select value={cfg.benchmark} onValueChange={(v) => setCfg({ ...cfg, benchmark: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(benchmarks.length ? benchmarks : ['searchqa', 'gsm8k', 'humaneval', 'mbpp', 'aime', 'browsecomp']).map((b) => (
                      <SelectItem key={b} value={b}>{b}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Backend</Label>
                <Select value={cfg.backend} onValueChange={(v) => setCfg({ ...cfg, backend: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="openai_compatible">openai_compatible (Ollama / llama.cpp)</SelectItem>
                    <SelectItem value="claude_code_exec">claude_code_exec</SelectItem>
                    <SelectItem value="codex_exec">codex_exec</SelectItem>
                    <SelectItem value="cursor_exec">cursor_exec</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Learning rate</Label>
                <Select value={cfg.learning_rate} onValueChange={(v: 'low'|'medium'|'high') => setCfg({ ...cfg, learning_rate: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">low</SelectItem>
                    <SelectItem value="medium">medium</SelectItem>
                    <SelectItem value="high">high</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Target model</Label>
                <Input value={cfg.target_model} onChange={(e) => setCfg({ ...cfg, target_model: e.target.value })} />
              </div>
              <div>
                <Label>Optimizer model</Label>
                <Input value={cfg.optimizer_model} onChange={(e) => setCfg({ ...cfg, optimizer_model: e.target.value })} />
              </div>
              <div>
                <Label>Epochs</Label>
                <Input type="number" min={1} value={cfg.epochs} onChange={(e) => setCfg({ ...cfg, epochs: +e.target.value })} />
              </div>
              <div>
                <Label>Batch size</Label>
                <Input type="number" min={1} value={cfg.batch_size} onChange={(e) => setCfg({ ...cfg, batch_size: +e.target.value })} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="gate" checked={cfg.validation_gate} onCheckedChange={(v) => setCfg({ ...cfg, validation_gate: v })} />
              <Label htmlFor="gate">Held-out validation gate (paper default)</Label>
            </div>
            <Button className="w-full" disabled={busy || !cfg.skill} onClick={() => wrap('Train', async () => {
              const run = await skilloptTrain(cfg);
              toast.success(`Started run ${run.id}`);
              await refresh();
            })}>Start training</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Skills ({skills.length})</CardTitle>
            <Button size="sm" variant="ghost" onClick={refresh}>Refresh</Button>
          </CardHeader>
          <CardContent className="space-y-1 max-h-72 overflow-auto">
            {skills.map((s) => (
              <div key={s.name} className="flex items-center justify-between text-xs bg-muted p-2 rounded">
                <button className="text-left flex-1 truncate" onClick={() => openSkill(s.name)}>
                  <span className="font-mono">{s.name}</span>
                  <span className="text-muted-foreground ml-2">{s.tokens ?? '?'} tok</span>
                </button>
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" onClick={() => wrap('Promote', () => skilloptPromoteBest(s.name))}>Promote</Button>
                  <Button size="sm" variant="destructive" onClick={() => wrap('Delete', async () => { await skilloptDeleteSkill(s.name); await refresh(); })}>×</Button>
                </div>
              </div>
            ))}
            {skills.length === 0 && <p className="text-xs text-muted-foreground">No skills yet. Train one, or drop a markdown file in the agent's <code>skills/</code> dir.</p>}
          </CardContent>
        </Card>
      </div>

      {selected && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-mono text-base">{selected}</CardTitle>
            <div className="flex gap-2">
              <SendToChatButton text={`Use this skill:\n\n${content}`} label="Send to chat" />
              <Button size="sm" disabled={busy} onClick={() => wrap('Save', () => skilloptWriteSkill(selected, content))}>Save</Button>
            </div>
          </CardHeader>
          <CardContent>
            <Textarea rows={16} value={content} onChange={(e) => setContent(e.target.value)} className="font-mono text-xs" />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>Training runs</CardTitle></CardHeader>
        <CardContent className="space-y-2 max-h-96 overflow-auto">
          {runs.length === 0 && <p className="text-xs text-muted-foreground">No runs yet.</p>}
          {runs.map((r) => (
            <div key={r.id} className="border rounded p-2 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono">{r.id}</span>
                <div className="flex gap-2 items-center">
                  <Badge variant={r.status === 'running' ? 'default' : r.status === 'error' ? 'destructive' : 'outline'}>{r.status}</Badge>
                  <span className="text-muted-foreground">epoch {r.epoch}/{r.epochs}</span>
                  {r.best_score !== undefined && <span className="text-primary">best {r.best_score.toFixed(3)}</span>}
                  {r.status === 'running' && <Button size="sm" variant="destructive" onClick={() => wrap('Stop', () => skilloptStop(r.id))}>Stop</Button>}
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                {r.skill} · {r.benchmark} · {r.backend} · lr={r.learning_rate} · bs={r.batch_size}
              </div>
              {r.log_tail && r.log_tail.length > 0 && (
                <pre className="text-[10px] bg-muted p-2 rounded overflow-x-auto max-h-32">{r.log_tail.join('\n')}</pre>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
