"use client";
import { useEffect, useRef, type RefObject } from "react";
import * as THREE from "three";
import { getScrollProgress } from "./scrollProgress";
import type { GalaxyPhase } from "./types";

const INTRO_DURATION = 5.2;
const ARM_COUNT = 3;
// Background field (800) + core (CORE_COUNT) come first; arm stars are budgeted per arm so density holds as arms are added.
const FIELD_COUNT = 800;
const CORE_COUNT = 350;
const FIELD_AND_CORE = FIELD_COUNT + CORE_COUNT;
function smoothstep(a: number, b: number, value: number) {
  const t = THREE.MathUtils.clamp((value - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
}

function buildStars(mobile: boolean) {
  let seed = 76129;
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) | 0;
    return (seed >>> 0) / 4294967296;
  };
  const gaussian = () => (random() + random() + random() + random() - 2) * 1.73;
  const count = FIELD_AND_CORE + ARM_COUNT * (mobile ? 2200 : 3700);
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
    const hot = bright || (!core && random() < 0.06);
    let t = random() < 0.72 ? knots[Math.floor(random() * knots.length)] + gaussian() * 0.012 : random();
    t = THREE.MathUtils.clamp(t, 0, 1);
    // Arm stars are placed in the vertex shader from (t, strand, noise) so they can flow along the spiral.
    arm.set([Math.min(t, 0.9999), i % ARM_COUNT], i * 2);
    noise.set([gaussian(), gaussian(), gaussian()], i * 3);
    let x = 0, y = 0, z = 0;
    if (field) { x = (random() - 0.5) * 850; y = (random() - 0.5) * 650; z = -60 - random() * 220; }
    if (core) { const r = Math.pow(random(), 2.2) * 24; const a = random() * Math.PI * 2; x = Math.cos(a) * r; y = Math.sin(a) * r; z = gaussian() * 3; }
    position.set([x, y, z], i * 3);
    scatter.set([(random() - 0.5) * 700, (random() - 0.5) * 480 + 35, (random() - 0.5) * 160], i * 3);
    const pick = random();
    const tone = core ? palette[2] : palette[pick < 0.3 ? 0 : pick < 0.55 ? 1 : pick < 0.78 ? 2 : pick < 0.91 ? 3 : 4];
    const intensity = field ? 0.2 + random() * 0.5 : core && !bright ? 0.7 + random() * 0.9 : hot ? 1.6 + random() * 1.8 : 0.32 + random() * 0.65;
    color.set([tone.r * intensity, tone.g * intensity, tone.b * intensity], i * 3);
    size[i] = core ? (bright ? 6 + random() * 13 : 1.4 + random() * 2.6) : field ? (random() < 0.025 ? 12 : 0.8 + random() * 2) : hot ? 15 + Math.pow(random(), 2) * 25 : 0.8 + random() * 1.8;
    phase[i] = random() * Math.PI * 2;
    kind[i] = field ? 1 : core ? 2 : 0;
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
  return geometry;
}

interface GalaxySceneProps {
  /** Scroll zone element; scroll progress, drag and key handling are scoped to it. */
  rootRef: RefObject<HTMLElement | null>;
  scrollScreens: number;
  flowSpeed: number;
  onPhaseChange: (phase: GalaxyPhase) => void;
  /** Bump to replay the intro. */
  replayToken: number;
}

export default function GalaxyScene({ rootRef, scrollScreens, flowSpeed, onPhaseChange, replayToken }: GalaxySceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Latest props live in refs so the scene effect runs once and is never torn down by parent re-renders.
  const onPhaseRef = useRef(onPhaseChange);
  onPhaseRef.current = onPhaseChange;
  const replayTokenRef = useRef(replayToken);
  replayTokenRef.current = replayToken;
  useEffect(() => {
    const canvas = canvasRef.current;
    const root = rootRef.current;
    if (!canvas || !root) return;
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
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth < 640 ? 1.5 : 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.NoToneMapping;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1800);
    const geometry = buildStars(window.innerWidth < 640);
    const uniforms = {
      uTime: { value: 0 }, uFormation: { value: 0 }, uRotation: { value: 0 },
      uTilt: { value: 0 }, uFade: { value: 0 }, uFlow: { value: 0 }, uFlowFade: { value: 0 }, uPixelRatio: { value: renderer.getPixelRatio() },
    };
    const material = new THREE.ShaderMaterial({
      uniforms, vertexColors: true, transparent: true, depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: `
        attribute vec3 aScatter;
        attribute float aSize, aPhase, aKind;
        attribute vec2 aArm;
        attribute vec3 aNoise;
        uniform float uTime, uFormation, uRotation, uTilt, uFade, uPixelRatio, uFlow, uFlowFade;
        varying vec3 vColor;
        varying float vAlpha, vHot;
        void main() {
          float background = 1.0 - step(0.1, abs(aKind - 1.0));
          float core = step(1.5, aKind);
          // Easing is applied on the CPU (uFormation) so assembly starts moving on the first frame.
          float f = clamp(uFormation * 1.12 - aPhase * 0.018, 0.0, 1.0);
          // Arm stars ride the spiral: t runs 0 (core) to 1 (rim) and uFlow slides it inward, wrapping at the rim.
          float arm = 1.0 - step(0.5, aKind);
          float t = mod(aArm.x - uFlow, 1.0);
          float radius = 18.0 + 104.0 * pow(t, 0.94);
          float angle = 1.55 + (1.0 - t) * 10.2 - aArm.y * (1.15 - 0.25 * t);
          float spread = mix(1.0, 0.65, step(5.0, aSize)) * (1.1 + 4.0 * sin(t * 3.14159265));
          float radial = radius + aNoise.x * spread;
          float theta = angle + aNoise.y * spread / max(radius, 8.0);
          float tail = 87.0 * pow(max(0.0, (t - 0.76) / 0.24), 1.6);
          vec3 armPosition = vec3(cos(theta) * radial * 1.12, sin(theta) * radial + tail, aNoise.z * (2.0 + 5.0 * sin(t * 3.14159265)));
          // Core stars swirl with differential rotation: fastest at the centre (~3 turns/min), slowing outward.
          // Negative so it turns the same way the arm stars travel (counter-clockwise on screen).
          float swirl = -uTime * 0.31 / (1.0 + length(position.xy) / 8.0) * core;
          vec3 basePosition = vec3(mat2(cos(swirl), -sin(swirl), sin(swirl), cos(swirl)) * position.xy, position.z);
          vec3 galaxyPosition = mix(basePosition, armPosition, arm);
          vec3 p = mix(aScatter, galaxyPosition, mix(f, 1.0, background));
          float sweep = sin(f * 3.14159265) * (1.0 - f) * 0.6;
          float rotation = (uRotation + sweep) * (1.0 - background);
          p.xy = mat2(cos(rotation), -sin(rotation), sin(rotation), cos(rotation)) * p.xy;
          float tilt = uTilt * (1.0 - background);
          p.yz = mat2(cos(tilt), -sin(tilt), sin(tilt), cos(tilt)) * p.yz;
          vec4 viewPosition = modelViewMatrix * vec4(p, 1.0);
          gl_Position = projectionMatrix * viewPosition;
          gl_PointSize = clamp(aSize * uPixelRatio * 440.0 / max(100.0, -viewPosition.z), 0.8, 80.0);
          vColor = color;
          vHot = step(5.0, aSize);
          float twinkle = 0.9 + 0.1 * sin(uTime * 0.65 + aPhase);
          // Stars fade in at the rim and out into the core so the wrap-around is never seen.
          float seam = smoothstep(0.0, 0.05, t) * (1.0 - smoothstep(0.95, 1.0, t));
          vAlpha = uFade * twinkle * mix(1.0, 0.22 + 0.78 * f, core) * mix(1.0, seam, arm * uFlowFade);
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
    // The camera never moves; scrolling tips the galaxy backwards (top edge away from the viewer) around the x axis.
    const CAMERA_Y = 44;
    const CAMERA_Z = 440;
    const SCROLL_TILT = 1.3;
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
      const target = event.target instanceof Element ? event.target.closest<HTMLElement>("[data-galaxy-interaction]") : null;
      if (!target || !root.contains(target) || event.button !== 0 || pointer) return;
      pointer = { id: event.pointerId, x: event.clientX, y: event.clientY, target };
      target.setPointerCapture(event.pointerId);
      target.style.cursor = "grabbing";
    };
    const onPointerMove = (event: PointerEvent) => {
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
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth < 640 ? 1.5 : 2));
      renderer.setSize(window.innerWidth, stableHeight);
      uniforms.uPixelRatio.value = renderer.getPixelRatio();
      onScroll();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
    window.addEventListener("keydown", onKeyDown);
    onScroll();
    onReplay();
    const clock = new THREE.Clock();
    let frame: number;
    function tick() {
      frame = requestAnimationFrame(tick);
      const dt = Math.min(clock.getDelta(), 0.05);
      if (document.hidden) return;
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
      const scrollTilt = SCROLL_TILT * smoothstep(0, 1, smoothScroll);
      uniforms.uTilt.value += (dragTilt + scrollTilt - uniforms.uTilt.value) * ease;
      const fit = Math.max(1, 0.8 / camera.aspect);
      camera.position.set(0, CAMERA_Y, CAMERA_Z * fit);
      camera.lookAt(0, CAMERA_Y, 0);
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
      geometry.dispose(); material.dispose(); glowTexture.dispose(); glowMaterial.dispose(); renderer.dispose();
    };
  }, [rootRef, scrollScreens, flowSpeed]);
  return <canvas ref={canvasRef} aria-hidden="true" style={{ position: "fixed", inset: 0, width: "100%", height: "100%", zIndex: 0, pointerEvents: "none", background: "radial-gradient(ellipse at 50% 48%, #010204 10%, #060c12 72%, #09121a 100%)" }} />;
}
