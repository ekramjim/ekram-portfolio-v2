import type { Product, Shot } from "./types";

const section = (name: string, alt: string): Shot => ({ src: `/apps/lynksphere/${name}.webp`, alt, frame: "image" });

export const lynksphereProduct: Product = {
  id: "lynksphere",
  name: "LynkSphere Website",
  tagline: "The studio's front door.",
  intro:
    "The website for LynkSphere, a Melbourne software studio that designs and builds products for B2B AI startups. It explains what the studio does and how to pay for it, shows the products it has made, and turns visitors into calls. It's the studio's main source of new clients, contributing $30K AUD in revenue in 8 months.",
  actions: [{ label: "Visit lynksphere.com", href: "https://lynksphere.com/" }],
  hero: [
    {
      src: "/projects/lynksphere/home.webp",
      alt: "LynkSphere's home page: 'Software for AI startups' in bold orange and white type, beside a clock showing Melbourne time ringed by technology logos",
      frame: "browser",
      host: "lynksphere.com",
    },
  ],
  heroCaption: "The home page, with its Melbourne clock.",
  chapters: [
    {
      eyebrow: "What we do",
      title: "Design and engineering, under one roof.",
      body:
        "The page opens on a live clock set to Melbourne time, with the logos of the studio's tools orbiting it. Below, six services expand in place, from UI and UX design through prototyping and user research to building and consulting, with a Book a Call button right beside them.",
      shots: [section("services", "The What we do section: a short statement, two stat boxes, a Book a Call button and six numbered services from UI Design to Consulting")],
      caption: "Six services, each opening in place.",
    },
    {
      eyebrow: "Pricing",
      title: "Four ways to pay, all on the page.",
      body:
        "Monthly instalments, a subscription, milestone payments or an hourly rate: each has its own card with what's included and an Enquire button. The hourly rate is listed in full, $50 AUD an hour plus a one-time $150 codebase setup fee, so small jobs need no back and forth.",
      points: [
        "Instalments spread a scoped project over a fixed monthly schedule",
        "Milestone payments are each tied to a deliverable",
        "Hourly work can be booked for as little as an hour",
      ],
      shots: [section("pricing", "The pricing section: four cards for Monthly Instalments, Subscription, Milestone Basis and Hourly Rate at $50 AUD an hour")],
      caption: "Four pricing cards.",
    },
    {
      eyebrow: "Who it's for",
      title: "One process for scale-ups, another for startups.",
      body:
        "A pair of tabs sets out how the studio works with each. Scale-ups get a team that joins their standups and builds on their design system, in seven steps from Embedded to Delivery. Startups get ten, from Discovery and user research through prototypes to launch.",
      shots: [section("scaleups", "The Scale-ups tab: seven steps, Embedded, Rapid Layouts, Design System, High Fidelity, Demos, Development and Delivery")],
      caption: "The Scale-ups tab.",
    },
    {
      dark: true,
      eyebrow: "Speed",
      title: "Hiring takes months. Shipping takes days.",
      body:
        "A timeline sets a LynkSphere project beside an in-house hire, week by week. While the hire is still being posted, screened and interviewed, the project has moved through kickoff, design and build, and it's shipping by the time the new hire is onboarding.",
      shots: [section("timeline", "A timeline comparing 'With LynkSphere' (kickoff, design, build, test, ship) with 'In-house hire' (post, screen, interview, offer, notice, onboard)")],
      caption: "A project and a hire, side by side.",
    },
  ],
  stats: [
    { value: "A$30K", label: "in revenue in 8 months, with the site as the main channel" },
    { value: "4", label: "ways to pay, each with its own card" },
    { value: "6", label: "product pages, for the studio's apps and client work" },
  ],
  extras: [
    { title: "Product pages", body: "Shepherd, Usage Finder, SwiftTerminal, FeedDeck and more, with screenshots and downloads." },
    { title: "Light and dark", body: "Both themes, switched from a button in the header." },
    { title: "Articles", body: "Guides for startup founders, written in Markdown and listed in the sitemap." },
    { title: "Contact form", body: "Messages go straight to the team's inboxes, ready to reply to." },
    { title: "Custom cursor", body: "A cursor and trailing ring on mouse and trackpad that stay put even when Safari is zoomed." },
    { title: "Scroll progress", body: "A thin bar along the top shows how far down the page you are." },
  ],
  build: {
    intro:
      "The site is Next.js 15 with TypeScript and Tailwind CSS 4, with Framer Motion for the hero's letter-by-letter entrance and the reveals as you scroll. I built it with one other developer at LynkSphere, and it gains a page for each product the studio ships.",
    notes: [
      {
        title: "A clock that keeps Melbourne time",
        body: "The hero clock reads the time in Australia/Melbourne every frame and the logos orbit at the second hand's pace. Both sit in their own memoised components, so redrawing them never re-renders the page.",
      },
      {
        title: "Hover, on touch screens",
        body: "Phones have no hover, so an IntersectionObserver gives cards and rows their hover state as they scroll into the middle of the screen. Mouse and trackpad users get real hover as before.",
      },
      {
        title: "Metadata built once",
        body: "One helper gives every page a canonical URL with matching Open Graph and Twitter tags, since Next.js replaces rather than merges them. JSON-LD describes the studio, and the sitemap adds each article.",
      },
    ],
  },
};
