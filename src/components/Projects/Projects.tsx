"use client";
import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type FocusEvent, type PointerEvent } from "react";
import type { Project } from "@/data/projects";
import ProjectDevice from "./ProjectDevice";
import ProjectsSky from "./ProjectsSky";
import styles from "./Projects.module.css";

interface ProjectsProps {
  projects: Project[];
  heading: string;
  /** Small line beside the heading, e.g. "Highlights". */
  note?: string;
  /** Link shown under the list. */
  footer: { label: string; href: string };
}

function useMedia(query: string) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const update = () => setMatches(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [query]);
  return matches;
}

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Projects as a big type list over a galaxy. Hovering (or focusing) a name flies the galaxy to that project's star and
 * shows its preview. Clicking fuses into a full scene: the list fades away, the camera flies into the star, and the
 * project's title, preview and link set themselves on the sky. Arrow keys travel between stars; Escape returns.
 */
export default function Projects({ projects, heading, note, footer }: ProjectsProps) {
  const [hover, setHover] = useState(-1);
  const [open, setOpen] = useState(-1);
  const [holder, setHolder] = useState<number | undefined>(undefined);
  const small = useMedia("(max-width: 899px)");
  const tapMode = useMedia("(hover: none), (max-width: 899px)");
  const sectionRef = useRef<HTMLElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const deviceRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<SVGLineElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const pointerY = useRef(0);
  const position = useRef({ x: 0, y: 0, ready: false });
  const openRef = useRef(open);
  openRef.current = open;
  const lastOpen = useRef(-1);

  const isOpen = open >= 0;
  const current = isOpen ? open : hover;
  const project = isOpen ? projects[open] : null;

  const openProject = useCallback((i: number) => {
    // The section goes fullscreen while open; hold its place in the page so nothing jumps.
    if (openRef.current < 0 && sectionRef.current) setHolder(sectionRef.current.offsetHeight);
    setOpen(i);
    setHover(i);
  }, []);
  const close = useCallback(() => { setOpen(-1); setHover(-1); setHolder(undefined); }, []);
  const step = useCallback((d: number) => {
    setOpen((o) => (o < 0 ? o : (o + d + projects.length) % projects.length));
  }, [projects.length]);

  // Fullscreen while open: lock page scroll, close on Escape, arrows travel between stars.
  useEffect(() => {
    if (!isOpen) return;
    lastOpen.current = open;
    const html = document.documentElement, previous = html.style.overflow;
    html.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "ArrowRight" || event.key === "ArrowDown") { event.preventDefault(); step(1); }
      if (event.key === "ArrowLeft" || event.key === "ArrowUp") { event.preventDefault(); step(-1); }
    };
    window.addEventListener("keydown", onKey);
    sceneRef.current?.focus({ preventScroll: true });
    return () => { window.removeEventListener("keydown", onKey); html.style.overflow = previous; };
  }, [isOpen, close, step]); // eslint-disable-line react-hooks/exhaustive-deps

  // Back to the list: return focus to the row that was open.
  const wasOpen = useRef(false);
  useEffect(() => {
    if (wasOpen.current && !isOpen) rowRefs.current[lastOpen.current]?.focus({ preventScroll: true });
    wasOpen.current = isOpen;
  }, [isOpen]);

  // Dotted line from the star (fixed spot in the scene) to the preview frame.
  useLayoutEffect(() => {
    const line = lineRef.current, scene = sceneRef.current, device = deviceRef.current;
    if (!isOpen || !line || !scene || !device || small) return;
    const place = () => {
      const s = scene.getBoundingClientRect(), d = device.getBoundingClientRect();
      line.setAttribute("x1", String(s.width * 0.34 + 20));
      line.setAttribute("y1", String(s.height * 0.4));
      line.setAttribute("x2", String(d.left - s.left - 16));
      line.setAttribute("y2", String(d.top - s.top + d.height / 2));
    };
    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [isOpen, small, open]);

  // Desktop hover preview: a column between the list and the galaxy that trails the pointer vertically.
  useEffect(() => {
    const el = previewRef.current;
    if (!el || current < 0 || tapMode || isOpen) return;
    const phone = projects[current].kind === "phone";
    const height = phone ? 360 : 300;
    const width = phone ? (height * 9) / 19 : 380;
    el.style.setProperty("--h", `${height}px`);
    el.style.setProperty("--w", `${width}px`);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const wantX = window.innerWidth * 0.7 - width / 2;
      const wantY = Math.max(76, Math.min(window.innerHeight - height - 28, (pointerY.current || window.innerHeight / 2) - height / 2));
      const p = position.current;
      if (!p.ready || reduced) { p.x = wantX; p.y = wantY; p.ready = true; }
      p.x += (wantX - p.x) * 0.2;
      p.y += (wantY - p.y) * 0.16;
      el.style.transform = `translate(${p.x}px, ${p.y}px)`;
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, [current, isOpen, tapMode, projects]);

  const hoverOn = useCallback((i: number) => (event: PointerEvent) => {
    if (event.pointerType === "mouse" && openRef.current < 0) setHover(i);
  }, []);
  const hoverOff = useCallback((i: number) => (event: PointerEvent) => {
    if (event.pointerType === "mouse" && openRef.current < 0) setHover((h) => (h === i ? -1 : h));
  }, []);
  const focusOn = useCallback((i: number) => (event: FocusEvent<HTMLElement>) => {
    if (event.currentTarget.matches(":focus-visible") && openRef.current < 0) setHover(i);
  }, []);

  return (
    <div style={holder ? { height: holder } : undefined}>
      <section
        ref={sectionRef}
        className={styles.section}
        data-open={isOpen ? "" : undefined}
        aria-labelledby="projects-title"
        onPointerMove={(e) => { pointerY.current = e.clientY; }}
        onPointerLeave={(e) => { if (e.pointerType === "mouse" && openRef.current < 0) setHover(-1); }}
      >
        <ProjectsSky projects={projects} active={current} open={isOpen} small={small} />
        <div className={styles.scrim} />

        <h2 id="projects-title" className={styles.head}>
          <b>{heading}</b>
          {note && <span>{note}</span>}
        </h2>

        <div className={styles.wrap} data-open={isOpen ? "" : undefined} inert={isOpen}>
          <ol className={styles.rows} data-active={current >= 0 ? "" : undefined}>
            {projects.map((p, i) => (
              <li key={p.id}>
                <button
                  ref={(el) => { rowRefs.current[i] = el; }}
                  type="button"
                  className={`${styles.row} ${i === current ? styles.on : ""}`}
                  style={{ "--c": p.color } as CSSProperties}
                  onPointerEnter={hoverOn(i)}
                  onPointerLeave={hoverOff(i)}
                  onFocus={focusOn(i)}
                  onBlur={() => { if (openRef.current < 0) setHover(-1); }}
                  onClick={() => openProject(i)}
                >
                  <span className={styles.num}>{pad(i + 1)}</span>
                  <span className={styles.name}>{p.name}</span>
                </button>
              </li>
            ))}
            <li className={styles.more}>
              <Link href={footer.href} className={styles.moreLink}>{footer.label}</Link>
            </li>
          </ol>
        </div>

        {!tapMode && !isOpen && current >= 0 && (
          <div ref={previewRef} className={styles.preview} aria-hidden="true">
            <ProjectDevice project={projects[current]} />
          </div>
        )}

        {project && (
          <div ref={sceneRef} className={styles.scene} role="dialog" aria-label={project.name} tabIndex={-1} style={{ "--c": project.color } as CSSProperties}>
            <svg className={styles.tether} aria-hidden="true"><line ref={lineRef} x1="0" y1="0" x2="0" y2="0" /></svg>
            <button type="button" className={styles.close} onClick={close}>Close <span aria-hidden="true">✕</span></button>

            <div className={styles.info} key={project.id}>
              <p className={styles.idx}><i className={styles.dot} />{pad(open + 1)} / {pad(projects.length)} · {project.group}</p>
              <h3 className={styles.title}>{project.name}</h3>
              <p className={styles.summary}>{project.summary}</p>
              <p className={styles.stack}>{project.stack.join("  ·  ")}</p>
              <div className={styles.actions}>
                {project.href ? (
                  <Link href={project.href} className={styles.cta}>View case study →</Link>
                ) : (
                  <span className={styles.soon}>Case study coming soon</span>
                )}
                <span className={styles.pager}>
                  <button type="button" onClick={() => step(-1)} aria-label="Previous project">←</button>
                  <button type="button" onClick={() => step(1)} aria-label="Next project">→</button>
                </span>
              </div>
            </div>

            <div ref={deviceRef} className={styles.device} key={`d-${project.id}`}>
              <ProjectDevice project={project} />
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
