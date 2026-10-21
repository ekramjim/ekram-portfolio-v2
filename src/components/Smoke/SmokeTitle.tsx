"use client";
import { Fragment, useEffect, useRef, type CSSProperties } from "react";
import styles from "./SmokeHero.module.css";

// The headline is gone into the fog after this share of a screen has been scrolled.
const SINK_SCREENS = 0.55;

/**
 * The hero headline: its words condense out of the mist on load, and as the page scrolls it lags behind, blurs and
 * fades, sinking into the fog before the paper begins.
 */
export default function SmokeTitle({ greeting, name, roles }: { greeting: string; name: string; roles: string[] }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const sink = Math.min(1, Math.max(0, window.scrollY / (window.innerHeight * SINK_SCREENS)));
      element.style.transform = `translate3d(0, ${sink * 14}vh, 0)`;
      element.style.opacity = String(1 - sink);
      element.style.filter = sink > 0 ? `blur(${sink * 14}px)` : "";
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const words = [...greeting.split(" "), name];

  return (
    <div ref={ref} className={styles.title}>
      <h1>
        {words.map((word, i) => (
          <Fragment key={i}>
            {i > 0 && " "}
            <span className={styles.word} style={{ "--i": i } as CSSProperties}>{word}</span>
          </Fragment>
        ))}
        <span className={styles.star} style={{ "--i": words.length } as CSSProperties} aria-hidden="true">
          <svg viewBox="0 0 16 16">
            <path d="M8 0c.35 4.45 3.55 7.65 8 8-4.45.35-7.65 3.55-8 8-.35-4.45-3.55-7.65-8-8C4.45 7.65 7.65 4.45 8 0Z" fill="currentColor" />
          </svg>
        </span>
        <span className="sr-only">.</span>
      </h1>
      <p className={styles.roles} style={{ "--i": words.length + 1.5 } as CSSProperties}>
        {roles.map((role, i) => (
          <Fragment key={role}>
            {i > 0 && <span className={styles.dot} aria-hidden="true">·</span>}
            <span className={styles.role}>{role}</span>
          </Fragment>
        ))}
      </p>
    </div>
  );
}
