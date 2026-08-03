import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SendToChatButton } from '@/components/SendToChatButton';
import {
  Clapperboard, Download, ExternalLink, Loader2, RefreshCw, Play, FolderOpen, MonitorPlay,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  PIPELINES, STAGES, OPENMONTAGE_REPO, checkInstall, installOpenMontage, listProjects,
  openBacklot, simulateRun, buildProductionBrief, buildReferenceBrief,
  type InstallStatus, type MontageProject, type MontagePipeline,
} from '@/lib/openmontage';

const ROOT_KEY = 'openmontage-root';
const DEFAULT_ROOT = 'C:\\Users\\Stephen Dunne\\OpenMontage';

export default function MontagePage() {
  const [root, setRoot] = useState(() => localStorage.getItem(ROOT_KEY) || DEFAULT_ROOT);
  const [status, setStatus] = useState<InstallStatus | null>(null);
  const [checking, setChecking] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [projects, setProjects] = useState<MontageProject[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [log, setLog] = useState('');

  const [pipeline, setPipeline] = useState<MontagePipeline>(PIPELINES[0]);
  const [topic, setTopic] = useState('');
  const [duration, setDuration] = useState(60);
  const [style, setStyle] = useState('');
  const [refUrl, setRefUrl] = useState('');
  const [refTwist, setRefTwist] = useState('');

  useEffect(() => {
    localStorage.setItem(ROOT_KEY, root);
  }, [root]);

  const check = useCallback(async () => {
    setChecking(true);
    try {
      const s = await checkInstall(root);
      setStatus(s);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Agent unreachable');
    } finally {
      setChecking(false);
    }
  }, [root]);

  useEffect(() => {
    check();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const install = async () => {
    setInstalling(true);
    setLog('Cloning OpenMontage…');
    try {
      const r = await installOpenMontage(root);
      setLog(`${r.stdout}\n${r.stderr}`.trim());
      if (r.returncode === 0) toast.success('OpenMontage installed');
      else toast.error('Install finished with errors — check the log');
      await check();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Install failed');
    } finally {
      setInstalling(false);
    }
  };

  const refreshProjects = async () => {
    setLoadingProjects(true);
    try {
      setProjects(await listProjects(root));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not list productions');
    } finally {
      setLoadingProjects(false);
    }
  };

  const board = async (id?: string) => {
    try {
      await openBacklot(root, id);
      toast.success('Backlot board opened on the PC');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not open Backlot');
    }
  };

  const simulate = async () => {
    toast.info('Running simulated production…');
    try {
      const r = await simulateRun(root);
      setLog(`${r.stdout}\n${r.stderr}`.trim());
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Simulation failed');
    }
  };

  const brief = buildProductionBrief({ root, pipeline, topic: topic || '<topic>', duration, style });
  const refBrief = buildReferenceBrief(root, refUrl || '<video url>', refTwist);

  return (
    <div className="flex-1 min-h-0 overflow-y-auto">
      <div className="p-4 space-y-4 max-w-5xl mx-auto">
        <div className="flex flex-wrap items-center gap-2">
          <Clapperboard className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-semibold">OpenMontage</h1>
          <Badge variant="outline" className="text-[10px]">agentic video studio · local</Badge>
          <a
            href="https://github.com/calesthio/OpenMontage"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
          >
            repo <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Installation</CardTitle>
            <CardDescription>Cloned and run on your PC through the agent — nothing runs in the cloud.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <Input value={root} onChange={(e) => setRoot(e.target.value)} placeholder="Install path on the PC" />
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={check} disabled={checking}>
                  {checking ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                  Check
                </Button>
                <Button size="sm" onClick={install} disabled={installing}>
                  {installing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                  {status?.installed ? 'Update' : 'Install'}
                </Button>
              </div>
            </div>

            {status && (
              <div className="flex flex-wrap gap-2 text-xs">
                <Badge variant={status.installed ? 'default' : 'secondary'}>
                  {status.installed ? `repo @ ${status.commit}` : 'not installed'}
                </Badge>
                {status.node && <Badge variant="outline">node {status.node}</Badge>}
                {status.python && <Badge variant="outline">{status.python}</Badge>}
                <Badge variant="outline">{status.hasNodeModules ? 'deps installed' : 'deps missing'}</Badge>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <SendToChatButton
                text={`[RUN_CMD:git clone --depth 1 ${OPENMONTAGE_REPO} "${root}"]`}
                autorun
                label="Clone in chat"
              />
              <Button variant="outline" size="sm" onClick={() => board()}>
                <MonitorPlay className="h-3.5 w-3.5" /> Open Backlot library
              </Button>
              <Button variant="ghost" size="sm" onClick={simulate}>
                <Play className="h-3.5 w-3.5" /> Simulated run
              </Button>
            </div>

            {log && (
              <pre className="text-[11px] bg-muted/40 border border-border/40 rounded p-2 max-h-48 overflow-auto whitespace-pre-wrap">
                {log}
              </pre>
            )}
          </CardContent>
        </Card>

        <Tabs defaultValue="produce">
          <TabsList>
            <TabsTrigger value="produce">Produce</TabsTrigger>
            <TabsTrigger value="reference">From a video</TabsTrigger>
            <TabsTrigger value="projects">Productions</TabsTrigger>
          </TabsList>

          <TabsContent value="produce" className="space-y-4 pt-4">
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {PIPELINES.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPipeline(p)}
                  className={`text-left rounded-lg border p-3 transition-colors ${
                    pipeline.id === p.id
                      ? 'border-primary bg-primary/10'
                      : 'border-border/50 hover:border-border hover:bg-muted/40'
                  }`}
                >
                  <div className="text-sm font-medium">{p.name}</div>
                  <div className="text-[11px] text-muted-foreground mt-1 line-clamp-2">{p.produces}</div>
                </button>
              ))}
            </div>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{pipeline.name}</CardTitle>
                <CardDescription>{pipeline.bestFor}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Textarea
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="What is the video about? e.g. 'How local LLMs beat cloud APIs for privacy'"
                  rows={3}
                />
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value) || 0)}
                    placeholder="Duration (s)"
                    className="sm:w-40"
                  />
                  <Input value={style} onChange={(e) => setStyle(e.target.value)} placeholder="Style / tone (optional)" />
                </div>
                <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-muted-foreground">
                  {STAGES.map((s, i) => (
                    <span key={s} className="inline-flex items-center gap-1.5">
                      <Badge variant="outline" className="text-[10px] font-normal">{s}</Badge>
                      {i < STAGES.length - 1 && <span>→</span>}
                    </span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  <SendToChatButton
                    text={brief}
                    autorun
                    label="Start production in chat"
                    variant="default"
                    disabled={!topic.trim()}
                  />
                  <SendToChatButton text={brief} label="Send brief without running" disabled={!topic.trim()} />
                </div>
                <pre className="text-[11px] bg-muted/40 border border-border/40 rounded p-2 max-h-56 overflow-auto whitespace-pre-wrap">
                  {brief}
                </pre>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reference" className="space-y-3 pt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Start from a video you already love</CardTitle>
                <CardDescription>
                  YouTube, Short, Reel, TikTok or a local clip. The agent analyzes pacing, structure and keyframes,
                  then returns concepts and a cost estimate before producing.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input value={refUrl} onChange={(e) => setRefUrl(e.target.value)} placeholder="https://youtube.com/shorts/..." />
                <Textarea
                  value={refTwist}
                  onChange={(e) => setRefTwist(e.target.value)}
                  placeholder="…but about quantum computing"
                  rows={2}
                />
                <SendToChatButton text={refBrief} autorun label="Analyze in chat" variant="default" disabled={!refUrl.trim()} />
                <pre className="text-[11px] bg-muted/40 border border-border/40 rounded p-2 max-h-48 overflow-auto whitespace-pre-wrap">
                  {refBrief}
                </pre>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="projects" className="space-y-3 pt-4">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={refreshProjects} disabled={loadingProjects}>
                {loadingProjects ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                Refresh
              </Button>
              <span className="text-xs text-muted-foreground">{root}\projects</span>
            </div>
            {projects.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No productions yet. Start one from the Produce tab.
              </p>
            )}
            <div className="grid gap-2 sm:grid-cols-2">
              {projects.map((p) => (
                <Card key={p.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <FolderOpen className="h-3.5 w-3.5 text-muted-foreground" />
                      {p.title}
                    </CardTitle>
                    <CardDescription className="text-[11px] break-all">{p.path}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex flex-wrap gap-1.5">
                      {p.pipeline && <Badge variant="outline" className="text-[10px]">{p.pipeline}</Badge>}
                      {p.stage && <Badge className="text-[10px]">{p.stage}</Badge>}
                      {p.status && <Badge variant="secondary" className="text-[10px]">{p.status}</Badge>}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" onClick={() => board(p.id)}>
                        <MonitorPlay className="h-3.5 w-3.5" /> Board
                      </Button>
                      <SendToChatButton
                        text={`Continue the OpenMontage production "${p.id}" at ${p.path}. Read its latest checkpoint, tell me the current stage, and resume from there.\n[RUN_CMD:type "${p.path}\\checkpoint.json"]`}
                        autorun
                        label="Resume in chat"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
