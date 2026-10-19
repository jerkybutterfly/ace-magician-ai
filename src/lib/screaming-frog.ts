import { getSettings } from './settings';

export interface ScrapedProduct {
  id: string;
  name: string;
  category: string;
  categoryId: number;
  offerPrice: string;
  wasPrice: string;
  offerValid: string;
  productUrl: string;
  imageUrl: string;
  varietyId?: string;
}

export interface CrawledPage {
  url: string;
  statusCode?: number;
  pageTitle?: string;
  metaDescription?: string;
  h1Tags: string[];
  responseTime: number;
  contentType?: string;
  contentLength?: number;
  internalLinks: string[];
  externalLinks: string[];
}

export interface SeoIssue {
  url: string;
  issueType: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
}

export const screamingFrogService = {
  async getLocalProducts(): Promise<ScrapedProduct[]> {
    try {
      const res = await fetch('/centra_products.json');
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Failed to load /centra_products.json:', e);
    }
    return [];
  },

  async getLocalCrawl(): Promise<CrawledPage[]> {
    try {
      const res = await fetch('/centra_seo_crawl.json');
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Failed to load /centra_seo_crawl.json:', e);
    }
    return [];
  },

  async getLocalIssues(): Promise<SeoIssue[]> {
    try {
      const res = await fetch('/centra_seo_issues.json');
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Failed to load /centra_seo_issues.json:', e);
    }
    return [];
  },

  async runCrawl(url = 'https://centra.ie', maxUrls = 50, depth = 2): Promise<{ ok: boolean; stdout: string; stderr: string }> {
    const { agentUrl } = getSettings();
    const ctrl = new AbortController();
    const timeout = setTimeout(() => ctrl.abort(), 600_000); // 10 min
    const command = `cd "screaming-frog-seo-crawler" && npx tsx run_screaming_frog_centra.ts "${url}" ${maxUrls} ${depth}`;

    try {
      const res = await fetch(`${agentUrl}/terminal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command }),
        signal: ctrl.signal,
      });
      const data = await res.json().catch(() => ({}));
      return {
        ok: res.ok,
        stdout: (data.stdout ?? '') as string,
        stderr: (data.stderr ?? '') as string,
      };
    } finally {
      clearTimeout(timeout);
    }
  },
};
