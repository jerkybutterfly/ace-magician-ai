import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Plus, Trash2, RotateCcw, Save, ShieldCheck, ShieldAlert, ShieldX } from 'lucide-react';
import {
  getPermissions,
  savePermissions,
  resetPermissions,
  type PermissionConfig,
  type PermissionMode,
  type PermissionRule,
} from '@/lib/permissions';

const MODE_META: Record<PermissionMode, { label: string; icon: typeof ShieldCheck; className: string }> = {
  allow: { label: 'Allow', icon: ShieldCheck, className: 'text-primary' },
  ask: { label: 'Ask', icon: ShieldAlert, className: 'text-foreground' },
  deny: { label: 'Deny', icon: ShieldX, className: 'text-destructive' },
};

export default function PermissionsPage() {
  const [config, setConfig] = useState<PermissionConfig>(getPermissions);
  const [newPattern, setNewPattern] = useState('');
  const [newMode, setNewMode] = useState<PermissionMode>('allow');
  const [newNote, setNewNote] = useState('');

  useEffect(() => {
    setConfig(getPermissions());
  }, []);

  const persist = (next: PermissionConfig) => {
    setConfig(next);
    savePermissions(next);
  };

  const updateToolDefault = (tool: string, mode: PermissionMode) => {
    persist({ ...config, toolDefaults: { ...config.toolDefaults, [tool]: mode } });
  };

  const addRule = () => {
    if (!newPattern.trim()) return;
    const rule: PermissionRule = { pattern: newPattern.trim(), mode: newMode, note: newNote.trim() || undefined };
    persist({ ...config, rules: [rule, ...config.rules] });
    setNewPattern('');
    setNewNote('');
    toast({ title: 'Rule added', description: rule.pattern });
  };

  const removeRule = (idx: number) => {
    persist({ ...config, rules: config.rules.filter((_, i) => i !== idx) });
  };

  const updateRule = (idx: number, patch: Partial<PermissionRule>) => {
    persist({ ...config, rules: config.rules.map((r, i) => (i === idx ? { ...r, ...patch } : r)) });
  };

  const handleReset = () => {
    const fresh = resetPermissions();
    setConfig(fresh);
    toast({ title: 'Permissions reset', description: 'Restored to defaults.' });
  };

  const toolEntries = Object.entries(config.toolDefaults).sort(([a], [b]) => a.localeCompare(b));

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-xl font-semibold">Permissions</h1>
        <Button variant="outline" size="sm" onClick={handleReset}>
          <RotateCcw className="h-3.5 w-3.5 mr-1.5" /> Reset to defaults
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">How it works</CardTitle>
          <CardDescription>
            The agent never refuses requests. Instead, every tool it tries to run is checked against your rules below.
            <ul className="mt-2 space-y-1 text-xs">
              <li>• <span className="text-primary font-medium">Allow</span> — runs immediately, no prompt</li>
              <li>• <span className="font-medium">Ask</span> — you see an inline Approve / Deny in chat</li>
              <li>• <span className="text-destructive font-medium">Deny</span> — blocked, agent gets an error and tries something else</li>
            </ul>
            Pattern rules are checked first (top to bottom), then per-tool defaults, then a global fallback of <span className="font-medium">{config.fallback}</span>.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pattern rules</CardTitle>
          <CardDescription>
            Match specific tags. Use <code>*</code> as a wildcard. Example: <code>[RUN_CMD:dir*]</code> allows any <code>dir</code> command.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2 p-3 rounded-lg bg-secondary/40 border border-border/50">
            <Input
              value={newPattern}
              onChange={(e) => setNewPattern(e.target.value)}
              placeholder="[RUN_CMD:git*]"
              className="font-mono text-xs"
            />
            <Select value={newMode} onValueChange={(v) => setNewMode(v as PermissionMode)}>
              <SelectTrigger className="w-full sm:w-[120px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                {(['allow', 'ask', 'deny'] as PermissionMode[]).map((m) => (
                  <SelectItem key={m} value={m}>{MODE_META[m].label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="optional note"
              className="text-xs"
            />
            <Button size="sm" onClick={addRule} className="shrink-0">
              <Plus className="h-3.5 w-3.5 mr-1" /> Add
            </Button>
          </div>

          <div className="space-y-1.5">
            {config.rules.length === 0 && (
              <div className="text-xs text-muted-foreground italic px-2">No custom rules. Tool defaults below will apply.</div>
            )}
            {config.rules.map((rule, idx) => {
              const Meta = MODE_META[rule.mode];
              const Icon = Meta.icon;
              return (
                <div key={idx} className="flex items-center gap-2 p-2 rounded-lg border border-border/40 bg-background hover:bg-secondary/30 transition-colors">
                  <Icon className={`h-4 w-4 shrink-0 ${Meta.className}`} />
                  <code className="text-xs font-mono flex-1 truncate" title={rule.pattern}>{rule.pattern}</code>
                  <Select value={rule.mode} onValueChange={(v) => updateRule(idx, { mode: v as PermissionMode })}>
                    <SelectTrigger className="h-7 w-[90px] text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {(['allow', 'ask', 'deny'] as PermissionMode[]).map((m) => (
                        <SelectItem key={m} value={m}>{MODE_META[m].label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {rule.note && <span className="text-[10px] text-muted-foreground hidden md:inline truncate max-w-[160px]" title={rule.note}>{rule.note}</span>}
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeRule(idx)}>
                    <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tool defaults</CardTitle>
          <CardDescription>
            Default behavior for each tool when no pattern rule matches.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {toolEntries.map(([tool, mode]) => {
              const Meta = MODE_META[mode];
              const Icon = Meta.icon;
              return (
                <div key={tool} className="flex items-center gap-2 p-2 rounded-lg border border-border/40 bg-background">
                  <Icon className={`h-3.5 w-3.5 shrink-0 ${Meta.className}`} />
                  <code className="text-xs font-mono flex-1 truncate">{tool}</code>
                  <Select value={mode} onValueChange={(v) => updateToolDefault(tool, v as PermissionMode)}>
                    <SelectTrigger className="h-7 w-[90px] text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {(['allow', 'ask', 'deny'] as PermissionMode[]).map((m) => (
                        <SelectItem key={m} value={m}>{MODE_META[m].label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Global fallback</CardTitle>
          <CardDescription>What happens for tools/patterns with no specific rule.</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={config.fallback} onValueChange={(v) => persist({ ...config, fallback: v as PermissionMode })}>
            <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {(['allow', 'ask', 'deny'] as PermissionMode[]).map((m) => (
                <SelectItem key={m} value={m}>{MODE_META[m].label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
    </div>
  );
}
