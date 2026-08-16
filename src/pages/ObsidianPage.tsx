import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SendToChatButton } from '@/components/SendToChatButton';
import {
  BookMarked, Download, FileText, Loader2, RefreshCw, Save, Search, Sparkles, Plus, Network,
} from 'lucide-react';
import VaultGraph from '@/components/VaultGraph';
import { toast } from 'sonner';
import {
  CLAUDE_OBSIDIAN_REPO, checkVault, listNotes, readNote, writeNote, searchVault,
  installPlugin, dailyNotePath, formatCapture, buildVaultBrief, buildResearchBrief,
  buildSummarizeBrief, type VaultNote, type VaultSearchHit, type VaultStatus,
} from '@/lib/obsidian';

const VAULT_KEY = 'obsidian-vault-path';
const PLUGIN_KEY = 'obsidian-plugin-root';
const DEFAULT_VAULT = 'C:\\Users\\Stephen Dunne\\Documents\\Vault';
const DEFAULT_PLUGIN = 'C:\\Users\\Stephen Dunne\\claude-obsidian';

export default function ObsidianPage() {
  const [vault, setVault] = useState(() => localStorage.getItem(VAULT_KEY) || DEFAULT_VAULT);
  const [pluginRoot, setPluginRoot] = useState(() => localStorage.getItem(PLUGIN_KEY) || DEFAULT_PLUGIN);
  const [status, setStatus] = useState<VaultStatus | null>(null);
  const [checking, setChecking] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [log, setLog] = useState('');

  const [notes, setNotes] = useState<VaultNote[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [filter, setFilter] = useState('');
  const [openNote, setOpenNote] = useState<VaultNote | null>(null);
  const [body, setBody] = useState('');
  const [loadingBody, setLoadingBody] = useState(false);
  const [saving, setSaving] = useState(false);

  const [query, setQuery] = useState('');
  const [hits, setHits] = useState<VaultSearchHit[]>([]);
  const [searching, setSearching] = useState(false);

  const [capture, setCapture] = useState('');
  const [captureTags, setCaptureTags] = useState('inbox');
  const [topic, setTopic] = useState('');

  useEffect(() => { localStorage.setItem(VAULT_KEY, vault); }, [vault]);
  useEffect(() => { localStorage.setItem(PLUGIN_KEY, pluginRoot); }, [pluginRoot]);

  const check = useCallback(async () => {
    setChecking(true);
    try {
      setStatus(await checkVault(vault, pluginRoot));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Agent unreachable');
    } finally {
      setChecking(false);
    }
  }, [vault, pluginRoot]);

  useEffect(() => { check(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  const refreshNotes = async () => {
    setLoadingNotes(true);
    try {
      setNotes(await listNotes(vault));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not read the vault');
    } finally {
      setLoadingNotes(false);
    }
  };

  const open = async (n: VaultNote) => {
    setOpenNote(n);
    setLoadingBody(true);
    try {
      setBody(await readNote(vault, n.path));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not read note');
    } finally {
      setLoadingBody(false);
    }
  };

  const save = async () => {
    if (!openNote) return;
    setSaving(true);
    try {
      await writeNote(vault, openNote.path, body);
      toast.success(`Saved ${openNote.name}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const newNote = async () => {
    const name = window.prompt('New note name (folders allowed, e.g. Research/Alpaca)');
    if (!name) return;
    const rel = name.endsWith('.md') ? name : `${name}.md`;
    const created = new Date().toISOString();
    const front = `---\ntitle: ${rel.split('/').pop()?.replace(/\.md$/, '')}\ncreated: ${created}\ntags: []\n---\n\n`;
    try {
      await writeNote(vault, rel, front);
      toast.success('Note created');
      await refreshNotes();
      await open({ path: rel, name: rel.replace(/\.md$/, ''), folder: '', size: front.length, modified: Date.now() / 1000 });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not create note');
    }
  };

  const runSearch = async () => {
    if (!query.trim()) return;
    setSearching(true);
    try {
      setHits(await searchVault(vault, query.trim()));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Search failed');
    } finally {
      setSearching(false);
    }
  };

  const saveCapture = async () => {
    if (!capture.trim()) return;
    const tags = captureTags.split(/[\s,]+/).filter(Boolean);
    try {
      await writeNote(vault, dailyNotePath(), formatCapture(capture.trim(), tags), true);
      toast.success('Captured to today\'s daily note');
      setCapture('');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Capture failed');
    }
  };

  const install = async () => {
    setInstalling(true);
    setLog('Cloning claude-obsidian…');
    try {
      const r = await installPlugin(pluginRoot);
      setLog(`${r.stdout}\n${r.stderr}`.trim());
      toast.success('claude-obsidian synced');
      await check();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Install failed');
    } finally {
      setInstalling(false);
    }
  };

  const filtered = useMemo(() => {
    const f = filter.toLowerCase();
    return f ? notes.filter((n) => n.path.toLowerCase().includes(f)) : notes;
  }, [notes, filter]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <div className="flex items-center gap-2">
        <BookMarked className="h-5 w-5 text-primary" />
        <h1 className="text-lg font-bold">Obsidian Vault</h1>
        {status?.exists && <Badge variant="secondary">{status.notes} notes</Badge>}
        {status?.pluginInstalled && <Badge variant="outline">claude-obsidian</Badge>}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Vault</CardTitle>
          <CardDescription className="text-xs">
            Your vault lives on the PC — the agent reads and writes it directly.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Input value={vault} onChange={(e) => setVault(e.target.value)} placeholder="Path to your Obsidian vault" className="font-mono text-xs" />
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={check} disabled={checking}>
              {checking ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <RefreshCw className="h-3.5 w-3.5 mr-1" />}
              Check vault
            </Button>
            <SendToChatButton text={buildVaultBrief(vault, 'Give me an overview of what is in this vault and what needs tidying.')} label="Ask about vault" />
          </div>
          {status && (
            <p className="text-xs text-muted-foreground">
              {status.exists
                ? `${status.notes} notes · ${status.folders} folders${status.hasObsidianConfig ? ' · .obsidian config found' : ''}`
                : 'Vault folder not found on the PC.'}
            </p>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="notes">
        <TabsList>
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="search">Search</TabsTrigger>
          <TabsTrigger value="capture">Capture</TabsTrigger>
          <TabsTrigger value="graph"><Network className="h-3.5 w-3.5 mr-1" />Graph</TabsTrigger>
          <TabsTrigger value="plugin">Plugin</TabsTrigger>
        </TabsList>

        <TabsContent value="graph" className="mt-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Network className="h-4 w-4 text-primary" /> Neural vault graph
              </CardTitle>
              <CardDescription className="text-xs">
                Every note floats as a node. Existing <code>[[wikilinks]]</code> become edges — drag, connect, and grow the web.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <VaultGraph vault={vault} notes={notes} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes" className="mt-3">
          <div className="grid gap-3 md:grid-cols-[280px_1fr]">
            <Card className="min-w-0">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-1">
                  <Input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Filter…" className="h-8 text-xs" />
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={refreshNotes} disabled={loadingNotes}>
                    {loadingNotes ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={newNote} title="New note">
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[46vh]">
                  <div className="p-2 space-y-0.5">
                    {filtered.map((n) => (
                      <button
                        key={n.path}
                        onClick={() => open(n)}
                        className={`w-full text-left px-2 py-1.5 rounded-md text-xs truncate transition-colors ${openNote?.path === n.path ? 'bg-primary/10 text-primary' : 'hover:bg-secondary/60'}`}
                      >
                        <FileText className="inline h-3 w-3 mr-1.5 opacity-70" />
                        {n.path}
                      </button>
                    ))}
                    {!filtered.length && (
                      <p className="text-xs text-muted-foreground p-2">No notes loaded — hit refresh.</p>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card className="min-w-0">
              <CardHeader className="pb-2 flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm truncate">{openNote?.path ?? 'Select a note'}</CardTitle>
                {openNote && (
                  <div className="flex gap-1">
                    <SendToChatButton text={buildSummarizeBrief(vault, openNote.path)} label="Summarize" />
                    <Button size="sm" onClick={save} disabled={saving}>
                      {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Save className="h-3.5 w-3.5 mr-1" />}
                      Save
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <Textarea
                  value={loadingBody ? 'Loading…' : body}
                  onChange={(e) => setBody(e.target.value)}
                  disabled={!openNote || loadingBody}
                  className="font-mono text-xs h-[46vh]"
                  placeholder="Note content"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="search" className="mt-3">
          <Card>
            <CardContent className="pt-4 space-y-3">
              <div className="flex gap-2">
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') runSearch(); }}
                  placeholder="Search every note…"
                />
                <Button onClick={runSearch} disabled={searching}>
                  {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                </Button>
              </div>
              <ScrollArea className="h-[50vh]">
                <div className="space-y-1 pr-2">
                  {hits.map((h, i) => (
                    <button
                      key={`${h.path}-${h.line}-${i}`}
                      onClick={() => open({ path: h.path, name: h.path, folder: '', size: 0, modified: 0 })}
                      className="w-full text-left p-2 rounded-md hover:bg-secondary/60"
                    >
                      <div className="text-[10px] text-primary font-mono truncate">{h.path}:{h.line}</div>
                      <div className="text-xs text-muted-foreground">{h.text}</div>
                    </button>
                  ))}
                  {!hits.length && <p className="text-xs text-muted-foreground p-2">No results yet.</p>}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="capture" className="mt-3 space-y-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Quick capture</CardTitle>
              <CardDescription className="text-xs">Appends to today's daily note ({dailyNotePath()}).</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Textarea value={capture} onChange={(e) => setCapture(e.target.value)} placeholder="Thought, task, link…" className="h-24" />
              <Input value={captureTags} onChange={(e) => setCaptureTags(e.target.value)} placeholder="tags (space separated)" className="text-xs" />
              <Button size="sm" onClick={saveCapture} disabled={!capture.trim()}>
                <Save className="h-3.5 w-3.5 mr-1" /> Capture
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Research into the vault</CardTitle>
              <CardDescription className="text-xs">
                The agent researches online, writes a linked permanent note, and logs it in your daily note.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Topic to research" />
              <SendToChatButton
                text={buildResearchBrief(vault, topic || 'my topic')}
                label="Research & write note"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plugin" className="mt-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" /> claude-obsidian
              </CardTitle>
              <CardDescription className="text-xs">
                Clones {CLAUDE_OBSIDIAN_REPO} on the PC. Its vault skills (wiki, capture queue, transactional
                writes) are available to the agent once cloned — point it at the vault path above.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Input value={pluginRoot} onChange={(e) => setPluginRoot(e.target.value)} className="font-mono text-xs" />
              <div className="flex flex-wrap gap-2">
                <Button size="sm" onClick={install} disabled={installing}>
                  {installing ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Download className="h-3.5 w-3.5 mr-1" />}
                  {status?.pluginInstalled ? 'Update' : 'Clone'} plugin
                </Button>
                <SendToChatButton
                  text={`Read the claude-obsidian skills at ${pluginRoot} and apply its vault conventions when working in my vault at ${vault}.\n[LIST_DIR:${pluginRoot}]`}
                  label="Load skills in chat"
                />
              </div>
              {log && <pre className="text-[10px] bg-muted/40 rounded-md p-2 max-h-48 overflow-auto whitespace-pre-wrap">{log}</pre>}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
