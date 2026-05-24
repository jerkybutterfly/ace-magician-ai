import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Workflow, Play, Power, PowerOff, Trash2, RefreshCw, Settings as SettingsIcon,
  CheckCircle2, XCircle, ExternalLink, Webhook, Clock,
} from 'lucide-react';
import {
  getN8nConfig, saveN8nConfig, listWorkflows, listExecutions,
  activateWorkflow, deactivateWorkflow, deleteWorkflow, pingN8n, triggerWebhook,
  type N8nWorkflow, type N8nExecution,
} from '@/lib/n8n';

export default function N8nPage() {
  const { toast } = useToast();
  const [cfg, setCfg] = useState(getN8nConfig());
  const [showSettings, setShowSettings] = useState(!getN8nConfig().apiKey);
  const [connected, setConnected] = useState<boolean | null>(null);
  const [workflows, setWorkflows] = useState<N8nWorkflow[]>([]);
  const [executions, setExecutions] = useState<N8nExecution[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookPayload, setWebhookPayload] = useState('{\n  "hello": "world"\n}');

  const refresh = async () => {
    setLoading(true);
    try {
      await pingN8n();
      setConnected(true);
      const [wf, ex] = await Promise.all([listWorkflows(), listExecutions()]);
      setWorkflows(wf);
      setExecutions(ex);
    } catch (e: any) {
      setConnected(false);
      toast({ title: 'n8n unreachable', description: e.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (cfg.apiKey) refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSaveCfg = async () => {
    saveN8nConfig(cfg);
    setShowSettings(false);
    toast({ title: 'Saved', description: 'Testing connection…' });
    await refresh();
  };

  const handleToggle = async (wf: N8nWorkflow) => {
    try {
      if (wf.active) await deactivateWorkflow(wf.id);
      else await activateWorkflow(wf.id);
      toast({ title: wf.active ? 'Deactivated' : 'Activated', description: wf.name });
      refresh();
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  };

  const handleDelete = async (wf: N8nWorkflow) => {
    if (!confirm(`Delete workflow "${wf.name}"?`)) return;
    try {
      await deleteWorkflow(wf.id);
      toast({ title: 'Deleted', description: wf.name });
      refresh();
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  };

  const handleOpenInN8n = (wf: N8nWorkflow) => {
    window.open(`${cfg.baseUrl.replace(/\/$/, '')}/workflow/${wf.id}`, '_blank');
  };

  const handleFireWebhook = async () => {
    if (!webhookUrl) {
      toast({ title: 'Webhook URL required', variant: 'destructive' });
      return;
    }
    try {
      const payload = JSON.parse(webhookPayload);
      const res = await triggerWebhook(webhookUrl, payload);
      toast({ title: 'Webhook fired', description: typeof res === 'string' ? res.slice(0, 80) : 'OK' });
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  };

  const filteredExec = selected ? executions.filter(e => e.workflowId === selected) : executions;

  return (
    <div className="flex-1 flex flex-col p-6 overflow-y-auto">
      <div className="mb-6 border-b border-border/50 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary flex items-center gap-3">
            <Workflow className="w-8 h-8" /> n8n Control
          </h1>
          <p className="text-muted-foreground mt-2 flex items-center gap-2">
            {connected === true && <Badge variant="outline" className="border-green-500/40 text-green-500"><CheckCircle2 className="w-3 h-3 mr-1" />Connected</Badge>}
            {connected === false && <Badge variant="outline" className="border-destructive/40 text-destructive"><XCircle className="w-3 h-3 mr-1" />Offline</Badge>}
            <span className="text-xs font-mono">{cfg.baseUrl}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={refresh} disabled={loading}>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowSettings(s => !s)}>
            <SettingsIcon className="w-4 h-4" /> Settings
          </Button>
        </div>
      </div>

      {showSettings && (
        <div className="mb-6 p-6 border border-primary/30 bg-primary/5 rounded-xl space-y-3">
          <h2 className="font-bold flex items-center gap-2"><SettingsIcon className="w-4 h-4" /> n8n Connection</h2>
          <div>
            <label className="block text-sm mb-1">Base URL</label>
            <Input value={cfg.baseUrl} onChange={e => setCfg({ ...cfg, baseUrl: e.target.value })} placeholder="http://localhost:5678" className="font-mono bg-background" />
          </div>
          <div>
            <label className="block text-sm mb-1">API Key</label>
            <Input type="password" value={cfg.apiKey} onChange={e => setCfg({ ...cfg, apiKey: e.target.value })} placeholder="n8n_api_..." className="font-mono bg-background" />
            <p className="text-xs text-muted-foreground mt-1">
              Get it in n8n → Settings → API. Requires n8n ≥ 1.0. CORS must allow this origin —
              start n8n with <code className="text-primary">N8N_CORS_ALLOW_ORIGIN={window.location.origin}</code>.
            </p>
          </div>
          <Button onClick={handleSaveCfg} className="w-full">Save & Test</Button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Workflows */}
        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Workflow className="w-5 h-5 text-primary" /> Workflows ({workflows.length})
          </h2>
          {workflows.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground border border-dashed border-border/50 rounded-xl">
              {connected ? 'No workflows yet. Create one in n8n.' : 'Connect to n8n to load workflows.'}
            </div>
          ) : (
            workflows.map(wf => (
              <div
                key={wf.id}
                onClick={() => setSelected(wf.id === selected ? null : wf.id)}
                className={`p-4 border rounded-xl bg-card hover:border-primary/40 transition-colors cursor-pointer ${selected === wf.id ? 'border-primary' : 'border-border/50'}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold truncate">{wf.name}</span>
                      {wf.active ? (
                        <Badge variant="outline" className="border-green-500/40 text-green-500 text-[10px]">ACTIVE</Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px]">paused</Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground font-mono">
                      ID {wf.id} · updated {new Date(wf.updatedAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                    <Button size="icon" variant="ghost" title={wf.active ? 'Deactivate' : 'Activate'} onClick={() => handleToggle(wf)}>
                      {wf.active ? <PowerOff className="w-4 h-4 text-amber-500" /> : <Power className="w-4 h-4 text-green-500" />}
                    </Button>
                    <Button size="icon" variant="ghost" title="Open in n8n" onClick={() => handleOpenInN8n(wf)}>
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" title="Delete" onClick={() => handleDelete(wf)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}

          {/* Webhook Trigger */}
          <div className="p-6 border border-border/50 rounded-xl bg-card mt-6">
            <h3 className="font-bold mb-3 flex items-center gap-2"><Webhook className="w-4 h-4 text-primary" /> Trigger Webhook</h3>
            <Input
              placeholder="https://localhost:5678/webhook/abc-123"
              value={webhookUrl}
              onChange={e => setWebhookUrl(e.target.value)}
              className="font-mono bg-background mb-2"
            />
            <textarea
              value={webhookPayload}
              onChange={e => setWebhookPayload(e.target.value)}
              className="w-full h-24 p-2 rounded-md border border-input bg-background font-mono text-xs"
            />
            <Button onClick={handleFireWebhook} className="w-full mt-2">
              <Play className="w-4 h-4" /> Fire
            </Button>
          </div>
        </div>

        {/* Executions */}
        <div className="space-y-3">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" /> Recent Executions
            {selected && <Badge variant="outline" className="text-[10px]">filtered</Badge>}
          </h2>
          {filteredExec.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground text-sm border border-dashed border-border/50 rounded-xl">
              No executions.
            </div>
          ) : (
            filteredExec.slice(0, 30).map(ex => {
              const wf = workflows.find(w => w.id === ex.workflowId);
              const ok = ex.finished && ex.status !== 'error';
              return (
                <div key={ex.id} className="p-3 border border-border/50 rounded-lg bg-card text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold truncate">{wf?.name || ex.workflowId}</span>
                    {ok ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                    ) : ex.status === 'error' ? (
                      <XCircle className="w-3.5 h-3.5 text-destructive" />
                    ) : (
                      <Clock className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                    )}
                  </div>
                  <div className="text-muted-foreground font-mono">
                    {ex.mode} · {new Date(ex.startedAt).toLocaleTimeString()}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
