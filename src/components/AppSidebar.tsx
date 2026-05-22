import { MessageSquare, FolderOpen, Settings, Plus, Trash2, Brain, Zap, Clock, ShieldCheck, FileCode2, Cpu, Search, Radio, Network, BookOpen, Smartphone, Sun, Radar, Microscope, FlaskConical, Monitor, Infinity as InfinityIcon, Sparkles, Mic } from 'lucide-react';
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
  { title: 'Chat', url: '/', icon: MessageSquare },
  { title: 'Automations', url: '/automations', icon: Zap },
  { title: 'Swarm', url: '/swarm', icon: Network },
  { title: 'Knowledge Graph', url: '/knowledge-graph', icon: Brain },
  { title: 'Understand', url: '/understand', icon: BookOpen },
  { title: 'Voice', url: '/voice', icon: Mic },
  { title: 'Files', url: '/files', icon: FolderOpen },
  { title: 'Skills', url: '/skills', icon: Zap },
  { title: 'Spec Kit', url: '/speckit', icon: FileCode2 },
  { title: 'Local Models', url: '/local-models', icon: Cpu },
  { title: 'Documents', url: '/documents', icon: BookOpen },
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
  { title: 'Computer Use', url: '/computer-use', icon: Monitor },
  { title: 'MQTT', url: '/mqtt', icon: Radio },
  { title: 'Cron', url: '/cron', icon: Clock },
  { title: 'Memory', url: '/memory', icon: Brain },
  { title: 'Permissions', url: '/permissions', icon: ShieldCheck },
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

        {!collapsed && location.pathname === '/' && (
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
                        <button
                          onClick={(e) => { e.stopPropagation(); onDeleteConvo(c.id); }}
                          className="opacity-0 group-hover:opacity-100 ml-1 transition-opacity"
                        >
                          <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                        </button>
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
  );
}
