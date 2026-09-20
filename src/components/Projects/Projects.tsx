"use client";
import { useCallback, useEffect, useRef, useState, type CSSProperties, type FocusEvent, type PointerEvent } from "react";
import { PROJECTS, TOTAL_PROJECTS } from "@/data/projects";
import ProjectDevice from "./ProjectDevice";
import ProjectsSky from "./ProjectsSky";
import styles from "./Projects.module.css";

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
 * Projects as a big type list over a galaxy. Hovering (or focusing) a name flies the galaxy to that project's star
 * and shows its preview; on touch screens a tap opens the preview under the row instead.
 */
export default function Projects() {
  const [active, setActive] = useState(-1);
  const small = useMedia("(max-width: 899px)");
  const tapMode = useMedia("(hover: none), (max-width: 899px)");
  const previewRef = useRef<HTMLDivElement>(null);
  const pointerY = useRef(0);
  const position = useRef({ x: 0, y: 0, ready: false });

  // The preview sits in its own column between the list and the galaxy and follows the pointer vertically.
  useEffect(() => {
    const el = previewRef.current;
    if (!el || active < 0 || tapMode) return;
    const project = PROJECTS[active];
    const phone = project.kind === "phone";
    const height = phone ? 360 : 300;
    const width = phone ? (height * 9) / 19 : 380;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const wantX = window.innerWidth * 0.71 - width / 2;
      const wantY = Math.max(76, Math.min(window.innerHeight - height - 28, (pointerY.current || window.innerHeight / 2) - height / 2));
      const p = position.current;
      if (!p.ready || reduced) { p.x = wantX; p.y = wantY; p.ready = true; }
      p.x += (wantX - p.x) * 0.2;
      p.y += (wantY - p.y) * 0.16;
      el.style.transform = `translate(${p.x}px, ${p.y}px)`;
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, [active, tapMode]);

  const hoverOn = useCallback((i: number) => (event: PointerEvent) => {
    if (event.pointerType === "mouse") setActive(i);
  }, []);
  const focusOn = useCallback((i: number) => (event: FocusEvent<HTMLElement>) => {
    if (event.currentTarget.matches(":focus-visible")) setActive(i);
  }, []);

  return (
    <section
      className={styles.section}
      aria-labelledby="projects-title"
      onPointerMove={(e) => { pointerY.current = e.clientY; }}
      onPointerLeave={(e) => { if (e.pointerType === "mouse") setActive(-1); }}
      onKeyDown={(e) => { if (e.key === "Escape") setActive(-1); }}
    >
      <ProjectsSky projects={PROJECTS} active={active} small={small} />
      <div className={styles.scrim} />

      <h2 id="projects-title" className={styles.head}>
        <b>Projects</b>
        <span>{PROJECTS.length} of {TOTAL_PROJECTS}</span>
      </h2>

      <div className={styles.wrap}>
        <ol className={styles.rows} data-active={active >= 0 ? "" : undefined}>
          {PROJECTS.map((project, i) => {
            const rowProps = {
              className: `${styles.row} ${i === active ? styles.on : ""}`,
              style: { "--c": project.color } as CSSProperties,
              onPointerEnter: hoverOn(i),
              onFocus: focusOn(i),
              onBlur: () => setActive(-1),
              "aria-expanded": tapMode ? i === active : undefined,
            };
            const content = (
              <>
                <span className={styles.num}>{pad(i + 1)}</span>
                <span className={styles.name}>{project.name}</span>
                <span className={styles.group}><i className={styles.dot} />{project.group}</span>
              </>
            );
            return (
              <li key={project.id}>
                {project.href ? (
                  <a href={project.href} {...rowProps} aria-expanded={undefined}>{content}</a>
                ) : (
                  <button type="button" {...rowProps} onClick={() => setActive(tapMode && i === active ? -1 : i)}>{content}</button>
                )}
                <div className={styles.inline} aria-hidden={!(tapMode && i === active)}>
                  {tapMode && i === active && <ProjectDevice project={project} />}
                </div>
              </li>
            );
          })}
          <li className={styles.more}>And {TOTAL_PROJECTS - PROJECTS.length} more projects</li>
        </ol>
      </div>

      {!tapMode && active >= 0 && (
        <div ref={previewRef} className={styles.preview} aria-hidden="true">
          <ProjectDevice project={PROJECTS[active]} />
        </div>
      )}
    </section>
  );
}
