// yt-dlp bridge — runs yt-dlp on the AM06 host via the agent's /terminal endpoint.
import { getSettings } from './settings';

const DIR = '~/.aiapp/downloads';

async function sh(command: string, timeoutMs = 900_000) {
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

export type YtFormat = 'best' | 'video1080' | 'video720' | 'audio';

function formatArgs(f: YtFormat) {
  switch (f) {
    case 'audio': return `-x --audio-format mp3`;
    case 'video720': return `-f "bv*[height<=720]+ba/b[height<=720]" --merge-output-format mp4`;
    case 'video1080': return `-f "bv*[height<=1080]+ba/b[height<=1080]" --merge-output-format mp4`;
    default: return `-f "bv*+ba/b" --merge-output-format mp4`;
  }
}

export const ytdlp = {
  dir: DIR,
  install: () => sh(`
    (python3 -m pip install -U --break-system-packages yt-dlp || python3 -m pip install -U yt-dlp || pipx install yt-dlp) 2>&1 | tail -5;
    which ffmpeg >/dev/null 2>&1 || (sudo apt-get update && sudo apt-get install -y ffmpeg) || brew install ffmpeg || true;
    mkdir -p ${DIR};
    yt-dlp --version`),
  version: () => sh(`yt-dlp --version 2>&1; ffmpeg -version 2>/dev/null | head -1`),
  update: () => sh(`yt-dlp -U 2>&1 | tail -5 || python3 -m pip install -U --break-system-packages yt-dlp 2>&1 | tail -3`),
  info: (url: string) =>
    sh(`yt-dlp --no-warnings -J --flat-playlist ${q(url)} 2>&1 | head -c 400000`, 180_000),
  listFormats: (url: string) => sh(`yt-dlp --no-warnings -F ${q(url)} 2>&1 | tail -60`, 180_000),
  download: (url: string, format: YtFormat = 'best', extra = '') =>
    sh(`mkdir -p ${DIR}; cd ${DIR} && yt-dlp --newline --no-warnings ${formatArgs(format)} ${extra} -o "%(title).150s [%(id)s].%(ext)s" ${q(url)} 2>&1 | tail -40`),
  subtitles: (url: string) =>
    sh(`mkdir -p ${DIR}; cd ${DIR} && yt-dlp --skip-download --write-auto-subs --write-subs --sub-langs "en.*" --convert-subs srt ${q(url)} 2>&1 | tail -20`, 300_000),
  list: () => sh(`ls -1t ${DIR} 2>/dev/null | head -60`),
  remove: (name: string) => sh(`rm -f ${DIR}/${q(name).slice(1, -1) ? q(name) : q(name)}`),
};
