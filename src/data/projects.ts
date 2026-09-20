export type ProjectGroup = "Mobile" | "Web" | "Data science";

export interface Project {
  id: string;
  name: string;
  group: ProjectGroup;
  /** Shape of the preview frame. */
  kind: "phone" | "browser";
  summary: string;
  stack: string[];
  /** Star colour and the secondary tint used by the placeholder screen. */
  color: string;
  color2: string;
  /** Big letter(s) on the placeholder screen. */
  glyph: string;
  /** Where the project's star sits in the galaxy: spiral arm (0-2) and distance along it (0 core, 1 rim). */
  arm: number;
  t: number;
  /** Adds a sample chart line to the placeholder screen. */
  chart?: 1 | 2;
  /** Real screenshot, e.g. "/projects/linkedhive.png" (put the file in /public). Shown instead of the placeholder. */
  image?: string;
  /** Case-study or live link. Rows render as links once this is set. */
  href?: string;
}

/** Total number of projects, including the ones not listed here yet. */
export const TOTAL_PROJECTS = 9;

export const PROJECTS: Project[] = [
  {
    id: "linkedhive", name: "LinkedHive", group: "Mobile", kind: "phone",
    summary: "A mobile app in the LinkedHive line of work.",
    stack: ["React Native", "TypeScript", "PostgreSQL"],
    color: "#5aa9ff", color2: "#2a3f8f", glyph: "L", arm: 0, t: 0.64,
  },
  {
    id: "timebreak", name: "TimeBreak", group: "Mobile", kind: "phone",
    summary: "A mobile app for time and breaks.",
    stack: ["SwiftUI", "Swift"],
    color: "#4fd0c4", color2: "#1d5a7a", glyph: "T", arm: 1, t: 0.44,
  },
  {
    id: "lynksphere", name: "LynkSphere Website", group: "Web", kind: "browser",
    summary: "The website for LynkSphere, the company I co-founded.",
    stack: ["Next.js", "TypeScript", "AWS"],
    color: "#ffb55e", color2: "#a2412b", glyph: "Ly", arm: 2, t: 0.8,
  },
  {
    id: "afl", name: "AFL Ranking System", group: "Data science", kind: "browser", chart: 1,
    summary: "A data-driven ranking system for AFL teams.",
    stack: ["Python", "Scikit-learn", "PostgreSQL"],
    color: "#7be495", color2: "#1c6a52", glyph: "AFL", arm: 0, t: 0.3,
  },
  {
    id: "f1", name: "F1 Dashboards", group: "Data science", kind: "browser", chart: 2,
    summary: "Interactive dashboards exploring Formula 1 data.",
    stack: ["Python", "TypeScript"],
    color: "#ff6b5e", color2: "#7a1f3d", glyph: "F1", arm: 1, t: 0.9,
  },
];
