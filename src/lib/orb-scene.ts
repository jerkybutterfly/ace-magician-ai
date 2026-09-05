/*
 * ULTRON World Map — interactive holographic Earth with street-level detail.
 * Rendered with MapLibre GL (globe projection).
 * Imagery: Esri World Imagery. Roads/labels: CARTO dark basemap (OpenStreetMap data).
 * Terrain: AWS Terrain Tiles (Terrarium).
 */
import maplibregl, { type Map as MapLibreMap } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export interface OrbSceneApi {
  rotateBy(deltaTheta: number, deltaPhi: number): void;
  zoomBy(factor: number): void;
  zoomIn(): void;
  zoomOut(): void;
  flyToPlace(query: string): Promise<boolean>;
  resetView(): void;
  dispose(): void;
}

const HOME = { center: [-6.26, 40] as [number, number], zoom: 1.6, pitch: 0, bearing: 0 };
const MIN_ZOOM = 0.8;
const MAX_ZOOM = 19;

export function createOrbScene(container: HTMLElement): OrbSceneApi {
  const host = document.createElement("div");
  host.className = "ultron-map";
  host.style.position = "absolute";
  host.style.inset = "0";
  container.appendChild(host);

  const map: MapLibreMap = new maplibregl.Map({
    container: host,
    attributionControl: { compact: true },
    center: HOME.center,
    zoom: HOME.zoom,
    minZoom: MIN_ZOOM,
    maxZoom: MAX_ZOOM,
    maxPitch: 85,
    dragRotate: true,
    style: {
      version: 8,
      projection: { type: "globe" },
      glyphs: "https://fonts.openmaptiles.org/{fontstack}/{range}.pbf",
      sources: {
        satellite: {
          type: "raster",
          tiles: [
            "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          ],
          tileSize: 256,
          maxzoom: 19,
          attribution: "Imagery &copy; Esri",
        },
        roads: {
          type: "raster",
          tiles: [
            "https://a.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}@2x.png",
            "https://b.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}@2x.png",
          ],
          tileSize: 256,
          maxzoom: 19,
          attribution: "&copy; OpenStreetMap contributors, &copy; CARTO",
        },
        terrain: {
          type: "raster-dem",
          tiles: ["https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png"],
          encoding: "terrarium",
          tileSize: 256,
          maxzoom: 14,
        },
      },
      layers: [
        { id: "space", type: "background", paint: { "background-color": "#000000" } },
        { id: "satellite", type: "raster", source: "satellite", paint: { "raster-saturation": -0.2, "raster-contrast": 0.12 } },
        {
          id: "grid-hillshade",
          type: "hillshade",
          source: "terrain",
          paint: { "hillshade-exaggeration": 0.35, "hillshade-highlight-color": "#ffd17a", "hillshade-shadow-color": "#04070d" },
        },
        { id: "labels", type: "raster", source: "roads", paint: { "raster-opacity": 0.85 } },
      ],
      sky: {
        "sky-color": "#03060c",
        "horizon-color": "#ff9d2b",
        "fog-color": "#050a12",
        "sky-horizon-blend": 0.6,
        "horizon-fog-blend": 0.5,
        "fog-ground-blend": 0.4,
      },
    },
  });

  map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "bottom-right");
  map.addControl(new maplibregl.ScaleControl({ unit: "metric" }), "bottom-left");
  map.addControl(new maplibregl.GeolocateControl({ trackUserLocation: false }), "bottom-right");

  let spinning = true;
  let rafId = 0;
  let disposed = false;

  map.on("load", () => {
    try {
      map.setTerrain({ source: "terrain", exaggeration: 1.25 });
    } catch {
      /* terrain is optional */
    }
  });

  const stopSpin = () => {
    spinning = false;
  };
  map.on("mousedown", stopSpin);
  map.on("touchstart", stopSpin);
  map.on("wheel", stopSpin);

  function tick() {
    if (disposed) return;
    rafId = requestAnimationFrame(tick);
    if (!spinning || map.isMoving() || map.getZoom() > 4) return;
    const center = map.getCenter();
    map.setCenter([center.lng + 0.035, center.lat]);
  }
  tick();

  function rotateBy(deltaTheta: number, deltaPhi: number) {
    stopSpin();
    const scale = 180 / Math.PI / Math.max(map.getZoom(), 1);
    const center = map.getCenter();
    map.setCenter([
      center.lng - deltaTheta * scale,
      Math.max(-85, Math.min(85, center.lat + deltaPhi * scale)),
    ]);
  }

  function zoomBy(factor: number) {
    stopSpin();
    // factor < 1 means "closer" in the old orb API.
    map.easeTo({ zoom: clamp(map.getZoom() - Math.log2(factor)), duration: 260 });
  }

  function clamp(z: number) {
    return Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, z));
  }

  async function flyToPlace(query: string) {
    const term = query.trim();
    if (!term) return false;
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(term)}`,
        { headers: { Accept: "application/json" } },
      );
      if (!response.ok) return false;
      const results = (await response.json()) as Array<{ lat: string; lon: string }>;
      if (!results.length) return false;
      stopSpin();
      map.flyTo({
        center: [Number(results[0].lon), Number(results[0].lat)],
        zoom: 16.5,
        pitch: 62,
        duration: 2600,
        essential: true,
      });
      return true;
    } catch {
      return false;
    }
  }

  return {
    rotateBy,
    zoomBy,
    flyToPlace,
    zoomIn: () => {
      stopSpin();
      map.easeTo({ zoom: clamp(map.getZoom() + 1), duration: 280 });
    },
    zoomOut: () => {
      stopSpin();
      map.easeTo({ zoom: clamp(map.getZoom() - 1), duration: 280 });
    },
    resetView: () => {
      spinning = true;
      map.easeTo({ ...HOME, duration: 900 });
    },
    dispose: () => {
      disposed = true;
      cancelAnimationFrame(rafId);
      map.remove();
      host.remove();
    },
  };
}
