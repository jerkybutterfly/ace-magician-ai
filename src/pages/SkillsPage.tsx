import { useState, useEffect } from 'react';
import { listSkills, readFile, writeFile, deleteFile, executeSkill } from '@/lib/agent';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { Plus, Play, Trash2, RefreshCw, FileCode, Sparkles } from 'lucide-react';
import { getSuggestions, dismissSuggestion, markSaved, generateSkillCode, type SkillSuggestion } from '@/lib/skill-detector';

interface Skill {
  name: string;
  path: string;
}

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [newName, setNewName] = useState('');
  const [runArgs, setRunArgs] = useState('');
  const [runOutput, setRunOutput] = useState('');
  const [suggestions, setSuggestions] = useState<SkillSuggestion[]>([]);
  const [suggestionNames, setSuggestionNames] = useState<Record<string, string>>({});

  const refresh = async () => {
    setLoading(true);
    try {
      setSkills(await listSkills());
    } catch {
      toast({ title: 'Error', description: 'Failed to load skills. Is the agent running?' });
    } finally {
      setLoading(false);
    }
  };

  const refreshSuggestions = () => {
    const list = getSuggestions().filter((s) => !s.dismissed && !s.saved);
    setSuggestions(list);
    setSuggestionNames((prev) => {
      const next = { ...prev };
      for (const s of list) {
        if (!next[s.id]) next[s.id] = `${s.rawSequence[0]?.tag.toLowerCase() || 'task'}_skill`;
      }
      return next;
    });
  };

  useEffect(() => {
    refresh();
    refreshSuggestions();
  }, []);

  const loadSkill = async (skill: Skill) => {
    try {
      const content = await readFile(skill.path);
      setCode(content);
      setSelectedSkill(skill.name);
      setRunOutput('');
    } catch {
      toast({ title: 'Error', description: 'Failed to read skill file.' });
    }
  };

  const saveSkill = async () => {
    if (!selectedSkill) return;
    try {
      await writeFile(`public/skills/${selectedSkill}.py`, code);
      toast({ title: 'Saved', description: `Skill "${selectedSkill}" updated.` });
    } catch {
      toast({ title: 'Error', description: 'Failed to save skill.' });
    }
  };

  const createSkill = async () => {
    const name = newName.trim();
    if (!name) return;
    const template = `#!/usr/bin/env python3\n"""${name} skill"""\nimport sys\n\ndef main():\n    args = sys.argv[1:]\n    print(f"Running ${name} with args: {args}")\n\nif __name__ == "__main__":\n    main()\n`;
    try {
      await writeFile(`public/skills/${name}.py`, template);
      setNewName('');
      await refresh();
      setSelectedSkill(name);
      setCode(template);
      toast({ title: 'Created', description: `Skill "${name}" created.` });
    } catch {
      toast({ title: 'Error', description: 'Failed to create skill.' });
    }
  };

  const removeSkill = async (name: string) => {
    try {
      await deleteFile(`public/skills/${name}.py`);
      if (selectedSkill === name) { setSelectedSkill(null); setCode(''); }
      await refresh();
      toast({ title: 'Deleted', description: `Skill "${name}" removed.` });
    } catch {
      toast({ title: 'Error', description: 'Failed to delete skill.' });
    }
  };

  const runSkill = async () => {
    if (!selectedSkill) return;
    try {
      const result = await executeSkill(selectedSkill, runArgs);
      setRunOutput(result.stdout || result.stderr || '(no output)');
    } catch (e) {
      setRunOutput(e instanceof Error ? e.message : 'Execution failed');
    }
  };

  const acceptSuggestion = async (s: SkillSuggestion) => {
    const raw = (suggestionNames[s.id] || '').trim().replace(/[^a-zA-Z0-9_-]/g, '_');
    if (!raw) return;
    try {
      await writeFile(`public/skills/${raw}.py`, generateSkillCode(raw, s));
      markSaved(s.id);
      refreshSuggestions();
      await refresh();
      toast({ title: 'Skill saved', description: `Created public/skills/${raw}.py` });
    } catch (e) {
      toast({ title: 'Failed to save', description: e instanceof Error ? e.message : 'Unknown error' });
    }
  };

  const rejectSuggestion = (id: string) => {
    dismissSuggestion(id);
    refreshSuggestions();
  };

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-4 overflow-y-auto h-full pb-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Skills Manager</h1>
        <Button variant="ghost" size="icon" onClick={() => { refresh(); refreshSuggestions(); }}><RefreshCw className="h-4 w-4" /></Button>
      </div>

      <Tabs defaultValue="skills">
        <TabsList>
          <TabsTrigger value="skills">My Skills</TabsTrigger>
          <TabsTrigger value="suggestions" className="gap-1.5">
            <Sparkles className="h-3 w-3" /> Suggestions
            {suggestions.length > 0 && <span className="ml-1 text-[10px] bg-primary text-primary-foreground rounded-full px-1.5">{suggestions.length}</span>}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="skills" className="space-y-4 mt-4">
          <div className="flex gap-2">
            <Input placeholder="New skill name..." value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === 'Enter' && createSkill()} />
            <Button onClick={createSkill} disabled={!newName.trim()}><Plus className="h-4 w-4 mr-1" /> Create</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              {loading ? <p className="text-sm text-muted-foreground">Loading...</p> : skills.length === 0 ? <p className="text-sm text-muted-foreground">No skills yet.</p> : skills.map(s => (
                <Card key={s.name} className={`cursor-pointer transition-colors ${selectedSkill === s.name ? 'border-primary bg-primary/5' : 'hover:bg-secondary/40'}`} onClick={() => loadSkill(s)}>
                  <CardContent className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileCode className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">{s.name}</span>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={e => { e.stopPropagation(); removeSkill(s.name); }}>
                      <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="md:col-span-2 space-y-3">
              {selectedSkill ? (
                <>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{selectedSkill}.py</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Textarea value={code} onChange={e => setCode(e.target.value)} rows={16} className="font-mono text-xs" />
                      <Button onClick={saveSkill} size="sm">Save</Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Run</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex gap-2">
                        <Input placeholder="Arguments..." value={runArgs} onChange={e => setRunArgs(e.target.value)} />
                        <Button onClick={runSkill} size="sm"><Play className="h-4 w-4 mr-1" /> Run</Button>
                      </div>
                      {runOutput && <pre className="text-xs bg-muted/50 p-3 rounded-lg overflow-auto max-h-48 whitespace-pre-wrap">{runOutput}</pre>}
                    </CardContent>
                  </Card>
                </>
              ) : (
                <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
                  Select a skill or create a new one
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="suggestions" className="space-y-3 mt-4">
          {suggestions.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-sm text-muted-foreground">
                No suggestions yet. After you do the same multi-step task twice, they'll appear here.
              </CardContent>
            </Card>
          ) : (
            suggestions.map((s) => (
              <Card key={s.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Repeated sequence ({s.occurrences}×)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <pre className="text-xs bg-muted/50 rounded p-3 overflow-auto whitespace-pre-wrap">{s.template}</pre>
                  <div className="flex gap-2">
                    <Input
                      value={suggestionNames[s.id] || ''}
                      onChange={(e) => setSuggestionNames((p) => ({ ...p, [s.id]: e.target.value }))}
                      placeholder="skill name"
                      className="h-8 text-xs"
                    />
                    <Button size="sm" onClick={() => acceptSuggestion(s)}>Save as skill</Button>
                    <Button size="sm" variant="outline" onClick={() => rejectSuggestion(s.id)}>Dismiss</Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
