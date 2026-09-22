"use client";
import { useEffect, useRef, useState, type RefObject } from "react";
import * as THREE from "three";
import { getScrollProgress } from "./scrollProgress";
import type { GalaxyPhase } from "./types";

const INTRO_DURATION = 5.2;
const ARM_COUNT = 5;
const ARM_ANGLE_STEP = (Math.PI * 2) / ARM_COUNT;
// Background field (800) + core (CORE_COUNT) come first; arm stars are budgeted per arm so density holds as arms are added.
const FIELD_COUNT = 800;
const CORE_COUNT = 350;
const FIELD_AND_CORE = FIELD_COUNT + CORE_COUNT;
// Headline stars: two words (left/right of the galaxy) sampled from rendered text.
const TEXT_UNIT = 0.4; // world units per sampled text pixel at scale 1
// Cursor wake: springs that trail the pointer at different lags and shove nearby stars along its motion.
// Angular frequency (rad/s) per spring; lower = lazier. Damping ratio < 1 so they overshoot and settle.
const WAKE_FREQUENCIES = [15, 9.5, 6.2, 4];
const WAKE_DAMPING = 0.4;
const WAKE_MAX_SPEED = 4; // screen-heights per second

/** Canvas font string for the headline: the site's sans token, so the star text matches the rest of the page. */
function headlineFont() {
  const family = getComputedStyle(document.documentElement).getPropertyValue("--font-sans").trim() || "system-ui, sans-serif";
  return `500 120px ${family}`;
}

/** Rasterises a word and returns random points inside its glyphs as [x, y] pairs in world units, centred on (0, 0). */
function sampleWord(word: string, count: number, random: () => number, font: string) {
  const width = 640, height = 180;
  const canvas = document.createElement("canvas");
  canvas.width = width; canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  ctx.font = font;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#fff";
  ctx.fillText(word, width / 2, height / 2);
  const data = ctx.getImageData(0, 0, width, height).data;
  const filled: number[] = [];
  for (let i = 3; i < data.length; i += 4) if (data[i] > 128) filled.push((i - 3) / 4);
  const points = new Float32Array(count * 2);
  if (filled.length) {
    for (let i = 0; i < count; i++) {
      const pixel = filled[Math.floor(random() * filled.length)];
      const x = (pixel % width) + random() - 0.5, y = Math.floor(pixel / width) + random() - 0.5;
      points[i * 2] = (x - width / 2) * TEXT_UNIT;
      points[i * 2 + 1] = -(y - height / 2) * TEXT_UNIT;
    }
  }
  return { points, width: ctx.measureText(word).width * TEXT_UNIT };
}
function smoothstep(a: number, b: number, value: number) {
  const t = THREE.MathUtils.clamp((value - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
}

// A solid version of a headline word, drawn to the same layout as sampleWord so it lands exactly on the star glyphs.
const SOLID_SCALE = 3; // texture pixels per sampled text pixel
const SOLID_PAD = 8; // sampled text pixels of room around the word, so antialiased edges are not clipped
const SOLID_TEXT_WIDTH = 640, SOLID_TEXT_HEIGHT = 180; // sampleWord's canvas
const SOLID_FONT_WEIGHT = 300; // lighter than the medium weight the stars are sampled from, so the solid words read as thin, not bold
const SOLID_HEADLINE_OPACITY = 0.55; // well see-through, so the headline sits back in the sky instead of competing with the galaxy

function solidWordTexture(word: string, font: string) {
  const k = SOLID_SCALE;
  const canvas = document.createElement("canvas");
  canvas.width = (SOLID_TEXT_WIDTH + SOLID_PAD * 2) * k;
  canvas.height = (SOLID_TEXT_HEIGHT + SOLID_PAD * 2) * k;
  const ctx = canvas.getContext("2d")!;
  ctx.font = font.replace(/^\d+/, String(SOLID_FONT_WEIGHT)).replace(/(\d+)px/, (_, size) => `${Number(size) * k}px`);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#9db5cd"; // the site's muted secondary blue
  ctx.fillText(word, canvas.width / 2, canvas.height / 2);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  // Width of the word at this weight, in world units at scale 1.
  return { texture, width: (ctx.measureText(word).width / k) * TEXT_UNIT };
}

function buildStars(mobile: boolean, title: [string, string], font: string) {
  let seed = 76129;
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) | 0;
    return (seed >>> 0) / 4294967296;
  };
  const gaussian = () => (random() + random() + random() + random() - 2) * 1.73;
  const textPerWord = mobile ? 2600 : 3200;
  const textStart = FIELD_AND_CORE;
  const armStart = textStart + textPerWord * 2;
  const count = armStart + ARM_COUNT * (mobile ? 3400 : 3700);
  const words = [sampleWord(title[0], textPerWord, random, font), sampleWord(title[1], textPerWord, random, font)];
  const position = new Float32Array(count * 3);
  const scatter = new Float32Array(count * 3);
  const color = new Float32Array(count * 3);
  const size = new Float32Array(count);
  const phase = new Float32Array(count);
  const kind = new Float32Array(count);
  const arm = new Float32Array(count * 2);
  const noise = new Float32Array(count * 3);
  // Small clusters interrupt the trails, avoiding evenly spaced beads or solid arms.
  const knots = Array.from({ length: 110 }, () => random());
  const palette = [new THREE.Color("#74b4ee"), new THREE.Color("#a8d8ff"),
    new THREE.Color("#e6f2ff"), new THREE.Color("#ffe4cb"), new THREE.Color("#d99861")];
  for (let i = 0; i < count; i++) {
    const field = i < FIELD_COUNT;
    const core = i >= FIELD_COUNT && i < FIELD_AND_CORE;
    // Most core stars are small points so the cluster reads as dense without blowing out; a few stay large and bright.
    const bright = core && random() < 0.12;
    const text = i >= textStart && i < armStart;
    const word = text && i - textStart >= textPerWord ? 1 : 0;
    const spark = text && random() < 0.015;
    const hot = bright || spark || (!core && !text && random() < 0.06);
    let t = random() < 0.72 ? knots[Math.floor(random() * knots.length)] + gaussian() * 0.012 : random();
    t = THREE.MathUtils.clamp(t, 0, 1);
    // Arm stars are placed in the vertex shader from (t, strand, noise) so they can flow along the spiral.
    arm.set([Math.min(t, 0.9999), i % ARM_COUNT], i * 2);
    noise.set([gaussian(), gaussian(), gaussian()], i * 3);
    let x = 0, y = 0, z = 0;
    if (field) { x = (random() - 0.5) * 850; y = (random() - 0.5) * 650; z = -60 - random() * 220; }
    if (core) { const r = Math.pow(random(), 2.2) * 24; const a = random() * Math.PI * 2; x = Math.cos(a) * r; y = Math.sin(a) * r; z = gaussian() * 3; }
    if (text) {
      const k = (i - textStart) % textPerWord;
      x = words[word].points[k * 2]; y = words[word].points[k * 2 + 1]; z = (random() - 0.5) * 2;
    }
    position.set([x, y, z], i * 3);
    scatter.set([(random() - 0.5) * 700, (random() - 0.5) * 480 + 35, (random() - 0.5) * 160], i * 3);
    const pick = random();
    const tone = core ? palette[2] : text ? palette[random() < 0.5 ? 0 : 1] : palette[pick < 0.3 ? 0 : pick < 0.55 ? 1 : pick < 0.78 ? 2 : pick < 0.91 ? 3 : 4];
    const intensity = field ? 0.2 + random() * 0.5 : core && !bright ? 0.7 + random() * 0.9 : text && !spark ? 0.5 + random() * 0.45 : hot ? 1.6 + random() * 1.8 : 0.32 + random() * 0.65;
    color.set([tone.r * intensity, tone.g * intensity, tone.b * intensity], i * 3);
    size[i] = text ? (spark ? 5.5 + random() * 3 : 1.2 + random() * 1.2) : core ? (bright ? 6 + random() * 13 : 1.4 + random() * 2.6) : field ? (random() < 0.025 ? 12 : 0.8 + random() * 2) : hot ? 15 + Math.pow(random(), 2) * 25 : 0.8 + random() * 1.8;
    phase[i] = random() * Math.PI * 2;
    kind[i] = field ? 1 : core ? 2 : text ? 3 + word : 0;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(position, 3));
  geometry.setAttribute("aScatter", new THREE.BufferAttribute(scatter, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(color, 3));
  geometry.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
  geometry.setAttribute("aPhase", new THREE.BufferAttribute(phase, 1));
  geometry.setAttribute("aKind", new THREE.BufferAttribute(kind, 1));
  geometry.setAttribute("aArm", new THREE.BufferAttribute(arm, 2));
  geometry.setAttribute("aNoise", new THREE.BufferAttribute(noise, 3));
  return { geometry, wordWidths: [words[0].width, words[1].width] as const };
}

interface GalaxySceneProps {
  /** Scroll zone element; scroll progress, drag and key handling are scoped to it. */
  rootRef: RefObject<HTMLElement | null>;
  scrollScreens: number;
  flowSpeed: number;
  title: [string, string];
  onPhaseChange: (phase: GalaxyPhase) => void;
  /** Bump to replay the intro. */
  replayToken: number;
}

export default function GalaxyScene({ rootRef, scrollScreens, flowSpeed, title, onPhaseChange, replayToken }: GalaxySceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [titleLeft, titleRight] = title;
  // The headline is sampled from the site font, so hold the scene until it has loaded (or a short timeout passes).
  const [font, setFont] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    const wanted = headlineFont();
    const timeout = new Promise((resolve) => setTimeout(resolve, 1500));
    Promise.race([document.fonts.load(wanted), timeout]).catch(() => {}).then(() => { if (alive) setFont(wanted); });
    return () => { alive = false; };
  }, []);
  // Latest props live in refs so the scene effect runs once and is never torn down by parent re-renders.
  const onPhaseRef = useRef(onPhaseChange);
  onPhaseRef.current = onPhaseChange;
  const replayTokenRef = useRef(replayToken);
  replayTokenRef.current = replayToken;
  useEffect(() => {
    const canvas = canvasRef.current;
    const root = rootRef.current;
    if (!canvas || !root || !font) return;
    let phase: GalaxyPhase | null = null;
    const report = (next: GalaxyPhase) => {
      if (next === phase) return;
      phase = next;
      onPhaseRef.current(next);
    };
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true });
    } catch {
      // Keep the introduction readable on devices without WebGL.
      report("settled");
      return;
    }
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    // `false` keeps three.js from writing explicit pixel width/height styles onto the canvas: our own CSS
    // (inset: 0, 100%) keeps it glued to the real viewport, so Safari's address-bar show/hide (which changes
    // window.innerHeight without necessarily firing `resize` in step) can never leave a stale-sized canvas
    // uncovering the page background as a black bar underneath the hero.
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    renderer.toneMapping = THREE.NoToneMapping;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1800);
    const { geometry, wordWidths } = buildStars(window.innerWidth < 640, [titleLeft, titleRight], font);
    const uniforms = {
      uTime: { value: 0 }, uFormation: { value: 0 }, uRotation: { value: 0 },
      uTilt: { value: 0 }, uFade: { value: 0 }, uFlow: { value: 0 }, uFlowFade: { value: 0 }, uPixelRatio: { value: renderer.getPixelRatio() },
      uAspect: { value: camera.aspect }, uHover: { value: 0 }, uWake: { value: WAKE_FREQUENCIES.map(() => new THREE.Vector4(9, 9, 0, 0)) },
      uTextFade: { value: 1 }, uTextSolid: { value: 0 }, uTextScale: { value: 1 }, uTextSize: { value: 1 }, uAnchorL: { value: new THREE.Vector2() }, uAnchorR: { value: new THREE.Vector2() },
    };
    const material = new THREE.ShaderMaterial({
      uniforms, vertexColors: true, transparent: true, depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: `
        attribute vec3 aScatter;
        attribute float aSize, aPhase, aKind;
        attribute vec2 aArm;
        attribute vec3 aNoise;
        uniform float uTime, uFormation, uRotation, uTilt, uFade, uPixelRatio, uFlow, uFlowFade, uTextFade, uTextSolid, uTextScale, uTextSize;
        uniform vec2 uAnchorL, uAnchorR;
        uniform float uAspect, uHover;
        // Cursor wake springs: xy = position, zw = velocity, in screen-height units (y up, x scaled by aspect).
        uniform vec4 uWake[4];
        varying vec3 vColor;
        varying float vAlpha, vHot;
        void main() {
          float background = 1.0 - step(0.1, abs(aKind - 1.0));
          // Kinds: 0 arm, 1 background, 2 core, 3/4 left/right headline word.
          float text = step(2.5, aKind);
          float core = step(1.5, aKind) * (1.0 - text);
          // Easing is applied on the CPU (uFormation) so assembly starts moving on the first frame.
          float f = clamp(uFormation * 1.12 - aPhase * 0.018, 0.0, 1.0);
          // Arm stars ride the spiral: t runs 0 (core) to 1 (rim) and uFlow slides it inward, wrapping at the rim.
          float arm = 1.0 - step(0.5, aKind);
          float t = mod(aArm.x - uFlow, 1.0);
          float radius = 18.0 + 104.0 * pow(t, 0.94);
          // Distribute every strand around the full disc. The old partial fan made the five outer ends bunch up like claws.
          float angle = 1.55 + (1.0 - t) * 10.2 - aArm.y * ${ARM_ANGLE_STEP.toFixed(8)};
          float outer = smoothstep(0.68, 1.0, t);
          // Let the tips fray into dust instead of tightening into crisp, finger-like lines.
          float spread = mix(1.0, 0.65, step(5.0, aSize)) * (1.1 + 4.0 * sin(t * 3.14159265) + 5.0 * outer);
          float outerReach = 34.0 * pow(max(0.0, (t - 0.72) / 0.28), 1.5);
          float radial = radius + outerReach + aNoise.x * spread;
          float theta = angle + aNoise.y * spread / max(radius, 8.0);
          vec3 armPosition = vec3(cos(theta) * radial * 1.12, sin(theta) * radial, aNoise.z * (2.0 + 5.0 * sin(t * 3.14159265)));
          // Core stars swirl with differential rotation: fastest at the centre (~3 turns/min), slowing outward.
          // Negative so it turns the same way the arm stars travel (counter-clockwise on screen).
          float swirl = -uTime * 0.31 / (1.0 + length(position.xy) / 8.0) * core;
          vec3 basePosition = vec3(mat2(cos(swirl), -sin(swirl), sin(swirl), cos(swirl)) * position.xy, position.z);
          // Headline stars are laid out flat around the galaxy: local glyph coordinates scaled and anchored per side.
          vec3 textPosition = vec3(position.xy * uTextScale + mix(uAnchorL, uAnchorR, step(3.5, aKind)), position.z);
          vec3 galaxyPosition = mix(mix(basePosition, armPosition, arm), textPosition, text);
          vec3 p = mix(aScatter, galaxyPosition, mix(f, 1.0, background));
          float sweep = sin(f * 3.14159265) * (1.0 - f) * 0.6;
          float rotation = (uRotation * (1.0 - text) + sweep) * (1.0 - background);
          p.xy = mat2(cos(rotation), -sin(rotation), sin(rotation), cos(rotation)) * p.xy;
          float tilt = uTilt * (1.0 - background) * (1.0 - text);
          p.yz = mat2(cos(tilt), -sin(tilt), sin(tilt), cos(tilt)) * p.yz;
          vec4 viewPosition = modelViewMatrix * vec4(p, 1.0);
          gl_Position = projectionMatrix * viewPosition;
          // Cursor wake: work in screen space so stars at every depth react to the pointer the same way.
          vec2 screen = gl_Position.xy / gl_Position.w * vec2(uAspect, 1.0);
          vec2 push = vec2(0.0);
          float near = 0.0;
          for (int i = 0; i < 4; i++) {
            vec4 wake = uWake[i];
            vec2 away = screen - wake.xy;
            float radius = 0.24 - 0.03 * float(i);
            float reach = exp(-dot(away, away) / (radius * radius));
            // Dragged along the motion, plus a little parting to either side of it.
            push += wake.zw * reach * 0.036 + normalize(away + 1e-4) * length(wake.zw) * reach * 0.012;
            near = max(near, reach);
          }
          // Each star answers with its own weight, so the dust scatters and lags instead of moving as one sheet.
          float response = (0.45 + 1.0 * fract(aPhase * 1.618 + aNoise.x * 0.31)) * mix(1.0, 0.7, background);
          push *= response * uHover;
          push /= 1.0 + length(push) / 0.2;
          gl_Position.xy += push / vec2(uAspect, 1.0) * gl_Position.w;
          // Headline stars grow with camera distance so the letters stay solid on small screens.
          gl_PointSize = clamp(aSize * uPixelRatio * 440.0 / max(100.0, -viewPosition.z) * mix(1.0, uTextSize, text), 0.8, 80.0);
          vColor = color;
          vHot = step(5.0, aSize);
          float twinkle = 0.9 + 0.1 * sin(uTime * 0.65 + aPhase);
          // Stars fade in at the rim and out into the core so the wrap-around is never seen.
          float seam = smoothstep(0.0, 0.05, t) * (1.0 - smoothstep(0.95, 1.0, t));
          float tipFade = 1.0 - smoothstep(0.72, 0.97, t);
          vAlpha = uFade * twinkle * (1.0 + 0.35 * near * uHover) * mix(1.0, 0.22 + 0.78 * f, core) * mix(1.0, seam * tipFade, arm * uFlowFade) * mix(1.0, uTextFade * (1.0 - uTextSolid), text);
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vAlpha, vHot;
        void main() {
          vec2 p = (gl_PointCoord - 0.5) * 2.0;
          float r2 = dot(p, p);
          if (r2 > 1.0) discard;
          float dust = exp(-r2 * 3.0);
          // Tight white center and a local colored halo; no full-screen bloom fog.
          float star = exp(-r2 * 32.0) + 0.16 * exp(-r2 * 5.0);
          float light = mix(dust, star, vHot) * (1.0 - smoothstep(0.75, 1.0, sqrt(r2)));
          gl_FragColor = vec4(vColor, vAlpha * light);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }
      `,
    });
    const stars = new THREE.Points(geometry, material);
    stars.frustumCulled = false;
    scene.add(stars);
    const glowCanvas = document.createElement("canvas");
    glowCanvas.width = glowCanvas.height = 128;
    const ctx = glowCanvas.getContext("2d")!;
    const glow = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    glow.addColorStop(0, "rgba(228,240,255,0.55)");
    glow.addColorStop(0.12, "rgba(208,226,255,0.32)");
    glow.addColorStop(0.4, "rgba(184,207,242,0.1)");
    glow.addColorStop(1, "rgba(184,207,242,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, 128, 128);
    const glowTexture = new THREE.CanvasTexture(glowCanvas);
    const glowMaterial = new THREE.SpriteMaterial({ map: glowTexture, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 });
    const coreGlow = new THREE.Sprite(glowMaterial);
    coreGlow.scale.set(65, 65, 1);
    scene.add(coreGlow);
    // Solid headline: two textured planes laid over the star words. They stay hidden until the stars have assembled.
    const solidWords = [titleLeft, titleRight].map((word) => {
      const { texture, width } = solidWordTexture(word, font);
      const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false, opacity: 0 });
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry((SOLID_TEXT_WIDTH + SOLID_PAD * 2) * TEXT_UNIT, (SOLID_TEXT_HEIGHT + SOLID_PAD * 2) * TEXT_UNIT), material);
      mesh.renderOrder = 2;
      mesh.userData.width = width;
      scene.add(mesh);
      return mesh;
    });
    // The camera never moves; scrolling tips the galaxy backwards (top edge away from the viewer) around the x axis.
    const CAMERA_Y = 44;
    const CAMERA_Z = 440;
    const SCROLL_TILT = 1.3;
    const GALAXY_HALF_WIDTH = 135;
    const GALAXY_BOTTOM = -137;
    const SIDE_TEXT_MAX = 0.62; // largest headline scale beside the galaxy on wide screens
    // The headline is drawn at this share of the size the layout has room for. It only shrinks the words: the galaxy keeps its framing.
    const HEADLINE_SIZE = 0.75;
    // Portrait screens frame the galaxy tighter than its full width: the outer arms run off the sides instead of the whole
    // galaxy shrinking to fit, so the dust stays large and sharp. The camera then slides down so the headline sits a margin
    // above the bottom edge, and backs off only as far as needed to keep the galaxy's top clear of the navbar.
    const PORTRAIT_VISIBLE_WIDTH = 0.17; // share of the galaxy's half-width that fits across the screen — lower zooms in tighter, letting the arms run off-frame
    const PORTRAIT_MIN_FIT = 0.35;
    const PORTRAIT_BOTTOM_MARGIN = 0.06; // share of the screen height kept clear below the headline
    const GALAXY_TOP = 205;
    // The spiral is lopsided: its left flank reaches farther out than its right, so on a cropped portrait screen it touches one
    // edge while leaving a gap at the other. The camera slides a little to balance what is cropped at each edge.
    const PORTRAIT_CAMERA_X = -10;
    const NAVBAR_HEIGHT = 74; // px
    let cameraFit = 1;
    let cameraY = CAMERA_Y;
    let cameraX = 0;
    let portraitLayout = false;
    // Wide screens put the words either side of the galaxy; everything else puts them on one line below it.
    // The camera backs off (cameraFit) just enough that the galaxy and the text both fit the screen.
    const layoutText = () => {
      const aspect = camera.aspect;
      const tanHalf = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
      const widest = Math.max(wordWidths[0], wordWidths[1], 1);
      const sideLayout = aspect >= 1.25;
      portraitLayout = !sideLayout;
      // Both words share one line below the galaxy on portrait screens, filling about 80% of the screen width.
      const spaceWidth = 14; // ~0.28em of the sample font, in world units
      const total = wordWidths[0] + spaceWidth + wordWidths[1];
      const portraitLine = (fit: number) => {
        const halfWAtFit = tanHalf * CAMERA_Z * fit * aspect;
        const scale = THREE.MathUtils.clamp((halfWAtFit * 2 * 0.8) / total, 0.3, 1) * HEADLINE_SIZE;
        const capHeight = 34.6 * scale; // glyph cap height in world units (0.72em * 120px * TEXT_UNIT)
        return { scale, capHeight, lineY: GALAXY_BOTTOM - 14 - capHeight / 2 };
      };
      if (sideLayout) {
        const halfWNeeded = (GALAXY_HALF_WIDTH + (widest * SIDE_TEXT_MAX) / 0.92) / 0.96;
        cameraFit = Math.max(1, halfWNeeded / (tanHalf * CAMERA_Z * aspect));
        cameraX = 0;
        cameraY = CAMERA_Y;
      } else {
        let fit = Math.max(PORTRAIT_MIN_FIT, (GALAXY_HALF_WIDTH * PORTRAIT_VISIBLE_WIDTH) / (tanHalf * CAMERA_Z * aspect));
        const navShare = NAVBAR_HEIGHT / stableHeight;
        for (let i = 0; i < 60; i++) {
          const fitHalfH = tanHalf * CAMERA_Z * fit;
          const { capHeight, lineY } = portraitLine(fit);
          // Headline (with room for descenders) a margin above the bottom edge...
          cameraY = lineY - capHeight * 0.75 - PORTRAIT_BOTTOM_MARGIN * 2 * fitHalfH + fitHalfH;
          // ...as long as the galaxy's top still clears the navbar; otherwise back the camera off a little.
          if (cameraY + fitHalfH * (1 - 2 * navShare) >= GALAXY_TOP) break;
          fit *= 1.03;
        }
        cameraFit = fit;
        cameraX = PORTRAIT_CAMERA_X;
      }
      const halfH = tanHalf * CAMERA_Z * cameraFit;
      const halfW = halfH * aspect;
      uniforms.uTextSize.value = cameraFit;
      if (sideLayout) {
        const room = halfW * 0.96 - GALAXY_HALF_WIDTH;
        const x = GALAXY_HALF_WIDTH + room / 2;
        const scale = THREE.MathUtils.clamp((room * 0.92) / widest, 0.3, SIDE_TEXT_MAX) * HEADLINE_SIZE;
        uniforms.uTextScale.value = scale;
        // Keep star size proportional to the text so the letters don't get whiter as they shrink.
        uniforms.uTextSize.value = cameraFit * (scale / 0.83);
        uniforms.uAnchorL.value.set(-x, 0);
        uniforms.uAnchorR.value.set(x, 0);
      } else {
        const { scale, lineY } = portraitLine(cameraFit);
        uniforms.uTextScale.value = scale;
        uniforms.uTextSize.value = cameraFit * scale;
        // The headline stays centred on the screen even though the camera has slid sideways.
        uniforms.uAnchorL.value.set(cameraX + (-total / 2 + wordWidths[0] / 2) * scale, lineY);
        uniforms.uAnchorR.value.set(cameraX + (total / 2 - wordWidths[1] / 2) * scale, lineY);
      }
    };
    const placeSolidWords = () => {
      solidWords.forEach((mesh, i) => {
        const anchor = (i === 0 ? uniforms.uAnchorL : uniforms.uAnchorR).value;
        const scale = uniforms.uTextScale.value;
        // The light-weight words are narrower than the stars they replace. On the shared line, keep each word's inner edge
        // where it was so the gap between them stays a normal space.
        const trim = portraitLayout ? ((i === 0 ? 1 : -1) * (wordWidths[i] - mesh.userData.width) * scale) / 2 : 0;
        mesh.position.set(anchor.x + trim, anchor.y, 0.5);
        mesh.scale.setScalar(scale);
      });
    };
    let stableHeight = window.innerHeight;
    let scroll = 0;
    let inView = true;
    let seenReplayToken = replayTokenRef.current;
    let smoothScroll = 0;
    let elapsed = 0;
    let dragRotation = 0;
    let dragTilt = 0;
    let flow = 0;
    let pointer: { id: number; x: number; y: number; target: HTMLElement } | null = null;
    // Cursor wake: pointer target in screen units, one spring per uniform entry.
    const wakeTarget = new THREE.Vector2();
    const wakeVelocity = WAKE_FREQUENCIES.map(() => new THREE.Vector2());
    let hasPointer = false;
    let pointerInside = false;
    const onReplay = () => {
      elapsed = 0;
      dragRotation = 0;
      dragTilt = 0;
      flow = 0;
      uniforms.uRotation.value = 0;
      uniforms.uTilt.value = 0;
      report(reducedMotion.matches ? "settled" : "stars");
    };
    const onScroll = () => {
      // Progress spans the scrollable distance (zone height minus one viewport), so it hits 1 exactly at the bottom of the page.
      scroll = getScrollProgress(root, stableHeight, Math.max(scrollScreens - 1, 0.01));
      const rect = root.getBoundingClientRect();
      inView = rect.bottom > 0 && rect.top < window.innerHeight;
    };
    const onPointerDown = (event: PointerEvent) => {
      // Touch is left alone entirely: capturing it here would compete with the page's own scroll gesture
      // (the overlay covers the full hero), so a swipe meant to scroll was also read as a rotate/tilt drag.
      if (event.pointerType === "touch") return;
      const target = event.target instanceof Element ? event.target.closest<HTMLElement>("[data-galaxy-interaction]") : null;
      if (!target || !root.contains(target) || event.button !== 0 || pointer) return;
      pointer = { id: event.pointerId, x: event.clientX, y: event.clientY, target };
      target.setPointerCapture(event.pointerId);
      target.style.cursor = "grabbing";
    };
    const onPointerMove = (event: PointerEvent) => {
      // Same reasoning: the cursor-wake reaction is a hover effect, which touch doesn't have. Feeding it
      // scroll-swipe coordinates just made the dust visibly jump/react while the user was trying to scroll.
      if (event.pointerType === "touch") return;
      wakeTarget.set((event.clientX / window.innerWidth * 2 - 1) * camera.aspect, -(event.clientY / stableHeight * 2 - 1));
      pointerInside = true;
      if (!hasPointer) {
        // First sighting: park the springs on the pointer so nothing flies in from off screen.
        hasPointer = true;
        uniforms.uWake.value.forEach((wake) => wake.set(wakeTarget.x, wakeTarget.y, 0, 0));
      }
      if (!pointer || event.pointerId !== pointer.id) return;
      dragRotation += (event.clientX - pointer.x) * 0.004;
      dragTilt = THREE.MathUtils.clamp(dragTilt + (event.clientY - pointer.y) * 0.003, -0.8, 0.8);
      pointer.x = event.clientX;
      pointer.y = event.clientY;
    };
    const onPointerUp = (event?: PointerEvent) => {
      if (event && pointer && event.pointerId !== pointer.id) return;
      if (pointer) {
        pointer.target.style.cursor = "grab";
        if (pointer.target.hasPointerCapture(pointer.id)) pointer.target.releasePointerCapture(pointer.id);
      }
      pointer = null;
    };
    const onPointerLeave = () => { pointerInside = false; };
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target instanceof Element ? event.target.closest("[data-galaxy-interaction]") : null;
      if (!target || !root.contains(target)) return;
      if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home"].includes(event.key)) return;
      event.preventDefault();
      if (event.key === "Home") { dragRotation = 0; dragTilt = 0; }
      if (event.key === "ArrowLeft") dragRotation -= 0.12;
      if (event.key === "ArrowRight") dragRotation += 0.12;
      if (event.key === "ArrowUp") dragTilt = Math.max(-0.8, dragTilt - 0.1);
      if (event.key === "ArrowDown") dragTilt = Math.min(0.8, dragTilt + 0.1);
    };
    let lastWidth = window.innerWidth;
    const onResize = () => {
      if (window.innerWidth < 640 && lastWidth === window.innerWidth && Math.abs(stableHeight - window.innerHeight) < 160) return;
      lastWidth = window.innerWidth;
      stableHeight = window.innerHeight;
      camera.aspect = window.innerWidth / stableHeight;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(window.innerWidth, stableHeight, false);
      uniforms.uPixelRatio.value = renderer.getPixelRatio();
      uniforms.uAspect.value = camera.aspect;
      layoutText();
      placeSolidWords();
      onScroll();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
    window.addEventListener("keydown", onKeyDown);
    document.documentElement.addEventListener("pointerleave", onPointerLeave);
    layoutText();
    placeSolidWords();
    onScroll();
    onReplay();
    const clock = new THREE.Clock();
    let frame: number;
    function tick() {
      frame = requestAnimationFrame(tick);
      const dt = Math.min(clock.getDelta(), 0.05);
      // Once the hero has scrolled out of view, only `renderer.render` below was being skipped — every spring,
      // shader uniform and camera update still ran on every frame for the rest of the page's life, competing
      // with the main thread (e.g. delaying the navbar's own scroll handler on slower phones). Skip it all.
      if (document.hidden || !inView) return;
      if (replayTokenRef.current !== seenReplayToken) { seenReplayToken = replayTokenRef.current; onReplay(); }
      elapsed += dt;
      const reduced = reducedMotion.matches;
      // Ease-out: begins moving immediately and glides into place.
      uniforms.uFormation.value = reduced ? 1 : 1 - Math.pow(1 - Math.min(elapsed / INTRO_DURATION, 1), 3);
      uniforms.uFade.value = reduced ? 1 : smoothstep(0, 0.7, elapsed);
      glowMaterial.opacity = reduced ? 1 : smoothstep(1.5, 4.2, elapsed);
      report(reduced || elapsed >= INTRO_DURATION ? "settled" : elapsed >= 0.7 ? "title" : "stars");
      if (!reduced) uniforms.uTime.value += dt;
      const ease = reduced ? 1 : 1 - Math.exp(-5 * dt);
      // Stars stream inward along the arms; the flow ramps up during assembly so there is no pause once it settles.
      const flowEase = reduced ? 0 : smoothstep(0.3, 3.5, elapsed);
      flow = (flow + flowSpeed * flowEase * dt) % 1;
      uniforms.uFlow.value = flow;
      uniforms.uFlowFade.value = flowEase;
      // A restrained sway preserves the distinctive upward silhouette over time.
      const drift = reduced ? 0 : Math.sin(Math.max(0, elapsed - INTRO_DURATION) * 0.08) * 0.035;
      uniforms.uRotation.value += (dragRotation + drift - uniforms.uRotation.value) * ease;
      smoothScroll += (scroll - smoothScroll) * ease;
      // The headline dissolves early in the scroll while the galaxy starts to tip back.
      uniforms.uTextFade.value = 1 - smoothstep(0.03, 0.28, smoothScroll);
      // Once the stars have assembled, the headline sets into solid text and the star dust behind it fades away.
      uniforms.uTextSolid.value = reduced ? 1 : smoothstep(INTRO_DURATION + 0.2, INTRO_DURATION + 2.4, elapsed);
      for (const mesh of solidWords) (mesh.material as THREE.MeshBasicMaterial).opacity = uniforms.uTextSolid.value * uniforms.uTextFade.value * SOLID_HEADLINE_OPACITY;
      const scrollTilt = SCROLL_TILT * smoothstep(0, 1, smoothScroll);
      uniforms.uTilt.value += (dragTilt + scrollTilt - uniforms.uTilt.value) * ease;
      // Cursor wake: underdamped springs chase the pointer, so the dust it shoves keeps drifting and rocks back after the cursor stops.
      const hoverTarget = !reduced && hasPointer && pointerInside && inView ? 1 : 0;
      uniforms.uHover.value += (hoverTarget - uniforms.uHover.value) * (1 - Math.exp(-6 * dt));
      if (hasPointer && !reduced) {
        const steps = 3;
        const h = dt / steps;
        uniforms.uWake.value.forEach((wake, i) => {
          const omega = WAKE_FREQUENCIES[i];
          const velocity = wakeVelocity[i];
          for (let s = 0; s < steps; s++) {
            velocity.x += (omega * omega * (wakeTarget.x - wake.x) - 2 * WAKE_DAMPING * omega * velocity.x) * h;
            velocity.y += (omega * omega * (wakeTarget.y - wake.y) - 2 * WAKE_DAMPING * omega * velocity.y) * h;
            velocity.clampLength(0, WAKE_MAX_SPEED);
            wake.x += velocity.x * h;
            wake.y += velocity.y * h;
          }
          wake.z = velocity.x;
          wake.w = velocity.y;
        });
      }
      camera.position.set(cameraX, cameraY, CAMERA_Z * cameraFit);
      camera.lookAt(cameraX, cameraY, 0);
      if (inView) renderer.render(scene, camera);
    }
    tick();
    return () => {
      cancelAnimationFrame(frame);
      onPointerUp();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
      window.removeEventListener("keydown", onKeyDown);
      document.documentElement.removeEventListener("pointerleave", onPointerLeave);
      for (const mesh of solidWords) {
        const solid = mesh.material as THREE.MeshBasicMaterial;
        mesh.geometry.dispose(); solid.map?.dispose(); solid.dispose();
      }
      geometry.dispose(); material.dispose(); glowTexture.dispose(); glowMaterial.dispose(); renderer.dispose();
    };
  }, [rootRef, scrollScreens, flowSpeed, titleLeft, titleRight, font]);
  return <canvas ref={canvasRef} aria-hidden="true" style={{ position: "fixed", inset: 0, width: "100%", height: "100%", zIndex: 0, pointerEvents: "none", background: "radial-gradient(ellipse at 50% 48%, #010204 10%, #060c12 72%, #09121a 100%)" }} />;
}
