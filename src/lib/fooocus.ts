// Client bridge for Fooocus (Stable Diffusion XL) running locally on the mini PC.
// Fooocus exposes a Gradio UI on :7865 and an HTTP API on /v1/generation/text-to-image
// when started with the API enabled. Install & start scripts live at public/fooocus_*.sh.
import { getSettings } from './settings';

const DEFAULT_URL = 'http://localhost:7865';

export function getFooocusUrl(): string {
  try {
    return (localStorage.getItem('fooocus-url') || DEFAULT_URL).replace(/\/$/, '');
  } catch {
    return DEFAULT_URL;
  }
}

export function setFooocusUrl(url: string) {
  localStorage.setItem('fooocus-url', url.replace(/\/$/, ''));
}

export async function fooocusPing(): Promise<boolean> {
  try {
    const res = await fetch(`${getFooocusUrl()}/`, { method: 'GET' });
    return res.ok;
  } catch {
    return false;
  }
}

/** Run the install script on the host via the Python agent's /terminal endpoint. */
export async function installFooocus(): Promise<{ ok: boolean; stdout: string; stderr: string }> {
  const { agentUrl } = getSettings();
  const res = await fetch(`${agentUrl}/terminal`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ command: 'bash ~/pesto/fooocus_install.sh || bash /tmp/fooocus_install.sh' }),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, stdout: data.stdout ?? '', stderr: data.stderr ?? '' };
}

export async function startFooocus(): Promise<{ ok: boolean; stdout: string; stderr: string }> {
  const { agentUrl } = getSettings();
  const res = await fetch(`${agentUrl}/terminal`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ command: 'bash ~/pesto/fooocus_start.sh || bash /tmp/fooocus_start.sh' }),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, stdout: data.stdout ?? '', stderr: data.stderr ?? '' };
}

export async function stopFooocus(): Promise<{ ok: boolean }> {
  const { agentUrl } = getSettings();
  const res = await fetch(`${agentUrl}/terminal`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ command: 'kill $(cat ~/Fooocus/fooocus.pid) 2>/dev/null; rm -f ~/Fooocus/fooocus.pid' }),
  });
  return { ok: res.ok };
}

export interface FooocusJob {
  prompt: string;
  negative?: string;
  aspect?: string; // e.g. "1152*896"
  steps?: number;
  guidance?: number;
  seed?: number;
  performance?: 'Speed' | 'Quality' | 'Extreme Speed' | 'Lightning';
}

export interface FooocusImage {
  url: string;      // full URL to the produced image (already includes host)
  seed?: number;
}

/**
 * Call Fooocus's text-to-image endpoint. Requires Fooocus started with `--api`
 * (Fooocus API extension) — falls back to a helpful error message otherwise.
 */
export async function generate(job: FooocusJob): Promise<FooocusImage[]> {
  const base = getFooocusUrl();
  const body = {
    prompt: job.prompt,
    negative_prompt: job.negative ?? '',
    aspect_ratios_selection: job.aspect ?? '1152*896',
    performance_selection: job.performance ?? 'Speed',
    image_number: 1,
    guidance_scale: job.guidance ?? 4,
    sharpness: 2,
    image_seed: job.seed ?? -1,
    steps: job.steps,
    async_process: false,
  };

  const res = await fetch(`${base}/v1/generation/text-to-image`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(
      `Fooocus API returned ${res.status}. Make sure Fooocus is running with the API extension enabled.`,
    );
  }
  const data: Array<{ url?: string; base64?: string; seed?: number }> = await res.json();
  return data.map((d) => ({
    url: d.url
      ? (d.url.startsWith('http') ? d.url : `${base}${d.url.startsWith('/') ? '' : '/'}${d.url}`)
      : `data:image/png;base64,${d.base64 ?? ''}`,
    seed: d.seed,
  }));
}
