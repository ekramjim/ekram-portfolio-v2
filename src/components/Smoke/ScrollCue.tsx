"use client";
import { useEffect, useState } from "react";
import styles from "./SmokeHero.module.css";

/**
 * A thin line with a light running down it, then "Scroll", at the foot of the hero's first screen, so the smoke below
 * the headline doesn't read as the end of the page. It fades once the page has moved; a click or tap goes to About.
 */
export default function ScrollCue() {
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const update = () => setGone(window.scrollY > 40);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <a href="#about" className={styles.cue} data-gone={gone || undefined} aria-label="Scroll to About">
      <span className={styles.cueLine} aria-hidden="true" />
      <span className={styles.cueText}>Scroll</span>
    </a>
  );
}
