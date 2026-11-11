import type { Product, Shot } from "./types";

const section = (name: string, alt: string): Shot => ({ src: `/apps/mindsigns/${name}.webp`, alt, frame: "image" });

export const mindsignsProduct: Product = {
  id: "mindsigns",
  name: "MindSigns Website",
  tagline: "Mental health, in sign language.",
  intro:
    "MindSigns is a Monash University Faculty of IT initiative that makes mental health resources for deaf communities, co-designed with deaf people, sign language interpreters and clinicians in Bangladesh. Its website gathers them in one place, all free: a sign language bank, e-flyer packs and videos, introduced by a hand made of particles that signs.",
  actions: [{ label: "Visit mindsigns.online", href: "https://mindsigns.online" }],
  hero: [
    {
      src: "/projects/mindsigns/home.webp",
      alt: "The MindSigns home page: 'Digital mental health for deaf communities' beside a hand drawn in thousands of particles, raising one finger",
      frame: "browser",
      host: "mindsigns.online",
    },
  ],
  heroCaption: "The home page and its particle hand.",
  chapters: [
    {
      eyebrow: "The hand",
      title: "A hand that signs, made of particles.",
      body:
        "18,000 points make up the hand on the home page, with no 3D model behind it: the palm and each finger are described in code. On load, a scattered cloud gathers into the hand, which then moves between an open hand, pointing and the sign for \"I love you\". Each particle travels to its place in the next pose, so the hand morphs rather than cuts.",
      points: [
        "A faint shimmer keeps it alive between poses",
        "With Reduce Motion on, it skips the entrance and holds one pose",
      ],
    },
    {
      dark: true,
      eyebrow: "Sign Language Bank",
      title: "64 mental health terms in Bangla Sign Language.",
      body:
        "The project's main resource is a bank of signs for words like anxiety, panic, grief and loneliness, created with the deaf community. On the site the words drift across the page in two rows, and each one links to the bank.",
      shots: [section("signbank", "The Sign Language Bank section on navy: a heading, two drifting rows of words like Anxiety, Panic and Counselling, and a video of the sign bank")],
      caption: "Every drifting word links to the bank.",
    },
    {
      eyebrow: "E-flyers",
      title: "Flyers to print and share, one download each.",
      body:
        "25 e-flyer packs cover positivity, sleep, anxiety, depression, trauma, burnout and more, in English, Bangla and Deaf Bangla. Each pack downloads as a single zip, so a pack with ten flyers is still one tap.",
      shots: [section("flyers", "The E-Flyer Packs section: a fanned row of illustrated flyers in Bangla and English, with a View all packs link")],
      caption: "A fan of flyers from the packs.",
    },
    {
      eyebrow: "Videos and people",
      title: "Watch the signs, then meet the people behind them.",
      body:
        "Sign language videos with English subtitles explain mental health concepts, alongside interviews with deaf community members, and play inline. Team, Expert Panel and Impact pages introduce the researchers and clinicians, the awards and the media coverage, and an FAQ links to support services.",
      shots: [section("videos", "The Video Content section: three video thumbnails, What is mental health?, Mental health vs physical health and Silent Struggles, Loud Resilience")],
      caption: "Three of the ten videos.",
    },
  ],
  stats: [
    { value: "18,000", label: "particles in the hand, with no model file" },
    { value: "64", label: "signs in the mental health bank" },
    { value: "25", label: "e-flyer packs, free to download" },
  ],
  extras: [
    { title: "Welcome splash", body: "MindSigns spells itself out on arrival. Tap to skip it." },
    { title: "Editorial look", body: "Fraunces headlines and Geist text in paper, ink and vermillion." },
    { title: "Phones get hover too", body: "Rows light up as they scroll into view on touch screens." },
    { title: "Reduced motion", body: "With Reduce Motion on, the hand holds one pose and the cycling word stops." },
    { title: "One-tap support", body: "Helpline numbers and websites in the FAQ and Resources open with a tap." },
    { title: "Uptime checks", body: "Checkly tests the home page every five minutes from the US and Europe." },
  ],
  build: {
    intro:
      "The site is Next.js 16 with React 19, TypeScript and Tailwind CSS 4. The hand is React Three Fiber over Three.js, and Framer Motion runs the reveals and the cycling words. I designed and built the site, and I'm on the MindSigns team as a student researcher.",
    notes: [
      {
        title: "A hand from capsules",
        body: "Points are sampled once along capsule chains for the palm and fingers, with a seeded random generator so the server, the browser and every pose agree. Each pose re-evaluates the same points, which is what makes the morph smooth.",
      },
      {
        title: "Packs zipped on request",
        body: "A route handler gathers a pack's flyers into a zip named after it as it's downloaded, so the site keeps only the flyer images and no copies of each pack.",
      },
      {
        title: "Hover for touch screens",
        body: "On devices without hover, an IntersectionObserver marks each row as active while it's in view, and matching Tailwind variants sit beside every hover style.",
      },
    ],
  },
};
