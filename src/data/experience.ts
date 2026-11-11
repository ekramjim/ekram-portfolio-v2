export interface Mission {
  company: string;
  role: string;
  /** Extra line after the role, e.g. the organisation behind an initiative. */
  note?: string;
  /** When it began; the elapsed time is worked out from this. */
  start: { year: number; month: number };
  link?: { label: string; href: string };
  /** One line each. Wrap a phrase in ** to set it brighter. */
  objectives: string[];
}

/** Newest first, including upcoming roles. */
export const MISSIONS: Mission[] = [
  {
    company: "Monash University",
    role: "Summer Research Intern",
    note: "Faculty of Information Technology · Summer Vacation Research Scholarship",
    start: { year: 2026, month: 11 },
    objectives: [
      "Research project: Co-designing Policy-responsive Indigenous Knowledge Systems (PIKS) in the Global South",
    ],
  },
  {
    company: "CEALS Australia",
    role: "Full Stack Software Developer",
    note: "Part-time",
    start: { year: 2026, month: 8 },
    objectives: [
      "Rebuilt the LinkedHive iOS app natively in Swift and SwiftUI with Apple's Liquid Glass design, now live on the App Store, replacing the React Native version while migrating existing users' sessions so they stayed signed in",
      "Implemented Supabase Row-Level Security (RLS) policies to enforce per-user data access at the database layer, and enhanced the React Native Android and web apps on the shared backend",
      "Developing WishDeals, an Australian fashion price-comparison app (SwiftUI iPhone, Next.js web) with a robots.txt-respecting store-data collector and Supabase price checks sending size-aware price-drop alerts",
      "Developing an e-commerce platform from the ground up in Next.js and TypeScript, with end-to-end payment integration and a REST API for catalogue, cart and order management",
    ],
  },
  {
    company: "MindSigns",
    role: "Web Developer",
    note: "Casual",
    start: { year: 2026, month: 5 },
    link: { label: "mindsigns.online", href: "https://mindsigns.online" },
    objectives: [
      "Designed, built, and deployed the official MindSigns website end-to-end using Next.js, React, and TypeScript",
      "Engineered a custom particle-based 3D hero animation (Three.js/React Three Fiber) — a procedurally generated hand model built via forward kinematics that morphs between sign-language poses, with cursor-reactive physics",
      "Built a reusable editorial design system with scroll-driven animations and micro-interactions via Framer Motion",
      "Extended interactivity to mobile with an IntersectionObserver-based scroll layer, ensuring feature parity for touch devices",
      "Managed deployment and hosting via Vercel, handling the full release pipeline independently",
    ],
  },
  {
    company: "LynkSphere",
    role: "Co-Founder",
    start: { year: 2024, month: 12 },
    link: { label: "lynksphere.com", href: "https://lynksphere.com" },
    objectives: [
      "Co-founded a software studio delivering iOS, Android, and web apps to Australian startups and B2B clients using React Native, Next.js, SwiftUI, and Supabase",
      "**8 clients** · **12+ end-to-end products** shipped in under a year",
      "Managed full client lifecycle: scoping, architecture, deployment, and post-launch support",
      "Acquired clients via BNI Australia, StartSpace Library, and Entrepreneurs Summit 2026",
    ],
  },
];
