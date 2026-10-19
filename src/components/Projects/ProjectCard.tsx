"use client";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { Project } from "@/data/projects";
import { hostLabel } from "./ProjectDevice";
import styles from "./ProjectCard.module.css";

/** How long each window screenshot shows while a card previews. */
const SHOT_MS = 1600;

interface ProjectCardProps {
  project: Project;
  /** Position in the grid, for the reveal delay. */
  index: number;
  /** One of the two wide cards at the top of a featured grid. */
  wide?: boolean;
  /** Opens the project; `media` is the card's picture, which the open window grows out of. */
  onOpen: (media: HTMLElement) => void;
  /** The card starts or stops previewing, so the sky behind the grid can drift to its star. */
  onPreview: (on: boolean) => void;
  buttonRef?: (el: HTMLButtonElement | null) => void;
}

/**
 * One project as a card whose picture shows the project without opening it. At rest it shows the first frame. While it
 * previews (hovered or keyboard-focused, or on a touch screen while it crosses the middle of the screen), a site capture
 * scrolls through the whole page, window screenshots take turns and phone screens fan out.
 *
 * The project name is the card's one button; its ::after stretches over the whole card, so the card is a single target
 * and the heading stays a real heading.
 */
export default function ProjectCard({ project, index, wide, onOpen, onPreview, buttonRef }: ProjectCardProps) {
  const cardRef = useRef<HTMLElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const [centred, setCentred] = useState(false);
  const [shot, setShot] = useState(0);
  const active = hovered || centred;
  const { name, group, year, summary, stack, status, screenshots, phone, preview, page } = project;
  const kind = page || (preview && !screenshots) ? "site" : screenshots?.length ? (phone ? "phones" : "window") : "mark";
  const host = hostLabel(project.href);

  // Touch screens have no hover, so a card previews while it crosses the middle band of the screen instead.
  useEffect(() => {
    const card = cardRef.current;
    if (!card || !window.matchMedia("(hover: none)").matches || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(([entry]) => setCentred(entry.isIntersecting), { rootMargin: "-38% 0px -38% 0px" });
    io.observe(card);
    return () => io.disconnect();
  }, []);

  // Window screenshots take turns while the card previews, and go back to the first when it stops.
  useEffect(() => {
    const count = kind === "window" ? screenshots!.length : 0;
    if (!active || count < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setShot(0); return; }
    const id = window.setInterval(() => setShot((s) => (s + 1) % count), SHOT_MS);
    return () => window.clearInterval(id);
  }, [active, kind, screenshots]);

  const showPreview = (on: boolean) => { setHovered(on); onPreview(on); };

  return (
    <article
      ref={cardRef}
      className={styles.card}
      data-wide={wide ? "" : undefined}
      data-active={active ? "" : undefined}
      data-reveal
      style={{ "--c": project.color, "--c2": project.color2, "--i": index % 3 } as CSSProperties}
      onPointerEnter={(e) => { if (e.pointerType === "mouse") showPreview(true); }}
      onPointerLeave={(e) => { if (e.pointerType === "mouse") showPreview(false); }}
    >
      <div ref={mediaRef} className={styles.media} data-kind={kind} aria-hidden="true">
        <div className={styles.art} />
        {kind === "site" && (
          <div className={styles.browser}>
            <div className={styles.bar}><i /><i /><i />{host && <span>{host}</span>}</div>
            <div className={styles.viewport}>
              {/* eslint-disable-next-line @next/next/no-img-element -- static WebP capture, already sized */}
              <img src={page ?? preview} alt="" loading="lazy" decoding="async" />
            </div>
          </div>
        )}
        {kind === "window" && (
          <div className={styles.shots}>
            {screenshots!.map((src, i) => (
              // eslint-disable-next-line @next/next/no-img-element -- static WebP with transparent corners
              <img key={src} src={src} alt="" loading="lazy" decoding="async" data-on={i === shot ? "" : undefined} />
            ))}
          </div>
        )}
        {kind === "phones" && (
          <div className={styles.phones}>
            {screenshots!.slice(0, 3).map((src, i) => (
              // eslint-disable-next-line @next/next/no-img-element -- static WebP phone screens
              <img key={src} src={src} alt="" loading="lazy" decoding="async" style={{ "--k": i - 1 } as CSSProperties} />
            ))}
          </div>
        )}
        {kind === "mark" && (
          <div className={styles.mark}>
            <b>{name.split(/\s+/).slice(0, 2).map((word) => word[0]).join("")}</b>
            <span>{stack.slice(0, 3).join(" · ")}</span>
          </div>
        )}
      </div>

      <div className={styles.text}>
        <p className={styles.meta}>
          <i className={styles.dot} />{group} · {year}
          {status && <span className={styles.status}>{status}</span>}
        </p>
        <h3 className={styles.name}>
          <button
            ref={buttonRef}
            type="button"
            onClick={() => mediaRef.current && onOpen(mediaRef.current)}
            onFocus={(e) => { if (e.currentTarget.matches(":focus-visible")) showPreview(true); }}
            onBlur={() => showPreview(false)}
          >
            {name}
          </button>
        </h3>
        <p className={styles.summary}>{summary}</p>
        <p className={styles.stack}>{stack.slice(0, 4).join("  ·  ")}{stack.length > 4 && `  +${stack.length - 4}`}</p>
      </div>
    </article>
  );
}
