import Link from "next/link";
import type { DesignPiece } from "@/data/design";
import styles from "./DesignStrip.module.css";

/* eslint-disable @next/next/no-img-element -- static WebPs already sized for the page */

/**
 * The design work as a row of tiles, for the home page's Projects: each piece on its own colours, linking to it on
 * the Design page.
 */
export default function DesignStrip({ pieces }: { pieces: DesignPiece[] }) {
  return (
    <section className={styles.strip} aria-labelledby="design-strip-title">
      <h3 id="design-strip-title" className={styles.head}>
        <b>Design</b>
        <span>Figma · Icon Composer</span>
      </h3>
      <ul className={styles.row}>
        {pieces.map((p) => (
          <li key={p.id}>
            <Link href={`/design#${p.id}`} className={styles.tile}>
              <span className={styles.art} data-fit={p.thumb.fit} style={{ background: p.theme.bg }}>
                <img src={p.thumb.src} alt="" loading="lazy" decoding="async" />
              </span>
              <span className={styles.name}>{p.name}</span>
              <span className={styles.sub}>{p.subtitle}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
