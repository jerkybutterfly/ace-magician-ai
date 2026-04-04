import { useEffect, useState } from 'react';
import { getSystemInfo, type SystemInfo as SysInfo } from '@/lib/agent';
import { Cpu, HardDrive, MemoryStick, RefreshCw } from 'lucide-react';
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

  return (
    <div className="p-3 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium">System</span>
        <button onClick={load} disabled={loading}>
          <RefreshCw className={`h-3 w-3 text-muted-foreground ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>
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
