import ScrollCue from "./ScrollCue";
import SmokeCanvas from "./SmokeCanvas";
import SmokeTitle, { type HeroLink } from "./SmokeTitle";
import styles from "./SmokeHero.module.css";

/**
 * Hero over animated teal smoke (the "Allegro Midnight" wallpaper, upside down). Midnight water at the top holds the
 * headline; the smoke pales into mist and clears into the paper ground, so the next section starts on the usual page.
 * `data-hero-dark` tells the navbar to switch to light ink while it sits over the dark water.
 */
export default function SmokeHero({
  greeting,
  name,
  roles,
  links,
}: {
  greeting: string;
  name: string;
  roles: string[];
  /** Buttons under the roles, e.g. to the projects and design pages. */
  links?: HeroLink[];
}) {
  return (
    <section data-hero-dark className={styles.hero}>
      <SmokeCanvas />
      <div className={styles.stage}>
        <SmokeTitle greeting={greeting} name={name} roles={roles} links={links} />
        <ScrollCue />
      </div>
    </section>
  );
}
