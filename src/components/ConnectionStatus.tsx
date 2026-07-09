import { useNavigate } from 'react-router-dom';
import { useAgentReachable, useOllamaReachable } from '@/lib/reachability';
import { Wifi, WifiOff, Loader2 } from 'lucide-react';

export function ConnectionStatus() {
  const agent = useAgentReachable();
  const ollama = useOllamaReachable();
  const navigate = useNavigate();

  const allUp = agent && ollama;
  const anyDown = !agent || !ollama;

  return (
    <button
      type="button"
      onClick={() => navigate('/settings')}
      className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-secondary/60 transition-colors"
      title="Connection status — click to open Settings"
    >
      {allUp ? (
        <Wifi className="h-4 w-4 text-primary" />
      ) : anyDown ? (
        <WifiOff className="h-4 w-4 text-destructive" />
      ) : (
        <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
      )}
      <span className="text-xs hidden sm:inline text-muted-foreground">
        {allUp ? 'Online' : anyDown ? 'Offline' : 'Checking'}
      </span>
    </button>
  );
}
