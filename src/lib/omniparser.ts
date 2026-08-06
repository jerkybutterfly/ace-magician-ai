// OmniParser bridge — Microsoft's UI parser for screenshots.
// Returns semantic bounding boxes (buttons, text, icons) that upgrade the
// Computer Use loop from raw pixels to a labeled DOM-like description.
import { getSettings } from './settings';

const url = (p: string) => `${getSettings().agentUrl}${p}`;

export interface OmniElement {
  id: number;
  type: 'text' | 'icon' | 'button' | 'input' | 'other';
  content: string;
  bbox: [number, number, number, number]; // x1,y1,x2,y2
  interactable: boolean;
  confidence?: number;
}

export interface OmniResult {
  width: number;
  height: number;
  elements: OmniElement[];
  annotated_image?: string; // base64 PNG w/ overlays
  latency_ms?: number;
}

async function j<T>(r: Response): Promise<T> {
  if (!r.ok) throw new Error(`${r.status}: ${await r.text().catch(() => r.statusText)}`);
  return r.json();
}

export async function omniInstall(): Promise<{ ok: boolean; log: string }> {
  return j(await fetch(url('/omniparser/install'), { method: 'POST' }));
}

export async function omniStatus(): Promise<{ available: boolean; model?: string; error?: string }> {
  return j(await fetch(url('/omniparser/status')));
}

/** Parse a screenshot. If `image` omitted, the agent will call /screenshot first. */
export async function omniParse(image?: string): Promise<OmniResult> {
  return j(await fetch(url('/omniparser/parse'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: image ?? null }),
  }));
}

/** Convert parsed elements into a compact text prompt for the vision model. */
export function elementsToPrompt(res: OmniResult): string {
  return res.elements
    .filter((e) => e.interactable || e.type === 'text')
    .slice(0, 60)
    .map((e) => {
      const [x1, y1, x2, y2] = e.bbox;
      const cx = Math.round((x1 + x2) / 2);
      const cy = Math.round((y1 + y2) / 2);
      return `#${e.id} [${e.type}] "${e.content.slice(0, 60)}" @ (${cx},${cy})`;
    })
    .join('\n');
}
