import { useState } from 'react';
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Download, Copy, Wand2, Globe } from 'lucide-react';
import { toast } from 'sonner';
import { scrapeSite, generateReactClone, type ScrapeResult } from '@/lib/open-lovable';
import { useConversations } from '@/hooks/useConversations';

export default function OpenLovablePage() {
  const { conversations, currentConvoId, createConversation, selectConversation, deleteConversation } = useConversations();
  const [url, setUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [site, setSite] = useState<ScrapeResult | null>(null);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState<'scrape' | 'build' | null>(null);

  const handleScrape = async () => {
    if (!url.trim()) return;
    setBusy('scrape');
    setSite(null);
    setCode('');
    try {
      const r = await scrapeSite(url.trim(), true);
      setSite(r);
      toast.success(`Scraped ${r.title}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Scrape failed');
    } finally {
      setBusy(null);
    }
  };

  const handleBuild = async () => {
    if (!site) return;
    setBusy('build');
    try {
      const out = await generateReactClone(site, notes);
      if (!out) throw new Error('The model returned nothing — is a default model selected in Settings?');
      setCode(out);
      toast.success('Component generated');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Generation failed');
    } finally {
      setBusy(null);
    }
  };

  const download = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'ClonedSite.tsx';
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="flex min-h-screen w-full">
      <AppSidebar
        conversations={conversations}
        currentConvoId={currentConvoId}
        onNewChat={createConversation}
        onSelectConvo={selectConversation}
        onDeleteConvo={deleteConversation}
      />
      <main className="flex-1 min-w-0 p-4 space-y-4">
        <header className="flex items-center gap-2">
          <SidebarTrigger />
          <Globe className="h-5 w-5 text-primary" />
          <div>
            <h1 className="text-lg font-bold">open-lovable</h1>
            <p className="text-xs text-muted-foreground">Scrape any site with Firecrawl, rebuild it as a React component locally.</p>
          </div>
        </header>

        <Card className="p-4 space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleScrape(); }}
            />
            <Button onClick={handleScrape} disabled={busy !== null || !url.trim()}>
              {busy === 'scrape' ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Scrape'}
            </Button>
          </div>
          <Textarea
            placeholder="Optional: extra instructions (e.g. dark theme, drop the pricing section)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
          />
          <Button onClick={handleBuild} disabled={!site || busy !== null} className="w-full">
            {busy === 'build' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
            Rebuild as React component
          </Button>
        </Card>

        {site && (
          <Tabs defaultValue="preview">
            <TabsList>
              <TabsTrigger value="preview">Screenshot</TabsTrigger>
              <TabsTrigger value="markdown">Content</TabsTrigger>
              <TabsTrigger value="links">Links ({site.links.length})</TabsTrigger>
              <TabsTrigger value="code">Code</TabsTrigger>
            </TabsList>
            <TabsContent value="preview">
              <Card className="p-3">
                {site.screenshot ? (
                  <img src={site.screenshot} alt={`Screenshot of ${site.title}`} className="w-full rounded-md border border-border" loading="lazy" />
                ) : (
                  <p className="text-sm text-muted-foreground">No screenshot returned.</p>
                )}
              </Card>
            </TabsContent>
            <TabsContent value="markdown">
              <Card className="p-3">
                <pre className="text-xs whitespace-pre-wrap max-h-[60vh] overflow-auto">{site.markdown}</pre>
              </Card>
            </TabsContent>
            <TabsContent value="links">
              <Card className="p-3 space-y-1 max-h-[60vh] overflow-auto">
                {site.links.map((l) => (
                  <button key={l} onClick={() => setUrl(l)} className="block text-xs text-primary hover:underline truncate w-full text-left">{l}</button>
                ))}
              </Card>
            </TabsContent>
            <TabsContent value="code">
              <Card className="p-3 space-y-2">
                {code ? (
                  <>
                    <div className="flex gap-2">
                      <Button size="sm" variant="secondary" onClick={() => { navigator.clipboard.writeText(code); toast.success('Copied'); }}>
                        <Copy className="mr-2 h-3.5 w-3.5" />Copy
                      </Button>
                      <Button size="sm" variant="secondary" onClick={download}>
                        <Download className="mr-2 h-3.5 w-3.5" />ClonedSite.tsx
                      </Button>
                    </div>
                    <pre className="text-xs whitespace-pre-wrap max-h-[60vh] overflow-auto font-mono">{code}</pre>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">Run “Rebuild as React component” to generate code.</p>
                )}
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
}
