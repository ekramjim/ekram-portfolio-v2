export type ProjectGroup = "Mobile" | "macOS" | "Web" | "Data science" | "Bioinformatics" | "Software";

export interface Project {
  id: string;
  name: string;
  group: ProjectGroup;
  year: string;
  summary: string;
  stack: string[];
  /** Star colour, and with `color2` the two colours of the project window's moving gradient. */
  color: string;
  color2: string;
  /** Where the project's star sits in the sky, in sky units. (0, 0) is the middle of the overview; x grows right, y grows down. */
  x: number;
  y: number;
  /** Live site, store page or repository. */
  href?: string;
  /** Source repository, when it is separate from `href`. */
  github?: string;
  /** App screenshots shown over the gradient: on the card (in turn, or side by side for phones) and in turn when open. */
  screenshots?: string[];
  /** The screenshots are portrait phone screens, so the card shows three side by side. */
  phone?: boolean;
  /** One-screen capture of the live site or report, used when there are no app screenshots. */
  preview?: string;
  /** Full-length capture of the site; previewing the card scrolls through it. */
  page?: string;
  /** Shown instead of a link while the project isn't out yet, e.g. "Coming soon". */
  status?: string;
}

/** Every project, in display order. */
export const PROJECTS: Project[] = [
  {
    id: "shepherd", name: "Shepherd", group: "macOS", year: "2026",
    summary: "Native macOS terminal for coding with Claude Code and Codex. Shepherd Mini drops your terminals over any app with ⌥⇧Space, even a full-screen IDE, and Shepherd tells you the moment an agent needs you. With projects in groups, split panes, a code editor, Git with a commit graph, a built-in dev browser and signed auto-updates.",
    stack: ["Swift", "SwiftUI", "AppKit", "SwiftTerm", "CloudKit", "Network.framework", "Sparkle"],
    href: "https://sphrd.dev/download",
    screenshots: ["1-mini", "2-open", "3-split", "4-browser", "5-git"].map((name) => `/projects/shepherd/${name}.webp`),
    color: "#75c682", color2: "#1d4a2c", x: 100, y: -65,
  },
  {
    id: "shepherd-companion", name: "Shepherd Companion", group: "Mobile", year: "2026",
    summary: "Free iPhone companion for Shepherd. Approve or deny an agent from the Lock Screen, read and reply to the whole conversation, type into your Mac's terminals, commit and push with Git, and send photos and files into a project. Your Mac and iPhone talk directly over your own Wi-Fi or through your private iCloud, with no server in the middle.",
    stack: ["Swift", "SwiftUI", "CloudKit", "Network.framework", "ActivityKit", "WidgetKit", "AppIntents"],
    href: "https://apps.apple.com/app/id6823984397",
    screenshots: ["1-lock", "2-list", "3-chat", "4-chat-terminal", "5-git"].map((name) => `/projects/shepherd-companion/${name}.webp`),
    phone: true,
    color: "#a6dcae", color2: "#2b5a3a", x: -170, y: -10,
  },
  {
    id: "usage-finder", name: "Usage Finder", group: "macOS", year: "2026",
    summary: "Native macOS system monitor with live per-core CPU, memory and swap meters in the menu bar, history charts for CPU, memory pressure and power, signed auto-updates, and a sandboxed Mac App Store edition.",
    stack: ["Swift", "SwiftUI", "Swift Charts", "AppKit", "IOKit", "Sparkle"],
    href: "https://github.com/ekramjim/UsageFinder-Releases/releases/latest/download/UsageFinder.dmg",
    github: "https://github.com/ekramjim/UsageFinder-Releases",
    screenshots: ["overview", "cpu", "memory", "power"].map((name) => `/projects/usage-finder/${name}.webp`),
    color: "#4f9dff", color2: "#3b2d8f", x: 55, y: 25,
  },
  {
    id: "colorectal-proteomics", name: "Colorectal Cancer Proteomics", group: "Bioinformatics", year: "2026",
    summary: "Bioinformatics analysis of CPTAC proteomic data comparing colorectal tumours with healthy colon tissue across 54 samples, including preprocessing, imputation, normalisation and differential abundance testing.",
    stack: ["Python", "Pandas", "NumPy", "SciPy", "Seaborn", "Matplotlib", "Proteomics"],
    href: "/projects/proteomic-analysis-colorectal-cancer-cptac.pdf",
    preview: "/projects/colorectal-proteomics/volcano.webp",
    color: "#72d6c9", color2: "#245b70", x: 125, y: 35,
  },
  {
    id: "linkedhive", name: "LinkedHive", group: "Mobile", year: "2025–2026",
    summary: "Cross-platform (iOS, Android, Web) community and business networking app for Australian suburbs, with real-time chat, events, jobs, local deals and AI translation.",
    stack: ["React Native", "Expo", "Next.js 16", "TypeScript", "Supabase", "Drizzle ORM", "Stripe"],
    href: "https://www.linkedhive.com.au/",
    preview: "/projects/linkedhive/home.webp",
    color: "#5aa9ff", color2: "#2a3f8f", x: -110, y: -80,
  },
  {
    id: "lynksphere", name: "LynkSphere Website", group: "Web", year: "2026",
    summary: "Production marketing site for LynkSphere with rich 3D animation. It is the main customer acquisition channel, contributing $30K AUD revenue in 8 months.",
    stack: ["Next.js", "TypeScript", "Tailwind CSS", "Framer Motion", "GSAP", "Three.js"],
    href: "https://lynksphere.com/",
    preview: "/projects/lynksphere/home.webp", page: "/projects/lynksphere/page.webp",
    color: "#ffb55e", color2: "#a2412b", x: -20, y: -30,
  },
  {
    id: "timebreak", name: "TimeBreak", group: "Mobile", year: "2026",
    summary: "Native Pomodoro timer for iPhone, iPad, Mac and the menu bar, with an analog clock, Live Activities, a WidgetKit widget and Reminders integration.",
    stack: ["Swift", "SwiftUI", "WidgetKit", "ActivityKit", "AppIntents", "EventKit"],
    href: "https://apps.apple.com/au/app/timebreak-pomodoro/id6763444390",
    github: "https://github.com/ekramjim/timeBreak",
    screenshots: ["1-focus", "2-history", "3-reminders", "4-settings"].map((name) => `/projects/timebreak/${name}.webp`),
    phone: true,
    color: "#4fd0c4", color2: "#1d5a7a", x: 40, y: -115,
  },
  {
    id: "mindsigns", name: "MindSigns Website", group: "Web", year: "2026",
    summary: "Official website for MindSigns, a Monash University Faculty of IT initiative, with a particle-built 3D hand that morphs between sign-language poses.",
    stack: ["Next.js", "React", "TypeScript", "Three.js", "React Three Fiber", "Framer Motion", "Tailwind CSS"],
    href: "https://mindsigns.online",
    preview: "/projects/mindsigns/home.webp", page: "/projects/mindsigns/page.webp",
    color: "#c49bff", color2: "#4a2a8f", x: 150, y: -20,
  },
  {
    id: "portfolio", name: "Personal Portfolio Website", group: "Web", year: "2026",
    summary: "This portfolio, built around a Three.js galaxy with scroll-driven camera motion and a contact form.",
    stack: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Three.js", "WebGL", "Nodemailer"],
    href: "https://ekram.tech",
    preview: "/projects/portfolio/home.webp",
    github: "https://github.com/ekramjim/ekram-portfolio",
    color: "#dbe8ff", color2: "#33507a", x: 95, y: 105,
  },
  {
    id: "afl", name: "AFL Game Ranking System", group: "Data science", year: "2025",
    summary: "CatBoost models trained on historical AFL data reach 78% match outcome accuracy, served through a REST API to a React frontend with interactive Plotly charts.",
    stack: ["Next.js", "React", "Python", "CatBoost", "MongoDB", "Pandas", "Scikit-learn", "Plotly.js"],
    href: "https://github.com/yeanle02/FYP",
    color: "#7be495", color2: "#1c6a52", x: 185, y: 70,
  },
  {
    id: "renewable-energy", name: "Visualizing Renewable Energy", group: "Data science", year: "2024",
    summary: "Interactive dashboard exploring global renewable energy trends from World Bank data, with five chart idioms linked across views.",
    stack: ["Vega-Lite", "Vega-Embed", "TopoJSON", "Python", "HTML/CSS"],
    href: "https://ekramjim.github.io/visualizing-renewable-energy/",
    preview: "/projects/renewable-energy/home.webp", page: "/projects/renewable-energy/page.webp",
    color: "#b4e05f", color2: "#2e6b3a", x: -120, y: 20,
  },
  {
    id: "f1", name: "F1 Pinnacle Of Motor Sports", group: "Data science", year: "2024",
    summary: "Interactive Tableau dashboards covering driver nationality, constructor performance and season-by-season comparisons across decades of F1 data.",
    stack: ["Tableau", "Data Visualisation", "Statistical Analysis"],
    href: "https://public.tableau.com/app/profile/ekramul.islam/viz/Visualization1F1/Dashboard1",
    preview: "/projects/f1/dashboard.webp",
    color: "#ff6b5e", color2: "#7a1f3d", x: 20, y: 135,
  },
  {
    id: "call-monitor", name: "Android Call State Monitor", group: "Mobile", year: "2024",
    summary: "Android app that listens for call state changes and shows the incoming caller ID in real time.",
    stack: ["Java", "Android SDK", "BroadcastReceiver", "TelephonyManager", "Gradle"],
    href: "https://github.com/ekramjim/MyCallReceiver",
    color: "#6fd3ff", color2: "#1f5a8a", x: -30, y: 100,
  },
  {
    id: "hearts", name: "Hearts Card Game", group: "Software", year: "2023",
    summary: "Terminal Hearts in Python with full game logic and score tracking, plus two AI opponent strategies.",
    stack: ["Python", "OOP", "AI Heuristics"],
    href: "https://github.com/ekramjim/Hearts-Game",
    color: "#ff7ab6", color2: "#8a2a5a", x: 170, y: -100,
  },
];

/**
 * The eight projects on the home page, in the order shown: the Mac apps first (the first two get the wide cards), then
 * the rest, mixing apps and sites so neighbouring cards don't look alike.
 */
const FEATURED_IDS = ["shepherd", "shepherd-companion", "usage-finder", "lynksphere", "mindsigns", "timebreak", "linkedhive", "colorectal-proteomics"];

export const FEATURED_PROJECTS: Project[] = FEATURED_IDS.map((id) => PROJECTS.find((p) => p.id === id)!);
