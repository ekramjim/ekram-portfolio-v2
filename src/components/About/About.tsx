"use client";
import Image from "next/image";
import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import UnderlineLink from "@/components/ui/UnderlineLink";
import workspace from "./workspace.jpeg";
import styles from "./About.module.css";

const STATEMENT =
  "I build software end to end, from iOS apps to 3D websites to data models, and a bit of research.";

const FIELDS: { name: string; text: ReactNode }[] = [
  {
    name: "Entrepreneurship",
    text: (
      <>
        Co-founder of{" "}
        <UnderlineLink href="https://lynksphere.com/">LynkSphere</UnderlineLink>
        , a Melbourne software studio building iOS, Android and web apps for Australian startups.
      </>
    ),
  },
  { name: "Research", text: "Researching human-centred computing." },
  { name: "Computer science and data science", text: "Infusing design with code, and arranging data into its finest form." },
  { name: "Bioinformatics", text: "RNA-seq from FastQC to DESeq2, applied to a colorectal cancer dataset." },
];

/** Four-pointed star used as the section's only marker. */
function Sparkle({ className, style }: { className: string; style?: CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 0C12.6 7 17 11.4 24 12C17 12.6 12.6 17 12 24C11.4 17 7 12.6 0 12C7 11.4 11.4 7 12 0Z" fill="currentColor" />
    </svg>
  );
}

/** Positions are shares of the 2022–2027 track; `now` is where today falls on it. */
const EDUCATION = [
  { at: 0, width: 56, years: "2022 – 2025", degree: "Bachelor of Computer Science (Data Science)", note: "Monash · High Achievers Scholarship" },
  { at: 60, width: 40, years: "2025 – 2027", degree: "Master of Data Science", note: "Monash", current: true },
];
const NOW = 93;

/**
 * A short About: one large statement that lights up word by word as it scrolls into view, short fields,
 * and a photo of the desk where the work happens.
 */
export default function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const statementRef = useRef<HTMLParagraphElement>(null);
  const words = STATEMENT.split(" ");

  // Words go from dim to full as the statement passes through the middle of the screen.
  useEffect(() => {
    const el = statementRef.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const spans = Array.from(el.children) as HTMLElement[];
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect(), vh = window.innerHeight;
      // 0 when the statement's top reaches 85% of the screen height, 1 when its bottom reaches 45%.
      const start = vh * 0.85, end = vh * 0.45 - r.height;
      const p = Math.max(0, Math.min(1, (start - r.top) / (start - end)));
      spans.forEach((span, i) => {
        const t = Math.max(0, Math.min(1, p * (spans.length + 3) - i));
        span.style.opacity = String(0.22 + 0.78 * t);
      });
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); };
  }, []);

  // Fields, photo and links rise into place the first time they are seen.
  useEffect(() => {
    const root = sectionRef.current;
    if (!root) return;
    const targets = Array.from(root.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      targets.forEach((t) => t.setAttribute("data-in", ""));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.setAttribute("data-in", ""); io.unobserve(e.target); } });
    }, { threshold: 0.2 });
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, []);

  return (
    <section ref={sectionRef} id="about" className={styles.section} aria-labelledby="about-title">
      <div className={styles.inner}>
        <div className={styles.text}>
          <h2 id="about-title" className={styles.label}>About</h2>

          <p ref={statementRef} className={styles.statement}>
            {words.map((w, i) => <span key={i}>{w} </span>)}
          </p>

          <dl className={styles.fields}>
            {FIELDS.map((f, i) => (
              <div key={f.name} className={styles.field} data-reveal style={{ "--i": i } as CSSProperties}>
                <dt><Sparkle className={styles.spark} />{f.name}</dt>
                <dd>{f.text}</dd>
              </div>
            ))}
          </dl>

          <div className={styles.timeline} data-reveal style={{ "--now": `${NOW}%` } as CSSProperties}>
            <div className={styles.track} aria-hidden="true">
              <i className={styles.fill} />
              {EDUCATION.map((e) => (
                <Sparkle key={e.degree} className={`${styles.star} ${e.current ? styles.current : ""}`} style={{ left: `${e.at}%` }} />
              ))}
              <i className={`${styles.star} ${styles.end}`} style={{ left: "100%" }} />
            </div>
            <ol className={styles.stops}>
              {EDUCATION.map((e) => (
                <li key={e.degree} style={{ left: `${e.at}%`, width: `${e.width}%` }}>
                  <span className={styles.years}>{e.years}</span>
                  <b>{e.degree}</b>
                  <small>{e.note}</small>
                </li>
              ))}
            </ol>
          </div>

          <div className={styles.links} data-reveal>
            <UnderlineLink href="#contact" className={styles.cta}>Get in touch →</UnderlineLink>
            <span className={styles.open}><i className={styles.pulse} />Open to hire</span>
          </div>
        </div>

        <figure className={styles.photo} data-reveal>
          <div className={styles.frame}>
            <Image src={workspace} alt="My desk: a monitor, mechanical keyboard, a glowing pink lamp and framed blue abstract art on the wall." sizes="(max-width: 899px) 86vw, 380px" placeholder="blur" />
          </div>
          <figcaption>
            <Sparkle className={styles.spark} />
            This is where you&rsquo;ll find me working.
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
