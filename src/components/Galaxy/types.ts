export type GalaxyPhase = "stars" | "title" | "settled";

export interface GalaxyProps {
  /** Left and right words of the headline, drawn in stars either side of the galaxy, e.g. ["Hi, I'm", "Ekram."]. */
  title: [string, string];
  /** Height of the scroll zone in viewport heights. Scroll progress is 0 at the top and 1 after this many screens. */
  scrollScreens?: number;
  /** How fast stars stream inward along the spiral arms, in arm-lengths per second (0 disables). Default 0.02 ≈ 50s from rim to core. */
  flowSpeed?: number;
}
