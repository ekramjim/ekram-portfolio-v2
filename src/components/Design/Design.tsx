"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import GlassButton from "@/components/ui/GlassButton";
import { useReveal } from "@/components/ui/useReveal";
import { PAPER, type DesignPiece, type DesignTheme, type WipeVariant } from "@/data/design";
import { Palette, ShowcaseView } from "./Showcases";
import Hero from "./Hero";
import styles from "./Design.module.css";

const pad = (n: number) => String(n).padStart(2, "0");

/** The theme's colours as the page's custom properties (registered in globals.css, so they ease from one to the next). */
const themeVars = (t: DesignTheme) =>
  ({ "--d-bg": t.bg, "--d-ink": t.ink, "--d-ink2": t.ink2, "--d-accent": t.accent }) as React.CSSProperties;

/**
 * Design work as a run of spreads. Whichever piece is in the middle of the window paints the whole page in its own
 * colours; each shows its process (screens to drag, crops to switch, concepts to scrub, a wipe), and every picture is
 * a Figma-style frame.
 */
export default function Design({ pieces }: { pieces: DesignPiece[] }) {
  const rootRef = useRef<HTMLDivElement>(null);
  useReveal(rootRef);
  const [active, setActive] = useState<string | null>(null);
  // Allegro's palette picker repaints the page while Allegro is the active piece.
  const [wipeTheme, setWipeTheme] = useState<WipeVariant | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    // A piece is active while it crosses the window's middle line.
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive((e.target as HTMLElement).dataset.piece ?? null);
      },
      { rootMargin: "-50% 0px -50% 0px" },
    );
    root.querySelectorAll("[data-piece]").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const piece = pieces.find((p) => p.id === active);
  let theme = piece?.theme ?? PAPER;
  if (piece?.showcase.kind === "wipe" && wipeTheme) theme = { ...theme, bg: wipeTheme.bg, accent: wipeTheme.accent };

  // The navbar sits over this page's ground, so it follows the theme's darkness.
  useEffect(() => {
    document.documentElement.dataset.navTone = theme.dark ? "dark" : "";
    window.dispatchEvent(new Event("navtone"));
  }, [theme.dark]);
  useEffect(() => () => {
    delete document.documentElement.dataset.navTone;
    window.dispatchEvent(new Event("navtone"));
  }, []);

  const onVariant = useCallback((v: WipeVariant) => setWipeTheme(v), []);

  return (
    <div ref={rootRef} className={styles.canvas} style={themeVars(theme)} data-dark={theme.dark || undefined}>
      <Hero pieces={pieces} />

      {pieces.map((p, i) => (
        <article key={p.id} id={p.id} data-piece={p.id} className={styles.piece} aria-labelledby={`${p.id}-name`}>
          <header className={styles.spreadHead} data-reveal>
            <p className={styles.kicker}>
              <span>{pad(i + 1)} / {pad(pieces.length)}</span>
              <span>{p.kicker}</span>
            </p>
            <h2 id={`${p.id}-name`} className={styles.name}>
              {p.name}
              <span className={styles.subtitle}>{p.subtitle}</span>
            </h2>
          </header>

          <div className={styles.stage}>
            <ShowcaseView showcase={p.showcase} onVariant={onVariant} />
          </div>

          <div className={styles.notes} data-reveal>
            <p className={styles.summary}>{p.summary}</p>
            <aside className={styles.meta}>
              <dl className={styles.facts}>
                <dt>Tools</dt>
                <dd>{p.tools.join(", ")}</dd>
              </dl>
              {p.palette && <Palette swatches={p.palette} />}
              <GlassButton href={p.figma} className={styles.figmaLink}>View in Figma ↗</GlassButton>
            </aside>
          </div>
        </article>
      ))}

      <footer className={styles.outro} data-piece="outro">
        <p className={styles.outroLine}>The code side is in Projects.</p>
        <GlassButton href="/projects">See the projects →</GlassButton>
      </footer>
    </div>
  );
}
