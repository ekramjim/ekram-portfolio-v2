import type { Product } from "./types";

export const linkedhiveProduct: Product = {
  id: "linkedhive",
  name: "LinkedHive",
  icon: "/apps/linkedhive/icon.webp",
  tagline: "Everything local, in one app.",
  intro:
    "LinkedHive brings a suburb's businesses, events, jobs, deals and neighbours into one community app for Melbourne's south-east. Residents browse, post and chat; local businesses share their products, offers and openings. It runs on iPhone, Android and the web.",
  actions: [
    { label: "Visit linkedhive.com.au", href: "https://www.linkedhive.com.au/" },
    { label: "iPhone app on the App Store", href: "https://apps.apple.com/app/id6744919122" },
    { label: "Android app on Google Play", href: "https://play.google.com/store/apps/details?id=com.ceals.linkedhive" },
  ],
  hero: [
    {
      src: "/projects/linkedhive/home.webp",
      alt: "LinkedHive on the web: an animated illustration of its features beside the sign-in form, with Enter as Guest and Sign Up for free",
      frame: "browser",
      host: "www.linkedhive.com.au",
    },
  ],
  heroCaption: "LinkedHive on the web.",
  chapters: [
    {
      eyebrow: "Local life",
      title: "What's happening nearby, in one place.",
      body:
        "Businesses lists every local business with its story, products, deals and bookings. What's On holds events, deals and a discussion board, Things To Do covers places to go, and Jobs shows openings from businesses in the area that you apply for in the app. Businesses run all of it from their own portal.",
      points: [
        "Guests can browse businesses, What's On and jobs without an account",
        "Everything is organised by zone, and the zones on offer follow switches in the admin dashboard",
        "Report Incident lets residents flag a local problem, with an optional photo",
      ],
    },
    {
      eyebrow: "People",
      title: "Meet your neighbours, then message them.",
      body:
        "Network handles connections, friend requests and finding people. Chats carry photos and files, replies, unsend, read status and a live typing indicator, with a push notification for every new message. On the discussion board you can comment anonymously.",
      points: [
        "Shared posts, events, jobs and businesses open straight in the app",
        "Facebook and Instagram links show the real post or reel",
      ],
    },
    {
      eyebrow: "Languages",
      title: "Read any post in your own language.",
      body:
        "Pick from 13 languages, from Arabic and Mandarin to Tamil and Somali. When a post on the home feed or discussion board looks like it's in another language, a See translation link appears, and the translation shows under the original. Behind the scenes, new and edited posts pass a moderation check, and discussion posts are sorted into topics by AI.",
    },
    {
      dark: true,
      eyebrow: "iPhone",
      title: "Rebuilt natively, in SwiftUI.",
      body:
        "LinkedHive first shipped on iPhone as a React Native app. I rebuilt it in Swift and SwiftUI, with Liquid Glass on iOS 26, talking to the same API and database as the web and Android apps. It replaced the old app under the same App Store listing, so people who update stay signed in.",
      points: [
        "Native tabs, search, sheets and a glass side menu",
        "Push notifications that open the right chat, profile or friend request",
        "Universal Links for posts, events, jobs, businesses and profiles",
      ],
    },
  ],
  stats: [
    { value: "13", label: "languages to translate posts into" },
    { value: "3", label: "platforms: iPhone, Android and the web" },
    { value: "1", label: "API and database behind every app" },
  ],
  extras: [
    { title: "Guest mode", body: "Browse businesses, What's On and jobs before signing up." },
    { title: "Email code", body: "Sign in with a code sent to your email instead of a password." },
    { title: "Link previews", body: "Shared links show a card with the item's title, text and picture in Messages and WhatsApp." },
    { title: "Report Incident", body: "Flag a local problem with a title, a description and a photo." },
    { title: "Admin dashboard", body: "Reports, incidents, deletion requests, scheduled pushes and live zones in one place." },
    { title: "Clean links", body: "Tracking parameters like utm_ and fbclid come off links when a post is saved." },
  ],
  build: {
    intro:
      "LinkedHive is a LynkSphere project built by a small team. Android and the web run on one React Native and Expo codebase, the business portal and API are Next.js 16 with Drizzle ORM on Supabase, and the iPhone app is native Swift. I rebuilt the iPhone app on my own and worked across the web app and API: chat, sharing and link previews, the admin dashboard and live zones.",
    notes: [
      {
        title: "Updating without signing out",
        body: "On first launch the Swift app reads the React Native app's saved Supabase session and zone from its AsyncStorage files, so the switch to native was invisible to the people using it.",
      },
      {
        title: "Previews for a one-page web app",
        body: "The web app is a single Expo page, so link-preview bots saw nothing. A Vercel function now serves that page with each post, event, job or business's Open Graph tags filled in.",
      },
      {
        title: "Chat that keeps going",
        body: "Typing runs over a Supabase Realtime broadcast channel per chat that stores nothing, shared by iPhone and web. An outbox finishes sending after you leave a chat and keeps failed messages to retry.",
      },
    ],
  },
  links: [
    { label: "linkedhive.com.au", href: "https://www.linkedhive.com.au/" },
    { label: "Business portal", href: "https://business.linkedhive.com.au" },
  ],
};
