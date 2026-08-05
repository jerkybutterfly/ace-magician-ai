import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Search, Loader2, MessageSquare, BookMarked, Database, Brain } from 'lucide-react';
import { toast } from 'sonner';
import { searchVault, type VaultSearchHit } from '@/lib/obsidian';
import { ragQuery, type RagChunk } from '@/lib/rag';
import { loadConversations, type Conversation } from '@/lib/conversations';
import { getAgentMemory } from '@/lib/memory';
import { sendToChat } from '@/lib/chat-bus';
import { useNavigate } from 'react-router-dom';

const VAULT_KEY = 'obsidian-vault-path';

interface ConvoHit {
  convo: Conversation;
  snippet: string;
  matchCount: number;
}

interface MemoryHit {
  line: string;
  context: string;
}

function highlight(text: string, q: string): string {
  if (!q) return text;
  const idx = text.toLowerCase().indexOf(q.toLowerCase());
  if (idx < 0) return text.slice(0, 240);
  const start = Math.max(0, idx - 80);
  const end = Math.min(text.length, idx + q.length + 160);
  return (start > 0 ? '…' : '') + text.slice(start, end) + (end < text.length ? '…' : '');
}

export default function SearchPage() {
  const nav = useNavigate();
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState(false);

  const [vaultHits, setVaultHits] = useState<VaultSearchHit[]>([]);
  const [ragHits, setRagHits] = useState<RagChunk[]>([]);
  const [convoHits, setConvoHits] = useState<ConvoHit[]>([]);
  const [memoryHits, setMemoryHits] = useState<MemoryHit[]>([]);

  const vault = useMemo(() => localStorage.getItem(VAULT_KEY) || '', []);

  const searchConvos = (needle: string): ConvoHit[] => {
    const n = needle.toLowerCase();
    const convos = loadConversations();
    const hits: ConvoHit[] = [];
    for (const c of convos) {
      let count = 0;
      let snippet = '';
      for (const m of c.messages) {
        if (typeof m.content !== 'string') continue;
        const lc = m.content.toLowerCase();
        if (lc.includes(n)) {
          count++;
          if (!snippet) snippet = highlight(m.content, needle);
        }
      }
      if (count) hits.push({ convo: c, snippet, matchCount: count });
    }
    return hits.sort((a, b) => b.matchCount - a.matchCount).slice(0, 40);
  };

  const searchMemory = (needle: string): MemoryHit[] => {
    const mem = getAgentMemory();
    if (!mem) return [];
    const n = needle.toLowerCase();
    const lines = mem.split('\n');
    const hits: MemoryHit[] = [];
    lines.forEach((line, i) => {
      if (line.toLowerCase().includes(n)) {
        const context = lines.slice(Math.max(0, i - 1), i + 2).join('\n');
        hits.push({ line, context });
      }
    });
    return hits.slice(0, 40);
  };

  const runSearch = async () => {
    const needle = q.trim();
    if (!needle) return;
    setBusy(true);
    setVaultHits([]);
    setRagHits([]);
    setConvoHits(searchConvos(needle));
    setMemoryHits(searchMemory(needle));

    const tasks: Promise<unknown>[] = [];
    if (vault) {
      tasks.push(
        searchVault(vault, needle, 40)
          .then((h) => setVaultHits(h))
          .catch((e) => toast.error('Obsidian search failed', { description: String(e) }))
      );
    }
    tasks.push(
      ragQuery(needle, 8)
        .then((r) => { setRagHits(r.chunks || []); })
        .catch(() => {/* RAG offline — skip silently */})
    );
    await Promise.allSettled(tasks);
    setBusy(false);
  };

  const totalCount = vaultHits.length + ragHits.length + convoHits.length + memoryHits.length;

  const askChatAbout = (context: string) => {
    sendToChat({ text: `Given this context, help me with "${q}":\n\n${context}` });
    nav('/');
  };

  return (
    <div className="p-4 space-y-4 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Search className="h-6 w-6 text-primary" />
          Global Search
        </h1>
        <p className="text-sm text-muted-foreground">
          Search across Obsidian vault, RAG documents, chat history, and agent memory in one place.
        </p>
      </div>

      <Card>
        <CardContent className="pt-4">
          <div className="flex gap-2">
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && runSearch()}
              placeholder="Search everything…"
              autoFocus
            />
            <Button onClick={runSearch} disabled={busy || !q.trim()}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              <span className="ml-2">Search</span>
            </Button>
          </div>
          {totalCount > 0 && (
            <p className="text-xs text-muted-foreground mt-2">{totalCount} results</p>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All ({totalCount})</TabsTrigger>
          <TabsTrigger value="vault">
            <BookMarked className="h-3 w-3 mr-1" /> Vault ({vaultHits.length})
          </TabsTrigger>
          <TabsTrigger value="rag">
            <Database className="h-3 w-3 mr-1" /> RAG ({ragHits.length})
          </TabsTrigger>
          <TabsTrigger value="chats">
            <MessageSquare className="h-3 w-3 mr-1" /> Chats ({convoHits.length})
          </TabsTrigger>
          <TabsTrigger value="memory">
            <Brain className="h-3 w-3 mr-1" /> Memory ({memoryHits.length})
          </TabsTrigger>
        </TabsList>

        {['all', 'vault', 'rag', 'chats', 'memory'].map((tab) => (
          <TabsContent key={tab} value={tab}>
            <ScrollArea className="h-[calc(100dvh-320px)] pr-3">
              <div className="space-y-3">
                {(tab === 'all' || tab === 'vault') && vaultHits.map((h, i) => (
                  <Card key={`v-${i}`}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <BookMarked className="h-3 w-3 text-primary" />
                        {h.path}
                        <Badge variant="secondary" className="text-[10px]">line {h.line}</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs space-y-2">
                      <pre className="whitespace-pre-wrap font-mono text-muted-foreground">{h.text}</pre>
                      <Button size="sm" variant="ghost" onClick={() => askChatAbout(`[Obsidian ${h.path}:${h.line}]\n${h.text}`)}>Ask chat</Button>
                    </CardContent>
                  </Card>
                ))}

                {(tab === 'all' || tab === 'rag') && ragHits.map((c, i) => (
                  <Card key={`r-${i}`}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Database className="h-3 w-3 text-primary" />
                        {c.path}
                        <Badge variant="secondary" className="text-[10px]">score {c.score.toFixed(2)}</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs space-y-2">
                      <pre className="whitespace-pre-wrap font-mono text-muted-foreground">{c.text.slice(0, 400)}</pre>
                      <Button size="sm" variant="ghost" onClick={() => askChatAbout(`[RAG ${c.path}]\n${c.text}`)}>Ask chat</Button>
                    </CardContent>
                  </Card>
                ))}

                {(tab === 'all' || tab === 'chats') && convoHits.map((h) => (
                  <Card key={`c-${h.convo.id}`}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <MessageSquare className="h-3 w-3 text-primary" />
                        {h.convo.title}
                        <Badge variant="secondary" className="text-[10px]">{h.matchCount} match{h.matchCount === 1 ? '' : 'es'}</Badge>
                      </CardTitle>
                      <CardDescription className="text-xs">
                        {new Date(h.convo.updatedAt).toLocaleString()} · {h.convo.model}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="text-xs">
                      <pre className="whitespace-pre-wrap font-mono text-muted-foreground">{h.snippet}</pre>
                    </CardContent>
                  </Card>
                ))}

                {(tab === 'all' || tab === 'memory') && memoryHits.map((h, i) => (
                  <Card key={`m-${i}`}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Brain className="h-3 w-3 text-primary" />
                        Agent memory
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs">
                      <pre className="whitespace-pre-wrap font-mono text-muted-foreground">{h.context}</pre>
                    </CardContent>
                  </Card>
                ))}

                {!busy && totalCount === 0 && q && (
                  <p className="text-sm text-muted-foreground text-center py-8">No results.</p>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
