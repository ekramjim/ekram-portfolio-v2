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
  /** Where the project's star sits in the sky, in sky units. (0, 0) is the middle of the overview; x grows right, y grows down. */
  x: number;
  y: number;
  /** Adds a sample chart line to the placeholder screen. */
  chart?: 1 | 2;
  /** Real screenshot, e.g. "/projects/linkedhive.png" (put the file in /public). Shown instead of the placeholder. */
  image?: string;
  /** Shown in the home page highlights. Every project appears on /projects. */
  highlight?: boolean;
  /** Case-study page or live link. The expanded row shows "View case study" once this is set. */
  href?: string;
}

export const PROJECTS: Project[] = [
  {
    id: "linkedhive", name: "LinkedHive", group: "Mobile", kind: "phone",
    summary: "A mobile app in the LinkedHive line of work.",
    stack: ["React Native", "TypeScript", "PostgreSQL"],
    highlight: true, color: "#5aa9ff", color2: "#2a3f8f", glyph: "L", x: -110, y: -80,
  },
  {
    id: "timebreak", name: "TimeBreak", group: "Mobile", kind: "phone",
    summary: "A mobile app for time and breaks.",
    stack: ["SwiftUI", "Swift"],
    highlight: true, color: "#4fd0c4", color2: "#1d5a7a", glyph: "T", x: 40, y: -115,
  },
  {
    id: "lynksphere", name: "LynkSphere Website", group: "Web", kind: "browser",
    summary: "The website for LynkSphere, the company I co-founded.",
    stack: ["Next.js", "TypeScript", "AWS"],
    highlight: true, color: "#ffb55e", color2: "#a2412b", glyph: "Ly", x: 150, y: -20,
  },
  {
    id: "afl", name: "AFL Ranking System", group: "Data science", kind: "browser", chart: 1,
    summary: "A data-driven ranking system for AFL teams.",
    stack: ["Python", "Scikit-learn", "PostgreSQL"],
    highlight: true, color: "#7be495", color2: "#1c6a52", glyph: "AFL", x: -60, y: 55,
  },
  {
    id: "f1", name: "F1 Dashboards", group: "Data science", kind: "browser", chart: 2,
    summary: "Interactive dashboards exploring Formula 1 data.",
    stack: ["Python", "TypeScript"],
    highlight: true, color: "#ff6b5e", color2: "#7a1f3d", glyph: "F1", x: 95, y: 105,
  },
];

export const HIGHLIGHTS = PROJECTS.filter((project) => project.highlight);
