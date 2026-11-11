/** One picture on the Design page. Sizes are the file's own, so the page reserves its space before it loads. */
export interface DesignImage {
  src: string;
  alt: string;
  width: number;
  height: number;
  /** The frame's name as Figma shows it above the frame, e.g. "iOS / 08 Home". */
  frame?: string;
  /** The frame's size in Figma, shown on hover the way Figma shows a selection, e.g. "393 × 852". */
  size?: string;
  /** A tall picture shown narrower, so it doesn't run on for screens. */
  narrow?: boolean;
  /** In a board, half the width, beside the next half. */
  half?: boolean;
}

/** The colours a piece paints the whole page in while it's on screen. */
export interface DesignTheme {
  bg: string;
  ink: string;
  ink2: string;
  accent: string;
  /** A dark ground: the navbar switches to light ink. */
  dark: boolean;
}

export interface Swatch {
  name: string;
  hex: string;
}

/** A recolour in the before/after wipe, with the ground and accent the page takes on while it's chosen. */
export interface WipeVariant {
  name: string;
  src: string;
  bg: string;
  accent: string;
}

/** How a piece shows its process. */
export type Showcase =
  /** A row of phone screens to drag through, then the boards. */
  | { kind: "screens"; screens: DesignImage[]; boards: DesignImage[] }
  /** Versions of one artwork, with the crops the App Store makes drawn over it. Crops are fractions of the image. */
  | {
      kind: "crops";
      versions: { label: string; note: string; image: DesignImage }[];
      crops: { label: string; x: number; y: number; w: number; h: number }[];
    }
  /** Concepts leading to the finished icon, scrubbed with a slider; the last step has light and dark. */
  | { kind: "icons"; steps: { label: string; image: DesignImage }[]; light: DesignImage; dark: DesignImage }
  /** The original under a recolour, wiped between with a handle, then the boards. */
  | { kind: "wipe"; original: DesignImage; variants: WipeVariant[]; boards: DesignImage[] }
  /** Boards, one after another. */
  | { kind: "board"; images: DesignImage[] };

export interface DesignPiece {
  id: string;
  /** The big name across the spread, e.g. "Budly". */
  name: string;
  /** What it is, under the name, e.g. "iOS and web app". */
  subtitle: string;
  /** What kind of work and when, e.g. "Product design · 2026". */
  kicker: string;
  summary: string;
  tools: string[];
  /** View-only Figma link to the source file (for client work, a separate showcase copy, never the client's file). */
  figma: string;
  theme: DesignTheme;
  /** Its tile elsewhere on the site (the home page's Projects): a picture that fills it, or one set in its middle. */
  thumb: { src: string; fit: "cover" | "contain" };
  palette?: Swatch[];
  showcase: Showcase;
}

const img = (src: string, alt: string, width: number, height: number, frame?: string, size?: string): DesignImage => ({
  src, alt, width, height, frame, size,
});

const budlyScreens: [string, string, string][] = [
  ["01-welcome", "01 Welcome", "The welcome screen: the Budly logo of a deck chair under a striped umbrella"],
  ["05-interests", "05 Interests", "Choosing interests as chips during onboarding"],
  ["06-who-sees-what", "06 Who sees what", "A plain-words privacy screen listing who sees notes, chats, journal and check-ins"],
  ["08-home", "08 Home", "Home: handwritten sticky notes around the day's prompt, drawn as a sun"],
  ["10-note-detail", "10 Note detail", "A sticky note opened with its replies"],
  ["14-communities", "14 Communities", "Communities as coloured bubbles sized by activity"],
  ["16-community-chat", "16 Community chat", "A community's group chat"],
  ["18-journey", "18 Journey", "Journey: XP, this period's challenges and postage-stamp badges"],
  ["20-weekly-check-in", "20 Weekly check-in", "The weekly check-in, with moods as weather"],
  ["22-insights", "22 Insights", "Insights: a private chart of moods over time"],
  ["26-buds", "26 Buds", "Buds: chats with accountability partners"],
  ["31-profile", "31 Profile", "The profile screen"],
];

// Design work made in Figma (and Icon Composer). Client work links to a separate showcase copy, never the client's own file.
export const DESIGN: DesignPiece[] = [
  {
    id: "budly",
    name: "Budly",
    subtitle: "iOS and web app",
    kicker: "Product design · 2026",
    summary:
      "A social app for young people to share honestly, find their people and get a little better, one day at a time. I set the visual direction, a warm “Riviera summer” of awning stripes, azulejo tiles and handwritten sticky notes, then designed the whole prototype in Figma: 31 iPhone screens from onboarding to journaling, a 7-screen web app and an admin dashboard with privacy-safe wellbeing trends and a moderation queue.",
    tools: ["Figma", "Auto Layout", "Prototyping"],
    figma: "https://www.figma.com/design/PLDPOcq0bi9GBD332M4kqY?node-id=1-2",
    theme: { bg: "#FBF6EC", ink: "#1F2A37", ink2: "#5B6573", accent: "#C75F35", dark: false },
    thumb: { src: "/design/budly/08-home.webp", fit: "contain" },
    palette: [
      { name: "Riviera Sea", hex: "#2E6AA0" },
      { name: "Deep Aegean", hex: "#1D4770" },
      { name: "Sunset", hex: "#EE8636" },
      { name: "Terracotta", hex: "#C75F35" },
      { name: "Lemon", hex: "#F8D96E" },
      { name: "Olive", hex: "#7E8E57" },
      { name: "Cream", hex: "#FBF6EC" },
      { name: "Ink", hex: "#1F2A37" },
    ],
    showcase: {
      kind: "screens",
      screens: budlyScreens.map(([slug, frame, alt]) => img(`/design/budly/${slug}.webp`, alt, 590, 1279, `iOS / ${frame}`, "393 × 852")),
      boards: [
        img("/design/budly-direction.webp", "Budly's design direction board: the Riviera summer palette, Fraunces and DM Sans type, and its motifs", 2000, 1639, "00 Design direction", "1440 × 1180"),
        img("/design/budly-web.webp", "Budly's web app home: a sidebar, sticky notes around the day's prompt and a panel with the week's check-in and challenge", 2000, 1250, "Web / D03 Home", "1440 × 900"),
        img("/design/budly-admin.webp", "Budly's admin dashboard: user counts, daily active users, wellbeing trends, community members and items needing attention", 2000, 1250, "Admin / A01 Overview", "1440 × 900"),
      ],
    },
  },
  {
    id: "shepherd-cover",
    name: "Shepherd",
    subtitle: "App Store cover",
    kicker: "App Store · 2026",
    summary:
      "The product page header and search result artwork for Shepherd Companion: the Allegro Midnight wallpaper, a headline and three iPhones. The first version lost its icon and headline to the store's crops, so I measured where the App Store cuts the image on the product page and in search, then rebuilt the layout so everything important sits inside both. Switch versions and crops to see it.",
    tools: ["Figma", "App Store Connect"],
    figma: "https://www.figma.com/design/h87gCOp0ozpPUaKPFaGPh7?node-id=19-2",
    theme: { bg: "#021C27", ink: "#EAF3F1", ink2: "#9BB5B2", accent: "#75C682", dark: true },
    thumb: { src: "/design/shepherd-cover-v2.webp", fit: "cover" },
    palette: [
      { name: "Midnight", hex: "#022533" },
      { name: "Deep teal", hex: "#013445" },
      { name: "Lagoon", hex: "#2F807F" },
      { name: "Mist", hex: "#C0D1CF" },
      { name: "Sage", hex: "#75C682" },
    ],
    showcase: {
      kind: "crops",
      versions: [
        {
          label: "v2 · Rebuilt",
          note: "Headline centred near the top, phones centred: everything fits both crops.",
          image: img("/design/shepherd-cover-v2.webp", "Shepherd Companion's App Store cover, version 2: the headline 'Your coding agents, in your pocket.' centred over three iPhones on a teal smoke wallpaper", 2000, 1125, "Cover v2", "5244 × 2950"),
        },
        {
          label: "v1 · Clipped",
          note: "Icon and headline on the left: the store cut both off.",
          image: img("/design/shepherd-cover-v1.webp", "Shepherd Companion's first App Store cover: the icon and headline on the left, three iPhones on the right", 2000, 1125, "Cover v1", "5244 × 2950"),
        },
      ],
      // Measured from the live store (5244 × 2950 source): the product page shows x 1000–4350, y 0–2080; search x 1573–3933, y 390–1953.
      crops: [
        { label: "Product page", x: 1000 / 5244, y: 0, w: 3350 / 5244, h: 2080 / 2950 },
        { label: "Search result", x: 1573 / 5244, y: 390 / 2950, w: 2360 / 5244, h: 1563 / 2950 },
      ],
    },
  },
  {
    id: "walleta",
    name: "Walleta",
    subtitle: "Design system and app",
    kicker: "Design system · 2026",
    summary:
      "Savings funds for iPhone and Mac: plan what you'll spend from each pot of savings, log what you actually spend, and see at a glance what's still free. I designed the whole system in Figma for a native SwiftUI app in Liquid Glass: 99 variables across three collections with light and dark modes, 35 text styles, 40 components and variant sets with 48 icons, 24 iPhone screens with a clickable prototype of 43 interactions, Mac layouts, and the specs behind them: fund status logic, redlines, haptics and accessibility.",
    tools: ["Figma", "Variables", "Components", "Prototyping", "Dev Mode"],
    figma: "https://www.figma.com/design/fgLra9AKRQvKn1rNMAyJ53?node-id=29-2",
    theme: { bg: "#F2F2F7", ink: "#1C1C1E", ink2: "#6C6C70", accent: "#4A9A5A", dark: false },
    thumb: { src: "/design/walleta/phone.webp", fit: "contain" },
    palette: [
      { name: "Accent", hex: "#4A9A5A" },
      { name: "Red", hex: "#FF383C" },
      { name: "Orange", hex: "#FF8D28" },
      { name: "Yellow", hex: "#FFCC00" },
      { name: "Blue", hex: "#0088FF" },
      { name: "Indigo", hex: "#6155F5" },
      { name: "Pink", hex: "#FF2D55" },
      { name: "Graphite", hex: "#8E8E93" },
    ],
    showcase: {
      kind: "board",
      images: [
        img("/design/walleta/cover.webp", "Walleta's cover: the app's name and description beside two iPhone screens showing a savings fund and the overview", 2000, 1125, "Cover", "1920 × 1080"),
        img("/design/walleta/overview.webp", "Four iPhone screens of Walleta's overview: the funds list, first launch, reordering and deleting a fund", 2000, 1248, "1 · Overview", "393 × 852"),
        img("/design/walleta/dark.webp", "Walleta in dark mode: overview, a fund's detail, activity and forecasting an expense", 2000, 1248, "5 · Dark Mode", "393 × 852"),
        { ...img("/design/walleta/color.webp", "Walleta's colour foundations: backgrounds, labels, fills, materials, brand and fund tints in light and dark modes", 2000, 2113, "01 · Color"), half: true },
        { ...img("/design/walleta/type.webp", "Walleta's typography: the iOS and macOS text styles and the rounded figures for money", 1610, 2060, "01 · Typography"), half: true },
        img("/design/walleta/cards.webp", "The Fund Card and Hero Summary Card components with their variants", 2000, 742, "02 · Fund Card & Hero Summary Card"),
        { ...img("/design/walleta/redlines.webp", "Redlines for the fund card: padding, corner radius, spacing and type, each mapped to a token", 2000, 1116, "Spec · Fund Card Redlines"), half: true },
        { ...img("/design/walleta/mac.webp", "Walleta on the Mac: the overview and a fund's detail with a glass sidebar", 2000, 884, "04 · Mac"), half: true },
      ],
    },
  },
  {
    id: "usage-finder-icon",
    name: "Usage Finder",
    subtitle: "App icon",
    kicker: "App icon · 2026",
    summary:
      "From a colourful first draft through a gauge to five bars of usage, each bar drawn over its own track. Every part is a separate layer, so Icon Composer could give each one its own depth and glass in light and dark.",
    tools: ["Figma", "Icon Composer"],
    figma: "https://www.figma.com/design/XpFALz7fM3wzGdaZlBVQli?node-id=0-1",
    theme: { bg: "#0F0F12", ink: "#F0F2F7", ink2: "#9AA0AE", accent: "#3F83F5", dark: true },
    thumb: { src: "/design/usage-finder-icon-light.webp", fit: "contain" },
    palette: [
      { name: "Bar blue", hex: "#3267C9" },
      { name: "Bar blue, dark", hex: "#3F83F5" },
      { name: "Track", hex: "#E1E8F2" },
      { name: "Tile", hex: "#ECEFF6" },
      { name: "Dark tile", hex: "#0F0F12" },
    ],
    showcase: {
      kind: "icons",
      steps: [
        { label: "v1 · Colourful", image: img("/design/usage-finder-icon-v1.webp", "Usage Finder's first icon draft, a colourful gauge", 400, 400) },
        { label: "Bars, no tracks", image: img("/design/usage-finder-icon-bars.webp", "A bar chart icon draft: five blue bars without tracks", 400, 400) },
      ],
      light: img("/design/usage-finder-icon-light.webp", "The finished Usage Finder icon in light mode: five blue bars over pale tracks", 512, 512),
      dark: img("/design/usage-finder-icon-dark.webp", "The finished Usage Finder icon in dark mode", 512, 512),
    },
  },
  {
    id: "shepherd-icon",
    name: "Shepherd",
    subtitle: "App icon",
    kicker: "App icon · 2026",
    summary:
      "Three directions explored in Figma, from a glass lamb to a prompt on a dreamy screen, before Terminal Lens: a lens with a >_ over a screen of the Allegro wallpaper, the lamb peeking over its rim. I finished it in Icon Composer as a layered Liquid Glass icon with light and dark versions, and its lens became the app's menu bar mark, Live Activity glyph and widget icon.",
    tools: ["Figma", "Icon Composer", "Apple Human Interface Guidelines"],
    figma: "https://www.figma.com/design/wpp8GyqmEse8GXVOaG9FAp?node-id=131-2",
    theme: { bg: "#E8EFE9", ink: "#0F1E17", ink2: "#4C5E55", accent: "#3E8A4E", dark: false },
    thumb: { src: "/design/shepherd-icon-light.webp", fit: "contain" },
    palette: [
      { name: "Sage", hex: "#75C682" },
      { name: "Deep sage", hex: "#4A9A5A" },
      { name: "Screen", hex: "#101D27" },
      { name: "Lagoon", hex: "#417B81" },
      { name: "Dark tile", hex: "#1C1C1C" },
    ],
    showcase: {
      kind: "icons",
      steps: [
        { label: "A · Glass Lamb", image: img("/design/shepherd-icon-glass-lamb.webp", "Concept A, Glass Lamb: a glass lamb over the corner of a dreamy screen", 400, 400) },
        { label: "B · Prompt Screen", image: img("/design/shepherd-icon-prompt-screen.webp", "Concept B, Prompt Screen: a white >_ prompt on a dreamy screen", 400, 400) },
        { label: "C · Terminal Lens", image: img("/design/shepherd-icon-terminal-lens-concept.webp", "Concept C, Terminal Lens: a glass lens with a >_ over a screen, the lamb on its rim", 400, 400) },
      ],
      light: img("/design/shepherd-icon-light.webp", "The finished Shepherd icon, Terminal Lens, in light mode", 512, 512),
      dark: img("/design/shepherd-icon-dark.webp", "The finished Shepherd icon, Terminal Lens, in dark mode", 512, 512),
    },
  },
  {
    id: "allegro",
    name: "Allegro",
    subtitle: "Wallpaper variants",
    kicker: "Wallpapers · 2026",
    summary:
      "The Allegro smoke wallpaper gradient-mapped into calmer palettes, then saturated and Dock-tuned versions of Midnight Teal for the Mac and Lock Screen and Messages versions for iPhone, all exportable at the full 6016 × 3384. Midnight Rich went on to become the screen in Shepherd's app icon and the backdrop of its App Store cover. Drag the handle to compare, and pick a palette: the page follows it.",
    tools: ["Figma"],
    figma: "https://www.figma.com/design/icBTX2OVCKUglB8uK18I16?node-id=0-1",
    theme: { bg: "#020C17", ink: "#EDF3F4", ink2: "#9AABB0", accent: "#3DA59F", dark: true },
    thumb: { src: "/design/allegro/midnight-rich.webp", fit: "cover" },
    showcase: {
      kind: "wipe",
      original: img("/design/allegro/original.webp", "The original Allegro wallpaper: magenta and violet smoke", 1600, 900, "Allegro · Original", "6016 × 3384"),
      variants: [
        { name: "Midnight Rich", src: "/design/allegro/midnight-rich.webp", bg: "#020C17", accent: "#3DA59F" },
        { name: "Midnight Teal", src: "/design/allegro/midnight-teal.webp", bg: "#060B13", accent: "#619F9B" },
        { name: "Dusk Indigo", src: "/design/allegro/dusk-indigo.webp", bg: "#080920", accent: "#8A84C8" },
        { name: "Muted Mauve", src: "/design/allegro/muted-mauve.webp", bg: "#100A15", accent: "#B48798" },
        { name: "Deep Ocean", src: "/design/allegro/deep-ocean.webp", bg: "#030A16", accent: "#6F93C6" },
        { name: "Sage Forest", src: "/design/allegro/sage-forest.webp", bg: "#070D0B", accent: "#9FB896" },
        { name: "Soft Ember", src: "/design/allegro/soft-ember.webp", bg: "#0E0707", accent: "#C6956C" },
        { name: "Slate Graphite", src: "/design/allegro/slate-graphite.webp", bg: "#090B0C", accent: "#9FA7B0" },
        { name: "Aurora Dusk", src: "/design/allegro/aurora-dusk.webp", bg: "#090919", accent: "#7F95D1" },
      ],
      boards: [
        img("/design/allegro-saturated-dock.webp", "Saturated teal versions of the wallpaper and versions tuned so the bright smoke meets the macOS Dock", 2000, 1852, "Midnight · Saturated & Dock"),
        { ...img("/design/allegro-iphone.webp", "iPhone Lock Screen and Messages chat background versions of the Midnight wallpaper", 1100, 1700, "iPhone"), narrow: true },
      ],
    },
  },
];

/** The page's own colours, before any piece takes over: the site's paper and ink. */
export const PAPER: DesignTheme = { bg: "#F5F3EE", ink: "#0D1724", ink2: "#45576B", accent: "#5B7853", dark: false };
