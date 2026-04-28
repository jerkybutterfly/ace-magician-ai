import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Sun, Play, RefreshCw, Trash2 } from 'lucide-react';
import {
  getBriefingSettings, saveBriefingSettings, getBriefingHistory,
  generateBriefing, type BriefingSettings,
} from '@/lib/briefing';
import { fetchModels, type OllamaModel } from '@/lib/ollama';

export default function BriefingPage() {
  const [cfg, setCfg] = useState<BriefingSettings>(getBriefingSettings);
  const [history, setHistory] = useState(getBriefingHistory);
  const [models, setModels] = useState<OllamaModel[]>([]);
  const [running, setRunning] = useState(false);

  useEffect(() => { fetchModels().then(setModels).catch(() => {}); }, []);

  const update = <K extends keyof BriefingSettings>(k: K, v: BriefingSettings[K]) => {
    const next = { ...cfg, [k]: v };
    setCfg(next); saveBriefingSettings(next);
  };
  const updateSection = (k: keyof BriefingSettings['sections'], v: boolean | string) => {
    const next = { ...cfg, sections: { ...cfg.sections, [k]: v } };
    setCfg(next); saveBriefingSettings(next);
  };
  const updateDelivery = (k: keyof BriefingSettings['delivery'], v: boolean) => {
    const next = { ...cfg, delivery: { ...cfg.delivery, [k]: v } };
    setCfg(next); saveBriefingSettings(next);
  };

  const runNow = async () => {
    setRunning(true);
    try {
      await generateBriefing();
      setHistory(getBriefingHistory());
      toast({ title: 'Briefing delivered ☀️' });
    } catch (e) {
      toast({ title: 'Briefing failed', description: e instanceof Error ? e.message : 'error' });
    } finally { setRunning(false); }
  };

  const clearHistory = () => {
    localStorage.removeItem('daily-briefing-history');
    setHistory([]);
  };

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-4 overflow-y-auto h-full pb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sun className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-semibold">Daily Briefing</h1>
        </div>
        <Button onClick={runNow} disabled={running}>
          {running ? <RefreshCw className="h-4 w-4 mr-1 animate-spin" /> : <Play className="h-4 w-4 mr-1" />}
          Brief me now
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Schedule</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="enabled">Enabled</Label>
            <Switch id="enabled" checked={cfg.enabled} onCheckedChange={(v) => update('enabled', v)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Hour (0-23)</Label>
              <Input type="number" min={0} max={23} value={cfg.hour}
                onChange={(e) => update('hour', Math.max(0, Math.min(23, parseInt(e.target.value) || 0)))} />
            </div>
            <div>
              <Label className="text-xs">Minute</Label>
              <Input type="number" min={0} max={59} value={cfg.minute}
                onChange={(e) => update('minute', Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))} />
            </div>
          </div>
          <div>
            <Label className="text-xs">City (for weather)</Label>
            <Input value={cfg.city} onChange={(e) => update('city', e.target.value)} placeholder="Dublin" />
          </div>
          <div>
            <Label className="text-xs">Summarizer model (Ollama)</Label>
            <Select value={cfg.model} onValueChange={(v) => update('model', v)}>
              <SelectTrigger><SelectValue placeholder="Use default model" /></SelectTrigger>
              <SelectContent>
                {models.map((m) => <SelectItem key={m.name} value={m.name}>{m.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Sections</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {(['weather', 'mqtt', 'phone', 'system'] as const).map((s) => (
            <div key={s} className="flex items-center justify-between">
              <Label htmlFor={s} className="capitalize">{s}</Label>
              <Switch id={s} checked={cfg.sections[s]} onCheckedChange={(v) => updateSection(s, v)} />
            </div>
          ))}
          <div>
            <Label className="text-xs">Extra instructions</Label>
            <Textarea rows={2} placeholder="e.g. mention my upcoming gym session"
              value={cfg.sections.custom}
              onChange={(e) => updateSection('custom', e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Delivery</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>PC notification</Label>
            <Switch checked={cfg.delivery.pcNotify} onCheckedChange={(v) => updateDelivery('pcNotify', v)} />
          </div>
          <div className="flex items-center justify-between">
            <Label>Phone notification</Label>
            <Switch checked={cfg.delivery.phoneNotify} onCheckedChange={(v) => updateDelivery('phoneNotify', v)} />
          </div>
          <div className="flex items-center justify-between">
            <Label>Speak it aloud</Label>
            <Switch checked={cfg.delivery.speak} onCheckedChange={(v) => updateDelivery('speak', v)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-base">Recent briefings</CardTitle>
          {history.length > 0 && (
            <Button variant="ghost" size="icon" onClick={clearHistory}>
              <Trash2 className="h-4 w-4 text-muted-foreground" />
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-3">
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No briefings yet. Hit "Brief me now".</p>
          ) : history.map((h) => (
            <div key={h.ts} className="border border-border/40 rounded-lg p-3 space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{new Date(h.ts).toLocaleString()}</Badge>
              </div>
              <p className="text-sm whitespace-pre-wrap">{h.text}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
