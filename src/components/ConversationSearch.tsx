import { useEffect, useMemo, useState } from 'react';
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { MessageSquare } from 'lucide-react';
import type { Conversation } from '@/lib/conversations';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversations: Conversation[];
  onSelect: (id: string) => void;
}

interface SearchHit {
  convo: Conversation;
  snippet: string;
  matchCount: number;
}

function buildSnippet(text: string, query: string, ctx = 60): string {
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text.slice(0, ctx * 2);
  const start = Math.max(0, idx - ctx);
  const end = Math.min(text.length, idx + query.length + ctx);
  return (start > 0 ? '…' : '') + text.slice(start, end) + (end < text.length ? '…' : '');
}

export function ConversationSearch({ open, onOpenChange, conversations, onSelect }: Props) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!open) setQuery('');
  }, [open]);

  const hits = useMemo<SearchHit[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return conversations
        .slice()
        .sort((a, b) => b.updatedAt - a.updatedAt)
        .slice(0, 20)
        .map((convo) => ({ convo, snippet: convo.messages.find((m) => m.role !== 'system')?.content.slice(0, 120) ?? '', matchCount: 0 }));
    }
    const out: SearchHit[] = [];
    for (const convo of conversations) {
      let count = 0;
      let firstMatchText = '';
      if (convo.title.toLowerCase().includes(q)) {
        count++;
        firstMatchText = convo.title;
      }
      for (const m of convo.messages) {
        if (m.role === 'system') continue;
        if (typeof m.content !== 'string') continue;
        const lower = m.content.toLowerCase();
        if (lower.includes(q)) {
          if (!firstMatchText) firstMatchText = m.content;
          count += (lower.match(new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
        }
      }
      if (count > 0) {
        out.push({ convo, snippet: buildSnippet(firstMatchText, q), matchCount: count });
      }
    }
    out.sort((a, b) => b.matchCount - a.matchCount || b.convo.updatedAt - a.convo.updatedAt);
    return out.slice(0, 30);
  }, [query, conversations]);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search conversations…" value={query} onValueChange={setQuery} />
      <CommandList>
        <CommandEmpty>No matches.</CommandEmpty>
        <CommandGroup heading={query ? `${hits.length} match${hits.length === 1 ? '' : 'es'}` : 'Recent'}>
          {hits.map(({ convo, snippet }) => (
            <CommandItem
              key={convo.id}
              value={`${convo.id}-${convo.title}`}
              onSelect={() => {
                onSelect(convo.id);
                onOpenChange(false);
              }}
              className="flex flex-col items-start gap-1"
            >
              <div className="flex items-center gap-2 w-full">
                <MessageSquare className="h-3.5 w-3.5 text-primary shrink-0" />
                <span className="text-sm font-medium truncate flex-1">{convo.title || 'Untitled'}</span>
                <span className="text-[10px] text-muted-foreground shrink-0">{new Date(convo.updatedAt).toLocaleDateString()}</span>
              </div>
              {snippet && <span className="text-xs text-muted-foreground line-clamp-2 pl-5">{snippet}</span>}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
