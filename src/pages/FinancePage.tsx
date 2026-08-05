import { useEffect, useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { TrendingUp, TrendingDown, Plus, X, RefreshCw, MessageSquare, Newspaper, LineChart } from 'lucide-react';
import { webFetch, webSearch } from '@/lib/agent';
import { sendToChat } from '@/lib/chat-bus';

interface Quote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePct: number;
  currency: string;
  marketState: string;
  updated: number;
}

const STORAGE_KEY = 'finance.watchlist.v1';
const DEFAULT_LIST = ['AAPL', 'NVDA', 'MSFT', 'TSLA', 'BTC-USD', 'ETH-USD', 'SPY', '^GSPC'];

function loadList(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {/* ignore */}
  return DEFAULT_LIST;
}

function saveList(l: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(l));
}

async function fetchQuote(symbol: string): Promise<Quote | null> {
  const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbol)}`;
  try {
    const { text } = await webFetch(url);
    const data = JSON.parse(text);
    const q = data?.quoteResponse?.result?.[0];
    if (!q) return null;
    return {
      symbol: q.symbol,
      name: q.shortName || q.longName || q.symbol,
      price: q.regularMarketPrice ?? 0,
      change: q.regularMarketChange ?? 0,
      changePct: q.regularMarketChangePercent ?? 0,
      currency: q.currency || 'USD',
      marketState: q.marketState || 'CLOSED',
      updated: Date.now(),
    };
  } catch {
    return null;
  }
}

export default function FinancePage() {
  const [list, setList] = useState<string[]>(loadList);
  const [quotes, setQuotes] = useState<Record<string, Quote | null>>({});
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState('');
  const [news, setNews] = useState<{ title: string; url: string; snippet: string }[]>([]);
  const [newsSym, setNewsSym] = useState<string | null>(null);
  const [newsLoading, setNewsLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    const results = await Promise.all(list.map(s => fetchQuote(s).then(q => [s, q] as const)));
    setQuotes(Object.fromEntries(results));
    setLoading(false);
  }, [list]);

  useEffect(() => { refresh(); }, [refresh]);

  useEffect(() => {
    const id = setInterval(refresh, 60_000);
    return () => clearInterval(id);
  }, [refresh]);

  const addSymbol = () => {
    const sym = input.trim().toUpperCase();
    if (!sym) return;
    if (list.includes(sym)) { toast.error('Already in watchlist'); return; }
    const next = [...list, sym];
    setList(next); saveList(next); setInput('');
  };

  const removeSymbol = (s: string) => {
    const next = list.filter(x => x !== s);
    setList(next); saveList(next);
  };

  const loadNews = async (sym: string) => {
    setNewsSym(sym); setNewsLoading(true);
    try {
      const { results } = await webSearch(`${sym} stock news today`, 6);
      setNews(results);
    } catch (e) {
      toast.error('News fetch failed');
    } finally {
      setNewsLoading(false);
    }
  };

  const askChat = (sym: string) => {
    const q = quotes[sym];
    const ctx = q
      ? `${sym} (${q.name}) — ${q.price.toFixed(2)} ${q.currency}, ${q.changePct >= 0 ? '+' : ''}${q.changePct.toFixed(2)}% today.`
      : sym;
    sendToChat({ text: `Analyze ${sym} for me. Context: ${ctx}\n\nGive me a quick technical + sentiment view and any catalysts to watch.` });
    toast.success('Sent to chat');
  };

  const total = list.length;
  const up = Object.values(quotes).filter(q => q && q.changePct > 0).length;
  const down = Object.values(quotes).filter(q => q && q.changePct < 0).length;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="border-b border-border/50 px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-lg font-semibold flex items-center gap-2">
            <LineChart className="h-5 w-5 text-primary" /> Finance
          </h1>
          <p className="text-xs text-muted-foreground">Live Yahoo quotes via agent proxy · {total} symbols · <span className="text-emerald-500">{up}↑</span> <span className="text-rose-500">{down}↓</span></p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addSymbol()}
            placeholder="Add symbol (e.g. AAPL, BTC-USD)"
            className="h-8 w-56"
          />
          <Button size="sm" onClick={addSymbol}><Plus className="h-4 w-4" /></Button>
          <Button size="sm" variant="outline" onClick={refresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-[1fr,360px]">
        <ScrollArea className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {list.map(sym => {
              const q = quotes[sym];
              const positive = (q?.changePct ?? 0) >= 0;
              return (
                <Card key={sym} className="p-3 hover:border-primary/50 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold">{sym}</span>
                        {q && <Badge variant="outline" className="text-[10px]">{q.marketState}</Badge>}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">{q?.name ?? '…'}</div>
                    </div>
                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => removeSymbol(sym)}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  {q ? (
                    <>
                      <div className="mt-2 text-2xl font-semibold tabular-nums">
                        {q.price.toFixed(2)} <span className="text-xs text-muted-foreground">{q.currency}</span>
                      </div>
                      <div className={`flex items-center gap-1 text-sm ${positive ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {positive ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                        <span className="tabular-nums">{q.change >= 0 ? '+' : ''}{q.change.toFixed(2)}</span>
                        <span className="tabular-nums">({q.changePct >= 0 ? '+' : ''}{q.changePct.toFixed(2)}%)</span>
                      </div>
                    </>
                  ) : (
                    <div className="mt-2 text-sm text-muted-foreground">No data</div>
                  )}
                  <div className="mt-3 flex gap-1">
                    <Button size="sm" variant="outline" className="flex-1 h-7 text-xs" onClick={() => loadNews(sym)}>
                      <Newspaper className="h-3 w-3 mr-1" /> News
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 h-7 text-xs" onClick={() => askChat(sym)}>
                      <MessageSquare className="h-3 w-3 mr-1" /> Ask AI
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </ScrollArea>

        <div className="border-l border-border/50 flex flex-col overflow-hidden">
          <div className="px-3 py-2 border-b border-border/50 text-sm font-semibold flex items-center gap-2">
            <Newspaper className="h-4 w-4" /> News {newsSym && <Badge variant="outline">{newsSym}</Badge>}
          </div>
          <ScrollArea className="flex-1 p-3">
            {!newsSym && <p className="text-xs text-muted-foreground">Click "News" on any card to see the latest.</p>}
            {newsLoading && <p className="text-xs text-muted-foreground">Loading…</p>}
            <div className="space-y-2">
              {news.map((n, i) => (
                <a key={i} href={n.url} target="_blank" rel="noreferrer" className="block p-2 rounded border border-border/50 hover:border-primary/50 hover:bg-accent/30 transition-colors">
                  <div className="text-xs font-medium leading-snug">{n.title}</div>
                  <div className="text-[10px] text-muted-foreground line-clamp-2 mt-1">{n.snippet}</div>
                </a>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
