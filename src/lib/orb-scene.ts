/*
 * ULTRON World Map — interactive holographic Earth.
 * Earth imagery: NASA-derived Three.js example textures.
 * Country boundaries: Natural Earth public-domain data.
 */
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import earthDayUrl from "@/assets/earth/earth-day.jpg";
import earthNormalUrl from "@/assets/earth/earth-normal.jpg";
import earthSpecularUrl from "@/assets/earth/earth-specular.jpg";
import earthCloudsUrl from "@/assets/earth/earth-clouds.png";
import earthLightsUrl from "@/assets/earth/earth-lights.png";
import countriesUrl from "@/assets/earth/countries.geojson?url";

export interface OrbSceneApi {
  rotateBy(deltaTheta: number, deltaPhi: number): void;
  zoomBy(factor: number): void;
  zoomIn(): void;
  zoomOut(): void;
  resetView(): void;
  dispose(): void;
}

type GeoPosition = [number, number];
type GeoGeometry = {
  type: "Polygon" | "MultiPolygon";
  coordinates: GeoPosition[][] | GeoPosition[][][];
};
type GeoCollection = { features?: Array<{ geometry?: GeoGeometry | null }> };

const HOME_POSITION = new THREE.Vector3(0, 0.25, 6.25);
const MIN_DISTANCE = 2.65;
const MAX_DISTANCE = 24;
const EARTH_RADIUS = 2;
const AMBER = 0xffa62b;
const HOT_AMBER = 0xffd17a;
const CYAN = 0x49d8ff;

function latLonToVector3(lat: number, lon: number, radius: number) {
  const phi = THREE.MathUtils.degToRad(90 - lat);
  const theta = THREE.MathUtils.degToRad(lon + 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

function lineMaterial(color: number, opacity: number) {
  return new THREE.LineBasicMaterial({
    color,
    transparent: true,
    opacity,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
}

function makeGlowTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 96;
  const context = canvas.getContext("2d");
  if (!context) return new THREE.Texture();
  const glow = context.createRadialGradient(48, 48, 0, 48, 48, 48);
  glow.addColorStop(0, "rgba(255,220,150,1)");
  glow.addColorStop(0.15, "rgba(255,166,43,.9)");
  glow.addColorStop(0.5, "rgba(255,105,20,.2)");
  glow.addColorStop(1, "rgba(255,70,0,0)");
  context.fillStyle = glow;
  context.fillRect(0, 0, 96, 96);
  return new THREE.CanvasTexture(canvas);
}

export function createOrbScene(container: HTMLElement): OrbSceneApi {
  const width = Math.max(container.clientWidth, 1);
  const height = Math.max(container.clientHeight, 1);
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x000000, 0.025);

  const camera = new THREE.PerspectiveCamera(48, width / height, 0.1, 500);
  camera.position.copy(HOME_POSITION);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.95;
  container.appendChild(renderer.domElement);

  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(width, height), 0.72, 0.45, 0.52);
  composer.addPass(bloom);
  const displayPass = new ShaderPass({
    uniforms: { tDiffuse: { value: null }, uTime: { value: 0 }, uIntensity: { value: 0.0015 } },
    vertexShader: `varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader: `
      uniform sampler2D tDiffuse; uniform float uTime; uniform float uIntensity; varying vec2 vUv;
      void main(){
        vec2 d=vUv-vec2(.5); float o=uIntensity*length(d);
        vec4 r=texture2D(tDiffuse,vUv+d*o); vec4 g=texture2D(tDiffuse,vUv); vec4 b=texture2D(tDiffuse,vUv-d*o*.5);
        vec3 c=vec3(r.r,g.g,b.b); c*=1.+.012*sin(uTime*28.)*sin(uTime*6.7);
        gl_FragColor=vec4(c,1.);
      }`,
  });
  composer.addPass(displayPass);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.045;
  controls.minDistance = MIN_DISTANCE;
  controls.maxDistance = MAX_DISTANCE;
  controls.zoomSpeed = 1.15;
  controls.enablePan = false;
  controls.autoRotate = false;

  const world = new THREE.Group();
  world.rotation.x = THREE.MathUtils.degToRad(-9);
  world.rotation.z = THREE.MathUtils.degToRad(-5);
  scene.add(world);

  const textureLoader = new THREE.TextureLoader();
  const dayMap = textureLoader.load(earthDayUrl);
  const normalMap = textureLoader.load(earthNormalUrl);
  const specularMap = textureLoader.load(earthSpecularUrl);
  const cloudMap = textureLoader.load(earthCloudsUrl);
  const lightsMap = textureLoader.load(earthLightsUrl);
  dayMap.colorSpace = THREE.SRGBColorSpace;
  lightsMap.colorSpace = THREE.SRGBColorSpace;
  for (const texture of [dayMap, normalMap, specularMap, cloudMap, lightsMap]) {
    texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  }

  const earthGeometry = new THREE.SphereGeometry(EARTH_RADIUS, 128, 96);
  const earthMaterial = new THREE.MeshPhongMaterial({
    map: dayMap,
    normalMap,
    normalScale: new THREE.Vector2(0.62, 0.62),
    specularMap,
    specular: new THREE.Color(0x5c90aa),
    shininess: 13,
    emissive: new THREE.Color(0x160900),
    emissiveIntensity: 0.22,
  });
  const earth = new THREE.Mesh(earthGeometry, earthMaterial);
  world.add(earth);

  const cityLightsMaterial = new THREE.MeshBasicMaterial({
    map: lightsMap,
    color: HOT_AMBER,
    transparent: true,
    opacity: 0.72,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const cityLights = new THREE.Mesh(new THREE.SphereGeometry(EARTH_RADIUS + 0.009, 128, 96), cityLightsMaterial);
  world.add(cityLights);

  const cloudsMaterial = new THREE.MeshPhongMaterial({
    map: cloudMap,
    alphaMap: cloudMap,
    transparent: true,
    opacity: 0.52,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const clouds = new THREE.Mesh(new THREE.SphereGeometry(EARTH_RADIUS + 0.028, 128, 96), cloudsMaterial);
  world.add(clouds);

  const grid = new THREE.Group();
  for (let latitude = -75; latitude <= 75; latitude += 15) {
    const ringRadius = (EARTH_RADIUS + 0.045) * Math.cos(THREE.MathUtils.degToRad(latitude));
    const y = (EARTH_RADIUS + 0.045) * Math.sin(THREE.MathUtils.degToRad(latitude));
    const curve = new THREE.EllipseCurve(0, 0, ringRadius, ringRadius);
    const points = curve.getPoints(180).map((point) => new THREE.Vector3(point.x, y, point.y));
    grid.add(new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(points), lineMaterial(AMBER, latitude === 0 ? 0.38 : 0.095)));
  }
  for (let longitude = 0; longitude < 360; longitude += 15) {
    const points: THREE.Vector3[] = [];
    for (let latitude = -90; latitude <= 90; latitude += 2) {
      points.push(latLonToVector3(latitude, longitude, EARTH_RADIUS + 0.045));
    }
    grid.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), lineMaterial(AMBER, longitude % 45 === 0 ? 0.2 : 0.07)));
  }
  world.add(grid);

  const atmosphere = new THREE.Mesh(
    new THREE.SphereGeometry(EARTH_RADIUS + 0.18, 96, 64),
    new THREE.ShaderMaterial({
      transparent: true,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      uniforms: { glowColor: { value: new THREE.Color(AMBER) } },
      vertexShader: `varying vec3 vNormal; varying vec3 vWorld; void main(){vNormal=normalize(normalMatrix*normal);vec4 w=modelMatrix*vec4(position,1.);vWorld=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}`,
      fragmentShader: `uniform vec3 glowColor; varying vec3 vNormal; varying vec3 vWorld; void main(){vec3 viewDir=normalize(cameraPosition-vWorld);float rim=pow(1.-max(dot(vNormal,viewDir),0.),2.35);gl_FragColor=vec4(glowColor,rim*.58);}`,
    }),
  );
  world.add(atmosphere);

  const borderGroup = new THREE.Group();
  world.add(borderGroup);
  let disposed = false;
  void fetch(countriesUrl)
    .then((response) => response.ok ? response.json() as Promise<GeoCollection> : Promise.reject(new Error("Boundary data unavailable")))
    .then((collection) => {
      if (disposed) return;
      const material = lineMaterial(HOT_AMBER, 0.62);
      const addRing = (ring: GeoPosition[]) => {
        const points = ring.map(([lon, lat]) => latLonToVector3(lat, lon, EARTH_RADIUS + 0.06));
        if (points.length > 1) borderGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), material));
      };
      for (const feature of collection.features ?? []) {
        const geometry = feature.geometry;
        if (!geometry) continue;
        if (geometry.type === "Polygon") (geometry.coordinates as GeoPosition[][]).forEach(addRing);
        else (geometry.coordinates as GeoPosition[][][]).forEach((polygon) => polygon.forEach(addRing));
      }
    })
    .catch(() => { /* The textured globe remains usable if boundaries fail. */ });

  const ambient = new THREE.AmbientLight(0x476a85, 0.42);
  scene.add(ambient);
  const sun = new THREE.DirectionalLight(0xffe4c0, 3.4);
  sun.position.set(-5, 3, 5);
  scene.add(sun);
  const rimLight = new THREE.DirectionalLight(CYAN, 1.25);
  rimLight.position.set(4, -1, -4);
  scene.add(rimLight);

  const glowTexture = makeGlowTexture();
  const locations = [
    [53.35, -6.26], [51.51, -0.13], [40.71, -74.01], [34.05, -118.24],
    [1.35, 103.82], [35.68, 139.69], [25.2, 55.27], [-33.87, 151.21],
    [19.43, -99.13], [-23.55, -46.63], [28.61, 77.21], [52.52, 13.41],
  ];
  const locationGroup = new THREE.Group();
  for (const [lat, lon] of locations) {
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture, color: AMBER, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
    sprite.position.copy(latLonToVector3(lat, lon, EARTH_RADIUS + 0.075));
    sprite.scale.setScalar(0.16);
    locationGroup.add(sprite);
  }
  world.add(locationGroup);

  const arcGroup = new THREE.Group();
  const arcPairs = [[0, 1], [1, 4], [2, 5], [3, 11], [4, 6], [5, 8], [6, 10], [7, 9], [9, 2], [10, 0]];
  for (const [from, to] of arcPairs) {
    const a = latLonToVector3(locations[from][0], locations[from][1], EARTH_RADIUS + 0.08);
    const b = latLonToVector3(locations[to][0], locations[to][1], EARTH_RADIUS + 0.08);
    const middle = a.clone().add(b).multiplyScalar(0.5).normalize().multiplyScalar(EARTH_RADIUS + 0.45 + a.distanceTo(b) * 0.12);
    const curve = new THREE.QuadraticBezierCurve3(a, middle, b);
    arcGroup.add(new THREE.Line(curve.getGeometry(80), lineMaterial(CYAN, 0.38)));
  }
  world.add(arcGroup);

  const orbitRings = new THREE.Group();
  for (const [radius, tilt, opacity] of [[2.52, 0.35, 0.28], [2.8, -0.48, 0.18], [3.08, 0.83, 0.11]] as const) {
    const ring = new THREE.LineLoop(
      new THREE.BufferGeometry().setFromPoints(new THREE.EllipseCurve(0, 0, radius, radius).getPoints(220).map((p) => new THREE.Vector3(p.x, 0, p.y))),
      lineMaterial(AMBER, opacity),
    );
    ring.rotation.x = tilt;
    ring.rotation.z = tilt * 0.7;
    orbitRings.add(ring);
  }
  scene.add(orbitRings);

  const starCount = 2500;
  const starPositions = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i += 1) {
    const radius = 10 + Math.random() * 55;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    starPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    starPositions[i * 3 + 1] = radius * Math.cos(phi);
    starPositions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
  }
  const starGeometry = new THREE.BufferGeometry();
  starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
  const stars = new THREE.Points(starGeometry, new THREE.PointsMaterial({ color: 0xffb85b, size: 0.028, transparent: true, opacity: 0.55, depthWrite: false }));
  scene.add(stars);

  const sphericalScratch = new THREE.Spherical();
  const offsetScratch = new THREE.Vector3();
  function rotateBy(deltaTheta: number, deltaPhi: number) {
    offsetScratch.copy(camera.position).sub(controls.target);
    sphericalScratch.setFromVector3(offsetScratch);
    sphericalScratch.theta -= deltaTheta;
    sphericalScratch.phi = THREE.MathUtils.clamp(sphericalScratch.phi - deltaPhi, 0.05, Math.PI - 0.05);
    sphericalScratch.makeSafe();
    offsetScratch.setFromSpherical(sphericalScratch);
    camera.position.copy(controls.target).add(offsetScratch);
    camera.lookAt(controls.target);
  }
  function zoomBy(factor: number) {
    offsetScratch.copy(camera.position).sub(controls.target);
    offsetScratch.setLength(THREE.MathUtils.clamp(offsetScratch.length() * factor, MIN_DISTANCE, MAX_DISTANCE));
    camera.position.copy(controls.target).add(offsetScratch);
  }
  function resetView() {
    camera.position.copy(HOME_POSITION);
    controls.target.set(0, 0, 0);
    camera.lookAt(controls.target);
    controls.update();
  }

  const clock = new THREE.Clock();
  let rafId = 0;
  function animate() {
    if (disposed) return;
    rafId = requestAnimationFrame(animate);
    const time = clock.getElapsedTime();
    world.rotation.y += 0.00055;
    clouds.rotation.y += 0.00022;
    grid.rotation.y += 0.00004;
    orbitRings.rotation.y -= 0.00065;
    orbitRings.rotation.z = Math.sin(time * 0.12) * 0.025;
    arcGroup.children.forEach((arc, index) => {
      const material = (arc as THREE.Line).material as THREE.LineBasicMaterial;
      material.opacity = 0.22 + Math.max(0, Math.sin(time * 1.4 + index * 0.8)) * 0.34;
    });
    locationGroup.children.forEach((marker, index) => {
      const pulse = 0.12 + Math.max(0, Math.sin(time * 2.4 + index)) * 0.09;
      marker.scale.setScalar(pulse);
    });
    cityLightsMaterial.opacity = 0.65 + Math.sin(time * 0.7) * 0.08;
    bloom.strength = 0.68 + Math.sin(time * 0.55) * 0.08;
    displayPass.uniforms.uTime.value = time;
    controls.update();
    composer.render();
  }
  animate();

  function onResize() {
    const nextWidth = Math.max(container.clientWidth, 1);
    const nextHeight = Math.max(container.clientHeight, 1);
    camera.aspect = nextWidth / nextHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(nextWidth, nextHeight);
    composer.setSize(nextWidth, nextHeight);
  }
  window.addEventListener("resize", onResize);

  function dispose() {
    disposed = true;
    cancelAnimationFrame(rafId);
    window.removeEventListener("resize", onResize);
    controls.dispose();
    const textures = new Set<THREE.Texture>();
    scene.traverse((object) => {
      const renderable = object as THREE.Mesh;
      renderable.geometry?.dispose();
      const materials = Array.isArray(renderable.material) ? renderable.material : [renderable.material];
      for (const material of materials) {
        if (!material) continue;
        for (const value of Object.values(material)) if (value instanceof THREE.Texture) textures.add(value);
        material.dispose();
      }
    });
    textures.forEach((texture) => texture.dispose());
    glowTexture.dispose();
    composer.dispose();
    renderer.dispose();
    renderer.domElement.remove();
  }

  return { rotateBy, zoomBy, zoomIn: () => zoomBy(0.78), zoomOut: () => zoomBy(1.28), resetView, dispose };
}
