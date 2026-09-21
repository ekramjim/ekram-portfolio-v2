import styles from "./StarBackdrop.module.css";

/** Static starfield for a section's background. Put it first inside a `position: relative` section; content goes above it. */
export default function StarBackdrop() {
  return <div className={styles.stars} aria-hidden="true" />;
}
