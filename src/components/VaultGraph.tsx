import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Link2, RefreshCw, X, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { readNote, writeNote, searchVault, type VaultNote } from '@/lib/obsidian';

interface Node {
  id: string;       // vault-relative path
  name: string;     // display name (no .md)
  x: number; y: number;
  vx: number; vy: number;
  r: number;
}
interface Edge { a: string; b: string }

interface Props {
  vault: string;
  notes: VaultNote[];
}

const nameOf = (p: string) => p.split('/').pop()?.replace(/\.md$/i, '') ?? p;

export default function VaultGraph({ vault, notes }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const nodesRef = useRef<Node[]>([]);
  const edgesRef = useRef<Edge[]>([]);
  const selectedRef = useRef<string | null>(null);
  const hoverRef = useRef<string | null>(null);
  const draggingRef = useRef<string | null>(null);
  const rafRef = useRef<number>();
  const sizeRef = useRef({ w: 800, h: 520 });

  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const [edgeCount, setEdgeCount] = useState(0);
  const [connectFrom, setConnectFrom] = useState<string | null>(null);

  // Build nodes from notes list.
  useEffect(() => {
    const { w, h } = sizeRef.current;
    const byName = new Map<string, VaultNote>();
    notes.forEach((n) => byName.set(nameOf(n.path).toLowerCase(), n));
    const cx = w / 2, cy = h / 2;
    nodesRef.current = notes.slice(0, 400).map((n, i) => {
      const angle = (i / Math.max(1, notes.length)) * Math.PI * 2;
      const rad = 60 + Math.random() * Math.min(w, h) * 0.35;
      return {
        id: n.path,
        name: nameOf(n.path),
        x: cx + Math.cos(angle) * rad,
        y: cy + Math.sin(angle) * rad,
        vx: 0, vy: 0,
        r: Math.min(14, 4 + Math.log2(Math.max(2, n.size)) * 0.8),
      };
    });
  }, [notes]);

  // Discover edges from [[wikilinks]] via a single vault-wide search.
  const scanEdges = async () => {
    if (!notes.length) return;
    setLoading(true);
    try {
      const hits = await searchVault(vault, '[[', 2000);
      const byName = new Map<string, string>();
      nodesRef.current.forEach((n) => byName.set(n.name.toLowerCase(), n.id));
      const seen = new Set<string>();
      const es: Edge[] = [];
      const re = /\[\[([^\]|#]+)(?:[|#][^\]]*)?\]\]/g;
      for (const h of hits) {
        let m: RegExpExecArray | null;
        while ((m = re.exec(h.text))) {
          const target = m[1].trim().toLowerCase().replace(/\.md$/, '');
          const tId = byName.get(target);
          if (!tId || tId === h.path) continue;
          const key = h.path < tId ? `${h.path}|${tId}` : `${tId}|${h.path}`;
          if (seen.has(key)) continue;
          seen.add(key);
          es.push({ a: h.path, b: tId });
        }
      }
      edgesRef.current = es;
      setEdgeCount(es.length);
      toast.success(`Found ${es.length} links`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Scan failed');
    } finally {
      setLoading(false);
    }
  };

  // Animation loop — simple force simulation.
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      sizeRef.current = { w: rect.width, h: rect.height };
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      const ctx = canvas.getContext('2d');
      ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    const step = () => {
      const { w, h } = sizeRef.current;
      const nodes = nodesRef.current;
      const edges = edgesRef.current;
      const cx = w / 2, cy = h / 2;

      // Repulsion
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = b.x - a.x, dy = b.y - a.y;
          const d2 = dx * dx + dy * dy + 0.01;
          if (d2 > 22000) continue;
          const f = 600 / d2;
          const d = Math.sqrt(d2);
          const fx = (dx / d) * f, fy = (dy / d) * f;
          a.vx -= fx; a.vy -= fy;
          b.vx += fx; b.vy += fy;
        }
        // Center gravity
        a.vx += (cx - a.x) * 0.0008;
        a.vy += (cy - a.y) * 0.0008;
      }
      // Spring edges
      const idx = new Map<string, Node>();
      nodes.forEach((n) => idx.set(n.id, n));
      for (const e of edges) {
        const a = idx.get(e.a), b = idx.get(e.b);
        if (!a || !b) continue;
        const dx = b.x - a.x, dy = b.y - a.y;
        const d = Math.sqrt(dx * dx + dy * dy) || 0.01;
        const target = 90;
        const k = 0.008 * (d - target);
        const fx = (dx / d) * k, fy = (dy / d) * k;
        a.vx += fx; a.vy += fy;
        b.vx -= fx; b.vy -= fy;
      }
      // Integrate
      const drag = draggingRef.current;
      for (const n of nodes) {
        if (n.id === drag) { n.vx = 0; n.vy = 0; continue; }
        n.vx *= 0.85; n.vy *= 0.85;
        n.x += n.vx; n.y += n.vy;
        if (n.x < n.r) { n.x = n.r; n.vx *= -0.5; }
        if (n.y < n.r) { n.y = n.r; n.vy *= -0.5; }
        if (n.x > w - n.r) { n.x = w - n.r; n.vx *= -0.5; }
        if (n.y > h - n.r) { n.y = h - n.r; n.vy *= -0.5; }
      }

      // Draw
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.clearRect(0, 0, w, h);

      // Edges
      const sel = selectedRef.current;
      const hov = hoverRef.current;
      ctx.lineWidth = 1;
      for (const e of edges) {
        const a = idx.get(e.a), b = idx.get(e.b);
        if (!a || !b) continue;
        const highlight = sel && (e.a === sel || e.b === sel);
        ctx.strokeStyle = highlight ? 'hsl(142 60% 55% / 0.85)' : 'hsl(0 0% 100% / 0.08)';
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }

      // Nodes
      for (const n of nodes) {
        const isSel = n.id === sel;
        const isHov = n.id === hov;
        const isConn = n.id === connectFrom;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r + (isHov ? 2 : 0), 0, Math.PI * 2);
        ctx.fillStyle = isConn
          ? 'hsl(280 70% 60%)'
          : isSel
            ? 'hsl(142 60% 55%)'
            : 'hsl(142 30% 45% / 0.75)';
        ctx.fill();
        if (isSel || isHov || isConn) {
          ctx.strokeStyle = 'hsl(0 0% 100% / 0.9)';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
        if (isHov || isSel || isConn) {
          ctx.fillStyle = 'hsl(0 0% 98%)';
          ctx.font = '11px ui-sans-serif, system-ui';
          ctx.textAlign = 'center';
          ctx.fillText(n.name, n.x, n.y - n.r - 6);
        }
      }

      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, [connectFrom]);

  // Pointer interaction
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const pick = (ev: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = ev.clientX - rect.left, y = ev.clientY - rect.top;
      let best: Node | null = null;
      let bestD = Infinity;
      for (const n of nodesRef.current) {
        const dx = n.x - x, dy = n.y - y;
        const d = dx * dx + dy * dy;
        if (d < (n.r + 4) ** 2 && d < bestD) { bestD = d; best = n; }
      }
      return best;
    };
    const onDown = (ev: PointerEvent) => {
      const n = pick(ev);
      if (n) {
        draggingRef.current = n.id;
        canvas.setPointerCapture(ev.pointerId);
      }
    };
    const onMove = (ev: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = ev.clientX - rect.left, y = ev.clientY - rect.top;
      if (draggingRef.current) {
        const n = nodesRef.current.find((m) => m.id === draggingRef.current);
        if (n) { n.x = x; n.y = y; }
        return;
      }
      const n = pick(ev);
      hoverRef.current = n?.id ?? null;
      setHover(hoverRef.current);
      canvas.style.cursor = n ? 'pointer' : 'default';
    };
    const onUp = (ev: PointerEvent) => {
      const wasDragging = draggingRef.current;
      draggingRef.current = null;
      // Treat short drags as clicks
      const n = pick(ev);
      if (n && (!wasDragging || wasDragging === n.id)) {
        selectedRef.current = n.id;
        setSelected(n.id);
      }
    };
    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointerleave', () => { hoverRef.current = null; setHover(null); });
    return () => {
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp);
    };
  }, []);

  const selectedNode = useMemo(
    () => nodesRef.current.find((n) => n.id === selected) ?? null,
    [selected, notes],
  );

  const connectTo = async (targetId: string) => {
    if (!connectFrom || connectFrom === targetId) return;
    const source = nodesRef.current.find((n) => n.id === connectFrom);
    const target = nodesRef.current.find((n) => n.id === targetId);
    if (!source || !target) return;
    try {
      const body = await readNote(vault, source.id);
      if (body.includes(`[[${target.name}]]`)) {
        toast.info('Link already exists');
      } else {
        const suffix = body.endsWith('\n') ? '' : '\n';
        await writeNote(vault, source.id, `${body}${suffix}\n[[${target.name}]]\n`);
        edgesRef.current = [...edgesRef.current, { a: source.id, b: target.id }];
        setEdgeCount(edgesRef.current.length);
        toast.success(`Linked ${source.name} → ${target.name}`);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Link failed');
    } finally {
      setConnectFrom(null);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" variant="outline" onClick={scanEdges} disabled={loading || !notes.length}>
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <RefreshCw className="h-3.5 w-3.5 mr-1" />}
          Scan links
        </Button>
        <Badge variant="outline">{nodesRef.current.length} nodes</Badge>
        <Badge variant="outline">{edgeCount} links</Badge>
        {selected && (
          <>
            <span className="text-xs text-muted-foreground truncate max-w-[40ch]">
              <Sparkles className="inline h-3 w-3 mr-1 text-primary" />
              {selectedNode?.name}
            </span>
            {connectFrom === selected ? (
              <Button size="sm" variant="ghost" onClick={() => setConnectFrom(null)}>
                <X className="h-3.5 w-3.5 mr-1" /> Cancel link
              </Button>
            ) : (
              <Button size="sm" variant="secondary" onClick={() => setConnectFrom(selected)}>
                <Link2 className="h-3.5 w-3.5 mr-1" /> Link from this
              </Button>
            )}
            {connectFrom && connectFrom !== selected && (
              <Button size="sm" onClick={() => connectTo(selected)}>
                <Link2 className="h-3.5 w-3.5 mr-1" /> Link to {selectedNode?.name}
              </Button>
            )}
          </>
        )}
        {connectFrom && (
          <span className="text-xs text-primary">
            Pick a target node then hit "Link to…"
          </span>
        )}
      </div>
      <div
        ref={containerRef}
        className="relative w-full h-[60vh] rounded-lg border border-border/50 bg-gradient-to-b from-background to-secondary/20 overflow-hidden"
      >
        <canvas ref={canvasRef} className="absolute inset-0" />
        {!notes.length && (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
            Load your notes first (Notes tab → refresh).
          </div>
        )}
        {hover && !selected && (
          <div className="absolute bottom-2 left-2 text-[10px] text-muted-foreground font-mono">
            {hover}
          </div>
        )}
      </div>
      <p className="text-[11px] text-muted-foreground">
        Drag nodes to reposition. Click a node to select, then use <b>Link from this</b>, pick another node, and hit <b>Link to…</b> — a <code>[[wikilink]]</code> is appended to the source note.
      </p>
    </div>
  );
}
