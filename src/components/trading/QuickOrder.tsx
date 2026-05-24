import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { trading } from '@/lib/trading';
import { toast } from 'sonner';

export function QuickOrder({ onPlaced }: { onPlaced: () => void }) {
  const [symbol, setSymbol] = useState('');
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [qty, setQty] = useState('');
  const [type, setType] = useState<'market' | 'limit'>('market');
  const [limitPrice, setLimitPrice] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!symbol.trim() || !qty.trim()) {
      toast.error('Symbol and quantity required');
      return;
    }
    setBusy(true);
    try {
      await trading.placeOrder({
        symbol: symbol.trim().toUpperCase(),
        side,
        qty: Number(qty),
        type,
        ...(type === 'limit' ? { limit_price: Number(limitPrice) } : {}),
      });
      toast.success(`${side.toUpperCase()} ${qty} ${symbol.toUpperCase()} submitted`);
      setSymbol(''); setQty(''); setLimitPrice('');
      onPlaced();
    } catch (e) {
      toast.error(`Order failed: ${e instanceof Error ? e.message : 'unknown'}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="p-4 border-border/50 bg-card/50">
      <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Quick Order</div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="col-span-2 md:col-span-1">
          <Label className="text-xs">Symbol</Label>
          <Input value={symbol} onChange={(e) => setSymbol(e.target.value)} placeholder="AAPL" className="uppercase" />
        </div>
        <div>
          <Label className="text-xs">Side</Label>
          <Select value={side} onValueChange={(v) => setSide(v as 'buy' | 'sell')}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="buy">Buy</SelectItem>
              <SelectItem value="sell">Sell</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">Qty</Label>
          <Input type="number" value={qty} onChange={(e) => setQty(e.target.value)} placeholder="10" />
        </div>
        <div>
          <Label className="text-xs">Type</Label>
          <Select value={type} onValueChange={(v) => setType(v as 'market' | 'limit')}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="market">Market</SelectItem>
              <SelectItem value="limit">Limit</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {type === 'limit' && (
          <div>
            <Label className="text-xs">Limit $</Label>
            <Input type="number" value={limitPrice} onChange={(e) => setLimitPrice(e.target.value)} placeholder="150.00" />
          </div>
        )}
        <div className={`col-span-2 md:col-span-${type === 'limit' ? '5' : '1'} flex items-end`}>
          <Button onClick={submit} disabled={busy} className="w-full">
            {busy ? 'Submitting…' : `${side === 'buy' ? 'Buy' : 'Sell'} ${symbol || ''}`.trim()}
          </Button>
        </div>
      </div>
    </Card>
  );
}
