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

/**
 * Desktop browser window for a project, holding a moving gradient in the project's colours and the project's details. Small (the hover preview), it is
 * sized by the --w and --h custom properties and stacks the details under the gradient. Open, it fills whatever box its
 * parent gives it and puts the details beside the gradient.
 */
export default function ProjectDevice({ project, open, children }: ProjectDeviceProps) {
  const { color, color2, href } = project;
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
          <div className={styles.art} aria-hidden="true" />
        </div>
        {children && <div className={styles.body}>{children}</div>}
      </div>
    </div>
  );
}
