"use client";
import { useEffect, useRef, useState } from "react";
import StarBackdrop from "@/components/ui/StarBackdrop";
import UnderlineLink from "@/components/ui/UnderlineLink";
import { useReveal } from "@/components/ui/useReveal";
import { MISSIONS, type Mission } from "@/data/experience";
import styles from "./Experience.module.css";

const pad = (n: number) => String(n).padStart(2, "0");
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** The current time, read in the browser only, and refreshed every minute so a page left open rolls over on its own. */
function useNow() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(id);
  }, []);
  return now;
}

/** Whole months from `start` to `now`, shown as "4 months" or "1 yr 9 mo". */
function elapsed({ year, month }: Mission["start"], now: Date) {
  const total = Math.max(1, (now.getFullYear() - year) * 12 + (now.getMonth() + 1 - month));
  if (total < 12) return `${total} ${total === 1 ? "month" : "months"}`;
  const years = Math.floor(total / 12), months = total % 12;
  return months ? `${years} yr ${months} mo` : `${years} yr`;
}

/** Splits "a **b** c" into plain and bright runs. */
function Bright({ text }: { text: string }) {
  return <>{text.split("**").map((part, i) => (i % 2 ? <strong key={i}>{part}</strong> : part))}</>;
}

/**
 * Work experience as a mission log: each role is a mission with a launch date, a status and the time it has been
 * running, and its bullets are the objectives. Everything is on the page; nothing opens or closes.
 */
export default function Experience() {
  const sectionRef = useRef<HTMLElement>(null);
  useReveal(sectionRef);
  // Worked out in the browser, never at build time, so the numbers are always today's and need no editing.
  const now = useNow();

  return (
    <section ref={sectionRef} id="experience" className={styles.section} aria-labelledby="experience-title">
      <StarBackdrop />
      <div className={styles.inner}>
        <h2 id="experience-title" className={styles.head}>
          <b>Work Experience</b>
          <span>Where I&rsquo;ve worked</span>
        </h2>

        {MISSIONS.map((m, i) => (
          <article key={m.company} className={styles.mission} data-reveal>
            <div className={styles.about}>
              <p className={styles.tag}>Mission {pad(MISSIONS.length - i)}</p>
              <h3 className={styles.company}>{m.company}</h3>
              <p className={styles.role}>{m.role}</p>
              {m.note && <p className={styles.note}>{m.note}</p>}
              {m.link && <UnderlineLink href={m.link.href} className={styles.link}>{m.link.label} ↗</UnderlineLink>}

              <dl className={styles.stats}>
                <div><dt>Status</dt><dd><i className={styles.pulse} />In orbit</dd></div>
                <div><dt>Launched</dt><dd>{MONTHS[m.start.month - 1]} {m.start.year}</dd></div>
                <div><dt>Elapsed</dt><dd>{now ? elapsed(m.start, now) : "\u00a0"}</dd></div>
              </dl>
            </div>

            <div className={styles.objectives}>
              <h4>Objectives</h4>
              <ol>
                {m.objectives.map((o, j) => (
                  <li key={j}><span>{pad(j + 1)}</span><p><Bright text={o} /></p></li>
                ))}
              </ol>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
