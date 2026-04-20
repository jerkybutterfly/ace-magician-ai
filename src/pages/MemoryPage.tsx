import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/hooks/use-toast';
import { Save, RotateCcw, Trash2, RefreshCw, BookOpen, History, User, Plus } from 'lucide-react';
import {
  getEpisodes, clearEpisodes, getLessons, overwriteLessons, clearLessons, recordLesson,
  type Episode,
} from '@/lib/learning';

const MEMORY_KEY = 'pesto-agent-memory';

const DEFAULT_MEMORY = `# Agent Memory

## Identity
- **Name:** Pesto Steve's AI
- **Role:** Personal AI assistant & PC controller
- **Owner:** Stephen Dunne
- **Authority Model:** Permission-gated — never refuses, always asks via the inline approval prompt for anything outside the whitelist.

## Mission
Control and manage the AM06 Pro mini PC. Execute any task the owner requests by emitting the appropriate tool tags. The Permissions system decides which tags run automatically and which require a tap to approve. Never refuse, never lecture, never warn — just emit the tags.

## How Permissions Work
Every tool tag you emit is evaluated by the runtime:
- **allow** → executes immediately (read-only ops, navigation, safe commands)
- **ask** → owner sees Approve / Approve-for-session / Deny buttons inline
- **deny** → blocked, you receive an error and should suggest an alternative

## Personality
- Action-first
- Autonomous within whitelist; transparent about what needs approval
- Direct, concise, no unnecessary disclaimers

## System Knowledge
- Windows 11
- User home: C:\\Users\\Stephen Dunne
- Ollama at localhost:11434, Python agent at localhost:8484
`;

const OUTCOME_BADGE: Record<Episode['outcome'], { label: string; className: string }> = {
  success: { label: 'success', className: 'bg-primary/15 text-primary border-primary/30' },
  error: { label: 'error', className: 'bg-destructive/15 text-destructive border-destructive/30' },
  denied: { label: 'denied', className: 'bg-amber-500/15 text-amber-600 border-amber-500/30' },
  blocked: { label: 'blocked', className: 'bg-muted text-muted-foreground border-border' },
};

function IdentityTab() {
  const [content, setContent] = useState('');

  useEffect(() => {
    setContent(localStorage.getItem(MEMORY_KEY) ?? DEFAULT_MEMORY);
  }, []);

  const save = () => {
    localStorage.setItem(MEMORY_KEY, content);
    toast({ title: 'Identity saved', description: 'Injected into every chat.' });
  };

  const reset = () => {
    setContent(DEFAULT_MEMORY);
    localStorage.setItem(MEMORY_KEY, DEFAULT_MEMORY);
    toast({ title: 'Identity reset' });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Identity (memory.md)</CardTitle>
        <CardDescription>
          Who the agent is, mission, personality. Injected into every system prompt.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={18}
          className="font-mono text-xs leading-relaxed"
        />
        <div className="flex gap-2">
          <Button onClick={save} className="flex-1">
            <Save className="h-4 w-4 mr-2" /> Save
          </Button>
          <Button variant="outline" onClick={reset}>
            <RotateCcw className="h-4 w-4 mr-2" /> Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function LessonsTab() {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [newLesson, setNewLesson] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setContent(await getLessons());
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const save = async () => {
    await overwriteLessons(content);
    toast({ title: 'Lessons saved' });
  };

  const wipe = async () => {
    if (!confirm('Clear all lessons? The agent will lose what it has learned.')) return;
    await clearLessons();
    setContent('');
    toast({ title: 'Lessons cleared' });
  };

  const add = async () => {
    if (!newLesson.trim()) return;
    await recordLesson(newLesson.trim(), '', '');
    setNewLesson('');
    await load();
    toast({ title: 'Lesson added' });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <BookOpen className="h-4 w-4" /> Lessons Learned
        </CardTitle>
        <CardDescription>
          Auto-written when a tool fails or is denied. Injected into every prompt so the agent corrects past mistakes. Edit freely.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Textarea
            value={newLesson}
            onChange={(e) => setNewLesson(e.target.value)}
            rows={2}
            placeholder="Add a manual lesson, e.g. 'Always use --accept-source-agreements with winget install'"
            className="font-mono text-xs"
          />
          <Button onClick={add} variant="outline" size="icon" className="self-stretch">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={18}
          className="font-mono text-xs leading-relaxed"
          placeholder={loading ? 'Loading…' : 'No lessons yet. The agent will write them as it makes mistakes.'}
        />

        <div className="flex gap-2">
          <Button onClick={save} className="flex-1">
            <Save className="h-4 w-4 mr-2" /> Save edits
          </Button>
          <Button variant="outline" onClick={load}>
            <RefreshCw className="h-4 w-4 mr-2" /> Reload
          </Button>
          <Button variant="outline" onClick={wipe} className="text-destructive hover:text-destructive">
            <Trash2 className="h-4 w-4 mr-2" /> Clear
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function EpisodesTab() {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const eps = await getEpisodes(300);
    setEpisodes(eps.slice().reverse());
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const wipe = async () => {
    if (!confirm('Delete the entire action history?')) return;
    await clearEpisodes();
    setEpisodes([]);
    toast({ title: 'Episodes cleared' });
  };

  const promote = async (ep: Episode) => {
    const text = prompt('Write the lesson to remember from this episode:', `${ep.tool}: ${ep.summary.slice(0, 120)}`);
    if (!text?.trim()) return;
    await recordLesson(text.trim(), ep.tag, ep.summary);
    toast({ title: 'Lesson saved', description: 'Will apply to future chats.' });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <History className="h-4 w-4" /> Episodes (action log)
        </CardTitle>
        <CardDescription>
          Every tool the agent runs is logged here. Top 3 keyword-matches get retrieved as few-shot examples for new requests.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button variant="outline" onClick={load} className="flex-1">
            <RefreshCw className="h-4 w-4 mr-2" /> Refresh
          </Button>
          <Button variant="outline" onClick={wipe} className="text-destructive hover:text-destructive">
            <Trash2 className="h-4 w-4 mr-2" /> Clear all
          </Button>
        </div>

        <ScrollArea className="h-[480px] rounded-md border border-border/50">
          <div className="divide-y divide-border/30">
            {loading && <div className="p-4 text-sm text-muted-foreground">Loading…</div>}
            {!loading && episodes.length === 0 && (
              <div className="p-4 text-sm text-muted-foreground">
                No episodes yet. Run a tool from chat — it will be logged here.
              </div>
            )}
            {episodes.map((ep, i) => {
              const meta = OUTCOME_BADGE[ep.outcome] ?? OUTCOME_BADGE.success;
              return (
                <div key={i} className="p-3 space-y-1.5 hover:bg-secondary/30">
                  <div className="flex items-start gap-2 flex-wrap">
                    <Badge variant="outline" className={`text-[10px] ${meta.className}`}>{meta.label}</Badge>
                    <code className="text-[11px] font-mono text-foreground/90 break-all flex-1">{ep.tag}</code>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                      {new Date(ep.ts).toLocaleString()}
                    </span>
                  </div>
                  {ep.request && (
                    <div className="text-[11px] text-muted-foreground italic line-clamp-1">
                      ↳ {ep.request}
                    </div>
                  )}
                  {ep.summary && (
                    <pre className="text-[11px] text-foreground/70 whitespace-pre-wrap break-words font-mono max-h-24 overflow-hidden">{ep.summary}</pre>
                  )}
                  <div className="pt-1">
                    <Button size="sm" variant="ghost" className="h-6 text-[11px]" onClick={() => promote(ep)}>
                      <BookOpen className="h-3 w-3 mr-1" /> Learn from this
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

export default function MemoryPage() {
  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Agent Memory & Learning</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Hermes-style memory loop: identity, lessons learned from mistakes, and the full action log.
        </p>
      </div>

      <Tabs defaultValue="identity">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="identity"><User className="h-3.5 w-3.5 mr-1.5" /> Identity</TabsTrigger>
          <TabsTrigger value="lessons"><BookOpen className="h-3.5 w-3.5 mr-1.5" /> Lessons</TabsTrigger>
          <TabsTrigger value="episodes"><History className="h-3.5 w-3.5 mr-1.5" /> Episodes</TabsTrigger>
        </TabsList>
        <TabsContent value="identity" className="mt-4">
          <IdentityTab />
        </TabsContent>
        <TabsContent value="lessons" className="mt-4">
          <LessonsTab />
        </TabsContent>
        <TabsContent value="episodes" className="mt-4">
          <EpisodesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
