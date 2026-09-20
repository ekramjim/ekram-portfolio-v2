import Image from "next/image";
import type { CSSProperties } from "react";
import type { Project } from "@/data/projects";
import styles from "./ProjectDevice.module.css";

const CHART_LINES: Record<1 | 2, [string, string]> = {
  1: ["0,90 30,70 60,78 90,44 120,52 150,26 200,12", "0,100 40,88 80,92 120,70 160,72 200,52"],
  2: ["0,80 25,50 50,62 80,30 110,58 140,22 200,40", "0,96 40,84 70,90 110,66 150,80 200,66"],
};

/** Phone or browser frame for a project. Size it from outside with the --h (phone) or --w (browser) custom property. */
export default function ProjectDevice({ project }: { project: Project }) {
  const { kind, color, color2, image, chart, glyph, name } = project;
  const frameStyle = { "--c": color, "--c2": color2 } as CSSProperties;
  return (
    <div className={`${styles.dev} ${styles[kind]}`} style={frameStyle}>
      {kind === "browser" ? (
        <div className={styles.bar} aria-hidden="true"><i /><i /><i /></div>
      ) : (
        <i className={styles.notch} aria-hidden="true" />
      )}
      <div className={styles.screen}>
        {image ? (
          <Image src={image} alt={`${name} screenshot`} fill sizes="(max-width: 899px) 90vw, 420px" className={styles.shot} />
        ) : (
          <div className={styles.art} aria-hidden="true">
            {chart && (
              <svg viewBox="0 0 200 110" preserveAspectRatio="none">
                <g fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points={CHART_LINES[chart][0]} stroke="rgba(255,255,255,.9)" strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
                  <polyline points={CHART_LINES[chart][1]} stroke="rgba(255,255,255,.4)" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
                </g>
              </svg>
            )}
            <span className={styles.glyph}>{glyph}</span>
            <small>Screenshot</small>
          </div>
        )}
      </div>
    </div>
  );
}
