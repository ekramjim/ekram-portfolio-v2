"use client";
import { useRef, type CSSProperties } from "react";
import StarBackdrop from "@/components/ui/StarBackdrop";
import { useReveal } from "@/components/ui/useReveal";
import { SKILL_GROUPS } from "@/data/skills";
import Constellation from "./Constellation";
import styles from "./Skills.module.css";

/**
 * Skills as star maps, one constellation per group. The stars are flat dots in the star field's colours, and a
 * star's size and brightness show how strong the skill is. The pointer joins each map as a small star of its own.
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
          <span>Technical expertise</span>
        </h2>

        <div className={styles.grid}>
          {SKILL_GROUPS.map((group, i) => <Constellation key={group.label} group={group} seed={11 + i * 97} index={i} />)}
          <p className={styles.key} data-reveal style={{ "--i": SKILL_GROUPS.length } as CSSProperties}>
            Move your pointer over a map.
          </p>
        </div>
      </div>
    </section>
  );
}
