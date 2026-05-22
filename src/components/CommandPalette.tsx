import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator,
} from '@/components/ui/command';
import {
  MessageSquare, FolderOpen, Settings, Brain, Zap, Clock, ShieldCheck, FileCode2, Cpu, Radio, Network,
  BookOpen, Smartphone, Sun, Radar, Microscope, FlaskConical, Monitor, Infinity as InfinityIcon,
  Sparkles, Mic, Terminal, Globe, Camera, Bell, Wifi,
} from 'lucide-react';
import type { Conversation } from '@/lib/conversations';
import { getEpisodes, type Episode } from '@/lib/learning';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversations: Conversation[];
  onSelectConvo: (id: string) => void;
  onNewChat: () => void;
  onInsertText?: (text: string) => void;
}

const PAGES = [
  { title: 'Chat', url: '/', icon: MessageSquare, keywords: 'chat home' },
  { title: 'Automations', url: '/automations', icon: Zap, keywords: 'triggers automation' },
  { title: 'Swarm', url: '/swarm', icon: Network, keywords: 'crewai multi agent' },
  { title: 'Knowledge Graph', url: '/knowledge-graph', icon: Brain, keywords: 'graph entities' },
  { title: 'Understand', url: '/understand', icon: BookOpen, keywords: 'codebase analyze' },
  { title: 'Voice', url: '/voice', icon: Mic, keywords: 'speech audio' },
  { title: 'Files', url: '/files', icon: FolderOpen, keywords: 'browse explorer' },
  { title: 'Skills', url: '/skills', icon: Zap, keywords: 'reusable workflows' },
  { title: 'Spec Kit', url: '/speckit', icon: FileCode2, keywords: 'plan spec' },
  { title: 'Local Models', url: '/local-models', icon: Cpu, keywords: 'ollama lmstudio' },
  { title: 'Documents', url: '/documents', icon: BookOpen, keywords: 'rag pdf' },
  { title: 'Phone', url: '/phone', icon: Smartphone, keywords: 'mobile capacitor' },
  { title: 'On-Device Model', url: '/on-device-model', icon: Cpu, keywords: 'gguf local' },
  { title: 'Briefing', url: '/briefing', icon: Sun, keywords: 'morning daily' },
  { title: 'Network', url: '/network', icon: Network, keywords: 'lan scan' },
  { title: 'Recon', url: '/recon', icon: Radar, keywords: 'security' },
  { title: 'Audit', url: '/audit', icon: ShieldCheck, keywords: 'security audit' },
  { title: 'Forensics', url: '/forensics', icon: Microscope, keywords: 'incident' },
  { title: 'Lab Mode', url: '/labmode', icon: FlaskConical, keywords: 'experimental' },
  { title: 'Drana Recon', url: '/drana', icon: InfinityIcon, keywords: 'osint' },
  { title: 'Glasswing', url: '/glasswing', icon: Sparkles, keywords: 'offensive tools' },
  { title: 'Computer Use', url: '/computer-use', icon: Monitor, keywords: 'desktop automation' },
  { title: 'MQTT', url: '/mqtt', icon: Radio, keywords: 'home assistant iot' },
  { title: 'Cron', url: '/cron', icon: Clock, keywords: 'schedule jobs' },
  { title: 'Memory', url: '/memory', icon: Brain, keywords: 'episodes lessons hermes' },
  { title: 'Audit Log', url: '/audit-log', icon: BookOpen, keywords: 'history episodes tool calls' },
  { title: 'Permissions', url: '/permissions', icon: ShieldCheck, keywords: 'allow deny tools' },
  { title: 'Settings', url: '/settings', icon: Settings, keywords: 'configuration' },
];

const TOOL_TEMPLATES = [
  { label: 'Run command', tag: '[RUN_CMD:]', icon: Terminal },
  { label: 'Open URL', tag: '[OPEN_URL:]', icon: Globe },
  { label: 'Screenshot', tag: '[SCREENSHOT]', icon: Camera },
  { label: 'List directory', tag: '[LIST_DIR:]', icon: FolderOpen },
  { label: 'Read file', tag: '[READ_FILE:]', icon: FileCode2 },
  { label: 'Write file', tag: '[WRITE_FILE:|]', icon: FileCode2 },
  { label: 'Web search', tag: '[WEB_SEARCH:]', icon: Globe },
  { label: 'Web fetch', tag: '[WEB_FETCH:]', icon: Globe },
  { label: 'Scan network', tag: '[SCAN_NETWORK]', icon: Wifi },
  { label: 'Notify', tag: '[NOTIFY:|]', icon: Bell },
  { label: 'Phone info', tag: '[PHONE_INFO]', icon: Smartphone },
];

export function CommandPalette({ open, onOpenChange, conversations, onSelectConvo, onNewChat, onInsertText }: Props) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [episodes, setEpisodes] = useState<Episode[]>([]);

  useEffect(() => {
    if (!open) {
      setQuery('');
      return;
    }
    // Lazy-load episodes once when palette opens
    getEpisodes(50).then(setEpisodes).catch(() => setEpisodes([]));
  }, [open]);

  const recentConvos = useMemo(
    () =>
      conversations
        .slice()
        .sort((a, b) => b.updatedAt - a.updatedAt)
        .slice(0, 12),
    [conversations],
  );

  const recentEps = useMemo(() => episodes.slice(-15).reverse(), [episodes]);

  const go = (url: string) => {
    onOpenChange(false);
    navigate(url);
  };

  const insert = (text: string) => {
    onOpenChange(false);
    if (onInsertText) onInsertText(text);
    else {
      // Fall back to clipboard so the user can paste
      navigator.clipboard?.writeText(text).catch(() => {});
    }
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Jump to a page, conversation, tool, or episode…"
        value={query}
        onValueChange={setQuery}
      />
      <CommandList className="max-h-[60vh]">
        <CommandEmpty>No matches.</CommandEmpty>

        <CommandGroup heading="Actions">
          <CommandItem value="new-chat" onSelect={() => { onOpenChange(false); onNewChat(); navigate('/'); }}>
            <MessageSquare className="mr-2 h-4 w-4 text-primary" />
            <span>New chat</span>
            <span className="ml-auto text-[10px] text-muted-foreground">⌘N</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Pages">
          {PAGES.map((p) => (
            <CommandItem
              key={p.url}
              value={`page-${p.title}-${p.keywords}`}
              onSelect={() => go(p.url)}
            >
              <p.icon className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>{p.title}</span>
              <span className="ml-auto text-[10px] text-muted-foreground">{p.url}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Insert tool tag">
          {TOOL_TEMPLATES.map((t) => (
            <CommandItem
              key={t.tag}
              value={`tool-${t.label}-${t.tag}`}
              onSelect={() => insert(t.tag)}
            >
              <t.icon className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>{t.label}</span>
              <code className="ml-auto text-[10px] text-muted-foreground">{t.tag}</code>
            </CommandItem>
          ))}
        </CommandGroup>

        {recentConvos.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Recent conversations">
              {recentConvos.map((c) => (
                <CommandItem
                  key={c.id}
                  value={`convo-${c.id}-${c.title}`}
                  onSelect={() => { onOpenChange(false); onSelectConvo(c.id); navigate('/'); }}
                >
                  <MessageSquare className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                  <span className="truncate">{c.title || 'Untitled'}</span>
                  <span className="ml-auto text-[10px] text-muted-foreground shrink-0">
                    {new Date(c.updatedAt).toLocaleDateString()}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {recentEps.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Recent agent episodes">
              {recentEps.map((ep, i) => (
                <CommandItem
                  key={`ep-${i}-${ep.ts}`}
                  value={`ep-${ep.tag}-${ep.summary}`}
                  onSelect={() => go('/memory')}
                  className="flex flex-col items-start gap-0.5"
                >
                  <div className="flex items-center gap-2 w-full">
                    <span className="text-xs">
                      {ep.outcome === 'success' ? '✅' : ep.outcome === 'denied' ? '🚫' : '⚠️'}
                    </span>
                    <code className="text-[11px] truncate flex-1">{ep.tag}</code>
                  </div>
                  {ep.summary && (
                    <span className="text-[10px] text-muted-foreground line-clamp-1 pl-6">{ep.summary}</span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
