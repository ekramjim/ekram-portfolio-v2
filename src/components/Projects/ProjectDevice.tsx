import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import type { Project } from "@/data/projects";
import styles from "./ProjectDevice.module.css";

const CHART_LINES: Record<1 | 2, [string, string]> = {
  1: ["0,90 30,70 60,78 90,44 120,52 150,26 200,12", "0,100 40,88 80,92 120,70 160,72 200,52"],
  2: ["0,80 25,50 50,62 80,30 110,58 140,22 200,40", "0,96 40,84 70,90 110,66 150,80 200,66"],
};

interface ProjectDeviceProps {
  project: Project;
  /** Expanded window: fills its parent, with the details beside the screenshot instead of under it. */
  open?: boolean;
  /** The project's details, shown inside the window. */
  children?: ReactNode;
}

/**
 * Desktop browser window for a project, holding a screenshot and the project's details. Small (the hover preview), it is
 * sized by the --w and --h custom properties and stacks the details under the screenshot. Open, it fills whatever box its
 * parent gives it and puts the details beside the screenshot.
 */
export default function ProjectDevice({ project, open, children }: ProjectDeviceProps) {
  const { color, color2, image, chart, glyph, name, href } = project;
  const frameStyle = { "--c": color, "--c2": color2 } as CSSProperties;
  const host = href ? new URL(href).hostname.replace(/^www\./, "") : null;
  return (
    <div className={styles.dev} data-open={open ? "" : undefined} style={frameStyle}>
      <div className={styles.bar} aria-hidden="true">
        <i /><i /><i />
        {host && <span className={styles.url}>{host}</span>}
      </div>
      <div className={styles.screen}>
        <div className={styles.pane}>
          {image ? (
            <Image src={image} alt={`${name} screenshot`} fill sizes="(max-width: 899px) 90vw, 760px" className={styles.shot} />
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
            </div>
          )}
        </div>
        {children && <div className={styles.body}>{children}</div>}
      </div>
    </div>
  );
}
