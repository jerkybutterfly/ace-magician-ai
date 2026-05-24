import { useEffect, useState } from 'react';
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { useConversations } from '@/hooks/useConversations';
import { AccountHeader } from '@/components/trading/AccountHeader';
import { QuickOrder } from '@/components/trading/QuickOrder';
import { PositionsTable } from '@/components/trading/PositionsTable';
import { OrdersTable } from '@/components/trading/OrdersTable';
import { StrategyCard } from '@/components/trading/StrategyCard';
import { KillSwitch } from '@/components/trading/KillSwitch';
import { ConnectPanel } from '@/components/trading/ConnectPanel';
import { trading, type Strategy } from '@/lib/trading';
import { useNavigate } from 'react-router-dom';

export default function TradingPage() {
  const navigate = useNavigate();
  const { conversations, currentId, createNew, selectConvo, deleteConvo } = useConversations();
  const [refreshKey, setRefreshKey] = useState(0);
  const [strategies, setStrategies] = useState<Strategy[]>([]);

  const refresh = () => setRefreshKey((k) => k + 1);

  useEffect(() => {
    trading.strategies().then(setStrategies).catch(() => setStrategies([]));
  }, [refreshKey]);

  return (
    <div className="flex min-h-screen w-full">
      <AppSidebar
        conversations={conversations}
        currentConvoId={currentId}
        onNewChat={() => { createNew(); navigate('/'); }}
        onSelectConvo={(id) => { selectConvo(id); navigate('/'); }}
        onDeleteConvo={deleteConvo}
      />
      <SidebarInset>
        <header className="h-12 border-b border-border/50 flex items-center px-4 gap-3">
          <SidebarTrigger />
          <h1 className="text-sm font-semibold tracking-tight">Trading</h1>
          <div className="ml-auto flex items-center gap-2">
            <KillSwitch onDone={refresh} />
          </div>
        </header>

        <main className="p-4 space-y-4 max-w-6xl mx-auto w-full">
          <AccountHeader refreshKey={refreshKey} />
          <QuickOrder onPlaced={refresh} />
          <PositionsTable refreshKey={refreshKey} onChange={refresh} />

          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Strategies</div>
            {strategies.length === 0 ? (
              <div className="text-sm text-muted-foreground p-4 border border-border/50 rounded-lg bg-card/30">
                No strategies registered yet. Connect Alpaca below, then drop strategy files into <code className="text-xs">agent_strategies/</code> on your AM06.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {strategies.map((s) => (
                  <StrategyCard key={s.id} strategy={s} onChange={refresh} />
                ))}
              </div>
            )}
          </div>

          <OrdersTable refreshKey={refreshKey} />
          <ConnectPanel onConnected={refresh} />
        </main>
      </SidebarInset>
    </div>
  );
}
