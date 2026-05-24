import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Network, RefreshCw } from 'lucide-react';
import { startNetworkScan, getScanStatus, getLastDevices, type NetworkDevice } from '@/lib/network';
import { SendToChatButton }  from '@/components/SendToChatButton';
import { toast } from '@/hooks/use-toast';

export default function NetworkPage() {
  const [devices, setDevices] = useState<NetworkDevice[]>([]);
  const [previousIps, setPreviousIps] = useState<Set<string>>(new Set());
  const [scanning, setScanning] = useState(false);
  const [filter, setFilter] = useState('');
  const [lastScan, setLastScan] = useState<string | null>(null);
  const pollRef = useRef<number | null>(null);

  useEffect(() => {
    void loadCached();
    return () => { if (pollRef.current) window.clearInterval(pollRef.current); };
  }, []);

  const loadCached = async () => {
    try {
      const { devices, finished_at } = await getLastDevices();
      setDevices(devices);
      setPreviousIps(new Set(devices.map(d => d.ip)));
      setLastScan(finished_at);
    } catch {/* ignore — first run */}
  };

  const scan = async () => {
    setScanning(true);
    setPreviousIps(new Set(devices.map(d => d.ip)));
    try {
      const { scan_id } = await startNetworkScan();
      pollRef.current = window.setInterval(async () => {
        try {
          const s = await getScanStatus(scan_id);
          setDevices(s.devices);
          if (s.status !== 'running') {
            if (pollRef.current) window.clearInterval(pollRef.current);
            pollRef.current = null;
            setScanning(false);
            setLastScan(s.finished_at || new Date().toISOString());
            if (s.status === 'error') {
              toast({ title: 'Scan failed', description: s.error || 'Unknown error' });
            } else {
              toast({ title: 'Scan complete', description: `${s.devices.length} devices found` });
            }
          }
        } catch (e) {
          if (pollRef.current) window.clearInterval(pollRef.current);
          pollRef.current = null;
          setScanning(false);
          toast({ title: 'Scan error', description: e instanceof Error ? e.message : 'unknown' });
        }
      }, 1500);
    } catch (e) {
      setScanning(false);
      toast({ title: 'Could not start scan', description: e instanceof Error ? e.message : 'unknown' });
    }
  };

  const filtered = devices.filter(d => {
    if (!filter) return true;
    const f = filter.toLowerCase();
    return d.ip.toLowerCase().includes(f) || d.hostname.toLowerCase().includes(f) || d.mac.toLowerCase().includes(f) || d.vendor.toLowerCase().includes(f);
  });

  return (
    <ScrollArea className="flex-1">
      <div className="p-4 max-w-5xl mx-auto space-y-4">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2"><Network className="h-4 w-4" /> Network Scanner</CardTitle>
              <CardDescription>Discover every device on your local network</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <SendToChatButton text="[SCAN_NETWORK]" autorun label="Run in chat" />
              <Button onClick={scan} disabled={scanning} size="sm">
                {scanning ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                {scanning ? 'Scanning…' : 'Scan now'}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <Input placeholder="Filter by IP, hostname, MAC, vendor…" value={filter} onChange={(e) => setFilter(e.target.value)} className="h-8 text-sm" />
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {filtered.length}/{devices.length} devices
              </span>
            </div>
            {lastScan && (
              <p className="text-xs text-muted-foreground">Last scan: {new Date(lastScan).toLocaleString()}</p>
            )}
            <div className="border border-border/50 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="text-left px-3 py-2">IP</th>
                    <th className="text-left px-3 py-2">Hostname</th>
                    <th className="text-left px-3 py-2">MAC</th>
                    <th className="text-left px-3 py-2">Vendor</th>
                    <th className="text-left px-3 py-2">Seen</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 && (
                    <tr><td colSpan={5} className="px-3 py-6 text-center text-muted-foreground text-xs">No devices yet — click <strong>Scan now</strong>.</td></tr>
                  )}
                  {filtered.sort((a, b) => ipSort(a.ip, b.ip)).map(d => {
                    const isNew = previousIps.size > 0 && !previousIps.has(d.ip);
                    return (
                      <tr key={d.ip} className="border-t border-border/40 hover:bg-muted/20">
                        <td className="px-3 py-2 font-mono text-xs">
                          {d.ip}
                          {isNew && <Badge variant="destructive" className="ml-2 text-[10px] py-0">NEW</Badge>}
                        </td>
                        <td className="px-3 py-2 text-xs">{d.hostname || <span className="text-muted-foreground">—</span>}</td>
                        <td className="px-3 py-2 font-mono text-xs">{d.mac || <span className="text-muted-foreground">—</span>}</td>
                        <td className="px-3 py-2 text-xs">{d.vendor || <span className="text-muted-foreground">Unknown</span>}</td>
                        <td className="px-3 py-2 text-xs text-muted-foreground">{d.last_seen ? new Date(d.last_seen).toLocaleTimeString() : '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
}

function ipSort(a: string, b: string): number {
  const pa = a.split('.').map(n => parseInt(n, 10));
  const pb = b.split('.').map(n => parseInt(n, 10));
  for (let i = 0; i < 4; i++) {
    if ((pa[i] || 0) !== (pb[i] || 0)) return (pa[i] || 0) - (pb[i] || 0);
  }
  return 0;
}
