import { useState, useEffect } from 'react';
import { Target, TrendingUp, CheckCircle2 } from 'lucide-react';
import { getSettings } from '@/lib/settings';

interface Mission {
  goal: string;
  status: string;
  next_steps: string[];
}

export function MissionPanel() {
  const [mission, setMission] = useState<Mission | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMission = async () => {
    try {
      const { agentUrl } = getSettings();
      const res = await fetch(`${agentUrl}/mission`);
      if (res.ok) {
        setMission(await res.json());
      }
    } catch (e) {
      console.error('Failed to fetch mission:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMission();
    const interval = setInterval(fetchMission, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return null;
  if (!mission) return null;

  return (
    <div className="px-3 py-3 space-y-3">
      <div className="flex flex-col gap-1.5 p-2.5 rounded-xl bg-primary/10 border border-primary/20 ring-1 ring-primary/10 transition-all hover:bg-primary/15">
        <div className="flex items-center gap-2">
          <Target className="h-3.5 w-3.5 text-primary" />
          <span className="text-[11px] font-bold text-primary uppercase tracking-wider">Active Mission</span>
        </div>
        <p className="text-xs font-semibold text-foreground leading-tight italic">"{mission.goal}"</p>
      </div>

      <div className="space-y-2 px-1">
        <div className="flex items-start gap-2">
          <TrendingUp className="h-3.5 w-3.5 text-muted-foreground mt-0.5" />
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-medium text-muted-foreground uppercase leading-none mt-1">Status</span>
            <p className="text-[11px] text-foreground font-medium leading-relaxed">{mission.status}</p>
          </div>
        </div>

        <div className="space-y-1.5 mt-2">
          <span className="text-[10px] font-medium text-muted-foreground uppercase px-5">Strategy</span>
          <div className="space-y-1">
            {mission.next_steps.slice(0, 3).map((step, i) => (
              <div key={i} className="flex items-center gap-2 px-1 py-0.5 bg-secondary/30 rounded-md border border-border/40">
                <CheckCircle2 className="h-3 w-3 text-primary/60 shrink-0" />
                <span className="text-[10px] text-muted-foreground truncate">{step}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
