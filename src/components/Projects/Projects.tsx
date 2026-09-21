"use client";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type FocusEvent, type PointerEvent } from "react";
import UnderlineLink from "@/components/ui/UnderlineLink";
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

/** How long each project stays featured before the preview moves on to the next. */
const AUTO_MS = 5000;

const pad = (n: number) => String(n).padStart(2, "0");

/** A project's details, shown inside its window: compact on the hover preview, in full (with links) once opened. */
function Details({ project, index, total, peek, onStep }: { project: Project; index: number; total: number; peek?: boolean; onStep?: (d: number) => void }) {
  return (
    <div className={styles.copy} data-peek={peek ? "" : undefined}>
      <p className={styles.idx}><i className={styles.dot} />{pad(index + 1)} / {pad(total)} · {project.group} · {project.year}</p>
      <h3 className={styles.title}>{project.name}</h3>
      <p className={styles.summary}>{project.summary}</p>
      <p className={styles.stack}>{project.stack.join("  ·  ")}</p>
      {peek ? (
        <p className={styles.hint}>Click to open →</p>
      ) : (
        <div className={styles.actions}>
          {project.href && (
            <UnderlineLink href={project.href} className={styles.cta}>{linkLabel(project.href)} ↗</UnderlineLink>
          )}
          {project.github && (
            <a href={project.github} target="_blank" rel="noopener noreferrer" className={styles.ctaQuiet}>GitHub ↗</a>
          )}
          <span className={styles.pager}>
            <button type="button" onClick={() => onStep?.(-1)} aria-label="Previous project">←</button>
            <button type="button" onClick={() => onStep?.(1)} aria-label="Next project">→</button>
          </span>
        </div>
      )}
    </div>
  );
}

/** Button text for a project's main link, based on where it points. */
function linkLabel(href: string) {
  const host = new URL(href).hostname;
  if (host.endsWith("github.com")) return "View on GitHub";
  if (host.endsWith("apple.com")) return "View on the App Store";
  return "Open project";
}

/**
 * Projects as a compact list over a galaxy, with a desktop window beside it that is never empty: left alone, it features
 * each project in turn (the galaxy drifts to that project's star). Hovering (or focusing) a name pauses the cycle and
 * features that project. Clicking grows the window into a full scene: the list fades away, the camera flies into the
 * star, and the project's details set themselves inside the window. Arrow keys travel between stars; Escape returns.
 */
export default function Projects({ projects, heading, note, footer }: ProjectsProps) {
  const [hover, setHover] = useState(-1);
  const [featured, setFeatured] = useState(0);
  const [onCard, setOnCard] = useState(false);
  const [visible, setVisible] = useState(true);
  const [open, setOpen] = useState(-1);
  const [holder, setHolder] = useState<number | undefined>(undefined);
  const small = useMedia("(max-width: 899px)");
  const tapMode = useMedia("(hover: none), (max-width: 899px)");
  const reduced = useMedia("(prefers-reduced-motion: reduce)");
  const sectionRef = useRef<HTMLElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const deviceRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<SVGLineElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const position = useRef({ x: 0, y: 0, ready: false });
  const openRef = useRef(open);
  openRef.current = open;
  const lastOpen = useRef(-1);
  const fromRect = useRef<DOMRect | null>(null);

  const isOpen = open >= 0;
  // Left alone (desktop), the window features each project in turn; hovering a name or the window itself takes over.
  const cycling = !isOpen && hover < 0 && !onCard && !tapMode && !reduced && visible && projects.length > 1;
  const current = isOpen ? open : hover >= 0 ? hover : tapMode ? -1 : featured;
  const project = isOpen ? projects[open] : null;

  const openProject = useCallback((i: number) => {
    fromRect.current = previewRef.current?.getBoundingClientRect() ?? null;
    // The section goes fullscreen while open; hold its place in the page so nothing jumps.
    if (openRef.current < 0 && sectionRef.current) setHolder(sectionRef.current.offsetHeight);
    setOpen(i);
    setHover(i);
    setFeatured(i);
    setOnCard(false);
  }, []);
  const close = useCallback(() => {
    if (openRef.current >= 0) setFeatured(openRef.current);
    setOpen(-1); setHover(-1); setOnCard(false); setHolder(undefined);
  }, []);
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

  // Only run the cycle and the preview animation while the section is on screen.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Feature the next project every AUTO_MS while nobody is hovering.
  useEffect(() => {
    if (!cycling) return;
    const id = window.setTimeout(() => setFeatured((f) => (f + 1) % projects.length), AUTO_MS);
    return () => window.clearTimeout(id);
  }, [cycling, featured, projects.length]);

  // Dotted line from the star (fixed spot in the scene) to the preview frame.
  useLayoutEffect(() => {
    const line = lineRef.current, scene = sceneRef.current, device = deviceRef.current;
    if (!isOpen || !line || !scene || !device || small) return;
    const place = () => {
      const s = scene.getBoundingClientRect(), d = device.getBoundingClientRect();
      line.setAttribute("x1", String(s.width * 0.14 + 20));
      line.setAttribute("y1", String(s.height * 0.5));
      line.setAttribute("x2", String(d.left - s.left - 16));
      line.setAttribute("y2", String(d.top - s.top + d.height / 2));
    };
    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [isOpen, small, open]);

  // The hover preview grows into the open window: animate the window's box from where the preview sat to its own.
  useLayoutEffect(() => {
    const el = deviceRef.current, from = fromRect.current;
    fromRect.current = null;
    if (!isOpen || !el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const easing = "cubic-bezier(0.2, 0.7, 0.2, 1)";
    if (from) el.animate([{ left: `${from.left}px`, top: `${from.top}px`, width: `${from.width}px`, height: `${from.height}px` }, {}], { duration: 750, easing });
    else el.animate([{ opacity: 0, transform: "translateY(24px)" }, {}], { duration: 600, easing });
  }, [isOpen]);

  // Desktop preview: a column between the list and the galaxy, level with the middle of the section. It stays put so
  // it can be clicked.
  useEffect(() => {
    const el = previewRef.current, section = sectionRef.current;
    if (!el || !section || current < 0 || tapMode || isOpen || !visible) return;
    const width = 440, height = 400;
    el.style.setProperty("--w", `${width}px`);
    el.style.setProperty("--h", `${height}px`);
    el.style.opacity = "1";
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const s = section.getBoundingClientRect();
      const wantX = s.width * 0.7 - width / 2;
      const wantY = Math.max(76, Math.min(s.height - height - 28, (s.height - height) / 2));
      const p = position.current;
      if (!p.ready || reduced) { p.x = wantX; p.y = wantY; p.ready = true; }
      p.x += (wantX - p.x) * 0.2;
      p.y += (wantY - p.y) * 0.16;
      el.style.transform = `translate(${p.x}px, ${p.y}px)`;
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, [current, isOpen, tapMode, visible, reduced, projects]);

  const hoverOn = useCallback((i: number) => (event: PointerEvent) => {
    if (event.pointerType === "mouse" && openRef.current < 0) { setHover(i); setFeatured(i); }
  }, []);
  const hoverOff = useCallback((i: number) => (event: PointerEvent) => {
    if (event.pointerType === "mouse" && openRef.current < 0) setHover((h) => (h === i ? -1 : h));
  }, []);
  const focusOn = useCallback((i: number) => (event: FocusEvent<HTMLElement>) => {
    if (event.currentTarget.matches(":focus-visible") && openRef.current < 0) { setHover(i); setFeatured(i); }
  }, []);

  return (
    <div style={holder ? { height: holder } : undefined}>
      <section
        ref={sectionRef}
        className={styles.section}
        data-open={isOpen ? "" : undefined}
        aria-labelledby="projects-title"
        onPointerLeave={(e) => { if (e.pointerType === "mouse" && openRef.current < 0) setHover(-1); }}
      >
        <ProjectsSky projects={projects} active={current} open={isOpen} small={small} />
        <div className={styles.scrim} />

        <h2 id="projects-title" className={styles.head}>
          <b>{heading}</b>
          {note && <span>{note}</span>}
        </h2>

        <div className={styles.wrap} data-open={isOpen ? "" : undefined} inert={isOpen}>
          <ol className={styles.rows} data-active={current >= 0 ? "" : undefined} data-auto={cycling ? "" : undefined}>
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
                  <span className={styles.meta}>{p.group} · {p.year}</span>
                </button>
              </li>
            ))}
            <li className={styles.more}>
              <UnderlineLink href={footer.href} className={styles.moreLink}>{footer.label}</UnderlineLink>
            </li>
          </ol>
        </div>

        {!tapMode && !isOpen && current >= 0 && (
          <div
            ref={previewRef}
            className={styles.preview}
            aria-hidden="true"
            style={{ opacity: 0 }}
            onPointerEnter={(e) => { if (e.pointerType === "mouse") setOnCard(true); }}
            onPointerLeave={(e) => { if (e.pointerType === "mouse") setOnCard(false); }}
            onClick={() => openProject(current)}
          >
            <ProjectDevice project={projects[current]}>
              <Details project={projects[current]} index={current} total={projects.length} peek />
            </ProjectDevice>
            {cycling && <i key={featured} className={styles.progress} style={{ animationDuration: `${AUTO_MS}ms` }} />}
          </div>
        )}

        {project && (
          <div ref={sceneRef} className={styles.scene} role="dialog" aria-label={project.name} tabIndex={-1} style={{ "--c": project.color } as CSSProperties}>
            <svg className={styles.tether} aria-hidden="true"><line ref={lineRef} x1="0" y1="0" x2="0" y2="0" /></svg>
            <button type="button" className={styles.close} onClick={close}>Close <span aria-hidden="true">✕</span></button>

            <div ref={deviceRef} className={styles.device}>
              <ProjectDevice project={project} open key={project.id}>
                <Details project={project} index={open} total={projects.length} onStep={step} />
              </ProjectDevice>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
