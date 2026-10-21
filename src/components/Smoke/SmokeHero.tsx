import SmokeCanvas from "./SmokeCanvas";
import SmokeTitle from "./SmokeTitle";
import styles from "./SmokeHero.module.css";

/**
 * Hero over animated teal smoke (the "Allegro Midnight" wallpaper, upside down). Midnight water at the top holds the
 * headline; the smoke pales into mist and clears into the paper ground, so the next section starts on the usual page.
 * `data-hero-dark` tells the navbar to switch to light ink while it sits over the dark water.
 */
export default function SmokeHero({ greeting, name, roles }: { greeting: string; name: string; roles: string[] }) {
  return (
    <section data-hero-dark className={styles.hero}>
      <SmokeCanvas />
      <div className={styles.stage}>
        <SmokeTitle greeting={greeting} name={name} roles={roles} />
      </div>
    </section>
  );
}
