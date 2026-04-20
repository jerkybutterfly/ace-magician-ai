import { useState, useEffect, useCallback } from 'react';
import { executeSkill } from '@/lib/agent';
import { streamChat } from '@/lib/ollama';
import { getSettings } from '@/lib/settings';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { FileCode2, RefreshCw, Plus, CheckCircle2, XCircle, Sparkles, Save, Loader2, Download } from 'lucide-react';

interface EnvCheck {
  python?: string;
  uv?: string | null;
  git?: string | null;
  spec_kit?: string | null;
}

interface Project {
  name: string;
  path: string;
  spec_files: string[];
}

const SPEC_FILES = ['spec.md', 'plan.md', 'tasks.md'] as const;
type SpecFile = typeof SPEC_FILES[number];

function b64encode(s: string): string {
  // UTF-8 safe base64
  return btoa(unescape(encodeURIComponent(s)));
}

async function runSkill(args: string): Promise<string> {
  const res = await executeSkill('spec_kit', args);
  if (res.returncode !== 0) {
    throw new Error(res.stderr || res.stdout || `Exit ${res.returncode}`);
  }
  return res.stdout;
}

export default function SpecKitPage() {
  const [env, setEnv] = useState<EnvCheck | null>(null);
  const [checking, setChecking] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [root, setRoot] = useState('');
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [selected, setSelected] = useState<Project | null>(null);
  const [activeTab, setActiveTab] = useState<SpecFile>('spec.md');
  const [content, setContent] = useState<Record<SpecFile, string>>({ 'spec.md': '', 'plan.md': '', 'tasks.md': '' });
  const [generating, setGenerating] = useState(false);

  const checkEnv = useCallback(async () => {
    setChecking(true);
    try {
      const out = await runSkill('check');
      setEnv(JSON.parse(out));
    } catch (e) {
      toast({ title: 'Check failed', description: e instanceof Error ? e.message : 'Unknown error' });
    } finally {
      setChecking(false);
    }
  }, []);

  const installUv = async () => {
    setInstalling(true);
    try {
      const out = await runSkill('install-uv');
      toast({ title: 'uv installed', description: out.split('\n').slice(-2).join(' ') });
      await checkEnv();
    } catch (e) {
      toast({ title: 'Install failed', description: e instanceof Error ? e.message : 'Unknown error' });
    } finally {
      setInstalling(false);
    }
  };

  const refreshProjects = useCallback(async () => {
    try {
      const out = await runSkill('list');
      const data = JSON.parse(out);
      setRoot(data.root);
      setProjects(data.projects || []);
    } catch (e) {
      toast({ title: 'List failed', description: e instanceof Error ? e.message : 'Unknown error' });
    }
  }, []);

  useEffect(() => {
    checkEnv();
    refreshProjects();
  }, [checkEnv, refreshProjects]);

  const createProject = async () => {
    const name = newName.trim();
    if (!name) return;
    setCreating(true);
    try {
      const out = await runSkill(`init ${name}`);
      toast({ title: 'Project created', description: out.split('\n').slice(-1)[0] });
      setNewName('');
      await refreshProjects();
    } catch (e) {
      toast({ title: 'Create failed', description: e instanceof Error ? e.message : 'Unknown error' });
    } finally {
      setCreating(false);
    }
  };

  const selectProject = async (p: Project) => {
    setSelected(p);
    const next: Record<SpecFile, string> = { 'spec.md': '', 'plan.md': '', 'tasks.md': '' };
    for (const f of SPEC_FILES) {
      try {
        next[f] = await runSkill(`read "${p.path}" ${f}`);
      } catch {
        next[f] = `# ${f}\n\n_(empty — fill this in then click Save)_\n`;
      }
    }
    setContent(next);
  };

  const saveActive = async () => {
    if (!selected) return;
    try {
      const body = b64encode(content[activeTab]);
      await runSkill(`write "${selected.path}" ${activeTab} ${body}`);
      toast({ title: 'Saved', description: `${activeTab} written` });
    } catch (e) {
      toast({ title: 'Save failed', description: e instanceof Error ? e.message : 'Unknown error' });
    }
  };

  const generateActive = async () => {
    if (!selected) return;
    const settings = getSettings();
    const model = settings.defaultModel;
    if (!model) {
      toast({ title: 'No model selected', description: 'Pick a default model in Settings first.' });
      return;
    }

    const guides: Record<SpecFile, string> = {
      'spec.md': 'Write a thorough product specification: problem statement, goals, non-goals, user stories, functional & non-functional requirements, edge cases, and success criteria. Output ONLY the markdown for spec.md.',
      'plan.md': 'Given the spec.md below, write a technical implementation plan: architecture, data model, key modules, dependencies, milestones, and risks. Output ONLY the markdown for plan.md.',
      'tasks.md': 'Given the spec.md and plan.md below, break the work into a numbered, actionable task list. Each task: title, acceptance criteria, dependencies. Output ONLY the markdown for tasks.md.',
    };

    const ctx = [
      content['spec.md'] && `--- spec.md ---\n${content['spec.md']}`,
      activeTab !== 'spec.md' && content['plan.md'] && `--- plan.md ---\n${content['plan.md']}`,
      activeTab === 'tasks.md' && content['tasks.md'] && `--- current tasks.md ---\n${content['tasks.md']}`,
    ].filter(Boolean).join('\n\n');

    const prompt = `You are filling in the ${activeTab} for a Spec-Driven Development project named "${selected.name}".\n\n${guides[activeTab]}\n\n${ctx}`;

    setGenerating(true);
    setContent(c => ({ ...c, [activeTab]: '' }));
    try {
      const messages = [{ role: 'user' as const, content: prompt }];
      for await (const chunk of streamChat(model, messages)) {
        if (chunk.content) {
          setContent(c => ({ ...c, [activeTab]: c[activeTab] + chunk.content }));
        }
      }
      toast({ title: 'Generated', description: `${activeTab} drafted by ${model}. Review then Save.` });
    } catch (e) {
      toast({ title: 'Generation failed', description: e instanceof Error ? e.message : 'Unknown error' });
    } finally {
      setGenerating(false);
    }
  };

  const StatusRow = ({ label, value }: { label: string; value: string | null | undefined }) => {
    const ok = value && !value.startsWith('error') && !value.startsWith('uv missing') && value !== 'found but not working';
    return (
      <div className="flex items-center justify-between text-xs py-1">
        <span className="text-muted-foreground">{label}</span>
        <div className="flex items-center gap-1.5">
          {ok ? <CheckCircle2 className="h-3.5 w-3.5 text-primary" /> : <XCircle className="h-3.5 w-3.5 text-destructive" />}
          <span className="font-mono">{value ?? 'missing'}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-4 overflow-y-auto h-full pb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileCode2 className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-semibold">Spec Kit</h1>
          <Badge variant="outline" className="text-[10px]">Spec-Driven Development</Badge>
        </div>
      </div>

      {/* Environment */}
      <Card>
        <CardHeader className="pb-2 flex-row items-center justify-between">
          <CardTitle className="text-sm">Environment</CardTitle>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={checkEnv} disabled={checking}>
            <RefreshCw className={`h-3.5 w-3.5 ${checking ? 'animate-spin' : ''}`} />
          </Button>
        </CardHeader>
        <CardContent className="space-y-1">
          {env ? (
            <>
              <StatusRow label="Python" value={env.python} />
              <StatusRow label="Git" value={env.git} />
              <StatusRow label="uv" value={env.uv} />
              <StatusRow label="spec-kit (uvx)" value={env.spec_kit} />
              {!env.uv && (
                <Button size="sm" className="mt-2" onClick={installUv} disabled={installing}>
                  {installing ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <Download className="h-3.5 w-3.5 mr-1.5" />}
                  Install uv
                </Button>
              )}
            </>
          ) : (
            <p className="text-xs text-muted-foreground">Click refresh to check…</p>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Projects */}
        <Card className="md:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Projects</CardTitle>
            {root && <p className="text-[10px] text-muted-foreground font-mono truncate">{root}</p>}
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex gap-2">
              <Input placeholder="my-app" value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === 'Enter' && createProject()} className="text-xs h-8" />
              <Button size="sm" onClick={createProject} disabled={creating || !newName.trim()}>
                {creating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
              </Button>
            </div>
            {projects.length === 0 ? (
              <p className="text-xs text-muted-foreground py-2">No projects yet.</p>
            ) : (
              projects.map(p => (
                <button
                  key={p.path}
                  onClick={() => selectProject(p)}
                  className={`w-full text-left p-2 rounded-md border transition-colors ${selected?.path === p.path ? 'border-primary bg-primary/5' : 'border-border hover:bg-secondary/40'}`}
                >
                  <div className="text-xs font-medium truncate">{p.name}</div>
                  <div className="text-[10px] text-muted-foreground">{p.spec_files.length} spec file(s)</div>
                </button>
              ))
            )}
          </CardContent>
        </Card>

        {/* Editor */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{selected ? selected.name : 'Spec Editor'}</CardTitle>
          </CardHeader>
          <CardContent>
            {!selected ? (
              <p className="text-xs text-muted-foreground">Select or create a project to edit its spec.</p>
            ) : (
              <Tabs value={activeTab} onValueChange={v => setActiveTab(v as SpecFile)}>
                <TabsList className="grid grid-cols-3 w-full">
                  {SPEC_FILES.map(f => <TabsTrigger key={f} value={f} className="text-xs">{f}</TabsTrigger>)}
                </TabsList>
                {SPEC_FILES.map(f => (
                  <TabsContent key={f} value={f} className="space-y-2 mt-3">
                    <Textarea
                      value={content[f]}
                      onChange={e => setContent(c => ({ ...c, [f]: e.target.value }))}
                      rows={18}
                      className="font-mono text-xs"
                      placeholder={`# ${f}\n\nWrite or generate…`}
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={saveActive}>
                        <Save className="h-3.5 w-3.5 mr-1.5" /> Save
                      </Button>
                      <Button size="sm" variant="secondary" onClick={generateActive} disabled={generating}>
                        {generating ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <Sparkles className="h-3.5 w-3.5 mr-1.5" />}
                        Generate with local LLM
                      </Button>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
