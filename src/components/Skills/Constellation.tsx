"use client";
import { useEffect, useMemo, useRef, type CSSProperties } from "react";
import { levelOf, type SkillGroup } from "@/data/skills";
import styles from "./Skills.module.css";

/**
 * The star field's own colours (see sky.ts): the ordinary stars are blues, icy white, cream and amber, and the project
 * stars add orange, teal, purple, coral and green. Each entry is a colour and how likely it is. Each star is a flat dot
 * in one of them, with no glow.
 */
const PALETTE: [number, number, number, number][] = [
  [116, 180, 238, 0.16], [168, 216, 255, 0.28], [230, 242, 255, 0.4], [255, 228, 203, 0.48], [217, 152, 97, 0.58],
  [255, 181, 94, 0.68], [79, 208, 196, 0.77], [196, 155, 255, 0.86], [255, 138, 122, 0.93], [123, 228, 149, 1],
];
/** Dot radius by strength level (index 1–5). */
const RADIUS = [0, 2.4, 3, 3.8, 4.7, 5.8];
/** How opaque the dot is by level, so stronger skills read brighter as well as bigger. */
const OPACITY = [0, 0.55, 0.68, 0.8, 0.9, 1];
const W = 440, H = 310;
/** Rough width of one label character at the label font size (see .label in Skills.module.css). */
const CHAR = 7.3;
/** How far the pointer reaches, and how far it drags a star, in map units. */
const REACH = 120, PULL = 7;

/** Brighter for stronger: mixes the icy text colour toward the dim one. */
const shade = (level: number) => `color-mix(in srgb, var(--ink) ${[0, 28, 46, 64, 82, 100][level]}%, var(--ink-3))`;

interface Star { name: string; x: number; y: number; r: number; color: string; opacity: number; left: boolean; labelBase: string }
interface Box { x0: number; y0: number; x1: number; y1: number }
const hit = (a: Box, b: Box, pad: number) => a.x0 < b.x1 + pad && a.x1 + pad > b.x0 && a.y0 < b.y1 + pad && a.y1 + pad > b.y0;

/** A star's colour, drawn from the star field's palette. Depends only on the map and the star, so it never changes. */
function paletteFor(seed: number, i: number) {
  let h = (Math.imul(seed, 2654435761) + Math.imul(i + 1, 40503)) >>> 0;
  h ^= h >>> 16; h = Math.imul(h, 0x85ebca6b); h ^= h >>> 13; h = Math.imul(h, 0xc2b2ae35); h ^= h >>> 16;
  const u = (h >>> 0) / 4294967296;
  const [r, g, b] = PALETTE.find(([, , , odds]) => u < odds)!;
  return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Places every star with its label. Each candidate spot takes up the star and the label's footprint, and is only kept
 * if that footprint clears everything already placed, so labels can never sit on each other. Fixed seed, so it is the
 * same on the server and in the browser.
 */
function place(group: SkillGroup, seed: number): Star[] {
  let s = seed;
  const rnd = () => (s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296;
  const taken: Box[] = [];
  const out: Star[] = new Array(group.skills.length);
  // Strongest first, so they get the pick of the space.
  const order = group.skills.map((_, i) => i).sort((a, b) => group.skills[b].pct - group.skills[a].pct);
  for (const i of order) {
    const skill = group.skills[i], lv = levelOf(skill.pct), r = RADIUS[lv], tw = skill.name.length * CHAR + 2;
    let pad = 16, fallback: { star: Star; boxes: Box[] } | null = null, done = false;
    for (let attempt = 0; attempt < 900 && !done; attempt++) {
      if (attempt && attempt % 200 === 0) pad = Math.max(2, pad - 4);
      const x = 14 + rnd() * (W - 28), y = 16 + rnd() * (H - 32);
      for (const left of rnd() < 0.5 ? [false, true] : [true, false]) {
        const star: Box = { x0: x - r - 3, y0: y - r - 3, x1: x + r + 3, y1: y + r + 3 };
        const label: Box = left ? { x0: x - r - 7 - tw, y0: y - 10, x1: x - r - 5, y1: y + 6 } : { x0: x + r + 5, y0: y - 10, x1: x + r + 7 + tw, y1: y + 6 };
        const inside = Math.min(star.x0, label.x0) >= 4 && Math.max(star.x1, label.x1) <= W - 4 && star.y0 >= 4 && star.y1 <= H - 4;
        if (!inside) continue;
        const candidate = { name: skill.name, x, y, r, color: paletteFor(seed, i), opacity: OPACITY[lv], left, labelBase: shade(Math.max(lv, 2)) };
        if (taken.every((t) => !hit(t, star, pad) && !hit(t, label, pad))) { out[i] = candidate; taken.push(star, label); done = true; break; }
        fallback ??= { star: candidate, boxes: [star, label] };
      }
    }
    if (!done && fallback) { out[i] = fallback.star; taken.push(...fallback.boxes); }
  }
  return out;
}

/** Joins the stars with the shortest set of lines that connects them all. */
function tree(stars: Star[]) {
  const seen = new Set([0]), edges: [number, number][] = [];
  while (seen.size < stars.length) {
    let best: [number, number] | null = null, bd = Infinity;
    seen.forEach((i) => stars.forEach((p, j) => {
      if (seen.has(j)) return;
      const d = Math.hypot(stars[i].x - p.x, stars[i].y - p.y);
      if (d < bd) { bd = d; best = [i, j]; }
    }));
    if (!best) break;
    edges.push(best); seen.add(best[1]);
  }
  return edges;
}

export default function Constellation({ group, seed, index }: { group: SkillGroup; seed: number; index: number }) {
  const stars = useMemo(() => place(group, seed), [group, seed]);
  const edges = useMemo(() => tree(stars), [stars]);
  const figRef = useRef<HTMLElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const dotRefs = useRef<(SVGCircleElement | null)[]>([]);
  const textRefs = useRef<(SVGTextElement | null)[]>([]);
  const lineRefs = useRef<(SVGLineElement | null)[]>([]);
  const cursorRef = useRef<SVGCircleElement>(null);
  const beamRefs = useRef<(SVGLineElement | null)[]>([]);

  // The pointer joins the map as a small star: nearby stars swell, brighten and drift toward it, and dotted lines
  // link it to the closest three.
  useEffect(() => {
    const fig = figRef.current, svg = svgRef.current;
    if (!fig || !svg || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const n = stars.length;
    const inf = new Float32Array(n), px = new Float32Array(n), py = new Float32Array(n);
    let cx = -999, cy = -999, presence = 0, wantPresence = 0, raf = 0;

    const tick = () => {
      raf = 0;
      let moving = Math.abs(presence - wantPresence) > 0.01;
      presence += (wantPresence - presence) * 0.16;
      const near: { i: number; d: number }[] = [];
      for (let i = 0; i < n; i++) {
        const s = stars[i], d = Math.hypot(cx - s.x, cy - s.y);
        const target = wantPresence ? Math.pow(Math.max(0, 1 - d / REACH), 1.4) : 0;
        if (Math.abs(target - inf[i]) > 0.003) moving = true;
        inf[i] += (target - inf[i]) * 0.16;
        const k = inf[i];
        let x = s.x, y = s.y;
        if (k > 0.002 && d > 1) { x += ((cx - s.x) / d) * k * PULL; y += ((cy - s.y) / d) * k * PULL; }
        const r = s.r * (1 + k * 0.8);
        px[i] = x; py[i] = y;
        const dot = dotRefs.current[i];
        if (dot) {
          dot.setAttribute("cx", String(x)); dot.setAttribute("cy", String(y)); dot.setAttribute("r", String(r));
          dot.style.opacity = String(Math.min(1, s.opacity + k * (1 - s.opacity)));
        }
        const mix = Math.round(k * 100);
        const t = textRefs.current[i];
        if (t) {
          t.setAttribute("x", String(x + (s.left ? -(r + 7) : r + 7)));
          t.setAttribute("y", String(y + 4));
          t.style.fill = `color-mix(in srgb, var(--ink) ${mix}%, ${s.labelBase})`;
        }
        if (d < 170) near.push({ i, d });
      }
      edges.forEach(([a, b], e) => {
        const l = lineRefs.current[e];
        if (l) { l.setAttribute("x1", String(px[a])); l.setAttribute("y1", String(py[a])); l.setAttribute("x2", String(px[b])); l.setAttribute("y2", String(py[b])); }
      });
      const dot = cursorRef.current;
      if (dot) { dot.setAttribute("cx", String(cx)); dot.setAttribute("cy", String(cy)); dot.style.opacity = String(presence); }
      near.sort((a, b) => a.d - b.d);
      beamRefs.current.forEach((beam, k) => {
        const hitStar = near[k];
        if (!beam) return;
        if (!hitStar) { beam.style.opacity = "0"; return; }
        beam.setAttribute("x1", String(cx)); beam.setAttribute("y1", String(cy));
        beam.setAttribute("x2", String(px[hitStar.i])); beam.setAttribute("y2", String(py[hitStar.i]));
        beam.style.opacity = String(presence * Math.max(0, 1 - hitStar.d / 170) * 0.9);
      });
      if (moving || wantPresence) raf = requestAnimationFrame(tick);
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(tick); };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      const r = svg.getBoundingClientRect();
      cx = ((e.clientX - r.left) * W) / r.width;
      cy = ((e.clientY - r.top) * H) / r.height;
      wantPresence = 1;
      kick();
    };
    const onLeave = () => { wantPresence = 0; kick(); };
    fig.addEventListener("pointermove", onMove);
    fig.addEventListener("pointerleave", onLeave);
    return () => { fig.removeEventListener("pointermove", onMove); fig.removeEventListener("pointerleave", onLeave); cancelAnimationFrame(raf); };
  }, [stars, edges]);

  return (
    <figure ref={figRef} className={styles.card} data-reveal style={{ "--i": index } as CSSProperties}>
      <figcaption>{group.label}</figcaption>
      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${group.label}: ${group.skills.map((s) => s.name).join(", ")}`}>
        {edges.map(([a, b], i) => (
          <line key={i} ref={(el) => { lineRefs.current[i] = el; }} x1={stars[a].x} y1={stars[a].y} x2={stars[b].x} y2={stars[b].y} className={styles.line} />
        ))}
        {[0, 1, 2].map((k) => <line key={k} ref={(el) => { beamRefs.current[k] = el; }} className={styles.beam} />)}
        {stars.map((s, i) => (
          <g key={s.name}>
            <circle ref={(el) => { dotRefs.current[i] = el; }} cx={s.x} cy={s.y} r={s.r} style={{ fill: s.color, opacity: s.opacity }} />
            <text ref={(el) => { textRefs.current[i] = el; }} x={s.x + (s.left ? -(s.r + 7) : s.r + 7)} y={s.y + 4} textAnchor={s.left ? "end" : "start"} className={styles.label} style={{ fill: s.labelBase }}>{s.name}</text>
          </g>
        ))}
        <circle ref={cursorRef} r="2.4" className={styles.cursor} />
      </svg>
    </figure>
  );
}
