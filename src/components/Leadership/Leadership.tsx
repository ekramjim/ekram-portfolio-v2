"use client";
import { ChalkboardTeacher, GlobeHemisphereEast, HandsClapping, MapTrifold, MicrophoneStage, PresentationChart, RocketLaunch, type Icon } from "@phosphor-icons/react";
import { useRef, type CSSProperties } from "react";
import StarBackdrop from "@/components/ui/StarBackdrop";
import { useReveal } from "@/components/ui/useReveal";
import { LEADERSHIP, type LeadershipIcon } from "@/data/leadership";
import styles from "./Leadership.module.css";

const ICONS: Record<LeadershipIcon, Icon> = {
  "rocket-launch": RocketLaunch,
  "presentation-chart": PresentationChart,
  "microphone-stage": MicrophoneStage,
  "globe-hemisphere-east": GlobeHemisphereEast,
  "map-trifold": MapTrifold,
  "chalkboard-teacher": ChalkboardTeacher,
  "hands-clapping": HandsClapping,
};

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Leadership as a row of cards on a line: an icon on the line, and under it a card with the role's number and type,
 * its title and place, and what it was. On narrow screens the line turns vertical and the cards stack beside it.
 */
export default function Leadership() {
  const sectionRef = useRef<HTMLElement>(null);
  useReveal(sectionRef);

  return (
    <section ref={sectionRef} id="leadership" className={styles.section} aria-labelledby="leadership-title">
      <StarBackdrop />
      <div className={styles.inner}>
        <h2 id="leadership-title" className={styles.head}>
          <b>Leadership</b>
          <span>Community &amp; Impact</span>
        </h2>

        <ol className={styles.track}>
          {LEADERSHIP.map((item, i) => {
            const Glyph = ICONS[item.icon];
            return (
              <li key={item.title} className={styles.item} data-reveal style={{ "--i": i } as CSSProperties}>
                <span className={styles.badge}><Glyph size={22} aria-hidden="true" /></span>
                <article className={styles.card}>
                  <div className={styles.meta}>
                    <span>{pad(i + 1)}</span>
                    <span>{item.type}</span>
                  </div>
                  <h3>{item.title}</h3>
                  <p className={styles.place}>{item.location}</p>
                  <p className={styles.text}>{item.description}</p>
                </article>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
