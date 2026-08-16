// OmniParser bridge — Microsoft's UI parser for screenshots (v1 + v2).
// v2 adds icon captioning (Florence-2) and ~60% faster inference vs v1.
// Returns semantic bounding boxes (buttons, text, icons) that upgrade the
// Computer Use loop from raw pixels to a labeled DOM-like description.
import { getSettings } from './settings';

const url = (p: string) => `${getSettings().agentUrl}${p}`;

export type OmniVersion = 'v1' | 'v2';

export interface OmniElement {
  id: number;
  type: 'text' | 'icon' | 'button' | 'input' | 'other';
  content: string;
  caption?: string; // v2: Florence-2 icon caption
  bbox: [number, number, number, number]; // x1,y1,x2,y2
  interactable: boolean;
  confidence?: number;
}

export interface OmniResult {
  version: OmniVersion;
  width: number;
  height: number;
  elements: OmniElement[];
  annotated_image?: string; // base64 PNG w/ overlays
  latency_ms?: number;
}

export interface OmniParseOptions {
  version?: OmniVersion;         // default v2
  caption_icons?: boolean;       // v2 only
  box_threshold?: number;        // default 0.05
  iou_threshold?: number;        // default 0.1
  use_paddleocr?: boolean;       // default true
}

async function j<T>(r: Response): Promise<T> {
  if (!r.ok) throw new Error(`${r.status}: ${await r.text().catch(() => r.statusText)}`);
  return r.json();
}

/** Install/upgrade OmniParser. Downloads YOLOv8 icon detector + Florence-2 captioner for v2. */
export async function omniInstall(version: OmniVersion = 'v2'): Promise<{ ok: boolean; log: string }> {
  return j(await fetch(url('/omniparser/install'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ version }),
  }));
}

export async function omniStatus(): Promise<{
  available: boolean;
  version?: OmniVersion;
  model?: string;
  caption_model?: string;
  device?: string;
  error?: string;
}> {
  return j(await fetch(url('/omniparser/status')));
}

/** Parse a screenshot. If `image` omitted, the agent will call /screenshot first. */
export async function omniParse(image?: string, opts: OmniParseOptions = {}): Promise<OmniResult> {
  return j(await fetch(url('/omniparser/parse'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      image: image ?? null,
      version: opts.version ?? 'v2',
      caption_icons: opts.caption_icons ?? true,
      box_threshold: opts.box_threshold ?? 0.05,
      iou_threshold: opts.iou_threshold ?? 0.1,
      use_paddleocr: opts.use_paddleocr ?? true,
    }),
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
      const label = e.caption ? `${e.content} — ${e.caption}` : e.content;
      return `#${e.id} [${e.type}] "${label.slice(0, 80)}" @ (${cx},${cy})`;
    })
    .join('\n');
}
