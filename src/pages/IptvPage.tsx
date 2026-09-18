import { useEffect, useMemo, useRef, useState } from 'react';
import Hls from 'hls.js';
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Tv, ExternalLink, Copy, Radio } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useConversations } from '@/hooks/useConversations';
import {
  loadPlayable, loadCountries, loadCategories, M3U_INDEX, m3uByCountry, m3uByCategory,
  type IptvPlayable, type IptvCountry, type IptvCategory,
} from '@/lib/iptv';

export default function IptvPage() {
  const { conversations, currentConvoId, newConversation, selectConversation, deleteConversation } = useConversations();
  const [channels, setChannels] = useState<IptvPlayable[]>([]);
  const [countries, setCountries] = useState<IptvCountry[]>([]);
  const [categories, setCategories] = useState<IptvCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [country, setCountry] = useState('all');
  const [category, setCategory] = useState('all');
  const [current, setCurrent] = useState<IptvPlayable | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [p, co, ca] = await Promise.all([loadPlayable(), loadCountries(), loadCategories()]);
        setChannels(p);
        setCountries(co);
        setCategories(ca);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load iptv-org data');
      } finally { setLoading(false); }
    })();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return channels.filter((c) => {
      if (country !== 'all' && c.country !== country) return false;
      if (category !== 'all' && !c.categories.includes(category)) return false;
      if (q && !c.name.toLowerCase().includes(q) && !c.id.toLowerCase().includes(q)) return false;
      return true;
    }).slice(0, 500);
  }, [channels, query, country, category]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !current) return;
    // Cleanup previous
    if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }
    const url = current.stream.url;
    if (Hls.isSupported() && url.endsWith('.m3u8')) {
      const hls = new Hls({ enableWorker: true });
      hlsRef.current = hls;
      hls.loadSource(url);
      hls.attachMedia(video);
      hls.on(Hls.Events.ERROR, (_e, data) => {
        if (data.fatal) toast({ title: 'Stream error', description: data.details, variant: 'destructive' });
      });
    } else {
      video.src = url;
    }
    video.play().catch(() => {/* autoplay blocked */});
    return () => { if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; } };
  }, [current]);

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied', description: text });
  };

  return (
    <div className="min-h-screen flex w-full">
      <AppSidebar
        conversations={conversations}
        currentConvoId={currentConvoId}
        onNewChat={newConversation}
        onSelectConvo={selectConversation}
        onDeleteConvo={deleteConversation}
      />
      <SidebarInset>
        <header className="h-12 flex items-center border-b border-border/50 px-3 gap-2">
          <SidebarTrigger />
          <Tv className="h-4 w-4 text-primary" />
          <h1 className="text-sm font-semibold">IPTV</h1>
          <span className="text-xs text-muted-foreground ml-2">iptv-org · {channels.length.toLocaleString()} live channels</span>
        </header>

        <div className="p-4 grid gap-4 lg:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            <Card>
              <CardContent className="p-0 aspect-video bg-black rounded-lg overflow-hidden flex items-center justify-center">
                {current ? (
                  <video ref={videoRef} controls autoPlay muted className="w-full h-full" />
                ) : (
                  <div className="text-center text-muted-foreground text-sm">
                    <Radio className="h-10 w-10 mx-auto mb-2 opacity-40" />
                    Select a channel to start watching
                  </div>
                )}
              </CardContent>
            </Card>

            {current && (
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    {current.logo && <img src={current.logo} alt="" className="w-10 h-10 object-contain bg-white/5 rounded p-1" />}
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base truncate">{current.name}</CardTitle>
                      <div className="text-xs text-muted-foreground truncate">
                        {current.country} · {current.categories.join(', ') || 'general'}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => copy(current.stream.url)}>
                      <Copy className="h-3.5 w-3.5 mr-1" />Stream URL
                    </Button>
                    {current.website && (
                      <a href={current.website} target="_blank" rel="noreferrer">
                        <Button variant="ghost" size="sm"><ExternalLink className="h-3.5 w-3.5 mr-1" />Site</Button>
                      </a>
                    )}
                  </div>
                </CardHeader>
              </Card>
            )}

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Playlists (M3U)</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2 text-xs">
                <Button variant="outline" size="sm" onClick={() => copy(M3U_INDEX)}>Global index</Button>
                {country !== 'all' && (
                  <Button variant="outline" size="sm" onClick={() => copy(m3uByCountry(country))}>{country} playlist</Button>
                )}
                {category !== 'all' && (
                  <Button variant="outline" size="sm" onClick={() => copy(m3uByCategory(category))}>{category} playlist</Button>
                )}
                <span className="text-muted-foreground self-center">Paste into VLC / Kodi / any IPTV player.</span>
              </CardContent>
            </Card>
          </div>

          <Card className="flex flex-col max-h-[calc(100vh-6rem)]">
            <CardHeader className="pb-2 space-y-2">
              <CardTitle className="text-sm">Channels</CardTitle>
              <Input placeholder="Search…" value={query} onChange={(e) => setQuery(e.target.value)} />
              <div className="grid grid-cols-2 gap-2">
                <Select value={country} onValueChange={setCountry}>
                  <SelectTrigger><SelectValue placeholder="Country" /></SelectTrigger>
                  <SelectContent className="max-h-64">
                    <SelectItem value="all">All countries</SelectItem>
                    {countries.map((c) => (
                      <SelectItem key={c.code} value={c.code}>{c.flag || ''} {c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
                  <SelectContent className="max-h-64">
                    <SelectItem value="all">All categories</SelectItem>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 p-0">
              {loading ? (
                <div className="flex justify-center py-10"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
              ) : error ? (
                <div className="p-4 text-sm text-destructive">{error}</div>
              ) : (
                <ScrollArea className="h-full">
                  <div className="divide-y divide-border/30">
                    {filtered.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setCurrent(c)}
                        className={`w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-secondary/60 ${current?.id === c.id ? 'bg-primary/10' : ''}`}
                      >
                        {c.logo ? (
                          <img src={c.logo} alt="" className="w-6 h-6 object-contain bg-white/5 rounded flex-shrink-0" />
                        ) : (
                          <Tv className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium truncate">{c.name}</div>
                          <div className="text-[10px] text-muted-foreground truncate">
                            {c.country}{c.categories[0] ? ` · ${c.categories[0]}` : ''}
                          </div>
                        </div>
                        {c.stream.quality && <Badge variant="outline" className="text-[10px]">{c.stream.quality}</Badge>}
                      </button>
                    ))}
                    {filtered.length === 0 && (
                      <div className="p-4 text-xs text-muted-foreground text-center">No channels match.</div>
                    )}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </div>
  );
}
