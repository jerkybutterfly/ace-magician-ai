import { useState, useMemo, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  Activity, Bug, Code2, Download, Loader2, PlayCircle, Shield, StopCircle, Trash2, Wand2,
} from 'lucide-react';
import {
  type Finding, type Severity, type TranscriptEntry, type TriageState,
  hunt, audit, runAgent, addFindings, loadFindings, updateFindingTriage, deleteFinding,
  clearFindings, exportFindingsMarkdown,
} from '@/lib/glasswing';

const SEVERITY_COLORS: Record<Severity, string> = {
  critical: 'bg-red-500/15 text-red-400 border-red-500/30',
  high: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  medium: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  low: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  info: 'bg-muted text-muted-foreground border-border',
};

const MODELS = [
  { v: 'google/gemini-3-flash-preview', l: 'Gemini 3 Flash (fast)' },
  { v: 'google/gemini-2.5-pro', l: 'Gemini 2.5 Pro (deep)' },
  { v: 'openai/gpt-5', l: 'GPT-5 (reasoning)' },
  { v: 'openai/gpt-5-mini', l: 'GPT-5 Mini' },
];

export default function GlasswingPage() {
  const { toast } = useToast();
  const [model, setModel] = useState(MODELS[0].v);

  // Hunter state
  const [target, setTarget] = useState('');
  const [recon, setRecon] = useState('');
  const [hunting, setHunting] = useState(false);

  // Auditor state
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('typescript');
  const [auditCtx, setAuditCtx] = useState('');
  const [auditing, setAuditing] = useState(false);

  // Agent state
  const [goal, setGoal] = useState('');
  const [maxSteps, setMaxSteps] = useState(8);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [running, setRunning] = useState(false);
  const stopRef = useRef(false);
  const [finalReport, setFinalReport] = useState('');

  // Findings
  const [findings, setFindings] = useState<Finding[]>(loadFindings);
  const [filter, setFilter] = useState<Severity | 'all'>('all');

  const counts = useMemo(() => {
    const c: Record<Severity | 'total', number> = {
      total: findings.length, critical: 0, high: 0, medium: 0, low: 0, info: 0,
    };
    for (const f of findings) c[f.severity]++;
    return c;
  }, [findings]);

  const visibleFindings = useMemo(
    () => findings.filter((f) => filter === 'all' || f.severity === filter),
    [findings, filter],
  );

  const handleHunt = async () => {
    if (!target.trim() || !recon.trim()) {
      toast({ title: 'Missing input', description: 'Provide a target and recon data.', variant: 'destructive' });
      return;
    }
    setHunting(true);
    try {
      const result = await hunt(target, recon, model);
      const updated = addFindings(result.findings, target, 'hunter');
      setFindings(updated);
      toast({ title: 'Hunt complete', description: `${result.findings.length} candidate findings. ${result.summary}` });
    } catch (e) {
      toast({ title: 'Hunt failed', description: e instanceof Error ? e.message : 'Unknown error', variant: 'destructive' });
    } finally {
      setHunting(false);
    }
  };

  const handleAudit = async () => {
    if (!code.trim()) {
      toast({ title: 'No code', description: 'Paste code to audit.', variant: 'destructive' });
      return;
    }
    setAuditing(true);
    try {
      const result = await audit(code, language, auditCtx, model);
      const updated = addFindings(result.findings, `audit:${language}`, 'auditor');
      setFindings(updated);
      toast({ title: 'Audit complete', description: `${result.findings.length} findings. ${result.summary}` });
    } catch (e) {
      toast({ title: 'Audit failed', description: e instanceof Error ? e.message : 'Unknown error', variant: 'destructive' });
    } finally {
      setAuditing(false);
    }
  };

  const handleRunAgent = async () => {
    if (!goal.trim()) {
      toast({ title: 'No goal', description: 'Describe what the agent should accomplish.', variant: 'destructive' });
      return;
    }
    setTranscript([]);
    setFinalReport('');
    setRunning(true);
    stopRef.current = false;
    try {
      const report = await runAgent({
        goal, maxSteps, model,
        onStep: (e) => setTranscript((prev) => [...prev, e]),
        shouldStop: () => stopRef.current,
      });
      setFinalReport(report);
      toast({ title: 'Agent finished', description: report ? 'Final report ready.' : 'Stopped or step limit reached.' });
    } catch (e) {
      toast({ title: 'Agent error', description: e instanceof Error ? e.message : 'Unknown', variant: 'destructive' });
    } finally {
      setRunning(false);
    }
  };

  const handleStopAgent = () => { stopRef.current = true; };

  const handleTriage = (id: string, t: TriageState) => setFindings(updateFindingTriage(id, t));
  const handleDelete = (id: string) => setFindings(deleteFinding(id));
  const handleClearAll = () => {
    if (!confirm('Delete all findings?')) return;
    clearFindings();
    setFindings([]);
  };
  const handleExport = () => {
    const md = exportFindingsMarkdown(findings);
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `glasswing-findings-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      <div className="border-b border-border/50 px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <div>
            <h1 className="text-lg font-bold">Glasswing</h1>
            <p className="text-xs text-muted-foreground">Mythos-style defensive AI · vuln hunting · code audit · autonomous agent</p>
          </div>
        </div>
        <Select value={model} onValueChange={setModel}>
          <SelectTrigger className="w-[220px] h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            {MODELS.map((m) => <SelectItem key={m.v} value={m.v}>{m.l}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="hunter" className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="mx-4 mt-3 w-fit">
          <TabsTrigger value="hunter"><Bug className="h-4 w-4 mr-1.5" />Hunter</TabsTrigger>
          <TabsTrigger value="auditor"><Code2 className="h-4 w-4 mr-1.5" />Auditor</TabsTrigger>
          <TabsTrigger value="agent"><Activity className="h-4 w-4 mr-1.5" />Agent</TabsTrigger>
          <TabsTrigger value="findings">
            <Wand2 className="h-4 w-4 mr-1.5" />Findings
            {counts.total > 0 && <Badge variant="secondary" className="ml-2 h-5">{counts.total}</Badge>}
          </TabsTrigger>
        </TabsList>

        {/* HUNTER */}
        <TabsContent value="hunter" className="flex-1 overflow-auto p-4 space-y-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">AI Vulnerability Hunter</CardTitle>
              <CardDescription>Paste recon output (nmap, httpx, headers, endpoint lists). Mythos analyzes for candidate zero-days.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input placeholder="Target (e.g. example.com, 10.0.0.5, repo path)" value={target} onChange={(e) => setTarget(e.target.value)} />
              <Textarea placeholder="Paste recon data: scan output, response headers, endpoint inventory, tech stack…" value={recon} onChange={(e) => setRecon(e.target.value)} className="min-h-[240px] font-mono text-xs" />
              <Button onClick={handleHunt} disabled={hunting} className="w-full">
                {hunting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Hunting…</> : <><PlayCircle className="h-4 w-4 mr-2" />Run Mythos Hunter</>}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AUDITOR */}
        <TabsContent value="auditor" className="flex-1 overflow-auto p-4 space-y-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Mythos Code Auditor</CardTitle>
              <CardDescription>Deep security review with line-level findings, exploit scenarios, and patch suggestions.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['typescript', 'javascript', 'python', 'go', 'rust', 'c', 'cpp', 'java', 'php', 'ruby', 'sql', 'auto'].map((l) =>
                      <SelectItem key={l} value={l}>{l}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Input placeholder="Context (optional): framework, threat model, file path…" value={auditCtx} onChange={(e) => setAuditCtx(e.target.value)} />
              </div>
              <Textarea placeholder="Paste source code…" value={code} onChange={(e) => setCode(e.target.value)} className="min-h-[300px] font-mono text-xs" />
              <Button onClick={handleAudit} disabled={auditing} className="w-full">
                {auditing ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Auditing…</> : <><PlayCircle className="h-4 w-4 mr-2" />Audit Code</>}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AGENT */}
        <TabsContent value="agent" className="flex-1 overflow-auto p-4 space-y-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Autonomous Mythos Agent</CardTitle>
              <CardDescription>Plans → acts → reflects. Uses web search, fetch, terminal (lab mode), and Drana scanners.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea placeholder="Goal — e.g. 'Investigate exposed services on example.com and identify risky endpoints'" value={goal} onChange={(e) => setGoal(e.target.value)} className="min-h-[100px]" />
              <div className="flex gap-2 items-center">
                <label className="text-xs text-muted-foreground">Max steps</label>
                <Input type="number" min={1} max={30} value={maxSteps} onChange={(e) => setMaxSteps(Number(e.target.value) || 8)} className="w-20 h-8" />
                {!running ? (
                  <Button onClick={handleRunAgent} className="ml-auto"><PlayCircle className="h-4 w-4 mr-2" />Start Agent</Button>
                ) : (
                  <Button onClick={handleStopAgent} variant="destructive" className="ml-auto"><StopCircle className="h-4 w-4 mr-2" />Stop</Button>
                )}
              </div>
            </CardContent>
          </Card>

          {(transcript.length > 0 || running) && (
            <Card>
              <CardHeader><CardTitle className="text-sm">Live transcript</CardTitle></CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] pr-3">
                  <div className="space-y-3">
                    {transcript.map((t) => (
                      <div key={t.step} className="border border-border/50 rounded-lg p-3 text-xs space-y-1.5 bg-muted/30">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">Step {t.step}</Badge>
                          <Badge variant="secondary" className="text-[10px]">{t.action}</Badge>
                        </div>
                        <div><span className="text-muted-foreground">Thought:</span> {t.thought}</div>
                        {t.action_input && <div className="font-mono text-[11px] text-primary truncate">→ {t.action_input}</div>}
                        <pre className="text-[11px] bg-background/60 p-2 rounded border border-border/40 whitespace-pre-wrap max-h-[200px] overflow-auto">{t.observation}</pre>
                      </div>
                    ))}
                    {running && <div className="flex items-center gap-2 text-xs text-muted-foreground"><Loader2 className="h-3 w-3 animate-spin" />Thinking…</div>}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {finalReport && (
            <Card>
              <CardHeader><CardTitle className="text-sm">Final report</CardTitle></CardHeader>
              <CardContent><pre className="text-xs whitespace-pre-wrap">{finalReport}</pre></CardContent>
            </Card>
          )}
        </TabsContent>

        {/* FINDINGS */}
        <TabsContent value="findings" className="flex-1 overflow-auto p-4 space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
            {(['all', 'critical', 'high', 'medium', 'low', 'info'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`p-2 rounded-lg border text-xs transition-colors ${filter === s ? 'bg-primary/10 border-primary text-primary' : 'border-border/50 hover:bg-muted'}`}
              >
                <div className="font-semibold uppercase">{s}</div>
                <div className="text-lg font-bold">{s === 'all' ? counts.total : counts[s]}</div>
              </button>
            ))}
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={handleExport} disabled={!findings.length}>
              <Download className="h-3.5 w-3.5 mr-1.5" />Export Markdown
            </Button>
            <Button variant="outline" size="sm" onClick={handleClearAll} disabled={!findings.length}>
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />Clear all
            </Button>
          </div>

          <div className="space-y-2">
            {visibleFindings.length === 0 && (
              <div className="text-center text-sm text-muted-foreground py-12">No findings yet. Run the Hunter, Auditor, or Agent.</div>
            )}
            {visibleFindings.map((f) => (
              <Card key={f.id} className={f.triage === 'fixed' || f.triage === 'ignored' ? 'opacity-60' : ''}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={SEVERITY_COLORS[f.severity]} variant="outline">{f.severity}</Badge>
                        {f.cwe && <Badge variant="outline" className="text-[10px]">{f.cwe}</Badge>}
                        <Badge variant="secondary" className="text-[10px]">conf: {f.confidence}</Badge>
                        <Badge variant="outline" className="text-[10px]">{f.source}</Badge>
                        <Badge variant="outline" className="text-[10px]">{f.triage}</Badge>
                      </div>
                      <CardTitle className="text-sm mt-1.5">{f.title}</CardTitle>
                      <CardDescription className="text-[11px] truncate">
                        {f.target}{f.location ? ` · ${f.location}` : ''}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="text-xs space-y-2 pt-0">
                  <p>{f.description}</p>
                  {f.exploit_scenario && <div><span className="text-muted-foreground font-semibold">Exploit:</span> {f.exploit_scenario}</div>}
                  {f.impact && <div><span className="text-muted-foreground font-semibold">Impact:</span> {f.impact}</div>}
                  <div className="bg-muted/40 p-2 rounded border border-border/40">
                    <div className="text-[10px] uppercase text-muted-foreground font-semibold mb-1">Patch suggestion</div>
                    <pre className="whitespace-pre-wrap font-mono text-[11px]">{f.patch_suggestion}</pre>
                  </div>
                  <div className="flex gap-1.5 flex-wrap pt-1">
                    {(['new', 'confirmed', 'fixed', 'ignored'] as TriageState[]).map((t) => (
                      <Button key={t} size="sm" variant={f.triage === t ? 'default' : 'outline'} className="h-6 text-[10px]" onClick={() => handleTriage(f.id, t)}>{t}</Button>
                    ))}
                    <Button size="sm" variant="ghost" className="h-6 text-[10px] text-destructive ml-auto" onClick={() => handleDelete(f.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
