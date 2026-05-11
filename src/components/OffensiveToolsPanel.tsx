import { useState, type ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, PlayCircle, Crosshair, Globe, Lock, Wifi, Terminal, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  portScan, labDirbust, labSubdomains, labLoginProbe, labHeaders, labSsl,
  labVulnProbe, labHostSweep, labBanner, labSpray, labRobots, labCors,
  labKaliList, labKaliRun, type KaliToolInfo,
} from '@/lib/kali';
import { runDranaCommand } from '@/lib/drana';

interface ToolCardProps {
  title: string;
  desc: string;
  children: ReactNode;
}
const ToolCard = ({ title, desc, children }: ToolCardProps) => (
  <Card>
    <CardHeader className="pb-2">
      <CardTitle className="text-sm">{title}</CardTitle>
      <CardDescription className="text-[11px]">{desc}</CardDescription>
    </CardHeader>
    <CardContent className="space-y-2">{children}</CardContent>
  </Card>
);

const Out = ({ data }: { data: unknown }) => {
  if (data === null || data === undefined) return null;
  const text = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
  return (
    <pre className="text-[11px] font-mono bg-muted/40 rounded border border-border/40 p-2 max-h-72 overflow-auto whitespace-pre-wrap">
      {text}
    </pre>
  );
};

function useRunner<T>() {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const [out, setOut] = useState<T | string | null>(null);
  const run = async (fn: () => Promise<T>) => {
    setBusy(true);
    setOut(null);
    try {
      setOut(await fn());
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setOut(`ERROR: ${msg}`);
      toast({ title: 'Tool failed', description: msg, variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  };
  return { busy, out, run };
}

const RunBtn = ({ busy, onClick, label = 'Run' }: { busy: boolean; onClick: () => void; label?: string }) => (
  <Button size="sm" onClick={onClick} disabled={busy} className="w-full">
    {busy ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <PlayCircle className="h-4 w-4 mr-2" />}
    {label}
  </Button>
);

// ── Individual tool cards ──

function PortScanTool() {
  const [target, setTarget] = useState('');
  const [ports, setPorts] = useState('');
  const r = useRunner();
  return (
    <ToolCard title="Port Scan" desc="TCP connect scan with banner grab.">
      <Input placeholder="host or IP" value={target} onChange={(e) => setTarget(e.target.value)} className="h-8 text-xs" />
      <Input placeholder="ports (e.g. 1-1024,8080) — blank = top ~80" value={ports} onChange={(e) => setPorts(e.target.value)} className="h-8 text-xs" />
      <RunBtn busy={r.busy} onClick={() => r.run(() => portScan(target, ports || undefined))} label="Scan" />
      <Out data={r.out} />
    </ToolCard>
  );
}

function DirbustTool() {
  const [base, setBase] = useState('');
  const [extra, setExtra] = useState('');
  const r = useRunner();
  return (
    <ToolCard title="Directory Bust" desc="Brute-force common paths on a web target.">
      <Input placeholder="base URL (https://target)" value={base} onChange={(e) => setBase(e.target.value)} className="h-8 text-xs" />
      <Input placeholder="extra paths, comma-separated" value={extra} onChange={(e) => setExtra(e.target.value)} className="h-8 text-xs" />
      <RunBtn busy={r.busy} onClick={() => r.run(() => labDirbust(base, extra.split(',').map((s) => s.trim()).filter(Boolean)))} />
      <Out data={r.out} />
    </ToolCard>
  );
}

function SubdomainTool() {
  const [domain, setDomain] = useState('');
  const [words, setWords] = useState('');
  const r = useRunner();
  return (
    <ToolCard title="Subdomain Enum" desc="Resolve common subdomain candidates.">
      <Input placeholder="domain (example.com)" value={domain} onChange={(e) => setDomain(e.target.value)} className="h-8 text-xs" />
      <Input placeholder="extra wordlist, comma-separated" value={words} onChange={(e) => setWords(e.target.value)} className="h-8 text-xs" />
      <RunBtn busy={r.busy} onClick={() => r.run(() => labSubdomains(domain, words.split(',').map((s) => s.trim()).filter(Boolean)))} />
      <Out data={r.out} />
    </ToolCard>
  );
}

function HeadersTool() {
  const [u, setU] = useState('');
  const r = useRunner();
  return (
    <ToolCard title="Security Headers" desc="Audit HTTP response headers (CSP, HSTS, etc).">
      <Input placeholder="URL" value={u} onChange={(e) => setU(e.target.value)} className="h-8 text-xs" />
      <RunBtn busy={r.busy} onClick={() => r.run(() => labHeaders(u))} />
      <Out data={r.out} />
    </ToolCard>
  );
}

function SslTool() {
  const [host, setHost] = useState('');
  const [port, setPort] = useState('443');
  const r = useRunner();
  return (
    <ToolCard title="SSL / TLS Inspect" desc="Cert chain, expiry, supported versions.">
      <Input placeholder="host" value={host} onChange={(e) => setHost(e.target.value)} className="h-8 text-xs" />
      <Input placeholder="port" value={port} onChange={(e) => setPort(e.target.value)} className="h-8 text-xs" />
      <RunBtn busy={r.busy} onClick={() => r.run(() => labSsl(host, Number(port) || 443))} />
      <Out data={r.out} />
    </ToolCard>
  );
}

function CorsTool() {
  const [u, setU] = useState('');
  const r = useRunner();
  return (
    <ToolCard title="CORS Probe" desc="Test for permissive cross-origin policies.">
      <Input placeholder="URL" value={u} onChange={(e) => setU(e.target.value)} className="h-8 text-xs" />
      <RunBtn busy={r.busy} onClick={() => r.run(() => labCors(u))} />
      <Out data={r.out} />
    </ToolCard>
  );
}

function VulnProbeTool() {
  const [u, setU] = useState('');
  const [param, setParam] = useState('q');
  const r = useRunner();
  return (
    <ToolCard title="Param Vuln Probe" desc="Reflective XSS, SQLi error sigs, SSTI eval on a query parameter.">
      <Input placeholder="URL (https://target/search)" value={u} onChange={(e) => setU(e.target.value)} className="h-8 text-xs" />
      <Input placeholder="parameter name" value={param} onChange={(e) => setParam(e.target.value)} className="h-8 text-xs" />
      <RunBtn busy={r.busy} onClick={() => r.run(() => labVulnProbe(u, param || 'q'))} />
      <Out data={r.out} />
    </ToolCard>
  );
}

function RobotsTool() {
  const [u, setU] = useState('');
  const r = useRunner();
  return (
    <ToolCard title="Robots / Sitemap" desc="Pull robots.txt & sitemap entries.">
      <Input placeholder="base URL" value={u} onChange={(e) => setU(e.target.value)} className="h-8 text-xs" />
      <RunBtn busy={r.busy} onClick={() => r.run(() => labRobots(u))} />
      <Out data={r.out} />
    </ToolCard>
  );
}

function LoginProbeTool() {
  const [url, setUrl] = useState('');
  const [userField, setUserField] = useState('username');
  const [passField, setPassField] = useState('password');
  const [user, setUser] = useState('admin');
  const [pass, setPass] = useState('admin');
  const r = useRunner();
  return (
    <ToolCard title="Login Probe" desc="Single credential test against a form/JSON login endpoint.">
      <Input placeholder="login URL" value={url} onChange={(e) => setUrl(e.target.value)} className="h-8 text-xs" />
      <div className="grid grid-cols-2 gap-2">
        <Input placeholder="user field" value={userField} onChange={(e) => setUserField(e.target.value)} className="h-8 text-xs" />
        <Input placeholder="pass field" value={passField} onChange={(e) => setPassField(e.target.value)} className="h-8 text-xs" />
        <Input placeholder="username" value={user} onChange={(e) => setUser(e.target.value)} className="h-8 text-xs" />
        <Input placeholder="password" value={pass} onChange={(e) => setPass(e.target.value)} className="h-8 text-xs" />
      </div>
      <RunBtn busy={r.busy} onClick={() => r.run(() => labLoginProbe({ url, user_field: userField, pass_field: passField, username: user, password: pass }))} />
      <Out data={r.out} />
    </ToolCard>
  );
}

function SprayTool() {
  const [url, setUrl] = useState('');
  const [users, setUsers] = useState('admin,root,user');
  const [pass, setPass] = useState('Password1');
  const r = useRunner();
  return (
    <ToolCard title="Password Spray" desc="One password across many users — slow, single attempt each.">
      <Input placeholder="login URL" value={url} onChange={(e) => setUrl(e.target.value)} className="h-8 text-xs" />
      <Input placeholder="users (comma-separated)" value={users} onChange={(e) => setUsers(e.target.value)} className="h-8 text-xs" />
      <Input placeholder="password" value={pass} onChange={(e) => setPass(e.target.value)} className="h-8 text-xs" />
      <RunBtn busy={r.busy} onClick={() => r.run(() => labSpray({ url, usernames: users.split(',').map((s) => s.trim()).filter(Boolean), password: pass }))} />
      <Out data={r.out} />
    </ToolCard>
  );
}

function HostSweepTool() {
  const [cidr, setCidr] = useState('192.168.1.0/24');
  const r = useRunner();
  return (
    <ToolCard title="Host Sweep" desc="Discover live hosts in a CIDR range.">
      <Input placeholder="CIDR (e.g. 10.0.0.0/24)" value={cidr} onChange={(e) => setCidr(e.target.value)} className="h-8 text-xs" />
      <RunBtn busy={r.busy} onClick={() => r.run(() => labHostSweep(cidr))} />
      <Out data={r.out} />
    </ToolCard>
  );
}

function BannerTool() {
  const [host, setHost] = useState('');
  const [port, setPort] = useState('22');
  const [probe, setProbe] = useState('');
  const r = useRunner();
  return (
    <ToolCard title="Banner Grab" desc="Open a TCP socket and read service banner.">
      <div className="grid grid-cols-2 gap-2">
        <Input placeholder="host" value={host} onChange={(e) => setHost(e.target.value)} className="h-8 text-xs" />
        <Input placeholder="port" value={port} onChange={(e) => setPort(e.target.value)} className="h-8 text-xs" />
      </div>
      <Input placeholder="optional probe bytes" value={probe} onChange={(e) => setProbe(e.target.value)} className="h-8 text-xs" />
      <RunBtn busy={r.busy} onClick={() => r.run(() => labBanner(host, Number(port) || 22, probe || undefined))} />
      <Out data={r.out} />
    </ToolCard>
  );
}

function DranaTool() {
  const [cmd, setCmd] = useState('nmap <target>');
  const [target, setTarget] = useState('');
  const r = useRunner();
  return (
    <ToolCard title="Drana Command" desc="Run a recon command via the local agent (substitutes <target>).">
      <Input placeholder="command template" value={cmd} onChange={(e) => setCmd(e.target.value)} className="h-8 text-xs font-mono" />
      <Input placeholder="target" value={target} onChange={(e) => setTarget(e.target.value)} className="h-8 text-xs" />
      <RunBtn busy={r.busy} onClick={() => r.run(() => runDranaCommand(cmd, target, 90))} />
      <Out data={r.out} />
    </ToolCard>
  );
}

function KaliRunner() {
  const { toast } = useToast();
  const [tools, setTools] = useState<KaliToolInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [tool, setTool] = useState('');
  const [target, setTarget] = useState('');
  const r = useRunner();

  const load = async () => {
    setLoading(true);
    try {
      const data = await labKaliList();
      setTools(data.tools);
    } catch (e) {
      toast({ title: 'Failed to list tools', description: e instanceof Error ? e.message : '', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolCard title="Kali Tool Runner" desc="Discover and invoke installed Kali/offsec binaries on the agent host.">
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={load} disabled={loading} className="text-xs">
          {loading ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Search className="h-3 w-3 mr-1" />}
          List installed
        </Button>
        <Badge variant="secondary" className="text-[10px]">{tools.length} tools</Badge>
      </div>
      {tools.length > 0 && (
        <ScrollArea className="h-32 rounded border border-border/40">
          <div className="p-2 flex flex-wrap gap-1">
            {tools.filter((t) => t.installed).map((t) => (
              <button
                key={t.key}
                onClick={() => setTool(t.key)}
                className={`text-[10px] px-2 py-0.5 rounded border ${tool === t.key ? 'bg-primary/15 border-primary text-primary' : 'border-border/50 hover:bg-muted'}`}
              >
                {t.key}
              </button>
            ))}
          </div>
        </ScrollArea>
      )}
      <Input placeholder="tool key (e.g. nmap, nikto, sqlmap)" value={tool} onChange={(e) => setTool(e.target.value)} className="h-8 text-xs" />
      <Input placeholder="target / args" value={target} onChange={(e) => setTarget(e.target.value)} className="h-8 text-xs" />
      <RunBtn busy={r.busy} onClick={() => r.run(() => labKaliRun(tool, target))} />
      <Out data={r.out} />
    </ToolCard>
  );
}

// ── Main panel ──

export default function OffensiveToolsPanel() {
  return (
    <Tabs defaultValue="recon" className="w-full">
      <TabsList>
        <TabsTrigger value="recon"><Crosshair className="h-3.5 w-3.5 mr-1.5" />Recon</TabsTrigger>
        <TabsTrigger value="web"><Globe className="h-3.5 w-3.5 mr-1.5" />Web</TabsTrigger>
        <TabsTrigger value="auth"><Lock className="h-3.5 w-3.5 mr-1.5" />Auth</TabsTrigger>
        <TabsTrigger value="net"><Wifi className="h-3.5 w-3.5 mr-1.5" />Network</TabsTrigger>
        <TabsTrigger value="raw"><Terminal className="h-3.5 w-3.5 mr-1.5" />Raw</TabsTrigger>
      </TabsList>

      <TabsContent value="recon" className="grid md:grid-cols-2 gap-3 mt-3">
        <PortScanTool />
        <SubdomainTool />
        <BannerTool />
        <HostSweepTool />
      </TabsContent>

      <TabsContent value="web" className="grid md:grid-cols-2 gap-3 mt-3">
        <DirbustTool />
        <HeadersTool />
        <CorsTool />
        <VulnProbeTool />
        <RobotsTool />
        <SslTool />
      </TabsContent>

      <TabsContent value="auth" className="grid md:grid-cols-2 gap-3 mt-3">
        <LoginProbeTool />
        <SprayTool />
      </TabsContent>

      <TabsContent value="net" className="grid md:grid-cols-2 gap-3 mt-3">
        <HostSweepTool />
        <PortScanTool />
        <BannerTool />
      </TabsContent>

      <TabsContent value="raw" className="grid md:grid-cols-2 gap-3 mt-3">
        <DranaTool />
        <KaliRunner />
      </TabsContent>
    </Tabs>
  );
}
