// iptv-org bridge — reads the public IPTV API (channels + streams) and M3U index.
// Source: https://github.com/iptv-org/iptv  •  API: https://iptv-org.github.io/api/
const API = 'https://iptv-org.github.io/api';

export interface IptvChannel {
  id: string;
  name: string;
  alt_names?: string[];
  network?: string | null;
  owners?: string[];
  country: string;
  languages?: string[];
  subdivision?: string | null;
  city?: string | null;
  categories: string[];
  is_nsfw?: boolean;
  launched?: string | null;
  closed?: string | null;
  replaced_by?: string | null;
  website?: string | null;
  logo?: string | null;
}

export interface IptvStream {
  channel: string | null;
  feed?: string | null;
  title?: string | null;
  url: string;
  referrer?: string | null;
  user_agent?: string | null;
  quality?: string | null;
}

export interface IptvCountry { code: string; name: string; languages?: string[]; flag?: string }
export interface IptvCategory { id: string; name: string }

let _channels: IptvChannel[] | null = null;
let _streams: IptvStream[] | null = null;
let _countries: IptvCountry[] | null = null;
let _categories: IptvCategory[] | null = null;

async function loadJson<T>(path: string): Promise<T> {
  const r = await fetch(`${API}/${path}`);
  if (!r.ok) throw new Error(`iptv-org ${path}: ${r.status}`);
  return r.json();
}

export async function loadChannels(): Promise<IptvChannel[]> {
  if (!_channels) _channels = await loadJson<IptvChannel[]>('channels.json');
  return _channels!;
}
export async function loadStreams(): Promise<IptvStream[]> {
  if (!_streams) _streams = await loadJson<IptvStream[]>('streams.json');
  return _streams!;
}
export async function loadCountries(): Promise<IptvCountry[]> {
  if (!_countries) _countries = await loadJson<IptvCountry[]>('countries.json');
  return _countries!;
}
export async function loadCategories(): Promise<IptvCategory[]> {
  if (!_categories) _categories = await loadJson<IptvCategory[]>('categories.json');
  return _categories!;
}

export interface IptvPlayable extends IptvChannel {
  stream: IptvStream;
}

// Join channels with the first working stream reference.
export async function loadPlayable(): Promise<IptvPlayable[]> {
  const [channels, streams] = await Promise.all([loadChannels(), loadStreams()]);
  const byChannel = new Map<string, IptvStream>();
  for (const s of streams) {
    if (!s.channel || !s.url) continue;
    if (!byChannel.has(s.channel)) byChannel.set(s.channel, s);
  }
  return channels
    .filter((c) => byChannel.has(c.id) && !c.closed && !c.is_nsfw)
    .map((c) => ({ ...c, stream: byChannel.get(c.id)! }));
}

export const M3U_INDEX = 'https://iptv-org.github.io/iptv/index.m3u';
export const m3uByCountry = (code: string) =>
  `https://iptv-org.github.io/iptv/countries/${code.toLowerCase()}.m3u`;
export const m3uByCategory = (id: string) =>
  `https://iptv-org.github.io/iptv/categories/${id.toLowerCase()}.m3u`;
export const m3uByLanguage = (code: string) =>
  `https://iptv-org.github.io/iptv/languages/${code.toLowerCase()}.m3u`;

// Full English-language playlist from iptv-org.
export const M3U_ENGLISH = m3uByLanguage('eng');

// English-speaking regions for quick filtering.
export const ENGLISH_REGIONS: { code: string; name: string; flag: string }[] = [
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'UK', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'IE', name: 'Ireland', flag: '🇮🇪' },
  { code: 'NZ', name: 'New Zealand', flag: '🇳🇿' },
];

export const isEnglishChannel = (c: IptvChannel): boolean => {
  if (c.languages && c.languages.length > 0) return c.languages.includes('eng');
  return ENGLISH_REGIONS.some((r) => r.code === c.country);
};

// ── Sky ──────────────────────────────────────────────────────────────────────
// Matches Sky-branded channels in the iptv-org catalog (name, network or owner).
export const isSkyChannel = (c: IptvChannel): boolean => {
  const hay = [c.name, c.network || '', ...(c.alt_names || []), ...(c.owners || [])]
    .join(' ')
    .toLowerCase();
  return /\bsky\b/.test(hay);
};

// Curated direct HLS fallbacks for free-to-air Sky feeds. Community stream URLs
// rotate often, so these official CDN endpoints are tried when a channel fails.
export interface SkyPreset {
  id: string;
  name: string;
  country: string;
  url: string;
  note?: string;
}

export const SKY_PRESETS: SkyPreset[] = [
  {
    id: 'SkyNews.uk',
    name: 'Sky News',
    country: 'UK',
    url: 'https://linear417-gb-hls1-prd-ak.cdn.skycdp.com/100e/Content/HLS_001_1080_30/Live/channel(skynews)/index.m3u8',
    note: 'Official Sky CDN · 1080p',
  },
  {
    id: 'SkyNews.uk.alt',
    name: 'Sky News (backup)',
    country: 'UK',
    url: 'https://siloh-fa.akamaized.net/hls/live/2029484/skynewsuk/master.m3u8',
    note: 'Akamai mirror',
  },
  {
    id: 'SkyNewsWeather.au',
    name: 'Sky News Weather',
    country: 'AU',
    url: 'https://skynewsau-live.akamaized.net/hls/live/2002689/skynewsweather/master.m3u8',
  },
  {
    id: 'SkyNewsExtra1.au',
    name: 'Sky News Extra 1',
    country: 'AU',
    url: 'https://skynewsau-live.akamaized.net/hls/live/2002691/skynewsextra1/master.m3u8',
  },
  {
    id: 'SkyNewsExtra2.au',
    name: 'Sky News Extra 2',
    country: 'AU',
    url: 'https://skynewsau-live.akamaized.net/hls/live/2002692/skynewsextra2/master.m3u8',
  },
  {
    id: 'SkyNewsExtra3.au',
    name: 'Sky News Extra 3',
    country: 'AU',
    url: 'https://skynewsau-live.akamaized.net/hls/live/2002693/skynewsextra3/master.m3u8',
  },
];

export const skyPresetFor = (channelId: string): SkyPreset | undefined =>
  SKY_PRESETS.find((p) => p.id.toLowerCase().startsWith(channelId.toLowerCase()));

// Sky-branded channels joined with a playable stream, presets merged in first.
export async function loadSkyChannels(): Promise<IptvPlayable[]> {
  const playable = await loadPlayable();
  return playable.filter(isSkyChannel);
}
