import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { trading, type Order } from '@/lib/trading';

export function OrdersTable({ refreshKey }: { refreshKey: number }) {
  const [rows, setRows] = useState<Order[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    trading.orders('all').then((o) => !cancelled && setRows(o.slice(0, 20))).catch(() => !cancelled && setRows([]));
    return () => { cancelled = true; };
  }, [refreshKey]);

  const statusVariant = (s: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    if (s === 'filled') return 'default';
    if (s === 'canceled' || s === 'rejected') return 'destructive';
    if (s === 'new' || s === 'accepted' || s === 'pending_new') return 'secondary';
    return 'outline';
  };

  return (
    <Card className="border-border/50 bg-card/50">
      <div className="p-4 pb-2 text-xs uppercase tracking-wider text-muted-foreground">Recent Orders</div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Time</TableHead>
            <TableHead>Symbol</TableHead>
            <TableHead>Side</TableHead>
            <TableHead className="text-right">Qty</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows === null ? (
            <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground text-sm">Loading…</TableCell></TableRow>
          ) : rows.length === 0 ? (
            <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground text-sm">No orders yet</TableCell></TableRow>
          ) : rows.map((o) => (
            <TableRow key={o.id}>
              <TableCell className="text-xs font-mono text-muted-foreground">
                {new Date(o.submitted_at).toLocaleTimeString()}
              </TableCell>
              <TableCell className="font-mono font-semibold">{o.symbol}</TableCell>
              <TableCell>
                <Badge variant={o.side === 'buy' ? 'default' : 'destructive'} className="text-[10px]">
                  {o.side.toUpperCase()}
                </Badge>
              </TableCell>
              <TableCell className="text-right font-mono">{o.qty}</TableCell>
              <TableCell className="text-xs text-muted-foreground">{o.type}</TableCell>
              <TableCell>
                <Badge variant={statusVariant(o.status)} className="text-[10px]">{o.status}</Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
