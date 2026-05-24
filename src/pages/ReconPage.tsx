import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { portScan, traceroute, dnsLookup, whois, geoip, type PortScanResult } from '@/lib/kali';
import { SendToChatButton } from '@/components/SendToChatButton';
import { Loader2, Radar } from 'lucide-react';
import { toast } from 'sonner';

export default function ReconPage() {
  const [target, setTarget] = useState('192.168.1.1');
  const [ports, setPorts] = useState('');
  const [scan, setScan] = useState<PortScanResult | null>(null);
  const [busy, setBusy] = useState(false);

  const [trTarget, setTrTarget] = useState('1.1.1.1');
  const [trOut, setTrOut] = useState('');

  const [dnsName, setDnsName] = useState('example.com');
  const [dnsOut, setDnsOut] = useState<string>('');

  const [whoisDomain, setWhoisDomain] = useState('example.com');
  const [whoisOut, setWhoisOut] = useState('');

  const [geoIp, setGeoIp] = useState('1.1.1.1');
  const [geoOut, setGeoOut] = useState('');

  const wrap = async (fn: () => Promise<void>) => {
    setBusy(true);
    try { await fn(); } catch (e) { toast.error(String(e instanceof Error ? e.message : e)); }
    finally { setBusy(false); }
  };

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-5xl mx-auto w-full">
      <div className="flex items-center gap-2">
        <Radar className="h-5 w-5 text-primary" />
        <h1 className="text-xl font-semibold">Network Recon</h1>
        <Badge variant="outline" className="ml-2 text-[10px]">Defensive · scan only what you own</Badge>
      </div>

      <Tabs defaultValue="ports">
        <TabsList>
          <TabsTrigger value="ports">Port Scan</TabsTrigger>
          <TabsTrigger value="trace">Traceroute</TabsTrigger>
          <TabsTrigger value="dns">DNS</TabsTrigger>
          <TabsTrigger value="whois">Whois</TabsTrigger>
          <TabsTrigger value="geo">GeoIP</TabsTrigger>
        </TabsList>

        <TabsContent value="ports">
          <Card>
            <CardHeader><CardTitle className="text-base">TCP Connect Scan</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2 flex-wrap items-center">
                <Input className="max-w-xs" placeholder="host or IP" value={target} onChange={(e) => setTarget(e.target.value)} />
                <Input className="max-w-xs" placeholder="ports (e.g. 1-1024,3389) — blank = top ~80" value={ports} onChange={(e) => setPorts(e.target.value)} />
                <Button disabled={busy} onClick={() => wrap(async () => { setScan(await portScan(target, ports || undefined)); })}>
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Scan'}
                </Button>
                <SendToChatButton text={`[RUN_CMD:nmap -sV -p ${ports || '1-1024'} ${target}]`} autorun={!!target.trim()} variant="ghost" label="" title="Run in chat" />
              </div>
              {scan && (
                <div className="space-y-2">
                  <div className="text-xs text-muted-foreground">{scan.target} → {scan.ip} · {scan.scanned} ports scanned · <span className="text-primary">{scan.open.length} open</span></div>
                  <ScrollArea className="h-72 rounded border">
                    <table className="w-full text-xs font-mono">
                      <thead className="bg-muted/40 sticky top-0">
                        <tr><th className="text-left p-2">Port</th><th className="text-left p-2">Service</th><th className="text-left p-2">Banner</th></tr>
                      </thead>
                      <tbody>
                        {scan.open.map((p) => (
                          <tr key={p.port} className="border-t border-border/40">
                            <td className="p-2 text-primary">{p.port}</td>
                            <td className="p-2">{p.service}</td>
                            <td className="p-2 truncate max-w-md text-muted-foreground">{p.banner || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </ScrollArea>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trace">
          <Card>
            <CardHeader><CardTitle className="text-base">Traceroute</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2 items-center">
                <Input className="max-w-xs" value={trTarget} onChange={(e) => setTrTarget(e.target.value)} />
                <Button disabled={busy} onClick={() => wrap(async () => { const r = await traceroute(trTarget); setTrOut(r.output); })}>
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Run'}
                </Button>
                <SendToChatButton text={`[RUN_CMD:traceroute ${trTarget}]`} autorun={!!trTarget.trim()} variant="ghost" label="" title="Run in chat" />
              </div>
              <pre className="text-xs font-mono bg-muted/30 rounded p-3 max-h-80 overflow-auto whitespace-pre-wrap">{trOut || '—'}</pre>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dns">
          <Card>
            <CardHeader><CardTitle className="text-base">DNS Lookup</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2 items-center">
                <Input className="max-w-xs" value={dnsName} onChange={(e) => setDnsName(e.target.value)} />
                <Button disabled={busy} onClick={() => wrap(async () => { const r = await dnsLookup(dnsName); setDnsOut(JSON.stringify(r.records, null, 2)); })}>
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Resolve'}
                </Button>
                <SendToChatButton text={`[RUN_CMD:dig ${dnsName} ANY]`} autorun={!!dnsName.trim()} variant="ghost" label="" title="Run in chat" />
              </div>
              <pre className="text-xs font-mono bg-muted/30 rounded p-3 max-h-80 overflow-auto">{dnsOut || '—'}</pre>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="whois">
          <Card>
            <CardHeader><CardTitle className="text-base">Whois</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2 items-center">
                <Input className="max-w-xs" value={whoisDomain} onChange={(e) => setWhoisDomain(e.target.value)} />
                <Button disabled={busy} onClick={() => wrap(async () => { const r = await whois(whoisDomain); setWhoisOut(r.output); })}>
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Lookup'}
                </Button>
                <SendToChatButton text={`[RUN_CMD:whois ${whoisDomain}]`} autorun={!!whoisDomain.trim()} variant="ghost" label="" title="Run in chat" />
              </div>
              <pre className="text-xs font-mono bg-muted/30 rounded p-3 max-h-96 overflow-auto whitespace-pre-wrap">{whoisOut || '—'}</pre>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="geo">
          <Card>
            <CardHeader><CardTitle className="text-base">GeoIP (via ipapi.co)</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2 items-center">
                <Input className="max-w-xs" value={geoIp} onChange={(e) => setGeoIp(e.target.value)} />
                <Button disabled={busy} onClick={() => wrap(async () => { const r = await geoip(geoIp); setGeoOut(JSON.stringify(r, null, 2)); })}>
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Locate'}
                </Button>
                <SendToChatButton text={`[RUN_CMD:curl https://ipapi.co/${geoIp}/json]`} autorun={!!geoIp.trim()} variant="ghost" label="" title="Run in chat" />
              </div>
              <pre className="text-xs font-mono bg-muted/30 rounded p-3 max-h-80 overflow-auto">{geoOut || '—'}</pre>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
