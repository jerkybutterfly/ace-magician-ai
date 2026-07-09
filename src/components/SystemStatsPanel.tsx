import { useState } from "react";
import { Cpu, HardDrive, Wifi } from "lucide-react";
import { getSettings } from "@/lib/settings";
import { useIntervalWithBackoff } from "@/hooks/useIntervalWithBackoff";

export function SystemStatsPanel() {
  const [stats, setStats] = useState<{ cpu: number; ram: number; network: { bytes_sent: number; bytes_recv: number } } | null>(null);

  useIntervalWithBackoff(async () => {
    try {
      const { agentUrl } = getSettings();
      const res = await fetch(`${agentUrl}/system/stats`);
      if (res.ok) {
        const data = await res.json();
        if (!data.error) setStats(data);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, 2000);

  if (!stats) return null;

  return (
    <div className="grid grid-cols-3 gap-2 p-2 mb-4 bg-black/40 border border-green-500/30 rounded-lg backdrop-blur-sm shadow-[0_0_15px_rgba(0,255,0,0.1)]">
      <div className="flex flex-col items-center justify-center p-2 rounded bg-green-950/20 text-green-400">
        <Cpu className="w-5 h-5 mb-1 text-green-500 animate-pulse" />
        <span className="text-xs font-mono opacity-70">CPU</span>
        <span className="text-sm font-mono font-bold">{stats.cpu.toFixed(1)}%</span>
      </div>
      <div className="flex flex-col items-center justify-center p-2 rounded bg-green-950/20 text-green-400">
        <HardDrive className="w-5 h-5 mb-1 text-green-500" />
        <span className="text-xs font-mono opacity-70">RAM</span>
        <span className="text-sm font-mono font-bold">{stats.ram.toFixed(1)}%</span>
      </div>
      <div className="flex flex-col items-center justify-center p-2 rounded bg-green-950/20 text-green-400">
        <Wifi className="w-5 h-5 mb-1 text-green-500" />
        <span className="text-xs font-mono opacity-70">NET</span>
        <span className="text-sm font-mono font-bold text-center leading-none">
          ↑{(stats.network.bytes_sent / 1024 / 1024).toFixed(1)}M<br/>
          ↓{(stats.network.bytes_recv / 1024 / 1024).toFixed(1)}M
        </span>
      </div>
    </div>
  );
}
