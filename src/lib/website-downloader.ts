// Complete Website Downloader bridge — mirrors a site to the AM06 host via httrack/wget
// (repo: https://github.com/badrshs/Complete-Website-Downloader).
import { getSettings } from './settings';

const DIR = '~/.aiapp/websites';

async function sh(command: string, timeoutMs = 1_800_000) {
  const { agentUrl } = getSettings();
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const r = await fetch(`${agentUrl}/terminal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command }),
      signal: ctrl.signal,
    });
    const data = await r.json().catch(() => ({}));
    return { ok: r.ok, stdout: (data.stdout ?? '') as string, stderr: (data.stderr ?? '') as string };
  } finally { clearTimeout(t); }
}

const q = (s: string) => `'${s.replace(/'/g, `'\\''`)}'`;

export type Engine = 'httrack' | 'wget';

export interface DownloadOpts {
  url: string;
  engine?: Engine;
  depth?: number;      // recursion depth
  sameHost?: boolean;  // stay on same domain
  assetsOnly?: boolean; // page-requisites only
}

function slug(url: string) {
  try {
    const u = new URL(url);
    return (u.hostname + u.pathname).replace(/[^a-z0-9.-]+/gi, '_').replace(/_+$/,'') || 'site';
  } catch { return 'site'; }
}

export const websiteDownloader = {
  dir: DIR,
  install: () => sh(`
    mkdir -p ${DIR};
    (which httrack >/dev/null 2>&1 || sudo apt-get update && sudo apt-get install -y httrack) 2>&1 | tail -5;
    (which wget >/dev/null 2>&1 || sudo apt-get install -y wget) 2>&1 | tail -3;
    httrack --version 2>&1 | head -1;
    wget --version 2>&1 | head -1`, 600_000),
  version: () => sh(`httrack --version 2>&1 | head -1; echo ---; wget --version 2>&1 | head -1`),
  download: (o: DownloadOpts) => {
    const name = slug(o.url);
    const depth = o.depth ?? 3;
    if ((o.engine ?? 'httrack') === 'httrack') {
      const scope = o.sameHost === false ? '' : `-%v +*.${(() => { try { return new URL(o.url).hostname; } catch { return ''; } })()}/*`;
      return sh(`mkdir -p ${DIR}/${q(name)} && cd ${DIR}/${q(name)} && \
        httrack ${q(o.url)} -O . -r${depth} ${o.assetsOnly ? '-p3' : ''} ${scope} --robots=0 --disable-security-limits -*.mp4 -*.zip 2>&1 | tail -60`);
    }
    const wOpts = [
      '--mirror', '--convert-links', '--adjust-extension', '--page-requisites',
      '--no-parent', o.sameHost === false ? '' : '--domains=' + (() => { try { return new URL(o.url).hostname; } catch { return ''; } })(),
      `--level=${o.assetsOnly ? 1 : depth}`, '-e robots=off', '--tries=2', '--timeout=30',
    ].filter(Boolean).join(' ');
    return sh(`mkdir -p ${DIR}/${q(name)} && cd ${DIR}/${q(name)} && wget ${wOpts} ${q(o.url)} 2>&1 | tail -60`);
  },
  list: () => sh(`ls -1t ${DIR} 2>/dev/null | head -60`),
  size: (name: string) => sh(`du -sh ${DIR}/${q(name)} 2>/dev/null`),
  archive: (name: string) => sh(`cd ${DIR} && tar czf ${q(name + '.tar.gz')} ${q(name)} && ls -lh ${q(name + '.tar.gz')}`),
  remove: (name: string) => sh(`rm -rf ${DIR}/${q(name)} ${DIR}/${q(name + '.tar.gz')}`),
  openPath: () => DIR,
};
