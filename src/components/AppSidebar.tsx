import { MessageSquare, FolderOpen, Settings, Plus, Trash2 } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useLocation } from 'react-router-dom';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter,
  SidebarSeparator, useSidebar,
} from '@/components/ui/sidebar';
import { TerminalWidget } from './TerminalWidget';
import { SystemInfoPanel } from './SystemInfo';
import { Button } from '@/components/ui/button';
import type { Conversation } from '@/lib/conversations';

const navItems = [
  { title: 'Chat', url: '/', icon: MessageSquare },
  { title: 'Files', url: '/files', icon: FolderOpen },
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

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="p-3">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <MessageSquare className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-sm">Pesto Steve's AI</span>
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
                    <NavLink to={item.url} end className="hover:bg-muted/50" activeClassName="bg-muted text-primary font-medium">
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
            <SidebarSeparator />
            <SidebarGroup>
              <div className="flex items-center justify-between px-3 py-1">
                <SidebarGroupLabel className="p-0 text-xs">History</SidebarGroupLabel>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onNewChat}>
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
              <SidebarGroupContent>
                <SidebarMenu>
                  {conversations.slice().reverse().map((c) => (
                    <SidebarMenuItem key={c.id}>
                      <SidebarMenuButton
                        onClick={() => onSelectConvo(c.id)}
                        className={`text-xs truncate group ${c.id === currentConvoId ? 'bg-muted text-primary' : ''}`}
                      >
                        <MessageSquare className="mr-2 h-3.5 w-3.5 flex-shrink-0" />
                        <span className="truncate flex-1">{c.title}</span>
                        <button
                          onClick={(e) => { e.stopPropagation(); onDeleteConvo(c.id); }}
                          className="opacity-0 group-hover:opacity-100 ml-1"
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
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel>System</SidebarGroupLabel>
              <SystemInfoPanel />
            </SidebarGroup>
          </>
        )}
      </SidebarContent>

      {!collapsed && (
        <SidebarFooter className="h-[250px] border-t">
          <TerminalWidget />
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
