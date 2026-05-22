import { useEffect, useState } from 'react';
import { Circle, RefreshCw } from 'lucide-react';
import { getSettings } from '@/lib/settings';
import { cn } from '@/lib/utils';
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';

type Status = 'unknown' | 'online' | 'degraded' | 'offline';

interface Stats {
  cpu?: number;
  mem?: number;
  latencyMs?: number;
}

async function ping(): Promise<{ ok: boolean; latencyMs: number; data?: any }> {
  const url = `${getSettings().agentUrl}/system/stats`;
  const t0 = performance.now();
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 4000);
    const res = await fetch(url, { signal: ctrl.signal });
    clearTimeout(timer);
    const latencyMs = Math.round(performance.now() - t0);
    if (!res.ok) return { ok: false, latencyMs };
    const data = await res.json().catch(() => ({}));
    return { ok: true, latencyMs, data };
  } catch {
    return { ok: false, latencyMs: Math.round(performance.now() - t0) };
  }
}

export function AgentHealthPill() {
  const [status, setStatus] = useState<Status>('unknown');
  const [stats, setStats] = useState<Stats>({});
  const [checking, setChecking] = useState(false);

  const check = async () => {
    setChecking(true);
    const r = await ping();
    if (!r.ok) {
      setStatus('offline');
      setStats({ latencyMs: r.latencyMs });
    } else {
      const cpu = r.data?.cpu_percent ?? r.data?.cpu;
      const mem = r.data?.memory?.percent ?? r.data?.mem;
      const degraded = r.latencyMs > 1500 || (typeof cpu === 'number' && cpu > 90);
      setStatus(degraded ? 'degraded' : 'online');
      setStats({ cpu, mem, latencyMs: r.latencyMs });
    }
    setChecking(false);
  };

  useEffect(() => {
    check();
    const id = setInterval(check, 10000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dotClass =
    status === 'online'
      ? 'fill-primary text-primary'
      : status === 'degraded'
      ? 'fill-yellow-500 text-yellow-500'
      : status === 'offline'
      ? 'fill-destructive text-destructive'
      : 'fill-muted-foreground text-muted-foreground';

  const label =
    status === 'online'
      ? 'Agent online'
      : status === 'degraded'
      ? 'Agent degraded'
      : status === 'offline'
      ? 'Agent offline'
      : 'Agent…';

  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={check}
            className="h-7 gap-1.5 px-2 text-[11px] font-mono"
          >
            <Circle className={cn('h-2 w-2', dotClass, status !== 'unknown' && 'animate-pulse')} />
            <span className="text-muted-foreground">{label}</span>
            {typeof stats.latencyMs === 'number' && status !== 'offline' && (
              <span className="text-muted-foreground/60">{stats.latencyMs}ms</span>
            )}
            {checking && <RefreshCw className="h-2.5 w-2.5 animate-spin text-muted-foreground" />}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">
          <div className="space-y-0.5">
            <div className="font-medium">{label}</div>
            <div className="text-muted-foreground">{getSettings().agentUrl}</div>
            {typeof stats.cpu === 'number' && <div>CPU: {Math.round(stats.cpu)}%</div>}
            {typeof stats.mem === 'number' && <div>Memory: {Math.round(stats.mem)}%</div>}
            {typeof stats.latencyMs === 'number' && <div>Latency: {stats.latencyMs}ms</div>}
            <div className="text-muted-foreground/70 pt-1">Click to refresh</div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
