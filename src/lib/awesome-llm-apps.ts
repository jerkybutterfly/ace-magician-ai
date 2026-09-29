// awesome-llm-apps browser — fetches the Shubhamsaboo/awesome-llm-apps repo tree
// from the public GitHub API and groups the example apps by category folder.

export interface AwesomeApp {
  name: string;
  path: string; // repo-relative path
  category: string;
  url: string; // GitHub web URL
}

const REPO = 'Shubhamsaboo/awesome-llm-apps';
const API = `https://api.github.com/repos/${REPO}/git/trees/main?recursive=1`;
const WEB = `https://github.com/${REPO}/tree/main`;

// Pretty names for known top-level category folders
const CATEGORY_NAMES: Record<string, string> = {
  'ai_agents': 'AI Agents',
  'rag_apps': 'RAG Apps',
  'llm_apps_with_memory': 'LLM Apps with Memory',
  'chat_with_X_tutorials': 'Chat-with-X Tutorials',
  'llm_finetuning_tutorials': 'Fine-tuning Tutorials',
  'advanced_ai_agents': 'Advanced AI Agents',
  'starter_ai_agents': 'Starter AI Agents',
  'voice_ai_agents': 'Voice AI Agents',
  'mcp_ai_agents': 'MCP AI Agents',
  'game_playing_ai_agents': 'Game-playing Agents',
  'multi_agent_teams': 'Multi-agent Teams',
  'ai_agent_framework_crash_course': 'Agent Framework Crash Course',
};

function titleCase(slug: string): string {
  return slug
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/\bAi\b/g, 'AI')
    .replace(/\bLlm\b/g, 'LLM')
    .replace(/\bRag\b/g, 'RAG')
    .replace(/\bMcp\b/g, 'MCP')
    .replace(/\bX\b/g, 'X');
}

export function prettyCategory(slug: string): string {
  return CATEGORY_NAMES[slug] ?? titleCase(slug);
}

interface TreeNode { path: string; type: 'blob' | 'tree' }

let cache: AwesomeApp[] | null = null;

// Fetches the repo tree and returns every example-app folder (depth ≥ 2 under a category).
export async function fetchAwesomeApps(force = false): Promise<AwesomeApp[]> {
  if (cache && !force) return cache;
  const r = await fetch(API, { headers: { Accept: 'application/vnd.github+json' } });
  if (!r.ok) throw new Error(`GitHub API error ${r.status}`);
  const data = (await r.json()) as { tree: TreeNode[]; truncated?: boolean };

  const apps = new Map<string, AwesomeApp>();
  for (const node of data.tree) {
    if (node.type !== 'tree') continue;
    const parts = node.path.split('/');
    if (parts.length < 2) continue;
    const category = parts[0];
    // Skip meta folders
    if (category.startsWith('.') || category === 'docs' || category === 'assets') continue;
    // The app folder is the second segment; deeper nesting belongs to the same app
    const appSlug = parts[1];
    const key = `${category}/${appSlug}`;
    if (!apps.has(key)) {
      apps.set(key, {
        name: titleCase(appSlug),
        path: key,
        category: prettyCategory(category),
        url: `${WEB}/${key}`,
      });
    }
  }
  cache = [...apps.values()].sort((a, b) => a.name.localeCompare(b.name));
  return cache;
}

export function groupByCategory(apps: AwesomeApp[]): Map<string, AwesomeApp[]> {
  const map = new Map<string, AwesomeApp[]>();
  for (const app of apps) {
    const list = map.get(app.category) ?? [];
    list.push(app);
    map.set(app.category, list);
  }
  return new Map([...map.entries()].sort((a, b) => a[0].localeCompare(b[0])));
}
