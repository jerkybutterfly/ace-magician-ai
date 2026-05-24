import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Play, RefreshCw, CheckCircle2, XCircle, ExternalLink, Sparkles, Infinity as InfinityIcon } from 'lucide-react';
import { toast } from 'sonner';
import {
  DRANA_TOOLS, DRANA_COMMANDS, type DranaCategory,
  checkInstalledTools, runDranaCommand, aiParseOutput,
  type ToolStatus, type DranaRunResult,
} from '@/lib/drana';
import { SendToChatButton } from '@/components/SendToChatButton';

const CATEGORIES: { id: DranaCategory; label: string; desc: string }[] = [
  { id: 'WAF', label: 'WAF Detection', desc: 'Identify firewalls protecting the target' },
  { id: 'PORTSCAN', label: 'Port Scan', desc: 'Discover open ports and services' },
  { id: 'WEBTECH', label: 'Web Technologies', desc: 'Fingerprint stack and CMS' },
  { id: 'SUBDOMAIN', label: 'Subdomains', desc: 'Enumerate subdomains' },
  { id: 'GETURL', label: 'URL Discovery', desc: 'Crawl historical URLs (wayback)' },
];

interface RunState {
  loading: boolean;
  result?: DranaRunResult;
  parsed?: unknown;
  parsing?: boolean;
  error?: string;
}

export default function DranaPage() {
  const [target, setTarget] = useState('');
  const [tab, setTab] = useState<DranaCategory>('WAF');
  const [runs, setRuns] = useState<Record<string, RunState>>({});
  const [tools, setTools] = useState<ToolStatus[]>([]);
  const [scanningTools, setScanningTools] = useState(false);

  const refreshTools = async () => {
    setScanningTools(true);
    try {
      const t = await checkInstalledTools();
      setTools(t);
    } catch (e) {
      toast.error(`Tool scan failed: ${(e as Error).message}`);
    } finally {
      setScanningTools(false);
    }
  };

  useEffect(() => {
    refreshTools().catch(() => {});
  }, []);

  const toolStatusMap = new Map(tools.map((t) => [t.tool, t]));

  const runCmd = async (key: string, cmd: string, prompt: string) => {
    if (!target.trim()) {
      toast.error('Enter a target first');
      return;
    }
    setRuns((s) => ({ ...s, [key]: { loading: true } }));
    try {
      const res = await runDranaCommand(cmd, target.trim(), 120);
      setRuns((s) => ({ ...s, [key]: { loading: false, result: res } }));
      if (prompt && res.stdout) {
        setRuns((s) => ({ ...s, [key]: { ...s[key], parsing: true } }));
        try {
          const parsed = await aiParseOutput(prompt, res.stdout);
          setRuns((s) => ({ ...s, [key]: { ...s[key], parsing: false, parsed } }));
        } catch (e) {
          setRuns((s) => ({ ...s, [key]: { ...s[key], parsing: false, error: `Parse: ${(e as Error).message}` } }));
        }
      }
    } catch (e) {
      setRuns((s) => ({ ...s, [key]: { loading: false, error: (e as Error).message } }));
      toast.error((e as Error).message);
    }
  };

  return (
    <div className="flex-1 overflow-auto p-4 md:p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/15 ring-1 ring-primary/30 flex items-center justify-center">
          <InfinityIcon className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold">Drana Recon</h1>
          <p className="text-xs text-muted-foreground">
            Bug-bounty recon assistant — categorized CLI tools with AI-parsed JSON output. Lab-mode gated; only target systems you own.
          </p>
        </div>
      </div>

      <Card className="p-3 flex items-center gap-2">
        <Input
          placeholder="target (e.g. example.com or https://example.com)"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          className="h-9 text-sm"
        />
      </Card>

      <Tabs value={tab} onValueChange={(v) => setTab(v as DranaCategory)}>
        <TabsList className="flex-wrap h-auto">
          {CATEGORIES.map((c) => (
            <TabsTrigger key={c.id} value={c.id} className="text-xs">{c.label}</TabsTrigger>
          ))}
          <TabsTrigger value="TOOLS" className="text-xs">Tool Status</TabsTrigger>
        </TabsList>

        {CATEGORIES.map((c) => {
          const cmds = DRANA_COMMANDS[c.id] || {};
          return (
            <TabsContent key={c.id} value={c.id} className="space-y-3">
              <p className="text-xs text-muted-foreground">{c.desc}</p>
              {Object.entries(cmds).map(([cid, cmd]) => {
                const key = `${c.id}-${cid}`;
                const state = runs[key];
                const tool = cmd.command.split(' ')[0];
                const installed = toolStatusMap.get(tool)?.installed;
                return (
                  <Card key={cid} className="p-3 space-y-2">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2 min-w-0">
                        <Badge variant="outline" className="text-[10px] font-mono">{tool}</Badge>
                        {installed === false && (
                          <Badge variant="destructive" className="text-[10px]">not installed</Badge>
                        )}
                        <code className="text-xs text-muted-foreground truncate">{cmd.command}</code>
                      </div>
                      <div className="flex items-center gap-1">
                        <SendToChatButton
                          text={`[RUN_CMD:${cmd.command.replace(/\{target\}/g, target.trim() || '{target}')}]`}
                          autorun={!!target.trim()}
                          variant="ghost"
                          label=""
                          title="Run this command in chat"
                        />
                        <Button
                          size="sm"
                          onClick={() => runCmd(key, cmd.command, cmd.prompt)}
                          disabled={state?.loading || installed === false}
                        >
                          {state?.loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
                          Run
                        </Button>
                      </div>
                    </div>
                    {state?.error && (
                      <div className="text-xs text-destructive">{state.error}</div>
                    )}
                    {state?.result && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                          <span>exit {state.result.returncode}</span>
                          <span>·</span>
                          <span>{state.result.duration}s</span>
                        </div>
                        {state.parsing && (
                          <div className="flex items-center gap-1.5 text-xs text-primary">
                            <Sparkles className="h-3 w-3 animate-pulse" /> AI parsing output…
                          </div>
                        )}
                        {state.parsed && (
                          <div className="rounded bg-primary/5 border border-primary/20 p-2">
                            <div className="flex items-center gap-1.5 text-[10px] text-primary mb-1">
                              <Sparkles className="h-3 w-3" /> Parsed
                            </div>
                            <pre className="text-[11px] font-mono whitespace-pre-wrap break-all">
                              {JSON.stringify(state.parsed, null, 2)}
                            </pre>
                          </div>
                        )}
                        <details>
                          <summary className="text-[10px] text-muted-foreground cursor-pointer">Raw output</summary>
                          <ScrollArea className="h-48 mt-1">
                            <pre className="text-[10px] font-mono whitespace-pre-wrap break-all">
                              {state.result.stdout || '(empty)'}
                              {state.result.stderr && `\n--- stderr ---\n${state.result.stderr}`}
                            </pre>
                          </ScrollArea>
                        </details>
                      </div>
                    )}
                  </Card>
                );
              })}
            </TabsContent>
          );
        })}

        <TabsContent value="TOOLS" className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {tools.filter((t) => t.installed).length} of {DRANA_TOOLS.length} catalog tools detected on host.
            </p>
            <Button size="sm" variant="outline" onClick={refreshTools} disabled={scanningTools}>
              <RefreshCw className={`h-3.5 w-3.5 ${scanningTools ? 'animate-spin' : ''}`} />
              Rescan
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {DRANA_TOOLS.map((t) => {
              const status = toolStatusMap.get(t.tool_name);
              const installed = status?.installed;
              return (
                <Card key={t.id} className="p-2.5 flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      {installed ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                      ) : (
                        <XCircle className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      )}
                      <span className="text-xs font-medium truncate">{t.tool_name}</span>
                    </div>
                    {status?.version && (
                      <div className="text-[10px] text-muted-foreground truncate font-mono mt-0.5">
                        {status.version}
                      </div>
                    )}
                  </div>
                  <a
                    href={t.install_link}
                    target="_blank"
                    rel="noreferrer"
                    className="text-muted-foreground hover:text-primary"
                    title="Install"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
