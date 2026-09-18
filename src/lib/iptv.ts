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
