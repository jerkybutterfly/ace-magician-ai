import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { trading, fmtMoney, type Strategy } from '@/lib/trading';
import { toast } from 'sonner';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

export function StrategyCard({ strategy, onChange }: { strategy: Strategy; onChange: () => void }) {
  const [logsOpen, setLogsOpen] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const toggle = async () => {
    try {
      await trading.toggleStrategy(strategy.id);
      onChange();
    } catch (e) {
      toast.error(`Toggle failed: ${e instanceof Error ? e.message : 'unknown'}`);
    }
  };

  const openLogs = async () => {
    setLogsOpen(true);
    try {
      const { logs } = await trading.strategyLogs(strategy.id);
      setLogs(logs);
    } catch {
      setLogs(['Failed to load logs']);
    }
  };

  return (
    <>
      <Card className="p-4 border-border/50 bg-card/50">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="font-semibold text-sm">{strategy.name}</div>
            <div className="text-xs text-muted-foreground font-mono">{strategy.symbols.join(', ')}</div>
          </div>
          <Switch checked={strategy.enabled} onCheckedChange={toggle} />
        </div>
        <div className="flex items-center gap-2 mb-3">
          <Badge variant={strategy.enabled ? 'default' : 'secondary'} className="text-[10px]">
            {strategy.enabled ? 'RUNNING' : 'STOPPED'}
          </Badge>
          {strategy.last_signal && (
            <Badge variant="outline" className="text-[10px]">
              Last: {strategy.last_signal.side.toUpperCase()} {strategy.last_signal.symbol}
            </Badge>
          )}
        </div>
        <div className="flex justify-between items-center text-xs">
          <div>
            <span className="text-muted-foreground">P&amp;L: </span>
            <span className={strategy.pnl >= 0 ? 'text-primary' : 'text-destructive'}>{fmtMoney(strategy.pnl)}</span>
            <span className="text-muted-foreground ml-2">({strategy.trades} trades)</span>
          </div>
          <Button size="sm" variant="ghost" onClick={openLogs}>Logs</Button>
        </div>
      </Card>

      <Dialog open={logsOpen} onOpenChange={setLogsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{strategy.name} — Logs</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-96 rounded border bg-muted/30 p-3">
            <pre className="text-xs font-mono whitespace-pre-wrap">{logs.length ? logs.join('\n') : 'No logs yet.'}</pre>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
