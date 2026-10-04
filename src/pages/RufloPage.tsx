import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { useConversations } from '@/hooks/useConversations';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Waves, Loader2, Play, Square, ExternalLink } from 'lucide-react';
import { ruflo, runLocalSwarm, pickLocalModel, RUFLO_MCP_PORT, type SwarmEvent } from '@/lib/ruflo';

export default function RufloPage() {
  const navigate = useNavigate();
  const { conversations, currentConvoId, createConversation, selectConversation, deleteConversation } = useConversations();
  const [busy, setBusy] = useState<string | null>(null);
  const [log, setLog] = useState('');
  const [objective, setObjective] = useState('');
  const [model, setModel] = useState('');
  const [maxAgents, setMaxAgents] = useState(4);
  const [useMemory, setUseMemory] = useState(true);
  const [memQuery, setMemQuery] = useState('');
  const [events, setEvents] = useState<SwarmEvent[]>([]);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => { pickLocalModel().then(setModel).catch(() => {}); }, []);

  const run = async (label: string, fn: () => Promise<{ ok: boolean; out: string }>) => {
    setBusy(label);
    try {
      const r = await fn();
      setLog(`$ ${label}\n${r.out || '(no output)'}`);
      if (!r.ok) toast.error(`${label} failed`);
    } catch (e) {
      setLog(`$ ${label}\nCan't reach your mini PC (${(e as Error).message}). Check the helper address in Settings.`);
      toast.error("Can't reach your mini PC");
    } finally { setBusy(null); }
  };

  const startSwarm = async () => {
    if (!objective.trim() || !model) return;
    setEvents([]);
    abortRef.current = new AbortController();
    setBusy('swarm');
    try {
      await runLocalSwarm(objective, { model, maxAgents, useMemory }, (e) => setEvents((p) => [...p, e]), abortRef.current.signal);
    } catch (e) {
      setEvents((p) => [...p, { kind: 'error', text: (e as Error).message }]);
    } finally { setBusy(null); }
  };

  const B = ({ id, label, fn, variant = 'outline' as const }: { id: string; label: string; fn: () => Promise<{ ok: boolean; out: string }>; variant?: 'outline' | 'default' }) => (
    <Button size="sm" variant={variant} disabled={!!busy} onClick={() => run(id, fn)}>
      {busy === id && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}{label}
    </Button>
  );

  return (
    <div className="flex min-h-screen w-full">
      <AppSidebar
        conversations={conversations}
        currentConvoId={currentConvoId}
        onNewChat={() => { createConversation(); navigate('/chat'); }}
        onSelectConvo={(id) => { selectConversation(id); navigate('/chat'); }}
        onDeleteConvo={deleteConversation}
      />
      <SidebarInset>
        <header className="h-12 border-b border-border/50 flex items-center px-4 gap-3">
          <SidebarTrigger />
          <Waves className="h-4 w-4 text-primary" />
          <h1 className="text-sm font-semibold tracking-tight">Ruflo — Agent Swarms</h1>
          <Badge variant="outline" className="text-[10px]">LOCAL MODEL</Badge>
          <Button size="sm" variant="outline" className="ml-auto" asChild>
            <a href="https://github.com/ruvnet/ruflo" target="_blank" rel="noreferrer"><ExternalLink className="h-3 w-3 mr-1" />GitHub</a>
          </Button>
        </header>

        <main className="p-4 space-y-4 max-w-5xl mx-auto w-full">
          <Card className="p-4 space-y-3">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Run a swarm with your own AI</div>
            <p className="text-sm text-muted-foreground">
              A planner splits your goal into jobs, then helper agents (researcher, coder, tester…) do each one in turn.
              Every agent is your own local model — no Claude Code or Codex. Results are saved to ruflo's memory so later swarms remember them.
            </p>
            <Textarea rows={3} placeholder="e.g. Plan and write a Python script that backs up my Documents folder every night" value={objective} onChange={(e) => setObjective(e.target.value)} />
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <label className="flex items-center gap-2">Model <Input className="h-8 w-48" value={model} onChange={(e) => setModel(e.target.value)} /></label>
              <label className="flex items-center gap-2">Agents <Input type="number" min={1} max={8} className="h-8 w-16" value={maxAgents} onChange={(e) => setMaxAgents(Math.max(1, Math.min(8, +e.target.value || 1)))} /></label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={useMemory} onChange={(e) => setUseMemory(e.target.checked)} />Use ruflo memory</label>
              {busy === 'swarm' ? (
                <Button size="sm" variant="destructive" onClick={() => abortRef.current?.abort()}><Square className="h-3 w-3 mr-1" />Stop</Button>
              ) : (
                <Button size="sm" disabled={!!busy || !objective.trim() || !model} onClick={startSwarm}><Play className="h-3 w-3 mr-1" />Start swarm</Button>
              )}
            </div>
            {events.length > 0 && (
              <div className="space-y-2">
                {events.map((e, i) => (
                  <div key={i} className={`rounded border p-3 text-sm whitespace-pre-wrap ${e.kind === 'done' ? 'border-primary' : e.kind === 'error' ? 'border-destructive' : 'border-border/50'}`}>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                      {e.kind === 'agent' ? `agent · ${e.role}` : e.kind === 'done' ? 'final answer' : e.kind}
                    </div>
                    {e.text}
                  </div>
                ))}
                {busy === 'swarm' && <div className="text-xs text-muted-foreground flex items-center gap-2"><Loader2 className="h-3 w-3 animate-spin" />Agents working…</div>}
              </div>
            )}
          </Card>

          <Card className="p-4 space-y-3">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Step 1 — Setup on your mini PC</div>
            <p className="text-sm text-muted-foreground">Ruflo needs Node.js 20 or newer. Your helper program must be running.</p>
            <div className="flex flex-wrap gap-2">
              <B id="Check tools" label="Check tools" fn={ruflo.checkTools} />
              <B id="Install Node.js" label="Install Node.js" fn={ruflo.installNode} />
              <B id="Install ruflo" label="Install ruflo" fn={ruflo.install} variant="default" />
              <B id="Init" label="Set up workspace" fn={ruflo.init} />
              <B id="Doctor" label="Health check" fn={ruflo.doctor} />
            </div>
          </Card>

          <Card className="p-4 space-y-3">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Step 2 — Give your chat ruflo's tools</div>
            <p className="text-sm text-muted-foreground">Starts ruflo's tool server (port {RUFLO_MCP_PORT}) and adds it to your app's tool list, so your normal chat can use ruflo's memory and swarm tools.</p>
            <div className="flex flex-wrap gap-2">
              <B id="Start tools" label="Start tool server" fn={async () => { const r = await ruflo.startMcp(); ruflo.registerMcp(); toast.success('Ruflo added to your tools'); return r; }} variant="default" />
              <B id="Stop tools" label="Stop" fn={ruflo.stopMcp} />
              <B id="Tool log" label="Log" fn={ruflo.mcpLog} />
            </div>
          </Card>

          <Card className="p-4 space-y-3">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Status &amp; memory</div>
            <div className="flex flex-wrap gap-2">
              <B id="Swarm init" label="New swarm (hierarchical)" fn={() => ruflo.swarmInit('hierarchical')} />
              <B id="Swarm status" label="Swarm status" fn={ruflo.swarmStatus} />
              <B id="Agents" label="Agents" fn={ruflo.agentList} />
              <B id="Hive" label="Hive-mind" fn={ruflo.hiveStatus} />
              <B id="Memory" label="All memory" fn={() => ruflo.memoryList()} />
            </div>
            <div className="flex gap-2">
              <Input className="h-8" placeholder="Search memory…" value={memQuery} onChange={(e) => setMemQuery(e.target.value)} />
              <B id="Search memory" label="Search" fn={() => ruflo.memorySearch(memQuery)} />
            </div>
            {log && <pre className="text-xs bg-muted/40 rounded p-3 max-h-80 overflow-auto whitespace-pre-wrap">{log}</pre>}
          </Card>
        </main>
      </SidebarInset>
    </div>
  );
}
