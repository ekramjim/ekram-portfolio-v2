"use client";
import { useRef, type CSSProperties } from "react";
import StarBackdrop from "@/components/ui/StarBackdrop";
import { useReveal } from "@/components/ui/useReveal";
import { SKILL_GROUPS } from "@/data/skills";
import styles from "./Skills.module.css";

/**
 * Skills as a spec sheet: one row per group from the CV, numbered, with the most-used skills in each brighter than
 * the rest.
 */
export default function Skills() {
  const sectionRef = useRef<HTMLElement>(null);
  useReveal(sectionRef);

  return (
    <section ref={sectionRef} id="skills" className={styles.section} aria-labelledby="skills-title">
      <StarBackdrop />
      <div className={styles.inner}>
        <h2 id="skills-title" className={styles.head}>
          <b>Core Skills</b>
          <span>What I work with</span>
        </h2>

        <ol className={styles.rows}>
          {SKILL_GROUPS.map((group, i) => (
            <li key={group.label} className={styles.row} data-reveal style={{ "--i": i * 0.5 } as CSSProperties}>
              <span className={styles.no}>{String(i + 1).padStart(2, "0")}</span>
              <h3 className={styles.label}>{group.label}</h3>
              <ul className={styles.skills}>
                {group.skills.map((s, j) => (
                  <li key={s} className={j < group.core ? styles.core : undefined}>{s}</li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
