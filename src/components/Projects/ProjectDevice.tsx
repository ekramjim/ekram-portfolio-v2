import type { CSSProperties, ReactNode } from "react";
import type { Project } from "@/data/projects";
import styles from "./ProjectDevice.module.css";

interface ProjectDeviceProps {
  project: Project;
  /** Expanded window: fills its parent, with the details beside the gradient instead of under it. */
  open?: boolean;
  /** The project's details, shown inside the window. */
  children?: ReactNode;
}

/** What a project's link is, for a window's address bar: the site's host, or the kind of download. */
export function hostLabel(href?: string) {
  if (!href) return null;
  if (href.toLowerCase().endsWith(".pdf")) return "PDF report";
  if (href.toLowerCase().endsWith(".dmg")) return "macOS app";
  return new URL(href, "https://ekram.tech").hostname.replace(/^www\./, "");
}

/**
 * Desktop browser window for a project, holding a moving gradient in the project's colours and the project's details. Small (the hover preview), it is
 * sized by the --w and --h custom properties and stacks the details under the gradient. Open, it fills whatever box its
 * parent gives it and puts the details beside the gradient.
 */
export default function ProjectDevice({ project, open, children }: ProjectDeviceProps) {
  const { color, color2, href, screenshots, preview } = project;
  // Without app screenshots, the capture of the live site stands in.
  const images = screenshots ?? (preview ? [preview] : []);
  const shots = open ? images : images.slice(0, 1);
  const frameStyle = { "--c": color, "--c2": color2 } as CSSProperties;
  const host = hostLabel(href);
  return (
    <div className={styles.dev} data-open={open ? "" : undefined} style={frameStyle}>
      <div className={styles.bar} aria-hidden="true">
        <i /><i /><i />
        {host && <span className={styles.url}>{host}</span>}
      </div>
      <div className={styles.screen}>
        <div className={styles.pane}>
          <div className={styles.art} aria-hidden="true" />
          {shots.length > 0 && (
            <div className={styles.shots} aria-hidden="true">
              {shots.map((src, i) => (
                // eslint-disable-next-line @next/next/no-img-element -- static WebP with transparent corners; no resizing needed
                <img key={src} src={src} alt="" loading="lazy" decoding="async" style={{ "--i": i } as CSSProperties} />
              ))}
            </div>
          )}
        </div>
        {children && <div className={styles.body}>{children}</div>}
      </div>
    </div>
  );
}
