import { useEffect, useState } from 'react';
import { getSystemInfo, type SystemInfo as SysInfo } from '@/lib/agent';
import { Cpu, HardDrive, MemoryStick, RefreshCw, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

function formatBytes(bytes: number) {
  const gb = bytes / (1024 ** 3);
  return `${gb.toFixed(1)} GB`;
}

export function SystemInfoPanel() {
  const [info, setInfo] = useState<SysInfo | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setInfo(await getSystemInfo());
      setError('');
    } catch {
      setError('Agent unavailable');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); const t = setInterval(load, 5000); return () => clearInterval(t); }, []);

  if (error) return <div className="p-3 text-xs text-muted-foreground">{error}</div>;
  if (!info) return <div className="p-3 text-xs text-muted-foreground">Loading...</div>;

  const cpu = info.cpu;
  const ram = info.ram;
  const singleChannel = ram && ram.channels === 1;

  return (
    <div className="p-3 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium">System</span>
        <button onClick={load} disabled={loading}>
          <RefreshCw className={`h-3 w-3 text-muted-foreground ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {cpu?.model && (
        <div className="text-[10px] text-muted-foreground leading-tight" title={cpu.model}>
          <p className="truncate">{cpu.model}</p>
          <div className="flex flex-wrap gap-1 mt-1">
            {cpu.physical_cores ? <span className="px-1 rounded bg-secondary/60">{cpu.physical_cores}c/{cpu.logical_cores}t</span> : null}
            {cpu.has_avx2 && <span className="px-1 rounded bg-primary/15 text-primary">AVX2</span>}
            {cpu.has_avx512 && <span className="px-1 rounded bg-primary/15 text-primary">AVX512</span>}
            {cpu.has_fma && <span className="px-1 rounded bg-primary/15 text-primary">FMA</span>}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs">
          <Cpu className="h-3.5 w-3.5 text-primary" />
          <span className="flex-1">CPU</span>
          <span className="text-muted-foreground">{info.cpu_percent}%</span>
        </div>
        <Progress value={info.cpu_percent} className="h-1.5" />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs">
          <MemoryStick className="h-3.5 w-3.5 text-primary" />
          <span className="flex-1">RAM</span>
          <span className="text-muted-foreground">{formatBytes(info.memory.used)} / {formatBytes(info.memory.total)}</span>
        </div>
        <Progress value={info.memory.percent} className="h-1.5" />
        {ram && (ram.channels || ram.speed_mhz) ? (
          <div className="flex items-center gap-1 text-[10px]">
            {singleChannel ? (
              <span className="flex items-center gap-1 text-destructive">
                <AlertTriangle className="h-3 w-3" /> Single-channel — add 2nd SO-DIMM for ~80% faster LLMs
              </span>
            ) : ram.dual_channel ? (
              <span className="flex items-center gap-1 text-primary">
                <CheckCircle2 className="h-3 w-3" /> Dual-channel
                {ram.speed_mhz ? ` · ${ram.speed_mhz} MT/s` : ''}
              </span>
            ) : ram.speed_mhz ? (
              <span className="text-muted-foreground">{ram.speed_mhz} MT/s</span>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs">
          <HardDrive className="h-3.5 w-3.5 text-primary" />
          <span className="flex-1">Disk</span>
          <span className="text-muted-foreground">{formatBytes(info.disk.used)} / {formatBytes(info.disk.total)}</span>
        </div>
        <Progress value={info.disk.percent} className="h-1.5" />
      </div>
    </div>
  );
}
