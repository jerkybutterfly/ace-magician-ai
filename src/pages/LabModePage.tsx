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
  type HeaderFinding, type VulnProbeResult, type CorsResult,
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
        </Tabs>
      )}
    </div>
  );
}
