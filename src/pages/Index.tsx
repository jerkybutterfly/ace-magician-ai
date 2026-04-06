import { useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import Chat from './Chat';
import FilesPage from './FilesPage';
import SettingsPage from './SettingsPage';
import MemoryPage from './MemoryPage';
import { loadConversations, saveConversations, createConversation, type Conversation } from '@/lib/conversations';
import { getSettings } from '@/lib/settings';

export default function Index() {
  const location = useLocation();
  const [conversations, setConversations] = useState<Conversation[]>(loadConversations);
  const [currentId, setCurrentId] = useState<string | null>(() => {
    const convos = loadConversations();
    return convos.length > 0 ? convos[convos.length - 1].id : null;
  });
  const [model, setModel] = useState(() => getSettings().defaultModel || '');

  const persist = useCallback((convos: Conversation[]) => {
    setConversations(convos);
    saveConversations(convos);
  }, []);

  const handleNewChat = useCallback(() => {
    const convo = createConversation(model);
    const updated = [...conversations, convo];
    persist(updated);
    setCurrentId(convo.id);
  }, [conversations, model, persist]);

  const handleUpdateConvo = useCallback((convo: Conversation) => {
    const updated = conversations.map((c) => (c.id === convo.id ? convo : c));
    if (!updated.find((c) => c.id === convo.id)) updated.push(convo);
    persist(updated);
  }, [conversations, persist]);

  const handleDeleteConvo = useCallback((id: string) => {
    const updated = conversations.filter((c) => c.id !== id);
    persist(updated);
    if (currentId === id) setCurrentId(updated.length > 0 ? updated[updated.length - 1].id : null);
  }, [conversations, currentId, persist]);

  const handleSelectConvo = useCallback((id: string) => setCurrentId(id), []);

  // Auto-create first convo
  if (conversations.length === 0) {
    const convo = createConversation(model);
    persist([convo]);
    setCurrentId(convo.id);
  }

  const currentConvo = conversations.find((c) => c.id === currentId) ?? null;

  const renderPage = () => {
    switch (location.pathname) {
      case '/files':
        return <FilesPage />;
      case '/memory':
        return <MemoryPage />;
      case '/settings':
        return <SettingsPage />;
      default:
        return <Chat conversation={currentConvo} onUpdate={handleUpdateConvo} model={model} onModelChange={setModel} />;
    }
  };

  return (
    <div className="h-dvh flex w-full overflow-hidden">
      <AppSidebar
        conversations={conversations}
        currentConvoId={currentId}
        onNewChat={handleNewChat}
        onSelectConvo={handleSelectConvo}
        onDeleteConvo={handleDeleteConvo}
      />
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <header className="h-12 flex items-center border-b border-border/50 px-2 shrink-0">
          <SidebarTrigger />
        </header>
        <main className="flex-1 flex flex-col overflow-hidden min-h-0">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}
