import { AppSidebar } from '@/components/AppSidebar';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useConversations } from '@/hooks/useConversations';
import { Button } from '@/components/ui/button';
import { Hand, ExternalLink } from 'lucide-react';

// HoloHand by tubakhxn (MIT) — prebuilt into /public/holohand
const SRC = '/holohand/index.html';

export default function HoloHandPage() {
  const { conversations, currentConvoId, createConversation, selectConversation, deleteConversation } = useConversations();
  return (
    <div className="flex h-screen w-full">
      <AppSidebar conversations={conversations} currentConvoId={currentConvoId}
        onNewChat={createConversation} onSelectConvo={selectConversation} onDeleteConvo={deleteConversation} />
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center gap-3 border-b border-border/50 px-4 py-3">
          <SidebarTrigger />
          <Hand className="h-5 w-5 text-primary" />
          <div className="flex-1">
            <h1 className="text-lg font-semibold">HoloHand 3D</h1>
            <p className="text-xs text-muted-foreground">
              Open hand = explode · fist = assemble · pinch = grab a part · peace sign = next model
            </p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <a href={SRC} target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4 mr-1" />Full screen</a>
          </Button>
        </header>
        <iframe src={SRC} title="HoloHand" className="flex-1 w-full border-0"
          allow="camera; fullscreen" />
      </main>
    </div>
  );
}
