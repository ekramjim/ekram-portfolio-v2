import type { Product } from "./types";

export const portfolioProduct: Product = {
  id: "portfolio",
  name: "Personal Portfolio Website",
  tagline: "Paper, smoke and stars.",
  intro:
    "This site. A Next.js portfolio on a paper-coloured page that opens on teal smoke, drawn live by a WebGL shader. Projects sit in a sky of ink stars, every button is Liquid Glass, and the design work has a page of its own.",
  actions: [
    { label: "Visit ekram.tech", href: "https://ekram.tech" },
    { label: "See the design work", href: "/design" },
  ],
  hero: [
    {
      src: "/apps/portfolio/home.webp",
      alt: "The top of the home page: \"Hi, I'm Ekram\" in white over dark teal smoke, with the roles under it and links to software projects and design work",
      frame: "browser",
      host: "ekram.tech",
    },
  ],
  heroCaption: "The home page, in its smoke.",
  chapters: [
    {
      eyebrow: "Home",
      title: "A hero drawn live, in smoke.",
      body:
        "The home page opens on teal smoke after Allegro Midnight, a wallpaper from my design work, turned upside down. A WebGL shader draws it every frame: dark water at the top holds the headline, and the smoke pales into mist that clears into the paper of the page below. Move the pointer and it stirs around it. It took over from a Three.js galaxy whose headline was made of stars.",
      points: [
        "The headline condenses out of the mist, then sinks into the fog as you scroll",
        "Drawn below screen resolution, and paused while it's off screen",
        "With reduced motion on, one still frame",
      ],
    },
    {
      eyebrow: "Projects",
      title: "Every project is a star.",
      body:
        "Behind the projects sits a sky of ink stars on paper, drawn on a plain 2D canvas. Each project has its own star, placed by hand. Preview a card and the camera flies to its star; open it and the camera moves in closer. The stars are seeded, so the sky is the same on every visit.",
      points: [
        "Far layers barely move, while the near layer sweeps past as the camera flies",
        "Springs ease every flight, even when you change cards halfway",
        "On a touch screen, cards preview as they cross the middle of the screen",
      ],
    },
    {
      dark: true,
      eyebrow: "Liquid Glass",
      title: "One button, made of glass.",
      body:
        "Every button on the site is the same component, after Apple's Liquid Glass. In Chrome, Edge and other Chromium browsers the glass bends what's behind it at the rim, the way a thick lens does, with a little colour at the edges. Safari and Firefox get a frosted blur. The navigation pills are glass too, and switch to light ink over the dark smoke.",
    },
    {
      eyebrow: "Design",
      title: "A page that takes on each piece's colours.",
      body:
        "The design page lays out app screens, app icons, App Store art and wallpapers as a run of spreads. Whichever piece is in the middle of the window paints the whole page in its own colours. Each one shows its process: screens to drag, crops to switch, concepts to scrub, a wipe between versions. Every picture sits in a Figma-style frame.",
    },
  ],
  stats: [
    { value: "6", label: "runtime dependencies, and no animation library" },
    { value: "1", label: "button component for every button on the site" },
    { value: "2", label: "versions, with the first still online" },
  ],
  extras: [
    { title: "Galaxy cursor", body: "With a mouse or trackpad, the cursor leaves a trail of star-dust and bursts into a small galaxy on click." },
    { title: "Contact form", body: "Messages go through a Next.js route and Nodemailer, with field checks and a hidden field that catches bots." },
    { title: "Product pages", body: "In-depth pages like this one: a data file per project, drawn by one template." },
    { title: "Stars between sections", body: "A few fixed pinprick stars carry the sky on down the page, at no drawing cost." },
    { title: "Reduced motion", body: "The smoke, the headline and the project sky all hold still when you ask for less motion." },
    { title: "Version 1", body: "The first portfolio, a Three.js galaxy with a scroll-driven camera, still runs at /archive/v1." },
  ],
  build: {
    intro:
      "Next.js 15 with the App Router, React 19 and TypeScript, styled with CSS modules and Tailwind CSS, and set in Geist. There's no animation library: the smoke is a hand-written WebGL shader, the sky a 2D canvas and the glass an SVG filter.",
    notes: [
      {
        title: "Smoke from noise",
        body: "Domain-warped fractal noise sets a ragged front between dark water and mist, coloured by a ramp sampled from the wallpaper. The shader reads the page's paper colour from CSS, so its bottom edge lands exactly on the section below.",
      },
      {
        title: "Glass that refracts",
        body: "For each glass element, a canvas draws a displacement map of its rounded shape that points inward at the rim. An SVG filter bends the backdrop by it, red, green and blue by slightly different amounts, through backdrop-filter. The map is redrawn whenever the element changes size.",
      },
      {
        title: "Version 1 on the same domain",
        body: "The old site is its own Vercel project. Middleware proxies /archive/v1 to it rather than a rewrite in the Next.js config, because the archive's own links send router headers that v2's router would otherwise answer with a 404.",
      },
    ],
  },
  links: [
    { label: "Version 1 archive", href: "https://www.ekram.tech/archive/v1" },
    { label: "Version 1 on GitHub", href: "https://github.com/ekramjim/ekram-portfolio" },
  ],
};
