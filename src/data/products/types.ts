/**
 * In-depth pages for the projects: what each does, chapter by chapter, and how it's built, in the manner of Apple's
 * product pages. Each lives at /apps/[id], has its own file in this folder, and shares its id, colours and stack with
 * its entry in projects.ts.
 */

/**
 * How a picture is framed. "render": an already-framed device render with a transparent surround, shown as it is.
 * "phone": a raw iPhone screen, given a bezel. "window": a raw Mac window capture, given rounded corners and a shadow.
 * "browser": a website capture, shown in a browser window with `host` in its address bar (a full-length capture shows
 * its top). "image": anything else (a chart, a report page, App Store art), with rounded corners and a shadow.
 */
export type ShotFrame = "render" | "phone" | "window" | "browser" | "image";

export interface Shot {
  src: string;
  alt: string;
  frame: ShotFrame;
  /** The address bar's text for a "browser" shot, e.g. "lynksphere.com". */
  host?: string;
}

export interface Chapter {
  /** Anchor, so other pages can link straight to a chapter (Shepherd Companion's card opens #iphone). */
  id?: string;
  eyebrow: string;
  title: string;
  body: string;
  points?: string[];
  /** One picture, or up to three phone screens shown side by side. Leave out for a text-only section. */
  shots?: Shot[];
  /** The line under the picture. */
  caption?: string;
  /** Shown as a dark, full-width section for contrast, as Apple's pages break up their light ones. */
  dark?: boolean;
}

export interface Product {
  id: string;
  name: string;
  /** The app icon. Websites and analyses without one show their name alone. */
  icon?: string;
  tagline: string;
  intro: string;
  /** Main links, first one prominent. */
  actions: { label: string; href: string }[];
  /** Shown instead of (or beside) an action while the app isn't out yet. */
  status?: string;
  /**
   * The hero picture. Two shots, a Mac or browser picture then a phone, show as devices: the phone in front of the
   * other at its lower right. Otherwise the shots sit in a row (one large picture, or up to three phones).
   */
  hero: Shot[];
  heroCaption: string;
  chapters: Chapter[];
  /** Big numbers for the tile grid: a value and what it counts. Three read best. */
  stats?: { value: string; label: string }[];
  /** Smaller features, in a grid after the chapters. */
  extras: { title: string; body: string }[];
  /** How it's made: a paragraph, then notes on the interesting parts. */
  build: { intro: string; notes: { title: string; body: string }[] };
  /** Support, privacy, the design case study and the like. */
  links?: { label: string; href: string }[];
}
