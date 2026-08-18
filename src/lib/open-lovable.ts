// open-lovable bridge — clone any website into a React component.
// Scrapes the target URL with Firecrawl, then asks the local LLM (via the
// smart router / default model) to synthesize a single-file React + Tailwind
// component that recreates the page.
import { getSettings } from './settings';
import { generateText } from './ollama';

export interface ScrapeResult {
  markdown: string;
  html: string;
  title: string;
  description: string;
  sourceURL: string;
  screenshot?: string;
  links: string[];
}

const FIRECRAWL_V2 = 'https://api.firecrawl.dev/v2';

/** Scrape a URL via the Firecrawl v2 API (direct, key from settings). */
export async function scrapeSite(url: string, wantScreenshot = false): Promise<ScrapeResult> {
  const { firecrawlKey } = getSettings();
  if (!firecrawlKey) {
    throw new Error('Firecrawl API key missing. Add it in Settings → Firecrawl API Key (get one free at firecrawl.dev).');
  }
  const formats: (string | Record<string, unknown>)[] = ['markdown', 'html', 'links'];
  if (wantScreenshot) formats.push('screenshot');

  const res = await fetch(`${FIRECRAWL_V2}/scrape`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${firecrawlKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url, formats, onlyMainContent: false }),
  });
  const data = await res.json().catch(() => ({} as Record<string, unknown>));
  if (!res.ok) {
    throw new Error((data as { error?: string }).error ?? `Firecrawl error ${res.status}`);
  }
  // v2 may nest under .data or return at top level
  const doc = ((data as { data?: Record<string, unknown> }).data ?? data) as Record<string, unknown>;
  const md = (doc.markdown as string) ?? '';
  const html = (doc.html as string) ?? '';
  const links = (doc.links as string[]) ?? [];
  const screenshot = doc.screenshot as string | undefined;
  const meta = (doc.metadata as Record<string, string> | undefined) ?? {};
  return {
    markdown: md,
    html,
    title: meta.title ?? url,
    description: meta.description ?? '',
    sourceURL: meta.sourceURL ?? url,
    screenshot,
    links: links.slice(0, 40),
  };
}

/** Ask the local LLM to build a React + Tailwind component that mirrors the scrape. */
export async function generateReactClone(site: ScrapeResult, extraInstructions = ''): Promise<string> {
  const md = site.markdown.slice(0, 12000);
  const prompt = `You are a senior React engineer. Recreate the following website as a single self-contained React functional component using Tailwind CSS classes. Use semantic HTML, responsive layout, and shadcn/ui-style spacing. Do NOT import any external libraries other than React. Return ONLY the code inside a single \`\`\`tsx code block — no prose.

Site title: ${site.title}
Description: ${site.description}
Source URL: ${site.sourceURL}

${extraInstructions ? `Extra requirements: ${extraInstructions}\n` : ''}
Markdown of the page (structure + copy to preserve):
"""
${md}
"""

Output the component as:
\`\`\`tsx
export default function ClonedSite() {
  return (
    // ...JSX here
  );
}
\`\`\``;
  const out = await generateText(prompt);
  // Extract the first tsx/jsx/ts code fence if present, else raw output.
  const match = out.match(/```(?:tsx|jsx|ts|js)?\n([\s\S]*?)```/);
  return (match ? match[1] : out).trim();
}
