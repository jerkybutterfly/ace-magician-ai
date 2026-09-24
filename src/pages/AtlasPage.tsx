import { useEffect, useState } from 'react';
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { useConversations } from '@/hooks/useConversations';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { Download, RefreshCw, Play, GitCommit, FileText, Save, Map as MapIcon, AlertTriangle } from 'lucide-react';
import { atlas, type HostOs, type AtlasSession, type AtlasCheckpoint } from '@/lib/atlas';
import { useNavigate } from 'react-router-dom';

const LS = 'atlas.cfg';

export default function AtlasPage() {
  const navigate = useNavigate();
  const { conversations, currentConvoId, createConversation, selectConversation, deleteConversation } = useConversations();
  const saved = (() => { try { return JSON.parse(localStorage.getItem(LS) || '{}'); } catch { return {}; } })();
  const [os, setOs] = useState<HostOs>(saved.os || 'windows');
  const [project, setProject] = useState<string>(saved.project || '');
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [output, setOutput] = useState('');
  const [sessions, setSessions] = useState<AtlasSession[]>([]);
  const [cps, setCps] = useState<AtlasCheckpoint[]>([]);
  const [selSession, setSelSession] = useState<string | undefined>();
  const [notes, setNotes] = useState<string[]>([]);
  const [editPath, setEditPath] = useState('');
  const [editText, setEditText] = useState('');
  const [newNote, setNewNote] = useState('');

  useEffect(() => { localStorage.setItem(LS, JSON.stringify({ os, project })); }, [os, project]);

  const refresh = async () => {
    if (!project.trim()) return;
    setBusy('Refresh');
    try {
      const [st, ss, cc, nn] = await Promise.all([
        atlas.status(os, project), atlas.sessions(os, project), atlas.checkpoints(os, project, selSession), atlas.notes(os, project),
      ]);
      setStatus(st.stdout.trim());
      setSessions(ss); setCps(cc);
      setNotes(nn.stdout.trim().split(/\r?\n/).filter(Boolean));
    } catch (e) { toast.error((e as Error).message); }
    finally { setBusy(null); }
  };
  useEffect(() => { refresh(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [selSession]);

  const run = async (label: string, fn: () => Promise<{ stdout: string; stderr: string }>) => {
    setBusy(label); setOutput('');
    try { const r = await fn(); setOutput(r.stdout + (r.stderr ? `\n${r.stderr}` : '')); toast.success(`${label} done`); }
    catch (e) { toast.error(`${label} failed: ${(e as Error).message}`); }
    finally { setBusy(null); }
  };

  const openFile = async (path: string) => {
    setEditPath(path);
    const r = await atlas.readFile(os, path).catch(() => ({ stdout: '' }));
    setEditText(r.stdout);
  };
  const saveFile = async () => {
    if (!editPath) return;
    await run('Save', () => atlas.writeFile(os, editPath, editText));
    refresh();
  };
  const kb = (name = '') => atlas.join(os, project, '.atlas', 'knowledge', name);

  return (
    <div className="flex min-h-screen w-full">
      <AppSidebar conversations={conversations} currentConvoId={currentConvoId}
        onNewChat={() => { createConversation(); navigate('/chat'); }}
        onSelectConvo={(id) => { selectConversation(id); navigate('/chat'); }}
        onDeleteConvo={deleteConversation} />
      <SidebarInset>
        <header className="h-12 border-b border-border/50 flex items-center px-4 gap-3">
          <SidebarTrigger />
          <MapIcon className="h-4 w-4 text-primary" />
          <h1 className="text-sm font-semibold tracking-tight">Atlas — Agent Control</h1>
          <Badge variant="outline" className="text-[10px] font-mono">{status.split('\n')[0] || 'no project'}</Badge>
          <Button size="sm" variant="outline" className="ml-auto" onClick={refresh} disabled={!!busy}><RefreshCw className="h-3 w-3" /></Button>
        </header>

        <main className="p-4 space-y-4 max-w-5xl mx-auto w-full">
          <Card className="p-4 space-y-3">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Setup</div>
            <p className="text-sm text-muted-foreground">
              Atlas runs Claude Code, Codex, OpenCode and other agents side by side with shared memory, and links every commit to the agent session that made it.
              Install the desktop app, open a project in it, then point this page at the same folder.
            </p>
            <div className="flex flex-wrap gap-2 items-center">
              {(['windows', 'unix'] as HostOs[]).map((o) => (
                <Button key={o} size="sm" variant={os === o ? 'default' : 'outline'} onClick={() => setOs(o)}>{o === 'windows' ? 'Windows' : 'macOS / Linux'}</Button>
              ))}
              <Button size="sm" disabled={!!busy} onClick={() => run('Install', () => atlas.install(os))}><Download className="h-3 w-3 mr-1" />Install Atlas + sqlite</Button>
              <Button size="sm" variant="outline" disabled={!!busy} onClick={() => run('Launch', () => atlas.launch(os))}><Play className="h-3 w-3 mr-1" />Open Atlas</Button>
              <a className="text-xs text-primary underline" href={atlas.releases} target="_blank" rel="noreferrer">Releases</a>
            </div>
            <div className="flex gap-2">
              <Input value={project} onChange={(e) => setProject(e.target.value)} className="h-9 font-mono text-xs"
                placeholder={os === 'windows' ? 'C:\\Users\\you\\code\\my-project' : '~/code/my-project'} />
              <Button size="sm" onClick={refresh} disabled={!!busy || !project.trim()}>Load</Button>
            </div>
          </Card>

          {output && (
            <Card className="p-0 overflow-hidden">
              <div className="px-4 py-2 border-b text-xs uppercase tracking-wider text-muted-foreground">Output</div>
              <ScrollArea className="h-48"><pre className="p-3 text-[11px] font-mono whitespace-pre-wrap">{output}</pre></ScrollArea>
            </Card>
          )}

          <Card className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Agent sessions ({sessions.length})</div>
              {selSession && <Button size="sm" variant="ghost" className="h-6 text-xs" onClick={() => setSelSession(undefined)}>Show all</Button>}
            </div>
            {sessions.length === 0 && <p className="text-sm text-muted-foreground">No sessions yet — run an agent in Atlas for this project.</p>}
            {sessions.map((s) => (
              <button key={s.id} onClick={() => setSelSession(s.id)}
                className={`w-full text-left flex items-center gap-2 text-xs border-b border-border/40 py-1.5 ${selSession === s.id ? 'text-primary' : ''}`}>
                <Badge variant="secondary" className="text-[10px]">{s.agent}</Badge>
                <span className="truncate flex-1">{s.title}</span>
                {!!s.attention && <AlertTriangle className="h-3 w-3 text-destructive" />}
                <span className="text-muted-foreground font-mono">{s.checkpoints} cp</span>
                <span className="text-muted-foreground font-mono hidden sm:inline">{s.updated_at.slice(0, 16)}</span>
              </button>
            ))}
          </Card>

          <Card className="p-4 space-y-2">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Checkpoints — commits by agents ({cps.length})</div>
            {cps.map((c) => (
              <div key={c.commit_sha + c.created_at} className="flex items-center gap-2 text-xs font-mono border-b border-border/40 py-1">
                <GitCommit className="h-3 w-3 text-primary" />
                <span>{c.commit_sha.slice(0, 7)}</span>
                <Badge variant="outline" className="text-[10px]">{c.agent}</Badge>
                <span className="truncate flex-1 font-sans">{c.title}</span>
                <span className="text-primary">+{c.insertions}</span>
                <span className="text-destructive">-{c.deletions}</span>
              </div>
            ))}
          </Card>

          <Card className="p-4 space-y-3">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Shared agent context</div>
            <p className="text-xs text-muted-foreground">Every agent in Atlas reads these notes plus AGENTS.md / CLAUDE.md — edit them here to steer all your agents at once.</p>
            <div className="flex flex-wrap gap-1">
              <Button size="sm" variant="outline" disabled={!project} onClick={() => openFile(atlas.join(os, project, 'AGENTS.md'))}><FileText className="h-3 w-3 mr-1" />AGENTS.md</Button>
              <Button size="sm" variant="outline" disabled={!project} onClick={() => openFile(atlas.join(os, project, 'CLAUDE.md'))}><FileText className="h-3 w-3 mr-1" />CLAUDE.md</Button>
              {notes.map((n) => (
                <Button key={n} size="sm" variant="ghost" onClick={() => openFile(kb(n))}>{n}</Button>
              ))}
            </div>
            <div className="flex gap-2">
              <Input value={newNote} onChange={(e) => setNewNote(e.target.value)} placeholder="new-note-name" className="h-8 text-xs font-mono" />
              <Button size="sm" disabled={!project || !newNote.trim()} onClick={() => {
                const n = newNote.trim().replace(/[^a-z0-9._-]+/gi, '-').replace(/(\.md)?$/, '.md');
                setEditPath(kb(n)); setEditText(`# ${newNote.trim()}\n\n`); setNewNote('');
              }}>New note</Button>
            </div>
            {editPath && (
              <div className="space-y-2">
                <div className="text-[11px] font-mono text-muted-foreground truncate">{editPath}</div>
                <Textarea value={editText} onChange={(e) => setEditText(e.target.value)} className="min-h-[220px] font-mono text-xs" />
                <Button size="sm" disabled={!!busy} onClick={saveFile}><Save className="h-3 w-3 mr-1" />Save</Button>
              </div>
            )}
          </Card>
        </main>
      </SidebarInset>
    </div>
  );
}
