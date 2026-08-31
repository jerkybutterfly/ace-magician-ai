import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Atom, Play, Pause, RotateCcw, Sparkles, Loader2, Target, Layers, ExternalLink } from 'lucide-react';
import { generateText } from '@/lib/ollama';
import { toast } from 'sonner';

/**
 * Physical AI — inspired by acceleratedunderstanding.com
 *
 * Concepts implemented locally:
 *  - Full 4D trajectory (3D + time) — we roll out the whole path, not step-by-step
 *  - Native super-resolution — dt & steps are free parameters at inference time
 *  - Cross-physics: gravity + spring + drag combined in one model
 *  - Directional feedback — local LLM proposes parameter changes toward a goal
 *  - Self-improvement loop — iterate suggestions and score them
 */

type Vec3 = [number, number, number];
interface Body { id: string; mass: number; pos: Vec3; vel: Vec3; }
interface World {
  bodies: Body[];
  gravity: number;   // pairwise G
  spring: number;    // pulls all bodies toward center
  drag: number;      // velocity damping
  dt: number;
  steps: number;
}
interface Trajectory { world: World; frames: Vec3[][]; }

const DEFAULT_WORLD: World = {
  bodies: [
    { id: 'A', mass: 1.0, pos: [-1.2, 0.0, 0.0], vel: [0.0, 0.6, 0.0] },
    { id: 'B', mass: 1.0, pos: [ 1.2, 0.0, 0.0], vel: [0.0, -0.6, 0.0] },
    { id: 'C', mass: 0.5, pos: [ 0.0, 1.5, 0.0], vel: [-0.4, 0.0, 0.1] },
  ],
  gravity: 0.8,
  spring: 0.05,
  drag: 0.002,
  dt: 0.02,
  steps: 1200,
};

function rollout(w: World): Vec3[][] {
  const n = w.bodies.length;
  const pos = w.bodies.map(b => [...b.pos] as Vec3);
  const vel = w.bodies.map(b => [...b.vel] as Vec3);
  const mass = w.bodies.map(b => b.mass);
  const frames: Vec3[][] = [];
  for (let s = 0; s < w.steps; s++) {
    // forces
    const acc: Vec3[] = pos.map(() => [0, 0, 0]);
    for (let i = 0; i < n; i++) {
      // spring to origin
      acc[i][0] -= w.spring * pos[i][0];
      acc[i][1] -= w.spring * pos[i][1];
      acc[i][2] -= w.spring * pos[i][2];
      // drag
      acc[i][0] -= w.drag * vel[i][0];
      acc[i][1] -= w.drag * vel[i][1];
      acc[i][2] -= w.drag * vel[i][2];
      for (let j = 0; j < n; j++) {
        if (i === j) continue;
        const dx = pos[j][0] - pos[i][0];
        const dy = pos[j][1] - pos[i][1];
        const dz = pos[j][2] - pos[i][2];
        const r2 = dx*dx + dy*dy + dz*dz + 0.05;
        const f = w.gravity * mass[j] / (r2 * Math.sqrt(r2));
        acc[i][0] += f * dx;
        acc[i][1] += f * dy;
        acc[i][2] += f * dz;
      }
    }
    for (let i = 0; i < n; i++) {
      vel[i][0] += acc[i][0] * w.dt;
      vel[i][1] += acc[i][1] * w.dt;
      vel[i][2] += acc[i][2] * w.dt;
      pos[i][0] += vel[i][0] * w.dt;
      pos[i][1] += vel[i][1] * w.dt;
      pos[i][2] += vel[i][2] * w.dt;
    }
    frames.push(pos.map(p => [...p] as Vec3));
  }
  return frames;
}

/** Score = mean distance of body 0 from target over final 20% of trajectory. Lower is better. */
function scoreTrajectory(traj: Vec3[][], target: Vec3): number {
  const start = Math.floor(traj.length * 0.8);
  let sum = 0, n = 0;
  for (let f = start; f < traj.length; f++) {
    const p = traj[f][0];
    const dx = p[0] - target[0], dy = p[1] - target[1], dz = p[2] - target[2];
    sum += Math.sqrt(dx*dx + dy*dy + dz*dz);
    n++;
  }
  return sum / Math.max(1, n);
}

const COLORS = ['#22c55e', '#38bdf8', '#f472b6', '#facc15', '#a78bfa', '#fb923c'];

export default function PhysicalAiPage() {
  const [world, setWorld] = useState<World>(DEFAULT_WORLD);
  const [target, setTarget] = useState<Vec3>([2.0, 2.0, 0.0]);
  const [playing, setPlaying] = useState(true);
  const [frameIdx, setFrameIdx] = useState(0);
  const [thinking, setThinking] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [history, setHistory] = useState<{ world: World; score: number; note: string }[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const trajectory: Trajectory = useMemo(
    () => ({ world, frames: rollout(world) }),
    [world],
  );
  const score = useMemo(() => scoreTrajectory(trajectory.frames, target), [trajectory, target]);

  // animation
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setFrameIdx((i) => (i + 4) % trajectory.frames.length);
    }, 16);
    return () => clearInterval(id);
  }, [playing, trajectory]);

  // render
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    const W = c.width, H = c.height;
    ctx.fillStyle = 'hsl(0 0% 4%)';
    ctx.fillRect(0, 0, W, H);
    // grid
    ctx.strokeStyle = 'hsl(142 30% 20% / 0.4)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= W; x += 40) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y <= H; y += 40) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }
    const scale = Math.min(W, H) / 8;
    const cx = W / 2, cy = H / 2;
    const proj = (p: Vec3) => [cx + p[0] * scale, cy - p[1] * scale] as const;

    // target
    const [tx, ty] = proj(target);
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(tx, ty, 10, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(tx - 14, ty); ctx.lineTo(tx + 14, ty); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(tx, ty - 14); ctx.lineTo(tx, ty + 14); ctx.stroke();

    // trails (full 4D rollout visible)
    for (let b = 0; b < world.bodies.length; b++) {
      ctx.strokeStyle = COLORS[b % COLORS.length] + '80';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      for (let f = 0; f < trajectory.frames.length; f += 3) {
        const [px, py] = proj(trajectory.frames[f][b]);
        if (f === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }
    // current bodies
    const cur = trajectory.frames[Math.min(frameIdx, trajectory.frames.length - 1)];
    for (let b = 0; b < world.bodies.length; b++) {
      const [px, py] = proj(cur[b]);
      ctx.fillStyle = COLORS[b % COLORS.length];
      ctx.beginPath();
      ctx.arc(px, py, 4 + world.bodies[b].mass * 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = '10px monospace';
      ctx.fillText(world.bodies[b].id, px + 8, py - 6);
    }
  }, [trajectory, frameIdx, world, target]);

  const askForFeedback = async () => {
    setThinking(true);
    setFeedback('');
    try {
      const summary = JSON.stringify({
        world: {
          gravity: world.gravity, spring: world.spring, drag: world.drag,
          bodies: world.bodies.map(b => ({ id: b.id, mass: b.mass, pos: b.pos, vel: b.vel })),
        },
        target,
        current_score_lower_is_better: score,
        final_positions: trajectory.frames[trajectory.frames.length - 1],
      }, null, 2);
      const prompt = `You are a physics tutor providing DIRECTIONAL FEEDBACK for a 3D N-body simulation.
The goal is to make body A end near target ${JSON.stringify(target)}.
Lower score = closer to target.

Current state:
${summary}

Reply with:
1. WHY the current trajectory misses (2-3 sentences).
2. Concrete NEXT PARAMETER CHANGES as a JSON block, e.g.
\`\`\`json
{"gravity": 1.1, "spring": 0.03, "bodies": [{"id":"A","vel":[0.0,0.9,0.0]}]}
\`\`\`
Only include fields you want to change. Small nudges only (< 30% change).`;
      const reply = await generateText(prompt);
      setFeedback(reply);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'LLM failed');
    } finally {
      setThinking(false);
    }
  };

  const applyFeedback = () => {
    const m = feedback.match(/```json\s*([\s\S]*?)```/);
    if (!m) { toast.error('No JSON patch found in reply'); return; }
    try {
      const patch = JSON.parse(m[1]);
      const next: World = { ...world };
      if (typeof patch.gravity === 'number') next.gravity = patch.gravity;
      if (typeof patch.spring === 'number') next.spring = patch.spring;
      if (typeof patch.drag === 'number') next.drag = patch.drag;
      if (Array.isArray(patch.bodies)) {
        next.bodies = world.bodies.map(b => {
          const p = patch.bodies.find((x: { id: string }) => x.id === b.id);
          if (!p) return b;
          return {
            ...b,
            mass: typeof p.mass === 'number' ? p.mass : b.mass,
            pos: Array.isArray(p.pos) ? p.pos : b.pos,
            vel: Array.isArray(p.vel) ? p.vel : b.vel,
          };
        });
      }
      setHistory((h) => [...h, { world, score, note: 'iteration' }]);
      setWorld(next);
      toast.success('Applied LLM patch — re-simulated');
    } catch {
      toast.error('Could not parse JSON patch');
    }
  };

  const reset = () => { setWorld(DEFAULT_WORLD); setHistory([]); setFeedback(''); setFrameIdx(0); };

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      <div className="border-b border-border/50 p-4 shrink-0">
        <div className="flex items-center gap-2 flex-wrap">
          <Atom className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-semibold">Physical AI</h1>
          <Badge variant="outline" className="text-[10px]">4D rollout · directional feedback</Badge>
          <a
            href="https://acceleratedunderstanding.com"
            target="_blank" rel="noreferrer"
            className="ml-auto text-xs text-muted-foreground hover:text-primary inline-flex items-center gap-1"
          >
            concept: acceleratedunderstanding.com <ExternalLink className="h-3 w-3" />
          </a>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Local N-body sandbox with combined gravity + spring + drag. The full trajectory
          (3D space × time) is rolled out at once, resolution is free at inference, and your
          local model provides directional feedback toward a goal — an iterate-and-improve loop.
        </p>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_360px] min-h-0">
        <div className="flex flex-col min-h-0 border-r border-border/50">
          <div className="p-3 flex items-center gap-2 border-b border-border/50">
            <Button size="sm" variant="outline" onClick={() => setPlaying(p => !p)}>
              {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            </Button>
            <Button size="sm" variant="outline" onClick={reset}>
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
            <div className="flex-1 flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground">t</span>
              <Slider
                value={[frameIdx]}
                min={0}
                max={trajectory.frames.length - 1}
                step={1}
                onValueChange={(v) => { setPlaying(false); setFrameIdx(v[0]); }}
              />
            </div>
            <Badge variant="outline" className="text-[10px] font-mono">
              score {score.toFixed(3)}
            </Badge>
          </div>
          <div className="flex-1 min-h-0 flex items-center justify-center p-3 bg-black/40">
            <canvas ref={canvasRef} width={720} height={520} className="max-w-full max-h-full rounded-lg border border-border/40" />
          </div>
        </div>

        <div className="flex flex-col min-h-0 overflow-y-auto">
          <Card className="m-3 p-3 space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Layers className="h-4 w-4 text-primary" /> Super-resolution
            </div>
            <div>
              <Label className="text-xs">dt · {world.dt.toFixed(3)}</Label>
              <Slider value={[world.dt]} min={0.005} max={0.05} step={0.005}
                onValueChange={(v) => setWorld(w => ({ ...w, dt: v[0] }))} />
            </div>
            <div>
              <Label className="text-xs">steps · {world.steps}</Label>
              <Slider value={[world.steps]} min={200} max={4000} step={100}
                onValueChange={(v) => setWorld(w => ({ ...w, steps: v[0] }))} />
            </div>
            <div>
              <Label className="text-xs">gravity · {world.gravity.toFixed(2)}</Label>
              <Slider value={[world.gravity]} min={0} max={3} step={0.05}
                onValueChange={(v) => setWorld(w => ({ ...w, gravity: v[0] }))} />
            </div>
            <div>
              <Label className="text-xs">spring · {world.spring.toFixed(3)}</Label>
              <Slider value={[world.spring]} min={0} max={0.3} step={0.005}
                onValueChange={(v) => setWorld(w => ({ ...w, spring: v[0] }))} />
            </div>
            <div>
              <Label className="text-xs">drag · {world.drag.toFixed(3)}</Label>
              <Slider value={[world.drag]} min={0} max={0.05} step={0.001}
                onValueChange={(v) => setWorld(w => ({ ...w, drag: v[0] }))} />
            </div>
          </Card>

          <Card className="m-3 p-3 space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Target className="h-4 w-4 text-yellow-400" /> Goal for body A
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(['x','y','z'] as const).map((k, i) => (
                <Input key={k} type="number" step="0.1" value={target[i]}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    setTarget(t => { const n = [...t] as Vec3; n[i] = v; return n; });
                  }} />
              ))}
            </div>
          </Card>

          <Card className="m-3 p-3 space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Sparkles className="h-4 w-4 text-primary" /> Directional feedback loop
            </div>
            <Button size="sm" onClick={askForFeedback} disabled={thinking} className="gap-2 w-full">
              {thinking ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
              {thinking ? 'Model thinking…' : 'Ask local model for a nudge'}
            </Button>
            {feedback && (
              <>
                <Textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} className="text-xs font-mono min-h-[160px]" />
                <Button size="sm" variant="secondary" onClick={applyFeedback} className="w-full">
                  Apply JSON patch & re-simulate
                </Button>
              </>
            )}
            {history.length > 0 && (
              <div className="pt-2 border-t border-border/40">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                  self-improvement history
                </div>
                <div className="space-y-0.5 max-h-32 overflow-y-auto">
                  {history.map((h, i) => (
                    <div key={i} className="text-[11px] font-mono flex justify-between">
                      <span>iter {i + 1}</span>
                      <span className={h.score > score ? 'text-emerald-400' : 'text-red-400'}>
                        {h.score.toFixed(3)} → {score.toFixed(3)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
