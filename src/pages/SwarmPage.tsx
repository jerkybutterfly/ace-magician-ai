import { useState, useEffect, useRef } from 'react';
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useConversations } from '@/hooks/useConversations';
import {
  Network, Play, RefreshCw, ChevronDown, ChevronRight,
  CheckCircle, XCircle, Loader, Clock, Sparkles, Users, Cpu, ListTree
} from 'lucide-react';

const AGENT_URL = 'http://localhost:8484';

interface Worker {
  id: string;
  task: string;
  status: 'pending' | 'running' | 'done' | 'error';
  result: string | null;
  started_at: string | null;
  finished_at: string | null;
}

interface Swarm {
  id: string;
  goal: string;
  model: string;
  worker_model: string;
  max_workers: number;
  status: 'starting' | 'planning' | 'working' | 'synthesising' | 'done' | 'error';
  plan: string[];
  workers: Worker[];
  final_answer: string | null;
  error: string | null;
  created_at: string;
  updated_at: string;
  finished_at: string | null;
}

const STATUS_META: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  starting:     { label: 'Starting',     color: 'bg-slate-500/20 text-slate-300 border-slate-500/30',   icon: Clock },
  planning:     { label: 'Planning',     color: 'bg-blue-500/20 text-blue-300 border-blue-500/30',      icon: ListTree },
  working:      { label: 'Working',      color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30', icon: Cpu },
  synthesising: { label: 'Synthesising', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30', icon: Sparkles },
  done:         { label: 'Done',         color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', icon: CheckCircle },
  error:        { label: 'Error',        color: 'bg-red-500/20 text-red-300 border-red-500/30',          icon: XCircle },
};

const WORKER_ICONS: Record<string, React.ElementType> = {
  pending: Clock,
  running: Loader,
  done:    CheckCircle,
  error:   XCircle,
};

const WORKER_COLORS: Record<string, string> = {
  pending: 'text-slate-400',
  running: 'text-yellow-400',
  done:    'text-emerald-400',
  error:   'text-red-400',
};

function WorkerCard({ worker, index }: { worker: Worker; index: number }) {
  const [open, setOpen] = useState(false);
  const Icon = WORKER_ICONS[worker.status] ?? Clock;
  const color = WORKER_COLORS[worker.status] ?? 'text-slate-400';
  const duration = worker.started_at && worker.finished_at
    ? ((new Date(worker.finished_at).getTime() - new Date(worker.started_at).getTime()) / 1000).toFixed(1) + 's'
    : null;

  return (
    <div className="rounded-xl border border-border/40 bg-card/50 overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-start gap-3 p-3 hover:bg-secondary/30 transition-colors text-left"
      >
        <Icon className={`h-4 w-4 mt-0.5 flex-shrink-0 ${color} ${worker.status === 'running' ? 'animate-spin' : ''}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-muted-foreground">Worker {index + 1}</span>
            {duration && <span className="text-[10px] text-muted-foreground/60">{duration}</span>}
          </div>
          <p className="text-sm text-foreground/90 truncate">{worker.task}</p>
        </div>
        {open ? <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" /> : <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
      </button>
      {open && worker.result && (
        <div className="px-4 pb-4 border-t border-border/30">
          <pre className="mt-3 text-xs text-foreground/80 whitespace-pre-wrap leading-relaxed font-sans">{worker.result}</pre>
        </div>
      )}
    </div>
  );
}

function SwarmCard({ swarm }: { swarm: Swarm }) {
  const [open, setOpen] = useState(false);
  const meta = STATUS_META[swarm.status] ?? STATUS_META.starting;
  const StatusIcon = meta.icon;
  const doneCount = swarm.workers.filter(w => w.status === 'done').length;
  const totalWorkers = swarm.workers.length;

  return (
    <div className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur overflow-hidden shadow-lg">
      {/* Header */}
      <div className="p-4 flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary/10 ring-1 ring-primary/20 flex items-center justify-center flex-shrink-0">
          <Network className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className={`text-[10px] border ${meta.color} flex items-center gap-1`}>
              <StatusIcon className={`h-3 w-3 ${swarm.status === 'working' || swarm.status === 'synthesising' ? 'animate-pulse' : ''}`} />
              {meta.label}
            </Badge>
            <span className="text-[10px] text-muted-foreground font-mono">{swarm.id.slice(0, 8)}</span>
            {totalWorkers > 0 && (
              <span className="text-[10px] text-muted-foreground">{doneCount}/{totalWorkers} workers done</span>
            )}
          </div>
          <p className="mt-1 text-sm font-medium text-foreground leading-snug">{swarm.goal}</p>
          <p className="text-[10px] text-muted-foreground mt-1">
            Model: <span className="text-foreground/70">{swarm.model}</span>
            {swarm.worker_model !== swarm.model && <> · Workers: <span className="text-foreground/70">{swarm.worker_model}</span></>}
          </p>
        </div>
        <button onClick={() => setOpen(o => !o)} className="text-muted-foreground hover:text-foreground transition-colors">
          {open ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
        </button>
      </div>

      {/* Progress bar */}
      {totalWorkers > 0 && (
        <div className="px-4 pb-2">
          <div className="h-1 rounded-full bg-border/50 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-purple-500 transition-all duration-700"
              style={{ width: `${swarm.status === 'done' ? 100 : totalWorkers > 0 ? (doneCount / totalWorkers) * 90 : 0}%` }}
            />
          </div>
        </div>
      )}

      {/* Expanded content */}
      {open && (
        <div className="border-t border-border/30 p-4 space-y-4">
          {/* Workers */}
          {swarm.workers.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Workers</span>
              </div>
              <div className="space-y-2">
                {swarm.workers.map((w, i) => <WorkerCard key={w.id} worker={w} index={i} />)}
              </div>
            </div>
          )}

          {/* Final answer */}
          {swarm.final_answer && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-medium text-primary uppercase tracking-wider">Synthesised Answer</span>
              </div>
              <div className="rounded-xl bg-primary/5 border border-primary/20 p-4">
                <pre className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed font-sans">{swarm.final_answer}</pre>
              </div>
            </div>
          )}

          {/* Error */}
          {swarm.error && (
            <div className="rounded-xl bg-red-500/5 border border-red-500/20 p-4">
              <p className="text-sm text-red-400">{swarm.error}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function SwarmPage() {
  const { conversations, currentConvoId, createConversation, selectConversation, deleteConversation } = useConversations();

  const [goal, setGoal] = useState('');
  const [model, setModel] = useState('gemma3:4b');
  const [workerModel, setWorkerModel] = useState('');
  const [maxWorkers, setMaxWorkers] = useState(4);
  const [swarms, setSwarms] = useState<Swarm[]>([]);
  const [activeSwarmId, setActiveSwarmId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchSwarms = async () => {
    try {
      const res = await fetch(`${AGENT_URL}/swarm/list`);
      if (res.ok) {
        const data: Swarm[] = await res.json();
        setSwarms(data.slice().reverse());
      }
    } catch { /* agent offline */ }
  };

  useEffect(() => {
    fetchSwarms();
    pollRef.current = setInterval(fetchSwarms, 2000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  const handleLaunch = async () => {
    if (!goal.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${AGENT_URL}/swarm/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goal: goal.trim(),
          model,
          worker_model: workerModel.trim() || null,
          max_workers: maxWorkers,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to launch swarm');
      setActiveSwarmId(data.swarm_id);
      setGoal('');
      fetchSwarms();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const activeCount = swarms.filter(s => s.status !== 'done' && s.status !== 'error').length;

  return (
    <div className="flex-1 flex flex-col min-w-0">
      {/* Header */}
      <div className="border-b border-border/50 bg-background/95 backdrop-blur sticky top-0 z-10">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-7 h-7 rounded-lg bg-primary/10 ring-1 ring-primary/20 flex items-center justify-center">
            <Network className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-foreground">Agent Swarm</h1>
            <p className="text-[10px] text-muted-foreground">Multi-agent orchestration</p>
          </div>
          {activeCount > 0 && (
            <Badge variant="outline" className="ml-auto text-[10px] bg-yellow-500/10 text-yellow-400 border-yellow-500/30 animate-pulse">
              {activeCount} active
            </Badge>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 max-w-4xl mx-auto w-full">
        {/* Launch panel */}
        <div className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur p-5 shadow-lg space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Launch a Swarm</h2>
          </div>

          <Textarea
            id="swarm-goal-input"
            value={goal}
            onChange={e => setGoal(e.target.value)}
            placeholder="Enter a complex goal for the swarm to tackle… e.g. 'Research the top 5 open-source LLMs, compare their strengths, and recommend the best for local deployment'"
            className="min-h-[100px] bg-background/50 resize-none text-sm"
            onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleLaunch(); }}
          />

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Manager Model</label>
              <Input
                value={model}
                onChange={e => setModel(e.target.value)}
                placeholder="gemma3:4b"
                className="h-8 text-xs bg-background/50"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Worker Model</label>
              <Input
                value={workerModel}
                onChange={e => setWorkerModel(e.target.value)}
                placeholder="same as manager"
                className="h-8 text-xs bg-background/50"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Max Workers</label>
              <Input
                type="number"
                min={1}
                max={8}
                value={maxWorkers}
                onChange={e => setMaxWorkers(Number(e.target.value))}
                className="h-8 text-xs bg-background/50"
              />
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-400 bg-red-500/5 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>
          )}

          <div className="flex items-center gap-3">
            <Button
              id="swarm-launch-btn"
              onClick={handleLaunch}
              disabled={loading || !goal.trim()}
              className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
            >
              {loading ? <Loader className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              {loading ? 'Launching…' : 'Launch Swarm'}
            </Button>
            <Button variant="ghost" size="icon" onClick={fetchSwarms} className="h-9 w-9" title="Refresh">
              <RefreshCw className="h-4 w-4" />
            </Button>
            <span className="text-[10px] text-muted-foreground ml-auto">Ctrl+Enter to launch</span>
          </div>
        </div>

        {/* Swarm list */}
        {swarms.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 ring-1 ring-primary/20 flex items-center justify-center mx-auto">
              <Network className="h-8 w-8 text-primary/60" />
            </div>
            <p className="text-sm text-muted-foreground">No swarms yet. Launch one above.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Swarm History</h2>
              <span className="text-[10px] text-muted-foreground">{swarms.length} total</span>
            </div>
            {swarms.map(s => <SwarmCard key={s.id} swarm={s} />)}
          </div>
        )}
      </div>
    </div>
  );
}
