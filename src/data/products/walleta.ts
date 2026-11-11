import type { Product, Shot } from "./types";

const phone = (name: string, alt: string): Shot => ({ src: `/apps/walleta/phone-${name}.webp`, alt, frame: "phone" });
const mac = (name: string, alt: string): Shot => ({ src: `/apps/walleta/mac-${name}.webp`, alt, frame: "window" });

export const walletaProduct: Product = {
  id: "walleta",
  name: "Walleta",
  icon: "/apps/walleta/icon.webp",
  tagline: "Savings funds for every goal.",
  intro:
    "Walleta helps you save for specific things and see what happens to that money. Give each goal its own fund, forecast what you'll spend from it, and always know how much is still free once those plans are covered.",
  actions: [
    { label: "See the design case study", href: "/design#walleta" },
    { label: "Support", href: "/walleta" },
  ],
  status: "Coming soon to the App Store",
  hero: [
    mac("overview", "Walleta on the Mac: the sidebar of funds beside the overview, with $10,124 available and four fund cards"),
    phone("5-activity", "Activity on iPhone: upcoming expenses, expected savings and each month's total"),
  ],
  heroCaption: "On the Mac and iPhone.",
  chapters: [
    {
      eyebrow: "Funds",
      title: "Every goal gets its own fund.",
      body:
        "A trip, a new laptop, an emergency cushion: each fund has its own colour and icon, and you add to it whenever you put money aside. The overview totals everything, with a ring that shows how much of your savings is already spoken for.",
      points: [
        "Each fund's balance, what you've spent and what's still to come",
        "Drag funds into your own order",
        "Amounts in the currency of your choice",
      ],
      shots: [phone("1-overview", "Walleta's overview: available savings, the commitment ring and the fund cards")],
      caption: "The overview, with the ring.",
    },
    {
      eyebrow: "Planning",
      title: "Plan spending before it happens.",
      body:
        "Forecast what you expect to spend from a fund, with a date and a category. Walleta shows what's still free once those plans are covered, and warns you clearly when a fund doesn't hold enough for what's planned.",
      points: [
        "Expected savings, like a paycheck, only count once you mark them received",
        "A shortfall warning per fund and across all of them",
      ],
      shots: [
        phone("2-detail", "Japan Trip's upcoming expenses: JR Pass and Food & experiences"),
        phone("4-savings", "A fund's savings, with an expected paycheck not yet received"),
      ],
      caption: "Upcoming expenses and expected savings.",
    },
    {
      eyebrow: "Tracking",
      title: "See how the real spend compares.",
      body:
        "When you spend, log the real amount, or swipe an upcoming expense to mark it spent. If you forecast it, Walleta shows whether it came in over or under the plan, per expense and for the whole fund.",
      shots: [phone("3-spent", "Spent expenses in Japan Trip: the hotel $60 over forecast, the flights $114 under")],
      caption: "The hotel came in $60 over.",
    },
    {
      dark: true,
      eyebrow: "iPad and Mac",
      title: "A sidebar for every fund on bigger screens.",
      body:
        "On iPad, the open iPhone Duo and the Mac, each fund gets its own place in the sidebar, actions move to the toolbar and content keeps a readable width. Funds sync between all your devices through your own iCloud account.",
      shots: [mac("detail", "Walleta on the Mac: the sidebar of funds beside Japan Trip's detail")],
      caption: "Walleta on the Mac.",
    },
  ],
  stats: [
    { value: "3", label: "platforms from one SwiftUI codebase" },
    { value: "0", label: "data collected. No account, ads or tracking" },
    { value: "Free", label: "on iPhone, iPad and Mac" },
  ],
  extras: [
    { title: "Month by month", body: "Activity groups everything by month with each month's net total." },
    { title: "Search", body: "Find any expense or saving by name, category or note." },
    { title: "Private", body: "No sign-up, no ads, no tracking and no server. Works offline." },
    { title: "Accessible", body: "Dark Mode, Dynamic Type and full VoiceOver labels, including the ring and bars." },
    { title: "Liquid Glass", body: "Built on iOS 26's design: glass tab bar and toolbars, with plain cards for content." },
    { title: "iPhone Duo", body: "Adapts as it folds: an open fund stays open, moving between the sidebar and the stack." },
  ],
  build: {
    intro:
      "Walleta is a single SwiftUI codebase for iPhone, iPad and Mac, with SwiftData for storage and CloudKit for sync. I designed it first in Figma as a full design system, with variables, components and prototype flows, then built it to match.",
    notes: [
      { title: "SwiftData with CloudKit", body: "Funds, expenses and deposits sync through the user's private database, with no backend to run. Without iCloud it keeps working locally." },
      { title: "Adaptive layout", body: "Size classes, not device checks, decide between the tab bar and the sidebar, so the iPad, a narrow window and a folding phone all just work." },
      { title: "Money done properly", body: "Decimal arithmetic throughout, locale-aware currency formatting, and status logic that explains every number on screen." },
    ],
  },
  links: [
    { label: "Support", href: "/walleta" },
    { label: "Privacy policy", href: "/walleta/privacy" },
    { label: "Design case study", href: "/design#walleta" },
  ],
};
