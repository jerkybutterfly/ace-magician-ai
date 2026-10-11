import { useEffect, useRef } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { MapPoint } from '@/lib/pythia';

const COLORS: Record<string, string> = {
  earthquake: '#f97316', forecast: '#22c55e', conflict: '#ef4444', wildfires: '#facc15',
  'severe storms': '#38bdf8', volcanoes: '#dc2626', weather: '#38bdf8', cyber: '#a855f7',
};
const colorFor = (k: string) => COLORS[k] ?? Object.entries(COLORS).find(([n]) => k.includes(n))?.[1] ?? '#e5e7eb';

export default function WorldEventsMap({ points, globe = true }: { points: MapPoint[]; globe?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const loaded = useRef(false);
  const pointsRef = useRef(points);
  pointsRef.current = points;

  const toGeo = (pts: MapPoint[]) => ({
    type: 'FeatureCollection' as const,
    features: pts.map((p) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [p.lng, p.lat] },
      properties: { title: p.title, kind: p.kind, detail: p.detail ?? '', url: p.url ?? '', color: colorFor(p.kind) },
    })),
  });

  useEffect(() => {
    if (!ref.current) return;
    const map = new maplibregl.Map({
      container: ref.current,
      center: [0, 25],
      zoom: 1.3,
      attributionControl: { compact: true },
      style: {
        version: 8,
        projection: { type: globe ? 'globe' : 'mercator' },
        sources: {
          base: {
            type: 'raster',
            tiles: ['https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png', 'https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png'],
            tileSize: 256,
            attribution: '&copy; OpenStreetMap contributors, &copy; CARTO',
          },
        },
        layers: [
          { id: 'bg', type: 'background', paint: { 'background-color': '#000' } },
          { id: 'base', type: 'raster', source: 'base' },
        ],
      },
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
    map.on('load', () => {
      map.addSource('events', { type: 'geojson', data: toGeo(pointsRef.current) });
      map.addLayer({
        id: 'events', type: 'circle', source: 'events',
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 1, 3.5, 8, 8],
          'circle-color': ['get', 'color'],
          'circle-opacity': 0.85,
          'circle-stroke-width': 1,
          'circle-stroke-color': '#000',
        },
      });
      map.on('click', 'events', (e) => {
        const f = e.features?.[0];
        if (!f) return;
        const p = f.properties as Record<string, string>;
        const el = document.createElement('div');
        el.style.color = '#111';
        el.style.fontSize = '12px';
        const t = document.createElement('div'); t.style.fontWeight = '600'; t.textContent = p.title; el.appendChild(t);
        const k = document.createElement('div'); k.textContent = p.kind + (p.detail ? ` · ${p.detail}` : ''); el.appendChild(k);
        if (p.url) { const a = document.createElement('a'); a.href = p.url; a.target = '_blank'; a.rel = 'noreferrer'; a.textContent = 'Open source'; el.appendChild(a); }
        new maplibregl.Popup({ maxWidth: '260px' }).setLngLat(e.lngLat).setDOMContent(el).addTo(map);
      });
      map.on('mouseenter', 'events', () => { map.getCanvas().style.cursor = 'pointer'; });
      map.on('mouseleave', 'events', () => { map.getCanvas().style.cursor = ''; });
      loaded.current = true;
    });
    mapRef.current = map;
    return () => { loaded.current = false; map.remove(); mapRef.current = null; };
  }, [globe]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !loaded.current) return;
    (map.getSource('events') as maplibregl.GeoJSONSource | undefined)?.setData(toGeo(points));
  }, [points]);

  return <div ref={ref} className="absolute inset-0" />;
}
