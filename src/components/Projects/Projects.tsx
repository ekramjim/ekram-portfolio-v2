"use client";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import GlassButton from "@/components/ui/GlassButton";
import { useReveal } from "@/components/ui/useReveal";
import type { Project, ProjectGroup } from "@/data/projects";
import ProjectCard from "./ProjectCard";
import ProjectDevice from "./ProjectDevice";
import ProjectsSky from "./ProjectsSky";
import styles from "./Projects.module.css";

interface ProjectsProps {
  projects: Project[];
  heading: string;
  /** Small line beside the heading, e.g. "Highlights". */
  note?: string;
  /** Link shown beside the heading and under the grid, if any. */
  footer?: { label: string; href: string };
  /** A short, curated set: the first two get wide cards, the rest sit three to a row. */
  featured?: boolean;
  /** Buttons above the grid that narrow it to one kind of project. */
  filters?: boolean;
  /** Project to show open on arrival, from a /projects/[id] link. */
  initialId?: string;
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

/** A project's details, shown inside its open window, with its links and the arrows to the next and previous project. */
function Details({ project, index, total, onStep }: { project: Project; index: number; total: number; onStep: (d: number) => void }) {
  return (
    <div className={styles.copy}>
      <p className={styles.idx}><i className={styles.dot} />{pad(index + 1)} / {pad(total)} · {project.group} · {project.year}</p>
      <h3 className={styles.title}>{project.name}</h3>
      <p className={styles.summary}>{project.summary}</p>
      <p className={styles.stack}>{project.stack.join("  ·  ")}</p>
      <div className={styles.actions}>
        {project.href && <GlassButton href={project.href}>{linkLabel(project.href)} ↗</GlassButton>}
        {project.status && <span className={styles.status}>{project.status}</span>}
        {project.github && <GlassButton href={project.github}>GitHub ↗</GlassButton>}
        <span className={styles.pager}>
          <GlassButton icon onClick={() => onStep(-1)} aria-label="Previous project">←</GlassButton>
          <GlassButton icon onClick={() => onStep(1)} aria-label="Next project">→</GlassButton>
        </span>
      </div>
    </div>
  );
}

/** Button text for a project's main link, based on where it points. */
function linkLabel(href: string) {
  if (href.toLowerCase().endsWith(".pdf")) return "View PDF";
  if (href.toLowerCase().endsWith(".dmg")) return "Download for Mac";
  const host = new URL(href, "https://ekram.tech").hostname;
  if (host.endsWith("github.com")) return "View on GitHub";
  if (host.endsWith("apple.com")) return "View on the App Store";
  return "Open project";
}

/**
 * Projects as a grid of cards over a galaxy. Each card's picture previews its project without a click (see ProjectCard),
 * and previewing one drifts the galaxy behind the grid to that project's star. Clicking grows the card's picture into a
 * full scene: the grid fades away, the camera flies into the star, and the project's details set themselves inside the
 * window. Arrow keys travel between stars; Escape returns.
 */
export default function Projects({ projects, heading, note, footer, featured, filters, initialId }: ProjectsProps) {
  const [hover, setHover] = useState(-1);
  const [open, setOpen] = useState(() => (initialId ? projects.findIndex((p) => p.id === initialId) : -1));
  const [holder, setHolder] = useState<number | undefined>(undefined);
  const [group, setGroup] = useState<ProjectGroup | null>(null);
  const small = useMedia("(max-width: 899px)");
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const deviceRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<SVGLineElement>(null);
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const openRef = useRef(open);
  openRef.current = open;
  const lastOpen = useRef(-1);
  const fromRect = useRef<DOMRect | null>(null);
  useReveal(gridRef);

  // Kinds of project, in the order they first appear, with how many of each.
  const groups = useMemo(() => {
    const counts = new Map<ProjectGroup, number>();
    projects.forEach((p) => counts.set(p.group, (counts.get(p.group) ?? 0) + 1));
    return [...counts];
  }, [projects]);
  // Indexes into `projects` of the cards on show. The galaxy always holds every project.
  const shown = useMemo(() => projects.flatMap((p, i) => (!group || p.group === group ? [i] : [])), [projects, group]);
  const shownRef = useRef(shown);
  shownRef.current = shown;

  const isOpen = open >= 0;
  const current = isOpen ? open : hover;
  const project = isOpen ? projects[open] : null;

  const openProject = useCallback((i: number, media?: HTMLElement) => {
    fromRect.current = media?.getBoundingClientRect() ?? null;
    // The section goes fullscreen while open; hold its place in the page so nothing jumps.
    if (openRef.current < 0 && sectionRef.current) setHolder(sectionRef.current.offsetHeight);
    setOpen(i);
    setHover(i);
  }, []);
  const close = useCallback(() => {
    setOpen(-1); setHover(-1); setHolder(undefined);
  }, []);
  // Travel between the projects on show, in grid order.
  const step = useCallback((d: number) => {
    setOpen((o) => {
      const list = shownRef.current, at = list.indexOf(o);
      return o < 0 || at < 0 ? o : list[(at + d + list.length) % list.length];
    });
  }, []);

  // Each open project has its own address, /projects/[id]. Opening one pushes it (so Back closes it), travelling between
  // stars replaces it, and closing returns to the page the visitor came from.
  const pushedRef = useRef(false);
  const fromPopRef = useRef(false);
  const basePathRef = useRef<string | null>(null);
  useEffect(() => {
    const here = window.location.pathname;
    if (open >= 0) {
      const target = `/projects/${projects[open].id}`;
      if (here !== target) {
        if (here.startsWith("/projects/")) {
          window.history.replaceState(null, "", target);
        } else {
          basePathRef.current = here + window.location.hash;
          window.history.pushState(null, "", target);
          pushedRef.current = true;
        }
      }
    } else if (here.startsWith("/projects/") && !fromPopRef.current) {
      if (pushedRef.current) window.history.back();
      else window.history.replaceState(null, "", basePathRef.current ?? "/projects");
      pushedRef.current = false;
    }
    fromPopRef.current = false;
  }, [open, projects]);
  useEffect(() => {
    const onPop = () => {
      fromPopRef.current = true;
      const id = window.location.pathname.match(/^\/projects\/([^/]+)\/?$/)?.[1];
      const index = id ? projects.findIndex((p) => p.id === id) : -1;
      if (index >= 0) openProject(index);
      else { pushedRef.current = false; close(); }
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [projects, openProject, close]);

  // Fullscreen while open: lock page scroll, close on Escape, arrows travel between stars.
  useEffect(() => {
    if (!isOpen) return;
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

  // Back to the grid: return focus to the card of the last project shown (arrows may have moved on from the first).
  useEffect(() => { if (open >= 0) lastOpen.current = open; }, [open]);
  const wasOpen = useRef(false);
  useEffect(() => {
    if (wasOpen.current && !isOpen) cardRefs.current[lastOpen.current]?.focus({ preventScroll: true });
    wasOpen.current = isOpen;
  }, [isOpen]);

  // Dotted line from the star (fixed spot in the scene) to the open window.
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

  // The card's picture grows into the open window: animate the window's box from where the picture sat to its own.
  useLayoutEffect(() => {
    const el = deviceRef.current, from = fromRect.current;
    fromRect.current = null;
    if (!isOpen || !el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const easing = "cubic-bezier(0.2, 0.7, 0.2, 1)";
    if (from) el.animate([{ left: `${from.left}px`, top: `${from.top}px`, width: `${from.width}px`, height: `${from.height}px` }, {}], { duration: 750, easing });
    else el.animate([{ opacity: 0, transform: "translateY(24px)" }, {}], { duration: 600, easing });
  }, [isOpen]);

  return (
    <div style={holder ? { height: holder } : undefined}>
      <section
        ref={sectionRef}
        id="projects"
        className={styles.section}
        data-open={isOpen ? "" : undefined}
        aria-labelledby="projects-title"
        onPointerLeave={(e) => { if (e.pointerType === "mouse" && openRef.current < 0) setHover(-1); }}
      >
        <ProjectsSky projects={projects} active={current} open={isOpen} small={small} />

        <h2 id="projects-title" className={styles.head}>
          <b>{heading}</b>
          {note && <span>{note}</span>}
        </h2>

        <div ref={gridRef} className={styles.wrap} data-open={isOpen ? "" : undefined} inert={isOpen}>
          {footer && <GlassButton href={footer.href} className={styles.topLink}>{footer.label}</GlassButton>}
          {filters && groups.length > 1 && (
            <div className={styles.filters} role="group" aria-label="Show one kind of project">
              <GlassButton size="small" aria-pressed={!group} onClick={() => setGroup(null)}>All <span className={styles.count}>{projects.length}</span></GlassButton>
              {groups.map(([name, count]) => (
                <GlassButton key={name} size="small" aria-pressed={group === name} onClick={() => setGroup(name)}>{name} <span className={styles.count}>{count}</span></GlassButton>
              ))}
            </div>
          )}
          <ul className={styles.grid} data-featured={featured ? "" : undefined}>
            {shown.map((i, k) => (
              <li key={projects[i].id}>
                <ProjectCard
                  project={projects[i]}
                  index={k}
                  wide={featured && k < 2}
                  buttonRef={(el) => { cardRefs.current[i] = el; }}
                  onOpen={(media) => openProject(i, media)}
                  onPreview={(on) => { if (openRef.current < 0) setHover((h) => (on ? i : h === i ? -1 : h)); }}
                />
              </li>
            ))}
          </ul>
          {footer && (
            <p className={styles.more}>
              <GlassButton href={footer.href} size="large">{footer.label}</GlassButton>
            </p>
          )}
        </div>

        {project && (
          <div ref={sceneRef} className={styles.scene} role="dialog" aria-label={project.name} tabIndex={-1} style={{ "--c": project.color, "--c2": project.color2 } as CSSProperties}>
            <svg className={styles.tether} aria-hidden="true"><line ref={lineRef} x1="0" y1="0" x2="0" y2="0" /></svg>
            <GlassButton className={styles.close} onClick={close}>Close <span aria-hidden="true">✕</span></GlassButton>

            <div ref={deviceRef} className={styles.device}>
              <ProjectDevice project={project} open key={project.id}>
                <Details project={project} index={Math.max(0, shown.indexOf(open))} total={shown.length} onStep={step} />
              </ProjectDevice>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
