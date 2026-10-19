import { useEffect, useState, useMemo } from 'react';
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { useConversations } from '@/hooks/useConversations';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  Globe,
  RefreshCw,
  Download,
  Play,
  ShoppingCart,
  Search,
  ExternalLink,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  Clock,
  Layers,
  Terminal,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  screamingFrogService,
  type ScrapedProduct,
  type CrawledPage,
  type SeoIssue,
} from '@/lib/screaming-frog';

export default function ScreamingFrogPage() {
  const navigate = useNavigate();
  const { conversations, currentConvoId, createConversation, selectConversation, deleteConversation } = useConversations();

  // State
  const [products, setProducts] = useState<ScrapedProduct[]>([]);
  const [crawledPages, setCrawledPages] = useState<CrawledPage[]>([]);
  const [issues, setIssues] = useState<SeoIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [crawling, setCrawling] = useState(false);
  const [crawlUrl, setCrawlUrl] = useState('https://centra.ie');
  const [terminalOutput, setTerminalOutput] = useState('');

  // Filtering for products
  const [productSearch, setProductSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Filtering for crawl/issues
  const [urlSearch, setUrlSearch] = useState('');
  const [issueSeverityFilter, setIssueSeverityFilter] = useState<string>('All');

  const loadData = async () => {
    setLoading(true);
    try {
      const [prods, crawl, iss] = await Promise.all([
        screamingFrogService.getLocalProducts(),
        screamingFrogService.getLocalCrawl(),
        screamingFrogService.getLocalIssues(),
      ]);
      setProducts(prods);
      setCrawledPages(crawl);
      setIssues(iss);
    } catch (e) {
      toast.error('Failed to load data: ' + (e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRunCrawl = async () => {
    setCrawling(true);
    setTerminalOutput(`[Starting Crawl] Target: ${crawlUrl}...\n`);
    toast.info('Starting Screaming Frog SEO crawl & Centra product scrape...');
    try {
      const res = await screamingFrogService.runCrawl(crawlUrl, 50, 2);
      setTerminalOutput(res.stdout + (res.stderr ? `\n[STDERR]\n${res.stderr}` : ''));
      if (res.ok) {
        toast.success('Crawl & scrape completed successfully!');
        await loadData();
      } else {
        toast.warning('Crawl finished with notices. Check terminal output.');
        await loadData();
      }
    } catch (err) {
      const msg = (err as Error).message;
      setTerminalOutput((prev) => prev + `\n[ERROR]: ${msg}\n`);
      toast.error('Crawl execution error: ' + msg);
    } finally {
      setCrawling(false);
    }
  };

  // Categories list
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return ['All', ...Array.from(set)];
  }, [products]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
      const matchesSearch =
        !productSearch ||
        p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        (p.offerPrice && p.offerPrice.toLowerCase().includes(productSearch.toLowerCase()));
      return matchesCat && matchesSearch;
    });
  }, [products, selectedCategory, productSearch]);

  // Filtered Crawled Pages
  const filteredPages = useMemo(() => {
    return crawledPages.filter((p) => {
      return (
        !urlSearch ||
        p.url.toLowerCase().includes(urlSearch.toLowerCase()) ||
        (p.pageTitle && p.pageTitle.toLowerCase().includes(urlSearch.toLowerCase()))
      );
    });
  }, [crawledPages, urlSearch]);

  // Filtered Issues
  const filteredIssues = useMemo(() => {
    return issues.filter((iss) => {
      return issueSeverityFilter === 'All' || iss.severity === issueSeverityFilter.toLowerCase();
    });
  }, [issues, issueSeverityFilter]);

  const highSeverityCount = issues.filter((i) => i.severity === 'high').length;
  const medSeverityCount = issues.filter((i) => i.severity === 'medium').length;
  const lowSeverityCount = issues.filter((i) => i.severity === 'low').length;

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      <AppSidebar
        conversations={conversations}
        currentConvoId={currentConvoId}
        onNewChat={() => {
          createConversation();
          navigate('/chat');
        }}
        onSelectConvo={(id) => {
          selectConversation(id);
          navigate('/chat');
        }}
        onDeleteConvo={deleteConversation}
      />
      <SidebarInset>
        <header className="h-14 border-b border-border/60 flex items-center px-4 gap-3 bg-card/40 backdrop-blur sticky top-0 z-10">
          <SidebarTrigger />
          <Globe className="h-5 w-5 text-emerald-400" />
          <div>
            <h1 className="text-sm font-bold tracking-wide flex items-center gap-2">
              Screaming Frog SEO Spider & Centra Scraper
              <Badge variant="outline" className="text-[10px] font-mono border-emerald-500/40 text-emerald-400">
                ACTIVE
              </Badge>
            </h1>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={loadData} disabled={loading || crawling}>
              <RefreshCw className={`h-3.5 w-3.5 mr-1 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </Button>
            <a href="/centra_products.csv" download="centra_products.csv">
              <Button size="sm" variant="secondary" className="gap-1 text-xs">
                <Download className="h-3.5 w-3.5" /> Products CSV
              </Button>
            </a>
            <a href="/centra_seo_crawl.csv" download="centra_seo_crawl.csv">
              <Button size="sm" variant="outline" className="gap-1 text-xs">
                <Download className="h-3.5 w-3.5" /> SEO CSV
              </Button>
            </a>
          </div>
        </header>

        <main className="p-4 space-y-4 max-w-7xl mx-auto w-full">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="p-3 border-emerald-500/20 bg-emerald-950/10 flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                <ShoppingCart className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xl font-bold font-mono text-emerald-300">{products.length}</div>
                <div className="text-[11px] text-muted-foreground uppercase font-semibold">Centra Products</div>
              </div>
            </Card>

            <Card className="p-3 border-cyan-500/20 bg-cyan-950/10 flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-cyan-500/10 text-cyan-400">
                <Globe className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xl font-bold font-mono text-cyan-300">{crawledPages.length}</div>
                <div className="text-[11px] text-muted-foreground uppercase font-semibold">URLs Crawled</div>
              </div>
            </Card>

            <Card className="p-3 border-amber-500/20 bg-amber-950/10 flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xl font-bold font-mono text-amber-300">{issues.length}</div>
                <div className="text-[11px] text-muted-foreground uppercase font-semibold">SEO Issues Detected</div>
              </div>
            </Card>

            <Card className="p-3 border-purple-500/20 bg-purple-950/10 flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-400">
                <Layers className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xl font-bold font-mono text-purple-300">{categories.length - 1}</div>
                <div className="text-[11px] text-muted-foreground uppercase font-semibold">Product Categories</div>
              </div>
            </Card>
          </div>

          {/* Crawler Execution Panel */}
          <Card className="p-4 border-border/70 space-y-3">
            <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
              <div className="flex items-center gap-2 w-full md:w-auto flex-1">
                <Input
                  value={crawlUrl}
                  onChange={(e) => setCrawlUrl(e.target.value)}
                  placeholder="https://centra.ie"
                  className="font-mono text-xs h-9 bg-background/60"
                />
                <Button
                  onClick={handleRunCrawl}
                  disabled={crawling}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white gap-1.5 shrink-0"
                  size="sm"
                >
                  <Play className={`h-3.5 w-3.5 ${crawling ? 'animate-spin' : ''}`} />
                  {crawling ? 'Crawling...' : 'Run Screaming Frog & Scraper'}
                </Button>
              </div>
              <div className="text-xs text-muted-foreground flex items-center gap-2">
                <span>Targets Centra Ireland store offers & SEO tags</span>
              </div>
            </div>
          </Card>

          {/* Main Content Tabs */}
          <Tabs defaultValue="products" className="w-full">
            <TabsList className="grid grid-cols-4 w-full max-w-xl h-10">
              <TabsTrigger value="products" className="text-xs gap-1.5">
                <ShoppingCart className="h-3.5 w-3.5" /> Centra Products ({products.length})
              </TabsTrigger>
              <TabsTrigger value="crawl" className="text-xs gap-1.5">
                <Globe className="h-3.5 w-3.5" /> Crawled URLs ({crawledPages.length})
              </TabsTrigger>
              <TabsTrigger value="issues" className="text-xs gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5" /> SEO Issues ({issues.length})
              </TabsTrigger>
              <TabsTrigger value="terminal" className="text-xs gap-1.5">
                <Terminal className="h-3.5 w-3.5" /> Live Log
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: CENTRA PRODUCTS */}
            <TabsContent value="products" className="space-y-4 pt-3">
              {/* Filter controls */}
              <div className="flex flex-col sm:flex-row gap-2.5 items-center justify-between">
                <div className="relative w-full sm:w-80">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Search products (e.g. Guinness, Merlot, Pork)..."
                    className="pl-8 text-xs h-9"
                  />
                </div>
                <div className="text-xs text-muted-foreground self-end sm:self-center">
                  Showing {filteredProducts.length} of {products.length} products
                </div>
              </div>

              {/* Category Pills */}
              <div className="flex flex-wrap gap-1.5">
                {categories.map((cat) => (
                  <Button
                    key={cat}
                    size="sm"
                    variant={selectedCategory === cat ? 'default' : 'outline'}
                    onClick={() => setSelectedCategory(cat)}
                    className="h-7 text-xs rounded-full px-3"
                  >
                    {cat}
                  </Button>
                ))}
              </div>

              {/* Product Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {filteredProducts.map((p, idx) => (
                  <Card key={`${p.id}-${idx}`} className="p-3 flex flex-col justify-between hover:border-emerald-500/50 transition-colors">
                    <div>
                      {/* Product Image */}
                      <div className="w-full h-36 rounded-md bg-muted/40 overflow-hidden flex items-center justify-center mb-2.5 relative border border-border/40">
                        {p.imageUrl ? (
                          <img
                            src={p.imageUrl}
                            alt={p.name}
                            className="h-full w-full object-contain p-2"
                            loading="lazy"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <ShoppingCart className="h-8 w-8 text-muted-foreground/30" />
                        )}
                        <Badge className="absolute top-1.5 right-1.5 text-[9px] bg-background/80 backdrop-blur font-mono border-border">
                          {p.category}
                        </Badge>
                      </div>

                      {/* Product Title */}
                      <h3 className="font-semibold text-xs leading-tight line-clamp-2" title={p.name}>
                        {p.name}
                      </h3>
                    </div>

                    <div className="mt-3 pt-2 border-t border-border/40 space-y-1.5">
                      <div className="flex items-baseline justify-between">
                        <span className="text-base font-extrabold text-emerald-400 font-mono">
                          {p.offerPrice || 'Promo'}
                        </span>
                        {p.wasPrice && (
                          <span className="text-[11px] text-muted-foreground line-through">
                            {p.wasPrice}
                          </span>
                        )}
                      </div>

                      {p.offerValid && (
                        <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Clock className="h-2.5 w-2.5" />
                          <span className="truncate">{p.offerValid}</span>
                        </div>
                      )}

                      <a
                        href={p.productUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-emerald-400 hover:underline flex items-center justify-end gap-1 pt-1"
                      >
                        View on Centra <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* TAB 2: CRAWLED PAGES (SCREAMING FROG SEO AUDIT) */}
            <TabsContent value="crawl" className="space-y-4 pt-3">
              <div className="flex items-center justify-between gap-3">
                <div className="relative w-full max-w-sm">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    value={urlSearch}
                    onChange={(e) => setUrlSearch(e.target.value)}
                    placeholder="Search crawled URLs or titles..."
                    className="pl-8 text-xs h-9"
                  />
                </div>
                <div className="text-xs text-muted-foreground">
                  Showing {filteredPages.length} of {crawledPages.length} URLs
                </div>
              </div>

              <Card className="overflow-hidden border-border/70">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-muted/50 border-b border-border text-[11px] uppercase tracking-wider text-muted-foreground">
                      <tr>
                        <th className="p-2.5">Status</th>
                        <th className="p-2.5">URL</th>
                        <th className="p-2.5">Title</th>
                        <th className="p-2.5">Time</th>
                        <th className="p-2.5">Links</th>
                        <th className="p-2.5">H1 Count</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {filteredPages.map((page, i) => (
                        <tr key={i} className="hover:bg-muted/30">
                          <td className="p-2.5 font-mono">
                            <Badge
                              variant={
                                page.statusCode === 200
                                  ? 'default'
                                  : (page.statusCode || 0) >= 400
                                  ? 'destructive'
                                  : 'secondary'
                              }
                              className="text-[10px] px-1.5 py-0"
                            >
                              {page.statusCode || '???'}
                            </Badge>
                          </td>
                          <td className="p-2.5 max-w-xs font-mono text-[11px] truncate">
                            <a
                              href={page.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-cyan-400 hover:underline flex items-center gap-1"
                            >
                              <span className="truncate">{page.url}</span>
                              <ExternalLink className="h-2.5 w-2.5 shrink-0" />
                            </a>
                          </td>
                          <td className="p-2.5 max-w-sm truncate text-muted-foreground">
                            {page.pageTitle || <span className="text-red-400 italic">Missing title</span>}
                          </td>
                          <td className="p-2.5 font-mono text-[11px] text-muted-foreground">
                            {page.responseTime}ms
                          </td>
                          <td className="p-2.5 font-mono text-[11px] text-muted-foreground">
                            int: {page.internalLinks.length} | ext: {page.externalLinks.length}
                          </td>
                          <td className="p-2.5 font-mono text-[11px]">
                            {page.h1Tags.length === 0 ? (
                              <span className="text-red-400 font-bold">0</span>
                            ) : page.h1Tags.length > 1 ? (
                              <span className="text-amber-400 font-bold">{page.h1Tags.length}</span>
                            ) : (
                              <span className="text-emerald-400">1</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </TabsContent>

            {/* TAB 3: SEO ISSUES */}
            <TabsContent value="issues" className="space-y-4 pt-3">
              <div className="flex gap-2">
                {['All', 'High', 'Medium', 'Low'].map((sev) => (
                  <Button
                    key={sev}
                    size="sm"
                    variant={issueSeverityFilter === sev ? 'default' : 'outline'}
                    onClick={() => setIssueSeverityFilter(sev)}
                    className="h-7 text-xs"
                  >
                    {sev === 'High' && <AlertOctagon className="h-3 w-3 mr-1 text-red-400" />}
                    {sev === 'Medium' && <AlertTriangle className="h-3 w-3 mr-1 text-amber-400" />}
                    {sev === 'Low' && <CheckCircle2 className="h-3 w-3 mr-1 text-blue-400" />}
                    {sev} ({sev === 'All' ? issues.length : sev === 'High' ? highSeverityCount : sev === 'Medium' ? medSeverityCount : lowSeverityCount})
                  </Button>
                ))}
              </div>

              <div className="space-y-2">
                {filteredIssues.map((issue, idx) => (
                  <Card key={idx} className="p-3 flex items-start gap-3 border-border/70 hover:border-border">
                    <div className="mt-0.5">
                      {issue.severity === 'high' ? (
                        <AlertOctagon className="h-4 w-4 text-red-400" />
                      ) : issue.severity === 'medium' ? (
                        <AlertTriangle className="h-4 w-4 text-amber-400" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4 text-blue-400" />
                      )}
                    </div>
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            issue.severity === 'high'
                              ? 'destructive'
                              : issue.severity === 'medium'
                              ? 'secondary'
                              : 'outline'
                          }
                          className="text-[9px] uppercase font-mono px-1.5"
                        >
                          {issue.severity}
                        </Badge>
                        <span className="font-mono text-xs font-semibold text-foreground">
                          {issue.issueType}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{issue.description}</p>
                      <a
                        href={issue.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] font-mono text-cyan-400 hover:underline flex items-center gap-1"
                      >
                        {issue.url} <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* TAB 4: TERMINAL LOG */}
            <TabsContent value="terminal" className="pt-3">
              <Card className="p-0 overflow-hidden bg-black/90 border-emerald-950">
                <div className="px-4 py-2 border-b border-zinc-800 text-xs font-mono uppercase text-emerald-400 flex items-center gap-2">
                  <Terminal className="h-3.5 w-3.5" /> Crawler Execution Console
                </div>
                <ScrollArea className="h-96">
                  <pre className="p-3 text-[11px] font-mono text-emerald-300 whitespace-pre-wrap">
                    {terminalOutput || 'Click "Run Screaming Frog & Scraper" above to stream crawler console logs.'}
                  </pre>
                </ScrollArea>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </SidebarInset>
    </div>
  );
}
