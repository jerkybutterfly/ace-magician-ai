import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, FlaskConical, Loader2 } from 'lucide-react';
import {
  labDirbust, labSubdomains, labLoginProbe,
  labHeaders, labSsl, labVulnProbe, labHostSweep, labBanner, labSpray, labRobots, labCors,
  labWifiTools, labWifiScan, labWifiMonitor, labWifiCapture, labWifiDeauth, labWifiCrack,
  type HeaderFinding, type VulnProbeResult, type CorsResult, type WifiNetwork,
} from '@/lib/kali';
import { toast } from 'sonner';

const ACK_KEY = 'labmode-acknowledged';

export default function LabModePage() {
  const [enabled, setEnabled] = useState(() => localStorage.getItem(ACK_KEY) === 'yes');
  const [busy, setBusy] = useState(false);
  const wrap = async (fn: () => Promise<void>) => {
    setBusy(true);
    try { await fn(); } catch (e) { toast.error(String(e instanceof Error ? e.message : e)); }
    finally { setBusy(false); }
  };

  useEffect(() => { localStorage.setItem(ACK_KEY, enabled ? 'yes' : 'no'); }, [enabled]);

  // dirbust
  const [base, setBase] = useState('http://192.168.1.10');
  const [dirRes, setDirRes] = useState<{ path: string; status: number; len: number }[]>([]);

  // subdomain
  const [domain, setDomain] = useState('example.com');
  const [subRes, setSubRes] = useState<{ host: string; ip: string }[]>([]);

  // login probe
  const [loginUrl, setLoginUrl] = useState('http://192.168.1.10/login');
  const [u, setU] = useState('admin');
  const [p, setP] = useState('admin');
  const [failText, setFailText] = useState('Invalid');
  const [loginRes, setLoginRes] = useState<{ status: number; likely_success: boolean; snippet: string } | null>(null);

  // headers
  const [hdrUrl, setHdrUrl] = useState('https://example.com');
  const [hdrRes, setHdrRes] = useState<{ status: number; headers: Record<string,string>; findings: HeaderFinding[] } | null>(null);

  // ssl
  const [sslHost, setSslHost] = useState('example.com');
  const [sslPort, setSslPort] = useState(443);
  const [sslRes, setSslRes] = useState<{ tls_version: string; cipher: [string,string,number]; cert: Record<string,unknown> } | null>(null);

  // vuln
  const [vulnUrl, setVulnUrl] = useState('http://192.168.1.10/search');
  const [vulnParam, setVulnParam] = useState('q');
  const [vulnRes, setVulnRes] = useState<VulnProbeResult[]>([]);

  // sweep
  const [cidr, setCidr] = useState('192.168.1.0/24');
  const [sweepRes, setSweepRes] = useState<{ ip: string; hostname: string }[]>([]);

  // banner
  const [bHost, setBHost] = useState('192.168.1.10');
  const [bPort, setBPort] = useState(22);
  const [bProbe, setBProbe] = useState('');
  const [bRes, setBRes] = useState<{ banner: string; bytes: number } | null>(null);

  // spray
  const [sprayUrl, setSprayUrl] = useState('http://192.168.1.10/login');
  const [sprayUsers, setSprayUsers] = useState('admin\nroot\nuser\ntest');
  const [sprayPw, setSprayPw] = useState('Password1!');
  const [sprayFail, setSprayFail] = useState('Invalid');
  const [sprayRes, setSprayRes] = useState<{ user: string; status: number; likely_success: boolean }[]>([]);

  // robots
  const [robotsBase, setRobotsBase] = useState('https://example.com');
  const [robotsRes, setRobotsRes] = useState<{ disallow: string[]; allow: string[]; sitemap_locs?: string[]; robots: string } | null>(null);

  // cors
  const [corsUrl, setCorsUrl] = useState('https://example.com/api');
  const [corsRes, setCorsRes] = useState<CorsResult[]>([]);

  // wifi (aircrack-ng)
  const [wifiTools, setWifiTools] = useState<{ platform: string; tools: Record<string, boolean>; any_aircrack: boolean; note: string } | null>(null);
  const [wifiNets, setWifiNets] = useState<WifiNetwork[]>([]);
  const [wifiIface, setWifiIface] = useState('wlan0');
  const [wifiMonOut, setWifiMonOut] = useState('');
  const [capBssid, setCapBssid] = useState('');
  const [capChannel, setCapChannel] = useState('');
  const [capSeconds, setCapSeconds] = useState(30);
  const [capPrefix, setCapPrefix] = useState('/tmp/wifi-cap');
  const [capFiles, setCapFiles] = useState<string[]>([]);
  const [deauthBssid, setDeauthBssid] = useState('');
  const [deauthClient, setDeauthClient] = useState('');
  const [deauthCount, setDeauthCount] = useState(5);
  const [deauthOut, setDeauthOut] = useState('');
  const [crackCap, setCrackCap] = useState('/tmp/wifi-cap-01.cap');
  const [crackWl, setCrackWl] = useState('/usr/share/wordlists/rockyou.txt');
  const [crackBssid, setCrackBssid] = useState('');
  const [crackOut, setCrackOut] = useState<{ key_found: string | null; output: string } | null>(null);


  return (
    <div className="p-4 md:p-6 space-y-4 max-w-5xl mx-auto w-full">
      <div className="flex items-center gap-2">
        <FlaskConical className="h-5 w-5 text-primary" />
        <h1 className="text-xl font-semibold">Lab Mode</h1>
        <Badge variant="destructive" className="ml-2">authorized targets only</Badge>
      </div>

      <Card className="border-destructive/40">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
            <div className="text-sm">
              <div className="font-medium">You are responsible for what you scan.</div>
              <div className="text-muted-foreground text-xs mt-1">
                Running these tools against systems without explicit written permission may be illegal in your jurisdiction
                (e.g. UK Computer Misuse Act 1990, US CFAA). Use only against your own lab, CTF targets, or systems you have authorization to test.
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Switch id="ack" checked={enabled} onCheckedChange={setEnabled} />
            <Label htmlFor="ack" className="text-sm">I only target systems I own or am authorized to test.</Label>
          </div>
        </CardContent>
      </Card>

      {!enabled ? (
        <div className="text-sm text-muted-foreground italic">Acknowledge above to unlock lab tools.</div>
      ) : (
        <Tabs defaultValue="dir">
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="dir">Dir Brute</TabsTrigger>
            <TabsTrigger value="sub">Subdomains</TabsTrigger>
            <TabsTrigger value="login">Login Probe</TabsTrigger>
            <TabsTrigger value="headers">HTTP Headers</TabsTrigger>
            <TabsTrigger value="ssl">TLS Cert</TabsTrigger>
            <TabsTrigger value="vuln">Vuln Probe</TabsTrigger>
            <TabsTrigger value="sweep">Host Sweep</TabsTrigger>
            <TabsTrigger value="banner">Banner Grab</TabsTrigger>
            <TabsTrigger value="spray">Pwd Spray</TabsTrigger>
            <TabsTrigger value="robots">Robots/Sitemap</TabsTrigger>
            <TabsTrigger value="cors">CORS Check</TabsTrigger>
            <TabsTrigger value="wifi">Wi-Fi (aircrack-ng)</TabsTrigger>
          </TabsList>

          <TabsContent value="dir">
            <Card><CardHeader><CardTitle className="text-base">Directory / file brute (gobuster-lite)</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Input placeholder="http://target/" value={base} onChange={(e) => setBase(e.target.value)} />
                  <Button disabled={busy} onClick={() => wrap(async () => { const r = await labDirbust(base); setDirRes(r.found); })}>
                    {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Run'}
                  </Button>
                </div>
                <ScrollArea className="h-72 rounded border">
                  <table className="w-full text-xs font-mono">
                    <thead className="bg-muted/40 sticky top-0"><tr><th className="text-left p-2">Status</th><th className="text-left p-2">Path</th><th className="text-left p-2">Bytes</th></tr></thead>
                    <tbody>
                      {dirRes.map((r) => (
                        <tr key={r.path} className="border-t border-border/40">
                          <td className="p-2 text-primary">{r.status}</td>
                          <td className="p-2">/{r.path}</td>
                          <td className="p-2 text-muted-foreground">{r.len}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sub">
            <Card><CardHeader><CardTitle className="text-base">Subdomain enumeration (DNS only)</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Input placeholder="example.com" value={domain} onChange={(e) => setDomain(e.target.value)} />
                  <Button disabled={busy} onClick={() => wrap(async () => { const r = await labSubdomains(domain); setSubRes(r.found); })}>
                    {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Enumerate'}
                  </Button>
                </div>
                <ScrollArea className="h-72 rounded border">
                  <table className="w-full text-xs font-mono">
                    <thead className="bg-muted/40 sticky top-0"><tr><th className="text-left p-2">Host</th><th className="text-left p-2">IP</th></tr></thead>
                    <tbody>
                      {subRes.map((r) => (
                        <tr key={r.host} className="border-t border-border/40">
                          <td className="p-2 text-primary">{r.host}</td>
                          <td className="p-2">{r.ip}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="login">
            <Card><CardHeader><CardTitle className="text-base">Single login probe (rate-limited 1/sec)</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <Input placeholder="http://target/login" value={loginUrl} onChange={(e) => setLoginUrl(e.target.value)} />
                <div className="flex gap-2">
                  <Input placeholder="username" value={u} onChange={(e) => setU(e.target.value)} />
                  <Input placeholder="password" type="password" value={p} onChange={(e) => setP(e.target.value)} />
                </div>
                <Input placeholder="text appearing on failure (e.g. 'Invalid')" value={failText} onChange={(e) => setFailText(e.target.value)} />
                <Button disabled={busy} onClick={() => wrap(async () => { setLoginRes(await labLoginProbe({ url: loginUrl, username: u, password: p, fail_text: failText })); })}>
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Try once'}
                </Button>
                {loginRes && (
                  <div className="space-y-2">
                    <div className="text-sm">
                      Status {loginRes.status} · {loginRes.likely_success
                        ? <Badge className="bg-primary/20 text-primary border-primary/40">likely accepted</Badge>
                        : <Badge variant="outline">rejected</Badge>}
                    </div>
                    <pre className="text-[11px] font-mono bg-muted/30 rounded p-2 max-h-48 overflow-auto whitespace-pre-wrap">{loginRes.snippet}</pre>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="headers">
            <Card><CardHeader><CardTitle className="text-base">HTTP security headers</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Input placeholder="https://target/" value={hdrUrl} onChange={(e) => setHdrUrl(e.target.value)} />
                  <Button disabled={busy} onClick={() => wrap(async () => { setHdrRes(await labHeaders(hdrUrl)); })}>
                    {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Inspect'}
                  </Button>
                </div>
                {hdrRes && (
                  <div className="space-y-2">
                    <div className="text-xs">Status <span className="text-primary">{hdrRes.status}</span></div>
                    {hdrRes.findings.map((f, i) => (
                      <div key={i} className="text-xs border-l-2 border-border pl-2">
                        <Badge variant={f.level === 'warn' ? 'destructive' : 'outline'} className="mr-2">{f.level}</Badge>
                        <span className="font-medium">{f.title}</span> — <span className="text-muted-foreground">{f.detail}</span>
                      </div>
                    ))}
                    <ScrollArea className="h-56 rounded border">
                      <pre className="text-[11px] font-mono p-2">{Object.entries(hdrRes.headers).map(([k,v]) => `${k}: ${v}`).join('\n')}</pre>
                    </ScrollArea>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ssl">
            <Card><CardHeader><CardTitle className="text-base">TLS certificate inspection</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Input placeholder="host" value={sslHost} onChange={(e) => setSslHost(e.target.value)} />
                  <Input type="number" className="w-28" value={sslPort} onChange={(e) => setSslPort(Number(e.target.value))} />
                  <Button disabled={busy} onClick={() => wrap(async () => { setSslRes(await labSsl(sslHost, sslPort)); })}>
                    {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Fetch'}
                  </Button>
                </div>
                {sslRes && (
                  <div className="text-xs space-y-1">
                    <div>TLS: <span className="text-primary">{sslRes.tls_version}</span></div>
                    <div>Cipher: <span className="font-mono">{sslRes.cipher?.[0]}</span></div>
                    <pre className="text-[11px] font-mono bg-muted/30 rounded p-2 max-h-72 overflow-auto">{JSON.stringify(sslRes.cert, null, 2)}</pre>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vuln">
            <Card><CardHeader><CardTitle className="text-base">Vulnerability fingerprint (SQLi/XSS/LFI/SSTI/redir)</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Input placeholder="http://target/path" value={vulnUrl} onChange={(e) => setVulnUrl(e.target.value)} />
                  <Input className="w-32" placeholder="param" value={vulnParam} onChange={(e) => setVulnParam(e.target.value)} />
                  <Button disabled={busy} onClick={() => wrap(async () => { const r = await labVulnProbe(vulnUrl, vulnParam); setVulnRes(r.results); })}>
                    {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Probe'}
                  </Button>
                </div>
                <ScrollArea className="h-72 rounded border">
                  <table className="w-full text-xs font-mono">
                    <thead className="bg-muted/40 sticky top-0"><tr><th className="text-left p-2">Payload</th><th className="text-left p-2">Status</th><th className="text-left p-2">Reflected</th><th className="text-left p-2">Error</th><th className="text-left p-2">Suspicious</th></tr></thead>
                    <tbody>
                      {vulnRes.map((r) => (
                        <tr key={r.payload} className={`border-t border-border/40 ${r.suspicious ? 'bg-destructive/10' : ''}`}>
                          <td className="p-2 text-primary">{r.payload}</td>
                          <td className="p-2">{r.status}</td>
                          <td className="p-2">{r.reflected ? 'yes' : '—'}</td>
                          <td className="p-2 text-muted-foreground">{r.error_signature || '—'}</td>
                          <td className="p-2">{r.suspicious ? <Badge variant="destructive">!</Badge> : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sweep">
            <Card><CardHeader><CardTitle className="text-base">LAN host sweep (ping)</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Input placeholder="192.168.1.0/24" value={cidr} onChange={(e) => setCidr(e.target.value)} />
                  <Button disabled={busy} onClick={() => wrap(async () => { const r = await labHostSweep(cidr); setSweepRes(r.alive); })}>
                    {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Sweep'}
                  </Button>
                </div>
                <ScrollArea className="h-72 rounded border">
                  <table className="w-full text-xs font-mono">
                    <thead className="bg-muted/40 sticky top-0"><tr><th className="text-left p-2">IP</th><th className="text-left p-2">Hostname</th></tr></thead>
                    <tbody>
                      {sweepRes.map((r) => (
                        <tr key={r.ip} className="border-t border-border/40">
                          <td className="p-2 text-primary">{r.ip}</td>
                          <td className="p-2">{r.hostname || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="banner">
            <Card><CardHeader><CardTitle className="text-base">Service banner grab</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Input placeholder="host" value={bHost} onChange={(e) => setBHost(e.target.value)} />
                  <Input type="number" className="w-28" placeholder="port" value={bPort} onChange={(e) => setBPort(Number(e.target.value))} />
                </div>
                <Input placeholder="optional probe (e.g. 'GET / HTTP/1.0\\r\\n\\r\\n')" value={bProbe} onChange={(e) => setBProbe(e.target.value)} />
                <Button disabled={busy} onClick={() => wrap(async () => { setBRes(await labBanner(bHost, bPort, bProbe || undefined)); })}>
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Grab'}
                </Button>
                {bRes && (
                  <pre className="text-[11px] font-mono bg-muted/30 rounded p-2 max-h-64 overflow-auto whitespace-pre-wrap">{bRes.banner || '(empty)'}</pre>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="spray">
            <Card><CardHeader><CardTitle className="text-base">Password spray (1 password × many users, rate-limited)</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <Input placeholder="http://target/login" value={sprayUrl} onChange={(e) => setSprayUrl(e.target.value)} />
                <Textarea placeholder="usernames, one per line (max 20)" value={sprayUsers} onChange={(e) => setSprayUsers(e.target.value)} rows={4} className="font-mono text-xs" />
                <div className="flex gap-2">
                  <Input placeholder="password" type="password" value={sprayPw} onChange={(e) => setSprayPw(e.target.value)} />
                  <Input placeholder="fail text (e.g. Invalid)" value={sprayFail} onChange={(e) => setSprayFail(e.target.value)} />
                </div>
                <Button disabled={busy} onClick={() => wrap(async () => {
                  const list = sprayUsers.split('\n').map(s => s.trim()).filter(Boolean);
                  const r = await labSpray({ url: sprayUrl, usernames: list, password: sprayPw, fail_text: sprayFail });
                  setSprayRes(r.results);
                  if (r.hits.length) toast.success(`${r.hits.length} likely hit(s)`);
                })}>
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Spray'}
                </Button>
                <ScrollArea className="h-56 rounded border">
                  <table className="w-full text-xs font-mono">
                    <thead className="bg-muted/40 sticky top-0"><tr><th className="text-left p-2">User</th><th className="text-left p-2">Status</th><th className="text-left p-2">Result</th></tr></thead>
                    <tbody>
                      {sprayRes.map((r) => (
                        <tr key={r.user} className={`border-t border-border/40 ${r.likely_success ? 'bg-primary/10' : ''}`}>
                          <td className="p-2 text-primary">{r.user}</td>
                          <td className="p-2">{r.status}</td>
                          <td className="p-2">{r.likely_success ? <Badge className="bg-primary/20 text-primary border-primary/40">hit</Badge> : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="robots">
            <Card><CardHeader><CardTitle className="text-base">robots.txt + sitemap recon</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Input placeholder="https://target" value={robotsBase} onChange={(e) => setRobotsBase(e.target.value)} />
                  <Button disabled={busy} onClick={() => wrap(async () => { setRobotsRes(await labRobots(robotsBase)); })}>
                    {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Fetch'}
                  </Button>
                </div>
                {robotsRes && (
                  <div className="space-y-2 text-xs">
                    <div><span className="text-muted-foreground">Disallow:</span> {robotsRes.disallow.join(', ') || '—'}</div>
                    <div><span className="text-muted-foreground">Allow:</span> {robotsRes.allow.join(', ') || '—'}</div>
                    {robotsRes.sitemap_locs && robotsRes.sitemap_locs.length > 0 && (
                      <ScrollArea className="h-40 rounded border">
                        <pre className="text-[11px] font-mono p-2">{robotsRes.sitemap_locs.join('\n')}</pre>
                      </ScrollArea>
                    )}
                    <pre className="text-[11px] font-mono bg-muted/30 rounded p-2 max-h-40 overflow-auto">{robotsRes.robots}</pre>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cors">
            <Card><CardHeader><CardTitle className="text-base">CORS misconfiguration check</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Input placeholder="https://target/api" value={corsUrl} onChange={(e) => setCorsUrl(e.target.value)} />
                  <Button disabled={busy} onClick={() => wrap(async () => { const r = await labCors(corsUrl); setCorsRes(r.results); })}>
                    {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Test'}
                  </Button>
                </div>
                <ScrollArea className="h-72 rounded border">
                  <table className="w-full text-xs font-mono">
                    <thead className="bg-muted/40 sticky top-0"><tr><th className="text-left p-2">Origin</th><th className="text-left p-2">ACAO</th><th className="text-left p-2">ACAC</th><th className="text-left p-2">Vuln</th></tr></thead>
                    <tbody>
                      {corsRes.map((r) => (
                        <tr key={r.origin} className={`border-t border-border/40 ${r.vulnerable ? 'bg-destructive/10' : ''}`}>
                          <td className="p-2 text-primary">{r.origin}</td>
                          <td className="p-2">{r.acao || '—'}</td>
                          <td className="p-2">{r.acac || '—'}</td>
                          <td className="p-2">{r.vulnerable ? <Badge variant="destructive">!</Badge> : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
