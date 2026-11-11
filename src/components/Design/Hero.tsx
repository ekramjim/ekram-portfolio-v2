"use client";
import { useEffect, useRef } from "react";
import type { DesignPiece } from "@/data/design";
import styles from "./Hero.module.css";

/* eslint-disable @next/next/no-img-element -- static WebPs already sized for the page */

/** One piece of work laid on the canvas: where it sits (fractions of the canvas), how wide, and how far it floats. */
interface CanvasItem {
  /** A picture; or, with `kind`, a small piece of the design system drawn in code. */
  src?: string;
  kind?: "palette" | "type";
  label?: string;
  width: number;
  height: number;
  /** Left and top as fractions of the canvas; width as a fraction of the canvas's width. */
  x: number;
  y: number;
  w: number;
  /** How much it drifts with scroll and the pointer: further away moves less. */
  depth: number;
  round?: "phone" | "icon" | "card";
  /** Where it sits on a phone (same units, on a square canvas); none = left off, there's no room. */
  m?: [number, number, number];
}

// Placed in a 2.3 : 1 box on wide screens (a square one on phones), so the arrangement keeps its shape at any size.
// Only the items with `m` show on phones.
const ITEMS: CanvasItem[] = [
  { src: "/design/allegro/midnight-rich.webp", label: "Allegro / Midnight Rich", width: 1600, height: 900, x: 0, y: 0.06, w: 0.16, depth: 0.12, round: "card", m: [0, 0.04, 0.52] },
  { src: "/design/budly/08-home.webp", label: "iOS / 08 Home", width: 590, height: 1279, x: 0.29, y: 0.02, w: 0.12, depth: 0.32, round: "phone", m: [0.6, 0, 0.3] },
  { src: "/design/shepherd-cover-v2.webp", label: "Cover v2", width: 2000, height: 1125, x: 0.52, y: 0.06, w: 0.26, depth: 0.08, round: "card", m: [0.04, 0.42, 0.6] },
  { src: "/design/shepherd-icon-light.webp", label: "Terminal Lens", width: 512, height: 512, x: 0.86, y: 0.04, w: 0.09, depth: 0.45, round: "icon", m: [0.72, 0.72, 0.24] },
  { src: "/design/usage-finder-icon-dark.webp", label: "Usage Finder", width: 512, height: 512, x: 0.9, y: 0.56, w: 0.07, depth: 0.6, round: "icon", m: [0.02, 0.82, 0.15] },
  { src: "/design/shepherd-icon-glass-lamb.webp", label: "A · Glass Lamb", width: 400, height: 400, x: 0.012, y: 0.38, w: 0.06, depth: 0.55, round: "icon" },
  { src: "/design/usage-finder-icon-v1.webp", label: "v1", width: 400, height: 400, x: 0.095, y: 0.38, w: 0.055, depth: 0.4, round: "icon" },
  { kind: "palette", label: "Budly / Palette", width: 8, height: 1, x: 0, y: 0.63, w: 0.16, depth: 0.2 },
  { src: "/design/allegro/dusk-indigo.webp", label: "Allegro / Dusk Indigo", width: 1600, height: 900, x: 0, y: 0.8, w: 0.1, depth: 0.3, round: "card" },
  { kind: "type", width: 1, height: 1, x: 0.115, y: 0.8, w: 0.052, depth: 0.5 },
  { src: "/design/budly/01-welcome.webp", label: "iOS / 01 Welcome", width: 590, height: 1279, x: 0.185, y: 0.22, w: 0.085, depth: 0.5, round: "phone" },
  { src: "/design/budly/18-journey.webp", label: "iOS / 18 Journey", width: 590, height: 1279, x: 0.42, y: 0.36, w: 0.08, depth: 0.42, round: "phone" },
  { src: "/design/budly-web.webp", label: "Web / D03 Home", width: 2000, height: 1250, x: 0.52, y: 0.48, w: 0.17, depth: 0.22, round: "card" },
  { src: "/design/budly-admin.webp", label: "Admin / A01 Overview", width: 2000, height: 1250, x: 0.52, y: 0.79, w: 0.13, depth: 0.16, round: "card" },
  { src: "/design/budly-direction.webp", label: "00 Design direction", width: 2000, height: 1639, x: 0.71, y: 0.48, w: 0.11, depth: 0.28, round: "card" },
  { src: "/design/allegro/sage-forest.webp", label: "Allegro / Sage Forest", width: 1600, height: 900, x: 0.69, y: 0.8, w: 0.1, depth: 0.36, round: "card" },
  { src: "/design/shepherd-icon-dark.webp", width: 512, height: 512, x: 0.8, y: 0.28, w: 0.065, depth: 0.62, round: "icon" },
  { src: "/design/shepherd-icon-terminal-lens-concept.webp", label: "C · Concept", width: 400, height: 400, x: 0.895, y: 0.3, w: 0.06, depth: 0.34, round: "icon" },
  { src: "/design/usage-finder-icon-light.webp", width: 512, height: 512, x: 0.84, y: 0.78, w: 0.06, depth: 0.5, round: "icon" },
];

const BUDLY = ["#2E6AA0", "#1D4770", "#EE8636", "#C75F35", "#F8D96E", "#7E8E57", "#FBF6EC", "#1F2A37"];

/**
 * The page's opening: no headline to speak of, just the work laid out like frames on a canvas, drifting apart a
 * little as you scroll and following the pointer slightly. A line of copy and the index sit at the foot.
 */
export default function Hero({ pieces }: { pieces: DesignPiece[] }) {
  const ref = useRef<HTMLElement>(null);
  const room = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLDivElement>(null);

  // The canvas is the largest 2.3 : 1 box (1 : 1 on phones) that fits the room above the foot.
  useEffect(() => {
    const r = room.current, c = canvas.current;
    if (!r || !c) return;
    const fit = () => {
      const cs = getComputedStyle(r);
      const w = r.clientWidth;
      const h = r.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
      const ratio = window.innerWidth < 900 ? 1 : 2.3;
      const width = Math.max(0, Math.min(w, h * ratio));
      c.style.width = `${width}px`;
      c.style.height = `${width / ratio}px`;
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(r);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const items = Array.from(el.querySelectorAll<HTMLElement>("[data-depth]"));
    let px = 0, py = 0, raf = 0;
    const draw = () => {
      raf = 0;
      const s = window.scrollY;
      for (const it of items) {
        const d = Number(it.dataset.depth);
        it.style.transform = `translate3d(${px * d * -26}px, ${py * d * -18 - s * d * 0.9}px, 0)`;
      }
    };
    const ask = () => { if (!raf) raf = requestAnimationFrame(draw); };
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      px = e.clientX / window.innerWidth - 0.5;
      py = e.clientY / window.innerHeight - 0.5;
      ask();
    };
    window.addEventListener("scroll", ask, { passive: true });
    window.addEventListener("pointermove", move, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", ask);
      window.removeEventListener("pointermove", move);
    };
  }, []);

  return (
    <header ref={ref} className={styles.hero} data-piece="intro">
      <div ref={room} className={styles.room}>
        <div ref={canvas} className={styles.canvas}>
          {ITEMS.map((it, i) => (
            <figure
              key={it.src ?? it.kind}
              className={[styles.item, it.round && styles[it.round], !it.m && styles.wideOnly].filter(Boolean).join(" ")}
              style={{
                "--x": `${it.x * 100}%`, "--y": `${it.y * 100}%`, "--w": `${it.w * 100}%`,
                "--mx": `${(it.m?.[0] ?? 0) * 100}%`, "--my": `${(it.m?.[1] ?? 0) * 100}%`, "--mw": `${(it.m?.[2] ?? 0) * 100}%`,
                "--i": i,
              } as React.CSSProperties}
              data-depth={it.depth}
            >
              {it.label && <figcaption>{it.label}</figcaption>}
              {it.kind === "palette" ? (
                <div className={styles.palette}>{BUDLY.map((c) => <i key={c} style={{ background: c }} />)}</div>
              ) : it.kind === "type" ? (
                <div className={styles.type}><b>Aa</b><span>Fraunces</span></div>
              ) : (
                <img src={it.src} alt="" width={it.width} height={it.height} draggable={false} fetchPriority={i < 3 ? "high" : "auto"} />
              )}
            </figure>
          ))}
        </div>
      </div>

      <div className={styles.foot}>
        <h1 className={styles.line}>Interfaces, icons and artwork for the apps I build.</h1>
        <ol className={styles.index}>
          {pieces.map((p, i) => (
            <li key={p.id}>
              <a href={`#${p.id}`}>
                <span>{String(i + 1).padStart(2, "0")}</span>
                {p.name} <em>{p.subtitle}</em>
              </a>
            </li>
          ))}
        </ol>
      </div>
    </header>
  );
}
