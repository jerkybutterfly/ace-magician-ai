import { MessageSquare, FolderOpen, Settings, Plus, Trash2, Brain, Zap, Clock, ShieldCheck, FileCode2, Cpu, Search, Radio, Network, BookOpen, BookMarked, Smartphone, Sun, Radar, Microscope, FlaskConical, Monitor, Infinity as InfinityIcon, Sparkles, Mic, ScrollText, TrendingUp, Workflow, Download, Bird, Clapperboard, Database, Globe, AudioLines, Skull, Plug, LineChart, Layers, Eye, Boxes, Shield, Bug, GraduationCap, Atom, Image as ImageIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { NavLink } from '@/components/NavLink';
import { useLocation } from 'react-router-dom';
import { CommandPalette } from '@/components/CommandPalette';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter,
  SidebarSeparator, useSidebar,
} from '@/components/ui/sidebar';
import { TerminalWidget } from './TerminalWidget';
import { SystemInfoPanel } from './SystemInfo';
import { MissionPanel } from './MissionPanel';
import { SystemStatsPanel } from './SystemStatsPanel';
import { Button } from '@/components/ui/button';
import type { Conversation } from '@/lib/conversations';

const navItems = [
  { title: 'Chat', url: '/chat', icon: MessageSquare },
  { title: 'Ultron', url: '/ultron', icon: Orbit },
  { title: 'Search', url: '/search', icon: Search },

  { title: 'Trading', url: '/trading', icon: TrendingUp },
  { title: 'Finance', url: '/finance', icon: LineChart },
  { title: 'colibrì Brain', url: '/colibri', icon: Bird },
  { title: 'Automations', url: '/automations', icon: Zap },
  { title: 'n8n', url: '/n8n', icon: Workflow },
  { title: 'Swarm', url: '/swarm', icon: Network },
  { title: 'Knowledge Graph', url: '/knowledge-graph', icon: Brain },
  { title: 'Understand', url: '/understand', icon: BookOpen },
  { title: 'Physical AI', url: '/physical-ai', icon: Atom },
  { title: 'Montage', url: '/montage', icon: Clapperboard },
  { title: 'Fooocus', url: '/fooocus', icon: ImageIcon },
  { title: 'open-lovable', url: '/open-lovable', icon: Globe },
  { title: 'Voice', url: '/voice', icon: Mic },
  { title: 'Local Voice', url: '/local-voice', icon: AudioLines },
  { title: 'Vector Store', url: '/vector-store', icon: Database },
  { title: 'Browser Use', url: '/browser-use', icon: Globe },
  { title: 'Files', url: '/files', icon: FolderOpen },
  { title: 'Skills', url: '/skills', icon: Zap },
  { title: 'Spec Kit', url: '/speckit', icon: FileCode2 },
  { title: 'Local Models', url: '/local-models', icon: Cpu },
  { title: 'Documents', url: '/documents', icon: BookOpen },
  { title: 'Obsidian', url: '/obsidian', icon: BookMarked },
  { title: 'Phone', url: '/phone', icon: Smartphone },
  { title: 'On-Device Model', url: '/on-device-model', icon: Cpu },
  { title: 'Briefing', url: '/briefing', icon: Sun },
  { title: 'Network', url: '/network', icon: Network },
  { title: 'Recon', url: '/recon', icon: Radar },
  { title: 'Audit', url: '/audit', icon: ShieldCheck },
  { title: 'Forensics', url: '/forensics', icon: Microscope },
  { title: 'Lab Mode', url: '/labmode', icon: FlaskConical },
  { title: 'Drana Recon', url: '/drana', icon: InfinityIcon },
  { title: 'Glasswing', url: '/glasswing', icon: Sparkles },
  { title: 'Offensive', url: '/offensive', icon: Skull },
  { title: 'MobSF', url: '/mobsf', icon: Shield },
  { title: 'Frida', url: '/frida', icon: Bug },
  { title: 'scrcpy', url: '/scrcpy', icon: Smartphone },
  { title: 'Android Emulator', url: '/avd', icon: Cpu },
  { title: 'Vortex Agent', url: '/vortex', icon: Shield },
  { title: 'MCP Servers', url: '/mcp', icon: Plug },
  { title: 'Computer Use', url: '/computer-use', icon: Monitor },
  { title: 'MQTT', url: '/mqtt', icon: Radio },
  { title: 'Cron', url: '/cron', icon: Clock },
  { title: 'Memory', url: '/memory', icon: Brain },
  { title: 'mem0', url: '/mem0', icon: Layers },
  { title: 'SkillOpt', url: '/skillopt', icon: GraduationCap },
  { title: 'Magentic-One', url: '/magentic', icon: Network },
  { title: 'LightRAG', url: '/lightrag', icon: Database },
  { title: 'Stagehand', url: '/stagehand', icon: Globe },
  { title: 'OpenBB', url: '/openbb', icon: LineChart },
  { title: 'OmniParser', url: '/omniparser', icon: Eye },
  { title: 'exo Cluster', url: '/exo', icon: Boxes },
  { title: 'Audit Log', url: '/audit-log', icon: ScrollText },
  { title: 'Permissions', url: '/permissions', icon: ShieldCheck },
  { title: 'Install on Phone', url: '/install', icon: Download },
  { title: 'Settings', url: '/settings', icon: Settings },
];

interface Props {
  conversations: Conversation[];
  currentConvoId: string | null;
  onNewChat: () => void;
  onSelectConvo: (id: string) => void;
  onDeleteConvo: (id: string) => void;
}

export function AppSidebar({ conversations, currentConvoId, onNewChat, onSelectConvo, onDeleteConvo }: Props) {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((s) => !s);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <>
    <CommandPalette
      open={searchOpen}
      onOpenChange={setSearchOpen}
      conversations={conversations}
      onSelectConvo={onSelectConvo}
      onNewChat={onNewChat}
    />
    <Sidebar collapsible="icon" className="border-r border-border/50">
      <SidebarHeader className="p-3">
        {!collapsed && (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary/15 ring-1 ring-primary/30 flex items-center justify-center">
              <span className="text-base">🦞</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm text-foreground tracking-tight">Pesto Steve</span>
              <span className="text-[10px] text-muted-foreground">AI Agent</span>
            </div>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className="hover:bg-secondary/60 rounded-lg transition-colors" activeClassName="bg-primary/10 text-primary font-medium">
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {!collapsed && (location.pathname === '/' || location.pathname === '/chat') && (
          <>
            <SidebarSeparator className="bg-border/40" />
            <SidebarGroup>
               <SidebarGroupLabel className="text-[10px] uppercase tracking-wider text-muted-foreground/70">Strategy & Mission</SidebarGroupLabel>
               <MissionPanel />
            </SidebarGroup>
            <SidebarSeparator className="bg-border/40" />
            <SidebarGroup>
              <div className="flex items-center justify-between px-3 py-1">
                <SidebarGroupLabel className="p-0 text-[10px] uppercase tracking-wider text-muted-foreground/70">History</SidebarGroupLabel>
                <div className="flex items-center gap-0.5">
                  <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-primary/10 hover:text-primary" onClick={() => setSearchOpen(true)} title="Search conversations (⌘K)">
                    <Search className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-primary/10 hover:text-primary" onClick={onNewChat}>
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <SidebarGroupContent>
                <SidebarMenu>
                  {conversations.slice().reverse().map((c) => (
                    <SidebarMenuItem key={c.id}>
                      <SidebarMenuButton
                        onClick={() => onSelectConvo(c.id)}
                        className={`text-xs truncate group rounded-lg transition-colors ${c.id === currentConvoId ? 'bg-primary/10 text-primary' : 'hover:bg-secondary/60'}`}
                      >
                        <MessageSquare className="mr-2 h-3.5 w-3.5 flex-shrink-0" />
                        <span className="truncate flex-1">{c.title}</span>
                        <span
                          role="button"
                          tabIndex={0}
                          onClick={(e) => { e.stopPropagation(); onDeleteConvo(c.id); }}
                          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); onDeleteConvo(c.id); } }}
                          className="opacity-0 group-hover:opacity-100 ml-1 transition-opacity cursor-pointer"
                        >
                          <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                        </span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}

        {!collapsed && (
          <>
            <SidebarSeparator className="bg-border/40" />
            <SidebarGroup>
              <SidebarGroupLabel className="text-[10px] uppercase tracking-wider text-muted-foreground/70">System</SidebarGroupLabel>
              <SystemStatsPanel />
              <SystemInfoPanel />
            </SidebarGroup>
          </>
        )}
      </SidebarContent>

      {!collapsed && (
        <SidebarFooter className="h-[250px] border-t border-border/40">
          <TerminalWidget />
        </SidebarFooter>
      )}
    </Sidebar>
    </>
  );
}
