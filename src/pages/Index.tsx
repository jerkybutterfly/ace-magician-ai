import { useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { AgentHealthPill } from '@/components/AgentHealthPill';
import Chat from './Chat';
import FilesPage from './FilesPage';
import SettingsPage from './SettingsPage';
import MemoryPage from './MemoryPage';
import SkillsPage from './SkillsPage';
import CronPage from './CronPage';
import PermissionsPage from './PermissionsPage';
import SpecKitPage from './SpecKitPage';
import LocalModelsPage from './LocalModelsPage';
import NetworkPage from './NetworkPage';
import MqttPage from './MqttPage';
import RagPage from './RagPage';
import PhonePage from './PhonePage';
import OnDeviceModelPage from './OnDeviceModelPage';
import BriefingPage from './BriefingPage';
import ReconPage from './ReconPage';
import AuditPage from './AuditPage';
import ForensicsPage from './ForensicsPage';
import LabModePage from './LabModePage';
import ComputerUsePage from './ComputerUsePage';
import DranaPage from './DranaPage';
import GlasswingPage from './GlasswingPage';
import SwarmPage from './SwarmPage';
import KnowledgeGraphPage from './KnowledgeGraphPage';
import VoicePage from './VoicePage';
import AutomationsPage from './AutomationsPage';
import UnderstandPage from './UnderstandPage';
import AuditLogPage from './AuditLogPage';
import { getSettings } from '@/lib/settings';
import { useConversations } from '@/hooks/useConversations';

export default function Index() {
  const location = useLocation();
  const { 
    conversations, 
    currentConvoId, 
    createConversation, 
    selectConversation, 
    deleteConversation, 
    updateConversation 
  } = useConversations();
  const [model, setModel] = useState(() => getSettings().defaultModel || '');

  const currentConvo = conversations.find((c) => c.id === currentConvoId) ?? null;

  const renderPage = () => {
    switch (location.pathname) {
      case '/files':
        return <FilesPage />;
      case '/skills':
        return <SkillsPage />;
      case '/speckit':
        return <SpecKitPage />;
      case '/cron':
        return <CronPage />;
      case '/memory':
        return <MemoryPage />;
      case '/permissions':
        return <PermissionsPage />;
      case '/local-models':
        return <LocalModelsPage />;
      case '/network':
        return <NetworkPage />;
      case '/mqtt':
        return <MqttPage />;
      case '/documents':
        return <RagPage />;
      case '/phone':
        return <PhonePage />;
      case '/on-device-model':
        return <OnDeviceModelPage />;
      case '/briefing':
        return <BriefingPage />;
      case '/recon':
        return <ReconPage />;
      case '/audit':
        return <AuditPage />;
      case '/forensics':
        return <ForensicsPage />;
      case '/labmode':
        return <LabModePage />;
      case '/computer-use':
        return <ComputerUsePage />;
      case '/drana':
        return <DranaPage />;
      case '/glasswing':
        return <GlasswingPage />;
      case '/swarm':
        return <SwarmPage />;
      case '/knowledge-graph':
        return <KnowledgeGraphPage />;
      case '/voice':
        return <VoicePage />;
      case '/automations':
        return <AutomationsPage />;
      case '/understand':
        return <UnderstandPage />;
      case '/settings':
        return <SettingsPage />;
      default:
        return <Chat conversation={currentConvo} onUpdate={updateConversation} model={model} onModelChange={setModel} />;
    }
  };

  return (
    <div className="h-dvh flex w-full overflow-hidden">
      <AppSidebar
        conversations={conversations}
        currentConvoId={currentConvoId}
        onNewChat={createConversation}
        onSelectConvo={selectConversation}
        onDeleteConvo={deleteConversation}
      />
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <header className="h-12 flex items-center justify-between border-b border-border/50 px-2 shrink-0">
          <SidebarTrigger />
          <div className="flex items-center gap-1">
            <AgentHealthPill />
          </div>
        </header>
        <main className="flex-1 flex flex-col overflow-hidden min-h-0">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}
