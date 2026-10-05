import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { useConversations } from '@/hooks/useConversations';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Scale, Plus, Trash2, RefreshCw } from 'lucide-react';
import { clm, CLM_PORT, CLM_EMB_MODEL, type ClmAnswer, type ClmOs, type ClmBackend } from '@/lib/clm';

type QType = 'noul' | 'choice' | 'score';
interface Q { id: string; type: QType; instructions: string; options: string }

const DEFAULT_QS: Q[] = [
  { id: 'urgency', type: 'noul', instructions: 'Is this urgent?', options: '' },
  { id: 'department', type: 'choice', instructions: 'Which team should handle this?', options: 'billing: Charges, invoices, refunds\ntechnical: Bugs and outages' },
  { id: 'frustration', type: 'score', instructions: 'How frustrated is the customer?', options: 'Calm\nFrustrated\nVery angry' },
];

function toWire(q: Q) {
  const lines = q.options.split('\n').map((l) => l.trim()).filter(Boolean);
  if (q.type === 'noul') return { type: 'noul', instructions: q.instructions };
  if (q.type === 'score') return { type: 'score', instructions: q.instructions, criteria: lines };
  const criteria: Record<string, string> = {};
  lines.forEach((l) => { const [k, ...rest] = l.split(':'); criteria[k.trim()] = rest.join(':').trim() || k.trim(); });
  return { type: 'choice', instructions: q.instructions, criteria };
}

const Bar = ({ label, p }: { label: string; p: number }) => (
  <div className="text-xs">
    <div className="flex justify-between"><span>{label}</span><span className="text-muted-foreground">{(p * 100).toFixed(1)}%</span></div>
    <div className="h-1.5 bg-secondary rounded"><div className="h-1.5 bg-primary rounded" style={{ width: `${p * 100}%` }} /></div>
  </div>
);

export default function ClmPage() {
  const navigate = useNavigate();
  const { conversations, currentConvoId, createConversation, selectConversation, deleteConversation } = useConversations();
  const [os, setOs] = useState<ClmOs>(() => (localStorage.getItem('clm.os') as ClmOs) || 'windows');
  const [backend, setBackend] = useState<ClmBackend>(() => (localStorage.getItem('clm.backend') as ClmBackend) || 'ollama');
  const [busy, setBusy] = useState<string | null>(null);
  const [out, setOut] = useState('');
  const [health, setHealth] = useState<Awaited<ReturnType<typeof clm.health>>>(null);
  const [state, setState] = useState('Customer: my invoice was charged twice and nobody answers the phone!');
  const [qs, setQs] = useState<Q[]>(DEFAULT_QS);
  const [answers, setAnswers] = useState<Record<string, ClmAnswer> | null>(null);
  const [ctx, setCtx] = useState('');
  const [question, setQuestion] = useState('What causes tides on Earth?');
  const [cands, setCands] = useState("The Moon's gravitational pull.\nPhotosynthesis in plants.\nBecause the Earth is round.");
  const [ranked, setRanked] = useState<{ rank: number; candidate: string; prob: number }[]>([]);

  const check = async () => setHealth(await clm.health());
  useEffect(() => { check(); const id = setInterval(check, 8000); return () => clearInterval(id); }, []);
  useEffect(() => { localStorage.setItem('clm.os', os); }, [os]);
  useEffect(() => { localStorage.setItem('clm.backend', backend); }, [backend]);

  const run = async (label: string, fn: () => Promise<{ stdout: string; stderr: string }>) => {
    setBusy(label);
    try { const r = await fn(); setOut(`${r.stdout}\n${r.stderr}`.trim()); toast.success(`${label} done`); check(); }
    catch (e) { toast.error(`${label} failed: ${(e as Error).message}`); }
    finally { setBusy(null); }
  };

  const ask = async () => {
    setBusy('Ask');
    try {
      const wire = Object.fromEntries(qs.filter((q) => q.id && q.instructions).map((q) => [q.id, toWire(q)]));
      setAnswers((await clm.ask(state, wire)).answers);
    } catch (e) { toast.error((e as Error).message); } finally { setBusy(null); }
  };
  const rank = async () => {
    setBusy('Rank');
    try { setRanked(await clm.rank(ctx, question, cands.split('\n').map((s) => s.trim()).filter(Boolean))); }
    catch (e) { toast.error((e as Error).message); } finally { setBusy(null); }
  };
  const upd = (i: number, p: Partial<Q>) => setQs((a) => a.map((q, j) => (j === i ? { ...q, ...p } : q)));

  return (
    <div className="flex min-h-screen w-full">
      <AppSidebar conversations={conversations} currentConvoId={currentConvoId}
        onNewChat={() => { createConversation(); navigate('/chat'); }}
        onSelectConvo={(id) => { selectConversation(id); navigate('/chat'); }}
        onDeleteConvo={deleteConversation} />
      <SidebarInset>
        <header className="h-12 border-b border-border/50 flex items-center px-4 gap-3">
          <SidebarTrigger />
          <Scale className="h-4 w-4 text-primary" />
          <h1 className="text-sm font-semibold tracking-tight">CLM — Fast Decisions</h1>
          <Badge variant={health?.ok ? 'default' : 'outline'} className="text-[10px]">
            {health?.ok ? (health.embedder ? 'READY' : 'ENCODER LOADING') : 'OFFLINE'}
          </Badge>
          <Button size="sm" variant="outline" className="ml-auto" onClick={check}><RefreshCw className="h-3 w-3" /></Button>
        </header>

        <main className="p-4 space-y-4 max-w-5xl mx-auto w-full">
          <Card className="p-4 space-y-3">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Setup</div>
            <p className="text-sm text-muted-foreground">
              CLM answers yes/no, pick-one and 1-to-N questions about any text in milliseconds — handy as a quick
              judge for your agents. Needs an NVIDIA graphics card with about 18 GB of memory. On Windows it runs inside
              WSL (Linux on Windows). First start downloads ~16 GB.
            </p>
            <div className="flex flex-wrap gap-2 items-center">
              <select className="h-8 rounded-md border border-input bg-background px-2 text-sm" value={os} onChange={(e) => setOs(e.target.value as ClmOs)}>
                <option value="windows">Windows (WSL)</option>
                <option value="linux">Linux</option>
              </select>
              {os === 'windows' && <Button size="sm" variant="outline" disabled={!!busy} onClick={() => run('Install WSL', clm.installWsl)}>0. Install WSL</Button>}
              <Button size="sm" variant="outline" disabled={!!busy} onClick={() => run('Check tools', () => clm.checkTools(os))}>Check tools</Button>
              <Button size="sm" disabled={!!busy} onClick={() => run('Install', () => clm.install(os))}>1. Install</Button>
              <Button size="sm" disabled={!!busy} onClick={() => run('Start', () => clm.start(os))}>2. Start</Button>
              <Button size="sm" variant="outline" disabled={!!busy} onClick={() => run('Stop', () => clm.stop(os))}>Stop</Button>
              <Button size="sm" variant="outline" disabled={!!busy} onClick={() => run('Logs', () => clm.logs(os))}>Logs</Button>
              <a className="text-xs text-primary underline" href={clm.url()} target="_blank" rel="noreferrer">Playground :{CLM_PORT}</a>
            </div>
            {busy && <div className="text-xs text-muted-foreground">{busy}…</div>}
            {out && <pre className="text-[11px] bg-secondary/40 p-2 rounded max-h-60 overflow-auto whitespace-pre-wrap">{out}</pre>}
          </Card>

          <Tabs defaultValue="ask">
            <TabsList><TabsTrigger value="ask">Ask questions</TabsTrigger><TabsTrigger value="rank">Rank answers</TabsTrigger></TabsList>

            <TabsContent value="ask">
              <Card className="p-4 space-y-3">
                <Textarea rows={3} value={state} onChange={(e) => setState(e.target.value)} placeholder="Text to judge" />
                {qs.map((q, i) => (
                  <div key={i} className="border border-border/50 rounded p-2 space-y-2">
                    <div className="flex gap-2">
                      <Input className="w-32" value={q.id} onChange={(e) => upd(i, { id: e.target.value })} placeholder="name" />
                      <select className="h-9 rounded-md border border-input bg-background px-2 text-sm" value={q.type} onChange={(e) => upd(i, { type: e.target.value as QType })}>
                        <option value="noul">Yes / no</option><option value="choice">Pick one</option><option value="score">Scale</option>
                      </select>
                      <Input value={q.instructions} onChange={(e) => upd(i, { instructions: e.target.value })} placeholder="Question" />
                      <Button size="icon" variant="ghost" onClick={() => setQs((a) => a.filter((_, j) => j !== i))}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                    {q.type !== 'noul' && (
                      <Textarea rows={2} value={q.options} onChange={(e) => upd(i, { options: e.target.value })}
                        placeholder={q.type === 'choice' ? 'one per line — key: description' : 'levels, lowest first, one per line'} />
                    )}
                    {answers?.[q.id] && (
                      <div className="space-y-1">
                        {answers[q.id].type === 'noul'
                          ? <Bar label="Yes" p={answers[q.id].noul ?? 0} />
                          : Object.entries(answers[q.id].probabilities ?? {}).map(([k, p]) => <Bar key={k} label={k} p={p} />)}
                      </div>
                    )}
                  </div>
                ))}
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setQs((a) => [...a, { id: `q${a.length + 1}`, type: 'noul', instructions: '', options: '' }])}><Plus className="h-3 w-3 mr-1" />Question</Button>
                  <Button size="sm" disabled={!!busy || !health?.ok} onClick={ask}>Ask CLM</Button>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="rank">
              <Card className="p-4 space-y-3">
                <Textarea rows={2} value={ctx} onChange={(e) => setCtx(e.target.value)} placeholder="Context (optional)" />
                <Input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Question" />
                <Textarea rows={4} value={cands} onChange={(e) => setCands(e.target.value)} placeholder="Candidate answers, one per line" />
                <Button size="sm" disabled={!!busy || !health?.ok} onClick={rank}>Rank</Button>
                {ranked.map((r) => <Bar key={r.rank} label={`#${r.rank} ${r.candidate}`} p={r.prob} />)}
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </SidebarInset>
    </div>
  );
}
