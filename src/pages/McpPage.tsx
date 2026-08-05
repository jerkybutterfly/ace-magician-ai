import { useEffect, useState } from 'react';
import { Plus, Trash2, Play, Plug, RefreshCw, Wrench, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import {
  getServers, upsertServer, removeServer, listTools, callTool, pingServer,
  PRESETS, newId, type McpServer, type McpTool,
} from '@/lib/mcp';
import { SendToChatButton } from '@/components/SendToChatButton';

export default function McpPage() {
  const [servers, setServers] = useState<McpServer[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tools, setTools] = useState<McpTool[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<Record<string, 'ok' | 'error' | 'pending'>>({});
  const [argsJson, setArgsJson] = useState('{}');
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [result, setResult] = useState<string>('');

  const selected = servers.find((s) => s.id === selectedId) || null;

  useEffect(() => { setServers(getServers()); }, []);

  const refreshTools = async (srv: McpServer) => {
    setLoading(true);
    setStatus((s) => ({ ...s, [srv.id]: 'pending' }));
    try {
      const t = await listTools(srv);
      setTools(t);
      setStatus((s) => ({ ...s, [srv.id]: 'ok' }));
    } catch (e: any) {
      setStatus((s) => ({ ...s, [srv.id]: 'error' }));
      toast({ title: 'MCP error', description: String(e?.message || e), variant: 'destructive' });
      setTools([]);
    } finally {
      setLoading(false);
    }
  };

  const select = (id: string) => {
    setSelectedId(id);
    setTools([]);
    setActiveTool(null);
    setResult('');
    const srv = servers.find((s) => s.id === id);
    if (srv) refreshTools(srv);
  };

  const addPreset = (idx: number) => {
    const p = PRESETS[idx];
    const srv: McpServer = { ...p, id: newId(), enabled: true };
    upsertServer(srv);
    setServers(getServers());
    select(srv.id);
  };

  const addBlank = () => {
    const srv: McpServer = {
      id: newId(), name: 'New server', transport: 'stdio',
      command: 'npx', args: [], enabled: true,
    };
    upsertServer(srv);
    setServers(getServers());
    select(srv.id);
  };

  const save = (patch: Partial<McpServer>) => {
    if (!selected) return;
    const updated = { ...selected, ...patch };
    upsertServer(updated);
    setServers(getServers());
  };

  const del = (id: string) => {
    removeServer(id);
    setServers(getServers());
    if (selectedId === id) { setSelectedId(null); setTools([]); }
  };

  const ping = async (srv: McpServer) => {
    setStatus((s) => ({ ...s, [srv.id]: 'pending' }));
    const r = await pingServer(srv);
    setStatus((s) => ({ ...s, [srv.id]: r.ok ? 'ok' : 'error' }));
    toast({
      title: r.ok ? 'Server reachable' : 'Server unreachable',
      description: r.ok ? srv.name : r.error,
      variant: r.ok ? 'default' : 'destructive',
    });
  };

  const run = async () => {
    if (!selected || !activeTool) return;
    let args: any = {};
    try { args = JSON.parse(argsJson || '{}'); }
    catch { toast({ title: 'Invalid JSON', variant: 'destructive' }); return; }
    setLoading(true);
    setResult('');
    try {
      const r = await callTool(selected, activeTool, args);
      const text = (r.content || []).map((c) => c.text ?? JSON.stringify(c)).join('\n');
      setResult(text || JSON.stringify(r, null, 2));
      if (r.isError) toast({ title: 'Tool returned error', variant: 'destructive' });
    } catch (e: any) {
      setResult(String(e?.message || e));
      toast({ title: 'Call failed', description: String(e?.message || e), variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-auto p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2"><Plug className="h-5 w-5" /> MCP Servers</h1>
          <p className="text-xs text-muted-foreground">Model Context Protocol — plug external tool servers into the agent.</p>
        </div>
        <Button size="sm" onClick={addBlank}><Plus className="h-4 w-4 mr-1" /> Blank server</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* left: list + presets */}
        <div className="space-y-3">
          <Card className="p-3">
            <div className="text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-wide">Servers</div>
            {servers.length === 0 && <div className="text-xs text-muted-foreground">No servers yet.</div>}
            <div className="space-y-1">
              {servers.map((s) => {
                const st = status[s.id];
                return (
                  <div key={s.id}
                       className={`flex items-center justify-between gap-2 rounded-md px-2 py-1.5 cursor-pointer text-sm ${selectedId === s.id ? 'bg-primary/10 text-primary' : 'hover:bg-secondary/60'}`}
                       onClick={() => select(s.id)}>
                    <div className="flex items-center gap-2 min-w-0">
                      {st === 'ok' && <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />}
                      {st === 'error' && <XCircle className="h-3.5 w-3.5 text-red-500 shrink-0" />}
                      {(st === 'pending' || !st) && <span className="h-3.5 w-3.5 shrink-0" />}
                      <span className="truncate">{s.name}</span>
                      <Badge variant="outline" className="text-[10px] px-1 py-0">{s.transport}</Badge>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); del(s.id); }} className="opacity-60 hover:opacity-100">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="p-3">
            <div className="text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-wide">Presets</div>
            <div className="space-y-1">
              {PRESETS.map((p, i) => (
                <Button key={p.name} variant="ghost" size="sm" className="w-full justify-start text-xs" onClick={() => addPreset(i)}>
                  <Plus className="h-3.5 w-3.5 mr-1" /> {p.name}
                </Button>
              ))}
            </div>
          </Card>
        </div>

        {/* middle: config */}
        <Card className="p-3 space-y-3">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Configuration</div>
          {!selected && <div className="text-xs text-muted-foreground">Select a server.</div>}
          {selected && (
            <>
              <div>
                <Label className="text-xs">Name</Label>
                <Input value={selected.name} onChange={(e) => save({ name: e.target.value })} />
              </div>
              <div>
                <Label className="text-xs">Transport</Label>
                <Select value={selected.transport} onValueChange={(v: any) => save({ transport: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stdio">stdio (local process)</SelectItem>
                    <SelectItem value="http">HTTP (streamable)</SelectItem>
                    <SelectItem value="sse">SSE</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {selected.transport === 'stdio' ? (
                <>
                  <div>
                    <Label className="text-xs">Command</Label>
                    <Input value={selected.command || ''} onChange={(e) => save({ command: e.target.value })} placeholder="npx" />
                  </div>
                  <div>
                    <Label className="text-xs">Args (one per line)</Label>
                    <Textarea rows={4} value={(selected.args || []).join('\n')}
                              onChange={(e) => save({ args: e.target.value.split('\n').filter(Boolean) })} />
                  </div>
                  <div>
                    <Label className="text-xs">Env (KEY=value per line)</Label>
                    <Textarea rows={3}
                              value={Object.entries(selected.env || {}).map(([k, v]) => `${k}=${v}`).join('\n')}
                              onChange={(e) => {
                                const env: Record<string, string> = {};
                                e.target.value.split('\n').forEach((line) => {
                                  const i = line.indexOf('='); if (i > 0) env[line.slice(0, i).trim()] = line.slice(i + 1);
                                });
                                save({ env });
                              }} />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <Label className="text-xs">URL</Label>
                    <Input value={selected.url || ''} onChange={(e) => save({ url: e.target.value })} placeholder="http://localhost:3333/mcp" />
                  </div>
                  <div>
                    <Label className="text-xs">Headers (KEY: value per line)</Label>
                    <Textarea rows={3}
                              value={Object.entries(selected.headers || {}).map(([k, v]) => `${k}: ${v}`).join('\n')}
                              onChange={(e) => {
                                const h: Record<string, string> = {};
                                e.target.value.split('\n').forEach((line) => {
                                  const i = line.indexOf(':'); if (i > 0) h[line.slice(0, i).trim()] = line.slice(i + 1).trim();
                                });
                                save({ headers: h });
                              }} />
                  </div>
                </>
              )}
              <div className="flex gap-2 pt-1">
                <Button size="sm" variant="secondary" onClick={() => ping(selected)}><Plug className="h-3.5 w-3.5 mr-1" /> Ping</Button>
                <Button size="sm" onClick={() => refreshTools(selected)} disabled={loading}>
                  <RefreshCw className={`h-3.5 w-3.5 mr-1 ${loading ? 'animate-spin' : ''}`} /> Load tools
                </Button>
              </div>
            </>
          )}
        </Card>

        {/* right: tools + run */}
        <Card className="p-3 space-y-3">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
            <Wrench className="h-3.5 w-3.5" /> Tools {tools.length > 0 && <Badge variant="outline">{tools.length}</Badge>}
          </div>
          {tools.length === 0 && <div className="text-xs text-muted-foreground">Load a server to list its tools.</div>}
          <div className="space-y-1 max-h-64 overflow-auto">
            {tools.map((t) => (
              <div key={t.name}
                   className={`p-2 rounded-md cursor-pointer text-sm ${activeTool === t.name ? 'bg-primary/10 text-primary' : 'hover:bg-secondary/60'}`}
                   onClick={() => { setActiveTool(t.name); setArgsJson('{}'); setResult(''); }}>
                <div className="font-mono text-xs">{t.name}</div>
                {t.description && <div className="text-[11px] text-muted-foreground line-clamp-2">{t.description}</div>}
              </div>
            ))}
          </div>
          {activeTool && (
            <div className="space-y-2 border-t border-border/50 pt-2">
              <Label className="text-xs">Arguments (JSON)</Label>
              <Textarea rows={4} className="font-mono text-xs" value={argsJson} onChange={(e) => setArgsJson(e.target.value)} />
              <div className="flex gap-2">
                <Button size="sm" onClick={run} disabled={loading}><Play className="h-3.5 w-3.5 mr-1" /> Call</Button>
                {selected && (
                  <SendToChatButton
                    label="Ask chat"
                    text={`Call the MCP tool "${activeTool}" on server "${selected.name}" with args ${argsJson}. Analyse the result.`}
                  />
                )}
              </div>
              {result && (
                <pre className="text-[11px] font-mono bg-muted/40 p-2 rounded max-h-72 overflow-auto whitespace-pre-wrap">{result}</pre>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
