import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { trading, fmtMoney, fmtPct, type Position } from '@/lib/trading';
import { SendToChatButton } from '@/components/SendToChatButton';
import { toast } from 'sonner';

export function PositionsTable({ refreshKey, onChange }: { refreshKey: number; onChange: () => void }) {
  const [rows, setRows] = useState<Position[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    trading.positions().then((p) => !cancelled && setRows(p)).catch(() => !cancelled && setRows([]));
    return () => { cancelled = true; };
  }, [refreshKey]);

  const close = async (p: Position) => {
    try {
      await trading.placeOrder({ symbol: p.symbol, side: p.side === 'long' ? 'sell' : 'buy', qty: Math.abs(p.qty), type: 'market' });
      toast.success(`Closing ${p.symbol}`);
      onChange();
    } catch (e) {
      toast.error(`Close failed: ${e instanceof Error ? e.message : 'unknown'}`);
    }
  };

  return (
    <Card className="border-border/50 bg-card/50">
      <div className="p-4 pb-2 text-xs uppercase tracking-wider text-muted-foreground">Positions</div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Symbol</TableHead>
            <TableHead className="text-right">Qty</TableHead>
            <TableHead className="text-right">Entry</TableHead>
            <TableHead className="text-right">Last</TableHead>
            <TableHead className="text-right">P&amp;L</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows === null ? (
            <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground text-sm">Loading…</TableCell></TableRow>
          ) : rows.length === 0 ? (
            <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground text-sm">No open positions</TableCell></TableRow>
          ) : rows.map((p) => (
            <TableRow key={p.symbol}>
              <TableCell className="font-mono font-semibold">{p.symbol}</TableCell>
              <TableCell className="text-right font-mono">{p.qty}</TableCell>
              <TableCell className="text-right font-mono">{fmtMoney(p.avg_entry)}</TableCell>
              <TableCell className="text-right font-mono">{fmtMoney(p.last)}</TableCell>
              <TableCell className={`text-right font-mono ${p.unrealized_pl >= 0 ? 'text-primary' : 'text-destructive'}`}>
                {fmtMoney(p.unrealized_pl)} <span className="text-xs">({fmtPct(p.unrealized_plpc)})</span>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <SendToChatButton
                    text={`Analyze my ${p.symbol} position: ${p.qty} shares at ${fmtMoney(p.avg_entry)}, now ${fmtMoney(p.last)} (${fmtPct(p.unrealized_plpc)}). Should I hold or close?`}
                    label="Ask AI"
                    variant="ghost"
                  />
                  <Button size="sm" variant="outline" onClick={() => close(p)}>Close</Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
